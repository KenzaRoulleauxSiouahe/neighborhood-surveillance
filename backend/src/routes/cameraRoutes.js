const express = require("express");
const router = express.Router();
const Camera = require("../models/Camera");

router.get("/", async (req, res) => {
	try {
		const cameras = await Camera.find();
		res.status(200).json(cameras);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

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

router.patch("/:id/coverage", async (req, res) => {
	try {
		const camera = await Camera.findById(req.params.id);

		if (!camera) {
			return res.status(404).json({
				error: "Camera not found.",
			});
		}

		const newZones = req.body.coveredZones || [];

		camera.coveredZones = newZones;

		newZones.forEach((zone) => {
			if (!camera.coverageHistory.includes(zone)) {
				camera.coverageHistory.push(zone);
			}
		});

		await camera.save();

		res.json(camera);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

module.exports = router;
