function hslToRgb(h,s,l){s/=100;l/=100;const a=s*Math.min(l,1-l);const f=n=>{const k=(n+h/30)%12;return l-a*Math.max(Math.min(k-3,9-k,1),-1);};return[Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255)];}
function rgbToHex(r,g,b){return"#"+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("");}
function hslToHex(h,s,l){return rgbToHex(...hslToRgb(h,s,l));}
function hexToRgb(hex){const c=hex.replace("#","");if(c.length!==6)return[128,128,128];return[parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)];}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;if(max===min){h=s=0;}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}h=Math.round(h*360);}return[h,Math.round(s*100),Math.round(l*100)];}
function hexToHsl(hex){return rgbToHsl(...hexToRgb(hex));}
function isValidHex(h){return/^#[0-9a-fA-F]{6}$/.test(h);}
function getTextColor(hex){const[r,g,b]=hexToRgb(hex);return(0.299*r+0.587*g+0.114*b)/255>0.55?"#1a1a1a":"#ffffff";}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function currentHex(){return hslToHex(H,S,L);}
let H=25,S=72,L=55,currentHarmony="analogos",currentTab="wheel";
function copyToClipboard(text){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text).catch(()=>fbCopy(text));fbCopy(text);}
function fbCopy(text){const t=document.createElement("textarea");t.value=text;t.style.cssText="position:fixed;top:-9999px;left:-9999px;opacity:0;";document.body.appendChild(t);t.focus();t.select();try{document.execCommand("copy");}catch(e){}document.body.removeChild(t);}
let toastT=null;
function showToast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("show"),2000);}
function copyColor(hex){copyToClipboard(hex);showToast("✓ "+hex.toUpperCase()+" copiado");}
function copyHeroHex(){const hex=currentHex();copyColor(hex);const btn=document.getElementById("copy-hex-btn");const o=btn.textContent;btn.textContent="✓ Copiado!";setTimeout(()=>btn.textContent=o,1500);}
function copyPaletteColor(hex,btn){copyColor(hex);const s=btn.querySelector(".phex");const o=s.textContent;s.textContent="✓ Copiado!";setTimeout(()=>s.textContent=o,1500);}
const emotions=[
  {r:[345,360],e:"❤️",n:"Rojo",w:"pasión · energía · fuerza",rb:"Gastronomía, deporte, moda"},
  {r:[0,15],e:"❤️",n:"Rojo",w:"pasión · energía · fuerza",rb:"Gastronomía, deporte, moda"},
  {r:[15,45],e:"🧡",n:"Naranja",w:"creatividad · calidez · juventud",rb:"Comida, entretenimiento"},
  {r:[45,70],e:"💛",n:"Amarillo",w:"optimismo · alegría · atención",rb:"Bebidas, infantil"},
  {r:[70,165],e:"💚",n:"Verde",w:"naturaleza · salud · frescura",rb:"Orgánico, bienestar"},
  {r:[165,200],e:"🩵",n:"Celeste",w:"tranquilidad · limpieza · modernidad",rb:"Tecnología, salud"},
  {r:[200,255],e:"💙",n:"Azul",w:"confianza · profesionalismo · calma",rb:"Finanzas, tech, servicios"},
  {r:[255,310],e:"💜",n:"Violeta",w:"creatividad · lujo · misterio",rb:"Belleza, arte, bienestar"},
  {r:[310,345],e:"🩷",n:"Rosa",w:"ternura · romance · delicadeza",rb:"Belleza, moda, regalos"},
];
function getEmotion(h){return emotions.find(e=>e.r[0]>e.r[1]?h>=e.r[0]||h<e.r[1]:h>=e.r[0]&&h<e.r[1])||emotions[6];}
const harmonies={complementario:{label:"Complementaria",desc:"Máximo contraste y energía",offsets:[180]},analogos:{label:"Análoga",desc:"Colores vecinos, armonía natural",offsets:[30,60,-30]},triadico:{label:"Tríada",desc:"3 colores equidistantes, vibrante",offsets:[120,240]},split:{label:"Complementaria Dividida",desc:"Variante suave de la complementaria",offsets:[150,210]},monocromatico:{label:"Monocromática",desc:"Un tono en distintas luminosidades",offsets:[]},cuadrado:{label:"Cuadrada",desc:"4 colores en cuadrado perfecto",offsets:[90,180,270]},tetradica:{label:"Tetrádica",desc:"4 colores en rectángulo",offsets:[60,180,240]}};
const harmLabels={complementario:["Complementaria"],analogos:["Análogo+","Análogo++","Análogo−"],triadico:["Tríada 2","Tríada 3"],split:["Comp. Div. 1","Comp. Div. 2"],cuadrado:["Cuadrada 2","Cuadrada 3","Cuadrada 4"],tetradica:["Tetrádica 2","Tetrádica 3","Tetrádica 4"]};
function generatePalette(h,s,l,key){const colors=[{hex:hslToHex(h,s,l),label:"Principal"}];if(key==="monocromatico"){colors.push({hex:hslToHex(h,s,clamp(l+22,5,95)),label:"Claro"});colors.push({hex:hslToHex(h,s,clamp(l-22,5,95)),label:"Oscuro"});colors.push({hex:hslToHex(h,Math.max(s-35,5),clamp(l+40,5,97)),label:"Neutro"});}else{(harmonies[key].offsets||[]).forEach((off,i)=>{colors.push({hex:hslToHex(((h+off)%360+360)%360,s,l),label:harmLabels[key]?.[i]||`Color ${i+2}`});});colors.push({hex:hslToHex(h,Math.max(s-48,5),clamp(l+38,5,96)),label:"Neutro"});}return colors;}
const SIZE=260,RING=24,GAP=6,CX=130,CY=130,OUTER_R=128,INNER_R=OUTER_R-RING;
const SQ_HALF=(INNER_R-GAP)*0.707,SQ_X=CX-SQ_HALF,SQ_Y=CY-SQ_HALF,SQ_W=SQ_HALF*2;
let canvas,ctx,dragging=null;
// El anillo de tono es siempre igual: lo dibujamos UNA vez en un canvas oculto y lo reutilizamos.
let ringCanvas=null, slCacheH=-1, slImageData=null;
function buildRingCache(){
  ringCanvas=document.createElement("canvas");ringCanvas.width=SIZE;ringCanvas.height=SIZE;
  const rc=ringCanvas.getContext("2d");
  for(let i=0;i<360;i++){const a1=(i/360)*Math.PI*2-Math.PI/2,a2=((i+1.5)/360)*Math.PI*2-Math.PI/2;rc.beginPath();rc.moveTo(CX+INNER_R*Math.cos(a1),CY+INNER_R*Math.sin(a1));rc.arc(CX,CY,OUTER_R,a1,a2);rc.arc(CX,CY,INNER_R,a2,a1,true);rc.closePath();rc.fillStyle=`hsl(${i},100%,50%)`;rc.fill();}
}
function drawPicker(){
  ctx.clearRect(0,0,SIZE,SIZE);
  ctx.drawImage(ringCanvas,0,0);                       // anillo cacheado (no se recalcula)
  // Marcador del tono actual sobre el anillo
  const hRad=(H/360)*Math.PI*2-Math.PI/2,rMid=(OUTER_R+INNER_R)/2;
  const rcx=CX+rMid*Math.cos(hRad),rcy=CY+rMid*Math.sin(hRad);
  ctx.beginPath();ctx.arc(rcx,rcy,RING/2-1,0,Math.PI*2);ctx.fillStyle=hslToHex(H,100,50);ctx.fill();ctx.strokeStyle="white";ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle="rgba(0,0,0,0.3)";ctx.lineWidth=1;ctx.stroke();
  // Cuadrado de saturación/luminosidad: sólo se regenera cuando cambia el tono (H).
  const sqW=Math.ceil(SQ_W),sqH=Math.ceil(SQ_W);
  if(slCacheH!==H){
    slImageData=ctx.createImageData(sqW,sqH);
    for(let py=0;py<sqH;py++){for(let px=0;px<sqW;px++){const[r,g,b]=hslToRgb(H,(px/SQ_W)*100,100-(py/SQ_W)*100);const idx=(py*sqW+px)*4;slImageData.data[idx]=r;slImageData.data[idx+1]=g;slImageData.data[idx+2]=b;slImageData.data[idx+3]=255;}}
    slCacheH=H;
  }
  ctx.putImageData(slImageData,SQ_X,SQ_Y);
  // Marcador de la selección S/L
  const scx=SQ_X+(S/100)*SQ_W,scy=SQ_Y+((100-L)/100)*SQ_W;
  ctx.beginPath();ctx.arc(scx,scy,7,0,Math.PI*2);ctx.fillStyle=currentHex();ctx.fill();ctx.strokeStyle="white";ctx.lineWidth=2.5;ctx.stroke();ctx.strokeStyle="rgba(0,0,0,0.4)";ctx.lineWidth=1;ctx.stroke();
}
function getXY(e){const rect=canvas.getBoundingClientRect();const cx=e.touches?e.touches[0].clientX:e.clientX;const cy=e.touches?e.touches[0].clientY:e.clientY;return[(cx-rect.left)*(SIZE/rect.width),(cy-rect.top)*(SIZE/rect.height)];}
function hitZone(x,y){const dx=x-CX,dy=y-CY,dist=Math.sqrt(dx*dx+dy*dy);if(dist>=INNER_R-6&&dist<=OUTER_R+6)return'ring';return'square';}
function applyRing(x,y){let a=Math.atan2(y-CY,x-CX)*180/Math.PI+90;if(a<0)a+=360;H=Math.round(a)%360;}
function applySquare(x,y){S=Math.round(clamp((x-SQ_X)/SQ_W,0,1)*100);L=Math.round(clamp(1-(y-SQ_Y)/SQ_W,0,1)*100);}
function onDown(e){e.preventDefault();const[x,y]=getXY(e);dragging=hitZone(x,y);dragging==='ring'?applyRing(x,y):applySquare(x,y);syncAll();}
// Durante el arrastre guardamos las coordenadas y aplicamos a lo sumo una vez por frame (rendimiento).
let rafPending=false, pendingXY=null;
function scheduleSync(){
  if(rafPending)return;
  rafPending=true;
  requestAnimationFrame(()=>{rafPending=false;if(pendingXY){dragging==='ring'?applyRing(...pendingXY):applySquare(...pendingXY);pendingXY=null;}syncAll();});
}
function onMove(e){if(!dragging)return;e.preventDefault();pendingXY=getXY(e);scheduleSync();}
function onUp(){dragging=null;}
function initPicker(){
  canvas=document.getElementById("picker-canvas");ctx=canvas.getContext("2d");
  const w=Math.min(canvas.parentElement.clientWidth-20,280);canvas.style.width=w+"px";canvas.style.height=w+"px";
  canvas.addEventListener("mousedown",onDown,{passive:false});canvas.addEventListener("mousemove",onMove,{passive:false});canvas.addEventListener("mouseup",onUp);canvas.addEventListener("mouseleave",onUp);
  canvas.addEventListener("touchstart",onDown,{passive:false});canvas.addEventListener("touchmove",onMove,{passive:false});canvas.addEventListener("touchend",onUp);
  buildRingCache();   // Prepara el anillo de tono una sola vez
  drawPicker();
}
function fromHslSliders(){H=+document.getElementById("s-h").value;S=+document.getElementById("s-hs").value;L=+document.getElementById("s-hl").value;syncAll();}
function fromRgbSliders(){[H,S,L]=rgbToHsl(+document.getElementById("s-r").value,+document.getElementById("s-g").value,+document.getElementById("s-b").value);syncAll();}
function fromHex(hex){if(isValidHex(hex)){[H,S,L]=hexToHsl(hex);syncAll();}}
function fromHexInput(val){let v=val.trim();if(v&&v[0]!=="#")v="#"+v;const err=document.getElementById("hex-error");if(isValidHex(v)){err.style.display="none";[H,S,L]=hexToHsl(v);syncAll();}else err.style.display=v.length>2?"block":"none";}
const TABS=["wheel","hsl","rgb","hex"];
function setTab(t){currentTab=t;document.querySelectorAll(".tab-btn").forEach((b,i)=>b.classList.toggle("active",TABS[i]===t));TABS.forEach(p=>document.getElementById("panel-"+p).style.display=p===t?"block":"none");}
function toggleHarmonies(){const l=document.getElementById("harmony-list");l.classList.toggle("open");document.getElementById("harmony-arrow").textContent=l.classList.contains("open")?"▲":"▼";}
function setHarmony(key){currentHarmony=key;document.getElementById("harmony-current").textContent=harmonies[key].label;document.getElementById("harmony-list").classList.remove("open");document.getElementById("harmony-arrow").textContent="▼";renderPalette();}
function renderRow(id,items){const row=document.getElementById(id);row.innerHTML="";items.forEach(item=>{const d=document.createElement("div");d.className="color-swatch"+(item.active?" active":"");d.style.background=item.hex;d.onclick=item.cb;row.appendChild(d);});}
function renderPalette(){
  const hex=currentHex(),tc=getTextColor(hex),palette=generatePalette(H,S,L,currentHarmony);
  const strip=document.getElementById("palette-strip");strip.innerHTML="";palette.forEach(c=>{const d=document.createElement("div");d.className="strip-chunk";d.style.background=c.hex;strip.appendChild(d);});
  const cards=document.getElementById("palette-cards");cards.innerHTML="";palette.forEach(c=>{const btn=document.createElement("button");btn.className="palette-card";btn.style.background=c.hex;btn.style.color=getTextColor(c.hex);btn.innerHTML=`<span class="plabel">${c.label}</span><span class="phex">${c.hex.toUpperCase()}</span>`;btn.onclick=()=>copyPaletteColor(c.hex,btn);cards.appendChild(btn);});
  const rD=[{pct:"60%",role:"Principal",tip:"Fondo, logo, elemento dominante",idx:0},{pct:"30%",role:"Secundario",tip:"Títulos, botones, destacados",idx:1},{pct:"10%",role:"Acento",tip:"Llamadas a la acción, detalles",idx:Math.min(2,palette.length-1)}];
  const rules=document.getElementById("rules");rules.innerHTML="";rD.forEach(r=>{const ph=palette[r.idx]?.hex||hex;rules.innerHTML+=`<div class="rule-row"><div class="rule-box" style="background:${ph};color:${getTextColor(ph)}">${r.pct}</div><div class="rule-info"><div class="role">${r.role}</div><div class="tip">${r.tip}</div></div></div>`;});
  document.getElementById("tip-box").style.borderLeftColor=hex;
  document.querySelectorAll(".harmony-btn").forEach(b=>{const active=b.dataset.key===currentHarmony;b.style.background=active?hex:"#f7f7f7";b.style.color=active?tc:"#444";});
  // Print button
  const pb=document.getElementById("print-btn");if(pb){pb.style.background=hex;pb.style.color=tc;}
  renderCbPreview();       // actualiza la simulación de daltonismo
}
function syncAll(){
  const hex=currentHex(),tc=getTextColor(hex),[r,g,b]=hexToRgb(hex),em=getEmotion(H);
  document.getElementById("hero").style.background=hex;
  document.getElementById("hero-overlay").style.background=`radial-gradient(ellipse at 75% 40%,${hslToHex((H+40)%360,S,Math.min(L+10,70))} 0%,transparent 65%)`;
  ["hero-sub","hero-title","hero-emoji","hero-emotion-name","hero-emotion-words","copy-hex-btn"].forEach(id=>{const el=document.getElementById(id);if(el)el.style.color=tc;});
  document.getElementById("hero-emoji").textContent=em.e;document.getElementById("hero-emotion-name").textContent=em.n;document.getElementById("hero-emotion-words").textContent=em.w;
  const hBtn=document.getElementById("copy-hex-btn");if(!hBtn.textContent.includes("Copiado"))hBtn.textContent=hex.toUpperCase();hBtn.style.background="rgba(255,255,255,0.22)";
  document.getElementById("circle-preview").style.background=hex;document.getElementById("circle-preview").style.boxShadow=`0 5px 22px ${hex}80`;document.getElementById("native-picker").value=hex;document.getElementById("rubro-text").textContent=em.rb;
  document.getElementById("s-h").value=H;document.getElementById("v-h").textContent=H+"°";
  document.getElementById("s-hs").value=S;document.getElementById("v-hs").textContent=S+"%";
  document.getElementById("s-hl").value=L;document.getElementById("v-hl").textContent=L+"%";
  document.getElementById("t-h").style.background=`linear-gradient(to right,hsl(0,${S}%,${L}%),hsl(60,${S}%,${L}%),hsl(120,${S}%,${L}%),hsl(180,${S}%,${L}%),hsl(240,${S}%,${L}%),hsl(300,${S}%,${L}%),hsl(360,${S}%,${L}%))`;
  document.getElementById("t-hs").style.background=`linear-gradient(to right,${hslToHex(H,0,L)},${hslToHex(H,100,L)})`;
  document.getElementById("t-hl").style.background=`linear-gradient(to right,#111,${hslToHex(H,S,50)},#fff)`;
  document.getElementById("hsl-display").textContent=`hsl(${H}°, ${S}%, ${L}%)`;
  document.getElementById("s-r").value=r;document.getElementById("v-r").textContent=r;
  document.getElementById("s-g").value=g;document.getElementById("v-g").textContent=g;
  document.getElementById("s-b").value=b;document.getElementById("v-b").textContent=b;
  document.getElementById("t-r").style.background=`linear-gradient(to right,${rgbToHex(0,g,b)},${rgbToHex(255,g,b)})`;
  document.getElementById("t-g").style.background=`linear-gradient(to right,${rgbToHex(r,0,b)},${rgbToHex(r,255,b)})`;
  document.getElementById("t-b").style.background=`linear-gradient(to right,${rgbToHex(r,g,0)},${rgbToHex(r,g,255)})`;
  document.getElementById("rgb-display").textContent=`rgb(${r}, ${g}, ${b})`;
  document.getElementById("hex-input").value=hex;document.getElementById("hex-input").style.borderColor=hex;document.getElementById("hex-preview-box").style.background=hex;
  document.querySelectorAll(".preset-btn").forEach(b=>b.classList.toggle("active",b.dataset.hex.toLowerCase()===hex.toLowerCase()));
  document.querySelectorAll(".quick-color").forEach(d=>d.classList.toggle("active",(d.dataset.hex||"").toLowerCase()===hex.toLowerCase()));
  renderRow("row-l",[8,18,30,45,58,70,82,93].map(lv=>({hex:hslToHex(H,S,lv),active:Math.abs(L-lv)<4,cb:()=>{L=lv;syncAll();}})));
  renderRow("row-s",[5,18,32,46,60,74,87,100].map(sv=>({hex:hslToHex(H,sv,L),active:Math.abs(S-sv)<6,cb:()=>{S=sv;syncAll();}})));
  renderRow("row-h",[0,45,90,135,180,225,270,315].map(hv=>({hex:hslToHex(hv,S,L),active:Math.abs(H-hv)<22||(H>338&&hv===0),cb:()=>{H=hv;syncAll();}})));
  drawPicker();renderPalette();
  updateContrast();        // recalcula legibilidad WCAG
  scheduleStateSave();     // persiste en localStorage + URL (con debounce)
}
const presets=[{name:"Panadería",hex:"#C0392B"},{name:"Belleza",hex:"#E91E8C"},{name:"Orgánico",hex:"#4CAF50"},{name:"Tech",hex:"#1565C0"},{name:"Arte",hex:"#7B1FA2"},{name:"Catering",hex:"#E65100"},{name:"Salud",hex:"#00897B"},{name:"Moda",hex:"#F48FB1"}];
const quickColors=["#FF6B35","#004E89","#1A936F","#C9B1FF","#F7B731","#E84393","#2D2D2D","#F5E6D3"];
function init(){
  const pW=document.getElementById("presets");presets.forEach(p=>{const b=document.createElement("button");b.className="preset-btn";b.dataset.hex=p.hex;b.style.background=p.hex;b.style.color=getTextColor(p.hex);b.textContent=p.name;b.onclick=()=>fromHex(p.hex);pW.appendChild(b);});
  const qW=document.getElementById("quick-colors");quickColors.forEach(c=>{const d=document.createElement("div");d.className="quick-color";d.dataset.hex=c;d.style.background=c;d.title=c;d.onclick=()=>fromHex(c);qW.appendChild(d);});
  const hL=document.getElementById("harmony-list");Object.entries(harmonies).forEach(([key,val])=>{const b=document.createElement("button");b.className="harmony-btn";b.dataset.key=key;b.innerHTML=`<span class="hlabel">${val.label}</span><span class="hdesc">${val.desc}</span>`;b.onclick=()=>setHarmony(key);hL.appendChild(b);});
  loadInitialState();   // recupera color y armonía desde la URL o localStorage
  document.getElementById("harmony-current").textContent=harmonies[currentHarmony].label;
  wireFeatureButtons(); // conecta copiar / compartir / guardar / PNG / foto / daltonismo
  renderSavedPalettes();
  initPicker();syncAll();
}
// ─── Generate PDF with jsPDF ──────────────────────────────────────────────────
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
function relLum(r,g,b){const a=[r,g,b].map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
// Relación de contraste entre dos colores (de 1:1 a 21:1).
function contrastRatio(hex1,hex2){const L1=relLum(...hexToRgb(hex1)),L2=relLum(...hexToRgb(hex2));const hi=Math.max(L1,L2),lo=Math.min(L1,L2);return (hi+0.05)/(lo+0.05);}
function ccBadge(ok){return ok?'<span class="cc-ok">✓</span>':'<span class="cc-no">✗</span>';}
function updateContrast(){
  const area=document.getElementById("contrast-area");if(!area)return;
  const hex=currentHex();
  const cw=contrastRatio(hex,"#ffffff"), cb=contrastRatio(hex,"#000000");
  const best=cw>=cb?"blanco":"negro", bestRatio=Math.max(cw,cb);
  const level=bestRatio>=7?"excelente (AAA)":bestRatio>=4.5?"buena (AA)":bestRatio>=3?"justa (sólo texto grande)":"insuficiente";
  area.innerHTML=
    `<div class="cc-row"><span class="cc-chip" style="background:${hex};color:#fff">Texto blanco</span><b>${cw.toFixed(2)}:1</b> ${ccBadge(cw>=4.5)} AA ${ccBadge(cw>=7)} AAA</div>`+
    `<div class="cc-row"><span class="cc-chip" style="background:${hex};color:#000">Texto negro</span><b>${cb.toFixed(2)}:1</b> ${ccBadge(cb>=4.5)} AA ${ccBadge(cb>=7)} AAA</div>`+
    `<div class="cc-note">Recomendado: <b>texto ${best}</b> — legibilidad ${level}.</div>`;
}

// ── Estado: persistencia (localStorage) + compartir por URL ─────
function getState(){return {h:H,s:S,l:L,arm:currentHarmony};}
function applyState(st){
  if(Number.isFinite(st.h))H=clamp(Math.round(st.h),0,359);
  if(Number.isFinite(st.s))S=clamp(Math.round(st.s),0,100);
  if(Number.isFinite(st.l))L=clamp(Math.round(st.l),0,100);
  if(st.arm&&harmonies[st.arm])currentHarmony=st.arm;
}
// Prioridad al cargar: parámetros de la URL > último estado guardado > valor por defecto.
function loadInitialState(){
  const p=new URLSearchParams(location.search);
  if(p.has("h")||p.has("s")||p.has("l")){
    const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
    applyState({h:clamp(+p.get("h"),0,359),s:clamp(+p.get("s"),0,100),l:clamp(+p.get("l"),5,95),arm:p.get("arm")});
    return;
  }
  const saved=AppStorage.readJson(AppStorage.KEYS.lastColor,null);if(saved)applyState(saved);
}
let saveT=null;
function scheduleStateSave(){
  clearTimeout(saveT);
  saveT=setTimeout(()=>{
    AppStorage.writeJson(AppStorage.KEYS.lastColor,getState());
    const p=new URLSearchParams({h:H,s:S,l:L,arm:currentHarmony});
    history.replaceState(null,"","?"+p.toString());   // refleja el estado en la URL sin recargar
  },400);
}
function shareURL(){
  const p=new URLSearchParams({h:H,s:S,l:L,arm:currentHarmony});
  copyToClipboard(location.origin+location.pathname+"?"+p.toString());
  showToast("🔗 Link de la paleta copiado");
}

// ── Paletas guardadas ──────────────────────────────────────────
function getSaved(){const data=AppStorage.readJson(AppStorage.KEYS.savedPalettes,[]);return Array.isArray(data)?data:[];}
function setSaved(a){return AppStorage.writeJson(AppStorage.KEYS.savedPalettes,a);}
function saveCurrentPalette(){
  const a=getSaved(),st=getState();
  if(a.some(s=>s.h===st.h&&s.s===st.s&&s.l===st.l&&s.arm===st.arm)){showToast("Ya tenías esta paleta guardada");return;}
  a.unshift(st);setSaved(a.slice(0,12));   // guardamos hasta 12
  renderSavedPalettes();showToast("💾 Paleta guardada");
  trackEvent("Guardar paleta", { armonia: currentHarmony });
}
function deleteSaved(i){const a=getSaved();a.splice(i,1);setSaved(a);renderSavedPalettes();}
function renderSavedPalettes(){
  const wrap=document.getElementById("saved-list");if(!wrap)return;
  const a=getSaved();wrap.innerHTML="";
  if(!a.length){wrap.innerHTML='<p class="saved-empty">Todavía no guardaste ninguna paleta. Tocá “Guardar” para empezar tu colección.</p>';return;}
  a.forEach((st,i)=>{
    const pal=generatePalette(st.h,st.s,st.l,st.arm);
    const item=document.createElement("div");item.className="saved-item";
    const strip=document.createElement("div");strip.className="saved-strip";strip.title="Cargar esta paleta";
    pal.forEach(c=>{const s=document.createElement("span");s.style.background=c.hex;strip.appendChild(s);});
    strip.addEventListener("click",()=>{applyState(st);document.getElementById("harmony-current").textContent=harmonies[currentHarmony].label;syncAll();showToast("Paleta cargada");});
    const del=document.createElement("button");del.className="saved-del";del.textContent="×";del.title="Eliminar";del.addEventListener("click",()=>deleteSaved(i));
    item.appendChild(strip);item.appendChild(del);wrap.appendChild(item);
  });
}

// ── Copiar la paleta en distintos formatos ─────────────────────
function copyHexList(){
  const pal=generatePalette(H,S,L,currentHarmony);
  copyToClipboard(pal.map(c=>c.hex.toUpperCase()).join("\n"));
  showToast("📋 Lista de HEX copiada");
}
function slug(t){return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");}
function copyCssVars(){
  const pal=generatePalette(H,S,L,currentHarmony),seen={};
  const lines=pal.map((c,i)=>{let name=slug(c.label)||("color-"+(i+1));if(seen[name])name+="-"+(i+1);seen[name]=1;return `  --${name}: ${c.hex.toUpperCase()};`;});
  copyToClipboard(":root {\n"+lines.join("\n")+"\n}");
  showToast("{ } Variables CSS copiadas");
}

// ── Exportar la paleta como imagen PNG (para redes) ─────────────
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
function handleImageFile(file){
  if(!file)return;
  const img=new Image();
  img.onload=()=>{const cols=extractPaletteFromImage(img);renderExtracted(cols);showToast(cols.length+" colores extraídos");URL.revokeObjectURL(img.src);};
  img.onerror=()=>showToast("No se pudo leer la imagen");
  img.src=URL.createObjectURL(file);
}
function extractPaletteFromImage(img){
  // Achicamos la imagen para procesar pocos píxeles y agrupamos por color (cuantización simple).
  const c=document.createElement("canvas"),scale=Math.min(120/img.width,120/img.height,1);
  c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));
  const cx=c.getContext("2d");cx.drawImage(img,0,0,c.width,c.height);
  const data=cx.getImageData(0,0,c.width,c.height).data,buckets={};
  for(let i=0;i<data.length;i+=4){
    if(data[i+3]<125)continue;                       // ignora píxeles transparentes
    const r=data[i],g=data[i+1],b=data[i+2];
    const key=((r>>4)<<8)|((g>>4)<<4)|(b>>4);        // agrupa en bloques de color
    (buckets[key]||(buckets[key]=[0,0,0,0]));const bk=buckets[key];bk[0]+=r;bk[1]+=g;bk[2]+=b;bk[3]++;
  }
  const list=Object.values(buckets).map(b=>[Math.round(b[0]/b[3]),Math.round(b[1]/b[3]),Math.round(b[2]/b[3]),b[3]]).sort((a,b)=>b[3]-a[3]);
  const chosen=[];
  for(const col of list){
    if(chosen.length>=6)break;
    // Sólo sumamos colores suficientemente distintos a los ya elegidos.
    if(chosen.every(o=>Math.abs(o[0]-col[0])+Math.abs(o[1]-col[1])+Math.abs(o[2]-col[2])>60))chosen.push(col);
  }
  return chosen.map(c=>rgbToHex(c[0],c[1],c[2]));
}
function renderExtracted(cols){
  const wrap=document.getElementById("extracted-colors");wrap.innerHTML="";
  cols.forEach(hex=>{const d=document.createElement("div");d.className="quick-color";d.dataset.hex=hex;d.style.background=hex;d.title=hex+" — tocá para usar";d.addEventListener("click",()=>fromHex(hex));wrap.appendChild(d);});
}

