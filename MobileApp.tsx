import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface Strategy {
  id: string;
  name: string;
  returnRate: string;
  riskLevel: string;
  winRate: string;
  status: 'active' | 'testing' | 'paused';
}

interface AIInsight {
  id: string;
  symbol: string;
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

const QuantumTradeApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState({ name: 'Trader', portfolio: 125680 });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    // Simulated data - replace with actual API calls
    setMarketData([
      { symbol: 'GOLD', price: 2156.80, change: 28.40, changePercent: 1.34 },
      { symbol: 'SILVER', price: 24.89, change: -0.23, changePercent: -0.91 },
      { symbol: 'OIL', price: 78.45, change: 2.15, changePercent: 2.82 },
      { symbol: 'BTC', price: 67420.00, change: 1840.50, changePercent: 2.81 },
    ]);

    setStrategies([
      {
        id: '1',
        name: 'Quantum Momentum Alpha',
        returnRate: '34.7',
        riskLevel: 'Medium',
        winRate: '73.2',
        status: 'active',
      },
      {
        id: '2',
        name: 'Energy Futures Arbitrage',
        returnRate: '28.3',
        riskLevel: 'High',
        winRate: '68.9',
        status: 'active',
      },
      {
        id: '3',
        name: 'Digital Asset Trend',
        returnRate: '127.4',
        riskLevel: 'High',
        winRate: '61.7',
        status: 'testing',
      },
    ]);

