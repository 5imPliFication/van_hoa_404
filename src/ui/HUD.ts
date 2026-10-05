import Phaser from 'phaser';
import { Player } from '../game/entities/Player';
import { CommunityMeterManager } from '../game/managers/CommunityMeterManager';
import { WaveConfig, ComboConfig } from '../game/types/data';

export class HUD {
  private scene: Phaser.Scene;
  private player: Player;
  private communityMeter: CommunityMeterManager;

  // Visual elements
  private container: Phaser.GameObjects.Container;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  private hpText: Phaser.GameObjects.Text;
  private shieldText: Phaser.GameObjects.Text;

  private xpBarFill: Phaser.GameObjects.Rectangle;
  private levelText: Phaser.GameObjects.Text;

  private communityBarFill: Phaser.GameObjects.Rectangle;
  private communityText: Phaser.GameObjects.Text;
  private crisisWarningText: Phaser.GameObjects.Text;

  private timerText: Phaser.GameObjects.Text;
  private waveText: Phaser.GameObjects.Text;
  private killsText: Phaser.GameObjects.Text;
  private pillarsText: Phaser.GameObjects.Text;
  private activeBuffPill: Phaser.GameObjects.Rectangle;
  private activeBuffText: Phaser.GameObjects.Text;

  // Class & Combo UI
  private classBadgeBg: Phaser.GameObjects.Rectangle;
  private classBadgeText: Phaser.GameObjects.Text;
  private comboTrayContainer: Phaser.GameObjects.Container;
  private lastRenderedCombosCount: number = -1;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    communityMeter: CommunityMeterManager,
    onOpenGuide?: () => void
  ) {
    this.scene = scene;
    this.player = player;
    this.communityMeter = communityMeter;

    const { width, height } = scene.scale;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(80);
    this.container.setScrollFactor(0); // PIN TO SCREEN!

    // Top HUD Bar Background (Clean elevated glassmorphic light card)
    const topBg = scene.add.rectangle(width / 2, 28, width - 32, 52, 0xffffff, 0.96);
    topBg.setStrokeStyle(1.5, 0xcbd5e1);
    this.container.add(topBg);

    // 1. HP & Shield Bar (Top Left)
    const hpBg = scene.add.rectangle(138, 24, 170, 18, 0xe2e8f0);
    hpBg.setStrokeStyle(1, 0x94a3b8);
    this.hpBarFill = scene.add.rectangle(53, 24, 170, 18, 0x10b981).setOrigin(0, 0.5);

    const heartIcon = scene.add.text(36, 24, '❤️', {
      fontSize: '12px',
      resolution: 2,
    }).setOrigin(0.5);

    this.hpText = scene.add.text(138, 24, 'HP: 100/100', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#0f172a',
      resolution: 2,
    }).setOrigin(0.5);

    // Shield Pill Badge
    const shieldPill = scene.add.rectangle(256, 24, 60, 20, 0xe0f2fe, 0.95);
    shieldPill.setStrokeStyle(1, 0x38bdf8);
    this.shieldText = scene.add.text(256, 24, '🛡️ 0', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#0369a1',
      resolution: 2,
    }).setOrigin(0.5);

    // Class Badge Pill (Between Shield and Timer)
    const classConfig = this.player.classConfig;
    const className = classConfig ? classConfig.name : 'Người Kiểm Chứng';
    const classIcon = classConfig ? classConfig.badgeIcon : '🔍';
    const themeColor = classConfig ? classConfig.themeColor : 0x0284c7;
    const themeHex = classConfig ? classConfig.themeHex : '#0369a1';

    const classBadgeX = 390;
    this.classBadgeBg = scene.add.rectangle(classBadgeX, 24, 184, 24, 0xf8fafc, 1);
    this.classBadgeBg.setStrokeStyle(1.5, themeColor);
    this.classBadgeText = scene.add.text(classBadgeX, 24, `${classIcon} ${className}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: themeHex,
      resolution: 2,
    }).setOrigin(0.5);

    this.container.add([hpBg, this.hpBarFill, heartIcon, this.hpText, shieldPill, this.shieldText, this.classBadgeBg, this.classBadgeText]);

    // 2. XP Bar & Level (Full width underneath top bar)
    const xpBg = scene.add.rectangle(width / 2, 54, width - 32, 7, 0xe2e8f0);
    this.xpBarFill = scene.add.rectangle(16, 54, 0, 7, 0x0284c7).setOrigin(0, 0.5);

    // Level Badge Pill (Left-aligned above XP bar)
    const levelPill = scene.add.rectangle(52, 38, 70, 18, 0xf0f9ff, 1);
    levelPill.setStrokeStyle(1, 0xbae6fd);
    this.levelText = scene.add.text(52, 38, '⭐ LV. 1', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#0284c7',
      resolution: 2,
    }).setOrigin(0.5);

    this.container.add([xpBg, this.xpBarFill, levelPill, this.levelText]);

    // 3. Community Meter Bar (Top Right)
    const commX = width - 150;
    const commBg = scene.add.rectangle(commX, 24, 170, 18, 0xe2e8f0);
    commBg.setStrokeStyle(1, 0x94a3b8);
    this.communityBarFill = scene.add.rectangle(commX - 85, 24, 170, 18, 0x0891b2).setOrigin(0, 0.5);
    this.communityText = scene.add.text(commX, 24, '🌐 MÔI TRƯỜNG: 75%', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#0f172a',
      resolution: 2,
    }).setOrigin(0.5);

    this.crisisWarningText = scene.add.text(commX, 39, '⚠️ KHỦNG HOẢNG VĂN HÓA SỐ (-25% SỨC MẠNH)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#dc2626',
      resolution: 2,
    }).setOrigin(0.5).setVisible(false);

    this.container.add([commBg, this.communityBarFill, this.communityText, this.crisisWarningText]);

    // 4. Timer & Wave Info (Top Center)
    this.timerText = scene.add.text(width / 2 - 36, 17, '⏱️ 00:00', {
      fontFamily: 'monospace, system-ui',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#0f172a',
      resolution: 2,
    }).setOrigin(0.5);

    this.waveText = scene.add.text(width / 2 - 36, 37, 'LÀN SÓNG 1', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#0284c7',
      resolution: 2,
    }).setOrigin(0.5);

    // Help Button (Open Guide anytime)
    const helpX = width / 2 + 74;
    const helpBg = scene.add.rectangle(helpX, 24, 102, 28, 0xf0f9ff, 1);
    helpBg.setStrokeStyle(1.5, 0x38bdf8);
    const helpText = scene.add.text(helpX, 24, '❓ Trợ giúp [H]', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#0284c7',
      resolution: 2,
    }).setOrigin(0.5);

    helpBg.setInteractive({ useHandCursor: true });
    helpText.setInteractive({ useHandCursor: true });

    helpBg.on('pointerover', () => {
      helpBg.setFillStyle(0xe0f2fe, 1);
      helpBg.setStrokeStyle(1.5, 0x0284c7);
      helpText.setColor('#0369a1');
    });
    helpBg.on('pointerout', () => {
      helpBg.setFillStyle(0xf0f9ff, 1);
      helpBg.setStrokeStyle(1.5, 0x38bdf8);
      helpText.setColor('#0284c7');
    });

    const triggerOpen = () => {
      if (onOpenGuide) onOpenGuide();
    };

    helpBg.on('pointerdown', triggerOpen);
    helpText.on('pointerdown', triggerOpen);

    if (onOpenGuide) {
      scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (Math.abs(pointer.x - helpX) < 54 && Math.abs(pointer.y - 24) < 16) {
          triggerOpen();
        }
      });
    }

    // Active Combos Tray (Underneath XP bar at y = 72)
    this.comboTrayContainer = scene.add.container(0, 72);
    this.comboTrayContainer.setVisible(false);

    // Active Buff Display Banner (Under top bar / combo tray)
    this.activeBuffPill = scene.add.rectangle(width / 2, 72, 520, 22, 0xecfdf5, 0.95);
    this.activeBuffPill.setStrokeStyle(1, 0xa7f3d0).setVisible(false);

    this.activeBuffText = scene.add.text(width / 2, 72, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#065f46',
      resolution: 2,
    }).setOrigin(0.5).setVisible(false);

    this.container.add([this.timerText, this.waveText, helpBg, helpText, this.comboTrayContainer, this.activeBuffPill, this.activeBuffText]);

    // 5. Bottom Status Bar (Kills counter & 8 Cultural Pillars)
    const bottomBg = scene.add.rectangle(width / 2, height - 22, width - 32, 34, 0xffffff, 0.95);
    bottomBg.setStrokeStyle(1.5, 0xcbd5e1);
    this.container.add(bottomBg);

    this.killsText = scene.add.text(35, height - 22, '⚔️ ĐÃ ĐẨY LÙI: 0', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#0f172a',
      resolution: 2,
    }).setOrigin(0, 0.5);

    this.pillarsText = scene.add.text(width - 35, height - 22, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#0284c7',
      resolution: 2,
    }).setOrigin(1, 0.5);

    this.container.add([this.killsText, this.pillarsText]);
  }

  public update(
    runSeconds: number,
    kills: number,
    currentWave?: WaveConfig,
    buffText?: string,
    activeCombos?: ComboConfig[]
  ): void {
    // 1. Update Timer
    const m = Math.floor(runSeconds / 60);
    const s = Math.floor(runSeconds % 60);
    this.timerText.setText(`⏱️ ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

    // 2. Update Wave
    this.waveText.setText(currentWave ? currentWave.id.toUpperCase().replace('_', ' ') : 'CHỐT CHẶN CUỐI');

    // 3. Update HP & Shield
    const hpRatio = Phaser.Math.Clamp(this.player.stats.hp / this.player.stats.maxHp, 0, 1);
    this.hpBarFill.width = 170 * hpRatio;
    this.hpText.setText(`HP: ${Math.round(this.player.stats.hp)}/${this.player.stats.maxHp}`);
    this.shieldText.setText(`🛡️ ${Math.round(this.player.stats.shield)}`);

    if (hpRatio < 0.25) {
      this.hpBarFill.setFillStyle(0xef4444);
    } else if (hpRatio < 0.5) {
      this.hpBarFill.setFillStyle(0xf59e0b);
    } else {
      this.hpBarFill.setFillStyle(0x10b981);
    }

    // 4. Update XP
    const xpRatio = Phaser.Math.Clamp(this.player.currentXP / this.player.nextLevelXP, 0, 1);
    this.xpBarFill.width = (this.scene.scale.width - 32) * xpRatio;
    this.levelText.setText(`⭐ LV. ${this.player.level}`);

    // 5. Update Community Meter
    const meter = this.communityMeter.meterValue;
    this.communityBarFill.width = 170 * (meter / 100);

    if (meter <= 0) {
      this.communityText.setText('🌐 MÔI TRƯỜNG: 0% [KHỦNG HOẢNG]');
      this.crisisWarningText.setVisible(true);
      this.communityBarFill.setFillStyle(0xdc2626);
    } else if (meter < 30) {
      this.communityText.setText(`🌐 MÔI TRƯỜNG: ${Math.round(meter)}% [Ô NHIỄM]`);
      this.crisisWarningText.setVisible(false);
      this.communityBarFill.setFillStyle(0xf59e0b);
    } else if (meter > 70) {
      this.communityText.setText(`🌐 MÔI TRƯỜNG: ${Math.round(meter)}% [TRONG LÀNH]`);
      this.crisisWarningText.setVisible(false);
      this.communityBarFill.setFillStyle(0x10b981);
    } else {
      this.communityText.setText(`🌐 MÔI TRƯỜNG: ${Math.round(meter)}%`);
      this.crisisWarningText.setVisible(false);
      this.communityBarFill.setFillStyle(0x0891b2);
    }

    // 6. Update Active Combos Tray
    const combos = activeCombos || [];
    if (combos.length !== this.lastRenderedCombosCount) {
      this.lastRenderedCombosCount = combos.length;
      this.comboTrayContainer.removeAll(true);

      if (combos.length > 0) {
        this.comboTrayContainer.setVisible(true);
        const { width } = this.scene.scale;
        const badgeW = 168;
        const gap = 12;
        const totalW = combos.length * badgeW + (combos.length - 1) * gap;
        let startX = width / 2 - totalW / 2 + badgeW / 2;

        combos.forEach(c => {
          const bg = this.scene.add.rectangle(startX, 0, badgeW, 22, 0xf5f3ff, 0.95);
          bg.setStrokeStyle(1.5, 0x7c3aed);
          const txt = this.scene.add.text(startX, 0, `✨ ${c.name}`, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#6d28d9',
            resolution: 2,
          }).setOrigin(0.5);
          this.comboTrayContainer.add([bg, txt]);
          startX += badgeW + gap;
        });
      } else {
        this.comboTrayContainer.setVisible(false);
      }
    }

    // 7. Update Active Buff Banner (30s Scenario Buff Countdown)
    const hasCombos = combos.length > 0;
    const buffY = hasCombos ? 100 : 72;
    this.activeBuffPill.setY(buffY);
    this.activeBuffText.setY(buffY);

    if (buffText && buffText.length > 0) {
      this.activeBuffText.setText(buffText);
      this.activeBuffPill.width = Math.max(560, this.activeBuffText.width + 40);
      this.activeBuffText.setVisible(true);
      this.activeBuffPill.setVisible(true);
    } else {
      this.activeBuffText.setVisible(false);
      this.activeBuffPill.setVisible(false);
    }

    // 7. Update Kills & Pillars
    this.killsText.setText(`⚔️ ĐÃ ĐẨY LÙI: ${kills}`);
    const v = this.player.values;
    const summary = `🇻🇳 ${v.danToc}  🔬 ${v.khoaHoc}  👥 ${v.daiChung}  |  ⚖️ ${v.chan}  ❤️ ${v.thien}  🎨 ${v.my}  |  🏗️ ${v.build} (P:${this.player.stats.buildPower})  ⚔️ ${v.fight} (P:${this.player.stats.fightPower})`;
    this.pillarsText.setText(summary);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
