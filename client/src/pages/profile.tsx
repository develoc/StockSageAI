
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Shield, Bell, Key, Activity, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImageUrl?: string;
  createdAt: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketAlerts: boolean;
    weeklyReports: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  tradingSettings: {
    riskLevel: 'conservative' | 'moderate' | 'aggressive';
    maxPositionSize: number;
    stopLossPercentage: number;
    takeProfitPercentage: number;
    allowedSymbols: string[];
  };
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Load user profile data
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          
          // Mock complete profile data
          const mockProfile: UserProfile = {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName || 'John',
            lastName: userData.lastName || 'Doe',
            role: userData.role,
            profileImageUrl: userData.profileImageUrl,
            createdAt: userData.createdAt || new Date().toISOString(),
            preferences: {
              emailNotifications: true,
              pushNotifications: true,
              marketAlerts: true,
              weeklyReports: false,
              theme: 'dark'
            },
            tradingSettings: {
              riskLevel: 'moderate',
              maxPositionSize: 25000,
              stopLossPercentage: 2.0,
              takeProfitPercentage: 6.0,
              allowedSymbols: ['GOLD', 'BTC', 'OIL', 'SILVER']
            }
          };
          
          setProfile(mockProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!profile) return;
    
    setProfile(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handlePreferenceChange = (preference: string, value: boolean) => {
    if (!profile) return;
    
    setProfile(prev => ({
      ...prev!,
      preferences: {
        ...prev!.preferences,
        [preference]: value
      }
    }));
  };

  const handleTradingSettingChange = (setting: string, value: any) => {
    if (!profile) return;
    
    setProfile(prev => ({
      ...prev!,
      tradingSettings: {
        ...prev!.tradingSettings,
        [setting]: value
      }
    }));
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-quantum-dark text-quantum-text p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-blue mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-dark text-quantum-text p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-quantum-blue">Profile Settings</h1>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="border-quantum-border text-quantum-text"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-quantum-blue hover:bg-quantum-blue/80"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-quantum-blue hover:bg-quantum-blue/80"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {message && (
          <Alert className={`${message.type === 'success' ? 'border-green-500' : 'border-red-500'} bg-quantum-surface`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-quantum-surface">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="bg-quantum-surface border-quantum-border">
              <CardHeader>
                <CardTitle className="text-quantum-blue">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.profileImageUrl} />
                    <AvatarFallback className="bg-quantum-blue text-white text-lg">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h3>
                      <Badge variant="outline" className="border-quantum-blue text-quantum-blue">
                        {profile.role.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-quantum-text/70 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </p>
                    <p className="text-quantum-text/70 text-sm">
                      Member since {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="bg-quantum-dark border-quantum-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="bg-quantum-dark border-quantum-border"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="bg-quantum-dark border-quantum-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-quantum-surface border-quantum-border">
              <CardHeader>
                <CardTitle className="text-quantum-blue">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-quantum-text/70">Receive trading alerts and updates via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={profile.preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-quantum-text/70">Real-time notifications in your browser</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={profile.preferences.pushNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketAlerts">Market Alerts</Label>
                    <p className="text-sm text-quantum-text/70">Get notified of significant market movements</p>
                  </div>
                  <Switch
                    id="marketAlerts"
                    checked={profile.preferences.marketAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange('marketAlerts', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyReports">Weekly Reports</Label>
                    <p className="text-sm text-quantum-text/70">Receive weekly performance summaries</p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={profile.preferences.weeklyReports}
                    onCheckedChange={(checked) => handlePreferenceChange('weeklyReports', checked)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <Card className="bg-quantum-surface border-quantum-border">
              <CardHeader>
                <CardTitle className="text-quantum-blue">Trading Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxPosition">Max Position Size ($)</Label>
                    <Input
                      id="maxPosition"
                      type="number"
                      value={profile.tradingSettings.maxPositionSize}
                      onChange={(e) => handleTradingSettingChange('maxPositionSize', parseFloat(e.target.value))}
                      disabled={!isEditing}
                      className="bg-quantum-dark border-quantum-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="riskLevel">Risk Level</Label>
                    <select
                      id="riskLevel"
                      value={profile.tradingSettings.riskLevel}
                      onChange={(e) => handleTradingSettingChange('riskLevel', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-quantum-dark border border-quantum-border rounded-md text-quantum-text"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">Stop Loss (%)</Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      step="0.1"
                      value={profile.tradingSettings.stopLossPercentage}
                      onChange={(e) => handleTradingSettingChange('stopLossPercentage', parseFloat(e.target.value))}
                      disabled={!isEditing}
                      className="bg-quantum-dark border-quantum-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="takeProfit">Take Profit (%)</Label>
                    <Input
                      id="takeProfit"
                      type="number"
                      step="0.1"
                      value={profile.tradingSettings.takeProfitPercentage}
                      onChange={(e) => handleTradingSettingChange('takeProfitPercentage', parseFloat(e.target.value))}
                      disabled={!isEditing}
                      className="bg-quantum-dark border-quantum-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allowed Trading Symbols</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.tradingSettings.allowedSymbols.map((symbol) => (
                      <Badge key={symbol} variant="outline" className="border-quantum-blue text-quantum-blue">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-quantum-text/70">
                    Configure which assets you want to trade. Contact support to modify this list.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-quantum-surface border-quantum-border">
              <CardHeader>
                <CardTitle className="text-quantum-blue">Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-quantum-dark rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Key className="w-5 h-5 text-quantum-blue" />
                      <div>
                        <h4 className="font-medium">Change Password</h4>
                        <p className="text-sm text-quantum-text/70">Update your account password</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-quantum-border">
                      Change
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-quantum-dark rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-quantum-blue" />
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-quantum-text/70">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-400">
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-quantum-dark rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-quantum-blue" />
                      <div>
                        <h4 className="font-medium">Login Activity</h4>
                        <p className="text-sm text-quantum-text/70">View recent login sessions</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-quantum-border">
                      View Activity
                    </Button>
                  </div>
                </div>

                <Alert className="bg-quantum-dark border-quantum-border">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your account is secured with industry-standard encryption. 
                    Last security scan: {new Date().toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
