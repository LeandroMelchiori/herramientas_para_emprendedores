/* ============================================================
   calculadora/index.html — Lógica principal
   ============================================================ */

const MAX_FILAS      = 10;
const AUTOSAVE_SCHEMA = 2;  // incrementar si cambia la estructura del autosave

/* true después de guardar un proyecto en esta sesión; se usa para la advertencia de salida */
let proyectoGuardadoEnSesion = false;
let _pagProyectos = 1;
let _filtroProyectos = '';
let proyectoActivoId         = null;  // id del proyecto cargado (null = cálculo nuevo)
let proyectoActivoNombre     = '';    // nombre del proyecto activo para el modal

/* 5 filas vacías para que el emprendedor pueda empezar a llenar de inmediato */
const filaInsumoVacia  = () => ({ nombre: '', cantidad: 1, precio: 0, materialId: null, unidad: '' });
const filaServicioVacia = () => ({ nombre: '', horas: 1, precio: 0 });
const FILAS_INICIALES  = 5;

const estado = {
  insumos:       Array.from({ length: FILAS_INICIALES }, filaInsumoVacia),
  servicios:     Array.from({ length: FILAS_INICIALES }, filaServicioVacia),
  margen:        50,
  modo:          'slider', // 'slider' | 'precio'
  soloServicios: false,    // emprendedores que no usan materiales
  ivaActivo:     false,    // mostrar precio con IVA incluido
};

/* ── Inicio ── */
document.addEventListener('DOMContentLoaded', () => {
  /* ?reset en la URL limpia el autosave (útil para usuarios con datos corruptos) */
  if (location.search.includes('reset')) {
    AppStorage.remove(AppStorage.KEYS.calculatorDraft);
    history.replaceState(null, '', location.pathname);
  }
  if (!cargarDesdeURL()) cargarAutosave();
  sincronizarUIToggle();
  renderizarFilas();
  setModo(estado.modo);
  actualizar();
  sincronizarBarraActivo();
  /* Flush del autosave al salir de la página.
     Se usan tres eventos porque en iOS 'beforeunload' no es confiable:
     - beforeunload: desktop
     - pagehide: estándar recomendado (cubre iOS)
     - visibilitychange → hidden: captura el "ir al home" en mobile */
  const flushAutosave = () => {
    clearTimeout(autosaveTimer);
    AppStorage.saveCalculatorDraft(leerEstadoCompleto());
  };
  /* Los cambios de precio se reflejan en el calculo abierto sin alterar ventas historicas. */
  window.addEventListener('materials:changed', () => {
    resolverInsumosVinculados();
    renderizarFilas();
    actualizar();
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== AppStorage.KEYS.materials) return;
    resolverInsumosVinculados();
    renderizarFilas();
    actualizar();
  });
  window.addEventListener('pagehide', flushAutosave);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushAutosave();
  });
  /* Advertir al usuario si intenta recargar/cerrar con datos sin guardar como proyecto */
  window.addEventListener('beforeunload', (e) => {
    flushAutosave();
    if (hayDatosSinGuardar()) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
});

/* ── Navegación entre pasos ── */
function goTo(idx) {
  /* Sugerir que carguen costos antes de ir a Precio/Ventas, pero sin bloquear */
  if (idx === 2 || idx === 3) {
    const tienePrecios =
      estado.insumos.some(i => i.precio > 0) ||
      estado.servicios.some(s => s.precio > 0);
    if (!tienePrecios) {
      mostrarToast('Todavía no ingresaste ningún costo');
    }
  }
  document.querySelectorAll('.page').forEach((p, i) => p.classList.toggle('active', i === idx));
  document.querySelectorAll('.nav-tab').forEach((t, i) => {
    t.classList.toggle('active', i === idx);
    if (i === idx) t.classList.add('visitada');
  });
  if (idx === 4) renderizarProyectos();
}

function hayDatosSinGuardar() {
  const nombre = document.getElementById('nombre-producto').value.trim();
  const tieneData = nombre ||
    estado.insumos.some(i => i.nombre.trim() || i.precio > 0) ||
    estado.servicios.some(s => s.nombre.trim() || s.precio > 0);
  return tieneData && !proyectoGuardadoEnSesion;
}

/* Activa o desactiva la sección de materiales con el toggle */
function toggleInsumos(activo) {
  estado.soloServicios = !activo;
  if (!activo) {
    estado.insumos = [];
  } else if (estado.insumos.length === 0) {
    estado.insumos = Array.from({ length: FILAS_INICIALES }, filaInsumoVacia);
  }
  sincronizarUIToggle();
  renderizarFilas();
  actualizar();
}

