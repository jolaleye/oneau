import * as THREE from 'three';

import _ from '../settings.json';

class Earth extends THREE.Mesh {
  constructor(textures) {
    super(
      new THREE.SphereBufferGeometry(_.earth.radius, _.earth.segments, _.earth.segments),
      new THREE.MeshPhongMaterial({
        map: textures.map,
        bumpMap: textures.elev,
        bumpScale: 0.001,
        specularMap: textures.water
      })
    );

    // add a sphere of clouds
    this.add(
      new THREE.Mesh(
        new THREE.SphereBufferGeometry(_.earth.radius, _.earth.segments, _.earth.segments),
        new THREE.MeshPhongMaterial({ map: textures.clouds, transparent: true })
      )
    );

    this.position.z = _.earth.orbitRadius;

    // low earth orbit
    this.leo = new THREE.Group();
    this.add(this.leo);
  }
}

export default Earth;
