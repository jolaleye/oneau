import * as THREE from 'three';

import _ from '../settings.json';

class Sun extends THREE.Mesh {
  constructor() {
    super(
      new THREE.SphereBufferGeometry(_.sun.radius, _.sun.segments, _.sun.segments),
      new THREE.MeshBasicMaterial({ color: '#FFBF62' })
    );

    this.add(new THREE.PointLight());
  }
}

export default Sun;
