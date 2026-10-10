/* Accesibilidad común sin alterar el contenido ni la identidad de las tarjetas. */
(function () {
  const filters = document.querySelectorAll('.filter-btn');
  function announceFilters() {
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));
  }
  const observer = new MutationObserver(announceFilters);
  filters.forEach(button => observer.observe(button, { attributes: true, attributeFilter: ['class'] }));
  announceFilters();
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const panel = document.getElementById('filter-panel');
    if (panel && !panel.hidden) {
      panel.hidden = true;
      const trigger = document.getElementById('filter-toggle');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }
  });
  const toast = document.getElementById('toast');
  if (toast) { toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite'); }
  // Sin conexión, una inicial evita que los logos externos queden como cajas vacías.
  document.querySelectorAll('.tool-logo img').forEach(img => {
    function showInitials() {
      const logo = img.parentElement;
      if (logo.classList.contains('logo-fallback')) return;
      logo.classList.add('logo-fallback');
      img.hidden = true;
      const initials = document.createElement('span');
      initials.textContent = img.alt.split(' ').slice(0, 2).map(word => word[0]).join('');
      initials.setAttribute('aria-hidden', 'true');
      logo.append(initials);
    }
    img.addEventListener('error', showInitials);
    if (img.complete && !img.naturalWidth) showInitials();
  });
})();
