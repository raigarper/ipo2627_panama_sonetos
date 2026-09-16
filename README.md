# Sonetos — Lector web

Aplicación web de lectura de sonetos desarrollada como práctica de **Interacción Persona-Ordenador (IPO)**.
El usuario busca un soneto por título, autor o contenido y lo lee en un lienzo tipográfico cuidado.

La experiencia se organiza en **dos vistas mutuamente excluyentes**: una portada despejada con el buscador, y
el lienzo de lectura con un control de retorno. Nunca se ven las dos a la vez.

Un *soneto* es una composición de **14 versos** repartidos en cuatro estrofas fijas: dos cuartetos (4 versos)
y dos tercetos (3 versos). Esa estructura métrica se respeta en los datos, en el marcado HTML y en el diseño espacial.

Construida con **HTML, CSS y JavaScript Vanilla**, sin dependencias, sin framework y sin proceso de compilación.

> Instrucciones de descarga y puesta en marcha: [INSTALL.md](INSTALL.md)

---

## 1. Arquitectura

El proyecto sigue el patrón **MVC (Model–View–Controller)** con módulos nativos ES6, apoyado en el patrón
**Repository** para aislar el origen de los datos.

```
        ┌──────────────────┐   eventos DOM    ┌──────────────────┐
        │   BuscadorView   │ ───────────────▶ │                  │
        │    SonetoView    │ ◀─────────────── │  AppController   │
        └──────────────────┘   órdenes de     │                  │
                 ▲             pintado        └──────────────────┘
                 │                                     │
                 │  notificaciones (observador)        │ consultas
                 │                                     ▼
                 │                            ┌──────────────────┐
                 └─────────────────────────── │   SonetoModel    │
                                              └──────────────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │ SonetoRepository │ ──▶ data/sonetos.json
                                              └──────────────────┘
```

Reglas que sostienen la separación de responsabilidades:

| Capa | Puede | No puede |
|---|---|---|
| **Modelo** | Guardar el estado, buscar, seleccionar, validar la métrica | Tocar el DOM ni conocer las vistas |
| **Vista** | Leer y escribir el DOM, escuchar eventos, pintar | Contener lógica de negocio ni hablar con otra vista |
| **Controlador** | Cablear vistas y modelo en ambos sentidos | Manipular el DOM directamente |
| **Repositorio** | Traer y validar los datos de su fuente | Conocer cómo se muestran |

La comunicación **modelo → vista** no es directa: el modelo emite eventos (`cargado`, `resultados`, `seleccion`)
mediante un pequeño **patrón observador**, y el controlador es quien los traduce en llamadas de pintado.
Gracias a ello el modelo es comprobable fuera del navegador (de hecho se validó con Node y un repositorio falso).

---

## 2. Estructura de ficheros

```
ipo2627_panama_sonetos/
├── index.html                 Única página de la aplicación
├── README.md                  Este documento
├── INSTALL.md                 Descarga y puesta en marcha
├── data/
│   └── sonetos.json           Almacén de sonetos
├── css/
│   ├── reset.css              Normalización del navegador
│   ├── variables.css          Sistema de diseño (:root)
│   ├── layout.css             Composición estructural (Grid / Flexbox)
│   └── components.css         Bloques BEM
├── js/
│   ├── app.js                 Punto de entrada
│   ├── models/
│   │   ├── Soneto.js          Entidad de dominio
│   │   ├── SonetoRepository.js Acceso a datos
│   │   └── SonetoModel.js     Estado y lógica de negocio
│   ├── views/
│   │   ├── NavegacionView.js  Alternancia entre las dos vistas
│   │   ├── BuscadorView.js    Buscador desplegable
│   │   └── SonetoView.js      Lienzo de lectura
│   └── controllers/
│       └── AppController.js   Coordinación
└── sonetos/                   Sonetos originales en texto plano (fuente documental)
```

---

## 3. Los ficheros, uno a uno

### `index.html`

