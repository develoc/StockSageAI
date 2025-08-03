import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import type { KPIMetric } from "@/types/market";

export default function KPICards() {
  const { data: portfolios } = useQuery({
    queryKey: ["/api/portfolios"],
  });

  const { data: goldPrice } = useQuery({
    queryKey: ["/api/market-data/GOLD/latest"],
  });

  const { data: oilPrice } = useQuery({
    queryKey: ["/api/market-data/OIL/latest"],
  });

  const { data: btcPrice } = useQuery({
    queryKey: ["/api/market-data/BTC/latest"],
  });

  const kpiMetrics: KPIMetric[] = [
    {
      id: "portfolio",
      title: "Total Portfolio Value",
      value: portfolios?.[0]?.totalValue ? `$${parseFloat(portfolios[0].totalValue).toLocaleString()}` : "$0",
      change: "+12.5%",
      changeType: "positive",
      icon: "chart-line",
      gradient: "from-quantum-accent to-quantum-success",
    },
    {
      id: "gold",
      title: "Gold Performance",
      value: goldPrice ? `$${parseFloat(goldPrice.close).toFixed(2)}` : "$0.00",
      change: "+8.2%",
      changeType: "positive",
      icon: "coins",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      id: "oil",
      title: "Oil Futures",
      value: oilPrice ? `$${parseFloat(oilPrice.close).toFixed(2)}` : "$0.00",
      change: "-2.1%",
      changeType: "negative",
      icon: "fire",
      gradient: "from-orange-500 to-red-500",
    },
    {
      id: "crypto",
      title: "Crypto Index",
      value: btcPrice ? `$${parseFloat(btcPrice.close).toLocaleString()}` : "$0",
      change: "+15.7%",
      changeType: "positive",
      icon: "bitcoin",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiMetrics.map((metric) => (
        <Card
          key={metric.id}
          className="bg-quantum-gray/50 backdrop-blur-sm border border-quantum-accent/20 rounded-2xl p-6 hover:border-quantum-accent/40 transition-all duration-300 animate-fade-in"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${metric.gradient} rounded-xl flex items-center justify-center`}>
              <i className={`fab fa-${metric.icon === 'bitcoin' ? 'bitcoin' : `fas fa-${metric.icon}`} text-white text-lg`}></i>
            </div>
            <span className={`text-sm font-medium ${
              metric.changeType === "positive" ? "text-quantum-success" : "text-quantum-danger"
            }`}>
              {metric.change}
            </span>
          </div>
          <h3 className="text-quantum-text-secondary text-sm mb-1">{metric.title}</h3>
          <p className="text-2xl font-bold text-quantum-text">{metric.value}</p>
        </Card>
      ))}
    </div>
  );
}
