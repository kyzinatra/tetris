import { random } from "../../utils/random";
import { SizedMatrix } from "../../utils/sizedMatrix";
import { GameMap } from "../game/map";
import { Point } from "./point";

export class Figure extends SizedMatrix {
	x = 0;
	y = 0;

	prevState = {
		x: this.x,
		y: this.y,
		map: this.map,
	};

	// Создает фигуру по шаблону
	static make(...rows: string[]) {
		const figure = new Figure(Math.max(...rows.map((a) => a.length)), rows.length);
		const color = random(0, 255);
		for (let [x, y] of figure.entries()) {
			const value = rows[y][x] != " " && rows[y][x] != "0";
			figure.set(new Point(x, y), value ? color : 0);
		}
		return figure;
	}

	// Создает случайную фигуру 3х3
	static getRandomFigure(_seed: number) {
		const isFull = (coff: number) => (Math.random() > 0.5 - coff ? "0" : "#");
		const repeat = () => {
			const f = isFull(0);
			const s = isFull(f == "#" ? 0.2 : 0);
			const t = isFull(s == "#" && f == "#" ? 0.4 : 0);
			return f + s + t;
		};

		const figure = Figure.make(repeat(), repeat(), repeat());

		return figure;
	}

	// Поворачивает фигуру на 90 градусов
	rotate() {
		const { width, height } = this;
		// Разворачиваем и размеры новой матрицы
		const newFigure = new Figure(height, width);

		for (let [x, y, value] of this.entries()) {
			const newX = height - y - 1;
			const newY = x;

			newFigure.set(new Point(newX, newY), value);
		}

		return newFigure;
	}

	save() {
		this.prevState = {
			x: this.x,
			y: this.y,
			map: this.clonedMap,
		};
		return this;
	}

	back() {
		this.x = this.prevState.x;
		this.y = this.prevState.y;
		this.map = this.prevState.map;
		return this;
	}

	move(x: number, y: number) {
		this.save();

		this.x += x;
		this.y += y;
		return this;
	}

	setPosition(x: number, y: number) {
		this.x = x;
		this.y = y;
		return this;
	}
	haveCollision(map: GameMap) {
		for (let [x, y, value] of this.entries()) {
			if (!value) continue;

			const mapX = this.x + x;
			const mapY = this.y + y;

			if (mapX < 0 || mapX >= map.width) return true;

			if (mapY < 0 || mapY >= map.height) return true;
		}
		return false;
	}

	// Вычисляет цвет фигуры по сиду (0-255)
	static getColor(randomSeed: number) {
		const format = (a: number) => a.toString(16).substring(0, 2).padStart(2, "0");
		const red = format(Math.floor(randomSeed * 248248));
		const green = format(Math.floor(randomSeed * 124000));
		const blue = format(Math.floor(randomSeed * 991230));

		const randomColor = `#${red}${green}${blue}`;

		if (randomColor === "#000000") return "transparent";
		return randomColor;
	}
}
