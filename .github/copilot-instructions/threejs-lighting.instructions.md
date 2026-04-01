---
applyTo: "src/**"
---

# Three.js Lighting

## Light Types

| Light            | Description          | Shadows | Cost     |
| ---------------- | -------------------- | ------- | -------- |
| AmbientLight     | Uniform everywhere   | No      | Very Low |
| HemisphereLight  | Sky/ground gradient  | No      | Very Low |
| DirectionalLight | Parallel rays (sun)  | Yes     | Low      |
| PointLight       | Omnidirectional      | Yes     | Medium   |
| SpotLight        | Cone-shaped          | Yes     | Medium   |
| RectAreaLight    | Area light (window)  | No*     | High     |

## Common Setup: Outdoor Daylight

```javascript
// Sun
const sun = new THREE.DirectionalLight(0xffffcc, 1.5);
sun.position.set(50, 100, 50);
sun.castShadow = true;
scene.add(sun);

// Sky ambient
const hemi = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.6);
scene.add(hemi);
```

## Shadow Setup

```javascript
// 1. Enable on renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 2. Configure light shadows
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
light.shadow.camera.left = -10;
light.shadow.camera.right = 10;
light.shadow.camera.top = 10;
light.shadow.camera.bottom = -10;
light.shadow.bias = -0.0001;

// 3. Enable on objects
mesh.castShadow = true;
mesh.receiveShadow = true;
```

## Environment Lighting (IBL)

```javascript
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
new RGBELoader().load("environment.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
});
```

## Performance Tips

1. Limit light count (each adds shader complexity)
2. Use baked lighting for static scenes
3. Tight shadow frustums (only cover needed area)
4. 512-1024 shadow maps often sufficient
5. Use light layers to exclude objects from certain lights
