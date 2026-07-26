/* Métricas mensuales puras para comparar actividad, cobros y rentabilidad. */
(function initSalesDashboard(global) {
  'use strict';

  const money = (value) => Math.round((Number(value) || 0) * 100) / 100;
  const monthKey = (date) => {
    const value = new Date(date);
    return Number.isNaN(value.getTime())
      ? ''
      : `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
  };

  function previousMonth(key) {
    const [year, month] = key.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  function summarizeMonth(sales, selectedMonth, expenses = []) {
    const activeSales = sales.filter((sale) => !sale.anulada);
    const monthlySales = activeSales.filter((sale) => monthKey(sale.fecha) === selectedMonth);
    const payments = activeSales.flatMap((sale) => sale.pagos || [])
      .filter((payment) => monthKey(payment.fecha) === selectedMonth);
    const products = {};

    monthlySales.forEach((sale) => sale.items.forEach((item) => {
      const key = item.productoNombre || 'Producto sin nombre';
      if (!products[key]) products[key] = { nombre: key, unidades: 0, ganancia: 0, ingresos: 0 };
      const suggested = Number(sale.totalSugerido) || 0;
      const share = suggested > 0 ? (Number(item.subtotal) || 0) / suggested : 0;
      const actualRevenue = (Number(sale.totalCobrado) || 0) * share;
      products[key].unidades += Number(item.cantidad) || 0;
      products[key].ganancia += actualRevenue - (Number(item.costoTotal) || 0);
      products[key].ingresos += actualRevenue;
    }));

    const facturado = money(monthlySales.reduce((sum, sale) => sum + sale.totalCobrado, 0));
    const costos = money(monthlySales.reduce((sum, sale) => sum + sale.totalCosto, 0));
    const ganancia = money(monthlySales.reduce((sum, sale) => sum + sale.totalGanancia, 0));
    const cobrado = money(payments.reduce((sum, payment) => sum + payment.monto, 0));
    const descuentos = money(monthlySales.reduce((sum, sale) => sum + sale.descuento, 0));
    const pendientes = money(activeSales.reduce((sum, sale) => sum + AppSales.outstanding(sale), 0));
    const gastos = money(expenses.filter((expense) => monthKey(expense.fecha) === selectedMonth).reduce((sum, expense) => sum + expense.monto, 0));
    const resultadoCaja = money(cobrado - gastos);
    const productList = Object.values(products);

    return {
      mes: selectedMonth,
      ventas: monthlySales.length,
      facturado,
      cobrado,
      costos,
      ganancia,
      descuentos,
      pendientes,
      gastos,
      resultadoCaja,
      ticketPromedio: monthlySales.length ? money(facturado / monthlySales.length) : 0,
      margen: costos > 0 ? Math.round(ganancia / costos * 100) : 0,
      masVendido: productList.sort((a, b) => b.unidades - a.unidades)[0] || null,
      masRentable: [...productList].sort((a, b) => b.ganancia - a.ganancia)[0] || null,
    };
  }

  function compareMonths(sales, selectedMonth, expenses = []) {
    const current = summarizeMonth(sales, selectedMonth, expenses);
    const previous = summarizeMonth(sales, previousMonth(selectedMonth), expenses);
    const variation = (field) => {
      if (!previous[field]) return current[field] ? null : 0;
      return Math.round((current[field] - previous[field]) / previous[field] * 100);
    };
    return { current, previous, facturadoVariation: variation('facturado'), gananciaVariation: variation('ganancia') };
  }

  global.AppSalesDashboard = Object.freeze({ monthKey, previousMonth, summarizeMonth, compareMonths });
})(window);
