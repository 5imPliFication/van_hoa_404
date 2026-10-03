import enemiesData from '@data/enemies.placeholder.json';
import upgradesData from '@data/upgrades.placeholder.json';
import wavesData from '@data/waves.placeholder.json';
import scenariosData from '@data/scenarios.placeholder.json';
import evolutionsData from '@data/evolutions.placeholder.json';
import bossData from '@data/boss.placeholder.json';

import {
  EnemyConfig,
  UpgradeConfig,
  WaveConfig,
  ScenarioConfig,
  EvolutionConfig,
  BossConfig,
} from '@/game/types/data';

// Default MVP fallback items when placeholder arrays are empty, ensuring combat loop is immediately playable
const DEFAULT_MVP_ENEMIES: EnemyConfig[] = [
  {
    id: 'tinGia',
    name: 'Tin Giả',
    type: 'chase',
    learningTag: 'khoaHoc',
    stats: {
      hp: 25,
      speed: 130,
      damage: 8,
      xpDrop: 2,
    },
    behavior: {
      attackRange: 0,
      cooldown: 0,
      special: 'duplicate',
    },
    weakAgainst: ['khoaHoc', 'chan'],
  },
  {
    id: 'clickbait',
    name: 'Clickbait',
    type: 'dash',
    learningTag: 'chan',
    stats: {
      hp: 15,
      speed: 190,
      damage: 12,
      xpDrop: 1,
    },
    behavior: {
      attackRange: 160,
      cooldown: 2.5,
      special: 'dash',
    },
    weakAgainst: ['chan', 'my'],
  },
  {
    id: 'tamLyDamDong',
    name: 'Tâm Lý Đám Đông',
    type: 'swarm',
    learningTag: 'daiChung',
    stats: {
      hp: 10,
      speed: 110,
      damage: 5,
      xpDrop: 1,
    },
    behavior: {
      attackRange: 0,
      cooldown: 0,
      special: 'swarm',
    },
    weakAgainst: ['daiChung', 'khoaHoc'],
  },
  {
    id: 'baoLucNgonTu',
    name: 'Bạo Lực Ngôn Từ',
    type: 'ranged',
    learningTag: 'thien',
    stats: {
      hp: 35,
      speed: 80,
      damage: 10,
      xpDrop: 3,
    },
    behavior: {
      attackRange: 220,
      cooldown: 2.0,
      special: 'slowZone',
    },
    weakAgainst: ['thien', 'daiChung'],
  },
  {
    id: 'xuyenTacVanHoa',
    name: 'Xuyên Tạc Văn Hóa',
    type: 'elite',
    learningTag: 'danToc',
    stats: {
      hp: 120,
      speed: 95,
      damage: 15,
      xpDrop: 10,
    },
    behavior: {
      attackRange: 100,
      cooldown: 4.0,
      special: 'distortionAura',
    },
    weakAgainst: ['danToc', 'chan'],
  },
];

const DEFAULT_MVP_UPGRADES: UpgradeConfig[] = [
  {
    id: 'khoaHoc_1',
    name: 'Tư Duy Phản Biện (Khoa Học I)',
    category: 'khoaHoc',
    level: 1,
    maxLevel: 5,
    description: '+15% Tốc độ đạn, +5% Tỉ lệ bạo kích',
    effects: {
      attackSpeedMultiplier: 1.15,
      critChanceAdd: 0.05,
    },
    tags: ['khoaHoc', 'crit'],
  },
  {
    id: 'danToc_1',
    name: 'Bản Sắc Bền Vững (Dân Tộc I)',
    category: 'danToc',
    level: 1,
    maxLevel: 5,
    description: '+25 Khiên chắn, tăng kháng nhiễu',
    effects: {
      shieldAdd: 25,
    },
    tags: ['danToc', 'shield'],
  },
  {
    id: 'daiChung_1',
    name: 'Lan Tỏa Cộng Đồng (Đại Chúng I)',
    category: 'daiChung',
    level: 1,
    maxLevel: 5,
    description: '+25% Bán kính nhặt XP, +10% Bán kính hào quang',
    effects: {
      pickupRadiusAdd: 30,
      communityPowerAdd: 5,
    },
    tags: ['daiChung', 'pickup'],
  },
  {
    id: 'chan_1',
    name: 'Xác Thực Chân Lý (Chân I)',
    category: 'chan',
    level: 1,
    maxLevel: 5,
    description: '+20% Sát thương đạn chuẩn xác',
    effects: {
      damageMultiplier: 1.2,
    },
    tags: ['chan', 'damage'],
  },
  {
    id: 'thien_1',
    name: 'Ứng Xử Văn Minh (Thiện I)',
    category: 'thien',
    level: 1,
    maxLevel: 5,
    description: 'Hồi 2 HP mỗi 10 giây',
    effects: {
      healPerInterval: 2,
    },
    tags: ['thien', 'heal'],
  },
  {
    id: 'my_1',
    name: 'Thẩm Mỹ Số (Mỹ I)',
    category: 'my',
    level: 1,
    maxLevel: 5,
    description: '+15% Sát thương diện rộng và làm chậm quái',
    effects: {
      damageMultiplier: 1.15,
    },
    tags: ['my', 'aoe'],
  },
  {
    id: 'chong_1',
    name: 'Tường Lửa Chống Lệch Chuẩn (Chống I)',
    category: 'fight',
    level: 1,
    maxLevel: 5,
    description: '+1 Tia đạn bổ sung cho mỗi đòn đánh',
    effects: {
      damageAdd: 5,
    },
    tags: ['fight', 'bullet'],
  },
  {
    id: 'xay_1',
    name: 'Kiến Tạo Giá Trị Tích Cực (Xây I)',
    category: 'build',
    level: 1,
    maxLevel: 5,
    description: '+15% Tốc độ di chuyển, hồi phục Community Meter',
    effects: {
      moveSpeedMultiplier: 1.15,
      communityPowerAdd: 10,
    },
    tags: ['build', 'speed'],
  },
];

