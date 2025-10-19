
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const adminItems = [
    { icon: "chart-line", label: "Dashboard", href: "/", active: location === "/" },
    { icon: "brain", label: "AI Analysis", href: "/ai-analysis", active: location === "/ai-analysis" },
    { icon: "coins", label: "Assets", href: "/assets", active: location === "/assets" },
    { icon: "chess", label: "Strategies", href: "/strategies", active: location === "/strategies" },
    { icon: "briefcase", label: "Portfolio", href: "/portfolio", active: location === "/portfolio" },
    { icon: "chart-candlestick", label: "Trading", href: "/trading", active: location === "/trading" },
    { icon: "users", label: "User Management", href: "/user-management", active: location === "/user-management" },
    { icon: "shield-check", label: "Security", href: "/security", active: location === "/security" },
    { icon: "database", label: "Data Analytics", href: "/data-analytics", active: location === "/data-analytics" },
    { icon: "bell", label: "Alerts", href: "/alerts", active: location === "/alerts" },
    { icon: "cog", label: "Settings", href: "/settings", active: location === "/settings" },
  ];

  const userItems = [
    { icon: "chart-line", label: "Dashboard", href: "/", active: location === "/" },
    { icon: "brain", label: "AI Analysis", href: "/ai-analysis", active: location === "/ai-analysis" },
    { icon: "coins", label: "Assets", href: "/assets", active: location === "/assets" },
    { icon: "briefcase", label: "Portfolio", href: "/portfolio", active: location === "/portfolio" },
    { icon: "chart-candlestick", label: "Trading", href: "/trading", active: location === "/trading" },
    { icon: "bell", label: "Alerts", href: "/alerts", active: location === "/alerts" },
    { icon: "user", label: "Profile", href: "/profile", active: location === "/profile" },
  ];

  const navigationItems = user?.role === 'admin' ? adminItems : userItems;

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 border-r border-cyan-500/20 flex flex-col relative overflow-hidden">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
      
      {/* Logo Section */}
      <div className="p-6 border-b border-cyan-500/20 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div className="w-12 h-12 relative">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-xl border-2 border-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-spin shadow-lg shadow-cyan-500/25" style={{ animationDuration: '8s' }}>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 blur-sm"></div>
              </div>
              
              {/* Core */}
              <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800 border border-cyan-500/50 flex items-center justify-center">
                {/* Quantum Symbol */}
                <div className="relative w-6 h-6">
                  {/* Atom Nucleus */}
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                  
                  {/* Electron Orbits */}
                  <div className="absolute inset-0 border border-cyan-400/60 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
                    <div className="absolute top-0 left-1/2 w-1 h-1 bg-cyan-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                  <div className="absolute inset-0 border border-purple-400/60 rounded-full rotate-45 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
                    <div className="absolute top-0 left-1/2 w-1 h-1 bg-purple-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
              </div>
              
              {/* Energy Pulse */}
              <div className="absolute inset-0 rounded-xl border border-cyan-400/20 animate-ping"></div>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-ping"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              QuantumTrade
            </h1>
            <p className="text-sm text-cyan-300/80 font-medium">AI Trading Platform</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-cyan-500/20 relative z-10">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-purple-900/30 border border-cyan-500/20">
          <div className="relative">
            <img 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
              alt="User Profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400/50 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || "User"}
            </p>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                user?.role === 'admin' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              }`}>
                {user?.role === 'admin' ? '👑 Admin' : '🚀 Trader'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 relative z-10 overflow-y-auto">
        {navigationItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
              item.active
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-cyan-300 shadow-lg shadow-cyan-500/10"
                : "text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/30 hover:to-purple-700/20 hover:border hover:border-purple-400/20"
            }`}
          >
            {item.active && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 animate-pulse"></div>
            )}
            <div className={`w-5 h-5 flex items-center justify-center relative z-10 ${
              item.active ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-300'
            }`}>
              <i className={`fas fa-${item.icon} transition-transform duration-300 ${item.active ? 'scale-110' : 'group-hover:scale-110'}`}></i>
            </div>
            <span className={`font-medium relative z-10 ${item.active ? 'text-white' : 'group-hover:text-white'}`}>
              {item.label}
            </span>
            {item.active && (
              <div className="absolute right-2 w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
            )}
          </a>
        ))}
      </nav>

      {/* AI Status */}
      <div className="p-4 border-t border-cyan-500/20 relative z-10">
        <div className="bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border border-emerald-500/30 rounded-xl p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 animate-pulse"></div>
          <div className="flex items-center space-x-2 relative z-10">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-ping opacity-30"></div>
            </div>
            <span className="text-sm text-emerald-300 font-semibold">AI Engine Online</span>
          </div>
          <p className="text-xs text-emerald-200/80 mt-1 relative z-10">Neural networks processing...</p>
        </div>
      </div>

      {/* Logout Section */}
      <div className="p-4 border-t border-cyan-500/20 relative z-10">
        {user && (
          <div className="mb-4 p-3 bg-gradient-to-r from-slate-800/30 to-purple-900/20 rounded-xl border border-purple-500/20">
            <div className="text-sm font-medium text-white">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-slate-300">{user.email}</div>
            <div className="text-xs text-cyan-400 capitalize mt-1 font-medium">
              {user.role} • Full Access
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-red-900/20 hover:to-pink-900/20 hover:border hover:border-red-400/30 transition-all duration-300 group"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="fas fa-sign-out-alt transition-transform duration-300 group-hover:scale-110"></i>
          </div>
          <span className="font-medium">Disconnect</span>
        </button>
      </div>
    </aside>
  );
}
