/* Exportaciones PDF y PNG de la paleta activa. */

function hexToRgbArr(hex){ return hexToRgb(hex); }

function setFill(doc, hex) {
  const [r,g,b] = hexToRgbArr(hex);
  doc.setFillColor(r,g,b);
}
function setTextCol(doc, hex) {
  const [r,g,b] = hexToRgbArr(hex);
  doc.setTextColor(r,g,b);
}
function roundRect(doc, x, y, w, h, r) {
  doc.roundedRect(x, y, w, h, r, r, 'F');
}

function printPDF() {
  const btn = document.getElementById('print-btn');
  btn.textContent = '⏳ Generando PDF...';
  btn.disabled = true;

  // Load jsPDF dynamically
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  script.onload = () => {
    try { buildJsPDF(); }
    catch(e) { alert('Error al generar el PDF: ' + e.message); }
    finally { btn.textContent = '🖨️ Imprimir / Guardar como PDF'; btn.disabled = false; }
  };
  script.onerror = () => {
    alert('No se pudo cargar jsPDF. Verificá tu conexión a internet.');
    btn.textContent = '🖨️ Imprimir / Guardar como PDF'; btn.disabled = false;
  };
  // If already loaded
  if (window.jspdf) { try { buildJsPDF(); } catch(e) { alert(e.message); } finally { btn.textContent = '🖨️ Imprimir / Guardar como PDF'; btn.disabled = false; } return; }
  document.head.appendChild(script);
}

function buildJsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const hex = currentHex();
  const [r,g,b] = hexToRgbArr(hex);
  const em = getEmotion(H);
  const palette = generatePalette(H, S, L, currentHarmony);
  const harmonyName = harmonies[currentHarmony].label;
  const now = new Date().toLocaleDateString('es-AR', {day:'2-digit', month:'long', year:'numeric'});

  const PW = 210, PH = 297;
  const ML = 14, MR = 14, MW = PW - ML - MR;
  let y = 0;

  // ── Header bar ──
  setFill(doc, hex);
  doc.rect(0, 0, PW, 28, 'F');
  setTextCol(doc, getTextColor(hex));
  doc.setFontSize(18); doc.setFont('helvetica','bold');
  doc.text('Mi Paleta de Marca', ML, 12);
  doc.setFontSize(8); doc.setFont('helvetica','normal');
  doc.text('Resumen generado con el Combinador de Colores', ML, 18);
  doc.text(now, PW - MR, 18, { align:'right' });
  y = 36;

  // ── Section label helper ──
  const sectionLabel = (label) => {
    doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.setTextColor(180,180,180);
    doc.text(label.toUpperCase(), ML, y);
    y += 5;
    doc.setDrawColor(230,230,230); doc.setLineWidth(0.3);
    doc.line(ML, y, PW-MR, y);
    y += 4;
  };

  // ── Color principal ──
  sectionLabel('Color Principal');
  // Big swatch
  setFill(doc, hex);
  roundRect(doc, ML, y, 22, 22, 3);
  // Color info
  doc.setTextColor(30,30,30);
  doc.setFontSize(14); doc.setFont('helvetica','bold');
  doc.text(hex.toUpperCase(), ML + 27, y + 6);
  doc.setFontSize(8.5); doc.setFont('helvetica','normal');
  doc.setTextColor(100,100,100);
  doc.text(`rgb(${r}, ${g}, ${b})`, ML + 27, y + 12);
  doc.text(`hsl(${H}°, ${S}%, ${L}%)`, ML + 27, y + 17);
  // Emotion
  doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(50,50,50);
  doc.text(`${em.n}  —  ${em.w}`, ML + 27, y + 23);
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(120,120,120);
  doc.text(`Ideal para: ${em.rb}`, ML + 27, y + 28);
  y += 38;

  // ── Paleta ──
  sectionLabel(`Paleta — ${harmonyName}`);
  palette.forEach(c => {
    const [cr,cg,cb] = hexToRgbArr(c.hex);
    // Swatch
    doc.setFillColor(cr,cg,cb);
    roundRect(doc, ML, y, 12, 10, 2);
    // Label
    doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(40,40,40);
    doc.text(c.label, ML + 15, y + 7);
    // HEX
    doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(60,60,60);
    doc.text(c.hex.toUpperCase(), ML + 48, y + 7);
    // RGB
    doc.setFontSize(7.5); doc.setTextColor(150,150,150);
    doc.text(`rgb(${cr}, ${cg}, ${cb})`, ML + 75, y + 7);
    y += 13;
  });
  y += 4;

  // ── Regla 60-30-10 ──
  sectionLabel('Regla 60 · 30 · 10');
  const boxW = (MW - 8) / 3;
  const rules = [
    { pct:'60%', role:'Principal',   idx:0 },
    { pct:'30%', role:'Secundario',  idx:1 },
    { pct:'10%', role:'Acento',      idx:Math.min(2, palette.length-1) },
  ];
  rules.forEach((rule, i) => {
    const bx = ML + i * (boxW + 4);
    const ph = palette[rule.idx]?.hex || hex;
    setFill(doc, ph);
    roundRect(doc, bx, y, boxW, 20, 3);
    const tc = getTextColor(ph);
    setTextCol(doc, tc);
    doc.setFontSize(13); doc.setFont('helvetica','bold');
    doc.text(rule.pct, bx + boxW/2, y + 10, { align:'center' });
    doc.setFontSize(7.5); doc.setFont('helvetica','normal');
    doc.text(rule.role, bx + boxW/2, y + 16, { align:'center' });
  });
  y += 30;

  // ── Footer ──
  doc.setFontSize(7); doc.setFont('helvetica','normal');
  doc.setTextColor(200,200,200);
  doc.text('Generado con el Combinador de Colores para emprendedores  ·  Dirección Economía Social', PW/2, PH - 10, { align:'center' });

  // ── Save ──
  const fname = `paleta-${hex.replace('#','')}-${Date.now()}.pdf`;
  doc.save(fname);
  trackEvent("Exportar paleta", { formato: "pdf" });
}

