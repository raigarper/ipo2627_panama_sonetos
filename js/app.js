// app.js — punto de entrada: compone las piezas del patrón MVC.

import { JsonSonetoRepository } from "./models/SonetoRepository.js";
import { SonetoModel } from "./models/SonetoModel.js";
import { NavegacionView } from "./views/NavegacionView.js";
import { BuscadorView } from "./views/BuscadorView.js";
import { SonetoView } from "./views/SonetoView.js";
import { AppController } from "./controllers/AppController.js";

const URL_ALMACEN = "data/sonetos.json";

async function arrancar() {
  const repositorio = new JsonSonetoRepository(URL_ALMACEN);
  const modelo = new SonetoModel(repositorio);

  const navegacionView = new NavegacionView(document.querySelector("[data-navegacion]"));
  const buscadorView = new BuscadorView(document.querySelector("[data-buscador]"));
  const sonetoView = new SonetoView(document.querySelector("[data-soneto]"));

  const controlador = new AppController({ modelo, navegacionView, buscadorView, sonetoView });

  try {
    await controlador.iniciar();
  } catch (error) {
    controlador.mostrarError("No se pudo cargar el almacén de sonetos. Sirve la aplicación por HTTP e inténtalo de nuevo.");
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", arrancar);
