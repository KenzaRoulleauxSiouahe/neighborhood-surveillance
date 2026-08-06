const generateDailyRoutine = require("./dailyRoutineGenerator");

const rick = {
	name: "Rick Grimes",
	role: "Police Officer",
	house: "House 1",
};

const daryl = {
	name: "Daryl Dixon",
	role: "Doctor",
	house: "House 3",
};

console.log("Rick:");
console.log(generateDailyRoutine(rick));

console.log("Daryl:");
console.log(generateDailyRoutine(daryl));
