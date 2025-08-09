# Tic Tac Toe dApp on Stacks

A decentralized Tic Tac Toe game built on the Stacks blockchain. Play 1v1, create and join games, and interact with smart contracts directly from a modern web interface.

---

## Features

- Play Tic Tac Toe on-chain with real STX bets (testnet/mainnet)
- Create, join, and play games with anyone
- Wallet connect (Stacks)
- Responsive, modern UI (Next.js + Tailwind CSS)
- Smart contract written in Clarity
- Rate-limit resilient backend and frontend

---

## Tech Stack

- **Smart Contract:** Clarity (Stacks blockchain)
- **Frontend:** Next.js (App Router), React, Tailwind CSS v4
- **Wallet:** Stacks.js, Hiro Wallet
- **Testing:** Vitest, Clarinet

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/wildanniam/dApps-tictactoe-games.git
cd dApps-tictactoe-games
npm install
cd frontend
npm install
```

### 2. Run Smart Contract Tests

```bash
clarinet test
```

### 3. Run Frontend (Dev)

```bash
cd frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Deploy Smart Contract (Testnet)

```bash
clarinet deployment generate --testnet --low-cost
clarinet deployment apply --testnet
```

- Make sure your mnemonic in `settings/Testnet.toml` has STX (use faucet)

---

## Folder Structure

```
contracts/           # Clarity smart contract
frontend/            # Next.js app (React + Tailwind)
  ├── app/           # App directory (pages, layout, etc)
  ├── components/    # React components
  ├── lib/           # Contract and utility logic
  └── ...
tests/               # Contract unit tests (TypeScript)
settings/            # Clarinet config (Testnet/Mainnet)
deployments/         # Deployment plans
```

---

## How to Deploy to Mainnet

1. Update mnemonic in `settings/Mainnet.toml` (must have real STX)
2. Run:

```bash
clarinet deployment generate --mainnet --low-cost
clarinet deployment apply --mainnet
```

---

## Contribution

Pull requests welcome! Please open an issue first for major changes.

---

## License

MIT

---

## Credits

- [Stacks](https://stacks.co/)
- [Hiro Systems](https://www.hiro.so/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Next.js](https://nextjs.org/)

---

Enjoy playing and building on Stacks!
