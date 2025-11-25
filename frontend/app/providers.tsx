'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import {Chain, polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';


 const amoyChain = {
  id: 80002,
  name: 'Polygon Amoy',
  network: 'amoy',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-amoy.polygon.technology'] },
    public: { http: ['https://rpc-amoy.polygon.technology'] },
  },
  testnet: true,
};

// const config = createConfig({
//   chains: [polygonAmoy],
//   connectors: [
//     injected(),
//   ],
//   transports: {
//     [polygonAmoy.id]: http(),
//   },
// });

const config = getDefaultConfig({
  appName: 'AI JobMatch',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [amoyChain],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}