import { z } from "zod";

import { missingFieldSchema, tokenSymbolSchema } from "./payment-intent";

export const warningSeveritySchema = z.enum(["info", "warning", "critical"]);

export const warningCodeSchema = z.enum([
  "unknown_token",
  "invalid_recipient",
  "amount_too_high",
  "missing_field",
  "unsupported_network",
  "confirmation_required",
]);

export const policyWarningSchema = z.object({
  code: warningCodeSchema,
  severity: warningSeveritySchema,
  message: z.string().min(1),
  field: missingFieldSchema.optional(),
});

export const policyDecisionSchema = z.enum(["allowed", "blocked", "needs_confirmation", "needs_clarification"]);

export const policyResultSchema = z.object({
  intentId: z.string().min(1),
  decision: policyDecisionSchema,
  allowed: z.boolean(),
  requiresConfirmation: z.boolean().default(true),
  warnings: z.array(policyWarningSchema).default([]),
  allowedTokens: z.array(tokenSymbolSchema).default([]),
  allowedNetworks: z.array(z.enum(["celo"])).default(["celo"]),
  maxAmount: z.string().min(1).nullable().default(null),
  evaluatedAt: z.string().datetime(),
});

export type PolicyWarning = z.infer<typeof policyWarningSchema>;
export type PolicyResult = z.infer<typeof policyResultSchema>;
export type PolicyDecision = z.infer<typeof policyDecisionSchema>;
