// SonetoRepository.js — abstracción de la persistencia.
// El modelo depende de este contrato, nunca de cómo se almacenan los datos.

import { Soneto } from "./Soneto.js";

export class SonetoRepository {

  /**
   * Contrato que toda fuente de datos debe implementar.
   * @returns {Promise<Soneto[]>}
   * @throws {Error} Siempre: esta clase es abstracta y no accede a dato alguno.
   */
  async obtenerTodos() {
    throw new Error("SonetoRepository.obtenerTodos() debe implementarse en una subclase.");
  }

  /**
   * @param {string} id Identificador del soneto buscado
   * @returns {Promise<?Soneto>} El soneto encontrado, o null si no existe
   */
  async obtenerPorId(id) {
    const sonetos = await this.obtenerTodos();
    return sonetos.find((soneto) => soneto.id === id) ?? null;
  }
}

/**
 * Implementación concreta sobre un fichero JSON servido por HTTP.
 * Sustituible por otra fuente (API, almacenamiento local…) sin tocar el modelo.
 */
export class JsonSonetoRepository extends SonetoRepository {

  constructor(url) {
    super();
    this.url = url;
    this.cache = null;
  }

  /**
   * Implementación de obtenerTodos sobre el fichero JSON.
   * La caché evita descargas innecesarias: el almacén no cambia en ejecución.
   * @returns {Promise<Soneto[]>} Entidades ya validadas a partir del JSON
   * @throws {Error} Si la respuesta HTTP falla o el fichero no trae la lista
   */
  async obtenerTodos() {
    if (this.cache !== null) {
      return this.cache;
    }

    const respuesta = await fetch(this.url);

    if (!respuesta.ok) {
      throw new Error(`No se pudo leer el almacén de sonetos (${respuesta.status}).`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos.sonetos)) {
      throw new Error("El almacén de sonetos no contiene una lista de sonetos.");
    }

    this.cache = datos.sonetos.map((soneto) => Soneto.desdeJSON(soneto));

    return this.cache;
  }
}
