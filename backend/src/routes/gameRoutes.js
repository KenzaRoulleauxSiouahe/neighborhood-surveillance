const express = require("express");
const router = express.Router();

const Camera = require("../models/Camera");

router.post("/start", async (req, res) => {
	try {
		await Camera.deleteMany();

		const cameras = await Camera.insertMany([{ name: "Camera 1" }, { name: "Camera 2" }, { name: "Camera 3" }, { name: "Camera 4" }]);

		res.status(201).json({
			message: "Game started",
			cameras: cameras,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
