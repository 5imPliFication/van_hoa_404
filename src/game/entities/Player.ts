import Phaser from 'phaser';
import { PlayerStats, CulturalValues, INITIAL_PLAYER_STATS, Pillar } from '../types/player';
import { UpgradeConfig } from '../types/data';
import { DamageNumberSystem } from '../systems/DamageNumberSystem';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public stats: PlayerStats;
  public values: CulturalValues;
  public level: number = 1;
  public currentXP: number = 0;
  public nextLevelXP: number = 10;
  public isAlive: boolean = true;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private auraRing?: Phaser.GameObjects.Image;
  private buffAuraGfx?: Phaser.GameObjects.Graphics;
  public shadow: Phaser.GameObjects.Image;
  private thrusterTimer: number = 0;
  private healTimer: number = 0;
  public healPerInterval: number = 0;
  public touchVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  public lastDamagedBy: string = 'Hiện tượng tiêu cực trên mạng';
  public communityMeter?: any;
  public manualAimAngle: number | null = null;

  public getStatLevel(pillar: Pillar): number {
    return this.values[pillar] || 0;
  }

  public isStatMaxed(pillar: Pillar): boolean {
    return (this.values[pillar] || 0) >= 5;
  }

  public areAllStatsMaxed(): boolean {
    const pillars: Pillar[] = ['danToc', 'khoaHoc', 'daiChung', 'chan', 'thien', 'my', 'build', 'fight'];
    return pillars.every(p => (this.values[p] || 0) >= 5);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    this.stats = { ...INITIAL_PLAYER_STATS };
    this.values = {
      danToc: 0,
      khoaHoc: 0,
      daiChung: 0,
      chan: 0,
      thien: 0,
      my: 0,
      build: 0,
      fight: 0,
    };

    // Soft drop shadow beneath player
    this.shadow = scene.add.image(x, y + 14, 'drop_shadow');
    this.shadow.setDepth(8);
    this.shadow.setScale(1.2, 0.7);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setCircle(15, 11, 11);
    this.setDepth(10);

    // Keyboard inputs
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Aura ring visual
    this.auraRing = scene.add.image(x, y, 'aura_ring');
    this.auraRing.setDepth(9);
    this.auraRing.setScale(0.8);
    this.auraRing.setVisible(false);
  }

  public setBuffActive(active: boolean): void {
    if (active) {
      if (!this.buffAuraGfx) {
        this.buffAuraGfx = this.scene.add.graphics();
        this.buffAuraGfx.setDepth(9);
      }
      this.buffAuraGfx.setVisible(true);
      this.setTint(0x7dd3fc); // Cyan cyber tint
    } else {
      if (this.buffAuraGfx) {
        this.buffAuraGfx.clear();
        this.buffAuraGfx.setVisible(false);
      }
      this.clearTint();
    }
  }

  update(dt: number): void {
    if (!this.isAlive) return;

    this.handleMovement();

    // Update shadow position to track player
    if (this.shadow) {
      this.shadow.setPosition(this.x, this.y + 14);
    }

    // Update aura visual position
    if (this.auraRing && this.auraRing.visible) {
      this.auraRing.setPosition(this.x, this.y);
      this.auraRing.rotation += 0.01;
    }

    // Update visual cue for active scenario buff
    if (this.buffAuraGfx && this.buffAuraGfx.visible) {
      this.buffAuraGfx.clear();
      const pulse = 24 + Math.sin(this.scene.time.now / 130) * 4;
      this.buffAuraGfx.lineStyle(2.5, 0xf59e0b, 0.9);
      this.buffAuraGfx.strokeCircle(this.x, this.y, pulse);
      this.buffAuraGfx.fillStyle(0xfef08a, 0.15);
      this.buffAuraGfx.fillCircle(this.x, this.y, pulse);

      const angle = this.scene.time.now / 220;
      this.buffAuraGfx.fillStyle(0x06b6d4, 1);
      this.buffAuraGfx.fillCircle(this.x + Math.cos(angle) * (pulse + 5), this.y + Math.sin(angle) * (pulse + 5), 3.5);
      this.buffAuraGfx.fillCircle(this.x - Math.cos(angle) * (pulse + 5), this.y - Math.sin(angle) * (pulse + 5), 3.5);
    }

    // Passive regeneration (Thiện pillar boosted by Build power)
    if (this.healPerInterval > 0) {
      this.healTimer += dt / 1000;
      if (this.healTimer >= 5) {
        const healAmt = this.healPerInterval * (1 + this.stats.buildPower * 0.02);
        this.heal(healAmt);
        this.healTimer = 0;
      }
    }
  }

  private spawnThrusterParticle(): void {
    const angle = this.rotation - Math.PI / 2;
    const rearDist = 18;
    const px = this.x + Math.cos(angle) * rearDist + Phaser.Math.Between(-3, 3);
    const py = this.y + Math.sin(angle) * rearDist + Phaser.Math.Between(-3, 3);
    const spark = this.scene.add.image(px, py, 'spark');
    spark.setDepth(9);
    spark.setScale(0.9);
    spark.setTint(Phaser.Math.RND.pick([0x38bdf8, 0x00f0ff, 0x0284c7]));
    this.scene.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 0.1,
      duration: 240,
      onComplete: () => spark.destroy(),
    });
  }

  private handleMovement(): void {
    let vx = 0;
    let vy = 0;

    // Movement strictly with WASD
    const left = this.wasdKeys?.A?.isDown;
    const right = this.wasdKeys?.D?.isDown;
    const up = this.wasdKeys?.W?.isDown;
    const down = this.wasdKeys?.S?.isDown;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    // Merge touch/virtual joystick input
    if (this.touchVelocity.lengthSq() > 0.01) {
      vx = this.touchVelocity.x;
      vy = this.touchVelocity.y;
    } else if (vx !== 0 && vy !== 0) {
      // Normalize diagonal keyboard movement
      const factor = Math.SQRT1_2;
      vx *= factor;
      vy *= factor;
    }

    this.setVelocity(vx * this.stats.moveSpeed, vy * this.stats.moveSpeed);

    // Aiming with Arrow keys (Up / Down / Left / Right)
    let aimX = 0;
    let aimY = 0;
    if (this.cursors?.left?.isDown) aimX -= 1;
    if (this.cursors?.right?.isDown) aimX += 1;
    if (this.cursors?.up?.isDown) aimY -= 1;
    if (this.cursors?.down?.isDown) aimY += 1;

    if (aimX !== 0 || aimY !== 0) {
      // Manual aim active: face the manual aim direction
      this.manualAimAngle = Math.atan2(aimY, aimX);
      this.setRotation(this.manualAimAngle + Math.PI / 2);
    } else {
      // No arrow keys pressed: reset manual aim so WeaponSystem defaults to auto-aim
      this.manualAimAngle = null;
      if (vx !== 0 || vy !== 0) {
        this.setRotation(Math.atan2(vy, vx) + Math.PI / 2);
      }
    }

    if (vx !== 0 || vy !== 0) {
      this.thrusterTimer += 0.016;
      if (this.thrusterTimer > 0.06) {
        this.thrusterTimer = 0;
        this.spawnThrusterParticle();
      }
    }
  }

  public takeDamage(amount: number, sourceName: string = 'Hiện tượng tiêu cực trên mạng'): boolean {
    if (!this.isAlive) return false;
    this.lastDamagedBy = sourceName;

    if (amount > 0) {
      DamageNumberSystem.showDamage(this.x, this.y - 14, amount, 'player');
    }

    let remaining = amount;
    if (this.stats.shield > 0) {
      if (this.stats.shield >= remaining) {
        this.stats.shield -= remaining;
        remaining = 0;
      } else {
        remaining -= this.stats.shield;
        this.stats.shield = 0;
      }
    }

    if (remaining > 0) {
      this.stats.hp = Math.max(0, this.stats.hp - remaining);
      this.communityMeter?.modify(-remaining * 0.12);
      this.scene.cameras.main.shake(120, 0.006);

      // Red hit flash
      this.setTint(0xff5555);
      this.scene.time.delayedCall(100, () => {
        if (this.active) this.clearTint();
      });
    }

    if (this.stats.hp <= 0) {
      this.isAlive = false;
      this.setVelocity(0, 0);
      this.shadow?.setVisible(false);
      return true; // died
    }

    return false;
  }

  public heal(amount: number): void {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
  }

  public applyUpgrade(upgrade: UpgradeConfig, onCommunityRestore?: (val: number) => void): void {
    if (upgrade.id === 'sustain_mastery') {
      this.heal(40);
      this.stats.shield += 25;
      if (onCommunityRestore) onCommunityRestore(20);
      return;
    }

    const cat = upgrade.category as Pillar;
    const currentLevel = this.values[cat] || 0;
    if (currentLevel >= 5) return; // Hard level cap of 5!

    const nextLvl = currentLevel + 1;
    this.values[cat] = nextLvl;

    switch (cat) {
      case 'fight': // Chống: Additional projectile at lvl 1, 3, 5 (Max 4 projectiles total); flat damage
        if (nextLvl === 1 || nextLvl === 3 || nextLvl === 5) {
          this.stats.projectileCount += 1;
        }
        this.stats.damage += 2;
        this.stats.fightPower += 4 + nextLvl;
        break;

      case 'chan': // Chân: +15% damage bonus
        this.stats.damage += 2.5;
        break;

      case 'my': // Mỹ: +10% AOE damage bonus and aura expansion
        this.stats.damage += 1.8;
        if (this.auraRing) {
          this.auraRing.setScale(0.8 + nextLvl * 0.12);
        }
        break;

      case 'khoaHoc': // Khoa Học: +8% attack speed, +4% crit
        this.stats.attackSpeed += 0.1;
        this.stats.critChance += 0.04;
        break;

      case 'danToc': // Dân Tộc: +15 shield, +10 max HP
        this.stats.shield += 15;
        this.stats.maxHp += 10;
        this.stats.hp += 10;
        break;

      case 'thien': // Thiện: HP regeneration
        this.healPerInterval += 1;
        break;

      case 'daiChung': // Đại Chúng: +22 pickup radius, +3 build power
        this.stats.pickupRadius += 22;
        this.stats.buildPower += 3;
        break;

      case 'build': // Xây: Move speed, build power, restore community
        this.stats.moveSpeed += 12;
        this.stats.buildPower += 4;
        if (onCommunityRestore) onCommunityRestore(10);
        break;
    }

    // Enable aura ring visual if Dai Chung, Thien, My, or Build is leveled up
    if (this.values.daiChung > 0 || this.values.thien > 0 || this.values.my > 0 || this.values.build > 0) {
      this.auraRing?.setVisible(true);
    }
  }

  public destroy(fromScene?: boolean): void {
    this.shadow?.destroy();
    this.auraRing?.destroy();
    this.buffAuraGfx?.destroy();
    super.destroy(fromScene);
  }
}
