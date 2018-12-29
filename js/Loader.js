import * as THREE from 'three';

import galaxy from '../img/galaxy.jpg';
import earth from '../img/earth.jpg';
import earthElev from '../img/earth-elev.jpg';
import earthWater from '../img/earth-water.png';
import earthClouds from '../img/earth-clouds.png';
import lensflare from '../img/lensflare.png';
import sun from '../img/sun.png';
import sunColorShift from '../img/colorShiftRamp.png';
import sunColor from '../img/colorRamp.png';
import flare0 from '../img/flare0.png';
import flare1 from '../img/flare1.png';
import corona from '../img/corona.png';

const textures = {
  galaxy,
  earth,
  earthElev,
  earthWater,
  earthClouds,
  lensflare,
  sun,
  sunColorShift,
  sunColor,
  flare0,
  flare1,
  corona
};

class Loader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();

    this.textures = {};
  }

  loadTextures() {
    return Promise.all(Object.keys(textures).map(this.loadTexture.bind(this)));
  }

  loadTexture(name) {
    return new Promise((resolve, reject) => {
      const onLoad = texture => {
        this.textures[name] = texture;
        resolve(texture);
      };
      const onError = err => reject(err);

      this.textureLoader.load(textures[name], onLoad, undefined, onError);
    });
  }
}

export default Loader;
