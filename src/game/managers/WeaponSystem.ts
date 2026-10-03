import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { Enemy } from '../entities/Enemy';
import { SoundSystem } from '../systems/SoundSystem';

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

  public update(dt: number, activeEnemies: Enemy[]): void {
    if (!this.player.isAlive) return;

    this.fireTimer += dt;
    const cooldownMs = 1000 / Math.max(0.2, this.player.stats.attackSpeed);

    if (this.fireTimer >= cooldownMs) {
      this.fireTimer = 0;
      this.autoFire(activeEnemies);
    }
  }

  private autoFire(activeEnemies: Enemy[]): void {
    const target = this.findNearestEnemy(activeEnemies);
    if (!target) return;

    SoundSystem.playShoot();

    const count = Math.max(1, this.player.stats.projectileCount);
    const baseDamage = this.player.stats.damage;
    const critRoll = Math.random() < this.player.stats.critChance;
    const finalDamage = critRoll ? baseDamage * 2.0 : baseDamage;

    // Direction to primary target
    const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    const spreadAngle = 0.15; // radians between bullets when multi-shot

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

  private findNearestEnemy(enemies: Enemy[]): Enemy | null {
    let nearest: Enemy | null = null;
    let minDist = this.range;

    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (d < minDist) {
        minDist = d;
        nearest = enemy;
      }
    }

    return nearest;
  }
}
