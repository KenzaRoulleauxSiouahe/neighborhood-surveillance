const mongoose = require("mongoose");
const Location = require("../models/Location");

const locations = [
	{
		name: "House 1",
		type: "house",
		zone: null,
	},
	{
		name: "House 2",
		type: "house",
		zone: null,
	},

	{
		name: "House 3",
		type: "house",
		zone: null,
	},

	{
		name: "House 4",
		type: "house",
		zone: null,
	},

	{
		name: "House 5",
		type: "house",
		zone: null,
	},

	{
		name: "House 6",
		type: "house",
		zone: null,
	},

	{
		name: "House 7",
		type: "house",
		zone: null,
	},

	{
		name: "House 8",
		type: "house",
		zone: null,
	},

	{
		name: "House 9",
		type: "house",
		zone: null,
	},

	{
		name: "Supermarket",
		type: "shop",
		zone: null,
	},

	{
		name: "School",
		type: "school",
		zone: null,
	},
	{
		name: "Forest",
		type: "forest",
		zone: null,
	},
	{
		name: "Police Station",
		type: "police",
		zone: null,
	},
	{
		name: "Cemetery",
		type: "cemetery",
		zone: null,
	},
	{
		name: "Clothing Store",
		type: "shop",
		zone: null,
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
