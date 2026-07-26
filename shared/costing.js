/* ============================================================
   shared/costing.js - Reglas puras de costos y precios.
   La calculadora y ventas usan el mismo criterio contable.
   ============================================================ */

(function initCosting(global) {
  'use strict';

  const numberOr = (value, fallback = 0) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  function calculate(input = {}) {
    const units = Math.max(1, numberOr(input.units, 1));
    const supplies = Array.isArray(input.supplies) ? input.supplies : [];
    const services = Array.isArray(input.services) ? input.services : [];
    const suppliesTotal = supplies.reduce(
      (total, item) => total + numberOr(item.cantidad) * numberOr(item.precio), 0
    );
    const servicesTotal = services.reduce(
      (total, item) => total + numberOr(item.horas) * numberOr(item.precio), 0
    );
    const unitCost = (suppliesTotal + servicesTotal) / units;
    const mode = input.mode === 'precio' ? 'precio' : 'slider';
    const configuredMargin = numberOr(input.margin, 50);
    const salePrice = mode === 'precio'
      ? Math.max(0, numberOr(input.manualPrice))
      : unitCost * (1 + configuredMargin / 100);
    const realMargin = unitCost > 0 ? ((salePrice - unitCost) / unitCost) * 100 : 0;
    const unitProfit = salePrice - unitCost;
    const monthlyExpenses = Math.max(0, numberOr(input.monthlyExpenses));
    const workDays = Math.max(1, numberOr(input.workDays, 24));
    const incomeGoal = Math.max(0, numberOr(input.incomeGoal));
    const monthlySales = unitProfit > 0 ? Math.ceil(monthlyExpenses / unitProfit) : null;
    const dailySales = monthlySales === null ? null : Math.ceil(monthlySales / workDays);
    const goalUnits = unitProfit > 0 && incomeGoal > 0
      ? Math.ceil((monthlyExpenses + incomeGoal) / unitProfit)
      : null;
    const suppliesShare = unitCost > 0
      ? Math.round((suppliesTotal / units / unitCost) * 100)
      : 0;

    return {
      totalInsumos: suppliesTotal,
      totalServicios: servicesTotal,
      costoUnitario: unitCost,
      precioVenta: salePrice,
      precioConIva: salePrice * 1.21,
      margenReal: realMargin,
      gananciaNeta: unitProfit,
      gastosMensuales: monthlyExpenses,
      diasLaborales: workDays,
      ventasMensuales: monthlySales,
      ventasDiarias: dailySales,
      metaIngresos: incomeGoal,
      unidadesMeta: goalUnits,
      pctInsumos: suppliesShare,
      pctServicios: unitCost > 0 ? 100 - suppliesShare : 0,
      unidades: units,
    };
  }

  /* Normaliza proyectos actuales y archivos de demostracion antiguos. */
  function fromProject(project = {}) {
    const data = project.datos || project;
    return calculate({
      supplies: data.insumos,
      services: data.servicios,
      units: data.unidades,
      margin: data.margen,
      mode: data.modo,
      manualPrice: data.precioManual,
      monthlyExpenses: data.gastosMensuales,
      workDays: data.diasLaborales,
      incomeGoal: data.metaIngresos,
    });
  }

  global.AppCosting = Object.freeze({ calculate, fromProject });
})(window);
