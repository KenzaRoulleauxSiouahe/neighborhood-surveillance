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
		await Camera.updateMany({}, { zone: null });

		res.json({
			message: "Cameras reset",
		});
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

//UPDATE camera location
router.patch("/:id", async (req, res) => {
	try {
		const camera = await Camera.findById(req.params.id);

		camera.zone = req.body.zone;

		await camera.save();

		res.status(200).json(camera);
	} catch (err) {
		res.status(500).json({
			error: err.message,
		});
	}
});

module.exports = router;
