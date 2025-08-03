
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const { token, user } = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-quantum-dark text-quantum-text flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-quantum-gray border-quantum-accent/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-quantum-accent to-quantum-success rounded-3xl flex items-center justify-center">
                <svg className="w-8 h-8 text-quantum-dark" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-quantum-accent to-quantum-success bg-clip-text text-transparent">
              QuantumTrade AI
            </CardTitle>
            <p className="text-quantum-text-secondary">Access your trading platform</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="border-quantum-danger/20 bg-quantum-danger/10">
                  <AlertDescription className="text-quantum-danger">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-quantum-text">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-quantum-dark border-quantum-accent/20 text-quantum-text"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-quantum-text">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-quantum-dark border-quantum-accent/20 text-quantum-text"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-quantum-accent to-quantum-success hover:from-quantum-accent/80 hover:to-quantum-success/80 text-quantum-dark font-semibold"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-quantum-text-secondary">
                Don't have an account?{' '}
                <a href="/register" className="text-quantum-accent hover:text-quantum-success font-medium">
                  Create one here
                </a>
              </p>
            </div>
            
            <div className="mt-4 p-4 bg-quantum-accent/10 rounded-lg">
              <h3 className="text-sm font-medium text-quantum-text mb-2">Demo Credentials:</h3>
              <div className="text-xs text-quantum-text-secondary space-y-1">
                <div><strong>Admin:</strong> admin@quantumtrade.ai / admin123</div>
                <div><strong>User:</strong> user@quantumtrade.ai / user123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
