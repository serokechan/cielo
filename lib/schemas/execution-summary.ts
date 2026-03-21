import { z } from "zod";

export const executionModeSchema = z.enum(["simulate", "execute"]);
export const executionStatusSchema = z.enum(["simulated", "success", "failed"]);

export const executionSummarySchema = z.object({
  paymentPlanId: z.string().min(1),
  mode: executionModeSchema,
  status: executionStatusSchema,
  success: z.boolean(),
  txHash: z.string().min(1).nullable(),
  error: z.string().min(1).nullable(),
  executedAt: z.string().datetime(),
});

export type ExecutionMode = z.infer<typeof executionModeSchema>;
export type ExecutionSummary = z.infer<typeof executionSummarySchema>;
