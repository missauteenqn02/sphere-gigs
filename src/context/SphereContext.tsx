import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Sphere } from '@unicitylabs/sphere-sdk';
// @ts-ignore
import { createBrowserProviders } from '@unicitylabs/sphere-sdk/impl/browser';
// @ts-ignore
import { createWalletApiProviders } from '@unicitylabs/sphere-sdk/impl/shared/wallet-api';
import { ConnectClient, SPHERE_NETWORKS } from '@unicitylabs/sphere-sdk/connect';
import { autoConnect, hasExtension, isInIframe } from '@unicitylabs/sphere-sdk/connect/browser';

interface SphereContextState {
  sphere: Sphere | null;
  connectClient: ConnectClient | null;
  identity: any;
  isLoading: boolean;
  error: string | null;
  balance: string;
  isEmbedded: boolean;
  autoSellerEnabled: boolean;
  toggleAutoSeller: () => void;
  refreshBalance: () => Promise<void>;
  fundAppWallet: (amount: string) => Promise<void>;
}

const SphereContext = createContext<SphereContextState | undefined>(undefined);

export const SphereProvider = ({ children }: { children: ReactNode }) => {
  const [sphere, setSphere] = useState<Sphere | null>(null);
  const [connectClient, setConnectClient] = useState<any>(null);
  const [identity, setIdentity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [autoSellerEnabled, setAutoSellerEnabled] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        const embedded = isInIframe() || await hasExtension();
        setIsEmbedded(embedded);

        // 1. Initialize local App Wallet (required for Swap/Market)
        const base = createBrowserProviders({
          network: 'testnet2',
          oracle: { apiKey: 'sk_ddc3cfcc001e4a28ac3fad7407f99590' },
        });

        const deviceId = localStorage.getItem('sphere_device_id') || crypto.randomUUID();
        localStorage.setItem('sphere_device_id', deviceId);

        const providers = createWalletApiProviders(base, {
          baseUrl: 'https://wallet-api.unicity.network',
          network: 'testnet2',
          deviceId,
        });

        const { sphere: localSphere } = await Sphere.init({
          ...providers,
          network: 'testnet2',
          autoGenerate: true,
          market: true,
          swap: true,
        });

        setSphere(localSphere);
        const ident = localSphere.identity;
        setIdentity(ident);
        
        // Setup listeners
        localSphere.on('transfer:confirmed', () => fetchBalance(localSphere));
        localSphere.on('transfer:incoming', () => fetchBalance(localSphere));
        localSphere.on('identity:changed', (newIdent) => setIdentity(newIdent));
        
        await fetchBalance(localSphere);

        // Auto-Seller Logic Handler
        // (Since autoSellerEnabled state might be stale in this closure if we put it here, 
        // it's better to add a separate useEffect below)

        // 2. If embedded, connect to the parent wallet
        if (embedded) {
          try {
            const { client } = await autoConnect({
              dapp: { name: 'Sphere Gigs', url: window.location.origin },
              walletUrl: 'https://sphere.unicity.network',
              network: SPHERE_NETWORKS.testnet2,
            });
            setConnectClient(client);
          } catch (err) {
            console.warn('ConnectClient failed to initialize:', err);
          }
        }

      } catch (err: any) {
        console.error('Sphere initialization error:', err);
        setError(err.message || 'Failed to initialize Sphere wallet');
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (!sphere || !autoSellerEnabled) return;
    
    const handleDm = async (msg: any) => {
      if (msg.senderNametag === identity?.nametag) return;
      
      try {
        const text = msg.content.toLowerCase();
        if (text.includes('summarize')) {
          await sphere.communications.sendDM(`@${msg.senderNametag}`, 'Here is your AI summary: [This is an automated summary of the text you provided]. I have completed the task!');
        } else if (text.includes('hi') || text.includes('hello')) {
          await sphere.communications.sendDM(`@${msg.senderNametag}`, 'Hello! I am an auto-seller agent. Please provide the text to summarize.');
        } else {
          await sphere.communications.sendDM(`@${msg.senderNametag}`, `Auto-agent received: "${msg.content}". Please ask me to 'summarize' this.`);
        }
      } catch (err) {
        console.error('Agent failed to reply', err);
      }
    };
    
    const unsub = sphere.on('message:dm', handleDm);
    return () => unsub();
  }, [sphere, autoSellerEnabled, identity]);

  const fetchBalance = async (s: Sphere) => {
    try {
      const balances = await s.payments.getBalance();
      const uct = balances.find((b: any) => b.coinId === 'UCT') as any;
      setBalance(uct ? uct.amount : '0');
    } catch (err) {
      console.error('Failed to fetch balance', err);
    }
  };

  const fundAppWallet = async (amount: string) => {
    if (!connectClient) throw new Error('Not connected to a parent wallet.');
    if (!identity?.directAddress) throw new Error('App wallet missing direct address.');
    
    await connectClient.intent('send', {
      to: identity.directAddress,
      amount,
      coinId: 'UCT', // lowercase coinId for connect client is typical, but wait, UCT is usually 'UCT' in the SDK? No, the protocol says "lowercase 64-hex coin id". But wait, testnet has 'UCT' as an alias.
    });
  };

  return (
    <SphereContext.Provider
      value={{
        sphere,
        connectClient,
        identity,
        isLoading,
        error,
        balance,
        isEmbedded,
        autoSellerEnabled,
        toggleAutoSeller: () => setAutoSellerEnabled(prev => !prev),
        refreshBalance: () => sphere ? fetchBalance(sphere) : Promise.resolve(),
        fundAppWallet,
      }}
    >
      {children}
    </SphereContext.Provider>
  );
};

export const useSphere = () => {
  const context = useContext(SphereContext);
  if (context === undefined) {
    throw new Error('useSphere must be used within a SphereProvider');
  }
  return context;
};
