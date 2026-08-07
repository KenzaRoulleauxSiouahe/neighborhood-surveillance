const roleRoutines = require("./routineGenerator");
const generateAction = require("./actionGenerator");

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

function randomActivity() {
	const chance = Math.random();

	if (chance > 0.5) {
		return null;
	}

	return generateAction(18, 19);
}

function generateDailyRoutine(resident, day) {
	const routine = roleRoutines[resident.role];

	if (!routine) {
		return [];
	}

	if (!routine.workplace) {
		return [];
	}

	if (routine.outsideVillage && routine.freeDays.includes(day)) {
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

	const leaveTime = randomizeTime(routine.start);

	const arriveTime = addMinutes(leaveTime, 10 + Math.floor(Math.random() * 10));

	const logs = [
		{
			time: leaveTime,
			action: "Left the house",
			location: resident.house,
		},

		{
			time: randomizeTime(arriveTime, 5),
			action: "Entered",
			location: routine.workplace,
		},

		{
			time: randomizeTime(routine.end),
			action: "Left",
			location: routine.workplace,
		},
	];

	const activity = randomActivity();

	if (activity) {
		logs.push({
			time: activity.time,
			action: activity.action,
			location: activity.location,
		});
	}

	logs.push({
		time: randomizeTime(addMinutes(routine.end, 30), 10),
		action: "Returned home",
		location: resident.house,
	});

	return logs.sort((a, b) => {
		const timeA = a.time.split(":").map(Number);
		const timeB = b.time.split(":").map(Number);

		return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
	});
}

module.exports = generateDailyRoutine;
