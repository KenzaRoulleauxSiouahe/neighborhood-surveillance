const express = require("express");
const router = express.Router();

const Camera = require("../models/Camera");
const Resident = require("../models/Resident");
const Game = require("../models/Game");
const User = require("../models/User");
const MurderSpot = require("../models/MurderSpot");
const Log = require("../models/Log");

const chooseCultMembers = require("../utils/cultGenerator");
const generateMurderSpots = require("../utils/murderSpotGenerator");

// Start a new game and generate its initial game data.
router.post("/start", async (req, res) => {
	try {
		const { playerId } = req.body;

		if (!playerId) {
			return res.status(400).json({
				error: "User ID is required.",
			});
		}

		// Create the player record if it does not already exist.
		await User.findOneAndUpdate(
			{ uid: playerId },
			{ uid: playerId },
			{
				upsert: true,
				new: true,
				setDefaultsOnInsert: true,
			},
		);

		// Remove data from the previous game.
		await Log.deleteMany();
		await Camera.deleteMany();
		await MurderSpot.deleteMany();
		await Game.deleteMany();

		// Create the four cameras for the new game.
		const cameras = await Camera.insertMany([
			{ name: "Camera 1", color: "green" },
			{ name: "Camera 2", color: "blue" },
			{ name: "Camera 3", color: "yellow" },
			{ name: "Camera 4", color: "red" },
		]);

		// Randomly choose the cult members for this game.
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

		const startDate = new Date();
		const currentDate = new Date(startDate);

		const deadlineDate = new Date(startDate);
		deadlineDate.setDate(deadlineDate.getDate() + 4);

		// Create the new active game.
		const game = await Game.create({
			playerId,
			startDate,
			currentDate,
			deadlineDate,
			investigationDay: 1,
			status: "active",
		});

		// Generate the murder locations for the new game.
		const murders = await generateMurderSpots(startDate);

		res.status(201).json({
			message: "Game started",
			game: game,
			cameras: cameras,
			murderSpots: murders,
		});
	} catch (error) {
		console.error("Error starting game:", error);

		res.status(500).json({
			error: error.message,
		});
	}
});

// Get the active game for a specific player.
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

// Finish the current investigation and save the final camera positions.
router.patch("/finish-investigation", async (req, res) => {
	try {
		const game = await Game.findOne({
			status: "active",
		});

		if (!game) {
			return res.status(400).json({
				error: "No active game found.",
			});
		}

		const cameras = await Camera.find();

		for (const camera of cameras) {
			if (camera.coveredZones.length > 0) {
				const currentZone = camera.coveredZones[0];

				const alreadyRecorded = camera.coverageHistory.some((entry) => entry.day === game.investigationDay);

				if (!alreadyRecorded) {
					camera.coverageHistory.push({
						day: game.investigationDay,
						zone: currentZone,
					});

					await camera.save();
				}
			}
		}

		game.investigationRunning = false;
		game.investigationStartedAt = null;

		await game.save();

		res.json({
			message: "Investigation finished.",
			game,
		});
	} catch (error) {
		console.error("Error finishing investigation:", error);

		res.status(500).json({
			error: error.message,
		});
	}
});

module.exports = router;