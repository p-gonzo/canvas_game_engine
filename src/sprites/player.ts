import {
  PLAYER_COLOR,
  PLAYER_SPEED,
  BRICK,
  EMPTY,
  GRAVITY,
  COIN,
  CANVAS_HEIGHT,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  FIRE,
  JUMP,
  TILE_HEIGHT,
  TILE_WIDTH
} from '../constants';
import { TilePosition, Circle, Point } from '../interfaces'
import Bullet from './bullet'
import CircularSprite from './circularSprite';

const getTileFromPos = ({ x, y }: {x: number, y: number}) => {
  const tileCol = Math.floor(x / TILE_WIDTH);
  const tileRow = Math.floor(y / TILE_HEIGHT);
  return { tileCol, tileRow }
}

const getMousePos = (canvas: HTMLCanvasElement, evt: MouseEvent): Point => {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

export default class Player extends CircularSprite {
  onGround: boolean;
  keyHoldRight: boolean;
  keyHoldLeft: boolean;
  xDirection: number;
  yDirection: number;
  isDrawing: boolean;
  currentTileType: number;
  justToggledTile: TilePosition;
  bullets: Bullet[];
  playerFeet: TilePosition;
  playerRightSide: TilePosition;
  playerLeftSide: TilePosition;
  playerHead: TilePosition;
  playerFeetTile: number;
  playerRightSideTile: number;
  playerLeftSideTile: number;
  playerHeadTile: number;
  tileValuesAroundPlayer: number[];
  tilesAroundPlayer: TilePosition[];
  touchingACoin: number;

  constructor(x: number, y: number) {
    super({center: {x: x, y: y}, dy: 0, dx: 0, color: PLAYER_COLOR, speed: PLAYER_SPEED, radius: 15});
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
    // Add a portion of the player's velocity to the bullet
    let bulletDY = this.yDirection + this.dy/3;
    let bulletDX = this.xDirection + this.dx/3;

    // Don't move the bullet on the x axis if the player is still
    // And they are facing up or down
    if (this.dx === 0 && this.yDirection !== 0) { bulletDX = 0; }

    this.bullets.push(new Bullet(this.x, this.y, bulletDX, bulletDY));
  }
  die() {
    this.dy = 0;
    this.dx = 0;
    this.x = 100;
    this.y = 100;
    this.onGround = false;
  }
  toggleBrick( tilesMatrix: number[][], { tileCol, tileRow }: {tileCol: number, tileRow: number} ){
    if (tileCol !== this.justToggledTile.tileCol || tileRow !== this.justToggledTile.tileRow)  {
      tilesMatrix[tileRow][tileCol] === EMPTY ? tilesMatrix[tileRow][tileCol] = this.currentTileType : tilesMatrix[tileRow][tileCol] = 0;
      this.justToggledTile = { tileCol, tileRow };
    }
  }
  _applyGravity() {
    if (!this.onGround) {
      this.dy += GRAVITY;
    }
    this.y += this.dy;
  }
  _detectSurroundings(tilesMatrix: number[][]) {
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

  _detectCollisions(tilesMatrix: number[][]) {
    if (this.touchingACoin !== -1) {
      const targetTile = this.tilesAroundPlayer[this.touchingACoin]
      tilesMatrix[targetTile.tileRow][targetTile.tileCol] = EMPTY;
    }
    
    if (this.playerFeetTile === BRICK && this.dy > 0 && this.y - this.radius < this.playerFeet.tileRow * TILE_HEIGHT) { // Player is falling and lands on tile
      this.onGround = true;
      this.dy = 0;
    } else if (this.playerFeetTile === EMPTY) {
      this.onGround = false;
    }
    // If the payer is moving right, and they hit a block, stop them from moving right
    if (this.keyHoldRight && this.playerRightSideTile) {
      this.dx = 0;
    }
    // If the payer is moving left, and they hit a block, stop them from moving left
    if (this.keyHoldLeft && this.playerLeftSideTile) {
      this.dx = 0;
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

  _applyLeftRightKeypress() {
    this.dx = 0;
    if (this.keyHoldRight) {
      this.dx = this.speed;
    }
    if (this.keyHoldLeft) {
      this.dx = this.speed * -1;
    }
  }

  updatePosition(tilesMatrix: number[][]) {
    this._applyGravity();
    this._detectSurroundings(tilesMatrix);
    this._applyLeftRightKeypress();
    this._detectCollisions(tilesMatrix);
    
    this.x += this.dx; // finally update x
  }

  draw(canvas: HTMLCanvasElement) {
    super.draw(canvas);
    this._drawPlayerEyes(canvas);
  }

  _drawPlayerEyes(canvas: HTMLCanvasElement) {
    let playerEye1: Circle = { radius: this.radius / 5, color: 'black', center: {x: 0, y: 0} };
    let playerEye2: Circle;
    
    if (this.yDirection === 0 ) { // left or right
      playerEye1.center.y = this.y - this.radius / 2;
      if (this.xDirection === -1 ) { // left
        playerEye1.center.x = this.x - this.radius / 2;
      } else { // right
        playerEye1.center.x = this.x + this.radius / 2;
      }
      playerEye2 = {...playerEye1, center: { ...playerEye1.center } };
      playerEye2.center.x = playerEye1.center.x + playerEye1.radius * 2 * this.xDirection;
    } else if (this.yDirection === -1) { // up
      playerEye1.center.y = this.y - this.radius;
      playerEye1.center.x = this.x - this.radius / 4;
      playerEye2 = {...playerEye1, center: { ...playerEye1.center } };
      playerEye2.center.x = this.x + this.radius / 3;
    } else { // down
      playerEye1.center.y = this.y - this.radius / 4;
      playerEye1.center.x = this.x - this.radius / 4;
      playerEye2 = {...playerEye1, center: { ...playerEye1.center } };
      playerEye2.center.x = this.x + this.radius / 3;
    }
    super.draw(canvas, playerEye1);
    super.draw(canvas, playerEye2);
  }

  addEventListeners(gameCanvas: HTMLCanvasElement, tilesMatrix: number[][]) {
    gameCanvas.addEventListener('mousedown', _ => {
      this.isDrawing = true;
    });

    gameCanvas.addEventListener('mouseup', (evt:MouseEvent) => {
      this.isDrawing = false;
      const mousePos: Point = getMousePos(gameCanvas, evt);
      this.toggleBrick(tilesMatrix, getTileFromPos(mousePos))
      this.justToggledTile = { tileCol: -1, tileRow: -1 };
    });

    gameCanvas.addEventListener('mousemove', (evt:MouseEvent) => {
      if (this.isDrawing) {
        const mousePos: Point = getMousePos(gameCanvas, evt);
        this.toggleBrick(tilesMatrix, getTileFromPos(mousePos))
      } 
    });
  
    document.body.onkeydown = (evt:KeyboardEvent) => {
      if (evt.keyCode == JUMP && this.onGround) {
        this.dy = -10;
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
  
    document.body.onkeyup = (evt: KeyboardEvent) => {
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
