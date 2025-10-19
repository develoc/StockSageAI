export interface MarketData {
  id: number;
  symbol: string;
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  timeframe: string;
  createdAt: string;
}

export interface Strategy {
  id: number;
  name: string;
  description?: string;
  symbols: string[];
  status: 'active' | 'testing' | 'paused';
  returnRate?: string;
  riskLevel: 'low' | 'medium' | 'high';
  winRate?: string;
  parameters?: any;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIInsight {
  id: number;
  symbol: string;
  type: 'signal' | 'alert' | 'strategy_update';
  title: string;
  description: string;
  confidence: string;
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
  createdAt: string;
}

export interface Portfolio {
  id: number;
  userId: string;
  name: string;
  totalValue: string;
  allocation?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: number;
  portfolioId: number;
  symbol: string;
  quantity: string;
  avgPrice: string;
  currentPrice?: string;
  unrealizedPnl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPIMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
  gradient: string;
}

export type TimeFrame = '1H' | '1D' | '1W' | '1M';
export type AssetSymbol = 'GOLD' | 'SILVER' | 'OIL' | 'BTC';
