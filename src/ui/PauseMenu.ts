import Phaser from 'phaser';
import { Player } from '../game/entities/Player';
import { CommunityMeterManager } from '../game/managers/CommunityMeterManager';
import { isClassMode } from '../game/settings';
import { TINH_HOA } from '../data/lesson';
import { EXTRA_ATTACK_LABEL, DRUM_COOLDOWN_SCALE, drumCone } from '../game/managers/WeaponSystem';

export interface PauseSnapshot {
  runSeconds: number;
  kills: number;
  waveLabel: string;
  comboNames: string[];
  buffText: string;
}

const FONT = 'system-ui, sans-serif';

const PILLAR_ROWS: { key: keyof Player['values']; label: string; core: boolean }[] = [
  { key: 'danToc', label: '🇻🇳 Dân tộc', core: true },
  { key: 'khoaHoc', label: '🔬 Khoa học', core: true },
  { key: 'daiChung', label: '👥 Đại chúng', core: true },
  { key: 'chan', label: '⚖️ Chân', core: false },
  { key: 'thien', label: '❤️ Thiện', core: false },
  { key: 'my', label: '🎨 Mỹ', core: false },
  { key: 'build', label: '🏗️ Xây', core: false },
  { key: 'fight', label: '⚔️ Chống', core: false },
];

// Pause overlay with the player's detailed stats. GameScene owns pausing/resuming combat.
export class PauseMenu {
  private scene: Phaser.Scene;
  private player: Player;
  private communityMeter: CommunityMeterManager;
  private onResume: () => void;
  private container?: Phaser.GameObjects.Container;
  private pointerHandler?: (pointer: Phaser.Input.Pointer) => void;

  constructor(scene: Phaser.Scene, player: Player, communityMeter: CommunityMeterManager, onResume: () => void) {
    this.scene = scene;
    this.player = player;
    this.communityMeter = communityMeter;
    this.onResume = onResume;
  }

  public get isOpen(): boolean {
    return !!this.container;
  }

  public show(snap: PauseSnapshot): void {
    if (this.container) return;
    const { width, height } = this.scene.scale;
    const cx = width / 2;
    const panelW = 1040;
    const panelH = 620;
    const top = height / 2 - panelH / 2;
    const left = cx - panelW / 2;

    const c = this.scene.add.container(0, 0).setDepth(115).setScrollFactor(0);
    this.container = c;

    c.add(this.scene.add.rectangle(cx, height / 2, width, height, 0x0f172a, 0.5));
    const panel = this.scene.add.rectangle(cx, height / 2, panelW, panelH, 0xffffff, 0.98);
    panel.setStrokeStyle(2, 0x0284c7);
    c.add(panel);

    const mins = Math.floor(snap.runSeconds / 60);
    const secs = Math.floor(snap.runSeconds % 60).toString().padStart(2, '0');
    c.add(this.text(cx, top + 32, '‖ TẠM DỪNG', 22, '#0f172a', true).setOrigin(0.5));
    c.add(this.text(cx, top + 60,
      `${mins}:${secs}  •  ${snap.waveLabel}  •  Cấp ${this.player.level}  •  Đã đẩy lùi ${snap.kills}  •  ${this.player.classConfig?.name ?? ''}`,
      13, '#475569').setOrigin(0.5));

    this.renderStats(c, left + 20, top + 85);
    this.renderValues(c, cx + 20, top + 85, snap);

    // Footer: resume button + hint
    const btnY = top + panelH - 34;
    const btn = this.scene.add.rectangle(cx, btnY, 300, 40, 0x0284c7);
    btn.setStrokeStyle(1.5, 0x0369a1);
    c.add(btn);
    c.add(this.text(cx, btnY, '▶ TIẾP TỤC (ESC)', 14, '#ffffff', true).setOrigin(0.5));
    c.add(this.text(left + 24, btnY, 'H: mở Cẩm nang', 12, '#64748b').setOrigin(0, 0.5));

    // Screen-space hit test, as the other overlays do (container hit areas ignore the camera scroll)
    this.pointerHandler = (pointer: Phaser.Input.Pointer) => {
      if (Math.abs(pointer.x - cx) < 150 && Math.abs(pointer.y - btnY) < 20) this.onResume();
    };
    this.scene.input.on('pointerdown', this.pointerHandler);
  }

  public hide(): void {
    if (this.pointerHandler) this.scene.input.off('pointerdown', this.pointerHandler);
    this.pointerHandler = undefined;
    this.container?.destroy();
    this.container = undefined;
  }

