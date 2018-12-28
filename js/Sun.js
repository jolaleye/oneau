import * as THREE from 'three';

import _ from '../settings.json';
import Lensflare from './Lensflare';
import LensflareElement from './LensflareElement';
import sunVS from '../shaders/sunVS';
import sunFS from '../shaders/sunFS';
import ColorRamp from './ColorRamp';

class Sun extends THREE.Mesh {
  constructor(textures) {
    textures.sun.wrapS = THREE.RepeatWrapping;
    textures.sun.wrapT = THREE.RepeatWrapping;

    super(
      new THREE.SphereBufferGeometry(_.sun.radius, _.sun.segments, _.sun.segments),
      new THREE.ShaderMaterial({
        uniforms: {
          texture: { value: textures.sun },
          colorShiftRamp: { value: textures.sunColorShift },
          colorRamp: { value: textures.sunColor },
          colorLookup: { value: _.sun.colorLookup },
          time: { value: 0 }
        },
        vertexShader: sunVS,
        fragmentShader: sunFS
      })
    );

    const light = new THREE.PointLight();

    const colorRamp = new ColorRamp(textures.sunColor.image);
    const lookupColor = colorRamp.getColor(1 - _.sun.colorLookup);
    const flareColor = new THREE.Color(lookupColor[0] / 255, lookupColor[1] / 255, lookupColor[2] / 255);
    const lightness =
      1.25 -
      (Math.sqrt(Math.pow(lookupColor[0], 2) + Math.pow(lookupColor[1], 2) + Math.pow(lookupColor[2], 2)) / 255) * 1.25;
    flareColor.offsetHSL(0, -0.15, lightness);

    const flare0 = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: textures.flare0,
        blending: THREE.AdditiveBlending,
        color: flareColor,
        transparent: true,
        opacity: 0.6
      })
    );
    flare0.scale.multiplyScalar(250);

    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(textures.lensflare, 60, 0.6));
    lensflare.addElement(new LensflareElement(textures.lensflare, 70, 0.7));
    lensflare.addElement(new LensflareElement(textures.lensflare, 120, 0.9));
    lensflare.addElement(new LensflareElement(textures.lensflare, 70, 1));

    this.add(light, flare0, lensflare);
  }

  update() {
    // update the shader time value for nice glowy fx
    this.material.uniforms.time.value = performance.now() / 1000;
  }
}

export default Sun;
