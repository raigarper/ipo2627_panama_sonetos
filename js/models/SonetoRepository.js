// SonetoRepository.js — abstracción de la persistencia.
// El modelo depende de este contrato, nunca de cómo se almacenan los datos.

import { Soneto } from "./Soneto.js";

export class SonetoRepository {

  /** @returns {Promise<Soneto[]>} */
  async obtenerTodos() {
    throw new Error("SonetoRepository.obtenerTodos() debe implementarse en una subclase.");
  }

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
