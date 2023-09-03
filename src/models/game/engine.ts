import { Figure } from "../figures/figure";
import { GameMap } from "./map";
import { GameRenderer } from "./renderer";
import { JFigure } from "../constants/figures";

JFigure;
export class GameEngine {
	// Ставим счетчики на текущий счет, рекорд и сколько всего удалено линий
	#score = 0;
	#highScore = +(localStorage.getItem("highscore") ?? 0);
	#deletedLines = 0;
	#pause = false;
	#work = false;

	#renderedFigures = 0;

	get score() {
		return this.#score;
	}
	set score(value) {
		this.#score = value;
	}

	get lines() {
		return this.#deletedLines;
	}
	set lines(value) {
		this.#deletedLines = value;
	}

	// Скорость падения фигурки
	get speed() {
		return 600 + ~~(this.#deletedLines / 10) * 15;
	}

	// // Создаем объект с названиями клавиш и их кодами. makeKeysListeners - отслеживает нажатие клавиш
	// #keys = makeKeysListeners({
	// 	rightMove: ["ArrowRight", "KeyD"],
	// 	leftMove: ["ArrowLeft", "KeyA"],
	// 	rotate: ["ArrowUp", "KeyW"],
	// 	downMove: ["ArrowDown", "KeyS"],
	// 	drop: ["Space", "KeyF"],
	// 	pause: ["Escape", "KeyP"],
	// 	restart: ["KeyR"],
	// });

	// Элементы информации
	scoreElement = document.getElementById("score") as HTMLParagraphElement;
	highScoreElement = document.getElementById("highScore") as HTMLParagraphElement;
	linesElement = document.getElementById("lines") as HTMLParagraphElement;
	pauseElement = document.getElementById("pause") as HTMLButtonElement;

	// Создаем карту и превью элемента (следующий элемент)
	map = new GameMap();
	preview = new GameMap(4, 4);

	mapRenderer: GameRenderer | null = null;
	previewRenderer: GameRenderer | null = null;

	currentFigure: Figure | null = null;
	nextFigure: Figure | null = null;

	renderFigure() {
		this.currentFigure = this.nextFigure ?? Figure.getRandomFigure(this.#renderedFigures++);
		this.nextFigure = Figure.getRandomFigure(this.#renderedFigures++);

		const x = 5;
		const y = 2;

		this.map.push(this.currentFigure.setPosition(x, y));
		this.preview.clear()!.push(this.nextFigure);

		this.mapRenderer!.render();
		this.previewRenderer!.render();
	}

	// конструктор new
	constructor(appSelector: string) {
		// ищем элемент по селектору
		const app = document.querySelector(appSelector) as HTMLCanvasElement;
		const preview = document.querySelector("#canvas_preview") as HTMLCanvasElement;
		// если элемент не найден, то выкидываем ошибку
		if (!app) throw new Error("App element not found");

		// создаем рендереры
		this.mapRenderer = new GameRenderer(this.map, app);
		this.previewRenderer = new GameRenderer(this.preview, preview);

		// Первый рендер фигур
		this.mapRenderer.render();
		this.previewRenderer.render();

		// создаем фигуры
		this.renderFigure();

		// обновляем счетчик лучшего результата
		this.highScoreElement.querySelector("span")!.textContent = `${this.#highScore}`;

		// добавляем обработчики событий на изменение размера окна и потерю фокуса
		addEventListener("blur", () => (this.#pause = true));
		this.pauseElement.addEventListener("click", () => (this.#pause = !this.#pause));
	}

	// запуск игры
	init() {
		if (this.#work) return;

		this.#work = true;
		this.tick();
	}

	stop() {
		this.#work = false;
	}

	tick(_time?: number) {
		if (!this.#work) return;
		this.mapRenderer!.render();
		this.previewRenderer!.render();
		requestAnimationFrame(this.tick.bind(this));
	}
}
