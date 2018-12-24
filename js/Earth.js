import * as THREE from 'three';

import _ from '../settings.json';

class Earth extends THREE.Mesh {
  constructor(textures) {
    const sphere = new THREE.SphereBufferGeometry(_.earth.radius, _.earth.segments, _.earth.segments);

    super(
      sphere.clone(),
      new THREE.MeshPhongMaterial({
        map: textures.map,
        bumpMap: textures.elev,
        bumpScale: 0.001,
        specularMap: textures.water
      })
    );

    // add a sphere of clouds
    const clouds = new THREE.Mesh(
      sphere.clone(),
      new THREE.MeshPhongMaterial({ map: textures.clouds, transparent: true })
    );

    // low earth orbit
    this.leo = new THREE.Group();

    this.add(clouds, this.leo);
    this.position.z = _.earth.orbitRadius;
  }
}

export default Earth;
