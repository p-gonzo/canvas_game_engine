const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const NUMBER_OF_COLUMNS = 40;
const NUMBER_OF_ROWS = 30;
const TILE_WIDTH = CANVAS_WIDTH / NUMBER_OF_COLUMNS;
const TILE_HEIGHT = CANVAS_HEIGHT / NUMBER_OF_ROWS;
const FRAMES_PER_SECOND = 60;
const GRAVITY = 0.6;

const LEFT = 65;
const RIGHT = 68;
const UP = 87;
const JUMP = 16;
const FIRE = 191;

const EMPTY = 0;
const BRICK = 1;
const COIN = 2;

const PLAYER_SPEED = 3;
const ENEMY_SPEED = 0.5;

const TILE_TYPES = ['Bricks', 'Coins']


let tilesMatrix = [];
let isDrawing = false;
let justToggledTile = {tileCol: -1, tileRow: -1};
let currentTileType = BRICK;

const enemies = [];
const bullets = [];

class Player{
  constructor(xPos, yPos) {
    this.x = xPos;
    this.y = yPos;
    this.yDelta = 0;
    this.xDelta = 0;
    this.radius = 15;
    this.color = 'white';
    this.onGround = false;
    this.keyHoldRight = false;
    this.keyHoldLeft = false;
    this.xDirection = 1;
    this.yDirection = 0;
  }
  fire() {
    let xDirection = this.yDirection === 0 ? this.xDirection : 0;
    bullets.push(new Bullet(this.x, this.y, xDirection, this.yDirection))
  }
  die() {
    this.yDelta = 0;
    this.xDelta = 0;
    this.x = 100;
    this.y = 100;
    this.onGround = false;
  }
  _applyGravity() {
    if (!this.onGround) {
      this.yDelta += GRAVITY;
    }
    this.y += this.yDelta;
  }
  _detectSurroundings() {
    this.playerFeet = getTileFromPos({x: this.x, y: this.y + this.radius});
    this.playerRightSide = getTileFromPos({x: this.x + this.radius, y: this.y});
    this.playerLeftSide = getTileFromPos({x: this.x - this.radius, y: this.y});
    this.playerHead = getTileFromPos({x: this.x, y: this.y - this.radius});

    this.playerFeetTile = tilesMatrix[this.playerFeet.tileRow] === undefined ? 0 : tilesMatrix[this.playerFeet.tileRow][this.playerFeet.tileCol];
    this.playerRightSideTile = tilesMatrix[this.playerRightSide.tileRow] === undefined ? 0 : tilesMatrix[this.playerRightSide.tileRow][this.playerRightSide.tileCol];
    this.playerLeftSideTile = tilesMatrix[this.playerLeftSide.tileRow] === undefined ? 0 : tilesMatrix[this.playerLeftSide.tileRow][this.playerLeftSide.tileCol];
    this.playerHeadTile = tilesMatrix[this.playerHead.tileRow] === undefined ? 0 : tilesMatrix[this.playerHead.tileRow][this.playerHead.tileCol];

    this.tileValuesAroundPlayer = [this.playerFeetTile, this.playerRightSideTile, this.playerLeftSideTile, this.playerHeadTile];
    this.tilesAroundPlayer = [this.playerFeet, this.playerRightSide, this.playerLeftSide, this.playerHead];
    this.playerTouchingACoin = this.tileValuesAroundPlayer.indexOf(COIN);
  }

  _detectCollisions() {
    if (this.playerTouchingACoin !== -1) {
      const targetTile = this.tilesAroundPlayer[this.playerTouchingACoin]
      tilesMatrix[targetTile.tileRow][targetTile.tileCol] = EMPTY;
    }
    
    if (this.playerFeetTile === BRICK && this.yDelta > 0 && this.y - this.radius < this.playerFeet.tileRow * TILE_HEIGHT) { // Player is falling and lands on tile
      this.onGround = true;
      this.yDelta = 0;
    } else if (this.playerFeetTile === EMPTY) {
      this.onGround = false;
    }
    // If the payer is moving right, and they hit a block, stop them from moving right
    if (this.keyHoldRight && this.playerRightSideTile) {
      this.x -= 3;
    }
    // If the payer is moving left, and they hit a block, stop them from moving right
    if (this.keyHoldLeft && this.playerLeftSideTile) {
      this.x += 3;
    }
  
    // Reset player if they fall
    if (this.y > CANVAS_HEIGHT + 100 || this.y < -200) {
      this.die() 
    }
  
    // To prevent a player from sinking into the ground
    if (this.onGround && this.y + this.radius > (this.playerFeet.tileRow * TILE_HEIGHT)) {
      this.y = this.playerFeet.tileRow * TILE_HEIGHT - this.radius;
    }
  }

