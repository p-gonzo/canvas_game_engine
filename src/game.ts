import {
  FRAMES_PER_SECOND,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  BACKGROUND_COLOR,
  NUMBER_OF_COLUMNS,
  NUMBER_OF_ROWS,
  COIN,
  BRICK,
  EMPTY,
  TILE_HEIGHT,
  TILE_WIDTH,
  COIN_COLOR,
  TILE_COLOR
} from './constants';
import { Enemy, CircularEnemy, ZigZagEnemy } from './sprites/enemy';
import { DrawRectArgs } from './interfaces';
import Player from './sprites/player';

const generateTilesMatrix = (): number[][] => {
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

const drawRect = ({canvas, topLeft , width, height, color} : DrawRectArgs ) => {
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = color
  ctx.fillRect(topLeft.x, topLeft.y, width, height);
}

const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * Math.floor(max));
}

const drawTiles = (gameCanvas: HTMLCanvasElement, tilesMatrix: number[][]) => {
  tilesMatrix.forEach((row: Array<number>, rowIdx: number) => {
    row.forEach((_: number, columnIdx: number) => {
      let currentTile = tilesMatrix[rowIdx][columnIdx]
      let currentTileX = columnIdx * TILE_WIDTH;
      let currentTileY = rowIdx * TILE_HEIGHT
      if (currentTile === BRICK) {
        drawRect({canvas: gameCanvas, topLeft: { x:currentTileX, y:currentTileY }, height: TILE_HEIGHT - 1, width: TILE_WIDTH - 1, color: TILE_COLOR})
      }
      if (currentTile === COIN) {
        drawRect({canvas: gameCanvas, topLeft: { x:currentTileX, y:currentTileY }, height: TILE_HEIGHT - 1, width: TILE_WIDTH - 1, color: COIN_COLOR})
      }
    });
  });
}


export default class Game {
  enemies: Enemy[];
  tilesMatrix: number[][];
  gameCanvas: HTMLCanvasElement;
  player: Player
  enemyTypes: (typeof Enemy | typeof ZigZagEnemy | typeof CircularEnemy )[];
  newEnemyTypeIndex: number;

  constructor(canvasId: string, canvasWidth: number, canvasHeight: number) {
    this.enemies = [];
    this.tilesMatrix = generateTilesMatrix();
    this.gameCanvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.gameCanvas.width = canvasWidth;
    this.gameCanvas.height = canvasHeight;
    this.player = new Player(100, 100);
    this.enemyTypes = [ Enemy, ZigZagEnemy, CircularEnemy ];
    this.newEnemyTypeIndex = 0;
  }

  play() {
    this._init();
    setInterval(() => this._mainLoop(), 1000/FRAMES_PER_SECOND);
    setInterval(() => {
      const newEnemyType = this.enemyTypes[this.newEnemyTypeIndex];
      this.enemies.push(new newEnemyType(getRandomInt(this.gameCanvas.width), getRandomInt(this.gameCanvas.height)));
      this.newEnemyTypeIndex = ++this.newEnemyTypeIndex % this.enemyTypes.length;
    }, 3000);
  }

  _init() {
    this.player.addEventListeners(this.gameCanvas, this.tilesMatrix)
    this._addCoinToTilesMatrix();
  }

  _mainLoop() {
    this._moveAll();
    this._drawAll();
  }

  _moveAll() {
    this.enemies = this.enemies.filter(enemy => !enemy.deleteFlag);
    this.player.bullets = this.player.bullets.filter(bullet => !bullet.deleteFlag);
  
    this.player.updatePosition(this.tilesMatrix);
    if(this.player.touchingACoin !== -1) {
      this._addCoinToTilesMatrix();
    }
  
    this.enemies.forEach(enemy => {
      enemy.updatePosition(this.player);
      enemy.tryToKillPlayer(this.player);
    });
  
    this.player.bullets.forEach(bullet => {
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
    drawRect({ canvas: this.gameCanvas, topLeft: { x: 0, y: 0 }, height: CANVAS_HEIGHT, width: CANVAS_WIDTH, color: BACKGROUND_COLOR });
    drawTiles(this.gameCanvas, this.tilesMatrix);
    this.player.draw(this.gameCanvas);
    this.enemies.forEach(enemy => enemy.draw(this.gameCanvas));
    this.player.bullets.forEach(bullet => bullet.draw(this.gameCanvas));
  }

  _addCoinToTilesMatrix() {
    this.tilesMatrix[getRandomInt(NUMBER_OF_ROWS - 1)][getRandomInt(NUMBER_OF_COLUMNS - 1)] = COIN
  }
}
