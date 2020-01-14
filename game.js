const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const NUMBER_OF_COLUMNS = 40;
const NUMBER_OF_ROWS = 30;
const TILE_WIDTH = CANVAS_WIDTH / NUMBER_OF_COLUMNS;
const TILE_HEIGHT = CANVAS_HEIGHT / NUMBER_OF_ROWS;
const FRAMES_PER_SECOND = 60;
const GRAVITY = 0.6;

const LEFT = 65;
const RIGHT = 68;
const UP = 87;
const FIRE = 32;

const EMPTY = 0;
const BRICK = 1;
const COIN = 2;

const PLAYER_SPEED = 3;
const ENEMY_SPEED = 0.5;

const TILE_TYPES = ['Bricks', 'Coins']


let tilesMatrix = [];
let isDrawing = false;
let justToggledTile = {tileCol: -1, tileRow: -1};
let currentTileType = BRICK;

player = {
  yDelta: 0,
  x: 100,
  y: 100,
  radius: 15,
  color: 'white',
  onGround: false,
  keyHoldRight: false,
  keyHoldLeft: false,
  xDirection: 1,
  yDirection: 0,
  fire: function() {
    let xDirection = this.yDirection === 0 ? this.xDirection : 0;
    bullets.push(new Bullet(this.x, this.y, xDirection, this.yDirection))
  },
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = 'red';
    this.radius = 15;
  }
}

class Bullet {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.color = 'white';
    this.radius = 5;
  }
}

const enemies = [];

const bullets = [];

const getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max));
}

setInterval(() => {
  enemies.push(new Enemy(
    getRandomInt(CANVAS_WIDTH), 
    getRandomInt(CANVAS_HEIGHT)))
  }, 3000);


const getCanvas = () => {
  return document.getElementById("gameCanvas");
}

const setCanvasSize = (gameCanvas) => {
  gameCanvas.height = CANVAS_HEIGHT;
  gameCanvas.width = CANVAS_WIDTH;
}

window.onload = () => {
  const gameCanvas = setupAndCreateCanvas();
  setInterval(() => updateAll(gameCanvas), 1000/FRAMES_PER_SECOND);
  addCanvasClickListener(gameCanvas);
  addTileToggleButtonClickListener();
  populateTilesMatrix();
  addCoinToTilesMatrix();
}

const setupAndCreateCanvas = () => {
  const gameCanvas = getCanvas();
  setCanvasSize(gameCanvas);
  return gameCanvas
}

const updateAll = (gameCanvas) => {
  moveAll();
  drawAll(gameCanvas);
}

const drawAll = (gameCanvas) => {
  drawRect({canvas: gameCanvas, x:0, y:0, height: CANVAS_HEIGHT, width: CANVAS_WIDTH, color: 'black'});
  drawTiles(gameCanvas);
  drawPlayer({canvas:gameCanvas, ...player});
  drawEnemies(gameCanvas);
  drawBullets(gameCanvas);
}