Página única. En el `<head>` enlaza los cuatro CSS en orden de cascada
(`reset` → `variables` → `layout` → `components`) y **un solo** script:

```html
<script type="module" src="js/app.js"></script>
```

Al ser un módulo se difiere automáticamente, así que no hace falta colocarlo al final del `<body>`.
Los demás ficheros JS no se enlazan: los importa `app.js`.

El cuerpo declara las **dos vistas** como sendas `<section data-vista>` dentro del `<main>`:

- `data-vista="inicio"` — la portada: `<h1>`, lema y buscador, centrados.
- `data-vista="lectura"` — el `<article>` del soneto precedido de un `<nav>` con el botón de retorno.

Ambas existen siempre en el documento; lo que cambia es cuál está activa. Junto a ellas viven los
**puntos de anclaje** que el JavaScript localiza mediante atributos `data-*` (`data-navegacion`,
`data-buscador`, `data-soneto`, `data-volver`), nunca por `id` ni por clase de estilo, para que renombrar una
clase CSS no rompa el script.

El buscador se marca como *combobox* accesible: `role="combobox"`, `aria-expanded`, `aria-controls`,
`aria-autocomplete` y una `<ul role="listbox">`. El lienzo lleva `aria-live="polite"` para que un lector de
pantalla anuncie el soneto al cambiar. **No hay ni un solo atributo `onclick`.**

### `data/sonetos.json`

El almacén. Cada soneto guarda sus metadatos y sus cuatro estrofas tipadas:

```json
{
  "id": "a-una-nariz",
  "titulo": "A una nariz",
  "autor": "Francisco de Quevedo",
  "estrofas": [
    { "tipo": "cuarteto", "orden": 1, "versos": ["…", "…", "…", "…"] },
    { "tipo": "cuarteto", "orden": 2, "versos": ["…", "…", "…", "…"] },
    { "tipo": "terceto",  "orden": 3, "versos": ["…", "…", "…"] },
    { "tipo": "terceto",  "orden": 4, "versos": ["…", "…", "…"] }
  ]
}
```

- `id` — identificador estable en kebab-case; es la clave de selección y viaja al DOM como `data-soneto-id`.
- `anio` — **opcional**: si un soneto lo declara, el lienzo lo muestra bajo el autor; si falta, no se pinta nada.
- `tipo` — `cuarteto` o `terceto`; la vista lo convierte en el modificador BEM `soneto__estrofa--cuarteto`.
- `orden` — posición de la estrofa; el modelo ordena por él al construir la entidad.

Guardar los versos agrupados por estrofa (y no como una lista plana de 14) es lo que permite que el HTML
generado sea fiel a la métrica y que el CSS pueda separar estrofas sin contar líneas.

**Para añadir un soneto basta con editar este fichero**: no hay que tocar ninguna línea de código.

### `css/reset.css`

Reset unificado: `* { margin: 0; padding: 0; box-sizing: border-box; }`, listas sin viñetas, imágenes en bloque,
`input`/`button` heredando la tipografía y un `:focus-visible` siempre perceptible (accesibilidad por teclado).

### `css/variables.css`

Todo el sistema de diseño vive aquí, en `:root`. Ningún componente inventa un color, un tamaño ni un espacio.

**Cromática monocromática.** Se declara un único tono y de él se derivan todos los colores variando
exclusivamente saturación y luminosidad con `calc()`:

```css
--tono: 35;                                       /* sepia */
--saturacion: 30%;
--saturacion-viva: calc(var(--saturacion) + 25%);
--color-lienzo: hsl(var(--tono), var(--saturacion-suave), 96%);
--color-tinta:  hsl(var(--tono), var(--saturacion-tinta), 14%);
--color-acento: hsl(var(--tono), var(--saturacion-viva), 32%);
```

Cambiar `--tono` reviste la aplicación entera de otro color sin tocar nada más. No se usan nombres literales
(`red`, `blue`), ni `#hex`, ni `rgb()` disperso: solo `hsl()` parametrizado.

