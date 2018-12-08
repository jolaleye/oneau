import * as THREE from 'three';

import _ from '../settings.json';

class POV {
  constructor() {
    this.locked = false;

    this.camera = new THREE.PerspectiveCamera(
      _.camera.fov,
      window.innerWidth / window.innerHeight,
      _.camera.near,
      _.camera.far
    );

    this.camera.rotation.order = 'YXZ';
    // place camera just in front of Earth
    this.camera.position.z = _.earth.orbit - _.earth.radius * 1.5;

    // yaw & pitch based on mouse position
    this.yaw = 0;
    this.pitch = 0;

    // track mouse movement
    document.addEventListener('mousemove', this.onMouseMove.bind(this));

    // look at the sun when the mouse leaves the screen
    document.body.addEventListener('mouseleave', () => {
      this.yaw = 0;
      this.pitch = 0;
    });
  }

  update(ts) {
    // if yaw is 0/falsy but the camera isn't centered about its y axis
    if (!this.yaw && (this.camera.rotation.y > 0.001 || this.camera.rotation.y < -0.001)) {
      this.camera.rotateY(-this.camera.rotation.y * _.camera.yawCorrectionSpeed * ts);
    }

    // if pitch is 0/falsy but the camera isn't centered about its x axis
    if (!this.pitch && (this.camera.rotation.x > 0.001 || this.camera.rotation.x < -0.001)) {
      this.camera.rotateX(-this.camera.rotation.x * _.camera.pitchCorrectionSpeed * ts);
    }

    // rotate towards the mouse *note: this won't happen if the above happens b/c pitch/yaw are 0
    this.camera.rotateY(-this.yaw * _.camera.yawSpeed * ts);
    this.camera.rotateX(-this.pitch * _.camera.pitchSpeed * ts);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  onMouseMove(event) {
    if (!this.locked) return;

    const halfwidth = window.innerWidth / 2;
    const halfheight = window.innerHeight / 2;

    // top left is -1 yaw -1 pitch, bottom right is 1,1
    this.yaw = (event.x - halfwidth) / halfwidth;
    this.pitch = (event.y - halfheight) / halfheight;
  }
}

export default POV;
