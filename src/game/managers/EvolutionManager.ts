import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { WeaponSystem } from './WeaponSystem';
import { EvolutionConfig } from '../types/data';
import { DataLoader } from '../../data/loader';

export class EvolutionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private weaponSystem: WeaponSystem;
  private evolutions: EvolutionConfig[] = [];
  private activeEvolutions: Set<string> = new Set();

  constructor(scene: Phaser.Scene, player: Player, weaponSystem: WeaponSystem) {
    this.scene = scene;
    this.player = player;
    this.weaponSystem = weaponSystem;
    this.evolutions = DataLoader.getEvolutions();
  }

  public checkEvolutions(): void {
    for (const evo of this.evolutions) {
      if (this.activeEvolutions.has(evo.id)) continue;

      // Check if player has all required pillars with at least level 1 or 2
      const satisfied = evo.requiredPillars.every(
        p => (this.player.values[p as keyof typeof this.player.values] || 0) >= 1
      );

      if (satisfied) {
        this.unlockEvolution(evo);
      }
    }
  }

  private unlockEvolution(evo: EvolutionConfig): void {
    this.activeEvolutions.add(evo.id);

    if (evo.effects.projectilePierce) {
      this.weaponSystem.hasPierceEvolution = true;
    }
    if (evo.effects.bonusDamageMultiplier) {
      this.player.stats.damage *= evo.effects.bonusDamageMultiplier;
    }

    // Show Evolution Banner
    const { width } = this.scene.scale;
    const banner = this.scene.add.container(width / 2, 90);
    banner.setDepth(90);

    const bg = this.scene.add.rectangle(0, 0, 480, 50, 0x1e1b4b, 0.95);
    bg.setStrokeStyle(2, 0xa855f7);

    const title = this.scene.add.text(0, -10, `✨ TIẾN HÓA KỸ NĂNG: ${evo.name.toUpperCase()}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#c084fc',
    }).setOrigin(0.5);

    const desc = this.scene.add.text(0, 10, evo.description, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#e2e8f0',
    }).setOrigin(0.5);

    banner.add([bg, title, desc]);

    // Slide in and fade out
    this.scene.tweens.add({
      targets: banner,
      y: 110,
      duration: 300,
      hold: 3000,
      yoyo: true,
      onComplete: () => banner.destroy(),
    });
  }
}
