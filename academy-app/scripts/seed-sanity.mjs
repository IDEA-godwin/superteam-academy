/**
 * Superteam Academy — Sanity CMS Course Seed Script
 *
 * Uploads dummy courses to the Sanity "production" dataset.
 * All documents conform to the `course` schema and `ICourse` interface.
 * Lessons are populated with type-specific fields matching the `lesson` schema:
 *   lessonType 1 = Video    → videoUrl
 *   lessonType 2 = Document → markdownContent
 *   lessonType 3 = Challenge→ objective, starterCode, solutionCode, hints, testCases
 *
 * Usage:
 *   1. pnpm add -D @sanity/client  (if not already installed)
 *   2. Add SANITY_TOKEN to .env  (Editor or above write token)
 *   3. node --env-file=.env scripts/seed-sanity.mjs
 */

import { createClient } from "@sanity/client";

const client = createClient({
   projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zxw68rr2",
   dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
   apiVersion: "2024-01-01",
   token: process.env.SANITY_TOKEN,
   useCdn: false,
});

const DIFFICULTY = { BEGINNER: "BEGINNER", INTERMEDIATE: "INTERMEDIATE", ADVANCED: "ADVANCED" };

function track(trackId, trackLevel, name) {
   return { trackId, trackLevel, name };
}

// ── LESSON BUILDERS ───────────────────────────────────────────────────────────

/** lessonType 1 — Video lesson */
function videoLesson(i, title, duration, videoUrl = "") {
   return {
      _key: `l${i}`, id: `l${i}`,
      title, duration,
      lessonType: 1,
      videoUrl,
   };
}

/** lessonType 2 — Document lesson */
function docLesson(i, title, duration, markdownContent = "") {
   return {
      _key: `l${i}`, id: `l${i}`,
      title, duration,
      lessonType: 2,
      markdownContent,
   };
}

/** lessonType 3 — Coding challenge */
function challenge(i, title, duration, { objective = "", starterCode = "", solutionCode = "", hints = [], testCases = [] } = {}) {
   return {
      _key: `l${i}`, id: `l${i}`,
      title, duration,
      lessonType: 3,
      objective,
      starterCode: { _type: "code", language: "rust", code: starterCode },
      solutionCode: { _type: "code", language: "rust", code: solutionCode },
      hints,
      testCases: testCases.map((tc, j) => ({ _key: `tc${j}`, input: tc.input, expectedOutput: tc.expectedOutput })),
   };
}

// ── COURSES ───────────────────────────────────────────────────────────────────

