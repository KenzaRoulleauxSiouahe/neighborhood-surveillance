const mongoose = require("mongoose");

// Stores the location, date, and victim of each murder in the game.
const murderSpotSchema = new mongoose.Schema({
	zone: {
		type: String,
		required: true,
	},

	date: {
		type: Date,
		required: true,
	},

	victim: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("MurderSpot", murderSpotSchema);
