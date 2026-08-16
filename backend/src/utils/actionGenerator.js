const publicLocations = ["Forest", "Cemetery", "Supermarket", "Clothing Store", "Police Station"];

// Generates a random time between the given hours.
function randomTime(startHour, endHour) {
	const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
	const minute = Math.floor(Math.random() * 60);

	return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// Generates a short sequence of actions for a resident visiting a public location.
function generateAction(startHour = 18, endHour = 19) {
	const location = publicLocations[Math.floor(Math.random() * publicLocations.length)];

	const leaveTime = randomTime(startHour, endHour);

	const [hour, minute] = leaveTime.split(":").map(Number);

	const arrivalMinute = minute + 10;

	const arrivalTime = `${String(hour + Math.floor(arrivalMinute / 60)).padStart(2, "0")}:${String(arrivalMinute % 60).padStart(2, "0")}`;

	const leaveLocationTime = `${String(hour + Math.floor((arrivalMinute + 30) / 60)).padStart(2, "0")}:${String((arrivalMinute + 30) % 60).padStart(2, "0")}`;

	return [
		{
			time: leaveTime,
			action: "Left the house",
			location: "Home",
		},
		{
			time: arrivalTime,
			action: "Arrived at",
			location,
		},
		{
			time: leaveLocationTime,
			action: "Left",
			location,
		},
	];
}

module.exports = generateAction;
