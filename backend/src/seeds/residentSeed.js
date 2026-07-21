const mongoose = require("mongoose");
const Resident = require("../models/Resident");

const residents = [
    {
        name: "Rick Grimes",
        house: "A3",
        age: 30,
        role: "Teacher"
    },
    {
        name: "Maggie Greene",
        house: "B1",
        age: 55,
        role: "Shop owner"
    },
    {
        name: "Daryl Dixon",
        house: "C2",
        age: 42,
        role: "Doctor"
    },
    {
        name: "Michonne Wilson",
        house: "D4",
        age: 28,
        role: "Nurse"
    },
    {
        name: "Carol Peletier",
        house: "E1",
        age: 65,
        role: "Retired"
    },
    {
        name: "Rosita Espinosa",
        house: "F3",
        age: 35,
        role: "Lawyer"
    },
    {
        name: "Glenn Rhee",
        house: "G2",
        age: 48,
        role: "Mechanic"
    },
    {
        name: "Sasha Williams",
        house: "H1",
        age: 25,
        role: "Student"
    },
    {
        name: "Bob Stookey",
        house: "I4",
        age: 50,
        role: "Engineer"
    },
    {
        name: "Beth Jones",
        house: "J3",
        age: 39,
        role: "Artist"
    }
];

async function seedResidents() {
    try {
        await mongoose.connect("mongodb://localhost:27017/neiboorhood-surveillance");

        await Resident.deleteMany();

        await Resident.insertMany(residents);

        console.log("Residents added!");

        mongoose.disconnect();

    } catch(error) {
        console.error(error);
    }
}

seedResidents();