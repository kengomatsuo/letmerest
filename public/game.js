import MainScene from './src/scenes/MainScene.js';
import GUI from './src/scenes/GUI.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MainScene, GUI],
    physics: { default: 'arcade', arcade: { debug: false } }
};

const game = new Phaser.Game(config);
