# Architecture Guide

A deep-dive into how Superteam Academy is structured — from the Next.js app layer through to Solana on-chain state.

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Component Structure](#component-structure)
3. [Data Flow](#data-flow)
4. [Service Interfaces](#service-interfaces)
5. [On-Chain Integration](#on-chain-integration)
6. [API Routes](#api-routes)
7. [State Management](#state-management)
8. [Authentication & Authorization](#authentication--authorization)

---

## System Architecture Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                        Browser (React 19)                         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────────┐  ┌─────────────────────┐ │
│  │  Next.js App │  │  TanStack Query  │  │  Framer Motion /    │ │
│  │  Router      │  │  (client cache)  │  │  next-intl / shadcn │ │
│  └──────┬───────┘  └────────┬─────────┘  └─────────────────────┘ │
│         │                   │                                     │
│  ┌──────▼───────────────────▼──────────────────────────────────┐ │
│  │              React Hooks Layer                              │ │
│  │  useCourseData · useCourseEnrollment · useLeaderboard …    │ │
│  └──────────────────────────┬────────────────────────────────┘ │
└─────────────────────────────┼───────────────────────────────────┘
                              │ fetch / RPC
          ┌───────────────────┼───────────────────┐
          │                   │                   │
   ┌──────▼──────┐   ┌────────▼────────┐  ┌──────▼──────────┐
   │  Sanity CMS │   │  Solana RPC     │  │  Next.js API    │
   │  (content)  │   │  (on-chain data)│  │  Routes         │
   └─────────────┘   └─────────────────┘  └────────┬────────┘
                                                    │ signs txs
                                             ┌──────▼──────────┐
                                             │  Backend Signer │
                                             │  Keypair        │
                                             └─────────────────┘
```

### Two Sources of Truth

| Source | What it stores |
|---|---|
| **Sanity CMS** | Course metadata, module/lesson structure, content (markdown, videos, code challenges) |
| **Solana (on-chain)** | Enrollment state, lesson completion bitmap (`lessonFlags`), XP token balances, NFT credentials |

---

## Component Structure

```
src/components/
├── Header.tsx              # Top nav bar with locale switcher
├── Footer.tsx              # Site footer with newsletter + links
├── LandingPageMain.tsx     # Full landing page (hero → stats → path → features → testimonials → CTA)
├── DashboardLayout.tsx     # Authenticated sidebar + content shell
├── TopBar.tsx              # Dashboard top bar (search, user menu)
├── WalletConnect.tsx       # Dynamic Labs wallet connect button
├── LoadingSplash.tsx       # Full-screen loading state
├── ThemeToggle.tsx         # Light / dark mode toggle
└── ui/                     # shadcn/ui primitives (Button, Card, DropdownMenu…)
```

### Page Components

Each route under `src/app/[locale]/` is a self-contained page:

| Route | File | Description |
|---|---|---|
| `/` | `page.tsx` | Public landing page |
| `/dashboard` | `dashboard/page.tsx` | Enrolled courses, XP/level, activity |
| `/courses` | `courses/page.tsx` | Course catalogue with filters |
| `/courses/[slug]` | `courses/[slug]/page.tsx` | Course detail + enroll |
| `/courses/[slug]/lessons/[id]` | `…/lessons/[id]/page.tsx` | Lesson viewer |
| `/certificates/[id]` | `certificates/[id]/page.tsx` | On-chain credential display & verification |
| `/leaderboard` | `leaderboard/page.tsx` | Global XP leaderboard |
| `/profile` | `profile/page.tsx` | User profile + credentials |
| `/settings` | `settings/page.tsx` | Account & appearance settings |
| `/admin` | `admin/page.tsx` | Redirects to `/admin/courses` |
| `/admin/courses` | `admin/courses/page.tsx` | CMS → on-chain course sync panel |
| `/admin/settings` | `admin/settings/page.tsx` | Platform init, config, minter & achievement management |

### Lesson View Components

```
src/app/[locale]/courses/[slug]/lessons/_components/views/
├── DocumentView.tsx    # Markdown / PortableText reading lesson
├── VideoView.tsx       # Video lesson with completion trigger
└── ChallengeView.tsx   # In-browser code challenge (CodeMirror)
```

All three receive an async `setCompleted: () => Promise<void>` prop that calls the `/api/course/complete-lesson` API route when the learner finishes.

---

## Data Flow

### Enrollment Flow

```
User clicks "Enroll"
      │
      ▼
useCourseEnrollment.enroll()
      │  (learner wallet signs)
      ▼
courseService.enrollCourse()     ← checks prerequisite PDAs
      │
      ▼
program.methods.enroll()         ← Anchor instruction on-chain
      │
      ▼
Enrollment PDA created           ← lessonFlags = [0,0,0,0], enrolled = true
      │
      ▼
TanStack Query invalidates       ← UI refreshes enrollment state
```

### Lesson Completion Flow

```
Learner finishes lesson content
      │
      ▼
setCompleted() called in View component
      │
      ▼
POST /api/course/complete-lesson
      │  { learner: PublicKey, courseId, lessonIndex }
      │
      ▼
Backend: create XP ATA if missing  ← Token-2022 ATA for learner
      │
      ▼
program.methods.completeLesson(lessonIndex)
      │  (backend signer signs)
      ▼
On-chain: lessonFlags bitmap updated, XP minted to learner ATA
      │
      ▼
Response: { lessonsDone: Set<number>, completedCount }
      │
      ▼
useCourseEnrollment query invalidated → UI shows ✓ on completed lesson
```

### Course Finalization Flow

```
All lessons complete → "Finalize Course" button shown
      │
      ▼
POST /api/course/finalize
      │
      ├─► program.methods.finalizeCourse()    ← bonus XP awarded
      │
      └─► program.methods.issueCredential()   ← Metaplex Core NFT minted
              (or upgradeCredential if NFT already exists)
```

---

## Service Interfaces

### `courseService` (`src/services/course.service.ts`)

```typescript
courseService.getAllCourses(program)
  → Course[]                       // all on-chain course accounts

courseService.getCourseOnchain(program, coursePubkey)
  → Course | null

courseService.getEnrollment(program, wallet, coursePubkey)
  → Enrollment | null

courseService.getAllWalletEnrollments(program, wallet)
  → Enrollment[]

courseService.enrollCourse(program, wallet, courseId, prereqEnrollmentPda?)
  → TransactionSignature

courseService.closeEnrollment(program, wallet, courseId)
  → TransactionSignature

// Bitmap helpers (exported)
isLessonComplete(lessonFlags: BN[], lessonIndex: number): boolean
countCompletedLessons(lessonFlags: BN[]): number
getCompletedLessonIndices(lessonFlags: BN[], lessonCount: number): number[]
```

### `userService` (`src/services/user.service.ts`)

```typescript
userService.getProfile(walletAddress)   → UserProfile
userService.updateProfile(data)         → UserProfile
userService.getGamification(walletAddress) → { achievements, credentials, completedCourses }
```

### `cmsService` / Sanity GROQ Hooks

| Hook | What it fetches |
|---|---|
| `useCourseList()` | All courses from Sanity (title, slug, difficulty, XP, lessonCount) |
| `useCourseData(slug)` | Full course with modules and lessons |
| `useCourseEnrollment(courseId, lessonCount)` | On-chain bitmap decoded into `Set<lessonIndex>` |

---

## On-Chain Integration

### Program

- **Program ID**: defined in `src/lib/constants.ts` as `PROGRAM_ID`
- **IDL**: `src/types/idl/onchain_academy.json`
- **Anchor Type**: `src/types/onchain_academy.ts`

### Program Derived Addresses (PDAs)

All PDA derivation lives in `src/lib/derive-pda.ts`:

| Account | Seeds |
|---|---|
| `config` | `["config"]` |
| `course` | `["course", courseId (u64 LE)]` |
| `enrollment` | `["enrollment", learner pubkey, course pubkey]` |
| `minterRole` | `["minter_role", signer pubkey]` |
| `achievementType` | `["achievement_type", name bytes]` |
| `receipt` | `["receipt", learner pubkey, achievement pubkey]` |

### Lesson Progress Bitmap

Each `Enrollment` account stores `lessonFlags: [u64; 4]` — a 256-bit bitmap where bit `i` = lesson `i` is complete.

```typescript
// Check if lesson 7 is done
isLessonComplete(enrollment.lessonFlags, 7)

// Count all completed lessons
countCompletedLessons(enrollment.lessonFlags)
```

### Signer Roles

| Action | Signer |
|---|---|
| `enroll` | Learner wallet |
| `completeLesson` | **Backend keypair** (prevents self-award) |
| `finalizeCourse` | **Backend keypair** |
| `issueCredential` / `upgradeCredential` | **Backend keypair** |
| `closeEnrollment` | Learner wallet |

### XP Token (Token-2022)

- Mint address stored in on-chain config
- ATAs created by the backend before first `completeLesson` if absent
- `TOKEN_2022_PROGRAM_ID` constant used throughout (`src/lib/constants.ts`)

### Credentials (Metaplex Core NFTs)

- `MPL_CORE_PROGRAM_ID` from `src/lib/constants.ts`
- One NFT per learner per course
- `issueCredential` mints; `upgradeCredential` updates metadata (e.g., if course XP increases)
- Query via [Helius DAS API](https://docs.helius.dev/compression-and-das-api) for display

---

## API Routes

### `POST /api/course/complete-lesson`

**Request body**
```json
{
  "learner": "PublicKey (base58)",
  "courseId": 1,
  "lessonIndex": 5
}
```

**What it does**
1. Derives PDAs for config, course, enrollment
2. Fetches XP mint from on-chain config
3. Creates learner's Token-2022 ATA if it doesn't exist
4. Calls `program.methods.completeLesson(lessonIndex)` — **signed by backend keypair**
5. Returns `{ lessonsDone: number[], completedCount: number }`

### `POST /api/course/finalize`

**Request body**
```json
{
  "learner": "PublicKey (base58)",
  "courseId": 1
}
```

**What it does**
1. Calls `finalizeCourse` (awards bonus XP)
2. Checks if a credential NFT already exists for this learner+course
3. Calls `issueCredential` (new) or `upgradeCredential` (existing) — **signed by backend keypair**
4. Returns `{ finalizeTx, credentialTx }`

---

## Certificates (`/certificates/[id]`)

The certificate page is a **public-facing, shareable credential page** reachable at `/certificates/<nft-address>`.

```
/certificates/[id]/page.tsx
```

### What the `[id]` is

The `[id]` URL parameter is the **NFT mint address** (base58) of the Metaplex Core credential issued by `/api/course/finalize`. This makes every certificate URL unique, permanent, and independently verifiable.

### Page Contents

| Element | Description |
|---|---|
| Header | "Certificate of Completion" |
| Student name | Pulled from the credential NFT metadata / wallet |
| Course title | From the NFT metadata URI |
| Date | Issuance date from on-chain metadata |
| Credential ID | The raw `[id]` param displayed in monospace |
| **Verify On-Chain** button | Links to Solana Explorer or calls Helius DAS for proof |
| **Share on Twitter** button | Pre-fills a tweet with the certificate URL |

### Roadmap

Currently the page shows a static scaffold. Full implementation will:
1. Fetch the NFT metadata from Helius DAS using the `[id]` mint address
2. Render the actual student name, course, and issuance timestamp from on-chain data
3. Wire the **Verify On-Chain** button to the Solana Explorer or a custom verification call

---

## Admin Flow

The admin panel is gated to authorized wallets (matching the `authority` on the on-chain Config PDA) and lives at `/admin/*`.

### Admin Routes

| Route | File | Purpose |
|---|---|---|
| `/admin` | `admin/page.tsx` | Redirects to `/admin/courses` |
| `/admin/courses` | `admin/courses/page.tsx` | Sync Sanity CMS courses onto Solana |
| `/admin/settings` | `admin/settings/page.tsx` | Platform init, config rotation, minter delegates, achievements |

### Course Sync Flow (CMS → On-Chain)

This is the most important admin action — it registers a course from Sanity onto Solana, making it enrollable by learners.

```
Admin opens /admin/courses
      │
      ▼
Page fetches all courses from Sanity CMS (GROQ query)
      │  and all on-chain Course accounts
      ▼
For each Sanity course: compare courseId with on-chain list
      │  → shows "Register On-Chain" button if not yet registered
      │  → shows "Already Registered" (disabled) if matched
      ▼
Admin clicks "Register On-Chain"
      │
      ├─► Build courseContent JSON (title, slug, difficulty, XP, modules…)
      │
      ├─► Upload courseContent to Arweave via Irys (WebUploader)
      │      Returns: receipt.id (Arweave transaction ID)
      │
      ├─► txIdToBytes(receipt.id)  → 32-byte Uint8Array (contentTxId)
      │
      └─► adminService.createCourse(program, wallet, course, contentTxId)
               │  (admin wallet signs)
               ▼
           program.methods.createCourse({ ...createCourseDto })
               │
               ▼
           Course PDA created on-chain
           Learners can now enroll
```

### `adminService` Interface (`src/services/admin.service.ts`)

```typescript
// Register a new course on-chain (maps Sanity ICourse → CreateCourse instruction)
adminService.createCourse(program, wallet, course: ICourse, contentTxId: Uint8Array)
  → TransactionSignature

// Update existing course metadata on-chain
adminService.updateCourse(program, wallet, courseId, updateCourseParam: IUpdateCourse)
  → TransactionSignature

// Rotate backend signer / deactivate old minter
adminService.updateConfig(program, wallet, newBackendSigner, oldMinter?)
  → void

// Authorize an external wallet to mint XP (e.g. for IRL events)
adminService.registerMinter(program, wallet, minterPubkey)
  → TransactionSignature

// Remove minter authorization
adminService.revokeMinter(program, wallet, minterPubkey)
  → TransactionSignature
```

### Difficulty Mapping

Sanity stores difficulty as a string (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`). `adminService.createCourse` maps these to the on-chain enum values before calling the instruction:

| Sanity string | On-chain value |
|---|---|
| `BEGINNER` | `1` |
| `INTERMEDIATE` | `2` |
| `ADVANCED` | `3` |

### Arweave / Irys Upload

Course content (title, description, modules, lesson structure) is stored on **Arweave** for permanent decentralized storage. The Irys SDK (`@irys/web-upload` + `@irys/web-upload-solana`) handles the upload directly from the browser using the admin's connected wallet to pay fees.

The returned Arweave transaction ID is converted to a 32-byte array via `txIdToBytes()` (`src/lib/arweave.ts`) and stored as `contentTxId` in the on-chain Course account — making the full course metadata permanently retrievable from `https://arweave.net/<txId>`.

### Admin Settings Panel (`/admin/settings`)

| Panel | Action | On-chain instruction |
|---|---|---|
| **Platform Initialization** | One-time setup of Config PDA + XP Mint | `initialize` |
| **Configuration & Security** | Rotate backend signer public key | `updateConfig` |
| **Minter Delegates** | Authorize / revoke external XP minters | `registerMinter` / `revokeMinter` |
| **Achievements** | Create or deactivate achievement types (for IRL events, hackathons) | `createAchievementType` / `deactivateAchievementType` |

### Signer Roles in Admin

| Action | Who signs |
|---|---|
| `createCourse` | **Admin wallet** (must be `authority` on Config PDA) |
| `updateCourse` | **Admin wallet** |
| `updateConfig` | **Admin wallet** |
| `registerMinter` | **Admin wallet** |
| `revokeMinter` | **Admin wallet** |
| Arweave upload (Irys) | **Admin wallet** (pays Arweave fees) |

Superteam Academy uses **TanStack Query** for all server/on-chain state:

- **No Redux** — query invalidation replaces global state mutations
- Each mutation (enroll, completeLesson) calls `queryClient.invalidateQueries` on success
- `staleTime: 0` on enrollment queries ensures fresh data after mutations
- `staleTime: 10 minutes` on Sanity content (rarely changes)

### Query Key Conventions

```typescript
["course-list"]                        // all courses from Sanity
["course-data", slug]                  // single course from Sanity
["enrollment", walletAddress, courseId]// on-chain enrollment state
["leaderboard", period, courseFilter]  // leaderboard data
["user-profile", walletAddress]        // user profile
```

---

## Authentication & Authorization

The app supports two parallel identity mechanisms:

| Mechanism | Use case |
|---|---|
| **Solana wallet** (Dynamic Labs) | Primary identity, on-chain XP + credentials |
| **Social login** (NextAuth / GitHub, Google) | Profile data, email notifications |

Both can coexist — a user can link their wallet to a social account. The `publicKey` from `useWallet()` is the authoritative identity for all on-chain actions.
