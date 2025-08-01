import { type User, type InsertUser, type Url, type InsertUrl, type ClickLog, type InsertClickLog, type UrlWithClickLogs } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // URL operations
  createUrl(url: InsertUrl): Promise<Url>;
  getUrlByShortCode(shortCode: string): Promise<Url | undefined>;
  getAllUrls(): Promise<Url[]>;
  updateUrlClickCount(id: string): Promise<void>;
  getUrlStats(): Promise<{
    totalUrls: number;
    totalClicks: number;
    activeUrls: number;
    expiredUrls: number;
  }>;
  
  // Click log operations
  createClickLog(clickLog: InsertClickLog): Promise<ClickLog>;
  getClickLogsByUrlId(urlId: string): Promise<ClickLog[]>;
  getAllClickLogs(): Promise<ClickLog[]>;
  getUrlsWithClickLogs(): Promise<UrlWithClickLogs[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private urls: Map<string, Url>;
  private clickLogs: Map<string, ClickLog>;
  private shortCodeIndex: Map<string, string>; // shortCode -> url.id

  constructor() {
    this.users = new Map();
    this.urls = new Map();
    this.clickLogs = new Map();
    this.shortCodeIndex = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createUrl(insertUrl: InsertUrl): Promise<Url> {
    const id = randomUUID();
    const shortCode = insertUrl.shortCode || this.generateShortCode();
    
    // Check if shortCode already exists
    if (this.shortCodeIndex.has(shortCode)) {
      throw new Error('Short code already exists');
    }
    
    const now = new Date();
    let expiresAt: Date | null = null;
    
    if (insertUrl.validityMinutes) {
      expiresAt = new Date(now.getTime() + insertUrl.validityMinutes * 60 * 1000);
    }
    
    const url: Url = {
      id,
      shortCode,
      longUrl: insertUrl.longUrl,
      createdAt: now,
      expiresAt,
      isActive: true,
      clickCount: 0,
    };
    
    this.urls.set(id, url);
    this.shortCodeIndex.set(shortCode, id);
    return url;
  }

  async getUrlByShortCode(shortCode: string): Promise<Url | undefined> {
    const urlId = this.shortCodeIndex.get(shortCode);
    if (!urlId) return undefined;
    
    const url = this.urls.get(urlId);
    if (!url) return undefined;
    
    // Check if URL is expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      return undefined;
    }
    
    return url;
  }

  async getAllUrls(): Promise<Url[]> {
    return Array.from(this.urls.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateUrlClickCount(id: string): Promise<void> {
    const url = this.urls.get(id);
    if (url) {
      url.clickCount++;
      this.urls.set(id, url);
    }
  }

  async getUrlStats(): Promise<{
    totalUrls: number;
    totalClicks: number;
    activeUrls: number;
    expiredUrls: number;
  }> {
    const urls = Array.from(this.urls.values());
    const now = new Date();
    
    return {
      totalUrls: urls.length,
      totalClicks: urls.reduce((sum, url) => sum + url.clickCount, 0),
      activeUrls: urls.filter(url => 
        url.isActive && (!url.expiresAt || url.expiresAt > now)
      ).length,
      expiredUrls: urls.filter(url => 
        url.expiresAt && url.expiresAt <= now
      ).length,
    };
  }

  async createClickLog(insertClickLog: InsertClickLog): Promise<ClickLog> {
    const id = randomUUID();
    const clickLog: ClickLog = {
      id,
      ...insertClickLog,
      timestamp: new Date(),
    };
    this.clickLogs.set(id, clickLog);
    return clickLog;
  }

  async getClickLogsByUrlId(urlId: string): Promise<ClickLog[]> {
    return Array.from(this.clickLogs.values())
      .filter(log => log.urlId === urlId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getAllClickLogs(): Promise<ClickLog[]> {
    return Array.from(this.clickLogs.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async getUrlsWithClickLogs(): Promise<UrlWithClickLogs[]> {
    const urls = await this.getAllUrls();
    const result: UrlWithClickLogs[] = [];
    
    for (const url of urls) {
      const clickLogs = await this.getClickLogsByUrlId(url.id);
      result.push({ ...url, clickLogs });
    }
    
    return result;
  }

  private generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness
    if (this.shortCodeIndex.has(result)) {
      return this.generateShortCode();
    }
    
    return result;
  }
}

export const storage = new MemStorage();
