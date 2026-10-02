/* ==========================================================================
   MÓDULO 03 · SYS_03 // TRANSFORMACION_LINEAL
   .map() → cinta transportadora + cámara de transformación (1:1, inmutable).
   Ver la ficha en docs/04-modulos.md.
   ========================================================================== */
(function () {
  'use strict';

  const ITEMS = ['papas', 'gaseosa'];

  const SLOT_IN = { x: 230, y: 240 };      /* cinta, antes de la cámara */
  const SLOT_OUT = { x: 596, y: 124 };     /* entrada de la estantería de destino */

  const item = document.getElementById('conveyor-item');
  const itemBox = item.querySelector('rect');
  const itemText = document.getElementById('conveyor-item-text');
  const rack = document.getElementById('map-out');

  /* Ranuras de la estantería de salida: una por entrada, para que la
     correspondencia 1:1 se vea, no solo se lea en la terminal. */
  const slots = ITEMS.map((_, i) => ({
    group: document.getElementById(`map-out-slot-${i}`),
    label: document.getElementById(`map-out-label-${i}`),
    x: 628 + i * 44,
    y: 130 - i * 22
  }));

  const format = (list) => `[${list.map(v => `"${v}"`).join(', ')}]`;

  Engine.register('map', {
    codePrefix: 'map',
    consoleId: 'map-console',
    speed: 1000,

    createState: () => ({ i: 0, phase: 'feed', raw: ITEMS[0], out: ITEMS[0].toUpperCase(), result: [] }),

    /* Ciclo: (feed → transform) × N → cierre */
    advance(s) {
      switch (s.phase) {
        case 'feed': {
          if (s.i >= ITEMS.length) {
            s.phase = 'done';
            return {
              line: 2,
              log: `Nuevo arreglo generado con éxito: ${format(s.result)}`,
              done: true
            };
          }
          s.raw = ITEMS[s.i];
          s.out = s.raw.toUpperCase();
          s.phase = 'transform';
          return {
            line: 2,
            log: `Sale "${s.raw}" de la estantería de origen, en bruto (gris). El arreglo original no se toca.`
          };
        }

        case 'transform': {
          s.result.push(s.out);
          s.i += 1;
          s.phase = 'feed';
          return {
            line: 3,
            log: `Cámara .toUpperCase(): "${s.raw}" ➔ "${s.out}". Sale azul hacia la nueva estantería.`
          };
        }

        default:
          s.phase = 'feed';
          return { line: 0, log: 'Ciclo reiniciado.' };
      }
    },

    render(s) {
      const done = s.phase === 'done';
      const delivered = s.phase === 'transform';

      /* Gris = dato bruto. Azul = dato que ya pasó por la cámara. */
      item.setAttribute('transform', `translate(${delivered ? SLOT_OUT.x : SLOT_IN.x}, ${delivered ? SLOT_OUT.y : SLOT_IN.y})`);
      itemBox.setAttribute('fill', delivered ? 'var(--blue-accent)' : '#334155');
      itemText.textContent = delivered ? s.out : s.raw;
      item.style.opacity = done ? '0' : '1';

      /* Cada ítem procesado queda depositado y encendido en la nueva estantería:
         la correspondencia 1:1 se ve, no solo se lee en la terminal. */
      slots.forEach((slot, i) => {
        if (!slot.group) return;
        const filled = i < s.result.length;
        slot.group.setAttribute('transform', `translate(${slot.x}, ${slot.y})`);
        slot.group.setAttribute('opacity', filled ? '1' : '0');
        slot.group.classList.toggle('glow-cyan', filled);
        if (slot.label && filled) slot.label.textContent = s.result[i];
      });

      /* Lectura del arreglo resultante, que es el retorno real de map() */
      if (rack) rack.textContent = `salida → ${format(s.result)}`;
    },

    onComplete: () => 'Origen intacto: ["papas", "gaseosa"]. El retorno es un arreglo NUEVO.'
  });
})();