import Phaser from 'phaser';
import { CulturalValues } from '../types/player';

export interface GameResultData {
  survivedTime: number; // in seconds
  enemiesKilled: number;
  levelReached: number;
  values: CulturalValues;
  isVictory: boolean;
  communityMeter: number;
  killedBy?: string;
}

export class ResultScene extends Phaser.Scene {
  private resultData!: GameResultData;

  constructor() {
    super('ResultScene');
  }

  init(data: GameResultData): void {
    this.resultData = data || {
      survivedTime: 0,
      enemiesKilled: 0,
      levelReached: 1,
      values: {
        danToc: 0,
        khoaHoc: 0,
        daiChung: 0,
        chan: 0,
        thien: 0,
        my: 0,
        build: 0,
        fight: 0,
      },
      isVictory: false,
      communityMeter: 50,
      killedBy: 'Hiện tượng tiêu cực trên mạng',
    };
  }

  create(): void {
    const { width, height } = this.scale;

    // Background (Light slate with grid)
    this.add.rectangle(width / 2, height / 2, width, height, 0xf8fafc, 1);
    this.add.grid(width / 2, height / 2, width, height, 48, 48, 0xf8fafc, 1, 0xe2e8f0, 0.7);

    // Header banner
    const isWin = this.resultData.isVictory;
    const headerTitle = isWin ? '🎉 HOÀN THÀNH SỨ MỆNH VĂN HÓA SỐ' : 'KẾT THÚC VÁN CHƠI';
    const headerColor = isWin ? '#059669' : '#dc2626';

    this.add.text(width / 2, height * (isWin ? 0.11 : 0.08), headerTitle, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
      color: headerColor,
      resolution: 2,
    }).setOrigin(0.5);

