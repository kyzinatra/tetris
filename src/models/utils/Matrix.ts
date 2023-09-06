import { Point } from "../figures/point";

type TEntry = [number, number, number];

export class Matrix {
	width = 0;
	height = 0;
	map: Uint8Array;

	cloneMap() {
		return new Uint8Array(this.map);
	}

	constructor(width: number, height: number) {
		this.map = new Uint8Array(width * height);
		this.width = width;
		this.height = height;
	}

	// итератор с координатами и значением каждого элемента массива
	*[Symbol.iterator](): Generator<TEntry> {
		const { width, map } = this;

		for (let i = 0; i < map.length; i++) {
			let x = i % width;
			let y = (i - x) / width;
			let value = map[i];

			yield [x, y, value];
		}
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

	getRow(y: number) {
		return this.map.slice(y * this.width, (y + 1) * this.width);
	}

	set(index: number | Point, value: number): number {
		return (this.map[this.index(index)] = value | 0);
	}

	setRow(y: number, row: number[] | Uint8Array) {
		return this.map.set(row, y * this.width);
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
