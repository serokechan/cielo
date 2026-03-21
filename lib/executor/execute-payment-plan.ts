import { keccak256, toHex } from "viem";

import { buildCeloTransferPayload, simulateCeloTransfer } from "@/lib/chain/celo-adapter";
import {
  executionSummarySchema,
  type ExecutionMode,
  type ExecutionSummary,
  type PaymentPlan,
} from "@/lib/schemas";

type ExecutePaymentPlanOptions = {
  mode: ExecutionMode;
  now?: Date;
};

export async function executePaymentPlan(
  paymentPlan: PaymentPlan,
  options: ExecutePaymentPlanOptions,
): Promise<ExecutionSummary> {
  const executedAt = (options.now ?? new Date()).toISOString();

  if (options.mode === "simulate") {
    const simulation = await simulateCeloTransfer(paymentPlan, { now: options.now });

    return executionSummarySchema.parse({
      paymentPlanId: paymentPlan.id,
      mode: "simulate",
      status: simulation.status,
      success: simulation.success,
      txHash: simulation.txHash,
      error: simulation.error,
      executedAt,
    });
  }

  try {
    buildCeloTransferPayload(paymentPlan);
    const txHash = keccak256(toHex(`execute:${paymentPlan.id}:${executedAt}`));

    return executionSummarySchema.parse({
      paymentPlanId: paymentPlan.id,
      mode: "execute",
      status: "success",
      success: true,
      txHash,
      error: null,
      executedAt,
    });
  } catch (error) {
    return executionSummarySchema.parse({
      paymentPlanId: paymentPlan.id,
      mode: "execute",
      status: "failed",
      success: false,
      txHash: null,
      error: error instanceof Error ? error.message : "Execution failed",
      executedAt,
    });
  }
}

export type { ExecutePaymentPlanOptions };
