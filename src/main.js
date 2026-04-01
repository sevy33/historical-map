import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { Terrain } from './terrain.js';
import { EraManager } from './eraManager.js';
import { UI } from './ui.js';

// ── Scene ─────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.015);

// ── Camera ────────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 20, 25);
camera.lookAt(0, 0, 0);

// ── Renderer ──────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// ── Controls ──────────────────────────────────────────────────────────────────
const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2.2;
controls.minDistance = 5;
controls.maxDistance = 60;
controls.target.set(0, 0, 0);

// ── Lighting ──────────────────────────────────────────────────────────────────
const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8b6914, 0.6);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffcc, 1.2);
dirLight.position.set(30, 40, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 100;
dirLight.shadow.camera.left = -25;
dirLight.shadow.camera.right = 25;
dirLight.shadow.camera.top = 25;
dirLight.shadow.camera.bottom = -25;
dirLight.shadow.bias = -0.0001;
scene.add(dirLight);

const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
scene.add(ambientLight);

// ── Grid helper (subtle) ─────────────────────────────────────────────────────
const gridHelper = new THREE.GridHelper(40, 40, 0x333355, 0x222244);
gridHelper.position.y = -0.1;
scene.add(gridHelper);

// ── Raycaster for hover ───────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let lastRaycast = 0;

// ── Initialize app ────────────────────────────────────────────────────────────
const terrain = new Terrain(scene);
const ui = new UI(camera);
const eraManager = new EraManager(terrain, ui);

async function init() {
  try {
    await eraManager.init();
    document.getElementById('loading').style.display = 'none';
  } catch (err) {
    document.getElementById('loading').textContent = `Error: ${err.message}`;
    console.error(err);
  }
}

// ── Event listeners ───────────────────────────────────────────────────────────
ui.btnPrev.addEventListener('click', () => eraManager.prev());
ui.btnNext.addEventListener('click', () => eraManager.next());

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') eraManager.prev();
  if (e.key === 'ArrowRight') eraManager.next();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (now - lastRaycast < 50) return;
  lastRaycast = now;

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  if (terrain.mesh) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(terrain.mesh);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      // Find closest landmark
      let closest = null;
      let closestDist = Infinity;
      for (const lm of ui.landmarks) {
        const lmPos = terrain.getWorldPosition(lm.grid_x, lm.grid_z);
        const dist = point.distanceTo(lmPos);
        if (dist < closestDist) {
          closestDist = dist;
          closest = lm;
        }
      }
      if (closest && closestDist < 2.5) {
        ui.showTooltip(`${closest.name}: ${closest.description}`, e.clientX, e.clientY);
      } else {
        ui.hideTooltip();
      }
    } else {
      ui.hideTooltip();
    }
  }
});

// ── Animation loop ────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  controls.update();
  terrain.update(delta);
  ui.updateLandmarkPositions(camera, renderer);
  renderer.render(scene, camera);
}

init();
animate();
