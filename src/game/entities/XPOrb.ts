import Phaser from 'phaser';

export class XPOrb extends Phaser.Physics.Arcade.Sprite {
  public xpValue: number = 1;
  private isMagnetized: boolean = false;
  private magnetSpeed: number = 320;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'xp_gem');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCircle(7, 1, 1);
    this.setDepth(8);
  }

  public spawn(x: number, y: number, xpValue: number = 1): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.xpValue = xpValue;
    this.isMagnetized = false;
    this.setVelocity(0, 0);

    // Subtle scale tween on spawn
    this.setScale(0);
    this.scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 180,
      ease: 'Back.easeOut',
    });
  }

  public magnetize(): void {
    this.isMagnetized = true;
  }

  public updateTowardsPlayer(playerX: number, playerY: number, dt: number): void {
    if (!this.active) return;

    if (this.isMagnetized) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY);
      this.magnetSpeed += 500 * (dt / 1000); // accelerates as it approaches
      const vx = Math.cos(angle) * this.magnetSpeed;
      const vy = Math.sin(angle) * this.magnetSpeed;
      this.setVelocity(vx, vy);
    }
  }

  public collect(): number {
    const val = this.xpValue;
    this.deactivate();
    return val;
  }

  public deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.isMagnetized = false;
  }
}
