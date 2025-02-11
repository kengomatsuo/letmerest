const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game loop
let lastTime = 0;
function gameLoop(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
