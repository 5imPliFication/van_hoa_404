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
  buildPower?: number;
  fightPower?: number;
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
      buildPower: 0,
      fightPower: 0,
    };
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const isWin = this.resultData.isVictory;

    // Background (Light slate with subtle grid)
    this.add.rectangle(cx, height / 2, width, height, 0xf8fafc, 1);
    this.add.grid(cx, height / 2, width, height, 48, 48, 0xf8fafc, 1, 0xe2e8f0, 0.7);

    // 1. Header Section
    if (!isWin) {
      const badgeBg = this.add.rectangle(cx, 28, 230, 24, 0xfee2e2, 1);
      badgeBg.setStrokeStyle(1, 0xfca5a5);
      this.add.text(cx, 28, '☠️ VÁN ĐẤU KẾT THÚC', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#b91c1c',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(cx, 56, 'CHIẾN DỊCH KHÔNG THÀNH CÔNG', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#0f172a',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(cx, 80, 'Không gian mạng cần sự kiên định để tiếp tục đẩy lùi các hiện tượng lệch chuẩn.', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        color: '#64748b',
        resolution: 2,
      }).setOrigin(0.5);
    } else {
      const badgeBg = this.add.rectangle(cx, 28, 250, 24, 0xdcfce7, 1);
      badgeBg.setStrokeStyle(1, 0x86efac);
      this.add.text(cx, 28, '🎉 HOÀN THÀNH XUẤT SẮC', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#15803d',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(cx, 56, 'BẢO VỆ THÀNH CÔNG KHÔNG GIAN MẠNG', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#047857',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(cx, 80, 'Bạn đã giữ vững các giá trị văn hóa số và triệt phá thành công Đại Trùm Tối Hậu!', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        color: '#059669',
        resolution: 2,
      }).setOrigin(0.5);
    }

    // 2. Killer / Victory Banner (Y = 114, Height = 36, Width = 840)
    const bannerBox = this.add.rectangle(cx, 114, 840, 36, isWin ? 0xecfdf5 : 0xfef2f2, 1);
    bannerBox.setStrokeStyle(1.5, isWin ? 0x10b981 : 0xef4444);

    const bannerTextContent = isWin
      ? '🏆 CHIẾN CÔNG HIỂN HÁCH: ĐÃ ĐẨY LÙI 4 CẤP ĐỘ TRÙM VÀ MỌI HIỆN TƯỢNG ĐỘC HẠI'
      : `☠️ NGUYÊN NHÂN TỬ TRẬN: Bị hạ gục bởi [ ${(this.resultData.killedBy || 'Hiện tượng tiêu cực trên mạng').toUpperCase()} ]`;

    this.add.text(cx, 114, bannerTextContent, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: isWin ? '#047857' : '#b91c1c',
      resolution: 2,
    }).setOrigin(0.5);

    // 3. Archetype Card (Y = 176, Height = 64, Width = 840)
    const archetype = this.computeArchetype(this.resultData.values);
    const archBox = this.add.rectangle(cx, 176, 840, 64, 0xffffff, 0.98);
    archBox.setStrokeStyle(1.5, 0x0284c7);

    this.add.text(cx, 164, `🌟 HỒ SƠ ĐỊNH HƯỚNG: ${archetype.title.toUpperCase()}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#0369a1',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(cx, 188, archetype.description, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#475569',
      resolution: 2,
    }).setOrigin(0.5);

    // 4. Run Statistics Card (Y = 256, Height = 74, Width = 840)
    const statsBox = this.add.rectangle(cx, 256, 840, 74, 0xffffff, 0.98);
    statsBox.setStrokeStyle(1.5, 0xcbd5e1);

    const minutes = Math.floor(this.resultData.survivedTime / 60);
    const seconds = Math.floor(this.resultData.survivedTime % 60);
    const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const statCols = [
      { x: cx - 303, label: '⏱️ Thời gian trụ vững', val: timeFormatted, color: '#0f172a' },
      { x: cx - 101, label: '⚔️ Quái vật đẩy lùi', val: `${this.resultData.enemiesKilled} quái`, color: '#0f172a' },
      { x: cx + 101, label: '⭐ Cấp độ đạt được', val: `Cấp ${this.resultData.levelReached}`, color: '#0284c7' },
      {
        x: cx + 303,
        label: '🌐 Môi trường văn hóa',
        val: `${Math.round(this.resultData.communityMeter)}%`,
        color: this.resultData.communityMeter > 30 ? '#059669' : '#dc2626',
      },
    ];

    statCols.forEach(col => {
      const chip = this.add.rectangle(col.x, 256, 192, 52, 0xf8fafc, 1);
      chip.setStrokeStyle(1, 0xe2e8f0);

      this.add.text(col.x, 244, col.label, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        color: '#64748b',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(col.x, 266, col.val, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: col.color,
        resolution: 2,
      }).setOrigin(0.5);
    });

    // 5. 8 Pillars Grid Card (Y = 444, Height = 224, Width = 840)
    const valuesBox = this.add.rectangle(cx, 444, 840, 224, 0xffffff, 0.98);
    valuesBox.setStrokeStyle(1.5, 0xcbd5e1);

    this.add.text(cx, 352, '🏛️ TỔNG KẾT 8 TRỤ CỘT GIÁ TRỊ VĂN HÓA ĐÃ TÍCH LŨY', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#0f172a',
      resolution: 2,
    }).setOrigin(0.5);

    const v = this.resultData.values;
    const bp = this.resultData.buildPower ?? (v.build * 10);
    const fp = this.resultData.fightPower ?? (v.fight * 10);

    const pillarChips = [
      // Row 1
      { x: cx - 303, y: 398, title: `🇻🇳 Dân tộc: ${v.danToc}`, sub: `+${v.danToc * 25} Khiên chắn` },
      { x: cx - 101, y: 398, title: `🔬 Khoa học: ${v.khoaHoc}`, sub: `+${v.khoaHoc * 15}% Tốc bắn` },
      { x: cx + 101, y: 398, title: `👥 Đại chúng: ${v.daiChung}`, sub: `+${v.daiChung * 30} Tầm nhặt XP` },
      { x: cx + 303, y: 398, title: `🎯 Chân: ${v.chan}`, sub: `+${v.chan * 20}% Sát thương` },
      // Row 2
      { x: cx - 303, y: 462, title: `❤️ Thiện: ${v.thien}`, sub: `+${v.thien * 2} HP hồi/5s` },
      { x: cx - 101, y: 462, title: `🎨 Mỹ: ${v.my}`, sub: `+${v.my * 15}% Diện rộng` },
      { x: cx + 101, y: 462, title: `🏗️ Xây: ${v.build}`, sub: `Sức mạnh: ${bp} điểm` },
      { x: cx + 303, y: 462, title: `🛡️ Chống: ${v.fight}`, sub: `Sức mạnh: ${fp} điểm` },
    ];

    pillarChips.forEach(chip => {
      const pBg = this.add.rectangle(chip.x, chip.y, 192, 50, 0xf8fafc, 1);
      pBg.setStrokeStyle(1, 0xe2e8f0);

      this.add.text(chip.x, chip.y - 10, chip.title, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#0f172a',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(chip.x, chip.y + 11, chip.sub, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        color: '#0284c7',
        resolution: 2,
      }).setOrigin(0.5);
    });

    // Summary bottom strip inside pillars box
    const totalPillars = v.danToc + v.khoaHoc + v.daiChung + v.chan + v.thien + v.my + v.build + v.fight;
    const summaryStrip = this.add.rectangle(cx, 520, 804, 30, 0xf0fdf4, 1);
    summaryStrip.setStrokeStyle(1, 0xbbf7d0);

    this.add.text(cx, 520, `✨ TỔNG HỢP: Sức mạnh Kiến tạo (Xây): ${bp} điểm  •  Sức mạnh Đấu tranh (Chống): ${fp} điểm  •  Tổng điểm giá trị: ${totalPillars}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#166534',
      resolution: 2,
    }).setOrigin(0.5);

    // 6. Action Buttons Bar (Y = 628, Height = 46)
    const btnY = 628;

    // Button 1: Replay
    const btnReplayX = cx - 135;
    const replayBg = this.add.rectangle(btnReplayX, btnY, 240, 46, 0x0284c7);
    replayBg.setStrokeStyle(1.5, 0x0369a1);
    replayBg.setInteractive({ useHandCursor: true });

    this.add.text(btnReplayX, btnY, '🔄 CHƠI LẠI (Enter/Space)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    replayBg.on('pointerover', () => replayBg.setFillStyle(0x0369a1));
    replayBg.on('pointerout', () => replayBg.setFillStyle(0x0284c7));

    // Button 2: Return to Menu
    const btnMenuX = cx + 135;
    const menuBg = this.add.rectangle(btnMenuX, btnY, 240, 46, 0xf1f5f9);
    menuBg.setStrokeStyle(1.5, 0x94a3b8);
    menuBg.setInteractive({ useHandCursor: true });

    this.add.text(btnMenuX, btnY, '🏠 VỀ MENU CHÍNH (Esc)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#1e293b',
      resolution: 2,
    }).setOrigin(0.5);

    menuBg.on('pointerover', () => menuBg.setFillStyle(0xe2e8f0));
    menuBg.on('pointerout', () => menuBg.setFillStyle(0xf1f5f9));

    const restartGame = () => {
      this.scene.start('GameScene');
    };

    const returnToMenu = () => {
      this.scene.start('MenuScene');
    };

    replayBg.on('pointerdown', restartGame);
    menuBg.on('pointerdown', returnToMenu);

    // Screen-space pointerdown listeners
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (Math.abs(pointer.x - btnReplayX) < 120 && Math.abs(pointer.y - btnY) < 25) {
        restartGame();
      } else if (Math.abs(pointer.x - btnMenuX) < 120 && Math.abs(pointer.y - btnY) < 25) {
        returnToMenu();
      }
    });

    this.input.keyboard?.once('keydown-SPACE', restartGame);
    this.input.keyboard?.once('keydown-ENTER', restartGame);
    this.input.keyboard?.once('keydown-ESC', returnToMenu);
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
