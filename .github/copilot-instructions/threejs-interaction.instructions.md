---
applyTo: "src/**"
---

# Three.js Interaction

## Camera Controls

```javascript
import { MapControls } from "three/addons/controls/MapControls.js";
const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;
// Must call controls.update() in animation loop
```

Other controls: `OrbitControls`, `FlyControls`, `FirstPersonControls`, `PointerLockControls`, `TrackballControls`.

## Raycasting (Click/Hover Detection)

```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    console.log("Hit:", intersects[0].object, "at:", intersects[0].point);
  }
}
```

Each intersect result contains: `distance`, `point` (Vector3), `face`, `object`, `uv`, `normal`, `instanceId`.

## Mouse Position (for canvas element)

```javascript
const rect = canvas.getBoundingClientRect();
mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
```

## World-to-Screen Coordinate Conversion

```javascript
function worldToScreen(position, camera) {
  const vector = position.clone().project(camera);
  return {
    x: ((vector.x + 1) / 2) * window.innerWidth,
    y: (-(vector.y - 1) / 2) * window.innerHeight,
  };
}
```

## Screen-to-World

```javascript
function screenToWorld(screenX, screenY, camera, targetZ = 0) {
  const vector = new THREE.Vector3(
    (screenX / window.innerWidth) * 2 - 1,
    -(screenY / window.innerHeight) * 2 + 1,
    0.5,
  ).unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distance = (targetZ - camera.position.z) / dir.z;
  return camera.position.clone().add(dir.multiplyScalar(distance));
}
```

## Performance Tips

1. Throttle mousemove raycasts (~20fps max)
2. Use `raycaster.layers.set(n)` to filter targets
3. Use simpler invisible geometry for raycasting on complex meshes
4. Only intersect specific objects, not `scene.children`
