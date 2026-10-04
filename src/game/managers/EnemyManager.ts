import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { XPManager } from './XPManager';
import { EnemyConfig } from '../types/data';
import { DataLoader } from '../../data/loader';
import { SoundSystem } from '../systems/SoundSystem';
import { WeaponSystem } from './WeaponSystem';

export class EnemyManager {
  private scene: Phaser.Scene;
  private player: Player;
  private xpManager: XPManager;
  public enemies: Phaser.Physics.Arcade.Group;
  public enemyProjectiles: Phaser.Physics.Arcade.Group;

  public totalKills: number = 0;
  private enemyConfigs: Map<string, EnemyConfig> = new Map();
  private auraTickTimer: number = 0;

  // Active buffs & evolution modifiers
  public auraSlowBonus: number = 0;
  public auraRadiusBonus: number = 0;
  public globalEnemySpeedMultiplier: number = 1.0;
  public weaponSystem?: WeaponSystem;

  constructor(scene: Phaser.Scene, player: Player, xpManager: XPManager) {
    this.scene = scene;
    this.player = player;
    this.xpManager = xpManager;

    this.enemies = scene.physics.add.group({
      classType: Enemy,
      maxSize: 200,
      runChildUpdate: false,
    });

    this.enemyProjectiles = scene.physics.add.group({
      defaultKey: 'enemy_bullet',
      maxSize: 40,
    });

    // Cache enemy configurations
    const configs = DataLoader.getEnemies();
    for (const cfg of configs) {
      this.enemyConfigs.set(cfg.id, cfg);
    }
  }

  public spawnEnemy(enemyId: string, customX?: number, customY?: number): Enemy | null {
    const config = this.enemyConfigs.get(enemyId) || DataLoader.getEnemies()[0];
    const enemy = this.enemies.get() as Enemy;
    if (!enemy) return null;

    let spawnX = customX;
    let spawnY = customY;

    if (spawnX === undefined || spawnY === undefined) {
      // Pick random off-screen edge around camera view
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(550, 700);
      spawnX = this.player.x + Math.cos(angle) * distance;
      spawnY = this.player.y + Math.sin(angle) * distance;
    }

    enemy.spawn(spawnX, spawnY, config);
    return enemy;
  }

  public currentRunSeconds: number = 0;

  public getScaledEnemyDamage(baseDamage: number): number {
    const timeScaling = 1 + (this.currentRunSeconds / 60) * 0.05;
    return Math.max(1, Math.round(baseDamage * timeScaling));
  }

  public update(dt: number, runSeconds: number = 0): void {
    this.currentRunSeconds = runSeconds;
    const activeList = this.getActiveEnemies();
    const px = this.player.x;
    const py = this.player.y;

    for (const enemy of activeList) {
      const aiResult = enemy.updateAI(px, py, dt, this.globalEnemySpeedMultiplier);

      // Handle ranged projectile shoot
      if (aiResult.shouldShoot) {
        const bulletDmg = this.getScaledEnemyDamage(enemy.damage);
        this.fireEnemyBullet(enemy.x, enemy.y, px, py, bulletDmg, undefined, `Đạn của ${enemy.config.name}`);
      }

      // Handle duplication (Tin Giả)
      if (aiResult.shouldDuplicate) {
        this.spawnEnemy(enemy.config.id, enemy.x + 20, enemy.y + 20);
      }

      // Check collision with player
      enemy.contactTimer += dt / 1000;
      const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, px, py);
      if (distToPlayer < 24 && enemy.contactTimer >= 0.75) {
        enemy.contactTimer = 0;
        this.player.takeDamage(this.getScaledEnemyDamage(enemy.damage), enemy.config.name);
      }
    }

    // Check collision between enemy projectiles and player
    this.updateEnemyProjectiles(px, py);

