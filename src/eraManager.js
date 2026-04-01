export class EraManager {
  constructor(terrain, ui) {
    this.terrain = terrain;
    this.ui = ui;
    this.eras = [];
    this.currentIndex = 0;
    this.loading = false;
    this.landmarkCache = {};
    this.terrainCache = {};
  }

  async init() {
    const res = await fetch('/api/eras');
    this.eras = await res.json();

    if (this.eras.length === 0) throw new Error('No eras found in database');

    // Load first era's terrain
    const firstEra = this.eras[0];
    const terrainData = await this.fetchTerrain(firstEra.id);
    this.terrain.buildMesh(terrainData);

    const landmarks = await this.fetchLandmarks(firstEra.id);
    this.ui.updateEra(firstEra);
    this.ui.updateLandmarks(landmarks, this.terrain);
    this.ui.updateButtons(this.currentIndex, this.eras.length);
  }

  async fetchTerrain(eraId) {
    if (this.terrainCache[eraId]) return this.terrainCache[eraId];
    const res = await fetch(`/api/terrain/${eraId}`);
    const data = await res.json();
    this.terrainCache[eraId] = data;
    return data;
  }

  async fetchLandmarks(eraId) {
    if (this.landmarkCache[eraId]) return this.landmarkCache[eraId];
    const res = await fetch(`/api/landmarks/${eraId}`);
    const data = await res.json();
    this.landmarkCache[eraId] = data;
    return data;
  }

  async switchEra(direction) {
    if (this.loading) return;

    const newIndex = this.currentIndex + direction;
    if (newIndex < 0 || newIndex >= this.eras.length) return;

    this.loading = true;
    this.currentIndex = newIndex;
    const era = this.eras[this.currentIndex];

    const [terrainData, landmarks] = await Promise.all([
      this.fetchTerrain(era.id),
      this.fetchLandmarks(era.id),
    ]);

    this.terrain.transitionTo(terrainData);
    this.ui.updateEra(era);
    this.ui.updateLandmarks(landmarks, this.terrain);
    this.ui.updateButtons(this.currentIndex, this.eras.length);
    this.loading = false;
  }

  prev() { return this.switchEra(-1); }
  next() { return this.switchEra(1); }
}
