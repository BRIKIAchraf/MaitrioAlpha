import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  real,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  phone: text("phone"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("client"),
  avatarUrl: text("avatar_url"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  referralCode: text("referral_code"),
  referredBy: varchar("referred_by"),
  referralCount: integer("referral_count").default(0),
  loyaltyPoints: integer("loyalty_points").default(0),
  ecoPoints: integer("eco_points").default(0),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAddresses = pgTable("user_addresses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  label: text("label").notNull(), // Home, Work, Parents
  address: text("address").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  isDefault: boolean("is_default").default(false),
});

export const artisanProfiles = pgTable(
  "artisan_profiles",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    specialties: text("specialties").default("[]"),
    bio: text("bio"),
    website: text("website"),
    googlePlaceId: text("google_place_id"),
    certifications: text("certifications").default("[]"),
    insuranceDocUrl: text("insurance_doc_url"),
    idDocUrl: text("id_doc_url"),
    kbisDocUrl: text("kbis_doc_url"),
    diplomaDocUrl: text("diploma_doc_url"),
    zone: text("zone"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    rating: real("rating").default(0),
    completedMissions: integer("completed_missions").default(0),
    kycStatus: text("kyc_status").default("pending"),
    availability: boolean("availability").default(true),
    isPremium: boolean("is_premium").default(false),
  },
  (table) => [
    index("artisan_profiles_user_id_idx").on(table.userId),
    index("artisan_profiles_zone_idx").on(table.zone),
  ]
);

export const artisanProfilesRelations = relations(
  artisanProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [artisanProfiles.userId],
      references: [users.id],
    }),
    portfolioItems: many(artisanPortfolioItems),
  })
);

export const missions = pgTable(
  "missions",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    clientId: varchar("client_id")
      .notNull()
      .references(() => users.id),
    artisanId: varchar("artisan_id").references(() => users.id),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category"),
    status: text("status").default("pending"),
    address: text("address"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    scheduledDate: timestamp("scheduled_date"),
    estimatedPrice: real("estimated_price"),
    finalPrice: real("final_price"),
    escrowAmount: real("escrow_amount").default(0),
    urgency: text("urgency").default("normal"),
    isSos: boolean("is_sos").default(false),
    photos: text("photos").default("[]"),
    videoUrl: text("video_url"),
    iaDiagnostic: text("ia_diagnostic"),
    checkInTime: timestamp("check_in_time"),
    checkOutTime: timestamp("check_out_time"),
    geofenceArrived: boolean("geofence_arrived").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("missions_client_id_idx").on(table.clientId),
    index("missions_artisan_id_idx").on(table.artisanId),
    index("missions_status_idx").on(table.status),
  ]
);

export const chats = pgTable("chats", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  missionId: varchar("mission_id")
    .notNull()
    .references(() => missions.id),
  senderId: varchar("sender_id")
    .notNull()
    .references(() => users.id),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"), // 'image' | 'audio' | 'video'
  isVoiceNote: boolean("is_voice_note").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const missionQuotes = pgTable(
  "mission_quotes",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    missionId: varchar("mission_id")
      .notNull()
      .references(() => missions.id),
    artisanId: varchar("artisan_id")
      .notNull()
      .references(() => users.id),
    amountLabor: real("amount_labor").notNull().default(0),
    amountParts: real("amount_parts").notNull().default(0),
    amountTotal: real("amount_total").notNull().default(0),
    description: text("description"),
    partsList: text("parts_list").default("[]"), // JSON list of parts
    estimatedDuration: text("estimated_duration"),
    status: text("status").default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("mission_quotes_mission_id_idx").on(table.missionId),
  ]
);

export const equipmentRegistry = pgTable("equipment_registry", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(), // Climatiseur, Chaudière
  brand: text("brand"),
  model: text("model"),
  installDate: timestamp("install_date"),
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  healthScore: integer("health_score").default(100),
  healthHistory: text("health_history").default("[]"),
});

