import { DvdScreensaver } from './dvd-screensaver';

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

const SECRET_WORD = 'jequiti';

export interface SecretTerminalToggleDetail {
  active: boolean;
}

declare global {
  interface WindowEventMap {
    'hypnosis:secret-word': CustomEvent<void>;
    'hypnosis:unlock-drag': CustomEvent<void>;
    'secret-terminal:toggle': CustomEvent<SecretTerminalToggleDetail>;
  }
}

export interface HypnosisBallOptions {
  ballEl: HTMLImageElement;
  flashEl: HTMLElement;
  flashImageEl: HTMLImageElement;
  overlayEl: HTMLElement;
  audioEl: HTMLAudioElement;
  angelicalOverlayEl: HTMLElement;
  angelicalAudioEl: HTMLAudioElement;
  rickrollEl: HTMLVideoElement;
  easterEggEl: HTMLVideoElement;
  easterEggFilterEl: HTMLElement;
  blackoutEl: HTMLElement;
  idleCanvasEl: HTMLCanvasElement;
  normalImages: string[];
  horrorImages: string[];
  heavenImages: string[];
  normalEasterEggSrc: string;
  horrorEasterEggSrc: string;
  angelicalEasterEggSrc: string;
  keyMashSrc: string;
  horrorKeyMashSrc: string;
  angelicalKeyMashSrc: string;
  maxFlashDelayMs?: number;
  flashDurationMs?: number;
  rickrollChance?: number;
  rickrollRevealMs?: number;
  normalSpeedDeg?: number;
  transitionMs?: number;
  maxOverlayOpacity?: number;
  maxVolume?: number;
  maxAngelicalOverlayOpacity?: number;
  maxAngelicalVolume?: number;
  keyMashThreshold?: number;
  keyMashWindowMs?: number;
  idleMs?: number;
  doubleClickWindowMs?: number;
}

export class HypnosisBall {
  private readonly ball: HTMLImageElement;
  private readonly flash: HTMLElement;
  private readonly flashImage: HTMLImageElement;
  private readonly overlay: HTMLElement;
  private readonly audio: HTMLAudioElement;
  private readonly angelicalOverlay: HTMLElement;
  private readonly angelicalAudio: HTMLAudioElement;
  private readonly rickroll: HTMLVideoElement;
  private readonly easterEgg: HTMLVideoElement;
  private readonly easterEggFilter: HTMLElement;
  private readonly blackout: HTMLElement;
  private readonly idleCanvas: HTMLCanvasElement;
  private readonly idleScreensaver: DvdScreensaver;

  private readonly normalImages: string[];
  private readonly horrorImages: string[];
  private readonly heavenImages: string[];
  private readonly normalEasterEggSrc: string;
  private readonly horrorEasterEggSrc: string;
  private readonly angelicalEasterEggSrc: string;
  private readonly keyMashSrc: string;
  private readonly horrorKeyMashSrc: string;
  private readonly angelicalKeyMashSrc: string;

  private readonly maxFlashDelayMs: number;
  private readonly flashDurationMs: number;
  private readonly rickrollChance: number;
  private readonly rickrollRevealMs: number;
  private readonly normalSpeedDeg: number;
  private readonly transitionMs: number;
  private readonly maxOverlayOpacity: number;
  private readonly maxVolume: number;
  private readonly maxAngelicalOverlayOpacity: number;
  private readonly maxAngelicalVolume: number;
  private readonly keyMashThreshold: number;
  private readonly keyMashWindowMs: number;
  private readonly idleMs: number;
  private readonly doubleClickWindowMs: number;

  private angle = 0;
  private transition = 0;
  private target = 0;
  private horror = false;
  private angelicalTransition = 0;
  private angelicalTarget = 0;
  private angelical = false;
  private lastFrameTime: number | null = null;
  private easterEggActive = false;
  private keyMashActive = false;
  private idleActive = false;
  private idleSirenWasPlaying = false;
  private konamiBuffer: string[] = [];
  private secretWordBuffer = '';
  private secretTerminalActive = false;
  private keyMashTimestamps: number[] = [];
  private idleTimeoutId: ReturnType<typeof setTimeout> | undefined;
  private pendingClickTimeoutId: ReturnType<typeof setTimeout> | undefined;
  private clickCount = 0;

