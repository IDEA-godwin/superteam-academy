// ── TYPES ───────────────────────────────────────────────────────────────────────
export interface UserProfile {
   name: string;
   email: string;
   username: string;
   avatar: string;
   level: number;
   rank: number;
   xp: number;
   streak: number;
   bio: string;
   twitter: string;
   github: string;
   website: string;
   joinDate: string;
   skills: Record<string, number>;
}

export interface Achievement {
   icon: string;
   label: string;
   desc: string;
   rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export interface Credential {
   id: string;
   course: string;
   track: string;
   level: string;
   date: string;
   xp: number;
   mintAddress: string;
   evolvedTo: string;
   icon: string;
   color: string;
}

export interface CompletedCourse {
   slug: string;
   title: string;
   icon: string;
   completedDate: string;
   xp: number;
}

export interface LeaderboardUser {
   rank: number;
   username: string;
   avatar: string;
   name: string;
   xp: number;
   level: number;
   streak: number;
   badge: string;
   courses: string[];
   country?: string;   // emoji flag
   twitter?: string;   // @handle
}

export interface CourseFilter {
   slug: string;
   label: string;
}

export type LessonType = "document" | "video" | "challenge";

export interface TestCase {
   id: string;
   description: string;
   validationSnippet: string;
}

export interface Lesson {
   id: number;
   title: string;
   module: string;
   duration: string;
   xp: number;
   courseSlug: string;
   courseTitle: string;
   type: LessonType;
   content: string;
   prev?: { id: string; title: string };
   next?: { id: string; title: string };

