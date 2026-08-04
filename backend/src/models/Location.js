const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},

	type: {
		type: String,
		required: true,
	},

	zone: {
		type: String,
		default: null,
	},
});

module.exports = mongoose.model("Location", locationSchema);
