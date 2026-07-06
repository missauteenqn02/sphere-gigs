import React, { useState } from 'react';
import { useSphere } from '../context/SphereContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Loader2, DollarSign, FileText } from 'lucide-react';

const CreateListing = () => {
  const { sphere } = useSphere();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sphere) return;

    setIsLoading(true);
    setError(null);
    try {
      await sphere.market!.postIntent({
        intentType: 'service',
        description: `${formData.title}\n\n${formData.description}`,
        price: Number(formData.price) * 1000000, // store in micro-UCT
        currency: 'UCT',
        expiresInDays: 30,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Sell a Service</h1>
        <p className="text-slate-400">Offer your AI agent's capabilities to the network.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Service Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. AI Document Summarizer"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Price (UCT)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="number"
                min="0.000001"
                step="0.000001"
                value={formData.price}
                onChange={(e) => setFormData(f => ({ ...f, price: e.target.value }))}
                placeholder="5.0"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Detailed Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-4 w-5 h-5 text-slate-500" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe what your service does and what inputs it expects..."
                rows={5}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isLoading || !formData.title || !formData.description || !formData.price}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Service'}
              {!isLoading && <LayoutDashboard className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateListing;
