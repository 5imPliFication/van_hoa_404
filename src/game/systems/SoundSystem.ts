export class SoundSystem {
  private static ctx?: AudioContext;
  private static isMuted: boolean = false;

  private static getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx || null;
  }

  public static toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  private static lastHitTime: number = 0;
  private static lastShootTime: number = 0;

  public static playShoot(): void {
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (nowMs - this.lastShootTime < 45) return; // Prevent multi-shot bullet audio stacking
    this.lastShootTime = nowMs;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // AudioContext policy safe
    }
  }

  public static playHit(): void {
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    // Throttle hit sounds (minimum 75ms) to prevent loud clipping when piercing bullets hit clumps of enemies
    if (nowMs - this.lastHitTime < 75) return;
    this.lastHitTime = nowMs;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.05);

      gain.gain.setValueAtTime(0.06, now); // Softer volume, no ear-splitting stacking
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // AudioContext policy safe
    }
  }

  public static playGem(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.09);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // AudioContext policy safe
    }
  }

  public static playLevelUp(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const start = ctx.currentTime + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch {
      // AudioContext policy safe
    }
  }

  public static playEvolution(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        const start = ctx.currentTime + idx * 0.06;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {
      // AudioContext policy safe
    }
  }

  public static playAlert(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.setValueAtTime(740, now + 0.08);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // AudioContext policy safe
    }
  }

  public static playBossAlarm(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        const start = ctx.currentTime + i * 0.22;
        osc.frequency.setValueAtTime(220, start);
        osc.frequency.linearRampToValueAtTime(140, start + 0.18);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.18);
      }
    } catch {
      // AudioContext policy safe
    }
  }
}
