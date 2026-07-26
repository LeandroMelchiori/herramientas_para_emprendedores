// ── LocalStorage ──
var FAVS_KEY = AppStorage.KEYS.toolFavorites;
function getFavs() { var data=AppStorage.readJson(FAVS_KEY,[]); return Array.isArray(data)?data:[]; }
function setFavs(arr) { return AppStorage.writeJson(FAVS_KEY,arr); }
function isFav(key) { return getFavs().includes(key); }
function toggleFav(key) {
  var favs = getFavs();
  favs = favs.includes(key) ? favs.filter(function(k){ return k !== key; }) : favs.concat([key]);
  setFavs(favs);
  refreshStars();
  if (activeCat === 'favs') applyFilters();
}

// ── Stars ──
function refreshStars() {
  document.querySelectorAll('.fav-btn').forEach(function(btn) {
    var on = isFav(btn.dataset.key);
    btn.textContent = on ? '★' : '☆';
    btn.title = on ? 'Quitar de favoritas' : 'Guardar en favoritas';
    btn.classList.toggle('active', on);
  });
  var count = getFavs().length;
  var favBtn = document.getElementById('favs-filter-btn');
  if (favBtn) favBtn.textContent = count > 0 ? ('⭐ Favoritas (' + count + ')') : '⭐ Favoritas';
}

// ── Filter state ──
var FILTER_KEY = AppStorage.KEYS.toolFilter;
var activeCat  = 'all';
var searchTerm = '';

function saveFilterState() {
  AppStorage.writeJson(FILTER_KEY,{ cat: activeCat, q: searchTerm });
}

function filterCat(cat, btn) {
  activeCat = cat;
  document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  saveFilterState();
  applyFilters();
}

function onSearch(val) {
  searchTerm = val;
  saveFilterState();
  applyFilters();
}

function applyFilters() {
  var term = searchTerm.toLowerCase().trim();
  var visibleCount = 0;
  document.querySelectorAll('.tool-card').forEach(function(card) {
    var key = card.dataset.key || '';
    var cat = (card.closest('.category') || {}).dataset;
    var catKey = cat ? cat.cat : '';
    var catMatch = activeCat === 'all' || activeCat === catKey || (activeCat === 'favs' && isFav(key));
    var searchable = [
      (card.querySelector('.tool-name') || {}).textContent,
      (card.querySelector('.tool-tagline') || {}).textContent,
      (card.querySelector('.tool-desc') || {}).textContent,
    ].join(' ').toLowerCase();
    var searchMatch = !term || searchable.includes(term);
    var visible = catMatch && searchMatch;
    card.style.display = visible ? '' : 'none';
    if (visible) visibleCount++;
  });
  // Show/hide category sections
  document.querySelectorAll('.category').forEach(function(cat) {
    var hasVisible = Array.from(cat.querySelectorAll('.tool-card')).some(function(c){ return c.style.display !== 'none'; });
    cat.style.display = hasVisible ? '' : 'none';
  });
  // No results
  var nr = document.getElementById('no-results');
  if (nr) nr.style.display = visibleCount === 0 ? '' : 'none';
}

// ── Dynamic counters ──
function updateCounters() {
  var total = document.querySelectorAll('.tool-card').length;
  var cats  = document.querySelectorAll('.category').length;
  var t = document.getElementById('meta-total');
  var c = document.getElementById('meta-cats');
  if (t) t.textContent = total;
  if (c) c.textContent = cats;
}

// ── Quiz ──
var quizAnswers = {};
var QUIZ_RECS = {
  diseno:  { mobile: ['canva','remove-bg','adobe-express','flaticon'],       desktop: ['canva','photopea','remove-bg','adobe-express'],          both: ['canva','remove-bg','photopea','adobe-express'] },
  video:   { mobile: ['edits','capcut','inshot','pexels'],                   desktop: ['clipchamp','capcut','pexels','canva'],                    both: ['edits','capcut','clipchamp','pexels'] },
  ventas:  { mobile: ['whatsapp-business','mercadopago','tiendanube','linktree'], desktop: ['tiendanube','mercadoshops','mercadopago','google-business'], both: ['whatsapp-business','mercadopago','tiendanube','mercadoshops'] },
  gestion: { mobile: ['meta-bs','whatsapp-business','notion','linktree'],    desktop: ['meta-bs','notion','google-business','google-trends'],     both: ['meta-bs','notion','google-business','linktree'] },
  ia:      { mobile: ['claude','chatgpt','gemini','canva'],                  desktop: ['claude','chatgpt','gemini','notion'],                     both: ['claude','chatgpt','gemini','canva'] }
};

function toggleQuiz() {
  var panel = document.getElementById('quiz-panel');
  var btn   = document.getElementById('quiz-btn');
  panel.hidden = !panel.hidden;
  btn.classList.toggle('open', !panel.hidden);
  btn.setAttribute('aria-expanded', String(!panel.hidden));
  if (!panel.hidden) {
    renderQuizStep(1);
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    resetQuizHighlight();
  }
}

