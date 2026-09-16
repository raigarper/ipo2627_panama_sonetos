# CLAUDE.md — Reglas de desarrollo del proyecto

Instrucciones obligatorias para cualquier agente que trabaje en este repositorio.
El contexto funcional y la explicación fichero a fichero están en [README.md](README.md); aquí solo van las
**normas**. Ante un conflicto entre lo que hace el código y lo que dice este documento, manda este documento.

## Contexto en una línea

Lector web de sonetos, práctica de Interacción Persona-Ordenador. HTML + CSS + JavaScript Vanilla, patrón MVC
con Repository. **Sin dependencias, sin framework, sin build.** El proyecto se evalúa por la calidad de la
interfaz (diseño cromático, tipográfico y espacial) y por la limpieza de la arquitectura.

## Prohibiciones absolutas

Estas reglas vienen del temario de la asignatura. Incumplir cualquiera invalida el trabajo:

| Nunca | Siempre |
|---|---|
| `var` | `const`, y `let` solo si hay reasignación |
| `onclick` u otros atributos de evento en el HTML | `addEventListener` con manejador nombrado |
| `elemento.style.loQueSea = …` | `classList.add/remove/toggle` |
| `innerHTML` con datos | `createElement` + `textContent` |
| Nombres de color (`red`), `#hex` o `rgb()` en componentes | `hsl()` parametrizado desde `:root` |
| Valores de color, tamaño o espacio sueltos en un componente | `var(--variable)` declarada en `variables.css` |
| `px` (salvo el grosor de bordes finos) | `rem`/`em` en texto; `%`, `vh`, `clamp()`, `min()` en contenedores |
| Selectores de `id` o `!important` en CSS | Clases BEM |
| Añadir librerías, CDN, npm o pasos de compilación | Plataforma web nativa |

Únicas excepciones vivas a la regla del `px`: `--borde-fino: 1px` en `css/variables.css` y el `1px` de la
utilidad de accesibilidad `.visualmente-oculta` en `css/components.css`.

## Arquitectura: qué puede hacer cada capa

```
Vista ──eventos──▶ Controlador ──llamadas──▶ Modelo ──▶ Repositorio ──▶ data/sonetos.json
  ▲                     │                       │
  └──órdenes de pintado─┘◀──eventos (observador)┘
```

- **`js/models/`** — estado y lógica de negocio. **No puede** tocar el DOM, ni importar vistas, ni conocer
  `document`. Avisa de los cambios con `emitir(evento, datos)`. Debe poder ejecutarse en Node.
- **`js/views/`** — leen y escriben el DOM y escuchan eventos. **No pueden** contener lógica de negocio,
  importar el modelo (salvo utilidades puras como `normalizar`) ni hablar con otra vista.
- **`js/controllers/`** — el único punto donde vistas y modelo se encuentran. **No manipula el DOM.**
- **`js/views/NavegacionView.js`** — dueña de la alternancia entre las dos vistas. La aplicación muestra
  **una sola** pantalla cada vez (inicio o lectura) y el cambio se hace con clases de estado
  (`vista--oculta`) más el atributo `hidden`; ninguna otra pieza puede mostrar u ocultar vistas.
- **`js/models/SonetoRepository.js`** — toda la persistencia. Si cambia el origen de los datos, se añade una
  subclase nueva; el modelo no se toca.
- **`js/app.js`** — *composition root*: instancia y arranca. Nada de lógica.

Regla práctica: si aparece `document` fuera de `js/views/`, está mal colocado.

## Convenciones de código

- **Idioma**: todo el dominio y la API interna, en español (`Soneto`, `estrofas`, `buscar`, `seleccionar`).
  Comentarios en español, y solo para explicar **por qué**, nunca qué hace la línea siguiente.
- **Módulos ES nativos** con extensión explícita en los imports (`"./Soneto.js"`). Un fichero, una clase.
- **Nodos del DOM** localizados por atributos `data-*` (`[data-buscador]`), nunca por clase de estilo ni `id`,
  para que renombrar CSS no rompa el JS.
- **Indentación**: 2 espacios en JS y HTML, 4 en CSS (respeta lo que ya hay en cada fichero).
- Nada de `console.log` fuera del `catch` de arranque.

## Convenciones de CSS

- Orden de cascada fijo en el `<head>`: `reset` → `variables` → `layout` → `components`. No añadas más hojas
  sin una razón estructural; si la hay, enlázala en su sitio dentro de ese orden.
- `variables.css` es la **única** fuente de colores, tipografías, escalas y espacios. Un componente que
  necesita un valor nuevo declara antes la variable aquí.
- La paleta es **monocromática**: un solo `--tono`, todo lo demás derivado con `calc()` sobre saturación y
  luminosidad. Cambiar `--tono` debe seguir revistiendo la aplicación entera de forma coherente.
- **BEM** (`bloque__elemento--modificador`) con **anidamiento nativo**: los elementos de un bloque se escriben
  dentro de la llave de ese bloque.
- Todo nodo estructural o intermedio compone con **Grid o Flexbox**. El flujo normal queda para las hojas de
  texto (`p`, `span`).
- Los estados son **clases modificadoras** (`--abierto`, `--activa`, `--vacio`), aplicadas desde el JS.

## Criterios de diseño que no se pueden degradar

- **Proximidad (Gestalt)**: la separación entre estrofas debe seguir siendo muy superior a la separación entre
  versos. Es lo que hace legible la métrica del soneto.
- **Figura y fondo**: el soneto es una hoja clara y elevada; el buscador, un panel de servicio. No los unifiques.
- **Semejanza**: la serif es del poema y la sans-serif es de la interfaz. Sin excepciones.
- **Medida de lectura**: los versos no superan `--medida-verso` (≈60 caracteres).
- **Accesibilidad**: contraste ≥ 4.5:1, foco visible, navegación completa por teclado, roles ARIA del combobox
  y `aria-live` del lienzo sincronizados con lo que se pinta.

## Datos

`data/sonetos.json` es configuración, no código: **ningún verso vive en un `.js`**. Todo soneto tiene cuatro
estrofas, dos `cuarteto` de 4 versos y dos `terceto` de 3, catorce en total; `Soneto.desdeJSON` lo valida y
debe seguir haciéndolo. Para añadir contenido se edita el JSON y nada más.

`sonetos/*.md` es la fuente documental original: **no se modifica** y no se lee en ejecución.

## Antes de dar algo por terminado

```bash
# Sin antipatrones en JS/HTML (debe salir vacío)
grep -rn "var \|onclick\|\.style\.\|innerHTML" js/ index.html

# Sin px ni colores literales en CSS (solo las dos excepciones documentadas)
grep -rn "px\|rgb(\|#[0-9a-fA-F]\{3,6\}" css/

# La aplicación se sirve por HTTP, nunca file://
python -m http.server 8000
```

Y comprueba en el navegador la lista de verificación de [INSTALL.md](INSTALL.md): carga sin errores en consola,
despliegue del buscador, búsqueda por título, autor y contenido, búsqueda sin tildes, navegación con
`↑ ↓ Enter Escape`, las cuatro estrofas bien separadas y el colapso a una columna por debajo de `48em`.

La lógica del modelo se puede probar sin navegador ejecutándola en Node con un repositorio falso que extienda
`SonetoRepository`; es la forma más rápida de validar cambios en la búsqueda.

## Alcance

Es una práctica de asignatura evaluada por su interfaz y su arquitectura. **No añadas funcionalidad que no se
haya pedido**, ni backend, ni persistencia de sesión, ni analítica, ni un gestor de temas. Si detectas algo que
mejoraría el resultado, propónlo antes de implementarlo.
