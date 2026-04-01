---
applyTo: "src/**"
---

# Three.js Materials

## Material Types

| Material             | Use Case                    | Lighting           |
| -------------------- | --------------------------- | ------------------ |
| MeshBasicMaterial    | Unlit, flat colors          | No                 |
| MeshLambertMaterial  | Matte, performance          | Diffuse only       |
| MeshPhongMaterial    | Shiny, specular highlights  | Yes                |
| MeshStandardMaterial | PBR, realistic              | Yes (PBR)          |
| MeshPhysicalMaterial | Advanced PBR, glass, fabric | Yes (PBR+)         |
| MeshToonMaterial     | Cel-shaded                  | Toon               |
| ShaderMaterial       | Custom GLSL                 | Custom             |

## MeshStandardMaterial (PBR, Recommended)

```javascript
new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.5,      // 0 = mirror, 1 = matte
  metalness: 0.0,      // 0 = dielectric, 1 = metal
  map: colorTexture,
  normalMap: normalTexture,
  normalScale: new THREE.Vector2(1, 1),
  roughnessMap: roughTexture,
  metalnessMap: metalTexture,
  aoMap: aoTexture,     // needs uv2
  emissive: 0x000000,
  envMap: envTexture,
  flatShading: false,
  vertexColors: false,
  side: THREE.FrontSide,
});
```

## Common Properties (all materials)

```javascript
material.transparent = true;
material.opacity = 0.5;
material.side = THREE.DoubleSide;
material.depthTest = true;
material.depthWrite = true;
material.wireframe = false;
material.visible = true;
material.alphaTest = 0;
```

## ShaderMaterial

```javascript
new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0xff0000) },
    map: { value: texture },
  },
  vertexShader: `...`,
  fragmentShader: `...`,
  transparent: true,
});
// Update: material.uniforms.time.value = clock.getElapsedTime();
```

## Performance Tips

1. Reuse materials (same material = batched draw calls)
2. Use alphaTest instead of transparency when possible
3. Simpler materials are faster: Basic > Lambert > Standard > Physical
4. Always call `material.dispose()` when done
