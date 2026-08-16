const mongoose = require("mongoose");

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