const zones = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5", "C1", "C2", "C3", "C4", "C5", "D1", "D2", "D3", "D4", "D5", "E1", "E2", "E3", "E4", "E5"];

const victims = ["Negan Smith", "Abraham Ford", "Carl Grimes", "Shane Walsh", "Andrea Harrison", "Enid Chambler"];

const MurderSpot = require("../models/MurderSpot");

// Returns a shuffled copy of an array.
function shuffle(array) {
	return array.toSorted(() => Math.random() - 0.5);
}

// Generates three previous murder locations and victims for the game.
async function generateMurderSpots(gameDate) {
	const availableVictims = shuffle([...victims]);
	const availableZones = shuffle([...zones]);

	const murderDays = [12, 8, 4];

	const murders = [];

	murderDays.forEach((days, index) => {
		const murderDate = new Date(gameDate);

		murderDate.setDate(murderDate.getDate() - days);

		const victim = availableVictims[index];

		murders.push({
			zone: availableZones[index],
			victim: victim,
			date: murderDate,
		});
	});

	await MurderSpot.insertMany(murders);

	return murders;
}

module.exports = generateMurderSpots;
