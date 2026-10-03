import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public damage: number = 0;
  public isCrit: boolean = false;
  public isPierce: boolean = false;
  public pierceCount: number = 0;
  public maxPierces: number = 1;
  private lifeTime: number = 0;
  private readonly maxLifeTime: number = 3000; // ms

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCircle(6, 2, 2);
    this.setDepth(15);
  }

  public fire(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    speed: number,
    damage: number,
    isCrit: boolean = false,
    isPierce: boolean = false
  ): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

    this.damage = damage;
    this.isCrit = isCrit;
    this.isPierce = isPierce;
    this.pierceCount = 0;
    this.maxPierces = isPierce ? 99 : 1;
    this.lifeTime = 0;

    if (isPierce) {
      this.setTexture('player_bullet_pierce');
    } else {
      this.setTexture('player_bullet');
    }

    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    this.setRotation(angle);

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    this.setVelocity(vx, vy);
  }

  public update(_time: number, delta: number): void {
    if (!this.active) return;

    this.lifeTime += delta;
    if (this.lifeTime > this.maxLifeTime) {
      this.deactivate();
      return;
    }

    // Check bounds
    const bounds = this.scene.physics.world.bounds;
    if (
      this.x < bounds.x - 50 ||
      this.x > bounds.right + 50 ||
      this.y < bounds.y - 50 ||
      this.y > bounds.bottom + 50
    ) {
      this.deactivate();
    }
  }

  public onHit(): void {
    this.pierceCount++;
    if (this.pierceCount >= this.maxPierces) {
      this.deactivate();
    }
  }

  public deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
  }
}
