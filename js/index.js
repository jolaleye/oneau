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

let textures;
let director;
let pov;
let galaxy;
let sun;
let earth;

let lastTick;
const animate = () => {
  requestAnimationFrame(animate);
  // scales speeds to 1 u/s regardless of frame rate
  const ts = (performance.now() - lastTick) / 1000;
  lastTick = performance.now();

  TWEEN.update();
  sun.update();
  pov.update(ts);
  director.update();

  renderer.render(scene, camera);
};

const init = () => {
  pov = new POV(camera);

  galaxy = new Galaxy(textures);

  textures.sun.anisotropy = renderer.capabilities.getMaxAnisotropy();
  sun = new Sun(textures);

  earth = new Earth(textures);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);

  scene.add(galaxy, sun, earth, ambientLight);

  director = new Director(pov, sun, earth);
  director.preWait();

  lastTick = performance.now();
  animate();

  // remove the placeholder image after the animation loop starts
  const placeholder = document.querySelector('.loading .img');
  const placeholderFadeOut = new TWEEN.Tween({ opacity: 1, blur: _.load.blur })
    .to({ opacity: 0, blur: 0 }, _.load.fadeOut)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(({ opacity, blur }) => {
      placeholder.style.setProperty('opacity', opacity);
      placeholder.style.setProperty('filter', `blur(${blur}px)`);
    })
    .onComplete(() => {
      director.startWait();
      document.querySelector('.spinner').style.setProperty('display', 'none');
      document.querySelector('.pulse').style.setProperty('display', 'block');
    })
    .start();
};

window.onload = () => {
  const loader = new Loader();
  loader.loadTextures().then(() => {
    textures = loader.textures;
    init();
  });
};
