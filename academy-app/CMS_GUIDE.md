# CMS Guide — Creating & Managing Courses

All course content is managed in **Sanity CMS**. This guide walks through schema structure, content creation, the seeding script, and the publishing workflow.

---

## Table of Contents

1. [Accessing Sanity Studio](#accessing-sanity-studio)
2. [Content Schema](#content-schema)
3. [Creating a Course](#creating-a-course)
4. [Adding Modules and Lessons](#adding-modules-and-lessons)
5. [Lesson Types](#lesson-types)
6. [Code Challenges](#code-challenges)
7. [Seeding with the Script](#seeding-with-the-script)
8. [Publishing Workflow](#publishing-workflow)
9. [Syncing with On-Chain State](#syncing-with-on-chain-state)

---

## Accessing Sanity Studio

The Sanity Studio is embedded in the Next.js app at `/studio`:

```
http://localhost:3000/studio     # local dev
https://your-domain.com/studio  # production
```

Log in with your Sanity account credentials. Only team members with write access (set in your Sanity project's **Members** panel) can publish content.

---

## Content Schema

### Entity Hierarchy

```
Course
  └── Module (ordered list)
        └── Lesson (ordered list)
              ├── Document lesson    (PortableText / Markdown)
              ├── Video lesson       (embed URL)
              └── Challenge lesson   (starter code + test cases + solution)
```

### Course Schema (`src/sanity/schemaTypes/course.ts`)

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Display name |
| `slug` | `slug` | URL-safe identifier (e.g. `anchor-framework`) |
| `description` | `text` | Short description shown on course cards |
| `difficulty` | `BEGINNER \| INTERMEDIATE \| ADVANCED` | Difficulty tier |
| `courseId` | `number` | Must match the on-chain `courseId` in the Solana program |
| `xpPerLesson` | `number` | XP awarded per lesson completion |
| `thumbnail` | `string` | Emoji or image URL for the course card |
| `modules` | `Module[]` | Ordered array of modules |

### Module Schema

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Module display name |
| `description` | `text` | Short intro paragraph |
| `lessons` | `Lesson[]` | Ordered array of lessons |

### Lesson Schema (`src/sanity/schemaTypes/lesson.ts`)

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Lesson display name |
| `lessonId` | `string` | Unique ID within the course (used in URL: `/lessons/[id]`) |
| `type` | `document \| video \| challenge` | Determines which view component renders |
| `content` | `PortableText \| string` | Rich text (document lessons) |
| `videoUrl` | `string` | Embed URL (video lessons) |
| `starterCode` | `string` | Initial editor content (challenge lessons) |
| `solution` | `string` | Reference solution shown after submit |
| `testCases` | `TestCase[]` | Array of `{ input, expectedOutput, description }` |
| `hints` | `string[]` | Progressive hints shown on request |

---

## Creating a Course

### Via Sanity Studio

1. Open `/studio` and click **Course** in the left sidebar.
2. Click **+ New Course**.
3. Fill in all required fields:
   - `title`, `slug` (auto-generated from title — edit if needed)
   - `description`, `difficulty`
   - `courseId` — **must match the on-chain program's course ID** (coordinate with the admin who runs `create_course`)
   - `xpPerLesson`
4. Click **Publish** when ready (see [Publishing Workflow](#publishing-workflow)).

### Important: `courseId` Must Be On-Chain First

The on-chain program must have a matching `Course` account before learners can enroll. Run the admin instruction `create_course` via the admin panel or CLI before publishing the Sanity document.

---

## Adding Modules and Lessons

1. Open an existing course in Studio.
2. In the **Modules** field, click **Add item**.
3. Give the module a title and optionally a description.
4. Inside the module, click **Add item** in the **Lessons** array.
5. For each lesson:
   - Set a unique `lessonId` (e.g. `intro-to-pdas`, `challenge-1`) — this becomes the URL segment
   - Choose a `type` (document / video / challenge)
   - Fill in the type-specific content fields (see [Lesson Types](#lesson-types))

> **Lesson order matters** — the index of a lesson within the flattened global lessons array maps directly to the bit position in the on-chain `lessonFlags` bitmap. Do not reorder lessons in published courses that have active enrollments.

---

## Lesson Types

### Document Lesson

Rendered by `DocumentView.tsx` using `@portabletext/react`.

- `content`: Use the rich text editor in Studio. Supports:
  - Headings, bold, italic, links
  - Inline code and fenced code blocks (via `@sanity/code-input`) with language highlighting
  - Markdown blocks (via `sanity-plugin-markdown`)

The lesson is marked complete once the learner scrolls to the bottom and clicks **Mark as Complete**.

### Video Lesson

Rendered by `VideoView.tsx`.

- `videoUrl`: Paste a YouTube, Loom, or direct `.mp4` URL.

Completion triggers automatically after the video ends (or after a simulated delay in dev mode).

### Challenge Lesson

Rendered by `ChallengeView.tsx` with a CodeMirror 6 in-browser editor.

- `starterCode`: The code the learner sees initially.
- `solution`: Shown after the learner submits (and optionally after N failed attempts).
- `testCases`: Each entry has `{ input, expectedOutput, description }` — used for display hints; actual verification is done server-side.
- `hints`: Array of strings revealed one-by-one when the learner clicks **Show Hint**.

Completion triggers when the learner clicks **Submit Solution**.

---

## Code Challenges

### Syntax Highlighting Languages

The code input in Studio supports: `rust`, `javascript`, `json`, `typescript`, `bash`.

Set the language in the code block's language field to get correct highlighting in Studio and in the learner's editor.

### Example `starterCode` (Rust)

```rust
use anchor_lang::prelude::*;

#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // TODO: implement initialization
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```

---

## Seeding with the Script

For first-time setup or resetting content, use the bundled seeder:

```bash
npm run seed:sanity
```

This runs `scripts/seed-sanity.mjs`, which:
1. Reads the `SANITY_TOKEN` and `NEXT_PUBLIC_SANITY_*` env vars
2. Creates 6 default courses with modules, lessons (document + video + challenge), and all metadata
3. Publishes all documents automatically

> Re-running the seeder on a non-empty dataset will **overwrite** existing documents by `_id`. Safe to re-run if you haven't added custom content.

### Customising the Seed Data

Edit `scripts/seed-sanity.mjs` — each course is defined as a plain JavaScript object matching the schema. Add or modify courses, modules, and lessons in this file before running.

---

## Publishing Workflow

Sanity uses a **draft / published** model:

1. All edits start as a **draft** — not visible to the live site until published.
2. Click the **Publish** button (top right in Studio) to make a document live.
3. The Next.js app reads only **published** documents via the `useCDN: true` Sanity client in `src/sanity/client.ts`.

### Recommended Workflow for New Courses

```
1. Create course on-chain (admin panel → create_course)
2. Draft course in Sanity Studio
3. Add all modules and lessons
4. Internal review — share Studio preview link with reviewer
5. Publish course in Studio
6. Verify it appears in /courses page
```

---

## Syncing with On-Chain State

The `courseId` field in Sanity must match the on-chain `Course` account's ID. The `useCourseList()` hook fetches both:

```typescript
const { data: onchainCourses } = useCourses();      // on-chain list
const { data: sanityCourses }  = useCourseList();   // Sanity list

// Only courses present in BOTH are shown in the catalogue
const visible = sanityCourses.filter(s =>
  onchainCourses.some(o => o.account.courseId === s.courseId)
);
```

This means:
- A Sanity course with no matching on-chain account **will not appear** in the catalogue.
- An on-chain course with no Sanity document **will not appear** in the catalogue.
- Both must exist and have matching `courseId` values.
