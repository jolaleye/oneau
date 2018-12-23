import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import _ from '../settings.json'; // 1 u = 100,000 km (10^-5)
import POV from './POV';
import Sun from './Sun';
import Earth from './Earth';
import Director from './Director';
import TextureManager from './TextureManager';

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

const textures = new TextureManager();
textures.load();

const pov = new POV(camera);
const sun = new Sun();
const earth = new Earth({
  map: textures.earth,
  elev: textures.earthElev,
  water: textures.earthWater,
  clouds: textures.earthClouds
});
scene.add(sun, earth);

scene.add(new THREE.AmbientLight(0xffffff, 0.1));

const director = new Director(pov, earth);
director.startWait();

let lastTick;
const animate = () => {
  requestAnimationFrame(animate);
  // scales speeds to 1 u/s regardless of frame rate
  const ts = (performance.now() - lastTick) / 1000;
  lastTick = performance.now();

  TWEEN.update();

  pov.update(ts);

  renderer.render(scene, camera);
};

lastTick = performance.now();
animate();
