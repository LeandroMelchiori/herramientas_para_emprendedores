/* ══ CONSTANTES ══ */

/* ══ ESTADO ══ */
let carrito      = [];    // vista compatible del estado central del carrito
let productoSel  = null;  // proyecto seleccionado en el selector
let filtroActivo = 'hoy';
let precioEditado = false; // si el usuario tocó el campo de precio final

/* ══ INIT ══ */
document.addEventListener('DOMContentLoaded', () => {
  AppStorage.migrateStoredData();
  SalesCart.subscribe((items) => {
    carrito = items;
    if (!items.length) precioEditado = false;
    renderizarCarrito();
  });
  cargarProductos();
  renderizarHistorial();
  vincularEventosVentas();
});

/* ══ FORMATO ══ */
const fmt = AppFormat.currencyARS;
const fmtFecha = AppFormat.dateTimeAR;
const esc = AppFormat.escapeHTML;

/* ══ CÁLCULO DESDE PROYECTO GUARDADO ══ */
function calcDesdeProyecto(project) {
  const result = AppCosting.fromProject(project);
  return {
    costoUnit: result.costoUnitario,
    precio: result.precioVenta,
    gananciaUnit: result.gananciaNeta,
  };
}

/* Carga los proyectos disponibles como productos vendibles. */
function cargarProductos() {
  const sel = document.getElementById('select-producto');
  const proyectos = AppStorage.getProjects();
  sel.innerHTML = '<option value="">— Elegí un producto —</option>';
  if (!proyectos.length) {
    sel.innerHTML = '<option value="" disabled>No hay productos en la calculadora</option>';
    return;
  }
  proyectos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.nombre || p.nombreProducto || `Producto #${p.id}`;
    sel.appendChild(opt);
  });
}

/* ══ SELECCIÓN DE PRODUCTO ══ */
function seleccionarProducto() {
  const id = parseInt(document.getElementById('select-producto').value);
  const proyectos = AppStorage.getProjects();
  productoSel = proyectos.find(p => p.id === id) || null;

  const preview  = document.getElementById('producto-preview');
  const btnAgreg = document.getElementById('btn-agregar');

  if (!productoSel) {
    preview.classList.remove('visible');
    btnAgreg.disabled = true;
    return;
  }

  const { costoUnit, precio } = calcDesdeProyecto(productoSel);
  document.getElementById('preview-precio').textContent = `Precio de venta: ${fmt(precio)}`;
  document.getElementById('preview-costo').textContent  = `Costo: ${fmt(costoUnit)}`;
  preview.classList.add('visible');
  btnAgreg.disabled = false;
}

/* ══ AGREGAR AL CARRITO ══ */
function agregarAlCarrito() {
  if (!productoSel) return;

  const cantidad = Math.max(parseInt(document.getElementById('input-cantidad').value) || 1, 1);
  const { costoUnit, precio, gananciaUnit } = calcDesdeProyecto(productoSel);
  const nombre = productoSel.nombre || productoSel.nombreProducto || `Producto #${productoSel.id}`;

  /* Si el producto ya está en el carrito, acumula la cantidad */
  const existente = carrito.find(i => i.productoId === productoSel.id);
  if (existente) {
    existente.cantidad     += cantidad;
    existente.subtotal      = existente.precioUnit * existente.cantidad;
    existente.costoTotal    = existente.costoUnit  * existente.cantidad;
    existente.gananciaTotal = existente.gananciaUnit * existente.cantidad;
  } else {
    carrito.push({
      productoId:    productoSel.id,
      productoNombre: nombre,
      cantidad,
      precioUnit:    precio,
      costoUnit,
      gananciaUnit,
      subtotal:      precio * cantidad,
      costoTotal:    costoUnit * cantidad,
      gananciaTotal: gananciaUnit * cantidad,
    });
  }

  /* Resetear selector */
  document.getElementById('select-producto').value = '';
  document.getElementById('input-cantidad').value  = 1;
  document.getElementById('producto-preview').classList.remove('visible');
  document.getElementById('btn-agregar').disabled  = true;
  productoSel = null;

  renderizarCarrito();
  mostrarToast('Producto agregado al carrito');
  if (typeof trackEvent === 'function') trackEvent('ventas_agregar_item');
}

