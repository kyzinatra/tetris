import { Figure } from "../figures/figure";
import { GameMap } from "./map";

export class Renderer {
	size: number = 30; // размер клетки в пикселях
	ctx: CanvasRenderingContext2D;
	lastRenderTime: number = performance.now();

	constructor(private map: GameMap, private elem: HTMLCanvasElement, stretch = true) {
		if (stretch) this.size = ~~(document.documentElement.clientHeight / map.height);
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

	render(speed: number) {
		const { size, ctx, map } = this;
		const { width, height } = this.map;

		// Очищаем область рисования
		ctx.clearRect(0, 0, width * size, height * size);

		// Рисуем карту
		for (let [x, y, value] of map) {
			const color = Figure.getColor(value);

			const X = x * size;
			const Y = y * size;

			ctx.beginPath();

			ctx.strokeStyle = "#dddddd";
			ctx.fillStyle = color;
			ctx.strokeRect(X, Y, size, size);
			ctx.fillRect(X, Y, size, size);

			ctx.closePath();
		}

		// Рисуем фигуры
		for (let figure of map.figures) {
			let { x: vX, y: vY, easeIn } = figure;

			vX *= size;
			vY *= size;
			const easeFactor = easeIn * size;

			for (let [x, y, value] of figure) {
				const color = Figure.getColor(value) || "transparent";

				x *= size;
				y *= size;

				ctx.beginPath();

				ctx.strokeStyle = "#dddddd";
				ctx.fillStyle = color;

				ctx.fillRect(x + vX, y + vY - easeFactor, size, size);

				ctx.closePath();
			}

			// Уменьшаем easeIn, чтобы плавно опустить фигуру
			if (figure.easeIn > 0) figure.easeIn -= 0.3 * (speed / 600);
			if (figure.easeIn < 0) figure.easeIn = 0;
		}
	}
}
