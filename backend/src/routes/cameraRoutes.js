const express = require("express");
const router = express.Router();
const Camera = require("../models/Camera");

// GET all cameras
router.get("/", async (req, res) => {
	try {
		const cameras = await Camera.find();
		res.status(200).json(cameras);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

//RESET camera locations
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
		const camera = await Camera.findByIdAndUpdate(
			req.params.id,
			{
				coveredZones: req.body.coveredZones,
			},
			{ new: true },
		);

		res.json(camera);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

module.exports = router;
