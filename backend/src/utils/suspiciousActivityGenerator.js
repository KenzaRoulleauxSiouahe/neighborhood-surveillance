const suspiciousActions = ["Entered", "Visited", "Stayed near", "Walked to"];

const suspiciousLocations = ["Forest", "Cemetery", "Previous murder scene"];

function randomSuspiciousActivity(murderSpots) {
	if (!murderSpots || murderSpots.length === 0) {
		return null;
	}

	const action = suspiciousActions[Math.floor(Math.random() * suspiciousActions.length)];

	let location = suspiciousLocations[Math.floor(Math.random() * suspiciousLocations.length)];

	if (location === "Previous murder scene") {
		const murderSpot = murderSpots[Math.floor(Math.random() * murderSpots.length)];

		const murderZone = murderSpot.zone || murderSpot.location || murderSpot;

		location = `Murder scene - ${murderZone}`;
	}

	const hour = Math.floor(Math.random() * 4);

	return {
		time: `${String(hour).padStart(2, "0")}:00`,
		action: action,
		location: location,
		suspicious: true,
	};
}

module.exports = randomSuspiciousActivity;
