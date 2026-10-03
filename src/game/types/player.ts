export type PlayerStats = {
  hp: number;
  maxHp: number;
  moveSpeed: number;
  damage: number;
  attackSpeed: number;
  projectileCount: number;
  projectileSpeed: number;
  pickupRadius: number;
  critChance: number;
  shield: number;
  buildPower: number;
  fightPower: number;
};

export type CorePillar = 'danToc' | 'khoaHoc' | 'daiChung';
export type ValuePillar = 'chan' | 'thien' | 'my';
export type BuildFightPillar = 'build' | 'fight';
export type Pillar = CorePillar | ValuePillar | BuildFightPillar;

export interface CulturalValues {
  danToc: number;
  khoaHoc: number;
  daiChung: number;
  chan: number;
  thien: number;
  my: number;
  build: number;
  fight: number;
}

export const INITIAL_PLAYER_STATS: PlayerStats = {
  hp: 100,
  maxHp: 100,
  moveSpeed: 240,
  damage: 20,
  attackSpeed: 1.2, // attacks per second
  projectileCount: 1,
  projectileSpeed: 450,
  pickupRadius: 90,
  critChance: 0.05,
  shield: 0,
  buildPower: 0,
  fightPower: 0,
};