const COURSES = [

   // ── 1. INTRO TO SOLANA ──────────────────────────────────────────────────────
   {
      _type: "course",
      courseId: "intro-to-solana",
      title: "Intro to Solana",
      slug: { _type: "slug", current: "intro-to-solana" },
      description: "Your entry point into the Solana ecosystem. Accounts, transactions, and the runtime — everything that underpins every Solana program.",
      creator: { creatorName: "Superteam Academy", creatorPubKey: "" },
      difficulty: DIFFICULTY.BEGINNER,
      track: track(1, 1, "Blockchain Fundamentals"),
      modules: [
         {
            _key: "m0", id: 0,
            title: "Solana Fundamentals",
            description: "Core building blocks of the Solana runtime.",
            lessons: [
               docLesson(0, "What is Solana?", "8 min",
                  "## What is Solana?\n\nSolana is a high-performance Layer 1 blockchain capable of processing thousands of transactions per second.\n\n### Key properties\n- **Proof of History** — a cryptographic clock that orders events\n- **8 core innovations** including Tower BFT, Gulf Stream, and Turbine\n- Sub-second finality with sub-cent fees"),

               docLesson(1, "Accounts & Ownership", "12 min",
                  "## Accounts\n\nEverything on Solana is an account. Accounts store state, SOL, or executable programs.\n\n```\nAccount {\n  lamports: u64,\n  data: Vec<u8>,\n  owner: Pubkey,\n  executable: bool,\n}\n```"),

               docLesson(2, "Transactions & Signatures", "10 min",
                  "## Transactions\n\nA Solana transaction is a signed message containing one or more instructions.\n\n- Every write costs a small fee in SOL (lamports)\n- Transactions are atomic — all instructions succeed or all revert"),

               challenge(3, "Sending your first transaction", "15 min", {
                  objective: "Send 0.01 SOL from the signer account to a recipient address on devnet.",
                  starterCode: `use anchor_lang::prelude::*;\n\n#[program]\npub mod intro_transfer {\n    use super::*;\n    pub fn send(_ctx: Context<Send>) -> Result<()> {\n        // TODO: transfer 0.01 SOL to recipient\n        Ok(())\n    }\n}\n\n#[derive(Accounts)]\npub struct Send<'info> {\n    #[account(mut)]\n    pub signer: Signer<'info>,\n    /// CHECK: recipient\n    #[account(mut)]\n    pub recipient: AccountInfo<'info>,\n    pub system_program: Program<'info, System>,\n}`,
                  solutionCode: `use anchor_lang::prelude::*;\nuse anchor_lang::system_program;\n\n#[program]\npub mod intro_transfer {\n    use super::*;\n    pub fn send(ctx: Context<Send>) -> Result<()> {\n        let cpi_ctx = CpiContext::new(\n            ctx.accounts.system_program.to_account_info(),\n            system_program::Transfer {\n                from: ctx.accounts.signer.to_account_info(),\n                to: ctx.accounts.recipient.to_account_info(),\n            },\n        );\n        system_program::transfer(cpi_ctx, 10_000_000)?;\n        Ok(())\n    }\n}`,
                  hints: ["Use `system_program::transfer` via CPI", "0.01 SOL = 10,000,000 lamports"],
                  testCases: [
                     { input: "signer_balance_before", expectedOutput: "signer_balance_after < signer_balance_before" },
                     { input: "recipient_balance_before", expectedOutput: "recipient_balance_after == recipient_balance_before + 10000000" },
                  ],
               }),
            ],
         },
         {
            _key: "m1", id: 1,
            title: "Native Programs",
            description: "System, Token Program, and SPL ecosystem.",
            lessons: [
               docLesson(4, "System Program", "10 min",
                  "## System Program\n\nThe System Program (`11111111111111111111111111111111`) is responsible for creating accounts and transferring SOL.\n\n- `create_account` — allocates space and lamports\n- `transfer` — moves SOL between accounts"),

               docLesson(5, "SPL Token Program", "14 min",
                  "## SPL Token Program\n\nThe Token Program manages all fungible and non-fungible tokens on Solana.\n\n### Key concepts\n- **Mint** — defines the token (supply, decimals, authority)\n- **Token Account** — holds a user's balance for a specific mint\n- **ATA** — Associated Token Account derived from wallet + mint"),

               challenge(6, "SOL Transfer challenge", "18 min", {
                  objective: "Write an Anchor instruction that transfers SOL from payer to a vault account and stores the deposited amount.",
                  starterCode: `use anchor_lang::prelude::*;\n\n#[program]\npub mod vault {\n    use super::*;\n    pub fn deposit(_ctx: Context<Deposit>, _amount: u64) -> Result<()> {\n        // TODO\n        Ok(())\n    }\n}\n\n#[account]\npub struct Vault {\n    pub deposited: u64,\n}\n\n#[derive(Accounts)]\npub struct Deposit<'info> {\n    #[account(mut)]\n    pub payer: Signer<'info>,\n    #[account(mut)]\n    pub vault: Account<'info, Vault>,\n    pub system_program: Program<'info, System>,\n}`,
                  solutionCode: `pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {\n    let cpi = CpiContext::new(\n        ctx.accounts.system_program.to_account_info(),\n        system_program::Transfer {\n            from: ctx.accounts.payer.to_account_info(),\n            to: ctx.accounts.vault.to_account_info(),\n        },\n    );\n    system_program::transfer(cpi, amount)?;\n    ctx.accounts.vault.deposited += amount;\n    Ok(())\n}`,
                  hints: ["Use CPI to the system program", "Update `vault.deposited` after the transfer"],
                  testCases: [
                     { input: "deposit(100_000_000)", expectedOutput: "vault.deposited == 100000000" },
                  ],
               }),
            ],
         },
      ],
      lessonCount: 7,
      xpPerLesson: 100,
      creatorRewardXp: 50,
      minCompletionsForReward: 5,
      prerequisite: [],
   },

   // ── 2. ANCHOR FRAMEWORK ─────────────────────────────────────────────────────
   {
      _type: "course",
      courseId: "anchor-framework",
      title: "Anchor Framework Deep Dive",
      slug: { _type: "slug", current: "anchor-framework" },
      description: "Build production-grade Solana programs using the Anchor framework. Master accounts, instructions, constraints, CPIs, PDAs, and deploy your own DeFi primitive.",
      creator: { creatorName: "Maya Okonkwo", creatorPubKey: "" },
      difficulty: DIFFICULTY.INTERMEDIATE,
      track: track(2, 2, "Solana Programs"),
      modules: [
         {
            _key: "m0", id: 0,
            title: "Getting Started with Anchor",
            description: "Set up your environment and write your first program.",
            lessons: [
               docLesson(0, "What is Anchor?", "8 min",
                  "## What is Anchor?\n\nAnchor is a framework for Solana's Sealevel runtime that provides several developer-friendly abstractions:\n\n- **IDL generation** — auto-generates a JSON interface description\n- **Account validation macros** — `#[account]` and `#[derive(Accounts)]`\n- **CPI helpers** — typed cross-program invocation\n- **TypeScript client** — generated from the IDL"),

               docLesson(1, "Setting up your environment", "12 min",
                  "## Environment Setup\n\n### Prerequisites\n- Rust (`rustup install stable`)\n- Solana CLI (`sh -c \"$(curl ...)\"` )\n- Anchor CLI (`cargo install --git https://github.com/coral-xyz/anchor anchor-cli`)\n\n```bash\nanchor --version   # anchor-cli 0.30.x\nsolana --version   # 1.18.x\n```"),

               challenge(2, "Your first Anchor program", "15 min", {
                  objective: "Complete the `initialize` instruction to store a counter value of 0 in the Counter account.",
                  starterCode: `use anchor_lang::prelude::*;\n\ndeclare_id!(\"...\");\n\n#[program]\npub mod counter {\n    use super::*;\n    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {\n        // TODO: set ctx.accounts.counter.count = 0\n        Ok(())\n    }\n}\n\n#[account]\npub struct Counter { pub count: u64 }\n\n#[derive(Accounts)]\npub struct Initialize<'info> {\n    #[account(init, payer = authority, space = 8 + 8)]\n    pub counter: Account<'info, Counter>,\n    #[account(mut)]\n    pub authority: Signer<'info>,\n    pub system_program: Program<'info, System>,\n}`,
                  solutionCode: `pub fn initialize(ctx: Context<Initialize>) -> Result<()> {\n    ctx.accounts.counter.count = 0;\n    Ok(())\n}`,
                  hints: ["Access the counter via `ctx.accounts.counter`", "Fields on `Account<'info, Counter>` are mutable via `.count`"],
                  testCases: [{ input: "initialize()", expectedOutput: "counter.count == 0" }],
               }),

               docLesson(3, "Deploying to Devnet", "10 min",
                  "## Deploying\n\n```bash\nanchor build\nanchor deploy --provider.cluster devnet\n```\n\nUpdate `declare_id!` with the program ID printed after deploy."),
            ],
         },
         {
            _key: "m1", id: 1,
            title: "Accounts & Data Modeling",
            description: "Deep dive into Anchor account types and constraints.",
            lessons: [
               docLesson(4, "Account types in Anchor", "10 min",
                  "## Account Types\n\n| Type | Purpose |\n|---|---|\n| `Account<'info, T>` | Deserializes data into T |\n| `Signer<'info>` | Must have signed the transaction |\n| `Program<'info, T>` | Validates program address |\n| `SystemAccount<'info>` | System-owned account |\n| `UncheckedAccount<'info>` | No validation — use `/// CHECK:` |\n"),

               docLesson(5, "#[account] macros deep dive", "18 min",
                  "## Common Constraints\n\n```rust\n#[account(\n    init,              // create the account\n    payer = user,      // who pays rent\n    space = 8 + 32,    // discriminator + data\n    seeds = [b\"vault\", user.key().as_ref()],\n    bump,\n)]\npub vault: Account<'info, Vault>,\n```"),

               challenge(6, "PDAs and seeds", "22 min", {
                  objective: "Derive a PDA vault account using seeds `[b\"vault\", user.key()]` and store the canonical bump.",
                  starterCode: `use anchor_lang::prelude::*;\n\n#[account]\npub struct Vault { pub bump: u8 }\n\n#[derive(Accounts)]\npub struct InitVault<'info> {\n    // TODO: add vault PDA account with seeds [b\"vault\", user.key()]\n    #[account(mut)]\n    pub user: Signer<'info>,\n    pub system_program: Program<'info, System>,\n}`,
                  solutionCode: `#[derive(Accounts)]\npub struct InitVault<'info> {\n    #[account(\n        init,\n        payer = user,\n        space = 8 + 1,\n        seeds = [b\"vault\", user.key().as_ref()],\n        bump,\n    )]\n    pub vault: Account<'info, Vault>,\n    #[account(mut)]\n    pub user: Signer<'info>,\n    pub system_program: Program<'info, System>,\n}`,
                  hints: ["Use `seeds = [b\"vault\", user.key().as_ref()]`", "Add `bump` constraint and store `ctx.bumps.vault`"],
                  testCases: [{ input: "init_vault()", expectedOutput: "vault.bump != 0" }],
               }),

               docLesson(7, "Rent and storage costs", "12 min",
                  "## Rent\n\nAccounts must maintain a minimum lamport balance called **rent-exempt** threshold.\n\n```\nrent_exempt = 0.00089088 * (data_len + 128)\n```\n\nUse `space = 8 + YourStruct::INIT_SPACE` with the `InitSpace` derive macro."),

               docLesson(8, "Account validation constraints", "8 min",
                  "## Validation Constraints\n\n- `has_one = authority` — field must match a signer\n- `constraint = expr` — arbitrary boolean expression\n- `close = recipient` — closes the account and returns lamports\n- `realloc = new_space` — resize an existing account"),
            ],
         },
         {
            _key: "m2", id: 2,
            title: "Instructions & CPIs",
            description: "Write instructions and call other programs.",
            lessons: [
               docLesson(9, "Writing instructions", "15 min",
                  "## Instructions\n\nEvery public function inside `#[program]` becomes an instruction:\n\n```rust\npub fn my_instruction(ctx: Context<MyAccounts>, amount: u64) -> Result<()> {\n    // validate, mutate, emit events\n    emit!(MyEvent { amount });\n    Ok(())\n}\n```"),

               docLesson(10, "Cross-program invocations", "25 min",
                  "## CPIs\n\nTo call another program from yours:\n\n```rust\nlet cpi_ctx = CpiContext::new(\n    ctx.accounts.token_program.to_account_info(),\n    Transfer { from, to, authority },\n);\ntoken::transfer(cpi_ctx, amount)?;\n```"),

               challenge(11, "Signed CPIs with PDAs", "20 min", {
                  objective: "Transfer tokens from a PDA-owned token account using a signed CPI.",
                  starterCode: `// Transfer tokens from vault_ata (owned by vault PDA) to user_ata\npub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {\n    // TODO: signed CPI with PDA seeds\n    Ok(())\n}`,
                  solutionCode: `pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {\n    let seeds = &[b\"vault\", ctx.accounts.user.key.as_ref(), &[ctx.accounts.vault.bump]];\n    let signer_seeds = &[&seeds[..]];\n    let cpi = CpiContext::new_with_signer(\n        ctx.accounts.token_program.to_account_info(),\n        token::Transfer {\n            from: ctx.accounts.vault_ata.to_account_info(),\n            to: ctx.accounts.user_ata.to_account_info(),\n            authority: ctx.accounts.vault.to_account_info(),\n        },\n        signer_seeds,\n    );\n    token::transfer(cpi, amount)?;\n    Ok(())\n}`,
                  hints: ["Use `CpiContext::new_with_signer` for PDA-signed CPIs", "Pass `&[&seeds[..]]` as the third argument"],
                  testCases: [{ input: "withdraw(500)", expectedOutput: "user_ata.amount increased by 500" }],
               }),

               docLesson(12, "Error handling", "18 min",
                  "## Custom Errors\n\n```rust\n#[error_code]\npub enum MyError {\n    #[msg(\"Amount exceeds vault balance\")]\n    InsufficientFunds,\n}\n\nrequire!(amount <= vault.balance, MyError::InsufficientFunds);\n```"),

               docLesson(13, "Testing with Bankrun", "12 min",
                  "## Bankrun\n\nBankrun spins up a local in-memory validator — perfect for fast unit tests.\n\n```ts\nconst context = await startAnchor(\".\", [], []);\nconst client = context.banksClient;\n```"),
            ],
         },
         {
            _key: "m3", id: 3,
            title: "Build: Token Vault DeFi",
            description: "Build and deploy a real DeFi vault program.",
            lessons: [
               docLesson(14, "Architecture & design", "20 min",
                  "## Vault Architecture\n\nWe will build a token vault that:\n1. Accepts SPL token deposits\n2. Tracks each depositor's share\n3. Allows proportional withdrawals\n4. Charges a 0.3% protocol fee"),

               challenge(15, "Vault deposit logic", "25 min", {
                  objective: "Implement `deposit`: transfer tokens from user to vault, update depositor's recorded balance.",
                  starterCode: `pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {\n    // 1. CPI: transfer amount from user_ata → vault_ata\n    // 2. Update ctx.accounts.depositor.balance\n    Ok(())\n}`,
                  solutionCode: `pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {\n    let cpi = CpiContext::new(\n        ctx.accounts.token_program.to_account_info(),\n        token::Transfer {\n            from: ctx.accounts.user_ata.to_account_info(),\n            to: ctx.accounts.vault_ata.to_account_info(),\n            authority: ctx.accounts.user.to_account_info(),\n        },\n    );\n    token::transfer(cpi, amount)?;\n    ctx.accounts.depositor.balance += amount;\n    Ok(())\n}`,
                  hints: ["Standard CPI — no PDA signer needed here (user signs)", "Update depositor account after transfer"],
                  testCases: [{ input: "deposit(1_000_000)", expectedOutput: "depositor.balance == 1000000" }],
               }),

               challenge(16, "Withdrawal & fee logic", "25 min", {
                  objective: "Implement `withdraw`: deduct a 0.3% fee, transfer net amount to user, update depositor balance.",
                  starterCode: `pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {\n    // fee = amount * 3 / 1000\n    // net = amount - fee\n    // TODO\n    Ok(())\n}`,
                  solutionCode: `pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {\n    require!(ctx.accounts.depositor.balance >= amount, VaultError::InsufficientFunds);\n    let fee = amount * 3 / 1000;\n    let net = amount - fee;\n    // Transfer net to user (signed CPI via vault PDA)\n    // Transfer fee to protocol treasury\n    ctx.accounts.depositor.balance -= amount;\n    ctx.accounts.vault.total_fees += fee;\n    Ok(())\n}`,
                  hints: ["Fee = amount × 3 / 1000", "Use `require!` to guard against overdraw"],
                  testCases: [
                     { input: "withdraw(1_000_000)", expectedOutput: "user receives 997000 tokens" },
                     { input: "withdraw(1_000_000)", expectedOutput: "vault.total_fees increases by 3000" },
                  ],
               }),

               docLesson(17, "Frontend integration", "30 min",
                  "## Connecting the Frontend\n\nUse the Anchor-generated IDL to call your program from a Next.js app:\n\n```ts\nconst program = new Program(IDL, provider);\nawait program.methods.deposit(new BN(1_000_000)).accounts({ ... }).rpc();\n```"),

               docLesson(18, "Security audit checklist", "15 min",
                  "## Pre-Launch Checklist\n\n- [ ] All `UncheckedAccount` uses have `/// CHECK:` comments\n- [ ] Arithmetic uses checked math or `checked_add`\n- [ ] Signer constraints on privileged instructions\n- [ ] Ownership checks on passed-in accounts\n- [ ] Reentrancy guards where applicable"),
            ],
         },
      ],
      lessonCount: 19,
      xpPerLesson: 120,
      creatorRewardXp: 100,
      minCompletionsForReward: 3,
      prerequisite: [],
   },

   // ── 3. RUST FOR SOLANA ──────────────────────────────────────────────────────
   {
      _type: "course",
      courseId: "rust-for-solana",
      title: "Rust for Solana Developers",
      slug: { _type: "slug", current: "rust-for-solana" },
      description: "Ownership, lifetimes, traits, enums, and error handling — the Rust concepts that matter most in Solana programs.",
      creator: { creatorName: "Rustacean", creatorPubKey: "" },
      difficulty: DIFFICULTY.BEGINNER,
      track: track(1, 2, "Blockchain Fundamentals"),
      modules: [
         {
            _key: "m0", id: 0,
            title: "Rust Basics",
            description: "Ownership, borrowing, and types.",
            lessons: [
               docLesson(0, "Ownership & Borrowing", "20 min",
                  "## Ownership\n\nEvery value in Rust has a single owner. When the owner goes out of scope, the value is dropped.\n\n```rust\nlet s1 = String::from(\"hello\");\nlet s2 = s1; // s1 is moved, no longer valid\n```\n\n## Borrowing\n\nUse `&` to borrow a value without taking ownership:\n\n```rust\nfn print(s: &String) { println!(\"{}\", s); }\n```"),

               docLesson(1, "Structs and Enums", "15 min",
                  "## Structs\n\n```rust\nstruct User { name: String, balance: u64 }\n```\n\n## Enums\n\n```rust\nenum Instruction { Deposit { amount: u64 }, Withdraw { amount: u64 } }\n```\n\nEnums are central to Solana instruction dispatching."),

               challenge(2, "Error Handling with Result", "12 min", {
                  objective: "Implement `safe_divide` returning an `Err` when divisor is zero.",
                  starterCode: `pub fn safe_divide(a: u64, b: u64) -> Result<u64, String> {\n    // TODO: return Err(\"division by zero\") if b == 0\n    todo!()\n}`,
                  solutionCode: `pub fn safe_divide(a: u64, b: u64) -> Result<u64, String> {\n    if b == 0 {\n        Err(\"division by zero\".to_string())\n    } else {\n        Ok(a / b)\n    }\n}`,
                  hints: ["Return `Ok(a / b)` in the happy path", "Return `Err(...)` when `b == 0`"],
                  testCases: [
                     { input: "safe_divide(10, 2)", expectedOutput: "Ok(5)" },
                     { input: "safe_divide(10, 0)", expectedOutput: "Err(\"division by zero\")" },
                  ],
               }),
            ],
         },
         {
            _key: "m1", id: 1,
            title: "Rust in Solana",
            description: "Apply Rust patterns inside Anchor programs.",
            lessons: [
               docLesson(3, "Traits & Generics in Anchor", "18 min",
                  "## Traits\n\nAnchor uses traits heavily. For example `AccountSerialize` and `AccountDeserialize` are implemented by the `#[account]` macro.\n\n```rust\npub trait Space { const INIT_SPACE: usize; }\n```"),

               docLesson(4, "Iterators & closures", "15 min",
                  "## Iterators\n\n```rust\nlet total: u64 = deposits.iter().map(|d| d.amount).sum();\n```\n\nIterators are zero-cost abstractions — they compile down to the same code as a manual loop."),

               challenge(5, "Writing idiomatic on-chain Rust", "20 min", {
                  objective: "Rewrite the provided imperative loop as an iterator chain that sums only deposits above 1000 lamports.",
                  starterCode: `pub fn sum_large_deposits(deposits: &[u64]) -> u64 {\n    let mut total = 0u64;\n    for d in deposits {\n        if *d > 1000 {\n            total += d;\n        }\n    }\n    total\n}`,
                  solutionCode: `pub fn sum_large_deposits(deposits: &[u64]) -> u64 {\n    deposits.iter().filter(|&&d| d > 1000).sum()\n}`,
                  hints: ["Chain `.filter()` then `.sum()`"],
                  testCases: [
                     { input: "sum_large_deposits(&[500, 2000, 1500, 100])", expectedOutput: "3500" },
                  ],
               }),
            ],
         },
      ],
      lessonCount: 6,
      xpPerLesson: 100,
      creatorRewardXp: 50,
      minCompletionsForReward: 5,
      prerequisite: [],
   },

   // ── 4. DEFI PROTOCOLS ───────────────────────────────────────────────────────
   {
      _type: "course",
      courseId: "defi-protocols",
      title: "DeFi Protocols on Solana",
      slug: { _type: "slug", current: "defi-protocols" },
      description: "AMMs, lending protocols, and yield strategies. Uses Anchor, Token-2022, and real devnet deployments.",
      creator: { creatorName: "Ji-Young K.", creatorPubKey: "" },
      difficulty: DIFFICULTY.ADVANCED,
      track: track(3, 1, "DeFi"),
      modules: [
         {
            _key: "m0", id: 0,
            title: "AMM Architecture",
            description: "How automated market makers work on Solana.",
            lessons: [
               docLesson(0, "AMM Basics", "15 min",
                  "## Automated Market Makers\n\nAMMs replace the order book with a mathematical formula.\n\n### How it works\n1. Liquidity providers deposit token pairs\n2. Prices are determined by the pool ratio\n3. Traders swap against the pool, paying a fee"),

               docLesson(1, "Constant product formula", "12 min",
                  "## x · y = k\n\nThe constant product formula maintains `x * y = k` after every swap.\n\n```\namountOut = (amountIn * reserveOut) / (reserveIn + amountIn)\n```\n\nThis causes **price impact** — large swaps move the price more."),

               challenge(2, "Build a minimal AMM", "30 min", {
                  objective: "Implement `swap_a_to_b` using the constant product formula. Deduct a 0.3% fee from the input amount.",
                  starterCode: `pub fn swap_a_to_b(ctx: Context<Swap>, amount_in: u64) -> Result<()> {\n    let reserve_a = ctx.accounts.pool_a.amount;\n    let reserve_b = ctx.accounts.pool_b.amount;\n    // TODO: calculate amount_out using x*y=k, deduct 0.3% fee\n    Ok(())\n}`,
                  solutionCode: `pub fn swap_a_to_b(ctx: Context<Swap>, amount_in: u64) -> Result<()> {\n    let fee = amount_in * 3 / 1000;\n    let net_in = amount_in - fee;\n    let reserve_a = ctx.accounts.pool_a.amount;\n    let reserve_b = ctx.accounts.pool_b.amount;\n    let amount_out = (net_in as u128 * reserve_b as u128 / (reserve_a as u128 + net_in as u128)) as u64;\n    // CPI: transfer amount_in from user to pool_a, amount_out from pool_b to user\n    Ok(())\n}`,
                  hints: ["Use u128 for intermediate calculations to avoid overflow", "Fee: net_in = amount_in * 997 / 1000"],
                  testCases: [
                     { input: "swap_a_to_b(1_000_000) with reserves (10M, 10M)", expectedOutput: "amount_out ≈ 996,999" },
                  ],
               }),
            ],
         },
         {
            _key: "m1", id: 1,
            title: "Lending Protocols",
            description: "Collateral, liquidation, and utilization rates.",
            lessons: [
               docLesson(3, "Collateral & LTV", "18 min",
                  "## Loan-to-Value\n\nLTV = (borrowed value) / (collateral value) × 100\n\nIf LTV exceeds the liquidation threshold (e.g. 80%), the position can be liquidated.\n\n```\nmax_borrow = collateral_value * max_ltv\n```"),

               challenge(4, "Liquidation logic", "20 min", {
                  objective: "Implement `liquidate`: allow a liquidator to repay an undercollateralised loan and claim collateral at a 5% discount.",
                  starterCode: `pub fn liquidate(ctx: Context<Liquidate>, repay_amount: u64) -> Result<()> {\n    // 1. Assert position is undercollateralised\n    // 2. Calculate collateral_seized = repay_amount * 1.05 / oracle_price\n    // 3. Transfer tokens\n    Ok(())\n}`,
                  solutionCode: `pub fn liquidate(ctx: Context<Liquidate>, repay_amount: u64) -> Result<()> {\n    let position = &ctx.accounts.position;\n    let ltv = position.borrowed * 100 / position.collateral_value;\n    require!(ltv > 80, LendingError::NotLiquidatable);\n    let collateral_seized = repay_amount * 105 / 100;\n    // CPI transfers omitted for brevity\n    Ok(())\n}`,
                  hints: ["LTV > 80 means liquidatable", "Bonus = 5%, so seized = repay * 1.05"],
                  testCases: [{ input: "liquidate with LTV=85", expectedOutput: "liquidation succeeds" }],
               }),

               docLesson(5, "Interest rate model", "15 min",
                  "## Utilization Rate\n\n```\nutilization = total_borrowed / total_supplied\n```\n\nInterest rate rises with utilization to incentivize suppliers and discourage borrowing near 100%."),
            ],
         },
      ],
      lessonCount: 6,
      xpPerLesson: 150,
      creatorRewardXp: 120,
      minCompletionsForReward: 3,
      prerequisite: [],
   },

   // ── 5. PROGRAM SECURITY ─────────────────────────────────────────────────────
   {
      _type: "course",
      courseId: "program-security",
      title: "Solana Program Security",
      slug: { _type: "slug", current: "program-security" },
      description: "Signer spoofing, account substitution, arbitrary CPI, and how to defend against them.",
      creator: { creatorName: "Kwame A.", creatorPubKey: "" },
      difficulty: DIFFICULTY.ADVANCED,
      track: track(4, 1, "Security"),
      modules: [
         {
            _key: "m0", id: 0,
            title: "Attack Vectors",
            description: "Common vulnerabilities and how they manifest.",
            lessons: [
               docLesson(0, "Missing signer checks", "12 min",
                  "## Missing Signer Checks\n\nIf you forget to verify that a privileged account actually signed the transaction, anyone can pass in that account.\n\n```rust\n// VULNERABLE — no signer check\npub authority: AccountInfo<'info>,\n\n// SAFE\npub authority: Signer<'info>,\n```"),

               docLesson(1, "Account substitution attacks", "15 min",
                  "## Account Substitution\n\nAn attacker passes a different account than expected. Always verify the owner and key:\n\n```rust\n#[account(has_one = authority)]\npub vault: Account<'info, Vault>,\n```\n\nThe `has_one` constraint ensures `vault.authority == authority.key()`."),

               challenge(2, "Privilege escalation via CPI", "18 min", {
                  objective: "Identify and fix the vulnerability in the provided program that allows an attacker to drain the vault via a malicious CPI.",
                  starterCode: `// VULNERABLE: accepts any token_program account\npub fn drain(ctx: Context<Drain>) -> Result<()> {\n    // CPI using ctx.accounts.token_program (not validated)\n    Ok(())\n}`,
                  solutionCode: `// SAFE: constrain token_program to the canonical SPL Token program\n#[derive(Accounts)]\npub struct Drain<'info> {\n    pub token_program: Program<'info, Token>, // enforces program ID\n}\n\npub fn drain(ctx: Context<Drain>) -> Result<()> {\n    // Now token_program is guaranteed to be the real SPL Token program\n    Ok(())\n}`,
                  hints: ["Use `Program<'info, Token>` instead of `AccountInfo<'info>`", "Anchor validates the program ID automatically"],
                  testCases: [{ input: "drain() with fake token_program", expectedOutput: "Error: constraint violated" }],
               }),
            ],
         },
         {
            _key: "m1", id: 1,
            title: "Defensive Patterns",
            description: "Anchor constraints and defensive programming.",
            lessons: [
               docLesson(3, "Anchor constraint reference", "20 min",
                  "## Constraint Cheatsheet\n\n| Constraint | Description |\n|---|---|\n| `signer` | Account must sign |\n| `mut` | Account data will be mutated |\n| `has_one = x` | x field matches account key |\n| `constraint = expr` | Custom boolean check |\n| `owner = program_id` | Account owned by given program |\n| `address = pubkey` | Exact address match |"),

               challenge(4, "Auditing a real program", "25 min", {
                  objective: "Review the provided program snippet and add all missing constraints to prevent the three identified attack vectors.",
                  starterCode: `#[derive(Accounts)]\npub struct Withdraw<'info> {\n    pub vault: Account<'info, Vault>,      // missing: mut, has_one\n    pub authority: AccountInfo<'info>,     // missing: signer constraint\n    pub destination: AccountInfo<'info>,   // missing: mut\n    pub token_program: AccountInfo<'info>, // missing: Program type\n}`,
                  solutionCode: `#[derive(Accounts)]\npub struct Withdraw<'info> {\n    #[account(mut, has_one = authority)]\n    pub vault: Account<'info, Vault>,\n    pub authority: Signer<'info>,\n    #[account(mut)]\n    pub destination: AccountInfo<'info>,\n    pub token_program: Program<'info, Token>,\n}`,
                  hints: ["All writes need `mut`", "Privileged accounts need `Signer`", "Programs need `Program<'info, T>`"],
                  testCases: [{ input: "withdraw with wrong authority", expectedOutput: "Error: A has_one constraint was violated" }],
               }),
            ],
         },
      ],
      lessonCount: 5,
      xpPerLesson: 150,
      creatorRewardXp: 100,
      minCompletionsForReward: 3,
      prerequisite: [],
   },

   // ── 6. NFT MARKETPLACE ──────────────────────────────────────────────────────
   {
      _type: "course",
      courseId: "nft-marketplace",
      title: "Build an NFT Marketplace",
      slug: { _type: "slug", current: "nft-marketplace" },
      description: "Metaplex Core, listing/delisting, royalties enforcement, and a Next.js storefront.",
      creator: { creatorName: "NFT Hunter", creatorPubKey: "" },
      difficulty: DIFFICULTY.INTERMEDIATE,
      track: track(5, 1, "NFTs & Digital Assets"),
      modules: [
         {
            _key: "m0", id: 0,
            title: "Metaplex Core",
            description: "Minting and managing NFTs with Metaplex Core.",
            lessons: [
               docLesson(0, "What is Metaplex Core?", "10 min",
                  "## Metaplex Core\n\nMetaplex Core is the next-generation NFT standard on Solana. Unlike the Token Metadata program, Core stores all NFT data in a single account — reducing minting costs by up to 80%.\n\n### Key concepts\n- **Asset** — the NFT itself\n- **Collection** — groups of assets\n- **Plugin** — composable extensions (royalties, freeze, etc.)"),

               challenge(1, "Mint your first NFT", "20 min", {
                  objective: "Use the Metaplex Core JS SDK to mint an NFT with name, uri, and a royalty plugin.",
                  starterCode: `import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";\nimport { create } from "@metaplex-foundation/mpl-core";\n\nconst umi = createUmi("https://api.devnet.solana.com");\n\n// TODO: create an NFT asset with name "My First NFT",\n// uri pointing to a JSON metadata file, and 500 bps royalty`,
                  solutionCode: `const asset = generateSigner(umi);\nawait create(umi, {\n   asset,\n   name: "My First NFT",\n   uri: "https://example.com/metadata.json",\n   plugins: [{\n      type: "Royalties",\n      basisPoints: 500,\n      creators: [{ address: umi.identity.publicKey, percentage: 100 }],\n      ruleSet: ruleSet("None"),\n   }],\n}).sendAndConfirm(umi);`,
                  hints: ["Use `generateSigner(umi)` for the asset keypair", "500 bps = 5% royalty"],
                  testCases: [{ input: "create NFT", expectedOutput: "asset account created on-chain" }],
               }),

               docLesson(2, "Collections & plugins", "15 min",
                  "## Collections\n\n```ts\nconst collection = generateSigner(umi);\nawait createCollection(umi, {\n   collection,\n   name: \"My Collection\",\n   uri: \"...\",\n}).sendAndConfirm(umi);\n```\n\nPlugins on a collection are inherited by all its assets."),
            ],
         },
         {
            _key: "m1", id: 1,
            title: "Marketplace Program",
            description: "List, buy, and delist on-chain.",
            lessons: [
               docLesson(3, "Listing accounts design", "18 min",
                  "## Listing Account\n\n```rust\n#[account]\npub struct Listing {\n   pub seller: Pubkey,\n   pub asset: Pubkey,\n   pub price: u64,\n   pub bump: u8,\n}\n```\n\nThe listing PDA uses `seeds = [b\"listing\", asset.key()]` so it is uniquely tied to the NFT."),

               challenge(4, "Buy & escrow logic", "25 min", {
                  objective: "Implement `buy_nft`: transfer SOL from buyer to seller, transfer NFT ownership, and close the listing account.",
                  starterCode: `pub fn buy_nft(ctx: Context<BuyNft>) -> Result<()> {\n    let listing = &ctx.accounts.listing;\n    // 1. Transfer listing.price SOL from buyer to seller\n    // 2. Transfer NFT from seller to buyer (via Metaplex CPI)\n    // 3. Close listing account, return rent to seller\n    Ok(())\n}`,
                  solutionCode: `pub fn buy_nft(ctx: Context<BuyNft>) -> Result<()> {\n    // SOL transfer\n    let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(\n        &ctx.accounts.buyer.key(),\n        &ctx.accounts.seller.key(),\n        ctx.accounts.listing.price,\n    );\n    anchor_lang::solana_program::program::invoke(\n        &transfer_ix,\n        &[ctx.accounts.buyer.to_account_info(), ctx.accounts.seller.to_account_info()],\n    )?;\n    // NFT transfer (Metaplex Core CPI) + close listing omitted for brevity\n    Ok(())\n}`,
                  hints: ["Use `system_instruction::transfer` for SOL", "Metaplex Core has a `transfer` CPI helper"],
                  testCases: [{ input: "buy_nft() with price=1 SOL", expectedOutput: "seller receives 1 SOL, buyer owns NFT" }],
               }),

               docLesson(5, "Royalties enforcement", "15 min",
                  "## Royalties\n\nMetaplex Core enforces royalties at the protocol level via the Royalties plugin. Your marketplace program must call the Core `transfer` CPI (not a raw token transfer) so the plugin can deduct creator fees automatically."),
            ],
         },
         {
            _key: "m2", id: 2,
            title: "Storefront Frontend",
            description: "Next.js UI integrated with your marketplace program.",
            lessons: [
               docLesson(6, "Fetching listings via Helius DAS", "20 min",
                  "## Helius DAS API\n\nUse the Digital Asset Standard API to fetch all NFTs in a collection:\n\n```ts\nconst { items } = await helius.rpc.getAssetsByGroup({\n   groupKey: \"collection\",\n   groupValue: COLLECTION_ADDRESS,\n});\n```"),

               challenge(7, "Buy button & wallet flow", "25 min", {
                  objective: "Wire up a Buy button that calls your marketplace program's `buy_nft` instruction using wallet-adapter.",
                  starterCode: `async function handleBuy(listing: Listing) {\n   // TODO: create Anchor program instance, call buy_nft instruction\n}`,
                  solutionCode: `async function handleBuy(listing: Listing) {\n   const program = new Program(IDL, provider);\n   await program.methods\n      .buyNft()\n      .accounts({\n         buyer: wallet.publicKey,\n         seller: listing.seller,\n         listing: listing.pda,\n         asset: listing.asset,\n         systemProgram: SystemProgram.programId,\n      })\n      .rpc();\n}`,
                  hints: ["Use `useAnchorProvider()` from wallet-adapter", "Pass all accounts from the `BuyNft` context"],
                  testCases: [{ input: "handleBuy(listing)", expectedOutput: "transaction confirmed" }],
               }),
            ],
         },
      ],
      lessonCount: 8,
      xpPerLesson: 120,
      creatorRewardXp: 80,
      minCompletionsForReward: 4,
      prerequisite: [],
   },
];

// ── SEED FUNCTION ─────────────────────────────────────────────────────────────
async function seed() {
   console.log(`\n🌱 Seeding ${COURSES.length} courses to Sanity...\n`);

   for (const course of COURSES) {
      const existing = await client.fetch(
         `*[_type == "course" && courseId == $id][0]._id`,
         { id: course.courseId }
      );

      if (existing) {
         console.log(`⏭  Skipped "${course.title}" (already exists: ${existing})`);
         continue;
      }

      const created = await client.create(course);
      console.log(`✅  Created "${course.title}" → ${created._id}`);
   }

   console.log("\n🎉 Seed complete!\n");
}

seed().catch((err) => {
   console.error("\n❌ Seed failed:", err.message);
   process.exit(1);
});
