import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/maitrio",
});

export const db = drizzle(pool, { schema });

export interface IStorage {
  getUser(id: string): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  getAllUsers(): Promise<schema.User[]>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  updateUser(id: string, data: Partial<schema.User>): Promise<schema.User | undefined>;

  getUserAddresses(userId: string): Promise<schema.UserAddress[]>;
  createUserAddress(address: schema.InsertUserAddress): Promise<schema.UserAddress>;

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
  updateEscrowBalance(userId: string, amount: number): Promise<schema.Wallet | undefined>;
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

  getEquipment(userId: string): Promise<schema.Equipment[]>;
  createEquipment(eq: schema.InsertEquipment): Promise<schema.Equipment>;
  getInventory(artisanId: string): Promise<schema.InventoryItem[]>;
  createInventoryItem(item: schema.InsertInventory): Promise<schema.InventoryItem>;
  updateInventoryQuantity(id: string, change: number): Promise<schema.InventoryItem | undefined>;

  createDispute(dispute: schema.InsertDispute): Promise<schema.Dispute>;
  getDispute(id: string): Promise<schema.Dispute | undefined>;
  updateDispute(id: string, data: Partial<schema.Dispute>): Promise<schema.Dispute | undefined>;
  getDisputesByMission(missionId: string): Promise<schema.Dispute[]>;
  createDisputeMessage(msg: schema.InsertDisputeMessage): Promise<schema.DisputeMessage>;
  getDisputeMessages(disputeId: string): Promise<schema.DisputeMessage[]>;

  findArtisansInRadius(lat: number, lng: number, radiusKm: number, specialty?: string): Promise<any[]>;
  updateUserPoints(userId: string, type: 'loyalty' | 'eco', points: number): Promise<schema.User | undefined>;
  buyInventoryItem(itemId: string, buyerId: string, quantity: number): Promise<boolean>;
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

  async getAllUsers() {
    return db.select().from(schema.users);
  }

  async createUser(insertUser: schema.InsertUser) {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<schema.User>) {
    const [updated] = await db.update(schema.users).set(data).where(eq(schema.users.id, id)).returning();
    return updated;
  }

  async getUserAddresses(userId: string) {
    return db.select().from(schema.userAddresses).where(eq(schema.userAddresses.userId, userId));
  }

