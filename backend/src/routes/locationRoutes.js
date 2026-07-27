const express = require("express");
const router = express.Router();
const Location = require("../models/Location");

// GET all locations
router.get("/", async (req, res) => {
    try {
        const locations = await Location.find();
        res.status(200).json(locations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;