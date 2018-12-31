import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import _ from '../settings.json';
import script from '../script.json';

// coordinates phases and flow
class Director {
  constructor(pov, sun, earth) {
    this.pov = pov;
    this.sun = sun;
    this.earth = earth;
  }

  overlayText(text, fadeFor, showFor) {
    const el = document.createElement('p');
    el.appendChild(document.createTextNode(text));
    el.classList.add('text');
    document.querySelector('.overlay').appendChild(el);

    const fadeIn = new TWEEN.Tween({ opacity: 0 })
      .to({ opacity: 1 }, fadeFor)
      .easing(TWEEN.Easing.Quintic.Out)
      .onUpdate(({ opacity }) => (el.style.opacity = opacity));

    const fadeOut = new TWEEN.Tween({ opacity: 1 })
      .to({ opacity: 0 }, fadeFor)
      .easing(TWEEN.Easing.Quintic.Out)
      .onUpdate(({ opacity }) => (el.style.opacity = opacity))
      .delay(showFor);

    return new Promise(resolve => {
      fadeIn.chain(fadeOut).start();
      fadeOut.onComplete(() => {
        document.querySelector('.overlay').removeChild(el);
        resolve();
      });
    });
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

    document.querySelector('.pulse').addEventListener('click', () => {
      const ui = document.querySelector('.landing');

      // fade out the landing page ui
      const uiTween = new TWEEN.Tween({ opacity: 1 })
        .to({ opacity: 0 }, _.wait.uiFadeOut)
        .onUpdate(({ opacity }) => (ui.style.opacity = opacity))
        .onComplete(() => (ui.style.display = 'none'))
        .start();

      // stop rotation and start intro phase
      leoTween.stop();
      this.startIntro();
    });
  }

  // INTRO phase
  // - camera moves into position between Earth & Sun
  async startIntro() {
    const rotation = (this.earth.leo.rotation.y + Math.PI) % (2 * Math.PI); // rotation of Earth orbit past the destination
    const diff = 2 * Math.PI - rotation; // amount to rotate

    const cameraTween = new TWEEN.Tween(this.pov.camera.rotation)
      .to({ x: 0, y: -Math.PI, z: 0 }, _.intro.povRotationDuration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onComplete(() => this.pov.target.setFromEuler(new THREE.Euler(0, -Math.PI, 0)));

    const leoTween = new TWEEN.Tween(this.earth.leo.rotation)
      .to({ x: 0, y: `+${diff}`, z: 0 }, _.intro.povOrbitDuration)
      .easing(TWEEN.Easing.Cubic.Out)
      .onComplete(() => this.sun.toggleLensflare(false))
      .chain(cameraTween)
      .start();

    // run through the intro lines
    for (const line of script.intro) {
      await new Promise(resolve => setTimeout(resolve, line.delay));
      await this.overlayText(line.text, line.fadeFor, line.showFor);
    }

    // end it with the title
    const el = document.createElement('div');
    el.classList.add('text', 'intro-title');
    el.innerHTML = `
      <span>ONE</span>
      <span>AU</span>
    `;
    el.style.opacity = 0;
    document.querySelector('.overlay').appendChild(el);

    const fadeIn = new TWEEN.Tween({ opacity: 0 })
      .to({ opacity: 1 }, 3000)
      .easing(TWEEN.Easing.Quintic.Out)
      .delay(500)
      .onUpdate(({ opacity }) => (el.style.opacity = opacity));

    const fadeOut = new TWEEN.Tween({ opacity: 1 })
      .to({ opacity: 0 }, 3000)
      .easing(TWEEN.Easing.Quintic.Out)
      .onUpdate(({ opacity }) => (el.style.opacity = opacity))
      .delay(3000);

    fadeIn.chain(fadeOut).start();
  }
}

export default Director;
