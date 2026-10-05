import Phaser from 'phaser';
import { CharacterClassConfig } from '../types/data';
import { DataLoader } from '../../data/loader';
import { SoundSystem } from '../systems/SoundSystem';

export class CharacterSelectScene extends Phaser.Scene {
  private classes: CharacterClassConfig[] = [];
  private selectedIndex: number = 0;
  private cardContainers: Phaser.GameObjects.Container[] = [];
  private cardBgs: Phaser.GameObjects.Rectangle[] = [];
  private selectBtnTexts: Phaser.GameObjects.Text[] = [];
  private selectBtnBgs: Phaser.GameObjects.Rectangle[] = [];
  private confirmBtnText?: Phaser.GameObjects.Text;
  private confirmBtnBg?: Phaser.GameObjects.Rectangle;

  constructor() {
    super('CharacterSelectScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.classes = DataLoader.getClasses();
    this.selectedIndex = 0;
    this.cardContainers = [];
    this.cardBgs = [];
    this.selectBtnTexts = [];
    this.selectBtnBgs = [];

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0xf8fafc, 1);
    this.add.grid(width / 2, height / 2, width, height, 48, 48, 0xf8fafc, 1, 0xe2e8f0, 0.75);

    // Back button at top-left
    const backBtnBg = this.add.rectangle(85, 36, 120, 36, 0xffffff, 1);
    backBtnBg.setStrokeStyle(1.5, 0xcbd5e1);
    backBtnBg.setInteractive({ useHandCursor: true });

    const backBtnTxt = this.add.text(85, 36, '← QUAY LẠI', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#475569',
      resolution: 2,
    }).setOrigin(0.5);

    const goBack = () => {
      SoundSystem.playGem();
      this.cameras.main.fadeOut(200, 241, 245, 249);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    };

    backBtnBg.on('pointerdown', goBack);
    backBtnBg.on('pointerover', () => {
      backBtnBg.setFillStyle(0xf1f5f9);
      backBtnTxt.setColor('#0f172a');
    });
    backBtnBg.on('pointerout', () => {
      backBtnBg.setFillStyle(0xffffff);
      backBtnTxt.setColor('#475569');
    });

