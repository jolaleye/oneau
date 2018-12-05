import * as THREE from 'three';

class Sun extends THREE.Mesh {
  constructor() {
    // pass a geometry and material to the parent Mesh class
    super(new THREE.SphereBufferGeometry(10, 20, 20), new THREE.MeshBasicMaterial({ color: '#FFBF62' }));
  }
}

export default Sun;
