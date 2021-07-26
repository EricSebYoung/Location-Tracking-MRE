import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import App from '../app';

/**
 * Creates a default button mesh.
 * @param app The app the function is running on
 * @returns 
 */
export function ButtonMesh(app: App, width: number, height: number, depth: number) {
	const buttonMesh: MRE.Mesh = app.assets.createBoxMesh('menuButton', width, height, depth);
	return buttonMesh
}

/**
 * Creates an actor from a mesh.
 * @param app The app the function is running on.
 * @param name The name of the actor.
 * @param mesh The mesh for the actor.
 * @param position The x, y, and z coordinates of the actor.
 * @param user (Optional) User that the actor is exclusive to.
 */
export function CreateActorFromMesh(app: App, name: string, mesh: MRE.Mesh, 
	transform: MRE.TransformLike, user? : MRE.User) {
	const actorLike: Partial<MRE.ActorLike> = {
		name: name,
		appearance: {
			meshId: mesh.id
		},
		transform: {
			local: {
				position: transform.position || {x: 0, y: 0, z: 0},
				rotation: transform.rotation || {x: 0, y: 0, z: 0, w: 0}
			}
		},
		collider: { geometry: { shape: MRE.ColliderType.Auto} }
	}
	if (user) {
		actorLike.exclusiveToUser = user.id;
	}
	const actor = MRE.Actor.Create(app.context, {
		actor: actorLike
	});

	return actor;
}

/**
 * Creates a label that is a child of another actor.
 * @param app The main app of the MRE.
 * @param name The name of the label actor.
 * @param parent The actor that acts as the label's parent.
 * @param text The text the label will contain.
 * @param position The location of the label in relation to the parent.
 * @param color The color of the text.
 * @param user An optional field to make the label exclusive to a particular user.
 * @returns The label actor.
 */
export function CreateLabel(app: App, name: string, parent: MRE.Guid, text: string, 
	position: MRE.Vector3Like, color: MRE.Color3Like, user?: MRE.User) {
	const actorLike: Partial<MRE.ActorLike> = {
		name: name,
		parentId: parent,
		transform: {
			local: {
				position: position
			}
		},
		text: {
			contents: text,
			height: 0.2,
			anchor: MRE.TextAnchorLocation.MiddleLeft,
			color: color
		}
	}

	if (user) {
		actorLike.exclusiveToUser = user.id;
	}

	const label = MRE.Actor.Create(app.context, {
		actor: actorLike
	});

	return label;
}
