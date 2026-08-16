const express = require("express");
const router = express.Router();

const Resident = require("../models/Resident");
const roleRoutines = require("../utils/routineGenerator");

// Get all residents with their working schedule.
router.get("/", async (req, res) => {
	try {
		const residents = await Resident.find().select("-isCultMember");

		const residentsWithSchedule = residents.map((resident) => {
			const routine = roleRoutines[resident.role];

			return {
				...resident.toObject(),
				workingHours: routine?.start && routine?.end ? `${routine.start} - ${routine.end}` : "No fixed hours",
				daysOff: routine?.freeDays || [],
			};
		});

		res.status(200).json(residentsWithSchedule);
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
});

// Check whether the player's accusations match the cult members.
router.post("/accuse", async (req, res) => {
	try {
		const { accusations } = req.body;

		if (!Array.isArray(accusations)) {
			return res.status(400).json({
				error: "Accusations must be an array.",
			});
		}

		const cultMembers = await Resident.find({
			isCultMember: true,
		});

		const actualCultMembers = cultMembers.map((resident) => resident.name);

		const correctCount = accusations.filter((name) => actualCultMembers.includes(name)).length;

		const correct = accusations.length === actualCultMembers.length && correctCount === actualCultMembers.length;

		res.json({
			correct: correct,
			correctCount: correctCount,
			selected: accusations,
			actualCultMembers: actualCultMembers,
		});
	} catch (error) {
		console.error("Error checking accusation:", error);

		res.status(500).json({
			error: "Could not check accusation.",
		});
	}
});

module.exports = router;