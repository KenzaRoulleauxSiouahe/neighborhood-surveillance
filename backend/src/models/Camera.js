const mongoose = require("mongoose");

// Stores the current camera position and its placement history during the investigation.
const cameraSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},

	color: {
		type: String,
		required: true,
	},

	coveredZones: {
		type: [String],
		default: [],
	},

	// Keeps track of where the camera was placed on each investigation day.
	coverageHistory: {
		type: [
			{
				day: Number,
				zone: String,
			},
		],
		default: [],
	},
});

module.exports = mongoose.model("Camera", cameraSchema);