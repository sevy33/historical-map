import db, { initSchema } from './db.js';

const GRID_SIZE = 64;

// ── Eras ──────────────────────────────────────────────────────────────────────
const eras = [
  { name: 'Ancient Rome',  year_start: -753, year_end: 476,  description: 'The Roman Kingdom, Republic, and Empire. Grand temples, forums, and the Colosseum rise on the seven hills.' },
  { name: 'Medieval Rome', year_start: 476,  year_end: 1400, description: 'The decline after the fall of the Empire. Population drops, ancient monuments crumble, fortified towers appear.' },
  { name: 'Renaissance',   year_start: 1400, year_end: 1600, description: 'Papal patronage revives the city. New churches, palaces, and the rebuilding of St. Peter\'s Basilica.' },
  { name: 'Baroque Rome',  year_start: 1600, year_end: 1800, description: 'Dramatic architecture, fountains, and plazas transform the cityscape under Counter-Reformation popes.' },
  { name: 'Modern Rome',   year_start: 1800, year_end: 2026, description: 'Capital of unified Italy. Wide boulevards, modern districts, and archaeological preservation reshape Rome.' },
];

// ── Regions ───────────────────────────────────────────────────────────────────
const regions = [
  { name: 'Palatine Hill',    type: 'hill' },
  { name: 'Aventine Hill',    type: 'hill' },
  { name: 'Capitoline Hill',  type: 'hill' },
  { name: 'Quirinal Hill',    type: 'hill' },
  { name: 'Viminal Hill',     type: 'hill' },
  { name: 'Esquiline Hill',   type: 'hill' },
  { name: 'Caelian Hill',     type: 'hill' },
  { name: 'Tiber River',      type: 'river' },
  { name: 'Forum Valley',     type: 'valley' },
  { name: 'Campus Martius',   type: 'plain' },
  { name: 'Trastevere',       type: 'district' },
  { name: 'Vatican Hill',     type: 'hill' },
];

// ── Hill definitions (center_x, center_z in grid coords, radius, peak height) ──
const hills = [
  { name: 'Palatine',    cx: 32, cz: 34, rx: 5, rz: 4, peak: 1.8 },
  { name: 'Aventine',    cx: 28, cz: 42, rx: 5, rz: 5, peak: 1.6 },
  { name: 'Capitoline',  cx: 28, cz: 30, rx: 3, rz: 3, peak: 1.5 },
  { name: 'Quirinal',    cx: 36, cz: 22, rx: 5, rz: 4, peak: 1.7 },
  { name: 'Viminal',     cx: 40, cz: 26, rx: 4, rz: 3, peak: 1.4 },
  { name: 'Esquiline',   cx: 44, cz: 30, rx: 6, rz: 5, peak: 1.6 },
  { name: 'Caelian',     cx: 38, cz: 40, rx: 5, rz: 4, peak: 1.5 },
  { name: 'Vatican',     cx: 16, cz: 24, rx: 5, rz: 5, peak: 1.3 },
];

// Tiber River: a winding path from north to south on the western side
function tiberInfluence(x, z) {
  // River path: roughly x = 22 with a curve
  const riverX = 22 + Math.sin(z * 0.15) * 3;
  const dist = Math.abs(x - riverX);
  if (dist < 3) {
    return { depth: -0.6 * (1 - dist / 3), width: dist };
  }
  return { depth: 0, width: dist };
}

