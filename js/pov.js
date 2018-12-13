import * as THREE from 'three';
import EventEmitter from 'events';

import _ from '../settings.json';

class POV {
  constructor() {
    this.events = new EventEmitter();

    // when true, disables looking around freely
    this.locked = false;

    this.camera = new THREE.PerspectiveCamera(
      _.camera.fov,
      window.innerWidth / window.innerHeight,
      _.camera.near,
      _.camera.far
    );
    this.camera.rotation.order = 'YXZ';

    // normalized mouse position used for rotating camera
    this.orientation = new THREE.Vector3();
    // temporary quaternion to calculate new camera orientation
    this.tmpQuaternion = new THREE.Quaternion();
    // rotation to return to when user yields control
    this.desiredRotation = new THREE.Quaternion();

    // track mouse movement
    document.body.addEventListener('mousemove', this.onMouseMove.bind(this));

    // yield camera rotation control on mouseleave
    document.body.addEventListener('mouseleave', () => {
      this.orientation.set(0, 0, 0);
    });
  }

  update(ts, phase) {
    // fix camera if orientation has been cleared
    if (!this.orientation.x && !this.orientation.y) {
      // use the cinematic correction speed during certain phases
      const correctionSpeed = phase === 'finishingIntro' ? _.camera.cinematicCorrectionSpeed : _.camera.correctionSpeed;
      this.camera.quaternion.slerp(this.desiredRotation, Math.min(correctionSpeed * ts, 1));
    }

    // check the camera's rotation progress while we're nearing the end of the intro phase
    if (phase === 'finishingIntro' && this.camera.rotation.x < 0.05) this.events.emit('introDone');

    // if we're not locked, rotate based on mouse position stored in orientation
    if (!this.locked) {
      // use a slower camera rotation speed at times
      const rotationSpeed = phase === 'wait' ? _.camera.slowRotationSpeed : _.camera.rotationSpeed;
      this.tmpQuaternion
        .set(this.orientation.x * rotationSpeed * ts, this.orientation.y * rotationSpeed * ts, 0, 1)
        .normalize();
      this.camera.quaternion.multiply(this.tmpQuaternion);
      this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);
    }
  }

  lock() {
    // temporarily disable looking around
    this.locked = true;
    this.orientation.set(0, 0, 0);
  }

  onMouseMove(event) {
    if (this.locked) return;

    const halfheight = window.innerHeight / 2;
    const halfwidth = window.innerWidth / 2;

    // top left is 1 pitch, 1 yaw; bottom right is -1,-1
    const pitch = -(event.y - halfheight) / halfheight;
    const yaw = -(event.x - halfwidth) / halfwidth;

    // store mouse position for rotation
    this.orientation.set(pitch, yaw, 0);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}

export default POV;
