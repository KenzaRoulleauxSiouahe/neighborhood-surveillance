const mongoose = require("mongoose");
const MurderSpot = require("../models/MurderSpot");
const generateMurderSpots = require("../utils/murderSpotGenerator");

mongoose
	.connect("mongodb://localhost:27017/neighbourhood-surveillance")
	.then(async () => {
		await MurderSpot.deleteMany();

		const gameDate = new Date("2026-08-07");

		const murders = generateMurderSpots(gameDate);

		await MurderSpot.insertMany(murders);

		console.log("Random murder spots created:");
		console.log(murders);

		mongoose.connection.close();
	})
	.catch((error) => {
		console.error(error);
	});