    // Top Category Badge
    const badgeBg = this.add.rectangle(width / 2, 28, 300, 24, 0xe0f2fe, 1);
    badgeBg.setStrokeStyle(1, 0xbae6fd);
    this.add.text(width / 2, 28, '🏛️ HỆ THỐNG VAI TRÒ VĂN HÓA SỐ', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#0369a1',
      resolution: 2,
    }).setOrigin(0.5);

    // Title & Subtitle
    this.add.text(width / 2, 56, 'CHỌN VAI TRÒ BẢO VỆ KHÔNG GIAN MẠNG', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#0f172a',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(width / 2, 80, 'Mỗi vai trò sở hữu cơ chế vũ khí nền tảng, phong cách chiến đấu và kỹ năng nội tại riêng biệt (Bấm chọn hoặc phím 1, 2, 3):', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#475569',
      resolution: 2,
    }).setOrigin(0.5);

    // 3 Character Cards layout
    const cardW = 370;
    const cardH = 480;
    const gap = 24;
    const totalW = cardW * 3 + gap * 2;
    const startX = width / 2 - totalW / 2 + cardW / 2;
    const cardY = height / 2 + 30;

    this.classes.forEach((c, idx) => {
      const cx = startX + idx * (cardW + gap);
      const container = this.createClassCard(cx, cardY, cardW, cardH, c, idx);
      this.cardContainers.push(container);
    });

    // Bottom Confirm Button
    const confirmY = height - 42;
    this.confirmBtnBg = this.add.rectangle(width / 2, confirmY, 440, 48, 0x0284c7);
    this.confirmBtnBg.setStrokeStyle(2, 0x0369a1);
    this.confirmBtnBg.setInteractive({ useHandCursor: true });

    this.confirmBtnText = this.add.text(width / 2, confirmY, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    const onConfirm = () => {
      const selected = this.classes[this.selectedIndex] || this.classes[0];
      SoundSystem.playLevelUp();
      this.cameras.main.fadeOut(300, 241, 245, 249);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene', { classConfig: selected });
      });
    };

    this.confirmBtnBg.on('pointerdown', onConfirm);
    this.confirmBtnBg.on('pointerover', () => {
      this.confirmBtnBg?.setFillStyle(0x0369a1);
      this.confirmBtnBg?.setScale(1.02);
      this.confirmBtnText?.setScale(1.02);
    });
    this.confirmBtnBg.on('pointerout', () => {
      this.confirmBtnBg?.setFillStyle(0x0284c7);
      this.confirmBtnBg?.setScale(1.0);
      this.confirmBtnText?.setScale(1.0);
    });

    // Keyboard Shortcuts
    this.input.keyboard?.on('keydown-ONE', () => this.selectClass(0));
    this.input.keyboard?.on('keydown-TWO', () => this.selectClass(1));
    this.input.keyboard?.on('keydown-THREE', () => this.selectClass(2));
    this.input.keyboard?.on('keydown-ENTER', onConfirm);
    this.input.keyboard?.on('keydown-SPACE', onConfirm);
    this.input.keyboard?.on('keydown-ESC', goBack);

    // Initial Selection Refresh
    this.updateCardSelectionVisuals();
  }

  private createClassCard(
    cx: number,
    cy: number,
    w: number,
    h: number,
    config: CharacterClassConfig,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(cx, cy);

    // Base card background
    const bg = this.add.rectangle(0, 0, w, h, 0xffffff, 0.98);
    bg.setStrokeStyle(1.5, 0xcbd5e1);
    bg.setInteractive({ useHandCursor: true });
    this.cardBgs.push(bg);
    container.add(bg);

    // Top Header Banner
    const bannerH = 70;
    const bannerY = -h / 2 + bannerH / 2;
    const bannerBg = this.add.rectangle(0, bannerY, w, bannerH, 0xf8fafc, 1);
    bannerBg.setStrokeStyle(1, 0xe2e8f0);

    // Icon Circle Badge
    const iconCircle = this.add.circle(-w / 2 + 42, bannerY, 22, config.themeColor, 0.15);
    iconCircle.setStrokeStyle(1.5, config.themeColor);
    const iconTxt = this.add.text(-w / 2 + 42, bannerY, config.badgeIcon, { fontSize: '22px', resolution: 2 }).setOrigin(0.5);

    // Class Name & Title
    const nameTxt = this.add.text(-w / 2 + 76, bannerY - 11, config.name, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#0f172a',
      resolution: 2,
    }).setOrigin(0, 0.5);

    const titleTxt = this.add.text(-w / 2 + 76, bannerY + 13, config.title, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: config.themeHex,
      resolution: 2,
    }).setOrigin(0, 0.5);

    container.add([bannerBg, iconCircle, iconTxt, nameTxt, titleTxt]);

    // Role description
    const descTxt = this.add.text(0, -h / 2 + 96, config.roleDescription, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#475569',
      align: 'center',
      wordWrap: { width: w - 36 },
      lineSpacing: 3,
      resolution: 2,
    }).setOrigin(0.5, 0);
    container.add(descTxt);

    // 1. Box: Vũ Khí Khởi Đầu
    const wepY = -h / 2 + 185;
    const wepBox = this.add.rectangle(0, wepY, w - 30, 68, 0xf8fafc, 1);
    wepBox.setStrokeStyle(1, 0xe2e8f0);

    const wepHeader = this.add.text(-w / 2 + 25, wepY - 20, `⚔️ VŨ KHÍ: ${config.startingWeaponName.toUpperCase()}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: config.themeHex,
      resolution: 2,
    }).setOrigin(0, 0.5);

    const wepDesc = this.add.text(-w / 2 + 25, wepY + 8, config.startingWeaponDesc, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      color: '#334155',
      wordWrap: { width: w - 50 },
      lineSpacing: 2,
      resolution: 2,
    }).setOrigin(0, 0.5);

    container.add([wepBox, wepHeader, wepDesc]);

    // 2. Box: Chỉ số & Giá trị khởi đầu
    const statY = -h / 2 + 268;
    const statBox = this.add.rectangle(0, statY, w - 30, 64, 0xf1f5f9, 1);
    statBox.setStrokeStyle(1, 0xe2e8f0);

    const statHeader = this.add.text(-w / 2 + 25, statY - 18, '📊 CHỈ SỐ & GIÁ TRỊ GỐC:', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#475569',
      resolution: 2,
    }).setOrigin(0, 0.5);

    // Build stat chips text
    const statParts: string[] = [];
    if (config.startingStats.damage) statParts.push(`Công: ${config.startingStats.damage}`);
    if (config.startingStats.critChance) statParts.push(`Bạo kích: ${Math.round(config.startingStats.critChance * 100)}%`);
    if (config.startingStats.projectileSpeed) statParts.push(`Tốc đạn: ${config.startingStats.projectileSpeed}`);
    if (config.startingStats.hp && config.startingStats.hp > 100) statParts.push(`Máu: ${config.startingStats.hp}`);
    if (config.startingStats.shield) statParts.push(`Khiên: ${config.startingStats.shield}`);

    const valueParts: string[] = [];
    Object.entries(config.startingValues).forEach(([k, v]) => {
      valueParts.push(`${k}: +${v}`);
    });

    const statText = this.add.text(-w / 2 + 25, statY + 8, `• ${statParts.join('  •  ')}\n• Trụ cột: ${valueParts.join(', ')}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      color: '#0f172a',
      lineSpacing: 3,
      resolution: 2,
    }).setOrigin(0, 0.5);

    container.add([statBox, statHeader, statText]);

    // 3. Box: Kỹ Năng Nội Tại (Passive)
    const passY = -h / 2 + 352;
    const passBox = this.add.rectangle(0, passY, w - 30, 68, 0xf0fdf4, 1);
    passBox.setStrokeStyle(1, 0x86efac);

    const passHeader = this.add.text(-w / 2 + 25, passY - 18, `✨ NỘI TẠI: ${config.passive.name.toUpperCase()}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#15803d',
      resolution: 2,
    }).setOrigin(0, 0.5);

    const passDesc = this.add.text(-w / 2 + 25, passY + 10, config.passive.description, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      color: '#166534',
      wordWrap: { width: w - 50 },
      lineSpacing: 2,
      resolution: 2,
    }).setOrigin(0, 0.5);

    container.add([passBox, passHeader, passDesc]);

    // 4. Select Button inside Card
    const btnBoxY = h / 2 - 32;
    const cardBtnBg = this.add.rectangle(0, btnBoxY, w - 30, 40, 0xf1f5f9, 1);
    cardBtnBg.setStrokeStyle(1.5, 0xcbd5e1);
    this.selectBtnBgs.push(cardBtnBg);

    const cardBtnTxt = this.add.text(0, btnBoxY, `CHỌN VAI TRÒ [Phím ${index + 1}]`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#475569',
      resolution: 2,
    }).setOrigin(0.5);
    this.selectBtnTexts.push(cardBtnTxt);

    container.add([cardBtnBg, cardBtnTxt]);

    // Card interactive hover & click
    bg.on('pointerdown', () => this.selectClass(index));
    bg.on('pointerover', () => {
      if (this.selectedIndex !== index) {
        bg.setStrokeStyle(2, config.themeColor);
        cardBtnBg.setFillStyle(0xe2e8f0);
      }
      this.tweens.add({
        targets: container,
        scale: 1.02,
        duration: 120,
        ease: 'Quad.easeOut',
      });
    });

    bg.on('pointerout', () => {
      if (this.selectedIndex !== index) {
        bg.setStrokeStyle(1.5, 0xcbd5e1);
        cardBtnBg.setFillStyle(0xf1f5f9);
      }
      this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 120,
        ease: 'Quad.easeOut',
      });
    });

    return container;
  }

  private selectClass(index: number): void {
    if (this.selectedIndex === index) return;
    this.selectedIndex = index;
    SoundSystem.playGem();
    this.updateCardSelectionVisuals();
  }

  private updateCardSelectionVisuals(): void {
    this.classes.forEach((c, idx) => {
      const bg = this.cardBgs[idx];
      const btnBg = this.selectBtnBgs[idx];
      const btnTxt = this.selectBtnTexts[idx];

      if (idx === this.selectedIndex) {
        bg.setStrokeStyle(3, c.themeColor);
        btnBg.setFillStyle(c.themeColor);
        btnBg.setStrokeStyle(1.5, c.themeColor);
        btnTxt.setText(`✅ ĐÃ CHỌN [Phím ${idx + 1}]`);
        btnTxt.setColor('#ffffff');
      } else {
        bg.setStrokeStyle(1.5, 0xcbd5e1);
        btnBg.setFillStyle(0xf1f5f9);
        btnBg.setStrokeStyle(1, 0xcbd5e1);
        btnTxt.setText(`CHỌN VAI TRÒ [Phím ${idx + 1}]`);
        btnTxt.setColor('#475569');
      }
    });

    // Update bottom confirm button text with active selection name
    const selected = this.classes[this.selectedIndex] || this.classes[0];
    if (this.confirmBtnText && this.confirmBtnBg) {
      this.confirmBtnText.setText(`TIẾP NHẬN ${selected.name.toUpperCase()} & VÀO TRẬN (SPACE / ENTER) →`);
      this.confirmBtnBg.setFillStyle(selected.themeColor);
    }
  }
}
