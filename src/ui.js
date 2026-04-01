export class UI {
  constructor(camera) {
    this.camera = camera;
    this.eraNameEl = document.getElementById('era-name');
    this.eraDatesEl = document.getElementById('era-dates');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.tooltipEl = document.getElementById('landmark-tooltip');
    this.landmarkLabels = [];
    this.landmarks = [];
    this.terrain = null;
  }

  updateEra(era) {
    this.eraNameEl.textContent = era.name;
    const startStr = era.year_start < 0 ? `${Math.abs(era.year_start)} BC` : `${era.year_start} AD`;
    const endStr = era.year_end < 0 ? `${Math.abs(era.year_end)} BC` : `${era.year_end} AD`;
    this.eraDatesEl.textContent = `${startStr} – ${endStr}`;
  }

  updateButtons(currentIndex, totalEras) {
    this.btnPrev.disabled = currentIndex === 0;
    this.btnNext.disabled = currentIndex === totalEras - 1;
    this.btnPrev.style.opacity = currentIndex === 0 ? '0.4' : '1';
    this.btnNext.style.opacity = currentIndex === totalEras - 1 ? '0.4' : '1';
  }

  updateLandmarks(landmarks, terrain) {
    // Remove old labels
    for (const label of this.landmarkLabels) {
      label.remove();
    }
    this.landmarkLabels = [];
    this.landmarks = landmarks;
    this.terrain = terrain;

    // Create new labels
    const overlay = document.getElementById('ui-overlay');
    for (const lm of landmarks) {
      const label = document.createElement('div');
      label.className = 'landmark-label';
      label.textContent = lm.name;
      label.title = lm.description || '';
      overlay.appendChild(label);
      this.landmarkLabels.push(label);
    }
  }

  updateLandmarkPositions(camera, renderer) {
    if (!this.terrain || this.landmarks.length === 0) return;

    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;

    for (let i = 0; i < this.landmarks.length; i++) {
      const lm = this.landmarks[i];
      const label = this.landmarkLabels[i];
      if (!label) continue;

      const worldPos = this.terrain.getWorldPosition(lm.grid_x, lm.grid_z);
      const screenPos = worldPos.clone().project(camera);

      const x = (screenPos.x * 0.5 + 0.5) * width;
      const y = (-screenPos.y * 0.5 + 0.5) * height;

      // Hide if behind camera
      if (screenPos.z > 1) {
        label.style.display = 'none';
      } else {
        label.style.display = 'block';
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
      }
    }
  }

  showTooltip(text, x, y) {
    this.tooltipEl.textContent = text;
    this.tooltipEl.style.display = 'block';
    this.tooltipEl.style.left = `${x + 12}px`;
    this.tooltipEl.style.top = `${y - 10}px`;
  }

  hideTooltip() {
    this.tooltipEl.style.display = 'none';
  }
}
