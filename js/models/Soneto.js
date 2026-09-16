// Soneto.js — entidad de dominio.

const VERSOS_POR_TIPO = {
  cuarteto: 4,
  terceto: 3
};

const VERSOS_DE_UN_SONETO = 14;

/**
 * Elimina diacríticos y normaliza a minúsculas para comparar textos
 * sin que las tildes o las mayúsculas afecten a la búsqueda.
 */
export function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export class Soneto {

  constructor({ id, titulo, autor, estrofas }) {
    this.id = id;
    this.titulo = titulo;
    this.autor = autor;
    this.estrofas = estrofas;

    // Índices de búsqueda precalculados (el texto de un soneto no cambia).
    this.tituloNormalizado = normalizar(titulo);
    this.autorNormalizado = normalizar(autor);
    this.versosNormalizados = this.versos.map(normalizar);
  }

  /** Los catorce versos aplanados, en orden de lectura. */
  get versos() {
    return this.estrofas.flatMap((estrofa) => estrofa.versos);
  }

  get primerVerso() {
    return this.versos[0];
  }

  /**
   * Construye una entidad validando la métrica del soneto:
   * dos cuartetos y dos tercetos, catorce versos en total.
   */
  static desdeJSON(datos) {
    const { id, titulo, autor, estrofas } = datos;

    if (!id || !titulo || !autor || !Array.isArray(estrofas)) {
      throw new Error(`Soneto con datos incompletos: ${id ?? "(sin id)"}`);
    }

    if (estrofas.length !== 4) {
      throw new Error(`El soneto "${titulo}" no tiene cuatro estrofas.`);
    }

    let total = 0;

    for (const estrofa of estrofas) {
      const esperados = VERSOS_POR_TIPO[estrofa.tipo];

      if (esperados === undefined) {
        throw new Error(`Tipo de estrofa desconocido en "${titulo}": ${estrofa.tipo}`);
      }

      if (estrofa.versos.length !== esperados) {
        throw new Error(
          `El ${estrofa.tipo} ${estrofa.orden} de "${titulo}" tiene ${estrofa.versos.length} versos.`
        );
      }

      total += estrofa.versos.length;
    }

    if (total !== VERSOS_DE_UN_SONETO) {
      throw new Error(`El soneto "${titulo}" tiene ${total} versos en lugar de ${VERSOS_DE_UN_SONETO}.`);
    }

    const ordenadas = [...estrofas].sort((una, otra) => una.orden - otra.orden);

    return new Soneto({ id, titulo, autor, estrofas: ordenadas });
  }
}
