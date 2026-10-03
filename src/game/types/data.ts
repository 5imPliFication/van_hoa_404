import { Pillar } from './player';

export interface Envelope<TTemplate, TItem> {
  meta: {
    version: string;
    gameId?: string;
  };
  template?: TTemplate;
  items: TItem[];
}

export type EnemyType = 'chase' | 'ranged' | 'dash' | 'swarm' | 'elite';

export interface EnemyConfig {
  id: string;
  name: string;
  type: EnemyType;
  learningTag: string;
  stats: {
    hp: number;
    speed: number;
    damage: number;
    xpDrop: number;
  };
  behavior: {
    attackRange: number;
    cooldown: number;
    special: string;
  };
  weakAgainst: string[];
}

export interface UpgradeConfig {
  id: string;
  name: string;
  category: Pillar;
  level: number;
  maxLevel: number;
  description: string;
  effects: {
    damageAdd?: number;
    damageMultiplier?: number;
    attackSpeedMultiplier?: number;
    moveSpeedMultiplier?: number;
    critChanceAdd?: number;
    pickupRadiusAdd?: number;
    shieldAdd?: number;
    healPerInterval?: number;
    communityPowerAdd?: number;
    fightPowerAdd?: number;
    projectileCountAdd?: number;
    projectileSpeedMultiplier?: number;
    maxHpAdd?: number;
  };
  tags: string[];
}

export interface WaveSpawnConfig {
  enemyId: string;
  ratePerSecond: number;
  maxAlive: number;
}

export interface WaveConfig {
  id: string;
  startSecond: number;
  endSecond: number;
  spawns: WaveSpawnConfig[];
  eventIds: string[];
}

export interface ScenarioChoiceEffects {
  player: {
    hp: number;
    damageMultiplier: number;
    attackSpeedMultiplier: number;
    moveSpeedMultiplier: number;
    shield: number;
  };
  world: {
    communityDelta: number;
    xpMultiplier: number;
    spawnEnemyType: string | null;
    spawnCount: number;
    enemySpeedMultiplier: number;
  };
  durationSeconds: number;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  effects: ScenarioChoiceEffects;
  feedback: string;
}

export interface ScenarioConfig {
  id: string;
  enabled: boolean;
  trigger: {
    type: 'time' | 'community' | 'killCount';
    value: string | number;
  };
  title: string;
  prompt: string;
  choices: ScenarioChoice[];
  learning: {
    cores: ('danToc' | 'khoaHoc' | 'daiChung')[];
    values: ('chan' | 'thien' | 'my')[];
    buildFight: 'build' | 'fight' | 'both';
    note: string;
  };
}

export interface EvolutionConfig {
  id: string;
  name: string;
  description: string;
  requiredPillars: Pillar[];
  effects: {
    projectilePierce?: boolean;
    damageMultiplier?: number;
    auraRadius?: number;
    auraSlow?: number;
    auraHeal?: number;
    bonusVsEnemyType?: string | null;
    bonusDamageMultiplier?: number;
    communityMeterBuff?: number;
  };
}

export interface BossPhaseConfig {
  phaseNumber: number;
  name: string;
  hpThresholdPercent: number;
  attackPattern: string;
  attackCooldown: number;
  speedMultiplier: number;
  communityMeterDrainPerSecond: number;
}

export interface BossConfig {
  id: string;
  name: string;
  maxHp: number;
  speed: number;
  phases: BossPhaseConfig[];
}
