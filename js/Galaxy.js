import * as THREE from 'three';

import _ from '../settings.json';
import { km2u } from './utils';

class Galaxy extends THREE.Mesh {
  constructor(textures) {
    super(
      new THREE.SphereBufferGeometry(km2u(_.galaxy.radius), _.galaxy.segments, _.galaxy.segments),
      new THREE.MeshBasicMaterial({ map: textures.galaxy, side: THREE.BackSide })
    );
  }
}

export default Galaxy;