    // Aura pulse damage & slow (Đại Chúng, Thiện, Mỹ pillars)
    this.updateAuraEffects(dt, px, py);
  }

  private updateAuraEffects(dt: number, px: number, py: number): void {
    const v = this.player.values;
    if (v.daiChung === 0 && v.thien === 0 && v.my === 0 && v.build === 0 && this.auraRadiusBonus === 0) return;

    this.auraTickTimer += dt / 1000;
    if (this.auraTickTimer >= 0.8) {
      this.auraTickTimer = 0;

      const auraRadius = 130 + v.daiChung * 18 + v.my * 10 + this.auraRadiusBonus;
      const auraDmg = v.daiChung * 4 + v.build * 3 + v.my * 3 + Math.floor(this.player.stats.buildPower * 0.4);
      const slowMult = Math.max(0.2, 0.7 - this.auraSlowBonus);
      const activeList = this.getActiveEnemies();

      for (const enemy of activeList) {
        const d = Phaser.Math.Distance.Between(px, py, enemy.x, enemy.y);
        if (d <= auraRadius) {
          // Slow down
          if (enemy.body) {
            enemy.setVelocity(enemy.body.velocity.x * slowMult, enemy.body.velocity.y * slowMult);
          }

          if (auraDmg > 0) {
            const isDead = enemy.takeDamage(auraDmg, false);
            if (isDead) {
              this.totalKills++;
              this.spawnDeathSparks(enemy.x, enemy.y);
              this.xpManager.dropXP(enemy.x, enemy.y, enemy.xpDrop);
            }
          }
        }
      }
    }
  }

  public fireEnemyBullet(fromX: number, fromY: number, targetX: number, targetY: number, damage: number = 10, speedOverride?: number, sourceName?: string): void {
    const bullet = this.enemyProjectiles.get(fromX, fromY, 'enemy_bullet') as Phaser.Physics.Arcade.Image;
    if (!bullet) return;

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setDepth(14);
    bullet.setData('damage', damage);
    bullet.setData('sourceName', sourceName || 'Đạn của quái vật');

    const angle = Phaser.Math.Angle.Between(fromX, fromY, targetX, targetY);
    const speed = (speedOverride || 190) * this.globalEnemySpeedMultiplier;
    bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // Auto cleanup after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      if (bullet.active) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.setVelocity(0, 0);
      }
    });
  }

  public clearEnemyBullets(): void {
    const bullets = this.enemyProjectiles.getChildren() as Phaser.Physics.Arcade.Image[];
    for (const b of bullets) {
      if (b.active) {
        b.setActive(false);
        b.setVisible(false);
        b.setVelocity(0, 0);
      }
    }
  }

  private updateEnemyProjectiles(px: number, py: number): void {
    const bullets = this.enemyProjectiles.getChildren() as Phaser.Physics.Arcade.Image[];
    for (const b of bullets) {
      if (!b.active) continue;
      const d = Phaser.Math.Distance.Between(b.x, b.y, px, py);
      if (d < 18) {
        const bulletDmg = (b.getData('damage') as number) || 10;
        const source = (b.getData('sourceName') as string) || 'Đạn của quái vật';
        this.player.takeDamage(bulletDmg, source);
        b.setActive(false);
        b.setVisible(false);
        b.setVelocity(0, 0);
      }
    }
  }

  public handleBulletHits(bullet: Projectile): void {
    if (!bullet.active) return;

    const activeList = this.getActiveEnemies();
    for (const enemy of activeList) {
      if (!enemy.active) continue;

      const dist = Phaser.Math.Distance.Between(bullet.x, bullet.y, enemy.x, enemy.y);
      const hitRadius = enemy.enemyType === 'elite' ? 24 : 16;

      if (dist <= hitRadius) {
        SoundSystem.playHit();
        let dmg = bullet.damage;

        // Weakness calculation (+25% bonus)
        if (enemy.config.weakAgainst?.some(pillar => this.player.values[pillar as keyof typeof this.player.values] > 0)) {
          dmg *= 1.25;
        }

        // Fight Power (Chống) bonus damage (+1.5% per point)
        if (this.player.stats.fightPower > 0) {
          dmg *= (1 + this.player.stats.fightPower * 0.015);
        }

        // Evolution: Kiem Chung bonus vs Tin Gia (+50%)
        if (this.weaponSystem?.bonusVsTinGiaMultiplier && this.weaponSystem.bonusVsTinGiaMultiplier > 1.0 && enemy.config.id === 'tinGia') {
          dmg *= this.weaponSystem.bonusVsTinGiaMultiplier;
        }

        // Knockback (Chống / Fight pillar strengthens knockback)
        const angle = Phaser.Math.Angle.Between(bullet.x, bullet.y, enemy.x, enemy.y);
        const kb = 25 + this.player.values.fight * 10 + this.player.stats.fightPower * 2;
        enemy.x += Math.cos(angle) * kb * 0.15;
        enemy.y += Math.sin(angle) * kb * 0.15;

        const isDead = enemy.takeDamage(dmg, bullet.isCrit);
        bullet.onHit();

        if (isDead) {
          this.totalKills++;
          this.spawnDeathSparks(enemy.x, enemy.y);
          this.xpManager.dropXP(enemy.x, enemy.y, enemy.xpDrop);
        }

        if (!bullet.active) break;
      }
    }
  }

  private spawnDeathSparks(x: number, y: number): void {
    for (let i = 0; i < 4; i++) {
      const spark = this.scene.add.image(x, y, 'spark');
      spark.setDepth(13);
      spark.setTint(Phaser.Math.RND.pick([0x00f0ff, 0x10b981, 0xfacc15, 0xa855f7]));
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(15, 35);

      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 350,
        onComplete: () => spark.destroy(),
      });
    }
  }

  public getActiveEnemies(): Enemy[] {
    return (this.enemies.getChildren() as Enemy[]).filter(e => e.active);
  }
}
