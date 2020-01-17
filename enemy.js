class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = 'red';
    this.radius = 15;
    this.deleteFlag = false;
  }

  updatePosition(player) {
    this.enemyPlayerXDelta = player.x - this.x;
    this.enemyPlayerYDelta = player.y - this.y;
    
    const enemyXDelta = this.enemyPlayerXDelta == 0 ? 0 : this.enemyPlayerXDelta > 0 ? ENEMY_SPEED : ENEMY_SPEED * -1;
    const enemyYDelta = this.enemyPlayerYDelta == 0 ? 0 : this.enemyPlayerYDelta > 0 ? ENEMY_SPEED : ENEMY_SPEED * -1;

    this.x += enemyXDelta;
    this.y += enemyYDelta;

    this.circularMovementAngle += this.circularMovementSpeed;
  }

  tryToKillPlayer(player) {
    if (Math.abs(this.enemyPlayerXDelta) < player.radius + this.radius && Math.abs(this.enemyPlayerYDelta) < player.radius + this.radius) {
      player.die();
    }
  }
}

class WobblyEnemy extends Enemy {

  constructor(x, y) {
    super(x, y);
    this.circularMovementRadius = 1;
    this.circularMovementSpeed = 5;
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