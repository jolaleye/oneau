import * as THREE from 'three';

import _ from '../settings.json';

class MilkyWay extends THREE.Mesh {
  constructor(textures) {
    textures.stars.wrapS = THREE.RepeatWrapping;
    textures.stars.wrapT = THREE.RepeatWrapping;

    super(
      new THREE.SphereBufferGeometry(_.system.radius, _.system.segments, _.system.segments),
      new THREE.MeshBasicMaterial({ map: textures.stars, transparent: true, opacity: 0.8, side: THREE.BackSide })
    );
  }
}

export default MilkyWay;
