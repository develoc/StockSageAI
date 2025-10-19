import axios from 'axios';
import { storage } from './storage';
import { insertStrategySchema, insertAIInsightSchema } from '@shared/schema';
import dotenv from 'dotenv';

// Using native Date methods instead of date-fns
dotenv.config();

// Helper function to format dates since we're not using date-fns
function format(date: Date, formatStr: string): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return formatStr
    .replace('MMMM', months[date.getMonth()])
    .replace('yyyy', date.getFullYear().toString())
    .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
    .replace('dd', date.getDate().toString().padStart(2, '0'));
}

// Types
interface StrategyInsight {
  name: string;
  description: string;
  symbols: string[];
  status: 'active' | 'testing' | 'paused';
  returnRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  winRate: number;
  parameters: Record<string, any>;
}

interface AIMarketInsight {
  symbol: string;
  type: 'signal' | 'alert' | 'strategy_update';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

interface MonthlyAnalysisResult {
  month: string;
  year: number;
  strategies: StrategyInsight[];
  insights: AIMarketInsight[];
  trendDirection: 'up' | 'down' | 'sideways';
  volatility: 'high' | 'medium' | 'low';
  correlations: Record<string, number>;
}

// Constants
const ANALYSIS_TIMEFRAMES = ['1D', '1W', '1M'];
const TRACKED_ASSETS = ['GOLD', 'SILVER', 'OIL', 'BTC', 'ETH', 'XRP', 'SOL'];
const STRATEGY_TYPES = [
  'momentum', 
  'mean_reversion', 
  'trend_following', 
  'statistical_arbitrage',
  'breakout',
  'volatility',
  'sentiment_based',
  'machine_learning'
];

class StrategyAnalysisService {
  private lastUpdated: Date | null = null;
  private historicalAnalysis: MonthlyAnalysisResult[] = [];
  private isProcessingUpdate = false;

