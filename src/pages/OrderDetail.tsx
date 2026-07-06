import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSphere } from '../context/SphereContext';
import { ShieldCheck, MessageSquare, Loader2, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderDetail = () => {
  const { swapId } = useParams();
  const [searchParams] = useSearchParams();
  const sellerNametag = searchParams.get('seller');
  const { sphere, identity } = useSphere();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [swapRef, setSwapRef] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = swapId === 'new';
  const role = isNew ? 'proposer' : (swapRef?.role || 'unknown');
  
  // Real-time state syncing
  useEffect(() => {
    if (!sphere || isNew) return;
    
    // Load existing swap
    const loadSwap = async () => {
      const swaps = await sphere.swap.getSwaps();
      const match = swaps.find((s: any) => s.swapId === swapId);
      if (match) setSwapRef(match);
    };
    loadSwap();

    const unsubSwap = sphere.on('swap:announced', loadSwap);
    const unsubSwap2 = sphere.on('swap:deposits_covered', loadSwap);
    const unsubSwap3 = sphere.on('swap:completed', loadSwap);
    
    return () => {
      unsubSwap(); unsubSwap2(); unsubSwap3();
    };
  }, [sphere, swapId, isNew]);

  // Load and subscribe to DMs
  useEffect(() => {
    if (!sphere || !sellerNametag) return;
    
    const loadDms = async () => {
      try {
        const peerPubkey = await sphere.communications.resolvePeerNametag(sellerNametag);
        if (peerPubkey) {
          const conversation = sphere.communications.getConversation(peerPubkey) || [];
          setMessages(conversation);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadDms();

    const unsubDm = sphere.on('message:dm', (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => unsubDm();
  }, [sphere, sellerNametag]);

  const handleSendDm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sphere || !sellerNametag || !inputMsg.trim()) return;
    try {
      await sphere.communications.sendDM(`@${sellerNametag}`, inputMsg);
      setInputMsg('');
      // Optimistic update handled by event listener if it fires immediately, else append manually
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleProposeSwap = async () => {
    if (!sphere || !sellerNametag) return;
    setIsLoading(true);
    try {
      const { swapId: newSwapId } = await sphere.swap.proposeSwap({
        partyA: `@${identity.nametag}`, // Buyer deposits UCT
        partyB: `@${sellerNametag}`,   // Seller deposits 0
        partyACurrency: 'UCT',
        partyAAmount: '5000000', // Hardcoded 5 UCT for this demo since we didn't fetch price
        partyBCurrency: 'USDU', // Seller doesn't deposit anything but needs a currency string
        partyBAmount: '0',
        timeout: 86400, // 24h
        escrowAddress: '@escrow', // A real/fake escrow nametag
      }, { message: "I'd like to purchase your service. Funds are ready." });
      
      // Update URL to active swap
      window.history.pushState({}, '', `/order/${newSwapId}?seller=${sellerNametag}`);
      setSwapRef({ progress: 'proposed' });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSwap = async () => {
    // For the seller to accept incoming proposal
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
      {/* Escrow Status Panel */}
      <div className="lg:col-span-1 glass-panel p-6 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" /> Escrow Status
        </h2>

        <div className="flex-1 space-y-6">
          {/* Status Steps */}
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-blue-500 bg-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <CheckCircle2 className="w-3 h-3 text-blue-500" />
              </div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-slate-700 bg-slate-800/50">
                <p className="text-sm font-medium text-white">Requested</p>
              </div>
            </div>

            <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${!swapRef ? 'opacity-50' : ''}`}>
              <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${swapRef ? 'border-blue-500 bg-blue-500' : 'border-slate-700 bg-slate-900'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                <Lock className={`w-3 h-3 ${swapRef ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-slate-700 bg-slate-800/50">
                <p className="text-sm font-medium text-white">Funds Locked</p>
                <p className="text-xs text-slate-400">In smart escrow</p>
              </div>
            </div>

            <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${swapRef?.progress !== 'completed' ? 'opacity-50' : ''}`}>
              <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${swapRef?.progress === 'completed' ? 'border-blue-500 bg-blue-500' : 'border-slate-700 bg-slate-900'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                <CheckCircle2 className={`w-3 h-3 ${swapRef?.progress === 'completed' ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-slate-700 bg-slate-800/50">
                <p className="text-sm font-medium text-white">Completed</p>
              </div>
            </div>

          </div>
        </div>

        {error && <div className="text-red-400 text-sm mb-4">{error}</div>}

        <div className="pt-4 border-t border-slate-800 mt-auto">
          {isNew && role === 'proposer' && (
            <button
              onClick={handleProposeSwap}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay & Lock Escrow'}
              {!isLoading && <Lock className="w-5 h-5" />}
            </button>
          )}
          
          {swapRef?.progress === 'awaiting_counter' && (
            <div className="text-center text-sm text-slate-400 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
              Waiting for seller to accept and deliver...
            </div>
          )}
        </div>
      </div>

      {/* DM Interface */}
      <div className="lg:col-span-2 glass-panel flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-slate-400" />
          <div>
            <h3 className="font-medium text-white">@{sellerNametag}</h3>
            <p className="text-xs text-slate-400">Direct Message Negotiation</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Send a message to negotiate details or provide input data.
            </div>
          ) : (
            messages.map((m, i) => {
              const isMine = m.senderNametag === identity.nametag;
              return (
                <div key={i} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl ${isMine ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'}`}>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSendDm} className="p-4 bg-slate-900/50 border-t border-slate-800">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 pl-4 pr-12 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderDetail;
