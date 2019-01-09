import '@babel/polyfill';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import _ from '../settings.json'; // 1 u = 100,000 km (10^-5)
import POV from './POV';
import Galaxy from './Galaxy';
import Sun from './Sun';
import Earth from './Earth';
import Director from './Director';
import Loader from './Loader';

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

let textures, director, pov, galaxy, sun, earth;

window.onload = () => {
  const loader = new Loader();
  loader.loadTextures().then(() => {
    textures = loader.textures;
    init();
  });
};

function init() {
  pov = new POV(camera);

  galaxy = new Galaxy(textures);

  textures.sun.anisotropy = renderer.capabilities.getMaxAnisotropy();
  sun = new Sun(textures);

  earth = new Earth(textures);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);

  scene.add(galaxy, sun, earth, ambientLight);

  director = new Director(pov, sun, earth);

  lastTick = performance.now();
  animate();

  // remove the loading div when ready
  const loadingImg = document.querySelector('.loading__img');
  const fadeOut = new TWEEN.Tween({ opacity: 1, blur: 5 })
    .to({ opacity: 0, blur: 0 }, 1500)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(({ opacity, blur }) => {
      loadingImg.style.setProperty('opacity', opacity);
      loadingImg.style.setProperty('filter', `blur(${blur}px)`);
    })
    .onComplete(() => {
      document.querySelector('.loading').style.setProperty('display', 'none');
      document.querySelector('.landing__pulse').style.setProperty('display', 'block');
      director.startWait();
    })
    .start();
}

let lastTick;
function animate() {
  requestAnimationFrame(animate);
  // scales speeds to 1 u/s regardless of frame rate
  const ts = (performance.now() - lastTick) / 1000;
  lastTick = performance.now();

  TWEEN.update();
  sun.update();
  pov.update(ts);
  director.update();

  renderer.render(scene, camera);
}