export const inventory = pgTable("inventory", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  artisanId: varchar("artisan_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  quantity: integer("quantity").default(0),
  minQuantity: integer("min_quantity").default(5),
  price: real("price"),
  description: text("description"),
  imageUrl: text("image_url"),
  type: text("type").default("stock"), // 'stock' | 'used'
  condition: text("condition").default("Neuf"),
});

export const disputes = pgTable("disputes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  missionId: varchar("mission_id")
    .notNull()
    .references(() => missions.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  reason: text("reason").notNull(),
  evidenceUrls: text("evidence_urls").default("[]"),
  status: text("status").default("open"), // 'open', 'in_mediation', 'resolved', 'refunded'
  mediationNotes: text("mediation_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const disputeMessages = pgTable("dispute_messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  disputeId: varchar("dispute_id")
    .notNull()
    .references(() => disputes.id),
  senderId: varchar("sender_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ecoImpact = pgTable("eco_impact", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  missionId: varchar("mission_id")
    .notNull()
    .references(() => missions.id),
  artisanId: varchar("artisan_id")
    .notNull()
    .references(() => users.id),
  recyclingDeclared: boolean("recycling_declared").default(false),
  ecoPointsEarned: integer("eco_points_earned").default(0),
});


export const reviews = pgTable(
  "reviews",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    missionId: varchar("mission_id")
      .notNull()
      .references(() => missions.id),
    fromUserId: varchar("from_user_id")
      .notNull()
      .references(() => users.id),
    toUserId: varchar("to_user_id")
      .notNull()
      .references(() => users.id),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    tags: text("tags").default("[]"), // ['Vérifié', 'Rapide', 'Propreté']
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("reviews_to_user_id_idx").on(table.toUserId),
    index("reviews_mission_id_idx").on(table.missionId),
  ]
);

export const wallets = pgTable(
  "wallets",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id)
      .unique(),
    balance: real("balance").default(0),
    escrowBalance: real("escrow_balance").default(0),
    currency: text("currency").default("EUR"),
  },
  (table) => [index("wallets_user_id_idx").on(table.userId)]
);

export const walletTransactions = pgTable(
  "wallet_transactions",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    walletId: varchar("wallet_id")
      .notNull()
      .references(() => wallets.id),
    amount: real("amount").notNull(),
    type: text("type").notNull(),
    missionId: varchar("mission_id").references(() => missions.id),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("wallet_transactions_wallet_id_idx").on(table.walletId),
  ]
);

export const signatures = pgTable(
  "signatures",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    missionId: varchar("mission_id")
      .notNull()
      .references(() => missions.id)
      .unique(),
    signatureData: text("signature_data").notNull(),
    signedAt: timestamp("signed_at").defaultNow(),
  },
  (table) => [index("signatures_mission_id_idx").on(table.missionId)]
);

export const invoices = pgTable(
  "invoices",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    missionId: varchar("mission_id")
      .notNull()
      .references(() => missions.id)
      .unique(),
    pdfUrl: text("pdf_url"),
    invoiceNumber: text("invoice_number").notNull(),
    amount: real("amount").notNull(),
    generatedAt: timestamp("generated_at").defaultNow(),
  },
  (table) => [index("invoices_mission_id_idx").on(table.missionId)]
);

export const artisanPortfolioItems = pgTable(
  "artisan_portfolio_items",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    artisanId: varchar("artisan_id")
      .notNull()
      .references(() => artisanProfiles.id),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    category: text("category"),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("portfolio_items_artisan_id_idx").on(table.artisanId),
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type"),
    read: boolean("read").default(false),
    missionId: varchar("mission_id").references(() => missions.id),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
  ]
);

