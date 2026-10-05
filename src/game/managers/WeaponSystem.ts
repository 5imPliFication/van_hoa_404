import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { Enemy } from '../entities/Enemy';
import { SoundSystem } from '../systems/SoundSystem';
import { DamageNumberSystem } from '../systems/DamageNumberSystem';

export interface TargetPoint {
  x: number;
  y: number;
  active?: boolean;
}

export class WeaponSystem {
  private scene: Phaser.Scene;
  private player: Player;
  public projectiles: Phaser.Physics.Arcade.Group;
  private fireTimer: number = 0;
  private range: number = 440;

  // Evolution & Combo buffs
  public hasPierceEvolution: boolean = false;
  public bonusVsTinGiaMultiplier: number = 1.0;
  public critOnMarked: boolean = false;
  public hasOrbitingShields: boolean = false;
  public hasShockwavePulse: boolean = false;
  private shockwaveTimer: number = 0;

  // Orbiting relics / shields (Người Gìn Giữ & Khiên Thông Tin)
  public orbitingRelics: Phaser.GameObjects.Image[] = [];
  private orbitAngle: number = 0;
  private relicContactTimer: number = 0;

  // External managers reference
  public enemyManager?: any;
  public bossManager?: any;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    this.projectiles = scene.physics.add.group({
      classType: Projectile,
      maxSize: 100,
      runChildUpdate: true,
    });

    if (this.player.classConfig?.startingWeapon === 'sniper') {
      this.range = 520;
    } else if (this.player.classConfig?.startingWeapon === 'pulse') {
      this.range = 280;
    }

