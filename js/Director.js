import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { Howl } from 'howler';

import _ from '../settings.json';
import script from '../script.json';
import { km2u, u2km } from './utils';
import UI from './UI';
import musicWebm from '../audio/music.webm';
import musicMp3 from '../audio/music.mp3';

const music = new Howl({
  src: [musicWebm, musicMp3],
  loop: true,
  volume: 0,
  rate: _.music.rate
});

// coordinates phases and flow
class Director {
  constructor(pov, sun, earth) {
    this.pov = pov;
    this.sun = sun;
    this.earth = earth;
    this.ui = new UI();
    this.updating = { distance: false, speed: false, eta: false };

    // initial setup
    this.earth.leo.add(this.pov.camera);
    this.pov.position.z = km2u(_.wait.orbitRadius);
    this.pov.lock();

    this.pov.on('speedCheckpoint', async checkpoint => {
      if (!this.traveling) return;
      for (const line of checkpoint.subs) {
        await this.ui.subtitle(line.text, line.delay, line.fadeFor, line.showFor, 0, 0.8, ['speed-sub']);
      }
    });
  }

  async update() {
    // check distance from Sun
    if (this.traveling && this.pov.position.z <= km2u(_.sol.slowAt)) {
      this.traveling = false;
      this.startSol();
    }

    const distanceFromEarth = this.earth.position.z - this.pov.position.z;
    const currentSpeed = this.pov.velocity.z;

    // check checkpoints
    if (this.traveling && script.checkpoints.length && distanceFromEarth >= km2u(script.checkpoints[0].at)) {
      const checkpoint = script.checkpoints.shift();
      for (const line of checkpoint.subs) {
        await this.ui.subtitle(line.text, line.delay, line.fadeFor, line.showFor, 0, 0.8, ['checkpoint']);
      }
    }

    if (!(this.updating.distance || this.updating.speed || this.updating.eta)) return;

    if (this.updating.distance) this.ui.updateDistance(distanceFromEarth);
    if (this.updating.speed) this.ui.updateSpeed(currentSpeed);
    if (this.updating.eta) this.ui.updateETA((this.pov.position.z - km2u(_.sol.slowAt)) / currentSpeed);
  }

  // WAIT phase
  // - camera orbits Earth continuously
  startWait() {
    // turn Earth's orbit
    const orbit = new TWEEN.Tween(this.earth.leo.rotation)
      .to({ x: 0, y: 2 * Math.PI, z: 0 }, _.wait.orbitPeriod)
      .repeat(Infinity)
      .start();

    // fade out landing, stop orbiting, and start intro on pulse click
    document.querySelector('.landing__pulse').addEventListener('click', () => {
      const els = [document.querySelector('.landing'), document.querySelector('.info-trigger')];
      this.ui
        .fade(els, 1, 0, 1000)
        .onComplete(() => {
          for (const el of els) el.style.setProperty('display', 'none');
        })
        .start();

      orbit.stop();
      this.startIntro();

      // start the music silently and increase to low volume
      music.play();
      const volumeUp = new TWEEN.Tween({ v: 0 })
        .to({ v: _.music.lowVolume }, _.music.increaseOver)
        .onUpdate(({ v }) => music.volume(v))
        .start();
    });
  }

