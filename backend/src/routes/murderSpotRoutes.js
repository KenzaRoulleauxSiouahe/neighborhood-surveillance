const express = require("express");
const router = express.Router();

const MurderSpot = require("../models/MurderSpot");

router.get("/", async (req, res) => {
	try {
		const murders = await MurderSpot.find();

		res.json(murders);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

module.exports = router;
