import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Line } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createLineChartData, defaultChartOptions } from "@/lib/chartConfig";
import type { TimeFrame, AssetSymbol } from "@/types/market";

export default function MainChart() {
  const [selectedAsset, setSelectedAsset] = useState<AssetSymbol>("GOLD");
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>("1D");

  const { data: marketData, isLoading } = useQuery({
    queryKey: [`/api/market-data/${selectedAsset}`, { timeframe: selectedTimeframe }],
    queryFn: async () => {
      const response = await fetch(`/api/market-data/${selectedAsset}?timeframe=${selectedTimeframe}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch market data");
      return response.json();
    },
  });

  const assets = [
    { symbol: "GOLD" as AssetSymbol, label: "Gold", icon: "coins", color: "yellow-400" },
    { symbol: "SILVER" as AssetSymbol, label: "Silver", icon: "coins", color: "gray-400" },
    { symbol: "OIL" as AssetSymbol, label: "Oil", icon: "fire", color: "orange-400" },
    { symbol: "BTC" as AssetSymbol, label: "Crypto", icon: "bitcoin", color: "purple-400" },
  ];

  const timeframes: { value: TimeFrame; label: string }[] = [
    { value: "1H", label: "1H" },
    { value: "1D", label: "1D" },
    { value: "1W", label: "1W" },
    { value: "1M", label: "1M" },
  ];

  const chartData = marketData ? createLineChartData(marketData, selectedAsset) : null;

  return (
    <Card className="bg-quantum-gray/50 backdrop-blur-sm border border-quantum-accent/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-quantum-text">Multi-Asset Analysis</h3>
          <p className="text-quantum-text-secondary">AI-powered trend detection across historical data</p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex bg-quantum-dark rounded-xl p-1 space-x-1">
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe.value}
              onClick={() => setSelectedTimeframe(timeframe.value)}
              variant={selectedTimeframe === timeframe.value ? "default" : "ghost"}
              size="sm"
              className={`text-sm font-medium ${
                selectedTimeframe === timeframe.value
                  ? "bg-quantum-accent text-quantum-dark"
                  : "text-quantum-text-secondary hover:text-quantum-text"
              }`}
            >
              {timeframe.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="relative h-96 bg-quantum-dark/30 rounded-xl border border-quantum-accent/10 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-quantum-text-secondary">Loading chart data...</div>
          </div>
        ) : chartData ? (
          <Line data={chartData} options={defaultChartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-quantum-text-secondary">No data available for {selectedAsset}</div>
          </div>
        )}
      </div>

      {/* Asset Selector */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex space-x-2">
          {assets.map((asset) => (
            <Button
              key={asset.symbol}
              onClick={() => setSelectedAsset(asset.symbol)}
              variant="ghost"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedAsset === asset.symbol
                  ? `bg-${asset.color}/20 border border-${asset.color}/40 text-${asset.color}`
                  : `bg-${asset.color}/10 border border-${asset.color}/20 text-${asset.color}/60 hover:text-${asset.color}`
              }`}
            >
              <i className={`${asset.icon === 'bitcoin' ? 'fab fa-bitcoin' : `fas fa-${asset.icon}`}`}></i>
              <span>{asset.label}</span>
            </Button>
          ))}
        </div>
        <div className="flex items-center space-x-2 text-sm text-quantum-text-secondary">
          <span>Last updated:</span>
          <span>
            {marketData?.[0]?.timestamp
              ? new Date(marketData[0].timestamp).toLocaleString()
              : "No data"}
          </span>
        </div>
      </div>
    </Card>
  );
}
