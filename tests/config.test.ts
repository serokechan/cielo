import { describe, expect, test } from "bun:test";

import { makeSupportedChains } from "../lib/config/chains";
import { parseEnv } from "../lib/config/env";
import { makeCeloStablecoins } from "../lib/config/tokens";

describe("Cielo config", () => {
  test("uses sane defaults for MVP setup", () => {
    const parsed = parseEnv({});

    expect(parsed.CELO_RPC_URL).toBe("https://forno.celo.org");
    expect(parsed.CELO_CHAIN_ID).toBe(42220);
    expect(parsed.NEXT_PUBLIC_APP_NAME).toBe("Cielo");
    expect(parsed.NEXT_PUBLIC_DEFAULT_NETWORK).toBe("celo");
  });

  test("can derive a custom Celo chain config from env", () => {
    const parsed = parseEnv({
      CELO_RPC_URL: "https://example-celo-rpc.test",
      CELO_CHAIN_ID: "42220",
      NEXT_PUBLIC_APP_NAME: "Cielo",
      NEXT_PUBLIC_DEFAULT_NETWORK: "celo",
    });

    const chains = makeSupportedChains(parsed);

    expect(chains.celo.id).toBe(42220);
    expect(chains.celo.rpcUrl).toBe("https://example-celo-rpc.test");
    expect(chains.celo.name).toBe("Celo Mainnet");
  });

  test("marks cUSD ready by default and USDC optional until configured", () => {
    const defaultTokens = makeCeloStablecoins(parseEnv({}));

    expect(defaultTokens.cUSD.isReady).toBe(true);
    expect(defaultTokens.cUSD.address).toBe("0x765DE816845861e75A25fCA122bb6898B8B1282a");
    expect(defaultTokens.USDC.isReady).toBe(false);
    expect(defaultTokens.USDC.address).toBeNull();

    const configuredTokens = makeCeloStablecoins(
      parseEnv({
        CELO_USDC_ADDRESS: "0x1234567890abcdef1234567890abcdef12345678",
      }),
    );

    expect(configuredTokens.USDC.isReady).toBe(true);
    expect(configuredTokens.USDC.address).toBe("0x1234567890abcdef1234567890abcdef12345678");
  });
});
