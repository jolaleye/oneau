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

    // rotation to return to when user yields control (e.g. mouseleave)
    this.desiredRotation = new THREE.Euler();

    // yaw & pitch based on mouse position
    this.yaw = 0;
    this.pitch = 0;

    // track mouse movement
    document.body.addEventListener('mousemove', this.onMouseMove.bind(this));

    // look at the sun when the mouse leaves the screen
    document.body.addEventListener('mouseleave', () => {
      this.yaw = 0;
      this.pitch = 0;
    });
  }

  update(ts) {
    // if yaw is 0/falsy but the camera isn't rotated correctly around its y
    const y0 = this.camera.rotation.y - this.desiredRotation.y;
    if (!this.yaw && (y0 > _.camera.correctionThreshold || y0 < -_.camera.correctionThreshold)) {
      this.camera.rotateY(-y0 * _.camera.yawCorrectionSpeed * ts);
    }

    // if pitch is 0/falsy but the camera isn't rotated correctly around its x
    const x0 = this.camera.rotation.x - this.desiredRotation.x;
    if (!this.pitch && (x0 > _.camera.correctionThreshold || x0 < -_.camera.correctionThreshold)) {
      this.camera.rotateX(-x0 * _.camera.pitchCorrectionSpeed * ts);
    }

    // keep roll at whatever it should be (0)
    this.camera.rotation.z = this.desiredRotation.z;

    // if we're not locked, rotate based on mouse movement
    if (!this.locked) {
      this.camera.rotateY(-this.yaw * _.camera.yawSpeed * ts);
      this.camera.rotateX(-this.pitch * _.camera.pitchSpeed * ts);
    }
  }

  lock() {
    // temporarily disable looking around
    this.locked = true;
    this.yaw = 0;
    this.pitch = 0;
  }

  enterOrbit() {
    // adjust position & rotation for Earth orbit
    this.camera.position.set(0, _.earth.orbitHeight, 0);
    this.camera.rotation.set(0, -Math.PI / 2, 0);
    this.desiredRotation.set(0, -Math.PI / 2, 0);
  }

  exitOrbit() {
    // adjust position & rotation for camera independence
    this.camera.position.set(0, 0, _.earth.sunOrbitRadius - _.earth.radius - _.earth.orbitHeight);
    this.camera.rotation.set(0, 0, 0);
    this.desiredRotation.set(0, 0, 0);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  onMouseMove(event) {
    const halfwidth = window.innerWidth / 2;
    const halfheight = window.innerHeight / 2;

    // top left is -1 yaw -1 pitch, bottom right is 1,1
    this.yaw = (event.x - halfwidth) / halfwidth;
    this.pitch = (event.y - halfheight) / halfheight;
  }
}

export default POV;
