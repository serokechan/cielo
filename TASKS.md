# Cielo Build Tasks

## Phase 1 — Foundation
- [ ] Init app skeleton
- [ ] Setup Celo RPC config
- [ ] Setup env file structure
- [ ] Add stablecoin/token config

## Phase 2 — Payment intent
- [ ] Define payment request schema
- [ ] Parse user input into structured fields:
  - amount
  - token
  - recipient
  - purpose
- [ ] Add fallback handling for incomplete input

## Phase 3 — Safety layer
- [ ] Add token allowlist
- [ ] Add recipient validation
- [ ] Add max amount rule
- [ ] Add warning generator
- [ ] Require human confirmation before action

## Phase 4 — Preview + execution
- [ ] Build payment preview object
- [ ] Estimate fee
- [ ] Simulate transfer
- [ ] Execute transfer
- [ ] Capture tx hash / result

## Phase 5 — Receipt
- [ ] Build receipt view/data shape
- [ ] Store local activity log
- [ ] Show success / failure state

## Phase 6 — Demo polish
- [ ] Prepare 1 happy-path demo
- [ ] Prepare 1 risky-path demo
- [ ] Prepare short pitch
- [ ] Prepare submission screenshots/video

## MVP definition
MVP selesai jika user bisa:
1. memasukkan intent pembayaran
2. melihat preview + warning
3. confirm
4. menjalankan atau mensimulasikan 1 transfer stablecoin di Celo
5. melihat receipt

## Build order
1. Schema + parser
2. Safety rules
3. Preview
4. Simulation
5. Receipt
6. UI polish
