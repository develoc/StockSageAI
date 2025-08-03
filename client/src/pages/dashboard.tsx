import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import KPICards from "@/components/KPICards";
import MainChart from "@/components/MainChart";
import AIInsights from "@/components/AIInsights";
import StrategiesSection from "@/components/StrategiesSection";
import DataExport from "@/components/DataExport";
import AdminPanel from "@/components/AdminPanel";
import StrategyGuide from "@/components/StrategyGuide";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quantum-dark">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-quantum-accent to-quantum-success rounded-xl flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-quantum-dark" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-quantum-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-quantum-text relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ top: '10%', left: '20%' }} />
        <div className="absolute w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ top: '60%', right: '20%', animationDelay: '2s' }} />
      </div>
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-quantum-gray border-b border-quantum-accent/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-quantum-text">AI Market Analysis Dashboard</h2>
              <p className="text-quantum-text-secondary">Real-time insights powered by quantum algorithms</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-quantum-success/10 border border-quantum-success/30 rounded-xl">
                <div className="w-2 h-2 bg-quantum-success rounded-full animate-pulse"></div>
                <span className="text-sm text-quantum-success font-medium">Markets Open</span>
              </div>
              <button
                onClick={() => window.location.href = "/api/logout"}
                className="px-4 py-2 text-quantum-text-secondary hover:text-quantum-text hover:bg-quantum-accent/10 rounded-xl transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-quantum-accent/20 px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-quantum-accent text-quantum-accent"
                  : "border-transparent text-quantum-text-secondary hover:text-quantum-text"
              }`}
            >
              Market Dashboard
            </button>
            <button
              onClick={() => setActiveTab("strategies")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === "strategies"
                  ? "border-quantum-accent text-quantum-accent"
                  : "border-transparent text-quantum-text-secondary hover:text-quantum-text"
              }`}
            >
              Profitable Strategies
            </button>
            {(user as any)?.role === 'admin' && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === "admin"
                    ? "border-quantum-accent text-quantum-accent"
                    : "border-transparent text-quantum-text-secondary hover:text-quantum-text"
                }`}
              >
                Admin Panel
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {activeTab === "dashboard" && (
            <>
              <KPICards />

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <MainChart />
                </div>
                <div>
                  <AIInsights />
                </div>
              </div>

              <StrategiesSection />
              <DataExport />
            </>
          )}

          {activeTab === "strategies" && (
            <StrategyGuide />
          )}

          {activeTab === "admin" && (user as any)?.role === 'admin' && (
            <AdminPanel />
          )}
        </div>
      </main>
    </div>
  );
}