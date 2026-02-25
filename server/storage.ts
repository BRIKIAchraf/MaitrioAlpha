import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export interface IStorage {
  getUser(id: string): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  createUser(user: schema.InsertUser): Promise<schema.User>;

  getArtisanProfile(userId: string): Promise<schema.ArtisanProfile | undefined>;
  getArtisanProfileById(id: string): Promise<schema.ArtisanProfile | undefined>;
  getAllArtisans(): Promise<(schema.ArtisanProfile & { user: schema.User })[]>;
  createArtisanProfile(profile: schema.InsertArtisanProfile): Promise<schema.ArtisanProfile>;
  updateArtisanProfile(id: string, data: Partial<schema.ArtisanProfile>): Promise<schema.ArtisanProfile | undefined>;

  getMission(id: string): Promise<schema.Mission | undefined>;
  getMissionsByClient(clientId: string): Promise<schema.Mission[]>;
  getMissionsByArtisan(artisanId: string): Promise<schema.Mission[]>;
  getPendingMissions(): Promise<schema.Mission[]>;
  createMission(mission: schema.InsertMission): Promise<schema.Mission>;
  updateMission(id: string, data: Partial<schema.Mission>): Promise<schema.Mission | undefined>;

  createQuote(quote: schema.InsertMissionQuote): Promise<schema.MissionQuote>;
  getQuotesByMission(missionId: string): Promise<schema.MissionQuote[]>;

  createReview(review: schema.InsertReview): Promise<schema.Review>;
  getReviewsByUser(userId: string): Promise<schema.Review[]>;
  getReviewsByMission(missionId: string): Promise<schema.Review[]>;

  getWallet(userId: string): Promise<schema.Wallet | undefined>;
  createWallet(wallet: schema.InsertWallet): Promise<schema.Wallet>;
  updateWalletBalance(userId: string, amount: number): Promise<schema.Wallet | undefined>;
  getWalletTransactions(walletId: string): Promise<schema.WalletTransaction[]>;
  createWalletTransaction(tx: schema.InsertWalletTransaction): Promise<schema.WalletTransaction>;

  createSignature(sig: schema.InsertSignature): Promise<schema.Signature>;
  getSignatureByMission(missionId: string): Promise<schema.Signature | undefined>;

  createInvoice(invoice: schema.InsertInvoice): Promise<schema.Invoice>;
  getInvoiceByMission(missionId: string): Promise<schema.Invoice | undefined>;

  getPortfolioItems(artisanId: string): Promise<schema.ArtisanPortfolioItem[]>;
  createPortfolioItem(item: schema.InsertPortfolioItem): Promise<schema.ArtisanPortfolioItem>;

  getNotifications(userId: string): Promise<schema.Notification[]>;
  createNotification(notification: schema.InsertNotification): Promise<schema.Notification>;
  markNotificationRead(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async createUser(insertUser: schema.InsertUser) {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    return user;
  }

  async getArtisanProfile(userId: string) {
    const [profile] = await db.select().from(schema.artisanProfiles).where(eq(schema.artisanProfiles.userId, userId));
    return profile;
  }

  async getArtisanProfileById(id: string) {
    const [profile] = await db.select().from(schema.artisanProfiles).where(eq(schema.artisanProfiles.id, id));
    return profile;
  }

  async getAllArtisans() {
    const results = await db
      .select()
      .from(schema.artisanProfiles)
      .innerJoin(schema.users, eq(schema.artisanProfiles.userId, schema.users.id));
    return results.map(r => ({ ...r.artisan_profiles, user: r.users }));
  }

  async createArtisanProfile(profile: schema.InsertArtisanProfile) {
    const [created] = await db.insert(schema.artisanProfiles).values(profile).returning();
    return created;
  }

  async updateArtisanProfile(id: string, data: Partial<schema.ArtisanProfile>) {
    const [updated] = await db.update(schema.artisanProfiles).set(data).where(eq(schema.artisanProfiles.id, id)).returning();
    return updated;
  }

  async getMission(id: string) {
    const [mission] = await db.select().from(schema.missions).where(eq(schema.missions.id, id));
    return mission;
  }

  async getMissionsByClient(clientId: string) {
    return db.select().from(schema.missions).where(eq(schema.missions.clientId, clientId)).orderBy(desc(schema.missions.createdAt));
  }

  async getMissionsByArtisan(artisanId: string) {
    return db.select().from(schema.missions).where(eq(schema.missions.artisanId, artisanId)).orderBy(desc(schema.missions.createdAt));
  }

  async getPendingMissions() {
    return db.select().from(schema.missions).where(eq(schema.missions.status, "pending")).orderBy(desc(schema.missions.createdAt));
  }

  async createMission(mission: schema.InsertMission) {
    const [created] = await db.insert(schema.missions).values(mission).returning();
    return created;
  }

  async updateMission(id: string, data: Partial<schema.Mission>) {
    const [updated] = await db.update(schema.missions).set({ ...data, updatedAt: new Date() }).where(eq(schema.missions.id, id)).returning();
    return updated;
  }

  async createQuote(quote: schema.InsertMissionQuote) {
    const [created] = await db.insert(schema.missionQuotes).values(quote).returning();
    return created;
  }

  async getQuotesByMission(missionId: string) {
    return db.select().from(schema.missionQuotes).where(eq(schema.missionQuotes.missionId, missionId));
  }

  async createReview(review: schema.InsertReview) {
    const [created] = await db.insert(schema.reviews).values(review).returning();
    const reviews = await db.select().from(schema.reviews).where(eq(schema.reviews.toUserId, review.toUserId));
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const profile = await this.getArtisanProfile(review.toUserId);
    if (profile) {
      await this.updateArtisanProfile(profile.id, { rating: Math.round(avgRating * 10) / 10 });
    }
    return created;
  }

  async getReviewsByUser(userId: string) {
    return db.select().from(schema.reviews).where(eq(schema.reviews.toUserId, userId)).orderBy(desc(schema.reviews.createdAt));
  }

  async getReviewsByMission(missionId: string) {
    return db.select().from(schema.reviews).where(eq(schema.reviews.missionId, missionId));
  }

  async getWallet(userId: string) {
    const [wallet] = await db.select().from(schema.wallets).where(eq(schema.wallets.userId, userId));
    return wallet;
  }

  async createWallet(wallet: schema.InsertWallet) {
    const [created] = await db.insert(schema.wallets).values(wallet).returning();
    return created;
  }

  async updateWalletBalance(userId: string, amount: number) {
    const [updated] = await db
      .update(schema.wallets)
      .set({ balance: sql`${schema.wallets.balance} + ${amount}` })
      .where(eq(schema.wallets.userId, userId))
      .returning();
    return updated;
  }

  async getWalletTransactions(walletId: string) {
    return db.select().from(schema.walletTransactions).where(eq(schema.walletTransactions.walletId, walletId)).orderBy(desc(schema.walletTransactions.createdAt));
  }

  async createWalletTransaction(tx: schema.InsertWalletTransaction) {
    const [created] = await db.insert(schema.walletTransactions).values(tx).returning();
    return created;
  }

  async createSignature(sig: schema.InsertSignature) {
    const [created] = await db.insert(schema.signatures).values(sig).returning();
    return created;
  }

  async getSignatureByMission(missionId: string) {
    const [sig] = await db.select().from(schema.signatures).where(eq(schema.signatures.missionId, missionId));
    return sig;
  }

  async createInvoice(invoice: schema.InsertInvoice) {
    const [created] = await db.insert(schema.invoices).values(invoice).returning();
    return created;
  }

  async getInvoiceByMission(missionId: string) {
    const [inv] = await db.select().from(schema.invoices).where(eq(schema.invoices.missionId, missionId));
    return inv;
  }

  async getPortfolioItems(artisanId: string) {
    return db.select().from(schema.artisanPortfolioItems).where(eq(schema.artisanPortfolioItems.artisanId, artisanId));
  }

  async createPortfolioItem(item: schema.InsertPortfolioItem) {
    const [created] = await db.insert(schema.artisanPortfolioItems).values(item).returning();
    return created;
  }

  async getNotifications(userId: string) {
    return db.select().from(schema.notifications).where(eq(schema.notifications.userId, userId)).orderBy(desc(schema.notifications.createdAt));
  }

  async createNotification(notification: schema.InsertNotification) {
    const [created] = await db.insert(schema.notifications).values(notification).returning();
    return created;
  }

  async markNotificationRead(id: string) {
    await db.update(schema.notifications).set({ read: true }).where(eq(schema.notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