const moveAll = () => {
  // Apply player gravity
  if (!player.onGround) {
    player.yDelta += GRAVITY;
  }
  player.y += player.yDelta;

  // Detect player / tile collision

  // Get the tile that is beneath the player's feet
  const playerFeet = getTileFromPos({x: player.x, y: player.y + player.radius})
  const playerRightSide = getTileFromPos({x: player.x + player.radius, y: player.y})
  const playerLeftSide = getTileFromPos({x: player.x - player.radius, y: player.y})
  const playerHead = getTileFromPos({x: player.x, y: player.y - player.radius})

  // Only look for a player <> tile collision if the player is on the visible board
  const playerFeetTile = tilesMatrix[playerFeet.tileRow] === undefined ? 0 : tilesMatrix[playerFeet.tileRow][playerFeet.tileCol]
  const playerRightSideTile = tilesMatrix[playerRightSide.tileRow] === undefined ? 0 : tilesMatrix[playerRightSide.tileRow][playerRightSide.tileCol]
  const playerLeftSideTile = tilesMatrix[playerLeftSide.tileRow] === undefined ? 0 : tilesMatrix[playerLeftSide.tileRow][playerLeftSide.tileCol]
  const playerHeadTile = tilesMatrix[playerHead.tileRow] === undefined ? 0 : tilesMatrix[playerHead.tileRow][playerHead.tileCol]

  let tileValuesAroundPlayer = [playerFeetTile, playerRightSideTile, playerLeftSideTile, playerHeadTile];
  let tilesAroundPlayer = [playerFeet, playerRightSide, playerLeftSide, playerHead];
  let playerTouchingACoin = tileValuesAroundPlayer.indexOf(COIN)
  
  if (playerTouchingACoin !== -1) {
    const targetTile = tilesAroundPlayer[playerTouchingACoin]
    tilesMatrix[targetTile.tileRow][targetTile.tileCol] = EMPTY;
  }
  
  if (playerFeetTile === BRICK && player.yDelta > 0 && player.y - player.radius < playerFeet.tileRow * TILE_HEIGHT) { // Player is falling and lands on tile
    player.onGround = true;
    player.yDelta = 0;
  } else if (playerFeetTile === EMPTY) {
    player.onGround = false;
  }
  // If the payer is moving right, and they hit a block, stop them from moving right
  if (player.keyHoldRight && playerRightSideTile) {
    player.x -= 3;
  }
  // If the payer is moving left, and they hit a block, stop them from moving right
  if (player.keyHoldLeft && playerLeftSideTile) {
    player.x += 3;
  }

  // Reset player if they fall
  if (player.y > CANVAS_HEIGHT + 100 || player.y < -200) {
    player = {...player, x:100, y:100, yDelta: 0, onGround: false} 
  }

  // To prevent a player from sinking into the ground
  if (player.onGround && player.y + player.radius > (playerFeet.tileRow * TILE_HEIGHT)) {
    player.y = playerFeet.tileRow * TILE_HEIGHT - player.radius;
  }

  // Move player left or right
  if (player.keyHoldLeft) {
    player.x -= PLAYER_SPEED
  }
  if (player.keyHoldRight) {
    player.x += PLAYER_SPEED
  }

  // Move enemies
  enemies.forEach(enemy => {
    let enemyPlayerXDelta = player.x - enemy.x;
    let enemyPlayerYDelta = player.y - enemy.y;
    let enemyXDelta = enemyPlayerXDelta == 0 ? 0 : enemyPlayerXDelta > 0 ? ENEMY_SPEED : ENEMY_SPEED * -1;
    let enemyYDelta = enemyPlayerYDelta == 0 ? 0 : enemyPlayerYDelta > 0 ? ENEMY_SPEED : ENEMY_SPEED * -1;
    enemy.x += enemyXDelta;
    enemy.y += enemyYDelta;

    // player enemy collision
    if (Math.abs(enemyPlayerXDelta) < player.radius + enemy.radius && Math.abs(enemyPlayerYDelta) < player.radius + enemy.radius) {
      player = {...player, x:100, y:100, yDelta: 0, onGround: false} 
    }
  });

  // Move bullets
  currentBulletIndex = bullets.length - 1;
  while (currentBulletIndex >= 0) {
    let bullet = bullets[currentBulletIndex];
    bullet.x += bullet.dx * 10;
    bullet.y += bullet.dy * 10;
    if(
      bullet.x > CANVAS_WIDTH
      || bullet.x < 0
      || bullet.y > CANVAS_HEIGHT
      || bullet.y < 0
    ) {
      bullets.splice(currentBulletIndex, 1);
    }
  
    currentEnemyIndex = enemies.length - 1;
    while (currentEnemyIndex >= 0) {
      let enemy = enemies[currentEnemyIndex];
      if (
        bullet.x > enemy.x - enemy.radius
        && bullet.x < enemy.x + enemy.radius
        && bullet.y > enemy.y - enemy.radius
        && bullet.y < enemy.y + enemy.radius
      ) {
        enemies.splice(currentEnemyIndex, 1);
        bullets.splice(currentBulletIndex, 1);
      }
      currentEnemyIndex--;
    }
    currentBulletIndex--;
  }

  // Detect bullet enemy collision

}

const drawRect = ({canvas, x, y , width, height, color}) => {
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height);
}

