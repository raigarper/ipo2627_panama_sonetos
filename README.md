# Sonetos

La aplicación web consiste en un lector de sonetos. Un `soneto` es una composición poética de 14 versos organizados en cuatro estrofas fijas: dos cuartetos (de 4 versos cada uno) y dos tercetos (de tres versos cada uno). 

Los objetivos del proyecto son: 
- Diseño cromático y tipográfico


# Descripción

- La aplicación interactúa con un solo actor que es el usuario que leerá los sonetos. 
- El sistema dispondrá de un almacén de sonetos entre los que el usuario podrá escoger para proceder a su lectura. Para cada soneto, el almacén recogerá además del propio soneto, su autor y un título identificativo.
- El sistema ofrecerá un mecanismo para que el usuario escoja el soneto que desee leer con el fin de mostrarlo en pantalla. 


# Diseño

## Arquitectura 
- La aplicación deberá estar implementada siguiendo un patrón MVC (_Model-View-Controller_) con objeto de clarificar y diferenciar las distintas responsabilidades. 

## Organización 

- Tanto la distribución del código de los ficheros como la propia organización de los ficheros incluidos en la carpeta del proyecto deberán facilitar la comprensión y el mantenimiento de la solución aportada. 
- Se empleará un mecanismo moderno y apropiado para vincular los ficheros HTML, CSS y JS.

## Estilística

La vista del sistema deberá implementarse con el objeto de diferenciar los distintos aspectos considerados: diseño cromático, tipográfico y espacial. Y cada uno estará cimentado en una sólida estrategia:
  - diseño cromático: monocromática, triádica, complementaria, etc.
  - diseño tipográfico: dos fuentes contrastadas, una única fuente con niveles distintos de realce, etc.
  - diseño espacial: selección de unidades de medida y contenedores, principios de diseño `Gestalt`, etc. 

## Interacción 

La implementación de la interacción estará guiada para favorecer la usabilidad de la aplicación

# Buenas prácticas

- Se deberá cuidar el etiquetado HTML con el objeto de reflejar adecuadamente la estructura de la página y del propio soneto.
- El empleo de una estrategia de selección en CSS de elementos HTML moderna y mantenible
- Una sólida política de coordinación de JS tanto con el DOM (_Document Object Model_) como con el CSSOM (_CSS Object Model_)


