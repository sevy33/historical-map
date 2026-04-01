---
applyTo: "src/**"
---

# Three.js Geometry

## Built-in Geometries

```javascript
new THREE.BoxGeometry(width, height, depth, wSegs, hSegs, dSegs);
new THREE.SphereGeometry(radius, wSegs, hSegs);
new THREE.PlaneGeometry(width, height, wSegs, hSegs);
new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegs);
new THREE.ConeGeometry(radius, height, radialSegs);
new THREE.TorusGeometry(radius, tube, radialSegs, tubularSegs);
new THREE.CircleGeometry(radius, segments);
new THREE.RingGeometry(innerR, outerR, thetaSegs);
new THREE.CapsuleGeometry(radius, length, capSegs, radialSegs);
```

## Custom BufferGeometry

```javascript
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([...]);
geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

const indices = new Uint16Array([...]);
geometry.setIndex(new THREE.BufferAttribute(indices, 1));

const normals = new Float32Array([...]);
geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));

const uvs = new Float32Array([...]);
geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

const colors = new Float32Array([...]);
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
// Use with: material.vertexColors = true
```

## Modifying BufferGeometry

```javascript
const positions = geometry.attributes.position;
positions.setXYZ(index, x, y, z);
positions.needsUpdate = true;
geometry.computeVertexNormals();
geometry.computeBoundingBox();
```

## ExtrudeGeometry (for building shapes)

```javascript
const shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(1, 0);
shape.lineTo(1, 1);
shape.lineTo(0, 1);
shape.lineTo(0, 0);

new THREE.ExtrudeGeometry(shape, { steps: 2, depth: 1, bevelEnabled: false });
```

## InstancedMesh (many copies efficiently)

```javascript
const instanced = new THREE.InstancedMesh(geometry, material, count);
const dummy = new THREE.Object3D();
for (let i = 0; i < count; i++) {
  dummy.position.set(x, y, z);
  dummy.updateMatrix();
  instanced.setMatrixAt(i, dummy.matrix);
}
instanced.instanceMatrix.needsUpdate = true;
```

## Performance Tips

1. Use indexed geometry to reuse vertices
2. Merge static meshes with `BufferGeometryUtils.mergeGeometries()`
3. Use InstancedMesh for many identical objects
4. Choose appropriate segment counts (32 usually sufficient for spheres)
5. Always call `geometry.dispose()` when done
