import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import App from "../app";
import { LocationBox } from "./LocationBox";
import { UserTrackers } from "./UserTrackers";
import { LocationsTrackingDatabase } from "../LocationTrackingDatabase";
import { LocationTrackerMenu } from "./LocationTrackerMenu";
import { BoxItem } from "../LocationBoxDatabase";

export class LocationHandler {
	private LocationTrackingDatabase: LocationsTrackingDatabase;
	private LocationBoxMap = new Map<string, LocationBox>();
	private userTracker: UserTrackers;
	private LocationTrackerMenu: LocationTrackerMenu;

	constructor(private app: App) {
		this.LocationTrackingDatabase = new LocationsTrackingDatabase();
		this.userTracker = new UserTrackers(this.app);

		this.LocationTrackerMenu = new LocationTrackerMenu(this.app);
		this.LocationTrackerMenu.showMenu();
		this.buildBoxes();
	}

	/**
	 * Builds all saved location boxes.
	 */
	public async buildBoxes() {
		await this.app.LocationBoxDatabase.startup();
	}

	public newLocationBox(id: string) {
		console.log("Box created");
		const locationBox = new LocationBox(this.app, id);
		this.LocationBoxMap.set(id, locationBox);
	}

	public removeLocationBox(id: string) {
		this.LocationBoxMap.get(id).destroy();
		this.LocationBoxMap.delete(id);
		this.app.LocationBoxDatabase.deleteFromDatabase(id);
	}

	/**
	 * Builds the objects for loaded boxes
	 * @param boxRecord The record for the specific box being built
	 */
	public buildLoadedBox(boxRecord: BoxItem) {
		const locationBox = new LocationBox(this.app, boxRecord.id, 
			boxRecord.height, boxRecord.width, boxRecord.depth, boxRecord.transform);
		this.LocationBoxMap.set(boxRecord.id, locationBox);
	}

	public updateRecord(user: string, locationId: string, startTime: Date) {
		this.LocationTrackingDatabase.updateLocationRecord(user, locationId, startTime);
	}

	public startup(user: MRE.User) {
		this.userTracker.startup(user);
		const roles = user.properties["altspacevr-roles"].toString();
		if (roles.includes("moderator")) {
			user.groups.add("moderator");
		}
	}

	public cleanup(user: MRE.User) {
		this.userTracker.cleanup(user);
	}
}