**Tipografía.** Dos familias contrastadas: una **serif** para la lectura poética y una **sans-serif** para la
interfaz. Los tamaños son fluidos (`clamp()`) y siempre relativos (`rem`/`em`), nunca en `px`.

**Espacial.** `--medida-verso: 34em` (≈60 caracteres por línea, el ancho cómodo de lectura) y el par
`--espacio-verso` / `--espacio-estrofa`, cuya diferencia deliberada materializa la ley de proximidad.

### `css/layout.css`

Composición estructural. La página es un **Grid** de dos filas (lector / pie). El lector es a su vez un Grid
de una columna que aloja las dos vistas:

- `.vista--inicio` centra su contenido en horizontal (`justify-items: center`) y lo ancla en el tercio superior
  (`align-content: start` más `padding-block-start: clamp(2rem, 12vh, 8rem)`). No se centra en vertical a
  propósito: el desplegable se abre hacia abajo y necesita ese hueco libre para no provocar scroll de página.
- `.vista--lectura` es un Grid de dos filas (acciones / lienzo) con el contenido justificado al centro.

La exclusión mutua se resuelve con una única regla, `.vista--oculta { display: none }`, que el JavaScript
aplica y retira. Los contenedores intermedios —portada, buscador, soneto, encabezado— son **Flexbox** en
columna con `gap`.

El flujo normal queda reservado a los **elementos hoja de texto** (`p`, `span`): todo nodo estructural compone
explícitamente con Grid o Flexbox. Las medidas de contenedor son fluidas (`%`, `vh`, `clamp()`, `min()`).

### `css/components.css`

Los bloques visuales, nombrados con **BEM** (`bloque__elemento--modificador`) y escritos con **anidamiento CSS
nativo**, de modo que cada bloque queda encapsulado y no se producen fugas de especificidad:

```css
.buscador {
    .buscador__campo { … }
    .buscador__opcion--activa { … }
}
```

Bloques: `.portada` (con `__titulo` y `__lema`), `.boton`, `.pie`, `.buscador` (con `__campo`, `__lista`,
`__opcion`, `__vacio`) y `.soneto` (con `__encabezado`, `__titulo`, `__autor`, `__anio`, `__estrofa`,
`__verso`, `__mensaje`).

En los resultados del buscador se distingue de un vistazo el **metadato** del **fragmento de poema**: el título
y el autor van alineados al margen de la opción, mientras que el verso coincidente se sangra, se marca con un
filete lateral y se entrecomilla, conservando la serif en cursiva del lienzo de lectura.

Un detalle de especificidad que conviene recordar: como el bloque declara `display: flex` para
`.buscador__lista` (0,2,0), gana al `display: none` que el navegador aplica por el atributo `hidden` (0,1,0).
De ahí la regla explícita `.buscador__lista[hidden] { display: none }` —y su gemela `.vista[hidden]`— sin la
cual las opciones se verían desde el arranque.

Aquí se concreta la separación **figura/fondo**: el panel del buscador es sans-serif sobre el fondo general,
mientras el soneto se presenta como una hoja clara, serif y elevada. Y la **proximidad**:

```css
.soneto__verso            { line-height: var(--ritmo-verso); margin-block-end: var(--espacio-verso); }
.soneto__estrofa + .soneto__estrofa { margin-block-start: var(--espacio-estrofa); }
```

Los estados (`--abierto`, `--activa`, `--seleccionada`, `--vacio`, `--entrando`) son **clases**, nunca estilos
en línea: el JavaScript solo las añade o las quita.

### `js/models/Soneto.js`

La entidad de dominio. Además de los datos expone:

- `get versos` — los catorce versos aplanados en orden de lectura.
- `static desdeJSON(datos)` — **fábrica validadora**: comprueba que hay cuatro estrofas, que cada cuarteto
  tiene 4 versos y cada terceto 3, y que suman 14; si no, lanza un error descriptivo. Un dato mal escrito falla
  al cargar, no a mitad del pintado.