function quitarDelCarrito(idx) {
  SalesCart.remove(idx);
}

/* ══ RENDER DEL CARRITO ══ */
function renderizarCarrito() {
  const lista      = document.getElementById('lista-carrito');
  const cardTotales = document.getElementById('card-totales');

  if (!carrito.length) {
    lista.innerHTML = '<div class="carrito-vacio">Todavía no agregaste productos</div>';
    cardTotales.style.display = 'none';
    return;
  }

  lista.innerHTML = carrito.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-nombre">${esc(item.productoNombre)}</div>
        <div class="cart-item-meta">${item.cantidad} × ${fmt(item.precioUnit)}</div>
      </div>
      <div class="cart-item-subtotal">${fmt(item.subtotal)}</div>
      <button class="btn-quitar" data-action="remove-cart-item" data-index="${i}" title="Quitar">✕</button>
    </div>`).join('');

  cardTotales.style.display = 'block';
  recalcularTotales();
}

/* ══ TOTALES Y DESGLOSE ══ */
function recalcularTotales() {
  const totalSugerido = carrito.reduce((a, i) => a + i.subtotal,   0);
  const totalCosto    = carrito.reduce((a, i) => a + i.costoTotal, 0);

  const inputPF = document.getElementById('input-precio-final');
  if (!precioEditado) {
    inputPF.value = Math.round(totalSugerido);
  }
  const cobrado = parseFloat(inputPF.value) || 0;

  renderizarDesglose(totalSugerido, totalCosto, cobrado);
}

function onPrecioFinalInput() {
  precioEditado = true;
  const totalSugerido = carrito.reduce((a, i) => a + i.subtotal,   0);
  const totalCosto    = carrito.reduce((a, i) => a + i.costoTotal, 0);
  const cobrado = parseFloat(document.getElementById('input-precio-final').value) || 0;
  renderizarDesglose(totalSugerido, totalCosto, cobrado);
}

function renderizarDesglose(sugerido, costo, cobrado) {
  const ganancia  = cobrado - costo;
  const descuento = sugerido - cobrado;
  const pctGan    = costo > 0 ? (ganancia / costo * 100) : 0;

  /* Totales box */
  document.getElementById('totales-box').innerHTML = `
    <div class="totales-row">
      <span class="label">Precio sugerido</span>
      <span class="valor">${fmt(sugerido)}</span>
    </div>
    <div class="totales-row">
      <span class="label">Costo total</span>
      <span class="valor">${fmt(costo)}</span>
    </div>`;

  /* Badge descuento */
  const badge = document.getElementById('badge-descuento');
  if (descuento > 0.5) {
    badge.textContent = `Descuento: ${fmt(descuento)}`;
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }

  /* Desglose costo / ganancia */
  document.getElementById('desglose-venta').innerHTML = `
    <div class="desglose-item azul">
      <div class="dval">${fmt(cobrado)}</div>
      <div class="dlabel">Cobrado</div>
    </div>
    <div class="desglose-item rojo">
      <div class="dval">${fmt(costo)}</div>
      <div class="dlabel">Costo</div>
    </div>
    <div class="desglose-item ${ganancia >= 0 ? 'verde' : 'rojo'}">
      <div class="dval">${fmt(ganancia)}</div>
      <div class="dlabel">Ganancia ${pctGan >= 0 ? '+' : ''}${Math.round(pctGan)}%</div>
    </div>`;

  document.getElementById('btn-finalizar').disabled = carrito.length === 0 || cobrado <= 0;
}

/* ══ FINALIZAR VENTA ══ */
function toggleSena() {
  const isFiado = document.getElementById('check-fiado').checked;
  const divSena = document.getElementById('div-sena');
  if (divSena) divSena.style.display = isFiado ? 'block' : 'none';
  if (!isFiado && document.getElementById('input-sena')) document.getElementById('input-sena').value = '';
}

function finalizarVenta() {
  if (!carrito.length) return;

  const totalSugerido = carrito.reduce((a, i) => a + i.subtotal,   0);
  const totalCosto    = carrito.reduce((a, i) => a + i.costoTotal, 0);
  const cobrado       = parseFloat(document.getElementById('input-precio-final').value) || 0;
  if (cobrado <= 0) return;

  const etiqueta  = document.getElementById('input-etiqueta').value.trim();
  const medioPago = document.getElementById('select-pago').value;
  const fiado     = document.getElementById('check-fiado').checked;

  const senaInput = document.getElementById('input-sena');
  const senaVal   = senaInput ? (parseFloat(senaInput.value) || 0) : 0;
  const montoPagado = fiado ? senaVal : cobrado;

  const venta = {
    id:            Date.now(),
    fecha:         new Date().toISOString(),
    items:         JSON.parse(JSON.stringify(carrito)),   // snapshot completo
    totalSugerido,
    totalCobrado:  cobrado,
    montoPagado:   montoPagado,
    totalCosto,
    totalGanancia: cobrado - totalCosto,
    descuento:     totalSugerido - cobrado,
    etiqueta,
    medioPago,
    fiado,
  };

  const historial = obtenerVentas();
  historial.unshift(venta);
  guardarVentas(historial);

  /* Resetear carrito */
  SalesCart.clear();
  precioEditado = false;
  document.getElementById('input-precio-final').value = '';
  document.getElementById('input-etiqueta').value = '';
  document.getElementById('select-pago').value = 'Efectivo';
  document.getElementById('check-fiado').checked = false;
  if (document.getElementById('input-sena')) document.getElementById('input-sena').value = '';
  if (document.getElementById('div-sena')) document.getElementById('div-sena').style.display = 'none';
  renderizarCarrito();

  mostrarToast('Venta registrada ✓');
  if (typeof trackEvent === 'function') trackEvent('ventas_registrar');
  setTimeout(() => goTo(1), 600);
}

/* ══ HISTORIAL ══ */










/* Puebla el selector de mes para el PDF con los meses que tienen ventas */








/* ══ NAVEGACIÓN ══ */
function goTo(idx) {
  document.querySelectorAll('.page').forEach((p, i) => p.classList.toggle('active', i === idx));
  document.querySelectorAll('.nav-tab').forEach((t, i) => t.classList.toggle('active', i === idx));
  if (idx === 0) cargarProductos();     // recargar por si el usuario cargó proyectos nuevos
  if (idx === 1) renderizarHistorial();
}

/* ══ EXPORTAR PDF ══ */


/* ══ RESTAURAR BACKUP ══ */


/* ══ TOAST ══ */
let _toastTimer;
function mostrarToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('visible'), 2500);
}


/* Centraliza interacciones para evitar logica embebida en el HTML. */
function vincularEventosVentas() {
  document.getElementById('select-producto')?.addEventListener('change', seleccionarProducto);
  document.getElementById('btn-agregar')?.addEventListener('click', agregarAlCarrito);
  document.getElementById('check-fiado')?.addEventListener('change', toggleSena);
  document.getElementById('input-precio-final')?.addEventListener('input', onPrecioFinalInput);
  document.getElementById('btn-finalizar')?.addEventListener('click', finalizarVenta);
  document.getElementById('btn-backup')?.addEventListener('click', exportarBackupCompleto);
  document.getElementById('input-restaurar')?.addEventListener('change', restaurarBackup);
  document.getElementById('btn-pdf')?.addEventListener('click', generarPDFVentas);
  document.getElementById('filtro-estado-pago')?.addEventListener('change', renderizarHistorial);
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]');
    if (!action) return;
    if (action.dataset.action === 'navigate') goTo(Number(action.dataset.page));
    if (action.dataset.action === 'filter-period') setFiltro(action.dataset.period, action);
    if (action.dataset.action === 'remove-cart-item') quitarDelCarrito(Number(action.dataset.index));
    if (action.dataset.action === 'toggle-sale') toggleVenta(Number(action.dataset.id));
    if (action.dataset.action === 'pay-sale') marcarVentaPagada(Number(action.dataset.id));
    if (action.dataset.action === 'delete-sale') eliminarVenta(Number(action.dataset.id));
    if (action.dataset.action === 'undo-delete') restaurarUltimaVenta();
  });
}
