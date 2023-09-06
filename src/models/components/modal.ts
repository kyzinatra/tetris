export class Modal {
	dialog: HTMLDialogElement;
	formData: FormData | null = null;

	constructor(public selector: string, openOnLoad = false) {
		this.dialog = document.querySelector(selector) as HTMLDialogElement;

		this.dialog.querySelector(".close")?.addEventListener("click", this.close.bind(this));
		this.dialog.querySelector("form")?.addEventListener("submit", (e) => {
			e.preventDefault();
			this.close();
		});
		if (openOnLoad) this.open();
	}

	open() {
		this.dialog.showModal();
	}

	private close() {
		this.dialog.close();
	}

	onClose(callback: (data: FormData) => void) {
		this.dialog.addEventListener("close", () =>
			callback(new FormData(this.dialog.querySelector("form") as HTMLFormElement))
		);
	}
}
