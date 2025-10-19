import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import axiosClient from '../lib/axiosClient';
import { Logo } from '../components/ui/logo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number }>>([]);

  // Animated background effects
  useEffect(() => {
    // Initialize floating particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
    setParticles(newParticles);

    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + window.innerWidth) % window.innerWidth,
        y: (particle.y + particle.vy + window.innerHeight) % window.innerHeight,
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('Attempting login with:', email);
      const response = await axiosClient.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      console.log('Login successful, token received');
      login(token, user);
      setLocation('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
            top: '10%',
            left: '10%',
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePos.x * -0.01}px, ${mousePos.y * -0.01}px)`,
            top: '60%',
            right: '10%',
            animationDelay: '1s',
          }}
        />
        
        {/* Floating Particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              boxShadow: '0 0 6px rgba(34, 211, 238, 0.6)',
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} />
        </div>
      </div>
      
      {/* Login Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-slate-800/50 border border-cyan-500/20 backdrop-blur-xl rounded-2xl shadow-2xl shadow-cyan-500/5 overflow-hidden">
            {/* Top Border Gradient */}
            <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"></div>
            
            <div className="p-8">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <Logo size="large" />
              </div>
              
              <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              
              <p className="text-slate-400 text-center mb-8">
                Enter your credentials to access the platform
              </p>
              
              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-envelope text-slate-400"></i>
                    </div>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 w-full bg-slate-800/80 border border-slate-700 focus:border-cyan-500/50 text-white rounded-lg"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>
                
                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-300">Password</label>
                    <a href="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-lock text-slate-400"></i>
                    </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 w-full bg-slate-800/80 border border-slate-700 focus:border-cyan-500/50 text-white rounded-lg"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
                    <div className="flex">
                      <i className="fas fa-exclamation-circle mr-2 mt-0.5"></i>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                
                {/* Login Button */}
                <Button 
                  type="submit"
                  className="relative group w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign In to Platform
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
                </Button>
              </form>
              
              {/* Divider */}
              <div className="flex items-center mt-8 mb-6">
                <div className="flex-1 h-px bg-slate-700/50"></div>
                <div className="px-4 text-sm text-slate-500">or continue with</div>
                <div className="flex-1 h-px bg-slate-700/50"></div>
              </div>
              
              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center py-2.5 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition duration-150">
                  <i className="fab fa-google text-white mr-2"></i>
                  <span className="text-sm text-slate-300">Google</span>
                </button>
                <button className="flex items-center justify-center py-2.5 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition duration-150">
                  <i className="fab fa-github text-white mr-2"></i>
                  <span className="text-sm text-slate-300">GitHub</span>
                </button>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-8 py-4 bg-slate-800/80 border-t border-slate-700/50">
              <p className="text-sm text-slate-400 text-center">
                Don't have an account? <a href="/register" className="text-cyan-400 hover:text-cyan-300">Create one</a>
              </p>
            </div>
          </div>
          
          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center text-xs text-slate-500">
            <i className="fas fa-shield-alt mr-2 text-cyan-500/70"></i>
            <span>Secured with quantum encryption technology</span>
          </div>
        </div>
      </div>
    </div>
  );
}
