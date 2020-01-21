import { BASIC_ENEMY_COLOR, WOBBLY_ENEMY_COLOR, ZIG_ZAG_ENEMY_COLOR } from './constants';
import { drawCircle } from './lib'

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = BASIC_ENEMY_COLOR;
    this.radius = 15;
    this.speedRatio = 1.3;
    this.deleteFlag = false;
  }

  updatePosition(player) {
    this.enemyPlayerXDelta = player.x - this.x;
    this.enemyPlayerYDelta = player.y - this.y;
    
    const enemyXDelta = this.enemyPlayerXDelta == 0 ? 0 : this.enemyPlayerXDelta > 0 ? this.speedRatio : this.speedRatio * -1;
    const enemyYDelta = this.enemyPlayerYDelta == 0 ? 0 : this.enemyPlayerYDelta > 0 ? this.speedRatio : this.speedRatio * -1;

    this.x += enemyXDelta;
    this.y += enemyYDelta;
  }

  tryToKillPlayer(player) {
    if (Math.abs(this.enemyPlayerXDelta) < player.radius + this.radius && Math.abs(this.enemyPlayerYDelta) < player.radius + this.radius) {
      player.die();
    }
  }

  draw(canvas) {
    drawCircle({ canvas, ...this });
  }
}

class WobblyEnemy extends Enemy {

  constructor(x, y) {
    super(x, y);
    this.color = WOBBLY_ENEMY_COLOR;
    this.speedRatio = 0.8;
    this.circularMovementRadius = 5;
    this.circularMovementSpeed = 10;
    this.circularMovementAngle = 0;
  }

  updatePosition(player) {

    super.updatePosition(player);
    
    let circleX  = this.circularMovementRadius * Math.cos(this.circularMovementAngle * (Math.PI/180));
    let circleY = this.circularMovementRadius * Math.sin(this.circularMovementAngle * (Math.PI/180));

    this.circularMovementAngle += this.circularMovementSpeed;
    this.x += circleX;
    this.y += circleY;
  }

}

class ZigZagEnemy extends Enemy {

  constructor(x, y) {
    super(x, y);
    this.color = ZIG_ZAG_ENEMY_COLOR;
    this.speedRatio = 1.3;
    this.circularMovementRadius = 8;
    this.circularMovementSpeed = 15;
    this.circularMovementAngle = 0;
  }

  updatePosition(player) {

    super.updatePosition(player);
    
    let circleX  = this.circularMovementRadius * Math.cos(this.circularMovementAngle * (Math.PI/180));

    this.circularMovementAngle += this.circularMovementSpeed;
    this.x += circleX;
  }

}

export { Enemy, WobblyEnemy, ZigZagEnemy };