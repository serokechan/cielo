import { z } from "zod";

import { networkSchema, tokenSymbolSchema } from "./payment-intent";
import { policyWarningSchema } from "./policy-result";

export const receiptModeSchema = z.enum(["simulate", "execute"]);
export const receiptStatusSchema = z.enum(["pending", "simulated", "success", "failed"]);

export const receiptSchema = z.object({
  id: z.string().min(1),
  paymentPlanId: z.string().min(1),
  mode: receiptModeSchema,
  status: receiptStatusSchema,
  network: networkSchema.default("celo"),
  token: tokenSymbolSchema,
  amount: z.string().min(1),
  recipient: z.string().min(1),
  txHash: z.string().min(1).nullable().default(null),
  simulationResult: z.string().min(1).nullable().default(null),
  explorerUrl: z.string().url().nullable().default(null),
  warnings: z.array(policyWarningSchema).default([]),
  createdAt: z.string().datetime(),
});

export type Receipt = z.infer<typeof receiptSchema>;
