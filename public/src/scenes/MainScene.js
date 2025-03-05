import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        // this.load.image('background', 'assets/sprites/Background.png');
        this.load.spritesheet('floor', 'assets/textures/Floor.png', {
            frameWidth: 144,
            frameHeight: 144
        });
        this.load.atlas('player', 'assets/sprites/Player.png', "assets/sprites/Player.json");
        this.load.atlas('enemy', 'assets/sprites/FolderFloat.png', "assets/sprites/FolderFloat.json");
        this.load.image('projectile', 'assets/sprites/Paper.png');
        this.load.image('pointer', '../../assets/pointer.png');
    }

    create() {
        this.gameTimer = 0;
        this.physics.world.setBounds(0, 0, 2400, 1800);

        this.add.tileSprite(1200, 900, 2400, 1800, 'floor');

        this.player = new Player(this, 1200, 900);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enemies = this.physics.add.group();

        this.scene.get('GUI').setPlayer(this.player);
        
        // Create enemies every 2 seconds
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                // Get player's position
                const playerX = this.player.x;
                const playerY = this.player.y;
        
                // Pick a random angle in radians (0 to 2π)
                const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        
                // Calculate spawn position 1000 pixels away
                const spawnX = playerX + Math.cos(angle) * 1000;
                const spawnY = playerY + Math.sin(angle) * 1000;
        
                // Create and add the enemy
                const enemy = new Enemy(this, spawnX, spawnY);
                this.enemies.add(enemy);
            },
            loop: true
        });

        // Update game timer every second
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.registry.events.emit("update-timer", ++this.gameTimer);
            },
            loop: true
        });

        this.registry.events.on("start-game", () => {  
            this.timer = 0;
            this.time.paused = false;
        });

        this.registry.events.on("pause-game", () => {
            this.physics.pause();
            this.time.paused = true;
            if(!this.scene.isActive("PauseMenu"))this.scene.launch("PauseMenu");
        });

        this.registry.events.on("resume-game", () => {
            this.physics.resume();
            this.time.paused = false;
        });

        this.registry.events.on("game-over", () => {
            // Stop all timers and physics
            this.physics.pause();
            this.time.removeAllEvents();
            
            // Stop player
            if (this.player) {
                this.player.body.setVelocity(0);
                this.player.setActive(false);
                this.player.body.enable = false;
            }
        
            // Stop enemies
            this.enemies.children.iterate((enemy) => {
                enemy.setVelocity(0);
                enemy.setActive(false);
                enemy.body.enable = false;
            });
        });        
    }

    update() {
        this.player.move();
        this.enemies.children.iterate((enemy) => enemy.chasePlayer(this.player));
    }
}

export default MainScene;
