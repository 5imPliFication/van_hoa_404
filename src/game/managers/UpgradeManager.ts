import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { UpgradeConfig } from '../types/data';
import { DataLoader } from '../../data/loader';
import { SoundSystem } from '../systems/SoundSystem';
import { TINH_HOA, PILLAR_MEANINGS, PILLAR_LABELS, VALUE_FOUNDATION, FOUNDATION_LEAD } from '../../data/lesson';
import { Pillar } from '../types/player';

import { CommunityMeterManager } from './CommunityMeterManager';
import { EXTRA_ATTACK_LABEL } from './WeaponSystem';

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

    // Values held back by their core-pillar foundation (Player.pillarCap)
    const blocked = Object.entries(VALUE_FOUNDATION)
      .filter(([value]) => {
        const lv = this.player.values[value as Pillar] || 0;
        return lv < 5 && lv >= this.player.pillarCap(value as Pillar);
      })
      .map(([value, core]) => `${PILLAR_LABELS[value]} chờ ${PILLAR_LABELS[core]} cấp ${(this.player.values[value as Pillar] || 0) + 1 - FOUNDATION_LEAD}`);
    if (blocked.length > 0) {
      this.overlayContainer.add(this.scene.add.text(width / 2, height / 2 + winHeight / 2 - 26,
        `🧱 Giá trị cần nền móng: ${blocked.join('  ·  ')}`, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#b45309',
          resolution: 2,
        }).setOrigin(0.5));
    }

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
    const isTinhHoa = upgrade.id === 'tinhHoaNhanLoai';
    if (isTinhHoa) {
      const d = this.player.values.danToc || 0;
      dynamicDesc = this.player.hasTinhHoaRoot()
        ? `✓ Gốc Dân tộc vững (cấp ${d}) — tiếp thu trọn vẹn:\n+3 Sát thương, +0.08 Tốc bắn, +3% Chí mạng`
        : `⚠ Dân tộc mới cấp ${d}/${TINH_HOA.requiredDanToc} — thiếu gốc, chỉ tiếp thu hời hợt:\n+1 Sát thương`;
    } else if (upgrade.id === 'sustain_mastery') {
      dynamicDesc = upgrade.description;
    } else if (upgrade.category === 'fight') {
      // The "+1" at levels 1/3/5 depends on the class weapon (bullet / echo wave / bigger drum cone)
      const style = this.player.classConfig?.startingWeapon || 'sniper';
      const unit = EXTRA_ATTACK_LABEL[style];
      const nextCount = this.player.stats.projectileCount + 1;
      const extra = style === 'pulse'
        ? `+1 Sóng dư chấn 60% (${nextCount} ${unit})`
        : style === 'drum'
          ? 'Sóng trống xa hơn 12 px, rộng hơn 4°'
          : `+1 Tia đạn bổ sung (${nextCount} ${unit})`;
      if (nextLvl === 1) dynamicDesc = `${extra}, +2 Sát thương, +5 Sức mạnh Chống`;
      else if (nextLvl === 2) dynamicDesc = '+2 Sát thương chuẩn xác, +6 Sức mạnh Chống';
      else if (nextLvl === 3) dynamicDesc = `${extra}, +2 Sát thương, +7 Sức mạnh Chống`;
      else if (nextLvl === 4) dynamicDesc = '+2 Sát thương chuẩn xác, +8 Sức mạnh Chống';
      else if (nextLvl === 5) dynamicDesc = `★ CẤP TỐI ĐA: ${extra}, +2 Sát thương, +9 Sức mạnh Chống`;
    } else if (upgrade.category === 'chan') {
      dynamicDesc = '+15% Sát thương đòn đánh chuẩn xác (+2.5 sát thương)';
    } else if (upgrade.category === 'khoaHoc') {
      dynamicDesc = '+8% Tốc độ bắn xả đạn, +4% Tỉ lệ đòn đánh bạo kích';
    } else if (upgrade.category === 'danToc') {
      dynamicDesc = this.player.classConfig?.startingWeapon === 'drum'
        ? '+15 Khiên, +10 Máu tối đa, sóng trống đồng xa và rộng hơn'
        : '+15 Khiên chắn năng lượng, +10 Máu tối đa (HP)';
    } else if (upgrade.category === 'thien') {
      dynamicDesc = `Hồi phục +1 HP mỗi 5 giây (Hiện tại: hồi ${this.player.healPerInterval} HP/5s)`;
    } else if (upgrade.category === 'my') {
      dynamicDesc = '+10% Sát thương diện rộng và mở rộng hào quang bảo vệ';
    } else if (upgrade.category === 'daiChung') {
      dynamicDesc = '+22 Bán kính hút XP từ xa, +3 Sức mạnh Kiến Tạo (Xây)';
    } else if (upgrade.category === 'build') {
      dynamicDesc = '+12 Tốc độ di chuyển, hồi ngay +10% Môi Trường, +4 Sức mạnh Xây';
    }

    const badgeLabel = isTinhHoa
      ? `🌏 TINH HOA NHÂN LOẠI • ${this.player.tinhHoaTaken + 1}/${TINH_HOA.maxStacks}`
      : upgrade.id === 'sustain_mastery' ? '⭐ TỐI ĐA HÓA' : `${colorConfig.label} • CẤP ${nextLvl}/5`;

    // Badge Pill
    const badgeBg = this.scene.add.rectangle(0, -h / 2 + 35, w - 40, 28, isTinhHoa ? 0xf3e8ff : colorConfig.bg, 1);
    badgeBg.setStrokeStyle(1.5, 0xcbd5e1);

    const catBadge = this.scene.add.text(0, -h / 2 + 35, badgeLabel, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: isTinhHoa ? '#7e22ce' : colorConfig.text,
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

    const meaning = !isTinhHoa && upgrade.id !== 'sustain_mastery' ? PILLAR_MEANINGS[upgrade.category] : undefined;
    if (meaning) {
      container.add(this.scene.add.text(0, -36, meaning, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'italic',
        color: colorConfig.text,
        align: 'center',
        wordWrap: { width: w - 30 },
        resolution: 2,
      }).setOrigin(0.5));
    }

    // Core card: show which value this level lets grow further
    const foundationOf = Object.entries(VALUE_FOUNDATION).find(([, core]) => core === upgrade.category)?.[0];
    if (!isTinhHoa && upgrade.id !== 'sustain_mastery' && foundationOf) {
      const newCap = Math.min(5, nextLvl + FOUNDATION_LEAD);
      container.add(this.scene.add.text(0, h / 2 - 88, `🧱 Nền móng: ${PILLAR_LABELS[foundationOf]} được lên tới cấp ${newCap}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#b45309',
        align: 'center',
        wordWrap: { width: w - 30 },
        resolution: 2,
      }).setOrigin(0.5));
    }

    if (isTinhHoa) {
      const quote = this.scene.add.text(0, h / 2 - 90, `“${TINH_HOA.learnQuote}”\nnhưng lấy văn hóa dân tộc làm gốc`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'italic',
        color: '#6b21a8',
        align: 'center',
        wordWrap: { width: w - 30 },
        lineSpacing: 3,
        resolution: 2,
      }).setOrigin(0.5);
      container.add(quote);
    }
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
    // Only pillars below their cap: level 5, or for Chân/Thiện/Mỹ their core-pillar foundation
    const available = this.allUpgrades.filter(u => {
      const cat = u.category as Pillar;
      return (this.player.values[cat] || 0) < this.player.pillarCap(cat);
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

    const affinity = this.player.classConfig?.affinity || [];
    const weightedPool: UpgradeConfig[] = [];

    // Boost frequency of affinity upgrades by 2.5x in the candidate pool
    for (const u of available) {
      const weight = affinity.includes(u.category) ? 3 : 1;
      for (let w = 0; w < weight; w++) {
        weightedPool.push(u);
      }
    }

    const shuffled = [...weightedPool].sort(() => 0.5 - Math.random());
    const selected: UpgradeConfig[] = [];
    const seenCategories = new Set<string>();

    for (const u of shuffled) {
      if (!seenCategories.has(u.category)) {
        seenCategories.add(u.category);
        selected.push(u);
        if (selected.length >= count) break;
      }
    }

    // Fallback if fewer distinct categories were chosen
    if (selected.length < count) {
      for (const u of available) {
        if (!selected.some(s => s.id === u.id)) {
          selected.push(u);
          if (selected.length >= count) break;
        }
      }
    }

    const result = selected.slice(0, count);
    if (
      this.player.level >= TINH_HOA.minPlayerLevel &&
      this.player.tinhHoaTaken < TINH_HOA.maxStacks &&
      result.length > 0 &&
      Math.random() < 0.35
    ) {
      result[result.length - 1] = UpgradeManager.TINH_HOA_CARD;
    }
    return result;
  }

  private static readonly TINH_HOA_CARD: UpgradeConfig = {
    id: 'tinhHoaNhanLoai',
    name: 'Tiếp Thu Tinh Hoa Nhân Loại (Đông, Tây, kim, cổ)',
    category: 'danToc',
    level: 1,
    maxLevel: TINH_HOA.maxStacks,
    description: '',
    effects: {},
    tags: ['tinhHoa'],
  };
}
