/* ==========================================================================
   ENGINE · PLAYER GENÉRICO DE MÁQUINAS
   Un único mecanismo de tiempo para las cuatro máquinas.

   Regla de oro (ver docs/02-arquitectura.md §4.1):
   el estado es la única fuente de verdad y render(state) es la única función
   que toca el DOM. Las transiciones son síncronas, así que la reentrada es
   imposible por construcción — que era el defecto del prototipo anterior, donde
   el índice avanzaba dentro de un setTimeout mientras el setInterval de
   reproducción seguía corriendo.
   ========================================================================== */

(function (global) {
  'use strict';

  const machines = new Map();

  const byId = (id) => document.getElementById(id);

  /* ------------------------------------------------------------------------
     CAPA 1 · Resaltado de código
     Lee las líneas reales del bloque: no hay rango fijo, así que un snippet
     de 4 o de 6 líneas funciona igual.
     ------------------------------------------------------------------------ */
  function highlightLines(codePrefix, lineNumber) {
    const block = byId(`${codePrefix}-code`);
    if (!block) return;
    block.querySelectorAll('.code-line').forEach((line, i) => {
      line.classList.toggle('active', i + 1 === lineNumber);
    });
  }

  /* ------------------------------------------------------------------------
     CAPA 3 · Terminal de salida
     ------------------------------------------------------------------------ */
  function appendLog(consoleId, text) {
    const box = byId(consoleId);
    if (!box || !text) return;
    const entry = document.createElement('div');
    entry.className = 'stdout-entry';
    entry.textContent = text;
    box.appendChild(entry);
    box.scrollTop = box.scrollHeight;
  }

  /* ------------------------------------------------------------------------
     Controles: se.localizan por data-control dentro de [data-controls="id"]
     ------------------------------------------------------------------------ */
  function control(id, name) {
    return document.querySelector(`[data-controls="${id}"] [data-control="${name}"]`);
  }

  function syncControls(id, running) {
    const stepBtn = control(id, 'step');
    const playBtn = control(id, 'play');
    if (stepBtn) stepBtn.disabled = running;
    if (playBtn) {
      playBtn.textContent = running ? '[ ⏸ Pausa ]' : '[ ▶ Auto ]';
      playBtn.setAttribute('aria-pressed', String(running));
    }
  }

  /* ------------------------------------------------------------------------
     Núcleo: un cuadro = transición de estado + render + registro
     ------------------------------------------------------------------------ */
  function frame(id) {
    const m = machines.get(id);
    if (!m) return;

    const event = m.advance(m.state) || {};

    m.render(m.state);

    if (event.line) highlightLines(m.codePrefix, event.line);
    if (event.log) appendLog(m.consoleId, event.log);

    if (event.done) {
      Engine.pause(id);
      const closing = m.onComplete ? m.onComplete(m.state) : null;
      appendLog(m.consoleId, closing);
      highlightLines(m.codePrefix, 0);
    }
  }

  const Engine = {
    /* --- Registro de máquinas --- */
    register(id, definition) {
      const machine = Object.assign({ speed: 900, timer: null, running: false }, definition);
      machine.state = machine.createState();
      machines.set(id, machine);
      return machine;
    },

    get(id) { return machines.get(id); },

    /* --- Ejecución --- */
    step(id) {
      const m = machines.get(id);
      if (!m || m.running) return;   // paso manual ignorado durante la reproducción
      frame(id);
    },

    play(id) {
      const m = machines.get(id);
      if (!m || m.running) return;
      m.running = true;
      m.timer = setInterval(() => frame(id), m.speed);
      syncControls(id, true);
    },

    pause(id) {
      const m = machines.get(id);
      if (!m || !m.running) return;
      clearInterval(m.timer);
      m.timer = null;
      m.running = false;
      syncControls(id, false);
    },

    toggle(id) {
      const m = machines.get(id);
      if (!m) return;
      m.running ? Engine.pause(id) : Engine.play(id);
    },

    reset(id) {
      const m = machines.get(id);
      if (!m) return;
      Engine.pause(id);
      m.state = m.createState();
      m.render(m.state);
      highlightLines(m.codePrefix, 0);
      const box = byId(m.consoleId);
      if (box) box.innerHTML = '';
    },

    setSpeed(id, ms) {
      const m = machines.get(id);
      if (!m) return;
      m.speed = ms;
      if (m.running) {
        clearInterval(m.timer);
        m.timer = setInterval(() => frame(id), ms);
      }
    },

    isRunning(id) {
      const m = machines.get(id);
      return Boolean(m && m.running);
    },

    /* --- Arranque: pinta el estado inicial de todas las máquinas --- */
    init() {
      machines.forEach((m, id) => {
        m.state = m.createState();
        m.render(m.state);
        syncControls(id, false);
      });
    },

    /* --- Utilidades compartidas por los módulos --- */
    highlightLines,
    appendLog
  };

  /* ------------------------------------------------------------------------
     Binding de la interfaz: un solo lugar conoce el HTML de los controles
     ------------------------------------------------------------------------ */
  function bindControls() {
    document.querySelectorAll('[data-controls]').forEach(group => {
      const id = group.dataset.controls;

      group.querySelectorAll('[data-control]').forEach(btn => {
        const action = btn.dataset.control;
        btn.addEventListener('click', () => {
          if (action === 'step') Engine.step(id);
          else if (action === 'play') Engine.toggle(id);
          else if (action === 'reset') Engine.reset(id);
        });
      });
    });

    document.querySelectorAll('[data-speed]').forEach(slider => {
      const id = slider.dataset.speed;
      const out = document.querySelector(`[data-speed-out="${id}"]`);

      const apply = () => {
        const ms = Number(slider.value);
        Engine.setSpeed(id, ms);
        if (out) out.textContent = `${ms} ms`;
      };

      if (out) out.textContent = `${slider.value} ms`;
      Engine.setSpeed(id, Number(slider.value));
      slider.addEventListener('input', apply);
    });
  }

  global.Engine = Engine;

  document.addEventListener('DOMContentLoaded', () => {
    bindControls();
    Engine.init();
  });
})(window);