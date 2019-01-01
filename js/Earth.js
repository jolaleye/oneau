import * as THREE from 'three';

import _ from '../settings.json';

class Earth extends THREE.Mesh {
  constructor(textures) {
    const sphere = new THREE.SphereBufferGeometry(_.earth.radius, _.earth.segments, _.earth.segments);

    // turn the textures a bit for subtitle positioning/readability
    textures.earth.wrapS = THREE.RepeatWrapping;
    textures.earth.offset.x = -Math.PI / 6 / (2 * Math.PI);
    textures.earthClouds.wrapS = THREE.RepeatWrapping;
    textures.earthClouds.offset.x = Math.PI / 6 / (2 * Math.PI);

    super(
      sphere.clone(),
      new THREE.MeshPhongMaterial({
        map: textures.earth,
        bumpMap: textures.earthElev,
        bumpScale: 0.001,
        specularMap: textures.earthWater
      })
    );

    // add a sphere of clouds
    const clouds = new THREE.Mesh(
      sphere.clone(),
      new THREE.MeshPhongMaterial({ map: textures.earthClouds, transparent: true })
    );

    // low earth orbit
    this.leo = new THREE.Group();

    this.add(clouds, this.leo);
    this.position.z = _.earth.orbitRadius;
  }
}

export default Earth;
