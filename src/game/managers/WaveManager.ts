import { EnemyManager } from './EnemyManager';
import { WaveConfig } from '../types/data';
import { DataLoader } from '../../data/loader';

export class WaveManager {
  private enemyManager: EnemyManager;
  private waves: WaveConfig[] = [];
  public currentWaveIndex: number = 0;
  private spawnCounters: Map<string, number> = new Map();

  constructor(enemyManager: EnemyManager) {
    this.enemyManager = enemyManager;
    this.waves = DataLoader.getWaves();
  }

  public update(runSeconds: number, dt: number): void {
    const dtSec = dt / 1000;

    // Find active wave
    const currentWave = this.waves.find(w => runSeconds >= w.startSecond && runSeconds < w.endSecond);
    if (!currentWave) return;

    for (const spawnCfg of currentWave.spawns) {
      const activeCount = this.enemyManager.getActiveEnemies().filter(e => e.config.id === spawnCfg.enemyId).length;
      if (activeCount >= spawnCfg.maxAlive) continue;

      const key = `${currentWave.id}_${spawnCfg.enemyId}`;
      const progress = (this.spawnCounters.get(key) || 0) + spawnCfg.ratePerSecond * dtSec;

      if (progress >= 1.0) {
        this.spawnCounters.set(key, progress - 1.0);
        this.enemyManager.spawnEnemy(spawnCfg.enemyId);
      } else {
        this.spawnCounters.set(key, progress);
      }
    }
  }

  public getCurrentWave(runSeconds: number): WaveConfig | undefined {
    return this.waves.find(w => runSeconds >= w.startSecond && runSeconds < w.endSecond);
  }
}
