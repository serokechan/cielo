import { randomUUID } from "node:crypto";

import { celoStablecoins } from "@/lib/config/tokens";
import { paymentPlanSchema, type PaymentIntent, type PolicyResult } from "@/lib/schemas";

type CreatePaymentPlanOptions = {
  id?: string;
  now?: Date;
};

function estimateFee() {
  return {
    amount: "0.001",
    currency: "CELO",
    usdEstimate: "0.01",
  };
}

function resolvePlanStatus(decision: PolicyResult["decision"]) {
  if (decision === "blocked") return "blocked" as const;
  if (decision === "needs_clarification") return "needs_clarification" as const;
  return "ready" as const;
}

export function createPaymentPlan(
  intent: PaymentIntent,
  policyResult: PolicyResult,
  options: CreatePaymentPlanOptions = {},
) {
  if (policyResult.intentId !== intent.id) {
    throw new Error("Policy result does not match intent id");
  }

  if (!intent.token || !intent.amount || !intent.recipient) {
    const status = resolvePlanStatus(policyResult.decision);
    return paymentPlanSchema.parse({
      id: options.id ?? randomUUID(),
      intentId: intent.id,
      network: intent.network,
      token: intent.token ?? "cUSD",
      tokenAddress: null,
      amount: intent.amount ?? "0",
      recipient: intent.recipient ?? "0x0000000000000000000000000000000000000000",
      estimatedFee: estimateFee(),
      warnings: policyResult.warnings,
      requiresConfirmation: policyResult.requiresConfirmation,
      simulationReady: status === "ready",
      status,
      createdAt: (options.now ?? new Date()).toISOString(),
    });
  }

  const tokenConfig = celoStablecoins[intent.token];
  const status = resolvePlanStatus(policyResult.decision);

  return paymentPlanSchema.parse({
    id: options.id ?? randomUUID(),
    intentId: intent.id,
    network: intent.network,
    token: intent.token,
    tokenAddress: tokenConfig?.address ? tokenConfig.address : null,
    amount: intent.amount,
    recipient: intent.recipient,
    estimatedFee: estimateFee(),
    warnings: policyResult.warnings,
    requiresConfirmation: policyResult.requiresConfirmation,
    simulationReady: status === "ready",
    status,
    createdAt: (options.now ?? new Date()).toISOString(),
  });
}

export type { CreatePaymentPlanOptions };
