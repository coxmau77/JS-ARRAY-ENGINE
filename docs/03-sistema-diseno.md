# 03 · Sistema de diseño

Fuente de verdad del proyecto. **Cualquier valor nuevo se declara acá primero y en un solo lugar:**
`styles/tokens.css` (variables) y `styles/machines.css` (geometría SVG). Si una decisión aparece
también en el código, es una deuda.

## 1. Dirección artística

*Blueprint técnico de ingeniería de software*: fondo monocromático con retícula milimétrica, trazos
estructurales en grafito, y **acento cian reservado para estado activo, energía y flujo de datos**.
Nada más usa cian. Un color que significa "encendido" solo funciona si no está en todas partes.

---

## 2. Tokens

### 2.1 Fondos y capas

| Token | Valor | Uso |
|---|---|---|
| `--bg-space` | `#070a12` | Canvas global exterior |
| `--bg-blueprint` | `#0b1324` | Superficie de tarjetas y módulos principales |
| `--bg-panel` | `#0f1c34` | Contenedores de controles |
| `--bg-subpanel` | `#091322` | Terminales, displays, cavidades mecánicas |

Cuatro capas, de fondo a frente. Una pieza que debe verse "dentro de la máquina" usa
`--bg-subpanel`, nunca un color suelto.

### 2.2 Retícula

| Token | Valor | Uso |
|---|---|---|
| `--grid-line` | `rgba(56, 189, 248, 0.07)` | Malla secundaria (20 px) |
| `--grid-axis` | `rgba(56, 189, 248, 0.16)` | Malla estructural (100 px) |
| `--grid-step` | `20px` | Lado de la malla secundaria |
| `--grid-axis-step` | `100px` | Lado de la malla estructural |

La retícula es el cian al 7 %: se percibe como textura de fondo, nunca como contenido.

### 2.3 Acentos de energía

| Token | Valor | Uso |
|---|---|---|
| `--cyan-bright` | `#00f0ff` | Estado activo, láser, foco, resplandor |
| `--cyan-glow` | `rgba(0, 240, 255, 0.35)` | Halo difuso de componentes energizados |
| `--blue-accent` | `#2563eb` | Datos **transformados** o **condensados** |
| `--blue-laser` | `#0284c7` | Haces de luz, líneas guía, sensores |

`--blue-accent` tiene un significado semántico estable: azul = el dato ya pasó por la máquina.
Aparece solo en la salida de `.map()` y en el bloque compactado de `.reduce()`.

### 2.4 Texto y trazos

| Token | Valor | Uso |
|---|---|---|
| `--text-main` | `#f1f5f9` | Títulos y datos activos |
| `--text-dim` | `#94a3b8` | Etiquetas descriptivas, interfaces pasivas |
| `--text-muted` | `#64748b` | Metadatos, comentarios, callouts |
| `--border-technical` | `#1e3a64` | Chasis, estructura metálica |
| `--border-accent` | `#00f0ff` | Bordes energizados |

### 2.5 Movimiento

| Token | Valor | Uso |
|---|---|---|
| `--transition` | `all 0.3s cubic-bezier(0.16, 1, 0.3, 1)` | Estados de UI (hover, tabs) |
| `--ease-mech` | `cubic-bezier(0.16, 1, 0.3, 1)` | Desplazamiento de piezas: arranca y se frena |
| `--ease-press` | `cubic-bezier(0.5, 0, 1, 1)` | Caída y compactación: arranca rápido, termina duro |

---

## 3. Geometría isométrica

### 3.1 Ángulo

Proyección axonométrica a **30° respecto al plano horizontal**. Todas las máquinas comparten las
mismas coordenadas base de cubo; es lo que hace que el lector perciba una sola fábrica.

### 3.2 Plantilla de cubo (viewBox local, origen en 0,0)

| Cara | Polígono | Relleno |
|---|---|---|
| Superior | `polygon(40,20 80,0 120,20 80,40)` | `#1e293b` |
| Izquierda | `polygon(40,20 80,40 80,85 40,65)` | `#0f172a` |
| Derecha | `polygon(80,40 120,20 120,65 80,85)` | `#1e293b` |

