// AppController.js — coordina modelo y vistas.
// Las vistas no se conocen entre sí: todo pasa por aquí.

export class AppController {

  constructor({ modelo, navegacionView, buscadorView, sonetoView }) {
    this.modelo = modelo;
    this.navegacionView = navegacionView;
    this.buscadorView = buscadorView;
    this.sonetoView = sonetoView;
  }

  async iniciar() {
    this.enlazarVistas();
    this.escucharModelo();

    this.sonetoView.renderizarVacio();
    this.navegacionView.mostrarInicio();

    await this.modelo.inicializar();
  }

  enlazarVistas() {
    this.buscadorView.alEscribir((consulta) => this.modelo.buscar(consulta));
    this.buscadorView.alAbrir((consulta) => this.modelo.buscar(consulta));
    this.buscadorView.alSeleccionar((id) => this.modelo.seleccionar(id));
    this.navegacionView.alVolver(() => this.modelo.volverAlInicio());
  }

  escucharModelo() {
    this.modelo.suscribir("resultados", (datos) => this.buscadorView.renderizarResultados(datos));

    this.modelo.suscribir("seleccion", (soneto) => {
      this.buscadorView.reflejarSeleccion(soneto);
      this.sonetoView.renderizar(soneto);
      this.navegacionView.mostrarLectura();
    });

    this.modelo.suscribir("inicio", () => {
      this.navegacionView.mostrarInicio();
      this.buscadorView.enfocar();
    });
  }

  mostrarError(mensaje) {
    this.sonetoView.renderizarVacio(mensaje);
    this.navegacionView.mostrarLectura();
  }
}
