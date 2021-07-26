const secondsToDaysDiv = 86400;
const secondsToHoursDiv = 3600;
const secondsToMinutesDiv = 60;

function CalculateTimeMap(delta: number) {
	const timeMap = new Map<string, number>();

	//Calculate and subtract days.
	const days = Math.floor(delta / secondsToDaysDiv);
	delta -= days * secondsToDaysDiv;
	timeMap.set("Days", days);

	//Calculate and subtract hours.
	const hours = Math.floor(delta / secondsToHoursDiv) % 24;
	delta -= hours * secondsToHoursDiv;
	timeMap.set("Hours", hours);

	//Calculate and subtract minutes.
	const minutes = Math.floor(delta / secondsToMinutesDiv) % 60;
	delta -= minutes * secondsToMinutesDiv;
	timeMap.set("Minutes", minutes);

	//Remainder of seconds.
	const seconds = delta % 60;
	timeMap.set("Seconds", seconds);

	return timeMap;
}

export function GetCurrentTime() {
	const dateTime = new Date();
	return dateTime;
}

export function GetTimeDifferenceMap(startTime: Date, endTime: Date) {
	//Total seconds
	const delta = Math.abs(endTime.getTime() - startTime.getTime()) / 1000

	const timeMap = CalculateTimeMap(delta);

	return timeMap;
}

export function AddTime(currentTimeMap: Map<string, number>, timeToAddMap: Map<string, number>) {
	const seconds = currentTimeMap.get("Seconds") + timeToAddMap.get("Seconds");
	const minutes = currentTimeMap.get("Minutes") + timeToAddMap.get("Minutes");
	const hours = currentTimeMap.get("Hours") + timeToAddMap.get("Hours");
	const days = currentTimeMap.get("Days") + timeToAddMap.get("Days");

	//convert into seconds for calculation
	const delta = seconds + 
		(minutes * secondsToMinutesDiv) +
		(hours * secondsToHoursDiv) +
		(days * secondsToDaysDiv);

	const timeMap = CalculateTimeMap(delta);

	return timeMap;
}

export function NewTimeMap(seconds: number, minutes: number, hours: number, days: number) {
	const timeMap = new Map<string, number>();
	timeMap.set("Seconds", seconds);
	timeMap.set("Minutes", minutes);
	timeMap.set("Hours", hours);
	timeMap.set("Days", days);

	return timeMap;
}
