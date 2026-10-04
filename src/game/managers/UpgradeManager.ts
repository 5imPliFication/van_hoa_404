import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { UpgradeConfig } from '../types/data';
import { DataLoader } from '../../data/loader';
import { SoundSystem } from '../systems/SoundSystem';

import { CommunityMeterManager } from './CommunityMeterManager';

export class UpgradeManager {
  private scene: Phaser.Scene;
  private player: Player;
  private communityMeter?: CommunityMeterManager;
  private allUpgrades: UpgradeConfig[] = [];
  private overlayContainer?: Phaser.GameObjects.Container;
  private isShowing: boolean = false;
  private onSelectResumeCallback: () => void;
  private cleanupListeners?: () => void;

  constructor(scene: Phaser.Scene, player: Player, communityMeter: CommunityMeterManager, onSelectResume: () => void) {
    this.scene = scene;
    this.player = player;
    this.communityMeter = communityMeter;
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

    // Category banner colors and friendly icons
    const catColors: Record<string, { bg: number; text: string; label: string }> = {
      danToc: { bg: 0xfef3c7, text: '#b45309', label: '🇻🇳 DÂN TỘC' },
      khoaHoc: { bg: 0xe0f2fe, text: '#0369a1', label: '🔬 KHOA HỌC' },
      daiChung: { bg: 0xede9fe, text: '#4338ca', label: '👥 ĐẠI CHÚNG' },
      chan: { bg: 0xd1fae5, text: '#047857', label: '⚖️ CHÂN LÝ' },
      thien: { bg: 0xfce7f3, text: '#be185d', label: '❤️ THIỆN LÀNH' },
      my: { bg: 0xffedd5, text: '#c2410c', label: '🎨 THẨM MỸ SỐ' },
      build: { bg: 0xccfbf1, text: '#0f766e', label: '🏗️ KIẾN TẠO (XÂY)' },
      fight: { bg: 0xfee2e2, text: '#b91c1c', label: '⚔️ ĐẤU TRANH (CHỐNG)' },
    };

    const colorConfig = catColors[upgrade.category] || { bg: 0xf1f5f9, text: '#334155', label: `TRỤ CỘT: ${upgrade.category.toUpperCase()}` };

    const currentLevel = (this.player.values as any)[upgrade.category] || 0;
    const nextLvl = currentLevel + 1;

    let dynamicDesc = upgrade.description;
    if (upgrade.id === 'sustain_mastery') {
      dynamicDesc = upgrade.description;
    } else if (upgrade.category === 'fight') {
      if (nextLvl === 1) dynamicDesc = '+1 Tia đạn bổ sung (2 tia), +2 Sát thương, +5 Sức mạnh Chống';
      else if (nextLvl === 2) dynamicDesc = '+2 Sát thương chuẩn xác, +6 Sức mạnh Chống';
      else if (nextLvl === 3) dynamicDesc = '+1 Tia đạn bổ sung (3 tia), +2 Sát thương, +7 Sức mạnh Chống';
      else if (nextLvl === 4) dynamicDesc = '+2 Sát thương chuẩn xác, +8 Sức mạnh Chống';
      else if (nextLvl === 5) dynamicDesc = '★ CẤP TỐI ĐA: +1 Tia đạn (4 tia), +2 Sát thương, +9 Sức mạnh Chống';
    } else if (upgrade.category === 'chan') {
      dynamicDesc = '+15% Sát thương đòn đánh chuẩn xác (+2.5 sát thương)';
    } else if (upgrade.category === 'khoaHoc') {
      dynamicDesc = '+8% Tốc độ bắn xả đạn, +4% Tỉ lệ đòn đánh bạo kích';
    } else if (upgrade.category === 'danToc') {
      dynamicDesc = '+15 Khiên chắn năng lượng, +10 Máu tối đa (HP)';
    } else if (upgrade.category === 'thien') {
      dynamicDesc = `Hồi phục +1 HP mỗi 4 giây (Hiện tại: hồi ${this.player.healPerInterval} HP/4s)`;
    } else if (upgrade.category === 'my') {
      dynamicDesc = '+10% Sát thương diện rộng và mở rộng hào quang bảo vệ';
    } else if (upgrade.category === 'daiChung') {
      dynamicDesc = '+22 Bán kính hút XP từ xa, +3 Sức mạnh Kiến Tạo (Xây)';
    } else if (upgrade.category === 'build') {
      dynamicDesc = '+12 Tốc độ di chuyển, hồi ngay +10% Môi Trường, +4 Sức mạnh Xây';
    }

    const badgeLabel = upgrade.id === 'sustain_mastery' ? '⭐ TỐI ĐA HÓA' : `${colorConfig.label} • CẤP ${nextLvl}/5`;

    // Badge Pill
    const badgeBg = this.scene.add.rectangle(0, -h / 2 + 35, w - 40, 28, colorConfig.bg, 1);
    badgeBg.setStrokeStyle(1.5, 0xcbd5e1);

    const catBadge = this.scene.add.text(0, -h / 2 + 35, badgeLabel, {
      fontFamily: 'system-ui, sans-serif',
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
    const descText = this.scene.add.text(0, 15, dynamicDesc, {
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
    btnBox.setStrokeStyle(1.5, 0x0369a1);

    const btnText = this.scene.add.text(0, h / 2 - 42, `TIẾP NHẬN [Phím ${keyNumber}]`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    // Interactive card hover states
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setStrokeStyle(2.5, 0x0284c7);
      btnBox.setFillStyle(0x0369a1);
      this.scene.tweens.add({
        targets: container,
        scale: 1.025,
        duration: 120,
        ease: 'Quad.easeOut',
      });
    });
    bg.on('pointerout', () => {
      bg.setStrokeStyle(1.5, 0xcbd5e1);
      btnBox.setFillStyle(0x0284c7);
      this.scene.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 120,
        ease: 'Quad.easeOut',
      });
    });

    container.add([bg, badgeBg, catBadge, nameText, descText, btnBox, btnText]);
    return container;
  }

  private selectUpgrade(upgrade: UpgradeConfig): void {
    if (this.cleanupListeners) {
      this.cleanupListeners();
      this.cleanupListeners = undefined;
    }
    SoundSystem.playGem();
    this.player.applyUpgrade(upgrade, (amt) => this.communityMeter?.modify(amt));
    this.overlayContainer?.destroy();
    this.overlayContainer = undefined;
    this.isShowing = false;
    this.onSelectResumeCallback();
  }

  private getRandomUpgrades(count: number): UpgradeConfig[] {
    // Filter only upgrades whose category is below the level cap of 5!
    const available = this.allUpgrades.filter(u => {
      const cat = u.category as any;
      return (this.player.values as any)[cat] < 5;
    });

    if (available.length === 0) {
      return [{
        id: 'sustain_mastery',
        name: 'Đại Viên Mãn Giá Trị (Hồi Phục)',
        category: 'daiChung',
        level: 5,
        maxLevel: 5,
        description: 'Đã tối đa hóa toàn bộ 8 trụ cột (5/5)! Hồi 40 HP, 25 Khiên và 20% Môi Trường.',
        effects: {
          shieldAdd: 25,
          communityPowerAdd: 20,
        },
        tags: ['sustain'],
      }];
    }

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}
