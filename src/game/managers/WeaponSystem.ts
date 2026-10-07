import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { Enemy } from '../entities/Enemy';
import { SoundSystem } from '../systems/SoundSystem';
import { DamageNumberSystem } from '../systems/DamageNumberSystem';
import { WeaponStyle } from '../types/data';

/**
 * What one extra "attack" from Chống (stats.projectileCount) means for each starting weapon:
 * sniper fires one more bullet, pulse adds one weaker echo wave, orbit adds one more relic.
 */
export const EXTRA_ATTACK_LABEL: Record<WeaponStyle, string> = {
  sniper: 'tia đạn',
  pulse: 'đợt sóng',
  orbit: 'mảnh ngọc',
};

/** Người Gìn Giữ relic count = ORBIT_BASE_RELICS + projectileCount (3 at start). */
export const ORBIT_BASE_RELICS = 2;
/** Each echo wave after the main pulse: delay between waves and damage share. */
const PULSE_ECHO_DELAY_MS = 220;
const PULSE_ECHO_MULTIPLIER = 0.6;

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
  private weaponStyle: WeaponStyle;
  // Countdown (ms) for each pending pulse echo; ticked in update() so echoes freeze with pauseCombat()
  private pendingEchoes: number[] = [];

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

    this.weaponStyle = this.player.classConfig?.startingWeapon || 'sniper';
    if (this.weaponStyle === 'sniper') {
      this.range = 520;
    } else if (this.weaponStyle === 'pulse') {
      this.range = 280;
    }

    // Người Gìn Giữ: the relics ARE the weapon (no bullets)
    this.syncOrbitingRelics();
  }

  /** Relics wanted right now: Gìn Giữ scales with Chống (+ Khiên Thông Tin combo), other classes get 3 from the combo. */
  private targetRelicCount(): number {
    if (this.weaponStyle === 'orbit') {
      return ORBIT_BASE_RELICS + Math.max(1, this.player.stats.projectileCount) + (this.hasOrbitingShields ? 2 : 0);
    }
    return this.hasOrbitingShields ? 3 : 0;
  }

  private syncOrbitingRelics(): void {
    const target = this.targetRelicCount();
    while (this.orbitingRelics.length < target) {
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

    // Add relics when Chống or the Khiên Thông Tin combo raised the count
    this.syncOrbitingRelics();

    // 1. Update Orbiting Relics (Người Gìn Giữ & Khiên Thông Tin combo)
    if (this.orbitingRelics.length > 0) {
      this.updateOrbitingRelics(dt, activeEnemies);
    }

    // 2. Secondary Shockwave Pulse (Bản Sắc Sáng Tạo combo)
    if (this.hasShockwavePulse) {
      this.shockwaveTimer += dt / 1000;
      if (this.shockwaveTimer >= 2.5) {
        this.shockwaveTimer = 0;
        this.firePulseWave(activeEnemies, 1.35, 0xf59e0b);
      }
    }

    // 3. Pending echo waves (Người Kiến Tạo + Chống)
    if (this.pendingEchoes.length > 0) {
      this.pendingEchoes = this.pendingEchoes.map(t => t - dt);
      while (this.pendingEchoes.length > 0 && this.pendingEchoes[0] <= 0) {
        this.pendingEchoes.shift();
        this.firePulseWave(activeEnemies, PULSE_ECHO_MULTIPLIER, 0x86efac);
      }
    }

    // Người Gìn Giữ has no primary shot: the relics deal all of its damage
    if (this.weaponStyle === 'orbit') return;

    // 4. Primary Weapon Attack Timer
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

    // Người Gìn Giữ's ring widens with Dân tộc (+5 px per level, 110 px at level 5)
    const orbitRadius = 85 + (this.weaponStyle === 'orbit' ? (this.player.values.danToc || 0) * 5 : 0);
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
      // Full damage when the relics are Gìn Giữ's only weapon, a lighter touch for the combo shields
      const relicDmg = this.player.stats.damage * (this.weaponStyle === 'orbit' ? 1.0 : 0.75);
      const relicCrit = Math.random() < this.player.stats.critChance;

      for (const relic of this.orbitingRelics) {
        this.bossManager?.damageInRadius(relic.x, relic.y, 20, relicCrit ? relicDmg * 2 : relicDmg, relicCrit);
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

    // Block incoming enemy bullets; Người Gìn Giữ's relics send them straight back the way they came
    const enemyBullets = this.enemyManager?.enemyProjectiles?.getChildren() as Phaser.Physics.Arcade.Image[] | undefined;
    if (enemyBullets) {
      for (const eb of enemyBullets) {
        if (!eb.active) continue;
        for (const relic of this.orbitingRelics) {
          const dist = Phaser.Math.Distance.Between(relic.x, relic.y, eb.x, eb.y);
          if (dist < 26) {
            const reflect = this.weaponStyle === 'orbit';
            if (reflect && eb.body) {
              const v = (eb.body as Phaser.Physics.Arcade.Body).velocity;
              this.reflectBullet(eb.x, eb.y, -v.x, -v.y);
            }
            eb.setActive(false).setVisible(false).setVelocity(0, 0);
            DamageNumberSystem.showDamage(relic.x, relic.y - 12, reflect ? 'PHẢN ĐÒN' : 'CHẶN ĐẠN', 'crit');
            SoundSystem.playHit();
            break;
          }
        }
      }
    }
  }

  /** Người Gìn Giữ: a blocked enemy bullet flies back along its path as a player bullet. */
  private reflectBullet(x: number, y: number, vx: number, vy: number): void {
    if (vx === 0 && vy === 0) return;
    const bullet = this.projectiles.get() as Projectile;
    if (!bullet) return;
    const crit = Math.random() < this.player.stats.critChance;
    const dmg = crit ? this.player.stats.damage * 2 : this.player.stats.damage;
    bullet.fire(x, y, x + vx, y + vy, this.player.stats.projectileSpeed, dmg, crit, false);
    bullet.setTint(0xf59e0b);
  }

  private fireWeapon(activeEnemies: Enemy[], bossTargets: TargetPoint[]): void {
    if (this.weaponStyle === 'pulse') {
      this.firePulseWave(activeEnemies);
      // Each extra attack from Chống becomes a weaker echo wave right after the main one
      for (let i = 1; i < Math.max(1, this.player.stats.projectileCount); i++) {
        this.pendingEchoes.push(i * PULSE_ECHO_DELAY_MS);
      }
      return;
    }

    // Sniper / Default Projectile firing
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

  public firePulseWave(activeEnemies: Enemy[], multiplier: number = 1.0, tint?: number): void {
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
    if (tint !== undefined) {
      pulseImg.setTint(tint); // Gold for the combo pulse, pale green for echo waves
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

    // Damage boss + swarm minions in radius
    this.bossManager?.damageInRadius(this.player.x, this.player.y, baseRadius, finalDamage, critRoll);
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
