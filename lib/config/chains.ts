import { celo } from "viem/chains";

import { env } from "@/lib/config/env";

export const supportedChains = {
  celo: {
    id: env.CELO_CHAIN_ID,
    key: "celo",
    name: "Celo Mainnet",
    rpcUrl: env.CELO_RPC_URL,
    nativeCurrency: celo.nativeCurrency,
    explorerUrl: celo.blockExplorers?.default.url ?? "https://celoscan.io",
    viemChain: celo,
  },
} as const;

export type SupportedChainKey = keyof typeof supportedChains;
