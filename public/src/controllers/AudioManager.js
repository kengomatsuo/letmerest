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
    this.load.audio("gameBgm", [
      "assets/music/Hectic.ogg",
      "assets/music/Hectic.mp3",
    ]);
  }

  create() {
    this.sound.pauseOnBlur = false; // ✅ Prevents audio from stopping on window blur
    console.log("AudioManager created");
    this.registry.events.on("start-game", () => {
      this.playMusic("gameBgm");
    }, this);

    this.registry.events.on("pause-game", () => {
      this.playMusic("mainMenuBgm", 500);
    }, this);

    this.registry.events.on("resume-game", () => {
      this.playMusic("gameBgm", 4000);
    }, this);
  }

  playMusic(key, fadeDuration = 2000) {
    console.log(`playMusic called for: ${key}`);

    const newMusic = this.sound.add(key, { loop: true, volume: 0 });
    newMusic.play();
    console.log(this.currentMusic)
    if (this.currentMusic) {
      const oldMusic = this.currentMusic;
      newMusic.seek = oldMusic.seek; // Sync playback time
      console.log(oldMusic, newMusic);
      console.log("Crossfade started");

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
        volume: 1,
        duration: fadeDuration,
      });
    } else {
      console.log("No previous music, playing new track directly.");
      newMusic.setVolume(1);
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
