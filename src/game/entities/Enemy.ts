import Phaser from 'phaser';
import { EnemyConfig, EnemyType } from '../types/data';
import { DamageNumberSystem } from '../systems/DamageNumberSystem';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public config!: EnemyConfig;
  public currentHp: number = 10;
  public maxHp: number = 10;
  public enemyType: EnemyType = 'chase';
  public damage: number = 5;
  public speed: number = 100;
  public xpDrop: number = 1;
  public contactTimer: number = 0.75;
  public shadow: Phaser.GameObjects.Image;

  // Behavior state
  private dashTimer: number = 0;
  private isDashing: boolean = false;
  private attackCooldownTimer: number = 0;
  private duplicateTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_tinGia');
    this.shadow = scene.add.image(x, y + 10, 'drop_shadow');
    this.shadow.setDepth(8);
    this.shadow.setVisible(false);

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
    this.contactTimer = 0.75;

    // Set sprite texture based on enemy ID
    const textureKey = `enemy_${config.id}`;
    if (this.scene.textures.exists(textureKey)) {
      this.setTexture(textureKey);
    } else {
      this.setTexture('enemy_tinGia');
    }

    // Set physics body size & shadow scaling based on enemy type
    if (this.enemyType === 'swarm') {
      this.setCircle(9, 6, 6);
      this.shadow.setScale(0.7, 0.45);
      this.shadow.setPosition(x, y + 10).setVisible(true);
    } else if (this.enemyType === 'elite') {
      if (config.id === 'khungHoangTruyenThong') {
        this.setCircle(24, 8, 8);
        this.shadow.setScale(1.7, 0.9);
        this.shadow.setPosition(x, y + 20).setVisible(true);
      } else {
        this.setCircle(20, 9, 9);
        this.shadow.setScale(1.5, 0.8);
        this.shadow.setPosition(x, y + 18).setVisible(true);
      }
    } else {
      this.setCircle(14, 7, 7);
      this.shadow.setScale(1.1, 0.6);
      this.shadow.setPosition(x, y + 12).setVisible(true);
    }

    this.clearTint();
    this.setScale(1.0);
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

    // Update shadow position and subtle breathing animation pulse
    const shadowYOffset = this.enemyType === 'elite' ? 18 : 12;
    this.shadow.setPosition(this.x, this.y + shadowYOffset);
    const pulse = 1.0 + Math.sin(this.scene.time.now / 200 + this.x * 0.05) * 0.04;
    this.setScale(pulse);

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

    // Show floating damage number (white with black border, orange if crit)
    DamageNumberSystem.showDamage(this.x, this.y, amount, isCrit ? 'crit' : 'monster');

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

  public deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.shadow?.setVisible(false);
  }

  public destroy(fromScene?: boolean): void {
    this.shadow?.destroy();
    super.destroy(fromScene);
  }
}
