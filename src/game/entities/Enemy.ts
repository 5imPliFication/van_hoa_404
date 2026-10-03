import Phaser from 'phaser';
import { EnemyConfig, EnemyType } from '../types/data';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public config!: EnemyConfig;
  public currentHp: number = 10;
  public maxHp: number = 10;
  public enemyType: EnemyType = 'chase';
  public damage: number = 5;
  public speed: number = 100;
  public xpDrop: number = 1;

  // Behavior state
  private dashTimer: number = 0;
  private isDashing: boolean = false;
  private attackCooldownTimer: number = 0;
  private duplicateTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_tinGia');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(11);
  }

  public spawn(x: number, y: number, config: EnemyConfig): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

    this.config = config;
    this.enemyType = config.type;
    this.maxHp = config.stats.hp;
    this.currentHp = config.stats.hp;
    this.damage = config.stats.damage;
    this.speed = config.stats.speed;
    this.xpDrop = config.stats.xpDrop;

    this.dashTimer = 0;
    this.isDashing = false;
    this.attackCooldownTimer = Phaser.Math.Between(0, 1000) / 1000;
    this.duplicateTimer = 0;

    // Set sprite texture based on enemy ID
    const textureKey = `enemy_${config.id}`;
    if (this.scene.textures.exists(textureKey)) {
      this.setTexture(textureKey);
    } else {
      this.setTexture('enemy_tinGia');
    }

    // Set physics body size
    if (this.enemyType === 'swarm') {
      this.setCircle(7, 1, 1);
    } else if (this.enemyType === 'elite') {
      this.setCircle(20, 4, 4);
    } else {
      this.setCircle(12, 2, 2);
    }

    this.clearTint();
  }

  public updateAI(
    playerX: number,
    playerY: number,
    dt: number,
    globalSpeedMult: number = 1.0
  ): { shouldShoot?: boolean; shouldDuplicate?: boolean } {
    if (!this.active) return {};

    const dtSec = dt / 1000;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY);
    const currentSpeed = this.speed * globalSpeedMult;

    let result: { shouldShoot?: boolean; shouldDuplicate?: boolean } = {};

    switch (this.enemyType) {
      case 'dash':
        this.dashTimer += dtSec;
        if (this.isDashing) {
          // Continue high speed dash
          if (this.dashTimer > 0.6) {
            this.isDashing = false;
            this.dashTimer = 0;
          }
        } else {
          // Standard chase until in range
          if (dist < 180 && this.dashTimer > 2.0) {
            // Initiate dash burst
            this.isDashing = true;
            this.dashTimer = 0;
            const dashSpeed = currentSpeed * 2.2;
            this.setVelocity(Math.cos(angleToPlayer) * dashSpeed, Math.sin(angleToPlayer) * dashSpeed);
            this.setRotation(angleToPlayer);
            return result;
          }
          // Normal chase
          this.moveTowards(angleToPlayer, currentSpeed);
        }
        break;

      case 'ranged':
        this.attackCooldownTimer += dtSec;
        // Keep ideal distance around 200px
        if (dist < 160) {
          // Back away
          this.moveTowards(angleToPlayer + Math.PI, currentSpeed * 0.8);
        } else if (dist > 260) {
          // Move closer
          this.moveTowards(angleToPlayer, currentSpeed);
        } else {
          // Stop and aim
          this.setVelocity(0, 0);
        }

        if (this.attackCooldownTimer >= (this.config.behavior.cooldown || 2.5)) {
          this.attackCooldownTimer = 0;
          result.shouldShoot = true;
        }
        break;

      case 'swarm':
        // Fast chase with slight randomized wobble
        const wobble = Math.sin(this.scene.time.now / 150) * 0.3;
        this.moveTowards(angleToPlayer + wobble, currentSpeed);
        break;

      case 'elite':
        // Slow inevitable advance
        this.moveTowards(angleToPlayer, currentSpeed);
        break;

      case 'chase':
      default:
        // Basic direct chase (No pathfinding, normalize steering)
        this.moveTowards(angleToPlayer, currentSpeed);

        // Tin giả duplication mechanic if alive > 15s
        if (this.config.id === 'tinGia') {
          this.duplicateTimer += dtSec;
          if (this.duplicateTimer > 15) {
            this.duplicateTimer = 0;
            result.shouldDuplicate = true;
          }
        }
        break;
    }

    return result;
  }

  private moveTowards(angle: number, speed: number): void {
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    this.setVelocity(vx, vy);
    this.setRotation(angle);
  }

  public takeDamage(amount: number, isCrit: boolean = false): boolean {
    if (!this.active) return false;

    this.currentHp -= amount;

    // Show floating damage number
    this.showDamageText(Math.round(amount), isCrit);

    // Hit flash
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });

    if (this.currentHp <= 0) {
      this.deactivate();
      return true; // killed
    }

    return false;
  }

  private showDamageText(dmg: number, isCrit: boolean): void {
    const dmgText = this.scene.add.text(
      this.x + Phaser.Math.Between(-10, 10),
      this.y - 12,
      dmg.toString(),
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: isCrit ? '16px' : '12px',
        fontStyle: isCrit ? 'bold' : 'normal',
        color: isCrit ? '#facc15' : '#ffffff',
        stroke: '#0f172a',
        strokeThickness: 2,
        resolution: 2,
      }
    ).setOrigin(0.5);

    this.scene.tweens.add({
      targets: dmgText,
      y: dmgText.y - 24,
      alpha: 0,
      duration: 500,
      ease: 'Power1',
      onComplete: () => dmgText.destroy(),
    });
  }

  public deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
  }
}
