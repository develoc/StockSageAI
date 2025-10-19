
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/Sidebar";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Briefcase } from "lucide-react";
import { PortfolioValueChart, AssetAllocationChart } from "@/components/charts/PortfolioCharts";

interface Position {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  change: number;
  changePercent: number;
}

export default function Portfolio() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [totalGainPercent, setTotalGainPercent] = useState(0);

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
    const fetchPortfolioData = async () => {
      try {
        const response = await fetch('/api/portfolios', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          updatePortfolioData(data);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      }
    };

    const updatePortfolioData = (data: any[]) => {
      // Mock real-time portfolio data
      const mockPositions: Position[] = [
        {
          id: '1',
          symbol: 'GOLD',
          quantity: 5.25,
          averagePrice: 2040.50,
          currentPrice: 2087.25,
          value: 10958.06,
          change: 245.44,
          changePercent: 2.29
        },
        {
          id: '2',
          symbol: 'BTC',
          quantity: 0.25,
          averagePrice: 42350.00,
          currentPrice: 43820.50,
          value: 10955.13,
          change: 367.63,
          changePercent: 3.47
        },
        {
          id: '3',
          symbol: 'OIL',
          quantity: 100,
          averagePrice: 75.20,
          currentPrice: 78.45,
          value: 7845.00,
          change: 325.00,
          changePercent: 4.32
        },
        {
          id: '4',
          symbol: 'SILVER',
          quantity: 200,
          averagePrice: 24.85,
          currentPrice: 25.92,
          value: 5184.00,
          change: 214.00,
          changePercent: 4.31
        }
      ];

      setPositions(mockPositions);
      const totalValue = mockPositions.reduce((sum, pos) => sum + pos.value, 0);
      const totalChange = mockPositions.reduce((sum, pos) => sum + pos.change, 0);

      setPortfolioValue(totalValue);
      setTotalGain(totalChange);
      setTotalGainPercent((totalChange / (totalValue - totalChange)) * 100);
    };

    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quantum-dark">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-quantum-accent to-quantum-success rounded-xl flex items-center justify-center animate-pulse">
            <Briefcase className="w-6 h-6 text-quantum-dark" />
          </div>
          <p className="text-quantum-text-secondary">Loading portfolio...</p>
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
                <Briefcase className="w-6 h-6 text-quantum-accent" />
                Portfolio Management
              </h2>
              <p className="text-quantum-text-secondary">Track your investments and performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-quantum-success/10 border border-quantum-success/30 rounded-xl">
                <div className="w-2 h-2 bg-quantum-success rounded-full animate-pulse"></div>
                <span className="text-sm text-quantum-success font-medium">Portfolio Active</span>
              </div>
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
          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" className="border-quantum-accent text-quantum-accent hover:bg-quantum-accent/10">
              <PieChart className="w-4 h-4 mr-2" />
              Rebalance
            </Button>
            <Button className="bg-quantum-accent hover:bg-quantum-accent/80">
              <DollarSign className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
          </div>

          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-quantum-text-secondary">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-accent">
                  ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-quantum-text-secondary">Total Gain/Loss</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold flex items-center ${totalGain >= 0 ? 'text-quantum-success' : 'text-red-400'}`}>
                  {totalGain >= 0 ? <TrendingUp className="w-5 h-5 mr-2" /> : <TrendingDown className="w-5 h-5 mr-2" />}
                  ${Math.abs(totalGain).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <p className={`text-sm ${totalGain >= 0 ? 'text-quantum-success' : 'text-red-400'}`}>
                  {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-quantum-text-secondary">Active Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-accent">{positions.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-quantum-text-secondary">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-quantum-accent" />
                  <span className="text-2xl font-bold text-quantum-success">+12.4%</span>
                </div>
                <p className="text-sm text-quantum-text-secondary">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Positions Table */}
          <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-quantum-accent">Current Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="positions" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-quantum-dark/50">
                  <TabsTrigger value="positions" className="data-[state=active]:bg-quantum-accent data-[state=active]:text-quantum-dark">Positions</TabsTrigger>
                  <TabsTrigger value="performance" className="data-[state=active]:bg-quantum-accent data-[state=active]:text-quantum-dark">Performance</TabsTrigger>
                  <TabsTrigger value="allocation" className="data-[state=active]:bg-quantum-accent data-[state=active]:text-quantum-dark">Allocation</TabsTrigger>
                </TabsList>

                <TabsContent value="positions" className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-quantum-accent/20">
                          <th className="text-left py-3 px-4 text-quantum-text-secondary">Symbol</th>
                          <th className="text-right py-3 px-4 text-quantum-text-secondary">Quantity</th>
                          <th className="text-right py-3 px-4 text-quantum-text-secondary">Avg Price</th>
                          <th className="text-right py-3 px-4 text-quantum-text-secondary">Current Price</th>
                          <th className="text-right py-3 px-4 text-quantum-text-secondary">Value</th>
                          <th className="text-right py-3 px-4 text-quantum-text-secondary">Gain/Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((position) => (
                          <tr key={position.id} className="border-b border-quantum-accent/10 hover:bg-quantum-accent/5">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="border-quantum-accent text-quantum-accent">
                                  {position.symbol}
                                </Badge>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4">{position.quantity}</td>
                            <td className="text-right py-3 px-4">${position.averagePrice.toFixed(2)}</td>
                            <td className="text-right py-3 px-4">${position.currentPrice.toFixed(2)}</td>
                            <td className="text-right py-3 px-4 font-medium">${position.value.toLocaleString()}</td>
                            <td className={`text-right py-3 px-4 font-medium ${position.change >= 0 ? 'text-quantum-success' : 'text-red-400'}`}>
                              <div className="flex items-center justify-end space-x-1">
                                {position.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                <span>${Math.abs(position.change).toFixed(2)}</span>
                                <span className="text-sm">({position.changePercent >= 0 ? '+' : ''}{position.changePercent.toFixed(2)}%)</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-quantum-dark/50 border-quantum-accent/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-sm text-quantum-accent">Monthly Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-quantum-text">January</span>
                            <span className="text-quantum-success">+8.4%</span>
                          </div>
                          <Progress value={84} className="h-2" />
                          <div className="flex justify-between">
                            <span className="text-quantum-text">February</span>
                            <span className="text-quantum-success">+12.1%</span>
                          </div>
                          <Progress value={91} className="h-2" />
                          <div className="flex justify-between">
                            <span className="text-quantum-text">March</span>
                            <span className="text-quantum-success">+6.7%</span>
                          </div>
                          <Progress value={67} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-quantum-dark/50 border-quantum-accent/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-sm text-quantum-accent">Asset Allocation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-quantum-text">Gold (GOLD)</span>
                            <span className="text-quantum-text">31.2%</span>
                          </div>
                          <Progress value={31.2} className="h-2" />
                          <div className="flex justify-between items-center">
                            <span className="text-quantum-text">Bitcoin (BTC)</span>
                            <span className="text-quantum-text">31.1%</span>
                          </div>
                          <Progress value={31.1} className="h-2" />
                          <div className="flex justify-between items-center">
                            <span className="text-quantum-text">Oil (OIL)</span>
                            <span className="text-quantum-text">22.3%</span>
                          </div>
                          <Progress value={22.3} className="h-2" />
                          <div className="flex justify-between items-center">
                            <span className="text-quantum-text">Silver (SILVER)</span>
                            <span className="text-quantum-text">14.7%</span>
                          </div>
                          <Progress value={14.7} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="allocation">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-quantum-dark/50 border-quantum-accent/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-sm text-quantum-accent">Portfolio Value Over Time</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        <PortfolioValueChart data={[
                          { name: new Date(Date.now() - 5 * 30 * 24 * 60 * 60 * 1000).toLocaleString('en-US', { month: 'short' }), value: portfolioValue * 0.85 },
                          { name: new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000).toLocaleString('en-US', { month: 'short' }), value: portfolioValue * 0.88 },
                          { name: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toLocaleString('en-US', { month: 'short' }), value: portfolioValue * 0.92 },
                          { name: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toLocaleString('en-US', { month: 'short' }), value: portfolioValue * 0.95 },
                          { name: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toLocaleString('en-US', { month: 'short' }), value: portfolioValue * 0.98 },
                          { name: new Date().toLocaleString('en-US', { month: 'short' }), value: portfolioValue },
                        ]} />
                      </CardContent>
                    </Card>

                    <Card className="bg-quantum-dark/50 border-quantum-accent/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-sm text-quantum-accent">Asset Allocation</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        <AssetAllocationChart data={positions.map(pos => ({
                          name: pos.symbol,
                          value: pos.value
                        }))} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
