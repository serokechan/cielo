import { env, type AppEnv } from "@/lib/config/env";

export type StablecoinConfig = {
  symbol: string;
  name: string;
  chain: "celo";
  address: string | null;
  decimals: number;
  isReady: boolean;
  notes?: string;
};

export function makeCeloStablecoins(config: AppEnv): Record<string, StablecoinConfig> {
  return {
    cUSD: {
      symbol: "cUSD",
      name: "Celo Dollar",
      chain: "celo",
      address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      decimals: 18,
      isReady: true,
      notes: "Default MVP stablecoin for Celo transfers.",
    },
    USDC: {
      symbol: "USDC",
      name: "USD Coin",
      chain: "celo",
      address: config.CELO_USDC_ADDRESS ?? null,
      decimals: 6,
      isReady: Boolean(config.CELO_USDC_ADDRESS),
      notes: "Optional secondary stablecoin. Set CELO_USDC_ADDRESS after confirming the canonical contract for demo use.",
    },
  };
}

export const celoStablecoins = makeCeloStablecoins(env);
