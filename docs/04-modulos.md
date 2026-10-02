# 04 · Módulos: las cuatro máquinas

Cada método es una máquina con piezas propias, pero comparte la misma fábrica, el mismo `viewBox`
(`0 0 800 480`), la misma plantilla de cubo y el mismo contrato de motor
(`02-arquitectura.md` §4).

## Tabla resumen

| ID | Método | Metáfora | Comportamiento clave | Piezas móviles |
|---|---|---|---|---|
| `SYS_01` | `for` | Regla graduada + carro móvil + barrera láser de tope | Contador manual, corte estricto `i < length` | `#slider-carriage`, `#laser-beam` |
| `SYS_02` | `.forEach()` | Dron autónomo que escanea | Declarativo, sin contadores visibles | `#fe-drone`, `#fe-scan-beam` |
| `SYS_03` | `.map()` | Cinta transportadora + cámara de transformación | 1→1, inmutable: entrada intacta, salida nueva | `#conveyor-item`, `#map-out-slot-*` |
| `SYS_04` | `.reduce()` | Tolva de compactación | N→1, síntesis acumulativa | `#falling-block`, `#hopper-stack` |

**Convención común a las cuatro:** los datos ya procesados quedan **encendidos** (`.glow-cyan`) y
sirven de rastro. Es la misma señalización en las cuatro máquinas: cian = lo que la máquina ya
atravesó. El estado inicial de esa marca es lo que permite ver de un vistazo cuánto se avanzó.

---

## SYS_01 · `for` — la máquina de precisión

**Metáfora.** El estudiante mueve el carro él mismo. La regla está graduada, el dial marca el índice
y un láser barre la celda para decidir si hay tope. Nada avanza solo: cada avance es una instrucción
explícita del código. Por eso `for` es donde se ve el costo de la iteración manual.

**Código expuesto** (partido por fases, ver D-05):

```js
let colores = ['Rojo', 'Azul', 'Verde'];
for (let i = 0;              // 1 · inicialización  (una sola vez)
     i < colores.length;     // 2 · condición  → láser de corte
     i++) {                 // 4 · incremento → carro avanza
  console.log(colores[i]);  // 3 · cuerpo     → stdout
}
```

**Ciclo de estados.** Una inicialización única y luego **tres fases por elemento**:

| # | Fase | Línea | Piezas | Registro en stdout |
|---|---|---|---|---|
| 1 | Inicialización | 2 | Carro en posición 0, dial en 0, láser apagado | `init: i = 0…` |
| 2 | Condición | 3 | El haz láser barre la ranura; si `i === length` queda fijo | `Condición: 0 < 3 → TRUE…` |
| 3 | Cuerpo | 5 | El cubo recorrido se enciende | `stdout: "Rojo"` |
| 4 | Incremento | 4 | El dial rota, `i++` se resalta, el carro avanza un clic | `i++ → 1…` |

**Total: 11 cuadros** (1 de inicialización + 3 elementos × 3 fases + 1 corte).

**Salida.** Tras el último incremento, la condición vuelve a evaluar `3 < 3` → `FALSE`: el haz del
láser queda encendido en estado fijo y se registra el fin del bucle. La única línea que nunca se
resalta es la 1, la declaración del arreglo.

**Lo que enseña.** El índice es una variable más; la condición se reevalúa **después** de cada
cuerpo; y el corte depende de `< length`, no de `<=`.

---

## SYS_02 · `.forEach()` — el agente autónomo

**Metáfora.** Ya no hay carro ni dial: entra un dron que recorre las celdas por su cuenta y dispara
el callback al sobrevolar cada una. No existe ningún contador en pantalla, y esa ausencia es el
punto pedagógico.

**Código expuesto:**

```js
let colores = ['Rojo', 'Azul', 'Verde'];
colores.forEach(function(color) {   // 1 · invocación
  console.log(color);               // 2 · callback
});
```

**Ciclo de estados.** Dos fases por elemento:

| # | Fase | Línea | Piezas |
|---|---|---|---|
| 1 | Posicionamiento | 2 | El dron se traslada sobre la celda y enciende el cono de escaneo |
| 2 | Callback | 3 | El cubo queda encendido, se imprime el valor |

