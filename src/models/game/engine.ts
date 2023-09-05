import { Figure } from "../figures/figure";
import { GameMap } from "./map";
import { Renderer } from "./renderer";
import { getRandomFigure } from "../constants/figures";
import { makeKeysListeners } from "../controllers/keys";

export class Engine {
	// Ставим счетчики на текущий счет, рекорд и сколько всего удалено линий
	#score = 0;
	#highScore = +(localStorage.getItem("highscore") ?? 0);
	#deletedLines = 0;
	#pause = true;
	#work = false;

	#renderedFigures = 0;
	#lastMoveTime = performance.now();

	get score() {
		return this.#score;
	}
	set score(value) {
		this.#score = value;
		this.scoreElement.querySelector("span")!.textContent = `${value}`;
	}

	get lines() {
		return this.#deletedLines;
	}
	set lines(value) {
		this.#deletedLines = value;
		this.linesElement.querySelector("span")!.textContent = `${value}`;
	}

	get highScore() {
		return this.#highScore;
	}

	set highScore(value) {
		this.#highScore = value;
		this.highScoreElement.querySelector("span")!.textContent = `${value}`;
		localStorage.setItem("highscore", `${value}`);
	}

	// Скорость падения фигурки
	get speed() {
		return 600 + ~~this.#deletedLines * 15;
	}