export const usersRelations = relations(users, ({ one, many }) => ({
  artisanProfile: one(artisanProfiles, {
    fields: [users.id],
    references: [artisanProfiles.userId],
  }),
  userAddresses: many(userAddresses),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  notifications: many(notifications),
  givenReviews: many(reviews, { relationName: "reviewsGiven" }),
  receivedReviews: many(reviews, { relationName: "reviewsReceived" }),
  missionsAsClient: many(missions, { relationName: "clientMissions" }),
  missionsAsArtisan: many(missions, { relationName: "artisanMissions" }),
  equipment: many(equipmentRegistry),
}));

export const missionsRelations = relations(missions, ({ one, many }) => ({
  client: one(users, {
    fields: [missions.clientId],
    references: [users.id],
    relationName: "clientMissions",
  }),
  artisan: one(users, {
    fields: [missions.artisanId],
    references: [users.id],
    relationName: "artisanMissions",
  }),
  quotes: many(missionQuotes),
  reviews: many(reviews),
  signature: one(signatures, {
    fields: [missions.id],
    references: [signatures.missionId],
  }),
  invoice: one(invoices, {
    fields: [missions.id],
    references: [invoices.missionId],
  }),
  chats: many(chats),
  disputes: many(disputes),
  disputeMessages: many(disputeMessages),
  ecoImpact: one(ecoImpact, {
    fields: [missions.id],
    references: [ecoImpact.missionId],
  }),
}));

export const missionQuotesRelations = relations(missionQuotes, ({ one }) => ({
  mission: one(missions, {
    fields: [missionQuotes.missionId],
    references: [missions.id],
  }),
  artisan: one(users, {
    fields: [missionQuotes.artisanId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  mission: one(missions, {
    fields: [reviews.missionId],
    references: [missions.id],
  }),
  fromUser: one(users, {
    fields: [reviews.fromUserId],
    references: [users.id],
    relationName: "reviewsGiven",
  }),
  toUser: one(users, {
    fields: [reviews.toUserId],
    references: [users.id],
    relationName: "reviewsReceived",
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  role: true,
});

export const insertArtisanProfileSchema = createInsertSchema(artisanProfiles).omit({
  id: true,
  rating: true,
  completedMissions: true,
});

export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMissionQuoteSchema = createInsertSchema(missionQuotes).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertSignatureSchema = createInsertSchema(signatures).omit({
  id: true,
  signedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  generatedAt: true,
});

export const insertPortfolioItemSchema = createInsertSchema(artisanPortfolioItems).omit({
  id: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertUserAddressSchema = createInsertSchema(userAddresses).omit({ id: true });
export const insertEquipmentSchema = createInsertSchema(equipmentRegistry).omit({ id: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true });
export const insertDisputeSchema = createInsertSchema(disputes).omit({ id: true, createdAt: true });
export const insertDisputeMessageSchema = createInsertSchema(disputeMessages).omit({ id: true, createdAt: true });
export const insertEcoImpactSchema = createInsertSchema(ecoImpact).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ArtisanProfile = typeof artisanProfiles.$inferSelect;
export type InsertArtisanProfile = z.infer<typeof insertArtisanProfileSchema>;
export type Mission = typeof missions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type MissionQuote = typeof missionQuotes.$inferSelect;
export type InsertMissionQuote = z.infer<typeof insertMissionQuoteSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type Signature = typeof signatures.$inferSelect;
export type InsertSignature = z.infer<typeof insertSignatureSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type ArtisanPortfolioItem = typeof artisanPortfolioItems.$inferSelect;
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type UserAddress = typeof userAddresses.$inferSelect;
export type InsertUserAddress = z.infer<typeof insertUserAddressSchema>;
export type Equipment = typeof equipmentRegistry.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type DisputeMessage = typeof disputeMessages.$inferSelect;
export type InsertDisputeMessage = z.infer<typeof insertDisputeMessageSchema>;
export type EcoImpact = typeof ecoImpact.$inferSelect;
export type InsertEcoImpact = z.infer<typeof insertEcoImpactSchema>;
