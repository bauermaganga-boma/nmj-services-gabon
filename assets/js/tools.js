/* Outils de gestion NMJ Services — données de démonstration, sans serveur. */
(function () {
  'use strict';
  var WA = '241074664764';
  function wa(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  function $(id) { return document.getElementById(id); }
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function addBusiness(d, n) { var x = new Date(d); while (n > 0) { x.setDate(x.getDate() + 1); if (x.getDay() !== 0 && x.getDay() !== 6) n--; } return x; }
  function dateFr(d) { return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); }
  function dateShort(d) { return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }
  var today = new Date(); today.setHours(0, 0, 0, 0);

  /* ---------- Onglets ---------- */
  var tabs = document.querySelectorAll('.tab');
  function selectTab(name) {
    tabs.forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    document.querySelectorAll('.tpanel').forEach(function (p) { p.hidden = p.id !== 'p-' + name; });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { selectTab(t.dataset.tab); });
    t.addEventListener('keydown', function (e) {
      var list = Array.prototype.slice.call(tabs), i = list.indexOf(t);
      if (e.key === 'ArrowRight') { list[(i + 1) % list.length].focus(); }
      if (e.key === 'ArrowLeft') { list[(i - 1 + list.length) % list.length].focus(); }
    });
  });

  /* ---------- 1. Suivi de chantiers ---------- */
  var PROJECTS = [
    { id: 1, name: 'Bâtiment R+2 — bureaux et ateliers', loc: 'Owendo', cat: 'civil', catLabel: 'Génie civil', progress: 68, budget: 64, phase: 'Dalle du 2e niveau', next: 'Coulage plancher haut', nextIn: 6, team: 14, safe: 212, status: 'ok',
      steps: ['Fondations', 'Gros œuvre RDC et R+1', 'Plancher R+2', 'Second œuvre', 'Réception'] },
    { id: 2, name: 'Poste HTA/BT et distribution — usine', loc: 'Zone industrielle, Libreville', cat: 'elec', catLabel: 'Électricité industrielle', progress: 45, budget: 51, phase: 'Pose des cellules HTA', next: 'Essais à vide du transformateur', nextIn: 11, team: 9, safe: 340, status: 'warn',
      steps: ['Études et plans', 'Génie civil du poste', 'Pose des équipements', 'Raccordement et essais', 'Mise en service'] },
    { id: 3, name: 'Centrale solaire 30 kWc + batteries', loc: 'Entrepôt, Akanda', cat: 'enr', catLabel: 'Énergie renouvelable', progress: 82, budget: 78, phase: 'Raccordement onduleurs', next: 'Mise en service et formation', nextIn: 4, team: 6, safe: 128, status: 'ok',
      steps: ['Dimensionnement', 'Fourniture du matériel', 'Pose des panneaux', 'Raccordement et batteries', 'Mise en service'] },
    { id: 4, name: 'Mise en conformité — immeuble de bureaux', loc: 'Centre-ville, Libreville', cat: 'conf', catLabel: 'Conformité', progress: 30, budget: 22, phase: 'Relevés et diagnostic', next: 'Remise du rapport d\'inspection', nextIn: 8, team: 4, safe: 95, status: 'ok',
      steps: ['Diagnostic NF C 15-100', 'Rapport d\'inspection', 'Levée des réserves', 'Contre-visite', 'Attestation'] }
  ];
  var BADGE = { ok: ['badge--ok', 'Dans les temps'], warn: ['badge--warn', 'À surveiller'], late: ['badge--late', 'En retard'] };
  var list = $('proj-list'), detail = $('proj-detail');
  var selected = 0, filter = 'all';

  function renderKpis() {
    var avg = Math.round(PROJECTS.reduce(function (a, p) { return a + p.progress; }, 0) / PROJECTS.length);
    var team = PROJECTS.reduce(function (a, p) { return a + p.team; }, 0);
    var watch = PROJECTS.filter(function (p) { return p.status !== 'ok'; }).length;
    $('kpis').innerHTML =
      '<div class="kpi"><small>Chantiers actifs</small><b>' + PROJECTS.length + '</b><span>en cours</span></div>' +
      '<div class="kpi"><small>Avancement moyen</small><b>' + avg + ' %</b><span>tous chantiers</span></div>' +
      '<div class="kpi"><small>Équipes mobilisées</small><b>' + team + '</b><span>techniciens sur site</span></div>' +
      '<div class="kpi"><small>Points d\'attention</small><b>' + watch + '</b><span>à suivre cette semaine</span></div>';
  }

  function renderList() {
    list.innerHTML = '';
    PROJECTS.forEach(function (p, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'proj' + (i === selected ? ' is-selected' : '');
      b.hidden = !(filter === 'all' || p.cat === filter);
      b.innerHTML = '<div class="proj__top"><div><span class="proj__name">' + p.name + '</span><span class="proj__loc">' + p.loc + '</span></div>' +
        '<span class="badge ' + BADGE[p.status][0] + '">' + BADGE[p.status][1] + '</span></div>' +
        '<div class="proj__bar"><i data-w="' + p.progress + '"></i></div>' +
        '<div class="proj__meta"><span>' + p.phase + '</span><span>' + p.progress + ' %</span></div>';
      b.addEventListener('click', function () { selected = i; renderList(); renderDetail(); if (window.innerWidth <= 1080) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
      li.appendChild(b);
      list.appendChild(li);
    });
    requestAnimationFrame(function () {
      list.querySelectorAll('.proj__bar i').forEach(function (el) { el.style.width = el.dataset.w + '%'; });
    });
  }

  function renderDetail() {
    var p = PROJECTS[selected];
    var n = p.steps.length, done = Math.floor(p.progress / (100 / n));
    if (done >= n) done = n - 1;
    var steps = p.steps.map(function (s, i) {
      var cls = i < done ? 'is-done' : (i === done ? 'is-now' : '');
      return '<li class="' + cls + '">' + s + (i === done ? '<small>En cours — ' + p.phase.toLowerCase() + '</small>' : '') + '</li>';
    }).join('');
    detail.innerHTML =
      '<h3>' + p.name + '</h3><p class="sub">' + p.catLabel + ' · ' + p.loc + '</p>' +
      '<div class="pd-grid">' +
      '<div><small>Avancement</small><b>' + p.progress + ' %</b></div>' +
      '<div><small>Budget consommé</small><b>' + p.budget + ' %</b></div>' +
      '<div><small>Prochaine échéance</small><b>' + dateShort(addDays(today, p.nextIn)) + '</b></div>' +
      '<div><small>Sans accident</small><b>' + p.safe + ' jours</b></div></div>' +
      '<ol class="timeline">' + steps + '</ol>' +
      '<p style="margin:0 0 1rem;font-weight:700;color:var(--brown)">Prochaine étape : ' + p.next + '</p>' +
      '<a class="btn btn--wa btn--block" target="_blank" rel="noopener" href="' + wa('Bonjour NMJ Services, je souhaite un point d\'avancement sur le chantier « ' + p.name + ' ».') + '">Demander un point sur WhatsApp</a>';
  }

  document.querySelectorAll('#proj-filters .chip').forEach(function (c) {
    c.addEventListener('click', function () {
      document.querySelectorAll('#proj-filters .chip').forEach(function (x) { x.classList.toggle('is-active', x === c); });
      filter = c.dataset.f;
      var first = PROJECTS.findIndex(function (p) { return filter === 'all' || p.cat === filter; });
      if (first > -1 && !(filter === 'all' || PROJECTS[selected].cat === filter)) selected = first;
      renderList(); renderDetail();
    });
  });
  renderKpis(); renderList(); renderDetail();

  /* ---------- 2. Devis diagnostic ---------- */
  var BASE = { 1: 35000, 2: 50000, 3: 150000 };
  var NAMES = { 1: 'Contrôle des différentiels', 2: 'Différentiels et terre', 3: 'Inspection complète NF C 15-100' };
  var sites = 1, offreSel = 2;
  function calcDiag() {
    offreSel = parseInt(document.querySelector('input[name="offre"]:checked').value, 10);
    var zone = parseInt($('d-zone').value, 10), urgent = $('d-urgent').checked;
    var sub = BASE[offreSel] * sites;
    var rush = urgent ? Math.round(sub * 0.2) : 0;
    var total = sub + rush + zone;
    $('d-total').textContent = fmt(total);
    var lines = '<li><span>' + NAMES[offreSel] + ' × ' + sites + '</span><b>' + fmt(sub) + ' XAF</b></li>';
    if (zone) lines += '<li><span>Déplacement</span><b>' + fmt(zone) + ' XAF</b></li>';
    if (rush) lines += '<li><span>Priorité 48 h</span><b>' + fmt(rush) + ' XAF</b></li>';
    $('d-lines').innerHTML = lines;
    var d1 = addBusiness(today, urgent ? 2 : 3), d2 = addBusiness(d1, 5);
    $('d-date1').textContent = dateFr(d1); $('d-date2').textContent = dateFr(d2);
    $('d-wa').href = wa('Bonjour NMJ Services, je souhaite réserver un diagnostic électrique : ' + NAMES[offreSel] + ', ' + sites + ' tableau(x)/site(s)' + (urgent ? ', intervention prioritaire' : '') + '. Estimation affichée : ' + fmt(total) + ' XAF.');
  }
  document.querySelectorAll('input[name="offre"]').forEach(function (r) { r.addEventListener('change', calcDiag); });
  $('d-zone').addEventListener('change', calcDiag);
  $('d-urgent').addEventListener('change', calcDiag);
  document.querySelectorAll('.stepper button').forEach(function (b) {
    b.addEventListener('click', function () {
      sites = Math.min(20, Math.max(1, sites + parseInt(b.dataset.step, 10)));
      $('d-sites-v').textContent = sites; $('d-sites').value = sites; calcDiag();
    });
  });
  document.querySelectorAll('[data-offre]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelector('input[name="offre"][value="' + b.dataset.offre + '"]').checked = true;
      selectTab('diag'); calcDiag();
      document.getElementById('outils').scrollIntoView({ behavior: 'smooth' });
    });
  });
  calcDiag();

  /* ---------- 3. Simulateur solaire ---------- */
  function calcSolar() {
    var conso = parseFloat($('s-conso').value), auto = parseFloat($('s-autonomie').value), share = parseFloat($('s-usage').value);
    $('s-conso-v').textContent = conso; $('s-auto-v').textContent = auto;
    var kwcNeed = (conso * share) / (4.5 * 0.75);
    var panels = Math.max(1, Math.ceil(kwcNeed * 1000 / 550));
    var kwc = panels * 0.55;
    var bat = Math.max(2, Math.ceil(((conso / 24) * auto) / 0.8));
    $('s-kwc').textContent = kwc.toFixed(1).replace('.', ',');
    $('s-pan').textContent = panels;
    $('s-bat').textContent = bat;
    $('s-surf').textContent = Math.ceil(panels * 2.6);
    $('s-bar').style.width = Math.round(share * 100) + '%';
    var annual = Math.round(kwc * 4.5 * 0.75 * 365);
    $('s-co2').textContent = 'Part de solaire visée : ' + Math.round(share * 100) + ' % · production ≈ ' + fmt(annual) + ' kWh / an';
    $('s-wa').href = wa('Bonjour NMJ Services, je souhaite une étude solaire : consommation ' + conso + ' kWh/jour, autonomie ' + auto + ' h, objectif ' + Math.round(share * 100) + ' % solaire. Pré-dimensionnement : ' + kwc.toFixed(1) + ' kWc, ' + panels + ' panneaux, ' + bat + ' kWh de batteries.');
  }
  ['s-conso', 's-autonomie', 's-usage'].forEach(function (id) { $(id).addEventListener('input', calcSolar); });
  calcSolar();

  /* ---------- 4. Maintenance & habilitations ---------- */
  var ITEMS = [
    { id: 'gen', name: 'Groupe électrogène 250 kVA', type: 'Équipement', ico: 'eq', every: 180, due: -12 },
    { id: 'hta', name: 'Poste de transformation HTA/BT', type: 'Équipement', ico: 'eq', every: 365, due: 18 },
    { id: 'thermo', name: 'Thermographie du tableau général BT', type: 'Contrôle', ico: 'ck', every: 365, due: 9 },
    { id: 'ond', name: 'Onduleurs et batteries — site A', type: 'Équipement', ico: 'eq', every: 180, due: 75 },
    { id: 'terre', name: 'Mesure des prises de terre', type: 'Contrôle', ico: 'ck', every: 365, due: 200 },
    { id: 'ext', name: 'Extincteurs et éclairage de sécurité', type: 'Contrôle', ico: 'ck', every: 365, due: 120 },
    { id: 'h1', name: 'Habilitation B2V / BR — J. Mba', type: 'Habilitation', ico: 'hb', every: 1095, due: -4 },
    { id: 'h2', name: 'Habilitation H1V — E. Nzé', type: 'Habilitation', ico: 'hb', every: 1095, due: 45 },
    { id: 'h3', name: 'Habilitation B1V — C. Ondo', type: 'Habilitation', ico: 'hb', every: 1095, due: 21 }
  ];
  var ICONS = {
    eq: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    ck: '<path d="M8 12l3 3 5-6"/><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/>',
    hb: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>'
  };
  var store = {};
  try { store = JSON.parse(localStorage.getItem('nmj-maint') || '{}'); } catch (e) { store = {}; }
  function saveStore() { try { localStorage.setItem('nmj-maint', JSON.stringify(store)); } catch (e) {} }
  function dueDate(it) { return store[it.id] ? new Date(store[it.id]) : addDays(today, it.due); }
  function statusOf(d) { var diff = Math.round((d - today) / 86400000); return { diff: diff, s: diff < 0 ? 'late' : (diff <= 30 ? 'soon' : 'ok') }; }
  var mFilter = 'all';

  function renderMaint() {
    var box = $('maint'); box.innerHTML = '';
    var c = { late: 0, soon: 0, ok: 0 };
    ITEMS.forEach(function (it) {
      var d = dueDate(it), st = statusOf(d); c[st.s]++;
    });
    ITEMS.slice().sort(function (a, b) { return dueDate(a) - dueDate(b); }).forEach(function (it) {
      var d = dueDate(it), st = statusOf(d);
      var li = document.createElement('li');
      li.className = 'mi mi--' + st.s;
      li.hidden = !(mFilter === 'all' || mFilter === st.s);
      var label = st.s === 'late' ? 'En retard de ' + Math.abs(st.diff) + ' j' : (st.diff === 0 ? 'Aujourd\'hui' : 'Dans ' + st.diff + ' j');
      var badge = st.s === 'late' ? 'badge--late' : (st.s === 'soon' ? 'badge--warn' : 'badge--ok');
      var btxt = st.s === 'late' ? 'En retard' : (st.s === 'soon' ? 'À planifier' : 'À jour');
      li.innerHTML = '<span class="mi__ico"><svg viewBox="0 0 24 24">' + ICONS[it.ico] + '</svg></span>' +
        '<div><div class="mi__name">' + it.name + '</div><div class="mi__sub"><span>' + it.type + '</span><span class="badge ' + badge + '">' + btxt + '</span></div></div>' +
        '<div class="mi__act"><span class="mi__due">' + dateShort(d) + ' · ' + label + '</span><button type="button" data-id="' + it.id + '">Marquer comme fait</button></div>';
      box.appendChild(li);
    });
    $('m-summary').textContent = c.late + ' en retard · ' + c.soon + ' à planifier · ' + c.ok + ' à jour';
  }
  $('maint').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-id]'); if (!b) return;
    var it = ITEMS.filter(function (x) { return x.id === b.dataset.id; })[0];
    store[it.id] = addDays(today, it.every).toISOString(); saveStore(); renderMaint();
  });
  document.querySelectorAll('#m-filters .chip').forEach(function (c) {
    c.addEventListener('click', function () {
      document.querySelectorAll('#m-filters .chip').forEach(function (x) { x.classList.toggle('is-active', x === c); });
      mFilter = c.dataset.f; renderMaint();
    });
  });
  renderMaint();
})();
