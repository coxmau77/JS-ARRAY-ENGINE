/* ==========================================================================
   VERIFY · Arnés de verificación sin dependencias
   Ejecuta el código REAL de la app (app.js, engine.js y los 4 módulos) contra
   un DOM mínimo simulado, y comprueba los cuadros, los registros y los estados
   finales declarados en docs/05-checklist.md seccion C.2.

   Uso:  node tools/verify.js        (no necesita build ni npm install)

   Qué comprueba y por qué:
   - La regresión de D-08: ningún cuadro se salta un elemento ni lo repite.
   - Que render(state) pinte el cuadro completo y que reset() sea determinista.
   - Que step() se ignore mientras la máquina está en reproducción.

   Limitación conocida: al no haber DOM real, no cubre layout, SVG ni CSS.
   Para eso está la tabla manual de docs/05-checklist.md sección C.3.

   Nota: el fuente es ASCII puro a propósito. Los caracteres acentuados o
   simbólicos se escriben con escapes para que la comparación no dependa de cómo
   se codifique el archivo.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.argv[2] || path.join(__dirname, '..');

const ARR = '➔';   // flecha doble de los registros
const TO = '→';   // flecha simple de la lectura del arreglo
const OACUTE = 'ó';

function makeEl(id, lines) {
  const el = {
    id, dataset: {}, style: {}, textContent: '', innerHTML: '',
    scrollTop: 0, scrollHeight: 0,
    _attrs: {}, _classes: new Set(), _kids: {}, _log: [],
    classList: {
      add: (c) => el._classes.add(c),
      remove: (c) => el._classes.delete(c),
      contains: (c) => el._classes.has(c),
      toggle: (c, force) => {
        const on = force === undefined ? !el._classes.has(c) : !!force;
        if (on) el._classes.add(c); else el._classes.delete(c);
        return on;
      }
    },
    setAttribute: (k, v) => { el._attrs[k] = String(v); },
    getAttribute: (k) => el._attrs[k],
    appendChild: (child) => { el._log.push(child.textContent); el.innerHTML += child.textContent; return child; },
    querySelector: (sel) => {
      if (!el._kids[sel]) el._kids[sel] = makeEl(`${id}>${sel}`);
      return el._kids[sel];
    },
    querySelectorAll: () => (lines ? lines.map((l) => makeEl(l)) : []),
    focus() {}
  };
  return el;
}

const store = {};
/* Cantidad de .code-line de cada bloque de codigo que el DOM simulado expone. */
const CODE_LINES = { 'for-code': 6, 'reduce-code': 5, 'forNested-code': 11 };
function el(id) {
  if (!store[id]) {
    const isCode = /-code$/.test(id);
    store[id] = makeEl(id, isCode ? Array.from({ length: CODE_LINES[id] || 4 }, (_, i) => `${id}-l${i + 1}`) : []);
  }
  return store[id];
}

const domReady = [];
const document = {
  title: '',
  getElementById: (id) => el(id),
  querySelector: (() => { const m = {}; return (s) => (m[s] ||= makeEl(`q:${s}`)); })(),
  querySelectorAll: () => [],
  createElement: (t) => makeEl(`new-${t}`),
  addEventListener: (evt, fn) => { if (evt === 'DOMContentLoaded') domReady.push(fn); }
};

const sandbox = { window: null, document, console, setInterval, clearInterval, setTimeout, clearTimeout };
sandbox.window = sandbox;
sandbox.matchMedia = () => ({ matches: false });
vm.createContext(sandbox);

const FILES = [
  'scripts/app.js', 'scripts/engine.js',
  'scripts/modules/for.js', 'scripts/modules/forEach.js',
  'scripts/modules/map.js', 'scripts/modules/reduce.js',
  'scripts/modules/forNested.js'
];

for (const file of FILES) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), sandbox, { filename: file });
}
domReady.forEach((fn) => fn());

const Engine = sandbox.window.Engine;
const failures = [];
const check = (name, actual, expected) => {
  const a = JSON.stringify(actual), b = JSON.stringify(expected);
  const ok = a === b;
  console.log(`${ok ? 'PASS  ' : 'FALLA '} ${name}`);
  if (!ok) {
    console.log(`         esperado: ${b}`);
    console.log(`         obtenido: ${a}`);
    failures.push(name);
  }
};

