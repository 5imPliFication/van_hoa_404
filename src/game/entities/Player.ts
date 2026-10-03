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
  private healTimer: number = 0;
  private healPerInterval: number = 0;
  public touchVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

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

  update(dt: number): void {
    if (!this.isAlive) return;

    this.handleMovement();

    // Update aura visual position
    if (this.auraRing && this.auraRing.visible) {
      this.auraRing.setPosition(this.x, this.y);
      this.auraRing.rotation += 0.01;
    }

    // Passive regeneration (Thiện pillar)
    if (this.healPerInterval > 0) {
      this.healTimer += dt / 1000;
      if (this.healTimer >= 10) {
        this.heal(this.healPerInterval);
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

  public takeDamage(amount: number): boolean {
    if (!this.isAlive) return false;

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

  public applyUpgrade(upgrade: UpgradeConfig): void {
    const e = upgrade.effects;

    if (e.damageAdd) this.stats.damage += e.damageAdd;
    if (e.damageMultiplier) this.stats.damage *= e.damageMultiplier;
    if (e.attackSpeedMultiplier) this.stats.attackSpeed *= e.attackSpeedMultiplier;
    if (e.moveSpeedMultiplier) this.stats.moveSpeed *= e.moveSpeedMultiplier;
    if (e.critChanceAdd) this.stats.critChance += e.critChanceAdd;
    if (e.pickupRadiusAdd) this.stats.pickupRadius += e.pickupRadiusAdd;
    if (e.shieldAdd) this.stats.shield += e.shieldAdd;
    if (e.healPerInterval) this.healPerInterval += e.healPerInterval;
    if (e.communityPowerAdd) this.stats.buildPower += e.communityPowerAdd;

    // Increment corresponding pillar value
    const cat = upgrade.category as Pillar;
    if (cat in this.values) {
      this.values[cat] = (this.values[cat] || 0) + 1;
    }

    // Enable aura ring visual if Dai Chung or Thien is leveled up
    if (this.values.daiChung > 0 || this.values.thien > 0) {
      this.auraRing?.setVisible(true);
    }
  }

  public destroy(fromScene?: boolean): void {
    this.auraRing?.destroy();
    super.destroy(fromScene);
  }
}