function sincronizarUIToggle() {
  const activo = !estado.soloServicios;
  const toggleEl = document.getElementById('toggle-insumos');
  if (toggleEl) toggleEl.checked = activo;
  document.getElementById('seccion-insumos').style.display    = activo ? '' : 'none';
  document.getElementById('solo-servicios-aviso').style.display = activo ? 'none' : '';
}

/* ══ INSUMOS Y SERVICIOS ══ */

function agregarInsumo() {
  if (estado.insumos.length >= MAX_FILAS) return;
  estado.insumos.push(filaInsumoVacia());
  renderizarFilas();
  actualizar();
}

function agregarServicio() {
  if (estado.servicios.length >= MAX_FILAS) return;
  estado.servicios.push({ nombre: '', horas: 1, precio: 0 });
  renderizarFilas();
  actualizar();
}

function eliminarInsumo(i) {
  estado.insumos.splice(i, 1);
  renderizarFilas();
  actualizar();
}

function eliminarServicio(i) {
  estado.servicios.splice(i, 1);
  renderizarFilas();
  actualizar();
}

/* Genera las filas de materiales y servicios en el DOM */
function renderizarFilas() {
  const listaI = document.getElementById('lista-insumos');
  listaI.innerHTML = '';
  resolverInsumosVinculados();
  estado.insumos.forEach((ins, i) => {
    const linked = Boolean(ins.materialId);
    const unitHint = linked ? '<small>Precio central · ' + escHtml(ins.unidad || 'u') + '</small>' : '';
    const quantityLabel = linked ? 'Cantidad usada en ' + escHtml(ins.unidad || 'unidades') : 'Cantidad usada';
    const wrap = document.createElement('div');
    wrap.className = 'row-insumo-wrap';
    wrap.innerHTML = `
      <div class="row-insumo ${linked ? 'linked' : ''}">
        <div class="insumo-name-control">
          <select aria-label="Origen del material" onchange="vincularMaterial(${i}, this.value)">
            <option value="">Carga manual</option>
            ${MaterialCatalog.options(ins.materialId)}
          </select>
          <input type="text" placeholder="Material" value="${escHtml(ins.nombre)}" ${linked ? 'readonly' : ''}
            oninput="estado.insumos[${i}].nombre=this.value;autosave()">
          ${unitHint}
        </div>
        <input type="number" min="0" step="any" value="${ins.cantidad}" aria-label="${quantityLabel}"
          oninput="estado.insumos[${i}].cantidad=parseFloat(this.value)||0;actualizar()">
        <input type="number" min="0" step="any" value="${ins.precio}" ${linked ? 'readonly' : ''}
          aria-label="Precio por unidad" oninput="estado.insumos[${i}].precio=parseFloat(this.value)||0;actualizar()">
      </div>
      <button class="btn-delete" onclick="eliminarInsumo(${i})" aria-label="Eliminar">✕</button>`;
    listaI.appendChild(wrap);
  });
  actualizarBadge('limite-insumos', 'btn-agregar-insumo', estado.insumos.length);

  const listaS = document.getElementById('lista-servicios');
  listaS.innerHTML = '';
  estado.servicios.forEach((srv, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'row-insumo-wrap';
    wrap.innerHTML = `
      <div class="row-insumo">
        <input type="text" placeholder="${i === 0 ? 'Mano de obra' : 'Servicio'}" value="${escHtml(srv.nombre)}"
          oninput="estado.servicios[${i}].nombre=this.value;autosave()">
        <input type="number" min="0" step="any" value="${srv.horas}"
          oninput="estado.servicios[${i}].horas=parseFloat(this.value)||0;actualizar()">
        <input type="number" min="0" step="any" value="${srv.precio}"
          oninput="estado.servicios[${i}].precio=parseFloat(this.value)||0;actualizar()">
      </div>
      <button class="btn-delete" onclick="eliminarServicio(${i})" aria-label="Eliminar">✕</button>`;
    listaS.appendChild(wrap);
  });
  actualizarBadge('limite-servicios', 'btn-agregar-servicio', estado.servicios.length);
}

/* Mantiene los insumos vinculados sincronizados con el precio vigente del catalogo. */
function resolverInsumosVinculados() {
  const materials = MaterialCatalog.getAll();
  estado.insumos = estado.insumos.map((insumo) => AppMaterials.resolveIngredient(insumo, materials));
}

