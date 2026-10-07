# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Văn Hóa 404** is a top-down survivor web game (Vampire-Survivors-style, auto-fire, ~10-minute run) about cultural values. Phaser 3 + TypeScript + Vite. Docs and all player-facing text are **Vietnamese**.

> `AGENTS.md` holds the design/content rules (hard rules, ID conventions, scenario-effect whitelist, tone). Its "Status" section is **stale**: it says there is no `package.json`/`src/`, but the game has been scaffolded and is playable. Follow its content rules; ignore its claims about the repo being docs-only.

## Commands

```bash
npm install
npm run dev       # Vite dev server on http://localhost:3000
npm run build     # tsc (typecheck only, noEmit) && vite build -> dist/
npm run preview   # serve the built dist/
npx tsc           # typecheck only
```

There is **no test runner, linter, or CI**. `tsconfig.json` is `strict` with `noUnusedLocals`/`noUnusedParameters`, so `npx tsc` is the only automated check. Real verification is a manual playtest in the browser.

## Architecture

**Scene flow** (`src/game/config.ts`, 1280×720, `Scale.FIT`, Arcade physics with zero gravity):
`BootScene → MenuScene → CharacterSelectScene → GameScene → ResultScene`. The selected `CharacterClassConfig` is passed via `scene.start(..., { classConfig })`; `ResultScene` receives a big run-summary object from `GameScene.onGameOver()`.

**`BootScene` generates all sprites procedurally** with `Graphics.generateTexture()` — there are no image loads for gameplay entities. Enemies look up their texture as `enemy_${config.id}` (`src/game/entities/Enemy.ts`), so **adding a new enemy id requires adding a matching texture in `BootScene`**. `src/assets/tiles/*.png` are currently unreferenced.

**`GameScene` is the orchestrator.** It constructs every manager in `create()` and wires them by **direct property assignment** (e.g. `enemyManager.weaponSystem = weaponSystem`, `player.communityMeter = communityMeter`, `weaponSystem.bossManager = bossManager`) plus constructor callbacks (`onLevelUp`, `resumeCombat`, `onBossDefeated`). There is no event bus. `GameScene.update()` drives everything in a fixed order: player → enemies → weapons → XP → bullet-vs-enemy/boss collision (done manually here, not via Arcade colliders) → waves → community meter → evolutions → boss timeline → scenario triggers → HUD.

**Pause model:** level-up upgrade choice and scenario events are **overlays inside `GameScene`**, not separate scenes (design requirement). They call `pauseCombat()`, which sets `isPaused`, pauses physics, zeroes velocities, **clears in-flight projectiles**, and freezes the boss; the overlay's close callback calls `resumeCombat()`. Any new modal/overlay must go through this pair, and any new moving entity must be frozen in `pauseCombat()` (past bugs: stuck projectiles, boss moving during pause).

**Managers** (`src/game/managers/`) each own one system: `EnemyManager` (pooled enemies, enemy bullets, hit handling), `WeaponSystem` (auto-aim/auto-fire, pooled projectiles), `XPManager`, `WaveManager`, `UpgradeManager` (8 pillars, per-stat level cap of 5), `ScenarioEventManager` (timed scenario popups + 30s buffs), `CommunityMeterManager` (meter at 0 = debuff, never instant loss), `EvolutionManager` (evolutions + value combos), `BossManager` (bosses on a 3m/5m/7m/10m timeline; the 10m one is final and triggers victory). `SoundSystem` (procedural Web Audio) and `DamageNumberSystem` are static singletons. `src/ui/HUD.ts` is camera-fixed UI.

**Player stats:** `src/game/types/player.ts` is the canonical `PlayerStats` shape (from `GDD.md`). Concrete numbers and per-pillar effects are documented in `STATS_AND_SKILLS.md`; class/combo design is in `van_hoa_404_classes_and_combos.md`. Keep those docs in sync when changing balance.

## Data / content

- Content types live in `src/game/types/data.ts`. `src/data/loader.ts` (`DataLoader`) imports the JSON files from root `data/` via the `@data/*` alias (so `src/data/` holds only the loader, root `data/` holds the JSON).
- **All `data/*.placeholder.json` content arrays are empty on purpose.** `DataLoader` falls back to hard-coded `DEFAULT_MVP_*` arrays in `loader.ts` whenever a JSON array is empty — so the game's actual enemies, upgrades, waves, scenarios, evolutions and bosses currently live in `loader.ts`. Classes and combos (`DEFAULT_MVP_CLASSES`, `DEFAULT_MVP_COMBOS`) have no JSON file and are always read from `loader.ts`.
- Filling a JSON array **replaces** the corresponding defaults entirely; it does not merge.
- `src/data/lesson.ts` holds the lecture-sourced text (Đề cương 1943 framing, archetype quotes, the "Tinh hoa nhân loại" rule). Quotes there are verbatim from `t_t_ng_h_ch_minh_v_x_y_d_ng_n_n_v_n_h_a_m_i.md` (Giáo trình TT HCM, Chương VI) — keep them verbatim.
- A scenario choice counts as "aligned" via `choice.aligned`, falling back to `communityDelta > 0` (`isAlignedChoice` in `ScenarioEventManager.ts`). Only aligned choices raise pillar levels; every choice is logged to `decisions` for the results-screen lesson recap.
- Per `AGENTS.md`/`README.md`: don't invent real-world scenario content, keep IDs as diacritic-free camelCase (`danToc`, `khoaHoc`, `daiChung`, `chan`, `thien`, `my`, `build`, `fight`), and only use whitelisted scenario effects (`CONTENT_GUIDE.md`).

Path aliases (`vite.config.ts` and `tsconfig.json`, keep both in sync): `@/` → `src/`, `@game/` → `src/game/`, `@data/` → `data/`, `@ui/` → `src/ui/`.

## Persistence

`localStorage` keys: `vanhoa404_intro_done` (first-run intro guide in `GameScene`) and `vanhoa404_class_mode` (classroom mode toggle on the menu: player takes 50% damage; see `src/game/settings.ts`).

## Git

Commit directly to `dev-3`; no PR step.
