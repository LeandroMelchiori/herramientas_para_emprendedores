/* Historial, filtros, pagos y restauracion del registro de ventas. */

let ultimaVentaEliminada = null;

function obtenerVentas() { return AppStorage.getSales(); }

function guardarVentas(ventas) { return AppStorage.saveSales(ventas); }

function setFiltro(periodo, btn) {
  filtroActivo = periodo;
  document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderizarHistorial();
}

function filtrarPorPeriodo(ventas) {
  const ahora = new Date();
  const hoy   = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  if (filtroActivo === 'hoy') return ventas.filter(v => new Date(v.fecha) >= hoy);
  if (filtroActivo === 'semana') {
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));  // lunes de la semana actual
    return ventas.filter(v => new Date(v.fecha) >= lunes);
  }
  if (filtroActivo === 'mes') {
    const ini = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    return ventas.filter(v => new Date(v.fecha) >= ini);
  }
  return ventas;
}

function renderizarHistorial() {
  const todas  = obtenerVentas();
  let ventas = filtrarPorPeriodo(todas);

  const estadoPago = document.getElementById('filtro-estado-pago');
  if (estadoPago && estadoPago.value === 'pendientes') {
    ventas = ventas.filter(v => v.fiado);
  }

  const totalIng = ventas.reduce((a, v) => a + v.totalCobrado, 0);
  const totalCos = ventas.reduce((a, v) => a + v.totalCosto,   0);
  const totalGan = ventas.reduce((a, v) => a + v.totalGanancia, 0);

  const fiadoTotal = ventas.filter(v => v.fiado).reduce((a, v) => a + v.totalCobrado, 0);
  const pagoStats = ventas.reduce((acc, v) => {
    if (!v.fiado) {
      const medio = v.medioPago || 'Efectivo';
      acc[medio] = (acc[medio] || 0) + v.totalCobrado;
    }
    return acc;
  }, {});

  const pagosArr = Object.entries(pagoStats).filter(([k, val]) => val > 0).sort((a, b) => b[1] - a[1]);
  const breakdownHtml = (fiadoTotal > 0 || pagosArr.length > 0) ? `
    <div style="font-size:0.75rem;color:var(--gris-texto);margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">
      ${fiadoTotal > 0 ? `<div style="background:#FEF2F2;color:var(--error);padding:4px 10px;border-radius:12px;font-weight:600;border:1px solid #FECACA;">A cobrar: ${fmt(fiadoTotal)}</div>` : ''}
      ${pagosArr.map(([k, val]) => `<div style="background:var(--gris);padding:4px 10px;border-radius:12px;border:1px solid var(--borde);">${k}: <b>${fmt(val)}</b></div>`).join('')}
    </div>` : '';

  document.getElementById('resumen-periodo').innerHTML = `
    <div class="resumen-grid">
      <div class="resumen-item naranja">
        <div class="rval">${fmt(totalIng)}</div>
        <div class="rlabel">Ingresos</div>
      </div>
      <div class="resumen-item azul">
        <div class="rval">${fmt(totalCos)}</div>
        <div class="rlabel">Costos</div>
      </div>
      <div class="resumen-item verde">
        <div class="rval">${fmt(totalGan)}</div>
        <div class="rlabel">Ganancia</div>
      </div>
    </div>
    ${breakdownHtml}`;

  const lista = document.getElementById('lista-historial');
  actualizarSelectMes();

  if (!ventas.length) {
    lista.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📊</div>
      <p>${todas.length
        ? 'No hay ventas en este período.<br>Probá ampliar el filtro de fechas.'
        : 'Todavía no registraste ninguna venta.<br>Armá tu primer carrito en la pestaña <b>Nueva venta</b>.'
      }</p>
    </div>`;
    return;
  }

  lista.innerHTML = ventas.map(v => {
    const pctGan   = v.totalCosto > 0 ? Math.round(v.totalGanancia / v.totalCosto * 100) : 0;
    const nItems   = v.items.reduce((a, i) => a + i.cantidad, 0);
    const itemHint = v.items.length === 1
      ? `${esc(v.items[0].productoNombre)}`
      : `${v.items.length} productos · ${nItems} unidades`;

    let etiquetaHtml = '';
    if (v.etiqueta) {
      etiquetaHtml = `<div style="font-size:0.75rem;font-weight:700;color:var(--texto);margin-bottom:2px;">${esc(v.etiqueta)}</div>`;
    }

    let pagoBadge = '';
    if (v.fiado) {
      if (v.montoPagado > 0) {
        pagoBadge = `<span style="background:#FFFBEB;color:#D97706;padding:2px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;margin-left:6px;vertical-align:middle;">SEÑA: ${fmt(v.montoPagado)}</span>`;
      } else {
        pagoBadge = `<span style="background:#FEF2F2;color:var(--error);padding:2px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;margin-left:6px;vertical-align:middle;">FALTA PAGAR</span>`;
      }
    } else if (v.medioPago) {
      pagoBadge = `<span style="background:var(--gris);color:var(--gris-texto);padding:2px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;margin-left:6px;vertical-align:middle;">${v.medioPago.toUpperCase()}</span>`;
    }

    return `
    <div class="venta-item" id="venta-${v.id}">
      <div class="venta-header" data-action="toggle-sale" data-id="${v.id}">
        <div>
          ${etiquetaHtml}
          <div class="venta-fecha">${fmtFecha(v.fecha)}${pagoBadge}</div>
          <div class="venta-items-hint">${itemHint}</div>
        </div>
        <div>
          <div class="venta-total">${fmt(v.totalCobrado)}</div>
          <div class="venta-ganancia-hint">+${fmt(v.totalGanancia)} (${pctGan}%)</div>
          <span class="venta-chevron">▼</span>
        </div>
      </div>
      <div class="venta-detalle">
        ${v.items.map(i => `
          <div class="det-item">
            <div>
              <div class="det-item-nombre">${esc(i.productoNombre)}</div>
              <div class="det-item-meta">${i.cantidad} × ${fmt(i.precioUnit)}</div>
            </div>
            <div style="text-align:right">
              <div>${fmt(i.subtotal)}</div>
              <div class="det-item-meta" style="color:var(--verde)">+${fmt(i.gananciaTotal)}</div>
            </div>
          </div>`).join('')}
        <div class="det-totales">
          ${v.descuento > 0.5 ? `
          <div class="det-row">
            <span>Precio sugerido</span>
            <span class="det-val">${fmt(v.totalSugerido)}</span>
          </div>
          <div class="det-row">
            <span>Descuento aplicado</span>
            <span class="det-val naranja">− ${fmt(v.descuento)}</span>
          </div>` : ''}
          <div class="det-row">
            <span>Total cobrado</span>
            <span class="det-val">${fmt(v.totalCobrado)}</span>
          </div>
          <div class="det-row">
            <span>Costo total</span>
            <span class="det-val rojo">− ${fmt(v.totalCosto)}</span>
          </div>
          <div class="det-row" style="margin-top:4px;font-weight:600">
            <span>Ganancia neta</span>
            <span class="det-val verde">${fmt(v.totalGanancia)}</span>
          </div>
        </div>
        ${v.fiado ? `
        <div style="margin:12px 0;background:var(--gris);border-radius:10px;padding:12px;border:1.5px solid var(--borde);">
          <div style="font-weight:700;font-size:0.85rem;color:var(--texto);margin-bottom:8px;">✓ Cobrar pendiente</div>
          <div style="display:flex;gap:8px;margin-bottom:8px;">
            <div style="flex:1;">
              <div style="font-size:0.7rem;color:var(--gris-texto);margin-bottom:2px;font-weight:600;">Monto a cobrar</div>
              <input type="number" id="cobro-monto-${v.id}" value="${v.totalCobrado - (v.montoPagado || 0)}" style="width:100%;padding:8px;border:1.5px solid var(--borde);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:0.85rem;background:white;" placeholder="Monto">
            </div>
            <div style="flex:1;">
              <div style="font-size:0.7rem;color:var(--gris-texto);margin-bottom:2px;font-weight:600;">Medio</div>
              <select id="cobro-medio-${v.id}" style="width:100%;padding:8px;border:1.5px solid var(--borde);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:0.85rem;background:white;">
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
          <button data-action="pay-sale" data-id="${v.id}" style="width:100%;padding:10px;background:var(--naranja);color:white;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:0.85rem;cursor:pointer;">
            Confirmar pago
          </button>
        </div>` : ''}
        <button class="btn-eliminar-venta" data-action="delete-sale" data-id="${v.id}">
          ✕ Eliminar este registro
        </button>
      </div>
    </div>`;
  }).join('');
}

function actualizarSelectMes() {
  const sel = document.getElementById('select-mes-pdf');
  if (!sel) return;
  const ventas = obtenerVentas();
  const meses = new Set();
  ventas.forEach(v => {
    const d = new Date(v.fecha);
    meses.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  });
  const ahora = new Date();
  meses.add(`${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`);
  const sorted = Array.from(meses).sort((a, b) => b.localeCompare(a));
  const prev = sel.value;
  sel.innerHTML = '<option value="todo">Todo el historial</option>' +
    sorted.map(m => {
      const [yr, mo] = m.split('-');
      const label = new Date(parseInt(yr), parseInt(mo) - 1, 1)
        .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
      return `<option value="${m}">${label.charAt(0).toUpperCase() + label.slice(1)}</option>`;
    }).join('');
  if (prev && sel.querySelector(`option[value="${prev}"]`)) sel.value = prev;
}

function toggleVenta(id) {
  document.getElementById(`venta-${id}`).classList.toggle('expandida');
}

function eliminarVenta(id) {
  if (!confirm('??Seguro que quer??s eliminar esta venta?')) return;
  const ventas = obtenerVentas();
  const index = ventas.findIndex(v => v.id === id);
  if (index < 0) return;
  ultimaVentaEliminada = { venta: ventas[index], index };
  ventas.splice(index, 1);
  guardarVentas(ventas);
  renderizarHistorial();
  mostrarDeshacerEliminacion();
}

/* Permite corregir una eliminacion accidental sin alterar el formato persistido. */
function mostrarDeshacerEliminacion() {
  const bar = document.getElementById('undo-delete');
  if (!bar) return;
  bar.hidden = false;
  clearTimeout(mostrarDeshacerEliminacion.timer);
  mostrarDeshacerEliminacion.timer = setTimeout(() => { bar.hidden = true; ultimaVentaEliminada = null; }, 8000);
}

function restaurarUltimaVenta() {
  if (!ultimaVentaEliminada) return;
  const ventas = obtenerVentas();
  ventas.splice(Math.min(ultimaVentaEliminada.index, ventas.length), 0, ultimaVentaEliminada.venta);
  guardarVentas(ventas);
  ultimaVentaEliminada = null;
  document.getElementById('undo-delete').hidden = true;
  renderizarHistorial();
  mostrarToast('Venta restaurada');
}

function marcarVentaPagada(id) {
  const montoInput = document.getElementById(`cobro-monto-${id}`);
  const medioSel = document.getElementById(`cobro-medio-${id}`);
  if (!montoInput || !medioSel) return;

  const cobroExtra = parseFloat(montoInput.value) || 0;
  const medio = medioSel.value;

  const ventas = obtenerVentas();
  const idx = ventas.findIndex(v => v.id === id);
  if (idx > -1) {
    ventas[idx] = AppSales.applyPayment(ventas[idx], cobroExtra, medio);

    guardarVentas(ventas);
    renderizarHistorial();
    mostrarToast('Pago registrado correctamente');
    if (typeof trackEvent === 'function') trackEvent('ventas_marcar_pagada');
  }
}

function restaurarBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const restaurado = AppStorage.restoreBackup(JSON.parse(e.target.result));
      if (!restaurado.length) throw new Error('El backup no contiene datos restaurables.');
      cargarProductos();
      renderizarHistorial();
      mostrarToast(`Restauracion exitosa: ${restaurado.join(' + ')} ?`);
      if (typeof trackEvent === 'function') trackEvent('ventas_restaurar_backup');
    } catch (error) {
      console.warn('[Ventas] Backup invalido.', error);
      mostrarToast('El archivo no es valido');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
