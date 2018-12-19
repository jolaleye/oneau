import '@babel/polyfill';
import * as THREE from 'three';

import Core from './core';

// set up the scene and renderer
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();

// set up the canvas
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const core = new Core(scene, renderer);

// handle window resizes
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  core.pov.onResize();
});

const start = async () => {
  await core.load();
  core.init();
  core.startWait();
  core.run();
};

start();

// "focus" when clicked - transition from landing page
document.querySelector('canvas').addEventListener('click', () => {
  document.body.classList.add('focused');
  core.startIntro();
});
