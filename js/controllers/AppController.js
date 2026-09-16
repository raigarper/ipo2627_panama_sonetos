// AppController.js — coordina modelo y vistas.
// Las vistas no se conocen entre sí: todo pasa por aquí.

export class AppController {

  constructor({ modelo, buscadorView, sonetoView }) {
    this.modelo = modelo;
    this.buscadorView = buscadorView;
    this.sonetoView = sonetoView;
  }

  async iniciar() {
    this.enlazarVistas();
    this.escucharModelo();

    this.sonetoView.renderizarVacio();

    await this.modelo.inicializar();
  }

  enlazarVistas() {
    this.buscadorView.alEscribir((consulta) => this.modelo.buscar(consulta));
    this.buscadorView.alAbrir((consulta) => this.modelo.buscar(consulta));
    this.buscadorView.alSeleccionar((id) => this.modelo.seleccionar(id));
  }

  escucharModelo() {
    this.modelo.suscribir("resultados", (datos) => this.buscadorView.renderizarResultados(datos));

    this.modelo.suscribir("seleccion", (soneto) => {
      this.buscadorView.reflejarSeleccion(soneto);
      this.sonetoView.renderizar(soneto);
    });
  }

  mostrarError(mensaje) {
    this.sonetoView.renderizarVacio(mensaje);
  }
}
