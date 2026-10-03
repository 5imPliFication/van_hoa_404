import Phaser from 'phaser';
import { Player } from '../game/entities/Player';
import { CommunityMeterManager } from '../game/managers/CommunityMeterManager';
import { WaveConfig } from '../game/types/data';

export class HUD {
  private scene: Phaser.Scene;
  private player: Player;
  private communityMeter: CommunityMeterManager;

  // Visual elements
  private container: Phaser.GameObjects.Container;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  private hpText: Phaser.GameObjects.Text;
  private shieldText: Phaser.GameObjects.Text;

  private xpBarFill: Phaser.GameObjects.Rectangle;
  private levelText: Phaser.GameObjects.Text;

  private communityBarFill: Phaser.GameObjects.Rectangle;
  private communityText: Phaser.GameObjects.Text;
  private crisisWarningText: Phaser.GameObjects.Text;

  private timerText: Phaser.GameObjects.Text;
  private waveText: Phaser.GameObjects.Text;
  private killsText: Phaser.GameObjects.Text;
  private pillarsText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: Player, communityMeter: CommunityMeterManager) {
    this.scene = scene;
    this.player = player;
    this.communityMeter = communityMeter;

    const { width } = scene.scale;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(80);

    // Top HUD Bar Background
    const topBg = scene.add.rectangle(width / 2, 28, width, 56, 0x070a0e, 0.85);
    topBg.setStrokeStyle(1, 0x1e293b);
    this.container.add(topBg);

    // 1. HP & Shield Bar (Top Left)
    const hpBg = scene.add.rectangle(130, 20, 180, 14, 0x1e293b);
    hpBg.setStrokeStyle(1, 0x334155);
    this.hpBarFill = scene.add.rectangle(40, 20, 180, 14, 0x10b981).setOrigin(0, 0.5);
    this.hpText = scene.add.text(130, 20, 'HP: 100/100', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.shieldText = scene.add.text(230, 20, '🛡️ 0', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#38bdf8',
    }).setOrigin(0, 0.5);

    this.container.add([hpBg, this.hpBarFill, this.hpText, this.shieldText]);

    // 2. XP Bar & Level (Full width underneath top bar)
    const xpBg = scene.add.rectangle(width / 2, 54, width, 6, 0x0f172a);
    this.xpBarFill = scene.add.rectangle(0, 54, 0, 6, 0x00f0ff).setOrigin(0, 0.5);
    this.levelText = scene.add.text(20, 38, 'LV. 1', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#00f0ff',
    }).setOrigin(0, 0.5);

    this.container.add([xpBg, this.xpBarFill, this.levelText]);

    // 3. Community Meter Bar (Top Right)
    const commX = width - 140;
    const commBg = scene.add.rectangle(commX, 20, 180, 14, 0x1e293b);
    commBg.setStrokeStyle(1, 0x334155);
    this.communityBarFill = scene.add.rectangle(commX - 90, 20, 180, 14, 0x06b6d4).setOrigin(0, 0.5);
    this.communityText = scene.add.text(commX, 20, 'MÔI TRƯỜNG VĂN HÓA: 75%', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.crisisWarningText = scene.add.text(commX, 38, '⚠️ KHỦNG HOẢNG VĂN HÓA SỐ (-25% SỨC MẠNH)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ef4444',
    }).setOrigin(0.5).setVisible(false);

    this.container.add([commBg, this.communityBarFill, this.communityText, this.crisisWarningText]);

    // 4. Timer & Wave Info (Top Center)
    this.timerText = scene.add.text(width / 2, 18, '00:00', {
      fontFamily: 'monospace',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f8fafc',
    }).setOrigin(0.5);

    this.waveText = scene.add.text(width / 2, 36, 'WAVE 1', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#94a3b8',
    }).setOrigin(0.5);

    this.container.add([this.timerText, this.waveText]);

    // 5. Kills counter & Cultural pillars count (Bottom Left)
    this.killsText = scene.add.text(20, scene.scale.height - 35, '⚔️ TIÊU DIỆT: 0', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#cbd5e1',
    });

    this.pillarsText = scene.add.text(20, scene.scale.height - 18, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#38bdf8',
    });

    this.container.add([this.killsText, this.pillarsText]);
  }

  public update(runSeconds: number, kills: number, currentWave?: WaveConfig): void {
    // 1. Update Timer
    const m = Math.floor(runSeconds / 60);
    const s = Math.floor(runSeconds % 60);
    this.timerText.setText(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);

    // 2. Update Wave
    this.waveText.setText(currentWave ? currentWave.id.toUpperCase().replace('_', ' ') : 'CHỐT CHẶN CUỐI');

    // 3. Update HP & Shield
    const hpRatio = Phaser.Math.Clamp(this.player.stats.hp / this.player.stats.maxHp, 0, 1);
    this.hpBarFill.width = 180 * hpRatio;
    this.hpText.setText(`HP: ${Math.round(this.player.stats.hp)}/${this.player.stats.maxHp}`);
    this.shieldText.setText(`🛡️ ${Math.round(this.player.stats.shield)}`);

    if (hpRatio < 0.25) {
      this.hpBarFill.setFillStyle(0xef4444);
    } else if (hpRatio < 0.5) {
      this.hpBarFill.setFillStyle(0xf59e0b);
    } else {
      this.hpBarFill.setFillStyle(0x10b981);
    }

    // 4. Update XP
    const xpRatio = Phaser.Math.Clamp(this.player.currentXP / this.player.nextLevelXP, 0, 1);
    this.xpBarFill.width = this.scene.scale.width * xpRatio;
    this.levelText.setText(`LV. ${this.player.level}`);

    // 5. Update Community Meter
    const meter = this.communityMeter.meterValue;
    this.communityBarFill.width = 180 * (meter / 100);
    this.communityText.setText(`MÔI TRƯỜNG: ${Math.round(meter)}%`);

    if (meter <= 0) {
      this.crisisWarningText.setVisible(true);
      this.communityBarFill.setFillStyle(0xdc2626);
    } else {
      this.crisisWarningText.setVisible(false);
      this.communityBarFill.setFillStyle(meter < 35 ? 0xf59e0b : 0x06b6d4);
    }

    // 6. Update Kills & Pillars
    this.killsText.setText(`⚔️ ĐÃ ĐẨY LÙI: ${kills}`);
    const v = this.player.values;
    const summary = `DT:${v.danToc} KH:${v.khoaHoc} ĐC:${v.daiChung} | C:${v.chan} T:${v.thien} M:${v.my} | X:${v.build} C:${v.fight}`;
    this.pillarsText.setText(summary);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
