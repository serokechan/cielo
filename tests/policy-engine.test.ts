import { describe, expect, test } from "bun:test";

import { evaluatePaymentIntentPolicy } from "../lib/policy-engine";
import { paymentIntentSchema, type TokenSymbolSchema } from "../lib/schemas";

const now = "2026-03-21T10:00:00.000Z";

function makeIntent(overrides: {
  amount?: string | null;
  token?: TokenSymbolSchema | null;
  recipient?: string | null;
  network?: "celo";
  rawText?: string;
} = {}) {
  const amount = "amount" in overrides ? overrides.amount : "5";
  const token = "token" in overrides ? overrides.token : "cUSD";
  const recipient = "recipient" in overrides ? overrides.recipient : "0x1234567890abcdef1234567890abcdef12345678";

  return paymentIntentSchema.parse({
    id: "intent_policy",
    rawText: overrides.rawText ?? "send 5 cUSD to 0x1234567890abcdef1234567890abcdef12345678 for lunch",
    amount,
    token,
    recipient,
    purpose: "lunch",
    network: overrides.network ?? "celo",
    urgency: "normal",
    missingFields: [],
    confidence: 1,
    status: "parsed",
    createdAt: now,
    updatedAt: now,
  });
}

describe("Cielo policy engine", () => {
  test("returns needs_confirmation for a valid intent", () => {
    const result = evaluatePaymentIntentPolicy(makeIntent());

    expect(result.decision).toBe("needs_confirmation");
    expect(result.allowed).toBe(true);
    expect(result.requiresConfirmation).toBe(true);
    expect(result.warnings.some((warning) => warning.code === "confirmation_required")).toBe(true);
  });

  test("blocks token outside allowlist", () => {
    const result = evaluatePaymentIntentPolicy(makeIntent({ token: "USDC" }), {
      allowedTokens: ["cUSD"],
    });

    expect(result.decision).toBe("blocked");
    expect(result.allowed).toBe(false);
    expect(result.warnings.some((warning) => warning.code === "unknown_token")).toBe(true);
  });

  test("blocks when network is outside allowlist", () => {
    const result = evaluatePaymentIntentPolicy(makeIntent(), {
      allowedNetworks: [],
    });

    expect(result.decision).toBe("blocked");
    expect(result.allowed).toBe(false);
    expect(result.warnings.some((warning) => warning.code === "unsupported_network")).toBe(true);
  });

  test("blocks invalid recipient format", () => {
    const result = evaluatePaymentIntentPolicy(makeIntent({ recipient: "0xabc" }));

    expect(result.decision).toBe("blocked");
    expect(result.allowed).toBe(false);
    expect(result.warnings.some((warning) => warning.code === "invalid_recipient")).toBe(true);
  });

  test("blocks when amount is above maxAmount", () => {
    const result = evaluatePaymentIntentPolicy(makeIntent({ amount: "250" }), {
      maxAmount: "100",
    });

    expect(result.decision).toBe("blocked");
    expect(result.allowed).toBe(false);
    expect(result.warnings.some((warning) => warning.code === "amount_too_high")).toBe(true);
  });

  test("marks missing amount and token as needs clarification", () => {
    const result = evaluatePaymentIntentPolicy(
      makeIntent({
        rawText: "send to 0x1234567890abcdef1234567890abcdef12345678",
        amount: null,
        token: null,
      }),
    );

    expect(result.decision).toBe("needs_clarification");
    expect(result.allowed).toBe(false);
    expect(result.warnings.filter((warning) => warning.code === "missing_field").map((warning) => warning.field)).toEqual([
      "amount",
      "token",
    ]);
  });
});
