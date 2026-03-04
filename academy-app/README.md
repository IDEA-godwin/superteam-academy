# Superteam Academy

> The on-chain, gamified developer education platform built on Solana. Learn Rust, Anchor, and DeFi — earn verifiable XP tokens and soulbound NFT credentials with every course you complete.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Local Development Setup](#local-development-setup)
6. [Environment Variables](#environment-variables)
7. [Available Scripts](#available-scripts)
8. [Deployment](#deployment)
9. [Contributing](#contributing)

---

## Overview

Superteam Academy is a production-ready Next.js application that pairs a rich learning interface with Solana on-chain state. Learners connect their wallet, enroll in courses, complete lessons, and receive:

- **XP Tokens** (Token-2022) for every lesson completed
- **Soulbound NFT Credentials** (Metaplex Core) for finishing a full course
- **Global Leaderboard ranking** based on cumulative XP

A **split-signer model** ensures learners cannot self-award XP: the frontend signs enrollment transactions while a backend keypair signs all lesson-completion and credential-issuance instructions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | React 19 + TailwindCSS 4 + shadcn/ui |
| Animations | Framer Motion 12 |
| Internationalization | next-intl 4 (EN / ES / PT) |
| On-chain | Solana · Anchor 0.32 · @solana/web3.js |
| Tokens | SPL Token-2022 (XP) · Metaplex Core (Credentials) |
| Wallet | Dynamic Labs SDK (multi-wallet) |
| CMS | Sanity 4 (course content, lessons, modules) |
| Data Fetching | TanStack Query 5 |
| Auth | NextAuth 4 (social logins) |
| Code Editor | CodeMirror 6 (Rust, JS, JSON) |
| Monitoring | Sentry |
| DB (local dev) | lowdb (JSON flat-file for leaderboard / gamification) |

---

## Project Structure

```
academy-app/
├── messages/               # i18n locale files (en.json, es.json, pt.json)
├── public/                 # Static assets
├── scripts/
│   └── seed-sanity.mjs     # One-shot Sanity CMS seeder
├── src/
│   ├── app/
│   │   ├── [locale]/       # Locale-prefixed routes
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── dashboard/        # Authenticated dashboard
│   │   │   ├── courses/          # Course catalogue + detail + lessons
│   │   │   ├── certificates/     # Shareable on-chain credential pages
│   │   │   │   └── [id]/         #   /certificates/<nft-mint-address>
│   │   │   ├── leaderboard/      # Global XP leaderboard
│   │   │   ├── profile/          # User profile + credentials
│   │   │   ├── settings/         # Account settings
│   │   │   └── admin/            # Admin panel (course sync, config)
│   │   └── api/
│   │       ├── auth/             # NextAuth handlers
│   │       └── course/
│   │           ├── complete-lesson/  # Backend signs lesson completion
│   │           └── finalize/         # Backend signs credential issuance
│   ├── components/         # Shared UI components
│   ├── hooks/
│   │   └── queries/        # TanStack Query hooks (useCourseData, useCourseEnrollment…)
│   ├── i18n/               # next-intl routing + request config
│   ├── lib/                # Utilities: PDA derivation, constants, leveling service
│   ├── sanity/             # Sanity schema types + client
│   ├── services/           # Business logic: courseService, userService, adminService…
│   └── types/              # TypeScript types + Anchor IDL
└── wallets/
    └── signer.json         # Backend signer keypair (NEVER commit)
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20 |
| pnpm / npm | any recent |
| Solana CLI | ≥ 1.18 |
| Anchor CLI | ≥ 0.32 |
| A Solana wallet | Phantom / Backpack / any Dynamic-compatible |

You also need:
- A [Sanity account](https://sanity.io) with a project (free tier works)

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/superteam-academy.git
cd superteam-academy/academy-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in values (see [Environment Variables](#environment-variables)):

```bash
cp .env.example .env
```

### 4. Generate your backend signer keypair

```bash
mkdir wallets
solana-keygen new --outfile wallets/signer.json
# Fund it on devnet
solana airdrop 2 $(solana-keygen pubkey wallets/signer.json) --url devnet
```

### 5. Seed Sanity CMS with course content

```bash
npm run seed:sanity
```

This creates 6 courses with full lesson content in your Sanity dataset.

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Sanity Studio (content editing)

Navigate to `/studio` in your browser (e.g. `http://localhost:3000/studio`) or run the embedded studio directly.

---

## Environment Variables

Create a `.env` file in `academy-app/`:

```env
# ── Solana ─────────────────────────────────────────────────────────────────────
# RPC endpoint — use Helius for production
NEXT_PUBLIC_DEVNET_URL=https://api.devnet.solana.com

# ── Sanity CMS ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production

# Write-access token for seeding and mutations (keep secret)
SANITY_TOKEN=your_sanity_write_token

# ── NextAuth ────────────────────────────────────────────────────────────────────
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

> **Never commit `ANCHOR_WALLET` path contents or `SANITY_TOKEN` to version control.**

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server with hot reload |
| `npm run build` | Build production bundle |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run seed:sanity` | Seed Sanity CMS with default courses |

---

## Deployment

### Vercel (recommended)

1. Push to GitHub and import the project in [Vercel](https://vercel.com).
2. Set the **root directory** to `academy-app/`.
3. Add all environment variables from the table above in Vercel's project settings.
4. Deploy — Vercel handles Next.js App Router and serverless API routes automatically.

> Replace `NEXT_PUBLIC_DEVNET_URL` with a [Helius](https://helius.dev) RPC URL in production for reliability.

### Backend Signer on Vercel

The `ANCHOR_WALLET` path won't work in serverless environments. Instead:

1. Export your signer keypair as a base-64 string:
   ```bash
   cat wallets/signer.json | base64
   ```
2. Store that string as `BACKEND_KEYPAIR_B64` in Vercel env vars.
3. Update `getBackendProgram()` in `src/app/api/course/*/route.ts` to read from this env var instead of the file path.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Run `npm run lint` before opening a PR.
3. All on-chain changes require updating the Anchor IDL at `src/types/idl/onchain_academy.json`.
4. Keep locale files (`messages/`) in sync — all 3 files (en, es, pt) must have the same keys.
