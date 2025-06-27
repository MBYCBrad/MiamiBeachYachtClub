import { storage } from "./storage";
import { MediaAsset, InsertMediaAsset } from "@shared/schema";
import path from "path";
import fs from "fs";

export class MediaStorageService {
  private assetsPath = path.join(process.cwd(), "attached_assets");

  constructor() {
    // Ensure assets directory exists
    if (!fs.existsSync(this.assetsPath)) {
      fs.mkdirSync(this.assetsPath, { recursive: true });
    }
  }

  async getActiveHeroVideo(): Promise<MediaAsset | null> {
    return await storage.getActiveHeroVideo();
  }

  async getAllMediaAssets(filters?: {
    category?: string;
    type?: string;
    isActive?: boolean;
  }): Promise<MediaAsset[]> {
    return await storage.getMediaAssets(filters);
  }

  async createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset> {
    return await storage.createMediaAsset(asset);
  }

  async updateMediaAsset(id: number, updates: Partial<InsertMediaAsset>): Promise<MediaAsset | null> {
    const result = await storage.updateMediaAsset(id, updates);
    return result || null;
  }

  async deleteMediaAsset(id: number): Promise<boolean> {
    return await storage.deleteMediaAsset(id);
  }

  // Get file path for serving static assets
  getAssetPath(filename: string): string {
    return path.join(this.assetsPath, filename);
  }

  // Check if file exists in storage
  fileExists(filename: string): boolean {
    return fs.existsSync(this.getAssetPath(filename));
  }

  // Get file stats
  getFileStats(filename: string) {
    const filePath = this.getAssetPath(filename);
    if (this.fileExists(filename)) {
      return fs.statSync(filePath);
    }
    return null;
  }
}

export const mediaStorageService = new MediaStorageService();