const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");
const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

const blockWidth = 50;
const blockHeight = 50;

// scoreboard values
let highScore = Number(localStorage.getItem("highScore")) || 0;
let score = 0;
let time = "00-00";

highScoreElement.innerText = highScore.toString();

// calculate grid size
const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

// make CSS grid match JS grid
board.style.gridTemplateColumns = `repeat(${cols}, ${blockWidth}px)`;
board.style.gridTemplateRows = `repeat(${rows}, ${blockHeight}px)`;

// map of "row-col" -> cell element
const cells = {};

let intervalId = null;
let timerIntervalId = null;

// snake state
let snake = [{ x: 1, y: 3 }];
let direction = "down";

// food position
let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

// build grid
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const cell = document.createElement("div");
    cell.classList.add("block");
    board.appendChild(cell);
    cells[`${r}-${c}`] = cell;
  }
}

// helper to place food
function placeFood() {
  cells[`${food.x}-${food.y}`].classList.add("food");
}

// helper to draw snake
function drawSnake() {
  snake.forEach((segment) => {
    cells[`${segment.x}-${segment.y}`].classList.add("fill");
  });
}

// helper to clear snake
function clearSnake() {
  snake.forEach((segment) => {
    cells[`${segment.x}-${segment.y}`].classList.remove("fill");
  });
}

// main game tick
function render() {
  let head = { ...snake[0] };

  // movement
  if (direction === "left") head.y -= 1;
  else if (direction === "right") head.y += 1;
  else if (direction === "down") head.x += 1;
  else if (direction === "up") head.x -= 1;

  // wall collision
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    endGame();
    return;
  }

  // self collision
  const hitSelf = snake.some((seg) => seg.x === head.x && seg.y === head.y);
  if (hitSelf) {
    endGame();
    return;
  }

  clearSnake();

  // food
  if (head.x === food.x && head.y === food.y) {
    cells[`${food.x}-${food.y}`].classList.remove("food");

    snake.unshift(head); // grow (no pop)

    score += 10;
    scoreElement.innerText = score.toString();

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore.toString());
      highScoreElement.innerText = highScore.toString();
    }

    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
    placeFood();
  } else {
    snake.unshift(head);
    snake.pop();
  }

  drawSnake();
}

function startTimer() {
  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split("-").map(Number);

    if (sec === 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }

    const mm = String(min).padStart(2, "0");
    const ss = String(sec).padStart(2, "0");
    time = `${mm}-${ss}`;
    timeElement.innerText = time;
  }, 1000);
}

function resetTimer() {
  clearInterval(timerIntervalId);
  time = "00-00";
  timeElement.innerText = time;
}

function startGame() {
  modal.style.display = "none";
  startGameModal.style.display = "flex";
  gameOverModal.style.display = "none";

  // reset score + timer
  score = 0;
  scoreElement.innerText = score.toString();
  clearInterval(intervalId);
  resetTimer();

  // 🔥 clear EVERY cell from previous game
  Object.values(cells).forEach((cell) => {
    cell.classList.remove("fill", "food");
  });

  // now set fresh snake + direction
  snake = [{ x: 1, y: 3 }];
  direction = "down";

  // new food
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };

  placeFood();
  drawSnake();

  // restart loops
  intervalId = setInterval(render, 300);
  startTimer();
}

function endGame() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);

  modal.style.display = "flex";
  startGameModal.style.display = "none";
  gameOverModal.style.display = "flex";
}

// start button
startButton.addEventListener("click", () => {
  startGame();
});

// restart button
restartButton.addEventListener("click", () => {
  startGame();
});

// keyboard controls
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && direction !== "down") {
    direction = "up";
  } else if (event.key === "ArrowDown" && direction !== "up") {
    direction = "down";
  } else if (event.key === "ArrowLeft" && direction !== "right") {
    direction = "left";
  } else if (event.key === "ArrowRight" && direction !== "left") {
    direction = "right";
  }
});

// initial food and snake (visible behind modal)
placeFood();
drawSnake();
