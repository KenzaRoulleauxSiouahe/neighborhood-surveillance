const zones = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5", "C1", "C2", "C3", "C4", "C5", "D1", "D2", "D3", "D4", "D5", "E1", "E2", "E3", "E4", "E5"];

const victims = ["Negan", "Abraham Ford", "Carl Grimes", "Shane Walsh", "Andrea", "Enid"];

const MurderSpot = require("../models/MurderSpot");

function randomChoice(array) {
	return array[Math.floor(Math.random() * array.length)];
}

async function generateMurderSpots(gameDate) {
	const availableVictims = [...victims];

	const murderDays = [8, 4];

	const murders = [];

	await MurderSpot.deleteMany();

	murderDays.forEach((days) => {
		const murderDate = new Date(gameDate);

		murderDate.setDate(murderDate.getDate() - days);

		const victimIndex = Math.floor(Math.random() * availableVictims.length);

		const victim = availableVictims.splice(victimIndex, 1)[0];

		murders.push({
			zone: randomChoice(zones),
			victim: victim,
			date: murderDate,
		});
	});

	await MurderSpot.insertMany(murders);

	return murders;
}

module.exports = generateMurderSpots;
