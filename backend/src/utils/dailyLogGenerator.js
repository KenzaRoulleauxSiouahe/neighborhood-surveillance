const generateDailyRoutine = require("./dailyRoutineGenerator");
const MurderSpot = require("../models/MurderSpot");
const Camera = require("../models/Camera");
const Location = require("../models/Location");

async function generateDailyLogs(residents, gameDate, investigationDay) {
	const murderSpots = await MurderSpot.find();

	const cameras = await Camera.find();

	const locations = await Location.find();

	const logs = [];

	const date = new Date(gameDate);

	const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	const day = dayNames[date.getDay()];

	for (const resident of residents) {
		const routine = await generateDailyRoutine(resident, day, murderSpots, residents);
		for (const action of routine) {
			let zone = null;

			const actualLocation = action.location === "Home" ? resident.house : action.location;

			if (actualLocation?.startsWith("Murder Spot - ")) {
				zone = actualLocation.replace("Murder Spot - ", "");
			} else {
				const location = locations.find((location) => location.name === actualLocation);

				if (location) {
					zone = location.zone;
				}
			}

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

	logs.sort((a, b) => {
		return a.time.localeCompare(b.time);
	});
	return logs;
}
module.exports = generateDailyLogs;
