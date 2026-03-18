# Cielo Architecture

## Goal
Build a payment copilot that is simple for MVP but can scale into a safer multi-chain agent system later.

---

## Design principles
- Keep human approval mandatory before execution
- Separate parsing, policy, and execution
- Keep payment logic chain-aware, not hardcoded everywhere
- Make simulation and receipts first-class
- Start with Celo + stablecoins, but keep extension paths open

---

## High-level architecture

### 1. Client layer
Responsible for:
- collecting user intent
- showing preview
- showing warnings
- requesting confirmation
- showing result / receipt

Examples:
- Next.js web app
- chat-style UI

### 2. Intent service
Responsible for:
- converting natural language into structured payment intent
- extracting:
  - amount
  - token
  - recipient
  - purpose
  - urgency
- marking missing fields

Output shape:
- `intent`
- `confidence`
- `missingFields`
- `rawText`

### 3. Policy engine
Responsible for:
- validating intent
- enforcing payment rules
- generating warnings
- deciding whether request is:
  - allowed
  - blocked
  - needs confirmation

Initial rules:
- token allowlist
- network allowlist
- max amount threshold
- recipient format checks
- explicit confirmation required

### 4. Payment planner
Responsible for:
- turning approved intent into an executable payment plan
- resolving token metadata
- choosing chain config
- estimating gas/fee
- creating preview data

Output shape:
- `paymentPlan`
- `estimatedFee`
- `warnings`
- `simulationReady`

### 5. Execution engine
Responsible for:
- building transaction payload
- simulating transaction
- executing transaction after confirmation
- returning tx result

For MVP:
- stablecoin transfer only
- Celo only

Later:
- swap
- recurring payment
- delegated execution

### 6. Receipt and activity layer
Responsible for:
- storing payment attempts
- storing simulation results
- storing tx hashes and statuses
- generating human-readable receipts

This helps with:
- demo proof
- audit trail
- debugging

---

## Suggested internal modules

### `intent-parser`
- natural language to structured request

### `policy-engine`
- safety checks and decisioning

### `payment-planner`
- payment preview + route preparation

### `chain-adapter`
- abstract chain-specific logic
- MVP starts with `celo-adapter`

### `executor`
- simulate + send transaction

### `receipt-store`
- local persistence for receipts and logs

---

## Scalable data flow
1. User sends payment intent
2. Intent service parses request
3. Policy engine validates and scores risk
4. Payment planner creates preview
5. Client shows preview + warnings
6. User confirms
7. Execution engine simulates or executes
8. Receipt layer stores and returns result

---

## Why this is scalable
- Parsing is separate from execution
- Rules can grow without rewriting tx logic
- New chains can be added through adapters
- New payment actions can be added through planner/executor extensions
- Receipts and logs are reusable for compliance, analytics, and submission evidence

---

## MVP scope
Only support:
- one chain: Celo
- one action: stablecoin transfer
- one approval model: explicit human confirmation
- one receipt path: local activity log

Do not include yet:
- bridge
- swap routing
- autonomous spending
- multi-agent workflows
- complex account abstraction

---

## Tech stack

### Frontend
- **Next.js**
- **TypeScript**
- **Tailwind CSS**

### Backend / app logic
- **Next.js Route Handlers** or small Node service
- **TypeScript**
- **Zod** for request validation

### Package manager
- **bun** as the default package manager
- use `bun install` and `bun add`

### Agent / intent layer
- simple rule-based parser first
- optional LLM parsing later
- structured output enforced with Zod

### Onchain
- **viem** for chain interaction
- optional **wagmi** if wallet-connected frontend is used
- fallback to **ethers** only if needed

### Chain target
- **Celo**
- stablecoins such as **cUSD / USDC** depending on support and demo readiness

### Storage
- local JSON or lightweight SQLite for MVP
- upgrade later to Postgres / Supabase if needed

### Wallet / execution
- burner/demo wallet for MVP
- user wallet or delegated model later

### Observability
- simple structured logs
- receipt records
- tx hash tracking

---

## Recommended repo structure
```text
cielo/
├── app/                  # Next.js app/router if web UI is used
├── components/           # UI pieces
├── lib/
│   ├── intent-parser/
│   ├── policy-engine/
│   ├── payment-planner/
│   ├── chain/
│   │   └── celo-adapter/
│   ├── executor/
│   └── receipts/
├── data/                 # local logs / receipts
├── PROJECT.md
├── ARCHITECTURE.md
└── TASKS.md
```

---

## Architecture summary
Cielo should be built as a pipeline:
- understand intent
- validate with policy
- prepare payment plan
- confirm with human
- simulate / execute
- produce receipt

That keeps MVP small while leaving room to grow into a stronger agent payment system.