function vincularMaterial(index, materialId) {
  const current = estado.insumos[index];
  if (!current) return;
  estado.insumos[index] = materialId
    ? AppMaterials.resolveIngredient({ ...current, materialId }, MaterialCatalog.getAll())
    : { ...current, materialId: null, unidad: '', materialNoEncontrado: false };
  renderizarFilas();
  actualizar();
}

/* Muestra cuántas filas quedan disponibles */
function actualizarBadge(badgeId, btnId, count) {
  const badge = document.getElementById(badgeId);
  const btn   = document.getElementById(btnId);
  const libre = MAX_FILAS - count;
  if (libre <= 0) {
    badge.textContent = 'Límite alcanzado (10)';
    badge.className = 'limite-badge lleno';
    btn.disabled = true;
  } else if (libre <= 3) {
    badge.textContent = `Podés agregar ${libre} más`;
    badge.className = 'limite-badge cerca';
    btn.disabled = false;
  } else {
    badge.textContent = '';
    badge.className = 'limite-badge';
    btn.disabled = false;
  }
}

/* ══ CÁLCULOS ══ */

function calcular() {
  resolverInsumosVinculados();
  const unidades       = Math.max(1, parseFloat(document.getElementById('unidades').value) || 1);
  const totalInsumos   = estado.insumos.reduce((s, i) => s + i.cantidad * i.precio, 0);
  const totalServicios = estado.servicios.reduce((s, v) => s + v.horas * v.precio, 0);
  const costoUnitario  = (totalInsumos + totalServicios) / unidades;

  let precioVenta, margenReal;
  if (estado.modo === 'slider') {
    margenReal  = estado.margen;
    precioVenta = costoUnitario * (1 + margenReal / 100);
  } else {
    precioVenta = Math.max(0, parseFloat(document.getElementById('precio-manual').value) || 0);
    margenReal  = costoUnitario > 0 ? ((precioVenta - costoUnitario) / costoUnitario) * 100 : 0;
  }

  const precioConIva    = precioVenta * 1.21;
  const gananciaNeta    = precioVenta - costoUnitario;
  const gastosMensuales = parseFloat(document.getElementById('gastos-mensuales').value) || 0;
  const diasLaborales   = Math.max(1, parseFloat(document.getElementById('dias-laborales').value) || 24);
  const metaIngresos    = parseFloat(document.getElementById('meta-ingresos').value) || 0;

  const ventasMensuales = gananciaNeta > 0 ? Math.ceil(gastosMensuales / gananciaNeta) : null;
  const ventasDiarias   = ventasMensuales !== null ? Math.ceil(ventasMensuales / diasLaborales) : null;

  /* Unidades necesarias para cubrir costos fijos + meta de ingresos */
  const unidadesMeta = (gananciaNeta > 0 && metaIngresos > 0)
    ? Math.ceil((gastosMensuales + metaIngresos) / gananciaNeta)
    : null;

  /* Desglose proporcional materiales vs servicios */
  const pctInsumos   = costoUnitario > 0 ? Math.round((totalInsumos / unidades / costoUnitario) * 100) : 0;
  const pctServicios = costoUnitario > 0 ? 100 - pctInsumos : 0;

  return {
    totalInsumos, totalServicios, costoUnitario, precioVenta, precioConIva,
    margenReal, gananciaNeta, gastosMensuales, diasLaborales,
    ventasMensuales, ventasDiarias, metaIngresos, unidadesMeta,
    pctInsumos, pctServicios, unidades
  };
}

