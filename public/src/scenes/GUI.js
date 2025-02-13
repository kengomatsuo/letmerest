class GUI extends Phaser.Scene {
  constructor() {
      super({ key: 'GUI', active: true });
  }

  create() {
      this.score = 0;
      this.health = 100;
      this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#fff' });
      this.healthText = this.add.text(10, 40, 'Health: 100', { fontSize: '20px', fill: '#f00' });

      this.registry.events.on('update-score', (value) => {
          this.score += value;
          this.scoreText.setText(`Score: ${this.score}`);
      });

      this.registry.events.on('update-health', (value) => {
          this.health += value;
          this.healthText.setText(`Health: ${this.health}`);
      });
  }
}

export default GUI;