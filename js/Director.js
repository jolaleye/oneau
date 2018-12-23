import TWEEN from '@tweenjs/tween.js';

import _ from '../settings.json';

// coordinates phases and flow
class Director {
  constructor(pov, earth) {
    this.pov = pov;
    this.earth = earth;
  }

  // WAIT phase
  // - camera orbits Earth
  startWait() {
    this.earth.leo.add(this.pov.camera);
    this.pov.position.z = _.wait.povOrbitRadius;
    this.pov.lock();

    const leoTween = new TWEEN.Tween(this.earth.leo.rotation);
    leoTween
      .to({ x: 0, y: 2 * Math.PI, z: 0 }, _.wait.povOrbitPeriod)
      .repeat(Infinity)
      .start();
  }
}

export default Director;
