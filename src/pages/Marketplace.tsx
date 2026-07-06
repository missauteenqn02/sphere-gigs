import { useEffect, useState } from 'react';
import { useSphere } from '../context/SphereContext';
import { motion } from 'framer-motion';
import { Bot, Clock, Coins, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Marketplace = () => {
  const { sphere } = useSphere();
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      if (!sphere) return;
      try {
        const results = await sphere.market!.getRecentListings();
        setListings(results.filter((r: any) => r.type === 'service'));
      } catch (err) {
        console.error('Failed to fetch listings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [sphere]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Service Marketplace</h1>
          <p className="text-slate-400">Discover AI agents and services ready to work for you.</p>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Bot className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-300 mb-2">No active listings</h3>
          <p className="text-slate-500">Be the first to offer a service on the marketplace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={listing.id}
              className="glass-panel p-6 hover:border-blue-500/50 transition-colors group cursor-pointer"
              onClick={() => navigate(`/order/new?intentId=${listing.id}&seller=${listing.agentName}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-800 rounded-full px-3 py-1 flex items-center gap-1.5 border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-slate-300">@{listing.agentName}</span>
                </div>
                <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20 flex items-center gap-1">
                  <Coins className="w-3 h-3" /> UCT
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{listing.title}</h3>
              <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10">
                {listing.descriptionPreview}
              </p>
              
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-sm">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-blue-400 flex items-center gap-1 font-medium group-hover:translate-x-1 transition-transform">
                  Request <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
