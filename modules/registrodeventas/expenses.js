/* Coordinador de alta, repetición y consulta de gastos reales. */
function obtenerGastos() { return AppStorage.getExpenses(); }
function guardarGastos(expenses) { return AppStorage.saveExpenses(expenses); }

function initExpenses() {
  const date = document.getElementById('gasto-fecha');
  if (date && !date.value) date.value = new Date().toISOString().slice(0, 10);
  const currentExpenses = obtenerGastos();
  const currentMonth = AppExpenses.monthKey(new Date());
  const materialized = mesEstaCerrado(currentMonth) ? currentExpenses : AppExpenses.materializeMonthly(currentExpenses);
  if (materialized.length !== currentExpenses.length) guardarGastos(materialized);
  renderizarGastos();
}

function guardarGastoDesdeFormulario(event) {
  event.preventDefault();
  const expense = AppExpenses.createExpense({
    concept: document.getElementById('gasto-concepto').value,
    category: document.getElementById('gasto-categoria').value,
    amount: document.getElementById('gasto-monto').value,
    date: document.getElementById('gasto-fecha').value,
    paymentMethod: document.getElementById('gasto-medio').value,
    monthly: document.getElementById('gasto-recurrente').checked,
  });
  if (mesEstaCerrado(AppExpenses.monthKey(expense.fecha))) { mostrarToast('Reabri ese mes antes de registrar gastos'); return; }
  if (!expense.concepto || expense.monto <= 0) {
    mostrarToast('Completá el concepto y un monto mayor a cero');
    return;
  }
  const expenses = obtenerGastos();
  expenses.unshift(expense);
  guardarGastos(expenses);
  event.target.reset();
  document.getElementById('gasto-fecha').value = new Date().toISOString().slice(0, 10);
  renderizarGastos();
  renderizarPanelMensual();
  mostrarToast('Gasto registrado');
  if (typeof trackEvent === 'function') trackEvent('gastos_registrar', { categoria: expense.categoria });
}

function eliminarGasto(id) {
  const target = obtenerGastos().find((expense) => expense.id === id);
  if (target && mesEstaCerrado(AppExpenses.monthKey(target.fecha))) { mostrarToast('Reabri ese mes antes de modificar gastos'); return; }
  if (!confirm('\u00bfSeguro que quer\u00e9s eliminar este gasto?')) return;
  guardarGastos(obtenerGastos().filter((expense) => expense.id !== id));
  renderizarGastos();
  renderizarPanelMensual();
  mostrarToast('Gasto eliminado');
}

function populateExpenseMonths(expenses) {
  const select = document.getElementById('select-mes-gastos');
  if (!select) return '';
  const previous = select.value;
  const months = new Set(expenses.map((expense) => AppExpenses.monthKey(expense.fecha)).filter(Boolean));
  months.add(AppExpenses.monthKey(new Date()));
  const values = [...months].sort((a, b) => b.localeCompare(a));
  select.innerHTML = values.map((month) => `<option value="${month}">${labelMonth(month)}</option>`).join('');
  select.value = values.includes(previous) ? previous : values[0];
  return select.value;
}

function renderizarGastos() {
  const expenses = obtenerGastos();
  const month = document.getElementById('select-mes-gastos')?.value || populateExpenseMonths(expenses);
  const summary = AppExpenses.summarize(expenses, month);
  const total = document.getElementById('gastos-total');
  const list = document.getElementById('lista-gastos');
  if (!total || !list) return;
  total.innerHTML = `<span>Total del mes</span><strong>${fmt(summary.total)}</strong><small>${summary.count} ${summary.count === 1 ? 'gasto' : 'gastos'}</small>`;
  if (!summary.expenses.length) {
    list.innerHTML = '<div class="empty-state"><p>No hay gastos registrados en este mes.</p></div>';
    return;
  }
  list.innerHTML = summary.expenses.map((expense) => `
    <article class="expense-item">
      <div><strong>${esc(expense.concepto)}</strong><span>${esc(expense.categoria)} &middot; ${new Date(expense.fecha).toLocaleDateString('es-AR')} &middot; ${esc(expense.medioPago)}</span></div>
      <div class="expense-amount"><b>${fmt(expense.monto)}</b>${expense.recurrenteMensual ? '<small>Mensual</small>' : ''}</div>
      <button type="button" data-action="delete-expense" data-id="${expense.id}" aria-label="Eliminar gasto">&times;</button>
    </article>`).join('');
}