/* El motor imprime el log del paso y DESPUES el registro de cierre, asi que el
   ultimo registro de una corrida completa es siempre el de onComplete. */
const CLOSING = {
  for: 'Fin del bucle',
  forEach: `Iteraci${OACUTE}n completa.`,
  map: 'Origen intacto',
  reduce: 'Salida única:',
  forNested: 'Fin del recorrido'
};

function runToEnd(id, limit = 40) {
  Engine.reset(id);
  const out = el(`${id}-console`);
  out._log.length = 0;
  let steps = 0;
  for (; steps < limit; steps++) {
    Engine.step(id);
    const last = out._log[out._log.length - 1] || '';
    if (last.includes(CLOSING[id])) break;
  }
  return { steps: steps + 1, logs: out._log.slice() };
}

/* ---------------------------------------------------------------- 01 for */
console.log('--- SYS_01 for ---');
const f = runToEnd('for');
check('11 cuadros hasta completar', f.steps, 11);
check('registro de cierre', f.logs[f.logs.length - 1], 'Fin del bucle: 3 elementos recorridos, contador detenido en 3.');
check('stdout con los 3 colores, en orden', f.logs.filter((l) => l.startsWith('stdout:')), ['stdout: "Rojo"', 'stdout: "Azul"', 'stdout: "Verde"']);
check('i++ se registra 3 veces', f.logs.filter((l) => l.startsWith('i++')).length, 3);
check('dial queda en 3', String(el('lcd-index').textContent), '3');
check('carro queda en el ultimo click', el('slider-carriage').getAttribute('transform'), 'translate(350, 245)');
check('laser queda fijo (opacity 1)', el('laser-beam').style.opacity, '1');
check('rastro: los 3 cubos quedan encendidos', [0, 1, 2].every((i) => el(`box-${i}`).querySelector('.iso-cube-top').classList.contains('glow-cyan')), true);

/* ---------------------------------------------------------- 02 forEach */
console.log('\n--- SYS_02 forEach ---');
const fe = runToEnd('forEach');
check('7 cuadros hasta completar', fe.steps, 7);
check('los 3 valores en orden, sin repetir ni saltar', fe.logs.filter((l) => l.startsWith('Callback ejecutado')), ['Callback ejecutado con: "Rojo"', 'Callback ejecutado con: "Azul"', 'Callback ejecutado con: "Verde"']);
check('dron vuelve a la base', el('fe-drone').getAttribute('transform'), 'translate(310, 140)');
check('cono de escaneo apagado al terminar', el('fe-scan-beam').style.opacity, '0');
check('rastro de escaneo sobre los 3 cubos', [0, 1, 2].every((i) => el(`fe-box-${i}`).querySelector('.iso-cube-top').classList.contains('glow-cyan')), true);

/* ---------------------------------------------------------------- 03 map */
console.log('\n--- SYS_03 map ---');
const mp = runToEnd('map');
check('5 cuadros hasta completar', mp.steps, 5);
const camara = mp.logs.filter((l) => l.includes('.toUpperCase():'));
check('ambos items pasan por la camara', camara.length, 2);
check('papas -> PAPAS', camara[0].includes(`"papas" ${ARR} "PAPAS"`), true);
check('gaseosa -> GASEOSA', camara[1].includes(`"gaseosa" ${ARR} "GASEOSA"`), true);
check('el arreglo de salida se muestra completo', el('map-out').textContent, `salida ${TO} ["PAPAS", "GASEOSA"]`);
check('los 2 items quedan depositados y encendidos', ['map-out-slot-0', 'map-out-slot-1'].map((id) => `${el(id).getAttribute('opacity')}:${el(id).classList.contains('glow-cyan')}`), ['1:true', '1:true']);
check('las ranuras muestran el texto transformado', ['map-out-label-0', 'map-out-label-1'].map((id) => el(id).textContent), ['PAPAS', 'GASEOSA']);
check('la cinta queda vacia al terminar', el('conveyor-item').style.opacity, '0');

