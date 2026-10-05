import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { WeaponSystem } from './WeaponSystem';
import { EnemyManager } from './EnemyManager';
import { CommunityMeterManager } from './CommunityMeterManager';
import { ComboConfig } from '../types/data';
import { DataLoader } from '../../data/loader';
import { SoundSystem } from '../systems/SoundSystem';

export class EvolutionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private weaponSystem: WeaponSystem;
  private enemyManager: EnemyManager;
  private communityMeter: CommunityMeterManager;
  private combos: ComboConfig[] = [];
  public activeCombos: ComboConfig[] = [];
  public activeEvolutionIds: Set<string> = new Set();
  public onComboUnlockedCallback?: (combo: ComboConfig) => void;

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
    this.combos = DataLoader.getCombos();
  }

  public checkEvolutions(): void {
    this.checkCombos();
  }

  public checkCombos(): void {
    for (const combo of this.combos) {
      if (this.activeEvolutionIds.has(combo.id)) continue;

      // Check if all required pillars reach the required level (Level 4 for 2-stat combos)
      const satisfied = combo.requirements.every(
        req => (this.player.values[req.pillar] || 0) >= req.level
      );

      if (satisfied) {
        this.unlockCombo(combo);
      }
    }
  }

  private unlockCombo(combo: ComboConfig): void {
    this.activeEvolutionIds.add(combo.id);
    this.activeCombos.push(combo);
    SoundSystem.playEvolution();

    // 1. Orbiting data shields
    if (combo.effects.orbitingShields) {
      this.weaponSystem.hasOrbitingShields = true;
      this.weaponSystem.spawnOrbitingRelics(combo.effects.shieldCount || 3);
    }

    // 2. Piercing projectile & Tin Gia bonus
    if (combo.effects.projectilePierce) {
      this.weaponSystem.hasPierceEvolution = true;
    }
    if (combo.effects.bonusVsEnemyType && combo.effects.bonusDamageMultiplier) {
      this.weaponSystem.bonusVsTinGiaMultiplier = combo.effects.bonusDamageMultiplier;
    }
    if (combo.effects.critOnMarked) {
      this.weaponSystem.critOnMarked = true;
    }

    // 3. Benevolent aura (slow, heal, community meter)
    if (combo.effects.slowAuraRadius) {
      this.enemyManager.auraRadiusBonus += Math.max(0, combo.effects.slowAuraRadius - 130);
    }
    if (combo.effects.slowPercent) {
      this.enemyManager.auraSlowBonus += combo.effects.slowPercent;
    }
    if (combo.effects.auraHealPerInterval) {
      this.player.healPerInterval += combo.effects.auraHealPerInterval;
    }
    if (combo.effects.communityMeterBuffPerInterval) {
      this.communityMeter.modify(15);
    }

    // 4. Shockwave pulse
    if (combo.effects.shockwavePulse) {
      this.weaponSystem.hasShockwavePulse = true;
    }
    if (combo.effects.damageMultiplier) {
      this.player.stats.damage *= combo.effects.damageMultiplier;
    }

    // Notify callback (for HUD and game updates)
    if (this.onComboUnlockedCallback) {
      this.onComboUnlockedCallback(combo);
    }

    // Show Celebratory Full-Screen Banner UI
    this.showComboUnlockBanner(combo);
  }

  private showComboUnlockBanner(combo: ComboConfig): void {
    const { width } = this.scene.scale;
    const banner = this.scene.add.container(width / 2, 70);
    banner.setDepth(130);
    banner.setScrollFactor(0); // PIN TO SCREEN

    const bg = this.scene.add.rectangle(0, 0, 720, 68, 0xffffff, 0.98);
    bg.setStrokeStyle(2.5, 0x7c3aed);

    const pillBg = this.scene.add.rectangle(0, -22, 280, 20, 0xede9fe, 1);
    pillBg.setStrokeStyle(1, 0xc4b5fd);
    const pillTxt = this.scene.add.text(0, -22, '✨ CỘNG HƯỞNG GIÁ TRỊ THÀNH CÔNG! ✨', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#6d28d9',
      resolution: 2,
    }).setOrigin(0.5);

    const title = this.scene.add.text(0, -3, `[${combo.formula}] — ${combo.name.toUpperCase()}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#4c1d95',
      resolution: 2,
    }).setOrigin(0.5);

    const desc = this.scene.add.text(0, 18, combo.description, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#334155',
      resolution: 2,
    }).setOrigin(0.5);

    banner.add([bg, pillBg, pillTxt, title, desc]);

    // Particle flare burst on player
    for (let i = 0; i < 12; i++) {
      const spark = this.scene.add.image(this.player.x, this.player.y, 'spark');
      spark.setDepth(15);
      spark.setTint(Phaser.Math.RND.pick([0xa855f7, 0x00f0ff, 0xfacc15, 0x10b981]));
      const angle = (Math.PI * 2 * i) / 12;
      const dist = Phaser.Math.Between(35, 75);
      this.scene.tweens.add({
        targets: spark,
        x: this.player.x + Math.cos(angle) * dist,
        y: this.player.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 450,
        onComplete: () => spark.destroy(),
      });
    }

    // Slide in, hold, and fade out
    this.scene.tweens.add({
      targets: banner,
      y: 95,
      duration: 320,
      hold: 3500,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => banner.destroy(),
    });
  }

  public getActiveComboList(): ComboConfig[] {
    return this.activeCombos;
  }
}
