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
  }

  subtitle(text = '', delay = 0, fadeFor = 2000, showFor = 3000, o1 = 0, o2 = 1, customHTML, classes = []) {
    const el = document.createElement('div');
    el.innerHTML = customHTML ? customHTML : `<p>${text}</p>`;
    el.classList.add('subtitle', ...classes);
    el.style.setProperty('opacity', o1);
    this.overlay.appendChild(el);

    const fadeIn = new TWEEN.Tween({ opacity: o1 })
      .to({ opacity: o2 }, fadeFor)
      .easing(TWEEN.Easing.Quintic.Out)
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

  // fade in the distance or speed display
  show(element) {
    const el = document.querySelector(`.overlay .${element}`);
    const fadeIn = new TWEEN.Tween({ opacity: 0 })
      .to({ opacity: 0.5 }, 3000)
      .easing(TWEEN.Easing.Quintic.Out)
      .onUpdate(({ opacity }) => el.style.setProperty('opacity', opacity))
      .start();
  }

  createDistanceDisplay() {
    const el = document.createElement('p');
    el.classList.add('distance');
    el.innerHTML = '<span></span> km from Earth';
    el.style.setProperty('opacity', '0');
    return el;
  }

  createSpeedDisplay() {
    const el = document.createElement('p');
    el.classList.add('speed');
    el.innerHTML = '<span></span> km/h';
    el.style.setProperty('opacity', '0');
    return el;
  }
}

export default UI;
