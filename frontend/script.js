let camerasData = [];
let selectedCamera = null;
let locationsData = [];
let cameraCoverage = {};
let zoneCameras = {};
let residentsData = [];
let investigationRunning = false;
let investigationTimer = null;
let investigationStartTime = null;
let gameClockInterval = null;
let gameStartRealTime = null;
let selectedAccusations = [];
let playerId = localStorage.getItem("playerId");

const API_URL = "http://localhost:5000/api";

const cameraColors = {
	"Camera 1": "green",
	"Camera 2": "blue",
	"Camera 3": "yellow",
	"Camera 4": "red",
};

// Main interface elements
const briefingScreen = document.getElementById("briefing-screen");
const beginGameButton = document.getElementById("begin-game-btn");
const cameras = document.querySelectorAll(".camera-btn");
const newGameButton = document.getElementById("new-game-btn");
const zones = document.querySelectorAll(".zone");

const residentFilesButton = document.getElementById("resident-files-btn");
const residentFileOverlay = document.getElementById("resident-file-overlay");
const closeResidentFileButton = document.getElementById("close-resident-file");

const logArchiveButton = document.getElementById("log-archive-btn");
const logArchiveOverlay = document.getElementById("log-archive-overlay");
const closeLogArchiveButton = document.getElementById("close-log-archive");
const logArchiveDays = document.getElementById("log-archive-days");
const archivedLogs = document.getElementById("archived-logs");

const residentTabs = document.getElementById("resident-tabs");

const startInvestigationButton = document.getElementById("start-investigation-btn");
const nextDayButton = document.getElementById("next-day-btn");

const accusationButton = document.getElementById("accusation-btn");
const accusationOverlay = document.getElementById("accusation-overlay");
const closeAccusationBtn = document.getElementById("close-accusation");
const accusationResidents = document.getElementById("accusation-residents");
const submitAccusationButton = document.getElementById("submit-accusation-btn");
const accusationResult = document.getElementById("accusation-result");
const resultNewGameButton = document.getElementById("result-new-game-btn");

const caseReportButton = document.getElementById("case-report-btn");
const caseReportOverlay = document.getElementById("case-report-overlay");
const closeCaseReportButton = document.getElementById("close-case-report");

const GAME_MINUTES_PER_REAL_SECOND = 40;

accusationButton.disabled = true;

// Create a player ID if this is the first game on this browser.
if (!playerId) {
	playerId = crypto.randomUUID();
	localStorage.setItem("playerId", playerId);
}

console.log("Player ID:", playerId);

/* -------------------------
   BRIEFING
------------------------- */

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

/* -------------------------
   CAMERAS
------------------------- */

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

		updateStartInvestigationButton();
	} catch (error) {
		console.error("Error loading cameras:", error);
	}
}

/* -------------------------
   LOCATIONS
------------------------- */

async function loadLocations() {
	try {
		const response = await fetch(`${API_URL}/locations`);
		const locations = await response.json();

		locationsData = locations;

		displayLocations();
	} catch (error) {
		console.error("Error loading locations:", error);
	}
}

async function loadMurderSpots() {
	try {
		const response = await fetch(`${API_URL}/murder-spots`);
		const murders = await response.json();

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

// Load the existing map data when the page opens.
loadCameras();
loadLocations();
loadMurderSpots();
loadBriefingVictims();

if (sessionStorage.getItem("briefingSeen") === "true") {
	hideBriefing();
}

//Locations are added directly to their corresponding map zones.

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

/* -------------------------
   NEW GAME
------------------------- */

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

		const gameResponse = await fetch(`${API_URL}/game/start`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				playerId: playerId,
			}),
		});

		const gameData = await gameResponse.json();

		const dayElement = document.getElementById("investigation-day");

		if (dayElement && gameData.game) {
			const currentDate = new Date(gameData.game.currentDate);

			const weekday = currentDate.toLocaleDateString("en-GB", {
				weekday: "long",
			});

			dayElement.textContent = `INVESTIGATION DAY ${gameData.game.investigationDay} — ${weekday.toUpperCase()}`;
		}

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

newGameButton.addEventListener("click", () => {
	const confirmNewGame = confirm("Are you sure you want to start a new game? This will reset all camera placements and generate new locations.");

	if (confirmNewGame) {
		newGame();
	}
});

/* -------------------------
   CAMERA PLACEMENT
------------------------- */

