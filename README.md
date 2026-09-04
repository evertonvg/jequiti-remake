# jequiti-remake

Remake de um projeto de faculdade com animação em CSS: uma bola de hipnose girando incansavelmente. O que começou simples foi crescendo até virar um site cheio de memes e brincadeiras escondidas, do tipo que você só descobre mexendo (ou lendo o código-fonte).

🔗 [evertonvg.github.io/jequiti-remake](https://evertonvg.github.io/jequiti-remake/)

## Do que se trata

Na superfície é só uma espiral hipnótica girando em loop. Mas o site reage a interações do mouse e do teclado, e de vez em quando troca a cena por algum meme, sem aviso — no estilo clássico de página de pegadinha.

Algumas pistas do que tem escondido por aí:
- Clicar na tela muda o comportamento da bola.
- Sequências de teclas conhecidas da cultura gamer fazem coisas inesperadas.
- Digitar rápido demais também tem consequência.
- Ficar parado por tempo demais, também.
- Digitar o nome da loja em qualquer lugar da página abre outra coisa.
- Curiosos que abrem o DevTools recebem uma mensagem especial.

Não tem spoiler aqui — a graça é descobrir jogando ou lendo o código-fonte, que documenta tudo em comentário pra quem quiser trapacear.

## Tecnologias

[Astro](https://astro.build) + [Alpine.js](https://alpinejs.dev) + TypeScript, com testes de ponta a ponta em [Playwright](https://playwright.dev). Publicado no GitHub Pages via GitHub Actions.

## Rodando local

```
npm install
npm run dev     # site em http://localhost:4321
npm run test    # suíte Playwright
npm run build   # gera dist/
```

## Estrutura

```
src/
  pages/       página principal (index.astro)
  components/  componentes Astro (terminal secreto, etc.)
  lib/         lógica da bola, transições e easter eggs (TypeScript)
  scripts/     entrada client-side
  styles/      estilos (BEM)
  config/      configuração de assets
public/
  img/ audio/ video/   mídia usada nos flashes, sons e vídeos surpresa
tests/         suíte Playwright (um spec por grupo de easter eggs)
```
