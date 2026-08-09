const generateDailyRoutine = require("./dailyRoutineGenerator");
const MurderSpot = require("../models/MurderSpot");
const Camera = require("../models/Camera");
const Location = require("../models/Location");

async function generateDailyLogs(residents, gameDate) {
	const murderSpots = await MurderSpot.find();

	const cameras = await Camera.find();

	const locations = await Location.find();

	const logs = [];

	const date = new Date(gameDate);

	const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	const day = dayNames[date.getDay()];

	const cultMembers = residents.filter((resident) => resident.isCultMember);

	const suspiciousCount = Math.floor(Math.random() * (cultMembers.length + 1));

	const shuffledCultMembers = [...cultMembers].sort(() => Math.random() - 0.5);

	const suspiciousResidents = shuffledCultMembers.slice(0, suspiciousCount);

	const suspiciousResidentIds = new Set(suspiciousResidents.map((resident) => resident._id.toString()));

	for (const resident of residents) {
		const isSuspiciousToday = suspiciousResidentIds.has(resident._id.toString());
		const routine = await generateDailyRoutine(resident, day, murderSpots, isSuspiciousToday);
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
			});
		}
	}

	logs.sort((a, b) => {
		return a.time.localeCompare(b.time);
	});
	return logs;
}
module.exports = generateDailyLogs;
