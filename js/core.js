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

    // set up scene objects
    this.pov = new POV();
    this.milkyway = new MilkyWay();
    this.sun = new Sun();
    this.earth = new Earth();
    this.scene.add(this.milkyway, this.sun, this.earth);

    // current scene phase
    this.phase = '';

    // start the "wait" phase
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

    let phaseData = {};
    switch (this.phase) {
      case 'intro':
        phaseData = this.getIntroData();
        break;
    }

    this.pov.update(ts, this.phase, phaseData);
    this.earth.update(ts, this.phase, phaseData);

    this.renderer.render(this.scene, this.pov.camera);
  }

  // wait phase runs while the user is on the page and has not yet clicked to start
  // - camera orbits Earth
  startWait() {
    this.phase = 'wait';
    this.earth.orbit.add(this.pov.camera);
    this.pov.camera.position.set(0, _.earth.orbitHeight, 0);
    this.pov.camera.rotation.set(0, -Math.PI / 2, 0);
    this.pov.desiredRotation.set(0, -Math.PI / 2, 0);
  }

  // intro phase runs after the user has clicked to start
  // - orbit rotates to bring camera down
  // - pov rotates to counteract rotating orbit
  startIntro() {
    this.phase = 'intro';
    this.pov.lock();
    this.pov.camera.rotation.set(-Math.PI / 8, -Math.PI / 2, 0);
    this.pov.desiredRotation.set(Math.PI / 2, -Math.PI / 2, 0);
  }
  getIntroData() {
    // degrees left to rotate
    const delta = this.earth.orbit.rotation.z - -Math.PI / 2;
    const rotationComplete = delta < 0.001;
    if (rotationComplete) this.startAU();

    const orbitSpeed = Math.max(delta, 0.75) * _.earth.orbitIntroSpeed;

    return { orbitSpeed };
  }

  // AU phase runs when the camera has been orbited into place and is ready to travel
  startAU() {
    this.phase = 'au';
    this.pov.locked = false;
    this.earth.orbit.remove(this.pov.camera);
    this.pov.camera.position.set(0, 0, _.earth.sunOrbitRadius - _.earth.orbitHeight);
    this.pov.camera.rotation.set(0, 0, 0);
    this.pov.desiredRotation.set(0, 0, 0);
  }
}

export default Core;
