/* Simulateurs NMJ Services (diagnostic et solaire) — calculs côté navigateur. */
(function () {
  'use strict';
  var WA = '241074664764';
  function wa(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  function $(id) { return document.getElementById(id); }
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function addBusiness(d, n) { var x = new Date(d); while (n > 0) { x.setDate(x.getDate() + 1); if (x.getDay() !== 0 && x.getDay() !== 6) n--; } return x; }
  function dateFr(d) { return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); }
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

})();
