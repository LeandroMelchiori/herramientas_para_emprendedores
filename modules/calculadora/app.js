/* ============================================================
   calculadora/index.html — Lógica principal
   ============================================================ */

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
  estado.insumos.push({ nombre: '', cantidad: 1, precio: 0 });
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
  estado.insumos.forEach((ins, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'row-insumo-wrap';
    wrap.innerHTML = `
      <div class="row-insumo">
        <input type="text" placeholder="Material" value="${escHtml(ins.nombre)}"
          oninput="estado.insumos[${i}].nombre=this.value;autosave()">
        <input type="number" min="0" step="any" value="${ins.cantidad}"
          oninput="estado.insumos[${i}].cantidad=parseFloat(this.value)||0;actualizar()">
        <input type="number" min="0" step="any" value="${ins.precio}"
          oninput="estado.insumos[${i}].precio=parseFloat(this.value)||0;actualizar()">
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
  return AppCosting.calculate({
    supplies: estado.insumos,
    services: estado.servicios,
    units: document.getElementById('unidades').value,
    margin: estado.margen,
    mode: estado.modo,
    manualPrice: document.getElementById('precio-manual').value,
    monthlyExpenses: document.getElementById('gastos-mensuales').value,
    workDays: document.getElementById('dias-laborales').value,
    incomeGoal: document.getElementById('meta-ingresos').value,
  });
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
function abrirModal(id)  { document.getElementById(id).classList.add('open'); }
function cerrarModal(id) { document.getElementById(id).classList.remove('open'); }

/* ══ TOAST ══ */

function mostrarToast(message) { AppUI.showToast('toast', message, 2500); }

const escHtml = AppFormat.escapeHTML;
