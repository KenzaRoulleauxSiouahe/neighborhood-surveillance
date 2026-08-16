const express = require("express");
const router = express.Router();

const Camera = require("../models/Camera");
const Game = require("../models/Game");

// Get all cameras.
router.get("/", async (req, res) => {
	try {
		const cameras = await Camera.find();

		res.status(200).json(cameras);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

// Reset the current camera positions.
router.patch("/reset", async (req, res) => {
	try {
		await Camera.updateMany(
			{},
			{
				coveredZones: [],
			},
		);

		res.json({
			message: "Cameras reset",
		});
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

// Update a camera's position and save its coverage history.
router.patch("/:id/coverage", async (req, res) => {
	try {
		const camera = await Camera.findById(req.params.id);

		if (!camera) {
			return res.status(404).json({
				error: "Camera not found.",
			});
		}

		const newZones = Array.isArray(req.body.coveredZones) ? req.body.coveredZones : [];

		const game = await Game.findOne({
			status: "active",
		});

		if (!game) {
			return res.status(400).json({
				error: "No active game found.",
			});
		}

		const newZone = newZones[0];

		camera.coveredZones = newZones;

		// Save the camera's position for the current investigation day.
		if (newZone) {
			const alreadyRecorded = camera.coverageHistory.some((entry) => entry.day === game.investigationDay);

			if (!alreadyRecorded) {
				camera.coverageHistory.push({
					day: game.investigationDay,
					zone: newZone,
				});
			} else {
				const existingEntry = camera.coverageHistory.find((entry) => entry.day === game.investigationDay);

				existingEntry.zone = newZone;
			}
		}

		await camera.save();

		res.json(camera);
	} catch (error) {
		console.error("Camera coverage error:", error);

		res.status(500).json({
			error: error.message,
		});
	}
});

module.exports = router;