	// Создаем объект с названиями клавиш и их кодами. makeKeysListeners - отслеживает нажатие клавиш
	#keys = makeKeysListeners({
		rightMove: ["ArrowRight", "KeyD"],
		leftMove: ["ArrowLeft", "KeyA"],
		rotate: ["ArrowUp", "KeyW"],
		downMove: ["ArrowDown", "KeyS"],
		drop: ["Tab", "KeyF"],
		pause: ["Escape", "KeyP"],
		restart: ["KeyR", "F5"],
		hold: ["Space", "KeyE"],
	});

	// Элементы информации
	scoreElement = document.getElementById("score") as HTMLParagraphElement;
	highScoreElement = document.getElementById("highScore") as HTMLParagraphElement;
	linesElement = document.getElementById("lines") as HTMLParagraphElement;
	pauseElement = document.getElementById("pause") as HTMLButtonElement;
	contentElement = document.getElementById("content") as HTMLDivElement;

	// Создаем карту и превью элемента (следующий элемент)
	map = new GameMap();
	preview = new GameMap(4, 4);
	hold = new GameMap(4, 4);

	mapRenderer: Renderer | null = null;
	previewRenderer: Renderer | null = null;
	holdRenderer: Renderer | null = null;

	currentFigure: Figure | null = null;
	nextFigure: Figure | null = null;

	newFigure(x?: number, y?: number) {
		if (this.nextFigure) this.preview.remove(this.nextFigure);

		this.currentFigure = this.nextFigure ?? getRandomFigure(this.#renderedFigures++);
		this.nextFigure = getRandomFigure(this.#renderedFigures++);

		let newX = x || 4;
		let newY = y || 0;

		this.map.push(this.currentFigure.setPosition(newX, newY).pushInBounds(this.map));
		this.preview.clear()!.push(this.nextFigure);
	}

	// конструктор new
	constructor(appSelector: string) {
		// ищем элемент по селектору
		const app = document.querySelector(appSelector) as HTMLCanvasElement;
		const preview = document.querySelector("#canvas_preview") as HTMLCanvasElement;
		const hold = document.getElementById("canvas_hold") as HTMLCanvasElement;

		// если элемент не найден, то выкидываем ошибку
		if (!app) throw new Error("App element not found");

		// создаем рендереры
		this.mapRenderer = new Renderer(this.map, app);
		this.previewRenderer = new Renderer(this.preview, preview, false);
		this.holdRenderer = new Renderer(this.hold, hold, false);

		// Первый рендер фигур
		this.mapRenderer.render();
		this.previewRenderer.render();
		this.holdRenderer.render();

		// создаем фигуры
		this.newFigure();

		// обновляем счетчик лучшего результата
		this.highScoreElement.querySelector("span")!.textContent = `${this.#highScore}`;

		// добавляем обработчики событий на изменение размера окна и потерю фокуса
		addEventListener("resize", this.resize.bind(this, app));
		addEventListener("blur", () => (this.#pause = true));
		this.contentElement.addEventListener("click", () => (this.#pause = !this.#pause));
		this.pauseElement.addEventListener("click", () => (this.#pause = !this.#pause));
	}

	// запуск игры
	init() {
		if (this.#work) return;

		this.#work = true;
		this.frame();
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
		// Ставим класс show на кнопку паузы, если игра на паузе
		const pause = "pause";
		const { classList } = this.contentElement;

		if (this.#pause && !classList.contains(pause)) classList.add(pause);
		if (!this.#pause && classList.contains(pause)) classList.remove(pause);
	}

	// Метод для смены фигур в hold и наоборот
	swipeFigure() {
		if (!this.hold.figures.length) {
			this.hold.push(this.currentFigure!.clone());
			this.map.remove(this.currentFigure!);
			return this.newFigure(this.currentFigure!.x, this.currentFigure!.y);
		}
		const { x, y } = this.currentFigure!;
		const holden = this.hold.figures[0].clone().setPosition(x, y).pushInBounds(this.map);
		this.hold.clear();
		this.hold.push(this.currentFigure!.clone());
		this.map.remove(this.currentFigure!);
		this.map.push(holden);
		this.currentFigure = holden;
	}

	// Тут происходит обработка действий пользователя и рендер
	frame(time: number = performance.now()) {
		if (!this.#work) return;

		// сразу просим следующий кадр
		requestAnimationFrame(this.frame.bind(this));

		const { leftMove, restart, pause, rightMove, rotate, downMove, drop, hold } = this.#keys;

		if (restart.isDown()) this.restart();

		// Если игра на паузе, то делать нечего не нужно
		if (pause.isOnce()) this.#pause = !this.#pause;
		this.checkPause();
		if (this.#pause) return;

		let speed = this.speed; // скорость падения фигурки

		if (downMove.isDown()) speed *= 10;

		// Простые проверки на нажатие клавиш и вызов соответствующих методов
		if (rotate.isOnce()) this.currentFigure!.rotate();
		if (this.currentFigure?.haveCollision(this.map)) this.currentFigure?.back();

		if (leftMove.isOnce()) this.currentFigure?.move(-1, 0);
		if (rightMove.isOnce()) this.currentFigure?.move(1, 0);
		if (drop.isOnce()) {
			this.currentFigure?.drop(this.map);
			time = this.#lastMoveTime + 600000 / speed; // чтобы сразу проверить столкновение
		}

		if (hold.isOnce()) this.swipeFigure();

		// Проверка на столкновение со стенками
		if (this.currentFigure?.haveCollision(this.map)) this.currentFigure?.back();

		// Тут проверка на фиксацию фигурки и окончание игры
		if (time >= this.#lastMoveTime + 600000 / speed) {
			// Если прошло больше чем 600000 / speed , то фигурка падает вниз на 1 клетку
			this.currentFigure?.move(0, 1);
			this.#lastMoveTime = time;

			// Если фигурка столкнулась с чем-то, то фиксируем ее на карте
			if (this.currentFigure?.haveCollision(this.map)) {
				this.currentFigure.back();

				// Если фигурка столкнулась с верхней границей, то игра окончена
				if (this.currentFigure.haveTopCollision(this.map)) {
					this.stop();
					alert("Game over");
					return this.restart();
				}

				// Если фигурка столкнулась с чем-то, то фиксируем ее на карте
				this.map.fixate(this.currentFigure);
				const deleted = this.map.clearLines();
				this.newFigure();
				this.score += 1000;
				this.lines += deleted;
				this.highScore = Math.max(+(localStorage.getItem("highscore") || 0), this.score);
			}
		}

		this.mapRenderer!.render();
		this.previewRenderer!.render();
		this.holdRenderer!.render();
	}
}