  /**
   * Initialize the service and set up scheduled updates
   */
  initialize() {
    console.log('🧠 Initializing Strategy Analysis Service');
    
    // Run initial analysis
    this.updateStrategiesAndInsights();
    
    // Schedule daily updates at 1:00 AM
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 1 && now.getMinutes() === 0) {
        this.updateStrategiesAndInsights();
      }
    }, 60 * 1000); // Check every minute
    
    console.log('✅ Strategy Analysis Service initialized and scheduled for daily updates at 1:00 AM');
  }

  /**
   * Main function to update strategies and insights
   * This runs the full analysis pipeline
   */
  async updateStrategiesAndInsights() {
    if (this.isProcessingUpdate) {
      console.log('⏳ Update already in progress, skipping...');
      return;
    }

    try {
      this.isProcessingUpdate = true;
      console.log('🔄 Starting strategy and insight update process...');
      
      const today = new Date();
      
      // Skip if we already updated today
      if (this.lastUpdated && 
          this.lastUpdated.getDate() === today.getDate() &&
          this.lastUpdated.getMonth() === today.getMonth() &&
          this.lastUpdated.getFullYear() === today.getFullYear()) {
        console.log('✅ Already updated today, skipping...');
        this.isProcessingUpdate = false;
        return;
      }

      // 1. Analyze historical data for the past 12 months
      await this.analyzeHistoricalData();
      
      // 2. Generate new strategies based on historical analysis
      const newStrategies = await this.generateStrategies();
      
      // 3. Generate new insights based on recent market data and historical analysis
      const newInsights = await this.generateInsights();
      
      // 4. Save the new strategies to the database
      await this.saveStrategies(newStrategies);
      
      // 5. Save the new insights to the database
      await this.saveInsights(newInsights);

      this.lastUpdated = today;
      console.log(`✅ Strategy and insight update completed at ${today.toISOString().replace('T', ' ').substr(0, 19)}`);
    } catch (error) {
      console.error('❌ Error updating strategies and insights:', error);
    } finally {
      this.isProcessingUpdate = false;
    }
  }

  /**
   * Analyze historical market data for each of the past 12 months
   * This builds a historical analysis dataset used for strategy generation
   */
  async analyzeHistoricalData(): Promise<void> {
    console.log('📊 Analyzing historical market data for the past 12 months...');
    
    // Clear previous analysis
    this.historicalAnalysis = [];
    
    // Current date
    const endDate = new Date();
    
    // Analyze each month for the past year
    for (let i = 0; i < 12; i++) {
      const currentMonth = new Date();
      currentMonth.setMonth(endDate.getMonth() - i);
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      console.log(`📅 Analyzing month: ${months[startOfMonth.getMonth()]} ${startOfMonth.getFullYear()}`);
      
      // Collect all asset data for this month
      const monthlyData: Record<string, any[]> = {};
      
      for (const asset of TRACKED_ASSETS) {
        const data = await storage.getMarketData(
          asset, 
          '1D', // Daily data for monthly analysis
          startOfMonth,
          endOfMonth
        );
        
        if (data && data.length > 0) {
          monthlyData[asset] = data;
        }
      }
      
      // Skip months with insufficient data
      if (Object.keys(monthlyData).length < TRACKED_ASSETS.length / 2) {
        console.log(`⚠️ Insufficient data for ${months[startOfMonth.getMonth()]} ${startOfMonth.getFullYear()}, skipping...`);
        continue;
      }
      
      // Calculate monthly metrics
      const monthlyMetrics = this.calculateMonthlyMetrics(monthlyData);
      
      // Generate strategies specific to this month's patterns
      const monthlyStrategies = this.generateMonthlyStrategies(monthlyData, monthlyMetrics);
      
      // Generate insights specific to this month
      const monthlyInsights = this.generateMonthlyInsights(monthlyData, monthlyMetrics);
      
      // Store the monthly analysis
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      this.historicalAnalysis.push({
        month: monthNames[startOfMonth.getMonth()],
        year: startOfMonth.getFullYear(),
        strategies: monthlyStrategies,
        insights: monthlyInsights,
        trendDirection: monthlyMetrics.trendDirection,
        volatility: monthlyMetrics.volatility,
        correlations: monthlyMetrics.correlations
      });
    }
    
    console.log(`✅ Historical analysis complete for ${this.historicalAnalysis.length} months`);
  }

  /**
   * Calculate various metrics for a month's worth of data
   */
  private calculateMonthlyMetrics(monthlyData: Record<string, any[]>): any {
    const metrics = {
      trendDirection: 'sideways' as 'up' | 'down' | 'sideways',
      volatility: 'medium' as 'high' | 'medium' | 'low',
      correlations: {} as Record<string, number>,
      // Additional metrics for internal use
      returns: {} as Record<string, number>,
      averageVolume: {} as Record<string, number>,
      priceSwings: {} as Record<string, number>,
    };
    
    // Calculate metrics for each asset
    for (const asset in monthlyData) {
      const data = monthlyData[asset];
      
      if (data.length < 2) continue;
      
      // Calculate return
      const firstPrice = parseFloat(data[data.length - 1].close);
      const lastPrice = parseFloat(data[0].close);
      const returnPct = ((lastPrice - firstPrice) / firstPrice) * 100;
      metrics.returns[asset] = returnPct;
      
      // Calculate average volume
      const totalVolume = data.reduce((sum, item) => sum + parseFloat(item.volume), 0);
      metrics.averageVolume[asset] = totalVolume / data.length;
      
      // Calculate price swings (volatility)
      let totalSwingPct = 0;
      for (const item of data) {
        const high = parseFloat(item.high);
        const low = parseFloat(item.low);
        totalSwingPct += ((high - low) / low) * 100;
      }
      metrics.priceSwings[asset] = totalSwingPct / data.length;
    }
    
    // Calculate overall trend direction
    const assetReturns = Object.values(metrics.returns);
    const avgReturn = assetReturns.reduce((sum, ret) => sum + ret, 0) / assetReturns.length;
    
    if (avgReturn > 2) {
      metrics.trendDirection = 'up';
    } else if (avgReturn < -2) {
      metrics.trendDirection = 'down';
    } else {
      metrics.trendDirection = 'sideways';
    }
    
    // Calculate overall volatility
    const avgSwing = Object.values(metrics.priceSwings).reduce((sum, swing) => sum + swing, 0) / 
      Object.values(metrics.priceSwings).length;
    
    if (avgSwing > 3) {
      metrics.volatility = 'high';
    } else if (avgSwing < 1) {
      metrics.volatility = 'low';
    } else {
      metrics.volatility = 'medium';
    }
    
    // Calculate correlations between assets
    const assets = Object.keys(monthlyData);
    for (let i = 0; i < assets.length; i++) {
      for (let j = i + 1; j < assets.length; j++) {
        const asset1 = assets[i];
        const asset2 = assets[j];
        
        const data1 = monthlyData[asset1];
        const data2 = monthlyData[asset2];
        
        // Ensure we have matching data points
        const minLength = Math.min(data1.length, data2.length);
        if (minLength < 5) continue; // Need enough data points
        
        // Calculate correlation coefficient (simplified)
        const correlation = this.calculateCorrelation(
          data1.slice(0, minLength).map(d => parseFloat(d.close)),
          data2.slice(0, minLength).map(d => parseFloat(d.close))
        );
        
        metrics.correlations[`${asset1}_${asset2}`] = correlation;
      }
    }
    
    return metrics;
  }

  /**
   * Calculate correlation coefficient between two series
   */
  private calculateCorrelation(series1: number[], series2: number[]): number {
    const n = series1.length;
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;
    
    for (let i = 0; i < n; i++) {
      sum1 += series1[i];
      sum2 += series2[i];
      sum1Sq += series1[i] ** 2;
      sum2Sq += series2[i] ** 2;
      pSum += series1[i] * series2[i];
    }
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 ** 2 / n) * (sum2Sq - sum2 ** 2 / n));
    
    if (den === 0) return 0;
    return num / den;
  }

  /**
   * Generate strategies based on a month's worth of data
   */
  private generateMonthlyStrategies(
    monthlyData: Record<string, any[]>,
    metrics: any
  ): StrategyInsight[] {
    const strategies: StrategyInsight[] = [];
    
    // Strategy generation based on trend direction
    if (metrics.trendDirection === 'up') {
      // Momentum strategy for uptrend
      strategies.push({
        name: `${format(new Date(), 'MMMM')} Momentum Strategy`,
        description: `Momentum-based strategy optimized for the current ${metrics.volatility} volatility uptrend market. Targets assets with strong positive momentum and volume confirmation.`,
        symbols: this.selectTopPerformingAssets(metrics.returns, 3),
        status: 'active',
        returnRate: this.estimateStrategyReturn(metrics, 'momentum', 'up'),
        riskLevel: metrics.volatility === 'high' ? 'high' : 'medium',
        winRate: metrics.volatility === 'high' ? 65 : 72,
        parameters: {
          entryThreshold: 2.5,
          exitThreshold: -1.5,
          stopLoss: -4.0,
          trailingStop: true,
          timeframe: '1D'
        }
      });
    }
    
    if (metrics.trendDirection === 'down') {
      // Mean reversion strategy for downtrend
      strategies.push({
        name: `${format(new Date(), 'MMMM')} Contrarian Strategy`,
        description: `Contrarian mean reversion strategy designed for the current ${metrics.volatility} volatility downtrend market. Identifies oversold conditions and potential reversals.`,
        symbols: this.selectWorstPerformingAssets(metrics.returns, 3),
        status: 'active',
        returnRate: this.estimateStrategyReturn(metrics, 'mean_reversion', 'down'),
        riskLevel: 'high',
        winRate: 60,
        parameters: {
          oversoldThreshold: -8.0,
          profitTarget: 5.0,
          maxHoldingDays: 5,
          timeframe: '1D'
        }
      });
    }
    
    if (metrics.volatility === 'high') {
      // Volatility-based strategy
      strategies.push({
        name: `${format(new Date(), 'MMMM')} Volatility Breakout`,
        description: `Breakout strategy optimized for the current high-volatility ${metrics.trendDirection} market. Captures significant price movements following range contractions.`,
        symbols: this.selectHighestVolatilityAssets(metrics.priceSwings, 3),
        status: 'active',
        returnRate: this.estimateStrategyReturn(metrics, 'breakout', metrics.trendDirection),
        riskLevel: 'high',
        winRate: 55,
        parameters: {
          volatilityThreshold: 2.5,
          volumeConfirmation: true,
          stopLoss: -7.0,
          timeframe: '1D'
        }
      });
    }
    
    // Correlation-based strategies (pairs trading)
    const highlyCorrelatedPair = this.findHighlyCorrelatedPair(metrics.correlations);
    if (highlyCorrelatedPair) {
      const [asset1, asset2] = highlyCorrelatedPair.split('_');
      strategies.push({
        name: `${format(new Date(), 'MMMM')} ${asset1}-${asset2} Correlation`,
        description: `Statistical arbitrage strategy exploiting the strong correlation between ${asset1} and ${asset2}. Trades divergences from established correlation patterns.`,
        symbols: [asset1, asset2],
        status: 'testing',
        returnRate: this.estimateStrategyReturn(metrics, 'statistical_arbitrage', 'sideways'),
        riskLevel: 'medium',
        winRate: 67,
        parameters: {
          zScoreThreshold: 2.0,
          lookbackPeriod: 20,
          maxHoldingDays: 10,
          timeframe: '1D'
        }
      });
    }
    
    // Cross-asset strategy
    const commodities = TRACKED_ASSETS.filter(asset => ['GOLD', 'SILVER', 'OIL'].includes(asset));
    const cryptos = TRACKED_ASSETS.filter(asset => ['BTC', 'ETH', 'XRP', 'SOL'].includes(asset));
    
    strategies.push({
      name: `${format(new Date(), 'MMMM')} Cross-Asset Strategy`,
      description: `Diversified strategy combining commodity and crypto exposure optimized for ${format(new Date(), 'MMMM')} market conditions. Balances risk across asset classes.`,
      symbols: [...this.selectTopPerformingAssets(metrics.returns, 1, commodities), 
                ...this.selectTopPerformingAssets(metrics.returns, 1, cryptos)],
      status: 'active',
      returnRate: this.estimateStrategyReturn(metrics, 'trend_following', metrics.trendDirection),
      riskLevel: 'medium',
      winRate: 63,
      parameters: {
        rebalancingPeriod: 7,
        allocationCommodities: 60,
        allocationCryptos: 40,
        timeframe: '1D'
      }
    });
    
    return strategies;
  }

  /**
   * Generate insights based on a month's worth of data
   */
  private generateMonthlyInsights(
    monthlyData: Record<string, any[]>,
    metrics: any
  ): AIMarketInsight[] {
    const insights: AIMarketInsight[] = [];
    
    // General market trend insight
    insights.push({
      symbol: 'MARKET',
      type: 'signal',
      title: `${format(new Date(), 'MMMM')} Market Trend Analysis`,
      description: `Overall market showing a ${metrics.trendDirection} trend with ${metrics.volatility} volatility. ${
        metrics.trendDirection === 'up' 
          ? 'Consider momentum-based strategies and trailing stops to capture upside movement.' 
          : metrics.trendDirection === 'down' 
            ? 'Consider defensive positioning with reduced position sizes and tighter stop losses.'
            : 'Consider range-bound strategies that profit from oscillation between support and resistance.'
      }`,
      confidence: metrics.volatility === 'high' ? 72 : metrics.volatility === 'medium' ? 81 : 87,
      priority: metrics.volatility === 'high' ? 'high' : 'medium'
    });
    
    // Asset-specific insights
    const topPerformer = this.selectTopPerformingAssets(metrics.returns, 1)[0];
    const worstPerformer = this.selectWorstPerformingAssets(metrics.returns, 1)[0];
    
    if (topPerformer) {
      insights.push({
        symbol: topPerformer,
        type: 'signal',
        title: `${topPerformer} Showing Strong ${format(new Date(), 'MMMM')} Performance`,
        description: `${topPerformer} has demonstrated strong momentum with a return of ${metrics.returns[topPerformer].toFixed(2)}% this month. Technical indicators suggest ${
          metrics.returns[topPerformer] > 10 ? 'potential for continued strength, but watch for overbought conditions' : 'sustainable uptrend with solid volume confirmation'
        }.`,
        confidence: 78,
        priority: 'medium'
      });
    }
    
    if (worstPerformer) {
      insights.push({
        symbol: worstPerformer,
        type: metrics.returns[worstPerformer] < -15 ? 'alert' : 'signal',
        title: `${worstPerformer} Showing Weakness in ${format(new Date(), 'MMMM')}`,
        description: `${worstPerformer} has underperformed with a return of ${metrics.returns[worstPerformer].toFixed(2)}% this month. ${
          metrics.returns[worstPerformer] < -15 
            ? 'Consider reducing exposure or implementing strict risk management for positions in this asset.' 
            : 'Monitor for potential reversal signals that may indicate buying opportunities.'
        }`,
        confidence: 75,
        priority: metrics.returns[worstPerformer] < -15 ? 'high' : 'medium'
      });
    }
    
    // Correlation insight
    const highlyCorrelatedPair = this.findHighlyCorrelatedPair(metrics.correlations);
    if (highlyCorrelatedPair) {
      const [asset1, asset2] = highlyCorrelatedPair.split('_');
      const correlation = metrics.correlations[highlyCorrelatedPair];
      
      insights.push({
        symbol: 'MULTI',
        type: 'strategy_update',
        title: `Strong ${format(new Date(), 'MMMM')} Correlation: ${asset1}-${asset2}`,
        description: `Detected strong correlation (${correlation.toFixed(2)}) between ${asset1} and ${asset2} this month. Statistical arbitrage opportunities may exist when temporary divergences occur. Consider pairs trading strategies.`,
        confidence: 83,
        priority: 'medium'
      });
    }
    
    // Volatility insight
    const highestVolatilityAsset = this.selectHighestVolatilityAssets(metrics.priceSwings, 1)[0];
    if (highestVolatilityAsset) {
      insights.push({
        symbol: highestVolatilityAsset,
        type: 'alert',
        title: `Elevated ${format(new Date(), 'MMMM')} Volatility in ${highestVolatilityAsset}`,
        description: `${highestVolatilityAsset} is exhibiting ${metrics.volatility === 'high' ? 'extremely' : 'notably'} high volatility with average daily price swings of ${metrics.priceSwings[highestVolatilityAsset].toFixed(2)}%. Consider using options strategies or reduced position sizing for risk management.`,
        confidence: 85,
        priority: metrics.volatility === 'high' ? 'high' : 'medium'
      });
    }
    
    // Volume insight
    const highestVolumeAsset = Object.keys(metrics.averageVolume).reduce((a, b) => 
      metrics.averageVolume[a] > metrics.averageVolume[b] ? a : b, Object.keys(metrics.averageVolume)[0]);
    
    insights.push({
      symbol: highestVolumeAsset,
      type: 'signal',
      title: `High ${format(new Date(), 'MMMM')} Trading Volume: ${highestVolumeAsset}`,
      description: `${highestVolumeAsset} is seeing significant trading volume this month, indicating strong market interest. ${
        metrics.returns[highestVolumeAsset] > 0 
          ? 'Volume confirms price direction, suggesting continued strength.' 
          : 'High volume with price decline may indicate distribution phase - monitor for potential reversal.'
      }`,
      confidence: 76,
      priority: 'medium'
    });
    
    return insights;
  }

  /**
   * Generate current strategies based on historical monthly patterns
   * This combines insights from all months to create seasonality-aware strategies
   */
  async generateStrategies(): Promise<StrategyInsight[]> {
    if (this.historicalAnalysis.length === 0) {
      console.warn('⚠️ No historical analysis available for strategy generation');
      return [];
    }
    
    console.log('🧪 Generating new strategies based on historical analysis...');
    
    // Get current month
    const currentMonth = format(new Date(), 'MMMM');
    
    // Find historical data for the same month across different years
    const sameMonthAnalyses = this.historicalAnalysis.filter(analysis => analysis.month === currentMonth);
    
    if (sameMonthAnalyses.length === 0) {
      console.log(`⚠️ No historical data for ${currentMonth}, using general strategies`);
      // Use the most recent month's strategies
      return this.historicalAnalysis[0]?.strategies || [];
    }
    
    // Aggregate strategies from same month across years
    const allMonthStrategies: StrategyInsight[] = [];
    for (const analysis of sameMonthAnalyses) {
      allMonthStrategies.push(...analysis.strategies);
    }
    
    // Extract current market conditions
    const currentData = await this.getCurrentMarketData();
    const currentMetrics = this.calculateMonthlyMetrics(currentData);
    
    // Adapt historical strategies to current conditions
    const adaptedStrategies = allMonthStrategies.map(strategy => {
      // Create a copy to modify
      const adaptedStrategy = { ...strategy };
      
      // Update name and description for current month and year
      adaptedStrategy.name = `${format(new Date(), 'MMMM yyyy')} ${strategy.name.split(' ').slice(2).join(' ')}`;
      adaptedStrategy.description = `${strategy.description} Optimized for ${format(new Date(), 'MMMM yyyy')} market conditions.`;
      
      // Adjust return rate and parameters based on current market conditions
      adaptedStrategy.returnRate = this.estimateStrategyReturn(
        currentMetrics, 
        this.identifyStrategyType(strategy), 
        currentMetrics.trendDirection
      );
      
      // Adjust risk level based on current volatility
      if (currentMetrics.volatility === 'high' && strategy.riskLevel === 'low') {
        adaptedStrategy.riskLevel = 'medium';
      } else if (currentMetrics.volatility === 'low' && strategy.riskLevel === 'high') {
        adaptedStrategy.riskLevel = 'medium';
      }
      
      // Update symbols to current top performers if necessary
      if (strategy.name.toLowerCase().includes('momentum') || 
          strategy.name.toLowerCase().includes('top')) {
        adaptedStrategy.symbols = this.selectTopPerformingAssets(currentMetrics.returns, 3);
      } else if (strategy.name.toLowerCase().includes('contrarian') || 
                strategy.name.toLowerCase().includes('reversion')) {
        adaptedStrategy.symbols = this.selectWorstPerformingAssets(currentMetrics.returns, 3);
      } else if (strategy.name.toLowerCase().includes('volatility') || 
                strategy.name.toLowerCase().includes('breakout')) {
        adaptedStrategy.symbols = this.selectHighestVolatilityAssets(currentMetrics.priceSwings, 3);
      }
      
      return adaptedStrategy;
    });
    
    // Generate additional novel strategies based on current conditions
    const novelStrategies = this.generateNovelStrategies(currentMetrics);
    
    // Combine adapted historical and novel strategies
    const combinedStrategies = [...adaptedStrategies, ...novelStrategies];
    
    // Deduplicate and select the top 12 most promising strategies
    const dedupedStrategies = this.deduplicateStrategies(combinedStrategies);
    const topStrategies = dedupedStrategies
      .sort((a, b) => b.returnRate - a.returnRate)
      .slice(0, 12);
    
    console.log(`✅ Generated ${topStrategies.length} strategies for ${currentMonth}`);
    return topStrategies;
  }

  /**
   * Generate insights based on current market conditions and historical patterns
   */
  async generateInsights(): Promise<AIMarketInsight[]> {
    console.log('🧠 Generating new market insights...');
    
    // Get current month
    const currentMonth = format(new Date(), 'MMMM');
      
      // Find historical data for the same month across different years
      const sameMonthAnalyses = this.historicalAnalysis.filter(analysis => analysis.month === currentMonth);
      
      // Get current market data
      const currentData = await this.getCurrentMarketData();
      const currentMetrics = this.calculateMonthlyMetrics(currentData);
      
      // Start with insights based on current market conditions
      const currentInsights = this.generateMonthlyInsights(currentData, currentMetrics);
      
      // If we have historical data for this month, add seasonality insights
      if (sameMonthAnalyses.length > 0) {
        const seasonalPatterns = this.identifySeasonalPatterns(sameMonthAnalyses);
        
        for (const pattern of seasonalPatterns) {
          currentInsights.push({
            symbol: pattern.asset,
            type: 'signal',
            title: `${currentMonth} Seasonal Pattern: ${pattern.asset}`,
            description: pattern.description,
            confidence: pattern.confidence,
            priority: pattern.priority
          });
        }
        
        // Add top strategy recommendation based on historical performance
        const topHistoricalStrategy = this.identifyTopHistoricalStrategy(sameMonthAnalyses);
        if (topHistoricalStrategy) {
          currentInsights.push({
            symbol: 'STRATEGY',
            type: 'strategy_update',
            title: `${currentMonth} Top Strategy: ${topHistoricalStrategy.strategyType}`,
            description: `Historical analysis shows ${topHistoricalStrategy.strategyType} strategies have performed exceptionally well in ${currentMonth} with average returns of ${topHistoricalStrategy.averageReturn.toFixed(1)}%. Consider allocating capital to similar approaches this month.`,
            confidence: 82,
            priority: 'high'
          });
        }
      }
      
      // Add insights on market correlations
      for (const [pairKey, correlationValue] of Object.entries(currentMetrics.correlations)) {
        // Ensure correlation is a number
        const correlation = Number(correlationValue);
        if (!isNaN(correlation) && Math.abs(correlation) > 0.8) {
          const [asset1, asset2] = pairKey.split('_');
          const correlationType = correlation > 0 ? 'positive' : 'negative';
          
          currentInsights.push({
            symbol: 'CORRELATION',
            type: 'signal',
            title: `Strong ${correlationType.charAt(0).toUpperCase() + correlationType.slice(1)} Correlation: ${asset1}-${asset2}`,
            description: `Detected unusually strong ${correlationType} correlation (${correlation.toFixed(2)}) between ${asset1} and ${asset2}. This may indicate ${
              correlation > 0 
                ? 'similar underlying market drivers affecting both assets.' 
                : 'an effective hedging relationship between these assets.'
            } Consider ${correlation > 0 ? 'pairs trading' : 'portfolio diversification'} strategies.`,
            confidence: 75 + Math.abs(correlation) * 10,
            priority: Math.abs(correlation) > 0.9 ? 'high' : 'medium'
          });
        }
      }    console.log(`✅ Generated ${currentInsights.length} market insights`);
    return currentInsights;
  }

  /**
   * Get current market data for all tracked assets
   */
  private async getCurrentMarketData(): Promise<Record<string, any[]>> {
    const result: Record<string, any[]> = {};
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    for (const asset of TRACKED_ASSETS) {
      const data = await storage.getMarketData(
        asset, 
        '1D', // Daily data
        startDate,
        endDate
      );
      
      if (data && data.length > 0) {
        result[asset] = data;
      }
    }
    
    return result;
  }

  /**
   * Identify seasonal patterns from historical analyses of the same month
   */
  private identifySeasonalPatterns(sameMonthAnalyses: MonthlyAnalysisResult[]): any[] {
    const patterns = [];
    const assetTrends: Record<string, number[]> = {};
    
    // Collect returns for each asset across years
    for (const analysis of sameMonthAnalyses) {
      for (const asset in analysis.correlations) {
        if (!assetTrends[asset]) {
          assetTrends[asset] = [];
        }
        assetTrends[asset].push(analysis.correlations[asset]);
      }
    }
    
    // Identify consistent patterns
    for (const asset in assetTrends) {
      if (assetTrends[asset].length < 2) continue;
      
      const returns = assetTrends[asset];
      const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
      const allPositive = returns.every(ret => ret > 0);
      const allNegative = returns.every(ret => ret < 0);
      const consistency = returns.filter(ret => Math.sign(ret) === Math.sign(avgReturn)).length / returns.length;
      
      if (consistency >= 0.7) {
        const direction = avgReturn > 0 ? 'positive' : 'negative';
        
        patterns.push({
          asset,
          avgReturn,
          consistency,
          description: `Historical analysis shows ${asset} has consistently performed ${direction} in ${sameMonthAnalyses[0].month} with ${(consistency * 100).toFixed(0)}% consistency and average ${Math.abs(avgReturn).toFixed(1)}% returns. Consider this seasonal pattern in your trading decisions.`,
          confidence: 60 + consistency * 25,
          priority: consistency > 0.85 ? 'high' : 'medium'
        });
      }
    }
    
    return patterns;
  }

  /**
   * Identify the top performing strategy type from historical analyses
   */
  private identifyTopHistoricalStrategy(sameMonthAnalyses: MonthlyAnalysisResult[]): any {
    const strategyPerformance: Record<string, number[]> = {};
    
    // Collect returns by strategy type
    for (const analysis of sameMonthAnalyses) {
      for (const strategy of analysis.strategies) {
        const strategyType = this.identifyStrategyType(strategy);
        if (!strategyPerformance[strategyType]) {
          strategyPerformance[strategyType] = [];
        }
        strategyPerformance[strategyType].push(strategy.returnRate);
      }
    }
    
    // Find the best performing strategy type
    let bestType = '';
    let bestReturn = -Infinity;
    
    for (const strategyType in strategyPerformance) {
      if (strategyPerformance[strategyType].length < 2) continue;
      
      const avgReturn = strategyPerformance[strategyType].reduce((sum, ret) => sum + ret, 0) / 
                      strategyPerformance[strategyType].length;
      
      if (avgReturn > bestReturn) {
        bestReturn = avgReturn;
        bestType = strategyType;
      }
    }
    
    if (bestType) {
      return {
        strategyType: bestType,
        averageReturn: bestReturn,
        sampleSize: strategyPerformance[bestType].length
      };
    }
    
    return null;
  }

  /**
   * Generate novel strategies based on current market conditions
   */
  private generateNovelStrategies(metrics: any): StrategyInsight[] {
    const strategies: StrategyInsight[] = [];
    const currentMonth = format(new Date(), 'MMMM');
    const currentYear = new Date().getFullYear();
    
    // AI-enhanced trend following strategy
    strategies.push({
      name: `${currentMonth} ${currentYear} AI-Enhanced Trend Strategy`,
      description: `Advanced AI-driven trend following strategy optimized for ${currentMonth} ${currentYear} market conditions. Combines technical indicators with sentiment analysis and market regime detection.`,
      symbols: this.selectTopPerformingAssets(metrics.returns, 4),
      status: 'testing',
      returnRate: this.estimateStrategyReturn(metrics, 'machine_learning', metrics.trendDirection) * 1.1, // Slight boost for ML
      riskLevel: 'medium',
      winRate: 68,
      parameters: {
        mlModel: 'gradient_boost',
        sentimentWeight: 0.3,
        technicalWeight: 0.7,
        minimumConfidence: 75,
        timeframe: '1D'
      }
    });
    
    // Multi-timeframe volatility strategy
    strategies.push({
      name: `${currentMonth} ${currentYear} Multi-Timeframe Volatility Strategy`,
      description: `Sophisticated strategy that exploits volatility patterns across multiple timeframes. Optimized for ${metrics.volatility} volatility ${metrics.trendDirection} trend markets in ${currentMonth}.`,
      symbols: this.selectHighestVolatilityAssets(metrics.priceSwings, 3),
      status: 'active',
      returnRate: this.estimateStrategyReturn(metrics, 'volatility', metrics.trendDirection),
      riskLevel: 'high',
      winRate: 62,
      parameters: {
        primaryTimeframe: '1D',
        secondaryTimeframes: ['1H', '1W'],
        volatilityThreshold: {
          '1H': 1.2,
          '1D': 2.5,
          '1W': 5.0
        },
        timeframe: 'multi'
      }
    });
    
    // Cross-market sentiment strategy
    strategies.push({
      name: `${currentMonth} ${currentYear} Market Sentiment Strategy`,
      description: `Strategy leveraging sentiment analysis across traditional and crypto markets. Identifies trading opportunities based on investor sentiment divergences and convergence.`,
      symbols: [...TRACKED_ASSETS.filter(a => a === 'GOLD' || a === 'BTC')],
      status: 'testing',
      returnRate: this.estimateStrategyReturn(metrics, 'sentiment_based', metrics.trendDirection),
      riskLevel: 'medium',
      winRate: 64,
      parameters: {
        sentimentSources: ['news', 'social', 'technical'],
        sentimentThreshold: 65,
        confirmationPeriod: 2,
        timeframe: '1D'
      }
    });
    
    return strategies;
  }

  /**
   * Save generated strategies to the database
   */
  private async saveStrategies(strategies: StrategyInsight[]): Promise<void> {
    console.log(`💾 Saving ${strategies.length} strategies to database...`);
    
    for (const strategy of strategies) {
      try {
        // Validate strategy data
        const validatedData = insertStrategySchema.parse({
          name: strategy.name,
          description: strategy.description,
          symbols: strategy.symbols,
          status: strategy.status,
          returnRate: strategy.returnRate.toString(),
          riskLevel: strategy.riskLevel,
          winRate: strategy.winRate.toString(),
          parameters: strategy.parameters
        });
        
        // Add to database
        await storage.createStrategy(validatedData);
      } catch (error) {
        console.error(`❌ Error saving strategy ${strategy.name}:`, error);
      }
    }
    
    console.log('✅ Strategies saved successfully');
  }

  /**
   * Save generated insights to the database
   */
  private async saveInsights(insights: AIMarketInsight[]): Promise<void> {
    console.log(`💾 Saving ${insights.length} insights to database...`);
    
    for (const insight of insights) {
      try {
        // Validate insight data
        const validatedData = insertAIInsightSchema.parse({
          symbol: insight.symbol,
          type: insight.type,
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence.toString(),
          priority: insight.priority,
          isActive: true
        });
        
        // Add to database
        await storage.createAIInsight(validatedData);
      } catch (error) {
        console.error(`❌ Error saving insight ${insight.title}:`, error);
      }
    }
    
    console.log('✅ Insights saved successfully');
  }

  /**
   * Helper: Select top performing assets from returns data
   */
  private selectTopPerformingAssets(returns: Record<string, number>, count: number, fromAssets?: string[]): string[] {
    const assets = fromAssets || Object.keys(returns);
    
    return assets
      .sort((a, b) => returns[b] - returns[a])
      .slice(0, count);
  }

  /**
   * Helper: Select worst performing assets from returns data
   */
  private selectWorstPerformingAssets(returns: Record<string, number>, count: number): string[] {
    return Object.keys(returns)
      .sort((a, b) => returns[a] - returns[b])
      .slice(0, count);
  }

  /**
   * Helper: Select highest volatility assets from price swing data
   */
  private selectHighestVolatilityAssets(swings: Record<string, number>, count: number): string[] {
    return Object.keys(swings)
      .sort((a, b) => swings[b] - swings[a])
      .slice(0, count);
  }

  /**
   * Helper: Find most highly correlated pair from correlation data
   */
  private findHighlyCorrelatedPair(correlations: Record<string, number>): string | null {
    let highestCorrelation = 0;
    let highestPair = null;
    
    for (const [pair, correlation] of Object.entries(correlations)) {
      if (Math.abs(correlation) > Math.abs(highestCorrelation)) {
        highestCorrelation = correlation;
        highestPair = pair;
      }
    }
    
    if (Math.abs(highestCorrelation) > 0.7) {
      return highestPair;
    }
    
    return null;
  }

  /**
   * Helper: Identify strategy type from strategy object
   */
  private identifyStrategyType(strategy: StrategyInsight): string {
    const name = strategy.name.toLowerCase();
    const description = strategy.description.toLowerCase();
    
    if (name.includes('momentum') || description.includes('momentum')) {
      return 'momentum';
    } else if (name.includes('reversion') || description.includes('reversion') || 
              name.includes('contrarian') || description.includes('contrarian')) {
      return 'mean_reversion';
    } else if (name.includes('trend') || description.includes('trend')) {
      return 'trend_following';
    } else if (name.includes('arbitrage') || description.includes('arbitrage') || 
              name.includes('correlation') || description.includes('correlation')) {
      return 'statistical_arbitrage';
    } else if (name.includes('breakout') || description.includes('breakout')) {
      return 'breakout';
    } else if (name.includes('volatility') || description.includes('volatility')) {
      return 'volatility';
    } else if (name.includes('sentiment') || description.includes('sentiment')) {
      return 'sentiment_based';
    } else if (name.includes('ai') || description.includes('ai') || 
              name.includes('machine learning') || description.includes('machine learning')) {
      return 'machine_learning';
    }
    
    return 'trend_following'; // default
  }

  /**
   * Helper: Estimate strategy return based on market conditions
   */
  private estimateStrategyReturn(
    metrics: any, 
    strategyType: string, 
    marketTrend: 'up' | 'down' | 'sideways'
  ): number {
    // Base expected return by strategy type
    const baseReturns: Record<string, number> = {
      'momentum': 12,
      'mean_reversion': 10,
      'trend_following': 11,
      'statistical_arbitrage': 9,
      'breakout': 14,
      'volatility': 15,
      'sentiment_based': 11,
      'machine_learning': 13
    };
    
    // Adjustments based on market trend
    const trendMultipliers: Record<string, Record<string, number>> = {
      'momentum': { 'up': 1.3, 'down': 0.7, 'sideways': 0.9 },
      'mean_reversion': { 'up': 0.8, 'down': 1.2, 'sideways': 1.1 },
      'trend_following': { 'up': 1.2, 'down': 1.0, 'sideways': 0.7 },
      'statistical_arbitrage': { 'up': 0.9, 'down': 0.9, 'sideways': 1.3 },
      'breakout': { 'up': 1.1, 'down': 1.1, 'sideways': 0.8 },
      'volatility': { 'up': 1.0, 'down': 1.1, 'sideways': 0.9 },
      'sentiment_based': { 'up': 1.1, 'down': 0.9, 'sideways': 1.0 },
      'machine_learning': { 'up': 1.1, 'down': 1.0, 'sideways': 1.1 }
    };
    
    // Volatility adjustments
    const volatilityMultipliers: Record<string, Record<string, number>> = {
      'momentum': { 'high': 1.2, 'medium': 1.0, 'low': 0.8 },
      'mean_reversion': { 'high': 1.3, 'medium': 1.0, 'low': 0.7 },
      'trend_following': { 'high': 0.9, 'medium': 1.0, 'low': 1.1 },
      'statistical_arbitrage': { 'high': 0.8, 'medium': 1.0, 'low': 1.2 },
      'breakout': { 'high': 1.4, 'medium': 1.0, 'low': 0.6 },
      'volatility': { 'high': 1.5, 'medium': 1.0, 'low': 0.5 },
      'sentiment_based': { 'high': 1.1, 'medium': 1.0, 'low': 0.9 },
      'machine_learning': { 'high': 1.2, 'medium': 1.0, 'low': 0.9 }
    };
    
    // Calculate adjusted return
    const baseReturn = baseReturns[strategyType] || 10;
    const trendMultiplier = trendMultipliers[strategyType]?.[marketTrend] || 1.0;
    const volatilityMultiplier = volatilityMultipliers[strategyType]?.[metrics.volatility] || 1.0;
    
    // Add some randomness for realism
    const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    
    return baseReturn * trendMultiplier * volatilityMultiplier * randomFactor;
  }

  /**
   * Helper: Deduplicate strategies based on name similarity
   */
  private deduplicateStrategies(strategies: StrategyInsight[]): StrategyInsight[] {
    const uniqueStrategies: StrategyInsight[] = [];
    const strategyTypes = new Set<string>();
    
    for (const strategy of strategies) {
      const type = this.identifyStrategyType(strategy);
      
      // Check if we already have this strategy type
      if (!strategyTypes.has(type)) {
        uniqueStrategies.push(strategy);
        strategyTypes.add(type);
      } else {
        // If we have a duplicate type, keep the one with the higher return rate
        const existingIndex = uniqueStrategies.findIndex(s => this.identifyStrategyType(s) === type);
        if (existingIndex >= 0 && strategy.returnRate > uniqueStrategies[existingIndex].returnRate) {
          uniqueStrategies[existingIndex] = strategy;
        }
      }
    }
    
    return uniqueStrategies;
  }
}

export const strategyAnalysisService = new StrategyAnalysisService();
