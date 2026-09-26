CREATE TABLE zones (
  id                INTEGER PRIMARY KEY,
  slug              TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  tagline           TEXT,
  description       TEXT,
  hero_image        TEXT,
  hero_credit       TEXT,
  role              TEXT,
  conservation_note TEXT,
  fast_fact         TEXT,
  stats             TEXT
);

CREATE TABLE exhibits (
  id            INTEGER PRIMARY KEY,
  zone_id       INTEGER NOT NULL REFERENCES zones(id),
  name          TEXT NOT NULL,
  description   TEXT,
  image         TEXT,
  image_credit  TEXT,
  type          TEXT
);

CREATE TABLE journal_posts (
  id             INTEGER PRIMARY KEY,
  title          TEXT NOT NULL,
  body           TEXT NOT NULL,
  published_date TEXT NOT NULL,
  zone_id        INTEGER REFERENCES zones(id)
);

CREATE TABLE contact_messages (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  message      TEXT NOT NULL,
  submitted_at TEXT DEFAULT (datetime('now')) NOT NULL
);

-- Sketched now, built later (Phase 10 stretch goal)
CREATE TABLE events (
  id          INTEGER PRIMARY KEY,
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  category    TEXT,
  event_date  TEXT NOT NULL,
  image       TEXT
);
