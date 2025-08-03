
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const { user, isAuthenticated } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
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
            <Card className="bg-slate-800/50 border-cyan-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-300 flex items-center">
                  <i className="fas fa-chess mr-2"></i>
                  Active Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-300">
                  {strategies.filter(s => s.status === 'active').length}
                </div>
                <p className="text-sm text-slate-400 mt-1">Currently running</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-300 flex items-center">
                  <i className="fas fa-chart-line mr-2"></i>
                  Avg Return
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-300">
                  {strategies.length > 0 
                    ? `+${(strategies.reduce((acc, s) => acc + (s.returnRate || 0), 0) / strategies.length).toFixed(1)}%`
                    : 'N/A'
                  }
                </div>
                <p className="text-sm text-slate-400 mt-1">Portfolio average</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-300 flex items-center">
                  <i className="fas fa-target mr-2"></i>
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-300">
                  {strategies.length > 0 
                    ? `${(strategies.reduce((acc, s) => acc + (s.winRate || 0), 0) / strategies.length).toFixed(1)}%`
                    : 'N/A'
                  }
                </div>
                <p className="text-sm text-slate-400 mt-1">Success rate</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-yellow-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-300 flex items-center">
                  <i className="fas fa-brain mr-2"></i>
                  AI Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-300">7</div>
                <p className="text-sm text-slate-400 mt-1">Neural networks active</p>
              </CardContent>
            </Card>
          </div>

          {/* Strategies List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Strategy Portfolio</h2>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-slate-400">Loading strategies...</div>
              </div>
            ) : strategies.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8 text-center">
                  <div className="text-slate-400">No trading strategies found.</div>
                  {user?.role === 'admin' && (
                    <Button className="mt-4 bg-gradient-to-r from-cyan-500 to-purple-500">
                      Create Your First Strategy
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {strategies.map((strategy) => (
                  <Card key={strategy.id} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white flex items-center">
                            <i className="fas fa-robot mr-2 text-cyan-400"></i>
                            {strategy.name}
                          </CardTitle>
                          <CardDescription className="text-slate-400 mt-1">
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
                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                          <div className="text-sm text-slate-400">Return Rate</div>
                          <div className={`text-lg font-bold ${
                            (strategy.returnRate || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {strategy.returnRate ? `+${strategy.returnRate.toFixed(1)}%` : 'N/A'}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                          <div className="text-sm text-slate-400">Win Rate</div>
                          <div className="text-lg font-bold text-purple-400">
                            {strategy.winRate ? `${strategy.winRate.toFixed(1)}%` : 'N/A'}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                          <div className="text-sm text-slate-400">Assets</div>
                          <div className="text-lg font-bold text-cyan-400">
                            {strategy.symbols ? strategy.symbols.length : 0}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                          <div className="text-sm text-slate-400">Created</div>
                          <div className="text-lg font-bold text-yellow-400">
                            {new Date(strategy.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {strategy.symbols && strategy.symbols.map((symbol: string) => (
                            <Badge key={symbol} variant="outline" className="text-cyan-300 border-cyan-500/50">
                              {symbol}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-300">
                            <i className="fas fa-chart-line mr-1"></i>
                            View Details
                          </Button>
                          {user?.role === 'admin' && (
                            <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-300">
                              <i className="fas fa-edit mr-1"></i>
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
