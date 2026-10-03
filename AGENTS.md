# AGENTS.md

## Status — read this first

This repo is currently a **design starter pack, not an application**. It contains only
`README.md`, `GDD.md`, `TECHNICAL_DESIGN.md`, `CONTENT_GUIDE.md`, `PRODUCTION_ROADMAP.md`
and `data/*.placeholder.json`.

There is **no `package.json`, no `src/`, no build, lint, typecheck, test, or CI config, and no
`.gitignore`.** Do not invent commands to "verify" work, and do not report a build/test as
passing unless you actually installed and ran it. The only Definition of Done in the docs is a
manual playtest (`PRODUCTION_ROADMAP.md:17`: "chơi được 3 phút và có thể chết/level").

The game is meant to be scaffolded **in this repo**. Next step per `PRODUCTION_ROADMAP.md:3-7`:
Phaser + TypeScript + Vite, JSON loaders, placeholder assets.

## Stack (prescribed, not yet installed)

`TECHNICAL_DESIGN.md:3-13`: Phaser 3 + TypeScript + Vite, JSON content, `localStorage` for
persistence. React + Zustand is **optional and only for UI outside gameplay** — do not add it by
default. `README.md:16` requires all enemy/upgrade/wave/scenario content to be data-driven.

Scene layout and manager list are fixed by `TECHNICAL_DESIGN.md:15-38`. Upgrade and Scenario
Event UI must be **overlays, not scene switches**.

## Hard rules (from `README.md:18-23`)

1. Never hard-code a scenario.
2. No multiplayer in the MVP.
3. No complex enemy AI.
4. No branching story.
5. Scenarios may only affect play via buff / debuff / spawn / community meter.

## Do not invent real scenarios

`README.md:16`: *"Không tự tạo tình huống thực tế; chỉ dùng placeholder."* — Do not author real
Vietnamese scenario, enemy, or upgrade content on your own initiative. The placeholder files ship
empty on purpose, with `"__PLACEHOLDER__"` sentinels and empty content arrays.

## Data files

Envelope pattern — every file is `{ meta, <x>Template, <x>: [] }`. Real content is added by
copying `<x>Template` into the `<x>` array and replacing every `"__PLACEHOLDER__: a | b | c"`
string. Template strings double as **enum documentation**, so read them before adding data:

| File | Content array | Enum source |
| --- | --- | --- |
| `data/enemies.placeholder.json` | `enemies` | `type`: `chase \| ranged \| dash \| swarm \| elite` |
| `data/upgrades.placeholder.json` | `upgrades` | `category`: `danToc \| khoaHoc \| daiChung \| chan \| thien \| my \| build \| fight` |
| `data/waves.placeholder.json` | `waves` | — (`startSecond` / `endSecond`) |
| `data/scenarios.placeholder.json` | `scenarios` | `learning.cores`, `learning.values`, `learning.buildFight` |

- **IDs are ASCII camelCase Vietnamese with no diacritics** (`danToc`, `khoaHoc`, `daiChung`,
  `chan`, `thien`, `my`). Do not write `dânTộc` in any JSON key, id, or enum value.
- `evolutions.json` and `boss.json` are required by `TECHNICAL_DESIGN.md:74-83` and
  `TECHNICAL_DESIGN.md:110-127` but **do not exist yet**.
- **Known path conflict:** `TECHNICAL_DESIGN.md:110-127` puts data under `src/data/`, but the
  placeholders live in root `data/`. Decide deliberately when scaffolding and keep one location.
- Keep the `.placeholder.` filename marker while content is still placeholder; the design expects
  bare `enemies.json`, `upgrades.json`, etc.
- Two version numbers must be bumped together: `GDD.md:2` (`Phiên bản 0.1`) and each file's
  `meta.version` (`0.1.0`).

## Content constraints

- **Scenario `learning` mapping is narrower than the game's 8 pillars.** `cores` accepts only
  `danToc | khoaHoc | daiChung` and `values` only `chan | thien | my`; `buildFight` is
  `build | fight | both`. Do not map scenarios to `build`/`fight` as a core value.
- Allowed scenario effects are a fixed whitelist (`CONTENT_GUIDE.md:13-23`): `hp`, `shield`,
  damage/attack-speed/move-speed multipliers, `communityDelta`, `xpMultiplier`, `spawnEnemyType`,
  `enemySpeedMultiplier`, `duration`. Adding an effect type requires updating `CONTENT_GUIDE.md`.
- Enemy→value mapping table: `CONTENT_GUIDE.md:38-44`.
- Tone rules and length limits (read in 5–8s, 2–4 choices, 1-sentence feedback, no preaching):
  `CONTENT_GUIDE.md:1-11,46-51`. Docs and player-facing text are **Vietnamese**.
- Canonical player stat shape is `GDD.md:50-65` (`PlayerStats`, including `projectileCount`,
  `critChance`, `buildPower`, `fightPower`). Move it into code as-is; don't redefine it.

## What to build, in order

`README.md:16`: combat prototype before UI polish. When cutting scope, follow the explicit
fallback priority in `PRODUCTION_ROADMAP.md:53-64` — note that **scenario events rank 7th,
Community Meter 8th, and evolutions 9th**, well below movement / auto-fire / enemy / XP /
upgrades / boss. Do not assume document order equals build order.

Wave timings must come from the `GDD.md:26-33` timeline (`startSecond` / `endSecond`) and the
wave roster in `GDD.md:201-206`; the boss is `GDD.md:208-217`.

## Implementation gotchas from the design

- **No pathfinding** (`TECHNICAL_DESIGN.md:52-64`). Enemy AI is `normalize(player.pos - enemy.pos)`
  steering plus variants: chase, ranged, dash, orbit, swarm.
- **Performance budget: 60 FPS desktop, ~150–250 active enemies** (`TECHNICAL_DESIGN.md:98-103`).
  Object pooling for enemies and particles, AABB/circle collision, and avoiding a heavy physics
  engine are requirements, not optimizations (`TECHNICAL_DESIGN.md:104-108`).
- No fire button — auto-fire only (`GDD.md:38-47`, `TECHNICAL_DESIGN.md:66-72`).
- Community Meter hitting 0 must **not** instantly end the run; it applies a strong debuff
  (`GDD.md:163-177`).
- Ending must not label the player overall right/wrong (`GDD.md:227-245`).
- Enemies are abstract phenomena, never depictions of a specific group of people
  (`GDD.md:17`, `GDD.md:247-252`).

## Git

Commit directly to the `dev-3` branch. No PR step. Single author; no CI, no pre-commit hooks.