Clases: `.iso-cube-top`, `.iso-cube-left`, `.iso-cube-right`. La izquierda es siempre la más
oscura: da volumen sin necesidad de degradados.

### 3.3 Estados

| Clase | Efecto |
|---|---|
| `.glow-cyan` | Trazo cian + `drop-shadow` 6 px: el cubo está **escaneando** |
| `.fill-cyan` | Relleno cian sólido: el cubo está **seleccionado o en foco** |

Estos son los únicos dos estados que JS puede poner sobre una pieza. Cualquier otro efecto se
describe con un `data-part`, nunca con una clase nueva.

### 3.4 Calouts

```text
 (ancla circular) ──── línea discontinua 45°/90° ────► leyenda monoespaciada
     stroke-dasharray: 4 2                               fill: --text-dim
```

| Elemento | Clase |
|---|---|
| Línea guía | `.callout-line` |
| Leyenda | `.callout-label` |
| Ancla circular | `.callout-anchor` |

Toda pieza con nombre propio lleva un ancla circular en el punto exacto al que apunta la leyenda.

---

## 4. Cortes biselados

**Prohibido `border-radius` en contenedores estructurales.** El bisel es lo que da el aspecto de
consola industrial; una esquina curva rompe la lectura de "chasis". Un `border-radius: 4px` survives
únicamente en el bloque de código, por ser un área de lectura y no una carcasa.

Los tres cortes se nombran como token, no como `clip-path` suelto:

| Token | Corte | Se aplica a |
|---|---|---|
| `--chamfer-card` | 16 px, esquinas opuestas | Tarjetas del Hub |
| `--chamfer-control` | 8 px | Botones, tabs, indicadores LCD |
| `--chamfer-viewport` | 24 px, superior derecha | Viewport de la máquina |

```css
--chamfer-card:    polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
--chamfer-control: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
--chamfer-viewport: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%);
```

El `--chamfer-viewport` es asimétrico a propósito: simula la esquina de un monitor inclinado.

---

## 5. Tipografía y señalética

### 5.1 Jerarquía

| Rol | Fuente | Tratamiento |
|---|---|---|
| Código, variables, contadores | `Fira Code` (fallback `JetBrains Mono`) | monoespaciada, `0.82rem` |
| Encabezados | `Inter` 700–800 | MAYÚSCULAS, `letter-spacing: 0.1em` |
| Etiquetas técnicas | `Fira Code` | `text-transform: uppercase`, `letter-spacing: 0.06em` |

Todo dato que la máquina "lee en voz alta" (índice `i`, valores `acc`, texto de los cubos) va en
monoespaciada: es una lectura instrumental, no una lectura de texto.

### 5.2 Convenciones de señalética

- Toda sección lleva **código serial** (`SYS_01 // SECUENCIAL_MECANICO`) y **especificación**
  (`SPEC: O(N) MANUAL`). Es lo que permite hablar de la aplicación como un sistema con piezas
  catalogadas.
- Las descripciones del Hub son **una sola oración** en `card-footer`, empezando por
  `**for:**`, con el nombre del método en cian.
- Los badges de `viewport-header` describen el modo operativo de la máquina
  (`SISTEMA_MECÁNICO // TOPE_LÁSER`), no una decoration.
- Los títulos de sección (`section-title`) van en cian y mayúsculas: son la voz del operador.

---

## 6. Reglas para agregar una máquina nueva

1. Copiar la plantilla de cubo de §3.2. No inventes una proporción nueva.
2. Reutilizar `--chamfer-*` y los tokens de paleta. Nada de colores literales nuevos salvo en las
   tres caras del cubo.
3. Nombrar las piezas móviles con `id` (`#piston`, `#cinta`, `#drone`) y marcarlas con
   `data-part` para que hereden la transición de §4.4 de `02-arquitectura.md`.
4. Cada pieza con nombre propio necesita su ancla y su leyenda.
5. Verificar contra `05-checklist.md`.