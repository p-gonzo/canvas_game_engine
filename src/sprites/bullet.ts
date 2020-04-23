import { CANVAS_HEIGHT, CANVAS_WIDTH, BULLET_COLOR } from '../constants';
import { Enemy } from './enemy';
import CircularSprite from './circularSprite';

export default class Bullet extends CircularSprite {
  deleteFlag: boolean;
  
  constructor(x: number, y: number, dx: number, dy: number) {
    super({center: {x: x, y: y}, dx: dx, dy: dy, radius: 3, color: BULLET_COLOR, speed: 15});
    this.deleteFlag = false;
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
}
