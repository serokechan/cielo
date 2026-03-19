import { z } from "zod";

export const networkSchema = z.enum(["celo"]);

export const tokenSymbolSchema = z.enum(["cUSD", "USDC"]);

export const missingFieldSchema = z.enum(["amount", "token", "recipient", "purpose", "network"]);

export const intentStatusSchema = z.enum(["draft", "parsed", "needs_clarification", "blocked", "ready"]);

export const urgencySchema = z.enum(["low", "normal", "high"]);

export const paymentIntentSchema = z.object({
  id: z.string().min(1),
  rawText: z.string().min(1),
  amount: z.string().min(1).nullable(),
  token: tokenSymbolSchema.nullable(),
  recipient: z.string().min(1).nullable(),
  purpose: z.string().min(1).nullable().default(null),
  network: networkSchema.default("celo"),
  urgency: urgencySchema.default("normal"),
  missingFields: z.array(missingFieldSchema).default([]),
  confidence: z.number().min(0).max(1).default(0),
  status: intentStatusSchema.default("draft"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PaymentIntent = z.infer<typeof paymentIntentSchema>;
