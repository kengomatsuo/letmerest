class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenu" });
    this.isMusicPlaying = false;
  }

  preload() {
    this.load.audio("bgm", "assets/music/Hectic_bass_drums_cut.ogg");
  }

  create() {
    this.createUI();

    // Listen for window resize and adjust UI elements
    this.scale.on("resize", this.resizeUI, this);
  }

  createUI() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Title text
    this.titleText = this.add
      .text(centerX, centerY - 100, "Let Me Rest!", {
        fontSize: "48px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    // Speaker button
    this.speakerButton = this.add
      .text(
        centerX,
        centerY,
        this.isMusicPlaying ? "Sound: on" : "Sound: off",
        { fontSize: "32px", fill: "#fff" }
      )
      .setOrigin(0.5)
      .setInteractive();

    // Start Game button
    this.startButton = this.add
      .text(centerX, centerY + 60, "Start Game", {
        fontSize: "32px",
        fill: "#0f0",
      })
      .setOrigin(0.5)
      .setInteractive();

    // Quit Game button
    this.quitButton = this.add
      .text(centerX, centerY + 120, "Quit Game", {
        fontSize: "32px",
        fill: "#f00",
      })
      .setOrigin(0.5)
      .setInteractive();

    // Toggle music when clicked
    this.speakerButton.on("pointerdown", () => {
      if (!this.music) {
        this.music = this.sound.add("bgm", { loop: true, volume: 0.5 });
      }
      if (!this.isMusicPlaying) {
        this.music.play();
        this.speakerButton.setText("Sound: on");
      } else {
        this.music.pause();
        this.speakerButton.setText("Sound: off");
      }
      this.isMusicPlaying = !this.isMusicPlaying;
    });

    // Start game when clicked
    this.startButton.on("pointerdown", () => {
      this.scene.stop("MainScene");
      this.scene.stop("GUI");
      this.scene.start("GUI");
      this.scene.start("MainScene");

      this.registry.events.emit("start-game");
    });

    // Quit game (only works in Electron or native app)
    this.quitButton.on("pointerdown", () => {
      if (navigator.userAgent.includes("Electron")) {
        window.close();
      } else {
        alert("Quit functionality only works in a native app!");
      }
    });
  }

  resizeUI(gameSize) {
    const { width, height } = gameSize;
    const centerX = width / 2;
    const centerY = height / 2;

    this.titleText.setPosition(centerX, centerY - 100);
    this.speakerButton.setPosition(centerX, centerY);
    this.startButton.setPosition(centerX, centerY + 60);
    this.quitButton.setPosition(centerX, centerY + 120);
  }
}

export default MainMenu;
