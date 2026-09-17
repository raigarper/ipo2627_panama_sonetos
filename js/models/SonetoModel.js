// SonetoModel.js — estado y lógica de negocio.
// No conoce el DOM: comunica los cambios mediante un observador ligero.

import { normalizar } from "./Soneto.js";

const PESO_TITULO = 3;
const PESO_AUTOR = 2;
const PESO_VERSO = 1;

export const MAXIMO_RESULTADOS = 3;

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

  //--------No se por que tiene en cuenta estos eventos---

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

  //-----------------------------------------------------

  /**
   * Inicialización del contenedor de sonetos
   */
  async inicializar() {
    this.sonetos = await this.repositorio.obtenerTodos();
    this.emitir("cargado", this.sonetos);
    this.buscar("");
  }

  /**
   * Filtra el almacén por título, autor y contenido de los versos.
   * Exige que todos los términos de la consulta aparezcan en el soneto
   * y ordena por relevancia (título > autor > verso).
   * @param {*} consulta Texto buscado por usuario
   * @returns Resultados de la consulta
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
   * Puntúa un soneto frente a los términos de búsqueda (Filtrado)
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

      const coincideTitulo = soneto.tituloNormalizado.includes(termino);
      const coincideAutor = soneto.autorNormalizado.includes(termino);

      if (coincideTitulo) {
        puntuacionTermino += PESO_TITULO;
      }

      if (coincideAutor) {
        puntuacionTermino += PESO_AUTOR;
      }

      const indiceVerso = soneto.versosNormalizados.findIndex((verso) => verso.includes(termino));

      if (indiceVerso !== -1) {
        puntuacionTermino += PESO_VERSO;

        // Solo se guarda el verso cuando el hallazgo no se explica ya por los
        // metadatos: si el término está en el título o en el autor, el
        // resultado se justifica solo y el fragmento de poema sobra.
        if (versoDestacado === null && !coincideTitulo && !coincideAutor) {
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

  /**
   * Selecciona un soneto del repositorio de sonetos "sonetos"
   * @param {*} id Identificador de soneto buscado 
   * @returns Soneto buscado
   */
  seleccionar(id) {
    const soneto = this.sonetos.find((candidato) => candidato.id === id) ?? null;

    if (soneto === null || soneto === this.sonetoActual) {
      return this.sonetoActual;
    }

    this.sonetoActual = soneto;
    this.emitir("seleccion", soneto);

    return soneto;
  }

  /** Abandona la lectura y devuelve la aplicación a la vista de búsqueda. */
  volverAlInicio() {
    this.sonetoActual = null;
    this.emitir("inicio", null);
  }
}
