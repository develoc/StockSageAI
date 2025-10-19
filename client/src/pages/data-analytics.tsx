import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { BarChart3, TrendingUp, LineChart, PieChart, Calendar, Download } from "lucide-react";

// Mock data for charts
const performanceData = [
  { date: "2025-01", value: 10500 },
  { date: "2025-02", value: 12000 },
  { date: "2025-03", value: 11800 },
  { date: "2025-04", value: 13200 },
  { date: "2025-05", value: 14100 },
  { date: "2025-06", value: 15000 },
];

export default function DataAnalytics() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [timeframe, setTimeframe] = useState("1M");

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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quantum-dark">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-quantum-accent to-quantum-success rounded-xl flex items-center justify-center animate-pulse">
            <BarChart3 className="w-6 h-6 text-quantum-dark" />
          </div>
          <p className="text-quantum-text-secondary">Loading data analytics...</p>
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
                <BarChart3 className="w-6 h-6 text-quantum-accent" />
                Data Analytics Dashboard
              </h2>
              <p className="text-quantum-text-secondary">Comprehensive market data analysis and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-quantum-success/10 border border-quantum-success/30 rounded-xl">
                <div className="w-2 h-2 bg-quantum-success rounded-full animate-pulse"></div>
                <span className="text-sm text-quantum-success font-medium">Data Updated</span>
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
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-quantum-text-secondary">
                  Portfolio Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-success flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  +15.4%
                </div>
                <p className="text-sm text-quantum-text-secondary">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-quantum-text-secondary">
                  Trading Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-accent">
                  $2.4M
                </div>
                <p className="text-sm text-quantum-text-secondary">Monthly average</p>
              </CardContent>
            </Card>

            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-quantum-text-secondary">
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-success">
                  78%
                </div>
                <p className="text-sm text-quantum-text-secondary">Profitable trades</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics Content */}
          <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-quantum-accent">Detailed Analysis</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-quantum-accent text-quantum-accent hover:bg-quantum-accent/10">
                    <Calendar className="w-4 h-4 mr-2" />
                    Custom Range
                  </Button>
                  <Button className="bg-quantum-accent hover:bg-quantum-accent/80">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="performance" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-quantum-dark/50 border border-quantum-accent/20">
                  <TabsTrigger value="performance" className="data-[state=active]:bg-quantum-accent data-[state=active]:text-quantum-dark">Performance</TabsTrigger>
                  <TabsTrigger value="assets" className="data-[state=active]:bg-quantum-accent data-[state=active]:text-quantum-dark">Asset Analysis</TabsTrigger>
                  <TabsTrigger value="strategies" className="data-[state=active]:bg-quantum-accent data-[state=active]:text-quantum-dark">Strategy Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-quantum-dark/50 border-quantum-accent/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2 text-quantum-text">
                          <LineChart className="w-4 h-4 text-quantum-accent" />
                          Portfolio Value Over Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        {/* TODO: Add chart component */}
                        <div className="w-full h-full flex items-center justify-center text-quantum-text-secondary">
                          Portfolio value chart will be displayed here
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-quantum-dark/50 border-quantum-accent/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2 text-quantum-text">
                          <PieChart className="w-4 h-4 text-quantum-accent" />
                          Asset Allocation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        {/* TODO: Add chart component */}
                        <div className="w-full h-full flex items-center justify-center text-quantum-text-secondary">
                          Asset allocation chart will be displayed here
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="assets" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-quantum-dark/50 border-quantum-accent/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-sm text-quantum-text">Asset Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-quantum-success rounded-full"></div>
                              <span>Gold (GOLD)</span>
                            </div>
                            <div className="text-quantum-success">+12.4%</div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-quantum-accent rounded-full"></div>
                              <span>Bitcoin (BTC)</span>
                            </div>
                            <div className="text-quantum-accent">+8.7%</div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              <span>Oil (OIL)</span>
                            </div>
                            <div className="text-red-400">-2.1%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-quantum-dark/50 border-quantum-accent/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-sm text-quantum-text">Asset Correlations</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        {/* TODO: Add correlation heatmap */}
                        <div className="w-full h-full flex items-center justify-center text-quantum-text-secondary">
                          Asset correlation heatmap will be displayed here
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="strategies" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-quantum-dark/50 border-quantum-accent/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-sm text-quantum-text">Strategy Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                            <div>Trend Following</div>
                            <div className="text-quantum-success">+15.2%</div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                            <div>Mean Reversion</div>
                            <div className="text-quantum-success">+8.9%</div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                            <div>Arbitrage</div>
                            <div className="text-red-400">-1.3%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-quantum-dark/50 border-quantum-accent/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-sm text-quantum-text">Risk Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                            <div>Sharpe Ratio</div>
                            <div className="text-quantum-accent">1.82</div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                            <div>Max Drawdown</div>
                            <div className="text-red-400">-12.4%</div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                            <div>Beta</div>
                            <div className="text-quantum-accent">0.85</div>
                          </div>
                        </div>
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
