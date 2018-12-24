import * as THREE from 'three';

import _ from '../settings.json';
import Lensflare from './Lensflare';
import LensflareElement from './LensflareElement';

class Sun extends THREE.Mesh {
  constructor(textures, glowShader) {
    const sphere = new THREE.SphereBufferGeometry(_.sun.radius, _.sun.segments, _.sun.segments);

    super(sphere.clone(), new THREE.MeshBasicMaterial({ color: '#FFBF62' }));

    // const glow = new THREE.Mesh(sphere.clone(), glowShader);
    // glow.scale.multiplyScalar(1.25);

    const light = new THREE.PointLight();

    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(textures.flare, 60, 0.6));
    lensflare.addElement(new LensflareElement(textures.flare, 70, 0.7));
    lensflare.addElement(new LensflareElement(textures.flare, 120, 0.9));
    lensflare.addElement(new LensflareElement(textures.flare, 70, 1));

    this.add(light, lensflare);
  }
}

export default Sun;
