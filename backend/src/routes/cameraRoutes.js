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

module.exports = router;
