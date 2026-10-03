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
  private isShowing: boolean = false;
  private cleanupListeners?: () => void;

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
    if (this.isShowing) return;
    this.isShowing = true;

    SoundSystem.playAlert();
    const { width, height } = this.scale;

    this.overlayContainer = this.scene.add.container(0, 0);
    this.overlayContainer.setDepth(110);
    this.overlayContainer.setScrollFactor(0); // PIN TO SCREEN!

    // Soft dim backdrop
    const bg = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x0f172a, 0.45);
    this.overlayContainer.add(bg);

    // Dialog card
    const modalW = 700;
    const modalH = 470;
    const modal = this.scene.add.rectangle(width / 2, height / 2, modalW, modalH, 0xffffff, 0.98);
    modal.setStrokeStyle(2, 0xd97706); // Warm amber event border
    this.overlayContainer.add(modal);

    // Header badge
    const badgeBg = this.scene.add.rectangle(width / 2, height / 2 - modalH / 2 + 35, 240, 26, 0xfef3c7, 1);
    badgeBg.setStrokeStyle(1, 0xfde68a);

    const badge = this.scene.add.text(width / 2, height / 2 - modalH / 2 + 35, '⚡ TÌNH HUỐNG VĂN HÓA SỐ', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#b45309',
      resolution: 2,
    }).setOrigin(0.5);

    // Scenario Title
    const title = this.scene.add.text(width / 2, height / 2 - modalH / 2 + 75, scenario.title, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#0f172a',
      resolution: 2,
    }).setOrigin(0.5);

    // Prompt Card Box (Clean quote box)
    const promptBg = this.scene.add.rectangle(width / 2, height / 2 - modalH / 2 + 135, modalW - 60, 68, 0xf8fafc, 1);
    promptBg.setStrokeStyle(1, 0xe2e8f0);

    const prompt = this.scene.add.text(width / 2, height / 2 - modalH / 2 + 135, scenario.prompt, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#334155',
      align: 'center',
      wordWrap: { width: modalW - 90 },
      lineSpacing: 4,
      resolution: 2,
    }).setOrigin(0.5);

    this.overlayContainer.add([badgeBg, badge, title, promptBg, prompt]);

    // Render Choices (2 to 4 choices)
    const choiceYStart = height / 2 - modalH / 2 + 215;
    const choiceHeight = 56;
    const choiceGap = 12;

    scenario.choices.forEach((choice, index) => {
      const cy = choiceYStart + index * (choiceHeight + choiceGap);
      const choiceCard = this.createChoiceItem(width / 2, cy, modalW - 60, choiceHeight, choice, index + 1);
      this.overlayContainer?.add(choiceCard);
    });

    // Screen-space pointer click listener (Bypasses Phaser camera scroll container hit-test bug)
    const onScreenPointerDown = (pointer: Phaser.Input.Pointer) => {
      if (!this.isShowing) return;
      for (let index = 0; index < scenario.choices.length; index++) {
        const cy = choiceYStart + index * (choiceHeight + choiceGap);
        if (
          Math.abs(pointer.x - width / 2) < (modalW - 60) / 2 &&
          Math.abs(pointer.y - cy) < choiceHeight / 2
        ) {
          this.handleChoice(scenario.choices[index], scenario);
          return;
        }
      }
    };

    this.scene.input.on('pointerdown', onScreenPointerDown);

    // Keyboard shortcuts: 1, 2, 3, 4
    const onKey1 = () => { if (this.isShowing && scenario.choices[0]) this.handleChoice(scenario.choices[0], scenario); };
    const onKey2 = () => { if (this.isShowing && scenario.choices[1]) this.handleChoice(scenario.choices[1], scenario); };
    const onKey3 = () => { if (this.isShowing && scenario.choices[2]) this.handleChoice(scenario.choices[2], scenario); };
    const onKey4 = () => { if (this.isShowing && scenario.choices[3]) this.handleChoice(scenario.choices[3], scenario); };

    this.scene.input.keyboard?.once('keydown-ONE', onKey1);
    this.scene.input.keyboard?.once('keydown-TWO', onKey2);
    this.scene.input.keyboard?.once('keydown-THREE', onKey3);
    this.scene.input.keyboard?.once('keydown-FOUR', onKey4);

    this.cleanupListeners = () => {
      this.scene.input.off('pointerdown', onScreenPointerDown);
      this.scene.input.keyboard?.off('keydown-ONE', onKey1);
      this.scene.input.keyboard?.off('keydown-TWO', onKey2);
      this.scene.input.keyboard?.off('keydown-THREE', onKey3);
      this.scene.input.keyboard?.off('keydown-FOUR', onKey4);
    };
  }

  private createChoiceItem(
    x: number,
    y: number,
    w: number,
    h: number,
    choice: ScenarioChoice,
    keyNumber: number
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.rectangle(0, 0, w, h, 0xf8fafc, 1);
    bg.setStrokeStyle(1.5, 0xcbd5e1);

    const label = this.scene.add.text(0, 0, `[Phím ${keyNumber}] ${choice.label}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#1e293b',
      align: 'center',
      wordWrap: { width: w - 30 },
      resolution: 2,
    }).setOrigin(0.5);

    container.add([bg, label]);
    return container;
  }

  private handleChoice(choice: ScenarioChoice, scenario: ScenarioConfig): void {
    if (this.cleanupListeners) {
      this.cleanupListeners();
      this.cleanupListeners = undefined;
    }
    this.isShowing = false;

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

    const { width, height } = this.scale;
    const toast = this.scene.add.rectangle(width / 2, height / 2, 620, 100, 0xffffff, 0.98);
    toast.setStrokeStyle(2, 0x059669);

    const feedbackText = this.scene.add.text(width / 2, height / 2, choice.feedback, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#065f46',
      align: 'center',
      wordWrap: { width: 560 },
      resolution: 2,
    }).setOrigin(0.5);

    this.overlayContainer?.add([toast, feedbackText]);

    // Resume after 1.8 seconds
    this.scene.time.delayedCall(1800, () => {
      this.overlayContainer?.destroy();
      this.overlayContainer = undefined;
      this.onResumeCallback();
    });
  }

  private get scale(): Phaser.Scale.ScaleManager {
    return this.scene.scale;
  }
}
