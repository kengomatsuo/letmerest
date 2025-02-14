class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenu" });
    this.isMusicPlaying = true;
  }

  create() {
    if (!this.scene.isActive("AudioManager")) {
      this.scene.launch("AudioManager");
    }

    this.audioManager = this.scene.get("AudioManager"); // Get AudioManager scene
    console.log(this.audioManager)
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

    this.continueText = this.add
      .text(centerX, centerY + 60, "Click anywhere to continue", {
        fontSize: "32px",
        fill: "#ccc",
      })
      .setOrigin(0.5);

    // Listener for clicking anywhere to continue

    this.input.once("pointerdown", () => {
      this.continueText.destroy();
      this.audioManager.playMusic("mainMenuBgm");

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
        if (!this.isMusicPlaying) {
          this.sound.setMute(false);
          this.speakerButton.setText("Sound: on");
        } else {
          this.sound.setMute(true);
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
    });
  }

  resizeUI(gameSize) {
    const { width, height } = gameSize;
    const centerX = width / 2;
    const centerY = height / 2;

    this.titleText.setPosition(centerX, centerY - 100);
    if (this.speakerButton) this.speakerButton.setPosition(centerX, centerY);
    if (this.startButton) this.startButton.setPosition(centerX, centerY + 60);
    if (this.quitButton) this.quitButton.setPosition(centerX, centerY + 120);
  }
}

export default MainMenu;
