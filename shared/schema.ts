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
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  artisanProfile: one(artisanProfiles, {
    fields: [users.id],
    references: [artisanProfiles.userId],
  }),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  notifications: many(notifications),
}));

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
    zone: text("zone"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    rating: real("rating").default(0),
    completedMissions: integer("completed_missions").default(0),
    kycStatus: text("kyc_status").default("pending"),
    availability: boolean("availability").default(true),
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
    urgency: text("urgency").default("normal"),
    photos: text("photos").default("[]"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("missions_client_id_idx").on(table.clientId),
    index("missions_artisan_id_idx").on(table.artisanId),
    index("missions_status_idx").on(table.status),
  ]
);

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
}));

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
    amount: real("amount").notNull(),
    description: text("description"),
    estimatedDuration: text("estimated_duration"),
    status: text("status").default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("mission_quotes_mission_id_idx").on(table.missionId),
  ]
);

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
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("reviews_to_user_id_idx").on(table.toUserId),
    index("reviews_mission_id_idx").on(table.missionId),
  ]
);

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
    currency: text("currency").default("EUR"),
  },
  (table) => [index("wallets_user_id_idx").on(table.userId)]
);

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
}));

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

export const walletTransactionsRelations = relations(
  walletTransactions,
  ({ one }) => ({
    wallet: one(wallets, {
      fields: [walletTransactions.walletId],
      references: [wallets.id],
    }),
    mission: one(missions, {
      fields: [walletTransactions.missionId],
      references: [missions.id],
    }),
  })
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

export const signaturesRelations = relations(signatures, ({ one }) => ({
  mission: one(missions, {
    fields: [signatures.missionId],
    references: [missions.id],
  }),
}));

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

export const invoicesRelations = relations(invoices, ({ one }) => ({
  mission: one(missions, {
    fields: [invoices.missionId],
    references: [missions.id],
  }),
}));

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

export const artisanPortfolioItemsRelations = relations(
  artisanPortfolioItems,
  ({ one }) => ({
    artisan: one(artisanProfiles, {
      fields: [artisanPortfolioItems.artisanId],
      references: [artisanProfiles.id],
    }),
  })
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

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  mission: one(missions, {
    fields: [notifications.missionId],
    references: [missions.id],
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
