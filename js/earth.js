import * as THREE from 'three';

import _ from '../settings.json';

class Earth extends THREE.Mesh {
  constructor() {
    super(new THREE.SphereBufferGeometry(_.earth.radius, 100, 100), new THREE.MeshBasicMaterial({ color: '#62A9FF' }));
  }
}

export default Earth;
