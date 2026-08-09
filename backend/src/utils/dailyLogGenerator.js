const generateDailyRoutine = require("./dailyRoutineGenerator");
const MurderSpot = require("../models/MurderSpot");

async function generateDailyLogs(residents, gameDate) {
	const murderSpots = await MurderSpot.find();

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
			logs.push({ resident: resident.name, day: day, date: date, time: action.time, action: action.action, location: action.location, suspicious: action.suspicious || false, suspicionLevel: action.suspicionLevel || 0 });
		}
	}

	logs.sort((a, b) => {
		return a.time.localeCompare(b.time);
	});
	return logs;
}
module.exports = generateDailyLogs;
