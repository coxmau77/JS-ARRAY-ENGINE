/* ==========================================================================
   MÓDULO 01 · SYS_01 // SECUENCIAL_MECANICO
   for clásico → regla graduada + carro móvil + barrera láser de tope.
   Ver la ficha en docs/04-modulos.md.
   ========================================================================== */
(function () {
  'use strict';

  const DATA = ['Rojo', 'Azul', 'Verde'];
  const CARRIAGE_X = [130, 240, 350];

  const els = {
    dial: document.getElementById('lcd-index'),
    carriage: document.getElementById('slider-carriage'),
    sensor: document.getElementById('laser-sensor'),
    beam: document.getElementById('laser-beam'),
    emitter: document.getElementById('laser-emitter')
  };

  const boxes = DATA.map((_, i) => {
    const box = document.getElementById(`box-${i}`);
    return { top: box.querySelector('.iso-cube-top') };
  });

  Engine.register('for', {
    codePrefix: 'for',
    consoleId: 'for-console',
    speed: 900,

    createState: () => ({ i: 0, phase: 'init' }),

    /* Ciclo: init → (cond → body → inc) × N → cond FALSE */
    advance(s) {
      switch (s.phase) {
        case 'init':
          s.phase = 'cond';
          return { line: 2, log: `init: i = ${s.i}. Carro en posición 0, dial en 0, láser apagado.` };

        case 'cond': {
          if (s.i >= DATA.length) {
            s.phase = 'end';
            return {
              line: 3,
              log: `Condición: ${s.i} < ${DATA.length} → FALSE. El láser marca tope absoluto.`,
              done: true
            };
          }
          s.phase = 'body';
          return { line: 3, log: `Condición: ${s.i} < ${DATA.length} → TRUE. Barrido láser sobre la ranura ${s.i}.` };
        }

        case 'body':
          s.phase = 'inc';
          return { line: 5, log: `stdout: "${DATA[s.i]}"` };

        case 'inc': {
          s.i += 1;
          s.phase = 'cond';
          return { line: 4, log: `i++ → ${s.i}. El dial rota y el carro avanza un clic.` };
        }

        default:
          s.phase = 'init';
          return { line: 0, log: 'Ciclo reiniciado.' };
      }
    },

    /* render es idempotente: siempre describe el estado completo. */
    render(s) {
      const done = s.phase === 'end';
      const slot = Math.min(s.i, CARRIAGE_X.length - 1);

      els.dial.textContent = String(s.i);
      els.carriage.setAttribute('transform', `translate(${CARRIAGE_X[slot]}, 245)`);

      /* Rastro: los cubos ya recorridos quedan encendidos */
      boxes.forEach((box, i) => box.top.classList.toggle('glow-cyan', i < s.i));

      /* El haz solo se excita al evaluar la condición y queda fijo al terminar */
      els.beam.style.opacity = done ? '1' : (s.phase === 'cond' ? '0.85' : '0.25');
      if (els.emitter) els.emitter.classList.toggle('glow-cyan', s.phase === 'cond' && !done);
    },

    onComplete: () => 'Fin del bucle: 3 elementos recorridos, contador detenido en 3.'
  });
})();