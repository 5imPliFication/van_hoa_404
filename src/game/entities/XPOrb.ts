import Phaser from 'phaser';

export class XPOrb extends Phaser.Physics.Arcade.Sprite {
  public xpValue: number = 1;
  public isMagnetized: boolean = false;
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
    this.magnetSpeed = 320;
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

  /**
   * Deterministically moves the orb towards the player without physics lag or overshoot.
   * Returns true if orb reached or penetrated player collection radius.
   */
  public updateTowardsPlayer(playerX: number, playerY: number, dtSec: number): boolean {
    if (!this.active) return false;

    if (!this.isMagnetized) return false;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);

    // Generous player pickup radius (prevents stuttering/orbiting)
    if (dist <= 32) {
      return true;
    }

    // Accelerate smoothly up to maximum cruising speed
    this.magnetSpeed = Math.min(680, this.magnetSpeed + 480 * dtSec);
    const step = this.magnetSpeed * dtSec;

    // If step would reach or overshoot player in this frame, collect immediately
    if (step >= dist) {
      return true;
    }

    // Direct geometric homing
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    return false;
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
    this.magnetSpeed = 320;
  }
}
