const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Resident = require("./src/models/Resident");
const residentRoutes = require("./src/routes/residentRoutes");

const Location = require("./src/models/Location");
const locationRoutes = require("./src/routes/locationRoutes");

const cameraRoutes = require("./src/routes/cameraRoutes");
const Camera = require("./src/models/Camera");

const gameRoutes = require("./src/routes/gameRoutes");

const zoneRoutes = require("./src/routes/zoneRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.use("/api/residents", residentRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/cameras", cameraRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/zones", zoneRoutes);

mongoose
	.connect("mongodb://localhost:27017/neighbourhood-surveillance")
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((err) => {
		console.error("Error connecting to MongoDB:", err);
	});

app.get("/", (req, res) => {
	res.send("neighbourhood Surveillance is running!");
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
