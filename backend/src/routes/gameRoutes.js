const express = require("express");
const router = express.Router();

const Camera = require("../models/Camera");
const Resident = require("../models/Resident");
const Game = require("../models/Game");

const chooseCultMembers = require("../utils/cultGenerator");

const generateMurderSpots = require("../utils/murderSpotGenerator");
const MurderSpot = require("../models/MurderSpot");

router.post("/start", async (req, res) => {
	try {
		await Camera.deleteMany();

		const cameras = await Camera.insertMany([
			{ name: "Camera 1", color: "green" },
			{ name: "Camera 2", color: "blue" },
			{ name: "Camera 3", color: "yellow" },
			{ name: "Camera 4", color: "red" },
		]);

		const cultMembers = await chooseCultMembers();

		await Resident.updateMany({}, { isCultMember: false });

		await Resident.updateMany(
			{
				_id: {
					$in: cultMembers.map((member) => member._id),
				},
			},
			{
				isCultMember: true,
			},
		);

		console.log(
			"Cult members:",
			cultMembers.map((member) => member.name),
		);

		await MurderSpot.deleteMany();

		const startDate = new Date();

		const currentDate = new Date(startDate);

		const deadlineDate = new Date(startDate);
		deadlineDate.setDate(deadlineDate.getDate() + 4);

		await Game.deleteMany();

		const game = await Game.create({
			startDate,
			currentDate,
			deadlineDate,
			investigationDay: 1,
			status: "active",
		});

		const murders = await generateMurderSpots(startDate);

		console.log("Murder spots:", murders);

		console.log("Game started:", game);

		res.status(201).json({
			message: "Game started",
			game: game,
			cameras: cameras,
			murderSpots: murders,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
