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
- Curiosos que abrem o DevTools recebem uma mensagem especial.

Não tem spoiler aqui — a graça é descobrir jogando ou lendo o `index.html`, que documenta tudo em comentário pra quem quiser trapacear.

## Tecnologias

HTML, CSS e JavaScript puros, sem framework e sem build — só abrir o `index.html` no navegador (ou acessar o link do GitHub Pages).

## Estrutura

```
index.html
src/
  css/     estilos (BEM)
  js/      lógica da bola, transições e easter eggs
  img/     imagens usadas nos flashes e no favicon
  audio/   sirene do modo vermelho
  video/   os vídeos surpresa
```
