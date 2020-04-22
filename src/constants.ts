export const CANVAS_WIDTH: number = 800;
export const CANVAS_HEIGHT: number = 600;
export const NUMBER_OF_COLUMNS: number = 40;
export const NUMBER_OF_ROWS: number = 30;
export const TILE_WIDTH: number = CANVAS_WIDTH / NUMBER_OF_COLUMNS;
export const TILE_HEIGHT: number = CANVAS_HEIGHT / NUMBER_OF_ROWS;
export const FRAMES_PER_SECOND: number = 60;
export const GRAVITY: number = 0.6;

export const LEFT: number = 65; // A
export const RIGHT: number = 68; // D
export const UP: number = 87; // W
export const DOWN: number = 83; // S
export const JUMP: number = 16;  // ?
export const FIRE: number = 191; // R-SHIFT

export const EMPTY: number = 0;
export const BRICK: number = 1;
export const COIN: number = 2;

export const PLAYER_SPEED: number = 3;
export const ENEMY_SPEED: number = 0.8;

export const BACKGROUND_COLOR: string = 'skyblue';
export const PLAYER_COLOR: string = 'white';
export const BULLET_COLOR: string = 'darkslategray';
export const BASIC_ENEMY_COLOR: string = 'magenta';
export const WOBBLY_ENEMY_COLOR: string = 'blue';
export const ZIG_ZAG_ENEMY_COLOR: string = 'red'
export const COIN_COLOR: string = 'yellow';
export const TILE_COLOR: string = 'darkgreen';