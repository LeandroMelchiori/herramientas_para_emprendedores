function copyPrompt(btn) {
  const card = btn.closest('.prompt-card');
  const sections = card.querySelectorAll('.ps');
  const badges = {'ps-rol':'ROL','ps-ctx':'CONTEXTO','ps-task':'TAREA','ps-fmt':'FORMATO','ps-tone':'TONO'};
  let text = '';
  sections.forEach(sec => {
    const key = [...sec.classList].find(c => badges[c]);
    if (!key) return;
    let content = '';
    sec.querySelectorAll('.ps-text')[0].childNodes.forEach(n => {
      content += n.textContent;
    });
    text += '## ' + badges[key] + '\n' + content.trim() + '\n\n';
  });
  text = text.trim();

  const doCopy = t => {
    if (navigator.clipboard && navigator.clipboard.writeText)
      return navigator.clipboard.writeText(t).catch(() => fb(t));
    fb(t);
  };
  const fb = t => {
    const ta = document.createElement('textarea');
    ta.value = t; ta.style.cssText = 'position:fixed;top:-9999px;opacity:0;';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
  };

  doCopy(text);
  btn.textContent = '✓ Copiado!'; btn.classList.add('copied');
  showToast('✓ Prompt copiado — pegalo en Claude, ChatGPT o Gemini');
  trackEvent('Copiar prompt', { titulo: (card.querySelector('.prompt-title')?.textContent || '').slice(0,100), categoria: card.closest('.category')?.dataset.cat || 'mine' });
  setTimeout(() => { btn.textContent = '📋 Copiar'; btn.classList.remove('copied'); }, 2000);
}

function filterCat(cat, btn) {
  activeCat = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Reflejar la categoría elegida en el botón desplegable y cerrar el panel
  const cur = document.getElementById('filter-current');
  if (cur && btn) { const parts = btn.textContent.trim().split(' '); cur.textContent = parts.slice(1).join(' ') || parts[0]; }
  closeFilterPanel();
  applyFilters();
}
function closeFilterPanel(){
  const fp = document.getElementById('filter-panel'), ft = document.getElementById('filter-toggle');
  if (fp) fp.hidden = true;
  if (ft) ft.setAttribute('aria-expanded','false');
}

let toastT;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ═══════════════════════════════════════════════════════════════
   BÚSQUEDA · FAVORITOS · MIS PROMPTS  (todo guardado con localStorage)
   ═══════════════════════════════════════════════════════════════ */
let activeCat = 'all';
let searchTerm = '';
let editingId = null;            // id del prompt propio que se está editando

const FAV_KEY  = AppStorage.KEYS.promptFavorites;      // claves de prompts marcados como favoritos
const MINE_KEY = AppStorage.KEYS.customPrompts;      // prompts creados por el usuario

