/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import "./style.css";

const root = document.getElementById("root");
if (!root) throw new Error("Elemento #root não encontrado");

render(() => <App />, root);