**Total: 7 cuadros** (3 elementos × 2 fases + 1 cierre). Al terminar, el dron vuelve a su posición
de base y el cono de escaneo se apaga.

**Lo que enseña.** `forEach` no devuelve nada útil — su registro de cierre dice literalmente que el
valor de retorno es `undefined`; su valor es el **efecto secundario**. Y el autónomo llega igual a
todas las celdas porque el motor de la fábrica, no tu código, lleva la cuenta.

---

## SYS_03 · `.map()` — la cadena de producción

**Metáfora.** Cinta transportadora con una cámara de transformación en medio. El dato entra **en
bruto** (gris `#334155`) y sale **transformado** (azul `--blue-accent`). Hay dos estanterías
distintas: la de origen se rotula *intacta* y nunca se toca; la de salida recibe un ítem por cada
entrada, y cada uno queda encendido con su texto ya transformado.

**Código expuesto:**

```js
let productos = ['papas', 'gaseosa'];
let enMayusculas = productos.map(     // 1 · el ítem sale de origen, en bruto
  item => item.toUpperCase()          // 2 · la cámara lo transforma
);
```

**Ciclo de estados.** Dos fases por ítem:

| # | Fase | Línea | Piezas |
|---|---|---|---|
| 1 | Entrada | 2 | El ítem aparece en la cinta, gris, con su texto original |
| 2 | Cámara | 3 | Se vuelve azul, su texto pasa a mayúsculas y se deposita encendido en la estantería |

**Total: 5 cuadros** (2 ítems × 2 fases + 1 cierre). Al terminar, la cinta queda vacía y la
estantería muestra los 2 resultados, que además se leen como arreglo en la máquina
(`salida → ["PAPAS", "GASEOSA"]`).

**Lo que enseña.** Correspondencia 1:1 (n entradas, n salidas) e **inmutabilidad**: la estantería de
origen no se toca nunca. El color es el argumento — gris entró, azul salió, el original sigue gris.

---

## SYS_04 · `.reduce()` — la tolva de compactación

**Metáfora.** N bloques caen por una tolva y se sintetizan progresivamente en un único bloque
compactado en la base. No hay salida por cada entrada: hay una sola, y se construye a lo largo del
recorrido. El bloque compactado **crece** dentro de la tolva a medida que entra cada entrada.

**Código expuesto:**

```js
let valores = [10, 20, 30];
let total = valores.reduce(     // 1 · el bloque cae en la tolva
  (acc, curr) => acc + curr,    // 2 · síntesis dentro de la tolva
  0                            // valor inicial del acumulador
);
```

**Ciclo de estados.** Dos fases por entrada:

| # | Fase | Línea | Piezas |
|---|---|---|---|
| 1 | Caída | 2 | El bloque con el valor actual desciende a la tolva |
| 2 | Síntesis | 3 | El acumulador se actualiza, la pila crece y se imprime el cómputo |

**Total: 7 cuadros** (3 entradas × 2 fases + 1 prensa de compactación).

**Lo que enseña.** El `0` inicial no es decorativo: define el **tipo** y permite el `acc + curr` de
la primera iteración. El registro de cierre advierte qué pasaría si se omite. Y `reduce` cambia la
dimensionalidad: 3 entradas terminan en 1 valor.

---

## Comparación de los cuatro: lo que la fábrica enseña

| Pregunta | `for` | `.forEach()` | `.map()` | `.reduce()` |
|---|---|---|---|---|
| ¿Quién lleva la cuenta? | vos | el motor | el motor | el motor |
| ¿Cuántas salidas? | N (stdout) | N (efecto) | N (nuevo arreglo) | **1** |
| ¿El original cambia? | no | no | **no** | no |
| ¿Necesita estado extra? | sí (`i`) | no | no | **sí** (`acc`) |
| Dimensión | N → N | N → N | N → N | N → **1** |
| Cuadros hasta completar | 11 | 7 | 5 | 7 |

Las dos filas de *estado extra* y *salidas* son las que separan los métodos. Todo lo demás es la
misma fábrica recorriendo un rack de tres cajas.