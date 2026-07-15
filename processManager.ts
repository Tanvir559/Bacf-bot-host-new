import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { db, UserFile } from './db';

const BOTS_DIR = path.join(process.cwd(), 'upload_bots');

// Ensure base upload directory exists
if (!fs.existsSync(BOTS_DIR)) {
  fs.mkdirSync(BOTS_DIR, { recursive: true });
}

export function getUserFolder(userId: number): string {
  const folder = path.join(BOTS_DIR, userId.toString());
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  return folder;
}

interface RunningProcessInfo {
  process: ChildProcess;
  file_name: string;
  user_id: number;
  start_time: Date;
  restart_count: number;
  last_restart: number;
}

class ProcessManager {
  private activeProcesses: Map<string, RunningProcessInfo> = new Map();

  private getProcessKey(userId: number, fileName: string): string {
    return `${userId}_${fileName}`;
  }

  /**
   * Automatically start all sub-bots marked as running in the database.
   * Call this on system startup.
   */
  public async autoStartAll() {
    console.log('🔄 Auto-starting previously active bots for lifetime hosting...');
    const allFiles = db.getAllFiles();
    const activeFiles = allFiles.filter(f => f.is_running);

    for (const file of activeFiles) {
      try {
        await this.startBot(file.user_id, file.file_name, file.file_type, true);
        console.log(`✅ Auto-started ${file.file_name} for user ${file.user_id}`);
      } catch (error) {
        console.error(`❌ Failed to auto-start ${file.file_name} for user ${file.user_id}:`, error);
        // Set running state to false on failure to avoid continuous failing restarts
        db.setFileRunningState(file.user_id, file.file_name, false);
      }
    }
  }

  /**
   * Automatically detect a missing module/package from a failing run and install it,
   * mirroring the auto-requirement system: retries up to a fixed number of attempts.
   */
  private async ensureDependencies(
    command: string,
    args: string[],
    userFolder: string,
    fileType: 'py' | 'js',
    attempt = 1
  ): Promise<void> {
    const maxAttempts = 2;
    if (attempt > maxAttempts) return;

    const stderrData: string = await new Promise((resolve) => {
      let settled = false;
      let stderr = '';
      let checkProc: ChildProcess;
      try {
        checkProc = spawn(command, args, { cwd: userFolder, env: { ...process.env } });
      } catch {
        resolve('');
        return;
      }

      const finish = (data: string) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try { checkProc.kill(); } catch {}
        resolve(data);
      };

      const timer = setTimeout(() => finish(''), 5000);

      checkProc.stderr?.on('data', (d) => { stderr += d.toString(); });
      checkProc.on('close', (code) => {
        finish(code !== 0 ? stderr : '');
      });
      checkProc.on('error', () => finish(''));
    });

    if (!stderrData) return;

