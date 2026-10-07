import Phaser from 'phaser';
import { isClassMode, setClassMode } from '../settings';
import { CORE_PILLAR_LESSONS, CORE_PRINCIPLE, LECTURE_SOURCE, SUMMARY_QUOTE } from '../../data/lesson';

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
    const titleY = 68;
    const title = this.add.text(width / 2, titleY, 'VĂN HÓA 404', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#0284c7',
      stroke: '#0369a1',
      strokeThickness: 3,
      resolution: 2,
    }).setOrigin(0.5);

    // Gentle float tween
    this.tweens.add({
      targets: title,
      y: titleY - 5,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(width / 2, 120, 'TƯ TƯỞNG HỒ CHÍ MINH VỀ XÂY DỰNG NỀN VĂN HÓA MỚI — VẬN DỤNG TRONG KHÔNG GIAN SỐ', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#334155',
      letterSpacing: 1,
      resolution: 2,
    }).setOrigin(0.5);

    // Lesson framing card: the core principle the whole game is built on
    const cardTop = 150;
    const cardH = 280;
    const cardBg = this.add.rectangle(width / 2, cardTop + cardH / 2, 940, cardH, 0xffffff, 0.98);
    cardBg.setStrokeStyle(1.5, 0xcbd5e1);

    this.add.text(width / 2, cardTop + 22, `📜 ${CORE_PRINCIPLE.heading}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#b45309',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(width / 2, cardTop + 44, CORE_PRINCIPLE.intro, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#475569',
      resolution: 2,
    }).setOrigin(0.5);

    const colW = 290;
    const colY = cardTop + 118;
    CORE_PILLAR_LESSONS.forEach((p, i) => {
      const x = width / 2 + (i - 1) * (colW + 14);
      const box = this.add.rectangle(x, colY, colW, 112, 0xf0f9ff, 1);
      box.setStrokeStyle(1.5, 0x7dd3fc);

      this.add.text(x, colY - 38, `${p.icon} ${p.label}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#0369a1',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(x, colY - 2, p.meaning, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12.5px',
        color: '#0f172a',
        align: 'center',
        wordWrap: { width: colW - 24 },
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(x, colY + 38, p.inGame, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '10.5px',
        fontStyle: 'italic',
        color: '#0284c7',
        align: 'center',
        wordWrap: { width: colW - 20 },
        resolution: 2,
      }).setOrigin(0.5);
    });

    this.add.text(width / 2, cardTop + 198, 'Bổ trợ trong game: Chân • Thiện • Mỹ   |   Xây đi đôi với Chống', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#475569',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(width / 2, cardTop + 238, `“${SUMMARY_QUOTE}”\n— ${LECTURE_SOURCE}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#64748b',
      align: 'center',
      lineSpacing: 3,
      resolution: 2,
    }).setOrigin(0.5);

    // Quick controls
    this.add.text(width / 2, 462,
      '🎮 WASD / kéo màn hình: di chuyển  •  Mũi tên: ngắm (thả tay = tự bắn)  •  ESC: tạm dừng & xem chỉ số  •  H: cẩm nang',
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12.5px',
        color: '#475569',
        align: 'center',
        resolution: 2,
      }
    ).setOrigin(0.5);

    // Start Button
    const btnY = 540;
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
        this.scene.start('CharacterSelectScene');
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

    // Classroom mode toggle
    const modeY = 612;
    const modeBg = this.add.rectangle(width / 2, modeY, 470, 34, 0xffffff, 1);
    modeBg.setInteractive({ useHandCursor: true });
    const modeText = this.add.text(width / 2, modeY, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      resolution: 2,
    }).setOrigin(0.5);
    const modeHint = this.add.text(width / 2, modeY + 30, 'Giảm 50% sát thương nhận vào để ai cũng trụ đủ lâu và gặp đủ các tình huống', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#64748b',
      resolution: 2,
    }).setOrigin(0.5);
    const renderMode = () => {
      const on = isClassMode();
      modeText.setText(`🎓 Chế độ lớp học: ${on ? 'BẬT' : 'TẮT'}  (phím L)`);
      modeText.setColor(on ? '#15803d' : '#475569');
      modeBg.setFillStyle(on ? 0xdcfce7 : 0xffffff);
      modeBg.setStrokeStyle(1.5, on ? 0x22c55e : 0xcbd5e1);
      modeHint.setVisible(true);
    };
    const toggleMode = () => {
      setClassMode(!isClassMode());
      renderMode();
    };
    renderMode();
    modeBg.on('pointerdown', toggleMode);
    this.input.keyboard?.on('keydown-L', toggleMode);

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
