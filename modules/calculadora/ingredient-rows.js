/* Edición local de insumos: nunca escribe sobre un material compartido. */
(function initIngredientRows(global) {
  'use strict';
  const esc = (value) => AppFormat.escapeHTML(String(value ?? ''));
  const money = (value) => AppFormat.currencyARS(value);
  const units = AppMaterials.UNITS;
  const label = item => AppMaterials.ingredientLabel(item);

  function create(index) {
    const item = () => estado.insumos[index];
    const ins = item();
    const wrap = document.createElement('div');
    wrap.className = 'row-insumo-wrap ingredient-row';
    wrap.dataset.index = index;
    wrap.innerHTML = `<div class="ingredient-body">
      <div class="ingredient-main">
        <div class="ingredient-name"><label for="ingredient-name-${index}">Material ${index + 1}</label><input id="ingredient-name-${index}" data-field="nombre" type="text" maxlength="240" aria-label="Nombre del material ${index + 1}" placeholder="Ej.: Harina Pureza — 1 kg" value="${esc(label(ins))}" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="suggestions-${index}" autocomplete="off"><div id="suggestions-${index}" class="material-suggestions" role="listbox" aria-label="Materiales guardados" hidden></div></div>
        <label>Cantidad<input data-field="cantidad" type="number" min="0" step="any" inputmode="decimal" value="${ins.cantidad}" aria-label="Cantidad"></label>
        <label>Costo unitario ($)<input data-field="precio" type="number" min="0" step="any" inputmode="decimal" value="${ins.precio}" aria-label="Costo unitario"></label>
        <label>Total ($)<output aria-label="Total del material"></output></label>
      </div>
      <p class="ingredient-error" role="alert" hidden></p>
      <div class="ingredient-footer">
        <span class="ingredient-status" role="status"></span>
        <div class="ingredient-actions">
          <button type="button" data-action="save">Guardar material</button>
          <button type="button" data-action="edit" aria-expanded="false" aria-controls="edit-options-${index}">Editar <span aria-hidden="true">⌄</span></button>
          <button type="button" data-action="cancel">Cancelar edición</button>
        </div>
      </div>
      <div id="edit-options-${index}" class="ingredient-edit-options" role="group" aria-label="Opciones de edición" hidden>
        <button type="button" data-action="local"><strong>Editar solo acá</strong><span>Los cambios no afectan otros productos.</span></button>
        <button type="button" data-action="global"><strong>Editar en catálogo</strong><span>Actualiza todos los productos vinculados.</span></button>
      </div>
    </div><button type="button" class="btn-delete" aria-label="Eliminar material ${index + 1}">×</button>`;
    const field = (key) => wrap.querySelector(`[data-field="${key}"]`);
    const name = field('nombre');
    const suggestions = wrap.querySelector('.material-suggestions');
    const editButton = wrap.querySelector('[data-action="edit"]');
    const editOptions = wrap.querySelector('.ingredient-edit-options');
    // La edición se descubre a pedido, sin desbloquear datos hasta elegir su alcance.
    function closeEditOptions() {
      editOptions.hidden = true;
      editButton.setAttribute('aria-expanded', 'false');
    }
    wrap.closeEditOptions = closeEditOptions;
    wrap.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !editOptions.hidden) {
        event.preventDefault(); closeEditOptions(); editButton.focus();
      }
    });
    wrap.addEventListener('focusout', event => {
      if (!wrap.contains(event.relatedTarget)) closeEditOptions();
    });
    let active = -1;
    let matches = [];
    function closeSuggestions() {
      suggestions.hidden = true;
      name.setAttribute('aria-expanded', 'false');
      name.removeAttribute('aria-activedescendant');
      active = -1;
    }
    function showSuggestions() {
      if (item().materialId || wrap.dataset.editing) return;
      const query = AppMaterials.textKey(name.value);
      matches = MaterialCatalog.getAll().filter(m => m.activo && AppMaterials.textKey(AppMaterials.materialLabel(m)).includes(query)).slice(0, 8);
      if (!matches.length) return closeSuggestions();
      suggestions.innerHTML = matches.map((m, i) => `<button type="button" role="option" aria-selected="false" id="suggestion-${index}-${i}" data-match="${i}"><strong>${esc(AppMaterials.materialLabel(m))}</strong><span>Costo unitario: ${money(m.costoUnidad)}</span></button>`).join('');
      suggestions.hidden = false;
      name.setAttribute('aria-expanded', 'true');
      active = -1;
    }
    function selectMatch(i) {
      const selected = matches[i];
      if (!selected) return;
      const before = item();
      const base = selected.unidadUso;
      if (before.cantidad && (before.precio || before.unidad) && before.unidad !== base
        && !confirm(`La cantidad usada se expresará en ${units[base].name.toLowerCase()}s. Revisala después de seleccionar el material. ¿Continuar?`)) return;
      vincularMaterial(index, selected.id);
      document.querySelector(`#lista-insumos [data-index="${index}"] [data-field="cantidad"]`)?.focus();
    }
    name.addEventListener('focus', showSuggestions);
    name.addEventListener('keydown', event => {
      if (event.key === 'Escape') return closeSuggestions();
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (suggestions.hidden) showSuggestions();
        if (!matches.length) return;
        active = (active + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length;
        suggestions.querySelectorAll('[role="option"]').forEach((option, i) => option.setAttribute('aria-selected', i === active));
        name.setAttribute('aria-activedescendant', `suggestion-${index}-${active}`);
        suggestions.children[active].scrollIntoView({ block: 'nearest' });
      } else if (event.key === 'Enter' && active >= 0 && !suggestions.hidden) {
        event.preventDefault(); selectMatch(active);
      }
    });
    suggestions.addEventListener('pointerdown', event => event.preventDefault());
    suggestions.addEventListener('click', event => {
      const option = event.target.closest('[data-match]');
      if (option) selectMatch(Number(option.dataset.match));
    });
    wrap.addEventListener('focusout', event => { if (!suggestions.contains(event.relatedTarget)) closeSuggestions(); });

    // Conserva el costo vigente sin reinterpretar medidas ni borrar metadatos anteriores.
    function change(control) {
      const key = control.dataset.field;
      const current = item();
      if (!key || (current.materialId && !wrap.dataset.editing && key !== 'cantidad')) return;
      const value = key === 'nombre' ? control.value : Number(control.value) || 0;
      const previous = key === 'nombre' ? label(current) : current[key];
      if (value === previous) return;
      if (key !== 'cantidad') {
        const oldLabel = label(current);
        if (current.materialId) {
          current.materialId = null;
          current.materialNoEncontrado = false;
          current.desvinculado = true;
          delete wrap.dataset.editing;
        }
        current.nombre = key === 'nombre' ? value : oldLabel;
        current.nombreMaterial = current.nombre;
        current.presentacionActiva = false;
      }
      current[key] = value;
    }
    wrap.sync = () => wrap.querySelectorAll('[data-field]').forEach(change);
    wrap.addEventListener('input', event => {
      if (!event.target.dataset.field) return;
      change(event.target); refresh(); actualizar();
      if (event.target === name) showSuggestions();
    });
    function error(message) {
      const node = wrap.querySelector('.ingredient-error');
      node.textContent = message;
      node.hidden = !message;
    }
    function save() {
      const current = item();
      if (!current.nombre.trim() || !(current.precio > 0)) return error('Completá el nombre y un costo unitario mayor a cero.');
      const material = AppMaterials.normalize({ nombre: label(current), calculoDirecto: true,
        costoDirecto: current.precio, unidadUso: current.unidad || 'u' });
      const all = MaterialCatalog.getAll();
      if (all.some(m => AppMaterials.sameVariant(m, material))) {
        return error('Ese nombre ya está guardado. Elegilo al buscar o editá su costo en Administrar materiales.');
      }
      if (!AppStorage.saveMaterials([material, ...all])) return error('No se pudo guardar. Conservá un respaldo y revisá el espacio del dispositivo.');
      vincularMaterial(index, material.id);
      mostrarToast('Material guardado y vinculado');
    }
    wrap.addEventListener('click', event => {
      if (event.target.closest('.btn-delete')) return eliminarInsumo(index);
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'edit') {
        const opening = editOptions.hidden;
        editOptions.hidden = !opening;
        editButton.setAttribute('aria-expanded', String(opening));
      }
      if (action === 'local') { closeEditOptions(); wrap.dataset.editing = 'true'; refresh(); name.focus(); }
      if (action === 'cancel') { delete wrap.dataset.editing; refresh(); editButton.focus(); }
      if (action === 'global') {
        closeEditOptions(); editButton.focus(); MaterialCatalog.open(item().materialId);
      }
      if (action === 'save') save();
    });
    function refresh() {
      const current = item();
      const linked = Boolean(current.materialId);
      const locked = linked && !wrap.dataset.editing;
      wrap.classList.toggle('linked', linked);
      name.readOnly = locked;
      field('precio').readOnly = locked;
      wrap.querySelector('output').textContent = money(current.cantidad * current.precio);
      const status = wrap.querySelector('.ingredient-status');
      status.textContent = current.materialNoEncontrado ? 'No disponible · Se conserva el último costo.'
        : linked ? (wrap.dataset.editing ? 'Un cambio lo desvincula sin afectar otros productos.' : 'Guardado · Protegido')
        : current.desvinculado ? 'Desvinculado · Solo este cálculo'
        : current.nombre.trim() ? 'Sin guardar · Guardalo para reutilizarlo.' : '';
      wrap.querySelector('.ingredient-footer').hidden = !status.textContent;
      editButton.hidden = !linked || Boolean(wrap.dataset.editing);
      if (editButton.hidden) closeEditOptions();
      wrap.querySelector('[data-action="cancel"]').hidden = !wrap.dataset.editing;
      wrap.querySelector('[data-action="save"]').hidden = linked || !current.nombre.trim();
    }
    refresh();
    return wrap;
  }
  // Cerrar al tocar fuera también funciona en controles que no reciben foco.
  document.addEventListener('pointerdown', event => {
    document.querySelectorAll('.ingredient-row').forEach(row => {
      if (!row.contains(event.target)) row.closeEditOptions?.();
    });
  });
  global.IngredientRows = Object.freeze({ create });
})(window);