// ── Simulación de daltonismo ───────────────────────────────────
// Matrices de aproximación (Viénot) para los tres tipos más comunes.
const CB_MATRICES={
  protanopia:[[0.567,0.433,0],[0.558,0.442,0],[0,0.242,0.758]],
  deuteranopia:[[0.625,0.375,0],[0.7,0.3,0],[0,0.3,0.7]],
  tritanopia:[[0.95,0.05,0],[0,0.433,0.567],[0,0.475,0.525]]
};
function simulateCb(hex,type){
  const m=CB_MATRICES[type];if(!m)return hex;
  const[r,g,b]=hexToRgb(hex).map(v=>v/255);
  return rgbToHex((m[0][0]*r+m[0][1]*g+m[0][2]*b)*255,(m[1][0]*r+m[1][1]*g+m[1][2]*b)*255,(m[2][0]*r+m[2][1]*g+m[2][2]*b)*255);
}
function renderCbPreview(){
  const sel=document.getElementById("cb-select"),strip=document.getElementById("cb-strip");
  if(!sel||!strip)return;
  const mode=sel.value,pal=generatePalette(H,S,L,currentHarmony);
  strip.innerHTML="";
  pal.forEach(c=>{const s=document.createElement("span");s.style.background=simulateCb(c.hex,mode);strip.appendChild(s);});
}

// ── Conexión de los botones de las funciones nuevas ────────────
function wireFeatureButtons(){
  document.getElementById("btn-copy-hex").addEventListener("click",copyHexList);
  document.getElementById("btn-copy-css").addEventListener("click",copyCssVars);
  document.getElementById("btn-share").addEventListener("click",shareURL);
  document.getElementById("btn-save").addEventListener("click",saveCurrentPalette);
  document.getElementById("btn-png").addEventListener("click",exportPNG);
  document.getElementById("img-input").addEventListener("change",e=>handleImageFile(e.target.files[0]));
  document.getElementById("cb-select").addEventListener("change",renderCbPreview);
}

window.addEventListener("load",init);
