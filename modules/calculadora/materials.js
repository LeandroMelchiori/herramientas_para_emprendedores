/* Gestiona el catalogo central sin mezclarlo con el estado del calculo actual. */
(function initMaterialsManager(global) {
  'use strict';

  let editingId = null;
  let search = '';

  const getAll = () => AppStorage.getMaterials();
  const saveAll = (items) => AppStorage.saveMaterials(items);
  const fmtCost = (value) => AppFormat.currencyARS(value);

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
          <strong>${AppFormat.escapeHTML(item.nombre)}</strong>
          <span>${AppFormat.escapeHTML(item.marca || 'Sin marca')} &middot; ${item.cantidadPresentacion} ${item.unidadPresentacion} por ${fmtCost(item.precioCompra)}</span>
          <small>${fmtCost(item.costoUnidad)} por ${item.unidadUso} &middot; ${linked} ${linked === 1 ? 'producto vinculado' : 'productos vinculados'}</small>
        </div>
        <div class="catalog-material-actions">
          <button type="button" data-material-action="edit" data-id="${item.id}">Editar</button>
          <button type="button" data-material-action="toggle" data-id="${item.id}">${item.activo ? 'Desactivar' : 'Activar'}</button>
          ${linked ? '' : `<button type="button" class="danger" data-material-action="delete" data-id="${item.id}">Eliminar</button>`}
        </div>
      </article>`;
    }).join('');
  }

  function resetForm() {
    editingId = null;
    const form = document.getElementById('form-material');
    form?.reset();
    document.getElementById('material-cantidad').value = 1;
    document.getElementById('material-unidad').value = 'kg';
    document.getElementById('material-form-title').textContent = 'Agregar material';
    document.getElementById('btn-cancelar-edicion-material').hidden = true;
  }

  function open() {
    resetForm();
    render();
    abrirModal('modal-materiales');
  }

  function edit(id) {
    const item = getAll().find((material) => material.id === id);
    if (!item) return;
    editingId = id;
    document.getElementById('material-nombre').value = item.nombre;
    document.getElementById('material-marca').value = item.marca;
    document.getElementById('material-categoria').value = item.categoria;
    document.getElementById('material-cantidad').value = item.cantidadPresentacion;
    document.getElementById('material-unidad').value = item.unidadPresentacion;
    document.getElementById('material-precio').value = item.precioCompra;
    document.getElementById('material-form-title').textContent = 'Editar material';
    document.getElementById('btn-cancelar-edicion-material').hidden = false;
    document.getElementById('material-nombre').focus();
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
      marca: document.getElementById('material-marca').value,
      categoria: document.getElementById('material-categoria').value,
      cantidadPresentacion: document.getElementById('material-cantidad').value,
      unidadPresentacion: document.getElementById('material-unidad').value,
      precioCompra: document.getElementById('material-precio').value,
      actualizadoEn: now,
    };
    if (previous && Number(previous.precioCompra) !== Number(raw.precioCompra)) {
      raw.historialPrecios = [...previous.historialPrecios, { fecha: now, precio: previous.precioCompra }].slice(-24);
    }
    const normalized = AppMaterials.normalize(raw);
    if (!normalized.nombre || normalized.precioCompra <= 0) {
      mostrarToast('Completa el nombre y un precio mayor a cero');
      return;
    }
    const index = items.findIndex((item) => item.id === editingId);
    if (index >= 0) items[index] = normalized;
    else items.unshift(normalized);
    saveAll(items);
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

  global.MaterialCatalog = Object.freeze({ getAll, options, render, open, resetForm });
})(window);
