import * as THREE from 'three';

import _ from '../settings.json';

class Earth extends THREE.Mesh {
  constructor() {
    super(
      new THREE.SphereBufferGeometry(_.earth.radius, _.earth.segments, _.earth.segments),
      new THREE.MeshBasicMaterial({ color: '#62A9FF' })
    );

    this.position.z = _.earth.orbit;
  }
}

export default Earth;
