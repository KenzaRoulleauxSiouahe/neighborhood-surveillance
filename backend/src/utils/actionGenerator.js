const publicLocations = ["Forest", "Cemetery", "Supermarket", "Clothing Store", "Police Station"];

function randomTime(startHour, endHour) {
	const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;

	const minute = Math.floor(Math.random() * 60);

	return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function generateAction(startHour = 18, endHour = 19) {
	const location = publicLocations[Math.floor(Math.random() * publicLocations.length)];

	const leaveTime = randomTime(startHour, endHour);

	const arriveHour = Number(leaveTime.split(":")[0]);
	const arriveMinute = Number(leaveTime.split(":")[1]) + 10;

	const arrivalTime = `${String(arriveHour + Math.floor(arriveMinute / 60)).padStart(2, "0")}:${String(arriveMinute % 60).padStart(2, "0")}`;

	const leaveLocationTime = `${String(arriveHour + Math.floor((arriveMinute + 30) / 60)).padStart(2, "0")}:${String((arriveMinute + 30) % 60).padStart(2, "0")}`;

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