/* ------------------------------------------------------------- 04 reduce */
console.log('\n--- SYS_04 reduce ---');
const rd = runToEnd('reduce');
check('7 cuadros hasta completar', rd.steps, 7);
check('sintesis acumulativa explicita', rd.logs.filter((l) => l.startsWith('acc (')), ['acc (0) + curr (10) = 10', 'acc (10) + curr (20) = 30', 'acc (30) + curr (30) = 60']);
check('valor final unico', el('total-val').textContent, 'acc: 60');
check('el bloque compactado crecio 3 etapas (48 px)', el('hopper-stack').getAttribute('height'), '48');
check('el bloque vuelve a la posicion de espera', el('falling-block').getAttribute('transform'), 'translate(380, 20)');

/* ------------------------------------------------------ 05 for dentro de for */
console.log('\n--- SYS_05 for dentro de for ---');
const fn = runToEnd('forNested', 60);
check('41 cuadros hasta completar', fn.steps, 41);
check('stdout: las 9 combinaciones, en orden de fila', fn.logs.filter((l) => l.startsWith('stdout:')), [
  'stdout: "A1"', 'stdout: "A2"', 'stdout: "A3"',
  'stdout: "B1"', 'stdout: "B2"', 'stdout: "B3"',
  'stdout: "C1"', 'stdout: "C2"', 'stdout: "C3"'
]);
check('el interno se reinicia 3 veces (una por fila)', fn.logs.filter((l) => l.startsWith('Reinicio')).length, 3);
check('el externo avanza 3 veces', fn.logs.filter((l) => l.startsWith('i++')).length, 3);
check('el externo avanza solo despues de agotarse el interno', fn.logs.findIndex((l) => l.startsWith('i++')) > fn.logs.findIndex((l) => l === 'stdout: "A3"'), true);
check('contadores quedan en i = 3 y j = 3', [String(el('outer-index').textContent), String(el('inner-index').textContent)], ['3', '3']);
check('el carro externo queda en la ultima fila', el('outer-carriage').getAttribute('transform'), 'translate(20, 184)');
check('el cabezal interno queda sobre la ultima celda', el('inner-head').getAttribute('transform'), 'translate(420, 225)');
check('las 9 celdas quedan encendidas', Array.from({ length: 9 }, (_, k) => el(`nf-cell-${k}`).querySelector('.iso-cube-top').classList.contains('glow-cyan')).every(Boolean), true);

/* ------------------------------------------------- regresion: la carrera */
console.log('\n--- regresion D-08: ningun elemento duplicado ni saltado ---');
for (const [id, marker, expected] of [
  ['for', 'stdout:', 3],
  ['forEach', 'Callback ejecutado', 3],
  ['map', '.toUpperCase():', 2],
  ['reduce', 'acc (', 3],
  ['forNested', 'stdout:', 9]
]) {
  check(`${id} · ${expected} ocurrencias de "${marker}"`, el(`${id}-console`)._log.filter((l) => l.includes(marker)).length, expected);
}

/* --------------------------------------------------- reset determinista */
console.log('\n--- reset: ciclo reproducible y terminal limpia ---');
for (const id of ['for', 'forEach', 'map', 'reduce', 'forNested']) {
  Engine.reset(id);
  const first = JSON.stringify(Engine.get(id).state);
  Engine.step(id);
  Engine.step(id);
  Engine.reset(id);
  check(`${id} · vuelve al estado inicial`, JSON.stringify(Engine.get(id).state), first);
  check(`${id} · limpia la terminal`, el(`${id}-console`).innerHTML, '');
}

/* --------------------------------------------------- play / pause / step */
console.log('\n--- play / pause / step / speed ---');
Engine.reset('for');
check('estado inicial: laser atenuado, emisor no excitado', [el('laser-beam').style.opacity, el('laser-emitter').classList.contains('glow-cyan')], ['0.25', false]);
Engine.play('for');
const during = JSON.stringify(Engine.get('for').state);
Engine.step('for');
check('step · ignorado mientras corre en reproduccion', JSON.stringify(Engine.get('for').state), during);
Engine.pause('for');
check('pause · detiene la reproduccion', Engine.isRunning('for'), false);
Engine.step('for');
check('step · vuelve a avanzar tras pausar', JSON.stringify(Engine.get('for').state) !== during, true);
Engine.setSpeed('for', 400);
check('speed · configurable en caliente', Engine.get('for').speed, 400);
Engine.reset('for');
check('init: el dial vuelve a 0 tras reiniciar', String(el('lcd-index').textContent), '0');

console.log(`\n${failures.length ? `FALLAS: ${failures.length}` : 'TODO OK'}`);
process.exit(failures.length ? 1 : 0);