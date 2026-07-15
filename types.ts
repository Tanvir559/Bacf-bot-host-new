export interface SystemStats {
  cpu_percent: number;
  memory_percent: number;
  uptime: number;
  platform: string;
  cpus: number;
}

export interface SummaryStats {
  running_bots_count: number;
  total_files_count: number;
  active_users_count: number;
  bot_locked: boolean;
}

export interface RunningBotInfo {
  userId: number;
  fileName: string;
  startTime: string;
  pid?: number;
}

export interface BotMetadata {
  user_id: number;
  file_name: string;
  file_type: 'py' | 'js';
  is_running: boolean;
  is_running_active: boolean;
}

export interface ServerStatusResponse {
  system_stats: SystemStats;
  stats: SummaryStats;
  running_bots: RunningBotInfo[];
  all_bots: BotMetadata[];
  telegram_token_set: boolean;
}
