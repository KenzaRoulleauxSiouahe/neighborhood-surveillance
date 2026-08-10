let camerasData = [];
let selectedCamera = null;
let cameraPositions = {};
let locationsData = [];
let cameraCoverage = {};
let zoneCameras = {};
let residentsData = [];
let investigationRunning = false;
let investigationTimer = null;
let investigationStartTime = null;
let gameClockInterval = null;
let gameTimeMinutes = 0;
let gameStartRealTime = null;

const API_URL = "http://localhost:5000/api";
const cameraColors = {
	"Camera 1": "green",
	"Camera 2": "blue",
	"Camera 3": "yellow",
	"Camera 4": "red",
};

const briefingScreen = document.getElementById("briefing-screen");
const beginGameButton = document.getElementById("begin-game-btn");
const cameras = document.querySelectorAll(".camera-btn");
const cameraButtons = document.querySelectorAll(".camera-btn");
const newGameButton = document.getElementById("new-game-btn");
const zones = document.querySelectorAll(".zone");
const residentFilesButton = document.getElementById("resident-files-btn");
const residentFileOverlay = document.getElementById("resident-file-overlay");
const closeResidentFileButton = document.getElementById("close-resident-file");
const residentTabs = document.getElementById("resident-tabs");
const startInvestigationButton = document.getElementById("start-investigation-btn");
const GAME_MINUTES_PER_REAL_SECOND = 10;

async function loadBriefingVictims() {
	try {
		const response = await fetch(`${API_URL}/murder-spots`);
		const murders = await response.json();

		murders.sort((a, b) => new Date(a.date) - new Date(b.date));

		murders.forEach((murder, index) => {
			const victimNumber = index + 1;

			const nameElement = document.getElementById(`victim-${victimNumber}-name`);

			const dateElement = document.getElementById(`victim-${victimNumber}-date`);

			if (nameElement && dateElement) {
				nameElement.textContent = murder.victim;

				const date = new Date(murder.date);

				dateElement.textContent = date.toLocaleDateString("en-GB", {
					day: "numeric",
					month: "long",
					year: "numeric",
				});
			}
		});
	} catch (error) {
		console.error("Error loading briefing victims:", error);
	}
}

function showBriefing() {
	briefingScreen.style.display = "flex";
}

function hideBriefing() {
	briefingScreen.style.display = "none";
	sessionStorage.setItem("briefingSeen", "true");
}

beginGameButton.addEventListener("click", () => {
	hideBriefing();
});
async function loadCameras() {
	try {
		document.querySelectorAll(".zone").forEach((zone) => {
			zone.classList.remove("camera-green", "camera-blue", "camera-yellow", "camera-red");
		});

		cameraCoverage = {};
		zoneCameras = {};

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
		updateStartInvestigationButton();
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

async function loadMurderSpots() {
	try {
		const response = await fetch(`${API_URL}/murder-spots`);

		const murders = await response.json();

		console.log("Loaded murder spots:", murders);

		murders.forEach((murder) => {
			const zoneElement = document.querySelector(`[data-zone="${murder.zone}"]`);

			if (zoneElement) {
				const murderLayer = zoneElement.querySelector(".murder-layer");

				const skull = document.createElement("div");

				skull.classList.add("murder-icon");

				skull.textContent = "☠️";

				skull.setAttribute("title", `Murder scene - Victim: ${murder.victim}`);

				murderLayer.appendChild(skull);
			}
		});
	} catch (error) {
		console.error("Error loading murder spots:", error);
	}
}

loadCameras();
loadLocations();
loadMurderSpots();
loadBriefingVictims();
resumeInvestigation();

if (sessionStorage.getItem("briefingSeen") === "true") {
	hideBriefing();
}

async function newGame() {
	try {
		investigationRunning = false;

		if (investigationTimer) {
			clearInterval(investigationTimer);
			investigationTimer = null;
		}

		if (gameClockInterval) {
			clearInterval(gameClockInterval);
			gameClockInterval = null;
		}

		investigationStartTime = null;
		gameStartRealTime = null;

		const logsContainer = document.getElementById("logs");

		if (logsContainer) {
			logsContainer.innerHTML = "<p>No activity yet...</p>";
		}

		const gameTime = document.getElementById("game-time");

		if (gameTime) {
			gameTime.textContent = "00:00:00";
		}

		startInvestigationButton.disabled = true;

		await fetch(`${API_URL}/game/start`, {
			method: "POST",
		});

		await loadCameras();

		await fetch(`${API_URL}/location-game/generate`, {
			method: "POST",
		});

		locationsData = [];

		const response = await fetch(`${API_URL}/locations`);
		const locations = await response.json();

		locationsData = locations;

		document.querySelectorAll(".location-icon").forEach((icon) => {
			icon.remove();
		});
		displayLocations();

		document.querySelectorAll(".murder-icon").forEach((icon) => {
			icon.remove();
		});

		await loadMurderSpots();
		await loadBriefingVictims();
		showBriefing();
		sessionStorage.removeItem("briefingSeen");
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
			icon.title = location.name;
		} else {
			icon.textContent = getLocationIcon(location.type);

			icon.title = location.name;
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

		updateStartInvestigationButton();
		console.log(selectedCamera.name, "is placed at", zoneName);
	});
});

