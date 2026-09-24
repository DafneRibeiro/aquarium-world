import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file name and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize the Express application
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Define routes for the application
app.get('/', (req, res) => {
	const zones = [{ name: 'Coral Reef Zone' }, { name: 'Deep Sea Trench' }, { name: 'Coastal Rockpools' }, { name: 'Freshwater Rivers & Rainforest' }];
	res.render('home', { zones });
});
// Define route for individual zones based on slug
app.get('/zones/:slug', (req, res) => {
	res.send(req.params.slug);
});

// Start the server and listen on port 5000
app.listen(5000, () => {
	console.log('Aquarium World running at http://localhost:5000');
});
