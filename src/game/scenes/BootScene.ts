import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.createProceduralTextures();
    this.scene.start('MenuScene');
  }

  private createProceduralTextures(): void {
    // 0. Soft Drop Shadow (Generic shadow for all ground entities)
    const shadowGfx = this.make.graphics({ x: 0, y: 0 });
    shadowGfx.fillStyle(0x0f172a, 0.12);
    shadowGfx.fillEllipse(16, 10, 30, 16);
    shadowGfx.fillStyle(0x0f172a, 0.22);
    shadowGfx.fillEllipse(16, 10, 22, 10);
    shadowGfx.generateTexture('drop_shadow', 32, 20);
    shadowGfx.destroy();

    // 1. Player Sprite: Cyber-Cultural Guardian Vessel (52x52)
    // Detailed sci-fi combat hull with thrusters, armor plating, and glowing cultural core
    const playerGfx = this.make.graphics({ x: 0, y: 0 });
    // Left & Right Swept Thruster Wings
    playerGfx.fillStyle(0x0369a1, 1);
    playerGfx.beginPath();
    playerGfx.moveTo(26, 18);
    playerGfx.lineTo(6, 36);
    playerGfx.lineTo(10, 42);
    playerGfx.lineTo(26, 32);
    playerGfx.closePath();
    playerGfx.fillPath();

    playerGfx.beginPath();
    playerGfx.moveTo(26, 18);
    playerGfx.lineTo(46, 36);
    playerGfx.lineTo(42, 42);
    playerGfx.lineTo(26, 32);
    playerGfx.closePath();
    playerGfx.fillPath();

    // Wing Neon Energy Trim
    playerGfx.lineStyle(2, 0x38bdf8, 1);
    playerGfx.beginPath();
    playerGfx.moveTo(6, 36);
    playerGfx.lineTo(10, 42);
    playerGfx.moveTo(46, 36);
    playerGfx.lineTo(42, 42);
    playerGfx.strokePath();

    // Twin Rear Engine Thrusters
    playerGfx.fillStyle(0x0284c7, 1);
    playerGfx.fillRoundedRect(18, 34, 5, 8, 2);
    playerGfx.fillRoundedRect(29, 34, 5, 8, 2);
    playerGfx.fillStyle(0x00f0ff, 1);
    playerGfx.fillCircle(20.5, 41, 2.5);
    playerGfx.fillCircle(31.5, 41, 2.5);

    // Main Armored Chassis
    playerGfx.fillStyle(0x0f172a, 1);
    playerGfx.lineStyle(2.5, 0x075985, 1);
    playerGfx.beginPath();
    playerGfx.moveTo(26, 6);
    playerGfx.lineTo(40, 28);
    playerGfx.lineTo(34, 38);
    playerGfx.lineTo(26, 33);
    playerGfx.lineTo(18, 38);
    playerGfx.lineTo(12, 28);
    playerGfx.closePath();
    playerGfx.fillPath();
    playerGfx.strokePath();

    // Inner Sapphire Armor Layer
    playerGfx.fillStyle(0x0284c7, 1);
    playerGfx.beginPath();
    playerGfx.moveTo(26, 10);
    playerGfx.lineTo(36, 27);
    playerGfx.lineTo(26, 30);
    playerGfx.lineTo(16, 27);
    playerGfx.closePath();
    playerGfx.fillPath();

    // Forward Dual Plasma Cannon Barrels
    playerGfx.fillStyle(0x0c4a6e, 1);
    playerGfx.fillRect(21, 6, 3, 8);
    playerGfx.fillRect(28, 6, 3, 8);
    playerGfx.fillStyle(0x38bdf8, 1);
    playerGfx.fillRect(21.5, 5, 2, 2);
    playerGfx.fillRect(28.5, 5, 2, 2);

    // Central Cultural Reactor Core (Golden Diamond with Radiant Cyan Heart)
    playerGfx.fillStyle(0xf59e0b, 1);
    playerGfx.beginPath();
    playerGfx.moveTo(26, 16);
    playerGfx.lineTo(32, 22);
    playerGfx.lineTo(26, 28);
    playerGfx.lineTo(20, 22);
    playerGfx.closePath();
    playerGfx.fillPath();

    playerGfx.fillStyle(0xffffff, 1);
    playerGfx.fillCircle(26, 22, 3.5);
    playerGfx.fillStyle(0x00f0ff, 1);
    playerGfx.fillCircle(26, 22, 2);

    // Visor Headlamp Slit
    playerGfx.lineStyle(2, 0xe0f2fe, 1);
    playerGfx.beginPath();
    playerGfx.moveTo(23, 14);
    playerGfx.lineTo(29, 14);
    playerGfx.strokePath();

    playerGfx.generateTexture('player', 52, 52);
    playerGfx.destroy();

    // 2. Player Plasma Bolt (20x20)
    const bulletGfx = this.make.graphics({ x: 0, y: 0 });
    bulletGfx.fillStyle(0x38bdf8, 0.4);
    bulletGfx.fillCircle(10, 10, 8);
    bulletGfx.fillStyle(0x0284c7, 1);
    bulletGfx.fillCircle(10, 10, 5.5);
    bulletGfx.fillStyle(0xffffff, 1);
    bulletGfx.fillCircle(10, 9, 2.8);
    bulletGfx.lineStyle(1.5, 0x0369a1, 1);
    bulletGfx.strokeCircle(10, 10, 6);
    bulletGfx.generateTexture('player_bullet', 20, 20);
    bulletGfx.destroy();

    // 3. Pierce Bullet (Golden Radiant Laser Lance - 34x18)
    const pierceGfx = this.make.graphics({ x: 0, y: 0 });
    pierceGfx.fillStyle(0xf59e0b, 0.35);
    pierceGfx.fillRoundedRect(0, 2, 34, 14, 7);
    pierceGfx.fillStyle(0xf59e0b, 1);
    pierceGfx.fillRoundedRect(4, 4, 26, 10, 5);
    pierceGfx.fillStyle(0xffffff, 1);
    pierceGfx.fillRoundedRect(8, 6, 18, 6, 3);
    pierceGfx.lineStyle(1.5, 0x78350f, 1);
    pierceGfx.strokeRoundedRect(4, 4, 26, 10, 5);
    pierceGfx.generateTexture('player_bullet_pierce', 34, 18);
    pierceGfx.destroy();

    // 4. XP Gem: Faceted Sparkling Emerald Crystal (22x22)
    const gemGfx = this.make.graphics({ x: 0, y: 0 });
    // Outer shadow / glow
    gemGfx.fillStyle(0x10b981, 0.3);
    gemGfx.fillCircle(11, 11, 9);
    // Dark facet base
    gemGfx.fillStyle(0x047857, 1);
    gemGfx.beginPath();
    gemGfx.moveTo(11, 1);
    gemGfx.lineTo(20, 11);
    gemGfx.lineTo(11, 21);
    gemGfx.lineTo(2, 11);
    gemGfx.closePath();
    gemGfx.fillPath();
    // Bright top-left facet
    gemGfx.fillStyle(0x34d399, 1);
    gemGfx.beginPath();
    gemGfx.moveTo(11, 1);
    gemGfx.lineTo(11, 11);
    gemGfx.lineTo(2, 11);
    gemGfx.closePath();
    gemGfx.fillPath();
    // Brilliant white highlight facet
    gemGfx.fillStyle(0xd1fae5, 1);
    gemGfx.beginPath();
    gemGfx.moveTo(11, 2);
    gemGfx.lineTo(11, 8);
    gemGfx.lineTo(5, 11);
    gemGfx.closePath();
    gemGfx.fillPath();
    // Inner center sparkle
    gemGfx.fillStyle(0xffffff, 1);
    gemGfx.fillCircle(11, 11, 2);
    gemGfx.lineStyle(1.5, 0x064e3b, 1);
    gemGfx.beginPath();
    gemGfx.moveTo(11, 1);
    gemGfx.lineTo(20, 11);
    gemGfx.lineTo(11, 21);
    gemGfx.lineTo(2, 11);
    gemGfx.closePath();
    gemGfx.strokePath();
    gemGfx.generateTexture('xp_gem', 22, 22);
    gemGfx.destroy();

    // 5. Enemy: Tin Giả (Corrupted Glitch Virus Rhombus - 42x42)
    const tinGiaGfx = this.make.graphics({ x: 0, y: 0 });
    // Offset cyan glitch shadow
    tinGiaGfx.fillStyle(0x06b6d4, 0.7);
    tinGiaGfx.beginPath();
    tinGiaGfx.moveTo(23, 1);
    tinGiaGfx.lineTo(41, 19);
    tinGiaGfx.lineTo(23, 37);
    tinGiaGfx.lineTo(5, 19);
    tinGiaGfx.closePath();
    tinGiaGfx.fillPath();

    // Main fiery orange rhombus
    tinGiaGfx.fillStyle(0xea580c, 1);
    tinGiaGfx.lineStyle(2.5, 0x7c2d12, 1);
    tinGiaGfx.beginPath();
    tinGiaGfx.moveTo(21, 3);
    tinGiaGfx.lineTo(39, 21);
    tinGiaGfx.lineTo(21, 39);
    tinGiaGfx.lineTo(3, 21);
    tinGiaGfx.closePath();
    tinGiaGfx.fillPath();
    tinGiaGfx.strokePath();

    // Digital scanline slits
    tinGiaGfx.fillStyle(0x431407, 0.6);
    tinGiaGfx.fillRect(11, 16, 20, 2);
    tinGiaGfx.fillRect(13, 24, 16, 2);

    // Malevolent Glitch Eye in center
    tinGiaGfx.fillStyle(0xfef08a, 1);
    tinGiaGfx.beginPath();
    tinGiaGfx.moveTo(21, 13);
    tinGiaGfx.lineTo(28, 21);
    tinGiaGfx.lineTo(21, 29);
    tinGiaGfx.lineTo(14, 21);
    tinGiaGfx.closePath();
    tinGiaGfx.fillPath();

    tinGiaGfx.fillStyle(0xdc2626, 1);
    tinGiaGfx.fillCircle(21, 21, 3.5);
    tinGiaGfx.fillStyle(0xffffff, 1);
    tinGiaGfx.fillCircle(22, 20, 1.2);

    // Detached glitch pixel bits
    tinGiaGfx.fillStyle(0x06b6d4, 1);
    tinGiaGfx.fillRect(36, 6, 3, 3);
    tinGiaGfx.fillRect(2, 33, 3, 3);
    tinGiaGfx.generateTexture('enemy_tinGia', 42, 42);
    tinGiaGfx.destroy();

    // 6. Enemy: Clickbait (Aggressive Aerodynamic Amber Delta Dart - 42x42)
    const clickbaitGfx = this.make.graphics({ x: 0, y: 0 });
    // Thruster exhaust flame
    clickbaitGfx.fillStyle(0xef4444, 0.8);
    clickbaitGfx.fillTriangle(4, 21, 12, 15, 12, 27);
    clickbaitGfx.fillStyle(0xfbbf24, 1);
    clickbaitGfx.fillTriangle(7, 21, 12, 17, 12, 25);

    // Main sharp delta arrow chassis
    clickbaitGfx.fillStyle(0xd97706, 1);
    clickbaitGfx.lineStyle(2.5, 0x451a03, 1);
    clickbaitGfx.beginPath();
    clickbaitGfx.moveTo(38, 21); // Front beak
    clickbaitGfx.lineTo(8, 5);   // Left wingtip
    clickbaitGfx.lineTo(14, 21); // Inward notch
    clickbaitGfx.lineTo(8, 37);  // Right wingtip
    clickbaitGfx.closePath();
    clickbaitGfx.fillPath();
    clickbaitGfx.strokePath();

    // Wing armor plates
    clickbaitGfx.fillStyle(0xf59e0b, 1);
    clickbaitGfx.beginPath();
    clickbaitGfx.moveTo(34, 21);
    clickbaitGfx.lineTo(13, 10);
    clickbaitGfx.lineTo(17, 21);
    clickbaitGfx.closePath();
    clickbaitGfx.fillPath();

    clickbaitGfx.beginPath();
    clickbaitGfx.moveTo(34, 21);
    clickbaitGfx.lineTo(13, 32);
    clickbaitGfx.lineTo(17, 21);
    clickbaitGfx.closePath();
    clickbaitGfx.fillPath();

    // Predatory Red Sensor Visor
    clickbaitGfx.fillStyle(0xdc2626, 1);
    clickbaitGfx.fillTriangle(27, 21, 20, 17, 20, 25);
    clickbaitGfx.fillStyle(0xffffff, 1);
    clickbaitGfx.fillCircle(24, 21, 1.8);

    clickbaitGfx.generateTexture('enemy_clickbait', 42, 42);
    clickbaitGfx.destroy();

    // 7. Enemy: Tâm Lý Đám Đông (Bioluminescent Swarm Viral Spore - 30x30)
    const swarmGfx = this.make.graphics({ x: 0, y: 0 });
    // Outer semi-translucent membrane
    swarmGfx.fillStyle(0xec4899, 0.35);
    swarmGfx.fillCircle(15, 15, 13);
    // Cellular body
    swarmGfx.fillStyle(0xdb2777, 1);
    swarmGfx.lineStyle(2, 0x831843, 1);
    swarmGfx.fillCircle(15, 15, 10);
    swarmGfx.strokeCircle(15, 15, 10);

    // Glowing multiple eyes/nuclei
    swarmGfx.fillStyle(0xffffff, 1);
    swarmGfx.fillCircle(12, 13, 3);
    swarmGfx.fillCircle(18, 14, 2.5);
    swarmGfx.fillCircle(14, 18, 2);

    swarmGfx.fillStyle(0x9d174d, 1);
    swarmGfx.fillCircle(12, 13, 1.6);
    swarmGfx.fillCircle(18, 14, 1.3);
    swarmGfx.fillCircle(14, 18, 1);

    // Micro-spores
    swarmGfx.fillStyle(0xf472b6, 1);
    swarmGfx.fillCircle(6, 9, 2);
    swarmGfx.fillCircle(24, 19, 2);
    swarmGfx.generateTexture('enemy_tamLyDamDong', 30, 30);
    swarmGfx.destroy();

    // 8. Enemy: Bạo Lực Ngôn Từ (Spiked Toxic Depth-Mine - 46x46)
    const baoLucGfx = this.make.graphics({ x: 0, y: 0 });
    // 8 radial sharp barbs
    baoLucGfx.fillStyle(0x7f1d1d, 1);
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const x1 = 23 + Math.cos(angle) * 12;
      const y1 = 23 + Math.sin(angle) * 12;
      const tipX = 23 + Math.cos(angle) * 21;
      const tipY = 23 + Math.sin(angle) * 21;
      const perpAngle = angle + Math.PI / 2;
      const bx1 = x1 + Math.cos(perpAngle) * 3.5;
      const by1 = y1 + Math.sin(perpAngle) * 3.5;
      const bx2 = x1 - Math.cos(perpAngle) * 3.5;
      const by2 = y1 - Math.sin(perpAngle) * 3.5;
      baoLucGfx.fillTriangle(tipX, tipY, bx1, by1, bx2, by2);
    }

    // Heavy spherical armor hull
    baoLucGfx.fillStyle(0xb91c1c, 1);
    baoLucGfx.lineStyle(2.5, 0x450a0a, 1);
    baoLucGfx.fillCircle(23, 23, 14);
    baoLucGfx.strokeCircle(23, 23, 14);

    // Glowing Toxic Eye Cannon
    baoLucGfx.fillStyle(0x18181b, 1);
    baoLucGfx.fillCircle(23, 23, 8);
    baoLucGfx.fillStyle(0x84cc16, 1); // Acid highlight
    baoLucGfx.fillCircle(23, 23, 6);
    baoLucGfx.fillStyle(0xfacc15, 1);
    baoLucGfx.fillCircle(23, 23, 3.5);
    baoLucGfx.fillStyle(0xffffff, 1);
    baoLucGfx.fillCircle(24, 22, 1.5);
    baoLucGfx.generateTexture('enemy_baoLucNgonTu', 46, 46);
    baoLucGfx.destroy();

    // 9. Enemy: Xuyên Tạc Văn Hóa (Corrupted Dark Monolith Golem - 58x58)
    const eliteGfx = this.make.graphics({ x: 0, y: 0 });
    // Outer floating shield plates
    eliteGfx.fillStyle(0x3b0764, 1);
    eliteGfx.fillRect(4, 24, 6, 10);
    eliteGfx.fillRect(48, 24, 6, 10);
    eliteGfx.fillRect(24, 4, 10, 6);
    eliteGfx.fillRect(24, 48, 10, 6);

    // Heavy faceted hexagonal body
    eliteGfx.fillStyle(0x581c87, 1);
    eliteGfx.lineStyle(3, 0x1e1b4b, 1);
    eliteGfx.beginPath();
    eliteGfx.moveTo(29, 8);
    eliteGfx.lineTo(47, 18);
    eliteGfx.lineTo(47, 40);
    eliteGfx.lineTo(29, 50);
    eliteGfx.lineTo(11, 40);
    eliteGfx.lineTo(11, 18);
    eliteGfx.closePath();
    eliteGfx.fillPath();
    eliteGfx.strokePath();

    // Corrupted Violet Rune Glyphs
    eliteGfx.lineStyle(2, 0xc084fc, 1);
    eliteGfx.beginPath();
    eliteGfx.moveTo(29, 14);
    eliteGfx.lineTo(29, 44);
    eliteGfx.moveTo(17, 29);
    eliteGfx.lineTo(41, 29);
    eliteGfx.strokePath();

    // Abyssal Void Eye with eerie glowing pupil
    eliteGfx.fillStyle(0x0f172a, 1);
    eliteGfx.fillCircle(29, 29, 9);
    eliteGfx.fillStyle(0xa855f7, 1);
    eliteGfx.fillCircle(29, 29, 6);
    eliteGfx.fillStyle(0xffffff, 1);
    eliteGfx.fillCircle(29, 29, 2.5);
    eliteGfx.generateTexture('enemy_xuyenTacVanHoa', 58, 58);
    eliteGfx.destroy();

    // 10. Enemy: Đạo Nhái Sáng Tạo (Chromatic Broken-Mirror Phantom - 46x46)
    const daoNhaiGfx = this.make.graphics({ x: 0, y: 0 });
    // Cyan stolen silhouette
    daoNhaiGfx.fillStyle(0x06b6d4, 0.75);
    daoNhaiGfx.beginPath();
    daoNhaiGfx.moveTo(34, 18);
    daoNhaiGfx.lineTo(8, 6);
    daoNhaiGfx.lineTo(16, 24);
    daoNhaiGfx.lineTo(8, 38);
    daoNhaiGfx.closePath();
    daoNhaiGfx.fillPath();

    // Offset Magenta counterfeit silhouette
    daoNhaiGfx.fillStyle(0xec4899, 0.85);
    daoNhaiGfx.lineStyle(2, 0x831843, 1);
    daoNhaiGfx.beginPath();
    daoNhaiGfx.moveTo(38, 22);
    daoNhaiGfx.lineTo(12, 10);
    daoNhaiGfx.lineTo(20, 28);
    daoNhaiGfx.lineTo(12, 42);
    daoNhaiGfx.closePath();
    daoNhaiGfx.fillPath();
    daoNhaiGfx.strokePath();

    // Broken mirror crack line
    daoNhaiGfx.lineStyle(2, 0xffffff, 0.9);
    daoNhaiGfx.beginPath();
    daoNhaiGfx.moveTo(14, 12);
    daoNhaiGfx.lineTo(24, 25);
    daoNhaiGfx.lineTo(36, 22);
    daoNhaiGfx.strokePath();

    // Counterfeit glowing eyes
    daoNhaiGfx.fillStyle(0xffffff, 1);
    daoNhaiGfx.fillCircle(22, 20, 2.5);
    daoNhaiGfx.fillCircle(28, 26, 2);
    daoNhaiGfx.fillStyle(0x0891b2, 1);
    daoNhaiGfx.fillCircle(22, 20, 1.2);
    daoNhaiGfx.fillStyle(0xbe185d, 1);
    daoNhaiGfx.fillCircle(28, 26, 1);
    daoNhaiGfx.generateTexture('enemy_daoNhai', 46, 46);
    daoNhaiGfx.destroy();

    // 11. Enemy: Cực Đoan Mạng (Blazing Berserk Buzzsaw Star - 48x48)
    const cucDoanGfx = this.make.graphics({ x: 0, y: 0 });
    // Fiery outer flare
    cucDoanGfx.fillStyle(0xf97316, 0.4);
    cucDoanGfx.fillCircle(24, 24, 22);

    // 8 serrated steel razor blades
    cucDoanGfx.fillStyle(0x991b1b, 1);
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      const x1 = 24 + Math.cos(a) * 10;
      const y1 = 24 + Math.sin(a) * 10;
      const tipX = 24 + Math.cos(a + 0.3) * 22;
      const tipY = 24 + Math.sin(a + 0.3) * 22;
      const x2 = 24 + Math.cos(a + 0.5) * 10;
      const y2 = 24 + Math.sin(a + 0.5) * 10;
      cucDoanGfx.fillTriangle(tipX, tipY, x1, y1, x2, y2);
    }

    // Overheated core disc
    cucDoanGfx.fillStyle(0xdc2626, 1);
    cucDoanGfx.lineStyle(2.5, 0x450a0a, 1);
    cucDoanGfx.fillCircle(24, 24, 12);
    cucDoanGfx.strokeCircle(24, 24, 12);

    // Molten white-hot reactor center
    cucDoanGfx.fillStyle(0xfef08a, 1);
    cucDoanGfx.fillCircle(24, 24, 6.5);
    cucDoanGfx.fillStyle(0xffffff, 1);
    cucDoanGfx.fillCircle(24, 24, 3);
    cucDoanGfx.generateTexture('enemy_cucDoanMang', 48, 48);
    cucDoanGfx.destroy();

    // 12. Enemy: Khủng Hoảng Truyền Thông (Crisis Heavy Siege Dreadnought - 64x64)
    const khungHoangGfx = this.make.graphics({ x: 0, y: 0 });
    // Dual Heavy Track Pontoons
    khungHoangGfx.fillStyle(0x27272a, 1);
    khungHoangGfx.lineStyle(2, 0x09090b, 1);
    khungHoangGfx.fillRoundedRect(8, 6, 12, 52, 4);
    khungHoangGfx.strokeRoundedRect(8, 6, 12, 52, 4);
    khungHoangGfx.fillRoundedRect(44, 6, 12, 52, 4);
    khungHoangGfx.strokeRoundedRect(44, 6, 12, 52, 4);

    // Track hazard treads
    khungHoangGfx.fillStyle(0xfacc15, 1);
    khungHoangGfx.fillRect(10, 16, 8, 3);
    khungHoangGfx.fillRect(10, 30, 8, 3);
    khungHoangGfx.fillRect(10, 44, 8, 3);
    khungHoangGfx.fillRect(46, 16, 8, 3);
    khungHoangGfx.fillRect(46, 30, 8, 3);
    khungHoangGfx.fillRect(46, 44, 8, 3);

    // Massive Main Armored Hull
    khungHoangGfx.fillStyle(0x18181b, 1);
    khungHoangGfx.lineStyle(3, 0xdc2626, 1);
    khungHoangGfx.fillRoundedRect(16, 12, 32, 40, 6);
    khungHoangGfx.strokeRoundedRect(16, 12, 32, 40, 6);

    // Front Twin Heavy Cannon Turrets
    khungHoangGfx.fillStyle(0x3f3f46, 1);
    khungHoangGfx.fillRect(23, 2, 5, 14);
    khungHoangGfx.fillRect(36, 2, 5, 14);
    khungHoangGfx.fillStyle(0xef4444, 1);
    khungHoangGfx.fillCircle(25.5, 2, 2.5);
    khungHoangGfx.fillCircle(38.5, 2, 2.5);

    // Pulsing Red Command Reactor
    khungHoangGfx.fillStyle(0x7f1d1d, 1);
    khungHoangGfx.fillCircle(32, 32, 10);
    khungHoangGfx.fillStyle(0xef4444, 1);
    khungHoangGfx.fillCircle(32, 32, 7);
    khungHoangGfx.fillStyle(0xffffff, 1);
    khungHoangGfx.fillCircle(32, 32, 3);
    khungHoangGfx.generateTexture('enemy_khungHoangTruyenThong', 64, 64);
    khungHoangGfx.destroy();

    // 13. Enemy Bullet (Crimson Malevolent Dart - 16x16)
    const eBulletGfx = this.make.graphics({ x: 0, y: 0 });
    eBulletGfx.fillStyle(0xef4444, 0.4);
    eBulletGfx.fillCircle(8, 8, 7);
    eBulletGfx.fillStyle(0xdc2626, 1);
    eBulletGfx.fillCircle(8, 8, 5);
    eBulletGfx.fillStyle(0xfecaca, 1);
    eBulletGfx.fillCircle(8, 7, 2);
    eBulletGfx.lineStyle(1.5, 0x7f1d1d, 1);
    eBulletGfx.strokeCircle(8, 8, 5);
    eBulletGfx.generateTexture('enemy_bullet', 16, 16);
    eBulletGfx.destroy();

    // 14. BOSS TEXTURES
    // 14a. Boss 3m: Cơn Bão Tâm Lý Đám Đông (Swarm Queen Behemoth - 80x80)
    const b3mGfx = this.make.graphics({ x: 0, y: 0 });
    b3mGfx.fillStyle(0x831843, 0.4);
    b3mGfx.fillCircle(40, 40, 38);
    // Armored Swarm Carapace
    b3mGfx.fillStyle(0xbe185d, 1);
    b3mGfx.lineStyle(3.5, 0x500724, 1);
    b3mGfx.fillCircle(40, 40, 30);
    b3mGfx.strokeCircle(40, 40, 30);
    // Emerald Egg-Cluster Sac
    b3mGfx.fillStyle(0x059669, 1);
    b3mGfx.fillCircle(40, 40, 18);
    b3mGfx.fillStyle(0x34d399, 1);
    b3mGfx.fillCircle(38, 38, 12);
    b3mGfx.fillStyle(0xffffff, 1);
    b3mGfx.fillCircle(36, 36, 4.5);
    // Mandible spikes
    b3mGfx.fillStyle(0x500724, 1);
    b3mGfx.fillTriangle(40, 4, 32, 16, 48, 16);
    b3mGfx.fillTriangle(76, 40, 64, 32, 64, 48);
    b3mGfx.fillTriangle(4, 40, 16, 32, 16, 48);
    b3mGfx.generateTexture('boss_3min', 80, 80);
    b3mGfx.generateTexture('boss_swarm', 80, 80);
    b3mGfx.destroy();

    // 14b. Boss 5m: Lưới Độc Bạo Lực Mạng (Toxic Attrition Leviathan - 88x88)
    const b5mGfx = this.make.graphics({ x: 0, y: 0 });
    b5mGfx.fillStyle(0x15803d, 0.35);
    b5mGfx.fillCircle(44, 44, 42);
    // Heavy Spiked Shell
    b5mGfx.fillStyle(0x14532d, 1);
    b5mGfx.lineStyle(4, 0x052e16, 1);
    b5mGfx.fillCircle(44, 44, 34);
    b5mGfx.strokeCircle(44, 44, 34);
    // Radioactive Boiling Core
    b5mGfx.fillStyle(0x84cc16, 1);
    b5mGfx.fillCircle(44, 44, 20);
    b5mGfx.fillStyle(0xfacc15, 1);
    b5mGfx.fillCircle(44, 44, 13);
    b5mGfx.fillStyle(0xffffff, 1);
    b5mGfx.fillCircle(42, 42, 5);
    // Biohazard Pustules
    b5mGfx.fillStyle(0xef4444, 1);
    b5mGfx.fillCircle(24, 24, 6);
    b5mGfx.fillCircle(64, 24, 6);
    b5mGfx.fillCircle(24, 64, 6);
    b5mGfx.fillCircle(64, 64, 6);
    b5mGfx.generateTexture('boss_5min', 88, 88);
    b5mGfx.generateTexture('boss_dot', 88, 88);
    b5mGfx.destroy();

    // 14c. Boss 7m: Ảo Ảnh Xuyên Tạc & Đạo Nhái (Phantom Cyber Valkyrie - 96x96)
    const b7mGfx = this.make.graphics({ x: 0, y: 0 });
    b7mGfx.fillStyle(0x38bdf8, 0.3);
    b7mGfx.fillCircle(48, 48, 46);
    // Holographic Energy Wings
    b7mGfx.fillStyle(0x06b6d4, 0.85);
    b7mGfx.fillTriangle(48, 12, 10, 48, 48, 54);
    b7mGfx.fillTriangle(48, 12, 86, 48, 48, 54);
    // Main Indigo Core Chassis
    b7mGfx.fillStyle(0x4338ca, 1);
    b7mGfx.lineStyle(3.5, 0x1e1b4b, 1);
    b7mGfx.fillCircle(48, 48, 28);
    b7mGfx.strokeCircle(48, 48, 28);
    // Radiant Holographic Heart
    b7mGfx.fillStyle(0xf43f5e, 1);
    b7mGfx.fillCircle(48, 48, 16);
    b7mGfx.fillStyle(0xffffff, 1);
    b7mGfx.fillCircle(48, 48, 7);
    b7mGfx.generateTexture('boss_7min', 96, 96);
    b7mGfx.generateTexture('boss_shield_dash', 96, 96);
    b7mGfx.destroy();

    // 14d. Boss 10m: Hiện Thân Lệch Chuẩn Văn Hóa Số (Apocalyptic Final Core - 108x108)
    const bossGfx = this.make.graphics({ x: 0, y: 0 });
    // Apocalyptic crimson aura
    bossGfx.fillStyle(0xef4444, 0.3);
    bossGfx.fillCircle(54, 54, 52);
    // Outer Obsidian Armored Crest
    bossGfx.fillStyle(0x09090b, 1);
    bossGfx.lineStyle(4, 0xdc2626, 1);
    bossGfx.fillCircle(54, 54, 42);
    bossGfx.strokeCircle(54, 54, 42);
    // Secondary Gold Ring
    bossGfx.lineStyle(2.5, 0xf59e0b, 1);
    bossGfx.strokeCircle(54, 54, 30);
    // Molten Chaos Core
    bossGfx.fillStyle(0x7f1d1d, 1);
    bossGfx.fillCircle(54, 54, 22);
    bossGfx.fillStyle(0xdc2626, 1);
    bossGfx.fillCircle(54, 54, 16);
    bossGfx.fillStyle(0xfef08a, 1);
    bossGfx.fillCircle(54, 54, 9);
    bossGfx.fillStyle(0xffffff, 1);
    bossGfx.fillCircle(54, 54, 4.5);
    // 4 Corner Doom Spikes
    bossGfx.fillStyle(0xdc2626, 1);
    bossGfx.fillTriangle(54, 2, 46, 16, 62, 16);
    bossGfx.fillTriangle(54, 106, 46, 92, 62, 92);
    bossGfx.fillTriangle(2, 54, 16, 46, 16, 62);
    bossGfx.fillTriangle(106, 54, 92, 46, 92, 62);
    bossGfx.generateTexture('boss', 108, 108);
    bossGfx.generateTexture('boss_10min', 108, 108);
    bossGfx.generateTexture('boss_final', 108, 108);
    bossGfx.destroy();

    // 15. Tiny Swarm Runner (Boss 1 minions - 16x16)
    const tinyGfx = this.make.graphics({ x: 0, y: 0 });
    tinyGfx.fillStyle(0xf43f5e, 1);
    tinyGfx.lineStyle(1.5, 0x881337, 1);
    tinyGfx.fillCircle(8, 8, 6);
    tinyGfx.strokeCircle(8, 8, 6);
    tinyGfx.fillStyle(0xffffff, 1);
    tinyGfx.fillCircle(8, 7, 2);
    tinyGfx.generateTexture('tiny_swarm', 16, 16);
    tinyGfx.destroy();

    // 16. Phantom Clone (Boss 3 illusion - 64x64)
    const cloneGfx = this.make.graphics({ x: 0, y: 0 });
    cloneGfx.fillStyle(0x818cf8, 0.4);
    cloneGfx.fillCircle(32, 32, 28);
    cloneGfx.lineStyle(2, 0x38bdf8, 0.8);
    cloneGfx.strokeCircle(32, 32, 28);
    cloneGfx.fillStyle(0xffffff, 0.6);
    cloneGfx.fillCircle(32, 32, 12);
    cloneGfx.generateTexture('boss_clone', 64, 64);
    cloneGfx.destroy();

    // 17. Cultural Aura Ring (High-fidelity glowing energy perimeter - 160x160)
    const auraGfx = this.make.graphics({ x: 0, y: 0 });
    auraGfx.fillStyle(0x0284c7, 0.08);
    auraGfx.fillCircle(80, 80, 76);
    auraGfx.lineStyle(2.5, 0x0284c7, 0.7);
    auraGfx.strokeCircle(80, 80, 76);
    auraGfx.lineStyle(1.5, 0x38bdf8, 0.9);
    auraGfx.strokeCircle(80, 80, 72);
    auraGfx.generateTexture('aura_ring', 160, 160);
    auraGfx.destroy();

    // 18. Slow Zone (100x100)
    const slowGfx = this.make.graphics({ x: 0, y: 0 });
    slowGfx.fillStyle(0x7c3aed, 0.2);
    slowGfx.fillCircle(50, 50, 48);
    slowGfx.lineStyle(2, 0x6d28d9, 0.7);
    slowGfx.strokeCircle(50, 50, 48);
    slowGfx.generateTexture('slow_zone', 100, 100);
    slowGfx.destroy();

    // 19. Spark Particle (10x10)
    const sparkGfx = this.make.graphics({ x: 0, y: 0 });
    sparkGfx.fillStyle(0x00f0ff, 1);
    sparkGfx.fillCircle(5, 5, 4);
    sparkGfx.fillStyle(0xffffff, 1);
    sparkGfx.fillCircle(5, 5, 2);
    sparkGfx.generateTexture('spark', 10, 10);
    sparkGfx.destroy();
  }
}