    // Initialize orbiting relics if player is Người Gìn Giữ
    if (this.player.classConfig?.startingWeapon === 'orbit') {
      this.spawnOrbitingRelics(3);
    }
  }

  public spawnOrbitingRelics(count: number = 3): void {
    if (this.orbitingRelics.length > 0) return;
    for (let i = 0; i < count; i++) {
      const relic = this.scene.add.image(this.player.x, this.player.y, 'relic_orbit');
      relic.setDepth(14);
      relic.setScale(0.9);
      this.orbitingRelics.push(relic);
    }
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

    // Check if combo unlocked orbiting shields
    if (this.hasOrbitingShields && this.orbitingRelics.length === 0) {
      this.spawnOrbitingRelics(3);
    }

    // 1. Update Orbiting Relics (Người Gìn Giữ & Khiên Thông Tin combo)
    if (this.orbitingRelics.length > 0) {
      this.updateOrbitingRelics(dt, activeEnemies);
    }

    // 2. Secondary Shockwave Pulse (Bản Sắc Sáng Tạo combo)
    if (this.hasShockwavePulse) {
      this.shockwaveTimer += dt / 1000;
      if (this.shockwaveTimer >= 2.5) {
        this.shockwaveTimer = 0;
        this.firePulseWave(activeEnemies, bossTargets, 1.35, true);
      }
    }

    // 3. Primary Weapon Attack Timer
    this.fireTimer += dt;
    const cooldownMs = 1000 / Math.max(0.2, this.player.stats.attackSpeed);

    if (this.fireTimer >= cooldownMs) {
      this.fireTimer = 0;
      this.fireWeapon(activeEnemies, bossTargets);
    }
  }

  private updateOrbitingRelics(dt: number, activeEnemies: Enemy[]): void {
    const orbitSpeed = 3.6 * (this.player.stats.attackSpeed || 1.0);
    this.orbitAngle += (dt / 1000) * orbitSpeed;

    const orbitRadius = 85;
    const count = this.orbitingRelics.length;

    for (let i = 0; i < count; i++) {
      const relic = this.orbitingRelics[i];
      if (!relic.active) continue;

      const angle = this.orbitAngle + (i * Math.PI * 2) / count;
      relic.setPosition(
        this.player.x + Math.cos(angle) * orbitRadius,
        this.player.y + Math.sin(angle) * orbitRadius
      );
      relic.setRotation(angle + Math.PI / 2);
    }

    // Contact damage against enemies
    this.relicContactTimer += dt / 1000;
    if (this.relicContactTimer >= 0.28) {
      this.relicContactTimer = 0;
      const relicDmg = this.player.stats.damage * 0.75;

      for (const relic of this.orbitingRelics) {
        for (const enemy of activeEnemies) {
          if (!enemy.active) continue;
          const dist = Phaser.Math.Distance.Between(relic.x, relic.y, enemy.x, enemy.y);
          if (dist < 32) {
            SoundSystem.playHit();
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            this.enemyManager?.damageEnemy(
              enemy,
              relicDmg,
              Math.random() < this.player.stats.critChance,
              Math.cos(angle) * 16,
              Math.sin(angle) * 16
            );
          }
        }
      }
    }

    // Deflect and destroy incoming enemy bullets within relic touch radius
    const enemyBullets = this.enemyManager?.enemyBullets?.getChildren();
    if (enemyBullets) {
      for (const eb of enemyBullets) {
        if (!eb.active) continue;
        for (const relic of this.orbitingRelics) {
          const dist = Phaser.Math.Distance.Between(relic.x, relic.y, eb.x, eb.y);
          if (dist < 26) {
            eb.setActive(false).setVisible(false).setVelocity(0, 0);
            DamageNumberSystem.showDamage(relic.x, relic.y - 12, 'CHẶN ĐẠN', 'crit');
            SoundSystem.playHit();
            break;
          }
        }
      }
    }
  }

  private fireWeapon(activeEnemies: Enemy[], bossTargets: TargetPoint[]): void {
    const weaponStyle = this.player.classConfig?.startingWeapon || 'sniper';

    if (weaponStyle === 'pulse') {
      this.firePulseWave(activeEnemies, bossTargets);
      return;
    }

    // Sniper / Orbit / Default Projectile firing
    let baseAngle: number | null = null;

    if (this.player.manualAimAngle !== null) {
      baseAngle = this.player.manualAimAngle;
    } else {
      const target = this.findNearestTarget(activeEnemies, bossTargets);
      if (!target) return;
      baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);

      if (this.player.body && (this.player.body as Phaser.Physics.Arcade.Body).velocity.lengthSq() < 1) {
        this.player.setRotation(baseAngle + Math.PI / 2);
      }
    }

    SoundSystem.playShoot();

    const count = Math.max(1, this.player.stats.projectileCount);
    const baseDamage = this.player.stats.damage;
    const critRoll = Math.random() < this.player.stats.critChance;
    const finalDamage = critRoll ? baseDamage * 2.0 : baseDamage;

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

  public firePulseWave(
    activeEnemies: Enemy[],
    bossTargets: TargetPoint[],
    multiplier: number = 1.0,
    isComboPulse: boolean = false
  ): void {
    SoundSystem.playShoot();

    const baseRadius = 175 * (1 + (this.player.stats.buildPower || 0) * 0.015);
    const baseDamage = this.player.stats.damage * multiplier;
    const critRoll = Math.random() < this.player.stats.critChance;
    const finalDamage = critRoll ? baseDamage * 2.0 : baseDamage;

    // Visual: Expanding Shockwave Pulse Graphic
    const pulseImg = this.scene.add.image(this.player.x, this.player.y, 'pulse_wave');
    pulseImg.setDepth(12);
    pulseImg.setScale(0.2);
    pulseImg.setAlpha(0.9);
    if (isComboPulse) {
      pulseImg.setTint(0xf59e0b); // Gold pulse for combo
    }

    this.scene.tweens.add({
      targets: pulseImg,
      scale: baseRadius / 64,
      alpha: 0,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => pulseImg.destroy(),
    });

    // Damage all enemies in radius and knock them back
    for (const enemy of activeEnemies) {
      if (!enemy.active) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (d <= baseRadius) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
        const kb = 24 + (this.player.stats.fightPower || 0) * 1.5;
        this.enemyManager?.damageEnemy(
          enemy,
          finalDamage,
          critRoll,
          Math.cos(angle) * kb,
          Math.sin(angle) * kb
        );
      }
    }

    // Damage boss / summons in radius
    for (const bTarget of bossTargets) {
      if (bTarget.active === false) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, bTarget.x, bTarget.y);
      if (d <= baseRadius) {
        if (this.bossManager?.bossSprite === bTarget) {
          this.bossManager.takeDamage(finalDamage, critRoll);
          DamageNumberSystem.showDamage(bTarget.x, bTarget.y - 35, finalDamage, critRoll ? 'crit' : 'monster');
        }
      }
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
