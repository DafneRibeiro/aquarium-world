import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

// Get the current file name and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize the SQLite database connection
const db = new sqlite3.Database(path.join(__dirname, 'database', 'aquarium.db'));

// Initialize the Express application
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Define routes for the application
app.get('/', (req, res) => {
	const zones = [
		{
			slug: 'coral-reef',
			name: 'Coral Reef Zone',
			tagline: 'Colour, right up close.',
			role: 'showpiece',
			image: null
		},
		{
			slug: 'deep-sea-trench',
			name: 'Deep Sea Trench',
			tagline: 'Where the light gives up.',
			role: 'atmosphere',
			image: 'jellyfish_blue_underwater_956608_3840x2160.jpg'
		},
		{
			slug: 'coastal-rockpools',
			name: 'Coastal Rockpools',
			tagline: 'Small pools, big surprises.',
			role: 'hands-on',
			image: null
		},
		{
			slug: 'freshwater-rivers-rainforest',
			name: 'Freshwater Rivers & Rainforest',
			tagline: 'Not all wonders are salty.',
			role: 'surprising',
			image: null
		}
	];
	res.render('home', { zones });
});

// Define route for individual zones based on slug
app.get('/zones/:slug', (req, res) => {
	const { slug } = req.params;
	db.get('SELECT * FROM zones WHERE slug = ?', [slug], (err, zone) => {
		if (err) {
			console.error(err);
			return res.status(500).send('Something went wrong loading this zone.');
		}
		if (!zone) {
			return res.status(404).send('Zone not found.');
		}
		db.all('SELECT * FROM exhibits WHERE zone_id = ?', [zone.id], (err, exhibits) => {
			if (err) {
				console.error(err);
				return res.status(500).send('Something went wrong loading this zone.');
			}
			res.render('zones/show', { zone, exhibits });
		});
	});
});

// Define route for the journal section
// left join with zones to get zone name and slug for each journal post in one query, but keep all journal posts even if they have zone_id = null
app.get('/journal', (req, res) => {
	const sql = `
    SELECT journal_posts.*, zones.name AS zone_name, zones.slug AS zone_slug
    FROM journal_posts
    LEFT JOIN zones ON journal_posts.zone_id = zones.id
    ORDER BY published_date DESC
  `;
	db.all(sql, [], (err, posts) => {
		if (err) {
			console.error(err);
			return res.status(500).send('Something went wrong loading the journal.');
		}
		res.render('journal', { posts });
	});
});

// Practical, neutral-tone FAQ content. No booking/ticket language anywhere, by design.
const faqs = [
	{
		question: 'Is there parking on site?',
		answer: 'Yes. Our car park is on site with designated accessible bays close to the main entrance, and clear signage from the road.'
	},
	{
		question: 'Is Aquarium World accessible for wheelchairs and prams?',
		answer: 'Yes. All main routes are step-free, with lifts between floors, accessible toilets on every level, and space throughout for wheelchairs and prams to move comfortably.'
	},
	{
		question: 'Can I bring food and drink, or is there somewhere to eat?',
		answer: 'There is a café on site serving hot and cold food and drink. You are also welcome to bring your own food to eat in our designated picnic area.'
	},
	{
		question: 'How long should I allow for a visit?',
		answer: 'Most families spend between two and three hours exploring all four zones, though you are welcome to move at your own pace and revisit any area.'
	},
	{
		question: 'Can I take photographs during my visit?',
		answer: 'Personal photography is welcome throughout. We ask that flash photography is avoided in the Deep Sea Trench, as the light-sensitive species there rely on near-total darkness.'
	},
	{
		question: 'Are pushchairs or wheelchairs available to borrow?',
		answer: 'A small number of pushchairs and wheelchairs are available at the main entrance, offered on a first-come basis to visitors who need one.'
	}
];

app.get('/faq', (req, res) => {
	res.render('faq', { faqs });
});

// Simple email format check shared between the contact form's client-side and server-side validation
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.get('/contact', (req, res) => {
	res.render('contact', { submitted: false, error: null, values: { name: '', email: '', message: '' } });
});

app.post('/contact', (req, res) => {
	const name = (req.body.name || '').trim();
	const email = (req.body.email || '').trim();
	const message = (req.body.message || '').trim().slice(0, 1000);

	// Server-side validation — never trust the client alone, even though the form already validates in JS
	if (!name || !email || !message || !EMAIL_PATTERN.test(email)) {
		return res.status(400).render('contact', {
			submitted: false,
			error: 'Please fill in every field with a valid email address before sending.',
			values: { name, email, message }
		});
	}

	db.run(
		'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
		[name, email, message],
		(err) => {
			if (err) {
				console.error(err);
				return res.status(500).send('Something went wrong sending your message.');
			}
			res.render('contact', {
				submitted: true,
				error: null,
				values: { name: '', email: '', message: '' }
			});
		}
	);
});

// Start the server and listen on port 5000
app.listen(5000, () => {
	console.log('Aquarium World running at http://localhost:5000');
});
