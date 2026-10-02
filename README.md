# JS Array Engine

SPA didáctica que explica la iteración de arrays en JavaScript con una **analogía industrial
isométrica**. Cada método es una máquina: se corre, se pausa y se avanza paso a paso, con el
código resaltándose al ritmo de las piezas.

La documentación es la especificación canónica; el código es su consecuencia. Si cambiás un color o una geometría, definí el token en `styles/tokens.css` y actualizá `docs/03-sistema-diseno.md`: la especificación va primero, el código después.

## Qué hay adentro

| | |
|---|---|
| `SYS_01 for` | Regla graduada, carro móvil, barrera láser de tope. El contador lo manejás vos. |
| `SYS_02 .forEach()` | Dron autónomo que escanea cada celda. Sin contadores en pantalla. |
| `SYS_03 .map()` | Cinta transportadora y cámara de transformación. 1→1, el original queda intacto. |
| `SYS_04 .reduce()` | Tolva de compactación. N entradas se sintetizan en 1 valor. |

## Cómo abrir

Doble clic en `index.html`. No hay build, ni dependencias, ni servidor: son HTML, CSS y JS planos.
Necesitás conexión solo para las dos fuentes de Google (`Fira Code`, `Inter`); sin ellas la app
funciona igual con las monoespaciada y la sans-serif del sistema.

## Estructura

```text
index.html              markup de las 5 vistas (Hub + 4 módulos). Sin estilos ni scripts inline.
styles/
  tokens.css            paleta, retícula, tipografía, movimiento. Fuente única de valores.
  layout.css            estructura espacial: header, grilla del Hub, división del simulador.
  components.css        widgets: tabs, tarjetas, botones, bloque de código, terminal.
  machines.css          geometría SVG isométrica, estados de excitación, callouts.
scripts/
  app.js                enrutado de vistas y transiciones entre ellas.
  engine.js             Player genérico: step / play / pause / reset / velocidad.
  modules/
    for.js              estado y transiciones de SYS_01
    forEach.js          estado y transiciones de SYS_02
    map.js              estado y transiciones de SYS_03
    reduce.js           estado y transiciones de SYS_04
tools/
  verify.js             arnés de verificación sin dependencias: node tools/verify.js
docs/                   la especificación. Leela antes de tocar el código.
assets/refs/            láminas de referencia de la geometría original.
```

## Documentación

Empezá por el brief; la especificación de diseño es la parte que no se negocia.

| Doc | Qué resuelve |
|---|---|
| [`docs/00-brief.md`](docs/00-brief.md) | Objetivo pedagógico, alcance, no-objetivos, criterio de éxito |
| [`docs/01-decisiones.md`](docs/01-decisiones.md) | Bitácora: qué se decidió, por qué, y qué alternativa se descartó |
| [`docs/02-arquitectura.md`](docs/02-arquitectura.md) | Navegación, layout, capas de sincronización, contrato de un módulo, stack |
| [`docs/03-sistema-diseno.md`](docs/03-sistema-diseno.md) | Tokens, paleta, geometría isométrica, biseles, tipografía, señalética |
| [`docs/04-modulos.md`](docs/04-modulos.md) | Ficha por máquina: metáfora, ciclo de estados, qué enseña |
| [`docs/05-checklist.md`](docs/05-checklist.md) | Checklist de extensión y verificación (arnés + tabla manual) |

## Verificar

```bash
node tools/verify.js
```

Ejecuta el código real de los cuatro módulos contra un DOM simulado y comprueba 44 cosas: cantidad
de cuadros de cada máquina, registros de stdout, posición final de cada pieza, rastro encendido,
reset determinista y la regresión de saltos de elemento (D-08). No necesita `npm install`. La tabla
manual de `docs/05-checklist.md` §C.3 cubre lo que el arnés no puede ver: layout, SVG y CSS.

## Principios que guían el proyecto

