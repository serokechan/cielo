import { celo } from "viem/chains";

import { env, type AppEnv } from "@/lib/config/env";

export function makeSupportedChains(config: AppEnv) {
  return {
    celo: {
      id: config.CELO_CHAIN_ID,
      key: "celo",
      name: "Celo Mainnet",
      rpcUrl: config.CELO_RPC_URL,
      nativeCurrency: celo.nativeCurrency,
      explorerUrl: celo.blockExplorers?.default.url ?? "https://celoscan.io",
      viemChain: celo,
    },
  } as const;
}

export const supportedChains = makeSupportedChains(env);

export type SupportedChainKey = keyof typeof supportedChains;
