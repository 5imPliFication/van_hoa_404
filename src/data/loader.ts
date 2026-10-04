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
  // --- Wave 1: 0 - 3m (Standard 2 Mobs - Tier 1) ---
  {
    id: 'clickbait',
    name: 'Clickbait (Giật Tít)',
    type: 'dash',
    learningTag: 'chan',
    stats: {
      hp: 20,
      speed: 175,
      damage: 7,
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
    id: 'tinGia',
    name: 'Tin Giả (Fake News)',
    type: 'chase',
    learningTag: 'khoaHoc',
    stats: {
      hp: 30,
      speed: 120,
      damage: 9,
      xpDrop: 2,
    },
    behavior: {
      attackRange: 0,
      cooldown: 0,
      special: 'duplicate',
    },
    weakAgainst: ['khoaHoc', 'chan'],
  },

  // --- Wave 2: 3 - 5m (2 Different Mobs - Tier 2, Stronger) ---
  {
    id: 'tamLyDamDong',
    name: 'Tâm Lý Đám Đông (Bầy Đàn)',
    type: 'swarm',
    learningTag: 'daiChung',
    stats: {
      hp: 55,
      speed: 145,
      damage: 13,
      xpDrop: 2,
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
    name: 'Bạo Lực Ngôn Từ (Toxic Ranged)',
    type: 'ranged',
    learningTag: 'thien',
    stats: {
      hp: 80,
      speed: 95,
      damage: 16,
      xpDrop: 3,
    },
    behavior: {
      attackRange: 230,
      cooldown: 2.0,
      special: 'slowZone',
    },
    weakAgainst: ['thien', 'daiChung'],
  },

  // --- Wave 3: 5 - 7m (2 Different Mobs - Tier 3, Even Stronger) ---
  {
    id: 'daoNhai',
    name: 'Đạo Nhái Sáng Tạo (Plagiarism)',
    type: 'dash',
    learningTag: 'my',
    stats: {
      hp: 130,
      speed: 185,
      damage: 22,
      xpDrop: 4,
    },
    behavior: {
      attackRange: 180,
      cooldown: 2.2,
      special: 'dash',
    },
    weakAgainst: ['my', 'danToc'],
  },
  {
    id: 'xuyenTacVanHoa',
    name: 'Xuyên Tạc Văn Hóa (Distortion Elite)',
    type: 'elite',
    learningTag: 'danToc',
    stats: {
      hp: 240,
      speed: 105,
      damage: 28,
      xpDrop: 6,
    },
    behavior: {
      attackRange: 120,
      cooldown: 3.5,
      special: 'distortionAura',
    },
    weakAgainst: ['danToc', 'chan'],
  },

  // --- Wave 4: 7 - 10m (2 Different Mobs - Tier 4, Apex Strongest) ---
  {
    id: 'cucDoanMang',
    name: 'Cực Đoan Mạng (Berserk Extremism)',
    type: 'chase',
    learningTag: 'thien',
    stats: {
      hp: 350,
      speed: 165,
      damage: 35,
      xpDrop: 8,
    },
    behavior: {
      attackRange: 0,
      cooldown: 0,
      special: 'frenzy',
    },
    weakAgainst: ['thien', 'khoaHoc'],
  },
  {
    id: 'khungHoangTruyenThong',
    name: 'Khủng Hoảng Truyền Thông (Crisis Heavy Tank)',
    type: 'elite',
    learningTag: 'daiChung',
    stats: {
      hp: 550,
      speed: 90,
      damage: 45,
      xpDrop: 12,
    },
    behavior: {
      attackRange: 240,
      cooldown: 2.5,
      special: 'heavyBarrage',
    },
    weakAgainst: ['daiChung', 'chan'],
  },
];

const DEFAULT_MVP_UPGRADES: UpgradeConfig[] = [
  {
    id: 'khoaHoc_1',
    name: 'Tư Duy Phản Biện (Khoa Học I)',
    category: 'khoaHoc',
    level: 1,
    maxLevel: 5,
    description: '+15% Tốc độ bắn, +5% Tỉ lệ bạo kích',
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
    description: '+25 Khiên chắn bảo vệ, tăng sức chống chịu',
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
    description: '+30 Bán kính nhặt XP, +5 Sức mạnh Xây',
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
    description: 'Hồi 2 HP mỗi 5 giây',
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
    description: '+15% Sát thương diện rộng và mở rộng hào quang',
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
    description: '+1 Tia đạn bổ sung cho mỗi đòn đánh, +10 Sức mạnh Chống',
    effects: {
      projectileCountAdd: 1,
      damageAdd: 5,
      fightPowerAdd: 10,
    },
    tags: ['fight', 'bullet'],
  },
  {
    id: 'xay_1',
    name: 'Kiến Tạo Giá Trị Tích Cực (Xây I)',
    category: 'build',
    level: 1,
    maxLevel: 5,
    description: '+15% Tốc độ di chuyển, hồi ngay 15% Môi Trường Văn Hóa, +10 Sức mạnh Xây',
    effects: {
      moveSpeedMultiplier: 1.15,
      communityPowerAdd: 15,
    },
    tags: ['build', 'speed'],
  },
];

const DEFAULT_MVP_WAVES: WaveConfig[] = [
  {
    id: 'wave_1',
    startSecond: 0,
    endSecond: 180, // 0:00 - 3:00 (Standard 2 Mobs: Clickbait & Tin Giả)
    spawns: [
      { enemyId: 'clickbait', ratePerSecond: 1.2, maxAlive: 25 },
      { enemyId: 'tinGia', ratePerSecond: 0.9, maxAlive: 20 },
    ],
    eventIds: ['scenario_sample_1'],
  },
  {
    id: 'wave_2',
    startSecond: 180,
    endSecond: 300, // 3:00 - 5:00 (2 Different Mobs: Tâm Lý Đám Đông & Bạo Lực Ngôn Từ)
    spawns: [
      { enemyId: 'tamLyDamDong', ratePerSecond: 2.2, maxAlive: 40 },
      { enemyId: 'baoLucNgonTu', ratePerSecond: 0.9, maxAlive: 18 },
    ],
    eventIds: ['scenario_sample_2'],
  },
  {
    id: 'wave_3',
    startSecond: 300,
    endSecond: 420, // 5:00 - 7:00 (2 Different Mobs: Đạo Nhái & Xuyên Tạc Văn Hóa)
    spawns: [
      { enemyId: 'daoNhai', ratePerSecond: 1.6, maxAlive: 30 },
      { enemyId: 'xuyenTacVanHoa', ratePerSecond: 0.5, maxAlive: 8 },
    ],
    eventIds: ['scenario_sample_3'],
  },
  {
    id: 'wave_4',
    startSecond: 420,
    endSecond: 600, // 7:00 - 10:00 (2 Different Mobs: Cực Đoan Mạng & Khủng Hoảng Truyền Thông)
    spawns: [
      { enemyId: 'cucDoanMang', ratePerSecond: 1.8, maxAlive: 35 },
      { enemyId: 'khungHoangTruyenThong', ratePerSecond: 0.45, maxAlive: 6 },
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
          player: { hp: 0, damageMultiplier: 1.25, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 15 },
          world: { communityDelta: 15, xpMultiplier: 1.2, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 1.0 },
          durationSeconds: 30,
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
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 10 },
          world: { communityDelta: 15, xpMultiplier: 1.1, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.8 },
          durationSeconds: 30,
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
  {
    id: 'scenario_sample_2',
    enabled: true,
    trigger: { type: 'time', value: 160 },
    title: 'Làn Sóng Công Kích Hội Đồng',
    prompt: 'Một tài khoản cá nhân đang bị đám đông vào trang cá nhân miệt thị, bêu riếu tập thể.',
    choices: [
      {
        id: 'choice_intervene',
        label: 'Lên tiếng bênh vực và kêu gọi ứng xử văn minh',
        effects: {
          player: { hp: 0, damageMultiplier: 1.15, attackSpeedMultiplier: 1.15, moveSpeedMultiplier: 1.0, shield: 20 },
          world: { communityDelta: 20, xpMultiplier: 1.15, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.85 },
          durationSeconds: 30,
        },
        feedback: 'Lòng nhân ái (Thiện) và sự kết nối rộng khắp giúp bảo vệ nạn nhân trước bạo lực mạng.',
      },
      {
        id: 'choice_join',
        label: 'Hùa theo bình luận ác ý để giải tỏa bức xúc',
        effects: {
          player: { hp: -10, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -20, xpMultiplier: 1.0, spawnEnemyType: 'baoLucNgonTu', spawnCount: 4, enemySpeedMultiplier: 1.25 },
          durationSeconds: 15,
        },
        feedback: 'Tham gia công kích khiến môi trường mạng thêm độc hại và quái bạo lực bùng phát.',
      },
    ],
    learning: {
      cores: ['daiChung'],
      values: ['thien'],
      buildFight: 'both',
      note: 'Từ chối tham gia bạo lực mạng và lan tỏa văn hóa ứng xử tử tế.',
    },
  },
  {
    id: 'scenario_sample_3',
    enabled: true,
    trigger: { type: 'time', value: 310 },
    title: 'Xuyên Tạc Di Sản Văn Hóa',
    prompt: 'Một video clip sử dụng trang phục cổ truyền bị cắt ghép phản cảm để câu view bất chấp.',
    choices: [
      {
        id: 'choice_correct',
        label: 'Đính chính lịch sử và cung cấp tư liệu nguồn chuẩn xác',
        effects: {
          player: { hp: 0, damageMultiplier: 1.25, attackSpeedMultiplier: 1.1, moveSpeedMultiplier: 1.0, shield: 25 },
          world: { communityDelta: 25, xpMultiplier: 1.2, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.9 },
          durationSeconds: 30,
        },
        feedback: 'Bảo tồn bản sắc Dân Tộc bằng Chân lý giúp đẩy lùi sự xuyên tạc văn hóa.',
      },
      {
        id: 'choice_boost',
        label: 'Thả tương tác phẫn nộ giúp thuật toán đẩy xu hướng',
        effects: {
          player: { hp: -5, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -15, xpMultiplier: 1.0, spawnEnemyType: 'xuyenTacVanHoa', spawnCount: 2, enemySpeedMultiplier: 1.1 },
          durationSeconds: 15,
        },
        feedback: 'Tương tác vô tình làm lan truyền nội dung xuyên tạc nhanh hơn.',
      },
    ],
    learning: {
      cores: ['danToc'],
      values: ['chan'],
      buildFight: 'fight',
      note: 'Bảo vệ giá trị văn hóa truyền thống bằng kiến thức chuẩn xác.',
    },
  },
  {
    id: 'scenario_sample_4',
    enabled: true,
    trigger: { type: 'time', value: 460 },
    title: 'Đạo Nhái Trắng Trợn Sản Phẩm Sáng Tạo',
    prompt: 'Tác phẩm thiết kế công phu của nghệ sĩ trẻ bị một trang lớn copy nguyên xi không xin phép.',
    choices: [
      {
        id: 'choice_support_original',
        label: 'Ủng hộ tác giả gốc và lên án hành vi sao chép cơ học',
        effects: {
          player: { hp: 0, damageMultiplier: 1.3, attackSpeedMultiplier: 1.15, moveSpeedMultiplier: 1.0, shield: 25 },
          world: { communityDelta: 25, xpMultiplier: 1.25, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.85 },
          durationSeconds: 30,
        },
        feedback: 'Tôn trọng bản sắc và sáng tạo nghệ thuật (Mỹ) là nền tảng của văn hóa số tiến bộ.',
      },
      {
        id: 'choice_ignore',
        label: 'Xem như bình thường vì trên mạng ai cũng sao chép',
        effects: {
          player: { hp: 0, damageMultiplier: 0.9, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -10, xpMultiplier: 1.0, spawnEnemyType: 'clickbait', spawnCount: 5, enemySpeedMultiplier: 1.1 },
          durationSeconds: 15,
        },
        feedback: 'Sự thờ ơ khiến không gian sáng tạo bị xâm lấn bởi các nội dung sao chép rác.',
      },
    ],
    learning: {
      cores: ['danToc'],
      values: ['my'],
      buildFight: 'build',
      note: 'Tôn trọng quyền sở hữu trí tuệ và khuyến khích sáng tạo nguyên bản.',
    },
  },
  {
    id: 'scenario_sample_5',
    enabled: true,
    trigger: { type: 'time', value: 120 },
    title: 'Video Giả Mạo Deepfake Lừa Đảo',
    prompt: 'Một video AI mạo danh chuyên gia uy tín xuất hiện, kêu gọi chuyển tiền quyên góp khẩn cấp.',
    choices: [
      {
        id: 'choice_detect_ai',
        label: 'Soi xét khẩu hình, giọng nói và báo cáo dấu hiệu giả mạo AI',
        effects: {
          player: { hp: 0, damageMultiplier: 1.25, attackSpeedMultiplier: 1.1, moveSpeedMultiplier: 1.0, shield: 25 },
          world: { communityDelta: 20, xpMultiplier: 1.2, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.9 },
          durationSeconds: 30,
        },
        feedback: 'Trang bị kiến thức Khoa Học giúp bóc trần công nghệ giả mạo tinh vi.',
      },
      {
        id: 'choice_blind_trust',
        label: 'Tin tưởng ngay vì có khuôn mặt của người nổi tiếng',
        effects: {
          player: { hp: -10, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -20, xpMultiplier: 1.0, spawnEnemyType: 'tinGia', spawnCount: 5, enemySpeedMultiplier: 1.2 },
          durationSeconds: 15,
        },
        feedback: 'Thiếu cảnh giác trước Deepfake mở đường cho các làn sóng lừa đảo công nghệ cao.',
      },
    ],
    learning: {
      cores: ['khoaHoc'],
      values: ['chan'],
      buildFight: 'both',
      note: 'Cảnh giác với video âm thanh giả mạo công nghệ cao.',
    },
  },
  {
    id: 'scenario_sample_6',
    enabled: true,
    trigger: { type: 'time', value: 250 },
    title: 'Thuật Toán Kích Động Thù Ghét (Rage-bait)',
    prompt: 'Bảng tin ngập tràn các video cắt xén bối cảnh nhằm chia rẽ cộng đồng và câu tương tác phẫn nộ.',
    choices: [
      {
        id: 'choice_unfollow_unite',
        label: 'Chọn "Không quan tâm" và chia sẻ thông điệp đoàn kết',
        effects: {
          player: { hp: 0, damageMultiplier: 1.2, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.15, shield: 20 },
          world: { communityDelta: 25, xpMultiplier: 1.15, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.85 },
          durationSeconds: 30,
        },
        feedback: 'Tinh thần Thiện lành và Đại Chúng dập tắt bẫy tương tác độc hại của thuật toán.',
      },
      {
        id: 'choice_fight_in_comments',
        label: 'Lao vào tranh luận gay gắt để xả giận',
        effects: {
          player: { hp: -5, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -15, xpMultiplier: 1.0, spawnEnemyType: 'cucDoanMang', spawnCount: 2, enemySpeedMultiplier: 1.2 },
          durationSeconds: 15,
        },
        feedback: 'Tranh cãi gay gắt càng khiến thuật toán phát tán nội dung tiêu cực rộng hơn.',
      },
    ],
    learning: {
      cores: ['danToc', 'daiChung'],
      values: ['thien'],
      buildFight: 'build',
      note: 'Không để thuật toán thao túng cảm xúc tiêu cực.',
    },
  },
  {
    id: 'scenario_sample_7',
    enabled: true,
    trigger: { type: 'time', value: 380 },
    title: 'Tin Đồn Y Tế Trị Liệu Trôi Nổi',
    prompt: 'Một công thức "chữa bách bệnh" nguy hại được lan truyền theo dạng thư dọa dẫm tâm lý.',
    choices: [
      {
        id: 'choice_medical_science',
        label: 'Đối chiếu tài liệu y khoa chính thống và khuyến cáo người thân',
        effects: {
          player: { hp: 20, damageMultiplier: 1.2, attackSpeedMultiplier: 1.15, moveSpeedMultiplier: 1.0, shield: 20 },
          world: { communityDelta: 20, xpMultiplier: 1.2, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.9 },
          durationSeconds: 30,
        },
        feedback: 'Tri thức Khoa Học chuẩn xác là liều vắc-xin bảo vệ cộng đồng số.',
      },
      {
        id: 'choice_spread_remedy',
        label: 'Lưu lại và chia sẻ vào các nhóm gia đình "để phòng bệnh"',
        effects: {
          player: { hp: -10, damageMultiplier: 0.9, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -20, xpMultiplier: 1.0, spawnEnemyType: 'tamLyDamDong', spawnCount: 4, enemySpeedMultiplier: 1.15 },
          durationSeconds: 15,
        },
        feedback: 'Tin đồn y khoa sai lệch có thể gây tổn hại trực tiếp tới sức khỏe nhiều người.',
      },
    ],
    learning: {
      cores: ['khoaHoc', 'daiChung'],
      values: ['chan'],
      buildFight: 'both',
      note: 'Chỉ tin tưởng vào các căn cứ y học đã được kiểm chứng.',
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

const DEFAULT_MVP_BOSSES: BossConfig[] = [
  {
    id: 'boss_swarm',
    name: 'CƠN BÃO TÂM LÝ ĐÁM ĐÔNG (SWARM SURGE)',
    maxHp: 750,
    speed: 100,
    testDescription: 'Thử thách: Đạn chùm (projectileCount) • Xuyên thấu (Pierce) • Tốc độ chạy (Speed)',
    mechanicType: 'swarm',
    textureKey: 'boss_3min',
    phases: [
      {
        phaseNumber: 1,
        name: 'Bầy Đàn Bùng Phát',
        hpThresholdPercent: 100,
        attackPattern: 'minionSpawn',
        attackCooldown: 3.2,
        speedMultiplier: 1.0,
        communityMeterDrainPerSecond: 0.3,
      },
    ],
  },
  {
    id: 'boss_dot',
    name: 'LƯỚI ĐỘC BẠO LỰC MẠNG & MIỆT THỊ (TOXIC ATTRITION)',
    maxHp: 1450,
    speed: 90,
    testDescription: 'Thử thách: Khiên chắn (Shield) • Hồi máu (Heal/sustain) • Sức mạnh Xây (Build Power)',
    mechanicType: 'dot',
    textureKey: 'boss_5min',
    phases: [
      {
        phaseNumber: 1,
        name: 'Độc Tính Lan Tỏa',
        hpThresholdPercent: 100,
        attackPattern: 'slowZone',
        attackCooldown: 2.4,
        speedMultiplier: 1.0,
        communityMeterDrainPerSecond: 0.6,
      },
    ],
  },
  {
    id: 'boss_shield_dash',
    name: 'ẢO ẢNH XUYÊN TẠC & ĐẠO NHÁI (PHANTOM SHIELD & DASH)',
    maxHp: 2350,
    speed: 110,
    testDescription: 'Thử thách: Sát thương cao (Damage) • Bạo kích (Crit) • Sức mạnh Chống (Fight Power)',
    mechanicType: 'shield_dash',
    textureKey: 'boss_7min',
    phases: [
      {
        phaseNumber: 1,
        name: 'Giáp Hư Vô & Lướt',
        hpThresholdPercent: 100,
        attackPattern: 'laserSweep',
        attackCooldown: 3.5,
        speedMultiplier: 1.0,
        communityMeterDrainPerSecond: 0.8,
      },
    ],
  },
  {
    id: 'boss_final',
    name: 'HIỆN THÂN LỆCH CHUẨN VĂN HÓA SỐ (CHAOS & CRISIS)',
    maxHp: 3600,
    speed: 95,
    testDescription: 'Thử thách tối hậu: Cân bằng toàn diện 8 trụ cột & Kỹ năng Tiến Hóa (Evolutions)',
    mechanicType: 'final',
    textureKey: 'boss_10min',
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
        name: 'Khủng Hoảng Toàn Diện',
        hpThresholdPercent: 30,
        attackPattern: 'minionSpawn',
        attackCooldown: 1.4,
        speedMultiplier: 1.5,
        communityMeterDrainPerSecond: 2.0,
      },
    ],
  },
];

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

  public static getBosses(): BossConfig[] {
    const bossList = (bossData as { boss?: BossConfig[] }).boss;
    return bossList && bossList.length > 0 ? bossList : DEFAULT_MVP_BOSSES;
  }

  public static getBoss(index: number = 0): BossConfig {
    const bosses = DataLoader.getBosses();
    return bosses[index] || bosses[0];
  }
}