- Índices de búsqueda precalculados en el constructor (`tituloNormalizado`, `autorNormalizado`,
  `versosNormalizados`), ya que el texto de un soneto no cambia nunca.

Exporta también `normalizar(texto)`, que pasa a minúsculas y elimina los diacríticos (`NFD` + borrado de
marcas combinantes). Es lo que hace que *«gongora»* encuentre a *Góngora*.

### `js/models/SonetoRepository.js`

Dos clases:

- `SonetoRepository` — el **contrato**: `obtenerTodos()` y `obtenerPorId(id)`. La clase base lanza un error
  para dejar claro que es abstracta.
- `JsonSonetoRepository` — la implementación sobre `data/sonetos.json`: hace `fetch`, comprueba
  `response.ok`, convierte cada registro con `Soneto.desdeJSON` y **cachea** el resultado.

El modelo depende del contrato, no de la implementación. Cambiar el origen de datos por una API remota o por
`localStorage` solo exige una clase nueva y una línea distinta en `app.js`.

### `js/models/SonetoModel.js`

El estado (`sonetos`, `consulta`, `resultados`, `sonetoActual`) y la lógica de negocio.

- `inicializar()` — pide los sonetos al repositorio y emite `cargado`.
- `buscar(consulta)` — trocea la consulta en términos normalizados y puntúa cada soneto: **título ×3,
  autor ×2, verso ×1**. Un soneto entra en los resultados solo si **todos** los términos aparecen en alguno de
  sus campos; la lista se ordena por relevancia y se recorta a `MAXIMO_RESULTADOS` (3). Emite `resultados`.
- `seleccionar(id)` — fija el soneto actual y emite `seleccion`.
- `volverAlInicio()` — abandona la lectura y emite `inicio`.
- `suscribir(evento, callback)` / `emitir(evento, datos)` — el observador que sustituye a cualquier referencia
  al DOM.

De cada soneto se guarda además un `versoDestacado`, **solo cuando el hallazgo se produjo dentro del poema**:
si el término aparece en el título o en el autor, el resultado ya se explica por sí mismo y no se guarda verso
alguno. Es lo que permite al buscador enseñar el fragmento únicamente cuando aporta información.

### `js/views/NavegacionView.js`

La dueña del flujo. Indexa las secciones `[data-vista]`, escucha el botón de retorno y expone
`mostrarInicio()` y `mostrarLectura()`. El cambio se hace con la clase `vista--oculta` y el atributo `hidden`
—que además retira la vista inactiva del árbol de accesibilidad—, y mueve el foco al entrar: al botón de
retorno en la lectura, y de vuelta al campo de búsqueda al regresar.

### `js/views/BuscadorView.js`

El combobox. Vincula con `addEventListener` los eventos `input`, `focus`, `click` y `keydown` del campo, el
`click` de la lista (delegación sobre `[data-soneto-id]`) y un `click` en `document` para replegarse al
perder el foco.

- Navegación con **↑ / ↓** (circular), **Enter** para confirmar y **Escape** para cerrar, manteniendo
  `aria-expanded` y `aria-activedescendant` sincronizados.
- `renderizarResultados()` construye cada opción con `createElement` y `textContent` —nunca `innerHTML` con
  datos—: título, autor y, si el modelo lo ha guardado, el verso coincidente. El texto se presenta limpio, sin
  resaltar los términos, para que la lista se lea como un índice y no como un informe de búsqueda.
- La lista nace replegada (`hidden`) y solo se despliega al activar el campo.
- Al pulsar el campo cuando ya muestra un título elegido, se ofrece el almacén completo y se preselecciona el
  texto para que escribir lo sustituya.

### `js/views/SonetoView.js`

Pinta el lienzo. `renderizar(soneto)` construye `<header>` —título, autor y, si consta, año— + una `<section>` por estrofa + un `<p>` por verso,
con la clase modificadora correspondiente al tipo. `renderizarVacio(mensaje)` cubre el estado inicial y los
errores de carga. La transición de entrada se gobierna añadiendo y quitando la clase `soneto--entrando`.

