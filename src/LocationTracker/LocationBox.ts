import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { TransformLike } from '@microsoft/mixed-reality-extension-sdk';
import App from '../app';
import { ButtonMesh, CreateActorFromMesh, CreateLabel } from '../Functions/CreateActors';
import { AsyncTextInputPrompt } from '../Functions/UserPrompts';
import { BoxItem } from '../LocationBoxDatabase';

export class LocationBox {
	private actor: MRE.Actor;
	private resize: MRE.Actor;
	private resizeLabel: MRE.Actor;

	private delete: MRE.Actor;
	private deleteLabel: MRE.Actor;

	//Size of the object
	private height: number;
	private width: number;
	private depth: number;

	//Location of the object
	private transform: TransformLike;

	private TimeSaveMap = new Map<string, Date>();

	constructor(private app: App, private id: string, height?: number, width?: number, 
		depth?: number, transform?: TransformLike) {

		this.height = height || 2;
		this.width = width || 2;
		this.depth = depth || 2;
		this.transform = transform || { position: { x: 2, y: 0.05, z: 0 }, 
			rotation: {x: 0, y: 0, z: 0, w: 0}
		} ;

		this.build()

	}

	/**
	 * Build the components of the object and save them.
	 */
	private build() {
		this.createActor();
		this.createResizeButton();
		this.createDeleteButton();
		this.saveBox();
	}

	/**
	 * Creates the detection box.
	 */
	private createActor() {
		const mesh = ButtonMesh(this.app, this.height, this.width, this.depth);

		this.actor = CreateActorFromMesh(this.app, 
			"LocationBox" + this.id,
			mesh, 
			this.transform);
		this.actor.collider.isTrigger = true;
		this.actor.appearance.enabled = new MRE.GroupMask(this.app.context, ['editMode']);

		const onEnterHandler: MRE.TriggerHandler = otherActor => this.onEnter(otherActor);
		const onExitHandler: MRE.TriggerHandler = otherActor => this.onExit(otherActor);
		
		this.actor.collider.onTrigger("trigger-enter", onEnterHandler);
		this.actor.collider.onTrigger("trigger-exit", onExitHandler)

		this.makeGrabbable();
	}

	/**
	 * Handles the resize of the detection box and resets the collider.
	 */
	private beginResize() {
		const mesh = ButtonMesh(this.app, this.height, this.width, this.depth);
		this.actor.appearance.mesh = mesh;
		this.actor.setCollider(MRE.ColliderType.Auto, true);
	}

	/**
	 * Creates the button allowing for the resizing of the box.
	 */
	private createResizeButton() {
		const mesh = ButtonMesh(this.app, 0.25, 0.25, 0.01);
		const zPos = -((this.depth / 2) + 0.05);
		const material = this.app.assets.createMaterial('redMat', {
			color: { r: .854, g: 0.132, b: 0.132 }
		});
		const transform = {
			position: { x: -.05, y: 0.05, z: zPos }, 
			rotation: {x: 0, y: 0, z: 0, w: 0}
		}

		this.resize = CreateActorFromMesh(this.app, 
			"ResizeButton" + this.id,
			mesh, 
			transform);

		this.resize.appearance.materialId = material.id;
		this.resize.parentId = this.actor.id;

		const resizeBehavior: MRE.ActionHandler<MRE.ButtonEventData> = 
			userBehavior => this.resizeButton(userBehavior);
		
		this.setBehavior(this.resize, resizeBehavior);

		const labelPosition: MRE.Vector3Like = {
			x: 0.25 * 0.8, 
			y: 0,
			z: 0
		}
		const color: MRE.Color3Like = {b: 0, g: 0, r: 0};
		this.resizeLabel = CreateLabel(this.app, "ResizeLabel", this.resize.id, "Resize", labelPosition, color);
	}

	/**
	 * Creates the button allowing for deletion of the box.
	 */
	private createDeleteButton() {
		const mesh = ButtonMesh(this.app, 0.25, 0.25, 0.01);
		const zPos = -((this.depth / 2) + 0.05);
		const material = this.app.assets.createMaterial('redMat', {
			color: { r: .854, g: 0.132, b: 0.132 }
		});
		const transform = {
			position: { x: -.05, y: -0.30, z: zPos }, 
			rotation: {x: 0, y: 0, z: 0, w: 0}
		}

		this.delete = CreateActorFromMesh(this.app, 
			"DeleteButton" + this.id,
			mesh, 
			transform);

		this.delete.appearance.materialId = material.id;
		this.delete.parentId = this.actor.id;

		const deleteBehavior: MRE.ActionHandler<MRE.ButtonEventData> = 
			userBehavior => this.deleteButton();
		
		this.setBehavior(this.delete, deleteBehavior);

		const labelPosition: MRE.Vector3Like = {
			x: 0.25 * 0.8, 
			y: 0,
			z: 0
		}
		const color: MRE.Color3Like = {b: 0, g: 0, r: 0};
		this.deleteLabel = CreateLabel(this.app, "DeleteLabel", this.delete.id, "Delete", labelPosition, color);
	}

	/**
	 * Handles option button repositioning for when the size of the box changes.
	 */
	private repositionOptions() {
		const zPos = -((this.depth / 2) + 0.05);
		this.resize.transform.local.position.z = zPos;
		this.delete.transform.local.position.z = zPos;
	}

