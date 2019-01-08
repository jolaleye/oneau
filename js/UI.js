import TWEEN from '@tweenjs/tween.js';

class UI {
  constructor() {
    this.overlay = document.querySelector('.overlay');

    // create the distance display
    this.overlay.appendChild(this.createDistanceDisplay());
    this.distance = document.querySelector('.distance span');

    // create the speed display
    this.overlay.appendChild(this.createSpeedDisplay());
    this.speed = document.querySelector('.speed span');

    // create the ETA display
    this.overlay.appendChild(this.createETADisplay());
    this.eta = document.querySelector('.eta span');
  }

  subtitle(text = '', delay = 0, fadeFor = 2000, showFor = 3000, o1 = 0, o2 = 1, customHTML, classes = []) {
    const el = document.createElement('div');
    el.innerHTML = customHTML ? customHTML : `<p>${text}</p>`;
    el.classList.add('subtitle', ...classes);
    el.style.setProperty('opacity', o1);
    this.overlay.appendChild(el);

    const fadeIn = new TWEEN.Tween({ opacity: o1 })
      .to({ opacity: o2 }, fadeFor)
      .easing(TWEEN.Easing.Quintic.In)
      .onUpdate(({ opacity }) => el.style.setProperty('opacity', opacity))
      .delay(delay);
    const fadeOut = new TWEEN.Tween({ opacity: o2 })
      .to({ opacity: o1 }, fadeFor)
      .easing(TWEEN.Easing.Quintic.Out)
      .onUpdate(({ opacity }) => el.style.setProperty('opacity', opacity))
      .delay(showFor);

    return new Promise(resolve => {
      fadeIn.chain(fadeOut).start();
      fadeOut.onComplete(() => {
        this.overlay.removeChild(el);
        resolve();
      });
    });
  }

  updateDistance(distance) {
    // 2 decimals and commas
    this.distance.innerHTML = distance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  updateSpeed(speed) {
    // 2 decimals and commas
    this.speed.innerHTML = speed.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // eta passed in seconds
  updateETA(eta) {
    const hours = Math.floor(eta / 3600).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    const mins = Math.floor((eta % 3600) / 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    const secs = Math.round((eta % 3600) % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    this.eta.innerHTML = `${hours}:${mins}:${secs}`;
  }

  // fade in hud elements
  show(element, o = 0.5) {
    const el = document.querySelector(`.overlay .${element}`);
    el.style.setProperty('display', 'block');
    const fadeIn = new TWEEN.Tween({ opacity: 0 })
      .to({ opacity: o }, 3000)
      .easing(TWEEN.Easing.Quintic.In)
      .onUpdate(({ opacity }) => el.style.setProperty('opacity', opacity))
      .start();
  }

  hideHUD() {
    const distance = document.querySelector('.overlay .distance');
    const speed = document.querySelector('.overlay .speed');
    const boost = document.querySelector('.overlay .boost');
    const eta = document.querySelector('.overlay .eta');
    const fadeOut = new TWEEN.Tween({ opacity: 0.5 })
      .to({ opacity: 0 }, 3000)
      .easing(TWEEN.Easing.Quintic.Out)
      .onUpdate(({ opacity }) => {
        distance.style.setProperty('opacity', opacity);
        speed.style.setProperty('opacity', opacity);
        boost.style.setProperty('opacity', opacity);
        eta.style.setProperty('opacity', opacity);
      })
      .start();
  }

  createDistanceDisplay() {
    const el = document.createElement('p');
    el.classList.add('distance');
    el.innerHTML = '<span>0</span> km from Earth';
    el.style.setProperty('opacity', '0');
    return el;
  }

  createSpeedDisplay() {
    const el = document.createElement('p');
    el.classList.add('speed');
    el.innerHTML = '<span>0</span> km/h';
    el.style.setProperty('opacity', '0');
    return el;
  }

  createETADisplay() {
    const el = document.createElement('p');
    el.classList.add('eta');
    el.innerHTML = `ETA <span>00:00:00</span>`;
    el.style.setProperty('opacity', '0');
    return el;
  }
}

export default UI;
