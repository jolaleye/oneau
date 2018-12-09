import * as THREE from 'three';

import _ from '../settings.json'; // 1 unit(u) = 1,000,000km, speeds in u/s
import POV from './pov';
import MilkyWay from './milkyway';
import Sun from './sun';
import Earth from './earth';

// set up the scene and renderer
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

const pov = new POV();

const milkyway = new MilkyWay();
const sun = new Sun();
const earth = new Earth();

earth.orbit.add(pov.camera);
pov.enterOrbit();

scene.add(milkyway, sun, earth);

// set up the canvas
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// handle window resizes
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  pov.onResize();
});

// "focus" when clicked - transition from landing page
document.querySelector('canvas').addEventListener('click', () => {
  document.body.classList.add('focused');
  pov.lock();
});

// animation loop
let lastTick = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const timestep = performance.now() - lastTick;
  const ts = timestep / 1000; // scales speeds to be 1 u/s regardless of frame rate
  lastTick = performance.now();

  pov.update(ts);
  earth.update(ts);

  renderer.render(scene, pov.camera);
}

animate();
