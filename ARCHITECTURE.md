# Cielo Architecture

## Components

### 1. UI layer
Tugas:
- input intent user
- tampilkan preview
- tampilkan warning
- confirm action

### 2. Agent layer
Tugas:
- parse intent user
- ubah ke structured payment request
- hasilkan action plan

Output:
- amount
- token
- recipient
- network
- warnings
- ready_to_execute

### 3. Safety / policy engine
Tugas:
- validasi request
- enforce rules
- tandai hal berisiko

Rules awal:
- confirmation required
- max amount configurable
- token allowlist
- recipient sanity checks

### 4. Onchain execution layer
Tugas:
- build tx
- simulate tx
- execute tx
- return tx result

Tooling:
- viem / ethers
- Celo RPC

### 5. Receipt layer
Tugas:
- simpan hasil
- tampilkan summary
- jadi bukti demo

## Request flow
1. User kasih intent
2. Agent parse intent
3. Safety engine cek rule
4. Preview ditampilkan
5. User confirm
6. Simulate / execute tx
7. Receipt tampil
