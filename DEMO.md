# Cielo Demo Preparation

## Goal
Show a clear end-to-end payment copilot flow for two scenarios:
1. happy-path transfer
2. risky-path transfer blocked by policy

---

## Environment Setup (Before Recording)
1. Install dependencies: `bun install`
2. Run tests: `bun test`
3. Run app: `bun dev`
4. Open: `http://localhost:3000`

Use this default example recipient for demos:
- `0x1234567890abcdef1234567890abcdef12345678`

---

## Happy-Path Demo Script

### Intent
`send 5 cUSD to 0x1234567890abcdef1234567890abcdef12345678 for lunch`

### Steps to show
1. Paste the intent into **Payment intent**.
2. Click **Generate preview**.
3. Highlight:
   - parsed amount/token/recipient
   - policy decision: `needs_confirmation`
   - plan status: `ready`
   - estimated fee and warnings
4. Click **Confirm & simulate**.
5. Show receipt with:
   - status `simulated`
   - tx hash
6. Click **Confirm & execute**.
7. Show receipt with:
   - status `success`
   - tx hash
   - explorer link

### Narration (short)
"Cielo converts natural language to structured intent, applies safety policy checks, then prepares a payment plan. The user must explicitly confirm before simulate or execute."

---

## Risky-Path Demo Script

### Intent A (missing critical fields)
`send to 0x1234567890abcdef1234567890abcdef12345678`

### Steps to show
1. Paste intent A and click **Generate preview**.
2. Highlight:
   - missing amount/token warnings
   - decision/status: `needs_clarification`
   - confirmation buttons disabled (not ready)

### Intent B (amount too high)
`send 250 cUSD to 0x1234567890abcdef1234567890abcdef12345678 for payroll`

### Steps to show
1. Paste intent B and click **Generate preview**.
2. Highlight:
   - warning `amount_too_high`
   - decision/status: `blocked`
   - no execution path exposed

### Narration (short)
"Cielo does not auto-send ambiguous or risky requests. It asks for clarification when fields are missing and blocks requests that violate policy rules."

---

## Screenshot and Recording Checklist

Capture these artifacts in order:
1. Home UI with intent input visible
2. Happy-path preview (`ready`)
3. Happy-path simulated receipt
4. Happy-path executed receipt with tx hash
5. Risky-path clarification state (`needs_clarification`)
6. Risky-path blocked state (`blocked`)

Recommended output files:
- `assets/demo/01-home.png`
- `assets/demo/02-happy-preview.png`
- `assets/demo/03-happy-simulated.png`
- `assets/demo/04-happy-executed.png`
- `assets/demo/05-risk-clarification.png`
- `assets/demo/06-risk-blocked.png`
- `assets/demo/cielo-demo.mp4`

---

## 60-Second Explanation
"Cielo is a safe stablecoin payment copilot on Celo. The user writes a natural-language payment request, Cielo parses it, runs policy checks, and creates a preview with warnings. The user must explicitly confirm before simulation or execution. The system then returns a structured receipt with status and transaction details."
