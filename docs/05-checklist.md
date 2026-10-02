# 05 · Checklist

## A. Checklist de extensión: agregar un método nuevo

Antes de escribir código, las siete preguntas. Si alguna se responde "no", el módulo no entra.

- [ ] **Metáfora física coherente.** ¿Existe una analogía industrial que no contradiga las
      existentes? Candidatos naturales: `.filter()` → tamiz vibratorio que deja pasar lo que cumple
      el criterio; `.find()` → brazo robótico que se detiene en la primera coincidencia;
      `.some()` / `.every()` → un solo sensor que evalúa toda la cinta y levanta una bandera.
- [ ] **Sin bordes redondeados.** Biseles con `--chamfer-card` / `--chamfer-control`. Cero
      `border-radius` en estructura.
- [ ] **Retícula intacta.** El fondo conserva las mallas de 20 px y 100 px sin cortes ni parches.
- [ ] **Control de ejecución completo.** `step`, `play`/`pause`, `reset` y Clock Speed, provistos
      por `Engine` automáticamente.
- [ ] **Alineado con el Hub.** La máquina tiene su tarjeta en la grilla (`SYS_0n`, `SPEC: …`) y su
      vista de simulador con la división de dos columnas.
- [ ] **Ciclo de estados documentado** en `04-modulos.md`: tabla de fases con línea, piezas y
      registro en stdout, más el total de cuadros hasta completar.
- [ ] **Sin `setTimeout` en el módulo.** Si necesitas esperar, es que el estado debe incluir una
      fase más (ver `02-arquitectura.md` §4.1).

## B. Checklist de tokens y geometría

- [ ] El color nuevo está declarado en `styles/tokens.css`, con su valor semántico en el comentario.
- [ ] El cian sigue reservándose a estado activo y energía.
- [ ] Si aparece `--blue-accent`, es porque el dato **salió** transformado de la máquina.
- [ ] Los cubos usan la plantilla de `03-sistema-diseno.md` §3.2 sin modificar.
- [ ] Toda pieza con nombre propio tiene ancla circular + leyenda.
- [ ] Ningún `clip-path` literal: se usa un token de corte.
- [ ] Toda pieza animada lleva `data-part` (hereda la transición de CSS). Ninguna `style="transition"`
      inline en el HTML.

## C. Verificación

Hay dos niveles. El primero es manual (sigue); el segundo es un arnés de Node que ejecuta el código
real de los módulos contra un DOM mínimo simulado y verifica los cuadros, los registros y los
estados finales declarados en `04-modulos.md`. Recomendado correr el arnés antes que la tabla
manual: en minutos.

### C.1 · Arnés automático

```bash
node tools/verify.js
```

Debe imprimir `TODO OK` sin `FALLA`. Verifica, por módulo: cantidad de cuadros hasta completar,
registro de cierre, contenido de stdout, posición final de cada pieza móvil, estado del rastro
`.glow-cyan`, y que `reset()` sea determinista. Además cubre la regresión de D-08 (ningún elemento
duplicado ni saltado) y que `step` se ignore durante la reproducción.

Requiere solo Node. No usa dependencias ni build.

### C.2 · Tabla de resultados esperados

| | `for` | `.forEach()` | `.map()` | `.reduce()` |
|---|---|---|---|---|
| Cuadros hasta completar | 11 | 7 | 5 | 7 |
| Registro de cierre | `Fin del bucle: 3 elementos recorridos…` | `Iteración completa…` | `Origen intacto: ["papas", "gaseosa"]…` | `Salida única: 60…` |
| Piezas en posición final | carro en `translate(350, 245)`, láser `opacity 1` | dron en `translate(310, 140)`, cono `opacity 0` | cinta `opacity 0`, 2 ranuras encendidas | bloque en `translate(380, 20)`, pila de 48 px |
| Lectura en la máquina | dial `3` | — | `salida → ["PAPAS", "GASEOSA"]` | `acc: 60` |
| Rastro encendido | los 3 cubos | los 3 cubos | las 2 ranuras | — |

### C.3 · Secuencia manual por módulo

1. **Pausa inicial.** Abrir el módulo. Todo en reposo: ninguna pieza movida, terminal vacía, ninguna
   línea resaltada. En `for`, el láser atenuado (`opacity 0.25`) y el carro en el click 0.
2. **Paso a paso.** Pulsar `⏭` y verificar **un solo** cuadro por pulsación: exactamente una línea
   se resalta, un registro nuevo, una pieza se mueve. Repetir hasta completar y comparar stdout
   contra `04-modulos.md`.
3. **Reproducción.** `▶ Auto`. Llega al mismo estado final que el paso a paso, con los mismos
   registros y en el mismo orden. `⏭` debe quedar deshabilitado mientras corre.
4. **Pausa.** Pulsar `⏸` a mitad de camino. El estado se congela y sigue siendo coherente (la línea
   resaltada corresponde a la pieza detenida). Retomar con `▶`.
5. **Clock Speed.** Bajar al mínimo y subir al máximo. El ritmo cambia; el resultado final no.
6. **Reset.** `↺ Reset` desde cualquier punto, incluso a mitad. Vuelve al estado inicial completo:
   piezas en reposo, terminal vacía, resaltado borrado.
7. **Repetir.** Ejecutar de nuevo desde el estado inicial. Idéntico al primer ciclo.
8. **Navegación.** Cambiar de módulo y volver. El módulo anterior conserva su estado, y su
   reproducción queda detenida.

### C.4 · Pruebas transversales

- [ ] Ningún módulo tiene pasos que se salteen elementos (regresión de D-08).
- [ ] `Engine.step()` no hace nada mientras la máquina está en reproducción.
- [ ] `prefers-reduced-motion` desactiva las transiciones y el contenido sigue siendo legible.
- [ ] El Hub responde al clic y al teclado; las tarjetas tienen `role="button"` y `tabindex`.
- [ ] Las flechas del teclado mueven el foco entre pestañas.
- [ ] La retícula no tiene cortes ni costuras al hacer scroll.

## D. Deuda conocida

| Deuda | Impacto | Estado |
|---|---|---|
| Láminas de referencia sin versionar en el repo | No se puede justificar la geometría SVG al corregirla | Requiere copiar a `assets/refs/` |
| Arnés de verificación fuera del repo por ahora | La regresión depende de correrlo a mano | Una línea de más si se acepta `tools/verify.js` |
| Sin tests de integración en navegador real | El DOM simulado no cubre layout ni SVG real | Aceptado: no hay build |
| Código de ejemplo fijo | No se pueden probar otros datos | Aceptado (D-06) |