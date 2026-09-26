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
		"Descend into near-darkness, lit only by the creatures themselves. The Deep Sea Trench recreates the pressure and stillness of waters most people will never see — a world several hundred metres down, where sunlight never reaches and every scrap of light has to be made by something alive. Down here, colour stops mattering: almost everything is black, red or transparent, since those are the first wavelengths to disappear from sunlight and the hardest for a predator to spot. What replaces colour is light itself — used as a lure, a burglar alarm, a search light, or a disguise, depending on which animal is switching it on.",
		'jellyfish_blue_underwater_956608_3840x2160.jpg',
		'Photo: ume-y (Flickr), used under CC BY.',
		'atmosphere',
		"Bioluminescence isn't decoration — it's survival. Many deep-sea species use their own light to hunt, hide, or communicate in a world with no sunlight at all. These habitats are also some of the least explored on the planet: scientists estimate more of the deep sea remains unmapped than the surface of Mars, which makes protecting it while we still understand so little of it especially difficult.",
		"An estimated 90% of deep-sea animals can produce their own light in some form — bioluminescence is thought to be the most common form of communication on the planet, even though almost no one ever sees it happen.",
		'Simulated depth:600 metres|Water temperature:4°C|Sunlight reaching this depth:0%'
	);

	insertZone.run(
		'coastal-rockpools',
		'Coastal Rockpools',
		'Small pools, big surprises.',
		"Roll up your sleeves. Our touch-pool zone is built for hands-on discovery, with keepers on hand to guide every visit — the only part of Aquarium World where you're actively encouraged to get your hands wet. Everything living here has to survive twice a day: submerged at high tide, then exposed to sun, rain, gulls and drying air at low tide, which makes rockpool animals some of the toughest, most adaptable creatures in the sea. A starfish clamped to a rock here isn't resting — it's using hundreds of tiny suckered tube feet to grip on tight enough that a retreating wave can't sweep it away.",
		'zones/coastal-rockpools-hero.jpg',
		'Photo: Brocken Inaglory, Wikimedia Commons (CC BY-SA 4.0).',
		'hands-on',
		'Rockpool ecosystems are surprisingly fragile — a single misplaced footstep can destroy years of slow-growing life, and a bucket left in the sun for even a few minutes can overheat everything inside it. Ours are a safe way to get close without the harm: every creature in our touch pool is handled by a keeper first, and returned to deeper water the moment it shows any sign of stress.',
		"A starfish has no brain and no blood — seawater is pumped through its body to power hundreds of tiny tube feet instead, and a lost arm can regrow over several months.",
		'Touch pool residents:12 species|Water temperature:14–16°C|Tide cycle:every 6 hours'
	);

	insertZone.run(
		'freshwater-rivers-rainforest',
		'Freshwater Rivers & Rainforest',
		'Not all wonders are salty.',
		"From piranha shoals to rainforest canopy drips, this zone proves freshwater habitats can be just as astonishing as anything in the sea. Step through the door and the air itself changes — warmer, wetter, thick with the sound of dripping leaves and unseen insects. Less than 1% of the world's water is fresh, yet it holds an outsized share of everything that swims: rivers, floodplains and rainforest streams pack in a density of species that rivals any coral reef, all adapted to a world that floods, dries, and changes colour with the seasons.",
		'zones/freshwater-hero.jpg',
		'Photo: Jay, Wikimedia Commons (CC BY 2.0).',
		'surprising',
		"Freshwater habitats hold roughly half of all fish species on a tiny fraction of the planet's water — and they're disappearing faster than almost any other ecosystem type, lost to dams, drainage and pollution more quickly than rainforests themselves. A river that looks unchanged on the surface can lose most of its fish within a generation if the water it depends on is diverted upstream.",
		"The Amazon river system alone is home to more freshwater fish species than the whole Atlantic Ocean has marine fish species — and new ones are still being discovered every year.",
		"Freshwater fish species worldwide:~18,000|Share of Earth's water that's fresh:<1%|Zone humidity:85%"
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
	insertExhibit.run(
		2,
		'The Glow Corridor',
		"A darkened walkway lined with bioluminescent species, each one making its own light rather than reflecting anyone else's. Look closely at the photophores along a hatchetfish's belly and you'll see why: matching the faint blue glow of sunlight filtering down from above is what keeps it hidden from whatever might be hunting below.",
		'zones/deep-sea-glow-corridor.jpg',
		'Photo: HulloThere, Wikimedia Commons (CC BY 4.0).',
		'display'
	);
	insertExhibit.run(
		2,
		'Anglerfish Chamber',
		"Home to a museum-quality specimen of one of the ocean's most recognisable deep-sea hunters, its glowing lure dangled like bait above a mouth full of needle-thin teeth. No aquarium in the world keeps a live deep-sea anglerfish on display — brought up from the crushing pressure it lives at, the change alone would kill it long before it reached the surface.",
		'zones/deep-sea-anglerfish-chamber.jpg',
		'Photo: Canley, Wikimedia Commons (CC BY-SA 3.0).',
		'display'
	);
	insertExhibit.run(
		3,
		'Touch Pool',
		"Hands-on access to starfish, anemones and hermit crabs, keeper-supervised. Every animal here is handled the same way our keepers would in the wild: wet hands only, a light touch, and never picked all the way out of the water — stress from careless handling is more dangerous to most rockpool life than the occasional gentle stroke.",
		'creatures/common-starfish.jpg',
		'Photo: Hans Hillewaert, Wikimedia Commons (CC BY-SA 4.0).',
		'interactive'
	);
	insertExhibit.run(
		3,
		'Tide Table',
		"An interactive display showing how rockpool life changes with the tide. All twelve residents look and behave completely differently depending on whether the water's in or out — see for yourself on our Tide Table, just through this door.",
		'creatures/hermit-crab.jpg',
		'Photo: Erics, Wikimedia Commons (CC BY-SA 4.0).',
		'interactive'
	);
	insertExhibit.run(
		4,
		'Piranha Shoal',
		"A fast-moving shoal in a recreated Amazon tributary. Despite their fearsome reputation, red-bellied piranhas are nervous, social fish that shoal for safety rather than to hunt in packs — a lone piranha is a vulnerable piranha, far more likely to end up prey itself than predator.",
		'zones/freshwater-piranha-shoal.jpg',
		'Photo: Gregory Moine, Wikimedia Commons (CC BY 2.0).',
		'display'
	);
	insertExhibit.run(
		4,
		'Canopy Drip Walk',
		'Rainforest canopy sounds and mist above a river-level walkway. Real rainforest canopies generate their own weather: so much water evaporates from millions of leaves that the resulting moisture drives local rainfall, meaning a healthy rainforest can, in a very real sense, make its own rain.',
		'zones/freshwater-canopy-walk.jpg',
		'Photo: David Stanley, Wikimedia Commons (CC BY 2.0).',
		'display'
	);
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