function renderQuizStep(step) {
  var panel = document.getElementById('quiz-panel');
  var q1opts = [
    { key:'diseno',  label:'🎨 Diseñar materiales' },
    { key:'video',   label:'🎬 Crear videos y Reels' },
    { key:'ventas',  label:'🛒 Vender por internet' },
    { key:'gestion', label:'📊 Organizar mi negocio' },
    { key:'ia',      label:'🤖 Empezar a usar IA' }
  ];
  var q2opts = [
    { key:'mobile',  label:'📱 Solo el celular' },
    { key:'desktop', label:'💻 La computadora' },
    { key:'both',    label:'📱💻 Los dos' }
  ];
  var opts = step === 1 ? q1opts : q2opts;
  var label = step === 1 ? '¿Cuál es tu mayor desafío ahora?' : '¿Desde dónde trabajás más?';
  var html = '<div class="quiz-q">' + step + '/2 — ' + label + '</div><div class="quiz-opts">';
  opts.forEach(function(o) {
    html += '<button class="quiz-opt" onclick="selectQuizOpt(' + step + ',\'' + o.key + '\',this)">' + o.label + '</button>';
  });
  html += '</div>';
  if (step === 2) html += '<button class="quiz-back" onclick="renderQuizStep(1)">← Volver</button>';
  panel.innerHTML = html;
}

function selectQuizOpt(step, key, btn) {
  btn.closest('.quiz-opts').querySelectorAll('.quiz-opt').forEach(function(b){ b.classList.remove('selected'); });
  btn.classList.add('selected');
  quizAnswers['q' + step] = key;
  if (step === 1) { setTimeout(function(){ renderQuizStep(2); }, 220); }
  else { setTimeout(showQuizResults, 220); }
}

function showQuizResults() {
  var recs = (QUIZ_RECS[quizAnswers.q1] || {})[quizAnswers.q2] || [];
  // Show all cards, reset filters
  activeCat = 'all'; searchTerm = '';
  document.getElementById('search-input').value = '';
  document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); });
  document.querySelector('.filter-btn').classList.add('active');
  document.querySelectorAll('.category').forEach(function(c){ c.style.display = ''; });
  document.querySelectorAll('.tool-card').forEach(function(c){ c.style.display = ''; });
  document.getElementById('no-results').style.display = 'none';
  // Highlight
  document.querySelectorAll('.tool-card').forEach(function(card) {
    var isRec = recs.includes(card.dataset.key);
    card.classList.toggle('quiz-recommended', isRec);
    card.classList.toggle('quiz-dimmed', !isRec);
  });
  var panel = document.getElementById('quiz-panel');
  panel.innerHTML = '<div class="quiz-results">'
    + '<div class="quiz-results-title">✨ Estas son tus herramientas recomendadas</div>'
    + '<div class="quiz-results-sub">Las demás herramientas siguen disponibles abajo.</div>'
    + '<button class="quiz-reset" onclick="resetQuiz()">Ver todas sin resaltar</button>'
    + '</div>';
  var first = document.querySelector('.tool-card.quiz-recommended');
  if (first) setTimeout(function(){ first.scrollIntoView({ behavior:'smooth', block:'center' }); }, 100);
}

function resetQuizHighlight() {
  document.querySelectorAll('.tool-card').forEach(function(card) {
    card.classList.remove('quiz-recommended', 'quiz-dimmed');
  });
}

function resetQuiz() {
  resetQuizHighlight();
  var panel = document.getElementById('quiz-panel');
  panel.hidden = true;
  document.getElementById('quiz-btn').classList.remove('open');
  document.getElementById('quiz-btn').setAttribute('aria-expanded', 'false');
  quizAnswers = {};
}

// ── Init ──
function init() {
  // Add star buttons to all cards
  document.querySelectorAll('.tool-card').forEach(function(card) {
    var key = card.dataset.key;
    if (!key) return;
    var footer = card.querySelector('.tool-footer');
    if (!footer) return;
    var btn = document.createElement('button');
    btn.className = 'fav-btn';
    btn.dataset.key = key;
    btn.setAttribute('aria-label', 'Guardar en favoritas');
    btn.textContent = '☆';
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleFav(key);
      if (window.trackEvent) window.trackEvent('Favorita herramienta', { nombre: key });
    });
    var visitBtn = footer.querySelector('.visit-btn');
    footer.insertBefore(btn, visitBtn);
  });
  refreshStars();
  updateCounters();

  // Restaurar filtro y búsqueda guardados
  try {
    var saved = AppStorage.readJson(FILTER_KEY,null);
    if (saved) {
      if (saved.q) {
        searchTerm = saved.q;
        var searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = saved.q;
      }
      if (saved.cat && saved.cat !== 'all') {
        activeCat = saved.cat;
        var activeBtn = document.querySelector('.filter-btn[onclick*=\'' + saved.cat + '\']');
        if (activeBtn) {
          document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); });
          activeBtn.classList.add('active');
        }
      }
      if (saved.cat || saved.q) applyFilters();
    }
  } catch(e) {}
}

document.addEventListener('DOMContentLoaded', init);
