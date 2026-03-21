# Cielo Submission Narrative

## Project Summary
Cielo is a safe stablecoin payment copilot on Celo. It helps users turn natural-language payment intent into a validated plan, with clear warnings and explicit human confirmation before any execution.

---

## What We Built (MVP)
1. Intent parsing from text into structured payment fields
2. Policy/risk checks:
   - token allowlist
   - network allowlist
   - recipient format checks
   - max amount guard
   - explicit confirmation requirement
3. Payment planner with preview and fee estimate
4. Celo adapter for transfer payload + simulation result
5. Execution engine for simulate/execute modes
6. Receipt layer with local persistence and human-readable output
7. UI flow from input -> preview -> confirm -> result

---

## Why It Matters
- New users often do not know what to send, where to send, or what is risky.
- Cielo reduces mistakes by enforcing policy and requiring explicit approval.
- The architecture separates parsing, policy, planning, execution, and receipts, so the system can scale without unsafe coupling.

---

## Track: Best Agent on Celo
How Cielo fits:
- Celo-first setup and transfer pipeline
- stablecoin-focused UX
- chain adapter architecture designed for Celo transaction workflows

---

## Track: Open Track
How Cielo fits:
- practical AI-assisted fintech UX
- safety-first interaction model
- modular architecture suitable for iterative expansion

---

## Track: Agents That Pay
How Cielo fits:
- intent-to-payment workflow built for agent-assisted execution
- explicit human confirmation before sending
- simulation mode for safer decision support

---

## Demo Storyline
1. User writes intent in plain text.
2. System parses and validates intent.
3. System produces warnings + preview.
4. User confirms simulate or execute.
5. System returns receipt with final status.

Risk path:
- missing fields -> clarification required
- excessive amount / invalid constraints -> blocked

---

## Current Scope and Boundaries
In scope:
- Celo
- stablecoin transfer
- explicit user confirmation
- local receipt log

Out of scope:
- bridging
- swaps
- autonomous spending
- multi-chain routing
- multi-agent orchestration

---

## Next Milestones
1. Improve UX polish and error explainability
2. Add richer fee and simulation details
3. Add wallet-signing integration for live execution
4. Extend policy configuration (per-recipient limits, allowlists)
