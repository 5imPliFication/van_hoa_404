import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EnemyManager } from './EnemyManager';
import { CommunityMeterManager } from './CommunityMeterManager';
import { XPManager } from './XPManager';
import { BossConfig } from '../types/data';
import { DataLoader } from '../../data/loader';
import { SoundSystem } from '../systems/SoundSystem';
import { Projectile } from '../entities/Projectile';

export class BossManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemyManager: EnemyManager;
  private communityMeter: CommunityMeterManager;
  private xpManager: XPManager;
  private onBossDefeatedCallback: (isFinal: boolean) => void;

  private allBossConfigs: BossConfig[] = [];
  private spawnedBossIndexes: Set<number> = new Set();
  public currentBossIndex: number = -1;
  public currentBossConfig?: BossConfig;
  public bossSprite?: Phaser.Physics.Arcade.Sprite;
  public isBossActive: boolean = false;
  public bossHp: number = 0;
  public bossMaxHp: number = 0;
  public currentPhaseIndex: number = 0;
  private attackTimer: number = 0;

  // Boss 1 Swarm mechanic
  private swarmTimer: number = 0;
  public tinySwarmGroup: Phaser.Physics.Arcade.Group;

  // Boss 2 DOT mechanic
  private dotTimer: number = 0;
  private toxicAuraGfx?: Phaser.GameObjects.Graphics;

  // Boss 3 Shield & Dash & Clone mechanic
  private dashTimer: number = 0;
  private isDashing: boolean = false;
  private clones: Phaser.Physics.Arcade.Sprite[] = [];

  constructor(
    scene: Phaser.Scene,
    player: Player,
    enemyManager: EnemyManager,
    communityMeter: CommunityMeterManager,
    xpManager: XPManager,
    onBossDefeated: (isFinal: boolean) => void
  ) {
    this.scene = scene;
    this.player = player;
    this.enemyManager = enemyManager;
    this.communityMeter = communityMeter;
    this.xpManager = xpManager;
    this.onBossDefeatedCallback = onBossDefeated;
    this.allBossConfigs = DataLoader.getBosses();

    // Group for Boss 1 fast tiny swarmers
    this.tinySwarmGroup = scene.physics.add.group({
      defaultKey: 'tiny_swarm',
      maxSize: 60,
    });
  }

  /**
   * Checks the 4 timeline milestones (3m = 180s, 5m = 300s, 7m = 420s, 10m = 600s)
   */
  public checkTimeline(runSeconds: number): void {
    if (this.isBossActive) return;

    if (runSeconds >= 180 && !this.spawnedBossIndexes.has(0)) {
      this.spawnBossByIndex(0);
    } else if (runSeconds >= 300 && !this.spawnedBossIndexes.has(1)) {
      this.spawnBossByIndex(1);
    } else if (runSeconds >= 420 && !this.spawnedBossIndexes.has(2)) {
      this.spawnBossByIndex(2);
    } else if (runSeconds >= 600 && !this.spawnedBossIndexes.has(3)) {
      this.spawnBossByIndex(3);
    }
  }

  public spawnBossByIndex(index: number): void {
    const config = this.allBossConfigs[index];
    if (!config) return;

    this.spawnedBossIndexes.add(index);
    this.currentBossIndex = index;
    this.currentBossConfig = config;
    this.isBossActive = true;
    this.bossMaxHp = config.maxHp;
    this.bossHp = config.maxHp;
    this.currentPhaseIndex = 0;
    this.attackTimer = 0;
    this.swarmTimer = 0;
    this.dotTimer = 0;
    this.dashTimer = 0;
    this.isDashing = false;

    SoundSystem.playBossAlarm();

    const { width, height } = this.scene.scale;
    const textureKey = index === 0 ? 'boss_3min' : index === 1 ? 'boss_5min' : index === 2 ? 'boss_7min' : 'boss_10min';
    const radius = index === 0 ? 26 : index === 1 ? 30 : index === 2 ? 32 : 38;

    this.bossSprite = this.scene.physics.add.sprite(this.player.x, this.player.y - 320, textureKey);
    this.bossSprite.setDepth(20);
    this.bossSprite.setCircle(radius, radius * 0.15, radius * 0.15);

    // Initial entrance tween
    this.scene.tweens.add({
      targets: this.bossSprite,
      y: this.player.y - 180,
      duration: 1200,
      ease: 'Back.easeOut',
    });

    // Milestone announcement banner
    const timelineLabel = index === 0 ? '3 PHÚT' : index === 1 ? '5 PHÚT' : index === 2 ? '7 PHÚT' : '10 PHÚT';
    const warnContainer = this.scene.add.container(width / 2, height * 0.22);
    warnContainer.setDepth(110);
    warnContainer.setScrollFactor(0);

    const warnBg = this.scene.add.rectangle(0, 0, 720, 68, 0xfee2e2, 0.95);
    warnBg.setStrokeStyle(2, 0xdc2626);

    const warnTitle = this.scene.add.text(0, -14, `⚠️ TRÙM MỐC ${timelineLabel}: ${config.name} ⚠️`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#dc2626',
      resolution: 2,
    }).setOrigin(0.5);

    const warnDesc = this.scene.add.text(0, 14, config.testDescription || '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#991b1b',
      resolution: 2,
    }).setOrigin(0.5);

    warnContainer.add([warnBg, warnTitle, warnDesc]);

    this.scene.tweens.add({
      targets: warnContainer,
      alpha: 0,
      duration: 1000,
      delay: 2500,
      onComplete: () => warnContainer.destroy(),
    });

    // Boss 2: Toxic Aura graphics initialization
    if (config.mechanicType === 'dot') {
      this.toxicAuraGfx = this.scene.add.graphics();
      this.toxicAuraGfx.setDepth(18);
    }

    // Boss 3: Spawn 2 phantom illusion clones
    if (config.mechanicType === 'shield_dash') {
      this.spawnClones();
    }
  }

  private spawnClones(): void {
    this.clearClones();
    if (!this.bossSprite) return;
    for (let i = 0; i < 2; i++) {
      const clone = this.scene.physics.add.sprite(
        this.bossSprite.x + (i === 0 ? -60 : 60),
        this.bossSprite.y + (i === 0 ? -40 : 40),
        'boss_clone'
      );
      clone.setDepth(19);
      clone.setCircle(20);
      this.clones.push(clone);
    }
  }

  private clearClones(): void {
    for (const c of this.clones) {
      if (c && c.active) c.destroy();
    }
    this.clones = [];
  }

  public update(dt: number): void {
    if (!this.isBossActive || !this.bossSprite?.active || !this.currentBossConfig) return;

    const dtSec = dt / 1000;
    const px = this.player.x;
    const py = this.player.y;
    const bx = this.bossSprite.x;
    const by = this.bossSprite.y;
    const mechanic = this.currentBossConfig.mechanicType;

    // 1. Movement logic based on mechanic
    if (mechanic === 'shield_dash') {
      // Boss 3: Dash mechanic
      this.dashTimer += dtSec;
      if (this.isDashing) {
        if (this.dashTimer >= 0.7) {
          this.isDashing = false;
          this.dashTimer = 0;
          this.bossSprite.clearTint();
        }
      } else {
        if (this.dashTimer >= 4.0) {
          // Initiate high speed dash towards player
          this.isDashing = true;
          this.dashTimer = 0;
          this.bossSprite.setTint(0x06b6d4);
          const angle = Phaser.Math.Angle.Between(bx, by, px, py);
          this.bossSprite.setVelocity(Math.cos(angle) * 320, Math.sin(angle) * 320);
        } else {
          // Standard chase
          const angle = Phaser.Math.Angle.Between(bx, by, px, py);
          this.bossSprite.setVelocity(Math.cos(angle) * this.currentBossConfig.speed, Math.sin(angle) * this.currentBossConfig.speed);
        }
      }

      // Update Clones
      this.clones.forEach((clone, idx) => {
        if (clone && clone.active) {
          const orbitAngle = (this.scene.time.now / 600) + (idx * Math.PI);
          clone.setPosition(bx + Math.cos(orbitAngle) * 85, by + Math.sin(orbitAngle) * 85);
        }
      });
    } else {
      // Standard chase towards player
      const angle = Phaser.Math.Angle.Between(bx, by, px, py);
      const speed = this.currentBossConfig.speed * (this.currentPhaseIndex === 1 ? 1.35 : 1.0);
      this.bossSprite.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    // 2. Boss 1 Swarm Mechanic: Spawn fast tiny runners every 3.5s
    if (mechanic === 'swarm') {
      this.swarmTimer += dtSec;
      if (this.swarmTimer >= 3.5) {
        this.swarmTimer = 0;
        this.spawnTinySwarm(10);
      }
      this.updateTinySwarm(px, py);
    }

    // 3. Boss 2 DOT Mechanic: Toxic Zone damages player over time (1.5s tick)
    if (mechanic === 'dot') {
      const distToPlayer = Phaser.Math.Distance.Between(bx, by, px, py);

      // Render toxic aura
      if (this.toxicAuraGfx) {
        this.toxicAuraGfx.clear();
        this.toxicAuraGfx.lineStyle(2, 0x16a34a, 0.6);
        this.toxicAuraGfx.strokeCircle(bx, by, 280);
        this.toxicAuraGfx.fillStyle(0x22c55e, 0.08);
        this.toxicAuraGfx.fillCircle(bx, by, 280);
      }

      if (distToPlayer <= 280) {
        this.dotTimer += dtSec;
        if (this.dotTimer >= 1.5) {
          this.dotTimer = 0;
          this.player.takeDamage(3); // Absorbed by shield or healed by Thiện
        }
      } else {
        this.dotTimer = 0;
      }
    }

    // 4. Attack pattern timer
    this.attackTimer += dtSec;
    const currentPhase = this.currentBossConfig.phases[this.currentPhaseIndex] || this.currentBossConfig.phases[0];
    const cd = currentPhase?.attackCooldown || 2.5;

    if (this.attackTimer >= cd) {
      this.attackTimer = 0;
      this.performBossAttack(bx, by, px, py, mechanic);
    }

    // Community drain in later phases or final boss
    if (currentPhase.communityMeterDrainPerSecond > 0) {
      this.communityMeter.modify(-currentPhase.communityMeterDrainPerSecond * dtSec);
    }
  }

  private spawnTinySwarm(count: number): void {
    if (!this.bossSprite?.active) return;
    const bx = this.bossSprite.x;
    const by = this.bossSprite.y;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const minion = this.tinySwarmGroup.get(
        bx + Math.cos(angle) * 35,
        by + Math.sin(angle) * 35,
        'tiny_swarm'
      ) as Phaser.Physics.Arcade.Sprite;

      if (minion) {
        minion.setActive(true).setVisible(true).setDepth(15);
        minion.setData('hp', 8);
        minion.setCircle(5);
      }
    }
  }

  private updateTinySwarm(px: number, py: number): void {
    const minions = this.tinySwarmGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const m of minions) {
      if (!m.active) continue;

      // Charge directly at player at high velocity (215 px/s)
      const angle = Phaser.Math.Angle.Between(m.x, m.y, px, py);
      const speed = 215;
      m.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

      // Hit player
      const dist = Phaser.Math.Distance.Between(m.x, m.y, px, py);
      if (dist < 20) {
        this.player.takeDamage(4);
        m.setActive(false).setVisible(false);
        m.setVelocity(0, 0);
      }
    }
  }

  private performBossAttack(bx: number, by: number, px: number, py: number, mechanic?: string): void {
    if (mechanic === 'swarm') {
      // 5-way fan shot
      const targetAngle = Phaser.Math.Angle.Between(bx, by, px, py);
      for (const off of [-0.3, -0.15, 0, 0.15, 0.3]) {
        this.fireProjectile(bx, by, targetAngle + off, 180);
      }
    } else if (mechanic === 'dot') {
      // 3 orbiting or slow toxic balls
      const targetAngle = Phaser.Math.Angle.Between(bx, by, px, py);
      for (const off of [-0.25, 0, 0.25]) {
        this.fireProjectile(bx, by, targetAngle + off, 160);
      }
    } else if (mechanic === 'shield_dash') {
      // 8-way burst
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        this.fireProjectile(bx, by, angle, 190);
      }
    } else {
      // Final Boss: Phase-based attacks
      if (this.currentPhaseIndex === 0) {
        // 8-way spread
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          this.fireProjectile(bx, by, angle, 170);
        }
      } else if (this.currentPhaseIndex === 1) {
        // Rapid aimed tri-shot
        const targetAngle = Phaser.Math.Angle.Between(bx, by, px, py);
        for (const off of [-0.2, 0, 0.2]) {
          this.fireProjectile(bx, by, targetAngle + off, 240);
        }
      } else {
        // 12-way apocalyptic spread + minion spawns
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 * i) / 12;
          this.fireProjectile(bx, by, angle, 200);
        }
        this.enemyManager.spawnEnemy('xuyenTacVanHoa', bx + 30, by);
      }
    }
  }

  private fireProjectile(fromX: number, fromY: number, angle: number, speed: number): void {
    const b = this.enemyManager.enemyProjectiles.get(fromX, fromY, 'enemy_bullet') as Phaser.Physics.Arcade.Image;
    if (b) {
      b.setActive(true).setVisible(true).setDepth(14);
      b.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.scene.time.delayedCall(3200, () => {
        if (b.active) b.setActive(false).setVisible(false).setVelocity(0, 0);
      });
    }
  }

  public takeDamage(amount: number, isCrit: boolean = false): boolean {
    if (!this.isBossActive || !this.bossSprite?.active || !this.currentBossConfig) return false;

    // Boss 3 Phantom Shield: Reduces non-crit damage by 50% unless player has high Fight Power
    if (this.currentBossConfig.mechanicType === 'shield_dash') {
      if (!isCrit && this.player.stats.fightPower < 10) {
        amount *= 0.5;
      }
    }

    this.bossHp -= amount;
    this.bossSprite.setTint(0xff5555);
    this.scene.time.delayedCall(70, () => {
      if (this.bossSprite?.active) this.bossSprite.clearTint();
    });

    const hpPercent = (this.bossHp / this.bossMaxHp) * 100;

    // Check phase transition for Final Boss
    if (this.currentBossConfig.mechanicType === 'final') {
      if (this.currentPhaseIndex === 0 && hpPercent <= 65) {
        this.currentPhaseIndex = 1;
        this.announcePhase('GIAI ĐOẠN 2: BẠO LỰC & CỰC HÓA');
      } else if (this.currentPhaseIndex === 1 && hpPercent <= 30) {
        this.currentPhaseIndex = 2;
        this.announcePhase('GIAI ĐOẠN 3: KHỦNG HOẢNG TOÀN DIỆN');
      }
    }

    if (this.bossHp <= 0) {
      this.defeatCurrentBoss();
      return true;
    }

    return false;
  }

  private defeatCurrentBoss(): void {
    if (!this.bossSprite || !this.currentBossConfig) return;

    const bx = this.bossSprite.x;
    const by = this.bossSprite.y;
    const isFinal = this.currentBossIndex === 3;
    const bossName = this.currentBossConfig.name;

    // Cleanup boss entities
    this.bossSprite.destroy();
    this.toxicAuraGfx?.destroy();
    this.toxicAuraGfx = undefined;
    this.clearClones();

    // Cleanup tiny swarm
    const minions = this.tinySwarmGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const m of minions) {
      if (m.active) {
        m.setActive(false).setVisible(false).setVelocity(0, 0);
      }
    }

    // Drop huge XP shower (25-35 gems)
    const gemCount = isFinal ? 40 : 25;
    for (let i = 0; i < gemCount; i++) {
      const angle = (Math.PI * 2 * i) / gemCount;
      const dist = Phaser.Math.Between(20, 75);
      this.xpManager.dropXP(bx + Math.cos(angle) * dist, by + Math.sin(angle) * dist, 3);
    }

    // Restore Community Meter
    this.communityMeter.modify(25);
    this.isBossActive = false;

    if (isFinal) {
      // 10-minute boss defeated -> Victory!
      this.onBossDefeatedCallback(true);
    } else {
      // Milestone Boss 1, 2, or 3 defeated -> Celebrate & continue run!
      SoundSystem.playLevelUp();

      const { width, height } = this.scene.scale;
      const toast = this.scene.add.container(width / 2, height * 0.22);
      toast.setDepth(110);
      toast.setScrollFactor(0);

      const bg = this.scene.add.rectangle(0, 0, 700, 60, 0xdcfce7, 0.96);
      bg.setStrokeStyle(2, 0x16a34a);

      const text = this.scene.add.text(0, 0, `✨ ĐÃ ĐẨY LÙI ${bossName}! CHIẾN TRƯỜNG TIẾP TỤC! ✨`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#15803d',
        resolution: 2,
      }).setOrigin(0.5);

      toast.add([bg, text]);

      this.scene.tweens.add({
        targets: toast,
        alpha: 0,
        duration: 800,
        delay: 2400,
        onComplete: () => toast.destroy(),
      });

      this.onBossDefeatedCallback(false);
    }
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

  public handleBulletHits(projectile: Projectile, fightPowerBonusMultiplier: number = 0): boolean {
    if (!this.isBossActive || !projectile.active) return false;

    // 1. Check hitting clones (Boss 3 decoy shields)
    for (const clone of this.clones) {
      if (clone && clone.active && projectile.active) {
        const dist = Phaser.Math.Distance.Between(projectile.x, projectile.y, clone.x, clone.y);
        if (dist < 26) {
          // Clone absorbs hit
          clone.setAlpha(0.25);
          this.scene.tweens.add({
            targets: clone,
            alpha: 0.85,
            duration: 160,
          });
          this.showDamageText(clone.x, clone.y - 20, 'Ảo ảnh', false, '#94a3b8');
          projectile.onHit();
          return true;
        }
      }
    }

    // 2. Check hitting tiny swarm minions (Boss 1 fast swarms)
    const minions = this.tinySwarmGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const m of minions) {
      if (m.active && projectile.active) {
        const dist = Phaser.Math.Distance.Between(projectile.x, projectile.y, m.x, m.y);
        if (dist < 18) {
          let hp = (m.getData('hp') ?? 8) - projectile.damage;
          m.setData('hp', hp);
          this.showDamageText(m.x, m.y - 12, Math.round(projectile.damage), projectile.isCrit);
          if (hp <= 0) {
            m.setActive(false).setVisible(false).setVelocity(0, 0);
            this.xpManager.dropXP(m.x, m.y, 1);
          }
          projectile.onHit();
          if (!projectile.isPierce) return true;
        }
      }
    }

    // 3. Check hitting the main boss
    if (this.bossSprite?.active && projectile.active) {
      const dist = Phaser.Math.Distance.Between(projectile.x, projectile.y, this.bossSprite.x, this.bossSprite.y);
      if (dist < 42) {
        let dmg = projectile.damage;
        if (fightPowerBonusMultiplier > 0) {
          dmg *= (1 + fightPowerBonusMultiplier);
        }
        this.takeDamage(dmg, projectile.isCrit);
        this.showDamageText(this.bossSprite.x, this.bossSprite.y - 35, Math.round(dmg), projectile.isCrit);
        projectile.onHit();
        return true;
      }
    }

    return false;
  }

  private showDamageText(x: number, y: number, text: string | number, isCrit: boolean = false, customColor?: string): void {
    const dmgText = this.scene.add.text(
      x + Phaser.Math.Between(-8, 8),
      y - 12,
      text.toString(),
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: isCrit ? '16px' : '12px',
        fontStyle: isCrit ? 'bold' : 'normal',
        color: customColor || (isCrit ? '#facc15' : '#ffffff'),
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

  public getBossSprite(): Phaser.Physics.Arcade.Sprite | undefined {
    return this.bossSprite;
  }
}
