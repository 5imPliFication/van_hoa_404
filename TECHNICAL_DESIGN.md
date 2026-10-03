# VĂN HÓA 404 — TECHNICAL DESIGN

## Stack
Khuyến nghị:
- Phaser 3
- TypeScript
- Vite
- JSON
- localStorage

Nếu muốn UI ngoài gameplay đẹp hơn:
- React + Phaser
- Zustand cho app state

## Scene structure
```txt
BootScene
MenuScene
GameScene
ResultScene
```
Upgrade/Event nên là overlay để tránh scene switching phức tạp.

## Managers
```txt
GameState
PlayerController
WeaponSystem
EnemyManager
WaveManager
XPManager
UpgradeManager
EvolutionManager
ScenarioEventManager
CommunityMeterManager
BossManager
ResultManager
```

## Game loop
```ts
update(dt) {
  player.update(dt);
  enemyManager.update(dt);
  weaponSystem.update(dt);
  collisionSystem.update(dt);
  xpManager.update(dt);
  waveManager.update(dt);
}
```

## Enemy AI
Không pathfinding.
```ts
dir = normalize(player.pos - enemy.pos)
enemy.pos += dir * speed * dt
```

Biến thể:
- chase
- ranged
- dash
- orbit
- swarm

## Auto-fire
```ts
if (weapon.cooldownReady()) {
  const target = findNearestEnemyInRange();
  if (target) fireProjectile(target);
}
```

## Data-driven
Đọc từ JSON:
- enemies
- upgrades
- evolutions
- waves
- scenarios
- boss

Không hard-code content học thuật trong component.

## Scenario flow
```ts
if (triggerReached) {
  pauseOrSlowCombat();
  showScenario(data);
}

function onChoice(choice) {
  applyEffects(choice.effects);
  resumeCombat();
}
```

## Performance
Target:
- 60 FPS desktop
- 30–60 FPS mobile
- ~150–250 active enemies

Dùng:
- object pooling
- AABB/circle collision
- particle pooling
- tránh physics engine nặng nếu không cần

## Folder structure
```txt
src/
  game/
    scenes/
    entities/
    systems/
    managers/
  data/
    enemies.json
    upgrades.json
    evolutions.json
    waves.json
    scenarios.json
    boss.json
  ui/
  assets/
```

## Milestones
M1: movement + enemy + auto-fire + XP  
M2: level up + upgrade cards  
M3: enemy types + evolution + community meter  
M4: scenario JSON  
M5: boss + ending  
M6: VFX + sound + mobile + balance
