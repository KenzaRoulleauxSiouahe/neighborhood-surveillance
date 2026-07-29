console.log("Frontent loaded");

let selectedCamera = null;
let cameraPositions = {};

const cameras = document.querySelectorAll(".camera-btn");
const zones = document.querySelectorAll(".zone");

cameras.forEach((camera) => {
	camera.addEventListener("click", () => {
		selectedCamera = camera.dataset.camera;
		console.log("Selected:", selectedCamera);
	});
});

zones.forEach((zone) => {
	zone.addEventListener("click", () => {
		if (selectedCamera === null) {
			console.log("Please select a camera first.");
			return;
		}

		if (cameraPositions[selectedCamera]) {
			const confirmMove = confirm(`${selectedCamera} is already placed at zone ${cameraPositions[selectedCamera]}. Do you want to move it to zone ${zone.dataset.zone}?`);

			if (!confirmMove) {
				return;
			}

			const previousZone = document.querySelector(`[data-zone="${cameraPositions[selectedCamera]}"]`);
			previousZone.textContent = previousZone.dataset.zone;

			previousZone.textContent = previousZone.dataset.zone;
		}

		if (zone.dataset.camera) {
			alert(`${zone.dataset.camera} is already placed here. Choose another zone.`);
			return;
		}

		zone.textContent = "🎥";
		zone.dataset.camera = selectedCamera;

		cameraPositions[selectedCamera] = zone.dataset.zone;

		console.log(selectedCamera, "placed at", zone.textContent);
	});
});
