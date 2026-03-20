import { z } from "zod";

import { networkSchema, tokenSymbolSchema } from "./payment-intent";
import { policyWarningSchema } from "./policy-result";

export const feeEstimateSchema = z.object({
  amount: z.string().min(1),
  currency: z.string().min(1),
  usdEstimate: z.string().min(1).nullable().default(null),
});

export const paymentPlanStatusSchema = z.enum(["draft", "ready", "blocked", "needs_clarification", "simulated", "executed"]);

export const paymentPlanSchema = z.object({
  id: z.string().min(1),
  intentId: z.string().min(1),
  network: networkSchema.default("celo"),
  token: tokenSymbolSchema,
  tokenAddress: z.string().min(1).nullable(),
  amount: z.string().min(1),
  recipient: z.string().min(1),
  estimatedFee: feeEstimateSchema,
  warnings: z.array(policyWarningSchema).default([]),
  requiresConfirmation: z.boolean().default(true),
  simulationReady: z.boolean().default(false),
  status: paymentPlanStatusSchema.default("draft"),
  createdAt: z.string().datetime(),
});

export type FeeEstimate = z.infer<typeof feeEstimateSchema>;
export type PaymentPlan = z.infer<typeof paymentPlanSchema>;
