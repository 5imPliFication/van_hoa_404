# AGENTS.md

Single-page React 19 + Vite + Zustand app: **VĂN HÓA 404**, a Vietnamese-language
educational game (Tư tưởng Hồ Chí Minh về văn hóa). No backend, no router, no tests.

## Git state (surprising)

Only `README.md` is tracked. The entire app (`src/`, `package.json`, configs, `public/`)
is **untracked** working-tree content. `git status` will look like a huge first commit.
`dist/` exists on disk but is gitignored. Don't "clean up" the untracked tree.

## Commands

```bash
npm run dev       # vite dev server
npm run build     # tsc -b && vite build  — the ONLY thing that typechecks
npm run preview   # serve dist/
npx tsc -b        # typecheck only (incremental, silent on success)
npx oxlint        # lint only
```

Verify changes with `npx oxlint && npx tsc -b` — both exit 0 and print **nothing**
when clean, so check exit codes, not output. No test script and no test runner
exists; don't add one unless asked.

`oxlint` is **not** type-aware here (`oxlint-tsgolint` is not installed), so `tsc -b`
is the real gate — lint passing means nothing on its own.

## Architecture

- `src/main.tsx` → `src/App.tsx`. `App.tsx` is a hand-rolled switch on
  `useGameStore().phase` — there is no router library. Adding a screen requires:
  a member in the `Phase` union (`src/types/game.ts`) **and** a case in
  `renderScreen()` (`src/App.tsx`), or it is unreachable.
- `src/state/gameStore.ts` is the single Zustand store. It owns nearly all game logic
  (scoring, flags, delayed consequences, AP budget) and most phase transitions.
  Screens are presentational. Put new game logic in the store, not components.
- `src/engine/` holds pure, side-effect-free logic (`scoring`, `consequenceEngine`,
  `endingEngine`) — the natural place for logic worth reasoning about or testing.
- Transition ownership is mixed: `nextScenario()` auto-advances `feed`→`core`, and
  `confirmStrategies()` sets `strategy`→`timeline`, but `core`→`strategy` and
  `timeline`→`result` are bare `setPhase()` calls inside screens. Check the store
  before assuming a screen owns its exit.
- `sources` is reachable from the Navbar at any time, and its back button always
  jumps to `landing` — it discards in-progress game state. Intentional, don't "fix".

## Content is data-driven

`src/data/scenarios.json` (6 scenarios), `strategies.json` (8 cards), `endings.json`
are imported directly and cast `as unknown as Scenario[]`. **The types are not
validated** — malformed JSON fails at runtime, not build. Validate by hand.

To add a score dimension you must edit all three: `ScoreState` (`types/game.ts`),
`INITIAL_SCORES` (`engine/scoring.ts`), and the data. `applyScoreDelta` defaults any
missing key to `50` and every value passes through `clampScore` (0–100, rounded).

Delayed consequences are **scenario-level only** (`scenario.delayedConsequences`),
gated on `requiredFlags` (AND) and/or `minScenarioIndex`. `Choice.queueConsequences`
is declared in the types but **never read by any code** — don't build on it.

Two score fields are write-only: `trust` and `viralRisk` are mutated by the data but
never read by any engine or UI. `criticalThinking` *is* used (archetype gating in
`endingEngine.determineArchetype`).

### Score-snapshot aliasing bug

In `makeChoice`, `historyItem.scoreSnapshot` is the **same object reference** as
`newScores`, which is later mutated in place via `Object.assign` when a consequence
fires (`src/state/gameStore.ts`). So a choice's snapshot already includes its
consequence deltas. Preserve this behavior or fix it deliberately — don't refactor
the two apart assuming independence.

## Conventions

- All UI copy is Vietnamese; timestamps hardcode `toLocaleTimeString('vi-VN', ...)`.
  Keep new user-facing strings in Vietnamese.
- Styling is **inline `style={{}}` objects** plus CSS custom properties defined in
  `src/index.css` (`--color-primary`, `--radius-md`, `--shadow-sm`, ...). No
  Tailwind, no CSS-in-JS. Reuse the existing utility classes: `glass-card`,
  `dark-glass-card`, `badge` (+ `-primary/-gold/-success`), `animate-fade-in`,
  `animate-float-up`, `mobile-hide`.
- Components use `export const X: React.FC<Props> = ...` with a plain `import React
  from 'react'`. `src/screens/CoreScreen.tsx` omits the React import (works via UMD
  global) — follow the majority, don't copy that file's header.
- `verbatimModuleSyntax` is on: type-only imports **must** use `import type`.
- `erasableSyntaxOnly` is on: no `enum`, no constructor parameter properties.
- `noUnusedLocals`/`noUnusedParameters` are on — an unused import **fails the build**.
- Icons come from `lucide-react`; success celebrations from `canvas-confetti`.

## Runtime notes

- **No persistence.** No localStorage/persist middleware — a reload loses all progress.
  Verifying a change means replaying from `landing`.
- **Sound** is synthesized live via Web Audio API oscillators (`src/utils/audio.ts`),
  not audio files. `soundManager` is a singleton that lazily creates its AudioContext
  on first interaction and no-ops when `soundEnabled` is false.
- **Remote assets** are required at runtime: Google Fonts (`index.css`), DiceBear
  avatars (`SetupScreen`, `scenarios.json`), Unsplash images (`scenarios.json`).
  Offline dev builds fine but renders broken images and fallback fonts.

## Dead template leftovers

Unreferenced, safe to delete but currently committed-to-nothing:
`src/App.css`, `src/assets/{hero.png,react.svg,vite.svg}`, `public/icons.svg`.

## README is stale

`README.md` is the untouched Vite template text and describes none of this app.
`src/engine/endingEngine.ts` hardcodes the 6 archetypes rather than reading
`endings.json` (which only holds `references`) — don't assume a data file drives
everything it could name.