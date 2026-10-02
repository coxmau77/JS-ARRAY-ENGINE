# 02 · Arquitectura

## 1. Mapa de navegación

```text
 ┌──────────────────────────────────────────────────────────────┐
 │              VISTA 0 · EL HUB (assets/refs/index.jpg)       │
 │                 Cuadrícula de 4 módulos                      │
 └───────┬──────────────┬──────────────┬──────────────┬─────────┘
         │              │              │              │
         ▼ (zoom-in)    ▼              ▼              ▼
   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
   │ MÓDULO 01 │◄─┼───────────┼──┼───────────┼─►│ MÓDULO 04 │
   │  for      │  │ .forEach()│  │  .map()   │  │ .reduce() │
   └───────────┘  └───────────┘  └───────────┘  └───────────┘
         ▲          (paneo lateral entre módulos)         ▲
```

Dos niveles de profundidad. El Hub es un plano de conjunto: cuatro tarjetas con especificación
técnica (`SYS_01 // …`, `SPEC: …`) y una miniatura SVG. Al elegir una, se entra a su simulador.

**Rutas.** La SPA no usa el History API: son cinco vistas dentro de un documento, controladas por
`switchView(name)` y el atributo `data-view` de las pestañas. Justificación: el proyecto no tiene
enrutador, no hay URLs que compartir y el Hub↔detalle no necesita ser enlazable. Si alguna vez hace
falta history, el punto de extensión es `switchView` en `scripts/app.js`.

## 2. Layout del simulador

```text
┌──────────────────────────────┬─────────────────────────────────────┐
│ PANEL DE TELEMETRÍA (460px)  │  VIEWPORT DE LA MÁQUINA             │
│                              │  ┌─ viewport-header ──────────────┐  │
│ ┌──────────────────────────┐ │  │ título          badge ISO     │  │
│ │ código por líneas        │ │  └───────────────────────────────┘  │
│ └──────────────────────────┘ │                                     │
│ [⏭ Paso] [▶/⏸] [↺ Reset]   │        SVG isométrico                │
│ Clock Speed ──────●────     │        viewBox 0 0 800 480           │
│                              │                                     │
│ ┌──────────────────────────┐ │                                     │
│ │ terminal stdout          │ │                                     │
│ └──────────────────────────┘ │                                     │
└──────────────────────────────┴─────────────────────────────────────┘
```

Debajo de 1024 px la grilla colapsa a una columna: primero la máquina, después la telemetría.

## 3. Capas de sincronización

El motor mantiene **tres capas en el mismo instante**, que es lo que hace que la animación sea
andamiaje cognitivo y no adorno:

```text
 ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
 │  CAPA 1       │   │  CAPA 2       │   │  CAPA 3       │
 │  Resaltado de │──▶│  Animación    │──▶│  Terminal     │
 │  código       │   │  SVG          │   │  STDOUT       │
 └───────────────┘   └───────────────┘   └───────────────┘
```

Una sola llamada al motor (`step` / `tick`) produce el mismo cuadro en las tres. Nunca se anima una
pieza sin tocar el código, ni se imprime una línea sin mover una pieza.

## 4. Máquina de estados y contrato de un módulo

### 4.1 Regla de oro

> **El estado es la única fuente de verdad, y `render(state)` es la única función que toca el DOM.**

Ni el motor ni el temporizador de reproducción mutan contadores por su cuenta. Las transiciones son
síncronas y puras, así que la reentrada es imposible por construcción (fue la causa del defecto de
`forEach`, ver D-08).

### 4.2 Contrato

```js
Engine.register(id, {
  id,                // 'for' | 'forEach' | 'map' | 'reduce'
  codePrefix,        // prefijo de los ids de línea: `${codePrefix}-l1`, `-l2`…
  consoleId,         // id del panel stdout del módulo
  speed,             // ms por paso (default 900), ajustable en vivo

  createState(),     // () => estado inicial puro

  advance(state),    // (state) => { line, log, done }
                     //   muta `state`, devuelve qué línea resaltar y qué imprimir.
                     //   `done: true` cierra la iteración.

  render(state),     // aplica `state` al DOM. Sin efectos, sin temporizadores.

  onComplete(state)  // mensaje de cierre (opcional)
});
```

