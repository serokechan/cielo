import { encodeFunctionData, keccak256, parseUnits, toHex } from "viem";

import { supportedChains } from "@/lib/config/chains";
import { celoStablecoins, type StablecoinConfig } from "@/lib/config/tokens";
import {
  chainSimulationResultSchema,
  celoTransferPayloadSchema,
  type ChainSimulationResult,
  type PaymentPlan,
  type TokenSymbolSchema,
} from "@/lib/schemas";

const erc20TransferAbi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const celoAdapterConfig = {
  chainKey: supportedChains.celo.key,
  chainId: supportedChains.celo.id,
  rpcUrl: supportedChains.celo.rpcUrl,
  explorerUrl: supportedChains.celo.explorerUrl,
} as const;

export function getCeloTokenContract(symbol: TokenSymbolSchema): StablecoinConfig {
  return celoStablecoins[symbol];
}

export function buildCeloTransferPayload(plan: PaymentPlan) {
  if (plan.network !== "celo") {
    throw new Error("Only Celo network is supported by this adapter.");
  }

  if (!plan.tokenAddress) {
    throw new Error("Payment plan is missing token address.");
  }

  const tokenContract = getCeloTokenContract(plan.token);
  const amountBaseUnits = parseUnits(plan.amount, tokenContract.decimals);
  const data = encodeFunctionData({
    abi: erc20TransferAbi,
    functionName: "transfer",
    args: [plan.recipient as `0x${string}`, amountBaseUnits],
  });

  return celoTransferPayloadSchema.parse({
    chainId: celoAdapterConfig.chainId,
    rpcUrl: celoAdapterConfig.rpcUrl,
    to: plan.tokenAddress,
    data,
    value: "0x0",
  });
}

type SimulateCeloTransferOptions = {
  now?: Date;
};

export async function simulateCeloTransfer(
  plan: PaymentPlan,
  options: SimulateCeloTransferOptions = {},
): Promise<ChainSimulationResult> {
  try {
    buildCeloTransferPayload(plan);
    const nowIso = (options.now ?? new Date()).toISOString();
    const txHash = keccak256(toHex(`${plan.id}:${nowIso}`));

    return chainSimulationResultSchema.parse({
      mode: "simulate",
      status: "simulated",
      success: true,
      txHash,
      error: null,
      simulatedAt: nowIso,
    });
  } catch (error) {
    return chainSimulationResultSchema.parse({
      mode: "simulate",
      status: "failed",
      success: false,
      txHash: null,
      error: error instanceof Error ? error.message : "Simulation failed",
      simulatedAt: (options.now ?? new Date()).toISOString(),
    });
  }
}

export type { SimulateCeloTransferOptions };
