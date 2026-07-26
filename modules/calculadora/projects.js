/* Proyectos, restauracion y operaciones destructivas de la calculadora. */

function obtenerProyectos() { return AppStorage.getProjects(); }

function guardarProyectos(lista) { return AppStorage.saveProjects(lista); }

function abrirModalGuardar() {
  const editando = proyectoActivoId !== null;
  document.getElementById('modal-guardar-titulo').textContent =
    editando ? 'Actualizar proyecto' : 'Nombrar proyecto';
  document.getElementById('input-nombre-proyecto').value =
    editando ? proyectoActivoNombre : (document.getElementById('nombre-producto').value || '');
  document.getElementById('btn-guardar-nuevo').style.display   = editando ? '' : 'none';
  document.getElementById('btn-guardar-confirm').textContent   = editando ? '✓ Actualizar' : '💾 Guardar';
  abrirModal('modal-guardar');
  setTimeout(() => document.getElementById('input-nombre-proyecto').focus(), 100);
}

function confirmarGuardar(comoNuevo = false) {
  const nombre = document.getElementById('input-nombre-proyecto').value.trim();
  if (!nombre) {
    document.getElementById('input-nombre-proyecto').classList.add('input-error');
    return;
  }
  const d = leerEstadoCompleto();
  if (!d.insumos.length && !d.servicios.length) {
    mostrarToast('Agregá al menos un costo antes de guardar');
    cerrarModal('modal-guardar');
    return;
  }
  const lista  = obtenerProyectos();
  const hoy    = new Date().toLocaleDateString('es-AR');
  let toastMsg;

  if (proyectoActivoId !== null && !comoNuevo) {
    /* Actualizar el proyecto existente en su posición */
    const idx = lista.findIndex(x => x.id === proyectoActivoId);
    if (idx !== -1) {
      lista[idx] = { id: proyectoActivoId, nombre, fecha: hoy, datos: d };
    } else {
      /* El proyecto fue eliminado mientras tanto — guardar como nuevo */
      const nuevo = { id: Date.now(), nombre, fecha: hoy, datos: d };
      lista.unshift(nuevo);
      proyectoActivoId = nuevo.id;
    }
    proyectoActivoNombre = nombre;
    toastMsg = 'Proyecto actualizado ✓';
  } else {
    /* Proyecto nuevo (o copia) */
    const nuevo = { id: Date.now(), nombre, fecha: hoy, datos: d };
    lista.unshift(nuevo);
    proyectoActivoId     = nuevo.id;
    proyectoActivoNombre = nombre;
    toastMsg = comoNuevo ? 'Guardado como nuevo proyecto ✓' : 'Proyecto guardado ✓';
  }

  guardarProyectos(lista);
  proyectoGuardadoEnSesion = true;
  sincronizarBarraActivo();
  cerrarModal('modal-guardar');
  renderizarProyectos();
  mostrarToast(toastMsg);
  if (typeof trackEvent === 'function') trackEvent('guardar_proyecto');
}

function cargarProyecto(id) {
  const p = obtenerProyectos().find(x => x.id === id);
  if (!p) return;
  proyectoActivoId         = p.id;
  proyectoActivoNombre     = p.nombre;
  proyectoGuardadoEnSesion = true;
  aplicarEstado(p.datos);
  renderizarFilas();
  setModo(p.datos.modo || 'slider');
  actualizar();
  sincronizarBarraActivo();
  goTo(0, true);
  mostrarToast(`"${p.nombre}" cargado`);
}

function sincronizarBarraActivo() {
  const barra    = document.getElementById('proyecto-activo-bar');
  const nombreEl = document.getElementById('proyecto-activo-nombre');
  const editando = proyectoActivoId !== null;
  barra.style.display = editando ? 'block' : 'none';
  if (editando) nombreEl.textContent = proyectoActivoNombre;

  /* Actualizar textos en la card de Proyectos */
  const titulo    = document.getElementById('titulo-guardar-card');
  const info      = document.getElementById('info-guardar-card');
  const btnPrinc  = document.getElementById('btn-guardar-principal');
  if (titulo) titulo.textContent = editando ? 'Actualizar proyecto' : 'Guardar proyecto actual';
  if (info)   info.textContent   = editando
    ? `Guardás los cambios sobre "${proyectoActivoNombre}".`
    : 'Guardá el cálculo que estás haciendo con un nombre para encontrarlo después.';
  if (btnPrinc) btnPrinc.textContent = editando ? '✓ Actualizar proyecto' : '💾 Guardar proyecto actual';
}

function limpiarTodo() {
  if (!confirm('¿Limpiar todos los campos y empezar un cálculo nuevo?')) return;
  proyectoActivoId         = null;
  proyectoActivoNombre     = '';
  proyectoGuardadoEnSesion = false;
  Object.assign(estado, {
    insumos:       Array.from({ length: FILAS_INICIALES }, filaInsumoVacia),
    servicios:     Array.from({ length: FILAS_INICIALES }, filaServicioVacia),
    margen:        50,
    modo:          'slider',
    soloServicios: false,
    ivaActivo:     false,
  });
  ['nombre-producto', 'gastos-mensuales', 'precio-manual', 'meta-ingresos']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('unidades').value      = 1;
  document.getElementById('margen-slider').value = 50;
  { const mi = document.getElementById('margen-input'); if (mi) mi.value = 50; }
  document.getElementById('dias-laborales').value = 24;
  const ivaEl = document.getElementById('iva-toggle');
  if (ivaEl) ivaEl.checked = false;
  sincronizarUIToggle();
  renderizarFilas();
  setModo('slider');
  actualizar();
  sincronizarBarraActivo();
  AppStorage.remove(AppStorage.KEYS.calculatorDraft);
  goTo(0, true);
  mostrarToast('Campos limpiados — nuevo cálculo listo');
}

