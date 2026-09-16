# Instalación y puesta en marcha

La aplicación es HTML, CSS y JavaScript puro: **no hay dependencias que instalar ni nada que compilar**.
Solo necesitas descargar los ficheros y servirlos por HTTP.

## Requisitos

- Un navegador moderno (Chrome, Edge, Firefox o Safari actualizados).
- Cualquier servidor web estático. Vale con Python 3, Node.js o la extensión *Live Server* de VS Code.

> **¿Por qué hace falta un servidor?** La aplicación carga `data/sonetos.json` con `fetch()` y usa módulos ES.
> Si abres `index.html` con doble clic (`file://`), el navegador bloquea ambas cosas por seguridad y la página
> aparecerá vacía con un aviso. Servida por HTTP funciona sin más.

## 1. Descargar el proyecto

Con Git:

```bash
git clone https://github.com/raigarper/ipo2627_panama_sonetos.git
cd ipo2627_panama_sonetos
```

Sin Git: entra en `https://github.com/raigarper/ipo2627_panama_sonetos`, pulsa **Code → Download ZIP**,
descomprímelo y sitúate en la carpeta resultante.

## 2. Levantar la aplicación

Desde la raíz del proyecto, elige **una** de estas opciones:

**Python 3** (viene preinstalado en macOS y Linux)

```bash
python -m http.server 8000
```

**Node.js**

```bash
npx serve -l 8000
```

**VS Code** — instala la extensión *Live Server*, haz clic derecho sobre `index.html` y elige
**Open with Live Server**. Se abrirá el navegador solo; puedes saltarte el paso 3.

## 3. Abrir en el navegador

```
http://localhost:8000
```

Para detener el servidor, pulsa `Ctrl + C` en la terminal.

## 4. Comprobar que funciona

1. La página carga sin errores en la consola (`F12`) y el lienzo invita a elegir un soneto.
2. Al pulsar la barra de búsqueda se despliega la lista de sonetos.
3. Escribiendo `quevedo` aparecen dos resultados; `nariz` busca por contenido; `gongora`, sin tilde, encuentra
   a *Góngora*.
4. Al elegir un soneto se muestra con sus cuatro estrofas y sus catorce versos.
5. Se puede recorrer la lista con `↑` y `↓`, elegir con `Enter` y cerrarla con `Escape`.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| La página se ve sin estilos y vacía | La has abierto como `file://`. Sírvela por HTTP (paso 2). |
| «No se pudo cargar el almacén de sonetos» | El servidor no se lanzó desde la raíz del proyecto: `cd` a la carpeta que contiene `index.html` y repite el paso 2. |
| `Address already in use` | El puerto 8000 está ocupado. Usa otro: `python -m http.server 8080` y abre `http://localhost:8080`. |
| Los cambios no se reflejan | Caché del navegador: recarga forzando con `Ctrl + F5`. |

## Añadir sonetos

Edita `data/sonetos.json` y recarga la página. Cada soneto necesita `id`, `titulo`, `autor` y cuatro estrofas
(dos `cuarteto` de 4 versos y dos `terceto` de 3). Si la métrica no cuadra, la aplicación avisa en la consola
en lugar de mostrar datos corruptos.
