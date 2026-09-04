import { HypnosisBall } from '../lib/hypnosis-ball';
import { assetConfig } from '../config/assets';
import { initDisableDevtool } from '../lib/disable-devtool-init';

function mustGetById<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Expected element #${id} to exist`);
  return el as T;
}

document.addEventListener('DOMContentLoaded', () => {
  new HypnosisBall({
    ballEl: mustGetById<HTMLImageElement>('hypnosisBall'),
    flashEl: mustGetById('hypnosisFlash'),
    flashImageEl: mustGetById<HTMLImageElement>('hypnosisFlashImage'),
    overlayEl: mustGetById('hypnosisOverlay'),
    audioEl: mustGetById<HTMLAudioElement>('hypnosisAudio'),
    angelicalOverlayEl: mustGetById('hypnosisAngelicalOverlay'),
    angelicalAudioEl: mustGetById<HTMLAudioElement>('hypnosisAngelicalAudio'),
    rickrollEl: mustGetById<HTMLVideoElement>('hypnosisRickroll'),
    easterEggEl: mustGetById<HTMLVideoElement>('hypnosisEasterEgg'),
    easterEggFilterEl: mustGetById('hypnosisEasterEggFilter'),
    blackoutEl: mustGetById('hypnosisBlackout'),
    idleCanvasEl: mustGetById<HTMLCanvasElement>('hypnosisIdle'),
    ...assetConfig,
  }).start();
});

initDisableDevtool();
