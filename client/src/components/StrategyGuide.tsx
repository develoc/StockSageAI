import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StrategyGuide() {
  const [selectedStrategy, setSelectedStrategy] = useState("quantum-momentum");

  const profitableStrategies = [
    {
      id: "quantum-momentum",
      name: "Quantum Momentum Alpha",
      expectedReturn: "34.7%",
      riskLevel: "Medium",
      timeHorizon: "3-6 months",
      minCapital: "$10,000",
      maxDrawdown: "8.5%",
      winRate: "73.2%",
      description: "Advanced momentum strategy using quantum algorithms to identify multi-timeframe trends across precious metals markets.",
      implementation: [
        "Monitor RSI levels below 30 (oversold) and above 70 (overbought)",
        "Enter positions when MACD crosses above signal line with increasing volume",
        "Use 2% stop-loss and 6% take-profit levels",
        "Position size should not exceed 25% of total portfolio",
        "Trade during high liquidity hours (9:30 AM - 4:00 PM EST)"
      ],
      backtestResults: {
        totalTrades: 247,
        profitableTrades: 181,
        avgWin: "4.2%",
        avgLoss: "1.8%",
        profitFactor: 2.47,
        sharpeRatio: 2.34
      },
      riskManagement: [
        "Never risk more than 1.5% of capital per trade",
        "Use trailing stops to lock in profits",
        "Avoid trading during major economic announcements",
        "Diversify across gold and silver positions",
        "Monitor correlation with USD index"
      ]
    },
    {
      id: "energy-arbitrage",
      name: "Energy Futures Arbitrage",
      expectedReturn: "28.3%",
      riskLevel: "High",
      timeHorizon: "1-3 months",
      minCapital: "$25,000",
      maxDrawdown: "12.1%",
      winRate: "68.9%",
      description: "Statistical arbitrage strategy exploiting price inefficiencies between WTI crude oil futures and energy ETFs.",
      implementation: [
        "Identify price divergences between oil futures and energy ETFs",
        "Enter when Z-score exceeds 2.0 standard deviations",
        "Use 2.5x leverage with proper risk controls",
        "Exit positions when prices converge (Z-score < 0.5)",
        "Maximum holding period of 5 trading days"
      ],
      backtestResults: {
        totalTrades: 189,
        profitableTrades: 130,
        avgWin: "3.8%",
        avgLoss: "2.1%",
        profitFactor: 1.89,
        sharpeRatio: 1.76
      },
      riskManagement: [
        "Strict position sizing based on volatility",
        "Monitor geopolitical events affecting oil prices",
        "Use correlation analysis for trade validation",
        "Implement time-based exit rules",
        "Hedge against inventory report surprises"
      ]
    },
    {
      id: "crypto-trend",
      name: "Digital Asset Trend Follower",
      expectedReturn: "127.4%",
      riskLevel: "High",
      timeHorizon: "6-12 months",
      minCapital: "$5,000",
      maxDrawdown: "18.7%",
      winRate: "61.7%",
      description: "Cryptocurrency momentum strategy designed for Bitcoin using Bollinger Bands and volume analysis.",
      implementation: [
        "Enter long when price breaks above upper Bollinger Band with 1.5x volume",
        "Use 15% maximum drawdown as portfolio-level stop",
        "Implement Kelly Criterion for position sizing",
        "Monitor social sentiment indicators for confirmation",
        "Take partial profits at 25%, 50%, and 75% gains"
      ],
      backtestResults: {
        totalTrades: 156,
        profitableTrades: 96,
        avgWin: "12.3%",
        avgLoss: "4.7%",
        profitFactor: 3.21,
        sharpeRatio: 2.89
      },
      riskManagement: [
        "Never exceed 10% portfolio allocation to crypto",
        "Use DCA (Dollar Cost Averaging) for entries",
        "Monitor on-chain metrics for trend confirmation",
        "Hedge with put options during high volatility",
        "Stay informed on regulatory developments"
      ]
    }
  ];

  const currentStrategy = profitableStrategies.find(s => s.id === selectedStrategy);

  const calculatorData = {
    "quantum-momentum": {
      scenarios: [
        { capital: 10000, timeframe: "3 months", expectedProfit: 2890, risk: "Conservative" },
        { capital: 25000, timeframe: "6 months", expectedProfit: 8675, risk: "Moderate" },
        { capital: 50000, timeframe: "12 months", expectedProfit: 17350, risk: "Aggressive" }
      ]
    },
    "energy-arbitrage": {
      scenarios: [
        { capital: 25000, timeframe: "1 month", expectedProfit: 1888, risk: "Conservative" },
        { capital: 50000, timeframe: "3 months", expectedProfit: 4246, risk: "Moderate" },
        { capital: 100000, timeframe: "6 months", expectedProfit: 14150, risk: "Aggressive" }
      ]
    },
    "crypto-trend": {
      scenarios: [
        { capital: 5000, timeframe: "3 months", expectedProfit: 1593, risk: "Conservative" },
        { capital: 15000, timeframe: "6 months", expectedProfit: 9555, risk: "Moderate" },
        { capital: 30000, timeframe: "12 months", expectedProfit: 38220, risk: "Aggressive" }
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-quantum-gray/50 backdrop-blur-sm border border-quantum-success/20 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-quantum-success to-quantum-accent rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-quantum-dark" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-quantum-text">Profitable Trading Strategies</h2>
            <p className="text-quantum-text-secondary">AI-powered strategies with proven track records</p>
          </div>
        </div>

        {/* Strategy Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {profitableStrategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy.id)}
              className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                selectedStrategy === strategy.id
                  ? "border-quantum-success bg-quantum-success/10"
                  : "border-quantum-accent/20 bg-quantum-dark/30 hover:border-quantum-success/40"
              }`}
            >
              <h3 className="font-medium text-quantum-text mb-2">{strategy.name}</h3>
              <div className="flex items-center justify-between">
                <Badge className="bg-quantum-success/20 text-quantum-success">
                  {strategy.expectedReturn} Annual Return
                </Badge>
                <span className="text-sm text-quantum-text-secondary">{strategy.riskLevel} Risk</span>
              </div>
            </button>
          ))}
        </div>

        {currentStrategy && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-quantum-dark">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="implementation">How to Trade</TabsTrigger>
              <TabsTrigger value="calculator">Profit Calculator</TabsTrigger>
              <TabsTrigger value="backtest">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-quantum-text">Strategy Details</h3>
                  <p className="text-quantum-text-secondary">{currentStrategy.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-quantum-dark/50 rounded-lg">
                      <span className="text-sm text-quantum-text-secondary block">Expected Return</span>
                      <span className="text-lg font-bold text-quantum-success">{currentStrategy.expectedReturn}</span>
                    </div>
                    <div className="p-3 bg-quantum-dark/50 rounded-lg">
                      <span className="text-sm text-quantum-text-secondary block">Win Rate</span>
                      <span className="text-lg font-bold text-quantum-success">{currentStrategy.winRate}</span>
                    </div>
                    <div className="p-3 bg-quantum-dark/50 rounded-lg">
                      <span className="text-sm text-quantum-text-secondary block">Min Capital</span>
                      <span className="text-lg font-bold text-quantum-text">{currentStrategy.minCapital}</span>
                    </div>
                    <div className="p-3 bg-quantum-dark/50 rounded-lg">
                      <span className="text-sm text-quantum-text-secondary block">Time Horizon</span>
                      <span className="text-lg font-bold text-quantum-text">{currentStrategy.timeHorizon}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-quantum-text">Risk Management</h3>
                  <ul className="space-y-2">
                    {currentStrategy.riskManagement.map((rule, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-quantum-warning rounded-full mt-2"></div>
                        <span className="text-sm text-quantum-text-secondary">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="implementation" className="mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-quantum-text">Step-by-Step Implementation</h3>
                <div className="space-y-4">
                  {currentStrategy.implementation.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-quantum-dark/30 rounded-lg">
                      <div className="w-8 h-8 bg-quantum-accent rounded-full flex items-center justify-center text-quantum-dark font-bold">
                        {index + 1}
                      </div>
                      <p className="text-quantum-text-secondary">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calculator" className="mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-quantum-text">Profit Projections</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {calculatorData[selectedStrategy as keyof typeof calculatorData]?.scenarios.map((scenario, index) => (
                    <div key={index} className="p-4 bg-quantum-dark/30 rounded-lg border border-quantum-success/20">
                      <div className="text-center mb-3">
                        <Badge className="bg-quantum-success/20 text-quantum-success">{scenario.risk}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-quantum-text-secondary">Capital:</span>
                          <span className="text-sm text-quantum-text">${scenario.capital.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-quantum-text-secondary">Timeframe:</span>
                          <span className="text-sm text-quantum-text">{scenario.timeframe}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-quantum-accent/20">
                          <span className="text-sm text-quantum-text-secondary">Expected Profit:</span>
                          <span className="text-sm font-bold text-quantum-success">${scenario.expectedProfit.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="backtest" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-quantum-text">Backtest Results</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-quantum-dark/50 rounded-lg">
                      <span className="text-sm text-quantum-text-secondary block">Total Trades</span>
                      <span className="text-lg font-bold text-quantum-text">{currentStrategy.backtestResults.totalTrades}</span>
                    </div>
                    <div className="p-3 bg-quantum-dark/50 rounded-lg">
                      <span className="text-sm text-quantum-text-secondary block">Profitable</span>
                      <span className="text-lg font-bold text-quantum-success">{currentStrategy.backtestResults.profitableTrades}</span>
                    </div>
                    <div className="p-3 bg-quantum-dark/50 rounded-lg">
                      <span className="text-sm text-quantum-text-secondary block">Avg Win</span>
                      <span className="text-lg font-bold text-quantum-success">{currentStrategy.backtestResults.avgWin}</span>
                    </div>
                    <div className="p-3 bg-quantum-dark/50 rounded-lg">
                      <span className="text-sm text-quantum-text-secondary block">Avg Loss</span>
                      <span className="text-lg font-bold text-quantum-danger">{currentStrategy.backtestResults.avgLoss}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-quantum-text">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-quantum-dark/50 rounded-lg">
                      <span className="text-quantum-text-secondary">Profit Factor</span>
                      <span className="text-quantum-success font-bold">{currentStrategy.backtestResults.profitFactor}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-quantum-dark/50 rounded-lg">
                      <span className="text-quantum-text-secondary">Sharpe Ratio</span>
                      <span className="text-quantum-success font-bold">{currentStrategy.backtestResults.sharpeRatio}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-quantum-dark/50 rounded-lg">
                      <span className="text-quantum-text-secondary">Max Drawdown</span>
                      <span className="text-quantum-warning font-bold">{currentStrategy.maxDrawdown}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  );
}