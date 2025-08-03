
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number }>>([]);

  useEffect(() => {
    // Initialize floating particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = () => {
    window.location.href = "/login";
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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Quantum Logo */}
          <div className="mb-12 flex justify-center">
            <div className="relative group">
              {/* Outer Ring */}
              <div className="w-32 h-32 relative">
                <div className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-spin" style={{ animationDuration: '8s' }}>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 blur-xl"></div>
                </div>
                
                {/* Middle Ring */}
                <div className="absolute inset-3 rounded-full border-2 border-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/10 via-pink-500/10 to-cyan-400/10"></div>
                </div>
                
                {/* Core */}
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800 border border-cyan-500/50 flex items-center justify-center shadow-2xl shadow-cyan-500/25">
                  {/* Quantum Symbol */}
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 relative">
                        {/* Atom Nucleus */}
                        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                        
                        {/* Electron Orbits */}
                        <div className="absolute inset-0 border border-cyan-400/60 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
                          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-cyan-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                        <div className="absolute inset-0 border border-purple-400/60 rounded-full rotate-45 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
                          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-purple-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                        <div className="absolute inset-0 border border-pink-400/60 rounded-full rotate-90 animate-spin" style={{ animationDuration: '4s' }}>
                          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-pink-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Energy Pulses */}
                <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border border-purple-400/20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
              
              {/* Floating Data Points */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"
                  style={{
                    top: `${Math.max(10, Math.min(90, 20 + Math.sin((i * Math.PI) / 4) * 30))}%`,
                    left: `${Math.max(10, Math.min(90, 20 + Math.cos((i * Math.PI) / 4) * 30))}%`,
                    animationDelay: `${i * 0.2}s`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Title and Description */}
          <div className="mb-12 space-y-6">
            <h1 className="text-7xl font-bold mb-6 relative">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
                QuantumTrade
              </span>
              <div className="text-2xl mt-2 font-light">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Neural Intelligence Platform
                </span>
              </div>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Harness the power of quantum-enhanced AI algorithms to dominate financial markets. 
              Our neural networks process <span className="text-cyan-400 font-semibold">127 billion</span> data points 
              per second, delivering <span className="text-green-400 font-semibold">94.7% prediction accuracy</span> 
              across global markets.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-slate-800/50 border-cyan-500/20 backdrop-blur-xl hover:border-cyan-400/60 transition-all duration-500 group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-brain text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI Neural Engine</h3>
                <p className="text-slate-400">Advanced machine learning with quantum computing acceleration</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-xl hover:border-purple-400/60 transition-all duration-500 group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-chart-line text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Real-Time Analytics</h3>
                <p className="text-slate-400">Millisecond market analysis across 40+ global exchanges</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-green-500/20 backdrop-blur-xl hover:border-green-400/60 transition-all duration-500 group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-shield-alt text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Quantum Security</h3>
                <p className="text-slate-400">Bank-grade encryption with quantum-resistant protocols</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="space-y-6">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="relative group bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white font-bold px-12 py-4 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-cyan-500/25"
            >
              <span className="relative z-10 flex items-center">
                <i className="fas fa-rocket mr-3"></i>
                Launch Trading Platform
                <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform duration-300"></i>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            </Button>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Trading</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>AI Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Quantum Enhanced</span>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="mt-16 p-8 bg-gradient-to-r from-slate-800/50 via-purple-900/30 to-slate-800/50 rounded-3xl border border-cyan-500/20 backdrop-blur-xl">
            <h3 className="text-2xl font-bold text-white mb-6">Live Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">127.4%</div>
                <div className="text-sm text-slate-400">Annual Return</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">94.7%</div>
                <div className="text-sm text-slate-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">2.3ms</div>
                <div className="text-sm text-slate-400">Latency</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400 mb-2">$847M</div>
                <div className="text-sm text-slate-400">Assets Under Management</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
