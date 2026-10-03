import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { UpgradeConfig } from '../types/data';
import { DataLoader } from '../../data/loader';
import { SoundSystem } from '../systems/SoundSystem';

export class UpgradeManager {
  private scene: Phaser.Scene;
  private player: Player;
  private allUpgrades: UpgradeConfig[] = [];
  private overlayContainer?: Phaser.GameObjects.Container;
  private isShowing: boolean = false;
  private onSelectResumeCallback: () => void;
  private cleanupListeners?: () => void;

  constructor(scene: Phaser.Scene, player: Player, onSelectResume: () => void) {
    this.scene = scene;
    this.player = player;
    this.onSelectResumeCallback = onSelectResume;
    this.allUpgrades = DataLoader.getUpgrades();
  }

  public showUpgradeSelection(): void {
    if (this.isShowing) return;
    this.isShowing = true;

    SoundSystem.playLevelUp();

    // Pick 3 random cards from upgrades
    const choices = this.getRandomUpgrades(3);
    const { width, height } = this.scene.scale;

    this.overlayContainer = this.scene.add.container(0, 0);
    this.overlayContainer.setDepth(100);
    this.overlayContainer.setScrollFactor(0); // PIN TO SCREEN!

    // Soft dim backdrop
    const bg = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x0f172a, 0.45);
    this.overlayContainer.add(bg);

    // Modal Card Window
    const winWidth = 980;
    const winHeight = 520;
    const winBg = this.scene.add.rectangle(width / 2, height / 2, winWidth, winHeight, 0xf8fafc, 0.98);
    winBg.setStrokeStyle(2, 0x94a3b8);
    this.overlayContainer.add(winBg);

    // Title
    const title = this.scene.add.text(width / 2, height / 2 - winHeight / 2 + 45, '⭐ LÊN CẤP: TIẾP NHẬN GIÁ TRỊ VĂN HÓA ⭐', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#0369a1',
      resolution: 2,
    }).setOrigin(0.5);

    const sub = this.scene.add.text(width / 2, height / 2 - winHeight / 2 + 75, 'Lựa chọn 1 định hướng giá trị để nâng cấp sức mạnh chiến đấu và kiến tạo (Bấm thẻ hoặc bấm phím 1, 2, 3):', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#475569',
      resolution: 2,
    }).setOrigin(0.5);

    this.overlayContainer.add([title, sub]);

    // Render 3 cards
    const cardWidth = 280;
    const cardHeight = 340;
    const gap = 24;
    const startX = width / 2 - (cardWidth * 1.5 + gap);

    choices.forEach((upgrade, index) => {
      const cardX = startX + index * (cardWidth + gap) + cardWidth / 2;
      const cardY = height / 2 + 35;

      const card = this.createUpgradeCard(cardX, cardY, cardWidth, cardHeight, upgrade, index + 1);
      this.overlayContainer?.add(card);
    });

    // Screen-space pointer listener (Bypasses Phaser camera scroll container hit-test bug)
    const onScreenPointerDown = (pointer: Phaser.Input.Pointer) => {
      if (!this.isShowing) return;
      for (let index = 0; index < choices.length; index++) {
        const cardX = startX + index * (cardWidth + gap) + cardWidth / 2;
        const cardY = height / 2 + 35;
        if (
          Math.abs(pointer.x - cardX) < cardWidth / 2 &&
          Math.abs(pointer.y - cardY) < cardHeight / 2
        ) {
          this.selectUpgrade(choices[index]);
          return;
        }
      }
    };

    this.scene.input.on('pointerdown', onScreenPointerDown);

    // Keyboard shortcuts: 1, 2, 3
    const onKey1 = () => { if (this.isShowing && choices[0]) this.selectUpgrade(choices[0]); };
    const onKey2 = () => { if (this.isShowing && choices[1]) this.selectUpgrade(choices[1]); };
    const onKey3 = () => { if (this.isShowing && choices[2]) this.selectUpgrade(choices[2]); };

    this.scene.input.keyboard?.once('keydown-ONE', onKey1);
    this.scene.input.keyboard?.once('keydown-TWO', onKey2);
    this.scene.input.keyboard?.once('keydown-THREE', onKey3);

    this.cleanupListeners = () => {
      this.scene.input.off('pointerdown', onScreenPointerDown);
      this.scene.input.keyboard?.off('keydown-ONE', onKey1);
      this.scene.input.keyboard?.off('keydown-TWO', onKey2);
      this.scene.input.keyboard?.off('keydown-THREE', onKey3);
    };
  }

  private createUpgradeCard(
    x: number,
    y: number,
    w: number,
    h: number,
    upgrade: UpgradeConfig,
    keyNumber: number
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // Card background (Elevated white card with crisp shadow border)
    const bg = this.scene.add.rectangle(0, 0, w, h, 0xffffff, 1);
    bg.setStrokeStyle(1.5, 0xcbd5e1);

    // Category banner colors
    const catColors: Record<string, { bg: number; text: string }> = {
      danToc: { bg: 0xfef3c7, text: '#b45309' },
      khoaHoc: { bg: 0xe0f2fe, text: '#0369a1' },
      daiChung: { bg: 0xede9fe, text: '#4338ca' },
      chan: { bg: 0xd1fae5, text: '#047857' },
      thien: { bg: 0xfce7f3, text: '#be185d' },
      my: { bg: 0xffedd5, text: '#c2410c' },
      build: { bg: 0xccfbf1, text: '#0f766e' },
      fight: { bg: 0xfee2e2, text: '#b91c1c' },
    };

    const colorConfig = catColors[upgrade.category] || { bg: 0xf1f5f9, text: '#334155' };

    // Badge Pill
    const badgeBg = this.scene.add.rectangle(0, -h / 2 + 35, w - 40, 28, colorConfig.bg, 1);
    badgeBg.setStrokeStyle(1, 0xe2e8f0);

    const catBadge = this.scene.add.text(0, -h / 2 + 35, `TRỤ CỘT: ${upgrade.category.toUpperCase()}`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: colorConfig.text,
      resolution: 2,
    }).setOrigin(0.5);

    // Upgrade Name
    const nameText = this.scene.add.text(0, -h / 2 + 85, upgrade.name, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#0f172a',
      align: 'center',
      wordWrap: { width: w - 24 },
      resolution: 2,
    }).setOrigin(0.5);

    // Description
    const descText = this.scene.add.text(0, 15, upgrade.description, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#334155',
      align: 'center',
      wordWrap: { width: w - 30 },
      lineSpacing: 5,
      resolution: 2,
    }).setOrigin(0.5);

    // Select Button
    const btnBox = this.scene.add.rectangle(0, h / 2 - 42, w - 40, 42, 0x0284c7);
    btnBox.setStrokeStyle(1, 0x0369a1);

    const btnText = this.scene.add.text(0, h / 2 - 42, `TIẾP NHẬN [Phím ${keyNumber}]`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    container.add([bg, badgeBg, catBadge, nameText, descText, btnBox, btnText]);
    return container;
  }

  private selectUpgrade(upgrade: UpgradeConfig): void {
    if (this.cleanupListeners) {
      this.cleanupListeners();
      this.cleanupListeners = undefined;
    }
    SoundSystem.playGem();
    this.player.applyUpgrade(upgrade);
    this.overlayContainer?.destroy();
    this.overlayContainer = undefined;
    this.isShowing = false;
    this.onSelectResumeCallback();
  }

  private getRandomUpgrades(count: number): UpgradeConfig[] {
    const shuffled = [...this.allUpgrades].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}