El motor se encarga de todo lo demás: resaltar línea, imprimir en la terminal, alterar el bucle,
controlar el autoscroll y habilitar/deshabilitar los botones.

### 4.3 API pública de `scripts/engine.js`

```js
Engine.register(id, definition)
Engine.step(id)        // avanza un cuadro. Ignorado si la máquina está en reproducción.
Engine.play(id)        // arranca / reanuda la reproducción
Engine.pause(id)       // pausa conservando el estado
Engine.toggle(id)      // play ⇄ pause según el estado actual
Engine.reset(id)       // vuelve a createState(), limpia terminal y restablece las piezas
Engine.setSpeed(id, ms)
Engine.isRunning(id)
```

### 4.4 Animación

La animación **no** la hace JavaScript. `render()` escribe `transform` y CSS la interpola:

```css
[data-part] { transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
[data-part="press"] { transition: transform 0.5s cubic-bezier(0.5, 0, 1, 1); }
```

Consecuencia práctica: cambiar el Clock Speed no altera la duración de la transición, solo el ritmo
de los cuadros. Es exactamente el comportamiento de una máquina a velocidad variable.

## 5. Stack

| Capa | Elección | Razón |
|---|---|---|
| Markup | HTML5 semántico | `<main>`, `<section>`, `<article>`, `<nav>` con `aria` en los controles |
| Estilos | CSS moderno sin framework | Custom Properties + `clip-path` + Grid. Sin build. |
| Vectores | SVG inline con ids estables | Los módulos JS encuentran las piezas por id |
| Motor | JS plano, scripts clásicos | Se abre con doble clic; sin servidor ni bundler |
| Transiciones | View Transitions API con *fallback* | Zoom Hub→detalle en navegadores compatibles |

**Por qué scripts clásicos y no ES Modules.** Los módulos ES están bloqueados por CORS sobre
`file://`. Como el proyecto se abre localmente sin servidor, la comunicación entre archivos va por un
registro global (`window.Engine`, `window.simulators`) en orden de carga explícito en `index.html`.
Es el precio de no pedirle tooling al usuario, y está asumido a conciencia.

## 6. Transiciones entre vistas

| Transición | Técnica | Propósito |
|---|---|---|
| Hub → módulo | View Transitions API con *fallback* a `fadeIn` | Percepción de "acercarse a una máquina" |
| Módulo → módulo | `fadeIn` + panes activos sincronizados | Continuidad espacial: comparar dos máquinas |
| Hover en Hub | `transform: translateY(-2px)` + resplandor cian | Descubrimiento: qué es clicable |
| Línea de código activa | Fondo cian 12 % + borde izquierdo 3 px | Enganche con la pieza que se mueve |
| Breadcrumbs | Barra `[ ← HUB ] / <MÓDULO>` visible solo dentro de una máquina | Orientar: siempre se sabe dónde se está y cómo volver |

La barra de breadcrumbs es un elemento único en el documento (`#breadcrumbs`), no uno por vista:
`switchView` la oculta en el Hub y actualiza `#breadcrumb-current`. Evita duplicar marcado y
garantiza que nunca pueda desincronizarse de la vista activa.

## 7. Accesibilidad mínima

- Todos los controles son `<button>` reales, alcanzables por teclado.
- `.stdout-box` es `role="log"` para que un lector de pantalla anuncie la salida.
- Las transiciones se desactivan con `prefers-reduced-motion: reduce`; el motor sigue siendo usable
  a paso manual porque el contenido no depende de la animación.
- Contraste de `--text-dim` sobre `--bg-subpanel` ≥ 4.5:1.