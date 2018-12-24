import * as THREE from 'three';

import _ from '../settings.json';

class Sun extends THREE.Mesh {
  constructor(glowShader) {
    const sphere = new THREE.SphereBufferGeometry(_.sun.radius, _.sun.segments, _.sun.segments);

    super(sphere.clone(), new THREE.MeshBasicMaterial({ color: '#FFBF62' }));

    // glow
    const glow = new THREE.Mesh(sphere.clone(), glowShader);
    glow.scale.multiplyScalar(1.25);

    // sunlight
    const light = new THREE.PointLight();

    this.add(glow, light);
  }
}

export default Sun;
