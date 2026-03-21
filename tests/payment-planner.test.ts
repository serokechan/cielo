import { describe, expect, test } from "bun:test";

import { createPaymentPlan } from "../lib/payment-planner";
import {
  paymentIntentSchema,
  policyResultSchema,
  type PaymentIntent,
  type PolicyDecision,
  type TokenSymbolSchema,
} from "../lib/schemas";

const now = new Date("2026-03-21T12:00:00.000Z");

function makeIntent(overrides: {
  id?: string;
  amount?: string | null;
  token?: TokenSymbolSchema | null;
  recipient?: string | null;
} = {}): PaymentIntent {
  return paymentIntentSchema.parse({
    id: overrides.id ?? "intent_plan_1",
    rawText: "send 5 cUSD to 0x1234567890abcdef1234567890abcdef12345678 for lunch",
    amount: overrides.amount ?? "5",
    token: overrides.token ?? "cUSD",
    recipient: overrides.recipient ?? "0x1234567890abcdef1234567890abcdef12345678",
    purpose: "lunch",
    network: "celo",
    urgency: "normal",
    missingFields: [],
    confidence: 1,
    status: "parsed",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });
}

function makePolicyResult(intentId: string, decision: PolicyDecision) {
  return policyResultSchema.parse({
    intentId,
    decision,
    allowed: decision === "needs_confirmation" || decision === "allowed",
    requiresConfirmation: true,
    warnings: [
      {
        code: "confirmation_required",
        severity: "info",
        message: "Explicit user confirmation is required before execution.",
      },
    ],
    allowedTokens: ["cUSD", "USDC"],
    allowedNetworks: ["celo"],
    maxAmount: "100",
    evaluatedAt: now.toISOString(),
  });
}

describe("Cielo payment planner", () => {
  test("creates a ready payment plan with token metadata and fee estimate", () => {
    const intent = makeIntent();
    const policyResult = makePolicyResult(intent.id, "needs_confirmation");

    const plan = createPaymentPlan(intent, policyResult, { now, id: "plan_1" });

    expect(plan.id).toBe("plan_1");
    expect(plan.intentId).toBe(intent.id);
    expect(plan.status).toBe("ready");
    expect(plan.simulationReady).toBe(true);
    expect(plan.tokenAddress).toBe("0x765DE816845861e75A25fCA122bb6898B8B1282a");
    expect(plan.estimatedFee.amount).toBe("0.001");
    expect(plan.estimatedFee.currency).toBe("CELO");
    expect(plan.warnings).toHaveLength(1);
  });

  test("marks plan blocked when policy blocks the request", () => {
    const intent = makeIntent({ id: "intent_plan_blocked" });
    const policyResult = makePolicyResult(intent.id, "blocked");

    const plan = createPaymentPlan(intent, policyResult, { now });

    expect(plan.status).toBe("blocked");
    expect(plan.simulationReady).toBe(false);
    expect(plan.requiresConfirmation).toBe(true);
  });

  test("marks plan as needs clarification when policy requires clarification", () => {
    const intent = makeIntent({
      id: "intent_plan_clarify",
      amount: null,
      token: null,
    });
    const policyResult = makePolicyResult(intent.id, "needs_clarification");

    const plan = createPaymentPlan(intent, policyResult, { now });

    expect(plan.status).toBe("needs_clarification");
    expect(plan.simulationReady).toBe(false);
  });

  test("resolves optional token metadata when contract address is unset", () => {
    const intent = makeIntent({
      id: "intent_plan_usdc",
      token: "USDC",
    });
    const policyResult = makePolicyResult(intent.id, "needs_confirmation");

    const plan = createPaymentPlan(intent, policyResult, { now });

    expect(plan.token).toBe("USDC");
    expect(plan.tokenAddress).toBeNull();
    expect(plan.status).toBe("ready");
  });
});
