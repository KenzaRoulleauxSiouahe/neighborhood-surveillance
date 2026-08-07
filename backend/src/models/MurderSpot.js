const mongoose = require("mongoose");

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
