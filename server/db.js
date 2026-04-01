import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbDir = join(__dirname, '..', 'db');

mkdirSync(dbDir, { recursive: true });

const dbPath = join(dbDir, 'historical-map.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS eras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      year_start INTEGER NOT NULL,
      year_end INTEGER NOT NULL,
      description TEXT
    );
    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS terrain_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      grid_x INTEGER NOT NULL,
      grid_z INTEGER NOT NULL,
      height REAL NOT NULL,
      r REAL NOT NULL,
      g REAL NOT NULL,
      b REAL NOT NULL,
      FOREIGN KEY (era_id) REFERENCES eras(id)
    );
    CREATE TABLE IF NOT EXISTS landmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      era_id INTEGER NOT NULL,
      region_id INTEGER,
      name TEXT NOT NULL,
      grid_x REAL NOT NULL,
      grid_z REAL NOT NULL,
      description TEXT,
      FOREIGN KEY (era_id) REFERENCES eras(id),
      FOREIGN KEY (region_id) REFERENCES regions(id)
    );
    CREATE INDEX IF NOT EXISTS idx_terrain_era ON terrain_points(era_id);
    CREATE INDEX IF NOT EXISTS idx_landmarks_era ON landmarks(era_id);
  `);
}

export function getEras() {
  return db.prepare('SELECT * FROM eras ORDER BY year_start').all();
}

export function getTerrainByEra(eraId) {
  return db.prepare('SELECT grid_x, grid_z, height, r, g, b FROM terrain_points WHERE era_id = ? ORDER BY grid_z, grid_x').all(eraId);
}

export function getLandmarksByEra(eraId) {
  return db.prepare(`
    SELECT l.*, r.name as region_name, r.type as region_type
    FROM landmarks l
    LEFT JOIN regions r ON l.region_id = r.id
    WHERE l.era_id = ?
  `).all(eraId);
}

export default db;
