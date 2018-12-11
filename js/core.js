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
    this.pov.desiredRotation.set(Math.PI / 2.5, 0, 0);
  }

  // intro phase runs after the user has clicked to start
  // - orbit rotates to bring camera down
  startIntro() {
    this.phase = 'intro';
    this.earth.events.once('introDone', this.startAU.bind(this));
    this.pov.lock();
  }

  // AU phase runs when the camera has been orbited into place and is ready to travel
  startAU() {
    this.phase = 'au';
  }
}

export default Core;
