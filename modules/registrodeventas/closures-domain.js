/* Snapshot inmutable del cierre para conservar las cifras presentadas ese día. */
(function initClosuresDomain(global) {
  'use strict';

  function createClosure(month, sales, expenses, now = new Date()) {
    const metrics = AppSalesDashboard.summarizeMonth(sales, month, expenses);
    return {
      id: `${month}-${now.getTime()}`,
      mes: month,
      fechaCierre: now.toISOString(),
      metrics: JSON.parse(JSON.stringify(metrics)),
    };
  }

  global.AppClosures = Object.freeze({ createClosure });
})(window);