const DEFAULT_MVP_WAVES: WaveConfig[] = [
  {
    id: 'wave_1',
    startSecond: 0,
    endSecond: 135,
    spawns: [
      { enemyId: 'clickbait', ratePerSecond: 1.2, maxAlive: 25 },
      { enemyId: 'tinGia', ratePerSecond: 0.8, maxAlive: 20 },
    ],
    eventIds: ['scenario_sample_1'],
  },
  {
    id: 'wave_2',
    startSecond: 135,
    endSecond: 285,
    spawns: [
      { enemyId: 'tamLyDamDong', ratePerSecond: 2.5, maxAlive: 50 },
      { enemyId: 'baoLucNgonTu', ratePerSecond: 0.6, maxAlive: 15 },
    ],
    eventIds: ['scenario_sample_2'],
  },
  {
    id: 'wave_3',
    startSecond: 285,
    endSecond: 435,
    spawns: [
      { enemyId: 'tinGia', ratePerSecond: 1.5, maxAlive: 35 },
      { enemyId: 'xuyenTacVanHoa', ratePerSecond: 0.25, maxAlive: 4 },
      { enemyId: 'baoLucNgonTu', ratePerSecond: 1.0, maxAlive: 20 },
    ],
    eventIds: ['scenario_sample_3'],
  },
  {
    id: 'wave_4',
    startSecond: 435,
    endSecond: 585,
    spawns: [
      { enemyId: 'clickbait', ratePerSecond: 2.0, maxAlive: 40 },
      { enemyId: 'tamLyDamDong', ratePerSecond: 3.0, maxAlive: 60 },
      { enemyId: 'xuyenTacVanHoa', ratePerSecond: 0.5, maxAlive: 8 },
    ],
    eventIds: ['scenario_sample_4'],
  },
];

const DEFAULT_MVP_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'scenario_sample_1',
    enabled: true,
    trigger: { type: 'time', value: 45 },
    title: 'Tin Đồn Chưa Kiểm Chứng',
    prompt: 'Một bài viết giật gân chưa rõ nguồn gốc đang lan truyền với tốc độ chóng mặt trên mạng xã hội.',
    choices: [
      {
        id: 'choice_verify',
        label: 'Kiểm chứng nguồn tin trước khi tương tác',
        effects: {
          player: { hp: 0, damageMultiplier: 1.2, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 10 },
          world: { communityDelta: 15, xpMultiplier: 1.2, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 1.0 },
          durationSeconds: 20,
        },
        feedback: 'Bạn đã chọn tư duy Khoa Học & Chân lý, tăng sát thương lên Tin Giả!',
      },
      {
        id: 'choice_share',
        label: 'Chia sẻ ngay để cảnh báo bạn bè',
        effects: {
          player: { hp: -5, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -15, xpMultiplier: 1.0, spawnEnemyType: 'tinGia', spawnCount: 6, enemySpeedMultiplier: 1.2 },
          durationSeconds: 15,
        },
        feedback: 'Chia sẻ không kiểm chứng khiến Tin Giả lan rộng hơn trong không gian số.',
      },
      {
        id: 'choice_report',
        label: 'Báo cáo nội dung vi phạm tiêu chuẩn',
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: 10, xpMultiplier: 1.0, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.8 },
          durationSeconds: 15,
        },
        feedback: 'Hành động bảo vệ cộng đồng giúp làm chậm sự lây lan của tin tiêu cực.',
      },
    ],
    learning: {
      cores: ['khoaHoc', 'daiChung'],
      values: ['chan'],
      buildFight: 'both',
      note: 'Luôn xác minh trước khi chia sẻ thông tin trên không gian mạng.',
    },
  },
];

