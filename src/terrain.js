import * as THREE from 'three';

const GRID_SIZE = 64;
const TERRAIN_SCALE = 0.5;   // world units per grid cell
const HEIGHT_SCALE = 3.0;    // vertical exaggeration

export class Terrain {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.geometry = null;
    this.currentData = null;
    this.targetData = null;
    this.transitionProgress = 1;
    this.transitionDuration = 1.0; // seconds
  }

  buildMesh(terrainPoints) {
    this.currentData = this.parsePoints(terrainPoints);

    const width = (GRID_SIZE - 1) * TERRAIN_SCALE;
    this.geometry = new THREE.PlaneGeometry(width, width, GRID_SIZE - 1, GRID_SIZE - 1);
    this.geometry.rotateX(-Math.PI / 2);

    const positions = this.geometry.attributes.position.array;
    const colors = new Float32Array(positions.length);

    // Center the terrain
    const offsetX = -width / 2;
    const offsetZ = -width / 2;

    for (let i = 0; i < this.currentData.length; i++) {
      const d = this.currentData[i];
      const idx = i * 3;
      positions[idx]     = d.x * TERRAIN_SCALE + offsetX;
      positions[idx + 1] = d.height * HEIGHT_SCALE;
      positions[idx + 2] = d.z * TERRAIN_SCALE + offsetZ;
      colors[idx]     = d.r;
      colors[idx + 1] = d.g;
      colors[idx + 2] = d.b;
    }

    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: false,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  parsePoints(points) {
    return points.map(p => ({
      x: p.grid_x,
      z: p.grid_z,
      height: p.height,
      r: p.r,
      g: p.g,
      b: p.b,
    }));
  }

  transitionTo(newPoints) {
    this.targetData = this.parsePoints(newPoints);
    this.transitionProgress = 0;
  }

  update(deltaTime) {
    if (this.transitionProgress >= 1 || !this.targetData) return;

    this.transitionProgress = Math.min(1, this.transitionProgress + deltaTime / this.transitionDuration);
    const t = smoothstep(this.transitionProgress);

    const positions = this.geometry.attributes.position.array;
    const colors = this.geometry.attributes.color.array;

    for (let i = 0; i < this.currentData.length; i++) {
      const src = this.currentData[i];
      const dst = this.targetData[i];
      const idx = i * 3;

      positions[idx + 1] = THREE.MathUtils.lerp(src.height, dst.height, t) * HEIGHT_SCALE;
      colors[idx]     = THREE.MathUtils.lerp(src.r, dst.r, t);
      colors[idx + 1] = THREE.MathUtils.lerp(src.g, dst.g, t);
      colors[idx + 2] = THREE.MathUtils.lerp(src.b, dst.b, t);
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.computeVertexNormals();

    if (this.transitionProgress >= 1) {
      this.currentData = this.targetData;
      this.targetData = null;
    }
  }

  getWorldPosition(gridX, gridZ) {
    const width = (GRID_SIZE - 1) * TERRAIN_SCALE;
    const offsetX = -width / 2;
    const offsetZ = -width / 2;

    // Find height at this grid position
    let height = 0;
    if (this.currentData) {
      const idx = Math.round(gridZ) * GRID_SIZE + Math.round(gridX);
      if (idx >= 0 && idx < this.currentData.length) {
        height = this.currentData[idx].height;
      }
    }

    return new THREE.Vector3(
      gridX * TERRAIN_SCALE + offsetX,
      height * HEIGHT_SCALE + 0.3,
      gridZ * TERRAIN_SCALE + offsetZ
    );
  }
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}
