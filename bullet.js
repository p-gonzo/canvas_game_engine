class Bullet {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.color = BULLET_COLOR;
    this.radius = 3;
    this.speed = 15;
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

  draw(canvas) {
    drawCircle({ canvas, ...this });
  }
}