/* Actualiza todos los elementos de la UI y dispara autosave */
function actualizar() {
  const c = calcular();

  document.getElementById('total-insumos').textContent             = fmt(c.totalInsumos);
  document.getElementById('total-servicios').textContent           = fmt(c.totalServicios);
  document.getElementById('costo-unitario-display').textContent    = fmt(c.costoUnitario);
  document.getElementById('ganancia-unitaria-display').textContent = fmt(c.gananciaNeta);
  document.getElementById('margen-pct').textContent                = `${Math.round(c.margenReal)}%`;
  { const mi = document.getElementById('margen-input'); if (mi && document.activeElement !== mi) mi.value = Math.round(c.margenReal); }
  document.getElementById('precio-venta-display').textContent      = fmt(c.precioVenta);

  /* Precio con IVA debajo del precio principal */
  document.getElementById('precio-con-iva').textContent =
    estado.ivaActivo ? `Con IVA (21%): ${fmt(c.precioConIva)}` : '';

  renderizarTabla(c.costoUnitario, c.margenReal);

  /* Panel de precio inverso */
  if (estado.modo === 'precio') {
    const precioManual = parseFloat(document.getElementById('precio-manual').value) || 0;
    const res    = document.getElementById('resultado-inverso');
    const alerta = document.getElementById('alerta-precio');
    if (precioManual > 0) {
      res.style.display = 'block';
      document.getElementById('margen-calculado').textContent   = `${Math.round(c.margenReal)}%`;
      document.getElementById('ganancia-calculada').textContent = fmt(c.gananciaNeta);
      if (c.gananciaNeta < 0) {
        alerta.style.display = 'block';
        alerta.textContent = '⚠️ Ese precio no cubre tus costos. Estás perdiendo dinero por cada unidad.';
      } else if (c.margenReal < 20) {
        alerta.style.display = 'block';
        alerta.textContent = `⚠️ El margen de ${Math.round(c.margenReal)}% es muy bajo. Se recomienda al menos 30%.`;
      } else {
        alerta.style.display = 'none';
      }
    } else {
      res.style.display = 'none';
    }
  }

  /* Punto de equilibrio */
  document.getElementById('ventas-mensuales').textContent = c.ventasMensuales !== null ? c.ventasMensuales : '-';
  document.getElementById('ventas-diarias').textContent   = c.ventasDiarias   !== null ? c.ventasDiarias   : '-';

  /* Meta de ingresos */
  const metaBox = document.getElementById('resultado-meta');
  if (c.unidadesMeta !== null && c.metaIngresos > 0) {
    metaBox.style.display = 'block';
    document.getElementById('meta-unidades').textContent    = c.unidadesMeta;
    document.getElementById('meta-unidades-dia').textContent = Math.ceil(c.unidadesMeta / c.diasLaborales);
  } else {
    metaBox.style.display = 'none';
  }

  /* Habilitar PDF solo cuando hay datos cargados */
  const hayDatos = estado.insumos.length > 0 || estado.servicios.length > 0;
  document.getElementById('btn-pdf').disabled = !hayDatos;

  /* Título de la pestaña del navegador */
  const nombre = document.getElementById('nombre-producto').value;
  document.title = nombre ? `${nombre} — Calculadora de Costos` : 'Calculadora de Costos';

  actualizarProgresoTabs(c);
  renderizarResumen(c);
  autosave();
}

/* Checkmarks en tabs según si cada paso tiene datos */
function actualizarProgresoTabs(c) {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs[0].classList.toggle('con-datos', estado.soloServicios ||
    estado.insumos.some(i => i.nombre.trim() || i.precio > 0));
  tabs[1].classList.toggle('con-datos',
    estado.servicios.some(s => s.nombre.trim() || s.precio > 0));
  tabs[2].classList.toggle('con-datos', c.precioVenta > 0);
  tabs[3].classList.toggle('con-datos', c.gastosMensuales > 0);
}

/* Tabla comparativa — incluye el margen exacto si no está en los valores base */
function renderizarTabla(costoUnitario, margenActual) {
  let margenes = [10, 25, 50, 75, 100, 150, 200];
  const mr = Math.round(margenActual);
  if (!margenes.includes(mr) && mr >= 5) {
    margenes.push(mr);
    margenes.sort((a, b) => a - b);
  }
  const filas = margenes.map(m => {
    const precio   = costoUnitario * (1 + m / 100);
    const ganancia = precio - costoUnitario;
    const activo   = Math.abs(m - margenActual) < 2;
    return `<tr class="${activo ? 'highlight' : ''}">
      <td>${m}%</td><td>${fmt(precio)}</td><td>${fmt(ganancia)}</td>
    </tr>`;
  });
  document.getElementById('tabla-margenes').innerHTML = `
    <thead><tr><th>Margen</th><th>Precio de venta</th><th>Ganancia</th></tr></thead>
    <tbody>${filas.join('')}</tbody>`;
}

