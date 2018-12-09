import * as THREE from 'three';

import _ from '../settings.json';

class Earth extends THREE.Mesh {
  constructor() {
    super(
      new THREE.SphereBufferGeometry(_.earth.radius, _.earth.segments, _.earth.segments),
      new THREE.MeshBasicMaterial({ color: '#62A9FF' })
    );

    this.position.z = _.earth.sunOrbitRadius;

    // create an orbit around Earth
    this.orbit = new THREE.Group();
    this.add(this.orbit);
    this.orbit.rotateY(Math.PI / 2);
    this.orbit.rotateZ(Math.PI / 8);

    // orbit visualization
    // const orbitPath = new THREE.Line(
    //   new THREE.CircleBufferGeometry(_.earth.radius * 1.75, 12),
    //   new THREE.LineBasicMaterial({ transparent: true, opacity: 0.25 })
    // );
    // const orbitAxes = new THREE.AxesHelper(0.003);
    // orbitAxes.position.y = _.earth.radius * 1.75;
    // this.orbit.add(orbitPath, orbitAxes);
  }

  update(ts) {
    this.orbit.rotateZ(-_.earth.orbitSpeed * ts);
  }
}

export default Earth;
