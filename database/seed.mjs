import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new sqlite3.Database(path.join(__dirname, 'aquarium.db'));
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');

db.serialize(() => {
	// Run the CREATE TABLE statements from schema.sql
	db.exec(schema, (err) => {
		if (err) return console.error('Schema error:', err);
		console.log('Tables created.');
	});

	// --- Zones ---
	const insertZone = db.prepare(
		'INSERT INTO zones (slug, name, tagline, description, hero_image, hero_credit, role, conservation_note, fast_fact, stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
	);
	insertZone.run(
		'coral-reef',
		'Coral Reef Zone',
		'Colour, right up close.',
		"Step into a wall of living colour. Our reef tank recreates the density, light and constant motion of a real tropical reef system — structures built slowly, over centuries, by tiny coral polyps that never stop building. Every colour you can see is doing a job: warning off rivals, luring in cleaner fish, or filtering the exact wavelengths of sunlight each species needs to survive. Look closely and you'll find the reef isn't really coloured by coral at all — most of that colour comes from algae living inside the coral's own tissue, trading sugars for shelter in one of the ocean's oldest partnerships.",
		'zones/coral-reef-hero.jpg',
		'Photo: Toby Hudson, Wikimedia Commons (CC BY-SA 3.0).',
		'showpiece',
		'Coral reefs cover less than 1% of the ocean floor but support around a quarter of all marine species — more life per square metre than almost anywhere else on Earth. Rising sea temperatures are bleaching reefs worldwide: when water gets too warm for too long, corals expel the very algae that give them colour and food, turning stark white and starving. Every tank in this zone is part of a wider conservation breeding programme working to keep reef species safe while wild reefs recover.',
		'A single coral colony can be thousands of years old — some Great Barrier Reef structures started growing before the pyramids were built.',
		'Coral species on display:40+|Tank volume:120,000 litres|Water temperature:24–27°C'
	);

	insertZone.run(
		'deep-sea-trench',
		'Deep Sea Trench',
		'Where the light gives up.',
		'Descend into near-darkness, lit only by the creatures themselves. The Deep Sea Trench recreates the pressure and stillness of waters most people will never see.',
		'jellyfish_blue_underwater_956608_3840x2160.jpg',
		'Photo: ume-y (Flickr), used under CC BY.',
		'atmosphere',
		"Bioluminescence isn't decoration — it's survival. Many deep-sea species use their own light to hunt, hide, or communicate in a world with no sunlight at all.",
		null,
		null
	);

	insertZone.run(
		'coastal-rockpools',
		'Coastal Rockpools',
		'Small pools, big surprises.',
		'Roll up your sleeves. Our touch-pool zone is built for hands-on discovery, with keepers on hand to guide every visit.',
		null,
		null,
		'hands-on',
		'Rockpool ecosystems are surprisingly fragile — a single misplaced footstep can destroy years of slow-growing life. Ours are a safe way to get close without the harm.',
		null,
		null
	);

	insertZone.run(
		'freshwater-rivers-rainforest',
		'Freshwater Rivers & Rainforest',
		'Not all wonders are salty.',
		'From piranha shoals to rainforest canopy drips, this zone proves freshwater habitats can be just as astonishing as anything in the sea.',
		null,
		null,
		'surprising',
		"Freshwater habitats hold roughly half of all fish species on a tiny fraction of the planet's water — and they're disappearing faster than almost any other ecosystem type.",
		null,
		null
	);
	insertZone.finalize();

	// --- Exhibits (2 per zone, using zone_id by known insert order: 1=coral-reef, 2=deep-sea-trench, 3=coastal-rockpools, 4=freshwater-rivers-rainforest) ---
	const insertExhibit = db.prepare(
		'INSERT INTO exhibits (zone_id, name, description, image, image_credit, type) VALUES (?, ?, ?, ?, ?, ?)'
	);
	insertExhibit.run(
		1,
		'The Reef Wall',
		"A floor-to-ceiling tank of hard and soft corals, built up piece by piece to mimic the wall-like drop-off found on the outer edge of a real reef. Watch long enough and you'll spot fish that never stray far from one particular coral head — for many reef species, a single colony is home for life.",
		'zones/coral-reef-reef-wall.jpg',
		'Photo: Jim E. Maragos / U.S. Fish and Wildlife Service, Wikimedia Commons (public domain).',
		'display'
	);
	insertExhibit.run(
		1,
		'Clownfish Nursery',
		'Watch juvenile clownfish grow up alongside their host anemones, immune to the sting that would drive off almost anything else. Clownfish are all born male and can change sex once, becoming female if the dominant female in their anemone dies — so the fish you see today may not be the same sex next year.',
		'zones/coral-reef-clownfish-nursery.jpg',
		'Photo: Triniti14045, Wikimedia Commons (CC BY-SA 4.0).',
		'display'
	);
	insertExhibit.run(2, 'The Glow Corridor', 'A darkened walkway lined with bioluminescent species.', null, null, 'display');
	insertExhibit.run(2, 'Anglerfish Chamber', "Home to one of the ocean's most recognisable deep-sea hunters.", null, null, 'display');
	insertExhibit.run(3, 'Touch Pool', 'Hands-on access to starfish, anemones and hermit crabs, keeper-supervised.', null, null, 'interactive');
	insertExhibit.run(3, 'Tide Table', 'An interactive display showing how rockpool life changes with the tide.', null, null, 'interactive');
	insertExhibit.run(4, 'Piranha Shoal', 'A fast-moving shoal in a recreated Amazon tributary.', null, null, 'display');
	insertExhibit.run(4, 'Canopy Drip Walk', 'Rainforest canopy sounds and mist above a river-level walkway.', null, null, 'display');
	insertExhibit.finalize();

	// --- Journal posts ---
	const insertPost = db.prepare('INSERT INTO journal_posts (title, body, published_date, zone_id) VALUES (?, ?, ?, ?)');
	insertPost.run(
		'Notes from the reef tank',
		'This month, our reef team recorded the first successful coral fragment attachment of the year — a small win that matters more than it sounds.',
		'2026-08-15',
		1
	);
	insertPost.run(
		'Why we keep the trench dark',
		'Visitors often ask why the Deep Sea Trench is kept so dim. The answer: light stress affects deep-sea species far more than shallow-water ones.',
		'2026-08-22',
		2
	);
	insertPost.run(
		'A quieter kind of conservation',
		"Not every conservation story is dramatic. Sometimes it's just choosing the right substrate for a rockpool tank, season after season.",
		'2026-09-01',
		null
	);
	insertPost.finalize();

	// Quick sanity check — confirms rows actually landed
	db.get('SELECT COUNT(*) AS count FROM zones', (err, row) => {
		if (err) return console.error(err);
		console.log(`Zones seeded: ${row.count}`);
	});
});

// Close the database connection after seeding is complete
db.close();
