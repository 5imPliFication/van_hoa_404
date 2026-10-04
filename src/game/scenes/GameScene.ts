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
import { DamageNumberSystem } from '../systems/DamageNumberSystem';

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

  private isIntroOpen: boolean = false;
  private closeIntroCallback?: () => void;

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
    this.isIntroOpen = false;
    this.closeIntroCallback = undefined;

    // Initialize Damage Numbers System
    DamageNumberSystem.init(this);

    // 1. World & Arena setup
    this.physics.world.setBounds(0, 0, this.arenaWidth, this.arenaHeight);

    // Modern light cyber-arena floor (Clean elevated slate-50)
    const cx = this.arenaWidth / 2;
    const cy = this.arenaHeight / 2;
    this.add.rectangle(cx, cy, this.arenaWidth, this.arenaHeight, 0xf1f5f9);

    // Dual-tier grid for smooth depth perception
    const subGrid = this.add.grid(cx, cy, this.arenaWidth, this.arenaHeight, 48, 48, 0xf1f5f9, 1, 0xe2e8f0, 0.7);
    subGrid.setDepth(1);
    const majorGrid = this.add.grid(cx, cy, this.arenaWidth, this.arenaHeight, 192, 192, 0xf1f5f9, 0, 0xcbd5e1, 0.85);
    majorGrid.setDepth(1);

    // Center Arena Cyber Dais & Concentric Cultural Rings
    const daisGfx = this.add.graphics();
    daisGfx.setDepth(2);
    // Outer concentric rings
    daisGfx.lineStyle(2, 0x0284c7, 0.35);
    daisGfx.strokeCircle(cx, cy, 320);
    daisGfx.lineStyle(2, 0x38bdf8, 0.5);
    daisGfx.strokeCircle(cx, cy, 200);
    daisGfx.lineStyle(2.5, 0x0284c7, 0.7);
    daisGfx.strokeCircle(cx, cy, 100);
    // Center glow disc
    daisGfx.fillStyle(0x0284c7, 0.04);
    daisGfx.fillCircle(cx, cy, 100);
    // Center crosshair markings
    daisGfx.lineStyle(1.5, 0x0369a1, 0.6);
    daisGfx.lineBetween(cx - 120, cy, cx + 120, cy);
    daisGfx.lineBetween(cx, cy - 120, cx, cy + 120);

    // Arena Perimeter & Corner Tech Brackets
    const borderGfx = this.add.graphics();
    borderGfx.setDepth(3);
    // Outer neon barrier
    borderGfx.lineStyle(4, 0x0284c7, 0.85);
    borderGfx.strokeRect(6, 6, this.arenaWidth - 12, this.arenaHeight - 12);
    borderGfx.lineStyle(1.5, 0x38bdf8, 0.5);
    borderGfx.strokeRect(14, 14, this.arenaWidth - 28, this.arenaHeight - 28);

    // Corner tech brackets
    const bracketSize = 48;
    const corners = [
      { x: 14, y: 14, dx: 1, dy: 1 },
      { x: this.arenaWidth - 14, y: 14, dx: -1, dy: 1 },
      { x: 14, y: this.arenaHeight - 14, dx: 1, dy: -1 },
      { x: this.arenaWidth - 14, y: this.arenaHeight - 14, dx: -1, dy: -1 },
    ];
    borderGfx.lineStyle(3.5, 0x0369a1, 1);
    corners.forEach(c => {
      borderGfx.beginPath();
      borderGfx.moveTo(c.x, c.y + c.dy * bracketSize);
      borderGfx.lineTo(c.x, c.y);
      borderGfx.lineTo(c.x + c.dx * bracketSize, c.y);
      borderGfx.strokePath();
    });

    // Ambient floating atmospheric particles
    for (let i = 0; i < 28; i++) {
      const rx = Phaser.Math.Between(40, this.arenaWidth - 40);
      const ry = Phaser.Math.Between(40, this.arenaHeight - 40);
      const mote = this.add.circle(rx, ry, Phaser.Math.Between(1.5, 3), 0x38bdf8, Phaser.Math.FloatBetween(0.15, 0.4));
      mote.setDepth(3);
      this.tweens.add({
        targets: mote,
        x: rx + Phaser.Math.Between(-40, 40),
        y: ry + Phaser.Math.Between(-40, 40),
        alpha: { from: 0.1, to: 0.45 },
        duration: Phaser.Math.Between(3500, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

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
    this.enemyManager.weaponSystem = this.weaponSystem;
    this.communityMeter = new CommunityMeterManager(this, this.player);
    this.player.communityMeter = this.communityMeter;
    this.enemyManager.communityMeter = this.communityMeter;
    this.waveManager = new WaveManager(this.enemyManager);

    this.upgradeManager = new UpgradeManager(this, this.player, this.communityMeter, () => {
      this.resumeCombat();
    });

    this.scenarioManager = new ScenarioEventManager(
      this,
      this.player,
      this.communityMeter,
      this.enemyManager,
      this.xpManager,
      () => {
        this.resumeCombat();
      }
    );

    this.evolutionManager = new EvolutionManager(
      this,
      this.player,
      this.weaponSystem,
      this.enemyManager,
      this.communityMeter
    );

    this.bossManager = new BossManager(
      this,
      this.player,
      this.enemyManager,
      this.communityMeter,
      this.xpManager,
      (isFinal: boolean) => {
        this.onBossDefeated(isFinal);
      }
    );

    // 5. Fixed HUD on camera
    this.hud = new HUD(this, this.player, this.communityMeter, () => {
      this.toggleGuide();
    });

    // Keyboard shortcut 'H' to toggle Help guide anytime
    this.input.keyboard?.on('keydown-H', () => {
      this.toggleGuide();
    });

    // 6. Virtual Joystick for Mobile/Touch
    this.setupVirtualJoystick();

    // 7. Opening intro guide (Only once on very first launch)
    this.checkOpeningIntro();
  }

  public toggleGuide(): void {
    if (this.isIntroOpen) {
      if (this.closeIntroCallback) this.closeIntroCallback();
    } else {
      this.checkOpeningIntro(true);
    }
  }

  public checkOpeningIntro(forceShow: boolean = false): void {
    if (this.isIntroOpen) {
      if (this.closeIntroCallback) this.closeIntroCallback();
      return;
    }

    if (!forceShow) {
      const introDone = localStorage.getItem('vanhoa404_intro_done');
      if (introDone) return;
    }

    this.isIntroOpen = true;
    this.pauseCombat();
    const { width, height } = this.scale;

    const introContainer = this.add.container(0, 0);
    introContainer.setDepth(120);
    introContainer.setScrollFactor(0); // PIN TO SCREEN

    // Soft dim backdrop
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a, 0.45);
    introContainer.add(bg);

    // Dialog Window
    const winW = 750;
    const winH = 500;
    const winBg = this.add.rectangle(width / 2, height / 2, winW, winH, 0xffffff, 0.98);
    winBg.setStrokeStyle(2, 0x0284c7);
    introContainer.add(winBg);

    // Close 'X' Button at top-right
    const closeX = width / 2 + winW / 2 - 32;
    const closeY = height / 2 - winH / 2 + 30;
    const closeBtnBg = this.add.circle(closeX, closeY, 16, 0xfee2e2);
    closeBtnBg.setStrokeStyle(1.5, 0xef4444);
    closeBtnBg.setInteractive({ useHandCursor: true });
    closeBtnBg.on('pointerover', () => closeBtnBg.setFillStyle(0xfecaca));
    closeBtnBg.on('pointerout', () => closeBtnBg.setFillStyle(0xfee2e2));

    const closeBtnText = this.add.text(closeX, closeY, '✕', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#dc2626',
      resolution: 2,
    }).setOrigin(0.5);

    // Badge
    const badgeBg = this.add.rectangle(width / 2, height / 2 - winH / 2 + 28, 300, 24, 0xe0f2fe, 1);
    badgeBg.setStrokeStyle(1, 0xbae6fd);
    const badgeText = this.add.text(width / 2, height / 2 - winH / 2 + 28, '🛡️ CẨM NANG VĂN HÓA 404', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#0369a1',
      resolution: 2,
    }).setOrigin(0.5);

    // Title
    const title = this.add.text(width / 2, height / 2 - winH / 2 + 58, 'BẢNG HƯỚNG DẪN & TRA CỨU CHIẾN THUẬT', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#0f172a',
      resolution: 2,
    }).setOrigin(0.5);

    introContainer.add([badgeBg, badgeText, title, closeBtnBg, closeBtnText]);

    // 3 Navigation Tabs
    const tabY = height / 2 - winH / 2 + 96;
    const tabConfigs = [
      { id: 1, label: '[1] Cơ Chế & Điều Khiển', w: 215 },
      { id: 2, label: '[2] 8 Trụ Cột & Tiến Hóa', w: 220 },
      { id: 3, label: '[3] Cột Mốc Trùm & Mẹo', w: 225 },
    ];

    let currentTab = 1;
    const tabButtons: { bg: Phaser.GameObjects.Rectangle; txt: Phaser.GameObjects.Text; id: number }[] = [];
    const contentContainer = this.add.container(0, 0);
    introContainer.add(contentContainer);

    let startX = width / 2 - (215 + 220 + 225 + 20) / 2;
    tabConfigs.forEach(tab => {
      const tabCenterX = startX + tab.w / 2;
      const tabBg = this.add.rectangle(tabCenterX, tabY, tab.w, 32, 0xf1f5f9, 1);
      tabBg.setStrokeStyle(1.5, 0xcbd5e1);
      tabBg.setInteractive({ useHandCursor: true });

      const tabTxt = this.add.text(tabCenterX, tabY, tab.label, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#475569',
        resolution: 2,
      }).setOrigin(0.5);

      introContainer.add([tabBg, tabTxt]);
      tabButtons.push({ bg: tabBg, txt: tabTxt, id: tab.id });

      tabBg.on('pointerdown', () => switchTab(tab.id));
      startX += tab.w + 10;
    });

    const renderTabContent = (tabId: number) => {
      contentContainer.removeAll(true);

      // Update tab active visual state
      tabButtons.forEach(btn => {
        if (btn.id === tabId) {
          btn.bg.setFillStyle(0x0284c7, 1);
          btn.bg.setStrokeStyle(1.5, 0x0369a1);
          btn.txt.setColor('#ffffff');
        } else {
          btn.bg.setFillStyle(0xf8fafc, 1);
          btn.bg.setStrokeStyle(1.5, 0xcbd5e1);
          btn.txt.setColor('#475569');
        }
      });

      if (tabId === 1) {
        // Tab 1: Cơ Chế & Điều Khiển
        const items = [
          { icon: '🕹️', title: 'Di chuyển', desc: 'Dùng WASD / Phím mũi tên, hoặc chạm kéo cần ảo trên màn hình.' },
          { icon: '⚡', title: 'Tự động bắn', desc: 'Nhân vật tự động tìm và khai hỏa vào quái gần nhất trong tầm bắn.' },
          { icon: '⭐', title: 'Nhặt ngọc & Lên cấp', desc: 'Hạ quái nhặt hạt XP để thăng cấp (công thức XP lũy tiến) và chọn 1 trong 3 thẻ bài nâng cấp.' },
          { icon: '🌐', title: 'Môi Trường Văn Hóa', desc: 'Thanh Community Meter phản ánh sức khỏe không gian số. Tránh để về 0% (bị phạt -25% sức mạnh).' },
          { icon: '✨', title: 'Tình huống số & Buff 30s', desc: 'Bài đăng mạng xã hội xuất hiện ngẫu nhiên. Chọn giải pháp chuẩn xác nhận Buff hào quang kéo dài 30 giây!' },
        ];

        items.forEach((item, idx) => {
          const cy = height / 2 - winH / 2 + 150 + idx * 56;
          const row = this.add.rectangle(width / 2, cy, winW - 60, 48, 0xf8fafc, 1);
          row.setStrokeStyle(1, 0xe2e8f0);

          const ic = this.add.text(width / 2 - (winW - 60) / 2 + 25, cy, item.icon, { fontSize: '19px', resolution: 2 }).setOrigin(0.5);
          const t = this.add.text(width / 2 - (winW - 60) / 2 + 55, cy, item.title + ':', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#0f172a',
            resolution: 2,
          }).setOrigin(0, 0.5);
          const d = this.add.text(width / 2 - (winW - 60) / 2 + 215, cy, item.desc, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            color: '#475569',
            wordWrap: { width: winW - 300 },
            resolution: 2,
          }).setOrigin(0, 0.5);

          contentContainer.add([row, ic, t, d]);
        });
      } else if (tabId === 2) {
        // Tab 2: 8 Trụ Cột & Tiến Hóa
        const pY = height / 2 - winH / 2 + 185;
        const pBox = this.add.rectangle(width / 2, pY, winW - 60, 115, 0xf8fafc, 1);
        pBox.setStrokeStyle(1, 0xe2e8f0);

        const pHeader = this.add.text(width / 2, pY - 42, '🏛️ HỆ THỐNG 8 TRỤ CỘT GIÁ TRỊ VĂN HÓA', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#0369a1',
          resolution: 2,
        }).setOrigin(0.5);

        const pCol1 = this.add.text(width / 2 - 310, pY - 22,
          '• Khoa Học: +Tốc bắn & Tỉ lệ bạo kích\n• Dân Tộc: +Khiên chắn phòng ngự\n• Đại Chúng: +Tầm nhặt ngọc & Hào quang\n• Chân: +Sát thương đạn chuẩn xác',
          { fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#1e293b', lineSpacing: 5, resolution: 2 }
        );

        const pCol2 = this.add.text(width / 2 + 25, pY - 22,
          '• Thiện: Tự động hồi phục máu định kỳ\n• Mỹ: +Sát thương diện rộng (AoE)\n• Xây: Hồi Môi Trường Văn Hóa & Tốc chạy\n• Chống: +Tia đạn bổ sung & Đẩy lùi quái',
          { fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#1e293b', lineSpacing: 5, resolution: 2 }
        );

        // Box 2: 4 Evolutions
        const eY = height / 2 - winH / 2 + 325;
        const eBox = this.add.rectangle(width / 2, eY, winW - 60, 140, 0xf0fdf4, 1);
        eBox.setStrokeStyle(1.5, 0x86efac);

        const eHeader = this.add.text(width / 2, eY - 54, '🧬 4 CÔNG THỨC TIẾN HÓA KỸ NĂNG ĐỈNH CAO', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#15803d',
          resolution: 2,
        }).setOrigin(0.5);

        const evos = [
          '⚡ Kiểm Chứng (Khoa Học + Chân): Đạn xuyên thấu mọi mục tiêu, +50% sát thương lên Tin Giả.',
          '🌿 Văn Hóa Ứng Xử (Đại Chúng + Thiện): Hào quang diện rộng làm chậm quái 30% và liên tục hồi máu.',
          '🎨 Bản Sắc Sáng Tạo (Dân Tộc + Mỹ): Sóng xung kích đẩy lùi và đánh tan nội dung sao chép đạo nhái.',
          '🛡️ Phòng Vệ Đa Tầng (Xây + Chống): Lá chắn năng lượng kiên cố, giảm 20% mọi sát thương nhận vào.',
        ];

        const evoTxt = this.add.text(width / 2 - 310, eY - 34, evos.join('\n'), {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '11px',
          color: '#166534',
          lineSpacing: 8,
          resolution: 2,
        });

        contentContainer.add([pBox, pHeader, pCol1, pCol2, eBox, eHeader, evoTxt]);
      } else {
        // Tab 3: Cột Mốc Trùm & Mẹo Vượt Ải
        const bosses = [
          { time: 'Phút 03:00', tier: 'Trùm Cấp 1', desc: 'Thử thách cơ động & nhặt ngọc. Hãy nâng tốc chạy và giữ cự ly an toàn.' },
          { time: 'Phút 05:00', tier: 'Trùm Cấp 2', desc: 'Thử thách đạn xuyên thấu hoặc hồi phục trước bầy quái tí hon / vùng độc.' },
          { time: 'Phút 07:00', tier: 'Trùm Cấp 3', desc: 'Thử thách bạo kích & chỉ số Chống để phá vỡ Khiên Ảo Ảnh phân thân.' },
          { time: 'Phút 10:00', tier: 'Trùm Cực Đại', desc: 'Siêu Trùm Hỗn Loạn 3 giai đoạn bão đạn. Cần phát triển cân bằng cả 8 giá trị!' },
        ];

        bosses.forEach((b, idx) => {
          const cy = height / 2 - winH / 2 + 155 + idx * 54;
          const row = this.add.rectangle(width / 2, cy, winW - 60, 46, 0xfef2f2, 1);
          row.setStrokeStyle(1, 0xfecaca);

          const timeTxt = this.add.text(width / 2 - (winW - 60) / 2 + 25, cy, `⏱️ ${b.time}`, {
            fontFamily: 'monospace',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#b91c1c',
            resolution: 2,
          }).setOrigin(0, 0.5);

          const tierTxt = this.add.text(width / 2 - (winW - 60) / 2 + 130, cy, `[${b.tier}]:`, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#991b1b',
            resolution: 2,
          }).setOrigin(0, 0.5);

          const descTxt = this.add.text(width / 2 - (winW - 60) / 2 + 225, cy, b.desc, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            color: '#475569',
            wordWrap: { width: winW - 320 },
            resolution: 2,
          }).setOrigin(0, 0.5);

          contentContainer.add([row, timeTxt, tierTxt, descTxt]);
        });

        const tipY = height / 2 - winH / 2 + 375;
        const tipBox = this.add.rectangle(width / 2, tipY, winW - 60, 48, 0xfffbeb, 1);
        tipBox.setStrokeStyle(1, 0xfde68a);

        const tipTxt = this.add.text(width / 2, tipY,
          '💡 MẸO CHIẾN THUẬT: Đừng bỏ lỡ các Tình huống số để lấy Buff 30s trước khi Trùm xuất hiện!\nPhát triển đồng đều giữa "Xây" (hồi máu, tốc độ) và "Chống" (thêm đạn, đẩy lùi) là chìa khóa chiến thắng.',
          {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#92400e',
            align: 'center',
            lineSpacing: 3,
            resolution: 2,
          }
        ).setOrigin(0.5);

        contentContainer.add([tipBox, tipTxt]);
      }
    };

    const switchTab = (tabId: number) => {
      currentTab = tabId;
      renderTabContent(currentTab);
    };

    renderTabContent(currentTab);

    // Close / Start Button at bottom
    const btnY = height / 2 + winH / 2 - 34;
    const btnBg = this.add.rectangle(width / 2, btnY, 320, 42, 0x0284c7);
    btnBg.setStrokeStyle(1.5, 0x0369a1);
    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on('pointerover', () => btnBg.setFillStyle(0x0369a1));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x0284c7));

    const btnText = this.add.text(width / 2, btnY, 'ĐÓNG & TIẾP TỤC (ESC / H / SPACE)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    introContainer.add([btnBg, btnText]);

    let isIntroClosed = false;
    const closeIntro = () => {
      if (isIntroClosed) return;
      isIntroClosed = true;
      this.isIntroOpen = false;
      this.closeIntroCallback = undefined;

      try {
        localStorage.setItem('vanhoa404_intro_done', 'true');
      } catch {}

      // Remove input listeners
      this.input.off('pointerdown', onScreenPointerDown);
      this.input.keyboard?.off('keydown-SPACE', closeIntro);
      this.input.keyboard?.off('keydown-ENTER', closeIntro);
      this.input.keyboard?.off('keydown-ESC', closeIntro);
      this.input.keyboard?.off('keydown-H', closeIntro);
      this.input.keyboard?.off('keydown-ONE', onKey1);
      this.input.keyboard?.off('keydown-TWO', onKey2);
      this.input.keyboard?.off('keydown-THREE', onKey3);

      SoundSystem.playGem();
      introContainer.destroy();
      this.resumeCombat();
    };

    this.closeIntroCallback = closeIntro;

    // Keys 1, 2, 3 switch tabs
    const onKey1 = () => switchTab(1);
    const onKey2 = () => switchTab(2);
    const onKey3 = () => switchTab(3);

    this.input.keyboard?.on('keydown-ONE', onKey1);
    this.input.keyboard?.on('keydown-TWO', onKey2);
    this.input.keyboard?.on('keydown-THREE', onKey3);

    // Screen-space pointer listener (Guaranteed to work regardless of camera scroll)
    const onScreenPointerDown = (pointer: Phaser.Input.Pointer) => {
      // 1. Clicked start/close button
      if (Math.abs(pointer.x - width / 2) < 160 && Math.abs(pointer.y - btnY) < 24) {
        closeIntro();
        return;
      }
      // 2. Clicked 'X' close button
      if (Math.abs(pointer.x - closeX) < 24 && Math.abs(pointer.y - closeY) < 24) {
        closeIntro();
        return;
      }
      // 3. Clicked outside modal (dimmed background)
      if (
        pointer.x < width / 2 - winW / 2 ||
        pointer.x > width / 2 + winW / 2 ||
        pointer.y < height / 2 - winH / 2 ||
        pointer.y > height / 2 + winH / 2
      ) {
        closeIntro();
        return;
      }
    };

    this.input.on('pointerdown', onScreenPointerDown);

    this.input.keyboard?.once('keydown-SPACE', closeIntro);
    this.input.keyboard?.once('keydown-ENTER', closeIntro);
    this.input.keyboard?.once('keydown-ESC', closeIntro);
    this.input.keyboard?.once('keydown-H', closeIntro);
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
    this.enemyManager.update(dt, this.runSeconds);
    this.weaponSystem.update(dt, activeEnemies);
    this.xpManager.update(dt);

    // 2. Bullets collision check with enemies & boss
    const bullets = this.weaponSystem.projectiles.getChildren() as Projectile[];
    const fightBonus = this.player.stats.fightPower > 0 ? this.player.stats.fightPower * 0.015 : 0;
    for (const b of bullets) {
      if (b.active) {
        this.enemyManager.handleBulletHits(b);

        // Check boss, clones, and swarm minion hits
        if (this.bossManager.isBossActive && b.active) {
          this.bossManager.handleBulletHits(b, fightBonus);
        }
      }
    }

    // 3. Systems update
    this.waveManager.update(this.runSeconds, dt);
    this.communityMeter.update(dt, activeEnemies.length, this.bossManager.isBossActive);
    this.evolutionManager.checkEvolutions();

    // 4. Boss logic & timeline checks (3m, 5m, 7m, 10m)
    this.bossManager.checkTimeline(this.runSeconds);
    if (this.bossManager.isBossActive) {
      this.bossManager.update(dt);
    }

    // 5. Check Scenario Events triggers & update 30s buff countdown
    this.scenarioManager.update(dt);
    const triggered = this.scenarioManager.checkTriggers(this.runSeconds);
    if (triggered) {
      this.pauseCombat();
    }

    // 6. Update HUD
    const currentWave = this.waveManager.getCurrentWave(this.runSeconds);
    this.hud.update(
      this.runSeconds,
      this.enemyManager.totalKills,
      currentWave,
      this.scenarioManager.activeBuffText
    );
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

    // Clean up in-flight projectiles so they do not freeze in mid-air or get stuck
    this.weaponSystem.clearAllProjectiles();
    this.enemyManager.clearEnemyBullets();
    this.bossManager.pauseBossPhysics();
  }

  private resumeCombat(): void {
    this.isPaused = false;
    // Instantly ready weapon to fire fresh shots upon resuming
    this.weaponSystem.readyToFire();
  }

  private onBossDefeated(isFinal: boolean): void {
    if (isFinal) {
      this.onGameOver(true);
    }
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
        killedBy: isVictory ? undefined : this.player.lastDamagedBy,
        buildPower: this.player.stats.buildPower,
        fightPower: this.player.stats.fightPower,
      });
    });
  }

  public shutdown(): void {
    this.hud.destroy();
  }
}
