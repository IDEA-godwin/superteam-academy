# Customization Guide

How to personalize the theme, add languages, and extend the gamification system.

---

## Table of Contents

1. [Theme Customization](#theme-customization)
2. [Adding a New Language](#adding-a-new-language)
3. [Extending the Gamification System](#extending-the-gamification-system)
4. [Adding a New Course Difficulty Tier](#adding-a-new-course-difficulty-tier)
5. [Customizing the Landing Page](#customizing-the-landing-page)

---

## Theme Customization

### Design Token System

All visual tokens are defined as CSS custom properties in `src/app/[locale]/globals.css`. The entire color system uses these tokens — you should never hard-code hex values in components.

```css
/* globals.css — light mode defaults */
:root {
  --color-sol-bg:      #f5f0dc;   /* page background */
  --color-sol-surface: #ede8d1;   /* card background */
  --color-sol-card:    #e8e2ca;   /* inner card */
  --color-sol-border:  #d4ceb5;   /* dividers and borders */
  --color-sol-text:    #1a1a15;   /* primary text */
  --color-sol-subtle:  #4a4a3a;   /* secondary text */
  --color-sol-muted:   #7a7a68;   /* placeholder / meta text */
  --color-sol-green:   #14b87a;   /* primary brand / success */
  --color-sol-green-dk:#0d8a5a;   /* hover state for green */
  --color-sol-yellow:  #f5c842;   /* XP / accent */
  --color-sol-forest:  #1a5c3a;   /* advanced tier / dark accent */
  --color-sol-glow:    rgba(20, 184, 122, 0.06); /* subtle glow */
}

.dark {
  --color-sol-bg:      #0f1114;
  /* ... dark mode overrides ... */
}
```

### Changing the Brand Color

To change the primary green to a different color, update `--color-sol-green` and `--color-sol-green-dk` in both `:root` and `.dark` blocks:

```css
:root {
  --color-sol-green:    #7c3aed;   /* purple brand */
  --color-sol-green-dk: #5b21b6;
}
```

All buttons, badges, progress bars, and interactive elements automatically inherit the change.

### Tailwind Extension

The design tokens are mapped to Tailwind utility classes in `tailwind.config.ts`:

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'sol-bg':      'var(--color-sol-bg)',
      'sol-green':   'var(--color-sol-green)',
      'sol-yellow':  'var(--color-sol-yellow)',
      // … all others
    }
  }
}
```

Use these in components: `bg-sol-green`, `text-sol-yellow`, `border-sol-border`, etc.

### Dark Mode

Dark mode is handled by `next-themes`. The `ThemeToggle` component in the header switches between light / dark / system. To default to dark mode, update the `defaultTheme` in `src/app/[locale]/provider.tsx`:

```tsx
<ThemeProvider defaultTheme="dark" attribute="class">
```

### Typography

The app uses the system font stack by default. To switch to a Google Font (e.g. Inter):

1. Add the font in `src/app/[locale]/layout.tsx`:
   ```tsx
   import { Inter } from 'next/font/google';
   const inter = Inter({ subsets: ['latin'] });
   ```
2. Apply it to the `<html>` tag:
   ```tsx
   <html className={inter.className}>
   ```

---

## Adding a New Language

The app uses **next-intl** with locale-prefixed URLs (`/en/`, `/es/`, `/pt/`).

### Step 1 — Create the message file

Copy `messages/en.json` to a new file named after the [BCP 47 locale tag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language):

```bash
cp messages/en.json messages/fr.json
```

Translate every value in `messages/fr.json`. The file structure must stay identical — only values change, never keys.

### Step 2 — Register the locale in next-intl config

Open `src/i18n/routing.ts` (or wherever `defineRouting` / `locales` is configured):

```typescript
export const routing = defineRouting({
  locales: ['en', 'es', 'pt', 'fr'],   // ← add 'fr'
  defaultLocale: 'en',
});
```

### Step 3 — Add to the locale switcher

Open `src/components/Header.tsx` and add the new locale to the `locales` array:

```typescript
const locales = [
  { locale: 'en', name: 'English' },
  { locale: 'es', name: 'Spanish' },
  { locale: 'pt', name: 'Português' },
  { locale: 'fr', name: 'Français' },   // ← add this
];
```

### Step 4 — Test

```bash
npm run dev
# Navigate to http://localhost:3000/fr
```

Check that all pages render without `[missing: "fr.Hero.title"]` errors. If keys appear missing, ensure the new locale file has all the same keys as `en.json`.

### Key Naming Conventions

| Namespace | Usage |
|---|---|
| `Hero` | Landing page hero section |
| `Navigation` | Shared nav links |
| `Dashboard` | Dashboard page labels |
| `Courses` | Course catalogue page |
| `CourseDetail` | Course detail page |
| `Lesson` | Lesson viewer |
| `Leaderboard` | Leaderboard page |
| `Profile` | Profile page |
| `Settings` | Settings page |
| `Common` | Reusable labels (e.g. "Save", "Cancel", "Loading") |

Always place new translatable strings in the appropriate namespace and add the key to **all three** (or more) locale files simultaneously to avoid missing-key warnings at runtime.

---

## Extending the Gamification System

### XP and Leveling

XP per lesson is set in the Sanity course document (`xpPerLesson`). On-chain, XP is a Token-2022 balance.

Leveling thresholds are defined in `src/services/leveling.service.ts`:

```typescript
const LEVELS = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 500 },
  { level: 3, xpRequired: 1500 },
  { level: 4, xpRequired: 3500 },
  // …
];
```

To add more levels or change thresholds, edit this array. The `useLeveling()` hook reads from this service and exposes `{ xp, level, xpToNext }` to any component.

### Adding a New Achievement Type

Achievements are stored in the database and optionally on-chain as receipts.

**1. Define the achievement** in the admin panel (or directly via the on-chain `create_achievement_type` instruction):

```typescript
// The on-chain achievement has: name (string), description, xpReward
await program.methods.createAchievementType("First PDA", "Deploy your first PDA", new BN(50))
  .accounts({ /* ... */ })
  .rpc();