async function updateCameraCoverage(cameraId, coveredZones) {
	try {
		const response = await fetch(`${API_URL}/cameras/${cameraId}/coverage`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				coveredZones: coveredZones,
				playerId: playerId,
			}),
		});

		await response.json();
	} catch (error) {
		console.error("Error updating camera coverage:", error);
	}
}

cameras.forEach((button) => {
	button.addEventListener("click", () => {
		const cameraName = button.dataset.camera;

		selectedCamera = camerasData.find((camera) => camera.name === cameraName);

		cameras.forEach((cam) => {
			cam.classList.remove("selected");
		});

		button.classList.add("selected");
	});
});

zones.forEach((zone) => {
	zone.addEventListener("click", async () => {
		if (investigationRunning) {
			return;
		}

		if (selectedCamera === null) {
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

		zone.classList.add(`camera-${selectedCamera.color}`);

		cameraCoverage[selectedCamera.name] = zoneName;
		zoneCameras[zoneName] = selectedCamera.name;

		selectedCamera.coveredZones = [zoneName];

		await updateCameraCoverage(selectedCamera._id, selectedCamera.coveredZones);
	});
});

function updateStartInvestigationButton() {
	if (investigationRunning) {
		startInvestigationButton.disabled = true;
		return;
	}

	startInvestigationButton.disabled = false;
}

/* -------------------------
   RESIDENT FILES
------------------------- */

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

/* -------------------------
   LOG ARCHIVE
------------------------- */

logArchiveButton.addEventListener("click", async () => {
	logArchiveOverlay.style.display = "flex";

	await loadLogArchive();
});

closeLogArchiveButton.addEventListener("click", () => {
	logArchiveOverlay.style.display = "none";
});

async function loadLogArchive() {
	try {
		const response = await fetch(`${API_URL}/actions/archive`);

		if (!response.ok) {
			throw new Error("Failed to load log archive.");
		}

		const logs = await response.json();

		const days = [...new Set(logs.map((log) => log.investigationDay))].sort((a, b) => a - b);

		logArchiveDays.innerHTML = "";

		days.forEach((day) => {
			const button = document.createElement("button");

			button.textContent = `INVESTIGATION DAY ${day}`;

			button.addEventListener("click", () => {
				displayArchivedLogs(logs, day);
			});

			logArchiveDays.appendChild(button);
		});
	} catch (error) {
		console.error("Error loading log archive:", error);
	}
}

function displayArchivedLogs(logs, day) {
	archivedLogs.innerHTML = "";

	const dayLogs = logs
		.filter((log) => log.investigationDay === day)
		.filter((log) => log.camera !== null)
		.sort((a, b) => a.time.localeCompare(b.time));

	if (dayLogs.length === 0) {
		archivedLogs.innerHTML = "<p>No camera logs recorded for this day.</p>";
		return;
	}

	dayLogs.forEach((log) => {
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

		archivedLogs.appendChild(logEntry);
	});
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

/* -------------------------
   INVESTIGATION
------------------------- */

startInvestigationButton.addEventListener("click", async () => {
	if (investigationRunning) {
		return;
	}

	const gameResponse = await fetch(`${API_URL}/game/active?playerId=${playerId}`);

	if (!gameResponse.ok) {
		console.error("Could not find active game.");
		return;
	}

	const game = await gameResponse.json();

	const changeCameras = confirm(`INVESTIGATION DAY ${game.investigationDay}\n\nDo you want to change the camera positions before starting the investigation?`);

	if (changeCameras) {
		alert("Change the camera positions on the map, then click START INVESTIGATION again.");

		return;
	}

	const logsContainer = document.getElementById("logs");
	logsContainer.innerHTML = "";

	investigationRunning = true;
	startInvestigationButton.disabled = true;

	try {
		const response = await fetch(`${API_URL}/actions/generate`, {
			method: "POST",
		});

		if (!response.ok) {
			throw new Error("Failed to generate investigation logs.");
		}

		const logs = await response.json();

		const visibleLogs = logs.filter((log) => log.camera !== null);

		const updatedGameResponse = await fetch(`${API_URL}/game/active?playerId=${playerId}`);

		if (!updatedGameResponse.ok) {
			throw new Error("Could not find active game.");
		}

		const updatedGame = await updatedGameResponse.json();

		const dayElement = document.getElementById("investigation-day");

		if (dayElement) {
			dayElement.textContent = `INVESTIGATION DAY ${updatedGame.investigationDay}`;
		}

		startGameClock(updatedGame.investigationStartedAt);

		investigationStartTime = new Date(updatedGame.investigationStartedAt).getTime();

		let displayedLogIndex = 0;

		investigationTimer = setInterval(async () => {
			const elapsedSeconds = (Date.now() - investigationStartTime) / 1000;

			const elapsedGameMinutes = elapsedSeconds * GAME_MINUTES_PER_REAL_SECOND;

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

			if (elapsedGameMinutes >= 24 * 60) {
				clearInterval(investigationTimer);
				investigationTimer = null;

				stopGameClock();
				investigationRunning = false;

				try {
					const finishResponse = await fetch(`${API_URL}/game/finish-investigation`, {
						method: "PATCH",
					});

					if (!finishResponse.ok) {
						console.error("Could not update investigation status on server.");
					}
				} catch (error) {
					console.error("Error finishing investigation on server:", error);
				}

				startInvestigationButton.disabled = true;

				if (updatedGame.investigationDay >= 4) {
					nextDayButton.disabled = true;
					accusationButton.disabled = false;
					accusationButton.style.display = "block";

					if (logsContainer) {
						logsContainer.innerHTML += `
							<p class="final-day-message">
								THIS WAS THE FINAL INVESTIGATION DAY.
								<br>
								Review the resident files and log archive before making your guess.
							</p>
						`;
					}
				} else {
					nextDayButton.disabled = false;
				}
			}
		}, 1000);
	} catch (error) {
		console.error("Error starting investigation:", error);

		investigationRunning = false;
		startInvestigationButton.disabled = false;
	}
});

/* -------------------------
   ACCUSATION
------------------------- */

accusationButton.addEventListener("click", async () => {
	accusationOverlay.style.display = "flex";

	await loadAccusationResidents();
});

async function loadAccusationResidents() {
	try {
		const response = await fetch(`${API_URL}/residents`);

		if (!response.ok) {
			throw new Error("Failed to load residents.");
		}

		const residents = await response.json();

		accusationResidents.innerHTML = "";
		selectedAccusations = [];

		residents.forEach((resident) => {
			const button = document.createElement("button");

			button.classList.add("accusation-resident");
			button.textContent = resident.name;

			button.addEventListener("click", () => {
				if (selectedAccusations.includes(resident.name)) {
					selectedAccusations = selectedAccusations.filter((name) => name !== resident.name);

					button.classList.remove("selected");
				} else {
					// A maximum of three residents can be selected.
					if (selectedAccusations.length >= 3) {
						return;
					}

					selectedAccusations.push(resident.name);
					button.classList.add("selected");
				}

				document.querySelectorAll(".accusation-resident").forEach((residentButton) => {
					const isSelected = residentButton.classList.contains("selected");

					residentButton.disabled = selectedAccusations.length >= 3 && !isSelected;
				});
			});

			accusationResidents.appendChild(button);
		});
	} catch (error) {
		console.error("Error loading accusation residents:", error);

		accusationResidents.innerHTML = "<p>Could not load the residents.</p>";
	}
}

submitAccusationButton.addEventListener("click", async () => {
	if (selectedAccusations.length === 0) {
		accusationResult.innerHTML = `
			<p class="accusation-warning">
				Please select at least one resident.
			</p>
		`;

		return;
	}

	try {
		const response = await fetch(`${API_URL}/residents/accuse`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				accusations: selectedAccusations,
			}),
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error);
		}

		accusationResidents.style.display = "none";
		submitAccusationButton.style.display = "none";

		let resultTitle = "";
		let resultMessage = "";

		if (result.correct) {
			resultTitle = "✓ ALL CORRECT";

			resultMessage = `
				<p>
					You identified all members of the cult.
				</p>
			`;
		} else if (result.correctCount > 0) {
			resultTitle = "⚠ PARTIALLY CORRECT";

			resultMessage = `
				<p>
					You identified some members of the cult,
					but not all of them.
				</p>
			`;
		} else {
			resultTitle = "✕ ALL WRONG";

			resultMessage = `
				<p>
					None of your accusations were correct.
				</p>
			`;
		}

		accusationResult.innerHTML = `
			<div class="accusation-result-screen">

				<h2>${resultTitle}</h2>

				${resultMessage}

				${
					!result.correct
						? `
							<div class="correct-answers">
								<h3>THE ACTUAL CULT MEMBERS WERE:</h3>

								<p>
									${result.actualCultMembers.join("<br>")}
								</p>
							</div>
						`
						: ""
				}

			</div>
		`;

		resultNewGameButton.style.display = "block";
		caseReportButton.style.display = "block";
	} catch (error) {
		console.error("Error submitting accusation:", error);

		accusationResult.innerHTML = `
			<p class="accusation-warning">
				Something went wrong while submitting the accusation.
			</p>
		`;
	}
});

