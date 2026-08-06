const roleRoutines = require("./routineGenerator");

function generateDailyRoutine(resident) {
	const routine = roleRoutines[resident.role];

	if (!routine) {
		return [];
	}

	if (!routine.workplace) {
		return [];
	}

	if (routine.outsideVillage) {
		return [
			{
				time: routine.start,
				action: "Left the house",
				location: resident.house,
			},

			{
				time: routine.end,
				action: "Returned home",
				location: resident.house,
			},
		];
	}

	return [
		{
			time: routine.start,
			action: "Left the house",
			location: resident.house,
		},

		{
			time: addMinutes(routine.start, 15),
			action: "Entered",
			location: routine.workplace,
		},

		{
			time: routine.end,
			action: "Left",
			location: routine.workplace,
		},

		{
			time: addMinutes(routine.end, 15),
			action: "Returned home",
			location: resident.house,
		},
	];
}

function addMinutes(time, minutes) {
	let [hours, mins] = time.split(":").map(Number);

	mins += minutes;

	while (mins >= 60) {
		hours++;
		mins -= 60;
	}

	return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

module.exports = generateDailyRoutine;
