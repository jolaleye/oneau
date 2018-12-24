import * as THREE from 'three';

import galaxy from '../img/galaxy.jpg';

import earth from '../img/earth.jpg';
import earthElev from '../img/earth-elev.jpg';
import earthWater from '../img/earth-water.png';
import earthClouds from '../img/earth-clouds.png';

import flare from '../img/flare.png';

class TextureManager {
  constructor() {
    this.loader = new THREE.TextureLoader();
  }

  load() {
    return new Promise((resolve, reject) => {
      this.galaxy = this.loader.load(galaxy, undefined, undefined, reject);

      this.earth = this.loader.load(earth, undefined, undefined, reject);
      this.earthElev = this.loader.load(earthElev, undefined, undefined, reject);
      this.earthWater = this.loader.load(earthWater, undefined, undefined, reject);
      this.earthClouds = this.loader.load(earthClouds, undefined, undefined, reject);

      this.flare = this.loader.load(flare, undefined, undefined, reject);

      resolve();
    });
  }
}

export default TextureManager;
