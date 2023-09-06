interface TRecord {
	username: string;
	record: number;
}

export class GameStorage {
	private static storage = localStorage; // Если нужен другой, то меняем

	static getHighScore(): number {
		return this.getUserRecordsTable().find((item) => item.username === this.getCurrentUser())?.record || 0;
	}
	static setHighScore(value: number | string) {
		const recordsTable = this.getUserRecordsTable();
		const user = recordsTable.find((item) => item.username === this.getCurrentUser());

		if (user) user.record = +value;
		else recordsTable.push({ username: this.getCurrentUser(), record: +value });

		this.storage.setItem("recordsTable", JSON.stringify(recordsTable));
	}

	static getUserRecordsTable() {
		return JSON.parse(this.storage.getItem("recordsTable") || "[]") as TRecord[];
	}

	static setCurrentUser(username: string) {
		this.storage.setItem("currentUser", username);
	}

	static getCurrentUser(): string {
		return this.storage.getItem("currentUser") || "";
	}
}
