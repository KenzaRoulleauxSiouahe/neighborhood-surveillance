const mongoose = require("mongoose");

// Stores the state and progress of a player's investigation.
const gameSchema = new mongoose.Schema({
	playerId: {
		type: String,
		required: true,
		index: true,
	},

	// Date when the investigation starts.
	startDate: {
		type: Date,
		required: true,
	},

	// Current simulated date of the investigation.
	currentDate: {
		type: Date,
		required: true,
	},

	// Final date by which the investigation must be completed.
	deadlineDate: {
		type: Date,
		required: true,
	},

	// Current investigation day, starting at day 1.
	investigationDay: {
		type: Number,
		default: 1,
	},

	// Real-world timestamp used to calculate the simulated game clock.
	investigationStartedAt: {
		type: Date,
		default: null,
	},

	// Indicates whether the current investigation day is running.
	investigationRunning: {
		type: Boolean,
		default: false,
	},

	// Current state of the investigation.
	status: {
		type: String,
		enum: ["active", "won", "lost"],
		default: "active",
	},
});

module.exports = mongoose.model("Game", gameSchema);
