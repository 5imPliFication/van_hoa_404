import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { UpgradeConfig } from '../types/data';
import { DataLoader } from '../../data/loader';

export class UpgradeManager {
  private scene: Phaser.Scene;
  private player: Player;
  private allUpgrades: UpgradeConfig[] = [];
  private overlayContainer?: Phaser.GameObjects.Container;
  private isShowing: boolean = false;
  private onSelectResumeCallback: () => void;

  constructor(scene: Phaser.Scene, player: Player, onSelectResume: () => void) {
    this.scene = scene;
    this.player = player;
    this.onSelectResumeCallback = onSelectResume;
    this.allUpgrades = DataLoader.getUpgrades();
  }

  public showUpgradeSelection(): void {
    if (this.isShowing) return;
    this.isShowing = true;

    // Pick 3 random cards from upgrades
    const choices = this.getRandomUpgrades(3);
    const { width, height } = this.scene.scale;

    this.overlayContainer = this.scene.add.container(0, 0);
    this.overlayContainer.setDepth(100);

    // Dimmed background
    const bg = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);
    bg.setInteractive(); // block inputs below
    this.overlayContainer.add(bg);

    // Title
    const title = this.scene.add.text(width / 2, height * 0.22, 'NÂNG CẤP HỆ GIÁ TRỊ VĂN HÓA', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#00f0ff',
      shadow: { blur: 10, color: '#00f0ff', fill: true },
    }).setOrigin(0.5);
    this.overlayContainer.add(title);

    const sub = this.scene.add.text(width / 2, height * 0.28, 'Chọn 1 trong 3 định hướng phát triển sức mạnh:', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#94a3b8',
    }).setOrigin(0.5);
    this.overlayContainer.add(sub);

    // Render 3 cards
    const cardWidth = 270;
    const cardHeight = 310;
    const gap = 30;
    const startX = width / 2 - (cardWidth * 1.5 + gap);

    choices.forEach((upgrade, index) => {
      const cardX = startX + index * (cardWidth + gap) + cardWidth / 2;
      const cardY = height * 0.56;

      const card = this.createUpgradeCard(cardX, cardY, cardWidth, cardHeight, upgrade);
      this.overlayContainer?.add(card);
    });
  }

  private createUpgradeCard(
    x: number,
    y: number,
    w: number,
    h: number,
    upgrade: UpgradeConfig
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // Card background
    const bg = this.scene.add.rectangle(0, 0, w, h, 0x0f172a, 0.95);
    bg.setStrokeStyle(2, 0x38bdf8);
    bg.setInteractive({ useHandCursor: true });

    // Category banner
    const catLabel = upgrade.category.toUpperCase();
    const catBadge = this.scene.add.text(0, -h / 2 + 30, `[ ${catLabel} ]`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#38bdf8',
    }).setOrigin(0.5);

    // Upgrade Name
    const nameText = this.scene.add.text(0, -h / 2 + 75, upgrade.name, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f8fafc',
      align: 'center',
      wordWrap: { width: w - 24 },
    }).setOrigin(0.5);

    // Description
    const descText = this.scene.add.text(0, 10, upgrade.description, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: w - 28 },
      lineSpacing: 4,
    }).setOrigin(0.5);

    // Select Button / Prompt
    const btnBox = this.scene.add.rectangle(0, h / 2 - 40, w - 40, 40, 0x0369a1);
    const btnText = this.scene.add.text(0, h / 2 - 40, 'TIẾP NHẬN', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    container.add([bg, catBadge, nameText, descText, btnBox, btnText]);

    bg.on('pointerover', () => {
      bg.setStrokeStyle(3, 0x00f0ff);
      bg.setFillStyle(0x1e293b, 1);
      container.setScale(1.04);
    });

    bg.on('pointerout', () => {
      bg.setStrokeStyle(2, 0x38bdf8);
      bg.setFillStyle(0x0f172a, 0.95);
      container.setScale(1.0);
    });

    bg.on('pointerdown', () => {
      this.selectUpgrade(upgrade);
    });

    return container;
  }

  private selectUpgrade(upgrade: UpgradeConfig): void {
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
