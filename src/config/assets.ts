import { withBase } from '../lib/base-path';

export const assetConfig = {
  normalImages: [withBase('img/jequiti.webp')],
  horrorImages: [
    'img/horror/1.png',
    'img/horror/2.jpg',
    'img/horror/3.jpg',
    'img/horror/4.jpg',
  ].map(withBase),
  heavenImages: [
    'img/heaven/4d2284a7de8184b18e7287cbeb07b7ac.jpg',
    'img/heaven/Confused-jesus-meme-4.jpg',
    'img/heaven/ecce-mono-jesus-ReproducaoInstagram.jpg.webp',
    'img/heaven/images.jpg',
    'img/heaven/jesus-watcha-doin-meme-xqbc6.jpg',
  ].map(withBase),
  normalEasterEggSrc: withBase('video/ronaldinhosoccer.mp4'),
  horrorEasterEggSrc: withBase('video/illuminatti.mp4'),
  angelicalEasterEggSrc: withBase('video/jesus-come.mp4'),
  keyMashSrc: withBase('video/skyrim.mp4'),
  horrorKeyMashSrc: withBase('video/jeff.mp4'),
  angelicalKeyMashSrc: withBase('video/jesus-jumpscare.mp4'),
};
