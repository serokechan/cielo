import { z } from "zod";

export const celoTransferPayloadSchema = z.object({
  chainId: z.number().int().positive(),
  rpcUrl: z.string().url(),
  to: z.string().min(1),
  data: z.string().min(1),
  value: z.string().min(1),
});

export const chainSimulationResultSchema = z.object({
  mode: z.literal("simulate"),
  status: z.enum(["simulated", "failed"]),
  success: z.boolean(),
  txHash: z.string().min(1).nullable(),
  error: z.string().min(1).nullable(),
  simulatedAt: z.string().datetime(),
});

export type CeloTransferPayload = z.infer<typeof celoTransferPayloadSchema>;
export type ChainSimulationResult = z.infer<typeof chainSimulationResultSchema>;
