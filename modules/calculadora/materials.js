/* Gestiona el catalogo central sin mezclarlo con el estado del calculo actual. */
(function initMaterialsManager(global) {
  'use strict';

  let editingId = null;
  let search = '';
  let returnFocus = null;
  let returnRow = null;

  const getAll = () => AppStorage.getMaterials();
  const saveAll = (items) => AppStorage.saveMaterials(items);
  const fmtCost = (value) => AppFormat.currencyARS(value);
  function formError(message) {
    const node = document.getElementById('material-form-error');
    node.textContent = message;
    node.hidden = !message;
  }

  function projectsUsing(materialId) {
    return AppStorage.getProjects().filter((project) =>
      (project.datos || project).insumos?.some((item) => item.materialId === materialId)
    );
  }

  function options(selectedId = '') {
    const items = getAll().filter((item) => item.activo || item.id === selectedId);
    const missing = selectedId && !items.some((item) => item.id === selectedId)
      ? `<option value="${AppFormat.escapeHTML(selectedId)}" selected>Material no disponible - desvincula para editar</option>`
      : '';
    return missing + items.map((item) => {
      const label = `${item.nombre}${item.marca ? ` - ${item.marca}` : ''} (${fmtCost(item.costoUnidad)}/${item.unidadUso})`;
      return `<option value="${AppFormat.escapeHTML(item.id)}" ${item.id === selectedId ? 'selected' : ''}>${AppFormat.escapeHTML(label)}</option>`;
    }).join('');
  }

  function render() {
    const list = document.getElementById('lista-catalogo-materiales');
    if (!list) return;
    const query = search.toLocaleLowerCase('es');
    const items = getAll().filter((item) =>
      !query || `${item.nombre} ${item.marca} ${item.categoria}`.toLocaleLowerCase('es').includes(query)
    );
    if (!items.length) {
      list.innerHTML = '<div class="material-empty">Todavia no hay materiales que coincidan.</div>';
      return;
    }
    list.innerHTML = items.map((item) => {
      const linked = projectsUsing(item.id).length;
      return `<article class="catalog-material ${item.activo ? '' : 'inactive'}">
        <div class="catalog-material-main">
          <strong>${AppFormat.escapeHTML(AppMaterials.materialLabel(item))}</strong>
          <small>Costo unitario: ${fmtCost(item.costoUnidad)} &middot; ${linked} ${linked === 1 ? 'producto vinculado' : 'productos vinculados'}</small>
        </div>
        <div class="catalog-material-actions">
          <button type="button" data-material-action="edit" data-id="${AppFormat.escapeHTML(item.id)}">Editar</button>
          <button type="button" data-material-action="toggle" data-id="${AppFormat.escapeHTML(item.id)}">${item.activo ? 'Desactivar' : 'Activar'}</button>
          ${linked ? '' : `<button type="button" class="danger" data-material-action="delete" data-id="${AppFormat.escapeHTML(item.id)}">Eliminar</button>`}
        </div>
      </article>`;
    }).join('');
  }

  function resetForm() {
    editingId = null;
    const form = document.getElementById('form-material');
    form?.reset();
    document.getElementById('material-form-title').textContent = 'Agregar material';
    document.getElementById('btn-cancelar-edicion-material').hidden = true;
    formError('');
  }

  function open(id) {
    returnFocus = document.activeElement;
    returnRow = returnFocus?.closest('.ingredient-row')?.dataset.index;
    resetForm();
    render();
    abrirModal('modal-materiales');
    if (typeof id === 'string') edit(id);
    else document.getElementById('material-nombre').focus();
  }

  function close() {
    cerrarModal('modal-materiales');
    const target = returnFocus?.isConnected ? returnFocus
      : document.querySelector(`#lista-insumos [data-index="${returnRow}"] [data-field="nombre"]`);
    (target || document.getElementById('btn-abrir-materiales')).focus();
  }

  function edit(id) {
    const item = getAll().find((material) => material.id === id);
    if (!item) return;
    editingId = id;
    document.getElementById('material-nombre').value = AppMaterials.materialLabel(item);
    document.getElementById('material-categoria').value = item.categoria;
    document.getElementById('material-precio').value = item.costoUnidad;
    document.getElementById('material-form-title').textContent = 'Editar material';
    document.getElementById('btn-cancelar-edicion-material').hidden = false;
    document.getElementById('material-nombre').focus();
    formError('');
  }

  function submit(event) {
    event.preventDefault();
    const items = getAll();
    const previous = items.find((item) => item.id === editingId);
    const now = new Date().toISOString();
    const raw = {
      ...(previous || {}),
      id: previous?.id,
      nombre: document.getElementById('material-nombre').value,
      marca: '',
      calculoDirecto: true,
      costoDirecto: document.getElementById('material-precio').value,
      unidadUso: previous?.unidadUso || 'u',
      categoria: document.getElementById('material-categoria').value,
      actualizadoEn: now,
    };
    if (previous && Number(previous.costoUnidad) !== Number(raw.costoDirecto)) {
      raw.historialPrecios = [...previous.historialPrecios, { fecha: now, precio: previous.precioCompra, costoUnitario: previous.costoUnidad }].slice(-24);
    }
    const normalized = AppMaterials.normalize(raw);
    if (!normalized.nombre || normalized.costoUnidad <= 0) {
      formError('Completá el nombre y un precio mayor a cero.');
      return;
    }
    if (items.some(item => item.id !== editingId && AppMaterials.sameVariant(item, normalized))) {
      formError('Ese nombre ya está guardado. Buscá el material y editá su costo; no hace falta duplicarlo.');
      return;
    }
    if (previous) {
      const count = projectsUsing(previous.id).length;
      if (!confirm(`Vas a actualizar el material guardado. Se recalcularán ${count} proyecto(s) vinculado(s) y los cálculos abiertos que lo usen. Las ventas ya registradas no cambian. ¿Guardar estos cambios?`)) return;
    }
    const index = items.findIndex((item) => item.id === editingId);
    if (index >= 0) items[index] = normalized;
    else items.unshift(normalized);
    if (!saveAll(items)) return formError('No se pudo guardar. Conservá un respaldo y revisá el espacio del dispositivo.');
    resetForm();
    render();
    global.dispatchEvent(new CustomEvent('materials:changed'));
    mostrarToast(index >= 0 ? 'Material actualizado' : 'Material agregado');
  }

  function toggle(id) {
    const items = getAll();
    const item = items.find((material) => material.id === id);
    if (!item) return;
    item.activo = !item.activo;
    saveAll(items);
    render();
    global.dispatchEvent(new CustomEvent('materials:changed'));
  }

  function remove(id) {
    const draftUsesIt = AppStorage.getCalculatorDraft()?.insumos?.some((item) => item.materialId === id);
    if (projectsUsing(id).length || draftUsesIt) {
      mostrarToast('Este material esta vinculado a productos');
      return;
    }
    if (!confirm('¿Eliminar este material del catalogo?')) return;
    saveAll(getAll().filter((item) => item.id !== id));
    render();
    global.dispatchEvent(new CustomEvent('materials:changed'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    // El catálogo mantiene el foco dentro del diálogo y permite volver con Escape.
    document.getElementById('modal-materiales').addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const controls = [...event.currentTarget.querySelectorAll('button, input, select')].filter(el => !el.disabled && el.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    document.getElementById('btn-abrir-materiales')?.addEventListener('click', open);
    document.getElementById('form-material')?.addEventListener('submit', submit);
    document.getElementById('btn-cancelar-edicion-material')?.addEventListener('click', resetForm);
    document.getElementById('buscar-materiales')?.addEventListener('input', (event) => { search = event.target.value.trim(); render(); });
    document.getElementById('lista-catalogo-materiales')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-material-action]');
      if (!button) return;
      const actions = { edit, toggle, delete: remove };
      actions[button.dataset.materialAction]?.(button.dataset.id);
    });
  });

  global.MaterialCatalog = Object.freeze({ getAll, options, render, open, close, resetForm });
})(window);
