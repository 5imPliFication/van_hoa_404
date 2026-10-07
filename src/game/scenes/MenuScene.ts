import Phaser from 'phaser';
import { isClassMode, setClassMode } from '../settings';

const FONT = 'system-ui, sans-serif';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    this.add.rectangle(cx, height / 2, width, height, 0xf8fafc, 1);

    // Title + what the game is about, in one glance
    const title = this.add.text(cx, 200, 'VĂN HÓA 404', {
      fontFamily: FONT,
      fontSize: '72px',
      fontStyle: 'bold',
      color: '#0284c7',
      resolution: 2,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: 194,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add.text(cx, 264, 'Tư tưởng Hồ Chí Minh về xây dựng nền văn hóa mới', {
      fontFamily: FONT,
      fontSize: '18px',
      color: '#475569',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(cx, 336, 'Dân tộc  ·  Khoa học  ·  Đại chúng', {
      fontFamily: FONT,
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#b45309',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(cx, 370, 'Đề cương văn hóa Việt Nam, 1943', {
      fontFamily: FONT,
      fontSize: '13px',
      color: '#64748b',
      resolution: 2,
    }).setOrigin(0.5);

    // Start
    const btnY = 470;
    const btnBg = this.add.rectangle(cx, btnY, 260, 56, 0x0284c7);
    this.add.text(cx, btnY, 'BẮT ĐẦU', {
      fontFamily: FONT,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    let starting = false;
    const startGame = () => {
      if (starting) return;
      starting = true;
      this.cameras.main.fadeOut(300, 241, 245, 249);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CharacterSelectScene');
      });
    };

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on('pointerover', () => btnBg.setFillStyle(0x0369a1));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x0284c7));

    // Classroom mode: a single text toggle
    const modeY = 540;
    const modeText = this.add.text(cx, modeY, '', {
      fontFamily: FONT,
      fontSize: '14px',
      fontStyle: 'bold',
      resolution: 2,
    }).setOrigin(0.5);
    const renderMode = () => {
      const on = isClassMode();
      modeText.setText(`🎓 Chế độ lớp học: ${on ? 'BẬT' : 'TẮT'}  (L)`);
      modeText.setColor(on ? '#15803d' : '#64748b');
    };
    const toggleMode = () => {
      setClassMode(!isClassMode());
      renderMode();
    };
    renderMode();

    // Screen-space hit tests, as elsewhere in the game
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (Math.abs(pointer.x - cx) < 130 && Math.abs(pointer.y - btnY) < 28) startGame();
      else if (Math.abs(pointer.x - cx) < modeText.width / 2 + 8 && Math.abs(pointer.y - modeY) < 14) toggleMode();
    });
    this.input.keyboard?.on('keydown-L', toggleMode);
    this.input.keyboard?.once('keydown-SPACE', startGame);
    this.input.keyboard?.once('keydown-ENTER', startGame);

    this.add.text(cx, height - 36, 'WASD di chuyển  ·  ESC tạm dừng  ·  H cẩm nang', {
      fontFamily: FONT,
      fontSize: '13px',
      color: '#64748b',
      resolution: 2,
    }).setOrigin(0.5);
  }
}