1. **La animación es andamiaje cognitivo.** Orienta, retroalimenta estado y jerarquiza. Si no cumple
   una de las tres, no entra.
2. **El cian significa "encendido".** Ningún otro color lo usa, para que el brillo sea información y
   no decoración.
3. **El estado es la única fuente de verdad.** `render(state)` es la única función que toca el DOM.
   Sin temporizadores encadenados, sin carreras entre pasos.
4. **El código se descompone por fases**, aunque quepa en una línea, para que cada movimiento
   mecánico tenga una línea que resaltar.
5. **Un valor, un lugar.** Los tokens viven en `styles/tokens.css` y las reglas geométricas en
   `styles/machines.css`.

## Estado

Implementado y verificado a mano contra `docs/05-checklist.md` §C.

- [x] Hub con 4 tarjetas y navegación entre vistas
- [x] Cuatro máquinas SVG isométricas con sus ciclos de estados
- [x] Tres capas sincronizadas por paso: resaltado de código, animación SVG, terminal
- [x] `step` / `play` / `pause` / `reset` + Clock Speed en los cuatro módulos
- [x] Sync de código ↔ maquinaria: `i++` se resalta como fase propia del `for`
- [x] Geometría SVG corregida: flecha de flujo definida, haz láser y callout alineados
- [x] View Transitions API con fallback para Hub → módulo
- [x] Navegación por teclado: tarjetas, pestañas con flechas, roles y foco visible
- [x] Arnés de verificación sin dependencias (`node tools/verify.js`)
- [ ] Láminas de referencia versionadas en `assets/refs/` (falta copiarlas)
- [ ] Verificación en navegador real: el arnés no cubre layout ni SVG

## Trazabilidad

El contenido de este README se reorganizó desde un único archivo de 1483 líneas que mezclaba el
brief, un prototipo completo dentro de un bloque de código y la especificación. Nada se descartó:

| Antes (README viejo) | Ahora |
|---|---|
| L1–11 · objetivo y analogía | `README.md` + `docs/00-brief.md` |
| L12–36 · estilo visual, paleta, tipografía | `docs/03-sistema-diseno.md` |
| L38–63 · tabla sección → metáfora → mecánica | `docs/04-modulos.md` (tabla resumen) |
| L65–90 · arquitectura de animación y transiciones | `docs/02-arquitectura.md` §6 |
| L91–92 · "¿arrancamos por…?" (pregunta al autor) | `docs/01-decisiones.md` (registro de decisión) |
| L94–143 · navegación y vistas | `docs/02-arquitectura.md` §1–2 |
| L145–173 · dinámica interactiva por módulo | `docs/04-modulos.md` (ciclos de estados) |
| L175–187 · stack técnico | `docs/02-arquitectura.md` §5 |
| L189–192 · "próximo paso" (pregunta al autor) | `docs/01-decisiones.md` (D-07, D-08) |
| L204–1307 · prototipo `index.html` en un fence | `index.html` + `styles/` + `scripts/` |
| L1313–1331 · aspectos implementados | sección **Estado** de este archivo |
| L1334–1353 · fundamentación y metáforas | `docs/04-modulos.md` |
| L1359–1391 · variables CSS | `styles/tokens.css` + `docs/03-sistema-diseno.md` §2 |
| L1395–1424 · geometría y cortes biselados | `docs/03-sistema-diseno.md` §3–4 |
| L1428–1443 · tipografía y señalética | `docs/03-sistema-diseno.md` §5 |
| L1445–1473 · arquitectura del simulador y sincronización | `docs/02-arquitectura.md` §3–4 |
| L1475–1483 · checklist de nuevas implementaciones | `docs/05-checklist.md` §A |

Lo que **no** sobrevivió, a propósito: las preguntas dirigidas al autor del proyecto y los párrafos
de transición entre entregas. Eran ruido de proceso, no información. El criterio que las respalda está en `docs/01-decisiones.md`.