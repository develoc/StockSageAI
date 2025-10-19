import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/Sidebar";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Monitor,
  Moon,
  Sun,
  Globe,
  CreditCard,
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [theme, setTheme] = useState("dark");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

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

  const handleSave = () => {
    toast({
      title: "Settings Updated",
      description: "Your settings have been successfully saved.",
    });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quantum-dark">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-quantum-accent to-quantum-success rounded-xl flex items-center justify-center animate-pulse">
            <SettingsIcon className="w-6 h-6 text-quantum-dark" />
          </div>
          <p className="text-quantum-text-secondary">Loading settings...</p>
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
                <SettingsIcon className="w-6 h-6 text-quantum-accent" />
                System Configuration
              </h2>
              <p className="text-quantum-text-secondary">Customize your trading experience and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-quantum-success/10 border border-quantum-success/30 rounded-xl">
                <div className="w-2 h-2 bg-quantum-success rounded-full animate-pulse"></div>
                <span className="text-sm text-quantum-success font-medium">Settings Active</span>
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
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={handleSave}
              className="bg-quantum-accent hover:bg-quantum-accent/80"
            >
              Save Changes
            </Button>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-quantum-dark/50 border border-quantum-accent/20 mb-6">
              <TabsTrigger value="general" className="data-[state=active]:bg-quantum-accent data-[state=active]:text-quantum-dark">General</TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-quantum-accent data-[state=active]:text-quantum-dark">Appearance</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-quantum-accent data-[state=active]:text-quantum-dark">Notifications</TabsTrigger>
              <TabsTrigger value="trading" className="data-[state=active]:bg-quantum-accent data-[state=active]:text-quantum-dark">Trading</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-quantum-accent flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-quantum-text-secondary">First Name</label>
                      <Input
                        placeholder="Enter first name"
                        className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-quantum-text-secondary">Last Name</label>
                      <Input
                        placeholder="Enter last name"
                        className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-quantum-text-secondary">Email</label>
                    <Input
                      type="email"
                      placeholder="Enter email"
                      className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-quantum-text-secondary">Phone</label>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-quantum-accent flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Regional Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-quantum-text-secondary">Time Zone</label>
                      <select className="w-full bg-quantum-dark/50 border border-quantum-accent/20 rounded-md p-2 text-quantum-text">
                        <option>UTC</option>
                        <option>EST</option>
                        <option>PST</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-quantum-text-secondary">Currency</label>
                      <select className="w-full bg-quantum-dark/50 border border-quantum-accent/20 rounded-md p-2 text-quantum-text">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-quantum-accent flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Display Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium text-quantum-text">Theme</div>
                      <div className="text-sm text-quantum-text-secondary">
                        Select your preferred theme
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        onClick={() => setTheme("light")}
                        className={theme === "light" ? "bg-quantum-accent" : "border-quantum-accent text-quantum-accent hover:bg-quantum-accent/10"}
                      >
                        <Sun className="w-4 h-4 mr-2" />
                        Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        onClick={() => setTheme("dark")}
                        className={theme === "dark" ? "bg-quantum-accent" : "border-quantum-accent text-quantum-accent hover:bg-quantum-accent/10"}
                      >
                        <Moon className="w-4 h-4 mr-2" />
                        Dark
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-quantum-accent flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium text-quantum-text">Email Notifications</div>
                      <div className="text-sm text-quantum-text-secondary">
                        Receive important updates via email
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium text-quantum-text">Push Notifications</div>
                      <div className="text-sm text-quantum-text-secondary">
                        Get real-time alerts
                      </div>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trading" className="space-y-6">
              <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-quantum-accent flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Trading Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-quantum-text-secondary">Default Trade Size</label>
                      <Input
                        type="number"
                        placeholder="Enter default size"
                        className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-quantum-text-secondary">Risk Level</label>
                      <select className="w-full bg-quantum-dark/50 border border-quantum-accent/20 rounded-md p-2 text-quantum-text">
                        <option>Conservative</option>
                        <option>Moderate</option>
                        <option>Aggressive</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-quantum-text-secondary">Stop Loss Percentage</label>
                    <Input
                      type="number"
                      placeholder="Enter percentage"
                      className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-quantum-text-secondary">Take Profit Percentage</label>
                    <Input
                      type="number"
                      placeholder="Enter percentage"
                      className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
