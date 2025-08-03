
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from "lucide-react";

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
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [totalGainPercent, setTotalGainPercent] = useState(0);

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

  return (
    <div className="min-h-screen bg-quantum-dark text-quantum-text p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-quantum-blue">Portfolio Overview</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="border-quantum-blue text-quantum-blue">
              <PieChart className="w-4 h-4 mr-2" />
              Rebalance
            </Button>
            <Button className="bg-quantum-blue hover:bg-quantum-blue/80">
              <DollarSign className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-quantum-surface border-quantum-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-quantum-text/70">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-quantum-blue">
                ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-quantum-surface border-quantum-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-quantum-text/70">Total Gain/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold flex items-center ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalGain >= 0 ? <TrendingUp className="w-5 h-5 mr-2" /> : <TrendingDown className="w-5 h-5 mr-2" />}
                ${Math.abs(totalGain).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className={`text-sm ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-quantum-surface border-quantum-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-quantum-text/70">Active Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-quantum-blue">{positions.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-quantum-surface border-quantum-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-quantum-text/70">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-quantum-blue" />
                <span className="text-2xl font-bold text-green-400">+12.4%</span>
              </div>
              <p className="text-sm text-quantum-text/70">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Positions Table */}
        <Card className="bg-quantum-surface border-quantum-border">
          <CardHeader>
            <CardTitle className="text-quantum-blue">Current Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="positions" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-quantum-dark">
                <TabsTrigger value="positions">Positions</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="allocation">Allocation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="positions" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-quantum-border">
                        <th className="text-left py-3 px-4 text-quantum-text/70">Symbol</th>
                        <th className="text-right py-3 px-4 text-quantum-text/70">Quantity</th>
                        <th className="text-right py-3 px-4 text-quantum-text/70">Avg Price</th>
                        <th className="text-right py-3 px-4 text-quantum-text/70">Current Price</th>
                        <th className="text-right py-3 px-4 text-quantum-text/70">Value</th>
                        <th className="text-right py-3 px-4 text-quantum-text/70">Gain/Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position) => (
                        <tr key={position.id} className="border-b border-quantum-border/50 hover:bg-quantum-dark/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="border-quantum-blue text-quantum-blue">
                                {position.symbol}
                              </Badge>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">{position.quantity}</td>
                          <td className="text-right py-3 px-4">${position.averagePrice.toFixed(2)}</td>
                          <td className="text-right py-3 px-4">${position.currentPrice.toFixed(2)}</td>
                          <td className="text-right py-3 px-4 font-medium">${position.value.toLocaleString()}</td>
                          <td className={`text-right py-3 px-4 font-medium ${position.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
                  <Card className="bg-quantum-dark border-quantum-border">
                    <CardHeader>
                      <CardTitle className="text-sm">Monthly Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>January</span>
                          <span className="text-green-400">+8.4%</span>
                        </div>
                        <Progress value={84} className="h-2" />
                        <div className="flex justify-between">
                          <span>February</span>
                          <span className="text-green-400">+12.1%</span>
                        </div>
                        <Progress value={91} className="h-2" />
                        <div className="flex justify-between">
                          <span>March</span>
                          <span className="text-green-400">+6.7%</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-quantum-dark border-quantum-border">
                    <CardHeader>
                      <CardTitle className="text-sm">Asset Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Gold (GOLD)</span>
                          <span>31.2%</span>
                        </div>
                        <Progress value={31.2} className="h-2" />
                        <div className="flex justify-between items-center">
                          <span>Bitcoin (BTC)</span>
                          <span>31.1%</span>
                        </div>
                        <Progress value={31.1} className="h-2" />
                        <div className="flex justify-between items-center">
                          <span>Oil (OIL)</span>
                          <span>22.3%</span>
                        </div>
                        <Progress value={22.3} className="h-2" />
                        <div className="flex justify-between items-center">
                          <span>Silver (SILVER)</span>
                          <span>14.7%</span>
                        </div>
                        <Progress value={14.7} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="allocation">
                <div className="text-center py-8">
                  <p className="text-quantum-text/70">Asset allocation chart will be displayed here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
