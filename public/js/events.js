// "What's On" — AJAX category filter. Progressively enhances the filter form:
// with JavaScript, clicking a filter button fetches only the matching events as
// JSON from /api/events and swaps the grid in place, with no page reload. Without
// JavaScript, the same buttons submit a normal GET form to /events?category=...
// and the server renders the filtered page directly instead — so filtering keeps
// working either way, and a failed fetch falls back to that same normal submit.
document.addEventListener('DOMContentLoaded', function () {
	const page = document.querySelector('.events');
	if (!page) return;

	const form = page.querySelector('.events__filters');
	const grid = page.querySelector('.events__grid');
	const count = page.querySelector('.events__count');
	const empty = page.querySelector('.events__empty');
	if (!form || !grid) return;

	const buttons = form.querySelectorAll('.events__filter-btn');

	function escapeHtml(text) {
		return String(text)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function renderEvents(events) {
		grid.innerHTML = events
			.map(function (event) {
				const image = event.image
					? '<img class="event-card__image" src="/assets/' + escapeHtml(event.image) + '" alt="' + escapeHtml(event.title) + '" loading="lazy">'
					: '';
				return (
					'<article class="card event-card">' +
					image +
					'<p class="event-card__category">' + escapeHtml(event.category) + '</p>' +
					'<h2>' + escapeHtml(event.title) + '</h2>' +
					'<p class="event-card__schedule">' + escapeHtml(event.event_date) + '</p>' +
					'<p>' + escapeHtml(event.description) + '</p>' +
					'</article>'
				);
			})
			.join('');

		if (empty) {
			empty.hidden = events.length !== 0;
		}
	}

	function setActive(category) {
		buttons.forEach(function (btn) {
			const isActive = btn.value === category;
			btn.classList.toggle('is-active', isActive);
			btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
		});
	}

	function loadCategory(category) {
		const url = category ? '/api/events?category=' + encodeURIComponent(category) : '/api/events';

		fetch(url, { headers: { Accept: 'application/json' } })
			.then(function (response) {
				if (!response.ok) throw new Error('Request failed');
				return response.json();
			})
			.then(function (data) {
				renderEvents(data.events);
				setActive(data.selectedCategory || '');
				if (count) {
					const n = data.events.length;
					count.textContent = n + (n === 1 ? ' event' : ' events') + (data.selectedCategory ? ' in ' + data.selectedCategory : '');
				}
			})
			.catch(function () {
				// Fetch failed for some reason (offline, JS error) — fall back to a
				// normal page navigation so filtering still works.
				form.submit();
			});
	}

	form.addEventListener('submit', function (event) {
		event.preventDefault();
		const submitter = event.submitter;
		const category = submitter ? submitter.value : '';
		loadCategory(category);
	});
});