    // If player was defeated, show prominent death cause card
    if (!isWin) {
      const killer = this.resultData.killedBy || 'Hiện tượng tiêu cực trên không gian mạng';
      const deathBox = this.add.rectangle(width / 2, height * 0.155, 760, 48, 0xfef2f2, 0.98);
      deathBox.setStrokeStyle(1.5, 0xef4444);

      this.add.text(width / 2, height * 0.155, `☠️ NGUYÊN NHÂN TỬ TRẬN: Bị hạ gục bởi [ ${killer.toUpperCase()} ]`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#b91c1c',
        resolution: 2,
      }).setOrigin(0.5);
    }

    // Archetype calculation (Neutral perspective per GDD rules)
    const archetype = this.computeArchetype(this.resultData.values);
    const archY = isWin ? height * 0.23 : height * 0.27;

    const archetypeBox = this.add.rectangle(width / 2, archY, 760, 76, 0xffffff, 0.98);
    archetypeBox.setStrokeStyle(1.5, 0x0284c7);

    this.add.text(width / 2, archY - 14, `HỒ SƠ ĐỊNH HƯỚNG: ${archetype.title.toUpperCase()}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#0369a1',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(width / 2, archY + 14, archetype.description, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#475569',
      resolution: 2,
    }).setOrigin(0.5);

    // Run Stats Card
    const minutes = Math.floor(this.resultData.survivedTime / 60);
    const seconds = Math.floor(this.resultData.survivedTime % 60);
    const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const statsY = isWin ? height * 0.40 : height * 0.435;

    const statsBox = this.add.rectangle(width / 2, statsY, 760, 80, 0xffffff, 0.98);
    statsBox.setStrokeStyle(1.5, 0xcbd5e1);

    this.add.text(width / 2, statsY - 16,
      `⏱ Thời gian trụ vững: ${timeFormatted}   |   ⚔ Quái vật đẩy lùi: ${this.resultData.enemiesKilled}   |   ⭐ Cấp đạt được: ${this.resultData.levelReached}`,
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#0f172a',
        resolution: 2,
      }
    ).setOrigin(0.5);

    this.add.text(width / 2, statsY + 16,
      `🌐 Chỉ số Môi trường Văn hóa (Community Meter): ${Math.round(this.resultData.communityMeter)}%`,
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: this.resultData.communityMeter > 30 ? '#059669' : '#d97706',
        resolution: 2,
      }
    ).setOrigin(0.5);

    // Values Breakdown Card (8 Pillars)
    const valuesY = isWin ? height * 0.63 : height * 0.655;
    const valuesBox = this.add.rectangle(width / 2, valuesY, 760, 150, 0xffffff, 0.98);
    valuesBox.setStrokeStyle(1.5, 0xcbd5e1);

    this.add.text(width / 2, valuesY - 48, 'CHI TIẾT 8 TRỤ CỘT HỆ GIÁ TRỊ VĂN HÓA', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#0369a1',
      resolution: 2,
    }).setOrigin(0.5);

    const vals = this.resultData.values;
    const row1 = `Dân tộc: ${vals.danToc}    •    Khoa học: ${vals.khoaHoc}    •    Đại chúng: ${vals.daiChung}`;
    const row2 = `Chân: ${vals.chan}    •    Thiện: ${vals.thien}    •    Mỹ: ${vals.my}`;
    const row3 = `Kiến tạo (Xây): ${vals.build}    •    Đấu tranh (Chống): ${vals.fight}`;

    this.add.text(width / 2, height * 0.60, row1, { fontFamily: 'system-ui, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#1e293b', resolution: 2 }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.65, row2, { fontFamily: 'system-ui, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#1e293b', resolution: 2 }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.70, row3, { fontFamily: 'system-ui, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#0284c7', resolution: 2 }).setOrigin(0.5);

    // Replay Button
    const replayY = height * 0.85;
    const replayContainer = this.add.container(width / 2, replayY);
    const replayBg = this.add.rectangle(0, 0, 240, 52, 0x0284c7);
    replayBg.setStrokeStyle(2, 0x0369a1);

    const replayText = this.add.text(0, 0, 'CHƠI LẠI (Enter)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    replayContainer.add([replayBg, replayText]);

    const restartGame = () => {
      this.scene.start('GameScene');
    };

    replayBg.setInteractive({ useHandCursor: true });
    replayBg.on('pointerdown', restartGame);

    // Screen-space pointer listener for replay button
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (Math.abs(pointer.x - width / 2) < 125 && Math.abs(pointer.y - replayY) < 30) {
        restartGame();
      }
    });

    this.input.keyboard?.once('keydown-SPACE', restartGame);
    this.input.keyboard?.once('keydown-ENTER', restartGame);

    replayBg.on('pointerover', () => replayBg.setFillStyle(0x0369a1));
    replayBg.on('pointerout', () => replayBg.setFillStyle(0x0284c7));
  }

  private computeArchetype(v: CulturalValues): { title: string; description: string } {
    const scores = [
      { key: 'Người Kiểm Chứng', val: v.khoaHoc * 1.2 + v.chan * 1.2, desc: 'Ưu tiên sự chính xác, phản biện dựa trên cơ sở khoa học và chân lý rõ ràng.' },
      { key: 'Người Kiến Tạo', val: v.build * 1.3 + v.my * 1.1, desc: 'Tập trung xây dựng các giá trị tích cực, lan tỏa cái đẹp và kết nối cộng đồng lành mạnh.' },
      { key: 'Người Gìn Giữ', val: v.danToc * 1.3 + v.chan * 1.1, desc: 'Kiên định với bản sắc dân tộc, bảo vệ giá trị cốt lõi trước sự đồng hóa và bóp méo.' },
      { key: 'Người Kết Nối', val: v.daiChung * 1.3 + v.thien * 1.1, desc: 'Đặt lòng nhân văn và tính rộng khắp làm trọng tâm, tạo sự sẻ chia và văn hóa ứng xử tốt đẹp.' },
      { key: 'Người Phản Biện', val: v.fight * 1.3 + v.khoaHoc * 1.1, desc: 'Chủ động đấu tranh bài trừ tin giả, bạo lực ngôn từ bằng lập luận sắc bén.' },
    ];

    scores.sort((a, b) => b.val - a.val);
    const highest = scores[0];

    return {
      title: highest.key,
      description: highest.desc,
    };
  }
}
