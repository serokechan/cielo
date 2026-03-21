import { NextResponse } from "next/server";
import { z } from "zod";

import { createPaymentPreview } from "@/lib/payment-flow";

const previewRequestSchema = z.object({
  rawText: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText } = previewRequestSchema.parse(body);
    const preview = createPaymentPreview(rawText);

    return NextResponse.json(preview);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create preview",
      },
      { status: 400 },
    );
  }
}
