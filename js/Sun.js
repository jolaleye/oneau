import * as THREE from 'three';

import _ from '../settings.json';
import Lensflare from './Lensflare';
import LensflareElement from './LensflareElement';
import sunVS from '../shaders/sunVS';
import sunFS from '../shaders/sunFS';

class Sun extends THREE.Mesh {
  constructor(textures) {
    textures.sun.wrapS = THREE.RepeatWrapping;
    textures.sun.wrapT = THREE.RepeatWrapping;

    super(
      new THREE.SphereBufferGeometry(_.sun.radius, _.sun.segments, _.sun.segments),
      new THREE.ShaderMaterial({
        uniforms: {
          texture: { value: textures.sun },
          colorShiftRamp: { value: textures.colorShift },
          colorRamp: { value: textures.color },
          colorLookup: { value: 0.66 },
          time: { value: 0 }
        },
        vertexShader: sunVS,
        fragmentShader: sunFS
      })
    );

    const light = new THREE.PointLight();

    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(textures.lensflare, 60, 0.6));
    lensflare.addElement(new LensflareElement(textures.lensflare, 70, 0.7));
    lensflare.addElement(new LensflareElement(textures.lensflare, 120, 0.9));
    lensflare.addElement(new LensflareElement(textures.lensflare, 70, 1));

    this.add(light, lensflare);
  }

  update() {
    // update the shader time value for nice glowy fx
    this.material.uniforms.time.value = performance.now() / 1000;
  }
}

export default Sun;
