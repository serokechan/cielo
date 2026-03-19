import { z } from "zod";

const envSchema = z.object({
  CELO_RPC_URL: z.string().url().default("https://forno.celo.org"),
  CELO_CHAIN_ID: z.coerce.number().default(42220),
  CELO_USDC_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Cielo"),
  NEXT_PUBLIC_DEFAULT_NETWORK: z.string().default("celo"),
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(input: Partial<Record<keyof AppEnv, string | number | undefined>>) {
  return envSchema.parse({
    CELO_RPC_URL: input.CELO_RPC_URL,
    CELO_CHAIN_ID: input.CELO_CHAIN_ID,
    CELO_USDC_ADDRESS: input.CELO_USDC_ADDRESS,
    NEXT_PUBLIC_APP_NAME: input.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_DEFAULT_NETWORK: input.NEXT_PUBLIC_DEFAULT_NETWORK,
  });
}

export const env = parseEnv({
  CELO_RPC_URL: process.env.CELO_RPC_URL,
  CELO_CHAIN_ID: process.env.CELO_CHAIN_ID,
  CELO_USDC_ADDRESS: process.env.CELO_USDC_ADDRESS,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_DEFAULT_NETWORK: process.env.NEXT_PUBLIC_DEFAULT_NETWORK,
});
