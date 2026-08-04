const express = require("express");
const router = express.Router();

const generateLocation = require("../utils/locationGenerator");

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
