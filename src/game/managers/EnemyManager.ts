import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { XPManager } from './XPManager';
import { EnemyConfig } from '../types/data';
import { DataLoader } from '../../data/loader';

export class EnemyManager {
  private scene: Phaser.Scene;
  private player: Player;
  private xpManager: XPManager;
  public enemies: Phaser.Physics.Arcade.Group;
  public enemyProjectiles: Phaser.Physics.Arcade.Group;

  public totalKills: number = 0;
  private enemyConfigs: Map<string, EnemyConfig> = new Map();

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

  public update(dt: number): void {
    const activeList = this.getActiveEnemies();
    const px = this.player.x;
    const py = this.player.y;

    for (const enemy of activeList) {
      const aiResult = enemy.updateAI(px, py, dt);

      // Handle ranged projectile shoot
      if (aiResult.shouldShoot) {
        this.fireEnemyBullet(enemy.x, enemy.y, px, py);
      }

      // Handle duplication (Tin Giả)
      if (aiResult.shouldDuplicate) {
        this.spawnEnemy(enemy.config.id, enemy.x + 20, enemy.y + 20);
      }

      // Check collision with player
      const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, px, py);
      if (distToPlayer < 24) {
        this.player.takeDamage(enemy.damage);
      }
    }

    // Check collision between enemy projectiles and player
    this.updateEnemyProjectiles(px, py);
  }

  private fireEnemyBullet(fromX: number, fromY: number, targetX: number, targetY: number): void {
    const bullet = this.enemyProjectiles.get(fromX, fromY, 'enemy_bullet') as Phaser.Physics.Arcade.Image;
    if (!bullet) return;

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setDepth(14);

    const angle = Phaser.Math.Angle.Between(fromX, fromY, targetX, targetY);
    const speed = 190;
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

  private updateEnemyProjectiles(px: number, py: number): void {
    const bullets = this.enemyProjectiles.getChildren() as Phaser.Physics.Arcade.Image[];
    for (const b of bullets) {
      if (!b.active) continue;
      const d = Phaser.Math.Distance.Between(b.x, b.y, px, py);
      if (d < 18) {
        this.player.takeDamage(10);
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
        let dmg = bullet.damage;

        // Weakness calculation
        if (enemy.config.weakAgainst?.some(pillar => this.player.values[pillar as keyof typeof this.player.values] > 0)) {
          dmg *= 1.25;
        }

        const isDead = enemy.takeDamage(dmg, bullet.isCrit);
        bullet.onHit();

        if (isDead) {
          this.totalKills++;
          this.xpManager.dropXP(enemy.x, enemy.y, enemy.xpDrop);
        }

        if (!bullet.active) break;
      }
    }
  }

  public getActiveEnemies(): Enemy[] {
    return (this.enemies.getChildren() as Enemy[]).filter(e => e.active);
  }
}
