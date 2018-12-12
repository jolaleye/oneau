import * as THREE from 'three';

import _ from '../settings.json'; // 1 unit(u) = 1,000,000km, speeds in u/s
import POV from './pov';
import MilkyWay from './milkyway';
import Sun from './sun';
import Earth from './earth';

// controls the whole scene
class Core {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.milkyway = new MilkyWay();
    this.sun = new Sun();
    this.earth = new Earth();
    this.scene.add(this.milkyway, this.sun, this.earth);

    this.pov = new POV();

    this.phase = '';

    this.startWait();
  }

  start() {
    this.lastTick = performance.now();
    this.update();
  }

  update() {
    requestAnimationFrame(this.update.bind(this));
    const ts = (performance.now() - this.lastTick) / 1000; // scales speeds to be 1 u/s regardless of frame rate
    this.lastTick = performance.now();

    this.pov.update(ts, this.phase);
    this.earth.update(ts, this.phase);

    this.renderer.render(this.scene, this.pov.camera);
  }

  // wait phase runs while the user is on the page and has not yet clicked to start
  // - camera orbits Earth
  startWait() {
    this.phase = 'wait';
    this.earth.orbit.add(this.pov.camera);
    this.pov.camera.position.z = _.earth.orbitalHeight;
    this.pov.camera.rotation.set(Math.PI / 2.5, 0, 0);
    this.pov.desiredRotation.setFromEuler(new THREE.Euler(Math.PI / 2.5, 0, 0));
  }

  // intro phase runs after the user has clicked to start
  // - orbit rotates to bring camera down
  startIntro() {
    this.phase = 'intro';
    this.pov.lock();

    this.earth.events.once('introAlmostDone', () => {
      this.phase = 'finishingIntro';
      this.pov.desiredRotation.setFromEuler(new THREE.Euler(Math.PI, 0, 0));
    });

    // wait for both the earth and pov to say they're done
    const done = { earth: false, pov: false };
    this.earth.events.once('introDone', () => {
      done.earth = true;
      if (done.earth && done.pov) this.startAU();
    });
    this.pov.events.once('introDone', () => {
      done.pov = true;
      if (done.earth && done.pov) this.startAU();
    });
  }

  // AU phase runs when the camera has been orbited into place and is ready to travel
  startAU() {
    this.phase = 'au';

    // release the camera from Earth's orbit
    this.pov.camera.position.setFromMatrixPosition(this.pov.camera.matrixWorld);
    this.pov.camera.rotation.setFromRotationMatrix(new THREE.Matrix4().extractRotation(this.pov.camera.matrixWorld));
    this.earth.orbit.remove(this.pov.camera);

    // unlock camera controls
    this.pov.locked = false;
    this.pov.desiredRotation.setFromEuler(new THREE.Euler(0, 0, 0));
  }
}

export default Core;
