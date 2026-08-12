const express = require("express");
const router = express.Router();
const Resident = require("../models/Resident");
const roleRoutines = require("../utils/routineGenerator");

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
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

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

		const cultMemberNames = cultMembers.map((resident) => resident.name);

		const correct = accusations.length === cultMemberNames.length && accusations.every((name) => cultMemberNames.includes(name));

		res.json({
			correct: correct,
			selected: accusations,
			actualCultMembers: correct ? cultMemberNames : undefined,
		});
	} catch (error) {
		console.error("Error checking accusation:", error);

		res.status(500).json({
			error: "Could not check accusation.",
		});
	}
});

module.exports = router;