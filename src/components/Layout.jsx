import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, QrCode, UserCheck } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0f1d] text-slate-100">
      {/* Dynamic ambient gradients for a premium glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[140px] pointer-events-none" />
      
      {/* Top Navigation */}
      <header className="glass-panel sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3.5 flex justify-between items-center">
          <Link to="/registration" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                FestPitch & Events
              </span>
              <span className="hidden sm:inline-block text-[10px] text-indigo-400 ml-2 font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                Techmiya EdTech
              </span>
            </div>
          </Link>

          <nav className="flex items-center space-x-3 md:space-x-5">
            <Link 
              to="/registration" 
              className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname === '/registration' || location.pathname === '/' 
                  ? 'text-indigo-400 bg-indigo-500/10' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Register
            </Link>
            
            <Link 
              to="/scan" 
              className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/scan' 
                  ? 'text-indigo-400 bg-indigo-500/10' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <QrCode size={15} />
              <span>Gate Scanner</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-6 md:py-10 relative z-10 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-auto relative z-10 bg-slate-950/60 backdrop-blur-md">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-400 text-xs">
          <p>&copy; {new Date().getFullYear()} FestPitch • Powered by Techmiya EdTech. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Automated Email & QR Verification</span>
            <span>•</span>
            <Link to="/scan" className="hover:text-indigo-400 transition-colors">Organizer Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
