import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { CommunityMeterManager } from './CommunityMeterManager';
import { EnemyManager } from './EnemyManager';
import { ScenarioConfig, ScenarioChoice } from '../types/data';
import { DataLoader } from '../../data/loader';
import { SoundSystem } from '../systems/SoundSystem';

import { XPManager } from './XPManager';

export class ScenarioEventManager {
  private scene: Phaser.Scene;
  private player: Player;
  private communityMeter: CommunityMeterManager;
  private enemyManager: EnemyManager;
  private xpManager?: XPManager;
  private scenarios: ScenarioConfig[] = [];
  private scenarioPool: ScenarioConfig[] = [];
  private triggerSchedule: number[] = [];
  private currentScheduleIndex: number = 0;
  private overlayContainer?: Phaser.GameObjects.Container;
  private onResumeCallback: () => void;
  private isShowing: boolean = false;
  private cleanupListeners?: () => void;
  public activeBuffText: string = '';

  // 30s Temporary buff tracking
  private buffRemainingSeconds: number = 0;
  private buffSummary: string = '';
  private activeRevertCallback?: () => void;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    communityMeter: CommunityMeterManager,
    enemyManager: EnemyManager,
    xpManager: XPManager,
    onResume: () => void
  ) {
    this.scene = scene;
    this.player = player;
    this.communityMeter = communityMeter;
    this.enemyManager = enemyManager;
    this.xpManager = xpManager;
    this.onResumeCallback = onResume;
    this.scenarios = DataLoader.getScenarios();
    this.initRandomSchedule();
  }

  private initRandomSchedule(): void {
    // Generate randomized scenario triggers avoiding boss milestones (180s, 300s, 420s, 600s)
    this.triggerSchedule = [
      Phaser.Math.Between(45, 65),    // Wave 1 early (~55s)
      Phaser.Math.Between(120, 145),  // Wave 1 late (~132s, before 3m boss)
      Phaser.Math.Between(225, 255),  // Wave 2 (~240s, between 3m and 5m boss)
      Phaser.Math.Between(340, 370),  // Wave 3 (~355s, between 5m and 7m boss)
      Phaser.Math.Between(475, 510),  // Wave 4 (~490s, between 7m and 10m boss)
    ];
    this.currentScheduleIndex = 0;
    this.scenarioPool = Phaser.Utils.Array.Shuffle([...this.scenarios]);
  }

  public update(dt: number): void {
    if (this.buffRemainingSeconds > 0) {
      this.buffRemainingSeconds -= dt / 1000;
      if (this.buffRemainingSeconds > 0) {
        this.activeBuffText = `✨ ${this.buffSummary} [${Math.ceil(this.buffRemainingSeconds)}s]`;
      } else {
        this.buffRemainingSeconds = 0;
        this.activeBuffText = '';
        this.player.setBuffActive(false);
        if (this.activeRevertCallback) {
          this.activeRevertCallback();
          this.activeRevertCallback = undefined;
        }
      }
    }
  }

  public checkTriggers(runSeconds: number): boolean {
    if (this.isShowing) return false;

    if (this.currentScheduleIndex < this.triggerSchedule.length) {
      const nextTrigger = this.triggerSchedule[this.currentScheduleIndex];
      if (runSeconds >= nextTrigger) {
        this.currentScheduleIndex++;

        // Get random scenario from shuffled pool
        if (this.scenarioPool.length === 0) {
          this.scenarioPool = Phaser.Utils.Array.Shuffle([...this.scenarios]);
        }
        const scenario = this.scenarioPool.pop();
        if (scenario) {
          this.showScenario(scenario);
          return true; // Combat pauses
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

    // Render Choices (Shuffled order so option 1 is not always the best choice)
    const shuffledChoices = Phaser.Utils.Array.Shuffle([...scenario.choices]);
    const choiceYStart = height / 2 - modalH / 2 + 215;
    const choiceHeight = 56;
    const choiceGap = 12;

    shuffledChoices.forEach((choice, index) => {
      const cy = choiceYStart + index * (choiceHeight + choiceGap);
      const choiceCard = this.createChoiceItem(width / 2, cy, modalW - 60, choiceHeight, choice, index + 1);
      this.overlayContainer?.add(choiceCard);
    });

    // Screen-space pointer click listener (Bypasses Phaser camera scroll container hit-test bug)
    const onScreenPointerDown = (pointer: Phaser.Input.Pointer) => {
      if (!this.isShowing) return;
      for (let index = 0; index < shuffledChoices.length; index++) {
        const cy = choiceYStart + index * (choiceHeight + choiceGap);
        if (
          Math.abs(pointer.x - width / 2) < (modalW - 60) / 2 &&
          Math.abs(pointer.y - cy) < choiceHeight / 2
        ) {
          this.handleChoice(shuffledChoices[index], scenario);
          return;
        }
      }
    };

    this.scene.input.on('pointerdown', onScreenPointerDown);

    // Keyboard shortcuts: 1, 2, 3, 4
    const onKey1 = () => { if (this.isShowing && shuffledChoices[0]) this.handleChoice(shuffledChoices[0], scenario); };
    const onKey2 = () => { if (this.isShowing && shuffledChoices[1]) this.handleChoice(shuffledChoices[1], scenario); };
    const onKey3 = () => { if (this.isShowing && shuffledChoices[2]) this.handleChoice(shuffledChoices[2], scenario); };
    const onKey4 = () => { if (this.isShowing && shuffledChoices[3]) this.handleChoice(shuffledChoices[3], scenario); };

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

    // 1. Immediate effects
    const eff = choice.effects;
    if (eff.player) {
      if (eff.player.hp && eff.player.hp < 0) {
        this.player.takeDamage(-eff.player.hp, `Hậu quả từ: ${scenario.title}`);
      }
      if (eff.player.hp && eff.player.hp > 0) this.player.heal(eff.player.hp);
      if (eff.player.shield) this.player.stats.shield += eff.player.shield;
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

    // 2. Revert previous active buff if any before applying new one
    if (this.activeRevertCallback) {
      this.activeRevertCallback();
      this.activeRevertCallback = undefined;
    }

    // 3. Timed Buffs / Debuffs (30s duration)
    const duration = eff.durationSeconds || 0;
    if (duration > 0) {
      const dmgMult = eff.player?.damageMultiplier || 1.0;
      const atkSpdMult = eff.player?.attackSpeedMultiplier || 1.0;
      const movSpdMult = eff.player?.moveSpeedMultiplier || 1.0;
      const xpMult = eff.world?.xpMultiplier || 1.0;
      const enemySpdMult = eff.world?.enemySpeedMultiplier || 1.0;

      // Apply multipliers
      if (dmgMult !== 1.0) this.player.stats.damage *= dmgMult;
      if (atkSpdMult !== 1.0) this.player.stats.attackSpeed *= atkSpdMult;
      if (movSpdMult !== 1.0) this.player.stats.moveSpeed *= movSpdMult;
      if (xpMult !== 1.0 && this.xpManager) this.xpManager.xpMultiplier *= xpMult;
      if (enemySpdMult !== 1.0) this.enemyManager.globalEnemySpeedMultiplier *= enemySpdMult;

      // Status text
      const buffParts: string[] = [];
      if (dmgMult > 1.0) buffParts.push(`+${Math.round((dmgMult - 1) * 100)}% Sát thương`);
      if (dmgMult < 1.0) buffParts.push(`-${Math.round((1 - dmgMult) * 100)}% Sát thương`);
      if (atkSpdMult > 1.0) buffParts.push(`+${Math.round((atkSpdMult - 1) * 100)}% Tốc bắn`);
      if (movSpdMult > 1.0) buffParts.push(`+${Math.round((movSpdMult - 1) * 100)}% Tốc chạy`);
      if (xpMult > 1.0) buffParts.push(`+${Math.round((xpMult - 1) * 100)}% XP`);
      if (enemySpdMult < 1.0) buffParts.push(`Làm chậm quái ${Math.round((1 - enemySpdMult) * 100)}%`);
      if (enemySpdMult > 1.0) buffParts.push(`Quái tăng tốc ${Math.round((enemySpdMult - 1) * 100)}%`);

      this.buffRemainingSeconds = duration;
      this.buffSummary = buffParts.join(' • ');
      this.activeBuffText = `✨ ${this.buffSummary} [${Math.ceil(this.buffRemainingSeconds)}s]`;
      this.player.setBuffActive(true);

      this.activeRevertCallback = () => {
        if (dmgMult !== 1.0) this.player.stats.damage /= dmgMult;
        if (atkSpdMult !== 1.0) this.player.stats.attackSpeed /= atkSpdMult;
        if (movSpdMult !== 1.0) this.player.stats.moveSpeed /= movSpdMult;
        if (xpMult !== 1.0 && this.xpManager) this.xpManager.xpMultiplier /= xpMult;
        if (enemySpdMult !== 1.0) this.enemyManager.globalEnemySpeedMultiplier /= enemySpdMult;
      };
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
