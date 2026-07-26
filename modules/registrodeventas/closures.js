/* Cierre mensual, reapertura explícita y exportación para planillas. */
function obtenerCierres() { return AppStorage.getMonthlyClosures(); }
function guardarCierres(closures) { return AppStorage.saveMonthlyClosures(closures); }

function cierreDelMes(month) {
  return obtenerCierres().find((closure) => closure.mes === month) || null;
}

function mesEstaCerrado(month) { return Boolean(cierreDelMes(month)); }

function cerrarMes(month) {
  if (cierreDelMes(month)) { mostrarToast('Este mes ya tiene un cierre guardado'); return; }
  if (!confirm(`\u00bfCerrar ${labelMonth(month)} con las cifras actuales?`)) return;
  const closure = AppClosures.createClosure(month, obtenerVentas(), obtenerGastos());
  const closures = obtenerCierres();
  closures.unshift(closure);
  guardarCierres(closures);
  renderizarPanelMensual();
  mostrarToast('Cierre mensual guardado');
  if (typeof trackEvent === 'function') trackEvent('ventas_cierre_mensual');
}

function reabrirMes(month) {
  if (!confirm(`\u00bfReabrir ${labelMonth(month)}? El snapshot del cierre se eliminar\u00e1.`)) return;
  guardarCierres(obtenerCierres().filter((closure) => closure.mes !== month));
  renderizarPanelMensual();
  mostrarToast('Mes reabierto');
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function exportarCierreCSV(month) {
  const rows = [['Tipo', 'Fecha', 'Concepto', 'Categoria', 'Monto', 'Medio']];
  obtenerVentas().filter((sale) => !sale.anulada && AppSalesDashboard.monthKey(sale.fecha) === month).forEach((sale) => {
    rows.push(['Venta', sale.fecha, sale.etiqueta || sale.items.map(item => item.productoNombre).join(' + '), '', sale.totalCobrado, sale.medioPago]);
  });
  obtenerVentas().filter((sale) => !sale.anulada).flatMap((sale) => sale.pagos || []).filter((payment) => AppSalesDashboard.monthKey(payment.fecha) === month).forEach((payment) => {
    rows.push(['Cobro', payment.fecha, 'Pago de venta', '', payment.monto, payment.medio]);
  });
  obtenerGastos().filter((expense) => AppExpenses.monthKey(expense.fecha) === month).forEach((expense) => {
    rows.push(['Gasto', expense.fecha, expense.concepto, expense.categoria, expense.monto, expense.medioPago]);
  });
  const csv = '\uFEFF' + rows.map((row) => row.map(csvCell).join(';')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cierre-${month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  mostrarToast('CSV descargado');
}

function exportarCierrePDF(month) {
  const select = document.getElementById('select-mes-pdf');
  if (select) select.value = month;
  generarPDFVentas();
}

function renderClosureControls(month) {
  const closure = cierreDelMes(month);
  if (!closure) {
    return `<div class="closure-actions"><button type="button" data-action="close-month" data-month="${month}">Cerrar mes</button><button type="button" data-action="export-month-csv" data-month="${month}">CSV</button><button type="button" data-action="export-month-pdf" data-month="${month}">PDF</button></div>`;
  }
  return `<div class="closure-status"><div><strong>Mes cerrado</strong><span>${fmtFecha(closure.fechaCierre)} &middot; snapshot guardado</span></div><div class="closure-actions"><button type="button" data-action="export-month-csv" data-month="${month}">CSV</button><button type="button" data-action="export-month-pdf" data-month="${month}">PDF</button><button type="button" class="secondary" data-action="reopen-month" data-month="${month}">Reabrir</button></div></div>`;
}
