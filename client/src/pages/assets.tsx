
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AssetData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
}

export default function Assets() {
  const { user, isAuthenticated } = useAuth();
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);

  const symbols = ['GOLD', 'SILVER', 'OIL', 'BTC'];

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssetData();
      const interval = setInterval(fetchAssetData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchAssetData = async () => {
    try {
      const assetPromises = symbols.map(async (symbol) => {
        const response = await fetch(`/api/market-data/${symbol}/latest`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data) {
            return {
              symbol,
              price: parseFloat(data.close),
              change: Math.random() * 10 - 5, // Mock change
              changePercent: (Math.random() * 10 - 5),
              volume: parseFloat(data.volume),
              high24h: parseFloat(data.high),
              low24h: parseFloat(data.low),
            };
          }
        }
        return null;
      });

      const results = await Promise.all(assetPromises);
      setAssets(results.filter(Boolean) as AssetData[]);
    } catch (error) {
      console.error('Failed to fetch asset data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssetIcon = (symbol: string) => {
    switch (symbol) {
      case 'GOLD': return '🥇';
      case 'SILVER': return '🥈';
      case 'OIL': return '🛢️';
      case 'BTC': return '₿';
      default: return '📈';
    }
  };

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'BTC') return `$${price.toLocaleString()}`;
    return `$${price.toFixed(2)}`;
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
                💎 Digital Assets
              </h1>
              <p className="text-slate-400 mt-2">Real-time market data and asset management</p>
            </div>
            <Button 
              onClick={fetchAssetData}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh Data
            </Button>
          </div>

          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-cyan-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-300 flex items-center">
                  <i className="fas fa-chart-line mr-2"></i>
                  Market Cap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-300">$2.1T</div>
                <p className="text-sm text-slate-400 mt-1">+2.3% today</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-300 flex items-center">
                  <i className="fas fa-arrow-up mr-2"></i>
                  24h Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-300">$847B</div>
                <p className="text-sm text-slate-400 mt-1">+15.7% today</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-300 flex items-center">
                  <i className="fas fa-coins mr-2"></i>
                  Active Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-300">{assets.length}</div>
                <p className="text-sm text-slate-400 mt-1">Tracking live</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-yellow-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-300 flex items-center">
                  <i className="fas fa-fire mr-2"></i>
                  Market Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 font-medium">OPEN</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          {/* Assets Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Asset Prices</h2>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-slate-400">Loading asset data...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {assets.map((asset) => (
                  <Card key={asset.symbol} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getAssetIcon(asset.symbol)}</span>
                          <CardTitle className="text-white">{asset.symbol}</CardTitle>
                        </div>
                        <Badge className={asset.changePercent >= 0 
                          ? "bg-green-500/20 text-green-300 border-green-500/50" 
                          : "bg-red-500/20 text-red-300 border-red-500/50"
                        }>
                          {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {formatPrice(asset.price, asset.symbol)}
                        </div>
                        <div className={`text-sm font-medium ${
                          asset.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {asset.change >= 0 ? '+' : ''}{formatPrice(asset.change, asset.symbol)}
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>24h High:</span>
                          <span className="text-green-400">{formatPrice(asset.high24h, asset.symbol)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>24h Low:</span>
                          <span className="text-red-400">{formatPrice(asset.low24h, asset.symbol)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volume:</span>
                          <span className="text-cyan-400">{asset.volume.toLocaleString()}</span>
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
