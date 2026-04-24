const rows = 24;
const cols = 24;
const difficultySettings = {
  easy: { label: "简单", initial: 170, min: 95, step: 2 },
  normal: { label: "普通", initial: 140, min: 65, step: 2 },
  hard: { label: "困难", initial: 105, min: 50, step: 2 },
};

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const restartButton = document.getElementById("restartButton");
const messageEl = document.getElementById("message");

let difficulty = "normal";
let score = 0;
let highScore = Number(localStorage.getItem("snake.highScore") || 0);
let snake;
let food;
let direction;
let nextDirection;
let hasStarted = false;
let isPaused = false;
let isGameOver = false;
let lastStep = 0;

function resetGame(started = false) {
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);
  snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  hasStarted = started;
  isPaused = false;
  isGameOver = false;
  food = spawnFood();
  startButton.classList.toggle("hidden", started);
  messageEl.textContent = "";
  pauseButton.textContent = "暂停";
  updateStats();
  draw();
}

function speed() {
  const setting = difficultySettings[difficulty];
  return Math.max(setting.min, setting.initial - score * setting.step);
}

function spawnFood() {
  const occupied = new Set(snake.map((part) => `${part.x},${part.y}`));
  const empty = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        empty.push({ x, y });
      }
    }
  }
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
}

function updateStats() {
  scoreEl.textContent = String(score);
  highScoreEl.textContent = String(highScore);
}

function drawCell(cell, color, padding) {
  const size = canvas.width / cols;
  ctx.fillStyle = color;
  ctx.fillRect(
    cell.x * size + padding,
    cell.y * size + padding,
    size - padding * 2,
    size - padding * 2
  );
}

function draw() {
  const size = canvas.width / cols;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0d1b2a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#1b3146";
  ctx.lineWidth = 1;
  for (let x = 0; x <= cols; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * size, 0);
    ctx.lineTo(x * size, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= rows; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * size);
    ctx.lineTo(canvas.width, y * size);
    ctx.stroke();
  }

  if (food) {
    drawCell(food, "#e94f5f", 4);
  }

  snake.forEach((part, index) => {
    drawCell(part, index === 0 ? "#2ec4b6" : "#239d88", 3);
  });
}

function stepGame() {
  direction = nextDirection;
  const head = snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };

  const hitWall = newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows;
  if (hitWall) {
    finishGame("撞到墙了，点重开再来一局");
    return;
  }

  const willEat = food && newHead.x === food.x && newHead.y === food.y;
  const body = willEat ? snake : snake.slice(0, -1);
  if (body.some((part) => part.x === newHead.x && part.y === newHead.y)) {
    finishGame("咬到自己了，点重开再来一局");
    return;
  }

  snake.unshift(newHead);
  if (willEat) {
    score += 1;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snake.highScore", String(highScore));
    }
    food = spawnFood();
    if (!food) {
      finishGame("你把整张地图吃满了！");
    }
  } else {
    snake.pop();
  }
  updateStats();
  draw();
}

function finishGame(text) {
  isGameOver = true;
  hasStarted = false;
  startButton.classList.add("hidden");
  messageEl.textContent = text;
  draw();
}

function changeDirection(newDirection) {
  if (!hasStarted || isPaused || isGameOver) {
    return;
  }
  if (direction.x + newDirection.x === 0 && direction.y + newDirection.y === 0) {
    return;
  }
  nextDirection = newDirection;
}

function gameLoop(timestamp) {
  if (hasStarted && !isPaused && !isGameOver && timestamp - lastStep >= speed()) {
    lastStep = timestamp;
    stepGame();
  }
  requestAnimationFrame(gameLoop);
}

function directionFromName(name) {
  return {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  }[name];
}

startButton.addEventListener("click", () => {
  hasStarted = true;
  isPaused = false;
  startButton.classList.add("hidden");
  messageEl.textContent = "";
});

pauseButton.addEventListener("click", () => {
  if (!hasStarted || isGameOver) {
    return;
  }
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "继续" : "暂停";
  messageEl.textContent = isPaused ? "已暂停" : "";
});

restartButton.addEventListener("click", () => resetGame(true));

document.querySelectorAll("[data-dir]").forEach((button) => {
  button.addEventListener("click", () => changeDirection(directionFromName(button.dataset.dir)));
});

document.querySelectorAll(".difficulty").forEach((button) => {
  button.addEventListener("click", () => {
    difficulty = button.dataset.level;
    document.querySelectorAll(".difficulty").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    resetGame(false);
  });
});

document.addEventListener("keydown", (event) => {
  const keys = {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
  };
  if (keys[event.key]) {
    event.preventDefault();
    changeDirection(directionFromName(keys[event.key]));
  }
  if (event.key === " ") {
    event.preventDefault();
    pauseButton.click();
  }
  if (event.key === "r" || event.key === "R") {
    resetGame(true);
  }
});

let touchStart = null;
canvas.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });

canvas.addEventListener("touchend", (event) => {
  if (!touchStart) {
    return;
  }
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) {
    return;
  }
  const dir = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? "right" : "left")
    : (dy > 0 ? "down" : "up");
  changeDirection(directionFromName(dir));
}, { passive: true });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

resetGame(false);
requestAnimationFrame(gameLoop);
