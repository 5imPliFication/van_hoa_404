import Phaser from 'phaser';

export type DamageTargetType = 'monster' | 'crit' | 'player';

export class DamageNumberSystem {
  private static scene?: Phaser.Scene;
  private static activeCount: number = 0;
  private static readonly MAX_ACTIVE: number = 60;

  public static init(scene: Phaser.Scene): void {
    this.scene = scene;
    this.activeCount = 0;
  }

  public static showDamage(
    x: number,
    y: number,
    amount: number | string,
    type: DamageTargetType
  ): void {
    if (!this.scene) return;
    if (typeof amount === 'number' && amount <= 0) return;
    if (this.activeCount >= this.MAX_ACTIVE && type !== 'player' && type !== 'crit') {
      return; // prevent FPS drop during heavy pierce storms
    }

    const jx = x + Phaser.Math.Between(-10, 10);
    const jy = y - 10 + Phaser.Math.Between(-6, 6);

    let textColor = '#ffffff'; // White for normal monsters
    const strokeColor = '#000000'; // Black border
    let fontSize = '14px';
    let strokeThickness = 3.5;
    let label = '';

    if (typeof amount === 'string') {
      label = amount;
      if (type === 'crit') {
        textColor = '#f97316';
        fontSize = '15px';
        strokeThickness = 4;
      } else if (type === 'player') {
        textColor = '#ef4444';
        fontSize = '15px';
        strokeThickness = 4;
      }
    } else {
      const rounded = Math.round(amount);
      if (rounded <= 0) return;
      label = `${rounded}`;

      if (type === 'crit') {
        textColor = '#f97316'; // Orange if crit
        fontSize = '18px';
        strokeThickness = 4;
        label = `${rounded}!`;
      } else if (type === 'player') {
        textColor = '#ef4444'; // Red for user
        fontSize = '16px';
        strokeThickness = 4;
        label = `-${rounded}`;
      }
    }

    this.activeCount++;

    const text = this.scene.add.text(jx, jy, label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize,
      fontStyle: 'bold',
      color: textColor,
      stroke: strokeColor,
      strokeThickness,
      resolution: 2,
    }).setOrigin(0.5);

    text.setDepth(50);
    text.setScale(type === 'crit' ? 1.3 : 1.1);

    this.scene.tweens.add({
      targets: text,
      y: jy - (type === 'crit' ? 36 : 28),
      scale: 1.0,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (!this.scene) {
          text.destroy();
          this.activeCount = Math.max(0, this.activeCount - 1);
          return;
        }
        this.scene.tweens.add({
          targets: text,
          alpha: 0,
          y: text.y - 12,
          duration: 200,
          onComplete: () => {
            text.destroy();
            this.activeCount = Math.max(0, this.activeCount - 1);
          },
        });
      },
    });
  }
}
