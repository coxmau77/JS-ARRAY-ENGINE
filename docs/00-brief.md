# 00 · Brief

## Problema

Los métodos de iteración de arrays en JavaScript (`for`, `.forEach()`, `.map()`, `.reduce()`) se
enseñan como sintaxis: cuatro bloques de texto que se memorizan. El estudiante no ve **qué hace la
máquina** en cada paso, ni por qué `for` necesita un contador y `.forEach()` no, ni qué significa
que `.map()` devuelva un arreglo nuevo sin tocar el original.

## Objetivo

Una SPA (**S**ingle **P**age **A**pplication) que desmitifique la iteración de arrays mediante una
**analogía industrial isométrica**: cada método es una máquina, y el estudiante la puede correr,
pausar y avanzar paso a paso.

## Principio rector: la animación es andamiaje cognitivo

Las transiciones no son adorno. Cada una cumple una función didáctica:

| Función | Cómo se manifiesta |
|---|---|
| **Orientar** | El usuario sabe siempre en qué máquina está y dónde está parado. |
| **Retroalimentar estado** | Cada movimiento mecánico corresponde a una línea de código real que se resalta en el mismo instante. |
| **Jerarquizar conceptos** | Lo importante se enlarge y brilla (cian); lo accesorio queda en gris técnico. |

Si una animación no cumple ninguna de las tres, no entra al proyecto.

## Alcance

- Cuatro máquinas: `SYS_01 for`, `SYS_02 .forEach()`, `SYS_03 .map()`, `SYS_04 .reduce()`.
- Un Hub (vista general) que funciona como plano de la fábrica.
- Por módulo: código con resaltado por línea, terminal de salida, máquina SVG isométrica animada
  y controles `step` / `play` / `pause` / `reset` + velocidad.
- Estética *blueprint de ingeniería industrial* en dark mode.

## No-objetivos

- **No es un playground de JavaScript.** El código está escrito y es fijo; no se edita ni se ejecuta
  en un sandbox. La ejecución es *simulada paso a paso*.
- **No es un tutorial de sintaxis ES6+.** No se cubren `for...of`, arrow functions Binding,
  iteradores, `Array.from`, ni rendimiento (performance). Se cubre el mecanismo, no la API.
- **No hay backend, build ni dependencias.** HTML + CSS + JS servidos como estáticos.
- **No hay sistema de usuarios, progreso ni persistencia.**

## Público

Estudiantes de JavaScript que ya conocen `let`, `funciones` y `console.log`, pero no pueden
explicar por qué `reduce` necesita un valor inicial ni qué implica la inmutabilidad de `.map()`.

## Criterio de éxito

Al terminar, el estudiante puede responder sin volver a mirar el código:

1. ¿Qué línea de código mueve el carro del `for`?
2. ¿Qué pasaría si en `reduce` se olvida el `0` inicial?
3. ¿Cuál de los dos arreglos de `.map()` cambió?