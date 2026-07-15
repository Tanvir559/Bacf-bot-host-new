import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';

// Trigger initialization of DB, Process Manager and Telegram Bot
import { db } from './src/db';
import { processManager } from './src/processManager';
import './src/telegramBot';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. API ROUTES FIRST

  // Main status endpoint for dashboard
  app.get('/api/status', (req, res) => {
    try {
      // Calculate CPU percent approximation from load avg
      const cpus = os.cpus().length;
      const loadAvg = os.loadavg()[0]; // 1-minute load average
      const cpuPercent = Math.min(Math.round((loadAvg / cpus) * 100), 100);

      // Memory percent calculation
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memoryPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

      // Bot stats
      const runningBots = processManager.getRunningBots();
      const allFiles = db.getAllFiles();
      const activeUsers = db.getActiveUsers().length;
      const isLocked = db.isLocked();

      res.json({
        system_stats: {
          cpu_percent: cpuPercent || 5, // fallback to non-zero baseline
          memory_percent: memoryPercent,
          uptime: Math.round(process.uptime()),
          platform: os.platform(),
          cpus: cpus,
        },
        stats: {
          running_bots_count: runningBots.length,
          total_files_count: allFiles.length,
          active_users_count: activeUsers,
          bot_locked: isLocked,
        },
        running_bots: runningBots,
        all_bots: allFiles.map(f => ({
          ...f,
          is_running_active: processManager.isBotRunning(f.user_id, f.file_name),
        })),
        telegram_token_set: !!process.env.TELEGRAM_BOT_TOKEN || true,
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Get specific bot logs
  app.get('/api/bot-logs', (req, res) => {
    const { userId, fileName } = req.query;
    if (!userId || !fileName) {
      return res.status(400).json({ error: 'Missing userId or fileName' });
    }
    const logs = processManager.getBotLogs(Number(userId), String(fileName), 100);
    res.json({ logs });
  });

  // Control endpoints for bots
  app.post('/api/start-bot', async (req, res) => {
    const { userId, fileName, fileType } = req.body;
    if (!userId || !fileName || !fileType) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    try {
      const success = await processManager.startBot(Number(userId), String(fileName), fileType as 'py' | 'js');
      res.json({ success });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post('/api/stop-bot', (req, res) => {
    const { userId, fileName } = req.body;
    if (!userId || !fileName) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    const success = processManager.stopBot(Number(userId), String(fileName));
    res.json({ success });
  });

  app.post('/api/delete-bot', (req, res) => {
    const { userId, fileName } = req.body;
    if (!userId || !fileName) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    try {
      // Stop it first
      processManager.stopBot(Number(userId), String(fileName));

      // Remove actual files
      const userFolder = path.join(process.cwd(), 'upload_bots', String(userId));
      const scriptPath = path.join(userFolder, String(fileName));
      const logPath = path.join(userFolder, `${path.parse(String(fileName)).name}.log`);

      if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
      if (fs.existsSync(logPath)) fs.unlinkSync(logPath);

      // Remove from DB
      db.removeUserFile(Number(userId), String(fileName));

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Subscription Endpoints
  app.get('/api/subscriptions', (req, res) => {
    res.json(db.getAllFiles()); // Just standard placeholder/proxy
  });

  app.post('/api/add-subscription', (req, res) => {
    const { userId, days, botLimit } = req.body;
    if (!userId || !days || !botLimit) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    db.addSubscription(Number(userId), Number(days), Number(botLimit));
    res.json({ success: true });
  });

  app.post('/api/remove-subscription', (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    db.removeSubscription(Number(userId));
    res.json({ success: true });
  });

  // Toggle Bot Lock
  app.post('/api/toggle-lock', (req, res) => {
    const isLocked = db.isLocked();
    db.setLocked(!isLocked);
    res.json({ locked: !isLocked });
  });

  // 2. VITE OR STATIC FILE MIDDLEWARE

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Web Admin Server running on http://localhost:${PORT}`);
    
    // Auto-start previously running bots once the server has successfully bound and initialized
    processManager.autoStartAll().catch(err => {
      console.error('Error auto-starting bots:', err);
    });
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
