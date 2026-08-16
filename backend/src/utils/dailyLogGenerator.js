const generateDailyRoutine = require("./dailyRoutineGenerator");
const MurderSpot = require("../models/MurderSpot");
const Camera = require("../models/Camera");
const Location = require("../models/Location");

// Determines the actual location and zone for an action.
function getActionZone(action, resident, locations) {
	const actualLocation = action.location === "Home" ? resident.house : action.location;

	if (actualLocation?.startsWith("Murder Spot - ")) {
		return {
			actualLocation,
			zone: actualLocation.replace("Murder Spot - ", ""),
		};
	}

	const location = locations.find((location) => location.name === actualLocation);

	return {
		actualLocation,
		zone: location ? location.zone : null,
	};
}

// Generates all activity logs for one investigation day.
async function generateDailyLogs(residents, gameDate, investigationDay) {
	const murderSpots = await MurderSpot.find();
	const cameras = await Camera.find();
	const locations = await Location.find();

	const logs = [];

	const date = new Date(gameDate);

	const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	const day = dayNames[date.getDay()];

	// Generate a routine for every resident and turn each action into a log.
	for (const resident of residents) {
		const routine = await generateDailyRoutine(resident, day, murderSpots, residents);

		for (const action of routine) {
			const { actualLocation, zone } = getActionZone(action, resident, locations);

			const camera = cameras.find((camera) => camera.coveredZones.includes(zone));

			logs.push({
				resident: resident.name,
				camera: camera ? camera.name : null,
				day: day,
				date: date,
				time: action.time,
				action: action.action,
				location: actualLocation,
				suspicious: action.suspicious || false,
				suspicionLevel: action.suspicionLevel || 0,
				investigationDay: investigationDay,
			});
		}
	}

	// Sort all generated logs chronologically.
	logs.sort((a, b) => {
		return a.time.localeCompare(b.time);
	});

	return logs;
}

module.exports = generateDailyLogs;