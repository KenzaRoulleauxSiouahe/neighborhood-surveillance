let camerasData = [];
let selectedCamera = null;
let cameraPositions = {};

const API_URL = "http://localhost:5000/api";
const cameras = document.querySelectorAll(".camera-btn");
const cameraButtons = document.querySelectorAll(".camera-btn");
const zones = document.querySelectorAll(".zone");

async function loadCameras() {
	try {
		const response = await fetch(`${API_URL}/cameras`);
		const cameras = await response.json();
		camerasData = cameras;

		console.log("Loaded cameras:", camerasData);
	} catch (error) {
		console.error("Error loading cameras:", error);
	}
}

loadCameras();

async function updateCameraZone(cameraId, zone) {
	try {
		const response = await fetch(`http://localhost:5000/api/cameras/${cameraId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ zone }),
		});
		const updatedCamera = await response.json();
		camerasData = camerasData.map((camera) => (camera._id === updatedCamera._id ? updatedCamera : camera));
		console.log("Updated camera:", updatedCamera);
	} catch (error) {
		console.error("Error updating camera zone:", error);
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

zones.forEach((zone) => {
	zone.addEventListener("click", async () => {
		if (selectedCamera === null) {
			console.log("Please select a camera first.");
			return;
		}

		if (cameraPositions[selectedCamera.name]) {
			const confirmMove = confirm(`${selectedCamera.name} is already placed at zone ${cameraPositions[selectedCamera.name]}. Do you want to move it to zone ${zone.dataset.zone}?`);

			if (!confirmMove) {
				return;
			}

			const previousZone = document.querySelector(`[data-zone="${cameraPositions[selectedCamera.name]}"]`);
			previousZone.textContent = previousZone.dataset.zone;

			previousZone.textContent = previousZone.dataset.zone;
		}

		if (zone.dataset.camera) {
			alert(`${zone.dataset.camera} is already placed here. Choose another zone.`);
			return;
		}

		zone.textContent = `🎥 ${selectedCamera.name.replace("Camera ", "")}`;

		await updateCameraZone(selectedCamera._id, zone.dataset.zone);
		zone.dataset.camera = selectedCamera.name;

		cameraPositions[selectedCamera.name] = zone.dataset.zone;
		const button = document.querySelector(`[data-camera="${selectedCamera.name}"]`);

		button.classList.add("placed");

		console.log(selectedCamera.name, "placed at", zone.textContent);
	});
});
