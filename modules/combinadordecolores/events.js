/* Eventos declarativos del combinador; mantiene la lógica fuera del marcado. */
document.addEventListener('DOMContentLoaded', () => {
  const on = (id, event, handler) => document.getElementById(id)?.addEventListener(event, handler);
  on('copy-hex-btn', 'click', copyHeroHex);
  on('native-picker', 'input', (event) => fromHex(event.target.value));
  ['s-h', 's-hs', 's-hl'].forEach((id) => on(id, 'input', fromHslSliders));
  ['s-r', 's-g', 's-b'].forEach((id) => on(id, 'input', fromRgbSliders));
  on('hex-input', 'input', (event) => fromHexInput(event.target.value));
  on('harmony-header', 'click', toggleHarmonies);
  on('print-btn', 'click', printPDF);
  document.querySelectorAll('[data-color-tab]').forEach((button) => {
    button.addEventListener('click', () => setTab(button.dataset.colorTab));
  });
});
