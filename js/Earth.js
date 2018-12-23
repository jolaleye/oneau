import * as THREE from 'three';

import _ from '../settings.json';

class Earth extends THREE.Mesh {
  constructor() {
    super(
      new THREE.SphereBufferGeometry(_.earth.radius, _.earth.segments, _.earth.segments),
      new THREE.MeshBasicMaterial({ color: '#68D8FF' })
    );

    this.position.z = _.earth.orbitRadius;

    // low earth orbit
    this.leo = new THREE.Group();
    this.add(this.leo);
  }
}

export default Earth;
