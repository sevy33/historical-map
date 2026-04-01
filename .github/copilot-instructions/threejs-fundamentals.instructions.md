---
applyTo: "src/**"
---

# Three.js Fundamentals

## Quick Start

```javascript
import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

## Core Classes

- **Scene**: Container for objects, lights, cameras. Set `scene.background`, `scene.fog`, `scene.environment`.
- **PerspectiveCamera(fov, aspect, near, far)**: Most common. Call `camera.updateProjectionMatrix()` after changing properties.
- **OrthographicCamera(left, right, top, bottom, near, far)**: No perspective distortion, good for isometric views.
- **WebGLRenderer**: Use `antialias: true`, set `toneMapping = THREE.ACESFilmicToneMapping`, `outputColorSpace = THREE.SRGBColorSpace`, enable `shadowMap.enabled = true`.
- **Object3D**: Base class. Has `position`, `rotation`, `quaternion`, `scale`. Use `add(child)`, `remove(child)`, `traverse()`.
- **Mesh**: Combines geometry + material. Set `castShadow`, `receiveShadow`.
- **Group**: Empty container for organizing objects.

## Coordinate System

Right-handed: +X right, +Y up, +Z toward viewer. Use `THREE.AxesHelper(5)` to visualize.

## Math Utilities

- **Vector3**: `set()`, `copy()`, `clone()`, `add()`, `sub()`, `normalize()`, `lerp()`, `distanceTo()`, `project(camera)`, `unproject(camera)`
- **Matrix4**: `compose()`, `decompose()`, `multiply()`, `invert()`, `lookAt()`
- **Quaternion**: `setFromEuler()`, `setFromAxisAngle()`, `slerp()`
- **MathUtils**: `clamp()`, `lerp()`, `mapLinear()`, `degToRad()`, `randFloat()`, `smoothstep()`

## Common Patterns

- **Cleanup**: Call `geometry.dispose()`, `material.dispose()`, `texture.dispose()`, `renderer.dispose()`
- **Clock**: `clock.getDelta()` for frame-rate-independent animation, `clock.getElapsedTime()` for total time
- **Resize**: Update `camera.aspect`, call `camera.updateProjectionMatrix()`, then `renderer.setSize()`
- **LOD**: `lod.addLevel(mesh, distance)` for distance-based mesh switching

## Performance Tips

1. Merge static geometries to reduce draw calls
2. Use `THREE.InstancedMesh` for many identical objects
3. Use `THREE.LOD` for distance-based detail switching
4. Limit pixel ratio: `Math.min(window.devicePixelRatio, 2)`
5. Dispose unused objects properly
