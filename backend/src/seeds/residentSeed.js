const mongoose = require("mongoose");
const Resident = require("../models/Resident");

const residents = [
	{
		name: "Rick Grimes",
		house: "Michonne and Rick's House",
		age: 42,
		role: "Police Officer",
	},
	{
		name: "Maggie Greene",
		house: "Maggie and Glenn's House",
		age: 27,
		role: "Shop owner",
	},
	{
		name: "Daryl Dixon",
		house: "Daryl's House",
		age: 42,
		role: "Doctor",
	},
	{
		name: "Michonne Wilson",
		house: "Michonne and Rick's House",
		age: 40,
		role: "Artist",
	},
	{
		name: "Carol Peletier",
		house: "Carol's House",
		age: 55,
		role: "Retired",
	},
	{
		name: "Rosita Espinosa",
		house: "Rosita's House",
		age: 35,
		role: "Teacher",
	},
	{
		name: "Glenn Rhee",
		house: "Maggie and Glenn's House",
		age: 27,
		role: "Forestkeeper",
	},
	{
		name: "Sasha Williams",
		house: "Sasha's House",
		age: 39,
		role: "Teacher",
	},
	{
		name: "Bob Stookey",
		house: "Bob's House",
		age: 40,
		role: "Cashier",
	},
	{
		name: "Beth Jones",
		house: "Beth's House",
		age: 25,
		role: "Student",
	},
	{
		name: "Eziekiel King",
		house: "Eziekiel's House",
		age: 55,
		role: "Gravekeeper",
	},
];

async function seedResidents() {
	try {
		await mongoose.connect("mongodb://localhost:27017/neighbourhood-surveillance");

		await Resident.deleteMany();

		await Resident.insertMany(residents);

		console.log("Residents added!");

		mongoose.disconnect();
	} catch (error) {
		console.error(error);
	}
}

seedResidents();
