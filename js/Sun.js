import * as THREE from 'three';

import _ from '../settings.json';
import { km2u } from './utils';
import Lensflare from './Lensflare';
import LensflareElement from './LensflareElement';
import sunVS from '../shaders/sunVS';
import sunFS from '../shaders/sunFS';
import ColorRamp from './ColorRamp';
import coronaVS from '../shaders/coronaVS';
import coronaFS from '../shaders/coronaFS';

class Sun extends THREE.Mesh {
  constructor(textures) {
    textures.sun.wrapS = THREE.RepeatWrapping;
    textures.sun.wrapT = THREE.RepeatWrapping;

    super(
      new THREE.SphereBufferGeometry(km2u(_.sun.radius), _.sun.segments, _.sun.segments),
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
        opacity: 0.5,
        depthWrite: false
      })
    );
    flare0.scale.multiplyScalar(400);

    const flare1 = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: textures.flare1,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    flare1.scale.multiplyScalar(250);

    this.corona = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(125, 125),
      new THREE.ShaderMaterial({
        uniforms: {
          texture: { value: textures.corona },
          colorRamp: { value: textures.sunColor },
          colorLookup: { value: _.sun.colorLookup }
        },
        vertexShader: coronaVS,
        fragmentShader: coronaFS,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      })
    );

    this.lensflare = new Lensflare();
    this.lensflare.addElement(new LensflareElement(textures.lensflare, 60, 0.6));
    this.lensflare.addElement(new LensflareElement(textures.lensflare, 70, 0.7));
    this.lensflare.addElement(new LensflareElement(textures.lensflare, 120, 0.9));
    this.lensflare.addElement(new LensflareElement(textures.lensflare, 70, 1));

    this.orbit = new THREE.Group();

    this.add(light, flare0, flare1, this.corona, this.lensflare, this.orbit);
  }

  update() {
    // update the shader time value for nice glowy fx
    this.material.uniforms.time.value = performance.now() / 1000;
  }

  toggleLensflare(on) {
    if (on && !this.getObjectByName('lensflare')) this.add(this.lensflare);
    else if (!on) this.remove(this.lensflare);
  }
}

export default Sun;
