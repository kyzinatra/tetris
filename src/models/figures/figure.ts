import { Matrix } from "../utils/Matrix";
import { colors } from "../constants/colors";
import { GameMap } from "../game/map";
import { Point } from "./point";

export class Figure extends Matrix {
	x = 0;
	y = 0;

	prevState = {
		x: this.x,
		y: this.y,
		map: this.map,
		width: this.width,
		height: this.height,
	};

	easeIn: number = 0;

	clone() {
		const figure = new Figure(this.width, this.height);
		figure.map = this.cloneMap();
		return figure;
	}

	cloneWithCoords() {
		const figure = this.clone();
		figure.x = this.x;
		figure.y = this.y;
		return figure;
	}

	// Создает фигуру по шаблону
	static make(color: number, ...rows: string[]) {
		const figure = new Figure(Math.max(...rows.map((a) => a.length)), rows.length);

		for (let [x, y] of figure) {
			const value = rows[y][x] != " " && rows[y][x] != "0";
			figure.set(new Point(x, y), value ? color : 0);
		}
		return figure;
	}

	// Поворачивает фигуру на 90 градусов
	rotate() {
		const { width, height } = this;
		this.save();
		// Разворачиваем и размеры новой матрицы
		const newFigure = new Figure(height, width);

		for (let [x, y, value] of this) {
			const newX = height - y - 1;
			const newY = x;

			newFigure.set(new Point(newX, newY), value);
		}

		this.map = newFigure.map;
		this.width = newFigure.width;
		this.height = newFigure.height;
		return this;
	}

	save() {
		this.prevState = {
			x: this.x,
			y: this.y,
			map: this.cloneMap(),
			width: this.width,
			height: this.height,
		};
		return this;
	}

	back() {
		this.x = this.prevState.x;
		this.y = this.prevState.y;
		this.map = this.prevState.map;
		this.width = this.prevState.width;
		this.height = this.prevState.height;
		return this;
	}

	move(x: number, y: number) {
		this.save();
		if (y === 1) this.easeIn += 1;
		this.x += x;
		this.y += y;
	}

	drop(map: GameMap) {
		this.save();
		while (!this.haveCollision(map)) {
			this.y++;
		}
		this.y--;
	}

	pushInBounds(map: GameMap) {
		for (let [x, _, value] of this) {
			if (!value) continue;

			const mapX = this.x + x;
			if (mapX < 0) this.x++;
			if (mapX >= map.width) this.x--;
		}

		return this;
	}

	setPosition(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.save();
		return this;
	}
	haveCollision(map: GameMap) {
		for (let [x, y, value] of this) {
			if (!value) continue;

			const mapX = this.x + x;
			const mapY = this.y + y;

			if (mapX < 0 || mapX >= map.width) return true;

			if (mapY >= map.height) return true;

			if (map.get(new Point(mapX, mapY))) return true;
		}
		return false;
	}

	// Вычисляет цвет фигуры по сиду (0-8)
	static getColor(randomSeed: number) {
		if (randomSeed === 0) return "transparent";

		return colors[randomSeed];
	}
}
