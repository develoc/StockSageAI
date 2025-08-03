import { db } from "./db";
import { marketData, strategies, aiInsights } from "@shared/schema";

// Generate realistic market data for the last 30 years
function generateMarketData() {
  const symbols = ['GOLD', 'SILVER', 'OIL', 'BTC'];
  const timeframes = ['1H', '1D', '1W', '1M'];
  const data: any[] = [];
  
  // Base prices for realistic scaling
  const basePrices = {
    GOLD: 1200,
    SILVER: 15,
    OIL: 60,
    BTC: 30000
  };

  // Generate data for each symbol and timeframe
  symbols.forEach(symbol => {
    timeframes.forEach(timeframe => {
      const basePrice = basePrices[symbol as keyof typeof basePrices];
      let currentPrice = basePrice;
      
      // Generate data points based on timeframe
      const dataPoints = timeframe === '1H' ? 8760 : // 1 year hourly
                        timeframe === '1D' ? 10950 : // 30 years daily  
                        timeframe === '1W' ? 1565 :  // 30 years weekly
                        360; // 30 years monthly
      
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 30);
      
      for (let i = 0; i < Math.min(dataPoints, 5000); i++) {
        const timestamp = new Date(startDate);
        
        // Adjust timestamp based on timeframe
        if (timeframe === '1H') {
          timestamp.setHours(timestamp.getHours() + i);
        } else if (timeframe === '1D') {
          timestamp.setDate(timestamp.getDate() + i);
        } else if (timeframe === '1W') {
          timestamp.setDate(timestamp.getDate() + (i * 7));
        } else {
          timestamp.setMonth(timestamp.getMonth() + i);
        }
        
        // Generate realistic price movements
        const volatility = symbol === 'BTC' ? 0.05 : 
                          symbol === 'OIL' ? 0.03 : 
                          0.02;
        
        const change = (Math.random() - 0.5) * volatility;
        const trend = Math.sin(i / 100) * 0.001; // Long-term trend
        
        currentPrice *= (1 + change + trend);
        
        const open = currentPrice * (0.995 + Math.random() * 0.01);
        const close = currentPrice * (0.995 + Math.random() * 0.01);
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (0.99 + Math.random() * 0.01);
        const volume = Math.random() * 1000000 + 100000;
        
        data.push({
          symbol,
          timestamp,
          open: open.toFixed(4),
          high: high.toFixed(4),
          low: low.toFixed(4),
          close: close.toFixed(4),
          volume: volume.toFixed(2),
          timeframe
        });
      }
    });
  });
  
  return data;
}

// High-performance trading strategies
const tradingStrategies = [
  {
    name: "Quantum Momentum Alpha",
    description: "Advanced momentum strategy using quantum algorithms to identify multi-timeframe trends across precious metals and energy markets. Combines RSI, MACD, and proprietary volatility indicators.",
    symbols: ["GOLD", "SILVER"],
    status: "active",
    returnRate: "34.7",
    riskLevel: "medium",
    winRate: "73.2",
    parameters: {
      rsiPeriod: 14,
      macdFast: 12,
      macdSlow: 26,
      stopLoss: 0.02,
      takeProfit: 0.06,
      maxPositionSize: 0.25,
      riskPerTrade: 0.015
    }
  },
  {
    name: "Energy Futures Arbitrage",
    description: "Statistical arbitrage strategy exploiting price inefficiencies between WTI crude oil futures and energy ETFs. Uses machine learning to predict mean reversion patterns.",
    symbols: ["OIL"],
    status: "active", 
    returnRate: "28.3",
    riskLevel: "high",
    winRate: "68.9",
    parameters: {
      lookbackPeriod: 20,
      zScoreThreshold: 2.0,
      correlationWindow: 60,
      maxHoldingPeriod: 5,
      leverageRatio: 2.5
    }
  },
  {
    name: "Digital Asset Trend Follower",
    description: "Cryptocurrency momentum strategy designed for Bitcoin and major altcoins. Utilizes Bollinger Bands, volume analysis, and sentiment indicators from social media.",
    symbols: ["BTC"],
    status: "active",
    returnRate: "127.4",
    riskLevel: "high", 
    winRate: "61.7",
    parameters: {
      bollingerPeriod: 20,
      bollingerStdDev: 2,
      volumeMultiplier: 1.5,
      sentimentWeight: 0.3,
      maxDrawdown: 0.15,
      positionSizing: "kelly"
    }
  },
  {
    name: "Multi-Asset Mean Reversion",
    description: "Sophisticated mean reversion strategy operating across gold, silver, oil, and crypto. Uses cointegration analysis and pairs trading principles for market-neutral returns.",
    symbols: ["GOLD", "SILVER", "OIL", "BTC"],
    status: "testing",
    returnRate: "19.6", 
    riskLevel: "low",
    winRate: "78.4",
    parameters: {
      cointegrationWindow: 252,
      entryThreshold: 1.5,
      exitThreshold: 0.5,
      halfLife: 12,
      hedgeRatio: "dynamic"
    }
  },
  {
    name: "Volatility Breakout Pro",
    description: "Advanced volatility-based breakout strategy that captures explosive moves in precious metals during high-impact economic events. Features dynamic position sizing.",
    symbols: ["GOLD", "SILVER"],
    status: "active",
    returnRate: "41.2",
    riskLevel: "medium",
    winRate: "69.8",
    parameters: {
      atrPeriod: 14,
      breakoutMultiplier: 2.0,
      volatilityFilter: 0.8,
      timeFilter: "economic_events",
      scalingFactor: 1.8
    }
  },
  {
    name: "AI Sentiment Fusion",
    description: "Next-generation strategy combining technical analysis with AI-powered sentiment analysis from news, social media, and market data. Adaptive algorithms optimize parameters in real-time.",
    symbols: ["GOLD", "OIL", "BTC"],
    status: "active",
    returnRate: "52.8",
    riskLevel: "medium",
    winRate: "74.1", 
    parameters: {
      sentimentSources: ["news", "twitter", "reddit"],
      technicalWeight: 0.6,
      sentimentWeight: 0.4,
      adaptationRate: 0.1,
      ensembleModels: 5
    }
  }
];

