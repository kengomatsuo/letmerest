import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.image('player', '../../assets/player.png');
        this.load.image('enemy', '../../assets/enemy.png');
        this.load.image('bullet', '../../assets/bullet.png');
    }

    create() {
        this.player = new Player(this, 400, 300);
        this.cameras.main.startFollow(this.player, true, 1, 1);
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enemies = this.physics.add.group();

        this.scene.get('GUI').setPlayer(this.player);
        
        // Create enemies every 2 seconds
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                const enemy = new Enemy(this, Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550));
                this.enemies.add(enemy);
            },
            loop: true
        });
    }

    update() {
        this.player.move();
        this.enemies.children.iterate((enemy) => enemy.chasePlayer(this.player));
    }
}

export default MainScene;
