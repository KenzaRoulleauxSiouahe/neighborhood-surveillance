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
		await mongoose.connect("mongodb://localhost:27017/neighbourhood-surveillance");

		await Camera.deleteMany();

		await Camera.insertMany(cameras);

		console.log("Cameras seeded successfully");

		mongoose.connection.close();
	} catch (error) {
		console.error("Error seeding cameras:", error);
	}
}

seedCameras();
