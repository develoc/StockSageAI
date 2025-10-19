import { useQuery } from "@tanstack/react-query";
import { Bar } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createBarChartData, defaultChartOptions } from "@/lib/chartConfig";
import type { Strategy } from "@/types/market";

export default function StrategiesSection() {
  const { data: strategies, isLoading } = useQuery({
    queryKey: ["/api/strategies"],
    queryFn: async () => {
      const response = await fetch("/api/strategies", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch strategies");
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "quantum-success";
      case "testing":
        return "quantum-accent";
      case "paused":
        return "quantum-danger";
      default:
        return "quantum-text-secondary";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "quantum-success";
      case "medium":
        return "quantum-warning";
      case "high":
        return "quantum-danger";
      default:
        return "quantum-text-secondary";
    }
  };

  const performanceData = createBarChartData([12.5, 8.7, 15.3, 9.2], ["Q1", "Q2", "Q3", "Q4"]);

  const keyMetrics = [
    { label: "Sharpe Ratio", value: "2.34", color: "quantum-success" },
    { label: "Max Drawdown", value: "-8.7%", color: "quantum-danger" },
    { label: "Annual Return", value: "28.4%", color: "quantum-success" },
    { label: "Volatility", value: "12.1%", color: "quantum-warning" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Active Strategies */}
      <Card className="bg-quantum-gray/50 backdrop-blur-sm border border-quantum-accent/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-quantum-text">Active AI Strategies</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-quantum-accent hover:text-quantum-accent/80 text-sm font-medium"
          >
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-quantum-dark/30 border border-quantum-accent/20 rounded-xl animate-pulse">
                <div className="h-4 bg-quantum-accent/20 rounded mb-3"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-3 bg-quantum-text-secondary/20 rounded"></div>
                  <div className="h-3 bg-quantum-text-secondary/20 rounded"></div>
                  <div className="h-3 bg-quantum-text-secondary/20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : strategies && strategies.length > 0 ? (
          <div className="space-y-4">
            {strategies.slice(0, 3).map((strategy: Strategy) => {
              const statusColor = getStatusColor(strategy.status);
              const riskColor = getRiskColor(strategy.riskLevel);
              
              return (
                <div
                  key={strategy.id}
                  className={`p-4 bg-quantum-dark/30 border border-${statusColor}/20 rounded-xl hover:border-${statusColor}/40 transition-all duration-200`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-quantum-text">{strategy.name}</h4>
                    <Badge className={`bg-${statusColor}/20 text-${statusColor} capitalize`}>
                      {strategy.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-quantum-text-secondary block">Return</span>
                      <span className={`font-medium ${
                        strategy.returnRate && parseFloat(strategy.returnRate) > 0 
                          ? "text-quantum-success" 
                          : "text-quantum-danger"
                      }`}>
                        {strategy.returnRate ? `${parseFloat(strategy.returnRate).toFixed(1)}%` : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-quantum-text-secondary block">Risk</span>
                      <span className={`font-medium text-${riskColor} capitalize`}>
                        {strategy.riskLevel}
                      </span>
                    </div>
                    <div>
                      <span className="text-quantum-text-secondary block">Win Rate</span>
                      <span className="text-quantum-text font-medium">
                        {strategy.winRate ? `${parseFloat(strategy.winRate).toFixed(0)}%` : "N/A"}
                      </span>
                    </div>
                  </div>
                  
                  {strategy.symbols && Array.isArray(strategy.symbols) && (
                    <div className="mt-3 flex space-x-2">
                      {strategy.symbols.map((symbol, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-quantum-accent/30 text-quantum-accent"
                        >
                          {symbol}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-quantum-dark/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-quantum-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a5 5 0 01-5-5 5 5 0 015-5 5 5 0 015 5 5 5 0 01-5 5z" />
              </svg>
            </div>
            <p className="text-quantum-text-secondary text-sm">No strategies available</p>
          </div>
        )}
      </Card>

      {/* Performance Analytics */}
      <Card className="bg-quantum-gray/50 backdrop-blur-sm border border-quantum-accent/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-quantum-text mb-6">Performance Analytics</h3>
        
        {/* Performance Chart */}
        <div className="relative h-64 bg-quantum-dark/30 rounded-xl border border-quantum-accent/10 mb-6 p-4">
          <Bar data={performanceData} options={defaultChartOptions} />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {keyMetrics.map((metric, index) => (
            <div key={index} className="p-4 bg-quantum-dark/30 rounded-xl text-center">
              <h4 className="text-quantum-text-secondary text-sm mb-1">{metric.label}</h4>
              <p className={`text-2xl font-bold text-${metric.color}`}>{metric.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
