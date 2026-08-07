const generateDailyRoutine = require("./dailyRoutineGenerator");

const daryl = {
	name: "Daryl Dixon",
	role: "Doctor",
	house: "C2",
};

console.log("=== DAILY ROUTINE ===");

console.log(generateDailyRoutine(daryl));
