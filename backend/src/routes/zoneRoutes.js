const express = require("express");
const router = express.Router();

const Zone = require("../models/Zone");

// GET all zones
router.get("/", async (req, res) => {
	try {
		const zones = await Zone.find();
		res.status(200).json(zones);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
