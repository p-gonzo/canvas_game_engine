class Player{
  constructor(xPos, yPos) {
    this.x = xPos;
    this.y = yPos;
    this.yDelta = 0;
    this.xDelta = 0;
    this.radius = 15;
    this.color = PLAYER_COLOR;
    this.onGround = false;
    this.keyHoldRight = false;
    this.keyHoldLeft = false;
    this.xDirection = 1;
    this.yDirection = 0;
    this.isDrawing = false;
    this.currentTileType = BRICK;
    this.justToggledTile = { tileCol: -1, tileRow: -1 };
    this.bullets = [];
  }
  fire() {
    let xDirection = this.yDirection === 0 ? this.xDirection : 0;
    this.bullets.push(new Bullet(this.x, this.y, xDirection, this.yDirection));
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

  draw(canvas) {
    drawCircle({ canvas, ...this });
    this._drawPlayerEyes(canvas);
  }

  _drawPlayerEyes(canvas) {
    let playerEye1 = { radius: this.radius / 5, color: 'black' };
    let playerEye2;
    
    if (this.yDirection === 0 ) { // left or right
      playerEye1.y = this.y - this.radius / 2;
      if (this.xDirection === -1 ) { // left
        playerEye1.x = this.x - this.radius / 2;
      } else { // right
        playerEye1.x = this.x + this.radius / 2;
      }
      playerEye2 = {...playerEye1, x: playerEye1.x + playerEye1.radius * 2 * this.xDirection}
    } else if (this.yDirection === -1) { // up
      playerEye1.y = this.y - this.radius;
      playerEye1.x = this.x - this.radius / 4;
      playerEye2 = { ...playerEye1, x: this.x + this.radius / 3} ;
    } else { // down
      playerEye1.y = this.y - this.radius / 4;
      playerEye1.x = this.x - this.radius / 4;
      playerEye2 = { ...playerEye1, x: this.x + this.radius / 3} ;
    }
    drawCircle({ canvas, ...playerEye1 })
    drawCircle({ canvas, ...playerEye2 })
  }

  addEventListeners(gameCanvas, tilesMatrix) {
    gameCanvas.addEventListener('mousedown', _ => {
      this.isDrawing = true;
    });

    gameCanvas.addEventListener('mouseup', evt => {
      this.isDrawing = false;
      const mousePos = getMousePos(gameCanvas, evt);
      this.toggleBrick(tilesMatrix, getTileFromPos(mousePos))
      this.justToggledTile = { tileCol: -1, tileRow: -1 };
    });

    gameCanvas.addEventListener('mousemove', evt => {
      if (this.isDrawing) {
        const mousePos = getMousePos(gameCanvas, evt);
        this.toggleBrick(tilesMatrix, getTileFromPos(mousePos))
      } 
    });
  
    document.body.onkeydown = evt => {
      if (evt.keyCode == JUMP && this.onGround) {
        this.yDelta = -10;
      } else if (evt.keyCode == UP) {
        this.yDirection = -1;
      } else if (evt.keyCode == DOWN) {
        this.yDirection = 1;
      } else if (evt.keyCode == LEFT) {
        this.keyHoldLeft = true;
        this.xDirection = -1;
      } else if (evt.keyCode == RIGHT) {
        this.keyHoldRight = true;
        this.xDirection = 1;
      } else if (evt.keyCode == FIRE) {
        this.fire();
      }
    }
  
    document.body.onkeyup = (evt) => {
      if (evt.keyCode == LEFT) {
        this.keyHoldLeft = false;
      } else if (evt.keyCode == RIGHT) {
        this.keyHoldRight = false;
      } else if (evt.keyCode == UP || evt.keyCode == DOWN) {
        this.yDirection = 0;
      }
    }
  }
}