  private renderStats(c: Phaser.GameObjects.Container, x: number, y: number): void {
    const w = 480;
    const box = this.scene.add.rectangle(x + w / 2, y + 240, w, 480, 0xf8fafc, 1).setStrokeStyle(1, 0xe2e8f0);
    c.add(box);
    c.add(this.text(x + 20, y + 20, '📊 CHỈ SỐ CHI TIẾT', 13, '#0369a1', true).setOrigin(0, 0.5));

    const s = this.player.stats;
    const fightBonus = s.fightPower * 0.015;
    const heal = this.player.healPerInterval * (1 + s.buildPower * 0.02);
    const style = this.player.classConfig?.startingWeapon || 'sniper';
    const cone = drumCone(this.player.values.danToc || 0, s.projectileCount);
    const rows: [string, string][] = [
      ['Máu', `${Math.ceil(s.hp)} / ${Math.round(s.maxHp)}`],
      ['Khiên', `${Math.round(s.shield)}`],
      ['Sát thương mỗi phát', `${s.damage.toFixed(1)}`],
      ['Sát thương thực tế (gồm Chống)', `${(s.damage * (1 + fightBonus)).toFixed(1)}`],
      style === 'drum'
        ? ['Nhịp trống', `${(s.attackSpeed / DRUM_COOLDOWN_SCALE).toFixed(2)} lần/giây`]
        : [style === 'pulse' ? 'Nhịp phát sóng' : 'Tốc độ bắn', `${s.attackSpeed.toFixed(2)} lần/giây`],
      // The drum's extras show up in the cone size row instead
      ...(style === 'drum' ? [] : [[`Số ${EXTRA_ATTACK_LABEL[style]}`, `${s.projectileCount}`] as [string, string]]),
      ['Tỉ lệ chí mạng', `${Math.round(s.critChance * 100)}% (×2 sát thương)`],
      // Only the sniper fires bullets; the drum shows its cone instead
      ...(style === 'sniper' ? [['Tốc độ đạn', `${Math.round(s.projectileSpeed)}`] as [string, string]] : []),
      ...(style === 'drum'
        ? [['Tầm sóng trống', `${cone.reach} px · ${Math.round(Phaser.Math.RadToDeg(cone.halfAngle * 2))}°`] as [string, string]]
        : []),
      ['Tốc độ di chuyển', `${Math.round(s.moveSpeed)}`],
      ['Tầm hút XP', `${Math.round(s.pickupRadius)}`],
      ['Hồi máu', heal > 0 ? `${heal.toFixed(1)} HP / 5 giây` : 'Chưa có'],
      ['Sức mạnh Xây', `${Math.round(s.buildPower)}`],
      ['Sức mạnh Chống', `${Math.round(s.fightPower)} (+${(fightBonus * 100).toFixed(1)}% sát thương)`],
    ];

    rows.forEach(([label, value], i) => {
      const ry = y + 52 + i * 32;
      if (i > 0) c.add(this.scene.add.rectangle(x + w / 2, ry - 16, w - 40, 1, 0xe2e8f0));
      c.add(this.text(x + 20, ry, label, 13, '#475569').setOrigin(0, 0.5));
      c.add(this.text(x + w - 20, ry, value, 13, '#0f172a', true).setOrigin(1, 0.5));
    });
  }

  private renderValues(c: Phaser.GameObjects.Container, x: number, y: number, snap: PauseSnapshot): void {
    const w = 480;
    const box = this.scene.add.rectangle(x + w / 2, y + 240, w, 480, 0xf8fafc, 1).setStrokeStyle(1, 0xe2e8f0);
    c.add(box);
    c.add(this.text(x + 20, y + 20, '🏛️ 8 TRỤ CỘT GIÁ TRỊ', 13, '#0369a1', true).setOrigin(0, 0.5));

    PILLAR_ROWS.forEach((p, i) => {
      const ry = y + 50 + i * 26;
      const lv = this.player.values[p.key] || 0;
      c.add(this.text(x + 20, ry, p.label, 13, p.core ? '#b45309' : '#334155', p.core).setOrigin(0, 0.5));
      for (let seg = 0; seg < 5; seg++) {
        const filled = seg < lv;
        c.add(this.scene.add.rectangle(x + 196 + seg * 40, ry, 34, 12, filled ? (p.core ? 0xd97706 : 0x0284c7) : 0xe2e8f0)
          .setStrokeStyle(1, filled ? (p.core ? 0xb45309 : 0x0369a1) : 0xcbd5e1));
      }
      c.add(this.text(x + w - 20, ry, `${lv}/5`, 13, '#0f172a', true).setOrigin(1, 0.5));
    });

    const meter = Math.round(this.communityMeter.meterValue);
    const meterState = this.communityMeter.isCrisis
      ? 'Khủng hoảng (−25% sát thương, −20% tốc chạy)'
      : this.communityMeter.isHealthy ? 'Trong lành (+8% tốc chạy)' : 'Bình thường';

    const lines: { label: string; value: string; color: string }[] = [
      { label: '🧬 Cộng hưởng', value: snap.comboNames.length > 0 ? snap.comboNames.join(', ') : 'Chưa kích hoạt', color: '#6d28d9' },
      { label: '🌏 Tinh hoa nhân loại', value: `${this.player.tinhHoaTaken}/${TINH_HOA.maxStacks} lần (trọn vẹn ${this.player.tinhHoaFull})`, color: '#6b21a8' },
      { label: '🌐 Môi trường văn hóa', value: `${meter}% — ${meterState}`, color: this.communityMeter.isCrisis ? '#b91c1c' : '#0f766e' },
      { label: '✨ Buff tình huống', value: snap.buffText ? snap.buffText.replace(/^✨\s*/, '') : 'Không có', color: '#065f46' },
    ];
    if (isClassMode()) {
      lines.push({ label: '🎓 Chế độ lớp học', value: 'Bật — nhận 50% sát thương', color: '#15803d' });
    }

    let ly = y + 252;
    for (const line of lines) {
      c.add(this.text(x + 20, ly, line.label, 12, '#64748b', true).setOrigin(0, 0));
      const v = this.text(x + 20, ly + 17, line.value, 13, line.color, true).setOrigin(0, 0);
      v.setWordWrapWidth(w - 40);
      c.add(v);
      ly += 17 + v.height + 8;
    }
  }

  private text(x: number, y: number, value: string, size: number, color: string, bold = false): Phaser.GameObjects.Text {
    return this.scene.add.text(x, y, value, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      fontStyle: bold ? 'bold' : 'normal',
      color,
      resolution: 2,
    });
  }
}
