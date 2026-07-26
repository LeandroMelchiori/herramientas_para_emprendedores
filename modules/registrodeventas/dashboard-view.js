/* Presentación del panel mensual; los cálculos permanecen en dashboard.js. */
function labelMonth(key) {
  const [year, month] = key.split('-').map(Number);
  const label = new Date(year, month - 1, 1)
    .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function availableMonths(sales, expenses = []) {
  const months = new Set(sales.map((sale) => AppSalesDashboard.monthKey(sale.fecha)).filter(Boolean));
  expenses.forEach((expense) => months.add(AppExpenses.monthKey(expense.fecha)));
  if (typeof obtenerCierres === 'function') obtenerCierres().forEach((closure) => months.add(closure.mes));
  months.add(AppSalesDashboard.monthKey(new Date()));
  return [...months].sort((a, b) => b.localeCompare(a));
}

function populateMonthlySelector(sales, expenses = obtenerGastos()) {
  const select = document.getElementById('select-mes-panel');
  if (!select) return '';
  const previous = select.value;
  const months = availableMonths(sales, expenses);
  select.innerHTML = months.map((month) => `<option value="${month}">${labelMonth(month)}</option>`).join('');
  select.value = months.includes(previous) ? previous : months[0];
  return select.value;
}

function variationText(value) {
  if (value === null) return 'Sin mes anterior comparable';
  if (value === 0) return 'Sin cambios frente al mes anterior';
  return `${value > 0 ? '+' : ''}${value}% frente al mes anterior`;
}

function renderizarPanelMensual() {
  const sales = obtenerVentas();
  const select = document.getElementById('select-mes-panel');
  const month = select?.value || populateMonthlySelector(sales);
  const target = document.getElementById('panel-mensual');
  if (!target || !month) return;
  const expenses = obtenerGastos();
  const comparison = AppSalesDashboard.compareMonths(sales, month, expenses);
  const closure = cierreDelMes(month);
  // Un mes cerrado muestra siempre el snapshot que se confirmo al cerrarlo.
  const data = closure?.metrics || comparison.current;

  target.innerHTML = `
    <div class="monthly-grid">
      <div class="monthly-stat"><span>Facturado</span><strong>${fmt(data.facturado)}</strong><small>${variationText(comparison.facturadoVariation)}</small></div>
      <div class="monthly-stat paid"><span>Cobrado en el mes</span><strong>${fmt(data.cobrado)}</strong><small>Según la fecha de cada pago</small></div>
      <div class="monthly-stat cost"><span>Costos</span><strong>${fmt(data.costos)}</strong><small>${data.ventas} ${data.ventas === 1 ? 'venta' : 'ventas'}</small></div>
      <div class="monthly-stat profit"><span>Ganancia estimada</span><strong>${fmt(data.ganancia)}</strong><small>${variationText(comparison.gananciaVariation)}</small></div>
    </div>
    <div class="monthly-details">
      <div><span>Ticket promedio</span><b>${fmt(data.ticketPromedio)}</b></div>
      <div><span>Margen sobre costos</span><b>${data.margen}%</b></div>
      <div><span>Descuentos otorgados</span><b>${fmt(data.descuentos)}</b></div>
      <div><span>Pendiente total actual</span><b>${fmt(data.pendientes)}</b></div>
      <div><span>Gastos reales</span><b>${fmt(data.gastos)}</b></div>
      <div><span>Resultado de caja</span><b>${fmt(data.resultadoCaja)}</b></div>
    </div>
    <div class="monthly-products">
      <div><span>Más vendido</span><b>${data.masVendido ? `${esc(data.masVendido.nombre)} · ${data.masVendido.unidades} u.` : 'Sin datos'}</b></div>
      <div><span>Más rentable</span><b>${data.masRentable ? `${esc(data.masRentable.nombre)} · ${fmt(data.masRentable.ganancia)}` : 'Sin datos'}</b></div>
    </div>
    ${renderClosureControls(month)}`;
}
