const Location = require("../models/Location");

const availableZones = ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5", "C1", "C2", "C3", "C4", "C5", "D1", "D2", "D3", "D4", "D5", "E1", "E2", "E3", "E4", "E5"];

// Randomly shuffles the available zones.
function shuffle(array) {
	return array.toSorted(() => Math.random() - 0.5);
}

// Assigns a random zone to every location.
async function generateLocations() {
	const locations = await Location.find();
	const shuffledZones = shuffle([...availableZones]);

	for (let i = 0; i < locations.length; i++) {
		locations[i].zone = shuffledZones[i];
		await locations[i].save();
	}

	return locations;
}

module.exports = generateLocations;
