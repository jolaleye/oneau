import * as THREE from 'three';

import _ from '../settings.json';
import { km2u, u2km, clamp } from './utils';

// user point of view
class POV {
  constructor(camera) {
    this.camera = camera;
    this.camera.rotation.order = 'YXZ';

    // disables camera rotation
    this.locked = false;

    // mouse position - top left is (1, 1), bottom right is (-1, -1)
    this.mouse = new THREE.Vector2();

    // desired camera rotation
    this.target = new THREE.Quaternion();
    this.fixCamera = true;

    // temporary quaternion & euler used to rotate camera
    this.tempQ = new THREE.Quaternion();
    this.tempE = new THREE.Euler();

    // velocity in u/s (100,000 km/s)
    this.velocity = new THREE.Vector3();

    this.scrollLocked = true;
    window.addEventListener('wheel', this.onScroll.bind(this));

    document.body.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.body.addEventListener('mouseleave', () => this.mouse.set(0, 0));
  }

  update(ts) {
    // rotate camera to target when mouse vector is cleared
    if (!this.mouse.x && !this.mouse.y && this.fixCamera) {
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
  setSpeed(speed) {
    const s = clamp(speed, _.au.minSpeed, _.au.maxSpeed);
    this.velocity.setZ(km2u(s));
  }

  onScroll(event) {
    if (this.scrollLocked) return;

    const scroll = -event.deltaY;
    const ds = scroll * _.au.scrollSensitivity;

    const newSpeed = u2km(this.velocity.z) + ds;
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
