import { PaymentFlowWorkbench } from "@/components/payment-flow-workbench";
import { SectionCard } from "@/components/section-card";
import { supportedChains } from "@/lib/config/chains";

export default function Home() {
  const chain = supportedChains.celo;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="space-y-4">
        <span className="inline-flex rounded-full border border-cielo-border bg-cielo-panel px-3 py-1 text-sm text-cielo-accent">
          Cielo Payment Flow MVP
        </span>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Safe Stablecoin Payment Copilot on Celo
          </h1>
          <p className="mt-3 max-w-3xl text-base text-slate-300">
            End-to-end MVP flow: parse intent, run policy checks, preview the
            transfer, confirm, then simulate or execute.
          </p>
        </div>
      </header>

      <PaymentFlowWorkbench />

      <SectionCard
        title="Network config"
        description="Live config used by planner and adapter."
      >
        <dl className="grid gap-2 text-sm text-slate-200 md:grid-cols-2">
          <div>
            <dt className="text-slate-400">Network</dt>
            <dd>{chain.name}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Chain ID</dt>
            <dd>{chain.id}</dd>
          </div>
          <div>
            <dt className="text-slate-400">RPC URL</dt>
            <dd className="break-all">{chain.rpcUrl}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Explorer</dt>
            <dd>{chain.explorerUrl}</dd>
          </div>
        </dl>
      </SectionCard>
    </main>
  );
}
