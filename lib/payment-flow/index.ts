import { createPaymentPlan } from "@/lib/payment-planner";
import { evaluatePaymentIntentPolicy } from "@/lib/policy-engine";
import { appendReceiptToStore, buildReceiptFromExecution } from "@/lib/receipts";
import {
  executionModeSchema,
  paymentPlanSchema,
  type ExecutionMode,
  type PaymentPlan,
} from "@/lib/schemas";
import { executePaymentPlan } from "@/lib/executor";
import { parsePaymentIntent } from "@/lib/intent-parser";

type CreatePaymentPreviewOptions = {
  now?: Date;
  idPrefix?: string;
};

type ConfirmPaymentPlanOptions = {
  now?: Date;
  persistReceipt?: boolean;
  receiptStorePath?: string;
};

export function createPaymentPreview(rawText: string, options: CreatePaymentPreviewOptions = {}) {
  const now = options.now ?? new Date();
  const intent = parsePaymentIntent(rawText, { now });
  const policy = evaluatePaymentIntentPolicy(intent);
  const plan = createPaymentPlan(intent, policy, { now });

  return {
    intent,
    policy,
    plan,
  };
}

export async function confirmPaymentPlan(
  planInput: PaymentPlan,
  modeInput: ExecutionMode,
  options: ConfirmPaymentPlanOptions = {},
) {
  const now = options.now ?? new Date();
  const mode = executionModeSchema.parse(modeInput);
  const plan = paymentPlanSchema.parse(planInput);

  const execution = await executePaymentPlan(plan, {
    mode,
    now,
  });

  const receipt = buildReceiptFromExecution(plan, execution, { now });
  const persistReceipt = options.persistReceipt ?? true;

  if (persistReceipt) {
    await appendReceiptToStore(receipt, {
      storePath: options.receiptStorePath,
    });
  }

  return {
    execution,
    receipt,
  };
}

export type { ConfirmPaymentPlanOptions, CreatePaymentPreviewOptions };
