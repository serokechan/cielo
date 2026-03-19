# Cielo Build Tasks

## Goal
Ship a small but convincing MVP for **Cielo**:
- user enters payment intent
- system parses it
- system checks policy/risk
- system shows preview
- user confirms
- system simulates or executes a stablecoin transfer on Celo
- system returns a receipt

---

## Phase 1 — Project setup
- [x] Init app skeleton with **Next.js + TypeScript + bun**
- [x] Setup basic folder structure:
  - `app/`
  - `components/`
  - `lib/`
  - `data/`
- [x] Setup env file structure
- [x] Add Celo RPC config
- [x] Add token config for MVP stablecoins

---

## Phase 2 — Core schemas
- [x] Define `PaymentIntent` schema
- [x] Define `PolicyResult` schema
- [x] Define `PaymentPlan` schema
- [x] Define `Receipt` schema
- [x] Validate all schemas with Zod

Suggested fields:
- `amount`
- `token`
- `recipient`
- `purpose`
- `network`
- `warnings`
- `requiresConfirmation`
- `status`

---

## Phase 3 — Intent parser
- [x] Build first version of intent parser
- [x] Parse user input into:
  - amount
  - token
  - recipient
  - purpose
- [x] Detect missing fields
- [x] Return confidence score
- [x] Add fallback for ambiguous input

Example input:
- `send 5 cUSD to 0xabc... for lunch`

---

## Phase 4 — Policy engine
- [ ] Implement token allowlist
- [ ] Implement network allowlist
- [ ] Implement recipient format checks
- [ ] Implement max amount rule
- [ ] Implement warning generator
- [ ] Require explicit confirmation before execution

Possible warnings:
- unknown token
- invalid recipient
- unusually high amount
- missing token or amount

---

## Phase 5 — Payment planner
- [ ] Resolve token metadata
- [ ] Create payment preview object
- [ ] Estimate fee / gas
- [ ] Attach warnings and readiness state
- [ ] Mark request as:
  - ready
  - blocked
  - needs clarification

Preview should include:
- token
- amount
- recipient
- network
- estimated fee
- warnings

---

## Phase 6 — Celo chain adapter
- [ ] Setup `celo-adapter`
- [ ] Add chain config
- [ ] Add token contract config
- [ ] Build transfer transaction payload
- [ ] Add transaction simulation
- [ ] Return structured tx result

MVP scope:
- Celo only
- stablecoin transfer only

---

## Phase 7 — Execution engine
- [ ] Connect payment plan to execution layer
- [ ] Add simulate mode
- [ ] Add execute mode
- [ ] Capture tx hash
- [ ] Capture success / failure result
- [ ] Return execution summary

---

## Phase 8 — Receipt layer
- [ ] Define receipt format
- [ ] Store local receipt log
- [ ] Show human-readable receipt
- [ ] Include:
  - amount
  - token
  - recipient
  - timestamp
  - tx hash or simulation result
  - final status

---

## Phase 9 — UI layer
- [ ] Build input UI for payment intent
- [ ] Build preview card
- [ ] Build warnings section
- [ ] Build confirmation action
- [ ] Build result / receipt view
- [ ] Handle loading and error states

---

## Phase 10 — Demo preparation
- [ ] Prepare happy-path demo
- [ ] Prepare risky-path demo
- [ ] Prepare short project explanation
- [ ] Prepare screenshots / screen recording
- [ ] Prepare submission narrative for:
  - Best Agent on Celo
  - Open Track
  - Agents that pay

---

## MVP checklist
Cielo MVP is done if user can:
1. enter a payment intent
2. get a parsed result
3. see warnings and preview
4. confirm the action
5. simulate or execute one stablecoin payment on Celo
6. receive a final receipt

---

## Build priority
1. Setup
2. Schemas
3. Intent parser
4. Policy engine
5. Payment planner
6. Celo adapter
7. Execution engine
8. Receipt layer
9. UI
10. Demo polish

---

## Out of scope for now
- bridging
- swap routing
- autonomous spending without approval
- multi-agent coordination
- complex delegation framework
- multi-chain support
