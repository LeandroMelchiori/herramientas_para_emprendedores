/* Generacion del resumen PDF de costos. Requiere jsPDF y app.js. */

function descargarPDF() {
  const { jsPDF } = window.jspdf;
  const c      = calcular();
  const nombre = document.getElementById('nombre-producto').value || 'Mi producto';
  const doc    = new jsPDF();

  /* Paleta */
  const cNaranja    = [192, 92, 26];
  const cAzul       = [43, 108, 176];
  const cVerde      = [39, 174, 96];
  const cGris       = [80, 80, 80];
  const cGrisClaro  = [150, 150, 150];
  const cBorde      = [220, 220, 220];
  const cGrisBarra  = [176, 184, 193];

  let y = 0;

  /* Saltar de página si queda poco espacio */
  const checkY = (espacio = 20) => { if (y + espacio > 272) { doc.addPage(); y = 18; } };

  /* Línea separadora */
  const sep = (margen = 3) => {
    checkY(8);
    y += margen;
    doc.setDrawColor(...cBorde); doc.line(14, y, 196, y); y += margen + 2;
  };

  /* Encabezado de sección */
  const seccion = (titulo) => {
    checkY(14);
    y += 3;
    doc.setFillColor(253, 240, 232); doc.rect(14, y - 5, 182, 8, 'F');
    doc.setTextColor(...cNaranja); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(titulo.toUpperCase(), 16, y); y += 9;
  };

  /* Fila label — valor */
  const fila = (label, valor, cVal = cGris) => {
    checkY(8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...cGris);
    doc.text(label, 16, y);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...cVal);
    doc.text(valor, 196, y, { align: 'right' }); y += 7;
  };

  /* Fila destacada (más grande) */
  const filaDestacada = (label, valor, cVal = cNaranja) => {
    checkY(10);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...cGris);
    doc.text(label, 16, y);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...cVal);
    doc.text(valor, 196, y, { align: 'right' }); y += 8;
  };

  /* Mensaje centrado destacado */
  const mensaje = (texto, cTexto = cAzul) => {
    checkY(12);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...cTexto);
    doc.text(texto, 14, y); y += 9;
  };

  /* Barra horizontal con dos segmentos + leyenda */
  const barra = (pct1, col1, label1, pct2, col2, label2) => {
    checkY(22);
    const bx = 14, bw = 182, bh = 7;
    doc.setFillColor(...col1); doc.rect(bx,              y, bw * pct1 / 100, bh, 'F');
    doc.setFillColor(...col2); doc.rect(bx + bw * pct1 / 100, y, bw * pct2 / 100, bh, 'F');
    y += bh + 5;
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...cGris);
    doc.setFillColor(...col1); doc.circle(17, y - 1.5, 2.5, 'F');
    doc.text(`${label1}: ${pct1}%`, 22, y);
    doc.setFillColor(...col2); doc.circle(80, y - 1.5, 2.5, 'F');
    doc.text(`${label2}: ${pct2}%`, 85, y);
    y += 7;
  };

  /* ══════════════════════════════════════════
     HEADER
  ══════════════════════════════════════════ */
  doc.setFillColor(...cNaranja); doc.rect(0, 0, 210, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text('Calculadora de Costos', 105, 13, { align: 'center' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('Herramientas para Emprendedores — Gobierno de Santa Fe', 105, 22, { align: 'center' });
  doc.text(new Date().toLocaleDateString('es-AR'), 105, 29, { align: 'center' });
  y = 44;

  /* Nombre del producto */
  doc.setTextColor(...cNaranja); doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text(nombre, 14, y); y += 5;
  sep(2);

  /* ══════════════════════════════════════════
     MATERIALES
  ══════════════════════════════════════════ */
  const insumosConDatos = estado.insumos.filter(i => i.nombre || i.precio > 0);
  if (insumosConDatos.length && !estado.soloServicios) {
    seccion('Materiales e insumos');
    insumosConDatos.forEach(ins => {
      fila(
        ins.nombre || '(sin nombre)',
        `${ins.cantidad}${ins.unidad ? ` ${ins.unidad}` : ""} × ${fmt(ins.precio)}${ins.unidad ? `/${ins.unidad}` : ""} = ${fmt(ins.cantidad * ins.precio)}`
      );
    });
    filaDestacada('Total materiales', fmt(c.totalInsumos)); y += 2;
  }

  /* ══════════════════════════════════════════
     SERVICIOS
  ══════════════════════════════════════════ */
  const serviciosConDatos = estado.servicios.filter(s => s.nombre || s.precio > 0);
  if (serviciosConDatos.length) {
    seccion('Servicios y mano de obra');
    serviciosConDatos.forEach(srv => {
      fila(
        srv.nombre || '(sin nombre)',
        `${srv.horas}h × ${fmt(srv.precio)}/h = ${fmt(srv.horas * srv.precio)}`
      );
    });
    filaDestacada('Total servicios', fmt(c.totalServicios)); y += 2;
  }

  /* ══════════════════════════════════════════
     COSTO UNITARIO
  ══════════════════════════════════════════ */
  checkY(16);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...cGrisClaro);
  doc.text(`Unidades producidas por tanda: ${c.unidades}`, 16, y); y += 7;
  filaDestacada('Costo por unidad', fmt(c.costoUnitario));
  sep();

  /* ══════════════════════════════════════════
     PRECIO Y GANANCIA
  ══════════════════════════════════════════ */
  if (c.precioVenta > 0) {
    seccion('Precio y ganancia');
    filaDestacada('Precio de venta', fmt(c.precioVenta));
    if (estado.ivaActivo) fila('Precio con IVA (21%)', fmt(c.precioConIva), cNaranja);
    fila('Margen sobre el costo', `${Math.round(c.margenReal)}%`);
    filaDestacada('Ganancia neta por unidad', fmt(c.gananciaNeta), cVerde);
    y += 4;

    const pctCosto    = Math.round(c.costoUnitario / c.precioVenta * 100);
    const pctGanancia = 100 - pctCosto;

    /* Barra: composición del precio */
    checkY(26);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...cGris);
    doc.text('De cada peso que cobrás:', 14, y); y += 5;
    barra(pctCosto, cGrisBarra, 'Costo', pctGanancia, cVerde, 'Ganancia');

    /* Barra: composición del costo (solo si hay ambos tipos) */
    if (c.costoUnitario > 0 && insumosConDatos.length && serviciosConDatos.length) {
      checkY(26);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...cGris);
      doc.text('Dentro del costo:', 14, y); y += 5;
      barra(c.pctInsumos, cNaranja, 'Materiales', c.pctServicios, cAzul, 'Servicios');
    }
    sep();
  }

  /* ══════════════════════════════════════════
     PUNTO DE EQUILIBRIO
  ══════════════════════════════════════════ */
  if (c.ventasMensuales !== null) {
    seccion('Punto de equilibrio');
    fila('Gastos fijos mensuales', fmt(c.gastosMensuales));
    fila('Días de trabajo por mes', `${c.diasLaborales} días`);
    y += 2;
    mensaje(
      `Necesitás vender ${c.ventasMensuales} unidades/mes (${c.ventasDiarias} por día)`,
      cAzul
    );
  }

  /* ══════════════════════════════════════════
     META DE INGRESOS
  ══════════════════════════════════════════ */
  if (c.unidadesMeta !== null) {
    seccion('Meta de ingresos');
    fila('Meta mensual', fmt(c.metaIngresos));
    y += 2;
    mensaje(
      `Para esa meta: ${c.unidadesMeta} unidades/mes (${Math.ceil(c.unidadesMeta / c.diasLaborales)} por día)`,
      cAzul
    );
  }

  /* ══════════════════════════════════════════
     FOOTER
  ══════════════════════════════════════════ */
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(...cBorde); doc.line(14, 283, 196, 283);
    doc.setTextColor(180, 180, 180); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text('Generado con Herramientas para Emprendedores — economiasocial.sachadev.me', 105, 289, { align: 'center' });
    if (pageCount > 1) doc.text(`${p} / ${pageCount}`, 196, 289, { align: 'right' });
  }

  doc.save(`calculadora-${nombre.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  if (typeof trackEvent === 'function') trackEvent('descargar_pdf');
}
