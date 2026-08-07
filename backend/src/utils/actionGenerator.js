const actions = [
	{
		type: "Visited",
	},
	{
		type: "Walked to",
	},
	{
		type: "Stayed near",
	},
];

const publicLocations = ["Forest", "Cemetery", "Supermarket", "Clothing Store"];

function randomTime(startHour, endHour) {
	const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;

	const minute = Math.floor(Math.random() * 60);

	return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function generateAction(startHour = 18, endHour = 19) {
	const action = actions[Math.floor(Math.random() * actions.length)];

	const location = publicLocations[Math.floor(Math.random() * publicLocations.length)];

	return {
		action: action.type,
		location,
		time: randomTime(startHour, endHour),
	};
}

module.exports = generateAction;