   videoUrl?: string;
   /** Portable Text blocks — populated when lesson is fetched from Sanity */
   body?: any[];
   /** Raw markdown body — populated from Sanity markdownContent field */
   markdownContent?: string;
   starterCode?: string | { _type: "code"; code: string; language: string };
   solutionCode?: string | { _type: "code"; code: string; language: string };
   language?: "rust" | "typescript" | "javascript" | "json";
   testCases?: TestCase[];
   hints?: string[];
}

// ── MOCK DATA ──────────────────────────────────────────────────────────────────

export const DUMMY_USER: UserProfile = {
   username: "sol_maya",
   name: "Maya Okonkwo",
   bio: "Solana dev • DeFi researcher • Building in public 🌱",
   avatar: "👩🏾‍💻",
   email: "maya@superteam.fun",
   joinDate: "January 2025",
   level: 14,
   xp: 8420,
   rank: 7,
   streak: 22,
   twitter: "@maya_onchain",
   github: "maya-sol",
   website: "maya.dev",
   skills: {
      Rust: 78,
      Anchor: 85,
      Frontend: 60,
      Security: 45,
      DeFi: 70,
      NFTs: 55,
   },
};

export const DUMMY_ACHIEVEMENTS: Achievement[] = [
   { icon: "🔥", label: "22-Day Streak", desc: "Maintained a 22-day learning streak", rarity: "rare" },
   { icon: "⚡", label: "XP Grinder", desc: "Earned over 8,000 XP", rarity: "uncommon" },
   { icon: "🏆", label: "Top 10 Global", desc: "Ranked in the global top 10", rarity: "epic" },
   { icon: "🔐", label: "First PDA", desc: "Deployed a PDA-based program", rarity: "uncommon" },
   { icon: "🌐", label: "dApp Deployer", desc: "Deployed a dApp to devnet", rarity: "common" },
   { icon: "◎", label: "SOL Native", desc: "1 year on Solana ecosystem", rarity: "rare" },
];

export const DUMMY_CREDENTIALS: Credential[] = [
   {
      id: "cert-001",
      course: "Intro to Solana",
      track: "Blockchain",
      level: "Foundational",
      date: "March 15, 2025",
      xp: 500,
      mintAddress: "7nJxR4mL9wQsPdA2...K3wP",
      evolvedTo: "Level 2 — In Progress",
      icon: "◎",
      color: "from-sol-green to-sol-forest",
   },
];

export const DUMMY_COMPLETED_COURSES: CompletedCourse[] = [
   { slug: "intro-to-solana", title: "Intro to Solana", icon: "◎", completedDate: "March 15, 2025", xp: 500 },
];

export const DUMMY_LEADERBOARD: LeaderboardUser[] = [
   { rank: 1, username: "0xTanaka", avatar: "🧑🏻‍💻", name: "Tanaka K.", xp: 24800, level: 28, streak: 45, badge: "👑", country: "🇯🇵", twitter: "@0xTanaka", courses: ["anchor-framework", "defi-protocols", "program-security"] },
   { rank: 2, username: "devnathi", avatar: "👩🏽‍💻", name: "Priya N.", xp: 22100, level: 26, streak: 31, badge: "⚡", country: "🇮🇳", twitter: "@devnathi", courses: ["anchor-framework", "program-security", "nft-marketplace"] },
   { rank: 3, username: "sol_void", avatar: "🧑‍💻", name: "void.sol", xp: 19600, level: 24, streak: 22, badge: "💎", country: "🇧🇷", twitter: "@sol_void", courses: ["defi-protocols", "nft-marketplace"] },
   { rank: 4, username: "anchor_pro", avatar: "👨🏿‍💻", name: "Kwame A.", xp: 17200, level: 22, streak: 18, badge: "🔐", country: "🇬🇭", twitter: "@kwame_sol", courses: ["anchor-framework", "program-security"] },
   { rank: 5, username: "rustacean", avatar: "🧑🏽‍💻", name: "RustGod", xp: 15900, level: 20, streak: 14, badge: "🦀", country: "🇩🇪", twitter: "@rustacean_", courses: ["rust-for-solana", "anchor-framework"] },
   { rank: 6, username: "defi_kim", avatar: "👩🏻‍💻", name: "Ji-Young K.", xp: 14300, level: 19, streak: 9, badge: "📊", country: "🇰🇷", twitter: "@defi_kim", courses: ["defi-protocols", "anchor-framework"] },
   { rank: 7, username: "sol_maya", avatar: "👩🏾‍💻", name: "Maya Okonkwo", xp: 8420, level: 14, streak: 22, badge: "🌱", country: "🇳🇬", twitter: "@maya_onchain", courses: ["anchor-framework", "defi-protocols"] },
   { rank: 8, username: "sol_anon42", avatar: "🧑🏿‍💻", name: "anon42.sol", xp: 7900, level: 13, streak: 7, badge: "🕶️", country: "🇺🇸", twitter: undefined, courses: ["intro-to-solana", "anchor-framework"] },
   { rank: 9, username: "anchor_dev", avatar: "👨🏻‍💻", name: "Marcus T.", xp: 6700, level: 11, streak: 5, badge: "⚓", country: "🇬🇧", twitter: "@marcust_sol", courses: ["anchor-framework"] },
   { rank: 10, username: "seraph_sol", avatar: "👩🏼‍💻", name: "Seraph", xp: 6100, level: 10, streak: 12, badge: "🌊", country: "🇦🇺", twitter: "@seraph_sol", courses: ["intro-to-solana", "nft-marketplace"] },
   { rank: 11, username: "byte_wizard", avatar: "🧙🏽", name: "ByteWizard", xp: 5400, level: 10, streak: 8, badge: "🔮", country: "🇪🇸", twitter: "@byte_wizard", courses: ["rust-for-solana", "defi-protocols"] },
   { rank: 12, username: "mia_devs", avatar: "👩🏻‍🔬", name: "Mia Chen", xp: 4900, level: 9, streak: 4, badge: "🧪", country: "🇹🇼", twitter: "@mia_builds", courses: ["program-security"] },
   { rank: 13, username: "newbie_sol", avatar: "👶", name: "newbie.sol", xp: 4200, level: 8, streak: 3, badge: "🌐", country: "🇲🇽", twitter: undefined, courses: ["intro-to-solana"] },
   { rank: 14, username: "rustlover", avatar: "🧑‍🔬", name: "RustLover", xp: 3800, level: 7, streak: 2, badge: "🦀", country: "🇷🇺", twitter: "@rustlover_dev", courses: ["rust-for-solana"] },
   { rank: 15, username: "nft_hunter", avatar: "🎨", name: "NFT Hunter", xp: 3100, level: 6, streak: 1, badge: "🖼️", country: "🇫🇷", twitter: "@nft_hunter_", courses: ["nft-marketplace"] },
   { rank: 16, username: "lamport_lad", avatar: "🧑🏼‍💻", name: "Lamport Lad", xp: 2700, level: 5, streak: 6, badge: "🔦", country: "🇮🇪", twitter: "@lamport_lad", courses: ["intro-to-solana", "anchor-framework"] },
   { rank: 17, username: "defi_sosa", avatar: "👨🏽‍💻", name: "Carlos S.", xp: 2300, level: 5, streak: 3, badge: "💹", country: "🇨🇴", twitter: "@cdefi_sosa", courses: ["defi-protocols"] },
   { rank: 18, username: "zero_to_sol", avatar: "🚀", name: "zero2sol", xp: 1900, level: 4, streak: 5, badge: "🛸", country: "🇿🇦", twitter: "@zero_to_sol", courses: ["intro-to-solana"] },
   { rank: 19, username: "validator_vik", avatar: "🧑🏾‍💻", name: "Vik Patel", xp: 1400, level: 3, streak: 2, badge: "✅", country: "🇮🇳", twitter: "@validatorvik", courses: ["intro-to-solana"] },
   { rank: 20, username: "gm_everyday", avatar: "☀️", name: "gm every day", xp: 900, level: 2, streak: 11, badge: "🌅", country: "🇵🇭", twitter: "@gm_everyday", courses: ["intro-to-solana"] },
];

export const DUMMY_COURSE_FILTERS: CourseFilter[] = [
   { slug: "all", label: "All Courses" },
   { slug: "intro-to-solana", label: "Intro to Solana" },
   { slug: "anchor-framework", label: "Anchor Framework" },
   { slug: "defi-protocols", label: "DeFi Protocols" },
   { slug: "program-security", label: "Program Security" },
   { slug: "rust-for-solana", label: "Rust for Solana" },
   { slug: "nft-marketplace", label: "NFT Marketplace" },
];

export const DUMMY_LESSON_CHALLENGE: Lesson = {
   id: 17, title: "PDAs and Seeds",
   module: "Accounts & Data Modeling",
   duration: "22 min", xp: 120,
   courseSlug: "anchor-framework",
   courseTitle: "Anchor Framework Deep Dive",
   prev: { id: "l6", title: "#[account] macros deep dive" },
   next: { id: "l8", title: "Rent and storage costs" },
   type: "challenge",
   language: "rust",
   testCases: [
      { id: "tc-1", description: "Vault owner is assigned correctly", validationSnippet: "ctx.accounts.user.key()" },
      { id: "tc-2", description: "Canonical bump is stored", validationSnippet: "ctx.bumps.vault" },
      { id: "tc-3", description: "PDA seeds are configured", validationSnippet: "b\"vault\"" },
   ],
   content: `## Program Derived Addresses (PDAs)

PDAs are a fundamental concept in Solana development. They are **deterministic addresses** that are derived from a program ID and a set of seeds — and crucially, they have **no corresponding private key**.

This makes them perfect for program-controlled accounts that no external wallet can sign for.

### How PDAs are derived

\`\`\`rust
// In your Anchor program
#[account(
    init,
    payer = user,
    space = 8 + UserAccount::INIT_SPACE,
    seeds = [b"user-account", user.key().as_ref()],
    bump,
)]
pub user_account: Account<'info, UserAccount>,
\`\`\`

Anchor automatically handles the \`find_program_address\` call and stores the bump in your account for future use.

### Why PDAs matter

1. **Deterministic** — anyone can recompute the same address from the same seeds
2. **Trustless** — no private key means only the program can sign for it
3. **Composable** — other programs can verify ownership by re-deriving the PDA

### The bump seed

When Solana computes a PDA, it tries seeds with a \`bump\` value (255 down to 0) until it finds a valid off-curve address. Anchor stores this \`bump\` in your account struct:

\`\`\`rust
#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub owner: Pubkey,
    pub score: u64,
    pub bump: u8,       // always save the canonical bump!
}
\`\`\`

### Your challenge

In the code editor on the right, complete the \`create_vault\` instruction so that:

- The vault PDA uses seeds \`["vault", user.key()]\`
- The vault account stores the \`owner\` and \`bump\`
- The constraint correctly validates the bump

> 💡 **Hint**: Look at how the \`#[account]\` constraint derives the PDA and how you access \`ctx.bumps.vault\` to get the canonical bump.
`,
   hints: [
      "Use `seeds = [b\"vault\", user.key().as_ref()]` in the account constraint.",
      "Access the canonical bump via `ctx.bumps.vault` inside the instruction handler.",
      "Always store the bump — it saves compute on future validations.",
   ],
   starterCode: `use anchor_lang::prelude::*;

declare_id!("Fg6PaFpo...");

#[program]
pub mod vault_program {
    use super::*;

    // TODO: Complete this instruction
    pub fn create_vault(ctx: Context<CreateVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
        // Set the vault owner
        vault.owner = // ???
        
        // Store the canonical bump
        vault.bump = // ???
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + VaultAccount::INIT_SPACE,
        // TODO: Add seeds and bump constraints
    )]
    pub vault: Account<'info, VaultAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct VaultAccount {
    pub owner: Pubkey,
    pub bump: u8,
}
`,
   solutionCode: `use anchor_lang::prelude::*;

declare_id!("Fg6PaFpo...");

#[program]
pub mod vault_program {
    use super::*;

    pub fn create_vault(ctx: Context<CreateVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
        vault.owner = ctx.accounts.user.key();
        vault.bump  = ctx.bumps.vault;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + VaultAccount::INIT_SPACE,
        seeds = [b"vault", user.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, VaultAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct VaultAccount {
    pub owner: Pubkey,
    pub bump: u8,
}
`,
};

export const DUMMY_LESSON_DOCUMENT: Lesson = {
   id: 16, title: "#[account] macros deep dive",
   module: "Accounts & Data Modeling",
   duration: "18 min", xp: 100,
   courseSlug: "anchor-framework",
   courseTitle: "Anchor Framework Deep Dive",
   prev: { id: "l5", title: "Account types in Anchor" },
   next: { id: "l7", title: "PDAs and seeds" },
   type: "document",
   content: `## Understanding the #[account] Macro

The \`#[account]\` macro is one of the most powerful tools in Anchor. It abstracts away the tedious boilerplate of checking account ownership, deserializing account data, and validating conditions.

### What it does behind the scenes

When you annotate a struct with \`#[account]\`, Anchor generates code that:
1. Implements the \`AccountSerialize\` and \`AccountDeserialize\` traits.
2. Adds an 8-byte discriminator to the beginning of the account data.
3. Automatically checks that the account is owned by your program when deserializing.

### The Discriminator

Anchor calculates an 8-byte discriminator by taking the first 8 bytes of the SHA256 hash of \`"account:"\` concatenated with the struct name:

\`\`\`rust
hash("account:UserAccount")[..8]
\`\`\`

This ensures that a malicious user cannot pass a token account to an instruction that expects a user profile account, even if they have the exact same size and data layout.

### Constraints

The true power of Anchor's account validation comes from constraints. These are declarative rules you add to your \`#[derive(Accounts)]\` contexts.

\`\`\`rust
#[derive(Accounts)]
pub struct UpdateProfile<'info> {
    #[account(
        mut,
        has_one = owner,
        constraint = profile.is_active == true
    )]
    pub profile: Account<'info, UserProfile>,
    pub owner: Signer<'info>,
}
\`\`\`

This constraint ensures that the \`profile\` account belongs to the \`owner\` signer and that the profile is active.

### Summary
Always use \`#[account]\` for your custom program data and leverage constraints to keep your instruction logic focused on business rules rather than validations.`
};

export const DUMMY_LESSON_VIDEO: Lesson = {
   id: 15, title: "Account types in Anchor",
   module: "Accounts & Data Modeling",
   duration: "10 min", xp: 50,
   courseSlug: "anchor-framework",
   courseTitle: "Anchor Framework Deep Dive",
   prev: { id: "l4", title: "Deploying to Devnet" },
   next: { id: "l6", title: "#[account] macros deep dive" },
   type: "video",
   videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
   content: `## Video Summary

In this video, we cover the fundamental account types you will interact with when building Solana programs using the Anchor framework.

### Key Takeaways
1. **Account**: The bread and butter of Anchor. Used for your program's custom data accounts. It handles deserialization and ownership checks automatically.
2. **Signer**: Used when you only need to verify that an account signed the transaction. It doesn't deserialize data.
3. **UncheckedAccount**: Used as a last resort when you need to interact with an account but skip all of Anchor's safety checks. **Use with caution!**
4. **SystemAccount**: Used specifically for accounts owned by the System Program, typically when you need to transfer SOL or initialize a new account.`
};

export const DUMMY_MODULE_LESSONS = [
   { id: "l5", title: "Account types in Anchor", done: true },
   { id: "l6", title: "#[account] macros deep dive", done: true },
   { id: "l7", title: "PDAs and seeds", done: false, active: true },
   { id: "l8", title: "Rent and storage costs", done: false },
   { id: "l9", title: "Account validation constraints", done: false },
];

