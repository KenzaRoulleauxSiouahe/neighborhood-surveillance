const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
	{
		uid: {
			type: String,
			required: true,
			unique: true,
			default: uuidv4,
		},

		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("User", userSchema);
