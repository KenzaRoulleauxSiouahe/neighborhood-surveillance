const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: "../.env" });

const residentRoutes = require("./src/routes/residentRoutes");
const locationRoutes = require("./src/routes/locationRoutes");
const cameraRoutes = require("./src/routes/cameraRoutes");
const gameRoutes = require("./src/routes/gameRoutes");
const locationGameRoutes = require("./src/routes/locationGameRoutes.js");
const zoneRoutes = require("./src/routes/zoneRoutes");
const actionRoutes = require("./src/routes/actionRoutes");
const murderSpotRoutes = require("./src/routes/murderSpotRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// API routes
app.use("/api/residents", residentRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/cameras", cameraRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/location-game", locationGameRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/actions", actionRoutes);
app.use("/api/murder-spots", murderSpotRoutes);

// Connect to MongoDB
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((err) => {
		console.error("Error connecting to MongoDB:", err);
	});

// Basic server health check
app.get("/", (req, res) => {
	res.send("neighbourhood Surveillance is running!");
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
