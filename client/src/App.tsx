import React from "react";
import { Router, Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Portfolio from "./pages/portfolio";
import Trading from "./pages/trading";
import Profile from "./pages/profile";
import NotFound from "./pages/not-found";
import { useAuth } from "./hooks/useAuth";
import AIAnalysis from "./pages/ai-analysis";
import Assets from "./pages/assets";
import Strategies from "./pages/strategies";
import Users from "./pages/users";
import Register from "./pages/register";
import UserManagement from "./pages/user-management";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-quantum-dark flex items-center justify-center">
        <div className="text-quantum-text">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster />
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/portfolio">
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          </Route>
          <Route path="/trading">
            <ProtectedRoute>
              <Trading />
            </ProtectedRoute>
          </Route>
          <Route path="/profile">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Route>
          <Route path="/ai-analysis">
            <ProtectedRoute>
              <AIAnalysis />
            </ProtectedRoute>
          </Route>
          <Route path="/assets">
            <ProtectedRoute>
              <Assets />
            </ProtectedRoute>
          </Route>
          <Route path="/strategies">
            <ProtectedRoute>
              <Strategies />
            </ProtectedRoute>
          </Route>
          <Route path="/users">
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          </Route>
          <Route path="/user-management">
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Router>
    </QueryClientProvider>
  );
}

export default App;