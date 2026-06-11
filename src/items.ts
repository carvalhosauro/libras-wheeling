export interface TransportItem {
  /** Nome exibido no rótulo da fatia e no card de resultado */
  name: string;
  /** Caminho da foto, relativo à raiz do site (servido de public/) */
  img: string;
}

export const ITEMS: readonly TransportItem[] = [
  { name: "Caminhão", img: "assets/img/caminhao.jpg" },
  { name: "Bicicleta", img: "assets/img/bicicleta.jpg" },
  { name: "Carro particular", img: "assets/img/carro.jpg" },
  { name: "Canoa", img: "assets/img/canoa.jpg" },
  { name: "Avião", img: "assets/img/aviao.jpg" },
  { name: "Voadeira", img: "assets/img/voadeira.jpg" },
  { name: "Moto", img: "assets/img/moto.jpg" },
  { name: "Táxi", img: "assets/img/taxi.jpg" },
  { name: "Lotação", img: "assets/img/lotacao.jpg" },
  { name: "Uber", img: "assets/img/uber.jpg" },
  { name: "Ônibus", img: "assets/img/onibus.jpg" },
  { name: "Bicicleta elétrica", img: "assets/img/bike-eletrica.jpg" },
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
