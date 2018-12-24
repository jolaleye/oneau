import * as THREE from 'three';

const vs = `
uniform vec3 viewVector;
uniform float c;
uniform float p;
varying float intensity;
void main() {
  vec3 vNormal = normalize(normalMatrix * normal);
	vec3 vNormel = normalize(normalMatrix * viewVector);
	intensity = pow(c - dot(vNormal, vNormel), p);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fs = `
uniform vec3 glowColor;
varying float intensity;
void main() 
{
	vec3 glow = glowColor * intensity;
  gl_FragColor = vec4(glow, 1.0);
}
`;

class GlowShader extends THREE.ShaderMaterial {
  constructor(start, decay, color, cameraPos) {
    super({
      uniforms: {
        c: { value: start },
        p: { value: decay },
        glowColor: { value: new THREE.Color(color) },
        viewVector: { value: cameraPos }
      },
      vertexShader: vs,
      fragmentShader: fs,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
  }
}

export default GlowShader;
