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
    setInterval(() => this.enemies.push(new WobblyEnemy(getRandomInt(this.gameCanvas.width), getRandomInt(this.gameCanvas.height))), 3000);
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
  
    document.body.onkeydown = evt => {
      if (evt.keyCode == JUMP && player.onGround) {
        player.yDelta = -10;
      } else if (evt.keyCode == UP) {
        player.yDirection = -1;
      } else if (evt.keyCode == DOWN) {
        player.yDirection = 1;
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
      } else if (evt.keyCode == UP || evt.keyCode == DOWN) {
        player.yDirection = 0;
      } else if (evt.keyCode == FIRE) {
        player.fire(this.bullets);
      }
    }
  }
}