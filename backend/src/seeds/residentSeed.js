const mongoose = require("mongoose");
const Resident = require("../models/Resident");

const residents = [
	{
		name: "Rick Grimes",
		age: 42,
		role: "Police Officer",
	},
	{
		name: "Maggie Greene",
		age: 27,
		role: "Shop owner",
	},
	{
		name: "Daryl Dixon",
		age: 42,
		role: "Doctor",
	},
	{
		name: "Michonne Wilson",
		age: 40,
		role: "Artist",
	},
	{
		name: "Carol Peletier",
		age: 55,
		role: "Retired",
	},
	{
		name: "Rosita Espinosa",
		age: 35,
		role: "Lawyer",
	},
	{
		name: "Glenn Rhee",
		age: 27,
		role: "Mechanic",
	},
	{
		name: "Sasha Williams",
		age: 39,
		role: "Accountant",
	},
	{
		name: "Bob Stookey",
		age: 40,
		role: "Engineer",
	},
	{
		name: "Beth Jones",
		age: 25,
		role: "Student",
	},
	{
		name: "Eziekiel King",
		age: 55,
		role: "Zoo keeper",
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
