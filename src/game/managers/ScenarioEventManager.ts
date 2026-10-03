import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { CommunityMeterManager } from './CommunityMeterManager';
import { EnemyManager } from './EnemyManager';
import { ScenarioConfig, ScenarioChoice } from '../types/data';
import { DataLoader } from '../../data/loader';
import { SoundSystem } from '../systems/SoundSystem';

export class ScenarioEventManager {
  private scene: Phaser.Scene;
  private player: Player;
  private communityMeter: CommunityMeterManager;
  private enemyManager: EnemyManager;
  private scenarios: ScenarioConfig[] = [];
  private triggeredScenarioIds: Set<string> = new Set();
  private overlayContainer?: Phaser.GameObjects.Container;
  private onResumeCallback: () => void;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    communityMeter: CommunityMeterManager,
    enemyManager: EnemyManager,
    onResume: () => void
  ) {
    this.scene = scene;
    this.player = player;
    this.communityMeter = communityMeter;
    this.enemyManager = enemyManager;
    this.onResumeCallback = onResume;
    this.scenarios = DataLoader.getScenarios();
  }

  public checkTriggers(runSeconds: number): boolean {
    for (const scenario of this.scenarios) {
      if (!scenario.enabled || this.triggeredScenarioIds.has(scenario.id)) continue;

      if (scenario.trigger.type === 'time') {
        const triggerTime = Number(scenario.trigger.value);
        if (runSeconds >= triggerTime) {
          this.triggeredScenarioIds.add(scenario.id);
          this.showScenario(scenario);
          return true; // Combat should pause
        }
      }
    }
    return false;
  }

  private showScenario(scenario: ScenarioConfig): void {
    SoundSystem.playAlert();
    const { width, height } = this.scene.scale;

    this.overlayContainer = this.scene.add.container(0, 0);
    this.overlayContainer.setDepth(110);

    // Dimmed backdrop
    const bg = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    bg.setInteractive();
    this.overlayContainer.add(bg);

    // Dialog card
    const modalW = 680;
    const modalH = 460;
    const modal = this.scene.add.rectangle(width / 2, height / 2, modalW, modalH, 0x0b1120, 0.98);
    modal.setStrokeStyle(2, 0xeab308); // Gold event border
    this.overlayContainer.add(modal);

    // Header badge
    const badge = this.scene.add.text(width / 2, height / 2 - modalH / 2 + 35, '⚡ TÌNH HUỐNG VĂN HÓA SỐ', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#eab308',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Scenario Title
    const title = this.scene.add.text(width / 2, height / 2 - modalH / 2 + 70, scenario.title, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Scenario Prompt (Concise 5-8s read)
    const prompt = this.scene.add.text(width / 2, height / 2 - modalH / 2 + 125, scenario.prompt, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: modalW - 60 },
      lineSpacing: 5,
    }).setOrigin(0.5);

    this.overlayContainer.add([badge, title, prompt]);

    // Render Choices (2 to 4 choices)
    const choiceYStart = height / 2 - modalH / 2 + 195;
    const choiceHeight = 56;
    const choiceGap = 14;

    scenario.choices.forEach((choice, index) => {
      const cy = choiceYStart + index * (choiceHeight + choiceGap);
      const choiceCard = this.createChoiceItem(width / 2, cy, modalW - 60, choiceHeight, choice, scenario);
      this.overlayContainer?.add(choiceCard);
    });
  }

  private createChoiceItem(
    x: number,
    y: number,
    w: number,
    h: number,
    choice: ScenarioChoice,
    scenario: ScenarioConfig
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.rectangle(0, 0, w, h, 0x1e293b, 0.95);
    bg.setStrokeStyle(1, 0x475569);
    bg.setInteractive({ useHandCursor: true });

    const label = this.scene.add.text(0, 0, choice.label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#f8fafc',
      align: 'center',
      wordWrap: { width: w - 30 },
    }).setOrigin(0.5);

    container.add([bg, label]);

    bg.on('pointerover', () => {
      bg.setStrokeStyle(2, 0x00f0ff);
      bg.setFillStyle(0x334155, 1);
    });

    bg.on('pointerout', () => {
      bg.setStrokeStyle(1, 0x475569);
      bg.setFillStyle(0x1e293b, 0.95);
    });

    bg.on('pointerdown', () => {
      this.handleChoice(choice, scenario);
    });

    return container;
  }

  private handleChoice(choice: ScenarioChoice, scenario: ScenarioConfig): void {
    // 1. Apply effects
    const eff = choice.effects;

    if (eff.player) {
      if (eff.player.hp < 0) this.player.takeDamage(-eff.player.hp);
      if (eff.player.hp > 0) this.player.heal(eff.player.hp);
      if (eff.player.shield) this.player.stats.shield += eff.player.shield;
      if (eff.player.damageMultiplier && eff.player.damageMultiplier !== 1.0) {
        this.player.stats.damage *= eff.player.damageMultiplier;
      }
    }

    if (eff.world) {
      if (eff.world.communityDelta) {
        this.communityMeter.modify(eff.world.communityDelta);
      }
      if (eff.world.spawnEnemyType && eff.world.spawnCount > 0) {
        for (let i = 0; i < eff.world.spawnCount; i++) {
          this.enemyManager.spawnEnemy(eff.world.spawnEnemyType);
        }
      }
    }

    // Record learning pillars
    for (const core of scenario.learning.cores) {
      this.player.values[core] = (this.player.values[core] || 0) + 1;
    }
    for (const val of scenario.learning.values) {
      this.player.values[val] = (this.player.values[val] || 0) + 1;
    }

    // 2. Show 1-sentence feedback toast per CONTENT_GUIDE
    this.overlayContainer?.removeAll(true);

    const { width, height } = this.scene.scale;
    const toast = this.scene.add.rectangle(width / 2, height / 2, 600, 100, 0x0f172a, 0.95);
    toast.setStrokeStyle(2, 0x10b981);

    const feedbackText = this.scene.add.text(width / 2, height / 2, choice.feedback, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#34d399',
      align: 'center',
      wordWrap: { width: 560 },
    }).setOrigin(0.5);

    this.overlayContainer?.add([toast, feedbackText]);

    // Resume after 1.8 seconds
    this.scene.time.delayedCall(1800, () => {
      this.overlayContainer?.destroy();
      this.overlayContainer = undefined;
      this.onResumeCallback();
    });
  }
}