  _movePlayerLeftRight() {
    if (this.keyHoldLeft) {
      this.x -= PLAYER_SPEED
    }
    if (this.keyHoldRight) {
      this.x += PLAYER_SPEED
    }
  }

  updatePosition() {
    this._applyGravity();
    this._detectSurroundings();
    this._detectCollisions();
    this._movePlayerLeftRight();
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = 'red';
    this.radius = 15;
  }

  updatePosition(player) {
    this.enemyPlayerXDelta = player.x - this.x;
    this.enemyPlayerYDelta = player.y - this.y;
    let enemyXDelta = this.enemyPlayerXDelta == 0 ? 0 : this.enemyPlayerXDelta > 0 ? ENEMY_SPEED : ENEMY_SPEED * -1;
    let enemyYDelta = this.enemyPlayerYDelta == 0 ? 0 : this.enemyPlayerYDelta > 0 ? ENEMY_SPEED : ENEMY_SPEED * -1;
    this.x += enemyXDelta;
    this.y += enemyYDelta;
  }

  tryToKillPlayer(player) {
    if (Math.abs(this.enemyPlayerXDelta) < player.radius + this.radius && Math.abs(this.enemyPlayerYDelta) < player.radius + this.radius) {
      player.die();
    }
  }
}

class Bullet {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.color = 'white';
    this.radius = 5;
    this.speed = 10;
  }

  updatePosition() {
    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;
  }

  isOutOfBounds() {
    return this.x > CANVAS_WIDTH || this.x < 0 || this.y > CANVAS_HEIGHT || this.y < 0;
  }

  collidedWithEnemy(enemy) {
    return this.x > enemy.x - enemy.radius && this.x < enemy.x + enemy.radius && this.y > enemy.y - enemy.radius && this.y < enemy.y + enemy.radius;
  }
}

player = new Player(100, 100);


const getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max));
}

setInterval(() => {
  enemies.push(new Enemy(
    getRandomInt(CANVAS_WIDTH), 
    getRandomInt(CANVAS_HEIGHT)))
  }, 3000);


const getCanvas = () => {
  return document.getElementById("gameCanvas");
}

const setCanvasSize = (gameCanvas) => {
  gameCanvas.height = CANVAS_HEIGHT;
  gameCanvas.width = CANVAS_WIDTH;
}

window.onload = () => {
  const gameCanvas = setupAndCreateCanvas();
  setInterval(() => updateAll(gameCanvas), 1000/FRAMES_PER_SECOND);
  addCanvasClickListener(gameCanvas);
  addTileToggleButtonClickListener();
  populateTilesMatrix();
  addCoinToTilesMatrix();
}

const setupAndCreateCanvas = () => {
  const gameCanvas = getCanvas();
  setCanvasSize(gameCanvas);
  return gameCanvas
}

const updateAll = (gameCanvas) => {
  moveAll();
  drawAll(gameCanvas);
}

const drawAll = (gameCanvas) => {
  drawRect({canvas: gameCanvas, x:0, y:0, height: CANVAS_HEIGHT, width: CANVAS_WIDTH, color: 'black'});
  drawTiles(gameCanvas);
  drawPlayer({canvas:gameCanvas, ...player});
  drawEnemies(gameCanvas);
  drawBullets(gameCanvas);
}

const moveAll = () => {
  player.updatePosition();

  enemies.forEach(enemy => {
    enemy.updatePosition(player);
    enemy.tryToKillPlayer(player);
  });

  currentBulletIndex = bullets.length - 1;
  while (currentBulletIndex >= 0) {
    let bullet = bullets[currentBulletIndex];
    bullet.updatePosition();
    if(bullet.isOutOfBounds()) {
      bullets.splice(currentBulletIndex, 1);
    }
  
    currentEnemyIndex = enemies.length - 1;
    while (currentEnemyIndex >= 0) {
      let enemy = enemies[currentEnemyIndex];
      if (bullet.collidedWithEnemy(enemy)) {
        enemies.splice(currentEnemyIndex, 1);
        bullets.splice(currentBulletIndex, 1);
      }
      currentEnemyIndex--;
    }
    currentBulletIndex--;
  }

}

const drawRect = ({canvas, x, y , width, height, color}) => {
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height);
}

