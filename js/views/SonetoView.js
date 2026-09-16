// SonetoView.js — lienzo de lectura: pinta el soneto elegido.

const DURACION_TRANSICION = 200;

export class SonetoView {

  constructor(raiz) {
    this.raiz = raiz;
  }

  /** Construye el marcado del soneto: encabezado + cuatro estrofas. */
  renderizar(soneto) {
    const encabezado = document.createElement("header");
    encabezado.className = "soneto__encabezado";

    const titulo = document.createElement("h2");
    titulo.className = "soneto__titulo";
    titulo.textContent = soneto.titulo;

    const autor = document.createElement("p");
    autor.className = "soneto__autor";
    autor.textContent = soneto.autor;

    encabezado.append(titulo, autor);

    // El año solo aparece si el almacén lo recoge para ese soneto.
    if (soneto.anio !== null && soneto.anio !== undefined) {
      const anio = document.createElement("p");
      anio.className = "soneto__anio";
      anio.textContent = String(soneto.anio);
      encabezado.append(anio);
    }

    const cuerpo = document.createElement("div");
    cuerpo.className = "soneto__cuerpo";

    for (const estrofa of soneto.estrofas) {
      cuerpo.append(this.crearEstrofa(estrofa));
    }

    this.pintar([encabezado, cuerpo], soneto.id);
  }

  crearEstrofa(estrofa) {
    const seccion = document.createElement("section");
    seccion.className = `soneto__estrofa soneto__estrofa--${estrofa.tipo}`;
    seccion.setAttribute("aria-label", `${estrofa.tipo} ${estrofa.orden}`);

    for (const texto of estrofa.versos) {
      const verso = document.createElement("p");
      verso.className = "soneto__verso";
      verso.textContent = texto;
      seccion.append(verso);
    }

    return seccion;
  }

  renderizarVacio(mensaje = "Elige un soneto en el buscador para comenzar la lectura.") {
    const parrafo = document.createElement("p");
    parrafo.className = "soneto__mensaje";
    parrafo.textContent = mensaje;

    this.raiz.classList.add("soneto--vacio");
    this.raiz.removeAttribute("data-soneto-id");
    this.raiz.replaceChildren(parrafo);
  }

  /** Sustituye el contenido con una breve transición gobernada por clases. */
  pintar(nodos, id) {
    this.raiz.classList.add("soneto--entrando");

    window.setTimeout(() => {
      this.raiz.classList.remove("soneto--vacio");
      this.raiz.dataset.sonetoId = id;
      this.raiz.replaceChildren(...nodos);
      this.raiz.classList.remove("soneto--entrando");
    }, DURACION_TRANSICION);
  }
}
