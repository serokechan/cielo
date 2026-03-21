import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { describe, expect, test } from "bun:test";

import {
  appendReceiptToStore,
  buildReceiptFromExecution,
  formatReceipt,
  readReceiptStore,
} from "../lib/receipts";
import { executionSummarySchema, paymentPlanSchema } from "../lib/schemas";

const now = "2026-03-21T15:00:00.000Z";

function makePlan() {
  return paymentPlanSchema.parse({
    id: "plan_receipt_1",
    intentId: "intent_receipt_1",
    network: "celo",
    token: "cUSD",
    tokenAddress: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    amount: "5",
    recipient: "0x1234567890abcdef1234567890abcdef12345678",
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
}

describe("Cielo receipt layer", () => {
  test("builds receipt for simulate mode", () => {
    const execution = executionSummarySchema.parse({
      paymentPlanId: "plan_receipt_1",
      mode: "simulate",
      status: "simulated",
      success: true,
      txHash: "0xabc",
      error: null,
      executedAt: now,
    });

    const receipt = buildReceiptFromExecution(makePlan(), execution, {
      id: "receipt_1",
      now: new Date(now),
    });

    expect(receipt.id).toBe("receipt_1");
    expect(receipt.mode).toBe("simulate");
    expect(receipt.status).toBe("simulated");
    expect(receipt.token).toBe("cUSD");
    expect(receipt.amount).toBe("5");
    expect(receipt.txHash).toBe("0xabc");
    expect(receipt.simulationResult).toContain("Simulated");
  });

  test("stores and reloads receipts from local log", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "cielo-receipts-"));
    const storePath = join(tempDir, "receipts.json");

    const execution = executionSummarySchema.parse({
      paymentPlanId: "plan_receipt_1",
      mode: "execute",
      status: "success",
      success: true,
      txHash: "0xdef",
      error: null,
      executedAt: now,
    });

    const receipt = buildReceiptFromExecution(makePlan(), execution, {
      id: "receipt_2",
      now: new Date(now),
    });

    await appendReceiptToStore(receipt, { storePath });
    const loaded = await readReceiptStore({ storePath });

    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe("receipt_2");
    expect(loaded[0].status).toBe("success");

    const rawFile = await readFile(storePath, "utf8");
    expect(rawFile).toContain("receipt_2");
  });

  test("formats a human-readable receipt", () => {
    const execution = executionSummarySchema.parse({
      paymentPlanId: "plan_receipt_1",
      mode: "execute",
      status: "failed",
      success: false,
      txHash: null,
      error: "Insufficient funds",
      executedAt: now,
    });

    const receipt = buildReceiptFromExecution(makePlan(), execution, {
      id: "receipt_3",
      now: new Date(now),
    });

    const view = formatReceipt(receipt);

    expect(view).toContain("Receipt #receipt_3");
    expect(view).toContain("Amount: 5 cUSD");
    expect(view).toContain("Network: celo");
    expect(view).toContain("Status: failed");
    expect(view).toContain("Error: Insufficient funds");
  });
});
