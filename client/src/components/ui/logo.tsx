import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export function Logo({ size = 'medium' }: LogoProps) {
  // Size mappings
  const sizes = {
    small: {
      container: 'w-8 h-8',
      font: 'text-lg',
      outerRing: 'inset-0',
      middleRing: 'inset-1.5',
      core: 'inset-3',
      atomSize: 'w-4 h-4',
      nucleusSize: 'w-1.5 h-1.5',
      electronSize: 'w-1 h-1',
    },
    medium: {
      container: 'w-12 h-12',
      font: 'text-xl',
      outerRing: 'inset-0',
      middleRing: 'inset-2',
      core: 'inset-4',
      atomSize: 'w-6 h-6',
      nucleusSize: 'w-2 h-2',
      electronSize: 'w-1 h-1',
    },
    large: {
      container: 'w-16 h-16',
      font: 'text-2xl',
      outerRing: 'inset-0',
      middleRing: 'inset-3',
      core: 'inset-5',
      atomSize: 'w-8 h-8',
      nucleusSize: 'w-2.5 h-2.5',
      electronSize: 'w-1.5 h-1.5',
    },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center space-x-3">
      <div className="relative group">
        <div className={`${s.container} relative`}>
          {/* Outer Ring */}
          <div className={`absolute ${s.outerRing} rounded-xl border-2 border-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-spin shadow-lg shadow-cyan-500/25`} style={{ animationDuration: '8s' }}>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 blur-sm"></div>
          </div>
          
          {/* Middle Ring */}
          <div className={`absolute ${s.middleRing} rounded-xl border border-purple-400/60 rotate-45 animate-spin`} style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/10 via-pink-500/10 to-cyan-400/10"></div>
          </div>
          
          {/* Core */}
          <div className={`absolute ${s.core} rounded-lg bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800 border border-cyan-500/50 flex items-center justify-center`}>
            {/* Quantum Symbol */}
            <div className={`relative ${s.atomSize}`}>
              {/* Atom Nucleus */}
              <div className={`absolute top-1/2 left-1/2 ${s.nucleusSize} bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse`}></div>
              
              {/* Electron Orbits */}
              <div className="absolute inset-0 border border-cyan-400/60 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
                <div className={`absolute top-0 left-1/2 ${s.electronSize} bg-cyan-300 rounded-full transform -translate-x-1/2 -translate-y-1/2`}></div>
              </div>
              <div className="absolute inset-0 border border-purple-400/60 rounded-full rotate-45 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
                <div className={`absolute top-0 left-1/2 ${s.electronSize} bg-purple-300 rounded-full transform -translate-x-1/2 -translate-y-1/2`}></div>
              </div>
            </div>
          </div>
          
          {/* Energy Pulse */}
          <div className="absolute inset-0 rounded-xl border border-cyan-400/20 animate-ping"></div>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-ping"></div>
      </div>
      <div>
        <h1 className={`${s.font} font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent`}>
          QuantumTrade
        </h1>
        <p className="text-xs text-cyan-300/80 font-medium">AI Trading Platform</p>
      </div>
    </div>
  );
}
