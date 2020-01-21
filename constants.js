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
const DOWN = 83;
const JUMP = 16;
const FIRE = 191;

const EMPTY = 0;
const BRICK = 1;
const COIN = 2;

const PLAYER_SPEED = 3;
const ENEMY_SPEED = 0.8;

const BACKGROUND_COLOR = 'skyblue';
const PLAYER_COLOR = 'white';
const BULLET_COLOR = 'darkslategray';
const BASIC_ENEMY_COLOR = 'magenta';
const WOBBLY_ENEMY_COLOR = 'blue';
const ZIG_ZAG_ENEMY_COLOR = 'red'
const COIN_COLOR = 'yellow';
const TILE_COLOR = 'darkgreen';