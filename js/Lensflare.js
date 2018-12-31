import * as THREE from 'three';

import LensflareElement from './LensflareElement';

const vs1 = `
precision highp float;
uniform vec3 screenPosition;
uniform vec2 scale;
attribute vec3 position;

void main() {
  gl_Position = vec4(position.xy * scale + screenPosition.xy, screenPosition.z, 1.0);
}
`;

const fs1 = `
precision highp float;

void main() {
  gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
`;

const vs2 = `
precision highp float;
uniform vec3 screenPosition;
uniform vec2 scale;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUV;

void main() {
	vUV = uv;
	gl_Position = vec4(position.xy * scale + screenPosition.xy, screenPosition.z, 1.0);
}
`;

const fs2 = `
precision highp float;
uniform sampler2D map;
varying vec2 vUV;

void main() {
	gl_FragColor = texture2D(map, vUV);
}
`;

class Lensflare extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.BufferGeometry();

    const float32Array = new Float32Array([-1, -1, 0, 0, 0, 1, -1, 0, 1, 0, 1, 1, 0, 1, 1, -1, 1, 0, 0, 1]);
    const interleavedBuffer = new THREE.InterleavedBuffer(float32Array, 5);
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
    geometry.addAttribute('position', new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0, false));
    geometry.addAttribute('uv', new THREE.InterleavedBufferAttribute(interleavedBuffer, 2, 3, false));

    super(geometry, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));

    this.name = 'lensflare';
    this.geometry = geometry;
    this.frustumCulled = false;
    this.renderOrder = Infinity;

    this.screenPosition = new THREE.Vector3();
    this.elements = [];

    this.tempMap = new THREE.DataTexture(new Uint8Array(16 * 16 * 3), 16, 16, THREE.RGBFormat);
    this.tempMap.minFilter = THREE.NearestFilter;
    this.tempMap.magFilter = THREE.NearestFilter;
    this.tempMap.wrapS = THREE.ClampToEdgeWrapping;
    this.tempMap.wrapT = THREE.ClampToEdgeWrapping;
    this.tempMap.needsUpdate = true;

    this.occlusionMap = new THREE.DataTexture(new Uint8Array(16 * 16 * 3), 16, 16, THREE.RGBFormat);
    this.occlusionMap.minFilter = THREE.NearestFilter;
    this.occlusionMap.magFilter = THREE.NearestFilter;
    this.occlusionMap.wrapS = THREE.ClampToEdgeWrapping;
    this.occlusionMap.wrapT = THREE.ClampToEdgeWrapping;
    this.occlusionMap.needsUpdate = true;

    this.material1A = new THREE.RawShaderMaterial({
      uniforms: {
        scale: { value: null },
        screenPosition: { value: null }
      },
      vertexShader: vs1,
      fragmentShader: fs1,
      depthTest: true,
      depthWrite: false,
      transparent: false
    });

    this.material1B = new THREE.RawShaderMaterial({
      uniforms: {
        map: { value: this.tempMap },
        scale: { value: null },
        screenPosition: { value: null }
      },
      vertexShader: vs2,
      fragmentShader: fs2,
      depthTest: false,
      depthWrite: false,
      transparent: false
    });

    const elementShader = LensflareElement.Shader;
    this.material2 = new THREE.RawShaderMaterial({
      uniforms: {
        map: { value: null },
        occlusionMap: { value: this.occlusionMap },
        color: { value: new THREE.Color(0xffffff) },
        scale: { value: new THREE.Vector2() },
        screenPosition: { value: new THREE.Vector3() }
      },
      vertexShader: elementShader.vertexShader,
      fragmentShader: elementShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    this.mesh1 = new THREE.Mesh(this.geometry, this.material1A);
    this.mesh2 = new THREE.Mesh(this.geometry, this.material2);

    this.onBeforeRender = this.preRender;
  }

  addElement(element) {
    this.elements.push(element);
  }

  preRender(renderer, scene, camera) {
    const scale = new THREE.Vector2();
    const screenPositionPixels = new THREE.Vector2();
    const safeArea = new THREE.Box2();
    const viewport = new THREE.Vector4();

    viewport.copy(renderer.getCurrentViewport());

    const invAspect = viewport.w / viewport.z;
    const halfWidth = viewport.z / 2;
    const halfHeight = viewport.w / 2;

    const size = 16 / viewport.w;
    scale.set(size * invAspect, size);

    safeArea.min.set(viewport.x, viewport.y);
    safeArea.max.set(viewport.x + viewport.z, viewport.y + viewport.w);

    // calculate position in screen space
    this.screenPosition.setFromMatrixPosition(this.matrixWorld);

    this.screenPosition.applyMatrix4(camera.matrixWorldInverse);
    this.screenPosition.applyMatrix4(camera.projectionMatrix);

    // coords relative to lower left corner of screen
    screenPositionPixels.x = viewport.x + this.screenPosition.x * halfWidth + halfWidth - 8;
    screenPositionPixels.y = viewport.y + this.screenPosition.y * halfHeight + halfHeight - 8;

    // screen cull
    if (!safeArea.containsPoint(screenPositionPixels)) return;

    // save current RGB to temp texture
    renderer.copyFramebufferToTexture(screenPositionPixels, this.tempMap);

    // render pink quad
    const uniforms1A = this.material1A.uniforms;
    uniforms1A.scale.value = scale;
    uniforms1A.screenPosition.value = this.screenPosition;

    renderer.renderBufferDirect(camera, null, this.geometry, this.material1A, this.mesh1, null);

    // copy result to occlusionMap
    renderer.copyFramebufferToTexture(screenPositionPixels, this.occlusionMap);

    // restore graphics
    const uniforms1B = this.material1B.uniforms;
    uniforms1B.scale.value = scale;
    uniforms1B.screenPosition.value = this.screenPosition;

    renderer.renderBufferDirect(camera, null, this.geometry, this.material1B, this.mesh1, null);

    // render elements
    const vecX = -this.screenPosition.x * 2;
    const vecY = -this.screenPosition.y * 2;

    for (const element of this.elements) {
      const uniforms2 = this.material2.uniforms;

      uniforms2.color.value.copy(element.color);
      uniforms2.map.value = element.texture;
      uniforms2.screenPosition.value.x = this.screenPosition.x + vecX * element.distance;
      uniforms2.screenPosition.value.y = this.screenPosition.y + vecY * element.distance;

      const size = element.size / viewport.w;
      const invAspect = viewport.w / viewport.z;

      uniforms2.scale.value.set(size * invAspect, size);

      this.material2.uniformsNeedUpdate = true;

      renderer.renderBufferDirect(camera, null, this.geometry, this.material2, this.mesh2, null);
    }
  }
}

export default Lensflare;
