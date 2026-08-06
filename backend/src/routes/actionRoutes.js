const express = require("express");
const router = express.Router();

const Resident = require("../models/Resident");
const Log = require("../models/Log");
const generateDailyRoutine = require("../utils/dailyRoutineGenerator");

router.post("/generate", async (req, res) => {
	try {
		const residents = await Resident.find();

		const logs = [];

		for (const resident of residents) {
			const routine = generateDailyRoutine(resident);

			for (const action of routine) {
				logs.push({
					resident: resident.name,
					day: "Monday",
					date: new Date(),
					time: action.time,
					action: action.action,
					location: action.location,
				});
			}
		}
		logs.sort((a, b) => a.time.localeCompare(b.time));
		await Log.insertMany(logs);

		res.json(logs);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

module.exports = router;
