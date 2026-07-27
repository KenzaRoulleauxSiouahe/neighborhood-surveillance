const express = require("express");
const router = express.Router();

const Zone = require("../models/Zone");

// GET all zones
router.get("/", async (req, res) => {
	try {
		const zones = await Zone.find();
		res.status(200).json(zones);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.post("/seed", async (req, res) => {

    try {
        await Zone.deleteMany();

        const zones = await Zone.insertMany([
            {   name: "A1" ,
                locations: []
            },
            {   name: "A2" ,
                locations: []
            },
            {   name: "A3" ,
                locations: []
            },
            {   name: "A4" ,
                locations: []
            },
            {   name: "B1" ,
                locations: []
            },
            {   name: "B2" ,
                locations: []
            },
            {   name: "B3" ,
                locations: []
            },
            {   name: "B4" ,
                locations: []
            },
            {   name: "C1" ,
                locations: []
            },
            {   name: "C2" ,
                locations: []
            },
            {   name: "C3" ,
                locations: []
            },
            {   name: "C4" ,
                locations: []
            },
            {   name: "D1" ,
                locations: []
            },
            {   name: "D2" ,
                locations: []
            },
            {   name: "D3" ,
                locations: []
            },
            {   name: "D4" ,
                locations: []
            }

        ]);

        res.status(201).json({
            message: "Zones created",
            zones: zones,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
