import { users, marketData, strategies, aiInsights, portfolios, positions, alerts, userSettings, } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
export class DatabaseStorage {
    /**
     * Test database connection
     */
    async testConnection() {
        try {
            // Simple query to check if the database is accessible
            await db.select({ count: users.id }).from(users).limit(1);
            return true;
        }
        catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
    // User operations
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }
    async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
    }
    async upsertUser(userData) {
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
    async getMarketData(symbol, timeframe, startDate, endDate) {
        let whereConditions = and(eq(marketData.symbol, symbol), eq(marketData.timeframe, timeframe));
        if (startDate && endDate) {
            whereConditions = and(eq(marketData.symbol, symbol), eq(marketData.timeframe, timeframe), gte(marketData.timestamp, startDate), lte(marketData.timestamp, endDate));
        }
        return await db
            .select()
            .from(marketData)
            .where(whereConditions)
            .orderBy(desc(marketData.timestamp));
    }
    async insertMarketData(data) {
        const [result] = await db
            .insert(marketData)
            .values(data)
            .returning();
        return result;
    }
    async getLatestPrice(symbol) {
        const [result] = await db
            .select()
            .from(marketData)
            .where(eq(marketData.symbol, symbol))
            .orderBy(desc(marketData.timestamp))
            .limit(1);
        return result;
    }
    // Strategy operations
    async getStrategies(userId) {
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
    async getStrategy(id) {
        const [strategy] = await db
            .select()
            .from(strategies)
            .where(eq(strategies.id, id));
        return strategy;
    }
    async createStrategy(strategy) {
        const [result] = await db
            .insert(strategies)
            .values(strategy)
            .returning();
        return result;
    }
    async updateStrategy(id, updates) {
        const [result] = await db
            .update(strategies)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(strategies.id, id))
            .returning();
        return result;
    }
    // AI insights operations
    async getAIInsights(symbol, limit = 10) {
        let query = db
            .select()
            .from(aiInsights)
            .orderBy(desc(aiInsights.createdAt))
            .limit(limit);
        if (symbol) {
            query = query.where(and(eq(aiInsights.symbol, symbol), eq(aiInsights.isActive, true)));
        }
        else {
            query = query.where(eq(aiInsights.isActive, true));
        }
        return await query;
    }
    async createAIInsight(insight) {
        const [result] = await db
            .insert(aiInsights)
            .values(insight)
            .returning();
        return result;
    }
    // Portfolio operations
    async getUserPortfolios(userId) {
        return await db
            .select()
            .from(portfolios)
            .where(eq(portfolios.userId, userId))
            .orderBy(desc(portfolios.createdAt));
    }
    async getPortfolio(id) {
        const [portfolio] = await db
            .select()
            .from(portfolios)
            .where(eq(portfolios.id, id));
        return portfolio;
    }
    async createPortfolio(portfolio) {
        const [result] = await db
            .insert(portfolios)
            .values(portfolio)
            .returning();
        return result;
    }
    async getPortfolioPositions(portfolioId) {
        return await db
            .select()
            .from(positions)
            .where(eq(positions.portfolioId, portfolioId))
            .orderBy(desc(positions.updatedAt));
    }
    async upsertPosition(position) {
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
    async getAllUsers() {
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
    async createUser(userData) {
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
        }
        catch (error) {
            console.error(`Failed to create user: ${error.message}`);
            console.error(error);
            throw error;
        }
    }
    async updateUserStatus(userId, isActive) {
        await db.update(users)
            .set({ isActive })
            .where(eq(users.id, userId));
    }
    // Alert operations
    async getUserAlerts(userId) {
        return await db
            .select()
            .from(alerts)
            .where(eq(alerts.userId, userId))
            .orderBy(desc(alerts.createdAt));
    }
    async createAlert(alert) {
        const [result] = await db
            .insert(alerts)
            .values(alert)
            .returning();
        return result;
    }
    async updateAlert(id, updates) {
        const [result] = await db
            .update(alerts)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(alerts.id, id))
            .returning();
        return result;
    }
    async deleteAlert(id) {
        await db
            .delete(alerts)
            .where(eq(alerts.id, id));
    }
    // User settings operations
    async getUserSettings(userId) {
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
    async createUserSettings(settings) {
        const [result] = await db
            .insert(userSettings)
            .values(settings)
            .returning();
        return result;
    }
    async updateUserSettings(userId, updates) {
        const [result] = await db
            .update(userSettings)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(userSettings.userId, userId))
            .returning();
        return result;
    }
    async updateUserSecurity(userId, data) {
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
        }
        catch (error) {
            console.error("Error updating security settings:", error);
            return { success: false, message: "Failed to update security settings" };
        }
    }
}
export const storage = new DatabaseStorage();
