import * as THREE from 'three';
import EventEmitter from 'events';

import _ from '../settings.json';

class Earth extends THREE.Mesh {
  constructor() {
    super(
      new THREE.SphereBufferGeometry(_.earth.radius, _.earth.segments, _.earth.segments),
      new THREE.MeshBasicMaterial({ color: '#62A9FF' })
    );

    this.events = new EventEmitter();

    this.position.z = _.earth.orbitRadius;

    // create an orbit object
    this.orbit = new THREE.Group();
    this.orbit.rotateX(-Math.PI / 4);
    this.add(this.orbit);

    // const ball = new THREE.Mesh(new THREE.SphereBufferGeometry(0.0005, 20, 20), new THREE.MeshBasicMaterial());
    // ball.position.z = _.earth.orbitalHeight;
    // ball.add(new THREE.AxesHelper(0.003));
    // this.orbit.add(ball);
  }

  update(ts, phase) {
    // rotate the orbit at the usual speed while in the wait phase
    if (phase === 'wait') this.orbit.rotateX(-_.earth.orbitalSpeed * ts);

    // while in the intro phase, rotate the orbit so that the camera is between the Earth & Sun
    if (phase === 'intro' || phase === 'finishingIntro') {
      // radians left to rotate until the camera is in position
      const rotationLeft = this.orbit.rotation.x + Math.PI;

      // if the rotation remaining is insignificant, just stop
      if (rotationLeft < 0.01) return this.events.emit('introDone');

      // if the rotation remaining is almost none, tell the camera to rotate
      if (rotationLeft < 0.1) this.events.emit('introAlmostDone');

      const speed = Math.max(
        rotationLeft * _.earth.orbitalSpeedIntro,
        rotationLeft > 0.075 ? _.earth.slowOrbitalSpeedIntro : _.earth.slowestOrbitalSpeedIntro
      );

      this.orbit.rotateX(-speed * ts);
    }
  }
}

export default Earth;
