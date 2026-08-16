const mongoose = require("mongoose");

// Stores a map zone and the locations contained within it.
const zoneSchema = new mongoose.Schema({
	// Unique identifier of the zone, such as A1 or B3.
	name: {
		type: String,
		required: true,
		unique: true,
	},

	// Names of the locations belonging to this zone.
	location: [
		{
			type: String,
		},
	],
});

module.exports = mongoose.model("Zone", zoneSchema);