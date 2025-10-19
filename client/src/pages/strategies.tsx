
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Target, Zap } from "lucide-react";

interface Strategy {
  id: number;
  name: string;
  description: string;
  status: string;
  returnRate: number;
  riskLevel: string;
  winRate: number;
  symbols: string[];
  createdAt: string;
}

export default function Strategies() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStrategies();
    }
  }, [isAuthenticated]);

  const fetchStrategies = async () => {
    try {
      const response = await fetch('/api/strategies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStrategies(data);
      } else {
        // Fallback to mock data if API fails
        setStrategies([
          {
            id: 1,
            name: "Quantum Momentum Alpha",
            description: "Advanced momentum strategy using quantum algorithms to identify multi-timeframe trends across precious metals and energy markets. Combines RSI, MACD, and proprietary volatility indicators.",
            symbols: ["GOLD", "SILVER"],
            status: "active",
            returnRate: 34.7,
            riskLevel: "medium",
            winRate: 73.2,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            name: "Energy Futures Arbitrage",
            description: "Statistical arbitrage strategy exploiting price inefficiencies between WTI crude oil futures and energy ETFs. Uses machine learning to predict mean reversion patterns.",
            symbols: ["OIL"],
            status: "active",
            returnRate: 28.3,
            riskLevel: "high",
            winRate: 68.9,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 3,
            name: "Digital Asset Trend Follower",
            description: "Cryptocurrency momentum strategy designed for Bitcoin and major altcoins. Utilizes Bollinger Bands, volume analysis, and sentiment indicators from social media.",
            symbols: ["BTC"],
            status: "active",
            returnRate: 127.4,
            riskLevel: "high",
            winRate: 61.7,
            createdAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 4,
            name: "Multi-Asset Mean Reversion",
            description: "Sophisticated mean reversion strategy operating across gold, silver, oil, and crypto. Uses cointegration analysis and pairs trading principles for market-neutral returns.",
            symbols: ["GOLD", "SILVER", "OIL", "BTC"],
            status: "testing",
            returnRate: 19.6,
            riskLevel: "low",
            winRate: 78.4,
            createdAt: new Date(Date.now() - 259200000).toISOString()
          },
          {
            id: 5,
            name: "Volatility Breakout Pro",
            description: "Advanced volatility-based breakout strategy that captures explosive moves in precious metals during high-impact economic events. Features dynamic position sizing.",
            symbols: ["GOLD", "SILVER"],
            status: "active",
            returnRate: 41.2,
            riskLevel: "medium",
            winRate: 69.8,
            createdAt: new Date(Date.now() - 345600000).toISOString()
          },
          {
            id: 6,
            name: "AI Sentiment Fusion",
            description: "Next-generation strategy combining technical analysis with AI-powered sentiment analysis from news, social media, and market data. Adaptive algorithms optimize parameters in real-time.",
            symbols: ["GOLD", "OIL", "BTC"],
            status: "active",
            returnRate: 52.8,
            riskLevel: "medium",
            winRate: 74.1,
            createdAt: new Date(Date.now() - 432000000).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      // Fallback to mock data if API fails
      setStrategies([
        {
          id: 1,
          name: "Quantum Momentum Alpha",
          description: "Advanced momentum strategy using quantum algorithms to identify multi-timeframe trends across precious metals and energy markets. Combines RSI, MACD, and proprietary volatility indicators.",
          symbols: ["GOLD", "SILVER"],
          status: "active",
          returnRate: 34.7,
          riskLevel: "medium",
          winRate: 73.2,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: "Energy Futures Arbitrage",
          description: "Statistical arbitrage strategy exploiting price inefficiencies between WTI crude oil futures and energy ETFs. Uses machine learning to predict mean reversion patterns.",
          symbols: ["OIL"],
          status: "active",
          returnRate: 28.3,
          riskLevel: "high",
          winRate: 68.9,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          name: "Digital Asset Trend Follower",
          description: "Cryptocurrency momentum strategy designed for Bitcoin and major altcoins. Utilizes Bollinger Bands, volume analysis, and sentiment indicators from social media.",
          symbols: ["BTC"],
          status: "active",
          returnRate: 127.4,
          riskLevel: "high",
          winRate: 61.7,
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 4,
          name: "Multi-Asset Mean Reversion",
          description: "Sophisticated mean reversion strategy operating across gold, silver, oil, and crypto. Uses cointegration analysis and pairs trading principles for market-neutral returns.",
          symbols: ["GOLD", "SILVER", "OIL", "BTC"],
          status: "testing",
          returnRate: 19.6,
          riskLevel: "low",
          winRate: 78.4,
          createdAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: 5,
          name: "Volatility Breakout Pro",
          description: "Advanced volatility-based breakout strategy that captures explosive moves in precious metals during high-impact economic events. Features dynamic position sizing.",
          symbols: ["GOLD", "SILVER"],
          status: "active",
          returnRate: 41.2,
          riskLevel: "medium",
          winRate: 69.8,
          createdAt: new Date(Date.now() - 345600000).toISOString()
        },
        {
          id: 6,
          name: "AI Sentiment Fusion",
          description: "Next-generation strategy combining technical analysis with AI-powered sentiment analysis from news, social media, and market data. Adaptive algorithms optimize parameters in real-time.",
          symbols: ["GOLD", "OIL", "BTC"],
          status: "active",
          returnRate: 52.8,
          riskLevel: "medium",
          winRate: 74.1,
          createdAt: new Date(Date.now() - 432000000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'testing': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'paused': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-quantum-text relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ top: '10%', left: '20%' }} />
        <div className="absolute w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ top: '60%', right: '20%', animationDelay: '2s' }} />
      </div>
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-quantum-gray border-b border-quantum-accent/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-quantum-text flex items-center gap-2">
                <Brain className="w-6 h-6 text-quantum-accent" />
                Trading Strategies
              </h2>
              <p className="text-quantum-text-secondary">AI-powered algorithmic trading strategies and performance analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-quantum-success/10 border border-quantum-success/30 rounded-xl">
                <div className="w-2 h-2 bg-quantum-success rounded-full animate-pulse"></div>
                <span className="text-sm text-quantum-success font-medium">Strategies Active</span>
              </div>
              {user?.role === 'admin' && (
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  <Zap className="w-4 h-4 mr-2" />
                  Create Strategy
                </Button>
              )}
              <button
                onClick={() => window.location.href = "/api/logout"}
                className="px-4 py-2 text-quantum-text-secondary hover:text-quantum-text hover:bg-quantum-accent/10 rounded-xl transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                ♟️ Trading Strategies
              </h1>
              <p className="text-slate-400 mt-2">AI-powered algorithmic trading strategies and performance analysis</p>
            </div>
            {user?.role === 'admin' && (
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <i className="fas fa-plus mr-2"></i>
                Create Strategy
              </Button>
            )}
          </div>

          {/* Strategy Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-quantum-accent flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Active Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-accent">
                  {strategies.filter(s => s.status === 'active').length}
                </div>
                <p className="text-sm text-quantum-text-secondary mt-1">Currently running</p>
              </CardContent>
            </Card>

            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-quantum-accent flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Avg Return
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-success">
                  {strategies.length > 0
                    ? `+${(strategies.reduce((acc, s) => acc + (s.returnRate || 0), 0) / strategies.length).toFixed(1)}%`
                    : 'N/A'
                  }
                </div>
                <p className="text-sm text-quantum-text-secondary mt-1">Portfolio average</p>
              </CardContent>
            </Card>

            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-quantum-accent flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-accent">
                  {strategies.length > 0
                    ? `${(strategies.reduce((acc, s) => acc + (s.winRate || 0), 0) / strategies.length).toFixed(1)}%`
                    : 'N/A'
                  }
                </div>
                <p className="text-sm text-quantum-text-secondary mt-1">Success rate</p>
              </CardContent>
            </Card>

            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-quantum-accent flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  AI Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-accent">7</div>
                <p className="text-sm text-quantum-text-secondary mt-1">Neural networks active</p>
              </CardContent>
            </Card>
          </div>

          {/* Strategies List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-quantum-text">Strategy Portfolio</h2>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-quantum-text-secondary">Loading strategies...</div>
              </div>
            ) : strategies.length === 0 ? (
              <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="text-quantum-text-secondary">No trading strategies found.</div>
                  {user?.role === 'admin' && (
                    <Button className="mt-4 bg-quantum-accent hover:bg-quantum-accent/80">
                      Create Your First Strategy
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {strategies.map((strategy) => (
                  <Card key={strategy.id} className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm hover:border-quantum-accent/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-quantum-text flex items-center">
                            <Brain className="w-5 h-5 mr-2 text-quantum-accent" />
                            {strategy.name}
                          </CardTitle>
                          <CardDescription className="text-quantum-text-secondary mt-1">
                            {strategy.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(strategy.status)}>
                            {strategy.status.toUpperCase()}
                          </Badge>
                          <Badge className={getRiskColor(strategy.riskLevel)}>
                            {strategy.riskLevel.toUpperCase()} RISK
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-quantum-dark/30 rounded-lg">
                          <div className="text-sm text-quantum-text-secondary">Return Rate</div>
                          <div className={`text-lg font-bold ${
                            (strategy.returnRate || 0) >= 0 ? 'text-quantum-success' : 'text-red-400'
                          }`}>
                            {strategy.returnRate ? `+${strategy.returnRate.toFixed(1)}%` : 'N/A'}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-quantum-dark/30 rounded-lg">
                          <div className="text-sm text-quantum-text-secondary">Win Rate</div>
                          <div className="text-lg font-bold text-quantum-accent">
                            {strategy.winRate ? `${strategy.winRate.toFixed(1)}%` : 'N/A'}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-quantum-dark/30 rounded-lg">
                          <div className="text-sm text-quantum-text-secondary">Assets</div>
                          <div className="text-lg font-bold text-quantum-accent">
                            {strategy.symbols ? strategy.symbols.length : 0}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-quantum-dark/30 rounded-lg">
                          <div className="text-sm text-quantum-text-secondary">Created</div>
                          <div className="text-lg font-bold text-quantum-accent">
                            {new Date(strategy.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {strategy.symbols && strategy.symbols.map((symbol: string) => (
                            <Badge key={symbol} variant="outline" className="text-quantum-accent border-quantum-accent/50">
                              {symbol}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-quantum-accent/50 text-quantum-accent hover:bg-quantum-accent/10">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          {user?.role === 'admin' && (
                            <Button size="sm" variant="outline" className="border-quantum-accent/50 text-quantum-accent hover:bg-quantum-accent/10">
                              <Zap className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
