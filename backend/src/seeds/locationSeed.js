const mongoose = require("mongoose");
const Location = require("../models/Location");

const locations = [
	{
		name: "House A3",
		type: "House",
		position: {
			x: 100,
			y: 100,
		},
	},
	{
		name: "House B1",
		type: "House",
		position: {
			x: 250,
			y: 100,
		},
	},

	{
		name: "House C2",
		type: "House",
		position: {
			x: 400,
			y: 100,
		},
	},

	{
		name: "House D4",
		type: "House",
		position: {
			x: 550,
			y: 100,
		},
	},

	{
		name: "House E5",
		type: "House",
		position: {
			x: 700,
			y: 100,
		},
	},

	{
		name: "House F6",
		type: "House",
		position: {
			x: 850,
			y: 100,
		},
	},

	{
		name: "House G7",
		type: "House",
		position: {
			x: 1000,
			y: 100,
		},
	},

	{
		name: "House H8",
		type: "House",
		position: {
			x: 1150,
			y: 100,
		},
	},

	{
		name: "House I9",
		type: "House",
		position: {
			x: 1300,
			y: 100,
		},
	},

	{
		name: "Supermarket",
		type: "shop",
		position: {
			x: 1450,
			y: 100,
		},
	},

	{
		name: "School",
		type: "school",
		position: {
			x: 1600,
			y: 100,
		},
	},
];

async function seedLocations() {
	try {
		await mongoose.connect("mongodb://localhost:27017/neighbourhood-surveillance");

		await Location.deleteMany();

		await Location.insertMany(locations);

		console.log("Locations added!");

		mongoose.disconnect();
	} catch (error) {
		console.error(error);
	}
}

seedLocations();
