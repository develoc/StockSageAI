
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
}

export default function Users() {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const fetchUsers = async () => {
    try {
      // This would need to be implemented in the backend
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <i className="fas fa-user-plus mr-2"></i>
              Add User
            </Button>
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
                <p className="text-sm text-slate-400 mt-1">Active accounts</p>
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
                  Active Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-300">12</div>
                <p className="text-sm text-slate-400 mt-1">Online users</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-yellow-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-300 flex items-center">
                  <i className="fas fa-user-plus mr-2"></i>
                  New This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-300">3</div>
                <p className="text-sm text-slate-400 mt-1">Recent signups</p>
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
                  {users.map((user) => (
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
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={user.role === 'admin' 
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                          : "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                        }>
                          {user.role === 'admin' ? '👑 Admin' : '🚀 User'}
                        </Badge>
                        <Badge variant="outline" className="text-slate-400 border-slate-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Badge>
                        <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-300">
                          <i className="fas fa-edit mr-1"></i>
                          Edit
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
