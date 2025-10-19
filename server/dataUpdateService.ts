import { storage } from './storage';
import { insertMarketDataSchema } from '../shared/schema';

interface MarketDataPoint {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
  timeframe: string;
}

class DataUpdateService {
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly symbols = ['GOLD', 'BTC', 'OIL', 'SILVER'];

  start() {
    // Initial update
    this.updateAllMarketData();

    // Update every 5 minutes
    this.updateInterval = setInterval(() => {
      this.updateAllMarketData();
    }, 5 * 60 * 1000);

    console.log('📊 Data update service started - updating every 5 minutes');
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('📊 Data update service stopped');
    }
  }

  private async updateAllMarketData() {
    const now = new Date();
    console.log(`📊 Updating market data at ${now.toISOString()}`);

    for (const symbol of this.symbols) {
      try {
        await this.updateSymbolData(symbol, now);
      } catch (error) {
        console.error(`❌ Error updating ${symbol}:`, error);
      }
    }
  }

  private async updateSymbolData(symbol: string, timestamp: Date) {
    // Generate realistic price data based on symbol
    const basePrice = this.getBasePrice(symbol);
    const volatility = this.getVolatility(symbol);

    // Get previous price to ensure continuity
    const previousData = await this.getPreviousPrice(symbol);
    const prevPrice = previousData?.close ? Number(previousData.close) : basePrice;

    // Generate new price with random walk
    const change = (Math.random() - 0.5) * volatility * prevPrice;
    const newPrice = Math.max(prevPrice + change, prevPrice * 0.95); // Prevent extreme drops

    const high = newPrice * (1 + Math.random() * 0.02);
    const low = newPrice * (1 - Math.random() * 0.02);
    const open = prevPrice;
    const volume = Math.floor(Math.random() * 1000000) + 100000;

    const marketData = {
      symbol,
      timestamp: new Date(),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(newPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000,
      timeframe: '5m'
    };

    // Validate and insert
    const validatedData = insertMarketDataSchema.parse(marketData);
    await storage.insertMarketData(validatedData);

    console.log(`✅ Updated ${symbol}: $${newPrice.toFixed(2)} (${change >= 0 ? '+' : ''}${((change/prevPrice) * 100).toFixed(2)}%)`);
  }

  private getBasePrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      'GOLD': 2080.00,
      'BTC': 43500.00,
      'OIL': 76.50,
      'SILVER': 25.40
    };
    return basePrices[symbol] || 100;
  }

  private getVolatility(symbol: string): number {
    const volatilities: Record<string, number> = {
      'GOLD': 0.015,   // 1.5% volatility
      'BTC': 0.03,     // 3% volatility
      'OIL': 0.025,    // 2.5% volatility
      'SILVER': 0.02   // 2% volatility
    };
    return volatilities[symbol] || 0.02;
  }

  private async getPreviousPrice(symbol: string): Promise<MarketDataPoint | null> {
    try {
      const data = await storage.getLatestPrice(symbol);
      return data;
    } catch (error) {
      return null;
    }
  }

  // Generate historical data for the current day
  async generateTodaysData() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    console.log(`📈 Generating today's historical data starting from ${startOfDay.toISOString()}`);

    for (const symbol of this.symbols) {
      let currentTime = new Date(startOfDay);
      let currentPrice = this.getBasePrice(symbol);

      // Generate data points every 5 minutes for the current day up to now
      while (currentTime <= today) {
        const volatility = this.getVolatility(symbol);
        const change = (Math.random() - 0.5) * volatility * currentPrice;
        currentPrice = Math.max(currentPrice + change, currentPrice * 0.95);

        const high = currentPrice * (1 + Math.random() * 0.01);
        const low = currentPrice * (1 - Math.random() * 0.01);
        const volume = Math.floor(Math.random() * 500000) + 50000;

        const marketData = {
          symbol,
          open: Number((currentPrice - change).toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(currentPrice.toFixed(2)),
          volume,
          timestamp: new Date(currentTime),
          timeframe: '5M'
        };

        try {
          const validatedData = insertMarketDataSchema.parse(marketData);
          await storage.insertMarketData(validatedData);
        } catch (error) {
          // Skip duplicate entries
          if (!error.message?.includes('duplicate')) {
            console.error(`Error inserting data for ${symbol}:`, error);
          }
        }

        // Move to next 5-minute interval
        currentTime.setMinutes(currentTime.getMinutes() + 5);
      }

      console.log(`✅ Generated today's data for ${symbol}`);
    }
  }
}

export const dataUpdateService = new DataUpdateService();