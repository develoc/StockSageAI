import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import type { AIInsight } from "@/types/market";

export default function AIInsights() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/ai-insights"],
    queryFn: async () => {
      const response = await fetch("/api/ai-insights?limit=5", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch AI insights");
      return response.json();
    },
  });

  const getInsightColor = (type: string, priority: string) => {
    if (type === "signal" && priority === "high") return "quantum-success";
    if (type === "alert") return "quantum-warning";
    if (type === "strategy_update") return "quantum-accent";
    return "quantum-text-secondary";
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "signal":
        return "arrow-trend-up";
      case "alert":
        return "exclamation-triangle";
      case "strategy_update":
        return "cog";
      default:
        return "info-circle";
    }
  };

  return (
    <Card className="bg-quantum-gray/50 backdrop-blur-sm border border-quantum-accent/20 rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-quantum-accent to-quantum-success rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-quantum-dark" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-quantum-text">AI Insights</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-quantum-dark/30 border border-quantum-accent/20 rounded-xl animate-pulse">
              <div className="h-4 bg-quantum-accent/20 rounded mb-2"></div>
              <div className="h-3 bg-quantum-text-secondary/20 rounded mb-1"></div>
              <div className="h-3 bg-quantum-text-secondary/20 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : insights && insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight: AIInsight) => {
            const color = getInsightColor(insight.type, insight.priority);
            const icon = getInsightIcon(insight.type);
            
            return (
              <div
                key={insight.id}
                className={`p-4 bg-quantum-dark/30 border border-${color}/30 rounded-xl hover:border-${color}/50 transition-all duration-200`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 bg-${color} rounded-full mt-2 ${insight.priority === 'high' ? 'animate-pulse' : ''}`}></div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium text-${color} mb-1`}>{insight.title}</h4>
                    <p className="text-sm text-quantum-text-secondary leading-relaxed">{insight.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-quantum-text-secondary">
                        Confidence: {parseFloat(insight.confidence).toFixed(0)}%
                      </span>
                      <span className="text-xs text-quantum-text-secondary">
                        {new Date(insight.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-quantum-dark/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-quantum-text-secondary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-quantum-text-secondary text-sm">No AI insights available</p>
          <p className="text-quantum-text-secondary text-xs mt-1">Check back later for market analysis</p>
        </div>
      )}

      {/* AI Processing Status */}
      <div className="mt-6 p-4 bg-quantum-dark/50 rounded-xl border border-quantum-accent/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-quantum-text-secondary">Processing Status</span>
          <span className="text-sm text-quantum-accent">Running</span>
        </div>
        <div className="w-full bg-quantum-dark rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-quantum-accent to-quantum-success h-2 rounded-full animate-pulse"
            style={{ width: "73%" }}
          ></div>
        </div>
        <p className="text-xs text-quantum-text-secondary mt-2">
          Analyzing market patterns across multiple timeframes...
        </p>
      </div>
    </Card>
  );
}
