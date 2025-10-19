import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function DataExport() {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = async (type: string, endpoint: string, filename: string) => {
    setIsExporting(type);
    
    try {
      const response = await fetch(endpoint, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `${filename} has been downloaded`,
      });
    } catch (error) {
      console.error("Export error:", error);
      
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }

      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  const exportOptions = [
    {
      id: "historical",
      title: "Historical Data",
      description: "OHLCV data for all assets and timeframes",
      icon: "database",
      endpoint: "/api/export/historical-data?symbol=GOLD&timeframe=1D",
      filename: "historical_data.csv",
      color: "quantum-accent",
    },
    {
      id: "strategies",
      title: "Strategy Backtest",
      description: "Complete backtest results and metrics",
      icon: "chart-line",
      endpoint: "/api/export/strategies",
      filename: "strategies_export.csv",
      color: "quantum-success",
    },
    {
      id: "ai-report",
      title: "AI Analysis",
      description: "Detailed AI insights and predictions",
      icon: "brain",
      endpoint: "/api/ai-insights",
      filename: "ai_insights.json",
      color: "quantum-warning",
    },
  ];

  const handleGenerateReport = () => {
    toast({
      title: "Report Generation",
      description: "PDF report generation is not yet implemented",
      variant: "destructive",
    });
  };

  return (
    <Card className="bg-quantum-gray/50 backdrop-blur-sm border border-quantum-accent/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-quantum-text">Data Export & Reports</h3>
          <p className="text-quantum-text-secondary">Download historical data and analysis reports</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleGenerateReport}
            variant="outline"
            className="flex items-center space-x-2 border-quantum-accent/30 text-quantum-accent hover:bg-quantum-accent/10"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
            </svg>
            <span>PDF Report</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exportOptions.map((option) => (
          <div
            key={option.id}
            className={`p-4 bg-quantum-dark/30 rounded-xl border border-${option.color}/20 hover:border-${option.color}/40 transition-all duration-200`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 bg-${option.color}/20 rounded-lg flex items-center justify-center`}>
                <svg className={`w-5 h-5 text-${option.color}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-quantum-text">{option.title}</h4>
              </div>
            </div>
            
            <p className="text-sm text-quantum-text-secondary mb-4">{option.description}</p>
            
            <Button
              onClick={() => handleExport(option.id, option.endpoint, option.filename)}
              disabled={isExporting === option.id}
              className={`w-full bg-${option.color}/10 text-${option.color} hover:bg-${option.color}/20 border border-${option.color}/30`}
              variant="outline"
            >
              {isExporting === option.id ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Download</span>
                </div>
              )}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
