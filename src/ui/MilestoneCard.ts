import Phaser from 'phaser';
import { HISTORY_MILESTONES, LECTURE_SOURCE } from '../data/lesson';

const FONT = 'system-ui, sans-serif';

// Short history card shown after each milestone boss (3 stages for bosses 1–3). GameScene pauses combat around it.
export class MilestoneCard {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public get isOpen(): boolean {
    return !!this.container;
  }

  // Returns false (and shows nothing) when there is no stage for this boss index.
  public show(index: number, onClose: () => void): boolean {
    const m = HISTORY_MILESTONES.at(index);
    if (!m || this.container) return false;

    const { width, height } = this.scene.scale;
    const cardW = 760;
    const left = width / 2 - cardW / 2 + 36;
    const c = this.scene.add.container(0, 0).setDepth(112).setScrollFactor(0);
    this.container = c;
    c.add(this.scene.add.rectangle(width / 2, height / 2, width, height, 0x0f172a, 0.45));

    // Lay out from y = 0, then shift the whole card to the vertical centre once measured
    const parts: Phaser.GameObjects.Text[] = [];
    const add = (x: number, y: number, text: string, size: number, color: string, style = 'normal', wrap = cardW - 72) => {
      const t = this.scene.add.text(x, y, text, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: style, color, wordWrap: { width: wrap }, lineSpacing: 3, resolution: 2 });
      parts.push(t);
      return t;
    };

    let y = 26;
    y += add(left, y, `✨ ĐÃ ĐẨY LÙI TRÙM · DẤU MỐC LỊCH SỬ ${index + 1}/${HISTORY_MILESTONES.length}`, 12, '#b45309', 'bold').height + 8;
    y += add(left, y, m.era, 13, '#64748b').height + 4;
    y += add(left, y, m.title, 20, '#0f172a', 'bold').height + 14;
    for (const [label, desc] of m.items ?? []) {
      add(left, y, label, 15, '#0369a1', 'bold', 120);
      y += add(left + 124, y, desc, 15, '#1e293b', 'normal', cardW - 196).height + 8;
    }
    if (m.body) y += add(left, y, m.body, 15, '#1e293b').height + 12;
    y += add(left, y + 2, m.bridge, 14, '#0f766e', 'bold italic').height + 14;
    y += add(left, y, `— ${LECTURE_SOURCE}, tr.125`, 11, '#64748b').height + 10;
    const hint = add(left, y, 'Bấm chuột / SPACE / ENTER để tiếp tục', 11, '#64748b').setAlpha(0);
    const cardH = y + hint.height + 22;

    const offset = height / 2 - cardH / 2;
    const bg = this.scene.add.rectangle(width / 2, height / 2, cardW, cardH, 0xfffbeb, 0.98).setStrokeStyle(2, 0xd97706);
    c.add(bg);
    for (const t of parts) {
      t.y += offset;
      c.add(t);
    }

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      this.scene.input.off('pointerdown', close);
      this.scene.input.keyboard?.off('keydown-SPACE', close);
      this.scene.input.keyboard?.off('keydown-ENTER', close);
      autoClose.remove(false);
      c.destroy();
      this.container = undefined;
      onClose();
    };

    // Readable first, dismissable after 1.5 s, auto-resume as a fallback
    this.scene.time.delayedCall(1500, () => {
      if (closed) return;
      hint.setAlpha(1);
      this.scene.input.on('pointerdown', close);
      this.scene.input.keyboard?.on('keydown-SPACE', close);
      this.scene.input.keyboard?.on('keydown-ENTER', close);
    });
    const autoClose = this.scene.time.delayedCall(14000, close);
    return true;
  }
}
