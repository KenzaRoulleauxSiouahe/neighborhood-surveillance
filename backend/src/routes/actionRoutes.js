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

		const logs = await generateDailyLogs(residents, game.currentDate, game.investigationDay);
		await Log.insertMany(logs);

		if (!game.investigationRunning) {
			game.investigationStartedAt = new Date();
			game.investigationRunning = true;
			await game.save();
		}
		res.json(logs);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});
router.get("/logs", async (req, res) => {
	try {
		const game = await Game.findOne({
			status: "active",
		});

		if (!game) {
			return res.status(400).json({
				error: "No active game found.",
			});
		}

		const logs = await Log.find({
			investigationDay: game.investigationDay,
		}).sort({
			time: 1,
		});

		res.json(logs);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

module.exports = router;
