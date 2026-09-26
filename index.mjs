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

// Coastal Rockpools "Tide Table" activity — 12 real rockpool residents, each with a
// photo, a longer species description, and a pair of low-tide / high-tide captions
// swapped client-side by tide-table.js. See content-sources.md for photo licensing.
const creatures = [
	{
		slug: 'anemone',
		name: 'Beadlet Anemone',
		image: 'beadlet-anemone.jpg',
		alt: 'A red beadlet anemone with tentacles open, photographed underwater',
		about: 'One of the most common anemones on British shores, the beadlet anemone looks like a blob of red jelly when out of water but transforms into a crown of nearly 200 stinging tentacles once submerged. It can live for decades in the same spot, and gives birth to fully-formed young rather than laying eggs.',
		low: 'Closed into a jelly-like red blob, sealed tight to stop it drying out until the water returns.',
		high: 'Tentacles open and waving gently, catching tiny drifting food carried in on the tide.'
	},
	{
		slug: 'starfish',
		name: 'Common Starfish',
		image: 'common-starfish.jpg',
		alt: 'An orange-brown common starfish on a dark background',
		about: "Britain's most familiar starfish, usually orange-brown with five stout arms. It has no brain and no blood — instead, seawater is pumped through a network of canals to power hundreds of tiny tube feet, which it also uses to prise open mussel shells before pushing its own stomach outside its body to digest them.",
		low: 'Tucked into a damp crevice, sheltering from the sun and from hungry gulls overhead.',
		high: 'Gliding slowly across the rock on hundreds of tiny tube feet, hunting for mussels.'
	},
	{
		slug: 'crab',
		name: 'Shore Crab',
		image: 'shore-crab.jpg',
		alt: 'A green-brown shore crab seen from above',
		about: 'The commonest crab on European shores, able to survive in almost any rockpool condition, from full-strength seawater to nearly fresh, rain-diluted puddles. Shore crabs breathe using gills, but can hold a reservoir of water in their gill chambers, letting them stay out of a pool entirely for short spells.',
		low: 'Wedged under a rock ledge, staying moist and out of sight from predators until the water rises.',
		high: 'Scuttling openly across the pool floor, foraging for scraps swept in by the tide.'
	},
	{
		slug: 'limpet',
		name: 'Common Limpet',
		image: 'common-limpet.jpg',
		alt: 'A cone-shaped common limpet shell attached to bare rock',
		about: 'A limpet spends its life grinding a shallow scar into "its" spot on the rock — a scar its shell fits perfectly, sealing out drying air at low tide. When covered, or under cover of night, it roams a short distance to graze algae before returning to that exact same scar, guided by a trail of its own mucus.',
		low: "Clamped down tight against the rock, sealed shut so it can't dry out in the open air.",
		high: 'Grazing slowly across the rock surface, rasping at algae with its tongue-like radula.'
	},
	{
		slug: 'hermit-crab',
		name: 'Hermit Crab',
		image: 'hermit-crab.jpg',
		alt: 'A hermit crab peeking out from its borrowed shell',
		about: "Lacking a hard shell of its own over most of its body, the hermit crab borrows the empty shells of dead periwinkles and whelks, trading up for a bigger one as it grows. Rockpools are prime hunting ground for a free upgrade, and fights over a good shell between rival hermit crabs are common.",
		low: 'Withdrawn deep into its borrowed shell, waiting out the exposed hours in the shade of a rock.',
		high: "Shell tipped forward, tentatively testing the water at the pool's edge before venturing out to feed."
	},
	{
		slug: 'sea-urchin',
		name: 'Common Sea Urchin',
		image: 'sea-urchin.jpg',
		alt: 'A round sea urchin covered in short spines, seen from above',
		about: "Britain's largest sea urchin, its round shell can grow to the size of a large orange and is normally hidden under a dense coat of purple-tipped spines. Hundreds of tiny suckered tube feet, poking out between the spines, let it grip rock firmly even in the strongest surge.",
		low: 'Spines held close and tube feet retracted, staying still and conserving moisture in a shaded pool.',
		high: 'Spines spread wide and tube feet reaching for the rock, slowly hauling itself across the pool in search of algae.'
	},
	{
		slug: 'periwinkle',
		name: 'Common Periwinkle',
		image: 'common-periwinkle.jpg',
		alt: 'A dark, spiral-shelled common periwinkle sea snail',
		about: "This small spiral-shelled sea snail is one of Britain's most overlooked survivors, able to close a trapdoor-like plate over its shell opening to seal in moisture for days at a time if needed. Periwinkles were also once a major seaside food, sold from paper cones on Victorian promenades.",
		low: 'Trapdoor sealed shut, wedged into a damp crack to ride out the low tide.',
		high: 'Shell tipped forward, gliding across algae-covered rock on a single muscular foot.'
	},
	{
		slug: 'shanny',
		name: 'Shanny',
		image: 'shanny.jpg',
		alt: 'A mottled brown shanny fish resting among rocks',
		about: 'A small, sturdy blenny with a snub face and no scales, well adapted to life between the tides. Shannies can breathe air for a time and are famous among rockpoolers for their ability to survive being left in a shrinking, sun-warmed puddle for hours on end.',
		low: 'Pressed flat under a stone, breathing air through its skin until the pool refills.',
		high: 'Darting between weed fronds, snapping up small shrimp and barnacle larvae stirred up by the tide.'
	},
	{
		slug: 'prawn',
		name: 'Common Prawn',
		image: 'common-prawn.jpg',
		alt: 'A near-transparent common prawn with long antennae',
		about: 'Almost completely transparent but for delicate banded markings, the common prawn is easy to miss until it flicks its tail and shoots backwards in a blur. Its long antennae, often twice the length of its body, feel out food and danger in murky, weed-choked water.',
		low: 'Hovering motionless in the deepest, coolest part of the pool, near-invisible against the sandy bottom.',
		high: 'Darting and hovering through the shallows, antennae sweeping for scraps carried in on the current.'
	},
	{
		slug: 'mussel',
		name: 'Common Mussel',
		image: 'common-mussel.jpg',
		alt: 'A cluster of dark blue-black common mussels on rock',
		about: 'Mussels anchor themselves to rock, and to each other, with tough threads called byssus, spun on the spot from a gland in the foot, forming dense beds that shelter dozens of smaller species. A single mussel can filter several litres of seawater an hour, straining out plankton to eat.',
		low: 'Shells clamped shut, byssus threads holding it fast to the rock as the pool drains around it.',
		high: 'Shells gaping slightly open, feeding by filtering plankton from the passing water.'
	},
	{
		slug: 'dog-whelk',
		name: 'Dog Whelk',
		image: 'dog-whelk.jpg',
		alt: 'A spiral-shelled dog whelk resting on rock',
		about: 'A predatory sea snail that drills a neat hole through the shells of barnacles and mussels using an acid-tipped tongue called a radula, then feeds on the contents. Dog whelks vary widely in shell colour depending on their diet, from off-white to deep purple-brown.',
		low: 'Anchored beside an empty barnacle shell, resting after a long, slow meal.',
		high: 'Gliding across a barnacle-crusted rock, radula extended, searching for its next meal.'
	},
	{
		slug: 'barnacle',
		name: 'Acorn Barnacle',
		image: 'acorn-barnacle.jpg',
		alt: 'Small volcano-shaped acorn barnacles crusting a rock surface',
		about: 'What looks like a tiny volcano-shaped shell is in fact a crustacean lying on its back, permanently glued head-down to the rock by cement it produces itself. At low tide its plates snap shut to trap a single drop of seawater; underwater, feathery legs called cirri flick out through the top to filter food from the passing current.',
		low: 'Plates clamped tightly shut, a single trapped drop of seawater keeping it alive until the tide turns.',
		high: 'Plates open, feathery legs rhythmically flicking out to filter plankton from the water.'
	}
];

app.get('/tide-table', (req, res) => {
	res.render('tide-table', { creatures });
});

// Start the server and listen on port 5000
app.listen(5000, () => {
	console.log('Aquarium World running at http://localhost:5000');
});
