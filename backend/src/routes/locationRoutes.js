const express = require("express");
const router = express.Router();

const Location = require("../models/Location");

// Get all locations stored in the database.
router.get("/", async (req, res) => {
	try {
		const locations = await Location.find();

		res.status(200).json(locations);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

module.exports = router;