// ── Per-era terrain generation ────────────────────────────────────────────────
function generateTerrainForEra(eraIndex) {
  const points = [];

  for (let z = 0; z < GRID_SIZE; z++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      let height = 0.2; // base level

      // Add hills
      for (const hill of hills) {
        const dx = (x - hill.cx) / hill.rx;
        const dz = (z - hill.cz) / hill.rz;
        const d2 = dx * dx + dz * dz;
        if (d2 < 1) {
          const hillH = hill.peak * Math.pow(1 - d2, 1.5);
          height = Math.max(height, hillH);
        }
      }

      // Tiber River depression
      const tiber = tiberInfluence(x, z);
      if (tiber.depth < 0) {
        height += tiber.depth;
        height = Math.max(height, -0.3);
      }

      // Add subtle noise
      const noise = Math.sin(x * 0.7 + z * 0.5) * 0.05 + Math.cos(x * 0.3 + z * 0.9) * 0.03;
      height += noise;

      // Era-based modifications
      let eraHeight = height;
      let r, g, b;

      switch (eraIndex) {
        case 0: // Ancient Rome — natural terrain, lush greens, marble whites on hills
          eraHeight = height;
          if (tiber.depth < 0) {
            r = 0.15; g = 0.25; b = 0.55; // river blue
          } else if (height > 1.2) {
            r = 0.85; g = 0.80; b = 0.65; // marble/stone on hill peaks (temples)
          } else if (height > 0.6) {
            r = 0.45; g = 0.55; b = 0.30; // olive green on slopes
          } else {
            r = 0.50; g = 0.60; b = 0.35; // grassland
          }
          break;

        case 1: // Medieval — slightly more worn, browner, some areas lower
          eraHeight = height * 0.92 + 0.02;
          if (tiber.depth < 0) {
            r = 0.18; g = 0.28; b = 0.48;
          } else if (height > 1.0) {
            r = 0.60; g = 0.55; b = 0.45; // weathered stone
          } else if (height > 0.5) {
            r = 0.50; g = 0.48; b = 0.32; // brownish
          } else {
            r = 0.42; g = 0.48; b = 0.30;
          }
          break;

        case 2: // Renaissance — revived, warmer tones, some building up
          eraHeight = height * 0.95 + 0.05;
          if (tiber.depth < 0) {
            r = 0.12; g = 0.22; b = 0.52;
          } else if (height > 1.0) {
            r = 0.78; g = 0.68; b = 0.52; // warm sandstone
          } else if (height > 0.5) {
            r = 0.55; g = 0.52; b = 0.38;
          } else {
            r = 0.48; g = 0.54; b = 0.34;
          }
          break;

        case 3: // Baroque — dramatic, built up areas, plazas
          eraHeight = height * 0.90 + 0.10;
          if (tiber.depth < 0) {
            r = 0.10; g = 0.20; b = 0.50;
          } else if (height > 1.0) {
            r = 0.82; g = 0.72; b = 0.55;
          } else if (height > 0.4) {
            r = 0.62; g = 0.56; b = 0.45; // warm urban
          } else {
            r = 0.52; g = 0.50; b = 0.40;
          }
          break;

        case 4: // Modern — more leveled, grayer, urban
          eraHeight = height * 0.80 + 0.15;
          if (tiber.depth < 0) {
            r = 0.10; g = 0.18; b = 0.45;
          } else if (height > 0.8) {
            r = 0.65; g = 0.62; b = 0.58; // concrete
          } else if (height > 0.4) {
            r = 0.58; g = 0.56; b = 0.52;
          } else {
            r = 0.50; g = 0.52; b = 0.48;
          }
          break;
      }

      points.push({
        grid_x: x,
        grid_z: z,
        height: eraHeight,
        r, g, b,
      });
    }
  }

  return points;
}

// ── Landmarks per era ─────────────────────────────────────────────────────────
const landmarksByEra = [
  // Ancient Rome
  [
    { name: 'Colosseum',        gx: 36, gz: 36, region: 'Caelian Hill',    desc: 'Flavian Amphitheatre, seats 50,000 spectators' },
    { name: 'Forum Romanum',    gx: 30, gz: 32, region: 'Forum Valley',   desc: 'Political and religious heart of the Republic and Empire' },
    { name: 'Pantheon',         gx: 26, gz: 26, region: 'Campus Martius',  desc: 'Temple to all gods, rebuilt by Hadrian with its famous dome' },
    { name: 'Circus Maximus',   gx: 30, gz: 38, region: 'Forum Valley',   desc: 'Great chariot racing stadium between Palatine and Aventine' },
    { name: 'Imperial Palace',  gx: 32, gz: 34, region: 'Palatine Hill',  desc: 'Residence of the Emperors atop the Palatine' },
    { name: 'Temple of Jupiter', gx: 28, gz: 30, region: 'Capitoline Hill', desc: 'Greatest temple of Roman state religion' },
  ],
  // Medieval Rome
  [
    { name: 'Colosseum (ruins)', gx: 36, gz: 36, region: 'Caelian Hill',   desc: 'Partially collapsed, stone quarried for new buildings' },
    { name: 'Castel Sant\'Angelo', gx: 20, gz: 22, region: 'Trastevere', desc: 'Hadrian\'s Mausoleum converted to a papal fortress' },
    { name: 'Old St. Peter\'s',  gx: 16, gz: 24, region: 'Vatican Hill',  desc: 'Constantinian basilica, center of Christendom' },
    { name: 'Forum (overgrown)', gx: 30, gz: 32, region: 'Forum Valley',  desc: 'Once-grand forum now called Campo Vaccino, a cattle field' },
    { name: 'Torre dei Conti',   gx: 34, gz: 28, region: 'Esquiline Hill', desc: 'Massive medieval tower of the Conti family' },
  ],
  // Renaissance
  [
    { name: 'St. Peter\'s Basilica', gx: 16, gz: 24, region: 'Vatican Hill', desc: 'Michelangelo\'s great dome rises over the new basilica' },
    { name: 'Sistine Chapel',    gx: 15, gz: 25, region: 'Vatican Hill',    desc: 'Ceiling painted by Michelangelo, 1508-1512' },
    { name: 'Palazzo Farnese',   gx: 24, gz: 30, region: 'Campus Martius',  desc: 'Greatest Renaissance palace, designed by Sangallo and Michelangelo' },
    { name: 'Colosseum',         gx: 36, gz: 36, region: 'Caelian Hill',    desc: 'Partially restored, declared a sacred site by Pope Benedict XIV' },
    { name: 'Campidoglio',       gx: 28, gz: 30, region: 'Capitoline Hill', desc: 'Michelangelo\'s piazza design for the civic center' },
  ],
  // Baroque Rome
  [
    { name: 'St. Peter\'s Square', gx: 15, gz: 23, region: 'Vatican Hill',  desc: 'Bernini\'s grand colonnade embraces the faithful' },
    { name: 'Trevi Fountain',    gx: 32, gz: 24, region: 'Quirinal Hill',   desc: 'Baroque masterpiece by Nicola Salvi, completed 1762' },
    { name: 'Piazza Navona',     gx: 24, gz: 27, region: 'Campus Martius',  desc: 'Three fountains including Bernini\'s Four Rivers' },
    { name: 'Spanish Steps',     gx: 30, gz: 20, region: 'Quirinal Hill',   desc: 'Monumental stairway connecting Piazza di Spagna to Trinità dei Monti' },
    { name: 'Colosseum',         gx: 36, gz: 36, region: 'Caelian Hill',    desc: 'Now a symbol of Rome, illuminated at night' },
    { name: 'Pantheon',          gx: 26, gz: 26, region: 'Campus Martius',   desc: 'Converted to a church, perfectly preserved' },
  ],
  // Modern Rome
  [
    { name: 'Colosseum',         gx: 36, gz: 36, region: 'Caelian Hill',    desc: 'UNESCO World Heritage Site, major restoration underway' },
    { name: 'Vatican Museums',   gx: 16, gz: 22, region: 'Vatican Hill',    desc: 'One of the world\'s greatest art collections' },
    { name: 'Vittoriano',        gx: 28, gz: 30, region: 'Capitoline Hill', desc: 'Monument to Victor Emmanuel II, completed 1935' },
    { name: 'Termini Station',   gx: 44, gz: 24, region: 'Esquiline Hill',  desc: 'Rome\'s main railway station, modernist architecture' },
    { name: 'Trastevere Quarter', gx: 18, gz: 34, region: 'Trastevere',     desc: 'Bohemian neighborhood, nightlife and restaurants' },
    { name: 'EUR District',      gx: 30, gz: 56, region: 'Forum Valley',    desc: 'Rationalist planned district from the 1940s' },
    { name: 'Pantheon',          gx: 26, gz: 26, region: 'Campus Martius',   desc: 'Best-preserved ancient building, still in use as a church' },
  ],
];