  // INTRO phase
  // - camera moves into position between Earth & Sun
  async startIntro() {
    this.pov.cameraCorrection = false;
    // amount to rotate
    const diff = 2 * Math.PI - ((this.earth.leo.rotation.y + Math.PI) % (2 * Math.PI));

    const orbit = new TWEEN.Tween({ y: this.earth.leo.rotation.y })
      .to({ y: `+${diff}` }, _.intro.orbitDuration)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(({ y }) => (this.earth.leo.rotation.y = y))
      .onComplete(() => this.sun.toggleLensflare(false));

    const cameraTurn = new TWEEN.Tween({ y: this.pov.camera.rotation.y })
      .to({ y: -Math.PI }, _.intro.cameraTurnDuration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(({ y }) => (this.pov.camera.rotation.y = y))
      .onComplete(() => this.pov.target.setFromEuler(new THREE.Euler(0, -Math.PI, 0)));

    // move the orbit into place and turn the camera to the sun
    orbit.chain(cameraTurn).start();

    // intro lines
    for (const line of script.intro) await this.ui.subtitle(line.text, line.delay, line.fadeFor, line.showFor, 0, 0.8);
    // title card
    await this.ui.subtitle('', 1500, 3000, 4000, 0, 1, ['intro-title'], '<span>ONE</span><span>AU</span>');

    this.startInstructions();
  }

  // INSTRUCTIONS phase
  // - hud appears, prep for travel
  async startInstructions() {
    this.updating.distance = true;
    this.updating.speed = true;
    this.updating.eta = true;

    // remove the pov from earth orbit and reset
    this.earth.leo.remove(this.pov.camera);
    this.pov.position.set(0, 0, km2u(_.earth.orbitRadius - _.wait.orbitRadius));
    this.pov.target.setFromEuler(new THREE.Euler(0, 0, 0));
    this.pov.rotation.set(0, 0, 0);
    this.pov.cameraCorrection = true;

    // add the distance display
    this.ui.fade([document.querySelector(`.overlay__distance`)], 0, 0.5, 3000).start();
    document.querySelector(`.overlay__distance`).style.setProperty('display', 'flex');

    // instruction lines
    for (let i = 0; i < script.instructions.length; i++) {
      const line = script.instructions[i];
      await this.ui.subtitle(line.text, line.delay, line.fadeFor, line.showFor, 0, 0.8);

      // actions follow some lines
      switch (i) {
        case 1:
          this.pov.setSpeed(0.124167);
          this.ui.fade([document.querySelector(`.overlay__speed`)], 0, 0.5, 3000).start();
          break;
        case 4:
          this.pov.unlock();
          break;
        case 5:
          this.pov.scrollLocked = false;
          break;
      }
    }

    this.startAU();
  }

  // AU phase
  // - user travels towards the sun
  startAU() {
    this.traveling = true;
    // add the eta display and boost button
    this.ui.fade([document.querySelector(`.overlay__eta`)], 0, 0.3, 3000).start();
    this.ui.fade([document.querySelector(`.overlay__boost`)], 0, 0.5, 3000).start();
    document.querySelector('.overlay__boost').addEventListener('click', async () => {
      if (document.querySelector('.overlay .speed-sub') || !this.traveling) return;

      this.pov.setSpeed(_.boostSpeed, true);

      const sub1 = "You're now moving at about three times the speed of light.";
      const sub2 = "This really isn't possible, but for the sake of speeding things up a bit we'll ignore that.";
      await this.ui.subtitle(sub1, 0, 1000, 4000, 0, 0.6, ['speed-sub']);
      this.ui.subtitle(sub2, 0, 1000, 4000, 0, 0.6, ['speed-sub']);
    });

    // increase music volume
    const volumeUp = new TWEEN.Tween({ v: _.music.lowVolume })
      .to({ v: _.music.normalVolume }, _.music.increaseOver)
      .onUpdate(({ v }) => music.volume(v))
      .start();
  }

  // SOL phase
  // - cinematic sun scene to conclude
  async startSol() {
    this.updating.distance = false;
    this.updating.speed = false;
    this.updating.eta = false;

    this.pov.scrollLocked = true;
    this.pov.lock();
    this.pov.setSpeed(0);

    // add pov to the Sun's orbit
    this.sun.orbit.add(this.pov.camera);
    this.pov.position.set(0, 0, km2u(_.sol.slowAt));

    const drift = new TWEEN.Tween({ z: this.pov.position.z })
      .to({ z: km2u(_.sol.stopAt) }, _.sol.driftDuration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(({ z }) => this.pov.position.setZ(z));

    const orbit = new TWEEN.Tween({ y: this.sun.orbit.rotation.y })
      .to({ y: 2 * Math.PI }, _.sol.orbitPeriod)
      .onUpdate(({ y }) => {
        this.sun.orbit.rotation.y = y;
        this.sun.corona.rotation.y = y;
      })
      .repeat(Infinity);

    // drift towards the sun then orbit
    drift.chain(orbit).start();

    // fade out the ui
    this.ui
      .fade(document.querySelectorAll(`.overlay__distance, .overlay__speed, .overlay__boost`), 0.5, 0, 3000)
      .start();
    this.ui.fade([document.querySelector(`.overlay__eta`)], 0.3, 0, 3000).start();

    // sol lines
    await this.ui.subtitle('', 3000, 4000, 4000, 0, 1, ['sol-title'], '<span>THE</span><span>SUN</span>');
    for (const line of script.sol) {
      await this.ui.subtitle(line.text, line.delay, line.fadeFor, line.showFor, 0, 0.8, ['black']);
    }

    // ending title card
    this.ui.fade([document.querySelector('.overlay__end')], 0, 1, 5000).start();
  }
}

export default Director;
