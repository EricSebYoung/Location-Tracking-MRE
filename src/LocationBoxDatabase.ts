import { TransformLike } from "@microsoft/mixed-reality-extension-sdk";
import App from "./app";
import { JsonHandler } from "./jsonHandler";

type LocationBoxsDatabase = {
	[key: string]: BoxItem;
};

export type BoxItem = {
	id: string;
	height: number;
	width: number;
	depth: number;
	transform: TransformLike;
};

//Task database file name
const locationBoxDatabaseFilename = __dirname + '/../public/locationBoxes.json';

export class LocationBoxDatabase {
	private LocationBoxDatabase: LocationBoxsDatabase = {};

	constructor(private app: App) { 
	}

	/**
	 * Sets to transform of a task and saves it to the file.
	 * @param id The id of the task.
	 * @param transform The position and rotation the task is located at.
	 */
	public setTransform(id: string, transform: TransformLike) {
		this.LocationBoxDatabase[id].transform = transform;
		this.saveToFile();
	}

	/**
	 * Places the taskItem into the database then saves to a file.
	 * @param taskItem The new or updated TaskItem record.
	 */
	public saveToDatabase(boxItem: BoxItem) {
		this.LocationBoxDatabase[boxItem.id] = boxItem;
		this.saveToFile();
	}

	/**
	 * Removes a record from the database 
	 * then saves the updated database to a file.
	 * @param id The id of the record to be deleted
	 */
	public deleteFromDatabase(id: string) {
		if (Object.keys(this.LocationBoxDatabase).includes(id)) {
			delete this.LocationBoxDatabase[id];
		}
		this.saveToFile();
	}

	/**
	 * Calls the JsonHandler to write the database into a JSON.
	 */
	public saveToFile() {
		const Handler: JsonHandler = new JsonHandler;
		const jsonRecord = this.LocationBoxDatabase

		Handler.writeJSON(locationBoxDatabaseFilename, jsonRecord);
	}

	/**
	 * Loads an existing JSON file into the database.
	 */
	private async loadFromFile() {
		this.LocationBoxDatabase = await require(locationBoxDatabaseFilename);

		for(const boxId of Object.keys(this.LocationBoxDatabase)) {
			this.app.LocationHandler.buildLoadedBox(this.LocationBoxDatabase[boxId]);
		}
	}

	//checks if a save file for tasks exists
	private async saveFileExists() {
		const Handler: JsonHandler = new JsonHandler;
		const exists: boolean = await Handler.jsonExists(locationBoxDatabaseFilename);
		return exists;
	}

	/**
	 * Checks for a save file on then loads it if one exists.
	 * Used to start up a new database object.
	 */
	public async startup() {
		console.log("Location Box Database has started up!");
		if (this.saveFileExists()) {
			console.log("Loading Location Box File...")
			await this.loadFromFile();
			console.log("Load complete: " + JSON.stringify(this.LocationBoxDatabase));
		}
	}
}
