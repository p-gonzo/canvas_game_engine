import { DrawCircleArgs } from './interfaces';

const drawCircle = ({canvas, center, radius, color} : DrawCircleArgs) => {
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}
export { drawCircle };
