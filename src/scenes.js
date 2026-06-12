(function () {
  const GAME_WIDTH = 540;
  const GAME_HEIGHT = 960;
  const STORAGE_KEY = "starDashBestScore";

  const COLORS = {
    ink: "#07194f",
    skyTop: 0x7ae4d6,
    skyBottom: 0xb5f2d7,
    mint: 0x80e8d8,
    white: 0xffffff,
    cream: 0xfff7cf,
    gold: 0xffcf2f,
    coral: 0xff575d,
    grass: 0xcde970,
    shadow: 0x2a8e8f
  };

  const assetList = [
    ["player", "assets/player.svg", { width: 160, height: 160 }],
    ["collectible", "assets/collectible-star.svg", { width: 120, height: 120 }],
    ["obstacle", "assets/obstacle-blob.svg", { width: 140, height: 116 }],
    ["cloudBank", "assets/cloud-bank.svg", { width: 540, height: 180 }],
    ["hill", "assets/hill.svg", { width: 540, height: 190 }],
    ["trail", "assets/fall-trail.svg", { width: 80, height: 180 }],
    ["pauseIcon", "assets/pause.svg", { width: 96, height: 96 }],
    ["playIcon", "assets/play.svg", { width: 96, height: 96 }],
    ["restartIcon", "assets/restart.svg", { width: 96, height: 96 }]
  ];

  function getBestScore() {
    try {
      return Number.parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) || 0;
    } catch (error) {
      return 0;
    }
  }

  function setBestScore(score) {
    try {
      localStorage.setItem(STORAGE_KEY, String(score));
    } catch (error) {
      // Local storage can be unavailable in private or restricted browser modes.
    }
  }

  function addSky(scene) {
    const background = scene.add.graphics();
    background.fillGradientStyle(COLORS.skyTop, COLORS.skyTop, COLORS.skyBottom, COLORS.skyBottom, 1);
    background.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const softGlow = scene.add.graphics();
    softGlow.fillStyle(0xffffff, 0.18);
    softGlow.fillCircle(92, 112, 86);
    softGlow.fillCircle(438, 730, 118);
    softGlow.fillCircle(498, 60, 74);

    for (let i = 0; i < 18; i += 1) {
      addSparkle(scene, 44 + ((i * 83) % 468), 70 + ((i * 137) % 690), i % 3 === 0 ? 11 : 7, 0.7);
    }

    scene.add.image(270, 810, "cloudBank").setAlpha(0.96).setDepth(1);
    scene.add.image(270, 852, "hill").setDepth(2);
  }

  function addSparkle(scene, x, y, size, alpha) {
    const sparkle = scene.add.graphics({ x, y });
    sparkle.fillStyle(COLORS.white, alpha);
    sparkle.beginPath();
    sparkle.moveTo(0, -size);
    sparkle.lineTo(size * 0.28, -size * 0.28);
    sparkle.lineTo(size, 0);
    sparkle.lineTo(size * 0.28, size * 0.28);
    sparkle.lineTo(0, size);
    sparkle.lineTo(-size * 0.28, size * 0.28);
    sparkle.lineTo(-size, 0);
    sparkle.lineTo(-size * 0.28, -size * 0.28);
    sparkle.closePath();
    sparkle.fillPath();
    sparkle.setDepth(3);
    return sparkle;
  }

  function addText(scene, x, y, text, size, options = {}) {
    return scene.add
      .text(x, y, text, {
        fontFamily: '"Baloo 2", "Nunito", "Trebuchet MS", sans-serif',
        fontSize: `${size}px`,
        fontStyle: "800",
        color: options.color || "#07194f",
        align: options.align || "left",
        stroke: options.stroke || "#ffffff",
        strokeThickness: options.strokeThickness ?? Math.max(4, Math.round(size * 0.12)),
        shadow: options.shadow === false ? undefined : {
          offsetX: 0,
          offsetY: 4,
          color: "#4bb5aa",
          blur: 0,
          stroke: false,
          fill: true
        }
      })
      .setOrigin(options.originX ?? 0, options.originY ?? 0);
  }

  function addPill(scene, x, y, width, height, alpha = 0.82) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xffffff, alpha);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, height / 2);
    graphics.lineStyle(3, 0xffffff, 0.9);
    graphics.strokeRoundedRect(x - width / 2, y - height / 2, width, height, height / 2);
    return graphics;
  }

  function makeButton(scene, x, y, width, height, label, callback) {
    const container = scene.add.container(x, y).setSize(width, height).setDepth(100);
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x48a99f, 0.38);
    shadow.fillRoundedRect(-width / 2 + 4, -height / 2 + 8, width, height, height / 2);

    const shape = scene.add.graphics();
    shape.fillStyle(0xffffff, 1);
    shape.fillRoundedRect(-width / 2, -height / 2, width, height, height / 2);
    shape.lineStyle(5, 0xffd84d, 1);
    shape.strokeRoundedRect(-width / 2, -height / 2, width, height, height / 2);

    const text = addText(scene, 0, -3, label, 30, {
      align: "center",
      originX: 0.5,
      originY: 0.5,
      strokeThickness: 5,
      shadow: false
    });

    container.add([shadow, shape, text]);
    container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
    container.on("pointerdown", () => {
      scene.tweens.add({
        targets: container,
        scaleX: 0.94,
        scaleY: 0.94,
        duration: 75,
        yoyo: true,
        onComplete: callback
      });
    });

    return container;
  }
  function touchToGame(scene, touch) {
    const rect = scene.game.canvas.getBoundingClientRect();
    return { x: ((touch.clientX - rect.left) / rect.width) * GAME_WIDTH, y: ((touch.clientY - rect.top) / rect.height) * GAME_HEIGHT };
  }

  function insideRect(point, x, y, width, height) {
    return point.x >= x - width / 2 && point.x <= x + width / 2 && point.y >= y - height / 2 && point.y <= y + height / 2;
  }

  class PreloadScene extends Phaser.Scene {
    constructor() {
      super("PreloadScene");
    }

    preload() {
      addSky(this);
      addText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, "STAR DASH", 54, {
        align: "center",
        originX: 0.5,
        originY: 0.5
      });
      const loadingText = addText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 24, "LOADING", 24, {
        align: "center",
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 4
      });

      assetList.forEach(([key, url, config]) => this.load.svg(key, url, config));

      this.load.on("progress", (value) => {
        loadingText.setText(`LOADING ${Math.round(value * 100)}`);
      });
    }

    create() {
      this.scene.start("MenuScene");
    }
  }

  class MenuScene extends Phaser.Scene {
    constructor() {
      super("MenuScene");
    }

    create() {
      addSky(this);
      this.best = getBestScore();

      addText(this, GAME_WIDTH / 2, 82, "STAR DASH", 60, {
        align: "center",
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 8
      });
      addText(this, GAME_WIDTH / 2, 146, "60 SECOND CHALLENGE", 25, {
        align: "center",
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 4
      });

      addPill(this, GAME_WIDTH / 2, 214, 210, 58, 0.72).setDepth(9);
      addText(this, GAME_WIDTH / 2, 213, `BEST ${this.best}`, 30, {
        align: "center",
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 5
      }).setDepth(10);

      this.add.image(256, 390, "collectible").setScale(0.92).setDepth(12);
      this.add.image(168, 318, "obstacle").setScale(0.62).setAngle(-8).setDepth(12);
      this.add.image(386, 316, "obstacle").setScale(0.58).setAngle(7).setDepth(12);
      this.add.image(270, 662, "player").setScale(1.05).setDepth(14);

      const guide = this.add.graphics();
      guide.lineStyle(7, 0xffffff, 0.86);
      guide.strokeEllipse(270, 760, 210, 64);
      guide.setDepth(10);

      addText(this, GAME_WIDTH / 2, 822, "DRAG TO MOVE", 30, {
        align: "center",
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 5
      }).setDepth(12);

      const button = makeButton(this, GAME_WIDTH / 2, 884, 238, 66, "START", () => {
        this.startRound();
      });
      button.setDepth(30);

      this.tweens.add({
        targets: button,
        y: 878,
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      this.started = false;
      this.menuTouchStart = (event) => {
        if (this.started || !event.touches || event.touches.length === 0) return;
        const point = touchToGame(this, event.touches[0]);
        if (insideRect(point, GAME_WIDTH / 2, 884, 250, 90)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          this.startRound();
        }
      };
      this.game.canvas.addEventListener("touchstart", this.menuTouchStart, { capture: true, passive: false });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.game.canvas.removeEventListener("touchstart", this.menuTouchStart, { capture: true });
      });
    }

    startRound() {
      if (this.started) return;
      this.started = true;
      this.scene.start("PlayScene");
    }
  }

  class PlayScene extends Phaser.Scene {
    constructor() {
      super("PlayScene");
    }

    create() {
      addSky(this);
      this.score = 0;
      this.best = getBestScore();
      this.remainingMs = 60000;
      this.spawnElapsed = 0;
      this.nextSpawn = 320;
      this.items = [];
      this.isDragging = false;
      this.isPaused = false;
      this.isOver = false;
      this.invulnerableMs = 0;
      this.lastPointer = null;

      this.createHud();
      this.createPlayer();
      this.createPauseOverlay();
      this.bindInput();
      this.bindTouchBridge();
      this.updateHud();
    }

    createHud() {
      addText(this, 32, 30, "SCORE", 32, {
        strokeThickness: 5
      }).setDepth(30);
      this.scoreText = addText(this, 32, 82, "0", 62, {
        strokeThickness: 8
      }).setDepth(30);

      addText(this, 274, 33, "BEST", 28, {
        align: "center",
        originX: 0.5,
        originY: 0,
        strokeThickness: 5
      }).setDepth(30);
      addPill(this, 274, 98, 150, 54, 0.75).setDepth(28);
      this.bestText = addText(this, 274, 95, String(this.best), 36, {
        align: "center",
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 5
      }).setDepth(30);

      this.timerText = addText(this, 430, 138, "60", 35, {
        align: "center",
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 5
      }).setDepth(30);
      addText(this, 430, 168, "TIME", 18, {
        align: "center",
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 3
      }).setDepth(30);

      this.pauseButton = this.add.image(474, 67, "pauseIcon").setScale(0.72).setDepth(40);
      this.pauseButton.setInteractive({ useHandCursor: true });
      this.pauseButton.on("pointerdown", (pointer, localX, localY, event) => {
        if (event) event.stopPropagation();
        this.togglePause(true);
      });
    }

    createPlayer() {
      this.playerShadow = this.add.ellipse(270, 844, 126, 28, COLORS.shadow, 0.25).setDepth(12);
      this.player = this.add.image(270, 790, "player").setScale(0.85).setDepth(18);

      this.tweens.add({
        targets: this.player,
        y: 780,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    createPauseOverlay() {
      this.pauseOverlay = this.add.container(0, 0).setDepth(120).setVisible(false);
      const shade = this.add.graphics();
      shade.fillStyle(0x093c4d, 0.28);
      shade.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      const plate = this.add.graphics();
      plate.fillStyle(0xffffff, 0.95);
      plate.fillRoundedRect(88, 300, 364, 300, 34);
      plate.lineStyle(6, 0xffd84d, 1);
      plate.strokeRoundedRect(88, 300, 364, 300, 34);

      const title = addText(this, GAME_WIDTH / 2, 380, "PAUSED", 48, {
        align: "center",
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 7,
        shadow: false
      });
      const resume = makeButton(this, GAME_WIDTH / 2, 482, 216, 62, "RESUME", () => this.togglePause(false));
      const restart = this.add.image(GAME_WIDTH / 2, 555, "restartIcon").setScale(0.55).setInteractive({ useHandCursor: true });
      restart.on("pointerdown", () => this.scene.restart());
      this.pauseOverlay.add([shade, plate, title, resume, restart]);
    }

    bindInput() {
      this.input.on("pointerdown", (pointer) => {
        if (this.isPaused || this.isOver) return;
        this.isDragging = true;
        this.lastPointer = pointer;
        this.movePlayerTo(pointer.x, pointer.y);
      });

      this.input.on("pointermove", (pointer) => {
        if (!this.isDragging || this.isPaused || this.isOver) return;
        this.lastPointer = pointer;
        this.movePlayerTo(pointer.x, pointer.y);
      });

      this.input.on("pointerup", () => {
        this.isDragging = false;
        this.lastPointer = null;
      });

      this.input.on("pointerupoutside", () => {
        this.isDragging = false;
        this.lastPointer = null;
      });
    }

    bindTouchBridge() {
      const canvas = this.game.canvas;
      this.domTouchStart = (event) => {
        if (!event.touches || event.touches.length === 0) return;
        const point = touchToGame(this, event.touches[0]);
        event.preventDefault();
        event.stopImmediatePropagation();
        if (this.isOver) {
          if (insideRect(point, GAME_WIDTH / 2, 584, 250, 96)) this.scene.restart();
          return;
        }
        if (this.isPaused) {
          if (insideRect(point, GAME_WIDTH / 2, 482, 240, 94)) this.togglePause(false);
          else if (insideRect(point, GAME_WIDTH / 2, 555, 96, 96)) this.scene.restart();
          return;
        }
        if (Phaser.Math.Distance.Between(point.x, point.y, 474, 67) < 58) {
          this.togglePause(true);
          return;
        }
        this.isDragging = true;
        this.movePlayerTo(point.x, point.y);
      };
      this.domTouchMove = (event) => {
        if (!this.isDragging || this.isPaused || this.isOver || !event.touches || event.touches.length === 0) return;
        const point = touchToGame(this, event.touches[0]);
        event.preventDefault();
        event.stopImmediatePropagation();
        this.movePlayerTo(point.x, point.y);
      };
      this.domTouchEnd = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.isDragging = false;
        this.lastPointer = null;
      };
      canvas.addEventListener("touchstart", this.domTouchStart, { capture: true, passive: false });
      canvas.addEventListener("touchmove", this.domTouchMove, { capture: true, passive: false });
      canvas.addEventListener("touchend", this.domTouchEnd, { capture: true, passive: false });
      canvas.addEventListener("touchcancel", this.domTouchEnd, { capture: true, passive: false });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        canvas.removeEventListener("touchstart", this.domTouchStart, { capture: true });
        canvas.removeEventListener("touchmove", this.domTouchMove, { capture: true });
        canvas.removeEventListener("touchend", this.domTouchEnd, { capture: true });
        canvas.removeEventListener("touchcancel", this.domTouchEnd, { capture: true });
      });
    }
    movePlayerTo(x, y) {
      const safeX = Phaser.Math.Clamp(x, 62, GAME_WIDTH - 62);
      const safeY = Phaser.Math.Clamp(y - 40, 590, 846);
      this.player.x = safeX;
      this.player.y = safeY;
      this.playerShadow.x = safeX;
      this.playerShadow.y = Phaser.Math.Clamp(safeY + 54, 728, 870);
      this.playerShadow.scaleX = Phaser.Math.Clamp(1.24 - (safeY - 590) / 460, 0.8, 1.24);
    }

    togglePause(nextState) {
      if (this.isOver) return;
      this.isPaused = nextState;
      this.pauseOverlay.setVisible(nextState);
      this.pauseButton.setTexture(nextState ? "playIcon" : "pauseIcon");
    }

    update(time, delta) {
      if (this.isPaused || this.isOver) return;

      this.remainingMs = Math.max(0, this.remainingMs - delta);
      this.spawnElapsed += delta;
      this.invulnerableMs = Math.max(0, this.invulnerableMs - delta);

      if (this.spawnElapsed >= this.nextSpawn) {
        this.spawnElapsed = 0;
        this.spawnItem();
        this.nextSpawn = this.getNextSpawnDelay();
      }

      this.updateItems(delta);
      this.updateHud();

      if (this.remainingMs <= 0) {
        this.finishRound();
      }
    }

    getDifficulty() {
      return Phaser.Math.Clamp((60000 - this.remainingMs) / 60000, 0, 1);
    }

    getNextSpawnDelay() {
      const difficulty = this.getDifficulty();
      return Phaser.Math.Between(520 - difficulty * 230, 820 - difficulty * 330);
    }

    spawnItem() {
      const difficulty = this.getDifficulty();
      const type = Math.random() < 0.45 ? "collectible" : "obstacle";
      const texture = type === "collectible" ? "collectible" : "obstacle";
      const x = Phaser.Math.Between(64, GAME_WIDTH - 64);
      const y = -90;
      const baseSpeed = type === "collectible" ? 175 : 210;
      const speed = baseSpeed + difficulty * 175 + Phaser.Math.Between(-12, 42);
      const scale = type === "collectible"
        ? Phaser.Math.FloatBetween(0.48, 0.7)
        : Phaser.Math.FloatBetween(0.56, 0.78);

      const trail = this.add.image(x, y - 72, "trail").setAlpha(type === "collectible" ? 0.55 : 0.38).setScale(type === "collectible" ? 0.72 : 0.86).setDepth(8);
      const sprite = this.add.image(x, y, texture).setScale(scale).setDepth(type === "collectible" ? 16 : 15);
      sprite.setAngle(Phaser.Math.Between(-8, 8));

      this.items.push({
        type,
        sprite,
        trail,
        speed,
        spin: type === "collectible" ? Phaser.Math.FloatBetween(-48, 48) : Phaser.Math.FloatBetween(-14, 14),
        radius: type === "collectible" ? 30 * scale : 42 * scale
      });
    }

    updateItems(delta) {
      const seconds = delta / 1000;

      for (let i = this.items.length - 1; i >= 0; i -= 1) {
        const item = this.items[i];
        item.sprite.y += item.speed * seconds;
        item.sprite.angle += item.spin * seconds;
        item.trail.y = item.sprite.y - 70;
        item.trail.x = item.sprite.x;

        if (item.sprite.y > GAME_HEIGHT + 120) {
          item.sprite.destroy();
          item.trail.destroy();
          this.items.splice(i, 1);
          continue;
        }

        if (this.hitPlayer(item)) {
          this.consumeItem(item);
          this.items.splice(i, 1);
        }
      }
    }

    hitPlayer(item) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.sprite.x, item.sprite.y);
      return distance < item.radius + 42;
    }

    consumeItem(item) {
      if (item.type === "collectible") {
        this.score += 120;
        this.popScore(item.sprite.x, item.sprite.y, "+120", "#ffd946");
        this.burst(item.sprite.x, item.sprite.y, 0xfff48d);
        this.tweens.add({
          targets: item.sprite,
          scaleX: item.sprite.scaleX * 1.4,
          scaleY: item.sprite.scaleY * 1.4,
          alpha: 0,
          duration: 140,
          ease: "Back.easeOut",
          onComplete: () => item.sprite.destroy()
        });
        item.trail.destroy();
        return;
      }

      if (this.invulnerableMs > 0) {
        return;
      }

      this.invulnerableMs = 850;
      this.score = Math.max(0, this.score - 80);
      this.popScore(item.sprite.x, item.sprite.y, "-80", "#ff575d");
      this.cameras.main.shake(110, 0.0045);
      this.tweens.add({
        targets: this.player,
        alpha: 0.38,
        duration: 72,
        repeat: 5,
        yoyo: true,
        onComplete: () => {
          this.player.alpha = 1;
        }
      });
      this.tweens.add({
        targets: item.sprite,
        scaleX: item.sprite.scaleX * 1.25,
        scaleY: item.sprite.scaleY * 1.25,
        alpha: 0,
        duration: 130,
        ease: "Sine.easeOut",
        onComplete: () => item.sprite.destroy()
      });
      item.trail.destroy();
    }

    popScore(x, y, label, color) {
      const text = addText(this, x, y - 32, label, 26, {
        align: "center",
        color,
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 5,
        shadow: false
      }).setDepth(50);

      this.tweens.add({
        targets: text,
        y: y - 82,
        alpha: 0,
        duration: 520,
        ease: "Cubic.easeOut",
        onComplete: () => text.destroy()
      });
    }

    burst(x, y, color) {
      for (let i = 0; i < 8; i += 1) {
        const dot = this.add.circle(x, y, Phaser.Math.Between(3, 6), color, 0.88).setDepth(20);
        const angle = (Math.PI * 2 * i) / 8;
        this.tweens.add({
          targets: dot,
          x: x + Math.cos(angle) * Phaser.Math.Between(24, 54),
          y: y + Math.sin(angle) * Phaser.Math.Between(24, 54),
          alpha: 0,
          duration: 330,
          ease: "Cubic.easeOut",
          onComplete: () => dot.destroy()
        });
      }
    }

    updateHud() {
      this.scoreText.setText(String(this.score));
      const secondsLeft = Math.ceil(this.remainingMs / 1000);
      this.timerText.setText(String(secondsLeft).padStart(2, "0"));
    }

    finishRound() {
      this.isOver = true;
      this.isDragging = false;

      this.items.forEach((item) => {
        item.sprite.destroy();
        item.trail.destroy();
      });
      this.items = [];

      const previousBest = this.best;
      if (this.score > this.best) {
        this.best = this.score;
        setBestScore(this.best);
      }

      this.bestText.setText(String(this.best));
      this.showGameOver(previousBest);
    }

    showGameOver(previousBest) {
      const overlay = this.add.container(0, 0).setDepth(140);
      const shade = this.add.graphics();
      shade.fillStyle(0x083a4d, 0.33);
      shade.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      const panel = this.add.graphics();
      panel.fillStyle(0xffffff, 0.96);
      panel.fillRoundedRect(58, 258, 424, 398, 38);
      panel.lineStyle(7, 0xffd84d, 1);
      panel.strokeRoundedRect(58, 258, 424, 398, 38);

      const heading = addText(this, GAME_WIDTH / 2, 326, "TIME UP", 52, {
        align: "center",
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 7,
        shadow: false
      });
      const score = addText(this, GAME_WIDTH / 2, 410, String(this.score), 72, {
        align: "center",
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 9,
        shadow: false
      });
      const bestLabel = this.score > previousBest ? "NEW BEST" : `BEST ${this.best}`;
      const best = addText(this, GAME_WIDTH / 2, 482, bestLabel, 30, {
        align: "center",
        originX: 0.5,
        originY: 0.5,
        strokeThickness: 5,
        shadow: false
      });
      const restart = makeButton(this, GAME_WIDTH / 2, 584, 230, 64, "RESTART", () => this.scene.restart());

      overlay.add([shade, panel, heading, score, best, restart]);
    }
  }

  window.StarDashScenes = {
    PreloadScene,
    MenuScene,
    PlayScene
  };
})();
