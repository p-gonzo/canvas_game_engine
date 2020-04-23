interface TilePosition {
  tileCol: number;
  tileRow: number;
}

interface Point {
  x: number;
  y: number;
}

interface Shape {
  color: string;
}

interface Rect extends Shape {
  topLeft: Point;
  width: number;
  height: number;
}

interface Circle extends Shape {
  radius: number;
  center: Point;
}

interface DrawRectArgs extends Rect {
  canvas: HTMLCanvasElement;
}

interface DrawCircleArgs extends Circle {
  canvas: HTMLCanvasElement;
}

interface CircularSpriteConstructorArgs extends Circle {
  dx?: number;
  dy?: number;
  speed: number;
}

export {
  TilePosition,
  Point,
  Shape,
  Rect,
  Circle,
  DrawRectArgs,
  DrawCircleArgs, 
  CircularSpriteConstructorArgs
}