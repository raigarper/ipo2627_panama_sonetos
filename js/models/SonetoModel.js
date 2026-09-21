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

  // --- Observador -----------------------------------------------------
  // El modelo no puede tocar el DOM ni conocer las vistas, así que no las
  // llama: publica lo que le ocurre ("cargado", "resultados", "seleccion",
  // "inicio") y el controlador es quien traduce cada aviso en pintado. Esto
  // es lo que permite además probar el modelo en Node, sin navegador.

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

  /**
   * Pide el almacén al repositorio y deja la aplicación lista para buscar.
   * @returns {Promise<void>}
   */
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
   * @param {string} consulta Texto escrito por el usuario
   * @returns {Array<{soneto: Soneto, puntuacion: number, versoDestacado: ?string}>}
   *          Los resultados más relevantes, como mucho `maximoResultados`
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
   * @param {Soneto} soneto Candidato a evaluar
   * @param {string[]} terminos Términos ya normalizados de la consulta
   * @returns {?{soneto: Soneto, puntuacion: number, versoDestacado: ?string}}
   *          null si algún término no aparece en ninguno de sus campos
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
   * Fija como actual uno de los sonetos ya cargados en memoria.
   * @param {string} id Identificador del soneto elegido
   * @returns {?Soneto} El soneto actual tras la operación; si el id no existe
   *          o ya estaba seleccionado, se devuelve el actual sin emitir nada
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
