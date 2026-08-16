const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Stores an anonymous user identifier for distinguishing game sessions.
const userSchema = new mongoose.Schema(
	{
		uid: {
			type: String,
			required: true,
			unique: true,
			default: uuidv4,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("User", userSchema);
