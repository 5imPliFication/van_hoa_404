import Phaser from 'phaser';
import { CulturalValues } from '../types/player';
import { ScenarioDecision } from '../types/data';
import { ARCHETYPE_QUOTES, SUMMARY_QUOTE, TINH_HOA } from '../../data/lesson';

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
  className?: string;
  classTitle?: string;
  classIcon?: string;
  classThemeColor?: number;
  classThemeHex?: string;
  classPassiveName?: string;
  classPassiveDesc?: string;
  activeCombos?: { name: string; formula: string; description: string }[];
  classConfig?: any;
  decisions?: ScenarioDecision[];
  totalScenarios?: number;
  tinhHoaTaken?: number;
  tinhHoaFull?: number;
}

export class ResultScene extends Phaser.Scene {
  private resultData!: GameResultData;
  private lessonPanel?: Phaser.GameObjects.Container;

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
      className: 'Người Kiểm Chứng',
      classTitle: 'Xạ Thủ Phản Biện',
      classIcon: '🔍',
      classThemeColor: 0x0284c7,
      classThemeHex: '#0284c7',
      classPassiveName: 'Mắt Thần Phản Biện',
      classPassiveDesc: 'Bắn trúng 3 phát liên tiếp gắn dấu ấn kiểm chứng, nhận thêm 30% sát thương.',
      activeCombos: [],
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
      const badgeBg = this.add.rectangle(cx, 24, 220, 22, 0xfee2e2, 1);
      badgeBg.setStrokeStyle(1, 0xfca5a5);
      this.add.text(cx, 24, '☠️ VÁN ĐẤU KẾT THÚC', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#b91c1c',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(cx, 48, 'CHIẾN DỊCH KHÔNG THÀNH CÔNG', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#0f172a',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(cx, 68, 'Không gian mạng cần sự kiên định để tiếp tục đẩy lùi các hiện tượng lệch chuẩn.', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        color: '#64748b',
        resolution: 2,
      }).setOrigin(0.5);
    } else {
      const badgeBg = this.add.rectangle(cx, 24, 240, 22, 0xdcfce7, 1);
      badgeBg.setStrokeStyle(1, 0x86efac);
      this.add.text(cx, 24, '🎉 HOÀN THÀNH XUẤT SẮC', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#15803d',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(cx, 48, 'BẢO VỆ THÀNH CÔNG KHÔNG GIAN MẠNG', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#047857',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(cx, 68, 'Bạn đã giữ vững các giá trị văn hóa số và triệt phá thành công Đại Trùm Tối Hậu!', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        color: '#059669',
        resolution: 2,
      }).setOrigin(0.5);
    }

    // 2. Killer / Victory Banner (Y = 94, Height = 28, Width = 840)
    const bannerBox = this.add.rectangle(cx, 94, 840, 28, isWin ? 0xecfdf5 : 0xfef2f2, 1);
    bannerBox.setStrokeStyle(1.5, isWin ? 0x10b981 : 0xef4444);

    const bannerTextContent = isWin
      ? '🏆 CHIẾN CÔNG HIỂN HÁCH: ĐÃ ĐẨY LÙI 4 CẤP ĐỘ TRÙM VÀ MỌI HIỆN TƯỢNG ĐỘC HẠI'
      : `☠️ NGUYÊN NHÂN TỬ TRẬN: Bị hạ gục bởi [ ${(this.resultData.killedBy || 'Hiện tượng tiêu cực trên mạng').toUpperCase()} ]`;

    this.add.text(cx, 94, bannerTextContent, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: isWin ? '#047857' : '#b91c1c',
      resolution: 2,
    }).setOrigin(0.5);

    // 3. Dual Cards: Class Badge Card & Active Combos Card (Y = 146, Height = 64)
    const cardY = 146;
    const cardW = 412;
    const cardH = 64;

    // Left: Character Class Card
    const classBox = this.add.rectangle(cx - 214, cardY, cardW, cardH, 0xffffff, 0.98);
    classBox.setStrokeStyle(1.5, this.resultData.classThemeColor || 0x0284c7);

    const cIcon = this.resultData.classIcon || '🔍';
    const cName = this.resultData.className || 'Người Kiểm Chứng';
    const cTitle = this.resultData.classTitle || 'Xạ Thủ Phản Biện';
    const pName = this.resultData.classPassiveName || 'Mắt Thần Phản Biện';
    const pDesc = this.resultData.classPassiveDesc || 'Gắn dấu ấn kiểm chứng +30% sát thương';

    this.add.text(cx - 214, cardY - 14, `🏛️ VAI TRÒ: ${cIcon} ${cName.toUpperCase()} — ${cTitle}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: this.resultData.classThemeHex || '#0284c7',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(cx - 214, cardY + 12, `✨ Nội tại: ${pName} (${pDesc})`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10.5px',
      color: '#475569',
      wordWrap: { width: cardW - 30 },
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5);

    // Right: Active Combos Card
    const combos = this.resultData.activeCombos || [];
    const comboBox = this.add.rectangle(cx + 214, cardY, cardW, cardH, 0xf5f3ff, 0.98);
    comboBox.setStrokeStyle(1.5, 0x7c3aed);

    this.add.text(cx + 214, cardY - 14, `🧬 CỘNG HƯỞNG GIÁ TRỊ: ${combos.length > 0 ? `${combos.length}/4 ĐÃ KÍCH HOẠT` : 'CHƯA KÍCH HOẠT'}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#6d28d9',
      resolution: 2,
    }).setOrigin(0.5);

    if (combos.length > 0) {
      const comboText = combos.map(c => `[✨ ${c.name}]`).join('  ');
      this.add.text(cx + 214, cardY + 12, comboText, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#4c1d95',
        resolution: 2,
      }).setOrigin(0.5);
    } else {
      this.add.text(cx + 214, cardY + 12, 'Cần đạt cấp yêu cầu ở cả 2 trụ cột liên kết để kích hoạt cộng hưởng đặc biệt.', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '10.5px',
        color: '#6b7280',
        resolution: 2,
      }).setOrigin(0.5);
    }

    // 4. Run Statistics Card (Y = 220, Height = 58, Width = 840)
    const statsBox = this.add.rectangle(cx, 220, 840, 58, 0xffffff, 0.98);
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
      const chip = this.add.rectangle(col.x, 220, 192, 44, 0xf8fafc, 1);
      chip.setStrokeStyle(1, 0xe2e8f0);

      this.add.text(col.x, 210, col.label, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '10.5px',
        color: '#64748b',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(col.x, 229, col.val, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: col.color,
        resolution: 2,
      }).setOrigin(0.5);
    });

    // 5. 8 Pillars Grid Card (Y = 380, Height = 210, Width = 840)
    const valuesBox = this.add.rectangle(cx, 380, 840, 210, 0xffffff, 0.98);
    valuesBox.setStrokeStyle(1.5, 0xcbd5e1);

    this.add.text(cx, 298, '🏛️ TỔNG KẾT 8 TRỤ CỘT GIÁ TRỊ VĂN HÓA ĐÃ TÍCH LŨY', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12.5px',
      fontStyle: 'bold',
      color: '#0f172a',
      resolution: 2,
    }).setOrigin(0.5);

    const v = this.resultData.values;
    const bp = this.resultData.buildPower ?? (v.build * 10);
    const fp = this.resultData.fightPower ?? (v.fight * 10);

    // Core chips (Đề cương 1943) are tinted to stand apart from the supporting values
    const pillarChips = [
      // Row 1
      { x: cx - 303, y: 340, title: `🇻🇳 Dân tộc: ${v.danToc}`, sub: 'Giữ gốc bản sắc dân tộc', core: true },
      { x: cx - 101, y: 340, title: `🔬 Khoa học: ${v.khoaHoc}`, sub: 'Chống giặc dốt, nâng dân trí', core: true },
      { x: cx + 101, y: 340, title: `👥 Đại chúng: ${v.daiChung}`, sub: 'Vì quần chúng, phục vụ nhân dân', core: true },
      { x: cx + 303, y: 340, title: `🎯 Chân: ${v.chan}`, sub: 'Tôn trọng sự thật', core: false },
      // Row 2
      { x: cx - 303, y: 400, title: `❤️ Thiện: ${v.thien}`, sub: 'Ứng xử nhân văn', core: false },
      { x: cx - 101, y: 400, title: `🎨 Mỹ: ${v.my}`, sub: 'Sáng tạo cái đẹp', core: false },
      { x: cx + 101, y: 400, title: `🏗️ Xây: ${v.build}`, sub: `Kiến tạo • ${bp} điểm`, core: false },
      { x: cx + 303, y: 400, title: `🛡️ Chống: ${v.fight}`, sub: `Đấu tranh • ${fp} điểm`, core: false },
    ];

    pillarChips.forEach(chip => {
      const pBg = this.add.rectangle(chip.x, chip.y, 192, 46, chip.core ? 0xf0f9ff : 0xf8fafc, 1);
      pBg.setStrokeStyle(1, chip.core ? 0x7dd3fc : 0xe2e8f0);

      this.add.text(chip.x, chip.y - 9, chip.title, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11.5px',
        fontStyle: 'bold',
        color: '#0f172a',
        resolution: 2,
      }).setOrigin(0.5);

      this.add.text(chip.x, chip.y + 10, chip.sub, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '10.5px',
        color: '#0284c7',
        resolution: 2,
      }).setOrigin(0.5);
    });

    // Summary bottom strip inside pillars box
    // GDD §8: the ending reflects a lopsided Xây/Chống build
    let balanceText: string;
    if (v.build === 0 && v.fight === 0) {
      balanceText = '⚖️ Chưa phát triển Xây và Chống — hai mặt cần đi đôi với nhau';
    } else if (Math.abs(v.build - v.fight) <= 1) {
      balanceText = `⚖️ Xây (${v.build}) và Chống (${v.fight}) cân bằng — xây đi đôi với chống`;
    } else if (v.build > v.fight) {
      balanceText = `⚖️ Thiên về Xây (${v.build}) hơn Chống (${v.fight}) — kiến tạo cần đấu tranh song hành`;
    } else {
      balanceText = `⚖️ Thiên về Chống (${v.fight}) hơn Xây (${v.build}) — đấu tranh cần kiến tạo song hành`;
    }
    const summaryStrip = this.add.rectangle(cx, 456, 804, 28, 0xf0fdf4, 1);
    summaryStrip.setStrokeStyle(1, 0xbbf7d0);

    this.add.text(cx, 456, balanceText, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#166534',
      resolution: 2,
    }).setOrigin(0.5);

    // 6. Archetype Card (Y = 514, Height = 48, Width = 840)
    const archetype = this.computeArchetype(this.resultData.values);
    const archBox = this.add.rectangle(cx, 514, 840, 48, 0xffffff, 0.98);
    archBox.setStrokeStyle(1.5, 0x0284c7);

    this.add.text(cx, 504, `🌟 HỒ SƠ ĐỊNH HƯỚNG TƯ DUY: ${archetype.title.toUpperCase()}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#0369a1',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(cx, 524, archetype.description, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#475569',
      resolution: 2,
    }).setOrigin(0.5);

    // 7. Action Buttons Bar (Y = 590, Height = 44)
    const btnY = 590;

    // Button 1: Replay with current class
    const btnReplayX = cx - 210;
    const replayBg = this.add.rectangle(btnReplayX, btnY, 210, 44, 0x0284c7);
    replayBg.setStrokeStyle(1.5, 0x0369a1);
    replayBg.setInteractive({ useHandCursor: true });

    this.add.text(btnReplayX, btnY, '🔄 CHƠI LẠI (Space/Enter)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    replayBg.on('pointerover', () => replayBg.setFillStyle(0x0369a1));
    replayBg.on('pointerout', () => replayBg.setFillStyle(0x0284c7));

    // Button 2: Change Class
    const btnSelectClassX = cx;
    const selectClassBg = this.add.rectangle(btnSelectClassX, btnY, 200, 44, 0x7c3aed);
    selectClassBg.setStrokeStyle(1.5, 0x6d28d9);
    selectClassBg.setInteractive({ useHandCursor: true });

    this.add.text(btnSelectClassX, btnY, '👥 ĐỔI VAI TRÒ (Tab)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    selectClassBg.on('pointerover', () => selectClassBg.setFillStyle(0x6d28d9));
    selectClassBg.on('pointerout', () => selectClassBg.setFillStyle(0x7c3aed));

    // Button 3: Return to Menu
    const btnMenuX = cx + 210;
    const menuBg = this.add.rectangle(btnMenuX, btnY, 200, 44, 0xf1f5f9);
    menuBg.setStrokeStyle(1.5, 0x94a3b8);
    menuBg.setInteractive({ useHandCursor: true });

    this.add.text(btnMenuX, btnY, '🏠 VỀ MENU (Esc)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#1e293b',
      resolution: 2,
    }).setOrigin(0.5);

    menuBg.on('pointerover', () => menuBg.setFillStyle(0xe2e8f0));
    menuBg.on('pointerout', () => menuBg.setFillStyle(0xf1f5f9));

    const restartGame = () => {
      this.scene.start('GameScene', { classConfig: this.resultData.classConfig });
    };

    const changeClass = () => {
      this.scene.start('CharacterSelectScene');
    };

    const returnToMenu = () => {
      this.scene.start('MenuScene');
    };

    replayBg.on('pointerdown', restartGame);
    selectClassBg.on('pointerdown', changeClass);
    menuBg.on('pointerdown', returnToMenu);

    // Keys are ignored while the lesson panel is open (SPACE/ENTER close it instead)
    const unlessLesson = (fn: () => void) => () => { if (!this.lessonPanel) fn(); };
    this.input.keyboard?.on('keydown-SPACE', unlessLesson(restartGame));
    this.input.keyboard?.on('keydown-ENTER', unlessLesson(restartGame));
    this.input.keyboard?.on('keydown-TAB', unlessLesson(changeClass));
    this.input.keyboard?.on('keydown-ESC', unlessLesson(returnToMenu));

    // Reopen lesson recap
    const lessonBtnY = 646;
    const lessonBg = this.add.rectangle(cx, lessonBtnY, 300, 36, 0xfef3c7);
    lessonBg.setStrokeStyle(1.5, 0xd97706);
    lessonBg.setInteractive({ useHandCursor: true });
    this.add.text(cx, lessonBtnY, '📖 XEM LẠI BÀI HỌC RÚT RA (B)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#92400e',
      resolution: 2,
    }).setOrigin(0.5);
    lessonBg.on('pointerdown', () => this.showLessonPanel());
    this.input.keyboard?.on('keydown-B', unlessLesson(() => this.showLessonPanel()));

    // The lesson recap is the point of the run: show it first
    this.showLessonPanel();
  }

  private showLessonPanel(): void {
    if (this.lessonPanel) return;
    const { width, height } = this.scale;
    const cx = width / 2;
    const panelW = 1000;
    const panelH = 660;
    const top = height / 2 - panelH / 2;
    const left = cx - panelW / 2 + 40;
    const font = 'system-ui, sans-serif';

    const panel = this.add.container(0, 0).setDepth(50);
    this.lessonPanel = panel;

    // Interactive backdrop blocks clicks on the buttons underneath
    const backdrop = this.add.rectangle(cx, height / 2, width, height, 0x0f172a, 0.5).setInteractive();
    const box = this.add.rectangle(cx, height / 2, panelW, panelH, 0xffffff, 1);
    box.setStrokeStyle(2, 0xd97706);
    panel.add([backdrop, box]);

    panel.add(this.add.text(cx, top + 30, '📖 BÀI HỌC RÚT RA TỪ VÁN CHƠI', {
      fontFamily: font, fontSize: '20px', fontStyle: 'bold', color: '#0f172a', resolution: 2,
    }).setOrigin(0.5));

    const decisions = this.resultData.decisions || [];
    const total = this.resultData.totalScenarios || decisions.length;
    const alignedCount = decisions.filter(d => d.aligned).length;

    panel.add(this.add.text(left, top + 62,
      `TÌNH HUỐNG ĐÃ GẶP: ${decisions.length}/${total}  •  Lựa chọn tích cực: ${alignedCount}/${decisions.length}`, {
        fontFamily: font, fontSize: '12px', fontStyle: 'bold', color: '#475569', resolution: 2,
      }));

    let y = top + 88;
    const rowH = 64;
    if (decisions.length === 0) {
      panel.add(this.add.text(left, y + 8, 'Bạn chưa gặp tình huống nào. Hãy trụ lâu hơn để đối mặt với các tình huống văn hóa số.', {
        fontFamily: font, fontSize: '13px', color: '#64748b', resolution: 2,
      }));
      y += 40;
    }
    for (const d of decisions) {
      const rowBg = this.add.rectangle(cx, y + rowH / 2 - 4, panelW - 60, rowH - 8, d.aligned ? 0xf0fdf4 : 0xfffbeb, 1);
      rowBg.setStrokeStyle(1, d.aligned ? 0xbbf7d0 : 0xfde68a);
      const titleText = this.add.text(left + 8, y + 4, `${d.aligned ? '✓' : '⚠'} ${d.title}`, {
        fontFamily: font, fontSize: '13px', fontStyle: 'bold', color: d.aligned ? '#065f46' : '#92400e', resolution: 2,
      });
      const choiceText = this.add.text(left + 8, y + 22, `Bạn chọn: ${d.choiceLabel}`, {
        fontFamily: font, fontSize: '11.5px', color: '#334155', resolution: 2,
        wordWrap: { width: panelW - 100 },
      });
      const noteText = this.add.text(left + 8, y + 39, `📌 ${d.note}`, {
        fontFamily: font, fontSize: '11.5px', fontStyle: 'bold', color: '#0c4a6e', resolution: 2,
        wordWrap: { width: panelW - 100 },
      });
      panel.add([rowBg, titleText, choiceText, noteText]);
      y += rowH;
    }
    if (decisions.length < total) {
      panel.add(this.add.text(left, y + 2, `🔍 Còn ${total - decisions.length} tình huống chưa gặp — chơi lại để khám phá thêm.`, {
        fontFamily: font, fontSize: '12px', fontStyle: 'italic', color: '#64748b', resolution: 2,
      }));
      y += 24;
    }

    const taken = this.resultData.tinhHoaTaken || 0;
    if (taken > 0) {
      const full = this.resultData.tinhHoaFull || 0;
      const verdict = full === taken
        ? 'có gốc Dân tộc vững nên tiếp thu trọn vẹn.'
        : 'có lần thiếu gốc Dân tộc nên chỉ tiếp thu hời hợt.';
      panel.add(this.add.text(left, y + 4,
        `🌏 Tiếp thu tinh hoa nhân loại ${taken} lần (trọn vẹn ${full} lần) — ${verdict}`, {
          fontFamily: font, fontSize: '12px', fontStyle: 'bold', color: '#6b21a8', resolution: 2,
          wordWrap: { width: panelW - 80 },
        }));
      panel.add(this.add.text(left, y + 22, `“${TINH_HOA.rootQuote}”`, {
        fontFamily: font, fontSize: '11.5px', fontStyle: 'italic', color: '#6b21a8', resolution: 2,
        wordWrap: { width: panelW - 80 },
      }));
    }

    // Archetype quote + lecture summary, anchored above the close button
    const archetype = this.computeArchetype(this.resultData.values);
    const aq = ARCHETYPE_QUOTES[archetype.title];
    const quoteY = top + panelH - 150;
    const quoteBg = this.add.rectangle(cx, quoteY + 40, panelW - 60, 92, 0xf0f9ff, 1);
    quoteBg.setStrokeStyle(1, 0xbae6fd);
    panel.add(quoteBg);
    panel.add(this.add.text(left + 8, quoteY + 2, `🌟 HỒ SƠ CỦA BẠN: ${archetype.title.toUpperCase()}`, {
      fontFamily: font, fontSize: '12px', fontStyle: 'bold', color: '#0369a1', resolution: 2,
    }));
    if (aq) {
      panel.add(this.add.text(left + 8, quoteY + 22, `“${aq.quote}”`, {
        fontFamily: font, fontSize: '12.5px', fontStyle: 'italic', color: '#0f172a', resolution: 2,
        wordWrap: { width: panelW - 100 },
      }));
      panel.add(this.add.text(cx + panelW / 2 - 48, quoteY + 70, `— ${aq.source}`, {
        fontFamily: font, fontSize: '10.5px', color: '#64748b', resolution: 2,
      }).setOrigin(1, 0));
    }

    panel.add(this.add.text(cx, top + panelH - 50, `Quan điểm Hồ Chí Minh về nền văn hóa mới: ${SUMMARY_QUOTE}`, {
      fontFamily: font, fontSize: '11px', color: '#475569', align: 'center', resolution: 2,
      wordWrap: { width: panelW - 80 },
    }).setOrigin(0.5));

    const btnY = top + panelH - 22;
    const btn = this.add.rectangle(cx, btnY, 300, 32, 0x0284c7).setInteractive({ useHandCursor: true });
    const btnText = this.add.text(cx, btnY, 'XEM BẢNG THÀNH TÍCH ▸ (SPACE)', {
      fontFamily: font, fontSize: '12px', fontStyle: 'bold', color: '#ffffff', resolution: 2,
    }).setOrigin(0.5);
    panel.add([btn, btnText]);

    const close = () => {
      this.input.keyboard?.off('keydown-SPACE', close);
      this.input.keyboard?.off('keydown-ENTER', close);
      panel.destroy();
      // Defer clearing so the same key press doesn't also trigger the result-screen shortcuts
      this.time.delayedCall(0, () => { this.lessonPanel = undefined; });
    };
    btn.on('pointerdown', close);
    this.input.keyboard?.on('keydown-SPACE', close);
    this.input.keyboard?.on('keydown-ENTER', close);
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
