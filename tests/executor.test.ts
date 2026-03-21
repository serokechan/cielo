import { describe, expect, test } from "bun:test";

import { executePaymentPlan } from "../lib/executor";
import { paymentPlanSchema } from "../lib/schemas";

const now = "2026-03-21T14:00:00.000Z";

function makePlan(overrides: {
  id?: string;
  tokenAddress?: string | null;
  status?: "draft" | "ready" | "blocked" | "needs_clarification" | "simulated" | "executed";
  simulationReady?: boolean;
} = {}) {
  const tokenAddress = "tokenAddress" in overrides ? overrides.tokenAddress : "0x765DE816845861e75A25fCA122bb6898B8B1282a";

  return paymentPlanSchema.parse({
    id: overrides.id ?? "plan_exec_1",
    intentId: "intent_exec_1",
    network: "celo",
    token: "cUSD",
    tokenAddress,
    amount: "5",
    recipient: "0x1234567890abcdef1234567890abcdef12345678",
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

describe("Cielo execution engine", () => {
  test("runs simulate mode and returns execution summary", async () => {
    const result = await executePaymentPlan(makePlan(), {
      mode: "simulate",
      now: new Date(now),
    });

    expect(result.mode).toBe("simulate");
    expect(result.status).toBe("simulated");
    expect(result.success).toBe(true);
    expect(result.txHash).toContain("0x");
    expect(result.error).toBeNull();
  });

  test("runs execute mode and returns tx hash on success", async () => {
    const result = await executePaymentPlan(makePlan({ id: "plan_exec_2" }), {
      mode: "execute",
      now: new Date(now),
    });

    expect(result.mode).toBe("execute");
    expect(result.status).toBe("success");
    expect(result.success).toBe(true);
    expect(result.txHash).toContain("0x");
    expect(result.error).toBeNull();
  });

  test("returns failure summary when execute mode receives invalid plan", async () => {
    const result = await executePaymentPlan(
      makePlan({
        id: "plan_exec_invalid",
        tokenAddress: null,
      }),
      {
        mode: "execute",
        now: new Date(now),
      },
    );

    expect(result.mode).toBe("execute");
    expect(result.status).toBe("failed");
    expect(result.success).toBe(false);
    expect(result.txHash).toBeNull();
    expect(result.error).toContain("token address");
  });
});
