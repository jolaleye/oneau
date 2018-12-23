import * as THREE from 'three';

import earth from '../img/earth.jpg';

class TextureManager {
  constructor() {
    this.loader = new THREE.TextureLoader();
  }

  load() {
    return new Promise((resolve, reject) => {
      this.earth = this.loader.load(earth, undefined, undefined, reject);

      resolve();
    });
  }
}

export default TextureManager;
