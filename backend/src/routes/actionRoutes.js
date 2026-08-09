const express = require("express");
const router = express.Router();

const Resident = require("../models/Resident");
const Log = require("../models/Log");
const Game = require("../models/Game");
const generateDailyLogs = require("../utils/dailyLogGenerator");

router.post("/generate", async (req, res) => {
	try {
		const residents = await Resident.find();

		const game = await Game.findOne({
			status: "active",
		});

		if (!game) {
			return res.status(400).json({
				error: "No active game found.",
			});
		}

		const logs = await generateDailyLogs(residents, game.currentDate);

		await Log.deleteMany();

		await Log.insertMany(logs);

		res.json(logs);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

module.exports = router;
