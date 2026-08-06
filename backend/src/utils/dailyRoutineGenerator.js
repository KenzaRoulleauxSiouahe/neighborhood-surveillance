const roleRoutines = require("./routineGenerator");

function randomizeTime(time, variation = 10) {
	let [hours, minutes] = time.split(":").map(Number);

	const random = Math.floor(Math.random() * (variation * 2 + 1)) - variation;

	minutes += random;

	while (minutes < 0) {
		hours--;
		minutes += 60;
	}

	while (minutes >= 60) {
		hours++;
		minutes -= 60;
	}

	hours = (hours + 24) % 24;

	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function addMinutes(time, amount) {
	let [hours, minutes] = time.split(":").map(Number);

	minutes += amount;

	while (minutes >= 60) {
		hours++;
		minutes -= 60;
	}

	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

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
				time: randomizeTime(routine.start),
				action: "Left home",
				location: resident.house,
			},

			{
				time: randomizeTime(routine.end),
				action: "Returned home",
				location: resident.house,
			},
		];
	}

	return [
		{
			time: randomizeTime(routine.start),
			action: "Left the house",
			location: resident.house,
		},

		{
			time: addMinutes(routine.start, 15),
			action: "Entered",
			location: routine.workplace,
		},

		{
			time: randomizeTime(routine.end),
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

module.exports = generateDailyRoutine;
