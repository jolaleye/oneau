import * as THREE from 'three';

import _ from '../settings.json';

class Galaxy extends THREE.Mesh {
  constructor(textures) {
    super(
      new THREE.SphereBufferGeometry(_.galaxy.radius, _.galaxy.segments, _.galaxy.segments),
      new THREE.MeshBasicMaterial({ map: textures.galaxy, side: THREE.BackSide })
    );
  }
}

export default Galaxy;
