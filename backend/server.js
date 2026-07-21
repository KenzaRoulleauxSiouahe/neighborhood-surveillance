const express = require("express");
const mongoose = require("mongoose");

const app = express();

const port = process.env.PORT || 5000;

const Resident = require("./src/models/Resident");

mongoose
	.connect("mongodb://localhost:27017/neighborhood-surveillance")
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((err) => {
		console.error("Error connecting to MongoDB:", err);
	});

app.get("/", (req, res) => {
	res.send("neighborhood Surveillance is running!");
});

app.get("/test-resident", async (req, res) => {
	try {
		const resident = new Resident({
			name: "Mr Smith",
			house: "A3",
			age: 30,
			role: "Plumber",
			isCultMember: true,
		});
		await resident.save();

		res.status(201).json(resident);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

