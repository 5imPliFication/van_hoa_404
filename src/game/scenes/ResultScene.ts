import Phaser from 'phaser';
import { CulturalValues } from '../types/player';

export interface GameResultData {
  survivedTime: number; // in seconds
  enemiesKilled: number;
  levelReached: number;
  values: CulturalValues;
  isVictory: boolean;
  communityMeter: number;
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
    };
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x070a0e, 1);
    this.add.grid(width / 2, height / 2, width, height, 40, 40, 0x070a0e, 1, 0x1e293b, 0.3);

    // Header banner
    const isWin = this.resultData.isVictory;
    const headerTitle = isWin ? 'HOÀN THÀNH SỨ MỆNH VĂN HÓA SỐ' : 'KẾT THÚC VÁN CHƠI';
    const headerColor = isWin ? '#34d399' : '#f87171';

    this.add.text(width / 2, height * 0.12, headerTitle, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: headerColor,
    }).setOrigin(0.5);

    // Archetype calculation (Neutral perspective per GDD rules)
    const archetype = this.computeArchetype(this.resultData.values);

    const archetypeBox = this.add.rectangle(width / 2, height * 0.24, 700, 75, 0x0f172a, 0.9);
    archetypeBox.setStrokeStyle(1, 0x38bdf8);

    this.add.text(width / 2, height * 0.22, `HỒ SƠ ĐỊNH HƯỚNG: ${archetype.title.toUpperCase()}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#38bdf8',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.26, archetype.description, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#cbd5e1',
    }).setOrigin(0.5);

    // Run Stats Card
    const minutes = Math.floor(this.resultData.survivedTime / 60);
    const seconds = Math.floor(this.resultData.survivedTime % 60);
    const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const statsBox = this.add.rectangle(width / 2, height * 0.40, 700, 80, 0x131d2e, 0.85);
    statsBox.setStrokeStyle(1, 0x334155);

    this.add.text(width / 2, height * 0.38,
      `⏱ Thời gian trụ vững: ${timeFormatted}   |   ⚔ Quái vật đẩy lùi: ${this.resultData.enemiesKilled}   |   ⭐ Cấp đạt được: ${this.resultData.levelReached}`,
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '15px',
        color: '#f8fafc',
      }
    ).setOrigin(0.5);

    this.add.text(width / 2, height * 0.43,
      `🌐 Chỉ số Môi trường Văn hóa (Community Meter): ${Math.round(this.resultData.communityMeter)}%`,
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: this.resultData.communityMeter > 30 ? '#10b981' : '#f59e0b',
      }
    ).setOrigin(0.5);

    // Values Breakdown Card (8 Pillars)
    const valuesBox = this.add.rectangle(width / 2, height * 0.63, 700, 160, 0x0f172a, 0.9);
    valuesBox.setStrokeStyle(1, 0x1e293b);

    this.add.text(width / 2, height * 0.54, 'CHI TIẾT 8 TRỤ CỘT HỆ GIÁ TRỊ', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#94a3b8',
    }).setOrigin(0.5);

    const vals = this.resultData.values;
    const row1 = `Dân tộc: ${vals.danToc}    •    Khoa học: ${vals.khoaHoc}    •    Đại chúng: ${vals.daiChung}`;
    const row2 = `Chân: ${vals.chan}    •    Thiện: ${vals.thien}    •    Mỹ: ${vals.my}`;
    const row3 = `Kiến tạo (Xây): ${vals.build}    •    Đấu tranh (Chống): ${vals.fight}`;

    this.add.text(width / 2, height * 0.60, row1, { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#e2e8f0' }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.65, row2, { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#e2e8f0' }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.70, row3, { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#38bdf8' }).setOrigin(0.5);

    // Replay Button
    const replayContainer = this.add.container(width / 2, height * 0.85);
    const replayBg = this.add.rectangle(0, 0, 240, 50, 0x00f0ff);
    replayBg.setStrokeStyle(2, 0xffffff);

    const replayText = this.add.text(0, 0, 'CHƠI LẠI', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#041018',
    }).setOrigin(0.5);

    replayContainer.add([replayBg, replayText]);
    replayBg.setInteractive({ useHandCursor: true });

    replayBg.on('pointerover', () => replayBg.setFillStyle(0x38bdf8));
    replayBg.on('pointerout', () => replayBg.setFillStyle(0x00f0ff));
    replayBg.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
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
