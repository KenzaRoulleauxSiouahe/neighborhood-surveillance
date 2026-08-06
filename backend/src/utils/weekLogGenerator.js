const generateWeek = require("./weekGenerator");
const generateDailyRoutine = require("./dailyRoutineGenerator");

function generateWeekLogs(residents) {
	const week = generateWeek();

	const logs = [];

	for (const day of week) {
		for (const resident of residents) {
			const routine = generateDailyRoutine(resident);

			for (const action of routine) {
				logs.push({
					resident: resident.name,

					day: day.day,

					date: day.date,

					time: action.time,

					action: action.action,

					location: action.location,
				});
			}
		}
	}

	logs.sort((a, b) => a.time.localeCompare(b.time));

	return logs;
}

module.exports = generateWeekLogs;
