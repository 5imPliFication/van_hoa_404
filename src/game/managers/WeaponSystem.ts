import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { Enemy } from '../entities/Enemy';
import { SoundSystem } from '../systems/SoundSystem';
import { DamageNumberSystem } from '../systems/DamageNumberSystem';
import { WeaponStyle } from '../types/data';

/**
 * What one extra "attack" from Chống (stats.projectileCount) means for each starting weapon:
 * sniper fires one more bullet, pulse adds one weaker echo wave, drum adds one weaker follow-up beat.
 */
export const EXTRA_ATTACK_LABEL: Record<WeaponStyle, string> = {
  sniper: 'tia đạn',
  pulse: 'đợt sóng',
  drum: 'nhịp trống',
};

/** Each echo wave / follow-up beat after the main attack: delay between them and damage share. */
const PULSE_ECHO_DELAY_MS = 220;
const PULSE_ECHO_MULTIPLIER = 0.6;
const DRUM_FOLLOWUP_DELAY_MS = 260;
const DRUM_FOLLOWUP_MULTIPLIER = 0.7;
/** Drum beats are slower than bullets: cooldown = DRUM_COOLDOWN_SCALE / attackSpeed seconds. */
export const DRUM_COOLDOWN_SCALE = 1.2;

/** Người Gìn Giữ's Trống Đồng cone; reach and width grow with Dân tộc. */
export function drumCone(danToc: number): { reach: number; halfAngle: number } {
  return {
    reach: 240 + danToc * 8,
    halfAngle: Phaser.Math.DegToRad(35 + danToc * 2),
  };
}

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
  // Countdown (ms) for each pending pulse echo / drum follow-up beat; ticked in update() so they freeze with pauseCombat()
  private pendingEchoes: number[] = [];

  // Evolution & Combo buffs
  public hasPierceEvolution: boolean = false;
  public bonusVsTinGiaMultiplier: number = 1.0;
  public critOnMarked: boolean = false;
  public hasOrbitingShields: boolean = false;
  public hasShockwavePulse: boolean = false;
  private shockwaveTimer: number = 0;

  // Orbiting shields (Khiên Thông Tin combo)
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
  }

  private syncOrbitingRelics(): void {
    const target = this.hasOrbitingShields ? 3 : 0;
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

    // Add the shields once the Khiên Thông Tin combo unlocks
    this.syncOrbitingRelics();

    // 1. Update Orbiting Shields (Khiên Thông Tin combo)
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

    // 3. Pending echo waves (Người Kiến Tạo) / follow-up drum beats (Người Gìn Giữ) from Chống
    if (this.pendingEchoes.length > 0) {
      this.pendingEchoes = this.pendingEchoes.map(t => t - dt);
      while (this.pendingEchoes.length > 0 && this.pendingEchoes[0] <= 0) {
        this.pendingEchoes.shift();
        if (this.weaponStyle === 'drum') {
          this.fireDrumBeat(activeEnemies, bossTargets, DRUM_FOLLOWUP_MULTIPLIER);
        } else {
          this.firePulseWave(activeEnemies, PULSE_ECHO_MULTIPLIER, 0x86efac);
        }
      }
    }

    // 4. Primary Weapon Attack Timer
    this.fireTimer += dt;
    const cooldownScale = this.weaponStyle === 'drum' ? DRUM_COOLDOWN_SCALE : 1;
    const cooldownMs = (1000 * cooldownScale) / Math.max(0.2, this.player.stats.attackSpeed);

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

    // Block incoming enemy bullets
    const enemyBullets = this.enemyManager?.enemyProjectiles?.getChildren() as Phaser.Physics.Arcade.Image[] | undefined;
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
    if (this.weaponStyle === 'drum') {
      if (!this.fireDrumBeat(activeEnemies, bossTargets, 1.0)) return;
      // Each extra attack from Chống becomes a weaker follow-up beat, re-aimed when it lands
      for (let i = 1; i < Math.max(1, this.player.stats.projectileCount); i++) {
        this.pendingEchoes.push(i * DRUM_FOLLOWUP_DELAY_MS);
      }
      return;
    }

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

  /**
   * Người Gìn Giữ (Trống Đồng): a sound-wave cone toward the nearest target. Damages and pushes back
   * everything inside, and silences enemy bullets in its path. Returns false when nothing is in reach.
   */
  private fireDrumBeat(activeEnemies: Enemy[], bossTargets: TargetPoint[], multiplier: number): boolean {
    const px = this.player.x;
    const py = this.player.y;
    const { reach, halfAngle } = drumCone(this.player.values.danToc || 0);

    let aim = this.player.manualAimAngle;
    if (aim === null) {
      this.range = reach;
      const target = this.findNearestTarget(activeEnemies, bossTargets);
      if (!target) return false;
      aim = Phaser.Math.Angle.Between(px, py, target.x, target.y);
      if (this.player.body && (this.player.body as Phaser.Physics.Arcade.Body).velocity.lengthSq() < 1) {
        this.player.setRotation(aim + Math.PI / 2);
      }
    }
    const coneAim = aim;

    // pad = target body radius, so big targets on the cone's edge still count
    const inCone = (x: number, y: number, pad: number = 0): boolean => {
      const d = Phaser.Math.Distance.Between(px, py, x, y);
      if (d > reach + pad) return false;
      if (d <= pad + 16) return true;
      const off = Math.abs(Phaser.Math.Angle.Wrap(Phaser.Math.Angle.Between(px, py, x, y) - coneAim));
      return off <= halfAngle + Math.atan2(pad, d);
    };

    SoundSystem.playDrum();
    this.drawDrumCone(coneAim, reach, halfAngle, multiplier < 1);

    const critRoll = Math.random() < this.player.stats.critChance;
    const finalDamage = this.player.stats.damage * multiplier * (critRoll ? 2 : 1);
    const kb = 28 + (this.player.stats.fightPower || 0) * 1.5;

    for (const enemy of activeEnemies) {
      if (!enemy.active || !inCone(enemy.x, enemy.y, 12)) continue;
      const a = Phaser.Math.Angle.Between(px, py, enemy.x, enemy.y);
      this.enemyManager?.damageEnemy(enemy, finalDamage, critRoll, Math.cos(a) * kb, Math.sin(a) * kb);
    }

    this.bossManager?.damageWhere(inCone, finalDamage, critRoll);

    // The beat drowns out enemy bullets inside the cone
    const enemyBullets = this.enemyManager?.enemyProjectiles?.getChildren() as Phaser.Physics.Arcade.Image[] | undefined;
    let silenced = 0;
    for (const eb of enemyBullets ?? []) {
      if (eb.active && inCone(eb.x, eb.y)) {
        eb.setActive(false).setVisible(false).setVelocity(0, 0);
        silenced++;
      }
    }
    if (silenced > 0) {
      DamageNumberSystem.showDamage(px + Math.cos(coneAim) * 60, py + Math.sin(coneAim) * 60 - 12, 'DẬP TẮT', 'crit');
    }
    return true;
  }

  private drawDrumCone(aim: number, reach: number, halfAngle: number, isFollowUp: boolean): void {
    const g = this.scene.add.graphics({ x: this.player.x, y: this.player.y });
    g.setDepth(12);
    g.fillStyle(0xf59e0b, isFollowUp ? 0.2 : 0.32);
    g.slice(0, 0, reach, aim - halfAngle, aim + halfAngle, false);
    g.fillPath();
    // Three bronze sound-wave arcs, like rings spreading from a drum
    g.lineStyle(isFollowUp ? 3 : 4, 0xb45309, 0.9);
    for (const f of [0.45, 0.7, 0.95]) {
      g.beginPath();
      g.arc(0, 0, reach * f, aim - halfAngle * 0.9, aim + halfAngle * 0.9, false);
      g.strokePath();
    }
    // Spread out at full strength, then fade, so the cone is readable
    g.setScale(0.35);
    this.scene.tweens.add({
      targets: g,
      scale: 1,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.scene.tweens.add({ targets: g, alpha: 0, duration: 240, onComplete: () => g.destroy() });
      },
    });
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
