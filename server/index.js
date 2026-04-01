import express from 'express';
import { getEras, getTerrainByEra, getLandmarksByEra, initSchema } from './db.js';

const app = express();
const PORT = 3001;

initSchema();

app.get('/api/eras', (_req, res) => {
  const eras = getEras();
  res.json(eras);
});

app.get('/api/terrain/:eraId', (req, res) => {
  const eraId = parseInt(req.params.eraId, 10);
  if (isNaN(eraId)) return res.status(400).json({ error: 'Invalid era ID' });
  const points = getTerrainByEra(eraId);
  res.json(points);
});

app.get('/api/landmarks/:eraId', (req, res) => {
  const eraId = parseInt(req.params.eraId, 10);
  if (isNaN(eraId)) return res.status(400).json({ error: 'Invalid era ID' });
  const landmarks = getLandmarksByEra(eraId);
  res.json(landmarks);
});

app.listen(PORT, () => {
  console.log(`Historical Map API server running at http://localhost:${PORT}`);
});
