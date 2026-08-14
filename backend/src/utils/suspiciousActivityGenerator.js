const Location = require("../models/Location");

const suspiciousActions = ["Entered", "Visited", "Stayed near", "Walked to", "Was seen near", "Left"];

async function randomSuspiciousActivity(murderSpots, resident, allResidents = []) {
	const activities = [];

	if (murderSpots && murderSpots.length > 0) {
		murderSpots.forEach((murderSpot) => {
			const murderZone = murderSpot.zone || murderSpot.location || murderSpot;

			activities.push({
				action: "Visited previous crime scene",
				location: `Murder Spot - ${murderZone}`,
				minHour: 0,
				maxHour: 4,
				suspicionLevel: 3,
			});
		});
	}

	const locations = await Location.find();

	const suspiciousLocationTypes = ["school", "police", "cemetery", "forest", "shop"];

	const suspiciousLocations = locations.filter((location) => suspiciousLocationTypes.includes(location.type));

	suspiciousLocations.forEach((location) => {
		activities.push({
			action: location.type === "school" ? "Entered" : location.type === "police" ? "Entered" : "Visited",

			location: location.name,

			minHour: 0,
			maxHour: 4,

			suspicionLevel: location.type === "school" || location.type === "police" ? 2 : 2,
		});
	});

	if (resident) {
		activities.push({
			action: "Was seen walking alone",
			location: resident.house,
			minHour: 0,
			maxHour: 4,
			suspicionLevel: 1,
		});
	}

	if (allResidents.length > 1 && resident) {
		const otherResidents = allResidents.filter((otherResident) => otherResident._id.toString() !== resident._id.toString());

		if (otherResidents.length > 0) {
			const otherResident = otherResidents[Math.floor(Math.random() * otherResidents.length)];

			activities.push({
				action: `Met ${otherResident.name}`,
				location: resident.house,
				minHour: 0,
				maxHour: 4,
				suspicionLevel: 2,
			});
			activities.push({
				action: `Watched ${otherResident.house}`,
				location: otherResident.house,
				minHour: 0,
				maxHour: 4,
				suspicionLevel: 2,
			});
			activities.push({
				action: `Watched ${otherResident.house}`,
				location: otherResident.house,
				minHour: 0,
				maxHour: 4,
				suspicionLevel: 2,
			});
			activities.push({
				action: `Entered ${otherResident.house}`,
				location: otherResident.house,
				minHour: 2,
				maxHour: 3,
				suspicionLevel: 3,
			});
		}
	}

	if (activities.length === 0) {
		return null;
	}

	const selected = activities[Math.floor(Math.random() * activities.length)];

	const hour = selected.minHour + Math.floor(Math.random() * (selected.maxHour - selected.minHour + 1));

	const minute = Math.floor(Math.random() * 60);

	return {
		time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
		action: selected.action,
		location: selected.location,
		suspicious: true,
		suspicionLevel: selected.suspicionLevel,
	};
}

module.exports = randomSuspiciousActivity;