const drawTiles = (canvas) => {
  tilesMatrix.forEach((row, rowIdx) => {
    row.forEach((_, columnIdx) => {
      let currentTile = tilesMatrix[rowIdx][columnIdx]
      let currentTileX = columnIdx * TILE_WIDTH;
      let currentTileY = rowIdx * TILE_HEIGHT
      if (currentTile === BRICK) {
        drawRect({canvas: gameCanvas, x:currentTileX, y:currentTileY, height: TILE_HEIGHT - 1, width: TILE_WIDTH - 1, color: 'blue'})
      }
      if (currentTile === COIN) {
        drawRect({canvas: gameCanvas, x:currentTileX, y:currentTileY, height: TILE_HEIGHT - 1, width: TILE_WIDTH - 1, color: 'gold'})
      }
    });
  });
}

const getMousePos = (canvas, evt) => {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

const addCanvasClickListener = (gameCanvas) => {
  gameCanvas.addEventListener('mousedown', _ => {
    isDrawing = true;
  })
  gameCanvas.addEventListener('mouseup', evt => {
    isDrawing = false;
    const mousePos = getMousePos(gameCanvas, evt);
    toggleBrick(getTileFromPos(mousePos))
    justToggledTile = {tileCol: -1, tileRow: -1};
})
  gameCanvas.addEventListener('mousemove', evt => {
    if (isDrawing) {
      const mousePos = getMousePos(gameCanvas, evt);
      toggleBrick(getTileFromPos(mousePos))
  }
  });

  document.body.onkeydown = (evt) =>{
    if(evt.keyCode == UP){
      if (player.onGround) {
        player.yDelta = -10;
        player.yDirection = -1;
      }
    } else if (evt.keyCode == LEFT) {
      player.keyHoldLeft = true;
      player.xDirection = -1;
    } else if (evt.keyCode == RIGHT) {
      player.keyHoldRight = true;
      player.xDirection = 1;
    }
  }

  document.body.onkeyup = (evt) =>{
    if (evt.keyCode == LEFT) {
      player.keyHoldLeft = false;
    } else if (evt.keyCode == RIGHT) {
      player.keyHoldRight = false;
    } else if (evt.keyCode == UP) {
      player.yDirection = 0;
    } else if (evt.keyCode == FIRE) {
      player.fire();
    }
  }

}

const addTileToggleButtonClickListener = () => {
  const toggleButton = document.getElementById('rotate-tile-types');
  const toggleText = document.getElementById('current-tile-type');
  toggleText.innerHTML = TILE_TYPES[currentTileType - 1];
  toggleButton.addEventListener('click', () => {
    if (currentTileType === TILE_TYPES.length) {
      currentTileType = BRICK;
    } else {
      currentTileType ++;
    }
    toggleText.innerHTML = TILE_TYPES[currentTileType - 1];
  });
}

const getTileFromPos = ({x, y}) => {
  const tileCol = Math.floor(x / TILE_WIDTH);
  const tileRow = Math.floor(y / TILE_HEIGHT);
  return {tileCol, tileRow}
}

const toggleBrick = ({tileCol, tileRow}) => {
  if (tileCol !== justToggledTile.tileCol || tileRow !== justToggledTile.tileRow)  {
    tilesMatrix[tileRow][tileCol] === EMPTY ? tilesMatrix[tileRow][tileCol] = currentTileType : tilesMatrix[tileRow][tileCol] = 0;
    justToggledTile = {tileCol, tileRow}
  }
}

const populateTilesMatrix = () => {
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
}

const addCoinToTilesMatrix = () => {
  tilesMatrix[getRandomInt(NUMBER_OF_ROWS - 1)][getRandomInt(NUMBER_OF_COLUMNS - 1)] = COIN
}

const drawPlayer = ({canvas, x, y , radius, color}) => {
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y , radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

const drawEnemies = (gameCanvas) => {
  enemies.forEach(enemy => {
    drawPlayer({canvas: gameCanvas, ...enemy})
  })
}

const drawBullets = (gameCanvas) => {
  bullets.forEach(bullet => {
    drawPlayer({canvas: gameCanvas, ...bullet})
  })
}