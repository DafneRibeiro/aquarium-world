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

// Start the server and listen on port 5000
app.listen(5000, () => {
	console.log('Aquarium World running at http://localhost:5000');
});
