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

const briefingScreen = document.getElementById("briefing-screen");
const beginGameButton = document.getElementById("begin-game-btn");
const cameras = document.querySelectorAll(".camera-btn");
const cameraButtons = document.querySelectorAll(".camera-btn");
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
const GAME_MINUTES_PER_REAL_SECOND = 40;
const accusationButton = document.getElementById("accusation-btn");
accusationButton.disabled = true;
const accusationOverlay = document.getElementById("accusation-overlay");
const closeAccusationBtn = document.getElementById("close-accusation");
const accusationResidents = document.getElementById("accusation-residents");
const submitAccusationButton = document.getElementById("submit-accusation-btn");
const accusationResult = document.getElementById("accusation-result");
const resultNewGameButton = document.getElementById("result-new-game-btn");
const caseReportButton = document.getElementById("case-report-btn");
const caseReportOverlay = document.getElementById("case-report-overlay");
const closeCaseReportButton = document.getElementById("close-case-report");

if (!playerId) {
	playerId = crypto.randomUUID();
	localStorage.setItem("playerId", playerId);
}

console.log("Player ID:", playerId);

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

		console.log("PLAYER ID BEFORE START:", playerId);

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
				playerId: playerId,
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
		if (investigationRunning) {
			console.log("You cannot move cameras during an investigation.");
			return;
		}
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

		zone.classList.add(`camera-${selectedCamera.color}`);

		cameraCoverage[selectedCamera.name] = zoneName;
		zoneCameras[zoneName] = selectedCamera.name;

		selectedCamera.coveredZones = [zoneName];

		await updateCameraCoverage(selectedCamera._id, selectedCamera.coveredZones);

		console.log(selectedCamera.name, "is placed at", zoneName);
	});
});

function updateStartInvestigationButton() {
	if (investigationRunning) {
		startInvestigationButton.disabled = true;
		return;
	}

	startInvestigationButton.disabled = false;
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

		console.log("Archived logs:", logs);

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

	console.log("Investigation started.");

	try {
		const response = await fetch(`${API_URL}/actions/generate`, {
			method: "POST",
		});

		if (!response.ok) {
			throw new Error("Failed to generate investigation logs.");
		}

		const logs = await response.json();

		console.log(`Day ${game.investigationDay} logs:`, logs);

		const visibleLogs = logs.filter((log) => log.camera !== null);

		console.log("Visible camera logs:", visibleLogs);

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

			console.log(`Investigation time: ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);

			if (elapsedGameMinutes >= 24 * 60) {
				clearInterval(investigationTimer);

				investigationTimer = null;

				stopGameClock();

				investigationRunning = false;

				console.log("Investigation day finished.");

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

					const logsContainer = document.getElementById("logs");

					if (logsContainer) {
						logsContainer.innerHTML += `
            <p class="final-day-message">
                THIS WAS THE FINAL INVESTIGATION DAY.
                <br>
                Review the resident files and log archive before making your guess.
            </p>
        `;
					}

					console.log("Final investigation day finished.");
				}
			} else {
				nextDayButton.disabled = false;
			}
		}, 1000);
	} catch (error) {
		console.error("Error starting investigation:", error);

		investigationRunning = false;

		startInvestigationButton.disabled = false;
	}
});

accusationButton.addEventListener("click", async () => {
	accusationOverlay.style.display = "flex";

	await loadAccusationResidents();
});

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
		console.log("Server response:", result);

		if (!response.ok) {
			throw new Error(result.error);
		}
		console.log("Accusation result:", result);

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

				console.log("Selected accusations:", selectedAccusations);
			});

			accusationResidents.appendChild(button);
		});
	} catch (error) {
		console.error("Error loading accusation residents:", error);
		accusationResidents.innerHTML = "<p>Could not load the residents.</p>";
	}
}
closeAccusationBtn.addEventListener("click", () => {
	accusationOverlay.style.display = "none";
});
nextDayButton.addEventListener("click", async () => {
	if (investigationRunning) {
		return;
	}

	try {
		const response = await fetch(`${API_URL}/actions/next-day`, {
			method: "POST",
		});

		const responseText = await response.text();

		console.log("NEXT DAY status:", response.status);
		console.log("NEXT DAY response:", responseText);

		if (!response.ok) {
			throw new Error(`Failed to start next investigation day. Status: ${response.status}`);
		}

		const data = JSON.parse(responseText);

		console.log("Next investigation day:", data);
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

		console.log(`Investigation Day ${data.game.investigationDay} ready.`);
	} catch (error) {
		console.error("Error starting next investigation day:", error);
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

async function resumeInvestigation() {
	try {
		const response = await fetch(`${API_URL}/game/active?playerId=${playerId}`);

		if (response.status === 404) {
			console.log("No active game yet.");
			return;
		}

		if (!response.ok) {
			throw new Error(`Failed to load active game: ${response.status}`);
		}

		const game = await response.json();
		accusationButton.disabled = true;
		accusationButton.style.display = "block";
		console.log("Active game:", game);

		const dayElement = document.getElementById("investigation-day");

		if (dayElement) {
			const currentDate = new Date(game.currentDate);

			const weekday = currentDate.toLocaleDateString("en-GB", {
				weekday: "long",
			});

			dayElement.textContent = `INVESTIGATION DAY ${game.investigationDay} — ${weekday.toUpperCase()}`;
		}
		if (game.investigationDay >= 4 && !game.investigationRunning) {
			console.log("Day 4 has already been completed.");

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

			console.log("Final accusation is available.");

			return;
		}

		if (game.investigationRunning && game.investigationStartedAt) {
			console.log("Resuming investigation clock...");

			investigationRunning = true;

			startGameClock(game.investigationStartedAt);

			startInvestigationButton.disabled = true;
			nextDayButton.disabled = true;

			const logsResponse = await fetch(`${API_URL}/actions/logs`);

			if (!logsResponse.ok) {
				throw new Error("Failed to load saved investigation logs.");
			}

			const logs = await logsResponse.json();
			console.log("Saved logs:", logs);

			const visibleLogs = logs.filter((log) => log.camera !== null);

			console.log("Visible saved logs:", visibleLogs);

			startInvestigationLogPlayback(visibleLogs, game.investigationStartedAt);

			return;
		}

		investigationRunning = false;

		startInvestigationButton.disabled = false;

		nextDayButton.disabled = true;

		console.log(`Investigation Day ${game.investigationDay} is ready.`);
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

			investigationRunning = false;

			console.log("Investigation day finished.");

			return;
		}
	}

	checkLogs();

	investigationTimer = setInterval(checkLogs, 1000);
}
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
			const coveredZones = camera.coverageHistory || [];

			const percentage = Math.min((coveredZones.length / 4) * 100, 100);

			const row = document.createElement("div");

			row.className = "coverage-row";

			row.innerHTML = `
				<span class="coverage-zone">
					${camera.name}
				</span>

				<div
					class="coverage-bar"
					style="--coverage: ${Math.max(percentage, 5)}%"
				></div>

				<span class="coverage-number">
					${coveredZones.length} zones
				</span>
			`;

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

		console.log("Case report generated.");
	} catch (error) {
		console.error("Error generating case report:", error);
	}
}
