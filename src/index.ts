import { Modal } from "./models/components/modal";
import { GameStorage } from "./models/figures/controllers/storage";
import { Engine } from "./models/game/engine";
import { random } from "./utils/random";

new Modal("#get_user", true).onClose((formData: FormData) => {
	const username = formData.get("username");
	if (typeof username === "string") GameStorage.setCurrentUser(username || `Player${random(0, 100000)}`);
	new Engine("#canvas_game").init();
});
