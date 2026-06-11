# 🎡 Roleta dos Transportes — Libras

**Uma iniciativa para ensinar sinais de Libras (Língua Brasileira de Sinais) de um jeito divertido.**

🔗 **Acesse:** https://carvalhosauro.github.io/libras-wheeling/

## Como funciona

A dinâmica é simples e acontece na rua, na escola, em eventos — onde houver gente:

1. **Abordamos** uma pessoa e convidamos para brincar;
2. **Giramos a roleta** — ela sorteia um meio de transporte (com foto real, confetes e tudo que tem direito 🎉);
3. **Ensinamos o sinal** daquele transporte em Libras, ali mesmo, na hora.

Cada giro é uma microaula. A pessoa sai sabendo um sinal novo — e, com sorte, com vontade de aprender o próximo.

## Os transportes

Caminhão · Bicicleta · Carro particular · Canoa · Avião · Voadeira · Moto · Táxi · Lotação · Uber · Ônibus · Bicicleta elétrica

> Itens com cara de Brasil de verdade: tem voadeira e canoa porque rio também é estrada. 🛶

## Por que Libras?

Libras é a segunda língua oficial do Brasil e a primeira língua de grande parte da comunidade surda. Cada pessoa ouvinte que aprende um sinal — mesmo um só — torna o mundo um pouco mais acessível.

## Rodando localmente

```bash
git clone https://github.com/carvalhosauro/libras-wheeling.git
cd libras-wheeling
npm install
npm run dev      # dev server com hot reload
npm run build    # type-check + build de produção em dist/
```

## Tecnologias

- **SolidJS + TypeScript** estrito — reatividade fina sem Virtual DOM, bundle final de ~30KB (12KB gzip)
- **Vite** para dev server e build
- Fotos em **WebP** (~46% menores que os JPGs originais)
- Roleta desenhada em **Canvas 2D**
- Confetes via [canvas-confetti](https://github.com/catdad/canvas-confetti)
- Sons de tique e vitória gerados com **Web Audio API** (zero arquivos de áudio)
- Hospedado no **GitHub Pages**, deploy automático via **GitHub Actions** a cada push na `main`

## Estrutura

```
├── index.html             # entry do Vite
├── src/
│   ├── main.tsx           # bootstrap do Solid
│   ├── App.tsx            # UI + estado (signals) + orquestração do giro
│   ├── wheel.ts           # desenho da roleta no canvas
│   ├── geometry.ts        # funções puras de ângulo, fatia e easing
│   ├── random.ts          # sorteios nomeados
│   ├── items.ts           # lista de transportes, fatias e cores
│   ├── sounds.ts          # tique e som de vitória (Web Audio)
│   └── style.css          # estilos
├── public/assets/img/     # fotos reais dos transportes
└── .github/workflows/     # deploy automático no Pages
```

## Créditos das fotos

Fotos reais obtidas de bancos de imagem livres (Unsplash, Flickr e Wikimedia Commons, via Openverse) sob licenças de uso livre/comercial.

---

Feito com ❤️ para espalhar Libras, um giro de cada vez.
