"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { monadTestnet } from "wagmi/chains";

const rpcUrl = process.env.NEXT_PUBLIC_MONAD_RPC_URL;

const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors: [injected()],
  ssr: true,
  transports: {
    [monadTestnet.id]: rpcUrl ? http(rpcUrl) : http(),
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}