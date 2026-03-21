import { describe, expect, test } from "bun:test";

import { confirmPaymentPlan, createPaymentPreview } from "../lib/payment-flow";

const now = new Date("2026-03-21T16:00:00.000Z");

describe("Cielo payment flow", () => {
  test("creates preview with parser, policy, and plan", () => {
    const preview = createPaymentPreview(
      "send 5 cUSD to 0x1234567890abcdef1234567890abcdef12345678 for lunch",
      {
        now,
      },
    );

    expect(preview.intent.status).toBe("parsed");
    expect(preview.policy.decision).toBe("needs_confirmation");
    expect(preview.plan.status).toBe("ready");
    expect(preview.plan.simulationReady).toBe(true);
  });

  test("creates needs clarification preview for ambiguous intent", () => {
    const preview = createPaymentPreview("send to 0x1234567890abcdef1234567890abcdef12345678", { now });

    expect(preview.intent.status).toBe("needs_clarification");
    expect(preview.policy.decision).toBe("needs_clarification");
    expect(preview.plan.status).toBe("needs_clarification");
  });

  test("confirms plan in simulate mode and returns simulated receipt", async () => {
    const preview = createPaymentPreview(
      "send 5 cUSD to 0x1234567890abcdef1234567890abcdef12345678 for lunch",
      { now },
    );

    const result = await confirmPaymentPlan(preview.plan, "simulate", {
      now,
      persistReceipt: false,
    });

    expect(result.execution.mode).toBe("simulate");
    expect(result.execution.status).toBe("simulated");
    expect(result.receipt.status).toBe("simulated");
    expect(result.receipt.txHash).toContain("0x");
  });

  test("returns failed receipt when execute mode cannot build transaction", async () => {
    const preview = createPaymentPreview(
      "send 5 cUSD to 0x1234567890abcdef1234567890abcdef12345678 for lunch",
      { now },
    );

    const invalidPlan = {
      ...preview.plan,
      tokenAddress: null,
    };

    const result = await confirmPaymentPlan(invalidPlan, "execute", {
      now,
      persistReceipt: false,
    });

    expect(result.execution.mode).toBe("execute");
    expect(result.execution.status).toBe("failed");
    expect(result.receipt.status).toBe("failed");
    expect(result.receipt.simulationResult).toContain("Execution failed");
  });
});
