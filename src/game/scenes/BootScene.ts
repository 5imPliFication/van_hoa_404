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
    // 1. Player texture (Cyan cyber circle with direction marker)
    // 1. Player texture (Vibrant cyan/sapphire with crisp dark outline)
    const playerGfx = this.make.graphics({ x: 0, y: 0 });
    playerGfx.fillStyle(0x0284c7, 1);
    playerGfx.fillCircle(20, 20, 16);
    playerGfx.lineStyle(3, 0x0c4a6e, 1);
    playerGfx.strokeCircle(20, 20, 16);
    playerGfx.fillStyle(0xffffff, 1);
    playerGfx.fillTriangle(20, 8, 30, 20, 20, 14);
    playerGfx.fillStyle(0x38bdf8, 1);
    playerGfx.fillCircle(20, 20, 5);
    playerGfx.generateTexture('player', 40, 40);
    playerGfx.destroy();

    // 2. Player Bullet (Bright azure with navy stroke)
    const bulletGfx = this.make.graphics({ x: 0, y: 0 });
    bulletGfx.fillStyle(0x0ea5e9, 1);
    bulletGfx.fillCircle(8, 8, 5);
    bulletGfx.lineStyle(2, 0x0369a1, 1);
    bulletGfx.strokeCircle(8, 8, 7);
    bulletGfx.generateTexture('player_bullet', 16, 16);
    bulletGfx.destroy();

    // 3. Pierce Bullet (Golden laser beam)
    const pierceGfx = this.make.graphics({ x: 0, y: 0 });
    pierceGfx.fillStyle(0xf59e0b, 1);
    pierceGfx.fillRoundedRect(0, 4, 24, 8, 4);
    pierceGfx.lineStyle(1.5, 0x78350f, 1);
    pierceGfx.strokeRoundedRect(0, 4, 24, 8, 4);
    pierceGfx.generateTexture('player_bullet_pierce', 24, 16);
    pierceGfx.destroy();

    // 4. XP Gem (Emerald glowing diamond with dark outline)
    const gemGfx = this.make.graphics({ x: 0, y: 0 });
    gemGfx.fillStyle(0x059669, 1);
    gemGfx.beginPath();
    gemGfx.moveTo(8, 0);
    gemGfx.lineTo(16, 8);
    gemGfx.lineTo(8, 16);
    gemGfx.lineTo(0, 8);
    gemGfx.closePath();
    gemGfx.fillPath();
    gemGfx.lineStyle(1.5, 0x064e3b, 1);
    gemGfx.strokePath();
    gemGfx.generateTexture('xp_gem', 16, 16);
    gemGfx.destroy();

    // 5. Enemy: Tin Giả (Orange glitch rhombus)
    const tinGiaGfx = this.make.graphics({ x: 0, y: 0 });
    tinGiaGfx.fillStyle(0xea580c, 1);
    tinGiaGfx.beginPath();
    tinGiaGfx.moveTo(14, 0);
    tinGiaGfx.lineTo(28, 14);
    tinGiaGfx.lineTo(14, 28);
    tinGiaGfx.lineTo(0, 14);
    tinGiaGfx.closePath();
    tinGiaGfx.fillPath();
    tinGiaGfx.lineStyle(2, 0x7c2d12, 1);
    tinGiaGfx.strokePath();
    tinGiaGfx.generateTexture('enemy_tinGia', 28, 28);
    tinGiaGfx.destroy();

    // 6. Enemy: Clickbait (Sharp yellow triangle with amber stroke)
    const clickbaitGfx = this.make.graphics({ x: 0, y: 0 });
    clickbaitGfx.fillStyle(0xd97706, 1);
    clickbaitGfx.fillTriangle(24, 12, 0, 0, 4, 24);
    clickbaitGfx.lineStyle(2, 0x78350f, 1);
    clickbaitGfx.strokeTriangle(24, 12, 0, 0, 4, 24);
    clickbaitGfx.generateTexture('enemy_clickbait', 26, 26);
    clickbaitGfx.destroy();

    // 7. Enemy: Tâm Lý Đám Đông (Magenta swarm sphere)
    const swarmGfx = this.make.graphics({ x: 0, y: 0 });
    swarmGfx.fillStyle(0xdb2777, 1);
    swarmGfx.fillCircle(8, 8, 7);
    swarmGfx.lineStyle(2, 0x831843, 1);
    swarmGfx.strokeCircle(8, 8, 7);
    swarmGfx.generateTexture('enemy_tamLyDamDong', 16, 16);
    swarmGfx.destroy();

    // 8. Enemy: Bạo Lực Ngôn Từ (Dark crimson spiky orb)
    const baoLucGfx = this.make.graphics({ x: 0, y: 0 });
    baoLucGfx.fillStyle(0xdc2626, 1);
    baoLucGfx.fillCircle(16, 16, 13);
    baoLucGfx.lineStyle(3, 0x7f1d1d, 1);
    baoLucGfx.strokeCircle(16, 16, 15);
    baoLucGfx.generateTexture('enemy_baoLucNgonTu', 32, 32);
    baoLucGfx.destroy();

    // 9. Enemy: Xuyên Tạc Văn Hóa (Elite purple polygon)
    const eliteGfx = this.make.graphics({ x: 0, y: 0 });
    eliteGfx.fillStyle(0x7c3aed, 1);
    eliteGfx.fillCircle(24, 24, 18);
    eliteGfx.lineStyle(4, 0x4c1d95, 1);
    eliteGfx.strokeCircle(24, 24, 22);
    eliteGfx.fillStyle(0xffffff, 1);
    eliteGfx.fillCircle(24, 24, 8);
    eliteGfx.generateTexture('enemy_xuyenTacVanHoa', 48, 48);
    eliteGfx.destroy();

    // 10. Enemy: Đạo Nhái Sáng Tạo (Glitch duplicate cyan & magenta rhombus)
    const daoNhaiGfx = this.make.graphics({ x: 0, y: 0 });
    daoNhaiGfx.fillStyle(0x06b6d4, 0.9);
    daoNhaiGfx.fillTriangle(26, 14, 2, 2, 6, 26);
    daoNhaiGfx.fillStyle(0xec4899, 0.85);
    daoNhaiGfx.fillTriangle(22, 16, 6, 4, 10, 28);
    daoNhaiGfx.lineStyle(2, 0x0891b2, 1);
    daoNhaiGfx.strokeTriangle(26, 14, 2, 2, 6, 26);
    daoNhaiGfx.generateTexture('enemy_daoNhai', 30, 30);
    daoNhaiGfx.destroy();

    // 11. Enemy: Cực Đoan Mạng (Spiky dark scarlet berserk flame star)
    const cucDoanGfx = this.make.graphics({ x: 0, y: 0 });
    cucDoanGfx.fillStyle(0xb91c1c, 1);
    cucDoanGfx.fillCircle(18, 18, 14);
    cucDoanGfx.lineStyle(3, 0x450a0a, 1);
    cucDoanGfx.strokeCircle(18, 18, 16);
    cucDoanGfx.fillStyle(0xf97316, 1);
    cucDoanGfx.fillTriangle(18, 2, 34, 18, 18, 14);
    cucDoanGfx.fillTriangle(18, 34, 2, 18, 18, 22);
    cucDoanGfx.generateTexture('enemy_cucDoanMang', 36, 36);
    cucDoanGfx.destroy();

    // 12. Enemy: Khủng Hoảng Truyền Thông (Super-heavy obsidian tank with crimson warning runes)
    const khungHoangGfx = this.make.graphics({ x: 0, y: 0 });
    khungHoangGfx.fillStyle(0x18181b, 1);
    khungHoangGfx.fillCircle(26, 26, 22);
    khungHoangGfx.lineStyle(4, 0xdc2626, 1);
    khungHoangGfx.strokeCircle(26, 26, 24);
    khungHoangGfx.lineStyle(2, 0xfacc15, 1);
    khungHoangGfx.strokeCircle(26, 26, 15);
    khungHoangGfx.fillStyle(0xef4444, 1);
    khungHoangGfx.fillCircle(26, 26, 8);
    khungHoangGfx.generateTexture('enemy_khungHoangTruyenThong', 52, 52);
    khungHoangGfx.destroy();

    // 13. Enemy Bullet
    const eBulletGfx = this.make.graphics({ x: 0, y: 0 });
    eBulletGfx.fillStyle(0xef4444, 1);
    eBulletGfx.fillCircle(6, 6, 5);
    eBulletGfx.lineStyle(1.5, 0x991b1b, 1);
    eBulletGfx.strokeCircle(6, 6, 5);
    eBulletGfx.generateTexture('enemy_bullet', 12, 12);
    eBulletGfx.destroy();

    // 14. Boss Textures for all 4 Milestones
    // 14a. Boss Archetype: Swarm (Emerald/magenta swarm queen core)
    const b3mGfx = this.make.graphics({ x: 0, y: 0 });
    b3mGfx.fillStyle(0xdb2777, 1);
    b3mGfx.fillCircle(30, 30, 26);
    b3mGfx.lineStyle(3, 0x831843, 1);
    b3mGfx.strokeCircle(30, 30, 26);
    b3mGfx.fillStyle(0x10b981, 1);
    b3mGfx.fillCircle(30, 30, 14);
    b3mGfx.generateTexture('boss_3min', 60, 60);
    b3mGfx.generateTexture('boss_swarm', 60, 60);
    b3mGfx.destroy();

    // 14b. Boss Archetype: Toxic DOT (Toxic crimson/acid core)
    const b5mGfx = this.make.graphics({ x: 0, y: 0 });
    b5mGfx.fillStyle(0x84cc16, 0.9);
    b5mGfx.fillCircle(34, 34, 30);
    b5mGfx.lineStyle(4, 0xdc2626, 1);
    b5mGfx.strokeCircle(34, 34, 30);
    b5mGfx.fillStyle(0x15803d, 1);
    b5mGfx.fillCircle(34, 34, 16);
    b5mGfx.generateTexture('boss_5min', 68, 68);
    b5mGfx.generateTexture('boss_dot', 68, 68);
    b5mGfx.destroy();

    // 11c. Boss 7m: Ảo Ảnh Xuyên Tạc & Đạo Nhái (Phantom holographic core)
    const b7mGfx = this.make.graphics({ x: 0, y: 0 });
    b7mGfx.fillStyle(0x6366f1, 0.95);
    b7mGfx.fillCircle(36, 36, 32);
    b7mGfx.lineStyle(4, 0x06b6d4, 1);
    b7mGfx.strokeCircle(36, 36, 32);
    b7mGfx.fillStyle(0xf43f5e, 1);
    b7mGfx.fillCircle(36, 36, 15);
    b7mGfx.generateTexture('boss_7min', 72, 72);
    b7mGfx.generateTexture('boss_shield_dash', 72, 72);
    b7mGfx.destroy();

    // 14d. Boss Archetype: Final Crisis (Gigantic corrupted apex core)
    const bossGfx = this.make.graphics({ x: 0, y: 0 });
    bossGfx.fillStyle(0x3b0764, 0.95);
    bossGfx.fillCircle(42, 42, 38);
    bossGfx.lineStyle(5, 0xef4444, 1);
    bossGfx.strokeCircle(42, 42, 38);
    bossGfx.lineStyle(3, 0xf59e0b, 1);
    bossGfx.strokeCircle(42, 42, 26);
    bossGfx.fillStyle(0xdc2626, 1);
    bossGfx.fillCircle(42, 42, 14);
    bossGfx.generateTexture('boss', 84, 84);
    bossGfx.generateTexture('boss_10min', 84, 84);
    bossGfx.generateTexture('boss_final', 84, 84);
    bossGfx.destroy();

    // 11e. Tiny Swarm Runner (Boss 1 minions)
    const tinyGfx = this.make.graphics({ x: 0, y: 0 });
    tinyGfx.fillStyle(0xf43f5e, 1);
    tinyGfx.fillCircle(5, 5, 4);
    tinyGfx.lineStyle(1.5, 0x9f1239, 1);
    tinyGfx.strokeCircle(5, 5, 4);
    tinyGfx.generateTexture('tiny_swarm', 10, 10);
    tinyGfx.destroy();

    // 11f. Phantom Clone (Boss 3 illusions)
    const cloneGfx = this.make.graphics({ x: 0, y: 0 });
    cloneGfx.fillStyle(0x818cf8, 0.5);
    cloneGfx.fillCircle(24, 24, 20);
    cloneGfx.lineStyle(2, 0x38bdf8, 0.7);
    cloneGfx.strokeCircle(24, 24, 20);
    cloneGfx.generateTexture('boss_clone', 48, 48);
    cloneGfx.destroy();

    // 12. Aura Ring (Translucent ring for build aura)
    const auraGfx = this.make.graphics({ x: 0, y: 0 });
    auraGfx.lineStyle(3, 0x0284c7, 0.8);
    auraGfx.strokeCircle(64, 64, 60);
    auraGfx.fillStyle(0x0284c7, 0.15);
    auraGfx.fillCircle(64, 64, 60);
    auraGfx.generateTexture('aura_ring', 128, 128);
    auraGfx.destroy();

    // 13. Slow Zone
    const slowGfx = this.make.graphics({ x: 0, y: 0 });
    slowGfx.fillStyle(0x7c3aed, 0.25);
    slowGfx.fillCircle(40, 40, 38);
    slowGfx.lineStyle(2, 0x4c1d95, 0.6);
    slowGfx.strokeCircle(40, 40, 38);
    slowGfx.generateTexture('slow_zone', 80, 80);
    slowGfx.destroy();

    // 14. Particle Spark
    const sparkGfx = this.make.graphics({ x: 0, y: 0 });
    sparkGfx.fillStyle(0x0284c7, 1);
    sparkGfx.fillCircle(4, 4, 3);
    sparkGfx.generateTexture('spark', 8, 8);
    sparkGfx.destroy();
  }
}