function updateStartInvestigationButton() {
	const allCamerasPlaced = camerasData.every((camera) => camera.coveredZones && camera.coveredZones.length > 0);

	startInvestigationButton.disabled = !allCamerasPlaced;
}

residentFilesButton.addEventListener("click", async () => {
	residentFileOverlay.style.display = "flex";

	await loadResidents();
});

closeResidentFileButton.addEventListener("click", () => {
	residentFileOverlay.style.display = "none";
});

async function loadResidents() {
	try {
		const response = await fetch(`${API_URL}/residents`);

		residentsData = await response.json();

		console.log("Loaded residents:", residentsData);

		displayResidentTabs();

		if (residentsData.length > 0) {
			displayResident(residentsData[0]);
		}
	} catch (error) {
		console.error("Error loading residents:", error);
	}
}

function displayResidentTabs() {
	residentTabs.innerHTML = "";

	residentsData.forEach((resident, index) => {
		const tab = document.createElement("button");

		tab.classList.add("resident-tab");

		tab.textContent = resident.name;

		tab.addEventListener("click", () => {
			document.querySelectorAll(".resident-tab").forEach((button) => {
				button.classList.remove("selected");
			});

			tab.classList.add("selected");

			displayResident(resident);
		});

		residentTabs.appendChild(tab);

		if (index === 0) {
			tab.classList.add("selected");
		}
	});
}
function displayResident(resident) {
	document.getElementById("resident-name").textContent = resident.name;

	document.getElementById("resident-name-info").textContent = resident.name;

	document.getElementById("resident-age").textContent = resident.age;

	document.getElementById("resident-role").textContent = resident.role;

	document.getElementById("resident-house").textContent = getResidentLocation(resident.house);

	document.getElementById("resident-working-hours").textContent = resident.workingHours || "Unknown";

	document.getElementById("resident-days-off").textContent = resident.daysOff && resident.daysOff.length > 0 ? resident.daysOff.join(", ") : "None";
}

function getResidentLocation(houseName) {
	const location = locationsData.find((location) => location.name === houseName);

	if (!location) {
		return "Unknown";
	}

	return `${location.name} — ${location.zone}`;
}

function displayInvestigationLog(log) {
	const logsContainer = document.getElementById("logs");

	if (!logsContainer) {
		return;
	}

	const logEntry = document.createElement("div");

	logEntry.classList.add("log-entry");

	const cameraSpan = document.createElement("span");

	cameraSpan.classList.add("camera-log-name", `camera-log-${cameraColors[log.camera]}`);

	cameraSpan.textContent = log.camera;

	logEntry.appendChild(document.createTextNode(`[${log.time}] `));

	logEntry.appendChild(cameraSpan);

	logEntry.appendChild(document.createTextNode(` | ${log.resident} | ${log.action} | ${log.location}`));

	if (log.suspicious) {
		logEntry.classList.add("suspicious-log");
	}

	logsContainer.appendChild(logEntry);

	logsContainer.scrollTop = logsContainer.scrollHeight;
}

