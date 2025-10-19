
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import TradingViewChart from "@/components/TradingViewChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface WalletInfo {
  address: string;
  balance: string;
  network: string;
}

export default function Trading() {
  const { user, isAuthenticated } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState("NASDAQ:AAPL");
  const [orderType, setOrderType] = useState("market");
  const [orderSide, setOrderSide] = useState("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const { toast } = useToast();

  const symbols = [
    { value: "NASDAQ:AAPL", label: "Apple Inc.", category: "Stocks" },
    { value: "NASDAQ:GOOGL", label: "Alphabet Inc.", category: "Stocks" },
    { value: "NASDAQ:MSFT", label: "Microsoft Corp.", category: "Stocks" },
    { value: "NASDAQ:TSLA", label: "Tesla Inc.", category: "Stocks" },
    { value: "BINANCE:BTCUSDT", label: "Bitcoin", category: "Crypto" },
    { value: "BINANCE:ETHUSDT", label: "Ethereum", category: "Crypto" },
    { value: "FX:EURUSD", label: "EUR/USD", category: "Forex" },
    { value: "FX:GBPUSD", label: "GBP/USD", category: "Forex" },
    { value: "COMEX:GC1!", label: "Gold Futures", category: "Commodities" },
    { value: "NYMEX:CL1!", label: "Crude Oil", category: "Commodities" }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchPositions();
      checkWalletConnection();
    }
  }, [isAuthenticated]);

  const fetchPositions = async () => {
    try {
      // Mock positions for demo
      setPositions([
        {
          id: "1",
          symbol: "AAPL",
          side: "long",
          quantity: 100,
          entryPrice: 150.25,
          currentPrice: 155.80,
          pnl: 555,
          pnlPercent: 3.69
        },
        {
          id: "2",
          symbol: "BTC",
          side: "long",
          quantity: 0.5,
          entryPrice: 45000,
          currentPrice: 47200,
          pnl: 1100,
          pnlPercent: 4.89
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          });
          
          const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
          
          setWalletInfo({
            address: accounts[0],
            balance: balanceInEth.toFixed(4),
            network: 'Ethereum Mainnet'
          });
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive"
      });
      return;
    }

    setIsConnectingWallet(true);
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        await checkWalletConnection();
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to MetaMask"
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive"
      });
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const disconnectWallet = () => {
    setWalletInfo(null);
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected"
    });
  };

  const placeOrder = async () => {
    if (!quantity || (orderType === 'limit' && !price)) {
      toast({
        title: "Invalid Order",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mock order placement
      toast({
        title: "Order Placed",
        description: `${orderSide.toUpperCase()} ${quantity} ${selectedSymbol.split(':')[1]} at ${orderType} price`
      });
      
      // Reset form
      setQuantity("");
      setPrice("");
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Failed to place order",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Please log in to access trading</h2>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
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
                📈 Trading Terminal
              </h1>
              <p className="text-slate-400 mt-2">Advanced trading with real-time market data</p>
            </div>
            
            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {walletInfo ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {walletInfo.balance} ETH
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={disconnectWallet}
                    className="border-red-500/50 text-red-300"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={connectWallet} 
                  disabled={isConnectingWallet}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                >
                  <i className="fab fa-ethereum mr-2"></i>
                  {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-3 space-y-6">
              {/* Symbol Selector */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Market Analysis</CardTitle>
                    <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                      <SelectTrigger className="w-64 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {symbols.map(symbol => (
                          <SelectItem key={symbol.value} value={symbol.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{symbol.label}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {symbol.category}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <TradingViewChart
                      symbol={selectedSymbol}
                      theme="dark"
                      height={500}
                      width="100%"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Positions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Open Positions</CardTitle>
                  <CardDescription>Your current trading positions</CardDescription>
                </CardHeader>
                <CardContent>
                  {positions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      No open positions
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {positions.map(position => (
                        <div key={position.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Badge className={position.side === 'long' 
                              ? "bg-green-500/20 text-green-300 border-green-500/50"
                              : "bg-red-500/20 text-red-300 border-red-500/50"
                            }>
                              {position.side.toUpperCase()}
                            </Badge>
                            <div>
                              <div className="text-white font-medium">{position.symbol}</div>
                              <div className="text-sm text-slate-400">
                                {position.quantity} @ ${position.entryPrice}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${position.pnl > 0 ? '+' : ''}{position.pnl.toFixed(2)}
                            </div>
                            <div className={`text-sm ${position.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {position.pnlPercent > 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Trading Panel */}
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Place Order</CardTitle>
                  <CardDescription>Execute trades on selected instrument</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!walletInfo && (
                    <Alert className="border-yellow-500/20 bg-yellow-500/10">
                      <AlertDescription className="text-yellow-400">
                        Connect your wallet to enable trading
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Order Type */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={orderType === 'market' ? 'default' : 'outline'}
                      onClick={() => setOrderType('market')}
                      className="text-sm"
                    >
                      Market
                    </Button>
                    <Button
                      variant={orderType === 'limit' ? 'default' : 'outline'}
                      onClick={() => setOrderType('limit')}
                      className="text-sm"
                    >
                      Limit
                    </Button>
                  </div>

                  {/* Buy/Sell */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={orderSide === 'buy' ? 'default' : 'outline'}
                      onClick={() => setOrderSide('buy')}
                      className={`text-sm ${orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'border-green-500/50 text-green-300'}`}
                    >
                      Buy
                    </Button>
                    <Button
                      variant={orderSide === 'sell' ? 'default' : 'outline'}
                      onClick={() => setOrderSide('sell')}
                      className={`text-sm ${orderSide === 'sell' ? 'bg-red-600 hover:bg-red-700' : 'border-red-500/50 text-red-300'}`}
                    >
                      Sell
                    </Button>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="text-sm font-medium text-white">Quantity</label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Price (for limit orders) */}
                  {orderType === 'limit' && (
                    <div>
                      <label className="text-sm font-medium text-white">Price</label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {/* Place Order Button */}
                  <Button
                    onClick={placeOrder}
                    disabled={!walletInfo || !quantity}
                    className={`w-full ${orderSide === 'buy' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {orderSide === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
                  </Button>
                </CardContent>
              </Card>

              {/* Market Stats */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Market Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">24h Change</span>
                    <span className="text-green-400">+2.45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volume</span>
                    <span className="text-white">$1.2B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Cap</span>
                    <span className="text-white">$2.8T</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volatility</span>
                    <span className="text-yellow-400">Medium</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
