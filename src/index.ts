import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';
import Game from './game';

window.onload = (): void => {
  const game = new Game('gameCanvas', CANVAS_WIDTH, CANVAS_HEIGHT);
  game.play();
}