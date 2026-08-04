let camerasData = [];
let selectedCamera = null;
let cameraPositions = {};
let locationsData = [];
let cameraCoverage = {};
let zoneCameras = {};

const API_URL = "http://localhost:5000/api";
const cameraColors = {
	"Camera 1": "green",
	"Camera 2": "blue",
	"Camera 3": "yellow",
	"Camera 4": "red",
};
const cameras = document.querySelectorAll(".camera-btn");
const cameraButtons = document.querySelectorAll(".camera-btn");
const newGameButton = document.getElementById("new-game-btn");
const zones = document.querySelectorAll(".zone");

async function loadCameras() {
	try {
		const response = await fetch(`${API_URL}/cameras`);
		const cameras = await response.json();
		camerasData = cameras;
		cameras.forEach((camera) => {
			camera.coveredZones.forEach((zone) => {
				const zoneElement = document.querySelector(`[data-zone="${zone}"]`);

				if (zoneElement) {
					zoneElement.classList.add(`camera-${camera.color}`);

					zoneCameras[zone] = camera.name;
					cameraCoverage[camera.name] = zone;
				}
			});
		});

		console.log("Loaded cameras:", camerasData);
	} catch (error) {
		console.error("Error loading cameras:", error);
	}
}

async function loadLocations() {
	try {
		const response = await fetch(`${API_URL}/locations`);
		const locations = await response.json();
		locationsData = locations;

		console.log("Loaded locations:", locationsData);
		displayLocations();
	} catch (error) {
		console.error("Error loading locations:", error);
	}
}
loadCameras();
loadLocations();

async function newGame() {
	try {
		await fetch(`${API_URL}/cameras/reset`, {
			method: "PATCH",
		});

		await fetch(`${API_URL}/location-game/generate`, {
			method: "POST",
		});

		window.location.reload();
	} catch (error) {
		console.error("Error starting new game:", error);
	}
}

function displayLocations() {
	const layer = document.getElementById("location-layer");

	locationsData.forEach((location) => {
		const icon = document.createElement("div");

		icon.classList.add("location-icon");

		if (location.type === "forest") {
			icon.classList.add("forest-icon");

			icon.innerHTML = `
				<span>🌲</span>
				<span>🌲</span>
				<span>🌲</span>
			`;
		} else {
			icon.textContent = getLocationIcon(location.type);
		}

		const zoneElement = document.querySelector(`[data-zone="${location.zone}"]`);

		if (zoneElement) {
			zoneElement.appendChild(icon);
		}
	});
}

function getZonePosition(zone) {
	const zoneElement = document.querySelector(`[data-zone="${zone}"]`);

	if (!zoneElement) {
		console.error("Zone not found:", zone);
		return { x: 0, y: 0 };
	}

	const map = document.getElementById("map");

	const zoneRect = zoneElement.getBoundingClientRect();
	const mapRect = map.getBoundingClientRect();

	return {
		x: ((zoneRect.left - mapRect.left + zoneRect.width / 2) / mapRect.width) * 100,
		y: ((zoneRect.top - mapRect.top + zoneRect.height / 2) / mapRect.height) * 100,
	};
}
function getLocationIcon(type) {
	switch (type) {
		case "forest":
			return "🌲";
		case "police":
			return "👮🏻";
		case "cemetery":
			return "⚰️";
		case "school":
			return "🏫";
		case "shop":
			return "🛒";
		case "house":
			return "🏠";
		default:
			return "📍";
	}
}
async function updateCameraCoverage(cameraId, coveredZones) {
	try {
		const response = await fetch(`${API_URL}/cameras/${cameraId}/coverage`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				coveredZones: coveredZones,
			}),
		});

		const updatedCamera = await response.json();

		console.log("Updated camera:", updatedCamera);
	} catch (error) {
		console.error("Error updating camera coverage:", error);
	}
}

cameras.forEach((button) => {
	button.addEventListener("click", () => {
		const cameraName = button.dataset.camera;

		selectedCamera = camerasData.find((camera) => camera.name === cameraName);

		console.log("Selected camera:", selectedCamera);

		cameras.forEach((cam) => {
			cam.classList.remove("selected");
		});

		button.classList.add("selected");
	});
});
newGameButton.addEventListener("click", () => {
	const confirmNewGame = confirm("Are you sure you want to start a new game? This will reset all camera placements and generate new locations.");

	if (confirmNewGame) {
		newGame();
	}
});

zones.forEach((zone) => {
	zone.addEventListener("click", async () => {
		if (selectedCamera === null) {
			console.log("Please select a camera first.");
			return;
		}

		const zoneName = zone.dataset.zone;

		const oldZone = cameraCoverage[selectedCamera.name];

		if (oldZone === zoneName) {
			return;
		}

		if (zoneCameras[zoneName] && zoneCameras[zoneName] !== selectedCamera.name) {
			const otherCamera = zoneCameras[zoneName];

			const confirmMove = confirm(`${otherCamera} is already placed at zone ${zoneName}. Do you want to move ${selectedCamera.name} to zone ${zoneName}?`);

			if (!confirmMove) {
				return;
			}

			const otherCameraData = camerasData.find((camera) => camera.name === otherCamera);

			if (otherCameraData) {
				zone.classList.remove(`camera-${otherCameraData.color}`);
			}

			delete cameraCoverage[otherCamera];
			delete zoneCameras[zoneName];
			otherCameraData.coveredZones = [];

			await updateCameraCoverage(otherCameraData._id, []);
		}

		if (oldZone) {
			const oldZoneElement = document.querySelector(`[data-zone="${oldZone}"]`);

			if (oldZoneElement) {
				oldZoneElement.classList.remove(`camera-${selectedCamera.color}`);
			}

			delete zoneCameras[oldZone];
		}

		// Add color immediately
		zone.classList.add(`camera-${selectedCamera.color}`);

		cameraCoverage[selectedCamera.name] = zoneName;
		zoneCameras[zoneName] = selectedCamera.name;

		selectedCamera.coveredZones = [zoneName];

		await updateCameraCoverage(selectedCamera._id, selectedCamera.coveredZones);

		console.log(selectedCamera.name, "is placed at", zoneName);
	});
});
