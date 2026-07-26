const {
  hslToRgb, rgbToHex, hslToHex, hexToRgb, rgbToHsl, hexToHsl,
  isValidHex, getTextColor, clamp, getEmotion, harmonies,
  generatePalette, contrastRatio, simulateCb,
} = AppColor;

function currentHex(){return hslToHex(H,S,L);}
let H=25,S=72,L=55,currentHarmony="analogos",currentTab="wheel";
const copyToClipboard = AppUI.copyText;
function showToast(message) { AppUI.showToast('toast', message, 2000); }
function copyColor(hex){copyToClipboard(hex);showToast("✓ "+hex.toUpperCase()+" copiado");}
function copyHeroHex(){const hex=currentHex();copyColor(hex);const btn=document.getElementById("copy-hex-btn");const o=btn.textContent;btn.textContent="✓ Copiado!";setTimeout(()=>btn.textContent=o,1500);}
function copyPaletteColor(hex,btn){copyColor(hex);const s=btn.querySelector(".phex");const o=s.textContent;s.textContent="✓ Copiado!";setTimeout(()=>s.textContent=o,1500);}
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
const slug = AppUI.slugify;
function copyCssVars(){
  const pal=generatePalette(H,S,L,currentHarmony),seen={};
  const lines=pal.map((c,i)=>{let name=slug(c.label)||("color-"+(i+1));if(seen[name])name+="-"+(i+1);seen[name]=1;return `  --${name}: ${c.hex.toUpperCase()};`;});
  copyToClipboard(":root {\n"+lines.join("\n")+"\n}");
  showToast("{ } Variables CSS copiadas");
}

// ── Exportar la paleta como imagen PNG (para redes) ─────────────
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
