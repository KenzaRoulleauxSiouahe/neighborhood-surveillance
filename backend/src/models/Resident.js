const mongoose = require("mongoose");

// Stores the information and daily schedule of each resident.
const residentSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},

	// Name of the house where the resident lives.
	house: {
		type: String,
		required: true,
	},

	age: {
		type: Number,
		required: true,
	},

	// Resident's occupation or role in the neighbourhood.
	role: {
		type: String,
		required: true,
	},

	// Indicates whether the resident is a member of the cult.
	isCultMember: {
		type: Boolean,
		default: false,
	},

	// Resident's usual working hours.
	workingHours: {
		type: String,
		default: "Unknown",
	},

	// Days when the resident does not work.
	daysOff: {
		type: [String],
		default: [],
	},
});

module.exports = mongoose.model("Resident", residentSchema);