const drawTiles = (canvas) => {
  tilesMatrix.forEach((row, rowIdx) => {
    row.forEach((_, columnIdx) => {
      let currentTile = tilesMatrix[rowIdx][columnIdx]
      let currentTileX = columnIdx * TILE_WIDTH;
      let currentTileY = rowIdx * TILE_HEIGHT
      if (currentTile === BRICK) {
        drawRect({canvas: gameCanvas, x:currentTileX, y:currentTileY, height: TILE_HEIGHT - 1, width: TILE_WIDTH - 1, color: 'blue'})
      }
      if (currentTile === COIN) {
        drawRect({canvas: gameCanvas, x:currentTileX, y:currentTileY, height: TILE_HEIGHT - 1, width: TILE_WIDTH - 1, color: 'gold'})
      }
    });
  });
}

const getMousePos = (canvas, evt) => {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

const addCanvasClickListener = (gameCanvas) => {
  gameCanvas.addEventListener('mousedown', _ => {
    isDrawing = true;
  })
  gameCanvas.addEventListener('mouseup', evt => {
    isDrawing = false;
    const mousePos = getMousePos(gameCanvas, evt);
    toggleBrick(getTileFromPos(mousePos))
    justToggledTile = {tileCol: -1, tileRow: -1};
})
  gameCanvas.addEventListener('mousemove', evt => {
    if (isDrawing) {
      const mousePos = getMousePos(gameCanvas, evt);
      toggleBrick(getTileFromPos(mousePos))
  }
  });

  document.body.onkeydown = (evt) =>{
    console.log(evt.keyCode);
    if (evt.keyCode == JUMP && player.onGround) {
      player.yDelta = -10;
    } else if (evt.keyCode == UP) {
      player.yDirection = -1;
    } else if (evt.keyCode == LEFT) {
      player.keyHoldLeft = true;
      player.xDirection = -1;
    } else if (evt.keyCode == RIGHT) {
      player.keyHoldRight = true;
      player.xDirection = 1;
    }
  }

  document.body.onkeyup = (evt) =>{
    if (evt.keyCode == LEFT) {
      player.keyHoldLeft = false;
    } else if (evt.keyCode == RIGHT) {
      player.keyHoldRight = false;
    } else if (evt.keyCode == UP) {
      player.yDirection = 0;
    } else if (evt.keyCode == FIRE) {
      player.fire();
    }
  }

}

const addTileToggleButtonClickListener = () => {
  const toggleButton = document.getElementById('rotate-tile-types');
  const toggleText = document.getElementById('current-tile-type');
  toggleText.innerHTML = TILE_TYPES[currentTileType - 1];
  toggleButton.addEventListener('click', () => {
    if (currentTileType === TILE_TYPES.length) {
      currentTileType = BRICK;
    } else {
      currentTileType ++;
    }
    toggleText.innerHTML = TILE_TYPES[currentTileType - 1];
  });
}

const getTileFromPos = ({x, y}) => {
  const tileCol = Math.floor(x / TILE_WIDTH);
  const tileRow = Math.floor(y / TILE_HEIGHT);
  return {tileCol, tileRow}
}

const toggleBrick = ({tileCol, tileRow}) => {
  if (tileCol !== justToggledTile.tileCol || tileRow !== justToggledTile.tileRow)  {
    tilesMatrix[tileRow][tileCol] === EMPTY ? tilesMatrix[tileRow][tileCol] = currentTileType : tilesMatrix[tileRow][tileCol] = 0;
    justToggledTile = {tileCol, tileRow}
  }
}

const populateTilesMatrix = () => {
  for (let i = 0; i < NUMBER_OF_ROWS; i ++) {
    tilesMatrix.push([])
    for (let j = 0; j < NUMBER_OF_COLUMNS; j ++) {
      if (i === NUMBER_OF_ROWS - 1) {
        tilesMatrix[i].push(BRICK)
      } else {
        tilesMatrix[i].push(EMPTY)
      }
    }
  }
}

const addCoinToTilesMatrix = () => {
  tilesMatrix[getRandomInt(NUMBER_OF_ROWS - 1)][getRandomInt(NUMBER_OF_COLUMNS - 1)] = COIN
}

const drawPlayer = ({canvas, x, y , radius, color}) => {
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y , radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

const drawEnemies = (gameCanvas) => {
  enemies.forEach(enemy => {
    drawPlayer({canvas: gameCanvas, ...enemy})
  })
}

const drawBullets = (gameCanvas) => {
  bullets.forEach(bullet => {
    drawPlayer({canvas: gameCanvas, ...bullet})
  })
}