function confirmarVaciar(fn, btn) {
  if (btn.dataset.pendiente) {
    clearTimeout(parseInt(btn.dataset.pendiente));
    delete btn.dataset.pendiente;
    btn.textContent = 'Vaciar';
    btn.classList.remove('confirmando');
    fn();
    return;
  }
  btn.classList.add('confirmando');
  btn.textContent = '¿Confirmás?';
  const t = setTimeout(() => {
    delete btn.dataset.pendiente;
    btn.textContent = 'Vaciar';
    btn.classList.remove('confirmando');
  }, 2500);
  btn.dataset.pendiente = t;
}

function vaciarInsumos() {
  estado.insumos = Array.from({ length: FILAS_INICIALES }, filaInsumoVacia);
  renderizarFilas();
  actualizar();
}

function vaciarServicios() {
  estado.servicios = Array.from({ length: FILAS_INICIALES }, filaServicioVacia);
  renderizarFilas();
  actualizar();
}

function vaciarPrecio() {
  estado.margen    = 50;
  estado.modo      = 'slider';
  estado.ivaActivo = false;
  document.getElementById('margen-slider').value = 50;
  { const mi = document.getElementById('margen-input'); if (mi) mi.value = 50; }
  document.getElementById('precio-manual').value = '';
  const ivaEl = document.getElementById('iva-toggle');
  if (ivaEl) ivaEl.checked = false;
  setModo('slider');
  actualizar();
}

function vaciarVentas() {
  document.getElementById('gastos-mensuales').value = '';
  document.getElementById('dias-laborales').value   = 24;
  document.getElementById('meta-ingresos').value    = '';
  actualizar();
}

function duplicarProyecto(id) {
  const lista = obtenerProyectos();
  const p = lista.find(x => x.id === id);
  if (!p) return;
  lista.unshift({ id: Date.now(), nombre: `${p.nombre} (copia)`, fecha: new Date().toLocaleDateString('es-AR'), datos: p.datos });
  guardarProyectos(lista);
  renderizarProyectos();
  mostrarToast('Proyecto duplicado');
}

function eliminarProyecto(id) {
  guardarProyectos(obtenerProyectos().filter(x => x.id !== id));
  renderizarProyectos();
  mostrarToast('Proyecto eliminado');
}

function filtrarProyectos(val) {
  _filtroProyectos = val.trim().toLowerCase();
  _pagProyectos = 1;
  renderizarProyectos();
}

function cambiarPaginaProyectos(delta) {
  _pagProyectos += delta;
  renderizarProyectos();
}

function renderizarProyectos() {
  const lista = document.getElementById('lista-proyectos');
  const paginacion = document.getElementById('paginacion-proyectos');
  let proyectos = obtenerProyectos();

  if (_filtroProyectos) {
    proyectos = proyectos.filter(p => p.nombre.toLowerCase().includes(_filtroProyectos));
  }

  if (!proyectos.length) {
    lista.innerHTML = _filtroProyectos
      ? `<p style="text-align:center;color:var(--gris-texto);padding:20px 0;font-size:0.88rem;">Sin resultados para "<b>${escHtml(_filtroProyectos)}</b>"</p>`
      : `<div class="empty-state"><div class="empty-icon">📂</div><p>Todavía no guardaste ningún proyecto.<br>Guardá tu cálculo actual para encontrarlo después.</p></div>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  const POR_PAG = 10;
  const total = proyectos.length;
  const totalPags = Math.ceil(total / POR_PAG);
  _pagProyectos = Math.max(1, Math.min(_pagProyectos, totalPags));
  const ini = (_pagProyectos - 1) * POR_PAG;

  lista.innerHTML = proyectos.slice(ini, ini + POR_PAG).map(p => `
    <div class="proyecto-item">
      <div class="proyecto-info">
        <div class="proyecto-nombre">${escHtml(p.nombre)}</div>
        <div class="proyecto-meta">${p.fecha}</div>
      </div>
      <div class="proyecto-acciones">
        <button class="btn-proyecto-cargar" onclick="cargarProyecto(${p.id})">Cargar</button>
        <button class="btn-proyecto-duplicar" onclick="duplicarProyecto(${p.id})" title="Duplicar">⧉</button>
        <button class="btn-proyecto-eliminar" onclick="eliminarProyecto(${p.id})" title="Eliminar">✕</button>
      </div>
    </div>`).join('');

  if (paginacion) {
    if (total > POR_PAG) {
      paginacion.style.display = 'flex';
      document.getElementById('pag-info').textContent = `Pág. ${_pagProyectos} / ${totalPags}`;
      document.getElementById('pag-prev').disabled = _pagProyectos === 1;
      document.getElementById('pag-next').disabled = _pagProyectos === totalPags;
    } else {
      paginacion.style.display = 'none';
    }
  }
}

function importarJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const restaurado = AppStorage.restoreBackup(JSON.parse(e.target.result));
      if (!restaurado.length) throw new Error('El backup no contiene datos restaurables.');
      const estadoActual = AppStorage.getCalculatorDraft();
      if (estadoActual) {
        aplicarEstado(estadoActual);
        renderizarFilas();
        setModo(estadoActual.modo || 'slider');
      }
      renderizarProyectos();
      mostrarToast(`Restauracion exitosa: ${restaurado.join(' + ')} ?`);
      if (typeof trackEvent === 'function') trackEvent('importar_json');
    } catch (error) {
      console.warn('[Calculadora] Backup invalido.', error);
      mostrarToast('El archivo no es valido');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
