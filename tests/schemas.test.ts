import { describe, expect, test } from "bun:test";

import {
  paymentIntentSchema,
  paymentPlanSchema,
  policyResultSchema,
  receiptSchema,
} from "../lib/schemas";

const now = "2026-03-19T20:10:00.000Z";

describe("Cielo Phase 2 schemas", () => {
  test("validates PaymentIntent with parsed payment fields", () => {
    const parsed = paymentIntentSchema.parse({
      id: "intent_1",
      rawText: "send 5 cUSD to 0xabc for lunch",
      amount: "5",
      token: "cUSD",
      recipient: "0xabc",
      purpose: "lunch",
      network: "celo",
      urgency: "normal",
      missingFields: [],
      confidence: 0.92,
      status: "parsed",
      createdAt: now,
      updatedAt: now,
    });

    expect(parsed.token).toBe("cUSD");
    expect(parsed.network).toBe("celo");
    expect(parsed.status).toBe("parsed");
  });

  test("rejects PaymentIntent confidence outside 0..1", () => {
    expect(() =>
      paymentIntentSchema.parse({
        id: "intent_2",
        rawText: "send 5 cUSD",
        amount: "5",
        token: "cUSD",
        recipient: null,
        purpose: null,
        network: "celo",
        urgency: "normal",
        missingFields: ["recipient"],
        confidence: 1.2,
        status: "needs_clarification",
        createdAt: now,
        updatedAt: now,
      }),
    ).toThrow();
  });

  test("validates PolicyResult with warnings", () => {
    const parsed = policyResultSchema.parse({
      intentId: "intent_1",
      decision: "needs_confirmation",
      allowed: true,
      requiresConfirmation: true,
      warnings: [
        {
          code: "confirmation_required",
          severity: "info",
          message: "Human approval is required before execution.",
        },
      ],
      allowedTokens: ["cUSD", "USDC"],
      allowedNetworks: ["celo"],
      maxAmount: "100",
      evaluatedAt: now,
    });

    expect(parsed.allowed).toBe(true);
    expect(parsed.warnings).toHaveLength(1);
  });

  test("validates PaymentPlan with fee estimate", () => {
    const parsed = paymentPlanSchema.parse({
      id: "plan_1",
      intentId: "intent_1",
      network: "celo",
      token: "cUSD",
      tokenAddress: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      amount: "5",
      recipient: "0xabc",
      estimatedFee: {
        amount: "0.001",
        currency: "CELO",
        usdEstimate: "0.01",
      },
      warnings: [],
      requiresConfirmation: true,
      simulationReady: true,
      status: "ready",
      createdAt: now,
    });

    expect(parsed.simulationReady).toBe(true);
    expect(parsed.estimatedFee.currency).toBe("CELO");
  });

  test("validates Receipt for simulated execution", () => {
    const parsed = receiptSchema.parse({
      id: "receipt_1",
      paymentPlanId: "plan_1",
      mode: "simulate",
      status: "simulated",
      network: "celo",
      token: "cUSD",
      amount: "5",
      recipient: "0xabc",
      txHash: null,
      simulationResult: "Simulation succeeded",
      explorerUrl: null,
      warnings: [],
      createdAt: now,
    });

    expect(parsed.mode).toBe("simulate");
    expect(parsed.status).toBe("simulated");
  });
});