```

**2. Add display metadata** in `src/lib/dummy-data.ts` (or your achievements service):

```typescript
{ id: "first-pda", icon: "🔐", label: "First PDA", sub: "Anchor milestone", rarity: "uncommon" }
```

**3. Issue the achievement** via `issue_receipt` (on-chain) after detecting the triggering condition in an API route.

### Adding a New Credential Type

Each course issues one credential. To create custom credential artwork or metadata:

1. Upload your credential image to Arweave or IPFS.
2. Create a metadata JSON following [Metaplex standards](https://docs.metaplex.com/programs/token-metadata/token-standard).
3. Pass the metadata URI to the `issueCredential` instruction in `src/app/api/course/finalize/route.ts`.

```typescript
const metadataUri = "https://arweave.net/your-metadata-hash";
await program.methods
  .issueCredential(credentialName, metadataUri, coursesCompleted, new BN(totalXp))
  .accounts({ /* ... */ })
  .rpc();
```

### Adding a New Leaderboard Period

The leaderboard supports `weekly`, `monthly`, and `all-time` periods. To add a new one (e.g. `daily`):

1. Add `"daily"` to the `PERIODS` array in `src/app/[locale]/leaderboard/page.tsx`.
2. Update `useLeaderboard(period, course)` in `src/hooks/queries/useLeaderboard.ts` to handle the new period in its query.
3. Add the translation key `"daily": "Daily"` to all locale files under the `Leaderboard` namespace.

### Streak Tracking

Streaks are tracked in the database (`dbUser.streak`) and updated server-side when a user completes a lesson. To modify streak logic, edit `src/services/user.service.ts` in the section that handles streak increments.

---

## Adding a New Course Difficulty Tier

The app currently uses `BEGINNER`, `INTERMEDIATE`, and `ADVANCED`.

### 1. Update the Sanity schema

In `src/sanity/schemaTypes/course.ts`, add the new tier to the `difficulty` field options:

```typescript
{
  name: 'difficulty',
  type: 'string',
  options: {
    list: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
  }
}
```

### 2. Add the CSS class mapping

In `src/app/[locale]/courses/page.tsx` and `src/components/LandingPageMain.tsx`, add to the `DIFF_CLS` object:

```typescript
const DIFF_CLS = {
  BEGINNER:     "bg-sol-green/10  text-sol-green  border-sol-green/35",
  INTERMEDIATE: "bg-sol-yellow/20 text-sol-yellow  border-sol-yellow/50",
  ADVANCED:     "bg-sol-forest/15 text-sol-forest border-sol-forest/40",
  EXPERT:       "bg-purple-500/15 text-purple-400 border-purple-500/40",  // ← new
};
```

### 3. Add the translation keys

In all locale files, under the `Courses` namespace:

```json
"diffExpert": "Expert"
```

### 4. Update the filter

Add `"expert"` to the `DIFFICULTIES` array in `courses/page.tsx`:

```typescript
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced", "expert"];
```

---

## Customizing the Landing Page

All landing page sections live in `src/components/LandingPageMain.tsx`.

### Changing Stats Numbers

Update the inline stats array inside the component body:

```tsx
{ value: '25,000+', labelKey: 'learners', icon: '👥' },
```

### Adding / Removing Feature Cards

Add entries to the features array inside the `Features` section. Each entry needs:
- `icon` — a Lucide React component
- `color` — Tailwind classes for the icon container
- `titleKey` and `descKey` — keys that exist in `messages/en.json` under `Features`

### Changing Testimonials

Edit the `TESTIMONIALS` array near the top of `LandingPageMain.tsx`:

```typescript
const TESTIMONIALS = [
  {
    name: 'Alice Dev',
    handle: '@alicedev',
    avatar: '👩🏻‍💻',
    text: "…",
    xp: '5,000 XP',
    badge: 'Anchor Graduate',
  },
  // …
];
```

### Changing the Hero Headline

The hero headline comes from the `Hero.title` key in your locale files. To change it for all languages, update `messages/en.json` (and `es.json`, `pt.json`):

```json
"Hero": {
  "title": "Your New Headline Here"
}
```
