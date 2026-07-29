console.log("Frontent loaded");

let selectedCamera = null;

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

		console.log(selectedCamera, "placed at", zone.textContent);
	});
});
