import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { Enemy } from '../entities/Enemy';
import { SoundSystem } from '../systems/SoundSystem';

export interface TargetPoint {
  x: number;
  y: number;
  active?: boolean;
}

export class WeaponSystem {
  private player: Player;
  public projectiles: Phaser.Physics.Arcade.Group;
  private fireTimer: number = 0;
  private range: number = 420;

  // Evolution buffs
  public hasPierceEvolution: boolean = false;
  public bonusVsTinGiaMultiplier: number = 1.0;

  constructor(scene: Phaser.Scene, player: Player) {
    this.player = player;

    this.projectiles = scene.physics.add.group({
      classType: Projectile,
      maxSize: 100,
      runChildUpdate: true,
    });
  }

  public clearAllProjectiles(): void {
    const bullets = this.projectiles.getChildren() as Projectile[];
    for (const b of bullets) {
      if (b.active) {
        b.deactivate();
      }
    }
  }

  public readyToFire(): void {
    this.fireTimer = 999999;
  }

  public update(dt: number, activeEnemies: Enemy[], bossTargets: TargetPoint[] = []): void {
    if (!this.player.isAlive) return;

    this.fireTimer += dt;
    const cooldownMs = 1000 / Math.max(0.2, this.player.stats.attackSpeed);

    if (this.fireTimer >= cooldownMs) {
      this.fireTimer = 0;
      this.fireWeapon(activeEnemies, bossTargets);
    }
  }

  private fireWeapon(activeEnemies: Enemy[], bossTargets: TargetPoint[]): void {
    let baseAngle: number | null = null;

    // Check if player is manually aiming with arrow keys
    if (this.player.manualAimAngle !== null) {
      baseAngle = this.player.manualAimAngle;
    } else {
      // Default auto-aim: target whichever is closer (mobs or boss)
      const target = this.findNearestTarget(activeEnemies, bossTargets);
      if (!target) return; // Do not fire if no targets in range

      baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);

      // Rotate stationary player towards target
      if (this.player.body && (this.player.body as Phaser.Physics.Arcade.Body).velocity.lengthSq() < 1) {
        this.player.setRotation(baseAngle + Math.PI / 2);
      }
    }

    SoundSystem.playShoot();

    const count = Math.max(1, this.player.stats.projectileCount);
    const baseDamage = this.player.stats.damage;
    const critRoll = Math.random() < this.player.stats.critChance;
    const finalDamage = critRoll ? baseDamage * 2.0 : baseDamage;

    // Spread angle for multi-shot
    const spreadAngle = 0.15;

    for (let i = 0; i < count; i++) {
      const bullet = this.projectiles.get() as Projectile;
      if (!bullet) break;

      const offset = (i - (count - 1) / 2) * spreadAngle;
      const angle = baseAngle + offset;
      const targetX = this.player.x + Math.cos(angle) * 300;
      const targetY = this.player.y + Math.sin(angle) * 300;

      bullet.fire(
        this.player.x,
        this.player.y,
        targetX,
        targetY,
        this.player.stats.projectileSpeed,
        finalDamage,
        critRoll,
        this.hasPierceEvolution
      );
    }
  }

  private findNearestTarget(enemies: Enemy[], bossTargets: TargetPoint[]): TargetPoint | null {
    let nearest: TargetPoint | null = null;
    let minDist = this.range;

    // 1. Evaluate normal enemies
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (d < minDist) {
        minDist = d;
        nearest = enemy;
      }
    }

    // 2. Evaluate active boss & boss summons (whichever is closer wins)
    for (const bTarget of bossTargets) {
      if (bTarget.active === false) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, bTarget.x, bTarget.y);
      if (d < minDist) {
        minDist = d;
        nearest = bTarget;
      }
    }

    return nearest;
  }
}
