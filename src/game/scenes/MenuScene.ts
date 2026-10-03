import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.scale;

    // Grid backdrop
    const grid = this.add.grid(width / 2, height / 2, width, height, 40, 40, 0x070a0e, 1, 0x1e293b, 0.4);
    grid.setAlpha(0.6);

    // Glowing Title
    const title = this.add.text(width / 2, height * 0.28, 'VĂN HÓA 404', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#00f0ff',
      stroke: '#0891b2',
      strokeThickness: 6,
      shadow: { blur: 15, color: '#00f0ff', fill: true },
    }).setOrigin(0.5);

    // Subtle floating tween for title
    this.tweens.add({
      targets: title,
      y: height * 0.28 - 6,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(width / 2, height * 0.38, 'HỆ GIÁ TRỊ VĂN HÓA SỐ — XÂY & CHỐNG LỆCH CHUẨN', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#94a3b8',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Pillars tagline
    this.add.text(width / 2, height * 0.45, 'Dân tộc • Khoa học • Đại chúng | Chân • Thiện • Mỹ | Xây • Chống', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#38bdf8',
    }).setOrigin(0.5);

    // Controls guide card
    const cardBg = this.add.rectangle(width / 2, height * 0.58, 540, 110, 0x0f172a, 0.85);
    cardBg.setStrokeStyle(1, 0x334155);

    this.add.text(width / 2, height * 0.54, '🎮 ĐIỀU KHIỂN & LỐI CHƠI', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f8fafc',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.60, '• WASD / Phím mũi tên: Di chuyển nhân vật\n• Tự động bắn mục tiêu gần nhất\n• Nhặt hạt kinh nghiệm để lên cấp & nhận thẻ giá trị', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#cbd5e1',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    // Start Button
    const btnContainer = this.add.container(width / 2, height * 0.78);
    const btnBg = this.add.rectangle(0, 0, 260, 56, 0x00f0ff);
    btnBg.setStrokeStyle(2, 0xffffff);

    const btnText = this.add.text(0, 0, 'BẮT ĐẦU VÁN CHƠI', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#041018',
    }).setOrigin(0.5);

    btnContainer.add([btnBg, btnText]);
    btnBg.setInteractive({ useHandCursor: true });

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x38bdf8);
      btnContainer.setScale(1.04);
    });

    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x00f0ff);
      btnContainer.setScale(1.0);
    });

    btnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 7, 10, 14);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });

    // Spacebar to quickly start
    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey?.once('down', () => {
      this.scene.start('GameScene');
    });

    // Version label
    this.add.text(width - 20, height - 16, 'v0.1.0 • Phiên bản 0.1 MVP', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#64748b',
    }).setOrigin(1, 1);
  }
}