  async createUserAddress(address: schema.InsertUserAddress) {
    const [created] = await db.insert(schema.userAddresses).values(address).returning();
    return created;
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

  async updateEscrowBalance(userId: string, amount: number) {
    const [updated] = await db
      .update(schema.wallets)
      .set({ escrowBalance: sql`${schema.wallets.escrowBalance} + ${amount}` })
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

  async getEquipment(userId: string) {
    return db.select().from(schema.equipmentRegistry).where(eq(schema.equipmentRegistry.userId, userId));
  }

  async createEquipment(eqp: schema.InsertEquipment) {
    const [created] = await db.insert(schema.equipmentRegistry).values(eqp).returning();
    return created;
  }

  async getInventory(artisanId: string) {
    return db.select().from(schema.inventory).where(eq(schema.inventory.artisanId, artisanId));
  }

  async createInventoryItem(item: schema.InsertInventory) {
    const [created] = await db.insert(schema.inventory).values(item).returning();
    return created;
  }

  async updateInventoryQuantity(id: string, change: number) {
    const [updated] = await db
      .update(schema.inventory)
      .set({ quantity: sql`${schema.inventory.quantity} + ${change}` })
      .where(eq(schema.inventory.id, id))
      .returning();
    return updated;
  }

  async createDispute(dispute: schema.InsertDispute) {
    const [created] = await db.insert(schema.disputes).values(dispute).returning();
    return created;
  }

  async getDisputesByMission(missionId: string) {
    return db.select().from(schema.disputes).where(eq(schema.disputes.missionId, missionId));
  }

  async getDispute(id: string) {
    const [dispute] = await db.select().from(schema.disputes).where(eq(schema.disputes.id, id));
    return dispute;
  }

  async updateDispute(id: string, data: Partial<schema.Dispute>) {
    const [updated] = await db.update(schema.disputes).set(data).where(eq(schema.disputes.id, id)).returning();
    return updated;
  }

  async createDisputeMessage(msg: schema.InsertDisputeMessage) {
    const [created] = await db.insert(schema.disputeMessages).values(msg).returning();
    return created;
  }

  async getDisputeMessages(disputeId: string) {
    return db.select().from(schema.disputeMessages).where(eq(schema.disputeMessages.disputeId, disputeId)).orderBy(schema.disputeMessages.createdAt);
  }

  async findArtisansInRadius(lat: number, lng: number, radiusKm: number, specialty?: string) {
    const distanceSql = sql<number>`6371 * acos(cos(radians(${lat})) * cos(radians(${schema.artisanProfiles.latitude})) * cos(radians(${schema.artisanProfiles.longitude}) - radians(${lng})) + sin(radians(${lat})) * sin(radians(${schema.artisanProfiles.latitude})))`;

    let conditions = and(
      eq(schema.artisanProfiles.availability, true),
      sql`${distanceSql} <= ${radiusKm}`
    );

    if (specialty) {
      conditions = and(conditions, sql`${schema.artisanProfiles.specialties}::jsonb ?? ${specialty}`);
    }

    const results = await db
      .select({
        profile: schema.artisanProfiles,
        user: schema.users,
        distance: distanceSql,
      })
      .from(schema.artisanProfiles)
      .innerJoin(schema.users, eq(schema.artisanProfiles.userId, schema.users.id))
      .where(conditions)
      .orderBy(distanceSql);

    return results.map(r => ({ ...r.profile, user: r.user, distance: r.distance }));
  }

  async buyInventoryItem(itemId: string, buyerId: string, quantity: number) {
    const [item] = await db.select().from(schema.inventory).where(eq(schema.inventory.id, itemId));
    if (!item || (item.quantity || 0) < quantity) return false;

    const totalPrice = (item.price || 0) * quantity;
    const buyerWallet = await this.getWallet(buyerId);
    if (!buyerWallet || (buyerWallet.balance || 0) < totalPrice) return false;

    // Transactional logic simulated via multiple updates
    await this.updateInventoryQuantity(itemId, -quantity);
    await this.updateWalletBalance(buyerId, -totalPrice);
    await this.updateWalletBalance(item.artisanId, totalPrice); // Seller is the artisan

    await this.createWalletTransaction({
      walletId: buyerWallet.id,
      amount: totalPrice,
      type: "debit",
      description: `Achat Marketplace: ${item.name}`,
    });

    return true;
  }

  async updateUserPoints(userId: string, type: 'loyalty' | 'eco', points: number) {
    const field = type === 'loyalty' ? schema.users.loyaltyPoints : schema.users.ecoPoints;
    const [updated] = await db
      .update(schema.users)
      .set({ [type === 'loyalty' ? 'loyaltyPoints' : 'ecoPoints']: sql`${field} + ${points}` })
      .where(eq(schema.users.id, userId))
      .returning();
    return updated;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, schema.User>;
  private addresses: Map<string, schema.UserAddress>;
  private profile: Map<string, schema.ArtisanProfile>;
  private missions: Map<string, schema.Mission>;
  private quotes: Map<string, schema.MissionQuote>;
  private reviews: Map<string, schema.Review>;
  private wallets: Map<string, schema.Wallet>;
  private transactions: Map<string, schema.WalletTransaction>;
  private signatures: Map<string, schema.Signature>;
  private invoices: Map<string, schema.Invoice>;
  private portfolio: Map<string, schema.ArtisanPortfolioItem>;
  private notifications: Map<string, schema.Notification>;
  private equipment: Map<string, schema.Equipment>;
  private inventory: Map<string, schema.InventoryItem>;
  private disputes: Map<string, schema.Dispute>;
  private disputeMessages: Map<string, schema.DisputeMessage>;

  constructor() {
    this.users = new Map();
    this.addresses = new Map();
    this.profile = new Map();
    this.missions = new Map();
    this.quotes = new Map();
    this.reviews = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    this.signatures = new Map();
    this.invoices = new Map();
    this.portfolio = new Map();
    this.notifications = new Map();
    this.equipment = new Map();
    this.inventory = new Map();
    this.disputes = new Map();
    this.disputeMessages = new Map();
  }

  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) {
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  async getAllUsers() { return Array.from(this.users.values()); }
  async createUser(insertUser: schema.InsertUser) {
    const id = Math.random().toString(36).substring(2);
    const user: schema.User = {
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email ?? null,
      phone: insertUser.phone ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      role: insertUser.role ?? "client",
      id,
      createdAt: new Date(),
      avatarUrl: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      referralCode: null,
      referredBy: null,
      referralCount: 0,
      loyaltyPoints: 0,
      ecoPoints: 0,
      isPremium: false
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id: string, data: Partial<schema.User>) {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }
  async getUserAddresses(userId: string) {
    return Array.from(this.addresses.values()).filter(a => a.userId === userId);
  }
  async createUserAddress(address: schema.InsertUserAddress) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...address, id };
    this.addresses.set(id, created as any);
    return created as any;
  }
  async getArtisanProfile(userId: string) {
    return Array.from(this.profile.values()).find(p => p.userId === userId);
  }
  async getArtisanProfileById(id: string) { return this.profile.get(id); }
  async getAllArtisans() {
    return Array.from(this.profile.values()).map(p => ({ ...p, user: this.users.get(p.userId)! }));
  }
  async createArtisanProfile(profile: schema.InsertArtisanProfile) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...profile, id, rating: 0, completedMissions: 0, kycStatus: "pending", availability: true, isPremium: false };
    this.profile.set(id, created as any);
    return created as any;
  }
  async updateArtisanProfile(id: string, data: Partial<schema.ArtisanProfile>) {
    const p = this.profile.get(id);
    if (!p) return undefined;
    const updated = { ...p, ...data };
    this.profile.set(id, updated);
    return updated;
  }
  async getMission(id: string) { return this.missions.get(id); }
  async getMissionsByClient(clientId: string) {
    return Array.from(this.missions.values()).filter(m => m.clientId === clientId);
  }
  async getMissionsByArtisan(artisanId: string) {
    return Array.from(this.missions.values()).filter(m => m.artisanId === artisanId);
  }
  async getPendingMissions() {
    return Array.from(this.missions.values()).filter(m => m.status === "pending");
  }
  async createMission(mission: schema.InsertMission) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...mission, id, status: "pending", createdAt: new Date() };
    this.missions.set(id, created as any);
    return created as any;
  }
  async updateMission(id: string, data: Partial<schema.Mission>) {
    const m = this.missions.get(id);
    if (!m) return undefined;
    const updated = { ...m, ...data, updatedAt: new Date() };
    this.missions.set(id, updated as any);
    return updated as any;
  }
  async createQuote(quote: schema.InsertMissionQuote) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...quote, id, createdAt: new Date(), status: "pending" };
    this.quotes.set(id, created as any);
    return created as any;
  }
  async getQuotesByMission(missionId: string) {
    return Array.from(this.quotes.values()).filter(q => q.missionId === missionId);
  }
  async createReview(review: schema.InsertReview) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...review, id, createdAt: new Date() };
    this.reviews.set(id, created as any);
    return created as any;
  }
  async getReviewsByUser(userId: string) {
    return Array.from(this.reviews.values()).filter(r => r.toUserId === userId);
  }
  async getReviewsByMission(missionId: string) {
    return Array.from(this.reviews.values()).filter(r => r.missionId === missionId);
  }
  async getWallet(userId: string) {
    return Array.from(this.wallets.values()).find(w => w.userId === userId);
  }
  async createWallet(wallet: schema.InsertWallet) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...wallet, id, balance: wallet.balance || 0, escrowBalance: 0, currency: "EUR" };
    this.wallets.set(id, created as any);
    return created as any;
  }
  async updateWalletBalance(userId: string, amount: number) {
    const w = await this.getWallet(userId);
    if (!w) return undefined;
    const updated = { ...w, balance: (w.balance || 0) + amount };
    this.wallets.set(w.id, updated as any);
    return updated as any;
  }
  async updateEscrowBalance(userId: string, amount: number) {
    const w = await this.getWallet(userId);
    if (!w) return undefined;
    const updated = { ...w, escrowBalance: (w.escrowBalance || 0) + amount };
    this.wallets.set(w.id, updated as any);
    return updated as any;
  }
  async getWalletTransactions(walletId: string) {
    return Array.from(this.transactions.values()).filter(t => t.walletId === walletId);
  }
  async createWalletTransaction(tx: schema.InsertWalletTransaction) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...tx, id, createdAt: new Date() };
    this.transactions.set(id, created as any);
    return created as any;
  }
  async createSignature(sig: schema.InsertSignature) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...sig, id, signedAt: new Date() };
    this.signatures.set(id, created as any);
    return created as any;
  }
  async getSignatureByMission(missionId: string) {
    return Array.from(this.signatures.values()).find(s => s.missionId === missionId);
  }
  async createInvoice(invoice: schema.InsertInvoice) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...invoice, id, generatedAt: new Date() };
    this.invoices.set(id, created as any);
    return created as any;
  }
  async getInvoiceByMission(missionId: string) {
    return Array.from(this.invoices.values()).find(i => i.missionId === missionId);
  }
  async getPortfolioItems(artisanId: string) {
    return Array.from(this.portfolio.values()).filter(p => p.artisanId === artisanId);
  }
  async createPortfolioItem(item: schema.InsertPortfolioItem) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...item, id };
    this.portfolio.set(id, created as any);
    return created as any;
  }
  async getNotifications(userId: string) {
    return Array.from(this.notifications.values()).filter(n => n.userId === userId);
  }
  async createNotification(notification: schema.InsertNotification) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...notification, id, createdAt: new Date(), read: false };
    this.notifications.set(id, created as any);
    return created as any;
  }
  async markNotificationRead(id: string) {
    const n = this.notifications.get(id);
    if (n) this.notifications.set(id, { ...n, read: true });
  }
  async getEquipment(userId: string) {
    return Array.from(this.equipment.values()).filter(e => e.userId === userId);
  }
  async createEquipment(eqp: schema.InsertEquipment) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...eqp, id };
    this.equipment.set(id, created as any);
    return created as any;
  }
  async getInventory(artisanId: string) {
    return Array.from(this.inventory.values()).filter(i => i.artisanId === artisanId);
  }
  async createInventoryItem(item: schema.InsertInventory) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...item, id };
    this.inventory.set(id, created as any);
    return created as any;
  }
  async updateInventoryQuantity(id: string, change: number) {
    const i = this.inventory.get(id);
    if (!i) return undefined;
    const updated = { ...i, quantity: (i.quantity || 0) + change };
    this.inventory.set(id, updated);
    return updated;
  }
  async createDispute(dispute: schema.InsertDispute) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...dispute, id, createdAt: new Date(), status: "open" };
    this.disputes.set(id, created as any);
    return created as any;
  }
  async getDispute(id: string) { return this.disputes.get(id); }
  async updateDispute(id: string, data: Partial<schema.Dispute>) {
    const d = this.disputes.get(id);
    if (!d) return undefined;
    const updated = { ...d, ...data };
    this.disputes.set(id, updated);
    return updated;
  }
  async getDisputesByMission(missionId: string) {
    return Array.from(this.disputes.values()).filter(d => d.missionId === missionId);
  }
  async createDisputeMessage(msg: schema.InsertDisputeMessage) {
    const id = Math.random().toString(36).substring(2);
    const created = { ...msg, id, createdAt: new Date() };
    this.disputeMessages.set(id, created as any);
    return created as any;
  }
  async getDisputeMessages(disputeId: string) {
    return Array.from(this.disputeMessages.values()).filter(m => m.disputeId === disputeId);
  }
  async findArtisansInRadius(lat: number, lng: number, radiusKm: number, specialty?: string) {
    return Array.from(this.profile.values())
      .map(p => ({ ...p, user: this.users.get(p.userId)!, distance: 5 })) // Mock distance
      .filter(p => !specialty || p.specialties?.includes(specialty));
  }
  async updateUserPoints(userId: string, type: 'loyalty' | 'eco', points: number) {
    const u = this.users.get(userId);
    if (!u) return undefined;
    const updated = { ...u, [type === 'loyalty' ? 'loyaltyPoints' : 'ecoPoints']: (u[type === 'loyalty' ? 'loyaltyPoints' : 'ecoPoints'] || 0) + points };
    this.users.set(userId, updated);
    return updated;
  }
  async buyInventoryItem(itemId: string, buyerId: string, quantity: number) {
    const item = this.inventory.get(itemId);
    if (!item || (item.quantity || 0) < quantity) return false;
    await this.updateInventoryQuantity(itemId, -quantity);
    return true;
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
