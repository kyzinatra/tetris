import { Matrix } from "../utils/Matrix";
import { Figure } from "../figures/figure";
import { Point } from "../figures/point";

export class GameMap extends Matrix {
	figures: Figure[] = [];

	constructor(width = 10, height = 20) {
		// super() вызывает конструктор родительского класса
		super(width, height);
	}

	push(figure: Figure) {
		if (this.figures.indexOf(figure) != -1) return this;
		this.figures.push(figure);
		return this;
	}

	remove(figure: Figure) {
		const index = this.figures.indexOf(figure);
		if (index == -1) return this;

		this.figures.splice(index, 1);
		return this;
	}

	clear() {
		this.figures = [];
		return this;
	}

	// фиксирует фигуру на карте
	fixate(figure: Figure) {
		this.remove(figure);
		for (let [x, y, value] of figure) {
			if (this.get(new Point(x + figure.x, y + figure.y))) continue;
			// получаем точку фигуры на карте и фиксируем ее значение. Саму фигуру удаляем
			this.set(new Point(x + figure.x, y + figure.y), value);
		}
	}
	// Очищаем нижнюю линию, если она полная b сдвигаем все элементы на 1 вниз
	clearLines() {
		let counter = 0;
		for (let y = 0; y < this.height; y++) {
			// если все элементы в строке заполнены, то очищаем строку и сдвигаем все элементы на 1 вниз
			if (this.getRow(y).every(Boolean)) {
				this.clearLine(y);
				this.moveLinesDown(y);
				counter++;
			}
		}
		return counter;
	}

	clearLine(y: number) {
		this.setRow(
			y,
			this.getRow(y).map(() => 0)
		);
	}
	// сдвигаем все элементы на 1 вниз, которые выше y
	moveLinesDown(y: number) {
		// Замечу, что самый верх карты y = 0
		for (let i = y - 1; i >= 0; i--) {
			this.setRow(i + 1, this.getRow(i));
		}
		this.clearLine(0);
	}
}
