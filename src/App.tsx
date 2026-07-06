import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Shield, LayoutDashboard, Search, Settings, Bot } from 'lucide-react';
import { SphereProvider, useSphere } from './context/SphereContext';
import Marketplace from './pages/Marketplace';
import CreateListing from './pages/CreateListing';
import OrderDetail from './pages/OrderDetail';
import Onboarding from './pages/Onboarding';

const Navbar = () => {
  const { identity, balance, isLoading, autoSellerEnabled, toggleAutoSeller } = useSphere();

  return (
    <nav className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-x-0 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-tight">
          <Shield className="w-6 h-6 text-blue-400" />
          Sphere Gigs
        </Link>
        <div className="flex items-center gap-4 text-sm text-slate-300 font-medium ml-4">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            <Search className="w-4 h-4" /> Browse
          </Link>
          <Link to="/create" className="hover:text-white transition-colors flex items-center gap-1">
            <LayoutDashboard className="w-4 h-4" /> Sell Service
          </Link>
        </div>
      </div>
      
      {!isLoading && identity && (
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleAutoSeller}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
              autoSellerEnabled 
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
            }`}
          >
            <Bot className="w-4 h-4" />
            {autoSellerEnabled ? 'Auto-Seller: ON' : 'Auto-Seller: OFF'}
          </button>
          
          <div className="bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 flex items-center gap-2">
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Balance</span>
            <span className="font-mono text-blue-400 font-medium">
              {(Number(balance) / 1000000).toFixed(2)} UCT
            </span>
          </div>
          <Link to="/onboarding" className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium border border-white/5 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {identity.nametag ? `@${identity.nametag}` : 'Settings'}
          </Link>
        </div>
      )}
    </nav>
  );
};

const AppContent = () => {
  const { isLoading, error, identity } = useSphere();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="glass-panel p-6 max-w-md text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Initialization Error</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!identity?.nametag) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/create" element={<CreateListing />} />
          <Route path="/order/:swapId" element={<OrderDetail />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <SphereProvider>
        <AppContent />
      </SphereProvider>
    </BrowserRouter>
  );
};

export default App;
