import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EnemyManager } from '../managers/EnemyManager';
import { WeaponSystem } from '../managers/WeaponSystem';
import { XPManager } from '../managers/XPManager';
import { WaveManager } from '../managers/WaveManager';
import { UpgradeManager } from '../managers/UpgradeManager';
import { ScenarioEventManager } from '../managers/ScenarioEventManager';
import { CommunityMeterManager } from '../managers/CommunityMeterManager';
import { EvolutionManager } from '../managers/EvolutionManager';
import { BossManager } from '../managers/BossManager';
import { HUD } from '../../ui/HUD';
import { Projectile } from '../entities/Projectile';
import { SoundSystem } from '../systems/SoundSystem';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemyManager!: EnemyManager;
  private weaponSystem!: WeaponSystem;
  private xpManager!: XPManager;
  private waveManager!: WaveManager;
  private upgradeManager!: UpgradeManager;
  private scenarioManager!: ScenarioEventManager;
  private communityMeter!: CommunityMeterManager;
  private evolutionManager!: EvolutionManager;
  private bossManager!: BossManager;
  private hud!: HUD;

  public runSeconds: number = 0;
  public isPaused: boolean = false;
  private arenaWidth: number = 2400;
  private arenaHeight: number = 1800;

  private joystickBase?: Phaser.GameObjects.Arc;
  private joystickThumb?: Phaser.GameObjects.Arc;
  private isDraggingJoystick: boolean = false;
  private joystickOrigin: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.runSeconds = 0;
    this.isPaused = false;

    // 1. World & Arena setup
    this.physics.world.setBounds(0, 0, this.arenaWidth, this.arenaHeight);

    // Light tech arena background with grid
    this.add.rectangle(this.arenaWidth / 2, this.arenaHeight / 2, this.arenaWidth, this.arenaHeight, 0xe8edf3);
    const grid = this.add.grid(
      this.arenaWidth / 2,
      this.arenaHeight / 2,
      this.arenaWidth,
      this.arenaHeight,
      60,
      60,
      0xe8edf3,
      1,
      0xcbd5e1,
      0.65
    );
    grid.setDepth(1);

    // Arena boundary lines
    const borderGfx = this.add.graphics();
    borderGfx.lineStyle(4, 0x0284c7, 0.7);
    borderGfx.strokeRect(4, 4, this.arenaWidth - 8, this.arenaHeight - 8);
    borderGfx.setDepth(2);

    // 2. Instantiate Player at arena center
    this.player = new Player(this, this.arenaWidth / 2, this.arenaHeight / 2);

    // 3. Camera setup following player
    this.cameras.main.setBounds(0, 0, this.arenaWidth, this.arenaHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 4. Managers
    this.xpManager = new XPManager(this, this.player, (_newLevel) => {
      this.onLevelUp();
    });

    this.enemyManager = new EnemyManager(this, this.player, this.xpManager);
    this.weaponSystem = new WeaponSystem(this, this.player);
    this.communityMeter = new CommunityMeterManager(this, this.player);
    this.waveManager = new WaveManager(this.enemyManager);

    this.upgradeManager = new UpgradeManager(this, this.player, () => {
      this.resumeCombat();
    });

    this.scenarioManager = new ScenarioEventManager(
      this,
      this.player,
      this.communityMeter,
      this.enemyManager,
      () => {
        this.resumeCombat();
      }
    );

    this.evolutionManager = new EvolutionManager(this, this.player, this.weaponSystem);

    this.bossManager = new BossManager(
      this,
      this.player,
      this.enemyManager,
      this.communityMeter,
      () => {
        this.onBossDefeated();
      }
    );

    // 5. Fixed HUD on camera
    this.hud = new HUD(this, this.player, this.communityMeter);

    // 6. Virtual Joystick for Mobile/Touch
    this.setupVirtualJoystick();

    // 7. Opening intro guide (Only once)
    this.checkOpeningIntro();
  }

  private checkOpeningIntro(): void {
    const introDone = localStorage.getItem('vanhoa404_intro_done');
    if (introDone) return;

    this.pauseCombat();
    const { width, height } = this.scale;

    const introContainer = this.add.container(0, 0);
    introContainer.setDepth(120);
    introContainer.setScrollFactor(0); // PIN TO SCREEN

    // Soft dim backdrop
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a, 0.45);
    bg.setInteractive();
    introContainer.add(bg);

    // Dialog Window
    const winW = 740;
    const winH = 490;
    const winBg = this.add.rectangle(width / 2, height / 2, winW, winH, 0xffffff, 0.98);
    winBg.setStrokeStyle(2, 0x0284c7);
    introContainer.add(winBg);

    // Badge
    const badgeBg = this.add.rectangle(width / 2, height / 2 - winH / 2 + 36, 260, 28, 0xe0f2fe, 1);
    badgeBg.setStrokeStyle(1, 0xbae6fd);
    const badgeText = this.add.text(width / 2, height / 2 - winH / 2 + 36, '🛡️ HƯỚNG DẪN KHỞI ĐẦU', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#0369a1',
    }).setOrigin(0.5);

    // Title
    const title = this.add.text(width / 2, height / 2 - winH / 2 + 76, 'CHÀO MỪNG ĐẾN VỚI VĂN HÓA 404', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#0f172a',
    }).setOrigin(0.5);

    // Goal sentence
    const goal = this.add.text(width / 2, height / 2 - winH / 2 + 120,
      'Sứ mệnh của bạn là kiến tạo không gian mạng tích cực và kiên quyết đẩy lùi\ncác hiện tượng lệch chuẩn: Tin Giả, Bạo Lực Mạng, Đạo Nhái và Xuyên Tạc.',
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#475569',
        align: 'center',
        lineSpacing: 4,
      }
    ).setOrigin(0.5);

    introContainer.add([badgeBg, badgeText, title, goal]);

    // 4 Instruction Cards
    const rules = [
      { icon: '🕹️', title: 'Di chuyển', desc: 'Dùng WASD / Phím mũi tên, hoặc chạm kéo trực tiếp trên màn hình.' },
      { icon: '⚡', title: 'Tự động bắn', desc: 'Nhân vật tự động tìm và tấn công quái vật gần nhất trong tầm bắn.' },
      { icon: '⭐', title: 'Nhặt XP & Lên cấp', desc: 'Thu thập hạt ngọc rơi từ quái để chọn 1 trong 3 thẻ bài nâng cấp giá trị.' },
      { icon: '🌐', title: 'Tình huống thực tế', desc: 'Xử lý các bài đăng trên mạng để nhận buff và giữ vững Môi Trường Văn Hóa!' },
    ];

    rules.forEach((rule, idx) => {
      const rx = width / 2;
      const ry = height / 2 - winH / 2 + 185 + idx * 56;

      const rowBg = this.add.rectangle(rx, ry, winW - 60, 48, 0xf8fafc, 1);
      rowBg.setStrokeStyle(1, 0xe2e8f0);

      const iconText = this.add.text(rx - (winW - 60) / 2 + 25, ry, rule.icon, {
        fontSize: '20px',
      }).setOrigin(0.5);

      const titleText = this.add.text(rx - (winW - 60) / 2 + 55, ry, rule.title + ':', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#0f172a',
      }).setOrigin(0, 0.5);

      const descText = this.add.text(rx - (winW - 60) / 2 + 185, ry, rule.desc, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        color: '#475569',
      }).setOrigin(0, 0.5);

      introContainer.add([rowBg, iconText, titleText, descText]);
    });

    // Start Button
    const btnY = height / 2 + winH / 2 - 42;
    const btnBg = this.add.rectangle(width / 2, btnY, 260, 46, 0x0284c7);
    btnBg.setStrokeStyle(1.5, 0x0369a1);
    btnBg.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(width / 2, btnY, 'BẮT ĐẦU CHIẾN ĐẤU', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    introContainer.add([btnBg, btnText]);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x0369a1));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x0284c7));

    btnBg.on('pointerdown', () => {
      localStorage.setItem('vanhoa404_intro_done', 'true');
      introContainer.destroy();
      this.resumeCombat();
    });
  }

  private setupVirtualJoystick(): void {
    this.joystickBase = this.add.circle(0, 0, 50, 0x0284c7, 0.15)
      .setStrokeStyle(2, 0x0284c7, 0.6)
      .setDepth(95)
      .setVisible(false)
      .setScrollFactor(0);

    this.joystickThumb = this.add.circle(0, 0, 24, 0x0284c7, 0.8)
      .setDepth(96)
      .setVisible(false)
      .setScrollFactor(0);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isPaused || pointer.y < 70) return;
      this.isDraggingJoystick = true;
      this.joystickOrigin.set(pointer.x, pointer.y);
      this.joystickBase?.setPosition(pointer.x, pointer.y).setVisible(true);
      this.joystickThumb?.setPosition(pointer.x, pointer.y).setVisible(true);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDraggingJoystick || this.isPaused) return;

      const dx = pointer.x - this.joystickOrigin.x;
      const dy = pointer.y - this.joystickOrigin.y;
      const dist = Math.hypot(dx, dy);
      const maxRadius = 50;

      const clampedDist = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);

      const thumbX = this.joystickOrigin.x + Math.cos(angle) * clampedDist;
      const thumbY = this.joystickOrigin.y + Math.sin(angle) * clampedDist;
      this.joystickThumb?.setPosition(thumbX, thumbY);

      const factor = clampedDist / maxRadius;
      this.player.touchVelocity.set(Math.cos(angle) * factor, Math.sin(angle) * factor);
    });

    this.input.on('pointerup', () => {
      this.isDraggingJoystick = false;
      this.joystickBase?.setVisible(false);
      this.joystickThumb?.setVisible(false);
      this.player.touchVelocity.set(0, 0);
    });
  }

  update(_time: number, delta: number): void {
    if (this.isPaused) return;

    const dt = delta;
    this.runSeconds += dt / 1000;

    // Check Player life
    if (!this.player.isAlive) {
      this.onGameOver(false);
      return;
    }

    // 1. Entities update
    this.player.update(dt);

    const activeEnemies = this.enemyManager.getActiveEnemies();
    this.enemyManager.update(dt);
    this.weaponSystem.update(dt, activeEnemies);
    this.xpManager.update(dt);

    // 2. Bullets collision check with enemies & boss
    const bullets = this.weaponSystem.projectiles.getChildren() as Projectile[];
    for (const b of bullets) {
      if (b.active) {
        this.enemyManager.handleBulletHits(b);

        // Check boss hit
        if (this.bossManager.isBossActive && b.active) {
          const bossSprite = this.bossManager.getBossSprite();
          if (bossSprite?.active) {
            const distToBoss = Phaser.Math.Distance.Between(b.x, b.y, bossSprite.x, bossSprite.y);
            if (distToBoss < 40) {
              this.bossManager.takeDamage(b.damage);
              b.onHit();
            }
          }
        }
      }
    }

    // 3. Systems update
    this.waveManager.update(this.runSeconds, dt);
    this.communityMeter.update(dt, activeEnemies.length);
    this.evolutionManager.checkEvolutions();

    // 4. Boss logic or check if time reached 600s (10m) to spawn boss
    if (this.runSeconds >= 585 && !this.bossManager.isBossActive) {
      this.bossManager.spawnBoss();
    }
    if (this.bossManager.isBossActive) {
      this.bossManager.update(dt);
    }

    // 5. Check Scenario Events triggers
    const triggered = this.scenarioManager.checkTriggers(this.runSeconds);
    if (triggered) {
      this.pauseCombat();
    }

    // 6. Update HUD
    const currentWave = this.waveManager.getCurrentWave(this.runSeconds);
    this.hud.update(this.runSeconds, this.enemyManager.totalKills, currentWave);
  }

  private onLevelUp(): void {
    this.pauseCombat();
    this.upgradeManager.showUpgradeSelection();
  }

  private pauseCombat(): void {
    this.isPaused = true;
    this.player.setVelocity(0, 0);

    // Freeze active physics bodies
    const enemies = this.enemyManager.getActiveEnemies();
    for (const e of enemies) {
      e.setVelocity(0, 0);
    }
    const bullets = this.weaponSystem.projectiles.getChildren() as Projectile[];
    for (const b of bullets) {
      b.setVelocity(0, 0);
    }
  }

  private resumeCombat(): void {
    this.isPaused = false;
  }

  private onBossDefeated(): void {
    this.onGameOver(true);
  }

  private onGameOver(isVictory: boolean): void {
    this.isPaused = true;
    if (isVictory) {
      SoundSystem.playLevelUp();
    } else {
      SoundSystem.playAlert();
    }

    this.cameras.main.fadeOut(500, 241, 245, 249);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ResultScene', {
        survivedTime: this.runSeconds,
        enemiesKilled: this.enemyManager.totalKills,
        levelReached: this.player.level,
        values: this.player.values,
        isVictory: isVictory,
        communityMeter: this.communityMeter.meterValue,
      });
    });
  }

  public shutdown(): void {
    this.hud.destroy();
  }
}
