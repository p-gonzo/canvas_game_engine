const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const NUMBER_OF_COLUMNS = 20;
const NUMBER_OF_ROWS = 15;
const TILE_WIDTH = CANVAS_WIDTH / NUMBER_OF_COLUMNS;
const TILE_HEIGHT = CANVAS_HEIGHT / NUMBER_OF_ROWS;
const FRAMES_PER_SECOND = 60;
const GRAVITY = 0.6;

let tilesMatrix = [];
let isDrawing = false;
let justToggledTile = {tileCol: -1, tileRow: -1};

player = {
    yDelta: 0,
    x: 100,
    y: 100,
    radius: 15,
    color: 'red',
    onGround: false,
    keyHoldRight: false,
    keyHoldLeft: false
}

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
    populateTilesMatrix();
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
    drawPlayer({canvas:gameCanvas, ...player})
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

    // Only look for a player <> tile collision if the player is on the visible board
    if (!(playerFeet.tileRow < 0 || playerFeet.tileRow > NUMBER_OF_ROWS - 1 || playerFeet.tileCol < 0 || playerFeet.tileCol > NUMBER_OF_COLUMNS - 1)) {
        const playerFeetTile = tilesMatrix[playerFeet.tileRow][playerFeet.tileCol]
        const playerRightSideTile = tilesMatrix[playerRightSide.tileRow][playerRightSide.tileCol]
        const playerLeftSideTile = tilesMatrix[playerLeftSide.tileRow][playerLeftSide.tileCol]
        
        if (playerFeetTile === 1 && player.yDelta > 0 && player.y - player.radius < playerFeet.tileRow * TILE_HEIGHT) { // Player is falling and lands on tile
            player.onGround = true;
            player.yDelta = 0;
        } else if (playerFeetTile === 0) {
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
    }


    // Reset player if they fall
    if (player.y > CANVAS_HEIGHT + 100) {
        player = {...player, x:100, y:100, yDelta: 0} 
    }

    

    // To prevent a player from sinking into the ground
    if (player.onGround && player.y + player.radius > (playerFeet.tileRow * TILE_HEIGHT)) {
        player.y = playerFeet.tileRow * TILE_HEIGHT - player.radius;
    }

    // Move player left or right
    if (player.keyHoldLeft) {
        player.x -= 3
    }
    if (player.keyHoldRight) {
        player.x += 3
    }
}

const drawRect = ({canvas, x, y , width, height, color}) => {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color
    ctx.fillRect(x, y, width, height);
}

const drawTiles = (canvas) => {
    tilesMatrix.forEach((row, rowIdx) => {
        row.forEach((_, columnIdx) => {
            var currentTile = tilesMatrix[rowIdx][columnIdx]
            var currentTileX = columnIdx * TILE_WIDTH;
            var currentTileY = rowIdx * TILE_HEIGHT
            if (currentTile === 1) {
                drawRect({canvas: gameCanvas, x:currentTileX, y:currentTileY, height: TILE_HEIGHT - 1, width: TILE_WIDTH - 1, color: 'blue'})
            }
        });
    });
}

const getMousePos = (canvas, evt) => {
    var rect = canvas.getBoundingClientRect();
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
        if(evt.keyCode == 32){
            if (player.onGround) {
                player.yDelta = -10;
            }
        } else if (evt.keyCode == 37) {
            player.keyHoldLeft = true;
        } else if (evt.keyCode == 39) {
            player.keyHoldRight = true;
        }
    }

    document.body.onkeyup = (evt) =>{
        if (evt.keyCode == 37) {
            player.keyHoldLeft = false;
        } else if (evt.keyCode == 39) {
            player.keyHoldRight = false;
        }
    }

}

const getTileFromPos = ({x, y}) => {
    const tileCol = Math.floor(x / TILE_WIDTH);
    const tileRow = Math.floor(y / TILE_HEIGHT);
    return {tileCol, tileRow}
}

const toggleBrick = ({tileCol, tileRow}) => {
    if (tileCol !== justToggledTile.tileCol || tileRow !== justToggledTile.tileRow)  {
        tilesMatrix[tileRow][tileCol] = Number(!tilesMatrix[tileRow][tileCol])
        justToggledTile = {tileCol, tileRow}
    }
}

const populateTilesMatrix = () => {
    for (let i = 0; i < NUMBER_OF_ROWS; i ++) {
        tilesMatrix.push([])
        for (let j = 0; j < NUMBER_OF_COLUMNS; j ++) {
            tilesMatrix[i].push(0)
        }
    }
}

const drawPlayer = ({canvas, x, y , radius, color}) => {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y , radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
}