import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import { Shield, Key, Smartphone, Mail } from "lucide-react";

export default function Security() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

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

  const handleTwoFactorToggle = async () => {
    try {
      // TODO: Implement 2FA toggle with backend
      setTwoFactorEnabled(!twoFactorEnabled);
      toast({
        title: !twoFactorEnabled ? "2FA Enabled" : "2FA Disabled",
        description: !twoFactorEnabled
          ? "Two-factor authentication has been enabled for your account."
          : "Two-factor authentication has been disabled for your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update 2FA settings.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password change
    toast({
      title: "Password Updated",
      description: "Your password has been successfully updated.",
    });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-quantum-dark">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-quantum-accent to-quantum-success rounded-xl flex items-center justify-center animate-pulse">
            <Shield className="w-6 h-6 text-quantum-dark" />
          </div>
          <p className="text-quantum-text-secondary">Loading security settings...</p>
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
                <Shield className="w-6 h-6 text-quantum-accent" />
                Security Center
              </h2>
              <p className="text-quantum-text-secondary">Advanced security controls and account protection</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-quantum-success/10 border border-quantum-success/30 rounded-xl">
                <div className="w-2 h-2 bg-quantum-success rounded-full animate-pulse"></div>
                <span className="text-sm text-quantum-success font-medium">Security Active</span>
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
          <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-quantum-accent flex items-center gap-2">
                <Key className="w-5 h-5" />
                Password Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label htmlFor="current-password" className="text-sm text-quantum-text-secondary">Current Password</label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                      className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="new-password" className="text-sm text-quantum-text-secondary">New Password</label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-sm text-quantum-text-secondary">Confirm New Password</label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-quantum-accent hover:bg-quantum-accent/80">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-quantum-accent flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-quantum-text">Two-Factor Authentication</div>
                  <div className="text-sm text-quantum-text-secondary">
                    Add an extra layer of security to your account
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-quantum-accent flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Security Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-quantum-text">Email Notifications</div>
                  <div className="text-sm text-quantum-text-secondary">
                    Receive notifications about security events
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              {emailNotifications && (
                <div className="pt-4 space-y-2">
                  <div className="text-sm text-quantum-text-secondary">Notification Email</div>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter notification email"
                      className="bg-quantum-dark/50 border-quantum-accent/20 text-quantum-text"
                    />
                    <Button className="bg-quantum-accent hover:bg-quantum-accent/80">
                      Update
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-quantum-gray/50 border-quantum-accent/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-quantum-accent">Recent Security Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                  <div>
                    <div className="font-medium text-quantum-text">Password Changed</div>
                    <div className="text-sm text-quantum-text-secondary">2 days ago</div>
                  </div>
                  <Badge className="bg-quantum-success/20 text-quantum-success border-quantum-success/30">Success</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                  <div>
                    <div className="font-medium text-quantum-text">New Login</div>
                    <div className="text-sm text-quantum-text-secondary">3 days ago from New York, US</div>
                  </div>
                  <Badge className="bg-quantum-success/20 text-quantum-success border-quantum-success/30">Success</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-quantum-accent/20">
                  <div>
                    <div className="font-medium text-quantum-text">Failed Login Attempt</div>
                    <div className="text-sm text-quantum-text-secondary">5 days ago from Unknown Location</div>
                  </div>
                  <Badge variant="destructive" className="bg-red-400/20 text-red-400 border-red-400/30">Failed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
