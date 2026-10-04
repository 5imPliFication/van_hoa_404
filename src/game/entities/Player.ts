import Phaser from 'phaser';
import { PlayerStats, CulturalValues, INITIAL_PLAYER_STATS, Pillar } from '../types/player';
import { UpgradeConfig } from '../types/data';

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
  private healTimer: number = 0;
  public healPerInterval: number = 0;
  public touchVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  public lastDamagedBy: string = 'Hiện tượng tiêu cực trên mạng';

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

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setCircle(14, 6, 6);
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

  private handleMovement(): void {
    let vx = 0;
    let vy = 0;

    const left = this.cursors?.left?.isDown || this.wasdKeys?.A?.isDown;
    const right = this.cursors?.right?.isDown || this.wasdKeys?.D?.isDown;
    const up = this.cursors?.up?.isDown || this.wasdKeys?.W?.isDown;
    const down = this.cursors?.down?.isDown || this.wasdKeys?.S?.isDown;

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

    if (vx !== 0 || vy !== 0) {
      this.setRotation(Math.atan2(vy, vx) + Math.PI / 2);
    }
  }

  public takeDamage(amount: number, sourceName: string = 'Hiện tượng tiêu cực trên mạng'): boolean {
    if (!this.isAlive) return false;
    this.lastDamagedBy = sourceName;

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
      return true; // died
    }

    return false;
  }

  public heal(amount: number): void {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
  }

  public applyUpgrade(upgrade: UpgradeConfig, onCommunityRestore?: (val: number) => void): void {
    const e = upgrade.effects;

    if (e.damageAdd) this.stats.damage += e.damageAdd;
    if (e.damageMultiplier) this.stats.damage *= e.damageMultiplier;
    if (e.attackSpeedMultiplier) this.stats.attackSpeed *= e.attackSpeedMultiplier;
    if (e.moveSpeedMultiplier) this.stats.moveSpeed *= e.moveSpeedMultiplier;
    if (e.critChanceAdd) this.stats.critChance += e.critChanceAdd;
    if (e.pickupRadiusAdd) this.stats.pickupRadius += e.pickupRadiusAdd;
    if (e.shieldAdd) this.stats.shield += e.shieldAdd;
    if (e.healPerInterval) this.healPerInterval += e.healPerInterval;
    if (e.communityPowerAdd) {
      this.stats.buildPower += e.communityPowerAdd;
      if (onCommunityRestore) onCommunityRestore(e.communityPowerAdd);
    }
    if (e.fightPowerAdd) this.stats.fightPower += e.fightPowerAdd;
    if (e.projectileCountAdd) this.stats.projectileCount += e.projectileCountAdd;
    if (e.projectileSpeedMultiplier) this.stats.projectileSpeed *= e.projectileSpeedMultiplier;
    if (e.maxHpAdd) {
      this.stats.maxHp += e.maxHpAdd;
      this.stats.hp += e.maxHpAdd;
    }

    // Increment corresponding pillar value
    const cat = upgrade.category as Pillar;
    if (cat in this.values) {
      this.values[cat] = (this.values[cat] || 0) + 1;
    }

    // Enable aura ring visual if Dai Chung, Thien, My, or Build is leveled up
    if (this.values.daiChung > 0 || this.values.thien > 0 || this.values.my > 0 || this.values.build > 0) {
      this.auraRing?.setVisible(true);
    }
  }

  public destroy(fromScene?: boolean): void {
    this.auraRing?.destroy();
    this.buffAuraGfx?.destroy();
    super.destroy(fromScene);
  }
}