closeAccusationBtn.addEventListener("click", () => {
	accusationOverlay.style.display = "none";
});

resultNewGameButton.addEventListener("click", () => {
	const confirmNewGame = confirm("Are you sure you want to start a new game? This will reset all camera placements and generate new locations.");

	if (confirmNewGame) {
		accusationOverlay.style.display = "none";
		accusationResult.innerHTML = "";
		resultNewGameButton.style.display = "none";
		accusationResidents.style.display = "grid";
		submitAccusationButton.style.display = "block";

		newGame();
	}
});

/* -------------------------
   NEXT INVESTIGATION DAY
------------------------- */

nextDayButton.addEventListener("click", async () => {
	if (investigationRunning) {
		return;
	}

	try {
		const response = await fetch(`${API_URL}/actions/next-day`, {
			method: "POST",
		});

		if (!response.ok) {
			throw new Error(`Failed to start next investigation day. Status: ${response.status}`);
		}

		const data = await response.json();

		const dayElement = document.getElementById("investigation-day");

		if (dayElement) {
			const currentDate = new Date(data.game.currentDate);

			const weekday = currentDate.toLocaleDateString("en-GB", {
				weekday: "long",
			});

			dayElement.textContent = `INVESTIGATION DAY ${data.game.investigationDay} ${weekday.toUpperCase()}`;
		}

		const logsContainer = document.getElementById("logs");

		if (logsContainer) {
			logsContainer.innerHTML = "<p>No activity yet...</p>";
		}

		const gameTime = document.getElementById("game-time");

		if (gameTime) {
			gameTime.textContent = "00:00:00";
		}

		investigationRunning = false;
		investigationStartTime = null;

		if (investigationTimer) {
			clearInterval(investigationTimer);
			investigationTimer = null;
		}

		stopGameClock();

		nextDayButton.disabled = true;
		startInvestigationButton.disabled = false;
	} catch (error) {
		console.error("Error starting next investigation day:", error);
	}
});

