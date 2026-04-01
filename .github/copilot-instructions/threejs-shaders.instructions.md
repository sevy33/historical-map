---
applyTo: "src/**"
---

# Three.js Shaders

## ShaderMaterial

```javascript
const material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0xff0000) },
  },
  vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    void main() {
      gl_FragColor = vec4(color, 1.0);
    }
  `,
});
// Update: material.uniforms.time.value = clock.getElapsedTime();
```

## Built-in Uniforms (auto-provided by ShaderMaterial)

```glsl
uniform mat4 modelMatrix;       // Object to world
uniform mat4 modelViewMatrix;   // Object to camera
uniform mat4 projectionMatrix;  // Camera projection
uniform mat4 viewMatrix;        // World to camera
uniform mat3 normalMatrix;      // For transforming normals
uniform vec3 cameraPosition;    // Camera world position

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
```

## Uniform Types

```javascript
uniforms: {
  floatVal: { value: 1.5 },
  vec2Val: { value: new THREE.Vector2(1, 2) },
  vec3Val: { value: new THREE.Vector3(1, 2, 3) },
  colorVal: { value: new THREE.Color(0xff0000) }, // → vec3
  mat4Val: { value: new THREE.Matrix4() },
  textureVal: { value: texture },                 // → sampler2D
}
```

## Varyings (vertex → fragment)

```glsl
// Vertex shader
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment shader
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);
}
```

## Common Patterns

- **Vertex displacement**: `pos.z += sin(pos.x * 5.0 + time) * amplitude;`
- **Fresnel**: `float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);`
- **Texture**: `vec4 texColor = texture2D(map, vUv);`
- **Noise**: Use `fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453)`
- **Gradient**: `vec3 color = mix(colorA, colorB, vUv.y);`
- **Smooth step**: `float t = smoothstep(0.0, 1.0, value);`

## Extending Built-in Materials

```javascript
material.onBeforeCompile = (shader) => {
  shader.uniforms.time = { value: 0 };
  material.userData.shader = shader;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `#include <begin_vertex>
    transformed.y += sin(position.x * 10.0 + time) * 0.1;`
  );
  shader.vertexShader = "uniform float time;\n" + shader.vertexShader;
};
```

## GLSL Built-in Functions

- **Math**: `abs`, `sign`, `floor`, `ceil`, `fract`, `mod`, `clamp`, `mix`, `step`, `smoothstep`
- **Trig**: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`
- **Exp**: `pow`, `exp`, `log`, `sqrt`
- **Vector**: `length`, `distance`, `dot`, `cross`, `normalize`, `reflect`, `refract`
- **Texture**: `texture2D(sampler, coord)` (GLSL 1.0), `texture(sampler, coord)` (GLSL 3.0)

## Performance Tips

1. Minimize uniforms — group related values into vectors
2. Use `mix`/`step` instead of `if`/`else`
3. Precalculate values in JS when possible
4. Use lookup textures for complex functions
5. Enable `renderer.debug.checkShaderErrors = true` for debugging
