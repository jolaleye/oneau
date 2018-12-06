import * as THREE from 'three';

import POV from './pov';

// create a new POV
const pov = new POV();

// set up the scene and renderer
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

// set up the canvas
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// handle window resizes
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  pov.onResize();
});

// animation loop
let lastTick = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const timestep = performance.now() - lastTick;
  const ts = timestep / 1000; // scales speeds to be 1 unit/second regardless of frame rate
  lastTick = performance.now();

  renderer.render(scene, pov.camera);
}

animate();
