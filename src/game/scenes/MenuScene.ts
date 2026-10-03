import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.scale;

    // Light tech background with gentle grid
    this.add.rectangle(width / 2, height / 2, width, height, 0xf8fafc, 1);
    const grid = this.add.grid(width / 2, height / 2, width, height, 48, 48, 0xf8fafc, 1, 0xe2e8f0, 0.8);
    grid.setAlpha(0.7);

    // Glowing Title
    const title = this.add.text(width / 2, height * 0.24, 'VĂN HÓA 404', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '68px',
      fontStyle: 'bold',
      color: '#0284c7',
      stroke: '#0369a1',
      strokeThickness: 3,
      resolution: 2,
    }).setOrigin(0.5);

    // Gentle float tween
    this.tweens.add({
      targets: title,
      y: height * 0.24 - 6,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(width / 2, height * 0.35, 'HỆ GIÁ TRỊ VĂN HÓA SỐ — KIẾN TẠO & ĐẨY LÙI LỆCH CHUẨN', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#334155',
      letterSpacing: 2,
      resolution: 2,
    }).setOrigin(0.5);

    // Pillars tagline pill
    const pillBg = this.add.rectangle(width / 2, height * 0.42, 680, 36, 0xffffff, 0.95);
    pillBg.setStrokeStyle(1.5, 0xcbd5e1);

    this.add.text(width / 2, height * 0.42, 'Dân tộc • Khoa học • Đại chúng  |  Chân • Thiện • Mỹ  |  Xây • Chống', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#0284c7',
      resolution: 2,
    }).setOrigin(0.5);

    // Quick Guide Card
    const cardBg = this.add.rectangle(width / 2, height * 0.58, 620, 125, 0xffffff, 0.98);
    cardBg.setStrokeStyle(1.5, 0xcbd5e1);

    this.add.text(width / 2, height * 0.53, '🎮 CÁCH CHƠI NHANH', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#0f172a',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.60,
      '• Di chuyển: Phím WASD / Phím mũi tên (hoặc chạm kéo trên màn hình cảm ứng)\n• Tấn công: Nhân vật TỰ ĐỘNG BẮN mục tiêu gần nhất\n• Lên cấp: Nhặt hạt ngọc kinh nghiệm để mở khóa 1 trong 3 thẻ bài giá trị',
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        color: '#475569',
        align: 'center',
        lineSpacing: 5,
        resolution: 2,
      }
    ).setOrigin(0.5);

    // Start Button
    const btnY = height * 0.78;
    const btnBg = this.add.rectangle(width / 2, btnY, 270, 56, 0x0284c7);
    btnBg.setStrokeStyle(2, 0x0369a1);

    const btnText = this.add.text(width / 2, btnY, 'BẮT ĐẦU VÁN CHƠI', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    const startGame = () => {
      this.cameras.main.fadeOut(300, 241, 245, 249);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    };

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on('pointerdown', startGame);

    // Screen-space pointer click check for start button
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (Math.abs(pointer.x - width / 2) < 140 && Math.abs(pointer.y - btnY) < 32) {
        startGame();
      }
    });

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x0369a1);
      btnBg.setScale(1.03);
      btnText.setScale(1.03);
    });

    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x0284c7);
      btnBg.setScale(1.0);
      btnText.setScale(1.0);
    });

    // Spacebar or Enter to quickly start
    this.input.keyboard?.once('keydown-SPACE', startGame);
    this.input.keyboard?.once('keydown-ENTER', startGame);

    // Version label
    this.add.text(width - 24, height - 18, 'v0.1.0 • Phiên bản 0.1 MVP', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#64748b',
      resolution: 2,
    }).setOrigin(1, 1);
  }
}
