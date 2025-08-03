import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSeeding, setIsSeeding] = useState(false);

  const seedDatabaseMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/seed-database", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to seed database");
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Database Seeded Successfully",
        description: `Added ${data.data.strategies} strategies, ${data.data.insights} AI insights, and ${data.data.marketDataPoints} market data points`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/strategies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/market-data"] });
    },
    onError: (error) => {
      toast({
        title: "Seeding Failed",
        description: "Failed to seed database. Please try again.",
        variant: "destructive",
      });
      console.error("Seeding error:", error);
    },
  });

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await seedDatabaseMutation.mutateAsync();
    } finally {
      setIsSeeding(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Card className="bg-quantum-gray/50 backdrop-blur-sm border border-quantum-danger/20 rounded-2xl p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-quantum-danger/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-quantum-danger" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-quantum-text mb-2">Access Denied</h3>
          <p className="text-quantum-text-secondary">Admin privileges required to access this panel</p>
        </div>
      </Card>
    );
  }

  const adminActions = [
    {
      id: "seed-database",
      title: "Seed Trading Strategies",
      description: "Load proven AI trading strategies with 30 years of backtested data",
      icon: "database",
      color: "quantum-accent",
      action: handleSeedDatabase,
      disabled: isSeeding || seedDatabaseMutation.isPending,
      status: "ready"
    },
    {
      id: "market-data",
      title: "Update Market Data",
      description: "Refresh historical and real-time market data for all assets",
      icon: "refresh",
      color: "quantum-success",
      action: () => toast({ title: "Coming Soon", description: "Real-time data integration in development" }),
      disabled: false,
      status: "development"
    },
    {
      id: "ai-insights",
      title: "Generate AI Insights",
      description: "Run AI analysis algorithms to generate new market insights",
      icon: "brain",
      color: "quantum-warning",
      action: () => toast({ title: "Coming Soon", description: "AI insight generation in development" }),
      disabled: false,
      status: "development"
    }
  ];

  const strategyMetrics = [
    { label: "Active Strategies", value: "6", color: "quantum-success" },
    { label: "Avg. Return", value: "34.7%", color: "quantum-success" },
    { label: "Max Drawdown", value: "8.7%", color: "quantum-danger" },
    { label: "Sharpe Ratio", value: "2.34", color: "quantum-accent" },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-quantum-gray/50 backdrop-blur-sm border border-quantum-accent/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-quantum-text">Admin Control Panel</h3>
            <p className="text-quantum-text-secondary">Manage trading strategies and system data</p>
          </div>
          <Badge className="bg-quantum-accent/20 text-quantum-accent">
            Admin Access
          </Badge>
        </div>

        {/* Strategy Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {strategyMetrics.map((metric, index) => (
            <div key={index} className="p-4 bg-quantum-dark/30 rounded-xl text-center">
              <h4 className="text-quantum-text-secondary text-sm mb-1">{metric.label}</h4>
              <p className={`text-lg font-bold text-${metric.color}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminActions.map((action) => (
            <div
              key={action.id}
              className={`p-4 bg-quantum-dark/30 rounded-xl border border-${action.color}/20 hover:border-${action.color}/40 transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-${action.color}/20 rounded-lg flex items-center justify-center`}>
                  <svg className={`w-5 h-5 text-${action.color}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <Badge 
                  className={`text-xs ${
                    action.status === 'ready' 
                      ? 'bg-quantum-success/20 text-quantum-success' 
                      : 'bg-quantum-warning/20 text-quantum-warning'
                  }`}
                >
                  {action.status}
                </Badge>
              </div>
              
              <h4 className="font-medium text-quantum-text mb-2">{action.title}</h4>
              <p className="text-sm text-quantum-text-secondary mb-4">{action.description}</p>
              
              <Button
                onClick={action.action}
                disabled={action.disabled}
                className={`w-full bg-${action.color}/10 text-${action.color} hover:bg-${action.color}/20 border border-${action.color}/30`}
                variant="outline"
              >
                {action.disabled && (isSeeding || seedDatabaseMutation.isPending) ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Execute</span>
                )}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Strategy Performance Details */}
      <Card className="bg-quantum-gray/50 backdrop-blur-sm border border-quantum-accent/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-quantum-text mb-4">Advanced Strategy Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-quantum-dark/30 rounded-xl">
            <h4 className="text-quantum-text font-medium mb-3">Risk-Adjusted Returns</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-quantum-text-secondary">Quantum Momentum Alpha</span>
                <span className="text-quantum-success">2.47</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-quantum-text-secondary">Energy Futures Arbitrage</span>
                <span className="text-quantum-success">1.89</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-quantum-text-secondary">Digital Asset Trend</span>
                <span className="text-quantum-success">3.21</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-quantum-dark/30 rounded-xl">
            <h4 className="text-quantum-text font-medium mb-3">Monthly Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-quantum-text-secondary">January 2024</span>
                <span className="text-quantum-success">+7.3%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-quantum-text-secondary">February 2024</span>
                <span className="text-quantum-success">+12.1%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-quantum-text-secondary">March 2024</span>
                <span className="text-quantum-success">+9.8%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}