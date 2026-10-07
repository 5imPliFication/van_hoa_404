import Phaser from 'phaser';
import { CulturalValues } from '../types/player';
import { CharacterClassConfig, ScenarioDecision } from '../types/data';
import { ARCHETYPE_QUOTES } from '../../data/lesson';

export interface GameResultData {
  survivedTime: number; // in seconds
  enemiesKilled: number;
  levelReached: number;
  values: CulturalValues;
  isVictory: boolean;
  classConfig?: CharacterClassConfig;
  decisions?: ScenarioDecision[];
  totalScenarios?: number;
}

const FONT = 'system-ui, sans-serif';

// One page: the outcome, the player's profile with one lecture quote, and the lesson behind each choice.
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
      values: { danToc: 0, khoaHoc: 0, daiChung: 0, chan: 0, thien: 0, my: 0, build: 0, fight: 0 },
      isVictory: false,
    };
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const r = this.resultData;

    this.add.rectangle(cx, height / 2, width, height, 0xf8fafc, 1).setDepth(-2);

    // 1. Outcome
    this.label(cx, 56, r.isVictory ? '🎉 CHIẾN THẮNG' : 'VÁN ĐẤU KẾT THÚC', 13, r.isVictory ? '#15803d' : '#b91c1c', true).setOrigin(0.5);
    this.label(cx, 92, r.isVictory ? 'Bạn đã bảo vệ không gian mạng' : 'Cảm ơn bạn đã chiến đấu', 30, '#0f172a', true).setOrigin(0.5);
    const mins = Math.floor(r.survivedTime / 60);
    const secs = Math.floor(r.survivedTime % 60).toString().padStart(2, '0');
    this.label(cx, 128, `Trụ vững ${mins}:${secs}  ·  Cấp ${r.levelReached}  ·  Đẩy lùi ${r.enemiesKilled} hiện tượng`, 15, '#64748b').setOrigin(0.5);

    // 2. Profile: archetype, one lecture quote, Xây/Chống balance
    const cardW = 900;
    const cardTop = 164;
    const cardLeft = cx - cardW / 2;

    const archetype = this.computeArchetype(r.values);
    const aq = ARCHETYPE_QUOTES[archetype];
    this.label(cardLeft + 28, cardTop + 20, 'HỒ SƠ CỦA BẠN', 12, '#0369a1', true);
    this.label(cardLeft + 28, cardTop + 40, archetype, 24, '#0f172a', true);
    let y = cardTop + 78;
    if (aq) {
      const quote = this.label(cardLeft + 28, y, `“${aq.quote}”`, 15, '#334155', false, true).setWordWrapWidth(cardW - 56);
      y += quote.height + 4;
      y += this.label(cardLeft + 28, y, `— ${aq.source}`, 12, '#64748b').height + 10;
    }
    y += this.label(cardLeft + 28, y, this.balanceText(r.values), 14, '#0f766e', true).setWordWrapWidth(cardW - 56).height;
    // Card drawn after its contents are measured, behind them
    const cardH = y - cardTop + 20;
    this.add.rectangle(cx, cardTop, cardW, cardH, 0xffffff, 1).setOrigin(0.5, 0).setStrokeStyle(1.5, 0xbae6fd).setDepth(-1);

    // 3. Lessons from each scenario choice
    const decisions = r.decisions || [];
    const total = r.totalScenarios || decisions.length;
    const listTop = cardTop + cardH + 34;
    const aligned = decisions.filter(d => d.aligned).length;
    this.label(cardLeft, listTop, 'BÀI HỌC TỪ LỰA CHỌN CỦA BẠN', 13, '#0f172a', true).setOrigin(0, 0.5);
    const missed = total - decisions.length;
    this.label(cardLeft + cardW, listTop,
      decisions.length > 0 ? `${aligned}/${decisions.length} tích cực${missed > 0 ? ` · còn ${missed} tình huống chưa gặp` : ''}` : '',
      13, '#64748b').setOrigin(1, 0.5);

    if (decisions.length === 0) {
      this.label(cardLeft, listTop + 30, 'Bạn chưa gặp tình huống nào — hãy trụ lâu hơn ở ván sau.', 15, '#64748b');
    }
    decisions.forEach((d, i) => {
      const rowY = listTop + 26 + i * 44;
      this.label(cardLeft, rowY, d.aligned ? '✓' : '⚠', 15, d.aligned ? '#15803d' : '#b45309', true);
      this.label(cardLeft + 24, rowY, d.title, 14, '#0f172a', true).setWordWrapWidth(300);
      this.label(cardLeft + 340, rowY, d.note, 14, '#334155').setWordWrapWidth(cardW - 340);
    });

    // 4. Two actions
    const btnY = height - 46;
    this.button(cx - 130, btnY, 'CHƠI LẠI (SPACE)', 0x0284c7, '#ffffff');
    this.button(cx + 130, btnY, 'VỀ MENU (ESC)', 0xe2e8f0, '#1e293b');

    const restartGame = () => this.scene.start('GameScene', { classConfig: r.classConfig });
    const returnToMenu = () => this.scene.start('MenuScene');

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (Math.abs(pointer.y - btnY) > 22) return;
      if (Math.abs(pointer.x - (cx - 130)) < 115) restartGame();
      else if (Math.abs(pointer.x - (cx + 130)) < 115) returnToMenu();
    });
    this.input.keyboard?.once('keydown-SPACE', restartGame);
    this.input.keyboard?.once('keydown-ENTER', restartGame);
    this.input.keyboard?.once('keydown-ESC', returnToMenu);
  }

  private label(x: number, y: number, text: string, size: number, color: string, bold = false, italic = false): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      fontStyle: [bold ? 'bold' : '', italic ? 'italic' : ''].join(' ').trim() || 'normal',
      color,
      lineSpacing: 3,
      resolution: 2,
    });
  }

  private button(x: number, y: number, text: string, fill: number, color: string): void {
    this.add.rectangle(x, y, 230, 44, fill);
    this.label(x, y, text, 14, color, true).setOrigin(0.5);
  }

  // GDD §8: the ending reflects a lopsided Xây/Chống build
  private balanceText(v: CulturalValues): string {
    if (v.build === 0 && v.fight === 0) return '⚖️ Chưa phát triển Xây và Chống — hai mặt cần đi đôi với nhau';
    if (Math.abs(v.build - v.fight) <= 1) return `⚖️ Xây (${v.build}) và Chống (${v.fight}) cân bằng — xây đi đôi với chống`;
    if (v.build > v.fight) return `⚖️ Thiên về Xây (${v.build}) hơn Chống (${v.fight}) — kiến tạo cần đấu tranh song hành`;
    return `⚖️ Thiên về Chống (${v.fight}) hơn Xây (${v.build}) — đấu tranh cần kiến tạo song hành`;
  }

  private computeArchetype(v: CulturalValues): string {
    const scores = [
      { key: 'Người Kiểm Chứng', val: v.khoaHoc * 1.2 + v.chan * 1.2 },
      { key: 'Người Kiến Tạo', val: v.build * 1.3 + v.my * 1.1 },
      { key: 'Người Gìn Giữ', val: v.danToc * 1.3 + v.chan * 1.1 },
      { key: 'Người Kết Nối', val: v.daiChung * 1.3 + v.thien * 1.1 },
      { key: 'Người Phản Biện', val: v.fight * 1.3 + v.khoaHoc * 1.1 },
    ];
    scores.sort((a, b) => b.val - a.val);
    return scores[0].key;
  }
}
