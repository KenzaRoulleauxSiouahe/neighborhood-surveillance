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

	status: {
		type: String,
		enum: ["active", "won", "lost"],
		default: "active",
	},
});

module.exports = mongoose.model("Game", gameSchema);
