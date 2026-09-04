class HypnosisBall {
  constructor({
    ballEl,
    flashEl,
    flashImageEl,
    overlayEl,
    audioEl,
    normalImages,
    horrorImages,
    maxFlashDelayMs = 30000,
    flashDurationMs = 80,
    normalSpeedDeg = 120,
    transitionMs = 5000,
    maxOverlayOpacity = 0.75,
    maxVolume = 0.8,
  }) {
    this.ball = ballEl;
    this.flash = flashEl;
    this.flashImage = flashImageEl;
    this.overlay = overlayEl;
    this.audio = audioEl;
    this.normalImages = normalImages;
    this.horrorImages = horrorImages;
    this.maxFlashDelayMs = maxFlashDelayMs;
    this.flashDurationMs = flashDurationMs;
    this.normalSpeedDeg = normalSpeedDeg;
    this.transitionMs = transitionMs;
    this.maxOverlayOpacity = maxOverlayOpacity;
    this.maxVolume = maxVolume;

    this.angle = 0;
    this.transition = 0;
    this.target = 0;
    this.horror = false;
    this.lastFrameTime = null;
  }

  start() {
    document.addEventListener('click', () => this.toggleHorror());
    this.scheduleNextFlash();
    requestAnimationFrame((time) => this.tick(time));
  }

  toggleHorror() {
    this.horror = !this.horror;
    this.target = this.horror ? 1 : 0;

    if (this.horror) {
      this.audio.play().catch(() => {});
    }
  }

  tick(time) {
    if (this.lastFrameTime === null) {
      this.lastFrameTime = time;
    }
    const dt = time - this.lastFrameTime;
    this.lastFrameTime = time;

    const step = dt / this.transitionMs;
    if (this.transition < this.target) {
      this.transition = Math.min(this.target, this.transition + step);
    } else if (this.transition > this.target) {
      this.transition = Math.max(this.target, this.transition - step);
    }

    const speed = this.normalSpeedDeg * (1 - 2 * this.transition);
    this.angle = (this.angle + speed * (dt / 1000)) % 360;
    this.ball.style.transform = `rotate(${this.angle}deg)`;

    this.overlay.style.opacity = this.transition * this.maxOverlayOpacity;
    this.audio.volume = this.transition * this.maxVolume;

    if (this.transition === 0 && !this.horror && !this.audio.paused) {
      this.audio.pause();
    }

    requestAnimationFrame((nextTime) => this.tick(nextTime));
  }

  scheduleNextFlash() {
    const delay = Math.random() * this.maxFlashDelayMs;
    setTimeout(() => this.triggerFlash(), delay);
  }

  triggerFlash() {
    const pool = this.horror ? this.horrorImages : this.normalImages;
    this.flashImage.src = pool[Math.floor(Math.random() * pool.length)];

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
  new HypnosisBall({
    ballEl: document.getElementById('hypnosisBall'),
    flashEl: document.getElementById('hypnosisFlash'),
    flashImageEl: document.getElementById('hypnosisFlashImage'),
    overlayEl: document.getElementById('hypnosisOverlay'),
    audioEl: document.getElementById('hypnosisAudio'),
    normalImages: ['src/img/jequiti.webp'],
    horrorImages: [
      'src/img/horror/1.png',
      'src/img/horror/2.jpg',
      'src/img/horror/3.jpg',
      'src/img/horror/4.jpg',
    ],
  }).start();
});
