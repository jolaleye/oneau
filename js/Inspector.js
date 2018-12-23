import * as THREE from 'three';

import _ from '../settings.json';

// controls to fly around the scene
class Inspector {
  constructor(camera) {
    this.camera = camera;
    this.camera.rotation.order = 'YXZ';

    this.moving = { forward: false, back: false };
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.locked = false;
    document.querySelector('canvas').addEventListener('click', () => document.body.requestPointerLock());
    document.addEventListener('pointerlockchange', () => (this.locked = document.pointerLockElement === document.body));

    document.body.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.body.addEventListener('keydown', this.onKeyDown.bind(this));
    document.body.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  update(ts) {
    if (!this.locked) return;

    this.camera.getWorldDirection(this.direction);
    const sign = Number(this.moving.forward) - Number(this.moving.back);
    this.velocity = this.direction.multiplyScalar(_.inspector.speed * sign * ts);

    this.camera.position.add(this.velocity);
  }

  onMouseMove() {
    if (!this.locked) return;

    const dx = event.movementX || 0;
    const dy = event.movementY || 0;

    this.camera.rotation.y -= dx * _.inspector.sensitivity;
    this.camera.rotation.x -= dy * _.inspector.sensitivity;

    const pi2 = Math.PI / 2;
    this.camera.rotation.x = Math.max(-pi2, Math.min(pi2, this.camera.rotation.x));
  }

  onKeyDown(event) {
    if (!this.locked) return;

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        this.moving.forward = true;
        break;
      case 'ArrowDown':
      case 's':
        this.moving.back = true;
        break;
    }
  }

  onKeyUp(event) {
    if (!this.locked) return;

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        this.moving.forward = false;
        break;
      case 'ArrowDown':
      case 's':
        this.moving.back = false;
        break;
    }
  }
}

export default Inspector;
