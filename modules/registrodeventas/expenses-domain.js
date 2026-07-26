/* Reglas puras para gastos reales y repeticiones mensuales. */
(function initExpensesDomain(global) {
  'use strict';

  const money = (value) => Math.round((Number(value) || 0) * 100) / 100;
  const monthKey = (date) => {
    const value = new Date(date);
    return Number.isNaN(value.getTime()) ? '' : `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
  };

  function createExpense({ concept, category, amount, date, paymentMethod, monthly = false }, now = new Date()) {
    return {
      id: now.getTime(),
      fecha: date ? new Date(`${date}T12:00:00`).toISOString() : now.toISOString(),
      concepto: String(concept || '').trim(),
      categoria: category || 'Otros',
      monto: Math.max(0, money(amount)),
      medioPago: paymentMethod || 'Efectivo',
      recurrenteMensual: Boolean(monthly),
      recurrenteOrigenId: null,
    };
  }

  function materializeMonthly(expenses, targetDate = new Date()) {
    const targetMonth = monthKey(targetDate);
    const result = expenses.map((expense) => ({ ...expense }));
    expenses.filter((expense) => expense.recurrenteMensual && !expense.recurrenteOrigenId).forEach((source) => {
      if (monthKey(source.fecha) === targetMonth) return;
      const exists = expenses.some((expense) =>
        expense.recurrenteOrigenId === source.id && monthKey(expense.fecha) === targetMonth
      );
      if (exists) return;
      const [year, month] = targetMonth.split('-').map(Number);
      const originalDay = new Date(source.fecha).getDate();
      const lastDay = new Date(year, month, 0).getDate();
      const generatedDate = new Date(year, month - 1, Math.min(originalDay, lastDay), 12);
      result.unshift({
        ...source,
        id: generatedDate.getTime() + Number(source.id || 0) % 1000,
        fecha: generatedDate.toISOString(),
        recurrenteMensual: false,
        recurrenteOrigenId: source.id,
      });
    });
    return result;
  }

  function summarize(expenses, month) {
    const monthly = expenses.filter((expense) => monthKey(expense.fecha) === month);
    const total = money(monthly.reduce((sum, expense) => sum + expense.monto, 0));
    const byCategory = monthly.reduce((result, expense) => {
      result[expense.categoria] = money((result[expense.categoria] || 0) + expense.monto);
      return result;
    }, {});
    return { total, count: monthly.length, byCategory, expenses: monthly };
  }

  global.AppExpenses = Object.freeze({ createExpense, materializeMonthly, summarize, monthKey });
})(window);
