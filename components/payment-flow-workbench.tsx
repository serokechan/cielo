"use client";

import { useMemo, useState } from "react";

import { SectionCard } from "@/components/section-card";
import type {
  ExecutionMode,
  ExecutionSummary,
  PaymentIntent,
  PaymentPlan,
  PolicyResult,
  Receipt,
} from "@/lib/schemas";

type PreviewResponse = {
  intent: PaymentIntent;
  policy: PolicyResult;
  plan: PaymentPlan;
};

type ConfirmResponse = {
  execution: ExecutionSummary;
  receipt: Receipt;
  receiptView: string;
};

const starterText =
  "send 5 cUSD to 0x1234567890abcdef1234567890abcdef12345678 for lunch";

export function PaymentFlowWorkbench() {
  const [rawText, setRawText] = useState(starterText);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [result, setResult] = useState<ConfirmResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState<ExecutionMode | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const warnings = useMemo(() => {
    return preview?.policy.warnings ?? [];
  }, [preview]);

  async function onGeneratePreview() {
    setError(null);
    setPreviewLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/payments/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });

      const data = (await response.json()) as
        | PreviewResponse
        | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error(
          "error" in data ? data.error : "Preview request failed",
        );
      }

      setPreview(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to generate preview",
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  async function onConfirm(mode: ExecutionMode) {
    if (!preview?.plan) return;

    setError(null);
    setConfirmLoading(mode);

    try {
      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          plan: preview.plan,
        }),
      });

      const data = (await response.json()) as
        | ConfirmResponse
        | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error(
          "error" in data ? data.error : "Confirm request failed",
        );
      }

      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to confirm payment",
      );
    } finally {
      setConfirmLoading(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <SectionCard
        title="Payment intent"
        description="Describe the transfer in natural language."
      >
        <div className="space-y-3">
          <textarea
            className="h-32 w-full rounded-xl border border-cielo-border bg-black/20 p-3 text-sm text-cielo-text outline-none transition focus:border-cielo-accent"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            placeholder={starterText}
          />
          <button
            type="button"
            className="rounded-xl bg-cielo-accent px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onGeneratePreview}
            disabled={previewLoading || rawText.trim().length === 0}
          >
            {previewLoading ? "Generating..." : "Generate preview"}
          </button>
        </div>
      </SectionCard>

      <SectionCard
        title="Preview"
        description="Planner output before any action is confirmed."
      >
        {!preview ? (
          <p className="text-sm text-slate-300">
            No preview yet. Generate one from your intent.
          </p>
        ) : (
          <div className="space-y-2 text-sm text-slate-200  ">
            <p>
              <span className="text-slate-400">Amount:</span>{" "}
              {preview.plan.amount} {preview.plan.token}
            </p>
            <p className="break-words">
              <span className="text-slate-400 ">Recipient:</span>{" "}
              {preview.plan.recipient}
            </p>
            <p>
              <span className="text-slate-400">Network:</span>{" "}
              {preview.plan.network}
            </p>
            <p>
              <span className="text-slate-400">Estimated fee:</span>{" "}
              {preview.plan.estimatedFee.amount}{" "}
              {preview.plan.estimatedFee.currency}
            </p>
            <p>
              <span className="text-slate-400">Status:</span>{" "}
              {preview.plan.status}
            </p>

            <div className="mt-3 space-y-2">
              <p className="text-slate-300">Warnings</p>
              {warnings.length === 0 ? (
                <p className="text-xs text-slate-400">No warnings.</p>
              ) : (
                <ul className="space-y-1 text-xs text-amber-200">
                  {warnings.map((warning, index) => (
                    <li key={`${warning.code}-${index}`}>
                      - {warning.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-cielo-border px-3 py-1.5 text-xs font-semibold text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => onConfirm("simulate")}
                disabled={
                  confirmLoading !== null || preview.plan.status !== "ready"
                }
              >
                {confirmLoading === "simulate"
                  ? "Simulating..."
                  : "Confirm & simulate"}
              </button>
              <button
                type="button"
                className="rounded-lg bg-emerald-400/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => onConfirm("execute")}
                disabled={
                  confirmLoading !== null || preview.plan.status !== "ready"
                }
              >
                {confirmLoading === "execute"
                  ? "Executing..."
                  : "Confirm & execute"}
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Result & receipt"
        description="Final execution summary and human-readable receipt."
      >
        {error ? <p className="text-sm text-rose-300">Error: {error}</p> : null}
        {!result ? (
          <p className="text-sm text-slate-300">
            No result yet. Confirm a preview to continue.
          </p>
        ) : (
          <div className="space-y-3 text-sm text-slate-200">
            <p>
              <span className="text-slate-400">Mode:</span>{" "}
              {result.execution.mode}
            </p>
            <p>
              <span className="text-slate-400">Status:</span>{" "}
              {result.execution.status}
            </p>
            <p className="break-words">
              <span className="text-slate-400">Tx hash:</span>{" "}
              {result.execution.txHash ?? "n/a"}
            </p>

            <pre className="max-h-56 overflow-auto rounded-xl border border-cielo-border bg-black/20 p-3 text-xs text-slate-300">
              {result.receiptView}
            </pre>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
