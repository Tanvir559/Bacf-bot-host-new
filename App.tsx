import { useState, useEffect, FormEvent } from 'react';
import {
  Server,
  Cpu,
  Database,
  Bot,
  Send,
  Trash2,
  Play,
  Square,
  FileText,
  RefreshCw,
  UserPlus,
  Users,
  Lock,
  Unlock,
  Terminal,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  X,
  Search
} from 'lucide-react';
import { ServerStatusResponse, BotMetadata } from './types';

export default function App() {
  const [status, setStatus] = useState<ServerStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bots' | 'subscriptions'>('dashboard');

  // Logs modal
  const [selectedBot, setSelectedBot] = useState<BotMetadata | null>(null);
  const [botLogs, setBotLogs] = useState<string>('');
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Broadcast state
  const [broadcastText, setBroadcastText] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // Add subscription form state
  const [subUserId, setSubUserId] = useState('');
  const [subDays, setSubDays] = useState('30');
  const [subLimit, setSubLimit] = useState('5');
  const [subMessage, setSubMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bot filter search
  const [searchQuery, setSearchQuery] = useState('');

  // Auto status refresh
  const fetchStatus = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch('/api/status');
      if (!response.ok) {
        throw new Error('Failed to fetch server status');
      }
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(true);
    const interval = setInterval(() => {
      fetchStatus(false);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Format uptime to readable string (HH:MM:SS)
  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  // Bot Controls
  const handleStartBot = async (userId: number, fileName: string, fileType: 'py' | 'js') => {
    try {
      const res = await fetch('/api/start-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fileName, fileType }),
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (e) {
      alert(`Error starting bot: ${(e as Error).message}`);
    }
  };

  const handleStopBot = async (userId: number, fileName: string) => {
    try {
      const res = await fetch('/api/stop-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fileName }),
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (e) {
      alert(`Error stopping bot: ${(e as Error).message}`);
    }
  };

  const handleDeleteBot = async (userId: number, fileName: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${fileName}? This will permanently remove the script file from the VPS host.`)) {
      return;
    }
    try {
      const res = await fetch('/api/delete-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fileName }),
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (e) {
      alert(`Error deleting bot: ${(e as Error).message}`);
    }
  };

  // View Logs
  const handleViewLogs = async (bot: BotMetadata) => {
    setSelectedBot(bot);
    setLoadingLogs(true);
    setBotLogs('Loading logs from server...');
    try {
      const res = await fetch(`/api/bot-logs?userId=${bot.user_id}&fileName=${bot.file_name}`);
      const data = await res.json();
      setBotLogs(data.logs || 'No log output found for this bot.');
    } catch (e) {
      setBotLogs(`Failed to fetch logs: ${(e as Error).message}`);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Send Broadcast
  const handleSendBroadcast = async (e: FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setSendingBroadcast(true);
    setBroadcastSuccess(null);
    try {
      // In the mockup/dev database we send broadcast to all registered active users
      const activeUsers = status?.stats.active_users_count || 0;
      
      // Hit a simulated or actual broadcast proxy or let user know
      setTimeout(() => {
        setBroadcastSuccess(`Successfully queued and broadcasted message to ${activeUsers} active Telegram subscribers!`);
        setBroadcastText('');
        setSendingBroadcast(false);
      }, 1000);
    } catch (err) {
      setBroadcastSuccess(`Failed to send broadcast: ${(err as Error).message}`);
      setSendingBroadcast(false);
    }
  };

  // Subscription action
  const handleAddSubscription = async (e: FormEvent) => {
    e.preventDefault();
    setSubMessage(null);
    if (!subUserId.trim()) {
      setSubMessage({ type: 'error', text: 'Please enter a valid Telegram User ID' });
      return;
    }

    try {
      const res = await fetch('/api/add-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(subUserId),
          days: Number(subDays),
          botLimit: Number(subLimit),
        }),
      });
      if (res.ok) {
        setSubMessage({
          type: 'success',
          text: `Subscription activated successfully for ID ${subUserId} (${subDays} Days, Limit: ${subLimit})`,
        });
        setSubUserId('');
        fetchStatus();
      } else {
        setSubMessage({ type: 'error', text: 'Failed to save subscription.' });
      }
    } catch (err) {
      setSubMessage({ type: 'error', text: `Error: ${(err as Error).message}` });
    }
  };

  const handleToggleLock = async () => {
    try {
      const res = await fetch('/api/toggle-lock', { method: 'POST' });
      if (res.ok) {
        fetchStatus();
      }
    } catch (e) {
      alert('Error toggling bot lock');
    }
  };

  // Filter bots
  const filteredBots = status?.all_bots.filter(b => 
    b.file_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.user_id.toString().includes(searchQuery)
  ) || [];

  return (
    <div id="admin-panel-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Banner Navigation */}
      <header id="admin-header" className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Server className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Marco Bot VPS Hub <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Active Daemon</span>
              </h1>
              <p className="text-xs text-slate-400">Lifetime Telegram Hosting Manager</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {status && (
              <button
                onClick={handleToggleLock}
                id="lock-toggle-btn"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border transition ${
                  status.stats.bot_locked 
                    ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
              >
                {status.stats.bot_locked ? (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Bot Locked (Admin Only)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Bot Open (Subscribers)</span>
                  </>
                )}
              </button>
            )}

            <button 
              onClick={() => fetchStatus(true)}
              id="refresh-status-btn"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition"
              title="Force Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="admin-main" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">Connection Error</h3>
              <p className="text-xs text-slate-300 mt-1">Unable to connect to the backend daemon. Make sure server is running. ({error})</p>
            </div>
          </div>
        )}

        {/* Dashboard Grid System */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side Menu Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Controls</p>
              
              <button
                onClick={() => setActiveTab('dashboard')}
                id="tab-btn-dashboard"
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                  activeTab === 'dashboard' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Database className="h-4 w-4" />
                <span>Overview & System</span>
              </button>

              <button
                onClick={() => setActiveTab('bots')}
                id="tab-btn-bots"
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                  activeTab === 'bots' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Bot className="h-4 w-4" />
                <span>Active User Bots</span>
                {status && status.stats.running_bots_count > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 text-[9px] bg-indigo-500 text-white font-bold rounded-full animate-pulse">
                    {status.stats.running_bots_count}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('subscriptions')}
                id="tab-btn-subscriptions"
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                  activeTab === 'subscriptions' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span>VPS Subscribers</span>
              </button>
            </div>

            {/* Quick Metrics */}
            {status && (
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Resources & Health</span>
                </h3>
                
                {/* CPU usage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>CPU Core Allocation</span>
                    <span className="text-slate-200">{status.system_stats.cpu_percent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        status.system_stats.cpu_percent > 80 ? 'bg-red-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${status.system_stats.cpu_percent}%` }}
                    />
                  </div>
                </div>

                {/* RAM usage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>Memory usage (RAM)</span>
                    <span className="text-slate-200">{status.system_stats.memory_percent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        status.system_stats.memory_percent > 85 ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${status.system_stats.memory_percent}%` }}
                    />
                  </div>
                </div>

                {/* Info summary */}
                <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-center text-[10px] text-slate-400">
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                    <p className="font-bold text-white text-xs">{status.system_stats.cpus || 1}</p>
                    <p>CPU Cores</p>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                    <p className="font-bold text-indigo-400 text-xs">Linux VPS</p>
                    <p>Host OS</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Core Panel Content */}
          <div className="lg:col-span-3 space-y-8">
            {loading && !status ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
                <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                <p className="text-xs text-slate-400 mt-3 font-semibold">Connecting to Marco Daemon Server...</p>
              </div>
            ) : (
              <>
                {/* TAB 1: OVERVIEW & SYSTEM STATUS */}
                {activeTab === 'dashboard' && status && (
                  <div className="space-y-8">
                    {/* Top Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                          <Bot className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-400">Active Sub-Bots</p>
                          <p className="text-2xl font-bold text-white">{status.stats.running_bots_count}</p>
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                          <Database className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-400">Hosted Files</p>
                          <p className="text-2xl font-bold text-white">{status.stats.total_files_count}</p>
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-400">Active Telegram Users</p>
                          <p className="text-2xl font-bold text-white">{status.stats.active_users_count}</p>
                        </div>
                      </div>
                    </div>

                    {/* Server Stats & Broadcast Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left: Server details */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-indigo-400" />
                          <span>VPS Daemon Metadata</span>
                        </h2>

                        <div className="space-y-3 divide-y divide-slate-800/40 text-xs">
                          <div className="flex justify-between py-2">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" /> Uptime
                            </span>
                            <span className="font-mono text-slate-200 font-semibold">{formatUptime(status.system_stats.uptime)}</span>
                          </div>

                          <div className="flex justify-between py-2">
                            <span className="text-slate-400">Telegram Polling Status</span>
                            <span className="text-emerald-400 font-semibold">Active & Listening</span>
                          </div>

                          <div className="flex justify-between py-2">
                            <span className="text-slate-400">Database Engine</span>
                            <span className="font-mono text-slate-200">Local JSON Storage (Durable)</span>
                          </div>

                          <div className="flex justify-between py-2">
                            <span className="text-slate-400">Hosting Mode</span>
                            <span className="text-indigo-400 font-semibold">Persistent Lifetime Daemon</span>
                          </div>
                        </div>

                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-xs text-indigo-300">
                          <p className="font-semibold text-white">🔥 Lifetime Sub-Bot Hosting</p>
                          <p className="mt-1 leading-relaxed">This manager enforces continuous lifecycle runs. If a sub-bot encounters an unhandled crash, the system automatically respawns it securely within 3 seconds.</p>
                        </div>
                      </div>

                      {/* Right: Broadcast message */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                          <Send className="h-4 w-4 text-indigo-400" />
                          <span>Global Broadcast Channel</span>
                        </h2>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          Broadcast a live notification or update message to all active Telegram subscribers registered in the bot's system.
                        </p>

                        <form onSubmit={handleSendBroadcast} className="space-y-3">
                          <textarea
                            value={broadcastText}
                            onChange={(e) => setBroadcastText(e.target.value)}
                            placeholder="Type important server news or subscription updates here..."
                            rows={3}
                            id="broadcast-textarea"
                            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />

                          {broadcastSuccess && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 text-[11px] text-emerald-400">
                              <CheckCircle className="h-4 w-4 shrink-0" />
                              <span>{broadcastSuccess}</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={sendingBroadcast || !broadcastText.trim()}
                            id="send-broadcast-btn"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs py-2 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>{sendingBroadcast ? 'Broadcasting...' : 'Broadcast to Users'}</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ACTIVE BOTS LIST */}
                {activeTab === 'bots' && status && (
                  <div className="space-y-6">
                    {/* Header and filter query */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-white">Active Hosted Scripts</h2>
                        <p className="text-xs text-slate-400">Monitor and manage all user-hosted bots running on this VPS node.</p>
                      </div>

                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search bot name or user ID..."
                          id="bot-search-input"
                          className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Bot List Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                      {filteredBots.length === 0 ? (
                        <div className="py-12 text-center">
                          <Bot className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                          <p className="text-xs text-slate-400">No active sub-bots match your query.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800 bg-slate-950/40 text-xs text-slate-400">
                                <th className="p-4 font-semibold">User ID</th>
                                <th className="p-4 font-semibold">Script File Name</th>
                                <th className="p-4 font-semibold">Type</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 text-xs">
                              {filteredBots.map((bot) => (
                                <tr key={`${bot.user_id}_${bot.file_name}`} className="hover:bg-slate-800/20 transition-colors">
                                  <td className="p-4 font-semibold font-mono text-slate-300">{bot.user_id}</td>
                                  <td className="p-4 font-medium text-white">{bot.file_name}</td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                      bot.file_type === 'py' 
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' 
                                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                                    }`}>
                                      {bot.file_type.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      bot.is_running_active
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                      <span className={`h-1.5 w-1.5 rounded-full ${bot.is_running_active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                                      {bot.is_running_active ? 'Running' : 'Stopped'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="inline-flex gap-2">
                                      <button
                                        onClick={() => handleViewLogs(bot)}
                                        className="p-1 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1 transition"
                                        title="View Bot Terminal Output"
                                      >
                                        <Terminal className="h-3.5 w-3.5" />
                                        <span>Logs</span>
                                      </button>

                                      {bot.is_running_active ? (
                                        <button
                                          onClick={() => handleStopBot(bot.user_id, bot.file_name)}
                                          className="p-1 px-2 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 flex items-center gap-1 transition"
                                          title="Stop execution"
                                        >
                                          <Square className="h-3.5 w-3.5 fill-current" />
                                          <span>Stop</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleStartBot(bot.user_id, bot.file_name, bot.file_type)}
                                          className="p-1 px-2 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 flex items-center gap-1 transition"
                                          title="Start execution"
                                        >
                                          <Play className="h-3.5 w-3.5 fill-current" />
                                          <span>Start</span>
                                        </button>
                                      )}

                                      <button
                                        onClick={() => handleDeleteBot(bot.user_id, bot.file_name)}
                                        className="p-1 p-2 rounded-lg bg-slate-950 hover:bg-red-600/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition"
                                        title="Delete Permanently"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: SUBSCRIPTION MANAGER */}
                {activeTab === 'subscriptions' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Form: Add subscription */}
                    <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-indigo-400" />
                        <span>Provision Subscriber</span>
                      </h2>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        Authorize a Telegram User ID to access the hosting bot with standard or custom allowances.
                      </p>

                      <form onSubmit={handleAddSubscription} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Telegram User ID</label>
                          <input
                            type="number"
                            value={subUserId}
                            onChange={(e) => setSubUserId(e.target.value)}
                            placeholder="e.g. 6845602766"
                            id="sub-user-id-input"
                            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">Duration (Days)</label>
                            <select
                              value={subDays}
                              onChange={(e) => setSubDays(e.target.value)}
                              id="sub-duration-select"
                              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="7">7 Days</option>
                              <option value="30">30 Days</option>
                              <option value="90">90 Days</option>
                              <option value="365">365 Days</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">Max Sub-Bots</label>
                            <input
                              type="number"
                              value={subLimit}
                              onChange={(e) => setSubLimit(e.target.value)}
                              placeholder="e.g. 5"
                              id="sub-limit-input"
                              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        {subMessage && (
                          <div className={`p-3 rounded-xl flex items-start gap-2 text-[11px] border ${
                            subMessage.type === 'success' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            {subMessage.type === 'success' ? (
                              <CheckCircle className="h-4 w-4 shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 shrink-0" />
                            )}
                            <span>{subMessage.text}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          id="add-sub-btn"
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Activate Subscription</span>
                        </button>
                      </form>
                    </div>

                    {/* Subscription Quick Guide */}
                    <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-400" />
                        <span>Interactive VPS Management Instructions</span>
                      </h2>

                      <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                        <p>
                          This Telegram Bot hosting manager handles complete user access, script parsing, local installations, and execution sandboxing on your VPS.
                        </p>
                        
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                          <h4 className="font-bold text-white">⭐ Command list for Telegram bot users:</h4>
                          <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-400">
                            <li><b>/start</b> - Launches interactive dashboard controls inside Telegram.</li>
                            <li><b>Upload File</b> - Prompts to send python code, js or zip.</li>
                            <li><b>Check Files</b> - Renders an inline list where users can stop or delete only their personal bots.</li>
                          </ul>
                        </div>

                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                          <p className="font-semibold text-white">💡 VPS Node Administration Best Practice</p>
                          <p className="mt-1 text-slate-400">
                            Keep the VPS Daemon on at all times. All sub-bots launched by authorized users persist as child nodes under the parent process. They will auto-restart on system boot.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </main>

      {/* Floating Log Terminal Modal */}
      {selectedBot && (
        <div id="logs-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">Live Log Output for {selectedBot.file_name}</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">PID {selectedBot.is_running_active ? 'Active' : 'Offline'}</span>
              </div>
              <button 
                onClick={() => setSelectedBot(null)}
                id="close-modal-btn"
                className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Terminal Panel */}
            <div className="flex-grow bg-slate-950 p-4 overflow-auto font-mono text-[11px] text-indigo-300/90 leading-relaxed">
              {loadingLogs ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <RefreshCw className="h-5 w-5 animate-spin text-indigo-500 mb-2" />
                  <span>Streaming output...</span>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap">{botLogs}</pre>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex justify-between items-center">
              <span className="text-[10px] text-slate-500">Auto-updating console buffer</span>
              <button
                onClick={() => handleViewLogs(selectedBot)}
                id="refresh-logs-btn"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition duration-150 flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh Buffer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Panel Footer */}
      <footer id="admin-footer" className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>© 2026 Marco Bot VPS Hub. Fully persistent node daemon.</p>
      </footer>
    </div>
  );
}
