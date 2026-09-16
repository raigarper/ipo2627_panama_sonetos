// NavegacionView.js — alternancia entre las dos vistas de la aplicación.
// Inicio y lectura son mutuamente excluyentes: solo una está presente cada vez.

export class NavegacionView {

  constructor(raiz) {
    this.raiz = raiz;
    this.vistas = new Map();

    for (const seccion of raiz.querySelectorAll("[data-vista]")) {
      this.vistas.set(seccion.dataset.vista, seccion);
    }

    this.botonVolver = raiz.querySelector("[data-volver]");

    this.manejadores = {
      volver: () => {}
    };

    this.botonVolver.addEventListener("click", () => this.manejadores.volver());
  }

  alVolver(callback) {
    this.manejadores.volver = callback;
  }

  mostrarInicio() {
    this.mostrar("inicio");
  }

  mostrarLectura() {
    this.mostrar("lectura");
    this.botonVolver.focus();
  }

  /** Activa una vista y repliega el resto mediante clases de estado. */
  mostrar(nombre) {
    for (const [clave, seccion] of this.vistas) {
      const esActiva = clave === nombre;

      seccion.classList.toggle("vista--oculta", !esActiva);
      seccion.hidden = !esActiva;
    }
  }
}
