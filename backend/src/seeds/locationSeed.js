require("dotenv").config();

const mongoose = require("mongoose");
const Location = require("../models/Location");

const locations = [
	{
		name: "Michonne and Rick's House",
		type: "house",
		zone: null,
	},
	{
		name: "Maggie and Glenn's House",
		type: "house",
		zone: null,
	},
	{
		name: "Daryl's House",
		type: "house",
		zone: null,
	},
	{
		name: "Carol's House",
		type: "house",
		zone: null,
	},
	{
		name: "Rosita's House",
		type: "house",
		zone: null,
	},
	{
		name: "Sasha's House",
		type: "house",
		zone: null,
	},
	{
		name: "Bob's House",
		type: "house",
		zone: null,
	},
	{
		name: "Beth's House",
		type: "house",
		zone: null,
	},
	{
		name: "Eziekiel's House",
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
		await mongoose.connect(process.env.MONGO_URI);

		await Location.deleteMany();
		await Location.insertMany(locations);

		console.log("Locations seeded successfully.");
	} catch (error) {
		console.error("Error seeding locations:", error);
	} finally {
		await mongoose.connection.close();
	}
}

seedLocations();
