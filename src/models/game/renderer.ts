import { Figure } from "../figures/figure";
import { GameMap } from "./map";

export class GameRenderer {
	size: number = 30; // c
	ctx: CanvasRenderingContext2D;

	constructor(private map: GameMap, private elem: HTMLCanvasElement, stratch = true) {
		if (stratch) this.size = ~~(document.documentElement.clientHeight / map.height);
		const { width, height } = map;
		const wSize = width * this.size;
		const hSize = height * this.size;

		this.ctx = elem.getContext("2d") as CanvasRenderingContext2D;
		// set canvas size
		this.elem.width = wSize;
		this.elem.height = hSize;
		this.elem.style.width = `${wSize}px`;
		this.elem.style.height = `${hSize}px`;
	}

	render() {
		const { size, ctx, map } = this;
		const { width, height } = this.map;

		// Очищаем область рисования
		ctx.clearRect(0, 0, width * size, height * size);

		// Рисуем карту
		for (let [x, y, value] of map.entries()) {
			const color = Figure.getColor(value);

			const X = x * size;
			const Y = y * size;

			ctx.beginPath();

			ctx.strokeStyle = "#dddddd";
			ctx.fillStyle = color;
			ctx.strokeRect(X, Y, size, size);
			ctx.fillRect(X + 1, Y + 1, size - 1, size - 1);

			ctx.closePath();
		}

		// Рисуем фигуры
		for (let figure of map.figures) {
			let { x: vX, y: vY } = figure;

			vX *= size;
			vY *= size;

			for (let [x, y, value] of figure.entries()) {
				const color = Figure.getColor(value) || "transparent";

				x *= size;
				y *= size;

				ctx.beginPath();

				ctx.strokeStyle = "#dddddd";
				ctx.fillStyle = color;
				ctx.fillRect(x + vX + 1, y + vY + 1, size - 1, size - 1);

				ctx.closePath();
			}
		}
	}
}
