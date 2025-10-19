
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
  walletAddress?: string;
  isActive: boolean;
  lastLogin?: string;
}

export default function UserManagement() {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // New user form state
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "user",
    password: "",
    walletAddress: ""
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User created successfully"
        });
        setIsCreateDialogOpen(false);
        setNewUser({
          email: "",
          firstName: "",
          lastName: "",
          role: "user",
          password: "",
          walletAddress: ""
        });
        fetchUsers();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create user",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 items-center justify-center">
        <div className="text-red-400 text-center">
          <i className="fas fa-shield-alt text-4xl mb-4"></i>
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p>Admin privileges required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                👥 User Management
              </h1>
              <p className="text-slate-400 mt-2">Manage platform users and permissions</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  <i className="fas fa-user-plus mr-2"></i>
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the platform with role-based access.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-white">First Name</label>
                      <Input
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white">Last Name</label>
                      <Input
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white">Email</label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white">Password</label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white">Role</label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white">Wallet Address (Optional)</label>
                    <Input
                      value={newUser.walletAddress}
                      onChange={(e) => setNewUser({ ...newUser, walletAddress: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="0x..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createUser} className="bg-gradient-to-r from-purple-500 to-pink-500">
                    Create User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-slate-800 border-slate-700 text-white"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-cyan-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-300 flex items-center">
                  <i className="fas fa-users mr-2"></i>
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-300">{users.length}</div>
                <p className="text-sm text-slate-400 mt-1">Registered accounts</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-300 flex items-center">
                  <i className="fas fa-crown mr-2"></i>
                  Admins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-300">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <p className="text-sm text-slate-400 mt-1">Admin accounts</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-300 flex items-center">
                  <i className="fas fa-user-check mr-2"></i>
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-300">
                  {users.filter(u => u.isActive).length}
                </div>
                <p className="text-sm text-slate-400 mt-1">Active accounts</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-yellow-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-300 flex items-center">
                  <i className="fas fa-wallet mr-2"></i>
                  With Wallets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-300">
                  {users.filter(u => u.walletAddress).length}
                </div>
                <p className="text-sm text-slate-400 mt-1">Connected wallets</p>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Platform Users</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-slate-400">Loading users...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.firstName ? user.firstName[0] : user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.email
                            }
                          </div>
                          <div className="text-slate-400 text-sm">{user.email}</div>
                          {user.walletAddress && (
                            <div className="text-cyan-400 text-xs font-mono">
                              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={user.role === 'admin' 
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                          : "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                        }>
                          {user.role === 'admin' ? '👑 Admin' : '🚀 User'}
                        </Badge>
                        <Badge className={user.isActive 
                          ? "bg-green-500/20 text-green-300 border-green-500/50"
                          : "bg-red-500/20 text-red-300 border-red-500/50"
                        }>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="text-slate-400 border-slate-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-cyan-500/50 text-cyan-300"
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                        >
                          <i className={`fas fa-${user.isActive ? 'pause' : 'play'} mr-1`}></i>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
