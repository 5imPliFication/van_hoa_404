import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { XPOrb } from '../entities/XPOrb';
import { SoundSystem } from '../systems/SoundSystem';

export class XPManager {
  private player: Player;
  public orbs: Phaser.Physics.Arcade.Group;
  private onLevelUpCallback: (newLevel: number) => void;

  public xpMultiplier: number = 1.0;

  constructor(scene: Phaser.Scene, player: Player, onLevelUp: (newLevel: number) => void) {
    this.player = player;
    this.onLevelUpCallback = onLevelUp;

    this.orbs = scene.physics.add.group({
      classType: XPOrb,
      maxSize: 150,
      runChildUpdate: false,
    });
  }

  public dropXP(x: number, y: number, value: number = 1): void {
    const orb = this.orbs.get() as XPOrb;
    if (orb) {
      // Small random spread on drop
      const ox = x + Phaser.Math.Between(-8, 8);
      const oy = y + Phaser.Math.Between(-8, 8);
      orb.spawn(ox, oy, value);
    }
  }

  public update(dt: number): void {
    const pickupRadius = this.player.stats.pickupRadius;
    const px = this.player.x;
    const py = this.player.y;
    const dtSec = dt / 1000;

    const children = this.orbs.getChildren() as XPOrb[];
    for (const orb of children) {
      if (!orb.active) continue;

      const dist = Phaser.Math.Distance.Between(px, py, orb.x, orb.y);

      // Check magnet trigger
      if (dist <= pickupRadius) {
        orb.magnetize();
      }

      // 1. Direct touch collection
      if (dist <= 30) {
        const gainedXP = orb.collect();
        SoundSystem.playGem();
        this.addXP(gainedXP);
      } else if (orb.isMagnetized) {
        // 2. Smooth homing towards player without oscillation
        const reached = orb.updateTowardsPlayer(px, py, dtSec);
        if (reached) {
          const gainedXP = orb.collect();
          SoundSystem.playGem();
          this.addXP(gainedXP);
        }
      }
    }
  }

  public addXP(amount: number): void {
    const finalAmount = Math.ceil(amount * this.xpMultiplier);
    this.player.currentXP += finalAmount;

    if (this.player.currentXP >= this.player.nextLevelXP) {
      this.player.currentXP -= this.player.nextLevelXP;
      this.player.level += 1;
      this.player.nextLevelXP = Math.floor(10 * Math.pow(1.32, this.player.level - 1));

      // Trigger level-up
      this.onLevelUpCallback(this.player.level);
    }
  }
}