    setInsights([
      {
        id: '1',
        symbol: 'GOLD',
        title: 'Strong Bullish Momentum',
        description: 'AI algorithms detect sustained uptrend with 89% confidence',
        confidence: 89,
        priority: 'high',
      },
      {
        id: '2',
        symbol: 'BTC',
        title: 'Volatility Spike Warning',
        description: 'Recommend reducing position sizes by 25%',
        confidence: 76,
        priority: 'medium',
      },
    ]);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadInitialData();
      setIsRefreshing(false);
    }, 1000);
  };

  const chartConfig = {
    backgroundColor: '#161B22',
    backgroundGradientFrom: '#161B22',
    backgroundGradientTo: '#0D1117',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 217, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#00D9FF',
    },
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [45, 52, 48, 61, 58, 67],
        color: (opacity = 1) => `rgba(0, 217, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const renderDashboard = () => (
    <ScrollView
      style={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      {/* Portfolio Overview */}
      <View style={styles.portfolioCard}>
        <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
        <Text style={styles.portfolioValue}>${user.portfolio.toLocaleString()}</Text>
        <Text style={styles.portfolioChange}>+12.5% Today</Text>
      </View>

      {/* Market Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Market Overview</Text>
        {marketData.map((item) => (
          <View key={item.symbol} style={styles.marketCard}>
            <View style={styles.marketInfo}>
              <Text style={styles.marketSymbol}>{item.symbol}</Text>
              <Text style={styles.marketPrice}>${item.price.toLocaleString()}</Text>
            </View>
            <View style={styles.marketChange}>
              <Text
                style={[
                  styles.changeText,
                  { color: item.change >= 0 ? '#00FF88' : '#FF4757' },
                ]}
              >
                {item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.changePercent,
                  { color: item.change >= 0 ? '#00FF88' : '#FF4757' },
                ]}
              >
                ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Performance Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portfolio Performance</Text>
        <LineChart
          data={chartData}
          width={width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );

  const renderStrategies = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>AI Trading Strategies</Text>
      {strategies.map((strategy) => (
        <TouchableOpacity
          key={strategy.id}
          style={styles.strategyCard}
          onPress={() => Alert.alert('Strategy Details', `${strategy.name}\n\nReturn Rate: ${strategy.returnRate}%\nRisk Level: ${strategy.riskLevel}\nWin Rate: ${strategy.winRate}%\n\nImplementation:\n• Monitor RSI levels and MACD indicators\n• Use 2% stop-loss and 6% take-profit\n• Maximum 25% portfolio allocation\n• Trade during high liquidity hours`)}
        >
          <View style={styles.strategyHeader}>
            <Text style={styles.strategyName}>{strategy.name}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: strategy.status === 'active' ? '#00FF88' : '#FFA726' },
              ]}
            >
              <Text style={styles.statusText}>{strategy.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.strategyMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Return</Text>
              <Text style={styles.metricValue}>{strategy.returnRate}%</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Risk</Text>
              <Text style={styles.metricValue}>{strategy.riskLevel}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Win Rate</Text>
              <Text style={styles.metricValue}>{strategy.winRate}%</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Profit Calculator */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Profit Calculator</Text>
        <View style={styles.calculatorCard}>
          <Text style={styles.calculatorTitle}>Quantum Momentum Alpha</Text>
          <Text style={styles.calculatorSubtitle}>Conservative Scenario</Text>
          <View style={styles.calculatorRow}>
            <Text style={styles.calculatorLabel}>Capital: $10,000</Text>
            <Text style={styles.calculatorLabel}>Timeframe: 3 months</Text>
          </View>
          <Text style={styles.calculatorProfit}>Expected Profit: $2,890</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderInsights = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>AI Market Insights</Text>
      {insights.map((insight) => (
        <TouchableOpacity
          key={insight.id}
          style={styles.insightCard}
          onPress={() => Alert.alert('AI Insight Details', `${insight.title}\n\n${insight.description}\n\nConfidence: ${insight.confidence}%\nSymbol: ${insight.symbol}\nPriority: ${insight.priority.toUpperCase()}`)}
        >
          <View style={styles.insightHeader}>
            <Text style={styles.insightSymbol}>{insight.symbol}</Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: insight.priority === 'high' ? '#FF4757' : '#FFA726' },
              ]}
            >
              <Text style={styles.priorityText}>{insight.priority.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightDescription}>{insight.description}</Text>
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence: {insight.confidence}%</Text>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  { width: `${insight.confidence}%` },
                ]}
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* AI Processing Status */}
      <View style={styles.processingCard}>
        <Text style={styles.processingTitle}>AI Engine Status</Text>
        <Text style={styles.processingStatus}>Processing market patterns...</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>
    </ScrollView>
  );

  const renderProfile = () => (
    <ScrollView style={styles.content}>
      <View style={styles.profileCard}>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileRole}>Premium Trader</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => Alert.alert('Feature Coming Soon', 'Authentication and settings will be available in the next update.')}
        >
          <Text style={styles.profileButtonText}>Account Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trading Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>73.2%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$45,280</Text>
            <Text style={styles.statLabel}>Total Profit</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>124</Text>
            <Text style={styles.statLabel}>Trades</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2.34</Text>
            <Text style={styles.statLabel}>Sharpe Ratio</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QuantumTrade AI</Text>
        <Text style={styles.headerSubtitle}>Advanced Trading Platform</Text>
      </View>

      {/* Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'strategies' && renderStrategies()}
      {activeTab === 'insights' && renderInsights()}
      {activeTab === 'profile' && renderProfile()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { key: 'dashboard', label: 'Dashboard', icon: '📊' },
          { key: 'strategies', label: 'Strategies', icon: '📈' },
          { key: 'insights', label: 'AI Insights', icon: '🤖' },
          { key: 'profile', label: 'Profile', icon: '👤' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    backgroundColor: '#161B22',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#30363D',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F0F6FC',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8B949E',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  portfolioCard: {
    backgroundColor: '#161B22',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  portfolioLabel: {
    fontSize: 14,
    color: '#8B949E',
    marginBottom: 8,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F0F6FC',
    marginBottom: 4,
  },
  portfolioChange: {
    fontSize: 16,
    color: '#00FF88',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F0F6FC',
    marginBottom: 16,
  },
  marketCard: {
    backgroundColor: '#161B22',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  marketInfo: {
    flex: 1,
  },
  marketSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F0F6FC',
    marginBottom: 4,
  },
  marketPrice: {
    fontSize: 14,
    color: '#8B949E',
  },
  marketChange: {
    alignItems: 'flex-end',
  },
  changeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  changePercent: {
    fontSize: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  strategyCard: {
    backgroundColor: '#161B22',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  strategyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F0F6FC',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0D1117',
  },
  strategyMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#8B949E',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00D9FF',
  },
  calculatorCard: {
    backgroundColor: '#161B22',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F0F6FC',
    marginBottom: 4,
  },
  calculatorSubtitle: {
    fontSize: 12,
    color: '#8B949E',
    marginBottom: 12,
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculatorLabel: {
    fontSize: 12,
    color: '#8B949E',
  },
  calculatorProfit: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FF88',
    textAlign: 'center',
    marginTop: 8,
  },
  insightCard: {
    backgroundColor: '#161B22',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00D9FF',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0D1117',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F0F6FC',
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#8B949E',
    marginBottom: 12,
    lineHeight: 20,
  },
  confidenceContainer: {
    marginTop: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#8B949E',
    marginBottom: 4,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#30363D',
    borderRadius: 2,
  },
  confidenceFill: {
    height: 4,
    backgroundColor: '#00D9FF',
    borderRadius: 2,
  },
  processingCard: {
    backgroundColor: '#161B22',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    marginTop: 8,
  },
  processingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F0F6FC',
    marginBottom: 4,
  },
  processingStatus: {
    fontSize: 12,
    color: '#8B949E',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#30363D',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#00D9FF',
    borderRadius: 2,
    width: '73%',
  },
  profileCard: {
    backgroundColor: '#161B22',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F0F6FC',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#00D9FF',
    marginBottom: 20,
  },
  profileButton: {
    backgroundColor: '#00D9FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  profileButtonText: {
    color: '#0D1117',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#161B22',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B949E',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#161B22',
    borderTopWidth: 1,
    borderTopColor: '#30363D',
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: '#8B949E',
  },
  activeTabLabel: {
    color: '#00D9FF',
    fontWeight: 'bold',
  },
});

export default QuantumTradeApp;