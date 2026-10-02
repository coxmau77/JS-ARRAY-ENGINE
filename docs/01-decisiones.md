# 01 · Bitácora de decisiones

Registro de las decisiones de diseño que dieron origen al proyecto y de las alternativas que se
descartaron. Este archivo existe para que una decisión vieja no se re-litigue por falta de contexto.

---

## D-01 · La iteración se explica con máquinas, no con diagramas de flujo

**Contexto.** La primera formulación del proyecto era una SPA "didáctica e interactiva" con
animaciones y transiciones como andamiaje cognitivo.

**Decisión.** Cada método de iteración se modela como una **máquina industrial isométrica** con
piezas móviles (carro, dron, cinta, tolva) y señales de estado (láser, LCD, haces).

**Por qué.** Un diagrama de flujo explica *control*; una máquina con piezas explica *mecánica*. La
ventaja pedagógica es concreta: el estudiante puede preguntar "¿qué pieza se movió?" y la respuesta
es literalmente visible y localizable en el código.

**Alternativa descartada.** Animación abstracta sobre el arreglo (números flotando). Es más fácil de
implementar pero no genera preguntas: no hay nada que señalar.

---

## D-02 · Estética blueprint de ingeniería en dark mode

**Decisión.** Fondo monocromático azul-negro con retícula milimétrica doble, trazos en grafito
técnico y **acento cian reservado exclusivamente** para estado activo, energía y flujo de datos.

**Por qué.** El cian es un color de señalización industrial, no decorativo. Si todo Brillara, nada
se activaría. La restricción de color es lo que convierte el brillo en información.

**Alternativa descartada.** Paleta libre por módulo (cada máquina con su color propio). Descartada
porque rompe la lectura transversal: el cian debe significar lo mismo en las cuatro máquinas.

---

## D-03 · Proyección isométrica a 30° fija

**Decisión.** Todas las máquinas comparten la misma geometría de cubo (cara superior a 30°, la misma
en las cuatro vistas) y el mismo `viewBox` de `800 × 480`.

**Por qué.** Un cubo dibujado con la misma plantilla en las cuatro máquinas es lo que hace que el
lector perciba "son la misma fábrica" y no "cuatro diagrams distintos".

**Alternativa descartada.** Dibujar cada máquina a mano en perspectiva libre. Resultado más bonito,
memoria visual más débil.

---

## D-04 · Vista en dos columnas: telemetría izquierda, máquina derecha

**Decisión.** El código y la consola ocupan una columna fija de 460 px; la máquina, el resto.

**Por qué.** El ojo lee de izquierda a derecha: *instrucción → ejecución*. La máquina queda a la
derecha porque es el resultado de la instrucción. El ancho fijo de la columna garantiza que el
código nunca se re-envuelva al cambiar de máquina.

---

## D-05 · El código se expone descompuesto por líneas, no como bloque plano

**Decisión.** Cada línea es un `<span class="code-line">` con id propio y resaltable de forma
individual.

**Por qué.** La sincronización código↔máquina es el objetivo pedagógico central. Si la línea activa
no es un elemento del DOM, no se puede resaltar, y sin resaltado no hay sincronización.

**Consecuencia.** El `for` se muestra partido en varias líneas (init / condición / cuerpo /
incremento) aunque en JavaScript quepa en una. No es un capricho estético: es lo que permite
resaltar `i++` como fase propia.

---

## D-06 · Cuatro máquinas siempre, cero configuración de datos

**Decisión.** Los arreglos de ejemplo están fijos en el código (`['Rojo','Azul','Verde']`,
`['papas','gaseosa']`, `[10,20,30]`).

**Por qué.** La metáfora industrial requiere que el ejemplo sea legible de un vistazo: tres colores,
dos palabras, tres números. Arreglos grandes o aleativos rompen la lectura visual de la máquina y
agregan ruido que no aporta al concepto.

**Alternativa descartada.** Input editable por el usuario. Se evaluó y se postergó: es una función
distinta (playground) que contradice el no-objetivo de "no es un playground de JS".

---

## D-07 · La estructura del proyecto separa contenido, estilo y comportamiento

**Decisión.** `index.html` (solo markup), `styles/` (4 archivos por responsabilidad),
`scripts/modules/` (una máquina por archivo) y `docs/` (la especificación).

**Por qué.** El prototipo original vivía completo dentro de un bloque de código del README. Eso
hacía imposible versionar un cambio, revisarlo o testearlo. La especificación de diseño y el
código además estaban duplicados: los tokens estaban escritos dos veces y las metáforas tres.

**Alternativa descartada.** Mantener el monolito en un solo archivo. Se consideró para "no tener
build"; se descartó porque los módulos ya se comunicaban por un registro global y separar archivos
no requiere ninguna herramienta.

---

## D-08 · El motor es un `Player` genérico, no cuatro máquinas de tiempo distintas

**Decisión.** Un único motor (`scripts/engine.js`) maneja paso, reproducción, pausa, reset y
velocidad para las cuatro máquinas. Cada módulo solo declara su estado y sus transiciones.

**Por qué.** El prototipo tenía cuatro implementaciones de `play()`/`reset()` copiadas a mano, con
un defecto concreto: en `forEach`, `map` y `reduce` el índice avanzaba dentro de un `setTimeout`
mientras el `setInterval` de reproducción seguía corriendo. Eso hacía que un elemento se saltara o
se escaneara dos veces, y hacía imposible una velocidad variable.

**Consecuencia.** Las transiciones de estado son síncronas y puras; la animación la resuelve CSS
mediante `transition`, no JavaScript con temporizadores encadenados.

---

## D-09 · Las referencias visuales viven en `assets/refs/` y se citan desde el código

**Decisión.** Cada SVG del proyecto tiene un comentario que apunta a su lámina de referencia
(`assets/refs/for.jpg`, etc.).

**Por qué.** Las láminas son la fuente de la geometría. Sin ellas, corregir un SVG es adivinar la
intención original.

**Alternativa descartada.** Sin referencias. Fue el estado inicial y dejó la geometría del láser y
los callouts sin justificación documentada.

---

## Pendientes conocidos

- Las láminas de referencia están en poder del autor del proyecto pero **no versionadas**. Hay que
  copiarlas a `assets/refs/` antes de poder corregir geometría con criterio.
- No hay tests automatizados: la verificación es manual contra `05-checklist.md`. La ausencia de
  build lo justifica, pero es una deuda conocida.