const DEFAULT_MVP_EVOLUTIONS: EvolutionConfig[] = [
  {
    id: 'kiemChung',
    name: 'Kiểm Chứng',
    description: 'Khoa học + Chân: Đạn xuyên thấu mọi mục tiêu và gây thêm 50% sát thương lên Tin Giả.',
    requiredPillars: ['khoaHoc', 'chan'],
    effects: {
      projectilePierce: true,
      bonusVsEnemyType: 'tinGia',
      bonusDamageMultiplier: 1.5,
    },
  },
  {
    id: 'vanHoaUngXu',
    name: 'Văn Hóa Ứng Xử',
    description: 'Đại chúng + Thiện: Hào quang xung quanh làm chậm quái 30% và hồi máu đều đặn.',
    requiredPillars: ['daiChung', 'thien'],
    effects: {
      auraRadius: 160,
      auraSlow: 0.3,
      auraHeal: 3,
    },
  },
  {
    id: 'banSacSangTao',
    name: 'Bản Sắc Sáng Tạo',
    description: 'Dân tộc + Mỹ: Đòn tấn công sóng năng lượng lan tỏa diện rộng, phá tan sao chép cơ học.',
    requiredPillars: ['danToc', 'my'],
    effects: {
      damageMultiplier: 1.35,
      auraRadius: 200,
    },
  },
  {
    id: 'matTranVanHoa',
    name: 'Mặt Trận Văn Hóa',
    description: 'Xây + Chống cân bằng: Kích hoạt trạng thái tăng vọt công lực và củng cố Community Meter.',
    requiredPillars: ['build', 'fight'],
    effects: {
      damageMultiplier: 1.3,
      communityMeterBuff: 25,
    },
  },
];

const DEFAULT_MVP_BOSS: BossConfig = {
  id: 'lechChuanVanHoaSo',
  name: 'LỆCH CHUẨN VĂN HÓA SỐ',
  maxHp: 2000,
  speed: 90,
  phases: [
    {
      phaseNumber: 1,
      name: 'Nhiễu Thông Tin',
      hpThresholdPercent: 100,
      attackPattern: 'projectileSpread',
      attackCooldown: 2.2,
      speedMultiplier: 1.0,
      communityMeterDrainPerSecond: 0.5,
    },
    {
      phaseNumber: 2,
      name: 'Bạo Lực & Cực Hóa',
      hpThresholdPercent: 65,
      attackPattern: 'laserSweep',
      attackCooldown: 1.8,
      speedMultiplier: 1.3,
      communityMeterDrainPerSecond: 1.0,
    },
    {
      phaseNumber: 3,
      name: 'Khủng Hoảng Giá Trị',
      hpThresholdPercent: 30,
      attackPattern: 'minionSpawn',
      attackCooldown: 1.4,
      speedMultiplier: 1.5,
      communityMeterDrainPerSecond: 2.0,
    },
  ],
};

export class DataLoader {
  public static getEnemies(): EnemyConfig[] {
    const list = (enemiesData as { enemies?: EnemyConfig[] }).enemies;
    return list && list.length > 0 ? list : DEFAULT_MVP_ENEMIES;
  }

  public static getUpgrades(): UpgradeConfig[] {
    const list = (upgradesData as { upgrades?: UpgradeConfig[] }).upgrades;
    return list && list.length > 0 ? list : DEFAULT_MVP_UPGRADES;
  }

  public static getWaves(): WaveConfig[] {
    const list = (wavesData as { waves?: WaveConfig[] }).waves;
    return list && list.length > 0 ? list : DEFAULT_MVP_WAVES;
  }

  public static getScenarios(): ScenarioConfig[] {
    const list = (scenariosData as { scenarios?: ScenarioConfig[] }).scenarios;
    return list && list.length > 0 ? list : DEFAULT_MVP_SCENARIOS;
  }

  public static getEvolutions(): EvolutionConfig[] {
    const list = (evolutionsData as { evolutions?: EvolutionConfig[] }).evolutions;
    return list && list.length > 0 ? list : DEFAULT_MVP_EVOLUTIONS;
  }

  public static getBoss(): BossConfig {
    const bossList = (bossData as { boss?: BossConfig[] }).boss;
    return bossList && bossList.length > 0 ? bossList[0] : DEFAULT_MVP_BOSS;
  }
}
