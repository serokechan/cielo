import { randomUUID } from "node:crypto";

import {
  paymentIntentSchema,
  type PaymentIntent,
  type TokenSymbolSchema,
} from "@/lib/schemas/payment-intent";

const tokenMap = {
  cusd: "cUSD",
  usdc: "USDC",
} as const;

type SupportedToken = (typeof tokenMap)[keyof typeof tokenMap];

type ParsePaymentIntentOptions = {
  id?: string;
  now?: Date;
};

function detectToken(rawText: string): SupportedToken | null {
  const match = rawText.match(/\b(cusd|usdc)\b/i);
  if (!match) return null;

  return tokenMap[match[1].toLowerCase() as keyof typeof tokenMap] ?? null;
}

function detectAmount(rawText: string, token: SupportedToken | null): string | null {
  if (token) {
    const withToken = rawText.match(new RegExp(`\\b(\\d+(?:\\.\\d+)?)\\s*${token}\\b`, "i"));
    if (withToken) return withToken[1];
  }

  const afterVerb = rawText.match(/\b(?:send|pay|transfer)\s+\$?(\d+(?:\.\d+)?)\b/i);
  if (afterVerb) return afterVerb[1];

  return null;
}

function detectRecipient(rawText: string): string | null {
  const match = rawText.match(/\b(0x[a-fA-F0-9]{8,40})\b/);
  return match?.[1] ?? null;
}

function detectPurpose(rawText: string): string | null {
  const match = rawText.match(/\bfor\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function getMissingFields(parsed: {
  amount: string | null;
  token: SupportedToken | null;
  recipient: string | null;
}) {
  const missingFields: Array<"amount" | "token" | "recipient"> = [];

  if (!parsed.amount) missingFields.push("amount");
  if (!parsed.token) missingFields.push("token");
  if (!parsed.recipient) missingFields.push("recipient");

  return missingFields;
}

function computeConfidence(parsed: {
  amount: string | null;
  token: SupportedToken | null;
  recipient: string | null;
  purpose: string | null;
}) {
  let score = 0;
  if (parsed.amount) score += 0.3;
  if (parsed.token) score += 0.2;
  if (parsed.recipient) score += 0.3;
  if (parsed.purpose) score += 0.1;
  score += 0.1; // default network = celo

  return Number(Math.min(1, score).toFixed(2));
}

export function parsePaymentIntent(rawText: string, options: ParsePaymentIntentOptions = {}): PaymentIntent {
  const normalizedText = rawText.trim();
  const timestamp = (options.now ?? new Date()).toISOString();

  const token = detectToken(normalizedText);
  const amount = detectAmount(normalizedText, token);
  const recipient = detectRecipient(normalizedText);
  const purpose = detectPurpose(normalizedText);
  const missingFields = getMissingFields({ amount, token, recipient });
  const confidence = computeConfidence({ amount, token, recipient, purpose });

  const status = missingFields.length === 0 ? "parsed" : "needs_clarification";

  return paymentIntentSchema.parse({
    id: options.id ?? randomUUID(),
    rawText: normalizedText,
    amount,
    token,
    recipient,
    purpose,
    network: "celo",
    urgency: "normal",
    missingFields,
    confidence,
    status,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}
