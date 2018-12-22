import * as THREE from 'three';

import _ from '../settings.json';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(
  _.camera.fov,
  window.innerWidth / window.innerHeight,
  _.camera.near,
  _.camera.far
);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

let lastTick;
const animate = () => {
  requestAnimationFrame(animate);
  // scales speeds to 1 u/s regardless of frame rate
  const ts = (performance.now() - lastTick) / 1000;
  lastTick = performance.now();

  renderer.render(scene, camera);
};

lastTick = performance.now();
animate();
