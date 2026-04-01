---
applyTo: "src/**"
---

# Three.js Textures

## Loading

```javascript
const loader = new THREE.TextureLoader();
const texture = loader.load("texture.jpg");
material.map = texture;

// Promise wrapper
function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, resolve, undefined, reject);
  });
}
```

## Configuration

```javascript
// Color space (critical for accuracy)
colorTexture.colorSpace = THREE.SRGBColorSpace;
// Do NOT set colorSpace for data textures (normal, roughness, etc.)

// Wrapping
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4, 4);

// Filtering
texture.minFilter = THREE.LinearMipmapLinearFilter; // default, smooth
texture.magFilter = THREE.LinearFilter;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
```

## Data Texture (procedural)

```javascript
const size = 256;
const data = new Uint8Array(size * size * 4);
for (let i = 0; i < size * size; i++) {
  data[i * 4] = value_r;
  data[i * 4 + 1] = value_g;
  data[i * 4 + 2] = value_b;
  data[i * 4 + 3] = 255;
}
const texture = new THREE.DataTexture(data, size, size);
texture.needsUpdate = true;
```

## Canvas Texture

```javascript
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
// Draw on canvas...
const texture = new THREE.CanvasTexture(canvas);
texture.needsUpdate = true; // update when canvas changes
```

## PBR Texture Set

```javascript
new THREE.MeshStandardMaterial({
  map: colorTexture,           // sRGB
  normalMap: normalTexture,    // Linear
  roughnessMap: roughTexture,  // Linear
  metalnessMap: metalTexture,  // Linear
  aoMap: aoTexture,            // Linear, requires uv2
  displacementMap: dispTexture,
  displacementScale: 0.1,
});
```

## Performance Tips

1. Use power-of-2 dimensions: 256, 512, 1024, 2048
2. 2048 usually sufficient for web
3. Reuse textures for better batching
4. Always call `texture.dispose()` when done
5. Check `renderer.info.memory.textures` for memory usage
