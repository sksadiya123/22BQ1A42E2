import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUrlSchema, insertClickLogSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // URL shortening endpoints
  app.post("/api/urls", async (req, res) => {
    try {
      const urls = Array.isArray(req.body) ? req.body : [req.body];
      const results = [];
      
      for (const urlData of urls) {
        const validatedUrl = insertUrlSchema.parse(urlData);
        const url = await storage.createUrl(validatedUrl);
        results.push(url);
      }
      
      res.json(results);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all URLs
  app.get("/api/urls", async (req, res) => {
    try {
      const urls = await storage.getAllUrls();
      res.json(urls);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get URL statistics
  app.get("/api/urls/stats", async (req, res) => {
    try {
      const stats = await storage.getUrlStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get URLs with click logs
  app.get("/api/urls/detailed", async (req, res) => {
    try {
      const urlsWithLogs = await storage.getUrlsWithClickLogs();
      res.json(urlsWithLogs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Redirect endpoint
  app.get("/api/redirect/:shortCode", async (req, res) => {
    try {
      const { shortCode } = req.params;
      const url = await storage.getUrlByShortCode(shortCode);
      
      if (!url) {
        return res.status(404).json({ error: "URL not found or expired" });
      }

      // Log the click
      const clickLog = insertClickLogSchema.parse({
        urlId: url.id,
        sourceIp: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer') || 'Direct',
        location: 'Unknown', // Could integrate with GeoIP service
      });
      
      await storage.createClickLog(clickLog);
      await storage.updateUrlClickCount(url.id);

      res.json({ url: url.longUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get click logs
  app.get("/api/clicks", async (req, res) => {
    try {
      const clickLogs = await storage.getAllClickLogs();
      res.json(clickLogs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
