import fs from 'fs';
import path from 'path';

export interface Subscription {
  expiry: string; // ISO String
  bot_limit: number;
}

export interface UserFile {
  user_id: number;
  file_name: string;
  file_type: 'py' | 'js';
  is_running: boolean;
}

export interface DatabaseSchema {
  subscriptions: Record<number, Subscription>;
  user_files: UserFile[];
  active_users: number[];
  admins: number[];
  bot_locked: boolean;
}

const DB_PATH = path.join(process.cwd(), 'db.json');

const DEFAULT_ADMIN = 6845602766;

const DEFAULT_DB: DatabaseSchema = {
  subscriptions: {},
  user_files: [],
  active_users: [],
  admins: [DEFAULT_ADMIN],
  bot_locked: false,
};

class Database {
  private data: DatabaseSchema = { ...DEFAULT_DB };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure default admin is always present
        if (!this.data.admins.includes(DEFAULT_ADMIN)) {
          this.data.admins.push(DEFAULT_ADMIN);
        }
      } else {
        this.data = { ...DEFAULT_DB };
        this.save();
      }
    } catch (error) {
      console.error('Error loading database, resetting to default:', error);
      this.data = { ...DEFAULT_DB };
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Subscriptions
  public getSubscription(userId: number): Subscription | null {
    const sub = this.data.subscriptions[userId];
    if (!sub) return null;
    return sub;
  }

  public addSubscription(userId: number, days: number, botLimit: number) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    this.data.subscriptions[userId] = {
      expiry: expiryDate.toISOString(),
      bot_limit: botLimit,
    };
    this.save();
  }

  public removeSubscription(userId: number) {
    delete this.data.subscriptions[userId];
    this.save();
  }

  // Admins
  public isAdmin(userId: number): boolean {
    return this.data.admins.includes(userId) || userId === DEFAULT_ADMIN;
  }

  public getAdmins(): number[] {
    return [...this.data.admins];
  }

  public addAdmin(userId: number) {
    if (!this.data.admins.includes(userId)) {
      this.data.admins.push(userId);
      this.save();
    }
  }

  public removeAdmin(userId: number): boolean {
    if (userId === DEFAULT_ADMIN) return false;
    const index = this.data.admins.indexOf(userId);
    if (index > -1) {
      this.data.admins.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Active Users
  public addActiveUser(userId: number) {
    if (!this.data.active_users.includes(userId)) {
      this.data.active_users.push(userId);
      this.save();
    }
  }

  public getActiveUsers(): number[] {
    return this.data.active_users;
  }

  // Lock Bot
  public isLocked(): boolean {
    return this.data.bot_locked;
  }

  public setLocked(locked: boolean) {
    this.data.bot_locked = locked;
    this.save();
  }

  // User Files
  public getUserFiles(userId: number): UserFile[] {
    return this.data.user_files.filter(f => f.user_id === userId);
  }

  public getAllFiles(): UserFile[] {
    return this.data.user_files;
  }

  public saveUserFile(userId: number, fileName: string, fileType: 'py' | 'js') {
    // Remove if duplicate
    this.data.user_files = this.data.user_files.filter(
      f => !(f.user_id === userId && f.file_name === fileName)
    );
    this.data.user_files.push({
      user_id: userId,
      file_name: fileName,
      file_type: fileType,
      is_running: false,
    });
    this.save();
  }

  public setFileRunningState(userId: number, fileName: string, isRunning: boolean) {
    const file = this.data.user_files.find(
      f => f.user_id === userId && f.file_name === fileName
    );
    if (file) {
      file.is_running = isRunning;
      this.save();
    }
  }

  public removeUserFile(userId: number, fileName: string) {
    this.data.user_files = this.data.user_files.filter(
      f => !(f.user_id === userId && f.file_name === fileName)
    );
    this.save();
  }
}

export const db = new Database();
