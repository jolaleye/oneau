import * as THREE from 'three';

import _ from '../settings.json';

class Sun extends THREE.Mesh {
  constructor() {
    super(new THREE.SphereBufferGeometry(_.sun.radius, 100, 100), new THREE.MeshBasicMaterial({ color: '#FFBF62' }));

    this.position.set(0, 0, -_.earth.orbit.radius);
  }
}

export default Sun;
