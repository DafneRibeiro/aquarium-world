// The Tide Table — Coastal Rockpools activity page.
// Fully JS-driven: switching the tide updates the scene, every creature's photo
// treatment (via CSS reacting to the container's data-tide attribute), its status
// badge, and its longer caption — all with no page reload. This script only needs
// to flip that attribute and swap text on any element carrying both a data-low and
// a data-high value (currently the status badge and the tide caption).
document.addEventListener('DOMContentLoaded', function () {
	const scene = document.querySelector('.tide-table');
	if (!scene) return;

	const buttons = scene.querySelectorAll('.tide-toggle__btn');
	const swappable = scene.querySelectorAll('[data-low][data-high]');

	function setTide(tide) {
		scene.dataset.tide = tide;

		buttons.forEach(function (btn) {
			const isActive = btn.dataset.tideSelect === tide;
			btn.classList.toggle('is-active', isActive);
			btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		});

		swappable.forEach(function (el) {
			const text = tide === 'high' ? el.dataset.high : el.dataset.low;
			if (text) {
				el.textContent = text;
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
