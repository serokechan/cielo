import {
  policyResultSchema,
  type PaymentIntent,
  type PolicyWarning,
  type TokenSymbolSchema,
} from "@/lib/schemas";

type PolicyEngineOptions = {
  allowedTokens?: TokenSymbolSchema[];
  allowedNetworks?: Array<"celo">;
  maxAmount?: string;
};

const DEFAULT_ALLOWED_TOKENS: TokenSymbolSchema[] = ["cUSD", "USDC"];
const DEFAULT_ALLOWED_NETWORKS: Array<"celo"> = ["celo"];
const DEFAULT_MAX_AMOUNT = "100";

function isValidRecipient(address: string | null): boolean {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function toNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function evaluatePaymentIntentPolicy(intent: PaymentIntent, options: PolicyEngineOptions = {}) {
  const allowedTokens = options.allowedTokens ?? DEFAULT_ALLOWED_TOKENS;
  const allowedNetworks = options.allowedNetworks ?? DEFAULT_ALLOWED_NETWORKS;
  const maxAmount = options.maxAmount ?? DEFAULT_MAX_AMOUNT;
  const maxAmountNumber = toNumber(maxAmount);

  const warnings: PolicyWarning[] = [];

  if (!intent.amount) {
    warnings.push({
      code: "missing_field",
      severity: "warning",
      message: "Payment amount is required.",
      field: "amount",
    });
  }

  if (!intent.token) {
    warnings.push({
      code: "missing_field",
      severity: "warning",
      message: "Payment token is required.",
      field: "token",
    });
  }

  if (!intent.recipient) {
    warnings.push({
      code: "missing_field",
      severity: "warning",
      message: "Recipient address is required.",
      field: "recipient",
    });
  }

  if (intent.token && !allowedTokens.includes(intent.token)) {
    warnings.push({
      code: "unknown_token",
      severity: "critical",
      message: `${intent.token} is not in the allowlist.`,
    });
  }

  if (!allowedNetworks.includes(intent.network)) {
    warnings.push({
      code: "unsupported_network",
      severity: "critical",
      message: `${intent.network} is not enabled for this payment.`,
      field: "network",
    });
  }

  if (intent.recipient && !isValidRecipient(intent.recipient)) {
    warnings.push({
      code: "invalid_recipient",
      severity: "critical",
      message: "Recipient must be a valid 0x address.",
      field: "recipient",
    });
  }

  const amount = toNumber(intent.amount);
  if (amount !== null && maxAmountNumber !== null && amount > maxAmountNumber) {
    warnings.push({
      code: "amount_too_high",
      severity: "warning",
      message: `Amount exceeds max allowed amount of ${maxAmount}.`,
      field: "amount",
    });
  }

  const hasMissingRequiredFields = warnings.some((warning) => warning.code === "missing_field");
  const hasBlockingWarnings = warnings.some((warning) =>
    ["unknown_token", "unsupported_network", "invalid_recipient", "amount_too_high"].includes(warning.code),
  );

  let decision: "allowed" | "blocked" | "needs_confirmation" | "needs_clarification" = "needs_confirmation";
  let allowed = true;

  if (hasMissingRequiredFields) {
    decision = "needs_clarification";
    allowed = false;
  } else if (hasBlockingWarnings) {
    decision = "blocked";
    allowed = false;
  }

  const requiresConfirmation = true;
  warnings.push({
    code: "confirmation_required",
    severity: "info",
    message: "Explicit user confirmation is required before execution.",
  });

  return policyResultSchema.parse({
    intentId: intent.id,
    decision,
    allowed,
    requiresConfirmation,
    warnings,
    allowedTokens,
    allowedNetworks,
    maxAmount,
    evaluatedAt: new Date().toISOString(),
  });
}

export type { PolicyEngineOptions };
