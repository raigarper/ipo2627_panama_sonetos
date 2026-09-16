// BuscadorView.js — combobox de búsqueda: campo de texto + lista desplegable.
// Solo se ocupa de presentar y de emitir intenciones del usuario.

export class BuscadorView {

  constructor(raiz) {
    this.raiz = raiz;
    this.campo = raiz.querySelector("[data-buscador-campo]");
    this.lista = raiz.querySelector("[data-buscador-lista]");

    this.opciones = [];
    this.indiceActivo = -1;
    this.idSeleccionado = null;
    this.campoReflejaSeleccion = false;

    this.manejadores = {
      escribir: () => {},
      seleccionar: () => {},
      abrir: () => {}
    };

    this.enlazarEventos();
  }

  // --- Suscripción del controlador -------------------------------------

  alEscribir(callback) {
    this.manejadores.escribir = callback;
  }

  alSeleccionar(callback) {
    this.manejadores.seleccionar = callback;
  }

  alAbrir(callback) {
    this.manejadores.abrir = callback;
  }

  // --- Eventos del DOM --------------------------------------------------

  enlazarEventos() {
    this.campo.addEventListener("input", this.gestionarEscritura.bind(this));
    this.campo.addEventListener("focus", this.gestionarApertura.bind(this));
    this.campo.addEventListener("click", this.gestionarApertura.bind(this));
    this.campo.addEventListener("keydown", this.gestionarTeclado.bind(this));
    this.lista.addEventListener("click", this.gestionarClickEnLista.bind(this));
    document.addEventListener("click", this.gestionarClickFuera.bind(this));
  }

  gestionarEscritura(evento) {
    this.campoReflejaSeleccion = false;
    this.manejadores.escribir(evento.target.value);
    this.abrir();
  }

  /**
   * Al enfocar o pulsar el campo se despliega el almacén completo.
   * Si el campo solo muestra el título ya elegido, se ofrece la lista entera
   * y se preselecciona el texto para que escribir lo sustituya.
   */
  gestionarApertura() {
    if (this.campoReflejaSeleccion) {
      this.campo.select();
      this.manejadores.abrir("");
    } else {
      this.manejadores.abrir(this.campo.value);
    }

    this.abrir();
  }

  gestionarClickEnLista(evento) {
    const opcion = evento.target.closest("[data-soneto-id]");

    if (opcion !== null) {
      this.manejadores.seleccionar(opcion.dataset.sonetoId);
    }
  }

  gestionarClickFuera(evento) {
    if (!this.raiz.contains(evento.target)) {
      this.cerrar();
    }
  }

  gestionarTeclado(evento) {
    switch (evento.key) {
      case "ArrowDown":
        evento.preventDefault();
        this.abrir();
        this.moverActiva(1);
        break;

      case "ArrowUp":
        evento.preventDefault();
        this.moverActiva(-1);
        break;

      case "Enter":
        evento.preventDefault();
        this.confirmarActiva();
        break;

      case "Escape":
        this.cerrar();
        break;

      default:
        break;
    }
  }

  // --- Estado desplegado -------------------------------------------------

  abrir() {
    if (!this.lista.hasChildNodes()) {
      return;
    }

    this.lista.hidden = false;
    this.campo.setAttribute("aria-expanded", "true");
    this.campo.classList.add("buscador__campo--abierto");
  }

  cerrar() {
    this.lista.hidden = true;
    this.campo.setAttribute("aria-expanded", "false");
    this.campo.classList.remove("buscador__campo--abierto");
    this.campo.removeAttribute("aria-activedescendant");
    this.activar(-1);
  }

  moverActiva(desplazamiento) {
    if (this.opciones.length === 0) {
      return;
    }

    const total = this.opciones.length;
    const siguiente = (this.indiceActivo + desplazamiento + total) % total;

    this.activar(siguiente);
  }

  activar(indice) {
    this.opciones.forEach((opcion, posicion) => {
      const esActiva = posicion === indice;
      opcion.classList.toggle("buscador__opcion--activa", esActiva);
      opcion.setAttribute("aria-selected", String(esActiva));
    });

    this.indiceActivo = indice;

    if (indice >= 0) {
      const activa = this.opciones[indice];
      this.campo.setAttribute("aria-activedescendant", activa.id);
      activa.scrollIntoView({ block: "nearest" });
    }
  }

  confirmarActiva() {
    const activa = this.opciones[this.indiceActivo] ?? this.opciones[0];

    if (activa !== undefined) {
      this.manejadores.seleccionar(activa.dataset.sonetoId);
    }
  }

  // --- Pintado ------------------------------------------------------------

  renderizarResultados({ resultados }) {
    this.lista.replaceChildren();
    this.opciones = [];
    this.indiceActivo = -1;

    if (resultados.length === 0) {
      this.lista.append(this.crearMensajeVacio());
      return;
    }

    resultados.forEach((resultado, posicion) => {
      const opcion = this.crearOpcion(resultado, posicion);
      this.opciones.push(opcion);
      this.lista.append(opcion);
    });

    this.marcarSeleccion(this.idSeleccionado);
  }

  crearOpcion({ soneto, versoDestacado }, posicion) {
    const opcion = document.createElement("li");
    opcion.className = "buscador__opcion";
    opcion.id = `buscador-opcion-${posicion}`;
    opcion.dataset.sonetoId = soneto.id;
    opcion.setAttribute("role", "option");
    opcion.setAttribute("aria-selected", "false");

    const titulo = document.createElement("span");
    titulo.className = "buscador__opcion-titulo";
    titulo.textContent = soneto.titulo;

    const autor = document.createElement("span");
    autor.className = "buscador__opcion-autor";
    autor.textContent = soneto.autor;

    opcion.append(titulo, autor);

    // El verso solo acompaña a la opción cuando la coincidencia se produjo
    // dentro del poema; si el soneto se encontró por título o autor, sobra.
    if (versoDestacado !== null) {
      const verso = document.createElement("span");
      verso.className = "buscador__opcion-verso";
      verso.textContent = versoDestacado;
      opcion.append(verso);
    }

    return opcion;
  }

  crearMensajeVacio() {
    const vacio = document.createElement("li");
    vacio.className = "buscador__vacio";
    vacio.textContent = "Ningún soneto coincide con la búsqueda.";
    return vacio;
  }

  marcarSeleccion(id) {
    this.idSeleccionado = id;

    for (const opcion of this.opciones) {
      opcion.classList.toggle("buscador__opcion--seleccionada", opcion.dataset.sonetoId === id);
    }
  }

  /** Devuelve el foco al campo al regresar a la vista de búsqueda. */
  enfocar() {
    this.campo.focus();
  }

  /** Refleja en el campo el soneto elegido y repliega la lista. */
  reflejarSeleccion(soneto) {
    this.campo.value = soneto.titulo;
    this.campoReflejaSeleccion = true;
    this.marcarSeleccion(soneto.id);
    this.cerrar();
  }
}
