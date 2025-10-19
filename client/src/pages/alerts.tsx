import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import {
  Bell,
  Plus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Settings,
  Info,
} from "lucide-react";

interface Alert {
  id: string;
  type: "price" | "trend" | "volume" | "news";
  asset: string;
  condition: string;
  value: number;
  active: boolean;
  createdAt: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "price",
    asset: "BTC",
    condition: "above",
    value: 45000,
    active: true,
    createdAt: "2025-08-17T10:00:00Z",
  },
  {
    id: "2",
    type: "trend",
    asset: "GOLD",
    condition: "below",
    value: 2000,
    active: true,
    createdAt: "2025-08-17T09:30:00Z",
  },
  {
    id: "3",
    type: "volume",
    asset: "OIL",
    condition: "above",
    value: 1000000,
    active: false,
    createdAt: "2025-08-16T15:45:00Z",
  },
];

export default function Alerts() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [showNewAlert, setShowNewAlert] = useState(false);

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

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quantum-dark">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-quantum-accent to-quantum-success rounded-xl flex items-center justify-center animate-pulse">
            <Bell className="w-6 h-6 text-quantum-dark" />
          </div>
          <p className="text-quantum-text-secondary">Loading alerts...</p>
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
              <h2 className="text-2xl font-bold text-quantum-text flex items-center gap-2">
                <Bell className="w-6 h-6 text-quantum-accent" />
                Alert Management System
              </h2>
              <p className="text-quantum-text-secondary">Monitor market conditions and get notified instantly</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-quantum-success/10 border border-quantum-success/30 rounded-xl">
                <div className="w-2 h-2 bg-quantum-success rounded-full animate-pulse"></div>
                <span className="text-sm text-quantum-success font-medium">{alerts.filter(a => a.active).length} Active</span>
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

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {showNewAlert && (
            <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-quantum-accent flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-quantum-text-secondary">Asset</label>
                      <Input
                        placeholder="e.g., BTC, GOLD"
                        className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-quantum-text-secondary">Alert Type</label>
                      <select className="w-full bg-quantum-dark/50 border border-quantum-accent/20 rounded-md p-2 text-quantum-text">
                        <option value="price">Price Alert</option>
                        <option value="trend">Trend Alert</option>
                        <option value="volume">Volume Alert</option>
                        <option value="news">News Alert</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-quantum-text-secondary">Condition</label>
                      <select className="w-full bg-quantum-dark/50 border border-quantum-accent/20 rounded-md p-2 text-quantum-text">
                        <option value="above">Above</option>
                        <option value="below">Below</option>
                        <option value="equals">Equals</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-quantum-text-secondary">Value</label>
                      <Input
                        type="number"
                        placeholder="Enter value"
                        className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewAlert(false)}
                      className="border-quantum-accent text-quantum-accent hover:bg-quantum-accent/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-quantum-accent hover:bg-quantum-accent/80"
                    >
                      Create Alert
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between items-center">
            <Button
              onClick={() => setShowNewAlert(true)}
              className="bg-quantum-accent hover:bg-quantum-accent/80"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Alert
            </Button>
          </div>

          <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-quantum-accent flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Active Alerts
                </CardTitle>
                <Button variant="outline" className="border-quantum-accent text-quantum-accent hover:bg-quantum-accent/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Alert Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 border border-quantum-accent/20 rounded-lg hover:bg-quantum-dark/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      {alert.type === "price" && (
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      )}
                      {alert.type === "trend" && (
                        <TrendingUp className="w-5 h-5 text-quantum-success" />
                      )}
                      {alert.type === "volume" && (
                        <TrendingDown className="w-5 h-5 text-quantum-accent" />
                      )}
                      <div>
                        <div className="font-medium text-quantum-text">{alert.asset}</div>
                        <div className="text-sm text-quantum-text-secondary">
                          {alert.condition} {alert.value}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={alert.active ? "default" : "secondary"}
                        className={alert.active ? "bg-quantum-success/20 text-quantum-success border-quantum-success/30" : "bg-quantum-gray/50 text-quantum-text-secondary"}
                      >
                        {alert.active ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={alert.active}
                        onCheckedChange={() => toggleAlert(alert.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                        className="text-red-400 hover:text-red-500 hover:bg-red-400/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-quantum-accent flex items-center gap-2">
                <Info className="w-5 h-5" />
                Alert History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                  <div>
                    <div className="font-medium text-quantum-text">BTC Price Alert</div>
                    <div className="text-sm text-quantum-text-secondary">Triggered at $44,500</div>
                  </div>
                  <div className="text-sm text-quantum-text-secondary">2 hours ago</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                  <div>
                    <div className="font-medium text-quantum-text">GOLD Volume Spike</div>
                    <div className="text-sm text-quantum-text-secondary">Volume exceeded 1M</div>
                  </div>
                  <div className="text-sm text-quantum-text-secondary">5 hours ago</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                  <div>
                    <div className="font-medium text-quantum-text">OIL Trend Change</div>
                    <div className="text-sm text-quantum-text-secondary">Bearish pattern detected</div>
                  </div>
                  <div className="text-sm text-quantum-text-secondary">1 day ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
