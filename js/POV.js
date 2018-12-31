import * as THREE from 'three';

import _ from '../settings.json';

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

  // position alias
  get position() {
    return this.camera.position;
  }
}

export default POV;
