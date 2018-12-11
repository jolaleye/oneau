import * as THREE from 'three';

import _ from '../settings.json';

class POV {
  constructor() {
    // when true, disables looking around freely
    this.locked = false;

    this.camera = new THREE.PerspectiveCamera(
      _.camera.fov,
      window.innerWidth / window.innerHeight,
      _.camera.near,
      _.camera.far
    );
    this.camera.rotation.order = 'YXZ';

    // normalized mouse position for rotation
    this.rotationVector = new THREE.Vector3();
    // temporary quaternion to calculate new camera orientation
    this.tmpQuaternion = new THREE.Quaternion();
    // rotation to return to when user yields control
    this.desiredRotation = new THREE.Euler();

    // track mouse movement
    document.body.addEventListener('mousemove', this.onMouseMove.bind(this));

    // yield camera rotation control on mouseleave
    document.body.addEventListener('mouseleave', () => {
      this.rotationVector.set(0, 0, 0);
    });
  }

  update(ts, phase) {
    this.fixCameraOrientation(ts);

    // if we're not locked, rotate based on mouse position stored in the rotationVector
    if (!this.locked) {
      this.tmpQuaternion
        .set(this.rotationVector.x * _.camera.pitchSpeed * ts, this.rotationVector.y * _.camera.yawSpeed * ts, 0, 1)
        .normalize();
      this.camera.quaternion.multiply(this.tmpQuaternion);
      this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);
    }
  }

  lock() {
    // temporarily disable looking around
    this.locked = true;
    this.rotationVector.set(0, 0, 0);
  }

  fixCameraOrientation(ts) {
    // if pitch is 0/falsy but the camera isn't rotated correctly around its x
    const dx = this.camera.rotation.x - this.desiredRotation.x;
    if (!this.rotationVector.x && (dx > _.camera.correctionThreshold || dx < -_.camera.correctionThreshold)) {
      this.camera.rotateX(-dx * _.camera.pitchCorrectionSpeed * ts);
    }

    // if yaw is 0/falsy but the camera isn't rotated correctly around its y
    const dy = this.camera.rotation.y - this.desiredRotation.y;
    if (!this.rotationVector.y && (dy > _.camera.correctionThreshold || dy < -_.camera.correctionThreshold)) {
      this.camera.rotateY(-dy * _.camera.yawCorrectionSpeed * ts);
    }
  }

  onMouseMove(event) {
    if (this.locked) return;

    const halfheight = window.innerHeight / 2;
    const halfwidth = window.innerWidth / 2;

    // top left is -1 pitch -1 yaw, bottom right is 1,1
    const pitch = (event.y - halfheight) / halfheight;
    const yaw = (event.x - halfwidth) / halfwidth;

    // store mouse position for rotation
    this.rotationVector.set(-pitch, -yaw, 0);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}

export default POV;