/* -------------------------
   GAME CLOCK
------------------------- */

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

	const totalGameMinutes = realElapsedSeconds * GAME_MINUTES_PER_REAL_SECOND;

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

/* -------------------------
   RESUME ACTIVE GAME
------------------------- */

async function resumeInvestigation() {
	try {
		const response = await fetch(`${API_URL}/game/active?playerId=${playerId}`);

		if (response.status === 404) {
			return;
		}

		if (!response.ok) {
			throw new Error(`Failed to load active game: ${response.status}`);
		}

		const game = await response.json();

		accusationButton.disabled = true;
		accusationButton.style.display = "block";

		const dayElement = document.getElementById("investigation-day");

		if (dayElement) {
			const currentDate = new Date(game.currentDate);

			const weekday = currentDate.toLocaleDateString("en-GB", {
				weekday: "long",
			});

			dayElement.textContent = `INVESTIGATION DAY ${game.investigationDay} — ${weekday.toUpperCase()}`;
		}

		if (game.investigationDay >= 4 && !game.investigationRunning) {
			investigationRunning = false;

			const gameTime = document.getElementById("game-time");

			if (gameTime) {
				gameTime.textContent = "24:00:00";
			}

			if (investigationTimer) {
				clearInterval(investigationTimer);
				investigationTimer = null;
			}

			stopGameClock();

			startInvestigationButton.disabled = true;
			nextDayButton.disabled = true;

			accusationButton.style.display = "block";
			accusationButton.disabled = false;

			return;
		}

		if (game.investigationRunning && game.investigationStartedAt) {
			investigationRunning = true;

			startGameClock(game.investigationStartedAt);

			startInvestigationButton.disabled = true;
			nextDayButton.disabled = true;

			const logsResponse = await fetch(`${API_URL}/actions/logs`);

			if (!logsResponse.ok) {
				throw new Error("Failed to load saved investigation logs.");
			}

			const logs = await logsResponse.json();

			const visibleLogs = logs.filter((log) => log.camera !== null);

			startInvestigationLogPlayback(visibleLogs, game.investigationStartedAt);

			return;
		}

		investigationRunning = false;

		startInvestigationButton.disabled = false;
		nextDayButton.disabled = true;
	} catch (error) {
		console.error("Error resuming investigation:", error);
	}
}

