/* ==========================================================================
   MÓDULO 04 · SYS_04 // SINTESIS_ACUMULATIVA
   .reduce() → tolva de compactación que condensa N entradas en 1 salida.
   Ver la ficha en docs/04-modulos.md.
   ========================================================================== */
(function () {
  'use strict';

  const VALUES = [10, 20, 30];
  const STACK_STEP = 16;          /* alto que gana el bloque por entrada procesada */

  const block = document.getElementById('falling-block');
  const fallingVal = document.getElementById('falling-val');
  const totalVal = document.getElementById('total-val');
  const stack = document.getElementById('hopper-stack');

  Engine.register('reduce', {
    codePrefix: 'red',
    consoleId: 'reduce-console',
    speed: 1000,

    createState: () => ({ i: 0, acc: 0, phase: 'drop', prev: 0, current: VALUES[0] }),

    /* Ciclo: (drop → synth) × N → prensa de compactación */
    advance(s) {
      switch (s.phase) {
        case 'drop': {
          if (s.i >= VALUES.length) {
            s.phase = 'press';
            return {
              line: 2,
              log: `${VALUES.length} bloques dentro de la tolva. La prensa compacta todo en un solo bloque.`,
              done: true
            };
          }
          s.prev = s.acc;
          s.current = VALUES[s.i];
          s.phase = 'synth';
          return { line: 2, log: `Cae el bloque ${s.current} en la tolva. El acumulador sigue en ${s.prev}.` };
        }

        case 'synth': {
          s.acc = s.prev + s.current;
          s.i += 1;
          s.phase = 'drop';
          return { line: 3, log: `acc (${s.prev}) + curr (${s.current}) = ${s.acc}` };
        }

        default:
          s.phase = 'drop';
          return { line: 0, log: 'Ciclo reiniciado.' };
      }
    },

    render(s) {
      const falling = s.phase === 'synth';

      block.setAttribute('transform', falling ? 'translate(380, 180)' : 'translate(380, 20)');
      fallingVal.textContent = s.current;
      totalVal.textContent = `acc: ${s.acc}`;

      /* El bloque compactado crece con cada entrada sintetizada */
      if (stack) {
        const height = s.i * STACK_STEP;
        stack.setAttribute('height', String(height));
        stack.setAttribute('y', String(240 - height));
        stack.style.opacity = height > 0 ? '1' : '0';
      }
    },

    onComplete: () => 'Salida única: 60. N entradas (10, 20, 30) reducidas a 1 valor. Ojo con el 0 inicial: si se omite, el primer acc sería undefined.'
  });
})();