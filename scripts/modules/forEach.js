/* ==========================================================================
   MÓDULO 02 · SYS_02 // AGENTE_AUTONOMO
   .forEach() → dron que escanea cada celda sin contadores manuales.
   Ver la ficha en docs/04-modulos.md.
   ========================================================================== */
(function () {
  'use strict';

  const DATA = ['Rojo', 'Azul', 'Verde'];
  const DRONE_X = [280, 400, 520];
  const HOME_X = 310;

  const drone = document.getElementById('fe-drone');
  const beam = document.getElementById('fe-scan-beam');

  const boxes = DATA.map((_, i) => {
    const box = document.getElementById(`fe-box-${i}`);
    return { top: box.querySelector('.iso-cube-top') };
  });

  Engine.register('forEach', {
    codePrefix: 'fe',
    consoleId: 'forEach-console',
    speed: 1100,

    createState: () => ({ i: 0, phase: 'move' }),

    /* Ciclo: (move → fire) × N → cierre. Dos fases por elemento. */
    advance(s) {
      switch (s.phase) {
        case 'move': {
          if (s.i >= DATA.length) {
            s.phase = 'end';
            return { line: 2, log: `El dron completionó el recorrido de los ${DATA.length} elementos.`, done: true };
          }
          s.phase = 'fire';
          return { line: 2, log: `El dron se posiciona sobre la celda ${s.i}. Sin contador: el agente lleva la cuenta.` };
        }

        case 'fire': {
          const value = DATA[s.i];
          s.i += 1;
          s.phase = 'move';
          return { line: 3, log: `Callback ejecutado con: "${value}"` };
        }

        default:
          s.phase = 'move';
          return { line: 0, log: 'Ciclo reiniciado.' };
      }
    },

    render(s) {
      const done = s.phase === 'end';
      const slot = Math.min(s.i, DRONE_X.length - 1);

      drone.setAttribute('transform', `translate(${done ? HOME_X : DRONE_X[slot]}, 140)`);

      /* El cono de escaneo solo existe mientras dura el escaneo */
      beam.style.opacity = (s.phase === 'fire' && !done) ? '0.9' : '0';

      /* Rastro de escaneo: quedan encendidos los cubos ya visitados */
      boxes.forEach((box, i) => box.top.classList.toggle('glow-cyan', i < s.i));
    },

    onComplete: () => 'Iteración completa. El valor de retorno de forEach() es undefined.'
  });
})();