function renderizarResumen(c) {
  const nombre = document.getElementById('nombre-producto').value || 'tu producto';
  const lineas = [
    `Producto: <strong>${escHtml(nombre)}</strong>`,
    `Costo por unidad: <strong>${fmt(c.costoUnitario)}</strong>`,
    `Precio de venta: <strong>${fmt(c.precioVenta)}</strong>`,
    `Margen de ganancia: <strong>${Math.round(c.margenReal)}%</strong>`,
    `Ganancia neta por unidad: <strong>${fmt(c.gananciaNeta)}</strong>`,
  ];
  if (c.gastosMensuales > 0 && c.ventasMensuales !== null) {
    lineas.push(`Punto de equilibrio: <strong>${c.ventasMensuales} unidades/mes</strong> (${c.ventasDiarias} por día)`);
  }
  document.getElementById('resumen-contenido').innerHTML = lineas.join('<br>');

  /* Desglose visual de la composición del costo y del precio */
  const desglose = document.getElementById('desglose-costos');
  if (c.precioVenta > 0) {
    const pctCosto    = Math.round(c.costoUnitario / c.precioVenta * 100);
    const pctGanancia = 100 - pctCosto;
    const barCosto    = c.costoUnitario > 0 ? `
      <div class="desglose-titulo" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--borde);">Composición del costo</div>
      <div class="desglose-barra">
        <div class="desglose-seg mat" style="width:${c.pctInsumos}%"></div>
        <div class="desglose-seg srv" style="width:${c.pctServicios}%"></div>
      </div>
      <div class="desglose-leyenda">
        <span class="desglose-dot mat"></span> Materiales: <strong>${c.pctInsumos}%</strong>
        &nbsp;&nbsp;
        <span class="desglose-dot srv"></span> Tiempo y servicios: <strong>${c.pctServicios}%</strong>
      </div>` : '';
    desglose.style.display = 'block';
    desglose.innerHTML = `
      <div class="desglose-titulo">Composición del precio de venta</div>
      <div class="desglose-barra">
        <div class="desglose-seg costo"    style="width:${pctCosto}%"></div>
        <div class="desglose-seg ganancia" style="width:${pctGanancia}%"></div>
      </div>
      <div class="desglose-leyenda">
        <span class="desglose-dot costo"></span> Costo: <strong>${pctCosto}%</strong>
        &nbsp;&nbsp;
        <span class="desglose-dot ganancia"></span> Ganancia: <strong>${pctGanancia}%</strong>
      </div>
      ${barCosto}`;
  } else {
    desglose.style.display = 'none';
  }
}

/* ══ IVA ══ */

function toggleIva() {
  estado.ivaActivo = document.getElementById('iva-toggle').checked;
  actualizar();
}

/* ══ MODO PRECIO / SLIDER ══ */

function setModo(modo) {
  estado.modo = modo;
  document.getElementById('btn-modo-slider').classList.toggle('active', modo === 'slider');
  document.getElementById('btn-modo-precio').classList.toggle('active', modo === 'precio');
  document.getElementById('modo-slider-panel').style.display = modo === 'slider' ? 'block' : 'none';
  document.getElementById('modo-precio-panel').style.display = modo === 'precio' ? 'block' : 'none';
  actualizar();
}

function actualizarMargen(val) {
  estado.margen = parseInt(val);
  actualizar();
}

function actualizarMargenManual(val) {
  const v = Math.max(10, Math.min(200, parseInt(val) || 10));
  estado.margen = v;
  document.getElementById('margen-slider').value = v;
  actualizar();
}

function actualizarPrecioManual() {
  actualizar();
}

/* ══ FORMATEO — siempre ARS ══ */

const fmt = AppFormat.currencyARS;

/* ══ PERSISTENCIA ══ */

/* Lee los valores actuales del DOM y los vuelca a estado.insumos / estado.servicios.
   Garantiza que cualquier valor escrito pero cuyo oninput no haya disparado quede guardado. */
function sincronizarEstadoDesdeDOM() {
  document.querySelectorAll('#lista-insumos .row-insumo-wrap').forEach((wrap, i) => {
    if (!estado.insumos[i]) return;
    const [nombreI, cantI, precioI] = wrap.querySelectorAll('input');
    if (nombreI)  estado.insumos[i].nombre   = nombreI.value;
    if (cantI)    estado.insumos[i].cantidad  = parseFloat(cantI.value)  || 0;
    if (precioI)  estado.insumos[i].precio    = parseFloat(precioI.value) || 0;
  });
  document.querySelectorAll('#lista-servicios .row-insumo-wrap').forEach((wrap, i) => {
    if (!estado.servicios[i]) return;
    const [nombreI, horasI, precioI] = wrap.querySelectorAll('input');
    if (nombreI)  estado.servicios[i].nombre  = nombreI.value;
    if (horasI)   estado.servicios[i].horas   = parseFloat(horasI.value)  || 0;
    if (precioI)  estado.servicios[i].precio  = parseFloat(precioI.value) || 0;
  });
}

