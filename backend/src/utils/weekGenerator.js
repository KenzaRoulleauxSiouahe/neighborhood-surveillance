const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function generateWeek() {
	const week = [];

	const startDate = new Date();

	days.forEach((day, index) => {
		const date = new Date(startDate);

		date.setDate(startDate.getDate() + index);

		week.push({
			day: day,
			date: date,
		});
	});

	return week;
}

module.exports = generateWeek;
