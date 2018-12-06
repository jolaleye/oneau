// helper class to fly around the scene
import * as THREE from 'three';

class Inspector {
  constructor(camera) {
    this.camera = camera;
    this.camera.rotation.set(0, 0, 0);
    this.locked = false;

    this.pitch = new THREE.Object3D();
    this.pitch.add(this.camera);

    this.yaw = new THREE.Object3D();
    this.yaw.add(this.pitch);

    this.speed = 10;
    this.moving = { forward: false, back: false };
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
  }

  init() {
    document.addEventListener('pointerlockchange', () => (this.locked = document.pointerLockElement === document.body));
    document.querySelector('canvas').addEventListener('click', () => document.body.requestPointerLock());
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  update(ts) {
    if (!this.locked) return;
    if (!(this.moving.forward || this.moving.back)) return;

    this.camera.getWorldDirection(this.direction);
    const backOrForth = Number(this.moving.forward) - Number(this.moving.back);
    this.velocity = this.direction.multiplyScalar(this.speed * backOrForth * ts);

    this.yaw.position.add(this.velocity);
  }

  onMouseMove(event) {
    if (!this.locked) return;

    const dx = event.movementX || 0;
    const dy = event.movementY || 0;

    this.yaw.rotation.y -= dx * 0.002;
    this.pitch.rotation.x -= dy * 0.002;

    const pi2 = Math.PI / 2;
    this.pitch.rotation.x = Math.max(-pi2, Math.min(pi2, this.pitch.rotation.x));
  }

  onKeyDown(event) {
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
