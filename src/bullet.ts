import { CANVAS_HEIGHT, CANVAS_WIDTH, BULLET_COLOR } from './constants';
import { drawCircle, DrawCircleArgs } from './lib';
import { Enemy } from './enemy';

export default class Bullet {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  radius: number;
  speed: number;
  deleteFlag: boolean;
  constructor(x: number, y: number, dx: number, dy: number) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.color = BULLET_COLOR;
    this.radius = 3;
    this.speed = 15;
    this.deleteFlag = false;
  }

  _makeDrawCircleArgs(): Omit<DrawCircleArgs, 'canvas'> {
    return { center: {x: this.x, y: this.y, }, radius: this.radius, color: this.color}
  }

  updatePosition() {
    this.x += this.dx * this.speed;
    this.y += this.dy * this.speed;
  }

  isOutOfBounds() {
    return this.x > CANVAS_WIDTH || this.x < 0 || this.y > CANVAS_HEIGHT || this.y < 0;
  }

  collidedWithEnemy(enemy: Enemy) {
    return this.x > enemy.x - enemy.radius && this.x < enemy.x + enemy.radius && this.y > enemy.y - enemy.radius && this.y < enemy.y + enemy.radius;
  }

  draw(canvas: HTMLCanvasElement) {
    drawCircle({ canvas, ...this._makeDrawCircleArgs() });
  }
}