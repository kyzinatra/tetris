import { numberFormatter } from "../../utils/number-formatter";
import { Modal } from "../components/modal";
import { makeKeysListeners } from "../figures/controllers/keys";
import { GameStorage } from "../figures/controllers/storage";

export class Layout {
	// Создаем объект с названиями клавиш и их кодами. makeKeysListeners - отслеживает нажатие клавиш
	keys = makeKeysListeners({
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

	#score = 0;
	#highScore = GameStorage.getHighScore();
	#deletedLines = 0;

	get score() {
		return this.#score;
	}
	set score(value) {
		this.#score = value;
		this.scoreElement.querySelector("span")!.textContent = `${numberFormatter(value)}`;
	}

	get deletedLines() {
		return this.#deletedLines;
	}
	set deletedLines(value) {
		this.#deletedLines = value;
		this.linesElement.querySelector("span")!.textContent = `${numberFormatter(value)}`;
	}

	get highScore() {
		return this.#highScore;
	}

	set highScore(value: number) {
		const oldRecord = GameStorage.getHighScore();
		this.#highScore = Math.max(value, oldRecord);

		this.highScoreElement.querySelector("span")!.textContent = `${numberFormatter(this.#highScore)}`;
		GameStorage.setHighScore(this.#highScore);
	}

	stopGame(callback: () => void) {
		const modal = new Modal("#records", true);

		modal.onClose(callback);
		modal.dialog.querySelector("#records_content")!.innerHTML = `
						<ul>
						${GameStorage.getUserRecordsTable()
							.map((record) => `<li>${record.username} - ${record.record} очков</li>`)
							.join("")}
						</ul>
					`;
	}
}
