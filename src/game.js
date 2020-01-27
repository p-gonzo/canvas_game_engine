import {
  FRAMES_PER_SECOND,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  BACKGROUND_COLOR,
  NUMBER_OF_COLUMNS,
  NUMBER_OF_ROWS,
  COIN
} from './constants';
import { drawRect, drawTiles, getRandomInt, generateTilesMatrix } from './lib';
import { Enemy, WobblyEnemy, ZigZagEnemy } from './enemy';
import Player from './player';

export default class Game {
  constructor(canvasId, canvasWidth, canvasHeight) {
    this.enemies = [];
    this.tilesMatrix = generateTilesMatrix();
    this.gameCanvas = document.getElementById(canvasId);
    this.gameCanvas.width = canvasWidth;
    this.gameCanvas.height = canvasHeight;
    this.player = new Player(100, 100);
    this.enemyTypes = [ Enemy, ZigZagEnemy, WobblyEnemy ];
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
    this._drawAll(this.gameCanvas, this.tilesMatrix);
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