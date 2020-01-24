import {
  NUMBER_OF_COLUMNS,
  NUMBER_OF_ROWS,
  TILE_HEIGHT,
  TILE_WIDTH,
  EMPTY,
  BRICK,
  TILE_COLOR,
  COIN_COLOR,
  COIN
} from './constants';

const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * Math.floor(max));
}

// interface Point {
//   x: number;
//   y: number;
// }

// interface BaseDrawArgs {
//   canvas: HTMLCanvasElement;
//   color: string;
// }

// interface DrawRectArgs extends BaseDrawArgs {
//   topLeft: Point;
//   width: number;
//   height: number;
// }

const drawRect = ({canvas, x, y , width, height, color} : {
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
}) => {
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height);
}

interface DrawCircleArgs {
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  radius: number;
  color: string;
}

const drawCircle = ({canvas, x, y , radius, color} : DrawCircleArgs) => {
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y , radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

const drawTiles = (gameCanvas: HTMLCanvasElement, tilesMatrix: number[][]) => {
  tilesMatrix.forEach((row: Array<number>, rowIdx: number) => {
    row.forEach((_: number, columnIdx: number) => {
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

const getMousePos = (canvas: HTMLCanvasElement, evt: MouseEvent) => {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

const getTileFromPos = ({ x, y }: {x: number, y: number}) => {
  const tileCol = Math.floor(x / TILE_WIDTH);
  const tileRow = Math.floor(y / TILE_HEIGHT);
  return { tileCol, tileRow }
}

const generateTilesMatrix = (): Array<Array<number>> => {
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


export {
  getRandomInt,
  drawRect,
  drawCircle,
  drawTiles,
  getMousePos,
  getTileFromPos,
  generateTilesMatrix,
}