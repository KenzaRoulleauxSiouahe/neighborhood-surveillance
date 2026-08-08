const express = require("express");
const router = express.Router();
const Resident = require("../models/Resident");
const roleRoutines = require("../utils/routineGenerator");

// GET all residents
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

module.exports = router;