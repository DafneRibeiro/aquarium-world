// The Tide Table — Coastal Rockpools activity page.
// Fully JS-driven: switching the tide updates the scene and every creature's
// caption in place, with no page reload. The visual "open/closed" look of each
// creature icon is driven by CSS reacting to the container's data-tide attribute;
// this script only needs to flip that attribute and swap the caption text.
document.addEventListener('DOMContentLoaded', function () {
	const scene = document.querySelector('.tide-table');
	if (!scene) return;

	const buttons = scene.querySelectorAll('.tide-toggle__btn');
	const captions = scene.querySelectorAll('.creature__caption');

	function setTide(tide) {
		scene.dataset.tide = tide;

		buttons.forEach(function (btn) {
			const isActive = btn.dataset.tideSelect === tide;
			btn.classList.toggle('is-active', isActive);
			btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		});

		captions.forEach(function (caption) {
			const text = tide === 'high' ? caption.dataset.high : caption.dataset.low;
			if (text) {
				caption.textContent = text;
			}
		});
	}

	buttons.forEach(function (btn) {
		btn.addEventListener('click', function () {
			setTide(btn.dataset.tideSelect);
		});
	});

	// Set the initial state explicitly, in case the page is reloaded on the "high" view.
	setTide(scene.dataset.tide || 'low');
});
