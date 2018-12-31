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

    // rotate Earth's orbit
    const leoTween = new TWEEN.Tween(this.earth.leo.rotation)
      .to({ x: 0, y: 2 * Math.PI, z: 0 }, _.wait.povOrbitPeriod)
      .repeat(Infinity)
      .start();

    // fade out the landing page ui
    document.querySelector('.pulse').addEventListener('click', () => {
      const ui = document.querySelector('.landing');

      const uiTween = new TWEEN.Tween({ opacity: 1 })
        .to({ opacity: 0 }, _.wait.uiFadeOut)
        .onUpdate(({ opacity }) => (ui.style.opacity = opacity))
        .onComplete(() => (ui.style.display = 'none'))
        .start();
    });
  }
}

export default Director;
