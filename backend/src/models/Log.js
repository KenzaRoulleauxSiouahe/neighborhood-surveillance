const mongoose = require("mongoose");

// Stores an individual activity detected during an investigation.
const logSchema = new mongoose.Schema({
	// Resident involved in the activity.
	resident: {
		type: String,
		required: true,
	},

	// Camera that detected the activity. Null means no camera detected it.
	camera: {
		type: String,
		default: null,
	},

	// Day of the week on which the activity occurred.
	day: {
		type: String,
		required: true,
	},

	// Date on which the activity occurred.
	date: {
		type: Date,
		required: true,
	},

	// Simulated time at which the activity occurred.
	time: {
		type: String,
		required: true,
	},

	// Description of the resident's activity.
	action: {
		type: String,
		required: true,
	},

	// Location where the activity occurred.
	location: {
		type: String,
		default: null,
	},

	// Indicates whether the activity has been marked as suspicious.
	suspicious: {
		type: Boolean,
		default: false,
	},

	// Numerical value representing how suspicious the activity is.
	suspicionLevel: {
		type: Number,
		default: 0,
	},

	// Investigation day during which the activity was recorded.
	investigationDay: {
		type: Number,
		required: true,
	},
});

module.exports = mongoose.model("Log", logSchema);
