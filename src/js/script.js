class HypnosisBall {
  constructor({ ballEl, flashEl, maxDelayMs = 30000, flashDurationMs = 80 }) {
    this.ball = ballEl;
    this.flash = flashEl;
    this.maxDelayMs = maxDelayMs;
    this.flashDurationMs = flashDurationMs;
  }

  start() {
    this.scheduleNextFlash();
  }

  scheduleNextFlash() {
    const delay = Math.random() * this.maxDelayMs;
    setTimeout(() => this.triggerFlash(), delay);
  }

  triggerFlash() {
    this.ball.classList.add('hypnosis__ball--hidden');
    this.flash.classList.add('hypnosis__flash--active');

    setTimeout(() => {
      this.flash.classList.remove('hypnosis__flash--active');
      this.ball.classList.remove('hypnosis__ball--hidden');
      this.scheduleNextFlash();
    }, this.flashDurationMs);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ball = document.getElementById('hypnosisBall');
  const flash = document.getElementById('hypnosisFlash');

  new HypnosisBall({ ballEl: ball, flashEl: flash }).start();
});
