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
    this.desiredRotation = new THREE.Quaternion();

    // track mouse movement
    document.body.addEventListener('mousemove', this.onMouseMove.bind(this));

    // yield camera rotation control on mouseleave
    document.body.addEventListener('mouseleave', () => {
      this.rotationVector.set(0, 0, 0);
    });
  }

  update(ts, phase) {
    // fix camera orientation if the rotationVector has been cleared
    if (!this.rotationVector.x && !this.rotationVector.y) {
      this.camera.quaternion.slerp(this.desiredRotation, _.camera.correctionSpeed * ts);
    }

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
