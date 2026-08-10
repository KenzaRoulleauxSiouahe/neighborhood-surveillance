const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
	startDate: {
		type: Date,
		required: true,
	},

	currentDate: {
		type: Date,
		required: true,
	},

	deadlineDate: {
		type: Date,
		required: true,
	},

	investigationDay: {
		type: Number,
		default: 1,
	},

	investigationStartedAt: {
		type: Date,
		default: null,
	},

	investigationRunning: {
		type: Boolean,
		default: false,
	},

	status: {
		type: String,
		enum: ["active", "won", "lost"],
		default: "active",
	},
});

module.exports = mongoose.model("Game", gameSchema);
