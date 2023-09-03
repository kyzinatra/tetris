import { Point } from "../models/figures/point";

type TEntry = [number, number, number];

export class SizedMatrix {
	width = 0;
	height = 0;
	map: Uint8Array;

	get clonedMap() {
		return new Uint8Array(this.map);
	}

	constructor(width: number, height: number) {
		this.map = new Uint8Array(width * height);
		this.width = width;
		this.height = height;
	}

	// возвращает массив с координатами и значением каждого элемента массива
	entries() {
		const { width, map: m } = this;
		const output = new Array<TEntry>(m.length);

		for (let i = 0; i < m.length; i++) {
			let x = i % width;
			let y = (i - x) / width;
			let value = m[i];

			output[i] = [x, y, value];
		}

		return output;
	}

	index(index: number | Point): number {
		if (index instanceof Point) {
			const { x, y } = index;
			if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;

			return y * this.width + x;
		}
		return index;
	}

	get(index: number | Point): number {
		return this.map[this.index(index)];
	}

	set(index: number | Point, value: number): number {
		return (this.map[this.index(index)] = value | 0);
	}

	matrix() {
		const matrix: number[][] = Array(this.height).map(() => Array(this.width));
		for (let i = 0; i < this.height; i++) {
			for (let j = 0; j < this.width; j++) {
				matrix[i] = matrix[i] || [];
				matrix[i][j] = this.get(new Point(j, i));
			}
		}
		return matrix;
	}
}