/* ═══════════════════════════════════════════════════════════════
   FUNCIONES NUEVAS
   ═══════════════════════════════════════════════════════════════ */

// ── Contraste WCAG ──────────────────────────────────────────────
// Luminancia relativa según la fórmula oficial de WCAG.

function exportPNG(){
  const pal=generatePalette(H,S,L,currentHarmony),hex=currentHex(),em=getEmotion(H),tc=getTextColor(hex);
  const W=1080,Hc=1080,headH=320,footH=90,colsTop=headH,colsH=Hc-headH-footH;
  const cv=document.createElement("canvas");cv.width=W;cv.height=Hc;
  const x=cv.getContext("2d");
  x.fillStyle="#ffffff";x.fillRect(0,0,W,Hc);
  // Encabezado con el color principal
  x.fillStyle=hex;x.fillRect(0,0,W,headH);
  x.fillStyle=tc;
  x.font="700 58px 'DM Sans',sans-serif";x.fillText("Mi paleta de marca",60,150);
  x.font="400 30px 'DM Sans',sans-serif";x.fillText(`${em.n} · ${em.w}`,60,205);
  x.font="400 24px 'DM Sans',sans-serif";x.fillText(`Ideal para: ${em.rb}`,60,250);
  // Columnas de color con su HEX y etiqueta
  const cw=W/pal.length;
  pal.forEach((c,i)=>{
    x.fillStyle=c.hex;x.fillRect(i*cw,colsTop,Math.ceil(cw),colsH);
    x.fillStyle=getTextColor(c.hex);x.textAlign="center";
    x.font="700 30px 'DM Sans',sans-serif";x.fillText(c.hex.toUpperCase(),i*cw+cw/2,colsTop+colsH-70);
    x.font="400 24px 'DM Sans',sans-serif";x.fillText(c.label,i*cw+cw/2,colsTop+colsH-36);
  });
  x.textAlign="left";
  // Pie
  x.fillStyle="#aaa";x.font="400 22px 'DM Sans',sans-serif";
  x.fillText("Generado con el Combinador de Colores · Herramientas para Emprendedores",60,Hc-36);
  cv.toBlob(b=>{const url=URL.createObjectURL(b);const a=document.createElement("a");a.href=url;a.download=`paleta-${hex.replace('#','')}.png`;a.click();URL.revokeObjectURL(url);showToast("🖼️ Imagen PNG descargada");trackEvent("Exportar paleta",{formato:"png"});});
}

// ── Extraer colores de una foto ────────────────────────────────
