import TWEEN from '@tweenjs/tween.js';

class UI {
  constructor() {
    this.overlay = document.querySelector('.overlay');
    this.distance = document.querySelector('.overlay__distance span');
    this.speed = document.querySelector('.overlay__speed span');
    this.eta = document.querySelector('.overlay__eta span');
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

  subtitle(text = '', delay = 0, fadeFor = 2000, showFor = 3000, o1 = 0, o2 = 1, classes = [], html) {
    const el = document.createElement('div');
    el.classList.add('overlay__subtitle', ...classes);
    el.innerHTML = html ? html : `<p>${text}</p>`;
    el.style.setProperty('opacity', o1);
    this.overlay.appendChild(el);

    return new Promise(resolve => {
      const fadeIn = this.fade([el], o1, o2, fadeFor).delay(delay);
      const fadeOut = this.fade([el], o2, o1, fadeFor)
        .delay(showFor)
        .onComplete(() => {
          this.overlay.removeChild(el);
          resolve();
        });
      fadeIn.chain(fadeOut).start();
    });
  }

  updateDistance(distance) {
    this.distance.innerHTML = distance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  updateSpeed(speed) {
    this.speed.innerHTML = speed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // eta in seconds
  updateETA(eta) {
    const hours = Math.floor(eta / 3600).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    const mins = Math.floor((eta % 3600) / 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    const secs = Math.round((eta % 3600) % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    this.eta.innerHTML = `${hours}:${mins}:${secs}`;
  }
}

export default UI;