function leerEstadoCompleto() {
  sincronizarEstadoDesdeDOM();
  resolverInsumosVinculados();
  return {
    _schema:         AUTOSAVE_SCHEMA,
    nombreProducto:  document.getElementById('nombre-producto').value,
    unidades:        parseFloat(document.getElementById('unidades').value) || 1,
    insumos:         estado.insumos,
    servicios:       estado.servicios,
    margen:          estado.margen,
    modo:            estado.modo,
    soloServicios:   estado.soloServicios,
    ivaActivo:       estado.ivaActivo,
    precioManual:    parseFloat(document.getElementById('precio-manual').value) || 0,
    gastosMensuales: parseFloat(document.getElementById('gastos-mensuales').value) || 0,
    diasLaborales:   parseFloat(document.getElementById('dias-laborales').value) || 24,
    metaIngresos:    parseFloat(document.getElementById('meta-ingresos').value) || 0,
  };
}

function aplicarEstado(datos) {
  document.getElementById('nombre-producto').value  = datos.nombreProducto || '';
  document.getElementById('unidades').value         = datos.unidades || 1;
  document.getElementById('gastos-mensuales').value = datos.gastosMensuales || '';
  document.getElementById('dias-laborales').value   = datos.diasLaborales || 24;
  document.getElementById('precio-manual').value    = datos.precioManual || '';
  document.getElementById('margen-slider').value    = datos.margen || 50;
  { const mi = document.getElementById('margen-input'); if (mi) mi.value = datos.margen || 50; }
  document.getElementById('meta-ingresos').value    = datos.metaIngresos || '';
  const ivaEl = document.getElementById('iva-toggle');
  if (ivaEl) ivaEl.checked = datos.ivaActivo || false;
  /* Siempre mostrar al menos FILAS_INICIALES filas; completa con vacías si hacen falta */
  const padRows = (arr, factory) => {
    const rows = arr ? [...arr] : [];
    while (rows.length < FILAS_INICIALES) rows.push(factory());
    return rows;
  };
  estado.soloServicios = datos.soloServicios || false;
  estado.insumos   = estado.soloServicios ? [] : padRows(datos.insumos, filaInsumoVacia);
  estado.servicios = padRows(datos.servicios, filaServicioVacia);
  estado.margen    = datos.margen  || 50;
  estado.modo      = datos.modo    || 'slider';
  estado.ivaActivo = datos.ivaActivo || false;
  /* Sincronizar el toggle visual con el estado cargado */
  sincronizarUIToggle();
}

let autosaveTimer;
function autosave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    if (AppStorage.saveCalculatorDraft(leerEstadoCompleto())) mostrarIndicadorAutosave();
  }, 500);
}

function mostrarIndicadorAutosave() {
  const el = document.getElementById('autosave-indicator');
  el.textContent = '✓ Guardado';
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 1500);
}

function cargarAutosave() {
  const datos = AppStorage.getCalculatorDraft();
  if (!datos) return;
  if ((datos._schema || 0) < AUTOSAVE_SCHEMA) {
    AppStorage.remove(AppStorage.KEYS.calculatorDraft);
    return;
  }
  aplicarEstado(datos);
}

/* ══ COMPARTIR POR URL ══ */

function compartirPorLink() {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(leerEstadoCompleto()))));
  document.getElementById('share-url-text').textContent =
    `${location.origin}${location.pathname}?d=${encoded}`;
  abrirModal('modal-compartir');
}

function copiarLink() {
  navigator.clipboard.writeText(document.getElementById('share-url-text').textContent)
    .then(() => mostrarToast('¡Link copiado!'));
}

function cargarDesdeURL() {
  const d = new URLSearchParams(location.search).get('d');
  if (!d) return false;
  try {
    aplicarEstado(JSON.parse(decodeURIComponent(escape(atob(d)))));
    history.replaceState(null, '', location.pathname);
    return true;
  } catch (_) { return false; }
}

/* ══ PROYECTOS ══ */















/* ══ VACIAR POR SECCIÓN ══ */

/* Doble confirmación inline: primer clic avisa, segundo clic dentro de 2.5s ejecuta. */




















/* ══ EXPORT / IMPORT ══ */





/* ══ PDF ══ */



/* ══ MODALES ══ */

function abrirModal(id)  { document.getElementById(id).classList.add('open'); }
function cerrarModal(id) { document.getElementById(id).classList.remove('open'); }

/* ══ TOAST ══ */

let toastTimer;
function mostrarToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

const escHtml = AppFormat.escapeHTML;
