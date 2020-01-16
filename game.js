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
    this.isDrawing = false;
    this.currentTileType = BRICK;
    this.justToggledTile = { tileCol: -1, tileRow: -1 };
  }
  fire(bullets) {
    let xDirection = this.yDirection === 0 ? this.xDirection : 0;
    bullets.push(new Bullet(this.x, this.y, xDirection, this.yDirection));
  }
  die() {
    this.yDelta = 0;
    this.xDelta = 0;
    this.x = 100;
    this.y = 100;
    this.onGround = false;
  }
  toggleBrick( tilesMatrix, { tileCol, tileRow } ){
    if (tileCol !== this.justToggledTile.tileCol || tileRow !== this.justToggledTile.tileRow)  {
      tilesMatrix[tileRow][tileCol] === EMPTY ? tilesMatrix[tileRow][tileCol] = this.currentTileType : tilesMatrix[tileRow][tileCol] = 0;
      this.justToggledTile = { tileCol, tileRow };
    }
  }
  _applyGravity() {
    if (!this.onGround) {
      this.yDelta += GRAVITY;
    }
    this.y += this.yDelta;
  }
  _detectSurroundings(tilesMatrix) {
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
    this.touchingACoin = this.tileValuesAroundPlayer.indexOf(COIN);
  }

  _detectCollisions(tilesMatrix) {
    if (this.touchingACoin !== -1) {
      const targetTile = this.tilesAroundPlayer[this.touchingACoin]
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

  updatePosition(tilesMatrix) {
    this._applyGravity();
    this._detectSurroundings(tilesMatrix);
    this._detectCollisions(tilesMatrix);
    this._movePlayerLeftRight();
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = 'red';
    this.radius = 15;
    this.deleteFlag = false;
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
    this.deleteFlag = false;
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

class Game {
  constructor(canvasId, canvasWidth, canvasHeight) {
    this.enemies = [];
    this.bullets = [];
    this.player = new Player(100, 100, this.bullets);
    this.tilesMatrix = generateTilesMatrix();
    this.gameCanvas = document.getElementById(canvasId);
    this.gameCanvas.width = canvasWidth;
    this.gameCanvas.height = canvasHeight;
  }

  play() {
    this._init();
    setInterval(() => this._mainLoop(), 1000/FRAMES_PER_SECOND);
    setInterval(() => this.enemies.push(new Enemy(getRandomInt(this.gameCanvas.width), getRandomInt(this.gameCanvas.height))), 3000);
  }

  _init() {
    this._addGameEventListeners(this.gameCanvas, this.player);
    this._addCoinToTilesMatrix(this.tilesMatrix);
  }

  _mainLoop() {
    this._moveAll();
    this._drawAll(this.gameCanvas, this.tilesMatrix);
  }

  _moveAll() {
    this.enemies = this.enemies.filter(enemy => !enemy.deleteFlag);
    this.bullets = this.bullets.filter(bullet => !bullet.deleteFlag);
  
    this.player.updatePosition(this.tilesMatrix);
    if(this.player.touchingACoin !== -1) {
      this._addCoinToTilesMatrix(this.tilesMatrix);
    }
  
    this.enemies.forEach(enemy => {
      enemy.updatePosition(this.player);
      enemy.tryToKillPlayer(this.player);
    });
  
    this.bullets.forEach(bullet => {
      bullet.updatePosition();
      if(bullet.isOutOfBounds()) {
        bullet.deleteFlag = true;
      }
      this.enemies.forEach(enemy => {
        if (bullet.collidedWithEnemy(enemy)) {
          bullet.deleteFlag = true;
          enemy.deleteFlag = true;
        }
      })
    });
  }

  _drawAll() {
    drawRect({ canvas: this.gameCanvas, x: 0, y: 0, height: CANVAS_HEIGHT, width: CANVAS_WIDTH, color: 'black' });
    drawTiles(this.gameCanvas, this.tilesMatrix);
    drawPlayer({canvas: this.gameCanvas, ...this.player});
    drawEnemies(this.gameCanvas, this.enemies);
    drawBullets(this.gameCanvas, this.bullets);
  }

  _addCoinToTilesMatrix(tilesMatrix) {
    tilesMatrix[getRandomInt(NUMBER_OF_ROWS - 1)][getRandomInt(NUMBER_OF_COLUMNS - 1)] = COIN
  }

  _addGameEventListeners(gameCanvas, player) {
    gameCanvas.addEventListener('mousedown', _ => {
      this.player.isDrawing = true;
    })
    gameCanvas.addEventListener('mouseup', evt => {
      this.player.isDrawing = false;
      const mousePos = getMousePos(gameCanvas, evt);
      this.player.toggleBrick(this.tilesMatrix, getTileFromPos(mousePos))
      this.justToggledTile = { tileCol: -1, tileRow: -1 };
    })
    gameCanvas.addEventListener('mousemove', evt => {
      if (this.player.isDrawing) {
        const mousePos = getMousePos(gameCanvas, evt);
        this.player.toggleBrick(this.tilesMatrix, getTileFromPos(mousePos))
      } 
    });
  
    document.body.onkeydown = evt =>{
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
        player.fire(this.bullets);
      }
    }
  }
}


const getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max));
}

window.onload = () => {
  const game = new Game('gameCanvas', CANVAS_WIDTH, CANVAS_HEIGHT);
  game.play();
}

const drawRect = ({canvas, x, y , width, height, color}) => {
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height);
}

const drawTiles = (gameCanvas, tilesMatrix) => {
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

const getTileFromPos = ({ x, y }) => {
  const tileCol = Math.floor(x / TILE_WIDTH);
  const tileRow = Math.floor(y / TILE_HEIGHT);
  return { tileCol, tileRow }
}

const generateTilesMatrix = () => {
  const tilesMatrix = [];
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
  return tilesMatrix;
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

const drawEnemies = (gameCanvas, enemies) => {
  enemies.forEach(enemy => {
    drawPlayer({canvas: gameCanvas, ...enemy})
  })
}

const drawBullets = (gameCanvas, bullets) => {
  bullets.forEach(bullet => {
    drawPlayer({canvas: gameCanvas, ...bullet})
  })
}