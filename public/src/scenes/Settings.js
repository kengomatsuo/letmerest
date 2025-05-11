class Settings extends Phaser.Scene {
  constructor() {
    super({ key: "Settings" });
  }

  init(data) {
    this.previousScene = data.previousScene || "MainMenu";
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Darkened background
    this.background = this.add.graphics();
    this.background.fillStyle(0x000000, 0.5);
    this.background.fillRect(0, 0, width, height);

    // Title text
    this.titleText = this.add
      .text(centerX, centerY - 100, "Settings", {
        fontFamily: "DePixelHalbfett",
        fontSize: "48px",
        resolution: 10
      })
      .setOrigin(0.5);

    // Background Music Volume Slider
    this.bgmText = this.add.text(centerX - 100, centerY, "BGM Volume", {
      fontFamily: "DePixelKlein",
      fontSize: "24px",
      resolution: 10,
    }).setOrigin(0.5);

    const bgmSlider = this.add.rectangle(centerX + 50, centerY, 100, 10, 0x888888)
      .setInteractive();
    const bgmHandle = this.add.rectangle(centerX + 50, centerY, 16, 16, 0xffffff)
      .setInteractive();

    bgmHandle.on("pointerdown", (pointer) => {
      this.input.on("pointermove", (pointer) => {
        let newX = Phaser.Math.Clamp(pointer.x, bgmSlider.x - 50, bgmSlider.x + 50);
        bgmHandle.x = newX;
        const volume = (newX - (bgmSlider.x - 50)) / 100;
        this.registry.events.emit("set-bgm-volume", volume);
      });
    });

    this.input.on("pointerup", () => {
      this.input.off("pointermove");
    });

    // SFX Volume Slider
    this.sfxText = this.add.text(centerX - 100, centerY + 40, "SFX Volume", {
      fontFamily: "DePixelKlein",
      fontSize: "24px",
      resolution: 10,
    }).setOrigin(0.5);

    const sfxSlider = this.add.rectangle(centerX + 50, centerY + 40, 100, 10, 0x888888)
      .setInteractive();
    const sfxHandle = this.add.rectangle(centerX + 50, centerY + 40, 16, 16, 0xffffff)
      .setInteractive();

    sfxHandle.on("pointerdown", (pointer) => {
      this.input.on("pointermove", (pointer) => {
        let newX = Phaser.Math.Clamp(pointer.x, sfxSlider.x - 50, sfxSlider.x + 50);
        sfxHandle.x = newX;
        const volume = (newX - (sfxSlider.x - 50)) / 100;
        this.registry.events.emit("set-sfx-volume", volume);
      });
    });

    this.input.on("pointerup", () => {
      this.input.off("pointermove");
    });

    // Back button
    this.backButton = this.add
      .text(centerX, centerY + 100, "Back", {
        fontFamily: "DePixelKlein",
        fontSize: "32px",
        resolution: 10
      })
      .setTintFill(0xff0000)
      .setOrigin(0.5)
      .setInteractive();

    // Navigate back to the previous scene
    this.backButton.on("pointerdown", () => {
      this.sound.play("click", { volume: 0.6 });
      this.scene.start(this.previousScene);
    });

    // Listen for ESC key to return to the previous scene
    this.input.keyboard.on("keydown-ESC", () => {
      this.sound.play("click", { volume: 0.6 });
      this.scene.start(this.previousScene);
    });

    // Listen for window resize and adjust UI elements
    this.scale.on("resize", this.resizeUI, this);
  }

  resizeUI(gameSize) {
    const { width, height } = gameSize;
    const centerX = width / 2;
    const centerY = height / 2;

    // Resize background
    this.background.clear();
    this.background.fillStyle(0x000000, 0.5);
    this.background.fillRect(0, 0, width, height);

    // Reposition UI elements
    this.titleText.setPosition(centerX, centerY - 100);
    this.bgmText.setPosition(centerX - 100, centerY);
    this.sfxText.setPosition(centerX - 100, centerY + 40);
    this.backButton.setPosition(centerX, centerY + 100);
  }
}

export default Settings;
