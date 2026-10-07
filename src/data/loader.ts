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
  CharacterClassConfig,
  ComboConfig,
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
      damage: 3,
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
      damage: 4,
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
      damage: 6,
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
      damage: 8,
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
      damage: 10,
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
      damage: 14,
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
      damage: 18,
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
      damage: 24,
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
    description: '+1 đòn đánh (tia đạn / sóng dư chấn / nhịp trống tùy vai trò), +10 Sức mạnh Chống',
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
  // Each scenario has one choice that reflects the lesson (aligned); the others are well-meant or
  // reasonable-sounding but fall short, so players have to think rather than spot the villain.
  {
    id: 'scenario_sample_1',
    enabled: true,
    trigger: { type: 'time', value: 45 },
    title: 'Ảnh Chụp Màn Hình Không Nguồn',
    prompt: 'Nhóm lớp đang lan truyền ảnh chụp màn hình: “Trường cho nghỉ học cả tuần vì dịch cúm”. Không ghi nguồn, nhưng ai cũng đang bàn tán và hỏi nhau.',
    choices: [
      {
        id: 'choice_verify',
        label: 'Tra thông báo chính thức của trường rồi gửi link vào nhóm',
        aligned: true,
        effects: {
          player: { hp: 0, damageMultiplier: 1.25, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 15 },
          world: { communityDelta: 15, xpMultiplier: 1.2, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.9 },
          durationSeconds: 30,
        },
        feedback: 'Bạn gửi link thông báo của trường, cả nhóm thôi hoang mang chỉ sau vài phút.',
      },
      {
        id: 'choice_forward_warn',
        label: 'Chuyển tiếp kèm dòng “chưa rõ thật giả, mọi người cẩn thận nhé”',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -10, xpMultiplier: 1.0, spawnEnemyType: 'tinGia', spawnCount: 4, enemySpeedMultiplier: 1.1 },
          durationSeconds: 15,
        },
        feedback: 'Dòng “chưa rõ thật giả” bị cắt mất ở lượt chia sẻ tiếp theo — tin đồn vẫn lan đi.',
      },
      {
        id: 'choice_wait',
        label: 'Không chia sẻ gì, chờ xem có ai trong nhóm xác nhận không',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -5, xpMultiplier: 1.0, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 1.0 },
          durationSeconds: 0,
        },
        feedback: 'Bạn không lan truyền thêm, nhưng cả nhóm vẫn hoang mang vì không ai đứng ra đính chính.',
      },
    ],
    learning: {
      cores: ['khoaHoc', 'daiChung'],
      values: ['chan'],
      buildFight: 'both',
      note: 'Kiểm chứng tại nguồn chính thức rồi mới chia sẻ — và khi chia sẻ thì kèm nguồn.',
    },
  },
  {
    id: 'scenario_sample_2',
    enabled: true,
    trigger: { type: 'time', value: 160 },
    title: 'Clip Nóng Về Bạn Cùng Trường',
    prompt: 'Một bạn cùng trường bị quay lén lúc cãi nhau với tài xế xe công nghệ. Clip lên xu hướng, bình luận bắt đầu tìm ra tên và trang cá nhân của bạn ấy.',
    choices: [
      {
        id: 'choice_protect',
        label: 'Nhắn hỏi thăm bạn ấy và báo cáo bình luận lộ thông tin cá nhân',
        aligned: true,
        effects: {
          player: { hp: 0, damageMultiplier: 1.15, attackSpeedMultiplier: 1.15, moveSpeedMultiplier: 1.0, shield: 20 },
          world: { communityDelta: 20, xpMultiplier: 1.15, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.85 },
          durationSeconds: 30,
        },
        feedback: 'Các bình luận lộ thông tin bị gỡ, và bạn ấy biết mình không đơn độc.',
      },
      {
        id: 'choice_balanced_comment',
        label: 'Bình luận phân tích cho công bằng: cả hai bên đều có phần sai',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -5, xpMultiplier: 1.0, spawnEnemyType: 'baoLucNgonTu', spawnCount: 2, enemySpeedMultiplier: 1.1 },
          durationSeconds: 15,
        },
        feedback: 'Dù lời lẽ ôn hòa, mỗi bình luận vẫn đẩy clip lên cao hơn và kéo thêm người vào cuộc.',
      },
      {
        id: 'choice_share_lesson',
        label: 'Chia sẻ clip kèm lời nhắc “bài học về cư xử nơi công cộng”',
        aligned: false,
        effects: {
          player: { hp: -5, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -15, xpMultiplier: 1.0, spawnEnemyType: 'baoLucNgonTu', spawnCount: 4, enemySpeedMultiplier: 1.2 },
          durationSeconds: 15,
        },
        feedback: 'Một lời “nhắc nhở” công khai biến phút nóng giận của một người thành án phạt kéo dài.',
      },
    ],
    learning: {
      cores: ['daiChung'],
      values: ['thien'],
      buildFight: 'both',
      note: 'Bảo vệ con người trước, phán xét sau — đừng góp tay biến ai đó thành mục tiêu.',
    },
  },
  {
    id: 'scenario_sample_3',
    enabled: true,
    trigger: { type: 'time', value: 310 },
    title: '“Sự Thật Bị Giấu Kín” Về Lễ Hội',
    prompt: 'Một kênh triệu lượt xem đăng video “sự thật bị giấu kín” về một lễ hội truyền thống, thêm thắt chuyện mê tín rùng rợn. Nhiều người nước ngoài bình luận tin là thật.',
    choices: [
      {
        id: 'choice_explain',
        label: 'Làm video ngắn kể nguồn gốc lễ hội, dẫn tư liệu bảo tàng',
        aligned: true,
        effects: {
          player: { hp: 0, damageMultiplier: 1.25, attackSpeedMultiplier: 1.1, moveSpeedMultiplier: 1.0, shield: 25 },
          world: { communityDelta: 25, xpMultiplier: 1.2, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.9 },
          durationSeconds: 30,
        },
        feedback: 'Video của bạn được chia sẻ kèm nguồn tư liệu, phần bình luận bắt đầu đổi chiều.',
      },
      {
        id: 'choice_argue',
        label: 'Vào phần bình luận tranh luận với kênh đó cho ra lẽ',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -10, xpMultiplier: 1.0, spawnEnemyType: 'xuyenTacVanHoa', spawnCount: 1, enemySpeedMultiplier: 1.1 },
          durationSeconds: 15,
        },
        feedback: 'Nghìn bình luận cãi nhau khiến thuật toán coi video là “hấp dẫn” và đề xuất cho nhiều người hơn.',
      },
      {
        id: 'choice_ignore_heritage',
        label: 'Bỏ qua — ai hiểu văn hóa mình thì tự biết, không cần giải thích',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -10, xpMultiplier: 1.0, spawnEnemyType: 'xuyenTacVanHoa', spawnCount: 2, enemySpeedMultiplier: 1.0 },
          durationSeconds: 0,
        },
        feedback: 'Khi người hiểu chuyện im lặng, phiên bản sai trở thành phiên bản duy nhất người khác được nghe.',
      },
    ],
    learning: {
      cores: ['danToc', 'khoaHoc'],
      values: ['chan'],
      buildFight: 'fight',
      note: 'Giữ gìn bản sắc bằng hiểu biết chính xác và cách kể hấp dẫn, không phải bằng cãi vã.',
    },
  },
  {
    id: 'scenario_sample_4',
    enabled: true,
    trigger: { type: 'time', value: 460 },
    title: 'Poster Cho Đêm Văn Nghệ',
    prompt: 'CLB cần gấp poster cho đêm văn nghệ. Có người đề xuất dùng luôn bộ tranh áo dài rất đẹp của một họa sĩ trẻ đang được chia sẻ nhiều trên mạng.',
    choices: [
      {
        id: 'choice_ask_artist',
        label: 'Xin phép họa sĩ, ghi tên tác giả — không được thì tự vẽ',
        aligned: true,
        effects: {
          player: { hp: 0, damageMultiplier: 1.3, attackSpeedMultiplier: 1.15, moveSpeedMultiplier: 1.0, shield: 25 },
          world: { communityDelta: 25, xpMultiplier: 1.25, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.85 },
          durationSeconds: 30,
        },
        feedback: 'Họa sĩ đồng ý và còn chia sẻ lại poster — đêm văn nghệ có thêm khán giả mới.',
      },
      {
        id: 'choice_credit_collected',
        label: 'Dùng tạm, ghi “Ảnh: sưu tầm” ở góc poster cho đúng mực',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -10, xpMultiplier: 1.0, spawnEnemyType: 'daoNhai', spawnCount: 3, enemySpeedMultiplier: 1.1 },
          durationSeconds: 15,
        },
        feedback: '“Sưu tầm” không phải là xin phép — tác giả vẫn mất đi công sức và cả cái tên của mình.',
      },
      {
        id: 'choice_nonprofit',
        label: 'Dùng luôn, vì đây là sự kiện của trường, không kiếm lợi nhuận',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 0.9, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -15, xpMultiplier: 1.0, spawnEnemyType: 'daoNhai', spawnCount: 4, enemySpeedMultiplier: 1.0 },
          durationSeconds: 15,
        },
        feedback: 'Không kiếm tiền không làm tác phẩm bớt là của người khác.',
      },
    ],
    learning: {
      cores: ['danToc'],
      values: ['my'],
      buildFight: 'build',
      note: 'Tôn trọng người sáng tạo: xin phép, ghi đúng tác giả, hoặc tự sáng tạo.',
    },
  },
  {
    id: 'scenario_sample_5',
    enabled: true,
    trigger: { type: 'time', value: 120 },
    title: 'Lời Kêu Gọi Quyên Góp Khẩn Cấp',
    prompt: 'Video một MC quen thuộc kêu gọi quyên góp gấp cho vùng lũ, kèm số tài khoản cá nhân. Giọng nói và khuôn mặt giống hệt, đã có hàng nghìn lượt chia sẻ.',
    choices: [
      {
        id: 'choice_check_channel',
        label: 'Vào kênh chính thức của MC xem có lời kêu gọi này không',
        aligned: true,
        effects: {
          player: { hp: 0, damageMultiplier: 1.25, attackSpeedMultiplier: 1.1, moveSpeedMultiplier: 1.0, shield: 25 },
          world: { communityDelta: 20, xpMultiplier: 1.2, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.9 },
          durationSeconds: 30,
        },
        feedback: 'Kênh chính thức không hề có lời kêu gọi đó — bạn vừa chặn một vụ lừa đảo trước khi nó lan rộng.',
      },
      {
        id: 'choice_small_donation',
        label: 'Chuyển ít thôi — thật thì giúp được người, giả cũng chẳng mất bao',
        aligned: false,
        effects: {
          player: { hp: -8, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -15, xpMultiplier: 1.0, spawnEnemyType: 'tinGia', spawnCount: 5, enemySpeedMultiplier: 1.2 },
          durationSeconds: 15,
        },
        feedback: 'Nhiều khoản “nhỏ thôi” cộng lại thành nguồn sống cho đường dây lừa đảo.',
      },
      {
        id: 'choice_call_deepfake',
        label: 'Bình luận ngay “video này là deepfake” để mọi người khỏi bị lừa',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: 0, xpMultiplier: 1.0, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 1.0 },
          durationSeconds: 0,
        },
        feedback: 'Cảnh báo có ích, nhưng khẳng định khi chưa kiểm tra cũng là một tin chưa kiểm chứng.',
      },
    ],
    learning: {
      cores: ['khoaHoc'],
      values: ['chan'],
      buildFight: 'fight',
      note: 'Giống thật chưa chắc là thật: đối chiếu với kênh chính thức trước khi tin — hay khẳng định.',
    },
  },
  {
    id: 'scenario_sample_6',
    enabled: true,
    trigger: { type: 'time', value: 250 },
    title: 'Bảng Tin Toàn Chuyện Vùng Miền',
    prompt: 'Bảng tin liên tục đề xuất video cắt ghép “người vùng này chê người vùng kia”. Video nào cũng có hàng chục nghìn bình luận đang cãi nhau gay gắt.',
    choices: [
      {
        id: 'choice_find_source',
        label: 'Tìm bản gốc đầy đủ, rồi chọn “Không quan tâm” với kênh cắt ghép',
        aligned: true,
        effects: {
          player: { hp: 0, damageMultiplier: 1.2, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.15, shield: 20 },
          world: { communityDelta: 25, xpMultiplier: 1.15, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.85 },
          durationSeconds: 30,
        },
        feedback: 'Bản gốc cho thấy câu nói bị cắt khỏi bối cảnh; bảng tin của bạn dần vắng nội dung chia rẽ.',
      },
      {
        id: 'choice_call_calm',
        label: 'Bình luận kêu gọi mọi người bình tĩnh, đừng phân biệt vùng miền',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -5, xpMultiplier: 1.0, spawnEnemyType: 'cucDoanMang', spawnCount: 1, enemySpeedMultiplier: 1.1 },
          durationSeconds: 15,
        },
        feedback: 'Lời kêu gọi tử tế lọt thỏm giữa nghìn bình luận, còn video thì nhận thêm một lượt tương tác.',
      },
      {
        id: 'choice_share_to_expose',
        label: 'Chia sẻ để mọi người thấy có người suy nghĩ lệch lạc đến mức nào',
        aligned: false,
        effects: {
          player: { hp: -5, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -15, xpMultiplier: 1.0, spawnEnemyType: 'cucDoanMang', spawnCount: 2, enemySpeedMultiplier: 1.2 },
          durationSeconds: 15,
        },
        feedback: 'Chia sẻ để phản đối vẫn là chia sẻ — nội dung chia rẽ lại đến thêm hàng trăm người.',
      },
    ],
    learning: {
      cores: ['khoaHoc', 'daiChung'],
      values: ['thien'],
      buildFight: 'fight',
      note: 'Phẫn nộ là thứ thuật toán cần: kiểm tra bối cảnh, đừng nuôi nội dung chia rẽ bằng tương tác.',
    },
  },
  {
    id: 'scenario_sample_7',
    enabled: true,
    trigger: { type: 'time', value: 380 },
    title: 'Bài Thuốc Trong Nhóm Gia Đình',
    prompt: 'Nhóm gia đình chia sẻ bài “uống nước lá mỗi sáng thay thuốc huyết áp”, kèm ảnh một người mặc áo blouse trắng. Bà bạn định ngưng thuốc vài hôm để thử.',
    choices: [
      {
        id: 'choice_ask_doctor',
        label: 'Gọi cho bà, cùng bà hỏi lại bác sĩ đang điều trị',
        aligned: true,
        effects: {
          player: { hp: 20, damageMultiplier: 1.2, attackSpeedMultiplier: 1.15, moveSpeedMultiplier: 1.0, shield: 20 },
          world: { communityDelta: 20, xpMultiplier: 1.2, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.9 },
          durationSeconds: 30,
        },
        feedback: 'Bác sĩ giải thích cặn kẽ, và chính bà kể lại chuyện đó cho cả nhóm gia đình.',
      },
      {
        id: 'choice_post_debunk',
        label: 'Gửi vào nhóm bài báo bác bỏ, kèm lời “đừng tin mấy cái này”',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -5, xpMultiplier: 1.0, spawnEnemyType: 'tamLyDamDong', spawnCount: 2, enemySpeedMultiplier: 1.1 },
          durationSeconds: 15,
        },
        feedback: 'Thông tin đúng, nhưng giọng chê bai khiến cả nhóm phật ý — và bài kia vẫn được chia sẻ tiếp.',
      },
      {
        id: 'choice_let_try',
        label: 'Để bà thử vài hôm, lá cây tự nhiên chắc cũng không hại gì',
        aligned: false,
        effects: {
          player: { hp: -10, damageMultiplier: 0.9, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -15, xpMultiplier: 1.0, spawnEnemyType: 'tamLyDamDong', spawnCount: 4, enemySpeedMultiplier: 1.15 },
          durationSeconds: 15,
        },
        feedback: '“Tự nhiên” không có nghĩa là an toàn — ngưng thuốc đột ngột mới là rủi ro thật.',
      },
    ],
    learning: {
      cores: ['khoaHoc', 'daiChung'],
      values: ['chan'],
      buildFight: 'both',
      note: 'Với sức khỏe, hãy hỏi người có chuyên môn — và nói với người thân bằng sự quan tâm, không phải chê bai.',
    },
  },
  {
    id: 'scenario_sample_8',
    enabled: true,
    trigger: { type: 'time', value: 200 },
    title: 'Tuần Lễ Văn Hóa Của Trường',
    prompt: 'Trường tổ chức tuần lễ văn hóa. Lớp bạn tranh luận: dựng gian Halloween theo trào lưu, hay làm gian “thuần Việt”, không pha chút yếu tố nước ngoài nào?',
    choices: [
      {
        id: 'choice_blend',
        label: 'Mượn kiểu hóa trang Halloween để kể truyện dân gian Việt',
        aligned: true,
        effects: {
          player: { hp: 0, damageMultiplier: 1.25, attackSpeedMultiplier: 1.1, moveSpeedMultiplier: 1.0, shield: 20 },
          world: { communityDelta: 20, xpMultiplier: 1.2, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.9 },
          durationSeconds: 30,
        },
        feedback: 'Gian hàng vừa vui vừa lạ, nhiều bạn lần đầu được nghe trọn vẹn một truyện dân gian Việt.',
      },
      {
        id: 'choice_copy_trend',
        label: 'Làm Halloween giống hệt trên mạng — đang hot, chắc đông khách',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -10, xpMultiplier: 1.0, spawnEnemyType: 'daoNhai', spawnCount: 3, enemySpeedMultiplier: 1.1 },
          durationSeconds: 15,
        },
        feedback: 'Gian hàng đông, nhưng giống hệt hàng trăm gian khác — không ai nhớ lớp bạn đã kể điều gì.',
      },
      {
        id: 'choice_pure_only',
        label: 'Chỉ dùng yếu tố truyền thống, gạt bỏ mọi thứ từ nước ngoài',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: 0, xpMultiplier: 1.0, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 1.0 },
          durationSeconds: 0,
        },
        feedback: 'Bản sắc được giữ, nhưng khép cửa với cái hay bên ngoài khiến gian hàng kém sức hút với chính bạn trẻ.',
      },
    ],
    learning: {
      cores: ['danToc'],
      values: ['my'],
      buildFight: 'build',
      note: 'Lấy văn hóa dân tộc làm gốc, có cái gì hay thì học lấy — không sao chép, cũng không khép cửa.',
    },
  },
  {
    id: 'scenario_sample_9',
    enabled: true,
    trigger: { type: 'time', value: 420 },
    title: 'Bài Tuyên Truyền Không Ai Đọc',
    prompt: 'CLB được giao làm nội dung về an toàn mạng cho học sinh cấp 2. Bản nháp hiện là một bài dài hai nghìn chữ, đầy thuật ngữ chuyên môn.',
    choices: [
      {
        id: 'choice_ask_audience',
        label: 'Hỏi các em hay gặp chuyện gì trên mạng, rồi làm truyện tranh ngắn',
        aligned: true,
        effects: {
          player: { hp: 0, damageMultiplier: 1.2, attackSpeedMultiplier: 1.15, moveSpeedMultiplier: 1.0, shield: 20 },
          world: { communityDelta: 20, xpMultiplier: 1.25, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 0.9 },
          durationSeconds: 30,
        },
        feedback: 'Loạt truyện tranh được các em chuyền tay nhau đọc, vì đó là chuyện của chính các em.',
      },
      {
        id: 'choice_add_effects',
        label: 'Giữ nội dung, thêm thật nhiều hiệu ứng và nhạc trend cho bắt mắt',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: -5, xpMultiplier: 1.0, spawnEnemyType: 'clickbait', spawnCount: 4, enemySpeedMultiplier: 1.1 },
          durationSeconds: 15,
        },
        feedback: 'Video nhiều lượt xem, nhưng các em nhớ điệu nhạc chứ không nhớ thông điệp.',
      },
      {
        id: 'choice_post_full',
        label: 'Đăng nguyên bài — đầy đủ và chính xác mới là quan trọng nhất',
        aligned: false,
        effects: {
          player: { hp: 0, damageMultiplier: 1.0, attackSpeedMultiplier: 1.0, moveSpeedMultiplier: 1.0, shield: 0 },
          world: { communityDelta: 0, xpMultiplier: 1.0, spawnEnemyType: null, spawnCount: 0, enemySpeedMultiplier: 1.0 },
          durationSeconds: 0,
        },
        feedback: 'Bài viết đúng nhưng không đến được với người cần đọc: gần như không em nào đọc hết.',
      },
    ],
    learning: {
      cores: ['daiChung'],
      values: ['my'],
      buildFight: 'build',
      note: 'Làm văn hóa phải hỏi “viết cho ai?” — từ trong quần chúng ra, về sâu trong quần chúng.',
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
    maxHp: 2500,
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
    maxHp: 5500,
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
    maxHp: 10000,
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
    maxHp: 18000,
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

export const DEFAULT_MVP_CLASSES: CharacterClassConfig[] = [
  {
    id: 'nguoiKiemChung',
    name: 'Người Kiểm Chứng',
    title: 'Thiện Xạ Chân Lý',
    badgeIcon: '🔍',
    themeColor: 0x0284c7,
    themeHex: '#0284c7',
    roleDescription: 'Chuyên gia thẩm định thông tin số. Phong cách tấn công tầm xa chính xác, tốc độ đạn cao và dồn sát thương mục tiêu đơn.',
    startingWeapon: 'sniper',
    startingWeaponName: 'Tia Sáng Kiểm Chứng',
    startingWeaponDesc: 'Bắn tia năng lượng chính xác cao khóa mục tiêu gần nhất. Tầm bắn xa, bạo kích cao. Nâng Chống để bắn thêm tia.',
    startingStats: {
      projectileSpeed: 520,
      critChance: 0.12,
      damage: 18,
    },
    startingValues: {
      khoaHoc: 1,
      chan: 1,
    },
    affinity: ['khoaHoc', 'chan'],
    passive: {
      name: 'Dán Nhãn Xác Minh',
      description: 'Kẻ địch trúng 3 phát bắn liên tiếp sẽ bị dán nhãn ĐÃ XÁC MINH, nhận thêm 30% sát thương từ mọi đòn tấn công.',
      effectType: 'mark_verified',
    },
  },
  {
    id: 'nguoiKienTao',
    name: 'Người Kiến Tạo',
    title: 'Kiểm Soát Vùng Tích Cực',
    badgeIcon: '🌐',
    themeColor: 0x16a34a,
    themeHex: '#16a34a',
    roleDescription: 'Người xây dựng chuẩn mực văn hóa số. Phát tỏa xung lực bảo vệ diện rộng, dọn dẹp quái bầy đàn và duy trì sinh khí cộng đồng.',
    startingWeapon: 'pulse',
    startingWeaponName: 'Xung Lực Văn Hóa',
    startingWeaponDesc: 'Phát tỏa làn sóng năng lượng định kỳ quanh thân, đẩy lùi và gây sát thương mọi quái vật xung quanh. Nâng Chống để thêm sóng dư chấn.',
    startingStats: {
      damage: 14,
      attackSpeed: 1.0,
      moveSpeed: 235,
    },
    startingValues: {
      daiChung: 1,
      thien: 1,
      build: 1,
    },
    affinity: ['daiChung', 'thien', 'build'],
    passive: {
      name: 'Sinh Khí Cộng Đồng',
      description: 'Đứng trong vùng sóng tích cực do bản thân tạo ra tự động hồi phục 0.6% Môi Trường Văn Hóa mỗi giây.',
      effectType: 'community_resonance',
    },
  },
  {
    id: 'nguoiGinGiu',
    name: 'Người Gìn Giữ',
    title: 'Hộ Vệ Bản Sắc',
    badgeIcon: '🛡️',
    themeColor: 0xd97706,
    themeHex: '#d97706',
    roleDescription: 'Pháo đài bảo vệ di sản văn hóa. Sinh lực và khiên vượt trội, đáp trả bằng tiếng trống đồng: sóng âm vang xa, đẩy lùi kẻ địch và dập tắt lời xuyên tạc.',
    startingWeapon: 'drum',
    startingWeaponName: 'Trống Đồng Âm Vang',
    startingWeaponDesc: 'Gõ trống đồng: sóng âm hình nón lan về phía kẻ địch gần nhất, gây sát thương, đẩy lùi và dập tắt đạn địch trên đường lan. Chống thêm nhịp trống, Dân tộc mở rộng sóng âm.',
    startingStats: {
      maxHp: 130,
      hp: 130,
      shield: 35,
      moveSpeed: 225,
    },
    startingValues: {
      danToc: 1,
      my: 1,
    },
    affinity: ['danToc', 'my', 'thien'],
    passive: {
      name: 'Bảo Hộ Bản Sắc',
      description: 'Mỗi 8 giây tự động tái tạo một lớp khiên hộ mệnh, hấp thụ sát thương và triệt tiêu giật lùi.',
      effectType: 'identity_aegis',
    },
  },
];

export const DEFAULT_MVP_COMBOS: ComboConfig[] = [
  {
    id: 'khienThongTin',
    name: 'Khiên Thông Tin',
    formula: 'Chân (Cấp 4) + Thiện (Cấp 4)',
    description: '3 mảnh khiên dữ liệu xoay quanh người chơi, cản phá toàn bộ đạn địch và phản xạ sát thương.',
    requirements: [
      { pillar: 'chan', level: 4 },
      { pillar: 'thien', level: 4 },
    ],
    effects: {
      orbitingShields: true,
      shieldCount: 3,
    },
  },
  {
    id: 'kiemChung',
    name: 'Kiểm Chứng',
    formula: 'Khoa Học (Cấp 4) + Chân (Cấp 4)',
    description: 'Đạn xuyên thấu mọi mục tiêu, tăng 50% sát thương lên Tin Giả và 100% bạo kích lên mục tiêu Đã Xác Minh.',
    classOnly: 'nguoiKiemChung',
    requirements: [
      { pillar: 'khoaHoc', level: 4 },
      { pillar: 'chan', level: 4 },
    ],
    effects: {
      projectilePierce: true,
      bonusVsEnemyType: 'tinGia',
      bonusDamageMultiplier: 1.5,
      critOnMarked: true,
    },
  },
  {
    id: 'vanHoaUngXu',
    name: 'Văn Hóa Ứng Xử',
    formula: 'Đại Chúng (Cấp 4) + Thiện (Cấp 4)',
    description: 'Vùng hào quang rộng lớn làm chậm quái vật 35%, liên tục hồi 4 HP mỗi 5s và củng cố Community Meter.',
    requirements: [
      { pillar: 'daiChung', level: 4 },
      { pillar: 'thien', level: 4 },
    ],
    effects: {
      slowAuraRadius: 220,
      slowPercent: 0.35,
      auraHealPerInterval: 4,
      communityMeterBuffPerInterval: 0.8,
    },
  },
  {
    id: 'banSacSangTao',
    name: 'Bản Sắc Sáng Tạo',
    formula: 'Dân Tộc (Cấp 4) + Mỹ (Cấp 4)',
    description: 'Sóng xung kích năng lượng định kỳ đánh tan các nội dung sao chép máy móc, tăng 35% sát thương toàn diện.',
    requirements: [
      { pillar: 'danToc', level: 4 },
      { pillar: 'my', level: 4 },
    ],
    effects: {
      shockwavePulse: true,
      shockwaveCooldown: 2.5,
      damageMultiplier: 1.35,
    },
  },
  {
    id: 'matTranVanHoa',
    name: 'Mặt Trận Văn Hóa',
    formula: 'Xây (Cấp 3) + Chống (Cấp 3)',
    description: 'Xây đi đôi với Chống: +30% sát thương, hồi ngay 25% Môi Trường và tăng sức thanh lọc môi trường.',
    requirements: [
      { pillar: 'build', level: 3 },
      { pillar: 'fight', level: 3 },
    ],
    quote: '“Văn hóa là một mặt trận.” — Nghị quyết Trung ương 5 khóa VIII',
    effects: {
      damageMultiplier: 1.3,
      communityRestore: 25,
      buildPowerAdd: 10,
    },
  },
];

export class DataLoader {
  public static getClasses(): CharacterClassConfig[] {
    return DEFAULT_MVP_CLASSES;
  }

  public static getClassById(id: string): CharacterClassConfig {
    const list = DataLoader.getClasses();
    return list.find(c => c.id === id) || list[0];
  }

  public static getCombos(): ComboConfig[] {
    return DEFAULT_MVP_COMBOS;
  }

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

