import { NextResponse } from "next/server";
import { z } from "zod";

import { confirmPaymentPlan } from "@/lib/payment-flow";
import { formatReceipt } from "@/lib/receipts";
import { executionModeSchema, paymentPlanSchema } from "@/lib/schemas";

const confirmRequestSchema = z.object({
  plan: paymentPlanSchema,
  mode: executionModeSchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan, mode } = confirmRequestSchema.parse(body);
    const result = await confirmPaymentPlan(plan, mode);

    return NextResponse.json({
      ...result,
      receiptView: formatReceipt(result.receipt),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to confirm payment",
      },
      { status: 400 },
    );
  }
}
