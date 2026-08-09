const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
	resident: {
		type: String,
		required: true,
	},

	camera: {
		type: String,
		default: null,
	},

	day: {
		type: String,
		required: true,
	},

	date: {
		type: Date,
		required: true,
	},

	time: {
		type: String,
		required: true,
	},

	action: {
		type: String,
		required: true,
	},

	location: {
		type: String,
		default: null,
	},

	suspicious: {
		type: Boolean,
		default: false,
	},

	suspicionLevel: {
		type: Number,
		default: 0,
	},
});

module.exports = mongoose.model("Log", logSchema);