	/**
	 * Handler for when an actor enters the location box.
	 * @param actor The actor entering the box.
	 */
	private onEnter(actor: MRE.Actor) {
		const actorName = actor.name;
		if (this.userExists(actorName)) {
			console.log(actor.name + " has entered " + this.id);
			this.saveTime(actorName);
		}
	}

	/**
	 * Handler for when an actor exits the location box.
	 * @param actor The actor exiting the box.
	 */
	private onExit(actor: MRE.Actor) {
		const actorName = actor.name;
		if (this.userExists(actorName)) {
			console.log(actor.name + " has left " + this.id);
			this.updateRecord(actorName);
		}
	}

	/**
	 * Saves when a user first enters the location.
	 * @param name The name of the user.
	 */
	private saveTime(name: string) {
		const currentTime = new Date();
		this.TimeSaveMap.set(name, currentTime);
	}

	/**
	 * Updates the user visit record.
	 * @param name The name of the user.
	 */
	private updateRecord(name: string) {
		if (this.TimeSaveMap.has(name)) {
			const startTime = this.TimeSaveMap.get(name);
			this.app.LocationHandler.updateRecord(name, this.id, startTime);
			this.TimeSaveMap.delete(name);
		}
	}

	/**
	 * Toggles whether tasks can be grabbed and moved or not.
	 * @param editMode Whether ATasks should be grabbable or not
	 */
	public setEditMode(editMode: boolean, user: MRE.User) {
		if (editMode) {
			user.groups.add("EditMode");
		} else {
			user.groups.delete("EditMode");
		}
	}

	/**
	 * Makes the actor grabbable so it can be moved to the needed location.
	 * Also enables grab behaviors.
	 */
	private makeGrabbable() {
		this.actor.grabbable = true;
		this.actor.onGrab("begin", userBehavior => this.OnGrabBegin());
		this.actor.onGrab("end", userBehavior => this.OnGrabEnd());
	}

	/**
	 * Allows the actor transform properties to be updated when moved.
	 */
	private OnGrabBegin() {
		this.actor.subscribe("transform");
	}

	/**
	 * Ends transform updates to the actor and 
	 * updates the database with the new transform.
	 */
	private OnGrabEnd() {
		this.actor.unsubscribe("transform");
		const actTransform = this.actor.transform.app;
		this.app.LocationBoxDatabase.setTransform(this.id, actTransform.toJSON());
		console.log("End Location:" + actTransform.toJSON());
	}

	/**
	 * Checks if an entered string is an existing user.
	 * @param user The string of the actor that should be a user.
	 * @returns A boolean for if the name is in fact a user.
	 */
	private userExists(user: string) {
		let exists = false;
		const userList: MRE.User[] = this.app.context.users;

		for(const loggedInUser of userList) {
			if (loggedInUser.id.toString() === user) {
				exists = true;
				break;
			}
		}

		return exists
	}

	/**
	 * Sets a button onClick behavior.
	 * @param button The button actor.
	 * @param handler The handler for what is supposed to occur on click.
	 */
	private setBehavior(button: MRE.Actor, handler: MRE.ActionHandler<MRE.ButtonEventData>) {

		const buttonBehavior = button.setBehavior(MRE.ButtonBehavior);
		buttonBehavior.onClick(handler);
	}

	/**
	 * A prompt for entering a size dimension.
	 * @param user The user that is being given the resize option
	 * @param dimension Which dimension is being changed.
	 * @returns The input number.
	 */
	public async promptForDimension(user: MRE.User, dimension: string) {
		let message = "Enter the new " + dimension;
		let input = await AsyncTextInputPrompt(user, message);

		while (isNaN(+input)) {
			message = "Error: Value must be a number, Enter the new " + dimension;
			input = await AsyncTextInputPrompt(user, message);
		}
		
		return Number(input)
	}

	/**
	 * Handles resizing the location box.
	 * @param user The user resizing the object.
	 */
	private async resizeButton(user: MRE.User) {
		this.height = await this.promptForDimension(user, "height");
		this.width = await this.promptForDimension(user, "width");
		this.depth = await this.promptForDimension(user, "depth");

		this.beginResize()
		this.repositionOptions();
	}

	/**
	 * Handles deletion of the location box.
	 */
	private deleteButton() {
		this.app.LocationHandler.removeLocationBox(this.id);
	}

	/**
	 * Saves the box to the database.
	 */
	private saveBox() {
		const boxItem: BoxItem = {
			id: this.id,
			height: this.height,
			width: this.width,
			depth: this.depth,
			transform: this.transform
		};
		this.app.LocationBoxDatabase.saveToDatabase(boxItem);
	}

	/**
	 * Destroys the actors associated with the box.
	 */
	public destroy() {
		this.actor.destroy();
		this.resize.destroy();
		this.resizeLabel.destroy();
		this.delete.destroy();
		this.deleteLabel.destroy();
	}

	public startup(user: MRE.User) {
		
	}

	/**
	 * Handles what occurs when a user leaves the box.
	 * @param user The exiting user.
	 */
	public cleanup(user: MRE.User) {
		this.updateRecord(user.name);
	}
}