### `js/controllers/AppController.js`

El cableado, en los dos sentidos: las intenciones del usuario (`alEscribir`, `alAbrir`, `alSeleccionar`,
`alVolver`) van a métodos del modelo, y los eventos del modelo (`resultados`, `seleccion`, `inicio`) vuelven
como órdenes de pintado y de cambio de vista. Es el único punto del programa donde las tres vistas coinciden.

### `js/app.js`

Punto de entrada y *composition root*: crea el repositorio con la URL del almacén, el modelo, las dos vistas
y el controlador, y arranca dentro de un `try/catch` que muestra un mensaje legible si el `fetch` falla
(el caso típico: abrir `index.html` con doble clic en lugar de servirlo por HTTP).

### `sonetos/`

Los cinco sonetos originales en texto plano, tal como se recibieron. Son la **fuente documental** de la que se
transcribió `data/sonetos.json`; la aplicación no los lee en ejecución.

---

## 4. Metodología y decisiones

**Flujo de datos.** Unidireccional: acción del usuario → vista → controlador → modelo → evento → controlador →
vista. No hay estado duplicado; el modelo es la única fuente de verdad. Incluso la navegación entre pantallas
pasa por él: pulsar «Volver» no oculta nada directamente, sino que llama a `volverAlInicio()` y es el evento
resultante el que cambia la vista.

**Datos como configuración.** Añadir, quitar o corregir sonetos es editar un JSON. El código no contiene ni un
verso.

**Nomenclatura.** Todo el dominio está en español (`Soneto`, `estrofas`, `versos`, `buscar`, `seleccionar`)
para que el código se lea con el mismo vocabulario que el enunciado.

**Convenciones de JavaScript**
- Solo `const` y `let`; `var` no aparece en el proyecto.
- Toda la interacción con `addEventListener` y manejadores nombrados; cero atributos `onclick`.
- Los estados visuales se cambian con `classList`, nunca escribiendo en `.style`.
- El DOM se construye con `createElement` y `textContent`, nunca inyectando `innerHTML` con datos.
- La selección de nodos se hace por atributos `data-*`, desacoplando el script de las clases de estilo.

**Convenciones de CSS**
- Una única declaración de la paleta, en `:root`, en `hsl()` parametrizado y `calc()`.
- BEM más anidamiento nativo; sin selectores de `id` ni `!important`.
- `rem`/`em` para tipografía; `%`, `vh`, `clamp()` y `min()` para contenedores. El único `px` del proyecto es
  el grosor de los bordes finos.

**Principios de la Gestalt aplicados**
- *Proximidad*: la separación entre estrofas es del orden de diez veces la separación entre versos, de modo que
  las cuatro estrofas se perciben como unidades antes de leer una sola palabra.
- *Figura y fondo*: el soneto es una hoja clara y elevada sobre el fondo; el buscador, un panel de servicio.
- *Semejanza*: la serif marca todo lo que es poema y la sans-serif todo lo que es interfaz, sin excepción.

**Jerarquía de la portada.** El título ocupa la cúspide con una escala fluida propia (`--escala-portada`,
hasta `5.5rem`), el lema cede protagonismo en versalitas discretas y el buscador aparece inmediatamente
debajo. La lista de sugerencias nace replegada: solo se despliega cuando el usuario activa el campo.

**Accesibilidad.** Contraste por encima de AA en todos los pares de color, foco visible y gestionado al cambiar
de vista, navegación completa por teclado, etiquetas asociadas (la del buscador, oculta solo visualmente con
`.visualmente-oculta`), roles ARIA en el combobox y región `aria-live` en el lienzo.

**Verificación.** La lógica del modelo se probó ejecutándola en Node con un repositorio falso —búsqueda por
autor, por título, por contenido, sin tildes, con varios términos y sin resultados— y el dataset se validó
contra la métrica del soneto. La interfaz se comprueba en el navegador según la lista de [INSTALL.md](INSTALL.md).