startInvestigationButton.addEventListener("click", async () => {
	if (investigationRunning) {
		return;
	}

	const logsContainer = document.getElementById("logs");

	logsContainer.innerHTML = "";

	investigationRunning = true;

	startInvestigationButton.disabled = true;

	console.log("Investigation started.");
	

	try {
		const response = await fetch(`${API_URL}/actions/generate`, {
			method: "POST",
		});

		if (!response.ok) {
			throw new Error("Failed to generate investigation logs.");
		}

		const logs = await response.json();

		console.log("Day 1 logs:", logs);

		const visibleLogs = logs.filter((log) => log.camera !== null);

		console.log("Visible camera logs:", visibleLogs);

		const gameResponse = await fetch(`${API_URL}/game/active`);

		if (!gameResponse.ok) {
			throw new Error("Could not find active game.");
		}

		const game = await gameResponse.json();

		startGameClock(game.investigationStartedAt);

		investigationStartTime = Date.now();

		const gameMinutesPerSecond = 10;

		let displayedLogIndex = 0;

		investigationTimer = setInterval(() => {
			const elapsedSeconds = (Date.now() - investigationStartTime) / 1000;

			const elapsedGameMinutes = elapsedSeconds * gameMinutesPerSecond;

			const hours = Math.floor(elapsedGameMinutes / 60);

			const minutes = Math.floor(elapsedGameMinutes % 60);

			const currentGameMinutes = hours * 60 + minutes;

			while (displayedLogIndex < visibleLogs.length) {
				const log = visibleLogs[displayedLogIndex];

				const [logHours, logMinutes] = log.time.split(":").map(Number);

				const logGameMinutes = logHours * 60 + logMinutes;

				if (logGameMinutes > currentGameMinutes) {
					break;
				}

				displayInvestigationLog(log);

				displayedLogIndex++;
			}

			console.log(`Investigation time: ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);

			if (elapsedGameMinutes >= 24 * 60) {
				clearInterval(investigationTimer);

				investigationRunning = false;

				console.log("Investigation day finished.");

				startInvestigationButton.disabled = true;
			}
		}, 1000);
	} catch (error) {
		console.error("Error starting investigation:", error);

		investigationRunning = false;

		startInvestigationButton.disabled = false;
	}
});

function startGameClock(startedAt) {
	if (gameClockInterval) {
		clearInterval(gameClockInterval);
	}

	gameStartRealTime = new Date(startedAt).getTime();

	updateGameClock();

	gameClockInterval = setInterval(() => {
		updateGameClock();
	}, 50);
}
function stopGameClock() {
	if (gameClockInterval) {
		clearInterval(gameClockInterval);
		gameClockInterval = null;
	}
}
function updateGameClock() {
	if (!gameStartRealTime) {
		return;
	}

	const realElapsedSeconds = (Date.now() - gameStartRealTime) / 1000;

	const totalGameMinutes = realElapsedSeconds * 10;

	if (totalGameMinutes >= 24 * 60) {
		stopGameClock();

		document.getElementById("game-time").textContent = "24:00:00";

		return;
	}

	const hours = Math.floor(totalGameMinutes / 60) % 24;

	const minutes = Math.floor(totalGameMinutes % 60);

	const seconds = Math.floor((realElapsedSeconds * 60) % 60);

	const formattedTime = `${String(hours).padStart(2, "0")}:` + `${String(minutes).padStart(2, "0")}:` + `${String(seconds).padStart(2, "0")}`;

	document.getElementById("game-time").textContent = formattedTime;
}

async function resumeInvestigation() {
	try {
		const response = await fetch(`${API_URL}/game/active`);

		if (!response.ok) {
			console.log("No active investigation.");
			return;
		}

		const game = await response.json();

		console.log("Active game:", game);

		if (game.investigationRunning && game.investigationStartedAt) {
			console.log("Resuming investigation clock...");

			startGameClock(game.investigationStartedAt);

			const dayElement = document.getElementById("investigation-day");

			if (dayElement) {
				dayElement.textContent = `INVESTIGATION DAY ${game.investigationDay}`;
			}

			const logsResponse = await fetch(`${API_URL}/actions/logs`);

			if (!logsResponse.ok) {
				throw new Error("Failed to load saved investigation logs.");
			}

			const logs = await logsResponse.json();
			console.log("Saved logs:", logs);

			const visibleLogs = logs.filter((log) => log.camera !== null);

			console.log("Visible saved logs:", visibleLogs);

			startInvestigationLogPlayback(visibleLogs, game.investigationStartedAt);
		}
	} catch (error) {
		console.error("Error resuming investigation:", error);
	}
}

function startInvestigationLogPlayback(visibleLogs, investigationStartedAt) {
	if (investigationTimer) {
		clearInterval(investigationTimer);
	}

	const logsContainer = document.getElementById("logs");

	logsContainer.innerHTML = "";

	const gameStartTime = new Date(investigationStartedAt).getTime();

	let displayedLogIndex = 0;

	function checkLogs() {
		const elapsedRealSeconds = (Date.now() - gameStartTime) / 1000;

		const elapsedGameMinutes = elapsedRealSeconds * 10;

		const currentGameMinutes = Math.floor(elapsedGameMinutes);

		while (displayedLogIndex < visibleLogs.length) {
			const log = visibleLogs[displayedLogIndex];

			const [logHours, logMinutes] = log.time.split(":").map(Number);

			const logGameMinutes = logHours * 60 + logMinutes;

			if (logGameMinutes > currentGameMinutes) {
				break;
			}

			displayInvestigationLog(log);

			displayedLogIndex++;
		}

		if (elapsedGameMinutes >= 24 * 60) {
			clearInterval(investigationTimer);

			investigationRunning = false;

			console.log("Investigation day finished.");

			return;
		}
	}

	checkLogs();

	investigationTimer = setInterval(checkLogs, 1000);
}
