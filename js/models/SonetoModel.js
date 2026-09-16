// SonetoModel.js — estado y lógica de negocio.
// No conoce el DOM: comunica los cambios mediante un observador ligero.

import { normalizar } from "./Soneto.js";

const PESO_TITULO = 3;
const PESO_AUTOR = 2;
const PESO_VERSO = 1;

export const MAXIMO_RESULTADOS = 6;

export class SonetoModel {

  constructor(repositorio, maximoResultados = MAXIMO_RESULTADOS) {
    this.repositorio = repositorio;
    this.maximoResultados = maximoResultados;

    this.sonetos = [];
    this.consulta = "";
    this.resultados = [];
    this.sonetoActual = null;

    this.suscriptores = new Map();
  }

  // --- Observador -----------------------------------------------------

  suscribir(evento, callback) {
    if (!this.suscriptores.has(evento)) {
      this.suscriptores.set(evento, []);
    }

    this.suscriptores.get(evento).push(callback);
  }

  emitir(evento, datos) {
    const callbacks = this.suscriptores.get(evento) ?? [];

    for (const callback of callbacks) {
      callback(datos);
    }
  }

  // --- Ciclo de vida --------------------------------------------------

  async inicializar() {
    this.sonetos = await this.repositorio.obtenerTodos();
    this.emitir("cargado", this.sonetos);
    this.buscar("");
  }

  // --- Búsqueda -------------------------------------------------------

  /**
   * Filtra el almacén por título, autor y contenido de los versos.
   * Exige que todos los términos de la consulta aparezcan en el soneto
   * y ordena por relevancia (título > autor > verso).
   */
  buscar(consulta) {
    this.consulta = consulta;

    const terminos = normalizar(consulta).split(/\s+/).filter((termino) => termino.length > 0);

    const encontrados = this.sonetos
      .map((soneto) => this.evaluar(soneto, terminos))
      .filter((resultado) => resultado !== null)
      .sort((uno, otro) => otro.puntuacion - uno.puntuacion || uno.soneto.titulo.localeCompare(otro.soneto.titulo));

    this.resultados = encontrados.slice(0, this.maximoResultados);

    this.emitir("resultados", { resultados: this.resultados, terminos, consulta });

    return this.resultados;
  }

  /**
   * Puntúa un soneto frente a los términos de búsqueda.
   * @returns {?{soneto: Soneto, puntuacion: number, versoDestacado: ?string}}
   */
  evaluar(soneto, terminos) {
    if (terminos.length === 0) {
      return { soneto, puntuacion: 0, versoDestacado: null };
    }

    let puntuacion = 0;
    let versoDestacado = null;

    for (const termino of terminos) {
      let puntuacionTermino = 0;

      if (soneto.tituloNormalizado.includes(termino)) {
        puntuacionTermino += PESO_TITULO;
      }

      if (soneto.autorNormalizado.includes(termino)) {
        puntuacionTermino += PESO_AUTOR;
      }

      const indiceVerso = soneto.versosNormalizados.findIndex((verso) => verso.includes(termino));

      if (indiceVerso !== -1) {
        puntuacionTermino += PESO_VERSO;

        if (versoDestacado === null) {
          versoDestacado = soneto.versos[indiceVerso];
        }
      }

      // Todos los términos deben aparecer en algún campo del soneto.
      if (puntuacionTermino === 0) {
        return null;
      }

      puntuacion += puntuacionTermino;
    }

    return { soneto, puntuacion, versoDestacado };
  }

  // --- Selección ------------------------------------------------------

  seleccionar(id) {
    const soneto = this.sonetos.find((candidato) => candidato.id === id) ?? null;

    if (soneto === null || soneto === this.sonetoActual) {
      return this.sonetoActual;
    }

    this.sonetoActual = soneto;
    this.emitir("seleccion", soneto);

    return soneto;
  }
}
