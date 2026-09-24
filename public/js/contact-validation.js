// Client-side validation for the Contact form.
// Required fields + a real email format check, with inline error messages next to each field.
// Submission is only blocked (preventDefault) when validation fails — a valid form still
// does a normal POST to /contact, which re-validates everything server-side too.
document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('contact-form');
	if (!form) return;

	const nameInput = document.getElementById('name');
	const emailInput = document.getElementById('email');
	const messageInput = document.getElementById('message');

	const nameError = document.getElementById('name-error');
	const emailError = document.getElementById('email-error');
	const messageError = document.getElementById('message-error');

	const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const MAX_MESSAGE_LENGTH = 1000;

	function validate() {
		let isValid = true;

		if (nameInput.value.trim() === '') {
			nameError.textContent = 'Please enter your name.';
			isValid = false;
		} else {
			nameError.textContent = '';
		}

		const email = emailInput.value.trim();
		if (email === '') {
			emailError.textContent = 'Please enter your email address.';
			isValid = false;
		} else if (!EMAIL_PATTERN.test(email)) {
			emailError.textContent = 'Please enter a valid email address, e.g. name@example.com.';
			isValid = false;
		} else {
			emailError.textContent = '';
		}

		const message = messageInput.value.trim();
		if (message === '') {
			messageError.textContent = 'Please enter a message.';
			isValid = false;
		} else if (message.length > MAX_MESSAGE_LENGTH) {
			messageError.textContent = 'Please keep your message under ' + MAX_MESSAGE_LENGTH + ' characters.';
			isValid = false;
		} else {
			messageError.textContent = '';
		}

		return isValid;
	}

	form.addEventListener('submit', function (event) {
		if (!validate()) {
			event.preventDefault();
		}
	});

	[nameInput, emailInput, messageInput].forEach(function (field) {
		field.addEventListener('blur', validate);
	});
});
