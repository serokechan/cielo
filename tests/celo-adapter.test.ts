import { describe, expect, test } from "bun:test";

import {
  buildCeloTransferPayload,
  celoAdapterConfig,
  getCeloTokenContract,
  simulateCeloTransfer,
} from "../lib/chain/celo-adapter";
import { paymentPlanSchema } from "../lib/schemas";

const now = "2026-03-21T13:00:00.000Z";

function makePlan(overrides: {
  id?: string;
  token?: "cUSD" | "USDC";
  tokenAddress?: string | null;
  amount?: string;
  recipient?: string;
  status?: "ready" | "blocked" | "needs_clarification" | "draft" | "simulated" | "executed";
  simulationReady?: boolean;
} = {}) {
  const tokenAddress = "tokenAddress" in overrides ? overrides.tokenAddress : "0x765DE816845861e75A25fCA122bb6898B8B1282a";

  return paymentPlanSchema.parse({
    id: overrides.id ?? "plan_chain_1",
    intentId: "intent_chain_1",
    network: "celo",
    token: overrides.token ?? "cUSD",
    tokenAddress,
    amount: overrides.amount ?? "5",
    recipient: overrides.recipient ?? "0x1234567890abcdef1234567890abcdef12345678",
    estimatedFee: {
      amount: "0.001",
      currency: "CELO",
      usdEstimate: "0.01",
    },
    warnings: [],
    requiresConfirmation: true,
    simulationReady: overrides.simulationReady ?? true,
    status: overrides.status ?? "ready",
    createdAt: now,
  });
}

describe("Celo chain adapter", () => {
  test("exposes Celo adapter config", () => {
    expect(celoAdapterConfig.chainId).toBe(42220);
    expect(celoAdapterConfig.chainKey).toBe("celo");
    expect(celoAdapterConfig.rpcUrl).toContain("https://");
  });

  test("resolves stablecoin contract config", () => {
    const contract = getCeloTokenContract("cUSD");

    expect(contract.symbol).toBe("cUSD");
    expect(contract.decimals).toBe(18);
    expect(contract.address).toBe("0x765DE816845861e75A25fCA122bb6898B8B1282a");
  });

  test("builds ERC20 transfer payload from payment plan", () => {
    const payload = buildCeloTransferPayload(makePlan());

    expect(payload.chainId).toBe(42220);
    expect(payload.to).toBe("0x765DE816845861e75A25fCA122bb6898B8B1282a");
    expect(payload.data.startsWith("0xa9059cbb")).toBe(true);
    expect(payload.value).toBe("0x0");
  });

  test("simulates transfer and returns structured success result", async () => {
    const result = await simulateCeloTransfer(makePlan(), { now: new Date(now) });

    expect(result.mode).toBe("simulate");
    expect(result.status).toBe("simulated");
    expect(result.success).toBe(true);
    expect(result.txHash).toContain("0x");
    expect(result.error).toBeNull();
  });

  test("returns structured failure when plan cannot be simulated", async () => {
    const result = await simulateCeloTransfer(
      makePlan({
        id: "plan_chain_invalid",
        tokenAddress: null,
      }),
      { now: new Date(now) },
    );

    expect(result.mode).toBe("simulate");
    expect(result.status).toBe("failed");
    expect(result.success).toBe(false);
    expect(result.txHash).toBeNull();
    expect(result.error).toContain("token address");
  });
});
