import { SizedMatrix } from "../../utils/sizedMatrix";
import { Figure } from "../figures/figure";
import { Point } from "../figures/point";

export class GameMap extends SizedMatrix {
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
		if (index == -1) throw new Error("Figure not found");

		this.figures.splice(index, 1);
		return this;
	}

	clear() {
		this.figures.slice(0);
		return this;
	}

	// фиксирует фигуру на карте
	fix(figure: Figure) {
		this.remove(figure);
		for (let [x, y, value] of figure.entries()) {
			// получаем точку фигуры на карте и фиксируем ее значение. Саму фигуру удаляем
			this.set(new Point(x + figure.x, y + figure.y), value);
		}
	}
}
