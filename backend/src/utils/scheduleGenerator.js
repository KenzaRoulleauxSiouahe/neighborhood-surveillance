const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function generateWeeklySchedule() {
	return days.map((day) => {
		if (day === "Sunday") {
			return {
				day: day,
				working: false,
			};
		}
		const randomDayOff = Math.random() < 0.2;

		return {
			day: day,
			working: !randomDayOff,
		};
	});
}

module.exports = generateWeeklySchedule;