// AI-generated market insights
const aiInsightData = [
  {
    symbol: "GOLD",
    type: "signal",
    title: "Strong Bullish Momentum Detected",
    description: "AI algorithms have identified a sustained uptrend in gold prices with 89% confidence. Technical indicators suggest continued strength with potential targets at $2,150-2,200 over the next 2-3 weeks.",
    confidence: "89.3",
    priority: "high"
  },
  {
    symbol: "BTC", 
    type: "alert",
    title: "Volatility Spike Warning",
    description: "Cryptocurrency markets showing increased volatility patterns. Recommend reducing position sizes by 25% and implementing tighter stop-losses. Expected duration: 5-7 trading days.",
    confidence: "76.8",
    priority: "medium"
  },
  {
    symbol: "OIL",
    type: "strategy_update",
    title: "Energy Sector Rotation Opportunity", 
    description: "Geopolitical tensions and supply constraints creating favorable conditions for energy investments. Our Energy Futures Arbitrage strategy has been adjusted to capture these opportunities.",
    confidence: "82.1",
    priority: "high"
  },
  {
    symbol: "SILVER",
    type: "signal",
    title: "Industrial Demand Surge Prediction",
    description: "Machine learning models predict increased industrial silver demand driven by renewable energy sector growth. Long-term bullish outlook with 12-18 month horizon.",
    confidence: "71.4",
    priority: "medium"
  },
  {
    symbol: "GOLD",
    type: "alert", 
    title: "Federal Reserve Policy Impact",
    description: "Upcoming Federal Reserve announcements likely to impact precious metals. Our models suggest 68% probability of dovish stance, favorable for gold investments.",
    confidence: "67.9",
    priority: "medium"
  },
  {
    symbol: "BTC",
    type: "signal",
    title: "Institutional Accumulation Pattern",
    description: "On-chain analysis reveals large wallet accumulation patterns similar to previous bull market phases. Current setup suggests potential for significant upward movement.",
    confidence: "84.7", 
    priority: "high"
  }
];

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database with market data...");
    
    // Generate and insert market data
    const marketDataPoints = generateMarketData();
    console.log(`Generated ${marketDataPoints.length} market data points`);
    
    // Insert in batches to avoid timeout
    const batchSize = 1000;
    for (let i = 0; i < marketDataPoints.length; i += batchSize) {
      const batch = marketDataPoints.slice(i, i + batchSize);
      await db.insert(marketData).values(batch).onConflictDoNothing();
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(marketDataPoints.length/batchSize)}`);
    }

    // Insert trading strategies
    console.log("📈 Adding trading strategies...");
    for (const strategy of tradingStrategies) {
      await db.insert(strategies).values(strategy).onConflictDoNothing();
    }

    // Insert AI insights
    console.log("🤖 Adding AI insights...");
    for (const insight of aiInsightData) {
      await db.insert(aiInsights).values(insight).onConflictDoNothing();
    }

    console.log("✅ Database seeding completed successfully!");
    
    return {
      marketDataPoints: marketDataPoints.length,
      strategies: tradingStrategies.length,
      insights: aiInsightData.length
    };
    
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  }
}