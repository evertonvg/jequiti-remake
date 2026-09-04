const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

class DvdScreensaver {
  constructor(canvasEl, { logoWidth = 120, logoHeight = 60, speed = 3 } = {}) {
    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext('2d');
    this.logoWidth = logoWidth;
    this.logoHeight = logoHeight;
    this.speed = speed;
    this.rafId = null;
  }

  start() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.x = Math.random() * (this.canvas.width - this.logoWidth);
    this.y = Math.random() * (this.canvas.height - this.logoHeight);
    this.speedX = this.speed;
    this.speedY = this.speed;
    this.hue = 0;
    this.color = this.nextColor();

    this.loop();
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  nextColor() {
    this.hue = (this.hue + 60) % 360;
    return `hsl(${this.hue}, 100%, 50%)`;
  }

  drawLogo(px, py, color) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.font = 'bold 38px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DVD', px + this.logoWidth / 2, py + this.logoHeight / 2 - 6);

    ctx.beginPath();
    ctx.ellipse(px + this.logoWidth / 2, py + this.logoHeight - 10, this.logoWidth / 2.2, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(px + this.logoWidth / 2, py + this.logoHeight - 10, this.logoWidth / 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  loop() {
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.x += this.speedX;
    this.y += this.speedY;

    let hit = false;
    if (this.x + this.logoWidth >= this.canvas.width || this.x <= 0) {
      this.speedX = -this.speedX;
      hit = true;
    }
    if (this.y + this.logoHeight >= this.canvas.height || this.y <= 0) {
      this.speedY = -this.speedY;
      hit = true;
    }
    if (hit) {
      this.color = this.nextColor();
    }

    this.drawLogo(this.x, this.y, this.color);

    this.rafId = requestAnimationFrame(() => this.loop());
  }
}

class HypnosisBall {
  constructor({
    ballEl,
    flashEl,
    flashImageEl,
    overlayEl,
    audioEl,
    angelicalOverlayEl,
    angelicalAudioEl,
    rickrollEl,
    easterEggEl,
    easterEggFilterEl,
    blackoutEl,
    idleCanvasEl,
    normalImages,
    horrorImages,
    heavenImages,
    normalEasterEggSrc,
    horrorEasterEggSrc,
    angelicalEasterEggSrc,
    keyMashSrc,
    horrorKeyMashSrc,
    angelicalKeyMashSrc,
    maxFlashDelayMs = 30000,
    flashDurationMs = 80,
    rickrollChance = 0.1,
    rickrollRevealMs = 4000,
    normalSpeedDeg = 120,
    transitionMs = 5000,
    maxOverlayOpacity = 0.75,
    maxVolume = 0.8,
    maxAngelicalOverlayOpacity = 0.85,
    maxAngelicalVolume = 0.7,
    keyMashThreshold = 20,
    keyMashWindowMs = 5000,
    idleMs = 120000,
    doubleClickWindowMs = 250,
  }) {
    this.ball = ballEl;
    this.flash = flashEl;
    this.flashImage = flashImageEl;
    this.overlay = overlayEl;
    this.audio = audioEl;
    this.angelicalOverlay = angelicalOverlayEl;
    this.angelicalAudio = angelicalAudioEl;
    this.rickroll = rickrollEl;
    this.easterEgg = easterEggEl;
    this.easterEggFilter = easterEggFilterEl;
    this.blackout = blackoutEl;
    this.idleCanvas = idleCanvasEl;
    this.idleScreensaver = new DvdScreensaver(idleCanvasEl);
    this.normalImages = normalImages;
    this.horrorImages = horrorImages;
    this.heavenImages = heavenImages;
    this.normalEasterEggSrc = normalEasterEggSrc;
    this.horrorEasterEggSrc = horrorEasterEggSrc;
    this.angelicalEasterEggSrc = angelicalEasterEggSrc;
    this.keyMashSrc = keyMashSrc;
    this.horrorKeyMashSrc = horrorKeyMashSrc;
    this.angelicalKeyMashSrc = angelicalKeyMashSrc;
    this.maxFlashDelayMs = maxFlashDelayMs;
    this.flashDurationMs = flashDurationMs;
    this.rickrollChance = rickrollChance;
    this.rickrollRevealMs = rickrollRevealMs;
    this.normalSpeedDeg = normalSpeedDeg;
    this.transitionMs = transitionMs;
    this.maxOverlayOpacity = maxOverlayOpacity;
    this.maxVolume = maxVolume;
    this.maxAngelicalOverlayOpacity = maxAngelicalOverlayOpacity;
    this.maxAngelicalVolume = maxAngelicalVolume;
    this.keyMashThreshold = keyMashThreshold;
    this.keyMashWindowMs = keyMashWindowMs;
    this.idleMs = idleMs;
    this.doubleClickWindowMs = doubleClickWindowMs;

    this.angle = 0;
    this.transition = 0;
    this.target = 0;
    this.horror = false;
    this.angelicalTransition = 0;
    this.angelicalTarget = 0;
    this.angelical = false;
    this.lastFrameTime = null;
    this.easterEggActive = false;
    this.keyMashActive = false;
    this.idleActive = false;
    this.idleSirenWasPlaying = false;
    this.konamiBuffer = [];
    this.keyMashTimestamps = [];
    this.idleTimeoutId = null;
    this.pendingClickTimeoutId = null;
    this.clickCount = 0;
  }

  start() {
    document.addEventListener('click', () => this.onClick());
    document.addEventListener('keydown', (event) => this.onKeydown(event));

    ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach((type) => {
      document.addEventListener(type, () => this.resetIdleTimer());
    });

    this.rickroll.muted = true;
    this.rickroll.play().catch(() => {});

    this.scheduleNextFlash();
    this.resetIdleTimer();
    requestAnimationFrame((time) => this.tick(time));
  }

  isInteractionSuspended() {
    return this.easterEggActive || this.keyMashActive || this.idleActive;
  }

  onClick() {
    if (this.isInteractionSuspended()) return;

    this.clickCount += 1;

    if (this.clickCount === 1) {
      this.pendingClickTimeoutId = setTimeout(() => {
        this.clickCount = 0;
        this.toggleHorror();
      }, this.doubleClickWindowMs);
    } else {
      clearTimeout(this.pendingClickTimeoutId);
      this.clickCount = 0;
      this.toggleAngelical();
    }
  }

  onKeydown(event) {
    if (this.idleActive) {
      this.dismissIdleEffect();
      return;
    }
    if (this.isInteractionSuspended()) return;

    this.konamiBuffer.push(event.code);
    this.konamiBuffer = this.konamiBuffer.slice(-KONAMI_SEQUENCE.length);

    if (this.konamiBuffer.join(',') === KONAMI_SEQUENCE.join(',')) {
      this.triggerEasterEgg();
      return;
    }

    this.trackKeyMash();
  }

  resetIdleTimer() {
    clearTimeout(this.idleTimeoutId);
    if (this.isInteractionSuspended()) return;
    this.idleTimeoutId = setTimeout(() => this.triggerIdleEffect(), this.idleMs);
  }

  triggerIdleEffect() {
    if (this.isInteractionSuspended()) return;
    this.idleActive = true;

    this.idleSirenWasPlaying = !this.audio.paused;
    this.audio.pause();

    this.idleCanvas.classList.add('hypnosis__idle--active');
    this.idleScreensaver.start();
  }

  dismissIdleEffect() {
    this.idleActive = false;

    this.idleScreensaver.stop();
    this.idleCanvas.classList.remove('hypnosis__idle--active');

    if (this.idleSirenWasPlaying) {
      this.audio.play().catch(() => {});
    }

    this.resetIdleTimer();
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
    const isAngelicalVideo = this.angelical;
    if (isHorrorVideo) {
      this.easterEggFilter.classList.add('hypnosis__easter-egg-filter--active');
    } else if (isAngelicalVideo) {
      this.angelicalAudio.pause();
    }

    const src = isHorrorVideo
      ? this.horrorEasterEggSrc
      : isAngelicalVideo
        ? this.angelicalEasterEggSrc
        : this.normalEasterEggSrc;

    this.playFullscreenVideo(src).then(() => {
      this.easterEggFilter.classList.remove('hypnosis__easter-egg-filter--active');
      this.easterEggActive = false;
      if (isAngelicalVideo) {
        this.angelicalAudio.play().catch(() => {});
      }
      this.resetIdleTimer();
    });
  }

  triggerKeyMashEffect() {
    if (this.isInteractionSuspended()) return;
    this.keyMashActive = true;
    this.blackout.classList.add('hypnosis__blackout--active');

    const isHorrorVideo = this.horror;
    const isAngelicalVideo = this.angelical;
    if (isHorrorVideo) {
      this.audio.pause();
    } else if (isAngelicalVideo) {
      this.angelicalAudio.pause();
    }

    const src = isHorrorVideo
      ? this.horrorKeyMashSrc
      : isAngelicalVideo
        ? this.angelicalKeyMashSrc
        : this.keyMashSrc;

    const onFadeEnd = (event) => {
      if (event.propertyName !== 'opacity' || event.target !== this.blackout) return;
      this.blackout.removeEventListener('transitionend', onFadeEnd);

      this.playFullscreenVideo(src).then(() => {
        this.blackout.classList.remove('hypnosis__blackout--active');
        this.keyMashActive = false;
        if (isHorrorVideo) {
          this.audio.play().catch(() => {});
        } else if (isAngelicalVideo) {
          this.angelicalAudio.play().catch(() => {});
        }
        this.resetIdleTimer();
      });
    };
    this.blackout.addEventListener('transitionend', onFadeEnd);
  }

  toggleHorror() {
    this.horror = !this.horror;
    this.target = this.horror ? 1 : 0;

    if (this.horror) {
      this.angelical = false;
      this.angelicalTarget = 0;
      this.audio.play().catch(() => {});
    }
  }

  toggleAngelical() {
    this.angelical = !this.angelical;
    this.angelicalTarget = this.angelical ? 1 : 0;

    if (this.angelical) {
      this.horror = false;
      this.target = 0;
      this.angelicalAudio.play().catch(() => {});
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

    if (this.angelicalTransition < this.angelicalTarget) {
      this.angelicalTransition = Math.min(this.angelicalTarget, this.angelicalTransition + step);
    } else if (this.angelicalTransition > this.angelicalTarget) {
      this.angelicalTransition = Math.max(this.angelicalTarget, this.angelicalTransition - step);
    }

    const speed = this.normalSpeedDeg * (1 - 2 * this.transition) * (1 - this.angelicalTransition);
    this.angle = (this.angle + speed * (dt / 1000)) % 360;
    this.ball.style.transform = `rotate(${this.angle}deg)`;

    this.overlay.style.opacity = this.transition * this.maxOverlayOpacity;
    this.audio.volume = this.transition * this.maxVolume;

    if (this.transition === 0 && !this.horror && !this.audio.paused) {
      this.audio.pause();
    }

    this.angelicalOverlay.style.opacity = this.angelicalTransition * this.maxAngelicalOverlayOpacity;
    this.angelicalAudio.volume = this.angelicalTransition * this.maxAngelicalVolume;

    if (this.angelicalTransition === 0 && !this.angelical && !this.angelicalAudio.paused) {
      this.angelicalAudio.pause();
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

    const pool = this.horror
      ? this.horrorImages
      : this.angelical
        ? this.heavenImages
        : this.normalImages;
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
    angelicalOverlayEl: document.getElementById('hypnosisAngelicalOverlay'),
    angelicalAudioEl: document.getElementById('hypnosisAngelicalAudio'),
    rickrollEl: document.getElementById('hypnosisRickroll'),
    easterEggEl: document.getElementById('hypnosisEasterEgg'),
    easterEggFilterEl: document.getElementById('hypnosisEasterEggFilter'),
    blackoutEl: document.getElementById('hypnosisBlackout'),
    idleCanvasEl: document.getElementById('hypnosisIdle'),
    normalImages: ['src/img/jequiti.webp'],
    horrorImages: [
      'src/img/horror/1.png',
      'src/img/horror/2.jpg',
      'src/img/horror/3.jpg',
      'src/img/horror/4.jpg',
    ],
    heavenImages: [
      'src/img/heaven/4d2284a7de8184b18e7287cbeb07b7ac.jpg',
      'src/img/heaven/Confused-jesus-meme-4.jpg',
      'src/img/heaven/ecce-mono-jesus-ReproducaoInstagram.jpg.webp',
      'src/img/heaven/images.jpg',
      'src/img/heaven/jesus-watcha-doin-meme-xqbc6.jpg',
    ],
    normalEasterEggSrc: 'src/video/ronaldinhosoccer.mp4',
    horrorEasterEggSrc: 'src/video/illuminatti.mp4',
    angelicalEasterEggSrc: 'src/video/jesus-come.mp4',
    keyMashSrc: 'src/video/skyrim.mp4',
    horrorKeyMashSrc: 'src/video/jeff.mp4',
    angelicalKeyMashSrc: 'src/video/jesus-jumpscare.mp4',
  }).start();
});

(() => {
  const SIZE_THRESHOLD = 100;
  let shown = false;

  const showMessage = () => {
    if (shown) return;
    shown = true;
    console.log('%cmensagem para você:', 'font-size: 20px; font-weight: bold;');
    console.log(
      '%c ',
      'font-size: 1px; padding: 100px 150px; background: url(src/img/jesus.jpg) no-repeat center / contain;'
    );
  };

  const isSizeDiffOpen = () =>
    window.outerWidth - window.innerWidth > SIZE_THRESHOLD ||
    window.outerHeight - window.innerHeight > SIZE_THRESHOLD;

  // pega DevTools destacado (janela separada), onde outerWidth/outerHeight não mudam:
  // o preview do objeto só é calculado quando o painel do console está de fato renderizando
  let probeAccessed = false;
  const probe = new Image();
  Object.defineProperty(probe, 'id', {
    get() {
      probeAccessed = true;
      return '';
    },
  });

  setInterval(() => {
    probeAccessed = false;
    console.log(probe);

    if (isSizeDiffOpen() || probeAccessed) {
      showMessage();
    } else {
      shown = false;
    }
  }, 1000);
})();
