/* ==========================================================================
   EJEMPLO 05 · SYS_05 // BUCLES_ANIDADOS
   for dentro de for → una plataforma 3x3 con dos contadores y dos carros:
   el externo salta de fila y el interno barre la fila entera.

   Comparte el motor genérico (scripts/engine.js) y todos los tokens de
   styles/. No tiene Player propio: solo estado, fases y render.
   ========================================================================== */
(function () {
  'use strict';

  const FILAS = ['A', 'B', 'C'];
  const COLS = [1, 2, 3];

  /* Rejilla isométrica: la celda (i, j) es la suma de los dos ejes de 30°
     que ya usan las demás máquinas. BASE es la celda (0, 0). */
  const BASE = { x: 420, y: 110 };
  const STEP_COL = { x: 120, y: 40 };   /* eje del bucle interno → columnas */
  const STEP_ROW = { x: -120, y: 40 };  /* eje del bucle externo → filas */

  const pos = (i, j) => ({
    x: BASE.x + STEP_ROW.x * i + STEP_COL.x * j,
    y: BASE.y + STEP_ROW.y * i + STEP_COL.y * j
  });

  const PHASE_LABEL = {
    init: 'inicialización',
    'o-cond': 'condición externa',
    'i-init': 'reinicio del interno',
    'i-cond': 'condición interna',
    body: 'cuerpo',
    'i-inc': 'j++',
    'o-inc': 'i++',
    end: 'fin'
  };

  const els = {
    outer: document.getElementById('outer-carriage'),
    head: document.getElementById('inner-head'),
    lens: document.getElementById('inner-lens'),
    dialI: document.getElementById('outer-index'),
    dialJ: document.getElementById('inner-index'),
    status: document.getElementById('nf-status')
  };

  /* Las 9 celdas, en el orden en que las recorre el doble bucle. */
  const tops = [];
  FILAS.forEach((_, i) => {
    COLS.forEach((__, j) => {
      tops.push(document.getElementById(`nf-cell-${i * COLS.length + j}`).querySelector('.iso-cube-top'));
    });
  });

  Engine.register('forNested', {
    codePrefix: 'forNested',
    consoleId: 'forNested-console',
    speed: 600,

    createState: () => ({ i: 0, j: 0, phase: 'init' }),

    /* Ciclo: init → ((o-cond → i-init → (i-cond → body → i-inc) × N
       → i-cond FALSE) × filas → o-inc) → o-cond FALSE.
       El interno se reinicia en cada vuelta del externo: ese es el cuadro
       que separa esta máquina de SYS_01. */
    advance(s) {
      switch (s.phase) {
        case 'init':
          s.phase = 'o-cond';
          return { line: 3, log: `init: i = ${s.i}, j = ${s.j}. Arranca el bucle externo; el interno todavía no.` };

        case 'o-cond': {
          if (s.i >= FILAS.length) {
            s.phase = 'end';
            return { line: 4, log: `Condición externa: ${s.i} < ${FILAS.length} → FALSE. El externo se agota y devuelve el control.`, done: true };
          }
          s.phase = 'i-init';
          return { line: 4, log: `Condición externa: i = ${s.i} < ${FILAS.length} → TRUE. Entra el bucle interno en la fila ${s.i}.` };
        }

        case 'i-init':
          s.j = 0;
          s.phase = 'i-cond';
          return { line: 6, log: `Reinicio del interno: j = 0. El barrido vuelve al inicio de la fila ${s.i}.` };

        case 'i-cond': {
          if (s.j >= COLS.length) {
            s.phase = 'o-inc';
            return { line: 7, log: `Condición interna: j = ${s.j} < ${COLS.length} → FALSE. El interno se agota en la fila ${s.i}.` };
          }
          s.phase = 'body';
          return { line: 7, log: `Condición interna: j = ${s.j} < ${COLS.length} → TRUE. Celda [${s.i}][${s.j}].` };
        }

        case 'body':
          s.phase = 'i-inc';
          return { line: 9, log: `stdout: "${FILAS[s.i]}${COLS[s.j]}"` };

        case 'i-inc':
          s.j += 1;
          s.phase = 'i-cond';
          return { line: 8, log: `j++ → ${s.j}. El barrido sigue dentro de la misma fila.` };

        case 'o-inc':
          s.i += 1;
          s.phase = 'o-cond';
          return { line: 5, log: `i++ → ${s.i}. El externo avanza una fila: el interno se reiniciará.` };

        default:
          s.phase = 'init';
          return { line: 0, log: 'Ciclo reiniciado.' };
      }
    },

    /* render es idempotente: siempre describe el estado completo. */
    render(s) {
      const done = s.phase === 'end';
      const innerActive = !done && ['i-init', 'i-cond', 'body', 'i-inc'].includes(s.phase);

      els.dialI.textContent = String(s.i);
      els.dialJ.textContent = String(s.j);

      /* El carro externo señala la fila activa; el cabezal, la celda activa. */
      const row = pos(Math.min(s.i, FILAS.length - 1), 0);
      els.outer.setAttribute('transform', `translate(${row.x - 160}, ${row.y - 6})`);

      const cell = pos(Math.min(s.i, FILAS.length - 1), Math.min(s.j, COLS.length - 1));
      els.head.setAttribute('transform', `translate(${cell.x}, ${cell.y - 45})`);
      els.lens.classList.toggle('glow-cyan', innerActive);

      /* Rastro: encendidas las celdas ya impresas; relleno cian la activa. */
      tops.forEach((top, k) => {
        const i = Math.floor(k / COLS.length);
        const j = k % COLS.length;
        top.classList.toggle('glow-cyan', i < s.i || (i === s.i && j < s.j));
        top.classList.toggle('fill-cyan', innerActive && i === s.i && j === s.j);
      });

      els.status.textContent = `fase // ${PHASE_LABEL[s.phase]}`;
    },

    onComplete: () => `Fin del recorrido: 3 x 3 = 9 combinaciones. El externo avanza solo cuando el interno se agota.`
  });
})();