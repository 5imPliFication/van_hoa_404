import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { WeaponSystem } from './WeaponSystem';
import { EnemyManager } from './EnemyManager';
import { CommunityMeterManager } from './CommunityMeterManager';
import { EvolutionConfig } from '../types/data';
import { DataLoader } from '../../data/loader';
import { SoundSystem } from '../systems/SoundSystem';

export class EvolutionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private weaponSystem: WeaponSystem;
  private enemyManager: EnemyManager;
  private communityMeter: CommunityMeterManager;
  private evolutions: EvolutionConfig[] = [];
  public activeEvolutions: Set<string> = new Set();

  constructor(
    scene: Phaser.Scene,
    player: Player,
    weaponSystem: WeaponSystem,
    enemyManager: EnemyManager,
    communityMeter: CommunityMeterManager
  ) {
    this.scene = scene;
    this.player = player;
    this.weaponSystem = weaponSystem;
    this.enemyManager = enemyManager;
    this.communityMeter = communityMeter;
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
    SoundSystem.playEvolution();

    // 1. Pierce
    if (evo.effects.projectilePierce) {
      this.weaponSystem.hasPierceEvolution = true;
    }
    // 2. Bonus vs enemy type (Tin Giả)
    if (evo.effects.bonusVsEnemyType && evo.effects.bonusDamageMultiplier) {
      this.weaponSystem.bonusVsTinGiaMultiplier = evo.effects.bonusDamageMultiplier;
    }
    // 3. General damage multiplier
    if (evo.effects.damageMultiplier) {
      this.player.stats.damage *= evo.effects.damageMultiplier;
    }
    // 4. Aura slow & radius bonus
    if (evo.effects.auraSlow) {
      this.enemyManager.auraSlowBonus += evo.effects.auraSlow;
    }
    if (evo.effects.auraRadius) {
      this.enemyManager.auraRadiusBonus += Math.max(0, evo.effects.auraRadius - 130);
    }
    // 5. Aura heal per tick
    if (evo.effects.auraHeal) {
      this.player.healPerInterval += evo.effects.auraHeal;
    }
    // 6. Community meter buff & power bonus
    if (evo.effects.communityMeterBuff) {
      this.communityMeter.modify(evo.effects.communityMeterBuff);
      this.player.stats.buildPower += 15;
      this.player.stats.fightPower += 15;
    }

    // Show Evolution Banner
    const { width } = this.scene.scale;
    const banner = this.scene.add.container(width / 2, 90);
    banner.setDepth(90);
    banner.setScrollFactor(0); // PIN TO SCREEN

    const bg = this.scene.add.rectangle(0, 0, 520, 54, 0xffffff, 0.98);
    bg.setStrokeStyle(2, 0x7c3aed);

    const title = this.scene.add.text(0, -10, `✨ TIẾN HÓA KỸ NĂNG: ${evo.name.toUpperCase()}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#6d28d9',
      resolution: 2,
    }).setOrigin(0.5);

    const desc = this.scene.add.text(0, 11, evo.description, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#334155',
      resolution: 2,
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
