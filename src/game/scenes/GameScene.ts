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
import { PhenomenonToast } from '../../ui/PhenomenonToast';
import { PauseMenu } from '../../ui/PauseMenu';
import { MilestoneCard } from '../../ui/MilestoneCard';
import { Projectile } from '../entities/Projectile';
import { SoundSystem } from '../systems/SoundSystem';
import { DamageNumberSystem } from '../systems/DamageNumberSystem';
import { CharacterClassConfig } from '../types/data';
import { DataLoader } from '../../data/loader';
import { GameResultData } from './ResultScene';

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
  private pauseMenu!: PauseMenu;
  private milestoneCard!: MilestoneCard;
  private classConfig!: CharacterClassConfig;

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

  init(data?: { classConfig?: CharacterClassConfig }): void {
    this.classConfig = data?.classConfig || DataLoader.getClasses()[0];
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
    this.player = new Player(this, this.arenaWidth / 2, this.arenaHeight / 2, this.classConfig);

    // 3. Camera setup following player
    this.cameras.main.setBounds(0, 0, this.arenaWidth, this.arenaHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 4. Managers
    this.xpManager = new XPManager(this, this.player, (_newLevel) => {
      this.onLevelUp();
    });

    this.enemyManager = new EnemyManager(this, this.player, this.xpManager);
    this.enemyManager.phenomenonToast = new PhenomenonToast(this);
    this.weaponSystem = new WeaponSystem(this, this.player);
    this.enemyManager.weaponSystem = this.weaponSystem;
    this.weaponSystem.enemyManager = this.enemyManager;
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
    this.weaponSystem.bossManager = this.bossManager;

    // 5. Fixed HUD on camera
    this.hud = new HUD(this, this.player, this.communityMeter, () => {
      this.toggleGuide();
    }, () => {
      this.togglePause();
    });

    // Keyboard shortcut 'H' to toggle Help guide anytime
    this.input.keyboard?.on('keydown-H', () => {
      this.toggleGuide();
    });

    // ESC: pause screen with detailed stats. Registered before the opening guide so that, while the
    // guide is open, this listener runs first and sees isIntroOpen (the guide's own ESC closes it).
    this.milestoneCard = new MilestoneCard(this);
    this.pauseMenu = new PauseMenu(this, this.player, this.communityMeter, () => this.togglePause());
    this.input.keyboard?.on('keydown-ESC', () => {
      this.togglePause();
    });

    // 6. Virtual Joystick for Mobile/Touch
    this.setupVirtualJoystick();

    // 7. Opening intro guide (Only once on very first launch)
    this.checkOpeningIntro();
  }

  public togglePause(): void {
    if (this.pauseMenu.isOpen) {
      this.pauseMenu.hide();
      this.resumeCombat();
      return;
    }
    // Only pause from live combat: not over the guide, a level-up, a scenario or the game-over fade
    if (this.isPaused || this.isIntroOpen) return;
    this.pauseCombat();
    const wave = this.waveManager.getCurrentWave(this.runSeconds);
    this.pauseMenu.show({
      runSeconds: this.runSeconds,
      kills: this.enemyManager.totalKills,
      waveLabel: wave ? `Làn sóng ${wave.id.replace(/\D/g, '') || '?'}` : 'Làn sóng cuối',
      comboNames: this.evolutionManager.getActiveComboList().map(c => c.name),
      buffText: this.scenarioManager.activeBuffText,
    });
  }

  public toggleGuide(): void {
    // Another overlay (level-up, scenario, history card, game over) owns the pause: closing the guide
    // would resume combat underneath it, so the guide waits
    if (this.isPaused && !this.isIntroOpen && !this.pauseMenu?.isOpen) return;
    // Opening the guide from the pause screen swaps one overlay for the other
    if (this.pauseMenu?.isOpen) {
      this.pauseMenu.hide();
      this.resumeCombat();
    }
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

    // Dialog Window (Spacious 960x590 layout on 1280x720 canvas)
    const winW = 960;
    const winH = 590;
    const topY = height / 2 - winH / 2;
    const bottomY = height / 2 + winH / 2;

    const winBg = this.add.rectangle(width / 2, height / 2, winW, winH, 0xffffff, 0.98);
    winBg.setStrokeStyle(2, 0x0284c7);
    introContainer.add(winBg);

    // Close 'X' Button at top-right
    const closeX = width / 2 + winW / 2 - 32;
    const closeY = topY + 28;
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
    const badgeBg = this.add.rectangle(width / 2, topY + 26, 280, 22, 0xe0f2fe, 1);
    badgeBg.setStrokeStyle(1, 0xbae6fd);
    const badgeText = this.add.text(width / 2, topY + 26, '🛡️ CẨM NANG VĂN HÓA 404', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#0369a1',
      resolution: 2,
    }).setOrigin(0.5);

    // Title
    const title = this.add.text(width / 2, topY + 54, 'BẢNG HƯỚNG DẪN & TRA CỨU CHIẾN THUẬT', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#0f172a',
      resolution: 2,
    }).setOrigin(0.5);

    introContainer.add([badgeBg, badgeText, title, closeBtnBg, closeBtnText]);

    // 3 Navigation Tabs
    const tabY = topY + 92;
    const tabConfigs = [
      { id: 1, label: '[1] Cơ Chế & Điều Khiển', w: 260 },
      { id: 2, label: '[2] 8 Trụ Cột & Tiến Hóa', w: 260 },
      { id: 3, label: '[3] Cột Mốc Trùm & Mẹo', w: 260 },
    ];

    let currentTab = 1;
    const tabButtons: { bg: Phaser.GameObjects.Rectangle; txt: Phaser.GameObjects.Text; id: number; centerX: number; w: number }[] = [];
    const contentContainer = this.add.container(0, 0);
    introContainer.add(contentContainer);

    const totalTabsW = tabConfigs.reduce((acc, t) => acc + t.w, 0) + (tabConfigs.length - 1) * 14;
    let startX = width / 2 - totalTabsW / 2;
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
      tabButtons.push({ bg: tabBg, txt: tabTxt, id: tab.id, centerX: tabCenterX, w: tab.w });

      tabBg.on('pointerdown', () => switchTab(tab.id));
      startX += tab.w + 14;
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
        // Tab 1: Cơ Chế & Điều Khiển (Spacious 2-line layout per item)
        const items = [
          {
            icon: '🕹️',
            title: 'Di chuyển: Phím W, A, S, D',
            desc: 'Dùng cụm phím W-A-S-D để điều hướng nhân vật (hoặc chạm kéo cần ảo trên màn hình cảm ứng).',
          },
          {
            icon: '🎯',
            title: 'Ngắm bắn: Phím Mũi tên (Thủ công) / Tự động ngắm (Mặc định)',
            desc: 'Bấm các phím Mũi tên để xả đạn theo hướng chỉ định. Thả tay sẽ TỰ ĐỘNG ngắm mục tiêu (quái hoặc trùm) gần nhất.',
          },
          {
            icon: '⭐',
            title: 'Thu thập Hạt Kinh Nghiệm & Lên cấp',
            desc: 'Hạ thực thể tiêu cực để nhặt hạt XP, thăng cấp (công thức lũy tiến) và mở khóa 1 trong 3 thẻ bài nâng cấp sức mạnh.',
          },
          {
            icon: '🌐',
            title: 'Môi Trường Văn Hóa (Community Meter)',
            desc: 'Thanh phản ánh sức khỏe không gian mạng. Đừng để về 0% (áp dụng phạt suy yếu -25% sức mạnh toàn diện cho tới khi hồi phục).',
          },
          {
            icon: '✨',
            title: 'Tình huống Số & Hào quang Buff 30 giây',
            desc: 'Bài đăng mạng xã hội xuất hiện ngẫu nhiên. Chọn giải pháp chuẩn xác để kích hoạt Buff hào quang cực mạnh kéo dài 30 giây!',
          },
        ];

        items.forEach((item, idx) => {
          const cy = topY + 152 + idx * 64;
          const rowLeft = width / 2 - (winW - 60) / 2;
          const row = this.add.rectangle(width / 2, cy, winW - 60, 56, 0xf8fafc, 1);
          row.setStrokeStyle(1, 0xe2e8f0);

          // Icon in circular badge
          const icBg = this.add.circle(rowLeft + 36, cy, 18, 0xe0f2fe, 1);
          icBg.setStrokeStyle(1, 0xbae6fd);
          const ic = this.add.text(rowLeft + 36, cy, item.icon, { fontSize: '18px', resolution: 2 }).setOrigin(0.5);

          // Title on upper line
          const t = this.add.text(rowLeft + 68, cy - 10, item.title, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#0f172a',
            resolution: 2,
          }).setOrigin(0, 0.5);

          // Description on lower line (No collision possible)
          const d = this.add.text(rowLeft + 68, cy + 11, item.desc, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            color: '#475569',
            wordWrap: { width: 810 },
            resolution: 2,
          }).setOrigin(0, 0.5);

          contentContainer.add([row, icBg, ic, t, d]);
        });
      } else if (tabId === 2) {
        // Tab 2: Cẩm Nang Vai Trò, 8 Trụ Cột & 4 Cộng Hưởng Giá Trị (Live Status Tracker)
        // 1. Current Class Banner Card
        const classY = topY + 152;
        const classBox = this.add.rectangle(width / 2, classY, winW - 60, 66, 0xffffff, 1);
        classBox.setStrokeStyle(1.5, this.classConfig.themeColor || 0x0284c7);

        const classIconCircle = this.add.circle(width / 2 - (winW - 60) / 2 + 32, classY, 18, this.classConfig.themeColor || 0x0284c7, 0.15);
        classIconCircle.setStrokeStyle(1.5, this.classConfig.themeColor || 0x0284c7);
        const classIconTxt = this.add.text(width / 2 - (winW - 60) / 2 + 32, classY, this.classConfig.badgeIcon || '🔍', { fontSize: '18px', resolution: 2 }).setOrigin(0.5);

        const classTitleTxt = this.add.text(width / 2 - (winW - 60) / 2 + 60, classY - 19,
          `🏛️ VAI TRÒ ĐANG CHỌN: ${this.classConfig.name.toUpperCase()} — ${this.classConfig.title.toUpperCase()}`,
          { fontFamily: 'system-ui, sans-serif', fontSize: '12px', fontStyle: 'bold', color: this.classConfig.themeHex || '#0284c7', resolution: 2 }
        ).setOrigin(0, 0.5);

        // Passive descriptions are long: wrap inside the card instead of running past its edge
        const classSubTxt = this.add.text(width / 2 - (winW - 60) / 2 + 60, classY + 8,
          `• Vũ khí: ${this.classConfig.startingWeaponName}  |  • Nội tại: ${this.classConfig.passive.name} (${this.classConfig.passive.description})`,
          { fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#475569', wordWrap: { width: winW - 60 - 80 }, lineSpacing: 2, resolution: 2 }
        ).setOrigin(0, 0.5);

        contentContainer.add([classBox, classIconCircle, classIconTxt, classTitleTxt, classSubTxt]);

        // 2. 8 Cultural Pillars Live Level Tracker
        const pY = topY + 238;
        const pBox = this.add.rectangle(width / 2, pY, winW - 60, 94, 0xf8fafc, 1);
        pBox.setStrokeStyle(1.5, 0xcbd5e1);

        const pHeader = this.add.text(width / 2, pY - 34, '🏛️ 8 TRỤ CỘT (TỐI ĐA CẤP 5) — CHÂN · THIỆN · MỸ ĐỨNG TRÊN NỀN KHOA HỌC · ĐẠI CHÚNG · DÂN TỘC, CHỈ VƯỢT NỀN 1 CẤP', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '11.5px',
          fontStyle: 'bold',
          color: '#0369a1',
          resolution: 2,
        }).setOrigin(0.5);

        contentContainer.add([pBox, pHeader]);

        const v = this.player.values;
        const pillarData = [
          { name: 'Dân Tộc', lv: v.danToc || 0, icon: '🇻🇳', x: width / 2 - 338, y: pY - 10 },
          { name: 'Khoa Học', lv: v.khoaHoc || 0, icon: '🔬', x: width / 2 - 112, y: pY - 10 },
          { name: 'Đại Chúng', lv: v.daiChung || 0, icon: '👥', x: width / 2 + 112, y: pY - 10 },
          { name: 'Chân', lv: v.chan || 0, icon: '🎯', x: width / 2 + 338, y: pY - 10, cap: this.player.pillarCap('chan'), core: 'Khoa Học' },
          { name: 'Thiện', lv: v.thien || 0, icon: '❤️', x: width / 2 - 338, y: pY + 24, cap: this.player.pillarCap('thien'), core: 'Đại Chúng' },
          { name: 'Mỹ', lv: v.my || 0, icon: '🎨', x: width / 2 - 112, y: pY + 24, cap: this.player.pillarCap('my'), core: 'Dân Tộc' },
          { name: 'Xây', lv: v.build || 0, icon: '🏗️', x: width / 2 + 112, y: pY + 24 },
          { name: 'Chống', lv: v.fight || 0, icon: '🛡️', x: width / 2 + 338, y: pY + 24 },
        ];

        pillarData.forEach(p => {
          const isSynergyReady = p.lv >= 4;
          const isMaxed = p.lv >= 5;
          const chipBg = this.add.rectangle(p.x, p.y, 214, 28, isMaxed ? 0xfef9c3 : isSynergyReady ? 0xdcfce7 : 0xffffff, 1);
          chipBg.setStrokeStyle(1, isMaxed ? 0xfacc15 : isSynergyReady ? 0x86efac : 0xe2e8f0);

          // Values held at their foundation say which core pillar to raise
          const isHeld = 'cap' in p && !isMaxed && p.lv >= (p.cap ?? 5);
          const statusStr = isMaxed ? '★ MAX 5/5' : isHeld ? `🔒 ${p.lv}/5, chờ ${p.core}` : isSynergyReady ? `✓ Cấp ${p.lv}/5` : `Cấp ${p.lv}/5`;
          const chipTxt = this.add.text(p.x, p.y, `${p.icon} ${p.name}: ${statusStr}`, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: isMaxed ? '#854d0e' : isSynergyReady ? '#15803d' : '#334155',
            resolution: 2,
          }).setOrigin(0.5);

          contentContainer.add([chipBg, chipTxt]);
        });

        // 3. 4 Value Combos Live Tracker (2x2 Grid)
        const eY = topY + 396;
        const eBox = this.add.rectangle(width / 2, eY + 8, winW - 60, 200, 0xf5f3ff, 1);
        eBox.setStrokeStyle(1.5, 0xc4b5fd);

        const eHeader = this.add.text(width / 2, eY - 78, '🧬 5 CÔNG THỨC CỘNG HƯỞNG GIÁ TRỊ VĂN HÓA (ĐẠT CẤP YÊU CẦU Ở CẢ 2 TRỤ CỘT ĐỂ MỞ KHÓA)', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#6d28d9',
          resolution: 2,
        }).setOrigin(0.5);

        contentContainer.add([eBox, eHeader]);

        const comboLiveList = [
          {
            id: 'kiemChung',
            title: '⚡ Kiểm Chứng (Khoa Học + Chân)',
            req1: `Khoa Học: ${v.khoaHoc || 0}/4`,
            req2: `Chân: ${v.chan || 0}/4`,
            desc: 'Riêng Kiểm Chứng: đạn xuyên thấu, +50% sát thương lên Tin Giả.',
            classOnly: 'nguoiKiemChung',
            x: width / 2 - 222,
            y: eY - 40,
          },
          {
            id: 'khienThongTin',
            title: '🛡️ Khiên Thông Tin (Chân + Thiện)',
            req1: `Chân: ${v.chan || 0}/4`,
            req2: `Thiện: ${v.thien || 0}/4`,
            desc: '3 cổ vật quay quanh chắn đạn và gây sát thương va chạm liên tục.',
            x: width / 2 + 222,
            y: eY - 40,
          },
          {
            id: 'vanHoaUngXu',
            title: '🌿 Văn Hóa Ứng Xử (Đại Chúng + Thiện)',
            req1: `Đại Chúng: ${v.daiChung || 0}/4`,
            req2: `Thiện: ${v.thien || 0}/4`,
            desc: 'Hào quang làm chậm quái 35%, hồi phục HP và phục hồi môi trường.',
            x: width / 2 - 222,
            y: eY + 18,
          },
          {
            id: 'banSacSangTao',
            title: '🎨 Bản Sắc Sáng Tạo (Dân Tộc + Mỹ)',
            req1: `Dân Tộc: ${v.danToc || 0}/4`,
            req2: `Mỹ: ${v.my || 0}/4`,
            desc: 'Sóng xung kích đẩy lùi định kỳ và tăng 35% sát thương gốc toàn diện.',
            x: width / 2 + 222,
            y: eY + 18,
          },
          {
            id: 'matTranVanHoa',
            title: '⚔️ Mặt Trận Văn Hóa (Xây + Chống)',
            req1: `Xây: ${v.build || 0}/3`,
            req2: `Chống: ${v.fight || 0}/3`,
            desc: 'Xây đi đôi với Chống: +30% sát thương, hồi 25% Môi Trường. “Văn hóa là một mặt trận.”',
            x: width / 2,
            y: eY + 76,
          },
        ];

        comboLiveList.forEach(c => {
          const isUnlocked = this.evolutionManager.activeEvolutionIds.has(c.id);
          const isOtherClass = 'classOnly' in c && c.classOnly !== this.classConfig.id;
          const cardBg = this.add.rectangle(c.x, c.y, 432, 54, isUnlocked ? 0xf0fdf4 : 0xffffff, 1);
          cardBg.setStrokeStyle(1.5, isUnlocked ? 0x22c55e : 0xd1d5db);

          const cardTitle = this.add.text(c.x - 202, c.y - 12, c.title, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11.5px',
            fontStyle: 'bold',
            color: isUnlocked ? '#15803d' : '#1e293b',
            resolution: 2,
          }).setOrigin(0, 0.5);

          const statusBadge = this.add.text(c.x + 202, c.y - 12,
            isUnlocked ? '✅ ĐÃ KÍCH HOẠT' : isOtherClass ? '🚫 Chỉ Người Kiểm Chứng' : `🔒 [${c.req1} • ${c.req2}]`,
            {
              fontFamily: 'system-ui, sans-serif',
              fontSize: '10.5px',
              fontStyle: 'bold',
              color: isUnlocked ? '#16a34a' : '#64748b',
              resolution: 2,
            }
          ).setOrigin(1, 0.5);

          const cardDesc = this.add.text(c.x - 202, c.y + 12, c.desc, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '10.5px',
            color: '#475569',
            resolution: 2,
          }).setOrigin(0, 0.5);

          contentContainer.add([cardBg, cardTitle, statusBadge, cardDesc]);
        });
      } else {
        // Tab 3: Cột Mốc Trùm & Mẹo Vượt Ải (2-line layout per boss row)
        const bosses = [
          {
            time: '03:00',
            tier: 'Cơn Bão Tâm Lý Đám Đông (3 phút) — Thử thách Đông đảo',
            desc: 'Liên tục triệu hồi bầy quái tí hon lao thẳng vào bạn và bắn đạn 5 hướng. Cần đòn đánh diện rộng hoặc đạn xuyên thấu.',
          },
          {
            time: '05:00',
            tier: 'Lưới Độc Bạo Lực Mạng & Miệt Thị (5 phút) — Thử thách Bền bỉ',
            desc: 'Vùng độc quanh trùm rút máu liên tục. Giữ cự ly, nâng Thiện (hồi máu) và Dân tộc (khiên) để trụ vững.',
          },
          {
            time: '07:00',
            tier: 'Ảo Ảnh Xuyên Tạc & Đạo Nhái (7 phút) — Thử thách Bạo kích & Phá Ảo ảnh',
            desc: 'Tạo 2 phân thân ảo ảnh và bất ngờ lao vút tốc độ cao. Cần chỉ số Chân (bạo kích) và Chống (đẩy lùi) để tiêu diệt.',
          },
          {
            time: '10:00',
            tier: 'Hiện Thân Lệch Chuẩn Văn Hóa Số (10 phút) — Trận chiến Quyết định',
            desc: '3 giai đoạn: mưa đạn xoáy và vòng đỏ tin giả → lao theo vệt đỏ, gọi bầy đám đông → mọi chiêu cùng lúc kèm vùng độc. Né, đừng đứng yên.',
          },
        ];

        bosses.forEach((b, idx) => {
          const cy = topY + 152 + idx * 64;
          const rowLeft = width / 2 - (winW - 60) / 2;
          const row = this.add.rectangle(width / 2, cy, winW - 60, 56, 0xfef2f2, 1);
          row.setStrokeStyle(1, 0xfecaca);

          // Time Badge
          const timeBg = this.add.rectangle(rowLeft + 48, cy, 76, 28, 0xfee2e2, 1);
          timeBg.setStrokeStyle(1, 0xf87171);
          const timeTxt = this.add.text(rowLeft + 48, cy, `⏱️ ${b.time}`, {
            fontFamily: 'monospace',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#b91c1c',
            resolution: 2,
          }).setOrigin(0.5);

          // Title on top
          const tierTxt = this.add.text(rowLeft + 100, cy - 10, b.tier, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#991b1b',
            resolution: 2,
          }).setOrigin(0, 0.5);

          // Description on bottom
          const descTxt = this.add.text(rowLeft + 100, cy + 11, b.desc, {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '12px',
            color: '#475569',
            wordWrap: { width: 780 },
            resolution: 2,
          }).setOrigin(0, 0.5);

          contentContainer.add([row, timeBg, timeTxt, tierTxt, descTxt]);
        });

        // Tip box at bottom
        const tipY = topY + 440;
        const tipBox = this.add.rectangle(width / 2, tipY, winW - 60, 52, 0xfffbeb, 1);
        tipBox.setStrokeStyle(1, 0xfde68a);

        const tipIcon = this.add.text(width / 2 - 425, tipY, '💡', { fontSize: '22px', resolution: 2 }).setOrigin(0.5);

        const tipTitle = this.add.text(width / 2 - 400, tipY - 10, 'MẸO CHIẾN THUẬT SỐNG CÒN:', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#92400e',
          resolution: 2,
        }).setOrigin(0, 0.5);

        const tipDesc = this.add.text(width / 2 - 400, tipY + 11,
          'Đừng bỏ lỡ các Tình huống số để lấy Buff 30s trước khi Trùm xuất hiện! Phát triển cân bằng "Xây" (hồi phục) và "Chống" (thêm đòn đánh) là chìa khóa chiến thắng.',
          {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '11px',
            color: '#78350f',
            wordWrap: { width: 810 },
            resolution: 2,
          }
        ).setOrigin(0, 0.5);

        contentContainer.add([tipBox, tipIcon, tipTitle, tipDesc]);
      }
    };

    const switchTab = (tabId: number) => {
      currentTab = tabId;
      renderTabContent(currentTab);
    };

    renderTabContent(currentTab);

    // Close / Start Button at bottom
    const btnY = bottomY - 34;
    const btnBg = this.add.rectangle(width / 2, btnY, 360, 42, 0x0284c7);
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
      // 1. Check tab buttons click in screen-space
      for (const tab of tabButtons) {
        if (
          Math.abs(pointer.x - tab.centerX) < tab.w / 2 &&
          Math.abs(pointer.y - tabY) < 18
        ) {
          switchTab(tab.id);
          SoundSystem.playGem();
          return;
        }
      }

      // 2. Clicked start/close button
      if (Math.abs(pointer.x - width / 2) < 180 && Math.abs(pointer.y - btnY) < 24) {
        closeIntro();
        return;
      }
      // 3. Clicked 'X' close button
      if (Math.abs(pointer.x - closeX) < 20 && Math.abs(pointer.y - closeY) < 20) {
        closeIntro();
        return;
      }
      // 4. Clicked outside modal (dimmed background)
      if (
        pointer.x < width / 2 - winW / 2 ||
        pointer.x > width / 2 + winW / 2 ||
        pointer.y < topY ||
        pointer.y > bottomY
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
    const bossTargets = this.bossManager.getPotentialTargets();
    this.weaponSystem.update(dt, activeEnemies, bossTargets);
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
      this.scenarioManager.activeBuffText,
      this.evolutionManager.getActiveComboList()
    );
  }

  private onLevelUp(): void {
    this.pauseCombat();
    this.upgradeManager.showUpgradeSelection();
  }

  private pauseCombat(): void {
    this.isPaused = true;
    this.physics.pause();
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
    this.physics.resume();
    this.bossManager.resumeBossPhysics();
    // Instantly ready weapon to fire fresh shots upon resuming
    this.weaponSystem.readyToFire();
  }

  private onBossDefeated(isFinal: boolean): void {
    if (isFinal) {
      this.onGameOver(true);
      return;
    }
    // Each milestone boss opens the next historical stage of the lesson
    this.pauseCombat();
    if (!this.milestoneCard.show(this.bossManager.currentBossIndex, () => this.resumeCombat())) {
      this.resumeCombat();
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
        classConfig: this.classConfig,
        decisions: this.scenarioManager.decisions,
        totalScenarios: this.scenarioManager.totalScenarioCount,
      } satisfies GameResultData);
    });
  }

  public shutdown(): void {
    this.hud.destroy();
  }
}
