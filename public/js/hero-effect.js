const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
const hero = document.getElementById('hero');
const toggle = document.getElementById('motion-toggle');

let particles = [];
let effectEnabled = false;
const MAX_PARTICLES = 50;

// Hero bubble effect for the background canvas
function resizeCanvas() {
	canvas.width = hero.offsetWidth;
	canvas.height = hero.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Spawns a new bubble at the given coordinates
function spawnBubble(x, y) {
	if (particles.length >= MAX_PARTICLES) return;
	particles.push({
		x,
		y,
		radius: 3 + Math.random() * 6,
		alpha: 0.8,
		vy: -(0.4 + Math.random() * 0.6),
		wobblePhase: Math.random() * Math.PI * 2,
		age: 0
	});
}

// Handles mouse movement over the hero section to spawn bubbles
hero.addEventListener('mousemove', (e) => {
	if (!effectEnabled) return;
	const rect = hero.getBoundingClientRect();
	spawnBubble(e.clientX - rect.left, e.clientY - rect.top);
});

// Draws a single bubble on the canvas
function drawBubble(p) {
	ctx.beginPath();
	ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
	ctx.fillStyle = `rgba(79, 216, 224, ${p.alpha * 0.18})`;
	ctx.fill();
	ctx.lineWidth = 1;
	ctx.strokeStyle = `rgba(234, 246, 248, ${p.alpha * 0.6})`;
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.25, 0, Math.PI * 2);
	ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.5})`;
	ctx.fill();
}

// Animates all bubbles on the canvas
function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	particles.forEach((p) => {
		p.age += 1;
		p.y += p.vy;
		p.x += Math.sin(p.age * 0.05 + p.wobblePhase) * 0.4;
		p.alpha -= 0.008;
		drawBubble(p);
	});
	particles = particles.filter((p) => p.alpha > 0 && p.y > -20);
	requestAnimationFrame(animate);
}
animate();
// Checks for user's reduced motion preference and initializes the effect accordingly
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
effectEnabled = !prefersReducedMotion;
toggle.checked = effectEnabled;

// Listens for changes to the motion toggle and updates the effect accordingly
toggle.addEventListener('change', () => {
	effectEnabled = toggle.checked;
	if (!effectEnabled) particles = [];
});