resumeInvestigation();

function startInvestigationLogPlayback(visibleLogs, investigationStartedAt) {
	if (investigationTimer) {
		clearInterval(investigationTimer);
	}

	const logsContainer = document.getElementById("logs");

	logsContainer.innerHTML = "";

	const gameStartTime = gameStartRealTime;

	let displayedLogIndex = 0;

	function checkLogs() {
		const elapsedRealSeconds = (Date.now() - gameStartTime) / 1000;

		const elapsedGameMinutes = elapsedRealSeconds * GAME_MINUTES_PER_REAL_SECOND;

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

			investigationTimer = null;
			investigationRunning = false;

			return;
		}
	}

	checkLogs();

	investigationTimer = setInterval(checkLogs, 1000);
}

/* -------------------------
   CASE REPORT
------------------------- */

caseReportButton.addEventListener("click", async () => {
	await generateCaseReport();
});

closeCaseReportButton.addEventListener("click", () => {
	caseReportOverlay.style.display = "none";
});

async function generateCaseReport() {
	try {
		const gameResponse = await fetch(`${API_URL}/game/active?playerId=${playerId}`);

		if (!gameResponse.ok) {
			throw new Error("Could not load game data.");
		}

		const game = await gameResponse.json();

		const residentsResponse = await fetch(`${API_URL}/residents`);

		if (!residentsResponse.ok) {
			throw new Error("Could not load residents.");
		}

		const residents = await residentsResponse.json();

		const camerasResponse = await fetch(`${API_URL}/cameras`);

		if (!camerasResponse.ok) {
			throw new Error("Could not load cameras.");
		}

		const cameras = await camerasResponse.json();

		const logsResponse = await fetch(`${API_URL}/actions/logs`);

		let logs = [];

		if (logsResponse.ok) {
			logs = await logsResponse.json();
		}

		const murdersResponse = await fetch(`${API_URL}/murder-spots`);

		let murders = [];

		if (murdersResponse.ok) {
			murders = await murdersResponse.json();
		}

		document.getElementById("report-victims").textContent = murders.length;

		document.getElementById("report-residents").textContent = residents.length;

		document.getElementById("report-cameras").textContent = cameras.length;

		document.getElementById("report-days").textContent = `${Math.min(game.investigationDay, 4)} / 4`;

		const coverageContainer = document.getElementById("report-camera-coverage");

		if (!coverageContainer) {
			throw new Error("Camera coverage container not found.");
		}

		coverageContainer.innerHTML = "";

		cameras.forEach((camera) => {
			const history = camera.coverageHistory || [];

			const row = document.createElement("div");
			row.className = "camera-history-item";

			const cameraName = document.createElement("div");
			cameraName.className = "camera-history-name";
			cameraName.textContent = camera.name;

			const historyBar = document.createElement("div");
			historyBar.className = "camera-history-bar";

			for (let day = 1; day <= 4; day++) {
				const dayEntry = history.find((entry) => entry.day === day);

				const dayElement = document.createElement("div");
				dayElement.className = "camera-history-day";

				const dayNumber = document.createElement("span");
				dayNumber.className = "camera-history-day-number";
				dayNumber.textContent = `DAY ${day}`;

				dayElement.appendChild(dayNumber);

				if (dayEntry) {
					dayElement.setAttribute("data-zone", `Investigation Day ${day}: ${dayEntry.zone}`);
				} else {
					dayElement.classList.add("empty");
				}

				historyBar.appendChild(dayElement);
			}

			row.appendChild(cameraName);
			row.appendChild(historyBar);

			coverageContainer.appendChild(row);
		});

		const suspiciousEvents = logs.filter((log) => log.suspicious === true);

		const suspiciousCount = suspiciousEvents.length;

		document.getElementById("report-suspicious-events").textContent = suspiciousCount;

		const eventPercentage = Math.min(suspiciousCount * 5, 100);

		document.getElementById("suspicious-event-bar").style.width = `${eventPercentage}%`;

		document.getElementById("summary-days").textContent = Math.min(game.investigationDay, 4);

		document.getElementById("summary-observations").textContent = logs.length;

		document.getElementById("summary-events").textContent = suspiciousCount;

		document.getElementById("summary-residents").textContent = residents.length;

		caseReportOverlay.style.display = "flex";
	} catch (error) {
		console.error("Error generating case report:", error);
	}
}
