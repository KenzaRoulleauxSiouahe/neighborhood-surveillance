const express = require("express");
const router = express.Router();

const Resident = require("../models/Resident");
const Log = require("../models/Log");
const Game = require("../models/Game");
const generateDailyLogs = require("../utils/dailyLogGenerator");

router.post("/generate", async (req, res) => {
	try {
		const game = await Game.findOne({
			status: "active",
		});

		if (!game) {
			return res.status(400).json({
				error: "No active game found.",
			});
		}

		let logs = await Log.find({
			investigationDay: game.investigationDay,
		}).sort({
			time: 1,
		});

		if (logs.length === 0) {
			const residents = await Resident.find();

			logs = await generateDailyLogs(residents, game.currentDate, game.investigationDay);

			await Log.insertMany(logs);
		}

		game.investigationRunning = true;
		game.investigationStartedAt = new Date();

		await game.save();

		res.json(logs);
	} catch (error) {
		console.error("Error generating investigation logs:", error);

		res.status(500).json({
			error: error.message,
		});
	}
});

router.post("/next-day", async (req, res) => {
	try {
		const game = await Game.findOne({
			status: "active",
		});

		if (!game) {
			return res.status(400).json({
				error: "No active game found.",
			});
		}
		if (game.investigationRunning) {
			return res.status(400).json({
				error: "The current investigation is still running.",
			});
		}

		game.investigationDay += 1;

		const nextDate = new Date(game.currentDate);
		nextDate.setDate(nextDate.getDate() + 1);

		game.currentDate = nextDate;
		game.investigationRunning = false;
		game.investigationStartedAt = null;

		await game.save();

		const residents = await Resident.find();

		const logs = await generateDailyLogs(residents, game.currentDate, game.investigationDay);

		await Log.insertMany(logs);

		res.json({
			message: `Investigation Day ${game.investigationDay} started.`,
			game,
			logs,
		});
	} catch (error) {
		console.error("Error starting next investigation day:", error);

		res.status(500).json({
			error: error.message,
		});
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

router.get("/archive", async (req, res) => {
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
			investigationDay: {
				$lt: game.investigationDay,
			},
		}).sort({
			investigationDay: 1,
			time: 1,
		});

		res.json(logs);
	} catch (error) {
		console.error("Error loading log archive:", error);

		res.status(500).json({
			error: error.message,
		});
	}
});
module.exports = router;
