import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { supportedChains } from "@/lib/config/chains";
import {
  receiptSchema,
  type ExecutionSummary,
  type PaymentPlan,
  type Receipt,
} from "@/lib/schemas";

type BuildReceiptOptions = {
  id?: string;
  now?: Date;
};

type ReceiptStoreOptions = {
  storePath?: string;
};

const DEFAULT_RECEIPT_STORE = join(
  /* turbopackIgnore: true */ process.cwd(),
  "data",
  "receipts.json",
);

function buildExplorerUrl(network: PaymentPlan["network"], txHash: string | null): string | null {
  if (!txHash) return null;
  if (network !== "celo") return null;

  return `${supportedChains.celo.explorerUrl}/tx/${txHash}`;
}

export function buildReceiptFromExecution(
  paymentPlan: PaymentPlan,
  execution: ExecutionSummary,
  options: BuildReceiptOptions = {},
): Receipt {
  if (execution.paymentPlanId !== paymentPlan.id) {
    throw new Error("Execution summary does not match payment plan id");
  }

  const simulationResult =
    execution.mode === "simulate"
      ? execution.success
        ? "Simulated transfer successfully."
        : `Simulation failed: ${execution.error ?? "Unknown error"}`
      : execution.success
        ? null
        : `Execution failed: ${execution.error ?? "Unknown error"}`;

  return receiptSchema.parse({
    id: options.id ?? randomUUID(),
    paymentPlanId: paymentPlan.id,
    mode: execution.mode,
    status: execution.status,
    network: paymentPlan.network,
    token: paymentPlan.token,
    amount: paymentPlan.amount,
    recipient: paymentPlan.recipient,
    txHash: execution.txHash,
    simulationResult,
    explorerUrl: buildExplorerUrl(paymentPlan.network, execution.txHash),
    warnings: paymentPlan.warnings,
    createdAt: (options.now ?? new Date()).toISOString(),
  });
}

export async function readReceiptStore(options: ReceiptStoreOptions = {}): Promise<Receipt[]> {
  const storePath = options.storePath ?? DEFAULT_RECEIPT_STORE;

  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => receiptSchema.parse(item));
  } catch {
    return [];
  }
}

export async function appendReceiptToStore(
  receipt: Receipt,
  options: ReceiptStoreOptions = {},
): Promise<void> {
  const storePath = options.storePath ?? DEFAULT_RECEIPT_STORE;
  const existing = await readReceiptStore({ storePath });
  const next = [...existing, receipt];

  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(next, null, 2), "utf8");
}

export function formatReceipt(receipt: Receipt): string {
  const parts = [
    `Receipt #${receipt.id}`,
    `Amount: ${receipt.amount} ${receipt.token}`,
    `Recipient: ${receipt.recipient}`,
    `Network: ${receipt.network}`,
    `Mode: ${receipt.mode}`,
    `Status: ${receipt.status}`,
    `Timestamp: ${receipt.createdAt}`,
  ];

  if (receipt.txHash) {
    parts.push(`Tx Hash: ${receipt.txHash}`);
  }

  if (receipt.simulationResult) {
    parts.push(`Simulation: ${receipt.simulationResult}`);
  }

  if (receipt.explorerUrl) {
    parts.push(`Explorer: ${receipt.explorerUrl}`);
  }

  if (receipt.status === "failed" && receipt.simulationResult?.includes("failed")) {
    const errorMessage = receipt.simulationResult
      .replace("Simulation failed: ", "")
      .replace("Execution failed: ", "");
    parts.push(`Error: ${errorMessage}`);
  }

  return parts.join("\n");
}

export type { BuildReceiptOptions, ReceiptStoreOptions };
