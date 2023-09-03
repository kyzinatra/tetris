import { Figure } from "../figures/figure";
import { GameMap } from "./map";
import { GameRenderer } from "./renderer";
import { JFigure, getRandomFigure } from "../constants/figures";
import { makeKeysListeners } from "../controllers/keys";

JFigure;
export class GameEngine {
	// Ставим счетчики на текущий счет, рекорд и сколько всего удалено линий
	#score = 0;
	#highScore = +(localStorage.getItem("highscore") ?? 0);
	#deletedLines = 0;
	#pause = false;
	#work = false;

	#renderedFigures = 0;
	#lastMoveTime = performance.now();

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

	// Создаем объект с названиями клавиш и их кодами. makeKeysListeners - отслеживает нажатие клавиш
	#keys = makeKeysListeners({
		rightMove: ["ArrowRight", "KeyD"],
		leftMove: ["ArrowLeft", "KeyA"],
		rotate: ["ArrowUp", "KeyW"],
		downMove: ["ArrowDown", "KeyS"],
		drop: ["Space", "KeyF"],
		pause: ["Escape", "KeyP"],
		restart: ["KeyR"],
	});

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
		this.currentFigure = this.nextFigure ?? getRandomFigure(this.#renderedFigures++);
		this.nextFigure = getRandomFigure(this.#renderedFigures++);

		const x = 4;
		const y = 0;

		this.map.push(this.currentFigure.setPosition(x, y));
		this.preview.clear()!.push(this.nextFigure);
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
		this.previewRenderer = new GameRenderer(this.preview, preview, false);

		// Первый рендер фигур
		this.mapRenderer.render();
		this.previewRenderer.render();

		// создаем фигуры
		this.renderFigure();

		// обновляем счетчик лучшего результата
		this.highScoreElement.querySelector("span")!.textContent = `${this.#highScore}`;

		// добавляем обработчики событий на изменение размера окна и потерю фокуса
		addEventListener("resize", this.resize.bind(this, app));
		addEventListener("blur", () => (this.#pause = true));
		this.pauseElement.addEventListener("click", () => (this.#pause = !this.#pause));
	}

	// запуск игры
	init() {
		if (this.#work) return;

		this.#work = true;
		this.tick();
	}

	resize(elem: HTMLCanvasElement) {
		const { width, height } = this.map;

		const size = ~~(document.documentElement.clientHeight / height);

		const wSize = width * size;
		const hSize = height * size;

		// set canvas size
		elem.width = wSize;
		elem.height = hSize;
		elem.style.width = `${wSize}px`;
		elem.style.height = `${hSize}px`;
		this.mapRenderer!.size = size;
	}

	stop() {
		this.#work = false;
	}

	restart() {
		window.location.reload();
	}

	checkPause() {
		const show = "show";
		const { classList } = this.pauseElement;

		if (this.#pause && !classList.contains(show)) classList.add(show);
		if (!this.#pause && classList.contains(show)) classList.remove(show);
	}

	tick(time: number = performance.now()) {
		if (!this.#work) return;

		requestAnimationFrame(this.tick.bind(this));
		let pressDelay = 60;
		const { leftMove, restart, pause, rightMove, rotate, downMove } = this.#keys;

		if (pause.isSingle(pressDelay)) this.#pause = !this.#pause;
		if (restart.isDown()) this.restart();

		if (this.#pause) return this.checkPause();

		let speed = this.speed;

		if (downMove.isDown()) speed *= 10;

		console.log(this.currentFigure?.x, this.currentFigure?.y);
		if (rotate.isSingle(pressDelay)) this.currentFigure!.rotate();
		if (leftMove.isSingle(pressDelay)) this.currentFigure?.move(-1, 0);
		if (rightMove.isSingle(pressDelay)) this.currentFigure?.move(1, 0);

		if (time >= this.#lastMoveTime + 600000 / speed) {
			this.currentFigure?.move(0, 1);
			this.#lastMoveTime = time;

			if (this.currentFigure?.haveCollision(this.map)) {
				this.currentFigure.back();

				if (this.currentFigure.haveTopCollision(this.map)) {
					this.stop();
					alert("Game over");
					location.reload();
					return;
				}

				this.map.fix(this.currentFigure);
				this.renderFigure();
				this.#score += 1000;
			}
		}

		if (this.currentFigure?.haveCollision(this.map)) this.currentFigure?.back();

		this.mapRenderer!.render();
		this.previewRenderer!.render();
	}
}
