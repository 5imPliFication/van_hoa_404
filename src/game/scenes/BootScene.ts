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
    const playerGfx = this.make.graphics({ x: 0, y: 0 });
    playerGfx.lineStyle(3, 0x00f0ff, 1);
    playerGfx.fillStyle(0x003b46, 0.9);
    playerGfx.fillCircle(20, 20, 16);
    playerGfx.strokeCircle(20, 20, 16);
    playerGfx.fillStyle(0x00f0ff, 1);
    playerGfx.fillTriangle(20, 8, 30, 20, 20, 14);
    playerGfx.fillCircle(20, 20, 5);
    playerGfx.generateTexture('player', 40, 40);
    playerGfx.destroy();

    // 2. Player Bullet (Neon cyan glow)
    const bulletGfx = this.make.graphics({ x: 0, y: 0 });
    bulletGfx.fillStyle(0xffffff, 1);
    bulletGfx.fillCircle(8, 8, 5);
    bulletGfx.lineStyle(2, 0x00f0ff, 1);
    bulletGfx.strokeCircle(8, 8, 7);
    bulletGfx.generateTexture('player_bullet', 16, 16);
    bulletGfx.destroy();

    // 3. Pierce Bullet (Golden laser beam)
    const pierceGfx = this.make.graphics({ x: 0, y: 0 });
    pierceGfx.fillStyle(0xffd700, 1);
    pierceGfx.fillRoundedRect(0, 4, 24, 8, 4);
    pierceGfx.lineStyle(1, 0xffffff, 1);
    pierceGfx.strokeRoundedRect(0, 4, 24, 8, 4);
    pierceGfx.generateTexture('player_bullet_pierce', 24, 16);
    pierceGfx.destroy();

    // 4. XP Gem (Emerald glowing diamond)
    const gemGfx = this.make.graphics({ x: 0, y: 0 });
    gemGfx.fillStyle(0x10b981, 1);
    gemGfx.beginPath();
    gemGfx.moveTo(8, 0);
    gemGfx.lineTo(16, 8);
    gemGfx.lineTo(8, 16);
    gemGfx.lineTo(0, 8);
    gemGfx.closePath();
    gemGfx.fillPath();
    gemGfx.lineStyle(1, 0xa7f3d0, 1);
    gemGfx.strokePath();
    gemGfx.generateTexture('xp_gem', 16, 16);
    gemGfx.destroy();

    // 5. Enemy: Tin Giả (Orange glitch rhombus)
    const tinGiaGfx = this.make.graphics({ x: 0, y: 0 });
    tinGiaGfx.fillStyle(0xf97316, 1);
    tinGiaGfx.beginPath();
    tinGiaGfx.moveTo(14, 0);
    tinGiaGfx.lineTo(28, 14);
    tinGiaGfx.lineTo(14, 28);
    tinGiaGfx.lineTo(0, 14);
    tinGiaGfx.closePath();
    tinGiaGfx.fillPath();
    tinGiaGfx.lineStyle(2, 0xfed7aa, 1);
    tinGiaGfx.strokePath();
    tinGiaGfx.generateTexture('enemy_tinGia', 28, 28);
    tinGiaGfx.destroy();

    // 6. Enemy: Clickbait (Sharp yellow triangle)
    const clickbaitGfx = this.make.graphics({ x: 0, y: 0 });
    clickbaitGfx.fillStyle(0xeab308, 1);
    clickbaitGfx.fillTriangle(24, 12, 0, 0, 4, 24);
    clickbaitGfx.lineStyle(2, 0xfef08a, 1);
    clickbaitGfx.strokeTriangle(24, 12, 0, 0, 4, 24);
    clickbaitGfx.generateTexture('enemy_clickbait', 26, 26);
    clickbaitGfx.destroy();

    // 7. Enemy: Tâm Lý Đám Đông (Magenta swarm sphere)
    const swarmGfx = this.make.graphics({ x: 0, y: 0 });
    swarmGfx.fillStyle(0xec4899, 1);
    swarmGfx.fillCircle(8, 8, 7);
    swarmGfx.lineStyle(2, 0xfbcfe8, 0.8);
    swarmGfx.strokeCircle(8, 8, 7);
    swarmGfx.generateTexture('enemy_tamLyDamDong', 16, 16);
    swarmGfx.destroy();

    // 8. Enemy: Bạo Lực Ngôn Từ (Dark crimson spiky orb)
    const baoLucGfx = this.make.graphics({ x: 0, y: 0 });
    baoLucGfx.fillStyle(0xdc2626, 1);
    baoLucGfx.fillCircle(16, 16, 13);
    baoLucGfx.lineStyle(3, 0xef4444, 1);
    baoLucGfx.strokeCircle(16, 16, 15);
    baoLucGfx.generateTexture('enemy_baoLucNgonTu', 32, 32);
    baoLucGfx.destroy();

    // 9. Enemy: Xuyên Tạc Văn Hóa (Elite purple polygon)
    const eliteGfx = this.make.graphics({ x: 0, y: 0 });
    eliteGfx.fillStyle(0x8b5cf6, 1);
    eliteGfx.fillCircle(24, 24, 18);
    eliteGfx.lineStyle(4, 0xc4b5fd, 1);
    eliteGfx.strokeCircle(24, 24, 22);
    eliteGfx.fillStyle(0xffffff, 1);
    eliteGfx.fillCircle(24, 24, 8);
    eliteGfx.generateTexture('enemy_xuyenTacVanHoa', 48, 48);
    eliteGfx.destroy();

    // 10. Enemy Bullet
    const eBulletGfx = this.make.graphics({ x: 0, y: 0 });
    eBulletGfx.fillStyle(0xef4444, 1);
    eBulletGfx.fillCircle(6, 6, 5);
    eBulletGfx.lineStyle(1, 0xffffff, 1);
    eBulletGfx.strokeCircle(6, 6, 5);
    eBulletGfx.generateTexture('enemy_bullet', 12, 12);
    eBulletGfx.destroy();

    // 11. Boss: Lệch Chuẩn Văn Hóa Số (Gigantic corrupted core)
    const bossGfx = this.make.graphics({ x: 0, y: 0 });
    bossGfx.fillStyle(0x450a0a, 0.9);
    bossGfx.fillCircle(40, 40, 36);
    bossGfx.lineStyle(5, 0xef4444, 1);
    bossGfx.strokeCircle(40, 40, 36);
    bossGfx.lineStyle(2, 0xa855f7, 1);
    bossGfx.strokeCircle(40, 40, 24);
    bossGfx.fillStyle(0xef4444, 1);
    bossGfx.fillCircle(40, 40, 12);
    bossGfx.generateTexture('boss', 80, 80);
    bossGfx.destroy();

    // 12. Aura Ring (Translucent ring for build aura)
    const auraGfx = this.make.graphics({ x: 0, y: 0 });
    auraGfx.lineStyle(3, 0x06b6d4, 0.6);
    auraGfx.strokeCircle(64, 64, 60);
    auraGfx.fillStyle(0x06b6d4, 0.1);
    auraGfx.fillCircle(64, 64, 60);
    auraGfx.generateTexture('aura_ring', 128, 128);
    auraGfx.destroy();

    // 13. Slow Zone
    const slowGfx = this.make.graphics({ x: 0, y: 0 });
    slowGfx.fillStyle(0x7c3aed, 0.25);
    slowGfx.fillCircle(40, 40, 38);
    slowGfx.lineStyle(2, 0xa78bfa, 0.5);
    slowGfx.strokeCircle(40, 40, 38);
    slowGfx.generateTexture('slow_zone', 80, 80);
    slowGfx.destroy();

    // 14. Particle Spark
    const sparkGfx = this.make.graphics({ x: 0, y: 0 });
    sparkGfx.fillStyle(0xffffff, 1);
    sparkGfx.fillCircle(4, 4, 3);
    sparkGfx.generateTexture('spark', 8, 8);
    sparkGfx.destroy();
  }
}
