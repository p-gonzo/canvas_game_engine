const getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max));
}

const drawRect = ({canvas, x, y , width, height, color}) => {
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height);
}

const drawCircle = ({canvas, x, y , radius, color}) => {
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y , radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

const drawTiles = (gameCanvas, tilesMatrix) => {
  tilesMatrix.forEach((row, rowIdx) => {
    row.forEach((_, columnIdx) => {
      let currentTile = tilesMatrix[rowIdx][columnIdx]
      let currentTileX = columnIdx * TILE_WIDTH;
      let currentTileY = rowIdx * TILE_HEIGHT
      if (currentTile === BRICK) {
        drawRect({canvas: gameCanvas, x:currentTileX, y:currentTileY, height: TILE_HEIGHT - 1, width: TILE_WIDTH - 1, color: TILE_COLOR})
      }
      if (currentTile === COIN) {
        drawRect({canvas: gameCanvas, x:currentTileX, y:currentTileY, height: TILE_HEIGHT - 1, width: TILE_WIDTH - 1, color: COIN_COLOR})
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

const getTileFromPos = ({ x, y }) => {
  const tileCol = Math.floor(x / TILE_WIDTH);
  const tileRow = Math.floor(y / TILE_HEIGHT);
  return { tileCol, tileRow }
}

const generateTilesMatrix = () => {
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

const addCoinToTilesMatrix = () => {
  tilesMatrix[getRandomInt(NUMBER_OF_ROWS - 1)][getRandomInt(NUMBER_OF_COLUMNS - 1)] = COIN
}