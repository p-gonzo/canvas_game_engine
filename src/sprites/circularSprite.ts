import { DrawCircleArgs, CircularSpriteConstructorArgs, Circle } from '../interfaces';

const drawCircle = ({canvas, center, radius, color} : DrawCircleArgs) => {
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
}
export default class CircularSprite {
    x: number;
    y: number;
    dx: number;
    dy: number;
    radius: number;
    color: string;
    speed: number;

    constructor(ctorArgs: CircularSpriteConstructorArgs) {
        this.x = ctorArgs.center.x;
        this.y = ctorArgs.center.y;
        this.radius = ctorArgs.radius;
        this.color = ctorArgs.color;
        this.speed = ctorArgs.speed;
        this.dx = ctorArgs.dx || 0;
        this.dy = ctorArgs.dy || 0;
    }

    draw(canvas: HTMLCanvasElement, target?: Circle) {
        if (target)
        {
            drawCircle({ canvas,  center: { x: target.center.x, y: target.center.y }, radius: target.radius, color: target.color});
        } else {
            drawCircle({ canvas,  center: { x: this.x, y: this.y }, radius: this.radius, color: this.color});
        }
    }
}