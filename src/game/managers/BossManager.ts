import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EnemyManager } from './EnemyManager';
import { CommunityMeterManager } from './CommunityMeterManager';
import { BossConfig } from '../types/data';
import { DataLoader } from '../../data/loader';
import { SoundSystem } from '../systems/SoundSystem';

export class BossManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemyManager: EnemyManager;
  private communityMeter: CommunityMeterManager;
  private bossSprite?: Phaser.Physics.Arcade.Sprite;
  private bossConfig: BossConfig;
  public isBossActive: boolean = false;
  public bossHp: number = 2000;
  public bossMaxHp: number = 2000;
  public currentPhaseIndex: number = 0;
  private attackTimer: number = 0;
  private onBossDefeatedCallback: () => void;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    enemyManager: EnemyManager,
    communityMeter: CommunityMeterManager,
    onBossDefeated: () => void
  ) {
    this.scene = scene;
    this.player = player;
    this.enemyManager = enemyManager;
    this.communityMeter = communityMeter;
    this.onBossDefeatedCallback = onBossDefeated;
    this.bossConfig = DataLoader.getBoss();
  }

  public spawnBoss(): void {
    if (this.isBossActive) return;

    this.isBossActive = true;
    SoundSystem.playBossAlarm();
    this.bossMaxHp = this.bossConfig.maxHp;
    this.bossHp = this.bossConfig.maxHp;
    this.currentPhaseIndex = 0;

    const { width, height } = this.scene.scale;
    this.bossSprite = this.scene.physics.add.sprite(width / 2, -50, 'boss');
    this.bossSprite.setDepth(20);
    this.bossSprite.setCircle(36, 4, 4);

    // Entrance tween
    this.scene.tweens.add({
      targets: this.bossSprite,
      y: height * 0.3,
      duration: 1500,
      ease: 'Back.easeOut',
    });

    // Boss Warning Text
    const warn = this.scene.add.text(width / 2, height * 0.2, '⚠️ CẢNH BÁO: TRÙM CUỐI XUẤT HIỆN ⚠️\nLỆCH CHUẨN VĂN HÓA SỐ', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#dc2626',
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5).setScrollFactor(0);

    this.scene.tweens.add({
      targets: warn,
      alpha: 0,
      duration: 800,
      repeat: 3,
      onComplete: () => warn.destroy(),
    });
  }

  public update(dt: number): void {
    if (!this.isBossActive || !this.bossSprite?.active) return;

    const dtSec = dt / 1000;
    const px = this.player.x;
    const py = this.player.y;

    // Movement towards player
    const angle = Phaser.Math.Angle.Between(this.bossSprite.x, this.bossSprite.y, px, py);
    const speed = this.bossConfig.speed * (this.currentPhaseIndex === 1 ? 1.4 : 1.0);
    this.bossSprite.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // Attack timer
    this.attackTimer += dtSec;
    const currentPhase = this.bossConfig.phases[this.currentPhaseIndex];
    const cd = currentPhase?.attackCooldown || 2.0;

    if (this.attackTimer >= cd) {
      this.attackTimer = 0;
      this.performBossAttack();
    }

    // Community drain during Phase 3
    if (this.currentPhaseIndex === 2) {
      this.communityMeter.modify(-0.8 * dtSec);
    }
  }

  private performBossAttack(): void {
    if (!this.bossSprite) return;

    const bx = this.bossSprite.x;
    const by = this.bossSprite.y;

    if (this.currentPhaseIndex === 0) {
      // Phase 1: 8-way bullet spread
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const b = this.enemyManager.enemyProjectiles.get(bx, by, 'enemy_bullet') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.setActive(true).setVisible(true).setDepth(14);
          b.setVelocity(Math.cos(angle) * 160, Math.sin(angle) * 160);
          this.scene.time.delayedCall(3000, () => {
            if (b.active) b.setActive(false).setVisible(false);
          });
        }
      }
    } else if (this.currentPhaseIndex === 1) {
      // Phase 2: Rapid aimed tri-shot
      const targetAngle = Phaser.Math.Angle.Between(bx, by, this.player.x, this.player.y);
      for (let offset of [-0.25, 0, 0.25]) {
        const b = this.enemyManager.enemyProjectiles.get(bx, by, 'enemy_bullet') as Phaser.Physics.Arcade.Image;
        if (b) {
          b.setActive(true).setVisible(true).setDepth(14);
          b.setVelocity(Math.cos(targetAngle + offset) * 230, Math.sin(targetAngle + offset) * 230);
          this.scene.time.delayedCall(3000, () => {
            if (b.active) b.setActive(false).setVisible(false);
          });
        }
      }
    } else {
      // Phase 3: Minion swarm summon
      this.enemyManager.spawnEnemy('clickbait', bx + 30, by);
      this.enemyManager.spawnEnemy('tinGia', bx - 30, by);
    }
  }

  public takeDamage(amount: number): boolean {
    if (!this.isBossActive || !this.bossSprite?.active) return false;

    this.bossHp -= amount;
    this.bossSprite.setTint(0xff5555);
    this.scene.time.delayedCall(80, () => {
      if (this.bossSprite?.active) this.bossSprite.clearTint();
    });

    const hpPercent = (this.bossHp / this.bossMaxHp) * 100;

    // Check phase transition
    if (this.currentPhaseIndex === 0 && hpPercent <= 65) {
      this.currentPhaseIndex = 1;
      this.announcePhase('GIAI ĐOẠN 2: BẠO LỰC & CỰC HÓA');
    } else if (this.currentPhaseIndex === 1 && hpPercent <= 30) {
      this.currentPhaseIndex = 2;
      this.announcePhase('GIAI ĐOẠN 3: KHỦNG HOẢNG GIÁ TRỊ');
    }

    if (this.bossHp <= 0) {
      this.bossSprite.destroy();
      this.isBossActive = false;
      this.onBossDefeatedCallback();
      return true;
    }

    return false;
  }

  private announcePhase(text: string): void {
    const { width, height } = this.scene.scale;
    const banner = this.scene.add.text(width / 2, height * 0.25, text, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#b45309',
      resolution: 2,
    }).setOrigin(0.5).setScrollFactor(0);

    this.scene.tweens.add({
      targets: banner,
      alpha: 0,
      duration: 1200,
      onComplete: () => banner.destroy(),
    });
  }

  public getBossSprite(): Phaser.Physics.Arcade.Sprite | undefined {
    return this.bossSprite;
  }
}
