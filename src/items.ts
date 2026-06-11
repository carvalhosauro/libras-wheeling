export interface TransportItem {
  /** Nome exibido no rótulo da fatia e no card de resultado */
  name: string;
  /** Caminho da foto, relativo à raiz do site (servido de public/) */
  img: string;
}

export const ITEMS: readonly TransportItem[] = [
  { name: "Caminhão", img: "assets/img/caminhao.webp" },
  { name: "Bicicleta", img: "assets/img/bicicleta.webp" },
  { name: "Carro particular", img: "assets/img/carro.webp" },
  { name: "Canoa", img: "assets/img/canoa.webp" },
  { name: "Avião", img: "assets/img/aviao.webp" },
  { name: "Voadeira", img: "assets/img/voadeira.webp" },
  { name: "Moto", img: "assets/img/moto.webp" },
  { name: "Táxi", img: "assets/img/taxi.webp" },
  { name: "Lotação", img: "assets/img/lotacao.webp" },
  { name: "Uber", img: "assets/img/uber.webp" },
  { name: "Ônibus", img: "assets/img/onibus.webp" },
  { name: "Bicicleta elétrica", img: "assets/img/bike-eletrica.webp" },
];

export const SLICE: number = (Math.PI * 2) / ITEMS.length;

export const COLORS: readonly string[] = [
  "#ff5d73",
  "#ffc145",
  "#5b8cff",
  "#43c59e",
  "#b388ff",
  "#ff8e3c",
];
