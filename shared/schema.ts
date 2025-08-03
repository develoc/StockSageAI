import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  decimal,
  integer,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"),
  role: varchar("role").notNull().default("user"), // admin or user
  walletAddress: varchar("walletAddress"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Market data for historical analysis
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol").notNull(), // GOLD, SILVER, OIL, BTC
  timestamp: timestamp("timestamp").notNull(),
  open: decimal("open", { precision: 12, scale: 4 }).notNull(),
  high: decimal("high", { precision: 12, scale: 4 }).notNull(),
  low: decimal("low", { precision: 12, scale: 4 }).notNull(),
  close: decimal("close", { precision: 12, scale: 4 }).notNull(),
  volume: decimal("volume", { precision: 15, scale: 2 }).notNull(),
  timeframe: varchar("timeframe").notNull(), // 1D, 1W, 1M, 1H
  createdAt: timestamp("created_at").defaultNow(),
});

// AI-generated trading strategies
export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  symbols: jsonb("symbols").notNull(), // array of symbols
  status: varchar("status").notNull().default("active"), // active, testing, paused
  returnRate: decimal("return_rate", { precision: 8, scale: 4 }),
  riskLevel: varchar("risk_level").notNull(), // low, medium, high
  winRate: decimal("win_rate", { precision: 5, scale: 2 }),
  parameters: jsonb("parameters"), // strategy-specific parameters
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI insights and predictions
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol").notNull(),
  type: varchar("type").notNull(), // signal, alert, strategy_update
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  priority: varchar("priority").notNull().default("medium"), // high, medium, low
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Portfolio tracking
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull().default("Default Portfolio"),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).notNull().default("0"),
  allocation: jsonb("allocation"), // asset allocation percentages
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio positions
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id).notNull(),
  symbol: varchar("symbol").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 8 }).notNull(),
  avgPrice: decimal("avg_price", { precision: 12, scale: 4 }).notNull(),
  currentPrice: decimal("current_price", { precision: 12, scale: 4 }),
  unrealizedPnl: decimal("unrealized_pnl", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertMarketDataSchema = createInsertSchema(marketData, {
  open: z.coerce.number(),
  high: z.coerce.number(),
  low: z.coerce.number(),
  close: z.coerce.number(),
  volume: z.coerce.number(),
}).omit({
  id: true,
  createdAt: true,
});
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;
export type MarketData = typeof marketData.$inferSelect;

export const insertStrategySchema = createInsertSchema(strategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertStrategy = z.infer<typeof insertStrategySchema>;
export type Strategy = typeof strategies.$inferSelect;

export const insertAIInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});
export type InsertAIInsight = z.infer<typeof insertAIInsightSchema>;
export type AIInsight = typeof aiInsights.$inferSelect;

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positions.$inferSelect;