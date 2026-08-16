const express = require("express");
const router = express.Router();

const generateLocation = require("../utils/locationGenerator");
const Location = require("../models/Location");

// Get all locations currently stored in the database.
router.get("/", async (req, res) => {
	try {
		const locations = await Location.find();

		res.json(locations);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

// Generate new placements for the locations of the current game.
router.post("/generate", async (req, res) => {
	try {
		const locations = await generateLocation();

		res.json(locations);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

module.exports = router;
