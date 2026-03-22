# Cielo

Safe Stablecoin Payment Copilot on Celo.

Cielo is a small hackathon MVP that turns a natural-language payment request into a structured payment flow:
- parse user intent
- apply policy and risk checks
- generate a payment preview
- require explicit confirmation
- simulate or execute a stablecoin transfer on Celo
- produce a receipt and local activity log

## Why it exists

New users can easily make mistakes when sending crypto: wrong token, wrong network, bad recipient, unclear fees, or unsafe agent behavior. Cielo narrows the flow to one simple, safer path for MVP demos.

## MVP scope

In scope:
- Celo only
- stablecoin transfer only
- explicit user confirmation before execution
- local receipt persistence

Out of scope:
- bridging
- swaps
- autonomous spending
- multi-chain routing
- multi-agent orchestration

## Stack

- Next.js
- TypeScript
- Bun
- Zod
- viem
- Tailwind CSS

## Project structure

```text
cielo/
├── app/                     # Next.js UI + API routes
├── components/              # UI pieces
├── data/                    # Local receipt storage
├── lib/
│   ├── chain/celo-adapter/  # Celo-specific transfer payload + simulation
│   ├── config/              # Chain + env + token config
│   ├── executor/            # Simulate/execute orchestration
│   ├── intent-parser/       # Natural language -> structured intent
│   ├── payment-flow/        # End-to-end preview + confirm flow
│   ├── payment-planner/     # Preview creation + readiness state
│   ├── policy-engine/       # Safety and validation rules
│   ├── receipts/            # Receipt formatting + persistence
│   └── schemas/             # Shared Zod schemas
├── tests/                   # Bun tests
├── PROJECT.md
├── ARCHITECTURE.md
├── TASKS.md
├── SUBMISSION.md
└── DEMO.md
```

## Environment

Copy the example env file if needed:

```bash
cp .env.example .env.local
```

Variables:

- `CELO_RPC_URL` — Celo RPC endpoint
- `CELO_CHAIN_ID` — defaults to `42220`
- `CELO_USDC_ADDRESS` — optional, only needed if you want USDC configured for demo use
- `NEXT_PUBLIC_APP_NAME` — defaults to `Cielo`
- `NEXT_PUBLIC_DEFAULT_NETWORK` — defaults to `celo`

Notes:
- `cUSD` is configured as the default MVP stablecoin.
- `USDC` is intentionally optional until a canonical demo contract is confirmed.

## Local development

Install dependencies:

```bash
bun install
```

Run the app:

```bash
bun dev
```

Open:

```text
http://localhost:3000
```

## Quality checks

Run tests:

```bash
bun test
```

Run typecheck:

```bash
bun run typecheck
```

Run production build:

```bash
bun run build
```

## Demo intent examples

Happy path:

```text
send 5 cUSD to 0x1234567890abcdef1234567890abcdef12345678 for lunch
```

Needs clarification:

```text
send to 0x1234567890abcdef1234567890abcdef12345678
```

Blocked by policy:

```text
send 250 cUSD to 0x1234567890abcdef1234567890abcdef12345678 for payroll
```

## Current repo readiness

This repo is considered hackathon-ready when:
- dependencies install on a clean machine
- tests pass
- typecheck passes
- production build passes
- the intent -> preview -> confirm -> receipt flow is demonstrable

## Hackathon context

Cielo is aimed at tracks such as:
- Best Agent on Celo
- Synthesis Open Track
- Agents that pay

See `SUBMISSION.md` and `DEMO.md` for the narrative and recording plan.