// — Utilidades —
function slug(t){return (t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
function esc(s){return (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
// Resalta los [corchetes] en cian, igual que en los prompts originales (sobre texto ya escapado).
function fmtText(s){return esc(s).replace(/\[([^\]]+)\]/g,'<em class="ph">[$1]</em>');}

// — Favoritos —
function getFavs(){const data=AppStorage.readJson(FAV_KEY,[]);return Array.isArray(data)?data:[];}
function setFavs(a){return AppStorage.writeJson(FAV_KEY,a);}
function isFav(k){return getFavs().includes(k);}
function toggleFav(k){const a=getFavs(),i=a.indexOf(k);i>=0?a.splice(i,1):a.push(k);setFavs(a);}

// — Prompts propios —
function getMine(){const data=AppStorage.readJson(MINE_KEY,[]);return Array.isArray(data)?data:[];}
function setMine(a){return AppStorage.writeJson(MINE_KEY,a);}

// — Filtrado combinado: categoría + búsqueda —
function applyFilters(){
  const term = searchTerm.trim().toLowerCase();
  let totalVisible = 0;
  document.querySelectorAll('.category').forEach(cat=>{
    const parentCat = cat.dataset.cat;
    let anyVisible = false;
    cat.querySelectorAll('.prompt-card').forEach(card=>{
      const catMatch = activeCat==='all'
        || (activeCat==='favs' && isFav(card.dataset.key))
        || (activeCat!=='favs' && parentCat===activeCat);
      const textMatch = !term || card.textContent.toLowerCase().includes(term);
      const show = catMatch && textMatch;
      card.style.display = show ? '' : 'none';
      if(show){ anyVisible = true; totalVisible++; }
    });
    // "Mis Prompts" se muestra aunque esté vacía (para poder crear), salvo al buscar o en otra categoría.
    const isMine = parentCat==='mine';
    cat.style.display = (isMine && (activeCat==='all'||activeCat==='mine') && !term) ? '' : (anyVisible ? '' : 'none');
  });
  // Mensaje de "sin resultados"
  const nr = document.getElementById('no-results');
  if(nr){
    if(totalVisible===0 && activeCat==='favs' && !term){
      nr.textContent='Todavía no marcaste favoritos. Tocá la ☆ en cualquier prompt para guardarlo acá.'; nr.style.display='block';
    } else if(totalVisible===0 && term){
      nr.textContent='No se encontraron prompts con “'+searchTerm.trim()+'”.'; nr.style.display='block';
    } else { nr.style.display='none'; }
  }
}

// — Estrella de favorito en cada tarjeta —
function addStarButton(card){
  const footer = card.querySelector('.prompt-footer');
  if(!footer || footer.querySelector('.fav-btn')) return;
  const b = document.createElement('button');
  b.className='fav-btn'; b.type='button'; b.title='Guardar en favoritos'; b.setAttribute('aria-label','Favorito');
  b.addEventListener('click',()=>{ toggleFav(card.dataset.key); refreshStars(); if(activeCat==='favs') applyFilters(); });
  footer.insertBefore(b, footer.querySelector('.copy-btn'));
}
function refreshStars(){
  document.querySelectorAll('.prompt-card').forEach(card=>{
    const b = card.querySelector('.fav-btn'); if(!b) return;
    const f = isFav(card.dataset.key);
    b.textContent = f ? '★' : '☆';
    b.classList.toggle('on', f);
  });
}

// — Contadores dinámicos por categoría —
function updateCounts(){
  document.querySelectorAll('.category').forEach(cat=>{
    const n = cat.querySelectorAll('.prompt-card').length;
    const c = cat.querySelector('.cat-count');
    if(c) c.textContent = n + (n===1 ? ' prompt' : ' prompts');
  });
}

// — Tarjeta de un prompt propio —
function buildMineCard(p){
  const card = document.createElement('div');
  card.className='prompt-card';
  card.dataset.key = 'm:'+p.id;
  const secs = [['rol','Rol',p.rol],['ctx','Contexto',p.ctx],['task','Tarea',p.task],['fmt','Formato',p.fmt],['tone','Tono',p.tone]].filter(s=>s[2] && s[2].trim());
  card.innerHTML =
    '<div class="prompt-header"><div class="prompt-label">'+esc(p.label||'Mi prompt')+'</div>'+
    '<div class="prompt-title">'+esc(p.title)+'</div></div>'+
    '<div class="prompt-sections">'+
      secs.map(s=>'<div class="ps ps-'+s[0]+'"><span class="ps-badge">'+s[1]+'</span><span class="ps-text">'+fmtText(s[2])+'</span></div>').join('')+
    '</div>'+
    '<div class="prompt-footer"><div class="prompt-tip">✍️ Prompt propio</div>'+
      '<button class="fav-btn" type="button" aria-label="Favorito"></button>'+
      '<button class="mine-edit" type="button" title="Editar">✎</button>'+
      '<button class="mine-del" type="button" title="Eliminar">🗑</button>'+
      '<button class="copy-btn" onclick="copyPrompt(this)">📋 Copiar</button>'+
    '</div>';
  card.querySelector('.fav-btn').addEventListener('click',()=>{ toggleFav(card.dataset.key); refreshStars(); if(activeCat==='favs') applyFilters(); });
  card.querySelector('.mine-edit').addEventListener('click',()=>openForm(p.id));
  card.querySelector('.mine-del').addEventListener('click',()=>deleteMine(p.id));
  return card;
}
function renderMine(){
  const list = document.getElementById('mine-list'); if(!list) return;
  const arr = getMine(); list.innerHTML='';
  if(!arr.length){
    list.innerHTML = '<p class="mine-empty">Todavía no creaste prompts propios. Tocá “➕ Crear prompt” y armá el tuyo con la estructura de 5 partes — te queda guardado en este dispositivo.</p>';
  } else {
    arr.forEach(p=>list.appendChild(buildMineCard(p)));
  }
  refreshStars(); updateCounts();
}

// — Formulario crear / editar —
const FIELDS = ['label','title','rol','ctx','task','fmt','tone'];
function openForm(id){
  editingId = id || null;
  const data = id ? getMine().find(p=>p.id===id) : null;
  FIELDS.forEach(f=>{ const el=document.getElementById('f-'+f); if(el) el.value = data ? (data[f]||'') : ''; });
  const form = document.getElementById('mine-form');
  form.hidden = false;
  document.getElementById('btn-save-prompt').textContent = id ? 'Guardar cambios' : 'Guardar prompt';
  form.scrollIntoView({behavior:'smooth', block:'center'});
  document.getElementById('f-title').focus();
}
function closeForm(){ document.getElementById('mine-form').hidden = true; editingId = null; }
function saveForm(){
  const get = f => document.getElementById('f-'+f).value.trim();
  if(!get('title')){ showToast('⚠ Poné al menos un título'); document.getElementById('f-title').focus(); return; }
  const arr = getMine();
  if(editingId){
    const p = arr.find(x=>x.id===editingId);
    if(p) FIELDS.forEach(f=>p[f]=get(f));
  } else {
    const obj = { id: Date.now().toString(36) };
    FIELDS.forEach(f=>obj[f]=get(f));
    arr.unshift(obj);
    trackEvent('Crear prompt propio');
  }
  setMine(arr); renderMine(); closeForm(); applyFilters();
  showToast('✓ Prompt guardado');
}
function deleteMine(id){
  if(!confirm('¿Eliminar este prompt?')) return;
  setMine(getMine().filter(p=>p.id!==id));
  renderMine(); applyFilters();
  showToast('Prompt eliminado');
}

// — Exportar / importar (respaldo de los prompts propios) —
function exportMine(){
  const arr = getMine();
  if(!arr.length){ showToast('No tenés prompts propios para exportar'); return; }
  const blob = new Blob([JSON.stringify(arr,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='mis-prompts.json'; a.click();
  URL.revokeObjectURL(url);
  showToast('⬇ Prompts exportados');
}
function importMine(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(reader.result);
      if(!Array.isArray(data)) throw new Error('formato');
      const arr = getMine();
      data.forEach(d=>{ if(d && d.title){ const o={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6)}; FIELDS.forEach(f=>o[f]=typeof d[f]==='string'?d[f]:''); arr.unshift(o); } });
      setMine(arr); renderMine(); applyFilters();
      showToast('⬆ Prompts importados');
    }catch(e){ showToast('⚠ Archivo inválido'); }
  };
  reader.readAsText(file);
}

// — Inicialización —
function initGuide(){
  // Clave estable + estrella de favorito para cada prompt original
  document.querySelectorAll('.category .prompt-card').forEach(card=>{
    if(card.dataset.key) return;
    const label = card.querySelector('.prompt-label')?.textContent||'';
    const title = card.querySelector('.prompt-title')?.textContent||'';
    card.dataset.key = 'b:'+slug(label+'-'+title);
    addStarButton(card);
  });
  renderMine();
  // Buscador
  const si = document.getElementById('search-input');
  if(si) si.addEventListener('input', e=>{ searchTerm = e.target.value; applyFilters(); });
  // Desplegable de categorías
  const ft = document.getElementById('filter-toggle'), fp = document.getElementById('filter-panel');
  ft.addEventListener('click', e=>{ e.stopPropagation(); fp.hidden = !fp.hidden; ft.setAttribute('aria-expanded', String(!fp.hidden)); });
  document.addEventListener('click', e=>{ if(!fp.hidden && !fp.contains(e.target) && !ft.contains(e.target)) closeFilterPanel(); });
  // Botones de "Mis Prompts" — el botón Crear abre/cierra el formulario
  document.getElementById('btn-new-prompt').addEventListener('click',()=>{
    const f = document.getElementById('mine-form');
    f.hidden ? openForm() : closeForm();
  });
  document.getElementById('btn-save-prompt').addEventListener('click',saveForm);
  document.getElementById('btn-cancel-prompt').addEventListener('click',closeForm);
  document.getElementById('btn-export').addEventListener('click',exportMine);
  document.getElementById('import-input').addEventListener('change',e=>importMine(e.target.files[0]));
  refreshStars(); updateCounts(); applyFilters();
}
initGuide();
