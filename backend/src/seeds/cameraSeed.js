require("dotenv").config();

const mongoose = require("mongoose");
const Camera = require("../models/Camera");

const cameras = [
	{
		name: "Camera 1",
		color: "green",
		coveredZones: [],
	},
	{
		name: "Camera 2",
		color: "blue",
		coveredZones: [],
	},
	{
		name: "Camera 3",
		color: "yellow",
		coveredZones: [],
	},
	{
		name: "Camera 4",
		color: "red",
		coveredZones: [],
	},
];

async function seedCameras() {
	try {
		await mongoose.connect(process.env.MONGO_URI);

		await Camera.deleteMany();
		await Camera.insertMany(cameras);

		console.log("Cameras seeded successfully.");
	} catch (error) {
		console.error("Error seeding cameras:", error);
	} finally {
		await mongoose.connection.close();
	}
}

seedCameras();
