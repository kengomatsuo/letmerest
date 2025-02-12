let activeTimers = [];
let sceneReference = null;

export function registerScene(scene) {
  sceneReference = scene;
}

export function registerTimer(timer) {
  activeTimers.push(timer);
}

export function pauseGame() {
  if (sceneReference) {
    sceneReference.physics.world.pause();
    activeTimers.forEach(timer => timer.paused = true);
  }
}

export function resumeGame() {
  if (sceneReference) {
    sceneReference.physics.world.resume();
    activeTimers.forEach(timer => timer.paused = false);
  }
}