    if (fileType === 'py') {
      const match = stderrData.match(/ModuleNotFoundError: No module named '([^'"]+)'/);
      if (match) {
        const moduleName = match[1].trim();
        console.log(`📦 Auto-requirement: missing python module "${moduleName}", installing...`);
        const installed = await this.installPip(command, moduleName);
        if (installed) {
          await this.ensureDependencies(command, args, userFolder, fileType, attempt + 1);
        }
      }
    } else {
      const match = stderrData.match(/Cannot find module '([^'"]+)'/);
      if (match) {
        const moduleName = match[1].trim();
        if (!moduleName.startsWith('.') && !moduleName.startsWith('/')) {
          console.log(`📦 Auto-requirement: missing node package "${moduleName}", installing...`);
          const installed = await this.installNpm(moduleName, userFolder);
          if (installed) {
            await this.ensureDependencies(command, args, userFolder, fileType, attempt + 1);
          }
        }
      }
    }
  }

  private installPip(pythonCommand: string, moduleName: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const proc = spawn(pythonCommand, ['-m', 'pip', 'install', moduleName], {
          env: { ...process.env },
          shell: process.platform === 'win32',
        });
        let out = '';
        proc.stdout?.on('data', (d) => { out += d.toString(); });
        proc.stderr?.on('data', (d) => { out += d.toString(); });
        proc.on('close', (code) => {
          if (code === 0) {
            console.log(`✅ Auto-requirement: installed python module "${moduleName}".`);
            resolve(true);
          } else {
            console.error(`❌ Auto-requirement: failed to install python module "${moduleName}".\n${out.slice(0, 2000)}`);
            resolve(false);
          }
        });
        proc.on('error', (err) => {
          console.error(`❌ Auto-requirement: error installing python module "${moduleName}": ${err.message}`);
          resolve(false);
        });
      } catch (err) {
        console.error(`❌ Auto-requirement: error installing python module "${moduleName}": ${(err as Error).message}`);
        resolve(false);
      }
    });
  }

  private installNpm(moduleName: string, userFolder: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const proc = spawn('npm', ['install', moduleName], {
          cwd: userFolder,
          env: { ...process.env },
          shell: process.platform === 'win32',
        });
        let out = '';
        proc.stdout?.on('data', (d) => { out += d.toString(); });
        proc.stderr?.on('data', (d) => { out += d.toString(); });
        proc.on('close', (code) => {
          if (code === 0) {
            console.log(`✅ Auto-requirement: installed node package "${moduleName}" locally.`);
            resolve(true);
          } else {
            console.error(`❌ Auto-requirement: failed to install node package "${moduleName}".\n${out.slice(0, 2000)}`);
            resolve(false);
          }
        });
        proc.on('error', (err) => {
          console.error(`❌ Auto-requirement: error installing node package "${moduleName}": ${err.message}`);
          resolve(false);
        });
      } catch (err) {
        console.error(`❌ Auto-requirement: error installing node package "${moduleName}": ${(err as Error).message}`);
        resolve(false);
      }
    });
  }

  /**
   * Start a sub-bot
   */
  public async startBot(userId: number, fileName: string, fileType: 'py' | 'js', isAutoStart = false): Promise<boolean> {
    const key = this.getProcessKey(userId, fileName);
    
    // If already running, do nothing or restart
    if (this.activeProcesses.has(key)) {
      console.log(`Bot ${fileName} for user ${userId} is already running.`);
      return true;
    }

    const userFolder = getUserFolder(userId);
    const scriptPath = path.join(userFolder, fileName);

    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script file ${fileName} does not exist at ${scriptPath}`);
    }

    // Determine execution command
    let command = 'node';
    let args: string[] = [];

    if (fileType === 'py') {
      command = process.platform === 'win32' ? 'python' : 'python3';
      args = [scriptPath];
    } else {
      command = 'node';
      args = [scriptPath];
    }

    // Auto-requirement system: detect missing python/node modules from a quick
    // trial run and install them automatically before starting the bot for real.
    try {
      await this.ensureDependencies(command, args, userFolder, fileType);
    } catch (e) {
      console.error(`Auto-requirement check failed for ${fileName}:`, e);
    }

    const logFilePath = path.join(userFolder, `${path.parse(fileName).name}.log`);
    // Open log stream (append mode)
    const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

    console.log(`🚀 Spawning process: ${command} ${args.join(' ')}`);

    try {
      const child = spawn(command, args, {
        cwd: userFolder,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Pipe stdout and stderr to the log file
      child.stdout?.pipe(logStream);
      child.stderr?.pipe(logStream);

      // Save to active processes map
      const procInfo: RunningProcessInfo = {
        process: child,
        file_name: fileName,
        user_id: userId,
        start_time: new Date(),
        restart_count: 0,
        last_restart: Date.now(),
      };
      
      this.activeProcesses.set(key, procInfo);

      // Set running state in DB
      db.setFileRunningState(userId, fileName, true);

      // Handle exit event
      child.on('close', (code) => {
        logStream.end();
        console.log(`⏹️ Sub-bot ${fileName} (user: ${userId}) exited with code ${code}`);
        
        const currentProc = this.activeProcesses.get(key);
        // Only remove if it's the exact same process
        if (currentProc && currentProc.process.pid === child.pid) {
          this.activeProcesses.delete(key);

          // Get latest DB entry to see if it should still be running
          const latestFiles = db.getUserFiles(userId);
          const dbFile = latestFiles.find(f => f.file_name === fileName);

          if (dbFile && dbFile.is_running) {
            // Unexpected exit! Let's auto-restart to fulfill the LIFETIME hosting requirement
            console.log(`⚠️ Unexpected exit for bot ${fileName}. Restarting in 3 seconds to keep it alive...`);
            
            // Crash-loop protection: if it restarts too quickly (e.g. 5 times in 1 minute), stop to prevent resource drain
            const now = Date.now();
            const lastRestart = currentProc.last_restart;
            let restartCount = currentProc.restart_count;

            if (now - lastRestart < 60000) {
              restartCount += 1;
            } else {
              restartCount = 0; // reset
            }

            if (restartCount >= 5) {
              console.error(`🚨 Bot ${fileName} crashed 5 times in under a minute. Disabling auto-restart to prevent resource hogging.`);
              db.setFileRunningState(userId, fileName, false);
            } else {
              setTimeout(() => {
                this.startBot(userId, fileName, fileType).catch(err => {
                  console.error(`Failed to restart bot ${fileName} for user ${userId}:`, err);
                });
              }, 3000);
            }
          }
        }
      });

      return true;
    } catch (error) {
      logStream.end();
      throw error;
    }
  }

  /**
   * Stop a running sub-bot
   */
  public stopBot(userId: number, fileName: string): boolean {
    const key = this.getProcessKey(userId, fileName);
    const procInfo = this.activeProcesses.get(key);

    // Update DB first to prevent auto-restart triggering
    db.setFileRunningState(userId, fileName, false);

    if (procInfo) {
      console.log(`Stopping bot ${fileName} for user ${userId}...`);
      try {
        // Kill process and any child processes (SIGKILL / SIGTERM)
        procInfo.process.kill('SIGTERM');
        // Force kill if it stays alive
        setTimeout(() => {
          try {
            if (this.activeProcesses.has(key)) {
              procInfo.process.kill('SIGKILL');
            }
          } catch (e) {}
        }, 2000);
        
        this.activeProcesses.delete(key);
        return true;
      } catch (error) {
        console.error(`Error killing process for ${fileName}:`, error);
        return false;
      }
    }
    return false;
  }

  /**
   * Check if a bot is actively running
   */
  public isBotRunning(userId: number, fileName: string): boolean {
    const key = this.getProcessKey(userId, fileName);
    const procInfo = this.activeProcesses.get(key);
    if (!procInfo) return false;
    
    // Check if the actual child process is not null and has a PID and has not exited
    return procInfo.process.pid !== undefined && procInfo.process.killed === false;
  }

  /**
   * Get all running bots (both count and list)
   */
  public getRunningBots() {
    const list: { userId: number; fileName: string; startTime: Date; pid: number | undefined }[] = [];
    this.activeProcesses.forEach((info, key) => {
      list.push({
        userId: info.user_id,
        fileName: info.file_name,
        startTime: info.start_time,
        pid: info.process.pid,
      });
    });
    return list;
  }

  /**
   * Get logs for a specific bot
   */
  public getBotLogs(userId: number, fileName: string, maxLines = 100): string {
    const userFolder = getUserFolder(userId);
    const logFilePath = path.join(userFolder, `${path.parse(fileName).name}.log`);

    if (!fs.existsSync(logFilePath)) {
      return 'No logs available for this bot.';
    }

    try {
      const logs = fs.readFileSync(logFilePath, 'utf-8');
      const lines = logs.split('\n');
      return lines.slice(-maxLines).join('\n');
    } catch (error) {
      return `Error reading log file: ${(error as Error).message}`;
    }
  }

  /**
   * Clear logs for a bot
   */
  public clearBotLogs(userId: number, fileName: string) {
    const userFolder = getUserFolder(userId);
    const logFilePath = path.join(userFolder, `${path.parse(fileName).name}.log`);
    if (fs.existsSync(logFilePath)) {
      try {
        fs.writeFileSync(logFilePath, '', 'utf-8');
      } catch (e) {}
    }
  }
}

export const processManager = new ProcessManager();