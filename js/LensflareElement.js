import * as THREE from 'three';

const vs = `
precision highp float;
uniform vec3 screenPosition;
uniform vec2 scale;
uniform sampler2D occlusionMap;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUV;
varying float vVisibility;

void main() {
  vUV = uv;
	vec2 pos = position.xy;
	vec4 visibility = texture2D(occlusionMap, vec2(0.1, 0.1));
	visibility += texture2D(occlusionMap, vec2(0.5, 0.1));
	visibility += texture2D(occlusionMap, vec2(0.9, 0.1));
	visibility += texture2D(occlusionMap, vec2(0.9, 0.5));
	visibility += texture2D(occlusionMap, vec2(0.9, 0.9));
	visibility += texture2D(occlusionMap, vec2(0.5, 0.9));
	visibility += texture2D(occlusionMap, vec2(0.1, 0.9));
	visibility += texture2D(occlusionMap, vec2(0.1, 0.5));
	visibility += texture2D(occlusionMap, vec2(0.5, 0.5));
	vVisibility = visibility.r / 9.0;
	vVisibility *= 1.0 - visibility.g / 9.0;
	vVisibility *= visibility.b / 9.0;
	gl_Position = vec4((pos * scale + screenPosition.xy).xy, screenPosition.z, 1.0 );
}
`;

const fs = `
precision highp float;
uniform sampler2D map;
uniform vec3 color;
varying vec2 vUV;
varying float vVisibility;

void main() {
	vec4 texture = texture2D(map, vUV);
	texture.a *= vVisibility;
	gl_FragColor = texture;
	gl_FragColor.rgb *= color;
}
`;

class LensflareElement {
  constructor(texture, size = 1, distance = 0, color = new THREE.Color(0xffffff)) {
    this.texture = texture;
    this.size = size;
    this.distance = distance;
    this.color = color;
  }

  static get Shader() {
    return {
      uniforms: {
        map: { value: null },
        occlusionMap: { value: null },
        color: { value: null },
        scale: { value: null },
        screenPosition: { value: null }
      },
      vertexShader: vs,
      fragmentShader: fs
    };
  }
}

export default LensflareElement;
