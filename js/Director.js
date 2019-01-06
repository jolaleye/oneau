import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import _ from '../settings.json';
import script from '../script.json';
import { km2u, u2km } from './utils';
import UI from './UI';

// coordinates phases and flow
class Director {
  constructor(pov, sun, earth) {
    this.pov = pov;
    this.sun = sun;
    this.earth = earth;
    this.ui = new UI();
  }

  update() {
    // get the distance from Earth & current speed
    const distanceFromEarth = this.earth.position.z - this.pov.position.z;
    const currentSpeed = this.pov.velocity.z;

    this.ui.updateDistance(u2km(distanceFromEarth));
    this.ui.updateSpeed(u2km(currentSpeed) * 3600);

    // check checkpoints
    if (script.checkpoints.length && distanceFromEarth >= script.checkpoints[0].distance) {
      const checkpoint = script.checkpoints.shift();
    }
  }

  // waiting for the scene to render and placeholder to fade out
  preWait() {
    this.earth.leo.add(this.pov.camera);
    this.pov.position.z = km2u(_.wait.povOrbitRadius);
    this.pov.lock();
  }

  // WAIT phase
  // - camera orbits Earth
  startWait() {
    // rotate Earth's orbit continuously
    const orbitTween = new TWEEN.Tween(this.earth.leo.rotation)
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
      orbitTween.stop();
      this.startIntro();
    });
  }

  // INTRO phase
  // - camera moves into position between Earth & Sun
  async startIntro() {
    this.pov.cameraCorrection = false;
    const rotation = (this.earth.leo.rotation.y + Math.PI) % (2 * Math.PI); // rotation of Earth orbit past the destination
    const diff = 2 * Math.PI - rotation; // amount to rotate

    const cameraTween = new TWEEN.Tween(this.pov.camera.rotation)
      .to({ x: 0, y: -Math.PI, z: 0 }, _.intro.povRotationDuration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onComplete(() => this.pov.target.setFromEuler(new THREE.Euler(0, -Math.PI, 0)));

    const orbitTween = new TWEEN.Tween(this.earth.leo.rotation)
      .to({ x: 0, y: `+${diff}`, z: 0 }, _.intro.povOrbitDuration)
      .easing(TWEEN.Easing.Cubic.Out)
      .onComplete(() => this.sun.toggleLensflare(false))
      .chain(cameraTween)
      .start();

    // run through the intro lines
    for (const line of script.intro) {
      await this.ui.subtitle(line.text, line.delay, line.fadeFor, line.showFor, 0, 0.8);
    }

    // title line
    await this.ui.subtitle('ONE AU', 500, 3000, 3000, 0, 1, '<span>ONE</span><span>AU</span>', ['intro-title']);

    this.startInstructions();
  }

  // INSTRUCTIONS phase
  // - subtitles explain the thing
  // - hud appears w/ distance & speed
  async startInstructions() {
    // remove the pov from earth orbit and reset
    const povWorldPos = new THREE.Vector3();
    this.pov.camera.getWorldPosition(povWorldPos);
    this.earth.leo.remove(this.pov.camera);
    this.pov.position.copy(povWorldPos);
    this.pov.target.setFromEuler(new THREE.Euler(0, 0, 0));
    this.pov.rotation.set(0, 0, 0);
    this.pov.cameraCorrection = true;

    // run through the instruction lines
    for (let i = 0; i < script.instructions.length; i++) {
      const line = script.instructions[i];
      await this.ui.subtitle(line.text, line.delay, line.fadeFor, line.showFor, 0, 0.8);

      // add the distance overlay after the first line
      if (i === 0) this.ui.show('distance');
      // start moving and show the speed after the second line (at 277.87mph or 0.12422km/s)
      if (i === 1) {
        this.pov.setSpeed(0.12422);
        this.ui.show('speed');
      }
      // unlock pov controls after line 5
      if (i === 4) this.pov.unlock();
      // unlock speed controls after line 6
      if (i === 5) this.pov.scrollLocked = false;
    }

    this.startAU();
  }

  // AU phase
  // - user travels towards the sun with periodic subtitles
  startAU() {}
}

export default Director;
