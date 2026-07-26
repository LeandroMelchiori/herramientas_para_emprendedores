/* Resumen PDF mensual del registro de ventas. Requiere jsPDF. */

function generarPDFVentas() {
  if (!window.jspdf) { mostrarToast('PDF todavía cargando, intentá de nuevo'); return; }
  const { jsPDF } = window.jspdf;

  const mesSel = document.getElementById('select-mes-pdf')?.value || 'todo';
  const todasVentas = obtenerVentas().filter(v => !v.anulada);
  const todosGastos = obtenerGastos();
  let ventas, gastos, periodoLabelBase;
  if (mesSel === 'todo') {
    ventas = todasVentas;
    periodoLabelBase = 'Historial completo';
  } else {
    const [yr, mo] = mesSel.split('-').map(Number);
    ventas = todasVentas.filter(v => {
      const d = new Date(v.fecha);
      return d.getFullYear() === yr && d.getMonth() + 1 === mo;
    });
    gastos = todosGastos.filter(g => AppExpenses.monthKey(g.fecha) === mesSel);
    const label = new Date(yr, mo - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    periodoLabelBase = label.charAt(0).toUpperCase() + label.slice(1);
  }
  if (!ventas.length && !gastos.length) { mostrarToast('No hay movimientos en este periodo'); return; }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PW = 210, mx = 15, cw = PW - mx * 2;
  let y = 0;

  const C = {
    naranja:   [232, 93, 58],  magenta:  [213, 48, 110],
    violeta:   [107, 63, 160], verde:    [22, 163, 74],
    azul:      [37, 99, 235],  negro:    [26, 26, 46],
    gris:      [107, 114, 128],grisClaro:[248, 248, 252],
    borde:     [229, 231, 235],blanco:   [255, 255, 255],
  };

  const fmtP = v => new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(v);

  const fmtD = iso => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
         + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const pie = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.gris);
    doc.text('Herramientas para Emprendedores · Dirección de Economía Social · Gobierno de Santa Fe', PW / 2, 290, { align: 'center' });
  };

  const nuevaPag = () => { doc.addPage(); y = 20; pie(); };
  const chk = (h = 20) => { if (y + h > 272) nuevaPag(); };

  /* ── HEADER ── */
  doc.setFillColor(...C.naranja);  doc.rect(0,   0, PW * 0.45, 30, 'F');
  doc.setFillColor(...C.magenta);  doc.rect(PW * 0.35, 0, PW * 0.35, 30, 'F');
  doc.setFillColor(...C.violeta);  doc.rect(PW * 0.60, 0, PW * 0.40, 30, 'F');

  doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(...C.blanco);
  doc.text('Resumen de ventas', mx, 13);

  const periodoLabel = periodoLabelBase;

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(periodoLabel, mx, 21);
  doc.setFontSize(7);
  doc.text('Generado: ' + new Date().toLocaleString('es-AR'), PW - mx, 27, { align: 'right' });

  pie();
  y = 40;

  /* ── STATS ── */
  const totalIng = ventas.reduce((a, v) => a + v.totalCobrado,  0);
  const totalCos = ventas.reduce((a, v) => a + v.totalCosto,    0);
  const totalGan = ventas.reduce((a, v) => a + v.totalGanancia, 0);
  const totalGastos = gastos.reduce((a, g) => a + g.monto, 0);
  const totalCobrado = ventas.flatMap(v => v.pagos || []).reduce((a, p) => a + p.monto, 0);
  const resultadoCaja = totalCobrado - totalGastos;
  const margenProm = totalCos > 0 ? Math.round(totalGan / totalCos * 100) : 0;

  const stats = [
    { label: 'VENTAS',    value: String(ventas.length), color: C.azul    },
    { label: 'FACTURADO', value: fmtP(totalIng),        color: C.naranja },
    { label: 'COBRADO',   value: fmtP(totalCobrado),    color: C.verde   },
    { label: 'GASTOS',    value: fmtP(totalGastos),     color: C.magenta },
  ];

  const sw = (cw - 9) / 4;
  stats.forEach((s, i) => {
    const sx = mx + i * (sw + 3);
    doc.setFillColor(...C.grisClaro);
    doc.roundedRect(sx, y, sw, 15, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...s.color);
    doc.text(s.value, sx + sw / 2, y + 7, { align: 'center', maxWidth: sw - 2 });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(...C.gris);
    doc.text(s.label, sx + sw / 2, y + 12, { align: 'center' });
  });

  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...C.gris);
  doc.text(`Costos estimados: ${fmtP(totalCos)} | Ganancia estimada: ${fmtP(totalGan)} | Resultado de caja: ${fmtP(resultadoCaja)} | Margen: ${margenProm}%`, mx, y + 21, { maxWidth: cw });
  y += 28;

  /* ── TABLA HELPER ── */
  const drawTableHeader = (cols, labels) => {
    doc.setFillColor(...C.grisClaro);
    doc.rect(mx, y, cw, 6.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(...C.gris);
    let cx = mx;
    labels.forEach((h, i) => {
      const right = i >= 2;
      doc.text(h.toUpperCase(), right ? cx + cols[i] - 2 : cx + 2, y + 4.5, { align: right ? 'right' : 'left' });
      cx += cols[i];
    });
    y += 7.5;
  };

  const drawRow = (cols, vals, highlight, altBg) => {
    chk(8);
    if (altBg) { doc.setFillColor(252, 252, 254); doc.rect(mx, y - 0.5, cw, 7, 'F'); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...C.negro);
    let cx = mx;
    vals.forEach((v, i) => {
      const right = i >= 2;
      const color = (i === vals.length - 1 && highlight) ? C.verde : C.negro;
      doc.setTextColor(...color);
      doc.text(String(v), right ? cx + cols[i] - 2 : cx + 2, y + 4.5, { align: right ? 'right' : 'left', maxWidth: cols[i] - 4 });
      cx += cols[i];
    });
    doc.setDrawColor(...C.borde);
    doc.line(mx, y + 6.5, mx + cw, y + 6.5);
    y += 7;
  };

  /* ── DETALLE POR PRODUCTO ── */
  const byProd = {};
  ventas.forEach(v => v.items.forEach(i => {
    if (!byProd[i.productoNombre]) byProd[i.productoNombre] = { u: 0, ing: 0, cos: 0, gan: 0 };
    byProd[i.productoNombre].u   += i.cantidad;
    byProd[i.productoNombre].ing += i.subtotal;
    byProd[i.productoNombre].cos += i.costoTotal;
    byProd[i.productoNombre].gan += i.gananciaTotal;
  }));
  const prods = Object.entries(byProd).sort((a, b) => b[1].ing - a[1].ing);

  if (prods.length) {
    chk(16 + prods.length * 7);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...C.negro);
    doc.text('Detalle por producto', mx, y);
    doc.setDrawColor(...C.borde); doc.line(mx, y + 1.5, mx + cw, y + 1.5);
    y += 7;

    const c1 = [cw * 0.37, cw * 0.10, cw * 0.21, cw * 0.16, cw * 0.16];
    drawTableHeader(c1, ['Producto', 'Unid.', 'Ingresos', 'Costo', 'Ganancia']);
    prods.forEach(([nombre, d], ri) =>
      drawRow(c1, [nombre, d.u, fmtP(d.ing), fmtP(d.cos), fmtP(d.gan)], true, ri % 2 === 0));
    y += 6;
  }

  /* Los gastos reales se separan de los costos estimados para no mezclar caja con rentabilidad. */
  if (gastos.length) {
    chk(16 + gastos.length * 7);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...C.negro);
    doc.text('Gastos reales', mx, y);
    doc.setDrawColor(...C.borde); doc.line(mx, y + 1.5, mx + cw, y + 1.5);
    y += 7;

    const cGastos = [cw * 0.18, cw * 0.37, cw * 0.25, cw * 0.20];
    drawTableHeader(cGastos, ['Fecha', 'Concepto', 'Categoria', 'Monto']);
    gastos.forEach((gasto, ri) => {
      drawRow(cGastos, [fmtD(gasto.fecha), gasto.concepto, gasto.categoria, fmtP(gasto.monto)], false, ri % 2 === 0);
    });
    y += 6;
  }

  /* ── HISTORIAL DE OPERACIONES ── */
  chk(20);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...C.negro);
  doc.text('Historial de operaciones', mx, y);
  doc.setDrawColor(...C.borde); doc.line(mx, y + 1.5, mx + cw, y + 1.5);
  y += 7;

  const c2 = [cw * 0.18, cw * 0.32, cw * 0.20, cw * 0.15, cw * 0.15];
  drawTableHeader(c2, ['Fecha y hora', 'Detalle', 'Cobrado', 'Costo', 'Ganancia']);
  ventas.forEach((v, ri) => {
    const items = v.items.length === 1
      ? v.items[0].productoNombre
      : `${v.items.length} productos (${v.items.reduce((a, i) => a + i.cantidad, 0)} u.)`;
    let desc = v.descuento > 0.5 ? ` (-${fmtP(v.descuento)})` : '';
    let detalle = items + desc;
    if (v.etiqueta) detalle += ` - ${v.etiqueta}`;
    if (v.fiado) {
      detalle += v.montoPagado > 0 ? ` [SEÑA: ${fmtP(v.montoPagado)}]` : ' [FALTA PAGAR]';
    } else if (v.medioPago) {
      detalle += ` [${v.medioPago.toUpperCase()}]`;
    }

    drawRow(c2, [fmtD(v.fecha), detalle, fmtP(v.totalCobrado), fmtP(v.totalCosto), fmtP(v.totalGanancia)], true, ri % 2 === 0);
  });

  /* ── GUARDAR ── */
  const fecha = new Date().toISOString().slice(0, 10);
  doc.save(`ventas-${mesSel === 'todo' ? 'completo' : mesSel}-${fecha}.pdf`);
  mostrarToast('PDF descargado ✓');
  if (typeof trackEvent === 'function') trackEvent('ventas_exportar_pdf');
}
