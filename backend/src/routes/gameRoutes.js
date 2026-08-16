const express = require("express");
const router = express.Router();

const Camera = require("../models/Camera");
const Resident = require("../models/Resident");
const Game = require("../models/Game");
const User = require("../models/User");

const chooseCultMembers = require("../utils/cultGenerator");

const generateMurderSpots = require("../utils/murderSpotGenerator");
const MurderSpot = require("../models/MurderSpot");
const Log = require("../models/Log");

router.post("/start", async (req, res) => {
	try {
		const { playerId } = req.body;

		if (!playerId) {
			return res.status(400).json({
				error: "User ID is required.",
			});
		}
		await User.findOneAndUpdate(
			{ uid: playerId },
			{ uid: playerId },
			{
				upsert: true,
				new: true,
				setDefaultsOnInsert: true,
			},
		);
		await Log.deleteMany();
		await Camera.deleteMany();

		const cameras = await Camera.insertMany([
			{ name: "Camera 1", color: "green" },
			{ name: "Camera 2", color: "blue" },
			{ name: "Camera 3", color: "yellow" },
			{ name: "Camera 4", color: "red" },
		]);

		const cultMembers = await chooseCultMembers();

		await Resident.updateMany({}, { isCultMember: false });

		await Resident.updateMany(
			{
				_id: {
					$in: cultMembers.map((member) => member._id),
				},
			},
			{
				isCultMember: true,
			},
		);

		console.log(
			"Cult members:",
			cultMembers.map((member) => member.name),
		);

		await MurderSpot.deleteMany();

		const startDate = new Date();

		const currentDate = new Date(startDate);

		const deadlineDate = new Date(startDate);
		deadlineDate.setDate(deadlineDate.getDate() + 4);

		await Game.deleteMany();

		const game = await Game.create({
			playerId,
			startDate,
			currentDate,
			deadlineDate,
			investigationDay: 1,
			status: "active",
		});

		const murders = await generateMurderSpots(startDate);

		console.log("Murder spots:", murders);

		console.log("Game started:", game);

		res.status(201).json({
			message: "Game started",
			game: game,
			cameras: cameras,
			murderSpots: murders,
		});
	} catch (err) {
		console.error("ERROR STARTING GAME:", err);
		res.status(500).json({ error: err.message });
	}
});

router.get("/active", async (req, res) => {
	try {
		const { playerId } = req.query;

		if (!playerId) {
			return res.status(400).json({
				error: "Player UID is required.",
			});
		}

		const game = await Game.findOne({
			playerId: playerId,
			status: "active",
		});

		if (!game) {
			return res.status(404).json({
				error: "No active game found.",
			});
		}

		res.json(game);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});
router.patch("/finish-investigation", async (req, res) => {
	try {
		const game = await Game.findOne({ status: "active" });
		if (!game) {
			return res.status(400).json({ error: "No active game found." });
		}
		game.investigationRunning = false;
		game.investigationStartedAt = null;
		await game.save();
		console.log(`Investigation Day ${game.investigationDay} finished.`);
		res.json({ message: "Investigation finished.", game });
	} catch (error) {
		console.error("Error finishing investigation:", error);
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
