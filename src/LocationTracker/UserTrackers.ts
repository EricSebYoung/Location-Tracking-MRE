import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import App from '../app';
import { ButtonMesh, CreateActorFromMesh } from '../Functions/CreateActors';

export class UserTrackers {
	private locators = new Map<MRE.Guid, MRE.Actor>();

	constructor(private app: App) {
	}

	/**
	 * Creates a locator object that other actors can utilize.
	 * @param user The user to add a locator object to.
	 */
	private addLocator(user: MRE.User) {
		console.log("Locator added to " + user.name);
		this.removeLocator(user);

		const userId = user.id;
		const mesh = ButtonMesh(this.app, 0.1, 0.1, 0.1);
		const transform = {
			position: { x: 0, y: 0, z: 0 }, 
			rotation: {x: 0, y: 0, z: 0, w: 0}
		}
		const actor = CreateActorFromMesh(this.app, user.id.toString(), mesh, transform);
		actor.attach(user, 'hips');
		this.locators.set(userId, actor);
	}

	/**
	 * Removes the locator object from the player.
	 * Usually for cleanup to remove orphaned objects.
	 * @param user The user to remove the locator object from.
	 */
	private removeLocator(user: MRE.User) {
		if (this.locators.has(user.id)) { this.locators.get(user.id).destroy(); }
		this.locators.delete(user.id);
	}

	/**
	 * Gets the locator actor for utilization by other classes.
	 * @param user The user to retrieve the locator for.
	 * @returns MRE.Actor of the locator.
	 */
	public getUserLocator(user: MRE.User) {
		if (this.locators.has(user.id)) { 
			return this.locators.get(user.id); 
		}
	}

	/**
	 * Starts up the class.
	 * @param user The user to startup functionality on.
	 */
	public startup(user: MRE.User) {
		this.addLocator(user);
	}

	/**
	 * Cleans up the class, usually to prevent orphaned actors.
	 * @param user The user to end functionality on.
	 */
	public cleanup(user: MRE.User) {
		this.removeLocator(user)
	}
}
