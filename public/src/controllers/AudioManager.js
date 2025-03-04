class AudioManager extends Phaser.Scene {
  constructor() {
    super({ key: "AudioManager" });
    this.currentMusic = null;
  }

  preload() {
    this.load.audio("mainMenuBgm", [
      "assets/music/Hectic_bass_drums.ogg",
      "assets/music/Hectic_bass_drums.mp3",
    ]);
    this.load.audio("click", "assets/sounds/Click.mp3")
    this.load.audio("gameStart", "assets/sounds/Game_Start.mp3")
    this.load.audio("gameBgm", [
      "assets/music/Hectic.ogg",
      "assets/music/Hectic.mp3",
    ]);
    this.load.audio("pauseIn", "assets/sounds/Pause_In.mp3")
    this.load.audio("pauseOut", "assets/sounds/Pause_Out.mp3")
    this.load.audio("playerHit", "assets/sounds/Hit.mp3")
    this.load.audio("playerHighStress", "assets/sounds/High_Stress.mp3")
    this.load.audio("point", "assets/sounds/Coin.mp3")
    this.load.audio("shoot", "assets/sounds/Paper.mp3")
    this.load.audio("enemyHit", "assets/sounds/Enemy_Hit.mp3")
  }

  create() {
    this.sound.pauseOnBlur = false; // ✅ Prevents audio from stopping on window blur
    console.log("AudioManager created");
    this.registry.events.on("start-game", () => {
      console.log("Start-game event received");
      this.playMusic("gameBgm");
    }, this);

    this.registry.events.on("pause-game", () => {
      this.playMusic("mainMenuBgm");
      console.log("Pause-game event received");
    }, this);

    this.registry.events.on("main-menu", () => {
      console.log("Main-menu event received");
      this.playMusic("mainMenuBgm");
    }, this);

    this.registry.events.on("resume-game", () => {
      console.log("Resume-game event received");
      this.playMusic("gameBgm", 4000);
    }, this);

    this.registry.events.on("game-over", () => {
      // Add tweens to decrease music rate and stop it
      this.tweens.add({
        targets: this.currentMusic,
        rate: 0.001,
        duration: 3000,
        onComplete: () => {
          this.currentMusic.stop();
        },
      });
    })
  }

  playMusic(key, fadeDuration = 2000) {
    console.log(`playMusic called for: ${key}`);

    const newMusic = this.sound.add(key, { loop: true, volume: 0 });
    newMusic.play();
    // console.log(this.currentMusic)
    if (this.currentMusic) {
      const oldMusic = this.currentMusic;
      newMusic.seek = oldMusic.seek; // Sync playback time
      // console.log(oldMusic, newMusic);
      console.log("Crossfade started");
      oldMusic.setVolume(0.6);
      // **Tween for fading out old music**
      this.tweens.add({
        targets: oldMusic,
        volume: 0,
        duration: fadeDuration,
        onComplete: () => {
          console.log("Old music stopped.");
          oldMusic.stop();
        },
      });

      // **Tween for fading in new music**
      this.tweens.add({
        targets: newMusic,
        volume: .6,
        duration: fadeDuration,
      });
    } else {
      console.log("No previous music, playing new track directly.");
      this.tweens.add({
        targets: newMusic,
        volume: .6,
        duration: fadeDuration,
      });
    }

    this.currentMusic = newMusic;
  }

  toggleMute() {
    if (this.currentMusic) {
      this.currentMusic.setMute(!this.currentMusic.mute);
      console.log(`Mute toggled: ${this.currentMusic.mute}`);
    }
  }
}

export default AudioManager;
