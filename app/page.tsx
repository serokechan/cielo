import { SectionCard } from "@/components/section-card";
import { supportedChains } from "@/lib/config/chains";
import { celoStablecoins } from "@/lib/config/tokens";

const phaseOneChecklist = [
  "Next.js + TypeScript + bun skeleton",
  "app/, components/, lib/, data/ structure",
  "env file structure",
  "Celo RPC config",
  "MVP stablecoin token config",
];

export default function Home() {
  const chain = supportedChains.celo;
  const tokens = Object.values(celoStablecoins);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="space-y-4">
        <span className="inline-flex rounded-full border border-cielo-border bg-cielo-panel px-3 py-1 text-sm text-cielo-accent">
          Cielo · Phase 1 Setup
        </span>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Safe Stablecoin Payment Copilot on Celo</h1>
          <p className="mt-3 max-w-3xl text-base text-slate-300">
            MVP foundation is ready: app skeleton, config boundaries, and Celo-first setup.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Phase 1 checklist" description="Built from TASKS.md and aligned to ARCHITECTURE.md.">
          <ul className="space-y-3 text-sm text-slate-200">
            {phaseOneChecklist.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 text-cielo-accent">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Celo config" description="Chain setup prepared for later planner/executor work.">
          <dl className="space-y-3 text-sm text-slate-200">
            <div>
              <dt className="text-slate-400">Network</dt>
              <dd>{chain.name}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Chain ID</dt>
              <dd>{chain.id}</dd>
            </div>
            <div>
              <dt className="text-slate-400">RPC</dt>
              <dd className="break-all">{chain.rpcUrl}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Explorer</dt>
              <dd>{chain.explorerUrl}</dd>
            </div>
          </dl>
        </SectionCard>
      </div>

      <SectionCard title="MVP stablecoin config" description="cUSD is ready by default; USDC can be enabled through env once the demo contract is confirmed.">
        <div className="grid gap-4 md:grid-cols-2">
          {tokens.map((token) => (
            <article key={token.symbol} className="rounded-xl border border-cielo-border bg-black/10 p-4 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{token.symbol}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs ${token.isReady ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                  {token.isReady ? "ready" : "optional"}
                </span>
              </div>
              <p className="mt-2 text-slate-300">{token.name}</p>
              <p className="mt-2 break-all text-xs text-slate-400">{token.address ?? "Not configured yet"}</p>
              {token.notes ? <p className="mt-3 text-xs text-slate-400">{token.notes}</p> : null}
            </article>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}
