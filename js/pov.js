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

  update(ts, phase, phaseData) {
    // camera corrections
    this.fixYaw(ts);
    this.camera.rotation.z = this.desiredRotation.z;
    if (phase === 'intro') {
      // while in the intro phase, rotate against the orbit
      this.camera.rotateX(phaseData.orbitSpeed * ts);
    } else {
      this.fixPitch(ts);
    }

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

  fixYaw(ts) {
    // if yaw is 0/falsy but the camera isn't rotated correctly around its y
    const dy = this.camera.rotation.y - this.desiredRotation.y;
    if (!this.yaw && (dy > _.camera.correctionThreshold || dy < -_.camera.correctionThreshold)) {
      this.camera.rotateY(-dy * _.camera.yawCorrectionSpeed * ts);
    }
  }

  fixPitch(ts) {
    // if pitch is 0/falsy but the camera isn't rotated correctly around its x
    const dx = this.camera.rotation.x - this.desiredRotation.x;
    if (!this.pitch && (dx > _.camera.correctionThreshold || dx < -_.camera.correctionThreshold)) {
      this.camera.rotateX(-dx * _.camera.pitchCorrectionSpeed * ts);
    }
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
