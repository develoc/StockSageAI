import {
  users,
  marketData,
  strategies,
  aiInsights,
  portfolios,
  positions,
  alerts,
  userSettings,
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
  type Alert,
  type InsertAlert,
  type UserSettings,
  type InsertUserSettings,
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

export interface IStorage {
  // Add test connection method to the interface
  testConnection(): Promise<boolean>;
  
  // Existing methods
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getMarketData(symbol: string, timeframe: string, startDate?: Date, endDate?: Date): Promise<MarketData[]>;
  insertMarketData(data: InsertMarketData): Promise<MarketData>;
  getLatestPrice(symbol: string): Promise<MarketData | undefined>;
  getStrategies(userId?: string): Promise<Strategy[]>;
  getStrategy(id: number): Promise<Strategy | undefined>;
  createStrategy(strategy: InsertStrategy): Promise<Strategy>;
  updateStrategy(id: number, updates: Partial<InsertStrategy>): Promise<Strategy>;
  getAIInsights(symbol?: string, limit?: number): Promise<AIInsight[]>;
  createAIInsight(insight: InsertAIInsight): Promise<AIInsight>;
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
  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Simple query to check if the database is accessible
      await db.select({ count: users.id }).from(users).limit(1);
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
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
    const { v4: uuidv4 } = await import('uuid');
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    // Generate a unique UUID for the user ID
    const userId = uuidv4();
    
    console.log(`Creating user with ID: ${userId}`);

    try {
      const [user] = await db.insert(users).values({
        id: userId, // Explicitly set the user ID
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        passwordHash,
        walletAddress: userData.walletAddress || '',
        role: userData.role,
        isActive: true
      }).returning();

      console.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      console.error(`Failed to create user: ${error.message}`);
      console.error(error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    await db.update(users)
      .set({ isActive })
      .where(eq(users.id, userId));
  }

  // Alert operations
  async getUserAlerts(userId: string): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.createdAt));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [result] = await db
      .insert(alerts)
      .values(alert)
      .returning();
    return result;
  }

  async updateAlert(id: number, updates: Partial<Alert>): Promise<Alert> {
    const [result] = await db
      .update(alerts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(alerts.id, id))
      .returning();
    return result;
  }

  async deleteAlert(id: number): Promise<void> {
    await db
      .delete(alerts)
      .where(eq(alerts.id, id));
  }

  // User settings operations
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    
    if (!settings) {
      // Create default settings if none exist
      return this.createUserSettings({
        userId,
        theme: "dark",
        emailNotifications: true,
        pushNotifications: true,
        marketAlerts: true,
        weeklyReports: true,
        timezone: "UTC",
        defaultCurrency: "USD",
        riskLevel: "moderate",
        allowedSymbols: ["GOLD", "BTC", "OIL", "SILVER"]
      });
    }

    return settings;
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [result] = await db
      .insert(userSettings)
      .values(settings)
      .returning();
    return result;
  }

  async updateUserSettings(userId: string, updates: Partial<InsertUserSettings>): Promise<UserSettings> {
    const [result] = await db
      .update(userSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .returning();
    return result;
  }

  async updateUserSecurity(userId: string, data: {
    currentPassword?: string;
    newPassword?: string;
    twoFactorEnabled?: boolean;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        return { success: false, message: "User not found" };
      }

      if (data.currentPassword && data.newPassword) {
        const bcrypt = await import('bcryptjs');
        const isPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
        
        if (!isPasswordValid) {
          return { success: false, message: "Current password is incorrect" };
        }

        const newPasswordHash = await bcrypt.hash(data.newPassword, 10);
        await db.update(users)
          .set({ passwordHash: newPasswordHash })
          .where(eq(users.id, userId));
      }

      // Add two-factor authentication logic here if needed

      return { success: true, message: "Security settings updated successfully" };
    } catch (error) {
      console.error("Error updating security settings:", error);
      return { success: false, message: "Failed to update security settings" };
    }
  }
}

export const storage = new DatabaseStorage();