interface IKeys {
	rightMove: string[];
	leftMove: string[];
	rotate: string[];
	downMove: string[];
	drop: string[];
	pause: string[];
	restart: string[];
}

// фиксируем нажатие клавиш в структуре Map (hash map)
const keymap = new Map<string, boolean>();
document.addEventListener("keydown", (e) => {
	keymap.set(e.code, true);
});
document.addEventListener("keyup", (e) => {
	keymap.set(e.code, false);
});

//? Не суть важно что тут происходит
//? Мы просто возвращаем объект, где к каждому ключу привязан свой контроллер
//? Условно obj.rightMove.isDown() вернет true если клавиша нажата
export function makeKeysListeners<T extends Partial<IKeys>>(keys: T) {
	return Object.entries(keys).reduce((acc, [key, value]) => {
		acc[key as keyof IKeys] = new KeyController(value);
		return acc;
	}, {} as { [key in keyof T]: KeyController });
}

export class KeyController {
	// принимаем отслеживаемую клавишу
	constructor(private keys: string[]) {
		this.keys = keys;
	}

	// проверяем нажата ли клавиша
	isDown() {
		return this.keys.some((key) => keymap.get(key));
	}

	// проверяем отпущена ли клавиша
	isUp() {
		return !this.isDown();
	}
}
