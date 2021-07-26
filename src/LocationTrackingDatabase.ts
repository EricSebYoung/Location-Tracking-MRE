import { AddTime, GetCurrentTime, GetTimeDifferenceMap, NewTimeMap } from "./Functions/TimeFunctions";
import { JsonHandler } from "./JsonHandler";

/**
 * The structure of the Location Time Tracking database.
 */
type LocationTrackingDatabase = {
	[key: string]: LocationDescriptor;
};

/**
 * The structure of the record of a location.
 */
type LocationDescriptor = {
	[key: string]: TimeData;
};

type TimeData = {
	numberOfVisits: number;
	daysSpent: number;
	hoursSpent: number;
	minutesSpent: number;
	secondsSpent: number;
};

const fileName = '../public/locationTracking.json'
const filePath = __dirname + '/' + fileName;

export class LocationsTrackingDatabase {
	/* eslint-disable @typescript-eslint/no-var-requires */
	private LocationTrackingDatabase: LocationTrackingDatabase = require('../public/locationTracking.json');

	constructor() {
		
	}

	public addNewUser(user: string) {
		this.LocationTrackingDatabase[user] = {};
	}

	/**
	 * Creates a location record and updates the JSON
	 * @param user The string with the User's name
	 * @param locationId The id of the location
	 */
	public addNewLocation(user: string, locationId: string) {
		const timeData: TimeData = {
			numberOfVisits: 0,
			daysSpent: 0,
			hoursSpent: 0,
			minutesSpent: 0,
			secondsSpent: 0
		};

		this.LocationTrackingDatabase[user][locationId] = timeData;
	}

	public updateLocationRecord(user: string, locationId: string, startTime: Date) {
		if (!this.userExists(user)) {
			this.addNewUser(user);
		}

		if (!this.locationExists(user, locationId)) {
			this.addNewLocation(user, locationId);
		}

		const endTime = GetCurrentTime();
		const timeSpent = GetTimeDifferenceMap(startTime, endTime);

		const timeData = this.LocationTrackingDatabase[user][locationId];
		timeData.numberOfVisits += 1;

		const currentTimeMap = NewTimeMap(timeData.secondsSpent, 
			timeData.minutesSpent, 
			timeData.hoursSpent, 
			timeData.daysSpent);
		
		const newTimeMap = AddTime(currentTimeMap, timeSpent);
		timeData.secondsSpent = newTimeMap.get("Seconds");
		timeData.minutesSpent = newTimeMap.get("Minutes");
		timeData.hoursSpent = newTimeMap.get("Hours");
		timeData.daysSpent = newTimeMap.get("Days");

		this.saveDatabase();
	}

	private saveDatabase() {
		const Handler: JsonHandler = new JsonHandler;

		Handler.writeJSON(filePath, this.LocationTrackingDatabase);
	}

	private userExists(user: string) {
		let exists = false;
		if (this.LocationTrackingDatabase[user]) {
			exists = true;
		}
		return exists;
	}

	private locationExists(user: string, locationId: string) {
		let exists = false;
		if (this.LocationTrackingDatabase[user][locationId]) {
			exists = true;
		}
		return exists;
	}
}
