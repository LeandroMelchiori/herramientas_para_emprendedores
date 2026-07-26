/* Enlaza la interfaz con el dominio sin ejecutar JavaScript embebido en el HTML. */
document.addEventListener('DOMContentLoaded', () => {
  const on = (id, event, handler) => document.getElementById(id)?.addEventListener(event, handler);

  ['nombre-producto', 'unidades', 'gastos-mensuales', 'dias-laborales', 'meta-ingresos']
    .forEach((id) => on(id, 'input', actualizar));
  on('toggle-insumos', 'change', (event) => toggleInsumos(event.target.checked));
  on('margen-input', 'input', (event) => actualizarMargenManual(event.target.value));
  on('margen-slider', 'input', (event) => actualizarMargen(event.target.value));
  on('iva-toggle', 'change', toggleIva);
  on('precio-manual', 'input', actualizarPrecioManual);
  on('buscar-proyectos', 'input', (event) => filtrarProyectos(event.target.value));
  on('input-restaurar-calculadora', 'change', importarJSON);

  document.addEventListener('input', (event) => {
    const input = event.target.closest('[data-row-type][data-field]');
    if (!input) return;
    const collection = estado[input.dataset.rowType];
    const row = collection?.[Number(input.dataset.index)];
    if (!row) return;
    row[input.dataset.field] = input.dataset.field === 'nombre'
      ? input.value
      : parseFloat(input.value) || 0;
    input.dataset.field === 'nombre' ? autosave() : actualizar();
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    const id = Number(trigger.dataset.id);
    if (action === 'navigate') goTo(Number(trigger.dataset.page));
    if (action === 'clear-all') limpiarTodo();
    if (action === 'add-supply') agregarInsumo();
    if (action === 'add-service') agregarServicio();
    if (action === 'delete-supply') eliminarInsumo(Number(trigger.dataset.index));
    if (action === 'delete-service') eliminarServicio(Number(trigger.dataset.index));
    if (action === 'set-mode') setModo(trigger.dataset.mode);
    if (action === 'empty') confirmarVaciar(window[trigger.dataset.handler], trigger);
    if (action === 'download-pdf') descargarPDF();
    if (action === 'open-save') abrirModalGuardar();
    if (action === 'share') compartirPorLink();
    if (action === 'backup') exportarBackupCompleto();
    if (action === 'project-page') cambiarPaginaProyectos(Number(trigger.dataset.delta));
    if (action === 'close-modal') cerrarModal(trigger.dataset.modal);
    if (action === 'save-project') confirmarGuardar(trigger.dataset.copy === 'true');
    if (action === 'copy-link') copiarLink();
    if (action === 'load-project') cargarProyecto(id);
    if (action === 'duplicate-project') duplicarProyecto(id);
    if (action === 'delete-project') eliminarProyecto(id);
  });
});
