import { CANVAS_HEIGHT, CANVAS_WIDTH, BULLET_COLOR, BULLET_SPEED } from '../constants';
import { Enemy } from './enemy';
import CircularSprite from './circularSprite';

export default class Bullet extends CircularSprite {
  deleteFlag: boolean;
  
  constructor(x: number, y: number, dx: number, dy: number) {
    super({center: {x: x, y: y}, dx: dx, dy: dy, radius: 3, color: BULLET_COLOR, speed: BULLET_SPEED});
    this.deleteFlag = false;
  }

  updatePosition() {
    let bulletSpeed = this.speed;

    // Kind of hacky, and I should use trig to solve this
    // But if the bullet is traveling in both the x and y directions
    // We slow it down so that it has about the same speed
    // As if it were only moving only along one axis
    if (this.dx !== 0 && this.dy !== 0) { bulletSpeed *= 0.6; }

    this.x += this.dx * bulletSpeed;
    this.y += this.dy * bulletSpeed;
  }

  isOutOfBounds() {
    return this.x > CANVAS_WIDTH || this.x < 0 || this.y > CANVAS_HEIGHT || this.y < 0;
  }

  collidedWithEnemy(enemy: Enemy) {
    return this.x > enemy.x - enemy.radius && this.x < enemy.x + enemy.radius && this.y > enemy.y - enemy.radius && this.y < enemy.y + enemy.radius;
  }
}
