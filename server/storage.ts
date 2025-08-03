import {
  users,
  marketData,
  strategies,
  aiInsights,
  portfolios,
  positions,
  type User,
  type UpsertUser,
  type MarketData,
  type InsertMarketData,
  type Strategy,
  type InsertStrategy,
  type AIInsight,
  type InsertAIInsight,
  type Portfolio,
  type InsertPortfolio,
  type Position,
  type InsertPosition,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Market data operations
  getMarketData(symbol: string, timeframe: string, startDate?: Date, endDate?: Date): Promise<MarketData[]>;
  insertMarketData(data: InsertMarketData): Promise<MarketData>;
  getLatestPrice(symbol: string): Promise<MarketData | undefined>;

  // Strategy operations
  getStrategies(userId?: string): Promise<Strategy[]>;
  getStrategy(id: number): Promise<Strategy | undefined>;
  createStrategy(strategy: InsertStrategy): Promise<Strategy>;
  updateStrategy(id: number, updates: Partial<InsertStrategy>): Promise<Strategy>;

  // AI insights operations
  getAIInsights(symbol?: string, limit?: number): Promise<AIInsight[]>;
  createAIInsight(insight: InsertAIInsight): Promise<AIInsight>;

  // Portfolio operations
  getUserPortfolios(userId: string): Promise<Portfolio[]>;
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  getPortfolioPositions(portfolioId: number): Promise<Position[]>;
  upsertPosition(position: InsertPosition): Promise<Position>;

  getUserByEmail(email: string): Promise<User | undefined>;

  getAllUsers(): Promise<User[]>;

    createUser(userData: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        walletAddress?: string;
        role: string;
    }): Promise<User>;

    updateUserStatus(userId: string, isActive: boolean): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Market data operations
  async getMarketData(
    symbol: string,
    timeframe: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<MarketData[]> {
    let whereConditions = and(
      eq(marketData.symbol, symbol),
      eq(marketData.timeframe, timeframe)
    );

    if (startDate && endDate) {
      whereConditions = and(
        eq(marketData.symbol, symbol),
        eq(marketData.timeframe, timeframe),
        gte(marketData.timestamp, startDate),
        lte(marketData.timestamp, endDate)
      );
    }

    return await db
      .select()
      .from(marketData)
      .where(whereConditions)
      .orderBy(desc(marketData.timestamp));
  }

  async insertMarketData(data: InsertMarketData): Promise<MarketData> {
    const [result] = await db
      .insert(marketData)
      .values(data)
      .returning();
    return result;
  }

  async getLatestPrice(symbol: string): Promise<MarketData | undefined> {
    const [result] = await db
      .select()
      .from(marketData)
      .where(eq(marketData.symbol, symbol))
      .orderBy(desc(marketData.timestamp))
      .limit(1);
    return result;
  }

  // Strategy operations
  async getStrategies(userId?: string): Promise<Strategy[]> {
    if (userId) {
      return await db
        .select()
        .from(strategies)
        .where(eq(strategies.createdBy, userId))
        .orderBy(desc(strategies.createdAt));
    }
    return await db
      .select()
      .from(strategies)
      .orderBy(desc(strategies.createdAt));
  }

  async getStrategy(id: number): Promise<Strategy | undefined> {
    const [strategy] = await db
      .select()
      .from(strategies)
      .where(eq(strategies.id, id));
    return strategy;
  }

  async createStrategy(strategy: InsertStrategy): Promise<Strategy> {
    const [result] = await db
      .insert(strategies)
      .values(strategy)
      .returning();
    return result;
  }

  async updateStrategy(id: number, updates: Partial<InsertStrategy>): Promise<Strategy> {
    const [result] = await db
      .update(strategies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(strategies.id, id))
      .returning();
    return result;
  }

  // AI insights operations
  async getAIInsights(symbol?: string, limit = 10): Promise<AIInsight[]> {
    let query = db
      .select()
      .from(aiInsights)
      .orderBy(desc(aiInsights.createdAt))
      .limit(limit);

    if (symbol) {
      query = query.where(
        and(
          eq(aiInsights.symbol, symbol),
          eq(aiInsights.isActive, true)
        )
      );
    } else {
      query = query.where(eq(aiInsights.isActive, true));
    }

    return await query;
  }

  async createAIInsight(insight: InsertAIInsight): Promise<AIInsight> {
    const [result] = await db
      .insert(aiInsights)
      .values(insight)
      .returning();
    return result;
  }

  // Portfolio operations
  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    return await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .orderBy(desc(portfolios.createdAt));
  }

  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, id));
    return portfolio;
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [result] = await db
      .insert(portfolios)
      .values(portfolio)
      .returning();
    return result;
  }

  async getPortfolioPositions(portfolioId: number): Promise<Position[]> {
    return await db
      .select()
      .from(positions)
      .where(eq(positions.portfolioId, portfolioId))
      .orderBy(desc(positions.updatedAt));
  }

  async upsertPosition(position: InsertPosition): Promise<Position> {
    const [result] = await db
      .insert(positions)
      .values(position)
      .onConflictDoUpdate({
        target: [positions.portfolioId, positions.symbol],
        set: {
          quantity: position.quantity,
          avgPrice: position.avgPrice,
          currentPrice: position.currentPrice,
          unrealizedPnl: position.unrealizedPnl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        walletAddress: users.walletAddress,
        isActive: users.isActive
      })
      .from(users)
      .orderBy(users.createdAt);
  }

  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    walletAddress?: string;
    role: string;
  }): Promise<User> {
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const [user] = await db.insert(users).values({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      passwordHash,
      walletAddress: userData.walletAddress,
      role: userData.role,
      isActive: true
    }).returning();

    return user;
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    await db.update(users)
      .set({ isActive })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();