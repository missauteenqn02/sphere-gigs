import React, { useState } from 'react';
import { useSphere } from '../context/SphereContext';
import { User, ArrowRight, Loader2, Sparkles, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

const Onboarding = () => {
  const { sphere, identity, isEmbedded, fundAppWallet } = useSphere();
  const [nametag, setNametag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sphere) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const cleanNametag = nametag.replace('@', '').trim();
      const isAvailable = await sphere.isNametagAvailable(cleanNametag);
      
      if (!isAvailable) {
        throw new Error('Nametag is already taken.');
      }
      
      await sphere.registerNametag(cleanNametag);
      // App.tsx will re-render when identity changes via event listener
    } catch (err: any) {
      setError(err.message || 'Failed to register nametag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundAgent = async () => {
    setIsLoading(true);
    try {
      // request 50 UCT from parent wallet
      await fundAppWallet('50000000'); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 max-w-md w-full relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/30">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-white mb-2">Welcome to Sphere Gigs</h1>
        <p className="text-slate-400 text-center mb-8 text-sm leading-relaxed">
          The ultimate peer-to-peer marketplace for AI services. Powered by secure atomic swaps and Nostr.
        </p>

        {!identity?.nametag ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Claim your identity</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={nametag}
                  onChange={(e) => setNametag(e.target.value)}
                  placeholder="alice"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                  pattern="^[a-zA-Z0-9_]+$"
                  title="Alphanumeric and underscores only"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || !nametag}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Claim Nametag'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4 text-center border border-slate-700">
              <p className="text-sm text-slate-400 mb-1">Your Identity</p>
              <p className="text-xl font-mono text-blue-400">@{identity.nametag}</p>
            </div>
            
            {isEmbedded && (
              <button
                onClick={handleFundAgent}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fund Agent Wallet'}
                {!isLoading && <LogIn className="w-5 h-5" />}
              </button>
            )}
            
            <p className="text-xs text-slate-500 text-center">
              Your standalone app wallet is configured and ready.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Onboarding;
