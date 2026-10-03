import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class CommunityMeterManager {
  private player: Player;
  public meterValue: number = 75; // 0 to 100
  public isCrisis: boolean = false;
  private crisisDebuffApplied: boolean = false;

  constructor(_scene: Phaser.Scene, player: Player) {
    this.player = player;
  }

  public update(dt: number, activeEnemyCount: number): void {
    const dtSec = dt / 1000;

    // Passive decay if too many enemies are lingering
    if (activeEnemyCount > 25) {
      this.modify(-0.6 * dtSec);
    } else if (activeEnemyCount < 10 && this.player.values.build > 0) {
      // Passive recovery if player has Build (Xây) investment
      this.modify(0.4 * dtSec * (1 + this.player.values.build * 0.1));
    }

    // Check crisis state (meter hitting 0)
    if (this.meterValue <= 0 && !this.isCrisis) {
      this.triggerCrisis();
    } else if (this.meterValue > 20 && this.isCrisis) {
      this.resolveCrisis();
    }
  }

  public modify(delta: number): void {
    this.meterValue = Phaser.Math.Clamp(this.meterValue + delta, 0, 100);
  }

  private triggerCrisis(): void {
    this.isCrisis = true;
    if (!this.crisisDebuffApplied) {
      this.crisisDebuffApplied = true;
      // Debuff: -25% damage, -20% speed per GDD
      this.player.stats.damage *= 0.75;
      this.player.stats.moveSpeed *= 0.8;
    }
  }

  private resolveCrisis(): void {
    this.isCrisis = false;
    if (this.crisisDebuffApplied) {
      this.crisisDebuffApplied = false;
      this.player.stats.damage /= 0.75;
      this.player.stats.moveSpeed /= 0.8;
    }
  }
}
