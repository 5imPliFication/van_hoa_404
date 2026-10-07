import { Pillar, PlayerStats, CulturalValues } from './player';

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
  // Whether this choice reflects the scenario's lesson. Defaults to `communityDelta > 0` when omitted.
  aligned?: boolean;
}

export interface ScenarioDecision {
  title: string;
  choiceLabel: string;
  aligned: boolean;
  note: string;
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
  timelineSecond?: number;
  testDescription?: string;
  mechanicType?: 'swarm' | 'dot' | 'shield_dash' | 'final';
  contactDamage?: number;
  bulletDamage?: number;
  bulletSpeed?: number;
  dotDamage?: number;
  minionHp?: number;
  minionDamage?: number;
  minionCount?: number;
  tierNumber?: number;
  tierLabel?: string;
  radius?: number;
  textureKey?: string;
}

export type WeaponStyle = 'sniper' | 'pulse' | 'drum';

export interface CharacterClassConfig {
  id: string;
  name: string;
  title: string;
  badgeIcon: string;
  themeColor: number;
  themeHex: string;
  roleDescription: string;
  startingWeapon: WeaponStyle;
  startingWeaponName: string;
  weaponName?: string;
  startingWeaponDesc: string;
  startingStats: Partial<PlayerStats>;
  startingValues: Partial<CulturalValues>;
  affinity: Pillar[];
  passive: {
    name: string;
    description: string;
    effectType: 'mark_verified' | 'community_resonance' | 'identity_aegis';
  };
}

export interface ComboRequirement {
  pillar: Pillar;
  level: number;
}

export interface ComboConfig {
  id: string;
  name: string;
  formula: string;
  description: string;
  requirements: ComboRequirement[];
  // Only this class id can unlock the combo (e.g. piercing bullets are Người Kiểm Chứng's)
  classOnly?: string;
  // Optional lecture quote shown when the combo unlocks
  quote?: string;
  effects: {
    communityRestore?: number;
    buildPowerAdd?: number;
    orbitingShields?: boolean;
    shieldCount?: number;
    projectilePierce?: boolean;
    bonusVsEnemyType?: string;
    bonusDamageMultiplier?: number;
    critOnMarked?: boolean;
    slowAuraRadius?: number;
    slowPercent?: number;
    auraHealPerInterval?: number;
    communityMeterBuffPerInterval?: number;
    shockwavePulse?: boolean;
    shockwaveCooldown?: number;
    damageMultiplier?: number;
  };
}
