import * as THREE from 'three';

import _ from '../settings.json';
import milkyWayImg from '../img/milkyway.jpg';

class MilkyWay extends THREE.Mesh {
  constructor() {
    const texture = new THREE.TextureLoader().load(milkyWayImg);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    super(
      new THREE.SphereBufferGeometry(_.system.radius, _.system.segments, _.system.segments),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.8, side: THREE.BackSide })
    );
  }
}

export default MilkyWay;
