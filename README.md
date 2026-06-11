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

Não precisa instalar nada. É HTML, CSS e JavaScript puros:

```bash
git clone https://github.com/carvalhosauro/libras-wheeling.git
cd libras-wheeling
python3 -m http.server 8000
# abra http://localhost:8000
```

## Tecnologias

- **HTML + CSS + JavaScript** puros (sem build, sem dependências instaladas)
- Roleta desenhada em **Canvas 2D**
- Confetes via [canvas-confetti](https://github.com/catdad/canvas-confetti) (CDN)
- Sons de tique e vitória gerados com **Web Audio API** (zero arquivos de áudio)
- Hospedado no **GitHub Pages**

## Estrutura

```
├── index.html      # página única
├── style.css       # estilos
├── js/
│   ├── main.js     # estado, giro, sorteio e ligação com a página
│   ├── wheel.js    # desenho da roleta no canvas
│   ├── items.js    # lista de transportes, fatias e cores
│   └── sounds.js   # tique e som de vitória (Web Audio)
└── assets/img/     # fotos reais dos transportes
```

## Créditos das fotos

Fotos reais obtidas de bancos de imagem livres (Unsplash, Flickr e Wikimedia Commons, via Openverse) sob licenças de uso livre/comercial.

---

Feito com ❤️ para espalhar Libras, um giro de cada vez.
