import Phaser from 'phaser';
import { EnemyConfig } from '../game/types/data';
import { ENEMY_LESSONS, PILLAR_LABELS } from '../data/lesson';

// Non-blocking card introducing each enemy type the first time it appears in a run.
export class PhenomenonToast {
  private scene: Phaser.Scene;
  private seen = new Set<string>();
  private queue: EnemyConfig[] = [];
  private showing = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public notifySpawn(config: EnemyConfig): void {
    if (this.seen.has(config.id) || !ENEMY_LESSONS[config.id]) return;
    this.seen.add(config.id);
    this.queue.push(config);
    if (!this.showing) this.showNext();
  }

  private showNext(): void {
    const config = this.queue.shift();
    if (!config) {
      this.showing = false;
      return;
    }
    this.showing = true;

    const { width } = this.scene.scale;
    const w = 640;
    const h = 62;
    const toast = this.scene.add.container(width / 2, 118).setDepth(95).setScrollFactor(0).setAlpha(0);

    const bg = this.scene.add.rectangle(0, 0, w, h, 0xffffff, 0.97);
    bg.setStrokeStyle(1.5, 0xf97316);

    const counters = (config.weakAgainst || []).map(p => PILLAR_LABELS[p] || p).join(', ');
    const title = this.scene.add.text(-w / 2 + 16, -18, `🆕 HIỆN TƯỢNG MỚI: ${config.name}`, {
      fontFamily: 'system-ui, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#c2410c', resolution: 2,
    }).setOrigin(0, 0.5);
    const lesson = this.scene.add.text(-w / 2 + 16, 2, ENEMY_LESSONS[config.id], {
      fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#0f172a', resolution: 2,
    }).setOrigin(0, 0.5);
    const counter = this.scene.add.text(-w / 2 + 16, 20, `Khắc chế (+25% sát thương): ${counters}`, {
      fontFamily: 'system-ui, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#0369a1', resolution: 2,
    }).setOrigin(0, 0.5);
    toast.add([bg, title, lesson, counter]);

    this.scene.tweens.add({
      targets: toast,
      alpha: 1,
      duration: 250,
      hold: 4500,
      yoyo: true,
      onComplete: () => {
        toast.destroy();
        this.showNext();
      },
    });
  }
}
