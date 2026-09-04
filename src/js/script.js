const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

class HypnosisBall {
  constructor({
    ballEl,
    flashEl,
    flashImageEl,
    overlayEl,
    audioEl,
    rickrollEl,
    easterEggEl,
    easterEggFilterEl,
    blackoutEl,
    normalImages,
    horrorImages,
    normalEasterEggSrc,
    horrorEasterEggSrc,
    keyMashSrc,
    maxFlashDelayMs = 30000,
    flashDurationMs = 80,
    rickrollChance = 0.1,
    rickrollRevealMs = 4000,
    normalSpeedDeg = 120,
    transitionMs = 5000,
    maxOverlayOpacity = 0.75,
    maxVolume = 0.8,
    keyMashThreshold = 20,
    keyMashWindowMs = 5000,
  }) {
    this.ball = ballEl;
    this.flash = flashEl;
    this.flashImage = flashImageEl;
    this.overlay = overlayEl;
    this.audio = audioEl;
    this.rickroll = rickrollEl;
    this.easterEgg = easterEggEl;
    this.easterEggFilter = easterEggFilterEl;
    this.blackout = blackoutEl;
    this.normalImages = normalImages;
    this.horrorImages = horrorImages;
    this.normalEasterEggSrc = normalEasterEggSrc;
    this.horrorEasterEggSrc = horrorEasterEggSrc;
    this.keyMashSrc = keyMashSrc;
    this.maxFlashDelayMs = maxFlashDelayMs;
    this.flashDurationMs = flashDurationMs;
    this.rickrollChance = rickrollChance;
    this.rickrollRevealMs = rickrollRevealMs;
    this.normalSpeedDeg = normalSpeedDeg;
    this.transitionMs = transitionMs;
    this.maxOverlayOpacity = maxOverlayOpacity;
    this.maxVolume = maxVolume;
    this.keyMashThreshold = keyMashThreshold;
    this.keyMashWindowMs = keyMashWindowMs;

    this.angle = 0;
    this.transition = 0;
    this.target = 0;
    this.horror = false;
    this.lastFrameTime = null;
    this.easterEggActive = false;
    this.keyMashActive = false;
    this.konamiBuffer = [];
    this.keyMashTimestamps = [];
  }

  start() {
    document.addEventListener('click', () => {
      if (this.isInteractionSuspended()) return;
      this.toggleHorror();
    });
    document.addEventListener('keydown', (event) => this.onKeydown(event));

    this.rickroll.muted = true;
    this.rickroll.play().catch(() => {});

    this.scheduleNextFlash();
    requestAnimationFrame((time) => this.tick(time));
  }

  isInteractionSuspended() {
    return this.easterEggActive || this.keyMashActive;
  }

  onKeydown(event) {
    if (this.isInteractionSuspended()) return;

    this.konamiBuffer.push(event.code);
    this.konamiBuffer = this.konamiBuffer.slice(-KONAMI_SEQUENCE.length);

    if (this.konamiBuffer.join(',') === KONAMI_SEQUENCE.join(',')) {
      this.triggerEasterEgg();
      return;
    }

    this.trackKeyMash();
  }

  trackKeyMash() {
    const now = performance.now();
    this.keyMashTimestamps.push(now);
    this.keyMashTimestamps = this.keyMashTimestamps.filter((t) => now - t <= this.keyMashWindowMs);

    if (this.keyMashTimestamps.length > this.keyMashThreshold) {
      this.keyMashTimestamps = [];
      this.triggerKeyMashEffect();
    }
  }

  playFullscreenVideo(src) {
    return new Promise((resolve) => {
      this.easterEgg.src = src;
      this.easterEgg.currentTime = 0;
      this.easterEgg.muted = false;
      this.easterEgg.classList.add('hypnosis__easter-egg--active');
      this.easterEgg.play().catch(() => {});

      const onEnded = () => {
        this.easterEgg.removeEventListener('ended', onEnded);
        this.easterEgg.classList.remove('hypnosis__easter-egg--active');
        this.easterEgg.removeAttribute('src');
        resolve();
      };
      this.easterEgg.addEventListener('ended', onEnded);
    });
  }

  triggerEasterEgg() {
    if (this.isInteractionSuspended()) return;
    this.easterEggActive = true;

    const isHorrorVideo = this.horror;
    if (isHorrorVideo) {
      this.easterEggFilter.classList.add('hypnosis__easter-egg-filter--active');
    }

    this.playFullscreenVideo(isHorrorVideo ? this.horrorEasterEggSrc : this.normalEasterEggSrc).then(() => {
      this.easterEggFilter.classList.remove('hypnosis__easter-egg-filter--active');
      this.easterEggActive = false;
    });
  }

  triggerKeyMashEffect() {
    if (this.isInteractionSuspended()) return;
    this.keyMashActive = true;
    this.blackout.classList.add('hypnosis__blackout--active');

    const onFadeEnd = (event) => {
      if (event.propertyName !== 'opacity' || event.target !== this.blackout) return;
      this.blackout.removeEventListener('transitionend', onFadeEnd);

      this.playFullscreenVideo(this.keyMashSrc).then(() => {
        this.blackout.classList.remove('hypnosis__blackout--active');
        this.keyMashActive = false;
      });
    };
    this.blackout.addEventListener('transitionend', onFadeEnd);
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
    if (Math.random() < this.rickrollChance) {
      this.triggerRickrollReveal();
      return;
    }

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

  triggerRickrollReveal() {
    this.rickroll.classList.add('hypnosis__rickroll--visible');

    setTimeout(() => {
      this.rickroll.classList.remove('hypnosis__rickroll--visible');
      this.scheduleNextFlash();
    }, this.rickrollRevealMs);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new HypnosisBall({
    ballEl: document.getElementById('hypnosisBall'),
    flashEl: document.getElementById('hypnosisFlash'),
    flashImageEl: document.getElementById('hypnosisFlashImage'),
    overlayEl: document.getElementById('hypnosisOverlay'),
    audioEl: document.getElementById('hypnosisAudio'),
    rickrollEl: document.getElementById('hypnosisRickroll'),
    easterEggEl: document.getElementById('hypnosisEasterEgg'),
    easterEggFilterEl: document.getElementById('hypnosisEasterEggFilter'),
    blackoutEl: document.getElementById('hypnosisBlackout'),
    normalImages: ['src/img/jequiti.webp'],
    horrorImages: [
      'src/img/horror/1.png',
      'src/img/horror/2.jpg',
      'src/img/horror/3.jpg',
      'src/img/horror/4.jpg',
    ],
    normalEasterEggSrc: 'src/video/ronaldinhosoccer.mp4',
    horrorEasterEggSrc: 'src/video/illuminatti.mp4',
    keyMashSrc: 'src/video/skyrim.mp4',
  }).start();
});
