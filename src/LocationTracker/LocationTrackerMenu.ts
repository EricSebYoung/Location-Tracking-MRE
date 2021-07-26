import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import App from '../app';
import { ButtonMesh, CreateActorFromMesh, CreateLabel } from "../Functions/CreateActors";
import { AsyncTextInputPrompt } from "../Functions/UserPrompts";

const pageSize = 2;
const buttonSpacing = 2 / (pageSize + 1);
const buttonWidth = 0.25;
const buttonHeight = buttonSpacing * 0.5;

export class LocationTrackerMenu {
	private MenuMap = new Map<string, MRE.Actor>();
	private buttonMesh: MRE.Mesh;
	private counter = 0

	constructor(private app: App) {
		
	}

	public showMenu() {
		if (!this.buttonMesh) {
			this.buttonMesh = ButtonMesh(this.app, buttonWidth, buttonHeight, 0.01);
		}

		const addBox = this.createOption("addLocationBox", "Add Location Box");
		const editMode = this.createOption("editMode", "Toggle Edit Mode");

		const addBoxHandler: MRE.ActionHandler<MRE.ButtonEventData> = 
			userBehavior => this.addBoxButton(userBehavior);
		const editModeHandler: MRE.ActionHandler<MRE.ButtonEventData> = 
			userBehavior => this.editModeButton(userBehavior);

		this.setBehavior(addBox, addBoxHandler);
		this.setBehavior(editMode, editModeHandler);
	}

	private createOption(name: string, labelText: string) {
		const button = this.createButton(name + "Button");
		button.appearance.enabled = new MRE.GroupMask(this.app.context, ['moderator']);
		this.createLabel(name + "Label", button.id, labelText);
		this.counter++;

		return button;
	}

	private createButton(name: string) {
		const transform = {
			position: { 
				x: -1 + buttonWidth / 2,
				y: (buttonSpacing / 2 + buttonSpacing * (pageSize - this.counter)) - 1,
				z: -0.05
			}, 
			rotation: {x: 0, y: 0, z: 0, w: 0}
		};

		const button = CreateActorFromMesh(this.app, name, this.buttonMesh, transform); 
		this.MenuMap.set(name, button);
		return button;
	}

	private createLabel(name: string, parent: MRE.Guid, labelText: string) {
		const position: MRE.Vector3Like = {
			x: buttonWidth * 0.8, 
			y: 0,
			z: 0.05
		}
		const color: MRE.Color3Like = {b: 255, g: 255, r: 255};
		const label = CreateLabel(this.app, name, parent, labelText, position, color);
		this.MenuMap.set(name, label);
	}

	private setBehavior(button: MRE.Actor, handler: MRE.ActionHandler<MRE.ButtonEventData>) {

		const buttonBehavior = button.setBehavior(MRE.ButtonBehavior);
		buttonBehavior.onClick(handler);
	}

	private async addBoxButton(user: MRE.User) {
		const id = await AsyncTextInputPrompt(user, "Enter a name for the location box");
		if (id) {
			this.app.LocationHandler.newLocationBox(id);
		}
	}

	private editModeButton(user: MRE.User) {
		if (user.groups.has("editMode")) {
			user.groups.delete("editMode");
		} else {
			user.groups.add("editMode");
		}
	}
}
