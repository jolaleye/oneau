import TWEEN from '@tweenjs/tween.js';

import _ from '../settings.json';
import { u2km, u2mi, u2people, u2bananas, u2ggb, u2gw } from './utils';

class UI {
  constructor() {
    this.overlay = document.querySelector('.overlay');
    this.distance = document.querySelector('.overlay__distance > p > span');
    this.speed = document.querySelector('.overlay__speed span');
    this.eta = document.querySelector('.overlay__eta span');

    this.unit = 'km';
    // unit selection
    document.querySelector('.unit-arrow').addEventListener('click', () => {
      const unitSelect = document.querySelector('.unit-selection');
      const toggleTo = unitSelect.style.display === 'none' ? 'initial' : 'none';
      unitSelect.style.setProperty('display', toggleTo);
    });

    for (const option of document.querySelector('.unit-selection ul').children) {
      option.addEventListener('click', () => {
        const { unit } = option.dataset;
        this.unit = unit;
        for (const el of document.querySelectorAll('.unit')) el.innerHTML = unit;
      });
    }
  }

  fade(els = [], o1 = 0, o2 = 1, duration = 3000) {
    for (const el of els) el.style.setProperty('display', 'initial');
    const tween = new TWEEN.Tween({ o: o1 })
      .to({ o: o2 }, duration)
      .easing(TWEEN.Easing.Quadratic[o2 > o1 ? 'In' : 'Out'])
      .onUpdate(({ o }) => {
        for (const el of els) el.style.setProperty('opacity', o);
      });
    return tween;
  }

  async subtitle(text = '', delay = 0, fadeFor = 2000, showFor = 3000, o1 = 0, o2 = 1, classes = [], html) {
    // check if a checkpoint subtitle is already present and needs to be overwritten
    const previousSub = document.querySelector('.overlay__subtitle.checkpoint');
    if (previousSub && classes.includes('checkpoint')) {
      previousSub.tweenIn.stop();
      previousSub.tweenOut.stop();
      await new Promise(resolve => {
        this.fade([previousSub], previousSub.style.opacity, 0, 500)
          .onComplete(() => {
            this.overlay.removeChild(previousSub);
            resolve();
          })
          .start();
      });
    }

    const el = document.createElement('div');
    el.classList.add('overlay__subtitle', ...classes);
    el.innerHTML = html ? html : `<p>${text}</p>`;
    el.style.setProperty('opacity', o1);
    this.overlay.appendChild(el);

    return new Promise(resolve => {
      el.tweenIn = this.fade([el], o1, o2, fadeFor).delay(delay);
      el.tweenOut = this.fade([el], o2, o1, fadeFor)
        .delay(showFor)
        .onComplete(() => {
          this.overlay.removeChild(el);
          resolve();
        });
      el.tweenIn.chain(el.tweenOut).start();
    });
  }

  updateDistance(distance) {
    let converted = this.toCurrentUnit(distance);
    this.distance.innerHTML = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  updateSpeed(speed) {
    const converted = this.toCurrentUnit(speed);
    const perHr = converted * 3600;
    this.speed.innerHTML = perHr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // eta in seconds
  updateETA(eta) {
    const hours = Math.floor(eta / 3600).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    const mins = Math.floor((eta % 3600) / 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    const secs = Math.floor((eta % 3600) % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    this.eta.innerHTML = `${hours}:${mins}:${secs}`;
  }

  toCurrentUnit(value) {
    switch (this.unit) {
      case 'km':
        return u2km(value);
      case 'mi':
        return u2mi(value);
      case 'people':
        return u2people(value);
      case 'bananas':
        return u2bananas(value);
      case 'Golden Gate Bridges':
        return u2ggb(value);
      case 'Great Walls of China':
        return u2gw(value);
      default:
        return u2km(value);
    }
  }
}

export default UI;