  private dragUnlocked = false;
  private isDragging = false;
  private dragMoved = false;
  private suppressNextClick = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private dragStartClientX = 0;
  private dragStartClientY = 0;
  private dragStartOffsetX = 0;
  private dragStartOffsetY = 0;

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
    idleMs = 42000,
    doubleClickWindowMs = 250,
  }: HypnosisBallOptions) {
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
  }

  start(): void {
    document.addEventListener('click', () => this.onClick());
    document.addEventListener('keydown', (event) => this.onKeydown(event));

    (['mousemove', 'keydown', 'click', 'touchstart', 'scroll'] as const).forEach((type) => {
      document.addEventListener(type, () => this.resetIdleTimer());
    });

    window.addEventListener('secret-terminal:toggle', (event) => {
      this.secretTerminalActive = event.detail.active;
      if (!this.secretTerminalActive) {
        this.resetIdleTimer();
      }
    });

    window.addEventListener('hypnosis:unlock-drag', () => this.unlockDrag());

    this.rickroll.muted = true;
    this.rickroll.play().catch(() => {});

    this.scheduleNextFlash();
    this.resetIdleTimer();
    requestAnimationFrame((time) => this.tick(time));
  }

  private isInteractionSuspended(): boolean {
    return this.easterEggActive || this.keyMashActive || this.idleActive || this.secretTerminalActive;
  }

  private onClick(): void {
    if (this.suppressNextClick) {
      this.suppressNextClick = false;
      return;
    }
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

  private onKeydown(event: KeyboardEvent): void {
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

    if (event.key.length === 1) {
      this.secretWordBuffer = (this.secretWordBuffer + event.key.toLowerCase()).slice(-SECRET_WORD.length);
      if (this.secretWordBuffer === SECRET_WORD) {
        this.secretWordBuffer = '';
        window.dispatchEvent(new CustomEvent('hypnosis:secret-word'));
        return;
      }
    }

    this.trackKeyMash();
  }

  private resetIdleTimer(): void {
    clearTimeout(this.idleTimeoutId);
    if (this.isInteractionSuspended()) return;
    this.idleTimeoutId = setTimeout(() => this.triggerIdleEffect(), this.idleMs);
  }

  private triggerIdleEffect(): void {
    if (this.isInteractionSuspended()) return;
    this.idleActive = true;

    this.idleSirenWasPlaying = !this.audio.paused;
    this.audio.pause();

    this.idleCanvas.classList.add('hypnosis__idle--active');
    this.idleScreensaver.start();
  }

  private dismissIdleEffect(): void {
    this.idleActive = false;

    this.idleScreensaver.stop();
    this.idleCanvas.classList.remove('hypnosis__idle--active');

    if (this.idleSirenWasPlaying) {
      this.audio.play().catch(() => {});
    }

    this.resetIdleTimer();
  }

  private trackKeyMash(): void {
    const now = performance.now();
    this.keyMashTimestamps.push(now);
    this.keyMashTimestamps = this.keyMashTimestamps.filter((t) => now - t <= this.keyMashWindowMs);

    if (this.keyMashTimestamps.length > this.keyMashThreshold) {
      this.keyMashTimestamps = [];
      this.triggerKeyMashEffect();
    }
  }

  private playFullscreenVideo(src: string): Promise<void> {
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

  private triggerEasterEgg(): void {
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

  private triggerKeyMashEffect(): void {
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

    const onFadeEnd = (event: TransitionEvent) => {
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

  private toggleHorror(): void {
    this.horror = !this.horror;
    this.target = this.horror ? 1 : 0;

    if (this.horror) {
      this.angelical = false;
      this.angelicalTarget = 0;
      this.audio.play().catch(() => {});
    }
  }

  private toggleAngelical(): void {
    this.angelical = !this.angelical;
    this.angelicalTarget = this.angelical ? 1 : 0;

    if (this.angelical) {
      this.horror = false;
      this.target = 0;
      this.angelicalAudio.play().catch(() => {});
    }
  }

  private tick(time: number): void {
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
    this.ball.style.transform = `translate(${this.dragOffsetX}px, ${this.dragOffsetY}px) rotate(${this.angle}deg)`;

    this.overlay.style.opacity = String(this.transition * this.maxOverlayOpacity);
    this.audio.volume = this.transition * this.maxVolume;

    if (this.transition === 0 && !this.horror && !this.audio.paused) {
      this.audio.pause();
    }

    this.angelicalOverlay.style.opacity = String(this.angelicalTransition * this.maxAngelicalOverlayOpacity);
    this.angelicalAudio.volume = this.angelicalTransition * this.maxAngelicalVolume;

    if (this.angelicalTransition === 0 && !this.angelical && !this.angelicalAudio.paused) {
      this.angelicalAudio.pause();
    }

    requestAnimationFrame((nextTime) => this.tick(nextTime));
  }

  private scheduleNextFlash(): void {
    const delay = Math.random() * this.maxFlashDelayMs;
    setTimeout(() => this.triggerFlash(), delay);
  }

  private triggerFlash(): void {
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

  private triggerRickrollReveal(): void {
    this.rickroll.classList.add('hypnosis__rickroll--visible');

    setTimeout(() => {
      this.rickroll.classList.remove('hypnosis__rickroll--visible');
      this.scheduleNextFlash();
    }, this.rickrollRevealMs);
  }

  private unlockDrag(): void {
    if (this.dragUnlocked) return;
    this.dragUnlocked = true;

    this.ball.classList.add('hypnosis__ball--draggable');
    this.ball.addEventListener('pointerdown', (event) => this.onBallPointerDown(event));
    window.addEventListener('pointermove', (event) => this.onBallPointerMove(event));
    window.addEventListener('pointerup', (event) => this.onBallPointerUp(event));
    window.addEventListener('pointercancel', (event) => this.onBallPointerUp(event));
  }

  private onBallPointerDown(event: PointerEvent): void {
    if (this.isInteractionSuspended()) return;

    event.preventDefault();
    this.isDragging = true;
    this.dragMoved = false;
    this.ball.setPointerCapture(event.pointerId);
    this.ball.classList.add('hypnosis__ball--dragging');
    this.dragStartClientX = event.clientX;
    this.dragStartClientY = event.clientY;
    this.dragStartOffsetX = this.dragOffsetX;
    this.dragStartOffsetY = this.dragOffsetY;
  }

  private onBallPointerMove(event: PointerEvent): void {
    if (!this.isDragging) return;

    const dx = event.clientX - this.dragStartClientX;
    const dy = event.clientY - this.dragStartClientY;
    if (!this.dragMoved && Math.hypot(dx, dy) > 4) {
      this.dragMoved = true;
    }
    this.dragOffsetX = this.dragStartOffsetX + dx;
    this.dragOffsetY = this.dragStartOffsetY + dy;
  }

  private onBallPointerUp(event: PointerEvent): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.ball.classList.remove('hypnosis__ball--dragging');
    if (this.ball.hasPointerCapture(event.pointerId)) {
      this.ball.releasePointerCapture(event.pointerId);
    }
    if (this.dragMoved) {
      this.suppressNextClick = true;
    }
  }
}
