export interface DvdScreensaverOptions {
  logoWidth?: number;
  logoHeight?: number;
  speed?: number;
}

export class DvdScreensaver {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly logoWidth: number;
  private readonly logoHeight: number;
  private readonly speed: number;
  private rafId: number | null = null;
  private x = 0;
  private y = 0;
  private speedX = 0;
  private speedY = 0;
  private hue = 0;
  private color = '';

  constructor(canvasEl: HTMLCanvasElement, { logoWidth = 120, logoHeight = 60, speed = 3 }: DvdScreensaverOptions = {}) {
    this.canvas = canvasEl;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.logoWidth = logoWidth;
    this.logoHeight = logoHeight;
    this.speed = speed;
  }

  start(): void {
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

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private nextColor(): string {
    this.hue = (this.hue + 60) % 360;
    return `hsl(${this.hue}, 100%, 50%)`;
  }

  private drawLogo(px: number, py: number, color: string): void {
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

  private loop(): void {
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
