import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { LocationBoxDatabase } from './LocationBoxDatabase';
import { LocationHandler } from './LocationTracker/LocationHandler';


export default class App {

	private _LocationHandler: LocationHandler;
	private _LocationBoxDatabase: LocationBoxDatabase;
	private _assets: MRE.AssetContainer;

	public get assets() { return this._assets; }
	public get context() { return this._context; }
	public get LocationHandler() { return this._LocationHandler; }
	public get LocationBoxDatabase() { return this._LocationBoxDatabase; }
	
	constructor(private _context: MRE.Context) {
		this._assets = new MRE.AssetContainer(_context);

		//outside classes
		this._LocationBoxDatabase = new LocationBoxDatabase(this);
		this._LocationHandler = new LocationHandler(this);

		this._context.onStarted(() => this.started());
		this._context.onUserJoined(user => this.userJoined(user));
		this._context.onUserLeft(user => this.userLeft(user));
	}

	//initializes the app once context is "started"
	private async started() {
		console.log("Started");
		
		// Check whether code is running in a debuggable watched filesystem
		// environment and if so delay starting the app by 1 second to give
		// the debugger time to detect that the server has restarted and reconnect.
		// The delay value below is in milliseconds so 1000 is a one second delay.
		// You may need to increase the delay or be able to decrease it depending
		// on the speed of your PC.
		const delay = 1000;
		const argv = process.execArgv.join();
		const isDebug = argv.includes('inspect') || argv.includes('debug');

		// // version to use with non-async code
		// if (isDebug) {
		// 	setTimeout(this.startedImpl, delay);
		// } else {
		// 	this.startedImpl();
		// }

		// version to use with async code
		if (isDebug) {
			await new Promise(resolve => setTimeout(resolve, delay));
			await this.startedImpl();
		} else {
			await this.startedImpl();
		}
	}

	private startedImpl = async () => {
		
	}

	/**
	 * Runs through all necessary methods for when a user joins.
	 * @param user The user that has joined the application
	 */
	private userJoined(user: MRE.User) {
		const userName = user.name;
		console.log(userName + ' has joined the server');	

		this.LocationHandler.startup(user);
	}
	
	/**
	 * Runs through all necessary methods for when a user has left.
	 * @param user The user that has left the application
	 */
	private userLeft(user: MRE.User) {
		const userName = user.name;
		console.log(userName + ' has left the server');
		this.LocationHandler.cleanup(user);
	}

}
