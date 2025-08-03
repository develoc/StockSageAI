
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const { user, isAuthenticated } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
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

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
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
            <Card className="bg-slate-800/50 border-cyan-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-300 flex items-center">
                  <i className="fas fa-brain mr-2"></i>
                  Neural Network Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 font-medium">Active</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">Processing 12,847 data points/sec</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-300 flex items-center">
                  <i className="fas fa-chart-line mr-2"></i>
                  Prediction Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-300">94.7%</div>
                <p className="text-sm text-slate-400 mt-1">Last 30 days average</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-pink-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-pink-300 flex items-center">
                  <i className="fas fa-lightning-bolt mr-2"></i>
                  Real-time Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-pink-300">{insights.length}</div>
                <p className="text-sm text-slate-400 mt-1">Active recommendations</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Latest AI Insights</h2>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-slate-400">Loading AI insights...</div>
              </div>
            ) : insights.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8 text-center">
                  <div className="text-slate-400">No AI insights available at the moment.</div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {insights.map((insight) => (
                  <Card key={insight.id} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center`}>
                            <i className={`fas ${getTypeIcon(insight.type)} text-white`}></i>
                          </div>
                          <div>
                            <CardTitle className="text-white">{insight.title}</CardTitle>
                            <CardDescription className="text-slate-400">
                              {insight.symbol} • {new Date(insight.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority.toUpperCase()}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                            {Math.round(insight.confidence)}% confidence
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300">{insight.description}</p>
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
