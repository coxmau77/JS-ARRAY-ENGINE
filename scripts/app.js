/* ==========================================================================
   APP · ENRUTADO DE VISTAS Y NAVEGACIÓN
   ========================================================================== */

(function (global) {
  'use strict';

  const VIEWS = ['hub', 'for', 'forEach', 'map', 'reduce'];

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Aplica el estado de navegación: una sola vista activa, una sola pestaña
     activa, breadcrumbs sincronizados. */
  function applyView(viewName) {
    const name = VIEWS.includes(viewName) ? viewName : 'hub';

    document.querySelectorAll('.view-container').forEach(el => {
      el.classList.toggle('active', el.id === `view-${name}`);
      el.setAttribute('aria-hidden', String(el.id !== `view-${name}`));
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      const isActive = btn.dataset.view === name;
      btn.classList.toggle('active', isActive);
      if (isActive) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    const crumbs = document.getElementById('breadcrumbs');
    const crumb = document.getElementById('breadcrumb-current');
    if (crumbs) crumbs.hidden = (name === 'hub');
    if (crumb) crumb.textContent = name === 'hub' ? 'HUB GENERAL' : name.toUpperCase();

    /* Al salir de una máquina, su reproducción se detiene: nadie debe seguir
       corriendo un temporizador fuera de pantalla. */
    global.Engine && VIEWS.filter(v => v !== 'hub' && v !== name)
      .forEach(id => global.Engine.pause(id));

    document.title = name === 'hub'
      ? 'JS Array Engine — Blueprint Interactivo'
      : `JS Array Engine — ${name.toUpperCase()}`;

    return name;
  }

  /* View Transitions API cuando está disponible: el Hub se siente como un
     acercamiento a la máquina. Fallback: cambio directo (fadeIn de la vista). */
  function switchView(viewName) {
    if (!document.startViewTransition || prefersReducedMotion()) {
      applyView(viewName);
      return;
    }
    document.startViewTransition(() => applyView(viewName));
  }

  /* ------------------------------------------------------------------------
     Binding: tarjetas del Hub, pestañas y botón de retorno
     ------------------------------------------------------------------------ */
  function bindNavigation() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => switchView(el.dataset.nav));
    });

    /* Las tarjetas del Hub también deben activarse con el teclado: un <article>
       con onclick no es alcanzable. Se les da rol y tabindex. */
    document.querySelectorAll('.blueprint-card').forEach(card => {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          switchView(card.dataset.nav);
        }
      });
    });

    /* Flechas del teclado sobre las pestañas */
    const tabs = Array.from(document.querySelectorAll('.tab-btn'));
    tabs.forEach((tab, i) => {
      tab.addEventListener('keydown', (e) => {
        const delta = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!delta) return;
        e.preventDefault();
        const next = tabs[(i + delta + tabs.length) % tabs.length];
        next.focus();
        switchView(next.dataset.view);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindNavigation();
    applyView('hub');
  });

  global.switchView = switchView;
  global.applyView = applyView;
})(window);