import * as THREE from 'three';
import EventEmitter from 'events';

import _ from '../settings.json';
import { speedCheckpoints } from '../script.json';
import { km2u, u2km, clamp } from './utils';

// user point of view
class POV extends EventEmitter {
  constructor(camera) {
    super();
    this.camera = camera;
    this.camera.rotation.order = 'YXZ';

    // disables camera rotation
    this.locked = false;

    // mouse position - top left is (1, 1), bottom right is (-1, -1)
    this.mouse = new THREE.Vector2();

    // desired camera rotation
    this.target = new THREE.Quaternion();
    this.cameraCorrection = true;

    // temporary quaternion & euler used to rotate camera
    this.tempQ = new THREE.Quaternion();
    this.tempE = new THREE.Euler();

    // velocity in u/s (100,000 km/s)
    this.velocity = new THREE.Vector3();

    this.scrollLocked = true;
    this.scrollStart = null;
    window.addEventListener('wheel', this.onScroll.bind(this));

    document.querySelector('canvas').addEventListener('mousemove', this.onMouseMove.bind(this));
    document.body.addEventListener('mouseleave', () => this.mouse.set(0, 0));

    // mousing over a hud element is equivalent to a mouseleave
    // this is so you dont start rotating fast while trying to click boost for example
    document.querySelectorAll('.overlay__distance, .overlay__speed, .overlay__eta, .overlay__boost').forEach(el => {
      el.addEventListener('mouseover', () => this.mouse.set(0, 0));
    });
  }

  update(ts) {
    // rotate camera to target when mouse vector is cleared
    if (!this.mouse.x && !this.mouse.y && this.cameraCorrection) {
      this.camera.quaternion.slerp(this.target, _.pov.rotationCorrectionSpeed * ts);
    }

    // rotate camera based on mouse position when we're not locked
    if (!this.locked) {
      // rotate from the current orientation
      this.tempQ.set(this.mouse.y * _.pov.rotationSpeed * ts, this.mouse.x * _.pov.rotationSpeed * ts, 0, 1);
      this.camera.quaternion.multiply(this.tempQ.normalize());
      // prevent camera roll
      const euler = this.tempE.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);
      euler.z = 0;

      this.camera.rotation.copy(euler);
    }

    // move with the current velocity
    this.position.z -= this.velocity.z * ts;
  }

  // speed passed as km/s
  setSpeed(speed, override = false) {
    const oldSpeed = u2km(this.velocity.z);
    const s = clamp(speed, _.au.minSpeed, _.au.maxSpeed);
    this.velocity.setZ(km2u(override ? speed : s));

    // check if we just crossed a checkpoint
    const checkpoint = speedCheckpoints.find(cp => {
      const between = (oldSpeed <= cp.at && cp.at <= s) || (s <= cp.at && cp.at <= oldSpeed);
      const different = oldSpeed !== s;
      return between && different;
    });
    if (checkpoint) this.emit('speedCheckpoint', checkpoint);
  }

  onScroll(event) {
    if (this.scrollLocked) return;

    if (!this.scrollStart) this.scrollStart = performance.now();

    // clear and reset the expiration timer
    clearTimeout(this.scrollBoost);
    this.scrollBoost = setTimeout(() => {
      this.scrollStart = null;
    }, _.au.scrollBoostExpiry);

    // scroll delta is the product of how long you've been scrolling and the percentage of the max speed
    const scrollDuration = performance.now() - this.scrollStart;
    const perOfMax = this.velocity.z / km2u(_.au.maxSpeed);
    const delta = scrollDuration * Math.min(perOfMax, 0.5) * 0.1 * -Math.sign(event.deltaY);

    const newSpeed = u2km(this.velocity.z) + delta;
    this.setSpeed(newSpeed);
  }

  lock() {
    this.locked = true;
    this.mouse.set(0, 0);
  }

  unlock() {
    this.locked = false;
  }

  onMouseMove(event) {
    if (this.locked) return;

    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;

    this.mouse.set(-(event.x - halfWidth) / halfWidth, -(event.y - halfHeight) / halfHeight);
  }

  // aliases
  get position() {
    return this.camera.position;
  }
  get rotation() {
    return this.camera.rotation;
  }
}

export default POV;
