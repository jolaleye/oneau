import * as THREE from 'three';

import _ from '../settings.json';

class Galaxy extends THREE.Mesh {
  constructor(texture) {
    super(
      new THREE.SphereBufferGeometry(_.galaxy.radius, _.galaxy.segments, _.galaxy.segments),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide })
    );
  }
}

export default Galaxy;
