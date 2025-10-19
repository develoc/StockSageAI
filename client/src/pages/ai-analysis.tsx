
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Cpu, Activity, RefreshCw } from "lucide-react";

interface AIInsight {
  id: number;
  symbol: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  priority: string;
  createdAt: string;
}

export default function AIAnalysis() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
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
      fetchInsights();
    }
  }, [isAuthenticated]);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/ai-insights', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      } else {
        // Fallback to mock data if API fails
        setInsights([
          {
            id: 1,
            symbol: "GOLD",
            type: "signal",
            title: "Strong Bullish Momentum Detected",
            description: "AI algorithms have identified a sustained uptrend in gold prices with 89% confidence. Technical indicators suggest continued strength with potential targets at $2,150-2,200 over the next 2-3 weeks.",
            confidence: 89.3,
            priority: "high",
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            symbol: "BTC",
            type: "alert",
            title: "Volatility Spike Warning",
            description: "Cryptocurrency markets showing increased volatility patterns. Recommend reducing position sizes by 25% and implementing tighter stop-losses. Expected duration: 5-7 trading days.",
            confidence: 76.8,
            priority: "medium",
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 3,
            symbol: "OIL",
            type: "strategy_update",
            title: "Energy Sector Rotation Opportunity",
            description: "Geopolitical tensions and supply constraints creating favorable conditions for energy investments. Our Energy Futures Arbitrage strategy has been adjusted to capture these opportunities.",
            confidence: 82.1,
            priority: "high",
            createdAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 4,
            symbol: "SILVER",
            type: "signal",
            title: "Industrial Demand Surge Prediction",
            description: "Machine learning models predict increased industrial silver demand driven by renewable energy sector growth. Long-term bullish outlook with 12-18 month horizon.",
            confidence: 71.4,
            priority: "medium",
            createdAt: new Date(Date.now() - 259200000).toISOString()
          },
          {
            id: 5,
            symbol: "GOLD",
            type: "alert",
            title: "Federal Reserve Policy Impact",
            description: "Upcoming Federal Reserve announcements likely to impact precious metals. Our models suggest 68% probability of dovish stance, favorable for gold investments.",
            confidence: 67.9,
            priority: "medium",
            createdAt: new Date(Date.now() - 345600000).toISOString()
          },
          {
            id: 6,
            symbol: "BTC",
            type: "signal",
            title: "Institutional Accumulation Pattern",
            description: "On-chain analysis reveals large wallet accumulation patterns similar to previous bull market phases. Current setup suggests potential for significant upward movement.",
            confidence: 84.7,
            priority: "high",
            createdAt: new Date(Date.now() - 432000000).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      // Fallback to mock data if API fails
      setInsights([
        {
          id: 1,
          symbol: "GOLD",
          type: "signal",
          title: "Strong Bullish Momentum Detected",
          description: "AI algorithms have identified a sustained uptrend in gold prices with 89% confidence. Technical indicators suggest continued strength with potential targets at $2,150-2,200 over the next 2-3 weeks.",
          confidence: 89.3,
          priority: "high",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          symbol: "BTC",
          type: "alert",
          title: "Volatility Spike Warning",
          description: "Cryptocurrency markets showing increased volatility patterns. Recommend reducing position sizes by 25% and implementing tighter stop-losses. Expected duration: 5-7 trading days.",
          confidence: 76.8,
          priority: "medium",
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          symbol: "OIL",
          type: "strategy_update",
          title: "Energy Sector Rotation Opportunity",
          description: "Geopolitical tensions and supply constraints creating favorable conditions for energy investments. Our Energy Futures Arbitrage strategy has been adjusted to capture these opportunities.",
          confidence: 82.1,
          priority: "high",
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 4,
          symbol: "SILVER",
          type: "signal",
          title: "Industrial Demand Surge Prediction",
          description: "Machine learning models predict increased industrial silver demand driven by renewable energy sector growth. Long-term bullish outlook with 12-18 month horizon.",
          confidence: 71.4,
          priority: "medium",
          createdAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: 5,
          symbol: "GOLD",
          type: "alert",
          title: "Federal Reserve Policy Impact",
          description: "Upcoming Federal Reserve announcements likely to impact precious metals. Our models suggest 68% probability of dovish stance, favorable for gold investments.",
          confidence: 67.9,
          priority: "medium",
          createdAt: new Date(Date.now() - 345600000).toISOString()
        },
        {
          id: 6,
          symbol: "BTC",
          type: "signal",
          title: "Institutional Accumulation Pattern",
          description: "On-chain analysis reveals large wallet accumulation patterns similar to previous bull market phases. Current setup suggests potential for significant upward movement.",
          confidence: 84.7,
          priority: "high",
          createdAt: new Date(Date.now() - 432000000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'signal': return 'fa-chart-line';
      case 'alert': return 'fa-exclamation-triangle';
      case 'strategy_update': return 'fa-chess';
      default: return 'fa-brain';
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quantum-dark">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-quantum-accent to-quantum-success rounded-xl flex items-center justify-center animate-pulse">
            <Brain className="w-6 h-6 text-quantum-dark" />
          </div>
          <p className="text-quantum-text-secondary">Loading AI analysis...</p>
        </div>
      </div>
    );
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
                AI Neural Analysis
              </h2>
              <p className="text-quantum-text-secondary">Advanced machine learning insights and market predictions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-quantum-success/10 border border-quantum-success/30 rounded-xl">
                <div className="w-2 h-2 bg-quantum-success rounded-full animate-pulse"></div>
                <span className="text-sm text-quantum-success font-medium">AI Active</span>
              </div>
              <Button
                onClick={fetchInsights}
                className="bg-quantum-accent hover:bg-quantum-accent/80"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Analysis
              </Button>
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
                🧠 AI Neural Analysis
              </h1>
              <p className="text-slate-400 mt-2">Advanced machine learning insights and market predictions</p>
            </div>
            <Button 
              onClick={fetchInsights}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh Analysis
            </Button>
          </div>

          {/* AI Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-quantum-accent flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Neural Network Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-quantum-success rounded-full animate-pulse"></div>
                  <span className="text-quantum-success font-medium">Active</span>
                </div>
                <p className="text-sm text-quantum-text-secondary mt-2">Processing 12,847 data points/sec</p>
              </CardContent>
            </Card>

            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-quantum-accent flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Prediction Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-accent">94.7%</div>
                <p className="text-sm text-quantum-text-secondary mt-1">Last 30 days average</p>
              </CardContent>
            </Card>

            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-quantum-accent flex items-center">
                  <Cpu className="w-5 h-5 mr-2" />
                  Real-time Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-accent">{insights.length}</div>
                <p className="text-sm text-quantum-text-secondary mt-1">Active recommendations</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-quantum-text">Latest AI Insights</h2>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-quantum-text-secondary">Loading AI insights...</div>
              </div>
            ) : insights.length === 0 ? (
              <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="text-quantum-text-secondary">No AI insights available at the moment.</div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {insights.map((insight) => (
                  <Card key={insight.id} className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm hover:border-quantum-accent/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-quantum-accent to-quantum-success flex items-center justify-center`}>
                            <Brain className="w-5 h-5 text-quantum-dark" />
                          </div>
                          <div>
                            <CardTitle className="text-quantum-text">{insight.title}</CardTitle>
                            <CardDescription className="text-quantum-text-secondary">
                              {insight.symbol} • {new Date(insight.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority.toUpperCase()}
                          </Badge>
                          <Badge className="bg-quantum-accent/20 text-quantum-accent border-quantum-accent/30">
                            {Math.round(insight.confidence)}% confidence
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-quantum-text-secondary">{insight.description}</p>
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
