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


class Player {
  constructor() {
      this.x = canvas.width / 2;
      this.y = canvas.height / 2;
      this.width = 40;
      this.height = 40;
      this.speed = 5;
      this.dx = 0;
      this.dy = 0;
  }

  move() {
      this.x += this.dx;
      this.y += this.dy;
  }

  draw() {
      ctx.fillStyle = "blue";
      ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

const player = new Player();

// Keyboard controls
const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

function handleInput() {
  player.dx = (keys["ArrowRight"] || keys["d"] ? player.speed : 0) - 
              (keys["ArrowLeft"] || keys["a"] ? player.speed : 0);
  player.dy = (keys["ArrowDown"] || keys["s"] ? player.speed : 0) - 
              (keys["ArrowUp"] || keys["w"] ? player.speed : 0);
}

function update() {
  handleInput();
  player.move();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw();
}


class Projectile {
  constructor(x, y, angle) {
      this.x = x;
      this.y = y;
      this.speed = 5;
      this.radius = 5;
      this.angle = angle;
      this.dx = Math.cos(angle) * this.speed;
      this.dy = Math.sin(angle) * this.speed;
  }

  update() {
      this.x += this.dx;
      this.y += this.dy;
  }

  draw() {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
  }
}

const projectiles = [];

let mouseX = 0;
let mouseY = 0;

// Add event listener for mouse movement
canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

// Function to calculate angle between player and cursor
function calculateAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

// Update the shooting interval to use the calculated angle
setInterval(() => {
    const angle = calculateAngle(player.x, player.y, mouseX, mouseY);
    projectiles.push(new Projectile(player.x, player.y, angle));
}, 500); // Shoot every 500ms

function updateProjectiles() {
  projectiles.forEach((p, index) => {
      p.update();
      if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          projectiles.splice(index, 1); // Remove off-screen projectiles
      }
  });
}

function drawProjectiles() {
  projectiles.forEach((p) => p.draw());
}

function update() {
  handleInput();
  player.move();
  updateProjectiles();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw();
  drawProjectiles();
}


class Enemy {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 30;
        this.speed = 1;
    }

    update() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }

    draw() {
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

const enemies = [];
setInterval(() => {
    enemies.push(new Enemy());
}, 1000); // Spawn enemies every second

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.update();
        
        // Check collision with player (Game Over)
        if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < 25) {
            alert("Game Over!");
            window.location.reload();
        }

        // Check collision with projectiles
        projectiles.forEach((p, pIndex) => {
            if (Math.hypot(p.x - enemy.x, p.y - enemy.y) < 20) {
                enemies.splice(index, 1); // Remove enemy
                projectiles.splice(pIndex, 1); // Remove projectile
            }
        });
    });
}

function drawEnemies() {
    enemies.forEach((e) => e.draw());
}

function update() {
    handleInput();
    player.move();
    updateProjectiles();
    updateEnemies();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    drawProjectiles();
    drawEnemies();
}


