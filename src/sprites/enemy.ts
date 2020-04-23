import { BASIC_ENEMY_COLOR, WOBBLY_ENEMY_COLOR, ZIG_ZAG_ENEMY_COLOR } from '../constants';
import Player from './player';
import CircularSprite from './circularSprite';


class Enemy extends CircularSprite {
  deleteFlag: boolean;
  enemyPlayerXDelta: number;
  enemyPlayerYDelta: number;

  constructor(x: number, y: number) {
    super({center: {x: x, y: y}, color: BASIC_ENEMY_COLOR, radius: 15, speed: 1.3})
    this.deleteFlag = false;
  }

  updatePosition(player: Player) {
    this.enemyPlayerXDelta = player.x - this.x;
    this.enemyPlayerYDelta = player.y - this.y;
    
    this.dx = this.enemyPlayerXDelta == 0 ? 0 : this.enemyPlayerXDelta > 0 ? this.speed : this.speed * -1;
    this.dy = this.enemyPlayerYDelta == 0 ? 0 : this.enemyPlayerYDelta > 0 ? this.speed : this.speed * -1;

    this.x += this.dx;
    this.y += this.dy;
  }

  tryToKillPlayer(player: Player) {
    if (Math.abs(this.enemyPlayerXDelta) < player.radius + this.radius && Math.abs(this.enemyPlayerYDelta) < player.radius + this.radius) {
      player.die();
    }
  }
}

class ZigZagEnemy extends Enemy {

  circularMovementRadius: number;
  circularMovementSpeed: number;
  circularMovementAngle: number;

  constructor(x: number, y: number) {
    super(x, y);
    this.color = ZIG_ZAG_ENEMY_COLOR;
    this.speed = 1.3;
    this.circularMovementRadius = 8;
    this.circularMovementSpeed = 15;
    this.circularMovementAngle = 0;
  }

  updatePosition(player: Player) {

    super.updatePosition(player);
    
    let circleX  = this.circularMovementRadius * Math.cos(this.circularMovementAngle * (Math.PI/180));

    this.circularMovementAngle += this.circularMovementSpeed;
    this.x += circleX;
  }

}

class CircularEnemy extends ZigZagEnemy {

  constructor(x: number, y: number) {
    super(x, y);
    this.color = WOBBLY_ENEMY_COLOR;
    this.speed = 0.8;
    this.circularMovementRadius = 5;
    this.circularMovementSpeed = 10;
    this.circularMovementAngle = 0;
  }

  updatePosition(player: Player) {

    super.updatePosition(player);
    
    let circleY = this.circularMovementRadius * Math.sin(this.circularMovementAngle * (Math.PI/180));
    this.y += circleY;
  }

}

export { Enemy, CircularEnemy, ZigZagEnemy };