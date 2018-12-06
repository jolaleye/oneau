import * as THREE from 'three';

import _ from '../settings.json';

class POV {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      _.camera.fov,
      window.innerWidth / window.innerHeight,
      _.camera.near,
      _.camera.far
    );
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}

export default POV;
