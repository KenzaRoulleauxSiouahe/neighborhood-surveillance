const express = require("express");
const router = express.Router();
const Resident = require("../models/Resident");

// GET all residents
router.get("/", async (req, res) => {
    try {
        const residents = await Resident.find();
        res.status(200).json(residents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;