const roleRoutines = require("./routineGenerator");
const Location = require("../models/Location");
const generateAction = require("./actionGenerator");
const generateSuspiciousActivity = require("./suspiciousActivityGenerator");

// Adds a random variation to a given time.
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

// Adds a number of minutes to a given time.
function addMinutes(time, amount) {
	let [hours, minutes] = time.split(":").map(Number);

	minutes += amount;

	while (minutes >= 60) {
		hours++;
		minutes -= 60;
	}

	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Randomly decides whether a resident performs an additional activity.
function randomActivity(startHour, endHour) {
	const chance = Math.random();

	if (chance > 0.5) {
		return [];
	}

	return generateAction(startHour, endHour);
}

// Generates the daily routine and possible suspicious activity for a resident.
async function generateDailyRoutine(resident, day, murderSpots = [], allResidents = []) {
	const routine = roleRoutines[resident.role];

	const houseLocation = await Location.findOne({
		name: resident.house,
	});

	if (!routine || !houseLocation) {
		return [];
	}

	const logs = [];

	if (routine.freeDays?.includes(day)) {
		const activity = randomActivity(12, 20);

		logs.push(
			...activity.map((item) => ({
				...item,
				suspicious: false,
			})),
		);
	} else if (routine.outsideVillage) {
		logs.push({
			time: randomizeTime(routine.start),
			action: "Left home",
			location: resident.house,
			zone: houseLocation.zone,
			suspicious: false,
		});

		logs.push({
			time: randomizeTime(routine.end),
			action: "Returned home",
			location: resident.house,
			zone: houseLocation.zone,
			suspicious: false,
		});
	} else if (routine.workplace) {
		const leaveTime = randomizeTime(routine.start);

		const arriveTime = addMinutes(leaveTime, 10 + Math.floor(Math.random() * 10));

		logs.push({
			time: leaveTime,
			action: "Left the house",
			location: resident.house,
			zone: houseLocation.zone,
			suspicious: false,
		});

		logs.push({
			time: randomizeTime(arriveTime, 5),
			action: "Entered",
			location: routine.workplace,
			suspicious: false,
		});

		logs.push({
			time: randomizeTime(routine.end),
			action: "Left",
			location: routine.workplace,
			suspicious: false,
		});

		const returnTime = addMinutes(routine.end, 30);

		logs.push({
			time: randomizeTime(returnTime, 10),
			action: "Returned home",
			location: resident.house,
			zone: houseLocation.zone,
			suspicious: false,
		});

		const endHour = Number(routine.end.split(":")[0]);

		const activity = randomActivity(endHour, endHour + 1);

		logs.push(
			...activity.map((item) => ({
				...item,
				suspicious: false,
			})),
		);
	}

	// Cult members have a higher chance of generating suspicious activity.
	const cultMember = resident.isCultMember;
	const suspiciousChance = cultMember ? 0.55 : 0.25;

	if (Math.random() < suspiciousChance) {
		const suspiciousActivity = await generateSuspiciousActivity(murderSpots, resident, allResidents);

		if (suspiciousActivity) {
			logs.push(suspiciousActivity);
		}
	}

	// Sort all activities chronologically before returning them.
	return logs.sort((a, b) => {
		const timeA = a.time.split(":").map(Number);
		const timeB = b.time.split(":").map(Number);

		return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
	});
}

module.exports = generateDailyRoutine;