// ── Seed execution ────────────────────────────────────────────────────────────
console.log('Initializing schema…');
initSchema();

// Clear existing data
db.exec('DELETE FROM landmarks; DELETE FROM terrain_points; DELETE FROM regions; DELETE FROM eras;');

console.log('Inserting eras…');
const insertEra = db.prepare('INSERT INTO eras (name, year_start, year_end, description) VALUES (?, ?, ?, ?)');
for (const era of eras) {
  insertEra.run(era.name, era.year_start, era.year_end, era.description);
}

console.log('Inserting regions…');
const insertRegion = db.prepare('INSERT INTO regions (name, type) VALUES (?, ?)');
for (const region of regions) {
  insertRegion.run(region.name, region.type);
}

// Get inserted IDs
const eraRows = db.prepare('SELECT id, name FROM eras ORDER BY year_start').all();
const regionRows = db.prepare('SELECT id, name FROM regions').all();
const regionMap = Object.fromEntries(regionRows.map(r => [r.name, r.id]));

console.log('Generating terrain data (5 eras × 64×64 grid = 20,480 points)…');
const insertTerrain = db.prepare('INSERT INTO terrain_points (era_id, grid_x, grid_z, height, r, g, b) VALUES (?, ?, ?, ?, ?, ?, ?)');

const insertManyTerrain = db.transaction((eraId, points) => {
  for (const p of points) {
    insertTerrain.run(eraId, p.grid_x, p.grid_z, p.height, p.r, p.g, p.b);
  }
});

for (let i = 0; i < eraRows.length; i++) {
  const points = generateTerrainForEra(i);
  insertManyTerrain(eraRows[i].id, points);
  console.log(`  ✓ ${eraRows[i].name}: ${points.length} terrain points`);
}

console.log('Inserting landmarks…');
const insertLandmark = db.prepare('INSERT INTO landmarks (era_id, region_id, name, grid_x, grid_z, description) VALUES (?, ?, ?, ?, ?, ?)');

for (let i = 0; i < eraRows.length; i++) {
  const eraLandmarks = landmarksByEra[i];
  for (const lm of eraLandmarks) {
    const regionId = regionMap[lm.region] || null;
    insertLandmark.run(eraRows[i].id, regionId, lm.name, lm.gx, lm.gz, lm.desc);
  }
  console.log(`  ✓ ${eraRows[i].name}: ${eraLandmarks.length} landmarks`);
}

console.log('\nSeed complete! Database at db/historical-map.db');
console.log(`  ${eraRows.length} eras`);
console.log(`  ${regionRows.length} regions`);
console.log(`  ${GRID_SIZE * GRID_SIZE * eraRows.length} terrain points`);
console.log(`  ${landmarksByEra.flat().length} landmarks`);
