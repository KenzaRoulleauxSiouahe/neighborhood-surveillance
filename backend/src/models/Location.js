const mongoose = require("mongoose");

// Stores the locations that can appear on the neighbourhood map.
const locationSchema = new mongoose.Schema({
	// Name used to identify the location.
	name: {
		type: String,
		required: true,
	},

	// Type of location, such as house, shop, school...
	type: {
		type: String,
		required: true,
	},

	// Zone of the map where the location is placed.
	zone: {
		type: String,
		default: null,
	},
});

module.exports = mongoose.model("Location", locationSchema);
