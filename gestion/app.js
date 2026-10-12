/* NMJ Gestion — application interne (démo, données stockées dans le navigateur) */
(function () {
  'use strict';
  var N = NMJ, S = N.load(), esc = N.esc, fmt = N.fmt, fmtM = N.fmtM;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var ICON = {
    home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10', devis: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5', facture: 'M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zM9 8h6M9 12h6',
    users: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 11a3 3 0 100-6M21 20c0-2.6-1.6-4.8-4-5.6', chantier: 'M3 21h18M6 21V8l6-4 6 4v13M10 21v-5h4v5M9 11h6',
    cal: 'M4 6h16v15H4zM4 10h16M9 3v4M15 3v4', team: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8', box: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
    cog: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2', plus: 'M12 5v14M5 12h14', search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.5-4.5',
    edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4', trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14', alert: 'M12 3l10 18H2zM12 10v5M12 18v.5', check: 'M5 12l4 4 10-10', print: 'M7 9V3h10v6M6 18H4v-7h16v7h-2M7 14h10v7H7z',
    cash: 'M3 7h18v10H3zM12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2', out: 'M9 4H5v16h4M16 8l4 4-4 4M20 12H9',
    l: 'M15 5l-7 7 7 7', r: 'M9 5l7 7-7 7', bolt: 'M13 2L4 14h7l-1 8 9-12h-7z', wa: 'M3.5 20.5l1.3-4.2A8.5 8.5 0 118 19.4zM9 8.5c0 3.5 2.5 6.5 6.5 6.8l1-1.6-2-1-1 1c-1.2-.5-2.2-1.5-2.7-2.7l1-1-1-2-1.6.9',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2', send: 'M4 12l16-8-6 16-2.5-6.5z', arrow: 'M5 12h14M13 6l6 6-6 6', x: 'M6 6l12 12M18 6L6 18', up: 'M12 19V5M5 12l7-7 7 7', dl: 'M12 4v12M6 11l6 6 6-6M4 20h16'
  };
  function ic(n, extra) { return '<svg class="i" viewBox="0 0 24 24"' + (extra || '') + '>' + '<path d="' + ICON[n] + '"/></svg>'; }

  var ROUTES = [
    ['dashboard', 'Tableau de bord', 'home', 'Pilotage'], ['devis', 'Devis', 'devis', 'Commercial'], ['factures', 'Factures', 'facture', 'Commercial'], ['clients', 'Clients', 'users', 'Commercial'],
    ['chantiers', 'Chantiers', 'chantier', 'Production'], ['planning', 'Planning', 'cal', 'Production'], ['rh', 'Équipe & RH', 'team', 'Ressources'], ['stock', 'Stock & matériel', 'box', 'Ressources'], ['params', 'Paramètres', 'cog', 'Administration']
  ];
  var UI = { route: 'dashboard', q: '', f: {}, week: N.monday(N.today()) };
  var CH_COL = ['#1d4f91', '#c2570c', '#2f8f5b', '#7a3fa3', '#a8780a', '#0e7c86', '#b23a5e'];
  var DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  /* ---------- Accès aux données ---------- */
  var find = function (list, id) { return list.filter(function (x) { return x.id === id; })[0]; };
  var cli = function (id) { return find(S.clients, id) || { name: '—' }; };
  var emp = function (id) { return find(S.employees, id); };
  var chaCol = function (id) { var i = S.chantiers.findIndex(function (c) { return c.id === id; }); return CH_COL[(i < 0 ? 0 : i) % CH_COL.length]; };
  var initials = function (n) { return n.split(/[\s-]+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); };
  var tot = function (d) { return N.total(d, S.company.tva); };
  var paidOf = function (f) { return (f.payments || []).reduce(function (a, p) { return a + (+p.amount || 0); }, 0); };
  function facInfo(f) {
    var t = tot(f), paid = paidOf(f), bal = t.ttc - paid, st;
    if (bal <= 0.5) st = 'payée'; else if (f.echeance < N.today()) st = 'en retard'; else st = paid > 0 ? 'partielle' : 'à payer';
    return { t: t, paid: paid, bal: Math.max(0, bal), st: st, late: st === 'en retard' ? N.diff(N.today(), f.echeance) : 0 };
  }
  function devSt(d) { return d.status === 'envoyé' && N.addD(d.date, d.validite || 30) < N.today() ? 'expiré' : d.status; }
  var BADGE = { brouillon: 'b-mute', 'envoyé': 'b-info', 'accepté': 'b-ok', 'refusé': 'b-bad', 'expiré': 'b-warn', 'payée': 'b-ok', partielle: 'b-info', 'à payer': 'b-mute', 'en retard': 'b-bad',
    'En cours': 'b-info', 'Planifié': 'b-mute', 'Terminé': 'b-ok', 'Suspendu': 'b-warn' };
  var badge = function (s) { return '<span class="badge ' + (BADGE[s] || 'b-mute') + '">' + esc(s) + '</span>'; };
  function ago(ts) { var m = Math.round((Date.now() - ts) / 60000); if (m < 60) return 'il y a ' + Math.max(1, m) + ' min'; if (m < 1440) return 'il y a ' + Math.round(m / 60) + ' h'; return 'il y a ' + Math.round(m / 1440) + ' j'; }
  function habState(h) { var d = N.diff(h.expire, N.today()); return d < 0 ? 'bad' : (d <= 30 ? 'warn' : 'ok'); }
  function persist(msg) { N.setState(S); if (msg) N.log(msg); N.save(); }
  var waLink = function (tel, text) { return 'https://wa.me/241' + String(tel || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(text); };

  /* ---------- Interface : modales, toasts ---------- */
  function toast(m) { var t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600); }
  function modal(o) {
    var ov = document.createElement('div'); ov.className = 'ov';
    ov.innerHTML = '<div class="modal ' + (o.cls || '') + '" role="dialog" aria-modal="true"><div class="modal__h"><h3>' + o.title + '</h3><button class="btn btn--ghost btn--icon" data-act="close" aria-label="Fermer">' + ic('x') + '</button></div><div class="modal__b">' + o.body + '</div>' + (o.foot ? '<div class="modal__f">' + o.foot + '</div>' : '') + '</div>';
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) { ov.remove(); if (!$('#modals .ov').length) document.body.style.overflow = ''; } });
    $('#modals').appendChild(ov); document.body.style.overflow = 'hidden';
    var f = $('input:not([type=hidden]):not([type=checkbox]), select', ov); if (f && window.innerWidth > 760) f.focus();
    return ov;
  }
  function closeTop() { var all = $$('#modals .ov'); if (all.length) all[all.length - 1].remove(); if (!$$('#modals .ov').length) document.body.style.overflow = ''; }
  function closeAll() { $('#modals').innerHTML = ''; document.body.style.overflow = ''; }

  /* ---------- Vues ---------- */
  var V = {};
  function kpi(label, val, sub, icon, hot) { return '<div class="kpi' + (hot ? ' kpi--hot' : '') + '"><span class="kpi__ico">' + ic(icon) + '</span><small>' + label + '</small><b>' + val + '</b><span>' + sub + '</span></div>'; }

  function barChart(rows) {
    var W = 640, H = 240, pl = 46, pb = 30, pt = 14, mx = 1;
    rows.forEach(function (r) { mx = Math.max(mx, r.a, r.b); });
    var mag = Math.pow(10, Math.floor(Math.log10(mx))), step = mag / 2, top = Math.ceil(mx / step) * step, ch = H - pb - pt, gw = (W - pl) / rows.length, s = '';
    for (var g = 0; g <= 4; g++) { var v = top * g / 4, y = pt + ch - ch * g / 4; s += '<line x1="' + pl + '" x2="' + W + '" y1="' + y + '" y2="' + y + '" stroke="#e1e6ee"/><text x="' + (pl - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + N.fmtM(v) + '</text>'; }
    rows.forEach(function (r, i) {
      var x = pl + i * gw + gw / 2, h1 = ch * r.a / top, h2 = ch * r.b / top;
      s += '<rect x="' + (x - 24) + '" y="' + (pt + ch - h1) + '" width="22" height="' + h1 + '" rx="5" fill="#1a2d4d"/><rect x="' + (x + 2) + '" y="' + (pt + ch - h2) + '" width="22" height="' + h2 + '" rx="5" fill="#f08a24"/><text x="' + x + '" y="' + (H - 9) + '" text-anchor="middle">' + r.l + '</text>';
    });
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Facturé et encaissé sur 6 mois">' + s + '</svg>';
  }

  V.dashboard = function () {
    var t = N.today(), ym = t.slice(0, 7), inf = S.factures.map(facInfo);
    var fm = 0, em = 0, imp = 0, late = 0, nlate = 0;
    S.factures.forEach(function (f, i) { if (f.date.slice(0, 7) === ym) fm += inf[i].t.ttc; (f.payments || []).forEach(function (p) { if (p.date.slice(0, 7) === ym) em += +p.amount; }); imp += inf[i].bal; if (inf[i].st === 'en retard') { late += inf[i].bal; nlate++; } });
    var sent = S.devis.filter(function (d) { return devSt(d) === 'envoyé'; }), sentV = sent.reduce(function (a, d) { return a + tot(d).ttc; }, 0);
    var act = S.chantiers.filter(function (c) { return c.status === 'En cours'; });
    var plToday = {}, away = 0, onSite = 0;
    S.employees.forEach(function (e) { var v = S.planning[t + '|' + e.id]; if (!v) return; if (v === 'conge' || v === 'maladie' || v === 'formation') away++; else { onSite++; plToday[v] = (plToday[v] || 0) + 1; } });
    var rows = []; var d0 = new Date();
    for (var k = 5; k >= 0; k--) { var d = new Date(d0.getFullYear(), d0.getMonth() - k, 1), key = N.iso(d).slice(0, 7), a = 0, b = 0;
      S.factures.forEach(function (f, i) { if (f.date.slice(0, 7) === key) a += inf[i].t.ttc; (f.payments || []).forEach(function (p) { if (p.date.slice(0, 7) === key) b += +p.amount; }); });
      rows.push({ l: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''), a: a, b: b }); }
    var al = [];
    S.factures.forEach(function (f, i) { if (inf[i].st === 'en retard') al.push({ k: 'bad', i: 'cash', t: f.num + ' — ' + cli(f.clientId).name, s: fmt(inf[i].bal) + ' XAF impayés · retard de ' + inf[i].late + ' j', a: 'viewDoc', ty: 'factures', id: f.id }); });
    S.employees.forEach(function (e) { e.habs.forEach(function (h) { var st = habState(h); if (st !== 'ok') al.push({ k: st, i: 'bolt', t: 'Habilitation ' + h.label + ' — ' + e.name, s: st === 'bad' ? 'Expirée depuis ' + Math.abs(N.diff(h.expire, t)) + ' j : ne pas affecter aux travaux électriques' : 'Expire dans ' + N.diff(h.expire, t) + ' j : programmer le recyclage', a: 'openEmp', id: e.id }); }); });
    S.stock.filter(function (x) { return x.qty < x.min; }).forEach(function (x) { al.push({ k: 'warn', i: 'box', t: x.label, s: 'Stock bas : ' + x.qty + ' ' + x.unit + ' (seuil ' + x.min + ')', a: 'go', id: 'stock' }); });
    sent.forEach(function (d) { var dd = N.diff(t, d.date); if (dd >= 10) al.push({ k: 'info', i: 'devis', t: d.num + ' sans réponse — ' + cli(d.clientId).name, s: 'Envoyé il y a ' + dd + ' j : relancer le client', a: 'viewDoc', ty: 'devis', id: d.id }); });
    al.sort(function (x, y) { return ({ bad: 0, warn: 1, info: 2 })[x.k] - ({ bad: 0, warn: 1, info: 2 })[y.k]; });
    var h = new Date().getHours(), hello = h < 12 ? 'Bonjour' : (h < 18 ? 'Bon après-midi' : 'Bonsoir');
    var pipe = ['brouillon', 'envoyé', 'accepté', 'refusé'].map(function (s) { var l = S.devis.filter(function (d) { return devSt(d) === s; }); return { s: s, n: l.length, v: l.reduce(function (a, d) { return a + tot(d).ttc; }, 0) }; });
    var pm = Math.max.apply(null, pipe.map(function (p) { return p.v; }).concat(1));
    return '<div class="card" style="background:linear-gradient(120deg,var(--navy-2),var(--navy));color:#fff"><div class="card__h" style="margin:0"><div><h2 style="color:#fff;font-size:1.35rem">' + hello + ', NMJ Services 👋</h2><p style="color:#aab8d2;margin-top:.3rem;font-weight:600">' + (nlate ? nlate + ' facture(s) en retard · ' : '') + onSite + ' personne(s) sur chantier aujourd\'hui · ' + act.length + ' chantiers en cours</p></div>' +
      '<div class="quick"><button class="btn btn--pri" data-act="newDoc" data-type="devis">' + ic('plus') + 'Devis</button><button class="btn btn--line" data-act="newDoc" data-type="factures">' + ic('plus') + 'Facture</button><button class="btn btn--line" data-act="planGo">' + ic('cal') + 'Planning</button></div></div></div>' +
      '<div class="kpis">' + kpi('Facturé ce mois', fmtM(fm) + ' <small style="font-size:.8rem;letter-spacing:0">XAF</small>', 'TTC · ' + S.factures.filter(function (f) { return f.date.slice(0, 7) === ym; }).length + ' facture(s)', 'facture', true) + kpi('Encaissé ce mois', fmtM(em) + ' <small style="font-size:.8rem;letter-spacing:0">XAF</small>', 'paiements reçus', 'cash') +
      kpi('Reste à encaisser', fmtM(imp) + ' <small style="font-size:.8rem;letter-spacing:0">XAF</small>', nlate ? fmtM(late) + ' en retard' : 'aucun retard', 'clock') + kpi('Devis en attente', sent.length, fmtM(sentV) + ' XAF à convertir', 'devis') + kpi('Effectif', S.employees.length, away + ' absent(s) aujourd\'hui', 'team') + '</div>' +
      '<div class="cols"><div class="stack"><div class="card"><div class="card__h"><h3>Facturé vs encaissé</h3><div class="lg"><span><i style="background:#1a2d4d"></i>Facturé TTC</span><span><i style="background:#f08a24"></i>Encaissé</span></div></div>' + barChart(rows) + '</div>' +
      '<div class="card"><div class="card__h"><h3>Chantiers en cours</h3><button class="btn btn--ghost btn--sm" data-act="go" data-id="chantiers">Tout voir ' + ic('r') + '</button></div><ul class="list">' + act.map(function (c) { var sp = Math.round(c.spent / c.budget * 100); return '<li data-act="editChantier" data-id="' + c.id + '" style="cursor:pointer"><span class="dot info" style="background:' + chaCol(c.id) + '22;color:' + chaCol(c.id) + '">' + ic('chantier') + '</span><div style="flex:1;min-width:0"><b>' + esc(c.name) + '</b><small>' + (plToday[c.id] || 0) + ' pers. aujourd\'hui · budget consommé ' + sp + ' %</small><div class="bar" style="margin-top:.4rem"><i style="width:' + c.progress + '%"></i></div></div><b style="font-family:var(--ff-d)">' + c.progress + '%</b></li>'; }).join('') + '</ul></div></div>' +
      '<div class="stack"><div class="card"><div class="card__h"><h3>À traiter</h3><small>' + al.length + ' alerte(s)</small></div>' + (al.length ? '<ul class="list">' + al.slice(0, 7).map(function (x) { return '<li data-act="' + x.a + '" data-type="' + (x.ty || '') + '" data-id="' + x.id + '" style="cursor:pointer"><span class="dot ' + x.k + '">' + ic(x.i) + '</span><div><b>' + esc(x.t) + '</b><small>' + esc(x.s) + '</small></div></li>'; }).join('') + '</ul>' : '<div class="empty">Tout est à jour ✅</div>') + '</div>' +
      '<div class="card"><div class="card__h"><h3>Pipeline des devis</h3></div><div class="funnel">' + pipe.map(function (p) { return '<div><span><span>' + p.s.charAt(0).toUpperCase() + p.s.slice(1) + ' · ' + p.n + '</span><span>' + fmtM(p.v) + ' XAF</span></span><div class="bar ' + (p.s === 'refusé' ? 'bar--red' : p.s === 'brouillon' ? 'bar--navy' : '') + '"><i style="width:' + Math.round(p.v / pm * 100) + '%"></i></div></div>'; }).join('') + '</div></div>' +
      '<div class="card"><div class="card__h"><h3>Activité récente</h3></div><ul class="list">' + S.log.slice(0, 5).map(function (l) { return '<li><span class="dot ok">' + ic('check') + '</span><div><b>' + esc(l.text) + '</b><small>' + ago(l.ts) + '</small></div></li>'; }).join('') + '</ul></div></div></div>';
  };

  /* ----- Listes (devis / factures / clients) ----- */
  function listHead(count, addLabel, addAct, type, chips) {
    return '<div class="toolbar"><label class="search">' + ic('search') + '<input class="in" data-search placeholder="Rechercher…" value="' + esc(UI.q) + '" aria-label="Rechercher"></label>' + (chips || '') + '<span style="flex:1"></span><button class="btn btn--pri" data-act="' + addAct + '" data-type="' + (type || '') + '">' + ic('plus') + addLabel + '</button></div>';
  }
  function chipsHtml(list, cur, key) { return '<div class="chips">' + list.map(function (c) { return '<button class="chip ' + (cur === c[0] ? 'is-on' : '') + '" data-act="chip" data-key="' + key + '" data-v="' + c[0] + '">' + c[1] + (c[2] != null ? '<span class="n">' + c[2] + '</span>' : '') + '</button>'; }).join('') + '</div>'; }
  var match = function (s) { return !UI.q || s.toLowerCase().indexOf(UI.q.toLowerCase()) > -1; };

  V.devis = function () {
    var cur = UI.f.devis || 'all', st = ['brouillon', 'envoyé', 'accepté', 'refusé', 'expiré'];
    var chips = chipsHtml([['all', 'Tous', S.devis.length]].concat(st.map(function (s) { return [s, s.charAt(0).toUpperCase() + s.slice(1), S.devis.filter(function (d) { return devSt(d) === s; }).length]; })), cur, 'devis');
    UI.res = function () {
      var l = S.devis.filter(function (d) { return (cur === 'all' || devSt(d) === cur) && match(d.num + cli(d.clientId).name + d.subject); }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      if (!l.length) return '<div class="card empty">Aucun devis ne correspond.</div>';
      return '<div class="card" style="padding:.4rem .6rem"><table class="tbl"><thead><tr><th>N°</th><th>Client / objet</th><th>Date</th><th class="r">Total TTC</th><th>Statut</th><th></th></tr></thead><tbody>' + l.map(function (d) {
        return '<tr data-act="viewDoc" data-type="devis" data-id="' + d.id + '"><td class="first" data-l="N°"><span class="strong">' + d.num + '</span></td><td data-l="Client"><span class="strong">' + esc(cli(d.clientId).name) + '</span><span class="sub">' + esc(d.subject) + '</span></td><td data-l="Date">' + N.dFr(d.date) + '</td><td class="r num strong" data-l="Total TTC">' + fmt(tot(d).ttc) + ' XAF</td><td data-l="Statut">' + badge(devSt(d)) + '</td><td class="acts-c"><div class="acts"><button class="btn btn--ghost btn--icon" data-act="editDoc" data-type="devis" data-id="' + d.id + '" aria-label="Modifier">' + ic('edit') + '</button></div></td></tr>'; }).join('') + '</tbody></table></div>';
    };
    return listHead(0, 'Nouveau devis', 'newDoc', 'devis', chips) + '<div id="res">' + UI.res() + '</div>';
  };

  V.factures = function () {
    var cur = UI.f.factures || 'all', inf = S.factures.map(facInfo), sum = function (k) { return inf.reduce(function (a, i) { return a + i[k]; }, 0); };
    var tt = inf.reduce(function (a, i) { return a + i.t.ttc; }, 0), cnt = function (s) { return inf.filter(function (i) { return i.st === s; }).length; };
    var chips = chipsHtml([['all', 'Toutes', S.factures.length], ['à payer', 'À payer', cnt('à payer')], ['partielle', 'Partielles', cnt('partielle')], ['en retard', 'En retard', cnt('en retard')], ['payée', 'Payées', cnt('payée')]], cur, 'factures');
    UI.res = function () {
      var l = S.factures.filter(function (f) { return (cur === 'all' || facInfo(f).st === cur) && match(f.num + cli(f.clientId).name + f.subject); }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      if (!l.length) return '<div class="card empty">Aucune facture ne correspond.</div>';
      return '<div class="card" style="padding:.4rem .6rem"><table class="tbl"><thead><tr><th>N°</th><th>Client / objet</th><th>Émise</th><th>Échéance</th><th class="r">Total TTC</th><th class="r">Reste dû</th><th>Statut</th><th></th></tr></thead><tbody>' + l.map(function (f) { var i = facInfo(f);
        return '<tr data-act="viewDoc" data-type="factures" data-id="' + f.id + '"><td class="first" data-l="N°"><span class="strong">' + f.num + '</span></td><td data-l="Client"><span class="strong">' + esc(cli(f.clientId).name) + '</span><span class="sub">' + esc(f.subject) + '</span></td><td data-l="Émise">' + N.dFr(f.date) + '</td><td data-l="Échéance">' + N.dFr(f.echeance) + '</td><td class="r num" data-l="Total TTC">' + fmt(i.t.ttc) + '</td><td class="r num strong" data-l="Reste dû">' + (i.bal ? fmt(i.bal) : '—') + '</td><td data-l="Statut">' + badge(i.st) + '</td><td class="acts-c"><div class="acts">' + (i.bal ? '<button class="btn btn--line btn--sm" data-act="pay" data-id="' + f.id + '">' + ic('cash') + 'Encaisser</button>' : '') + '</div></td></tr>'; }).join('') + '</tbody></table></div>';
    };
    return '<div class="kpis">' + kpi('Total facturé', fmtM(tt) + ' XAF', S.factures.length + ' factures', 'facture', true) + kpi('Encaissé', fmtM(sum('paid')) + ' XAF', Math.round(sum('paid') / (tt || 1) * 100) + ' % du facturé', 'cash') + kpi('Reste à encaisser', fmtM(sum('bal')) + ' XAF', 'toutes échéances', 'clock') +
      kpi('En retard', fmtM(inf.filter(function (i) { return i.st === 'en retard'; }).reduce(function (a, i) { return a + i.bal; }, 0)) + ' XAF', cnt('en retard') + ' facture(s)', 'alert') + '</div>' + listHead(0, 'Nouvelle facture', 'newDoc', 'factures', chips) + '<div id="res">' + UI.res() + '</div>';
  };

  V.clients = function () {
    UI.res = function () {
      var l = S.clients.filter(function (c) { return match(c.name + c.type + c.city + c.contact); });
      if (!l.length) return '<div class="card empty">Aucun client.</div>';
      return '<div class="card" style="padding:.4rem .6rem"><table class="tbl"><thead><tr><th>Client</th><th>Contact</th><th>Ville</th><th class="r">Facturé</th><th class="r">Impayé</th><th></th></tr></thead><tbody>' + l.map(function (c) {
        var fs = S.factures.filter(function (f) { return f.clientId === c.id; }), fa = fs.reduce(function (a, f) { return a + facInfo(f).t.ttc; }, 0), im = fs.reduce(function (a, f) { return a + facInfo(f).bal; }, 0);
        return '<tr data-act="editClient" data-id="' + c.id + '"><td class="first" data-l="Client"><span class="strong">' + esc(c.name) + '</span><span class="sub">' + esc(c.type) + '</span></td><td data-l="Contact">' + esc(c.contact) + '<span class="sub">' + esc(c.tel) + '</span></td><td data-l="Ville">' + esc(c.city) + '</td><td class="r num" data-l="Facturé">' + fmtM(fa) + ' XAF</td><td class="r num" data-l="Impayé">' + (im ? '<span class="badge b-warn">' + fmtM(im) + ' XAF</span>' : '—') + '</td><td class="acts-c"><div class="acts"><button class="btn btn--line btn--sm" data-act="newDoc" data-type="devis" data-client="' + c.id + '">' + ic('plus') + 'Devis</button></div></td></tr>'; }).join('') + '</tbody></table></div>';
    };
    return listHead(0, 'Nouveau client', 'editClient') + '<div id="res">' + UI.res() + '</div>';
  };

  /* ----- Chantiers ----- */
  V.chantiers = function () {
    var cur = UI.f.chantiers || 'all', sts = ['En cours', 'Planifié', 'Terminé', 'Suspendu'];
    var chips = chipsHtml([['all', 'Tous', S.chantiers.length]].concat(sts.map(function (s) { return [s, s, S.chantiers.filter(function (c) { return c.status === s; }).length]; })), cur, 'chantiers');
    var tb = S.chantiers.reduce(function (a, c) { return a + c.budget; }, 0), ts = S.chantiers.reduce(function (a, c) { return a + c.spent; }, 0);
    var l = S.chantiers.filter(function (c) { return cur === 'all' || c.status === cur; });
    return '<div class="kpis">' + kpi('Chantiers en cours', S.chantiers.filter(function (c) { return c.status === 'En cours'; }).length, S.chantiers.length + ' au total', 'chantier', true) + kpi('Budgets cumulés', fmtM(tb) + ' XAF', 'tous chantiers', 'cash') + kpi('Dépensé', fmtM(ts) + ' XAF', Math.round(ts / (tb || 1) * 100) + ' % des budgets', 'clock') + kpi('Marge prévisionnelle', fmtM(tb - ts) + ' XAF', 'budget restant', 'up') + '</div>' +
      '<div class="toolbar">' + chips + '<span style="flex:1"></span><button class="btn btn--pri" data-act="editChantier">' + ic('plus') + 'Nouveau chantier</button></div><div class="cards">' + l.map(function (c) {
        var m = emp(c.manager), sp = Math.round(c.spent / c.budget * 100), over = sp > c.progress + 10, left = N.diff(c.end, N.today());
        return '<div class="rc" data-act="editChantier" data-id="' + c.id + '"><div class="rc__top"><span class="avatar" style="background:' + chaCol(c.id) + ';border-radius:12px">' + ic('chantier', ' style="stroke:#fff"') + '</span><div style="flex:1;min-width:0"><b>' + esc(c.name) + '</b><small>' + esc(cli(c.clientId).name) + ' · ' + esc(c.site) + '</small></div>' + badge(c.status) + '</div>' +
          '<div><div class="rc__meta"><span>Avancement</span><span>' + c.progress + ' %</span></div><div class="bar" style="margin:.3rem 0 .6rem"><i style="width:' + c.progress + '%"></i></div><div class="rc__meta"><span>Budget consommé</span><span style="color:' + (over ? 'var(--bad)' : 'inherit') + '">' + sp + ' %</span></div><div class="bar ' + (over ? 'bar--red' : 'bar--navy') + '" style="margin-top:.3rem"><i style="width:' + Math.min(100, sp) + '%"></i></div></div>' +
          '<div class="rc__meta"><span>' + fmtM(c.spent) + ' / ' + fmtM(c.budget) + ' XAF</span><span>' + (c.status === 'Terminé' ? 'Terminé' : left >= 0 ? 'Fin dans ' + left + ' j' : 'Échéance dépassée') + '</span></div><div class="rc__meta"><span>Resp. : ' + (m ? esc(m.name) : '—') + '</span><span>' + N.dFr(c.start, { day: 'numeric', month: 'short' }) + ' → ' + N.dFr(c.end, { day: 'numeric', month: 'short' }) + '</span></div></div>'; }).join('') + '</div>';
  };

  /* ----- Planning ----- */
  V.planning = function () {
    var wk = UI.week, days = DAYS.map(function (_, i) { return N.addD(wk, i); }), t = N.today();
    var staff = S.employees.filter(function (e) { return e.service !== 'Administration'; });
    var perCh = {}, ab = 0;
    staff.forEach(function (e) { days.forEach(function (d) { var v = S.planning[d + '|' + e.id]; if (!v) return; if (v === 'conge' || v === 'maladie' || v === 'formation') ab++; else perCh[v] = (perCh[v] || 0) + 1; }); });
    var head = '<tr><th>Équipe — ' + staff.length + ' personnes</th>' + days.map(function (d, i) { return '<th class="' + (d === t ? 'today' : '') + '">' + DAYS[i] + '<small>' + N.parse(d).getDate() + '</small></th>'; }).join('') + '</tr>';
    var rows = staff.map(function (e) {
      var bad = e.habs.some(function (h) { return habState(h) === 'bad'; });
      return '<tr><td class="who"><div class="who"><span class="avatar">' + initials(e.name) + '</span><div><b>' + esc(e.name) + (bad ? ' <span title="Habilitation expirée" style="color:var(--bad)">⚠</span>' : '') + '</b><small>' + esc(e.poste) + '</small></div></div></td>' + days.map(function (d) {
        var v = S.planning[d + '|' + e.id], c = v && find(S.chantiers, v), lab = '+', cls = '', st = '';
        if (c) { lab = esc(c.name.split(' — ')[0]); cls = 'on'; st = ' style="background:' + chaCol(c.id) + '"'; } else if (v === 'conge') { lab = 'Congé'; cls = 'conge'; } else if (v === 'formation') { lab = 'Formation'; cls = 'formation'; } else if (v === 'maladie') { lab = 'Maladie'; cls = 'maladie'; }
        return '<td class="c"><button class="cell ' + cls + '"' + st + ' data-act="planCell" data-emp="' + e.id + '" data-day="' + d + '" aria-label="Affecter ' + esc(e.name) + ' le ' + d + '">' + lab + '</button></td>'; }).join('') + '</tr>';
    }).join('');
    var wl = N.dFr(days[0], { day: 'numeric', month: 'short' }) + ' → ' + N.dFr(days[5], { day: 'numeric', month: 'short', year: 'numeric' });
    var legend = S.chantiers.filter(function (c) { return c.status !== 'Terminé'; }).map(function (c) { return '<span><i style="background:' + chaCol(c.id) + '"></i>' + esc(c.name.split(' — ')[0]) + ' · ' + (perCh[c.id] || 0) + ' j-h</span>'; }).join('');
    return '<div class="toolbar"><div class="weeknav"><button class="btn btn--line btn--icon" data-act="week" data-d="-7" aria-label="Semaine précédente">' + ic('l') + '</button><b>' + wl + '</b><button class="btn btn--line btn--icon" data-act="week" data-d="7" aria-label="Semaine suivante">' + ic('r') + '</button></div><button class="btn btn--line" data-act="week" data-d="0">Aujourd\'hui</button><span style="flex:1"></span><button class="btn btn--pri" data-act="leave">' + ic('plus') + 'Poser un congé</button></div>' +
      '<div class="plan-wrap"><table class="plan"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="card"><div class="card__h"><h3>Charge de la semaine</h3><small>' + Object.keys(perCh).reduce(function (a, k) { return a + perCh[k]; }, 0) + ' jours-homme planifiés · ' + ab + ' absence(s)</small></div><div class="legend">' + legend + '<span><i style="background:#8a97ad"></i>Congé</span><span><i style="background:#6c4fb8"></i>Formation</span><span><i style="background:#c0575a"></i>Maladie</span></div><p style="margin-top:.8rem;color:var(--muted);font-size:.85rem;font-weight:600">Touchez une case pour affecter un salarié. ⚠ = habilitation électrique expirée.</p></div>';
  };

  /* ----- RH ----- */
  V.rh = function () {
    var cur = UI.f.rh || 'all', services = ['Génie civil', 'Électricité', 'Énergie', 'Administration'], t = N.today();
    var chips = chipsHtml([['all', 'Tous', S.employees.length]].concat(services.map(function (s) { return [s, s, S.employees.filter(function (e) { return e.service === s; }).length]; })), cur, 'rh');
    var renew = 0, bad = 0; S.employees.forEach(function (e) { e.habs.forEach(function (h) { var s = habState(h); if (s === 'warn') renew++; if (s === 'bad') bad++; }); });
    var away = S.employees.filter(function (e) { var v = S.planning[t + '|' + e.id]; return v === 'conge' || v === 'maladie' || v === 'formation'; }).length;
    var mass = S.employees.reduce(function (a, e) { return a + (+e.salaire || 0); }, 0);
    UI.res = function () {
      var l = S.employees.filter(function (e) { return (cur === 'all' || e.service === cur) && match(e.name + e.poste + e.service); });
      if (!l.length) return '<div class="card empty">Aucun salarié.</div>';
      return '<div class="cards">' + l.map(function (e) { var v = S.planning[t + '|' + e.id], c = v && find(S.chantiers, v), where = c ? c.name.split(' — ')[0] : (v === 'conge' ? 'En congé' : v === 'formation' ? 'En formation' : v === 'maladie' ? 'Absent (maladie)' : 'Non affecté');
        return '<div class="rc" data-act="openEmp" data-id="' + e.id + '"><div class="rc__top"><span class="avatar">' + initials(e.name) + '</span><div style="flex:1;min-width:0"><b>' + esc(e.name) + '</b><small>' + esc(e.poste) + '</small></div><span class="badge b-mute">' + esc(e.contrat) + '</span></div><div class="rc__tags">' + (e.habs.length ? e.habs.map(function (h) { var s = habState(h); return '<span class="badge b-' + (s === 'ok' ? 'ok' : s === 'warn' ? 'warn' : 'bad') + '" title="Expire le ' + N.dFr(h.expire) + '">' + (s === 'bad' ? '⚠ ' : '') + esc(h.label) + '</span>'; }).join('') : '<span class="badge b-mute">Aucune habilitation requise</span>') + '</div><div class="rc__meta"><span>Aujourd\'hui : ' + esc(where) + '</span><span>' + e.conges + ' j congés</span></div></div>'; }).join('') + '</div>';
    };
    return '<div class="kpis">' + kpi('Effectif', S.employees.length, S.employees.filter(function (e) { return e.contrat === 'CDI'; }).length + ' en CDI', 'team', true) + kpi('Absents aujourd\'hui', away, 'congés, formations, maladie', 'cal') + kpi('Habilitations à renouveler', renew + bad, bad + ' expirée(s) · ' + renew + ' sous 30 j', 'bolt') + kpi('Masse salariale', fmtM(mass) + ' XAF', 'brute mensuelle (démo)', 'cash') + '</div>' +
      listHead(0, 'Nouveau salarié', 'openEmp', '', chips) + '<div id="res">' + UI.res() + '</div>';
  };

  /* ----- Stock ----- */
  V.stock = function () {
    var cur = UI.f.stock || 'all', cats = ['Câbles', 'Protection', 'Solaire', 'Sécurité (EPI)', 'Gros œuvre', 'Finitions'];
    var low = S.stock.filter(function (x) { return x.qty < x.min; }).length, val = S.stock.reduce(function (a, x) { return a + x.qty * x.pu; }, 0);
    var chips = chipsHtml([['all', 'Tout', S.stock.length], ['low', 'Sous le seuil', low]].concat(cats.map(function (c) { return [c, c]; })), cur, 'stock');
    UI.res = function () {
      var l = S.stock.filter(function (x) { return (cur === 'all' || (cur === 'low' ? x.qty < x.min : x.cat === cur)) && match(x.label + x.ref + x.cat); });
      if (!l.length) return '<div class="card empty">Aucun article.</div>';
      return '<div class="card" style="padding:.4rem .6rem"><table class="tbl"><thead><tr><th>Article</th><th>Catégorie</th><th class="r">Quantité</th><th class="r">Valeur</th><th>État</th><th></th></tr></thead><tbody>' + l.map(function (x) {
        var lo = x.qty < x.min, p = Math.min(100, Math.round(x.qty / (x.min * 2) * 100));
        return '<tr><td class="first" data-l="Article"><span class="strong">' + esc(x.label) + '</span><span class="sub">' + esc(x.ref) + '</span></td><td data-l="Catégorie">' + esc(x.cat) + '</td><td class="r num strong" data-l="Quantité">' + fmt(x.qty) + ' ' + esc(x.unit) + '<span class="sub">seuil ' + x.min + '</span></td><td class="r num" data-l="Valeur">' + fmt(x.qty * x.pu) + ' XAF</td><td data-l="État">' + (lo ? '<span class="badge b-bad">Sous le seuil</span>' : '<span class="badge b-ok">OK</span>') + '</td><td class="acts-c"><div class="acts"><button class="btn btn--line btn--sm" data-act="mvt" data-id="' + x.id + '" data-t="in">+ Entrée</button><button class="btn btn--line btn--sm" data-act="mvt" data-id="' + x.id + '" data-t="out">− Sortie</button><button class="btn btn--ghost btn--icon" data-act="editStock" data-id="' + x.id + '" aria-label="Modifier">' + ic('edit') + '</button></div></td></tr>'; }).join('') + '</tbody></table></div>';
    };
    return '<div class="kpis">' + kpi('Références', S.stock.length, 'articles suivis', 'box', true) + kpi('Valeur du stock', fmtM(val) + ' XAF', 'au prix d\'achat', 'cash') + kpi('Sous le seuil', low, low ? 'à réapprovisionner' : 'aucune rupture', 'alert') + '</div>' +
      listHead(0, 'Nouvel article', 'editStock', '', chips) + '<div id="res">' + UI.res() + '</div>' +
      (S.mvts.length ? '<div class="card"><div class="card__h"><h3>Derniers mouvements</h3></div><ul class="list">' + S.mvts.slice(0, 6).map(function (m) { var it = find(S.stock, m.itemId); return '<li><span class="dot ' + (m.type === 'in' ? 'ok' : 'warn') + '">' + ic(m.type === 'in' ? 'up' : 'out') + '</span><div><b>' + (m.type === 'in' ? '+' : '−') + m.qty + ' · ' + esc(it ? it.label : '?') + '</b><small>' + esc(m.note || '—') + ' · ' + ago(m.ts) + '</small></div></li>'; }).join('') + '</ul></div>' : '');
  };

  /* ----- Paramètres ----- */
  V.params = function () {
    var c = S.company;
    return '<div class="cols"><form class="card stack" data-form="company"><div class="card__h" style="margin:0"><h3>Informations de l\'entreprise</h3><small>Reprises sur les devis et factures</small></div>' +
      '<label class="f">Raison sociale<input class="in" name="name" value="' + esc(c.name) + '"></label><label class="f">Forme juridique et capital<input class="in" name="form" value="' + esc(c.form) + '"></label><label class="f">Adresse<input class="in" name="address" value="' + esc(c.address) + '"></label>' +
      '<div class="grid2"><label class="f">Téléphone<input class="in" name="tel" value="' + esc(c.tel) + '"></label><label class="f">E-mail<input class="in" name="email" value="' + esc(c.email) + '"></label></div>' +
      '<div class="grid3"><label class="f">NIF<input class="in" name="nif" value="' + esc(c.nif) + '"></label><label class="f">RCCM<input class="in" name="rccm" value="' + esc(c.rccm) + '"></label><label class="f">TVA (%)<input class="in" type="number" step="0.1" name="tva" value="' + c.tva + '"></label></div>' +
      '<label class="f">Conditions de paiement par défaut<textarea class="in" name="conditions">' + esc(c.conditions) + '</textarea></label><div><button class="btn btn--pri" type="submit">Enregistrer</button></div></form>' +
      '<div class="stack"><div class="card stack"><div class="card__h" style="margin:0"><h3>Sauvegarde des données</h3></div><p style="color:var(--muted)">Cette démonstration enregistre les données <b>dans ce navigateur uniquement</b>. Exportez-les pour les conserver ou les transférer.</p><div class="quick"><button class="btn btn--dark" data-act="export">' + ic('dl') + 'Exporter (JSON)</button><label class="btn btn--line" style="cursor:pointer">Importer<input type="file" accept="application/json" data-import hidden></label></div></div>' +
      '<div class="card stack"><div class="card__h" style="margin:0"><h3>Mode démonstration</h3></div><p style="color:var(--muted)">Les clients, factures et salariés affichés sont fictifs. Remettez les données d\'exemple à zéro à tout moment.</p><div><button class="btn btn--danger" data-act="reset">Réinitialiser les données d\'exemple</button></div></div></div></div>';
  };

  /* ---------- Document (devis / facture) ---------- */
  function docHtml(type, d) {
    var c = S.company, cl = cli(d.clientId), t = tot(d), isF = type === 'factures', inf = isF ? facInfo(d) : null;
    return '<div class="doc"><div class="doc__top"><div class="doc__co"><img src="../assets/img/logo.png" alt=""><div><b>' + esc(c.name) + '</b><span>' + esc(c.form) + '</span><span>' + esc(c.address) + '</span><span>' + esc(c.tel) + ' · ' + esc(c.email) + '</span></div></div>' +
      '<div class="doc__ttl"><h2>' + (isF ? 'FACTURE' : 'DEVIS') + '</h2><span>N° <b>' + esc(d.num) + '</b></span><span>Date : ' + N.dFr(d.date) + '</span><span>' + (isF ? 'Échéance : ' + N.dFr(d.echeance) : 'Valable jusqu\'au ' + N.dFr(N.addD(d.date, d.validite || 30))) + '</span>' + (isF && inf.st === 'payée' ? '<span class="stamp">PAYÉE</span>' : '') + '</div></div>' +
      '<div class="doc__meta"><div class="doc__box"><small>Client</small><b>' + esc(cl.name) + '</b><br>' + esc(cl.contact || '') + '<br>' + esc(cl.city || '') + (cl.tel ? '<br>' + esc(cl.tel) : '') + '</div><div class="doc__box"><small>Objet</small><b>' + esc(d.subject) + '</b></div></div>' +
      '<table><thead><tr><th>Désignation</th><th class="r">Qté</th><th>Unité</th><th class="r">P.U. (XAF)</th><th class="r">Total (XAF)</th></tr></thead><tbody>' + d.lines.map(function (l) { return '<tr><td>' + esc(l.label) + '</td><td class="r">' + (+l.qty) + '</td><td>' + esc(l.unit) + '</td><td class="r">' + fmt(l.pu) + '</td><td class="r"><b>' + fmt(l.qty * l.pu) + '</b></td></tr>'; }).join('') + '</tbody></table>' +
      '<div class="doc__tot"><div><span>Total HT' + (d.remise ? ' avant remise' : '') + '</span><span>' + fmt(t.sub) + '</span></div>' + (d.remise ? '<div><span>Remise ' + d.remise + ' %</span><span>− ' + fmt(t.rem) + '</span></div><div><span>Total HT</span><span>' + fmt(t.ht) + '</span></div>' : '') + '<div><span>TVA ' + (d.tva === false ? '(exonéré)' : c.tva + ' %') + '</span><span>' + fmt(t.tva) + '</span></div><div class="g"><span>Total TTC</span><span>' + fmt(t.ttc) + ' XAF</span></div>' +
      (isF && inf.paid ? '<div><span>Déjà réglé</span><span>− ' + fmt(inf.paid) + '</span></div><div style="font-weight:800"><span>Reste à payer</span><span>' + fmt(inf.bal) + ' XAF</span></div>' : '') + '</div>' +
      '<p class="doc__letters">Arrêté ' + (isF ? 'la présente facture' : 'le présent devis') + ' à la somme de <b>' + N.words(t.ttc) + ' francs CFA</b> TTC.</p>' +
      (d.notes ? '<p><b>Notes :</b> ' + esc(d.notes) + '</p>' : '') + '<p style="font-size:12px;color:#4a566a"><b>Conditions :</b> ' + esc(c.conditions) + '</p>' +
      (isF ? '' : '<div class="doc__sign"><div>Le prestataire<br><b>' + esc(c.name) + '</b></div><div>Bon pour accord — date, nom et signature du client</div></div>') +
      '<div class="doc__foot">' + esc(c.name) + ' — ' + esc(c.form) + ' · NIF ' + esc(c.nif) + ' · RCCM ' + esc(c.rccm) + '<br>' + esc(c.address) + '</div></div>';
  }
  function viewDoc(type, id) {
    var d = find(S[type], id); if (!d) return;
    var isF = type === 'factures', foot = '', st;
    if (isF) { var i = facInfo(d); st = i.st;
      foot = '<button class="btn btn--danger" data-act="delDoc" data-type="factures" data-id="' + id + '">' + ic('trash') + '</button><span class="sp"></span>' + (i.bal ? '<button class="btn btn--wa" data-act="waDoc" data-type="factures" data-id="' + id + '">' + ic('wa') + (i.late ? 'Relancer' : 'Envoyer') + '</button><button class="btn btn--pri" data-act="pay" data-id="' + id + '">' + ic('cash') + 'Encaisser</button>' : '<button class="btn btn--wa" data-act="waDoc" data-type="factures" data-id="' + id + '">' + ic('wa') + 'Envoyer</button>') + (d.payments.length ? '' : '<button class="btn btn--line" data-act="editDoc" data-type="factures" data-id="' + id + '">' + ic('edit') + 'Modifier</button>') + '<button class="btn btn--dark" data-act="print">' + ic('print') + 'Imprimer / PDF</button>';
    } else { st = devSt(d); var conv = S.factures.some(function (f) { return f.devisId === id; });
      foot = '<button class="btn btn--danger" data-act="delDoc" data-type="devis" data-id="' + id + '">' + ic('trash') + '</button><span class="sp"></span>' +
        (d.status === 'brouillon' ? '<button class="btn btn--line" data-act="setSt" data-id="' + id + '" data-v="envoyé">' + ic('send') + 'Marquer envoyé</button>' : '') +
        (d.status === 'envoyé' ? '<button class="btn btn--line" data-act="setSt" data-id="' + id + '" data-v="refusé">Refusé</button><button class="btn btn--pri" data-act="setSt" data-id="' + id + '" data-v="accepté">' + ic('check') + 'Accepté</button>' : '') +
        (d.status === 'accepté' && !conv ? '<button class="btn btn--pri" data-act="toFacture" data-id="' + id + '">' + ic('facture') + 'Convertir en facture</button>' : '') + (conv ? '<span class="badge b-ok">Facturé</span>' : '') +
        '<button class="btn btn--wa" data-act="waDoc" data-type="devis" data-id="' + id + '">' + ic('wa') + 'WhatsApp</button><button class="btn btn--line" data-act="editDoc" data-type="devis" data-id="' + id + '">' + ic('edit') + 'Modifier</button><button class="btn btn--dark" data-act="print">' + ic('print') + 'Imprimer / PDF</button>'; }
    $$('#modals .ov[data-doc]').forEach(function (o) { o.remove(); });
    var m = modal({ title: (isF ? 'Facture ' : 'Devis ') + esc(d.num) + ' ' + badge(st), cls: 'modal--doc', body: docHtml(type, d), foot: foot }); m.dataset.doc = '1';
  }

  /* ---------- Éditeur de documents ---------- */
  function lineRow(l) {
    l = l || { label: '', qty: 1, unit: 'u', pu: '' };
    return '<div class="ln"><input class="in" name="label" list="dl-cat" placeholder="Désignation" value="' + esc(l.label) + '"><input class="in" name="qty" type="number" min="0" step="any" value="' + l.qty + '" inputmode="decimal"><input class="in" name="unit" value="' + esc(l.unit) + '"><input class="in" name="pu" type="number" min="0" step="any" value="' + (l.pu === '' ? '' : l.pu) + '" placeholder="Prix unit." inputmode="decimal"><div class="tot">0</div><button type="button" class="btn btn--ghost btn--icon" data-act="lnDel" aria-label="Supprimer la ligne">' + ic('x') + '</button></div>';
  }
  function editDoc(type, id, clientId) {
    var d = id ? find(S[type], id) : null, isF = type === 'factures', t = N.today();
    d = d || { clientId: clientId || '', date: t, validite: 30, echeance: N.addD(t, 30), subject: '', lines: [{ label: '', qty: 1, unit: 'u', pu: '' }], remise: 0, tva: true, notes: '' };
    var body = '<form id="mf" data-form="doc" data-type="' + type + '" data-id="' + (id || '') + '" class="stack"><datalist id="dl-cat">' + S.catalog.map(function (p) { return '<option value="' + esc(p.label) + '">'; }).join('') + '</datalist>' +
      '<div class="grid2"><label class="f">Client<select class="in" name="clientId" required><option value="">— Choisir —</option>' + S.clients.map(function (c) { return '<option value="' + c.id + '"' + (c.id === d.clientId ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select></label><label class="f">Date<input class="in" type="date" name="date" value="' + d.date + '" required></label></div>' +
      '<div class="grid2"><label class="f">Objet<input class="in" name="subject" value="' + esc(d.subject) + '" required placeholder="Ex. : Installation solaire 10 kWc"></label>' + (isF ? '<label class="f">Échéance<input class="in" type="date" name="echeance" value="' + d.echeance + '"></label>' : '<label class="f">Validité (jours)<input class="in" type="number" name="validite" value="' + (d.validite || 30) + '"></label>') + '</div>' +
      '<div><div class="ln ln--h"><span>Désignation</span><span>Qté</span><span>Unité</span><span>P.U. (XAF)</span><span style="text-align:right">Total</span><span></span></div><div class="lines" id="lines">' + d.lines.map(lineRow).join('') + '</div><div class="quick" style="margin-top:.7rem"><button type="button" class="btn btn--line btn--sm" data-act="lnAdd">' + ic('plus') + 'Ligne libre</button><select class="in" id="cat-pick" style="width:auto;min-height:34px;padding:.3rem .6rem;font-size:.85rem"><option value="">+ Depuis le catalogue…</option>' + S.catalog.map(function (p) { return '<option value="' + p.id + '">' + esc(p.label) + ' — ' + fmt(p.price) + ' XAF</option>'; }).join('') + '</select></div></div>' +
      '<div class="grid2"><label class="f">Remise (%)<input class="in" type="number" name="remise" min="0" max="100" step="any" value="' + (d.remise || 0) + '"></label><label class="f" style="align-content:end"><span style="display:flex;gap:.6rem;align-items:center;text-transform:none;letter-spacing:0;font-size:.92rem;color:var(--ink);min-height:42px"><input type="checkbox" name="tva" ' + (d.tva === false ? '' : 'checked') + ' style="width:20px;height:20px;accent-color:var(--orange)"> Appliquer la TVA (' + S.company.tva + ' %)</span></label></div>' +
      '<label class="f">Notes (facultatif)<textarea class="in" name="notes" rows="2">' + esc(d.notes || '') + '</textarea></label><div class="sum" id="sum"></div></form>';
    var foot = '<button class="btn btn--ghost" data-act="close">Annuler</button><button class="btn btn--pri" type="submit" form="mf">' + ic('check') + 'Enregistrer</button>';
    var m = modal({ title: (id ? 'Modifier' : 'Nouveau') + (isF ? ' la facture' : ' le devis'), cls: 'modal--lg', body: body, foot: foot }); recalc(m);
  }
  function readLines(root) { return $$('.ln:not(.ln--h)', root).map(function (r) { return { label: $('[name=label]', r).value.trim(), qty: +$('[name=qty]', r).value || 0, unit: $('[name=unit]', r).value.trim() || 'u', pu: +$('[name=pu]', r).value || 0 }; }).filter(function (l) { return l.label; }); }
  function recalc(root) {
    var f = $('#mf', root); if (!f) return;
    $$('.ln:not(.ln--h)', f).forEach(function (r) { $('.tot', r).textContent = fmt((+$('[name=qty]', r).value || 0) * (+$('[name=pu]', r).value || 0)); });
    var t = N.total({ lines: readLines(f), remise: +f.remise.value || 0, tva: f.tva.checked }, S.company.tva);
    $('#sum', f).innerHTML = '<div><span>Total HT</span><b>' + fmt(t.sub) + '</b></div>' + (t.rem ? '<div><span>Remise</span><b>− ' + fmt(t.rem) + '</b></div>' : '') + '<div><span>TVA</span><b>' + fmt(t.tva) + '</b></div><div class="big"><span>Total TTC</span><span>' + fmt(t.ttc) + ' XAF</span></div>';
  }

  /* ---------- Fenêtres d'édition ---------- */
  function editClient(id) {
    var c = id ? find(S.clients, id) : { name: '', type: 'Entreprise', contact: '', tel: '', email: '', city: 'Libreville' };
    var body = '<form id="mf" data-form="client" data-id="' + (id || '') + '" class="stack"><label class="f">Nom / raison sociale<input class="in" name="name" value="' + esc(c.name) + '" required></label><div class="grid2"><label class="f">Type<select class="in" name="type">' + ['Entreprise', 'Industrie', 'Santé', 'Immobilier', 'Hôtellerie', 'ONG', 'Organisation internationale', 'Administration', 'Particulier'].map(function (x) { return '<option' + (x === c.type ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label><label class="f">Ville<input class="in" name="city" value="' + esc(c.city) + '"></label></div><label class="f">Contact<input class="in" name="contact" value="' + esc(c.contact) + '"></label><div class="grid2"><label class="f">Téléphone<input class="in" name="tel" value="' + esc(c.tel) + '" inputmode="tel"></label><label class="f">E-mail<input class="in" type="email" name="email" value="' + esc(c.email) + '"></label></div></form>';
    var foot = (id ? '<button class="btn btn--danger" data-act="delClient" data-id="' + id + '">' + ic('trash') + '</button><button class="btn btn--line" data-act="newDoc" data-type="devis" data-client="' + id + '">Nouveau devis</button>' + (c.tel ? '<a class="btn btn--wa" target="_blank" rel="noopener" href="' + waLink(c.tel, 'Bonjour, ') + '">' + ic('wa') + '</a>' : '') : '') + '<span class="sp"></span><button class="btn btn--ghost" data-act="close">Annuler</button><button class="btn btn--pri" type="submit" form="mf">Enregistrer</button>';
    modal({ title: id ? 'Fiche client' : 'Nouveau client', body: body, foot: foot });
  }
  function editChantier(id) {
    var c = id ? find(S.chantiers, id) : { name: '', clientId: '', site: '', start: N.today(), end: N.addD(N.today(), 60), budget: 0, spent: 0, progress: 0, status: 'Planifié', manager: '' };
    var body = '<form id="mf" data-form="chantier" data-id="' + (id || '') + '" class="stack"><label class="f">Nom du chantier<input class="in" name="name" value="' + esc(c.name) + '" required></label><div class="grid2"><label class="f">Client<select class="in" name="clientId">' + S.clients.map(function (x) { return '<option value="' + x.id + '"' + (x.id === c.clientId ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select></label><label class="f">Lieu<input class="in" name="site" value="' + esc(c.site) + '"></label></div>' +
      '<div class="grid2"><label class="f">Début<input class="in" type="date" name="start" value="' + c.start + '"></label><label class="f">Fin prévue<input class="in" type="date" name="end" value="' + c.end + '"></label></div><div class="grid2"><label class="f">Budget (XAF)<input class="in" type="number" name="budget" value="' + c.budget + '" min="0"></label><label class="f">Dépensé (XAF)<input class="in" type="number" name="spent" value="' + c.spent + '" min="0"></label></div>' +
      '<div class="grid2"><label class="f">Statut<select class="in" name="status">' + ['Planifié', 'En cours', 'Terminé', 'Suspendu'].map(function (s) { return '<option' + (s === c.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></label><label class="f">Responsable<select class="in" name="manager"><option value="">—</option>' + S.employees.map(function (e) { return '<option value="' + e.id + '"' + (e.id === c.manager ? ' selected' : '') + '>' + esc(e.name) + '</option>'; }).join('') + '</select></label></div>' +
      '<label class="f">Avancement : <span id="pv">' + c.progress + '</span> %<input type="range" name="progress" min="0" max="100" value="' + c.progress + '" oninput="document.getElementById(\'pv\').textContent=this.value" style="width:100%;accent-color:#f08a24"></label></form>';
    modal({ title: id ? 'Chantier' : 'Nouveau chantier', body: body, foot: (id ? '<button class="btn btn--danger" data-act="delChantier" data-id="' + id + '">' + ic('trash') + '</button>' : '') + '<span class="sp"></span><button class="btn btn--ghost" data-act="close">Annuler</button><button class="btn btn--pri" type="submit" form="mf">Enregistrer</button>' });
  }
  var HABS = ['B0', 'B1V', 'B2V', 'BR', 'BC', 'H0', 'H1V', 'H2V', 'HC', 'Travail en hauteur', 'Secourisme SST', 'CACES'];
  function habRow(h) { h = h || { label: 'B2V', expire: N.addD(N.today(), 365) }; return '<div class="grid2 hab" style="grid-template-columns:1fr 1fr 40px;align-items:center"><input class="in" name="hl" list="dl-hab" value="' + esc(h.label) + '"><input class="in" type="date" name="he" value="' + h.expire + '"><button type="button" class="btn btn--ghost btn--icon" data-act="habDel">' + ic('x') + '</button></div>'; }
  function openEmp(id) {
    var e = id ? emp(id) : { name: '', poste: '', service: 'Génie civil', tel: '', contrat: 'CDI', embauche: N.today(), salaire: 0, conges: 0, habs: [] };
    var body = '<form id="mf" data-form="emp" data-id="' + (id || '') + '" class="stack"><datalist id="dl-hab">' + HABS.map(function (h) { return '<option value="' + h + '">'; }).join('') + '</datalist><div class="grid2"><label class="f">Nom complet<input class="in" name="name" value="' + esc(e.name) + '" required></label><label class="f">Poste<input class="in" name="poste" value="' + esc(e.poste) + '" required></label></div>' +
      '<div class="grid3"><label class="f">Service<select class="in" name="service">' + ['Génie civil', 'Électricité', 'Énergie', 'Administration'].map(function (s) { return '<option' + (s === e.service ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></label><label class="f">Contrat<select class="in" name="contrat">' + ['CDI', 'CDD', 'Stagiaire', 'Prestataire'].map(function (s) { return '<option' + (s === e.contrat ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></label><label class="f">Embauche<input class="in" type="date" name="embauche" value="' + e.embauche + '"></label></div>' +
      '<div class="grid3"><label class="f">Téléphone<input class="in" name="tel" value="' + esc(e.tel) + '" inputmode="tel"></label><label class="f">Salaire brut (XAF)<input class="in" type="number" name="salaire" value="' + e.salaire + '" min="0"></label><label class="f">Solde congés (j)<input class="in" type="number" name="conges" value="' + e.conges + '" min="0"></label></div>' +
      '<div><div class="card__h" style="margin-bottom:.5rem"><h3 style="font-size:.95rem">Habilitations et formations</h3><button type="button" class="btn btn--line btn--sm" data-act="habAdd">' + ic('plus') + 'Ajouter</button></div><div class="stack" id="habs" style="gap:.5rem">' + e.habs.map(habRow).join('') + '</div></div></form>';
    modal({ title: id ? esc(e.name) : 'Nouveau salarié', body: body, foot: (id ? '<button class="btn btn--danger" data-act="delEmp" data-id="' + id + '">' + ic('trash') + '</button><button class="btn btn--line" data-act="leave" data-emp="' + id + '">' + ic('cal') + 'Congé</button>' + (e.tel ? '<a class="btn btn--line" href="tel:+241' + e.tel.replace(/\D/g, '') + '">' + ic('phone') + '</a>' : '') : '') + '<span class="sp"></span><button class="btn btn--ghost" data-act="close">Annuler</button><button class="btn btn--pri" type="submit" form="mf">Enregistrer</button>' });
  }
  function editStock(id) {
    var x = id ? find(S.stock, id) : { ref: '', label: '', cat: 'Câbles', unit: 'pièce', qty: 0, min: 5, pu: 0 };
    var body = '<form id="mf" data-form="stock" data-id="' + (id || '') + '" class="stack"><label class="f">Désignation<input class="in" name="label" value="' + esc(x.label) + '" required></label><div class="grid3"><label class="f">Référence<input class="in" name="ref" value="' + esc(x.ref) + '"></label><label class="f">Catégorie<select class="in" name="cat">' + ['Câbles', 'Protection', 'Solaire', 'Sécurité (EPI)', 'Gros œuvre', 'Finitions'].map(function (s) { return '<option' + (s === x.cat ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></label><label class="f">Unité<input class="in" name="unit" value="' + esc(x.unit) + '"></label></div><div class="grid3"><label class="f">Quantité<input class="in" type="number" name="qty" value="' + x.qty + '" min="0" step="any"></label><label class="f">Seuil d\'alerte<input class="in" type="number" name="min" value="' + x.min + '" min="0"></label><label class="f">Prix d\'achat (XAF)<input class="in" type="number" name="pu" value="' + x.pu + '" min="0"></label></div></form>';
    modal({ title: id ? 'Article' : 'Nouvel article', body: body, foot: (id ? '<button class="btn btn--danger" data-act="delStock" data-id="' + id + '">' + ic('trash') + '</button>' : '') + '<span class="sp"></span><button class="btn btn--ghost" data-act="close">Annuler</button><button class="btn btn--pri" type="submit" form="mf">Enregistrer</button>' });
  }
  function leaveModal(empId) {
    var t = N.today();
    modal({ title: 'Poser un congé / une absence', body: '<form id="mf" data-form="leave" class="stack"><label class="f">Salarié<select class="in" name="emp">' + S.employees.map(function (e) { return '<option value="' + e.id + '"' + (e.id === empId ? ' selected' : '') + '>' + esc(e.name) + ' — ' + e.conges + ' j restants</option>'; }).join('') + '</select></label><div class="grid2"><label class="f">Du<input class="in" type="date" name="from" value="' + t + '" required></label><label class="f">Au<input class="in" type="date" name="to" value="' + t + '" required></label></div><label class="f">Type<select class="in" name="type"><option value="conge">Congé payé</option><option value="formation">Formation</option><option value="maladie">Maladie</option></select></label><p style="color:var(--muted);font-size:.85rem">Les jours ouvrés (lun–sam) sont reportés dans le planning ; un congé payé déduit le solde.</p></form>', foot: '<button class="btn btn--ghost" data-act="close">Annuler</button><button class="btn btn--pri" type="submit" form="mf">Valider</button>' });
  }
  function payModal(id) {
    var f = find(S.factures, id), i = facInfo(f);
    modal({ title: 'Encaisser — ' + esc(f.num), body: '<p style="margin-bottom:1rem;color:var(--muted)">Reste dû : <b style="color:var(--navy)">' + fmt(i.bal) + ' XAF</b> · ' + esc(cli(f.clientId).name) + '</p><form id="mf" data-form="pay" data-id="' + id + '" class="stack"><label class="f">Montant reçu (XAF)<input class="in" type="number" name="amount" value="' + Math.round(i.bal) + '" min="1" required inputmode="numeric"></label><div class="grid2"><label class="f">Date<input class="in" type="date" name="date" value="' + N.today() + '"></label><label class="f">Mode<select class="in" name="mode"><option>Virement</option><option>Mobile Money</option><option>Espèces</option><option>Chèque</option></select></label></div></form>', foot: '<button class="btn btn--ghost" data-act="close">Annuler</button><button class="btn btn--pri" type="submit" form="mf">' + ic('check') + 'Enregistrer le paiement</button>' });
  }
  function mvtModal(id, type) {
    var x = find(S.stock, id);
    modal({ title: (type === 'in' ? 'Entrée de stock' : 'Sortie de stock') + ' — ' + esc(x.label), body: '<p style="margin-bottom:1rem;color:var(--muted)">En stock : <b style="color:var(--navy)">' + x.qty + ' ' + esc(x.unit) + '</b></p><form id="mf" data-form="mvt" data-id="' + id + '" data-t="' + type + '" class="stack"><label class="f">Quantité<input class="in" type="number" name="qty" min="1" value="1" required step="any" inputmode="decimal"></label><label class="f">' + (type === 'in' ? 'Fournisseur / bon de livraison' : 'Chantier concerné') + (type === 'in' ? '<input class="in" name="note" placeholder="Ex. : BL 2041">' : '<select class="in" name="note">' + S.chantiers.map(function (c) { return '<option>' + esc(c.name) + '</option>'; }).join('') + '<option>Autre usage</option></select>') + '</label></form>', foot: '<button class="btn btn--ghost" data-act="close">Annuler</button><button class="btn btn--pri" type="submit" form="mf">Valider</button>' });
  }
  function planCell(empId, day) {
    var e = emp(empId), cur = S.planning[day + '|' + empId], bad = e.habs.filter(function (h) { return habState(h) === 'bad'; });
    var opts = S.chantiers.filter(function (c) { return c.status !== 'Terminé'; }).map(function (c) { return '<button data-act="planPick" data-v="' + c.id + '" class="' + (cur === c.id ? 'is-on' : '') + '"><i style="background:' + chaCol(c.id) + '"></i>' + esc(c.name) + '</button>'; }).join('') +
      [['conge', 'Congé', '#8a97ad'], ['formation', 'Formation', '#6c4fb8'], ['maladie', 'Maladie', '#c0575a'], ['', 'Libre (aucune affectation)', '#d5dbe6']].map(function (o) { return '<button data-act="planPick" data-v="' + o[0] + '" class="' + ((cur || '') === o[0] ? 'is-on' : '') + '"><i style="background:' + o[2] + '"></i>' + o[1] + '</button>'; }).join('');
    var m = modal({ title: esc(e.name) + ' — ' + N.dFr(day, { weekday: 'long', day: 'numeric', month: 'long' }), body: (bad.length ? '<p class="badge b-bad" style="margin-bottom:.8rem;white-space:normal;display:block">⚠ Habilitation expirée : ' + bad.map(function (h) { return h.label; }).join(', ') + ' — ne pas affecter à des travaux électriques.</p>' : '') + '<label style="display:flex;gap:.6rem;align-items:center;margin-bottom:1rem;font-weight:700"><input type="checkbox" id="wk" style="width:20px;height:20px;accent-color:var(--orange)"> Appliquer à toute la semaine (lun → ven)</label><div class="pick">' + opts + '</div>' });
    m.dataset.emp = empId; m.dataset.day = day;
  }

  /* ---------- Actions ---------- */
  var A = {
    close: function () { closeTop(); }, go: function (el) { closeAll(); location.hash = '#/' + el.dataset.id; }, planGo: function () { location.hash = '#/planning'; },
    chip: function (el) { UI.f[el.dataset.key] = el.dataset.v; render(true); },
    newDoc: function (el) { closeAll(); editDoc(el.dataset.type, null, el.dataset.client); },
    editDoc: function (el) { closeAll(); editDoc(el.dataset.type, el.dataset.id); },
    viewDoc: function (el) { viewDoc(el.dataset.type, el.dataset.id); },
    print: function () { window.print(); },
    lnAdd: function (el) { var l = $('#lines'); l.insertAdjacentHTML('beforeend', lineRow()); recalc(l.closest('.ov')); },
    lnDel: function (el) { var l = $('#lines'); if ($$('.ln', l).length > 1) el.closest('.ln').remove(); else $$('input', el.closest('.ln')).forEach(function (i) { i.value = ''; }); recalc(l.closest('.ov')); },
    setSt: function (el) { var d = find(S.devis, el.dataset.id); d.status = el.dataset.v; persist('Devis ' + d.num + ' ' + el.dataset.v + ' — ' + cli(d.clientId).name); closeAll(); render(); viewDoc('devis', d.id); toast('Statut mis à jour'); },
    toFacture: function (el) {
      var d = find(S.devis, el.dataset.id), t = N.today();
      var f = { id: N.uid('f'), num: N.nextNum('FAC', S.factures), clientId: d.clientId, devisId: d.id, date: t, echeance: N.addD(t, 30), subject: d.subject, lines: JSON.parse(JSON.stringify(d.lines)), remise: d.remise, tva: d.tva, notes: d.notes, payments: [] };
      S.factures.push(f); persist('Facture ' + f.num + ' créée depuis ' + d.num); closeAll(); location.hash = '#/factures'; render(); viewDoc('factures', f.id); toast('Facture ' + f.num + ' créée');
    },
    delDoc: function (el) { if (!confirm('Supprimer ce document définitivement ?')) return; var ty = el.dataset.type; S[ty] = S[ty].filter(function (x) { return x.id !== el.dataset.id; }); persist('Document supprimé'); closeAll(); render(); toast('Document supprimé'); },
    waDoc: function (el) {
      var ty = el.dataset.type, d = find(S[ty], el.dataset.id), c = cli(d.clientId), t = tot(d);
      var msg = ty === 'devis' ? 'Bonjour, veuillez trouver notre devis ' + d.num + ' (' + d.subject + ') d\'un montant de ' + fmt(t.ttc) + ' XAF TTC. NMJ Services.' : (facInfo(d).late ? 'Bonjour, sauf erreur de notre part la facture ' + d.num + ' (' + fmt(facInfo(d).bal) + ' XAF) reste à régler. Merci de nous indiquer la date de paiement. NMJ Services.' : 'Bonjour, veuillez trouver notre facture ' + d.num + ' (' + d.subject + ') d\'un montant de ' + fmt(t.ttc) + ' XAF TTC, échéance le ' + N.dFr(d.echeance) + '. NMJ Services.');
      window.open(waLink(c.tel, msg), '_blank', 'noopener');
    },
    pay: function (el) { payModal(el.dataset.id); },
    editClient: function (el) { editClient(el.dataset.id); }, delClient: function (el) { if (S.factures.concat(S.devis).some(function (x) { return x.clientId === el.dataset.id; })) { toast('Ce client a des documents : suppression impossible'); return; } if (!confirm('Supprimer ce client ?')) return; S.clients = S.clients.filter(function (c) { return c.id !== el.dataset.id; }); persist(); closeAll(); render(); },
    editChantier: function (el) { editChantier(el.dataset.id); }, delChantier: function (el) { if (!confirm('Supprimer ce chantier ?')) return; S.chantiers = S.chantiers.filter(function (c) { return c.id !== el.dataset.id; }); Object.keys(S.planning).forEach(function (k) { if (S.planning[k] === el.dataset.id) delete S.planning[k]; }); persist(); closeAll(); render(); },
    openEmp: function (el) { openEmp(el.dataset.id); }, habAdd: function () { $('#habs').insertAdjacentHTML('beforeend', habRow()); }, habDel: function (el) { el.closest('.hab').remove(); },
    delEmp: function (el) { if (!confirm('Supprimer ce salarié ?')) return; var id = el.dataset.id; S.employees = S.employees.filter(function (e) { return e.id !== id; }); Object.keys(S.planning).forEach(function (k) { if (k.split('|')[1] === id) delete S.planning[k]; }); persist('Salarié supprimé'); closeAll(); render(); },
    leave: function (el) { closeAll(); leaveModal(el.dataset.emp); },
    editStock: function (el) { editStock(el.dataset.id); }, delStock: function (el) { if (!confirm('Supprimer cet article ?')) return; S.stock = S.stock.filter(function (x) { return x.id !== el.dataset.id; }); persist(); closeAll(); render(); },
    mvt: function (el) { mvtModal(el.dataset.id, el.dataset.t); },
    week: function (el) { var d = +el.dataset.d; UI.week = d === 0 ? N.monday(N.today()) : N.addD(UI.week, d); render(true); },
    planCell: function (el) { planCell(el.dataset.emp, el.dataset.day); },
    planPick: function (el) {
      var m = el.closest('.ov'), e = m.dataset.emp, day = m.dataset.day, v = el.dataset.v, all = $('#wk', m).checked, list = all ? [0, 1, 2, 3, 4].map(function (i) { return N.addD(N.monday(day), i); }) : [day];
      list.forEach(function (d) { if (v) S.planning[d + '|' + e] = v; else delete S.planning[d + '|' + e]; });
      persist(); closeAll(); render(true); toast('Planning mis à jour');
    },
    export: function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' })); a.download = 'nmj-gestion-' + N.today() + '.json'; a.click(); },
    reset: function () { if (!confirm('Remettre toutes les données d\'exemple à zéro ?')) return; S = N.reset(); render(); toast('Données réinitialisées'); },
    create: function () {
      modal({ title: 'Créer…', body: '<div class="pick">' + [['devis', 'Nouveau devis', 'devis'], ['factures', 'Nouvelle facture', 'facture'], ['client', 'Nouveau client', 'users'], ['chantier', 'Nouveau chantier', 'chantier'], ['leave', 'Poser un congé', 'cal'], ['emp', 'Nouveau salarié', 'team'], ['stock', 'Nouvel article de stock', 'box']].map(function (x) { return '<button data-act="createGo" data-v="' + x[0] + '">' + ic(x[2]) + x[1] + '</button>'; }).join('') + '</div>' });
    },
    createGo: function (el) { var v = el.dataset.v; closeAll(); if (v === 'devis' || v === 'factures') editDoc(v); else if (v === 'client') editClient(); else if (v === 'chantier') editChantier(); else if (v === 'leave') leaveModal(); else if (v === 'emp') openEmp(); else editStock(); },
    more: function () { modal({ title: 'Menu', body: '<div class="pick">' + ROUTES.map(function (r) { return '<button data-act="go" data-id="' + r[0] + '">' + ic(r[2]) + r[1] + '</button>'; }).join('') + '<button data-act="logout">' + ic('out') + 'Se déconnecter</button></div>' }); },
    logout: function () { try { sessionStorage.removeItem('nmj-auth'); } catch (e) {} closeAll(); $('#login').hidden = false; },
    enter: function () { try { sessionStorage.setItem('nmj-auth', '1'); } catch (e) {} $('#login').hidden = true; }
  };

  /* ---------- Formulaires ---------- */
  var F = {
    doc: function (f) {
      var type = f.dataset.type, id = f.dataset.id, lines = readLines(f);
      if (!f.clientId.value) { toast('Choisissez un client'); return; } if (!lines.length) { toast('Ajoutez au moins une ligne'); return; }
      var isF = type === 'factures', d = id ? find(S[type], id) : { id: N.uid(isF ? 'f' : 'd') };
      Object.assign(d, { clientId: f.clientId.value, date: f.date.value, subject: f.subject.value.trim(), lines: lines, remise: +f.remise.value || 0, tva: f.tva.checked, notes: f.notes.value.trim() });
      if (isF) { d.echeance = f.echeance.value || N.addD(d.date, 30); d.payments = d.payments || []; if (!id) d.num = N.nextNum('FAC', S.factures, d.date); } else { d.validite = +f.validite.value || 30; if (!id) { d.status = 'brouillon'; d.num = N.nextNum('DEV', S.devis, d.date); } }
      if (!id) S[type].push(d); persist((isF ? 'Facture ' : 'Devis ') + d.num + (id ? ' modifié' : ' créé') + ' — ' + cli(d.clientId).name);
      closeAll(); location.hash = '#/' + type; render(); viewDoc(type, d.id); toast((isF ? 'Facture ' : 'Devis ') + 'enregistré');
    },
    client: function (f) { var id = f.dataset.id, c = id ? find(S.clients, id) : { id: N.uid('cl') }; ['name', 'type', 'city', 'contact', 'tel', 'email'].forEach(function (k) { c[k] = f[k].value.trim(); }); if (!id) S.clients.push(c); persist('Client ' + c.name + (id ? ' mis à jour' : ' ajouté')); closeAll(); render(); toast('Client enregistré'); },
    chantier: function (f) { var id = f.dataset.id, c = id ? find(S.chantiers, id) : { id: N.uid('c') }; Object.assign(c, { name: f.name.value.trim(), clientId: f.clientId.value, site: f.site.value.trim(), start: f.start.value, end: f.end.value, budget: +f.budget.value || 0, spent: +f.spent.value || 0, status: f.status.value, manager: f.manager.value, progress: +f.progress.value || 0 }); if (!id) S.chantiers.push(c); persist('Chantier « ' + c.name + ' » : avancement ' + c.progress + ' %'); closeAll(); render(); toast('Chantier enregistré'); },
    emp: function (f) {
      var id = f.dataset.id, e = id ? emp(id) : { id: N.uid('e'), habs: [] };
      Object.assign(e, { name: f.name.value.trim(), poste: f.poste.value.trim(), service: f.service.value, contrat: f.contrat.value, embauche: f.embauche.value, tel: f.tel.value.trim(), salaire: +f.salaire.value || 0, conges: +f.conges.value || 0 });
      e.email = e.email || e.name.toLowerCase().split(' ')[0].normalize('NFD').replace(/[̀-ͯ]/g, '') + '@nmj.example';
      e.habs = $$('.hab', f).map(function (r) { return { label: $('[name=hl]', r).value.trim(), expire: $('[name=he]', r).value }; }).filter(function (h) { return h.label && h.expire; });
      if (!id) S.employees.push(e); persist('Salarié ' + e.name + (id ? ' mis à jour' : ' ajouté')); closeAll(); render(); toast('Salarié enregistré');
    },
    stock: function (f) { var id = f.dataset.id, x = id ? find(S.stock, id) : { id: N.uid('s') }; Object.assign(x, { label: f.label.value.trim(), ref: f.ref.value.trim(), cat: f.cat.value, unit: f.unit.value.trim() || 'pièce', qty: +f.qty.value || 0, min: +f.min.value || 0, pu: +f.pu.value || 0 }); if (!id) S.stock.push(x); persist(); closeAll(); render(); toast('Article enregistré'); },
    mvt: function (f) { var x = find(S.stock, f.dataset.id), q = +f.qty.value, t = f.dataset.t; if (t === 'out' && q > x.qty) { toast('Stock insuffisant (' + x.qty + ' ' + x.unit + ')'); return; } x.qty += t === 'in' ? q : -q; S.mvts.unshift({ ts: Date.now(), itemId: x.id, type: t, qty: q, note: f.note.value }); persist((t === 'in' ? 'Entrée' : 'Sortie') + ' de stock : ' + q + ' × ' + x.label); closeAll(); render(); toast('Mouvement enregistré'); },
    pay: function (f) { var fa = find(S.factures, f.dataset.id); fa.payments.push({ id: N.uid('p'), date: f.date.value, amount: +f.amount.value, mode: f.mode.value }); persist('Paiement de ' + fmt(+f.amount.value) + ' XAF — ' + cli(fa.clientId).name); closeAll(); render(); viewDoc('factures', fa.id); toast('Paiement enregistré'); },
    leave: function (f) {
      var e = emp(f.emp.value), a = f.from.value, b = f.to.value, ty = f.type.value, n = 0; if (b < a) { toast('La date de fin précède le début'); return; }
      for (var d = a; d <= b; d = N.addD(d, 1)) { if (N.parse(d).getDay() !== 0) { S.planning[d + '|' + e.id] = ty; n++; } }
      if (ty === 'conge') e.conges = Math.max(0, e.conges - n); persist(n + ' jour(s) ' + (ty === 'conge' ? 'de congé' : ty) + ' — ' + e.name); closeAll(); render(); toast(n + ' jour(s) ajouté(s) au planning');
    },
    company: function (f) { var c = S.company; ['name', 'form', 'address', 'tel', 'email', 'nif', 'rccm', 'conditions'].forEach(function (k) { c[k] = f[k].value.trim(); }); c.tva = +f.tva.value || 0; persist(); toast('Paramètres enregistrés'); }
  };

  /* ---------- Routeur et rendu ---------- */
  function render(keepQ) {
    var r = UI.route; if (!keepQ) { /* conserve la recherche si même vue */ }
    $$('.nav__a,.tabbar [data-r]').forEach(function (a) { a.classList.toggle('is-on', a.dataset.r === r); });
    var meta = ROUTES.filter(function (x) { return x[0] === r; })[0]; $('#title').textContent = meta[1];
    $('#view').innerHTML = V[r](); $('#view').style.animation = 'none'; void $('#view').offsetWidth; $('#view').style.animation = '';
    var counts = { devis: S.devis.filter(function (d) { return devSt(d) === 'envoyé'; }).length, factures: S.factures.filter(function (f) { return facInfo(f).st === 'en retard'; }).length };
    $$('.nav__a .n').forEach(function (n) { var k = n.parentNode.dataset.r; n.textContent = counts[k] || ''; n.hidden = !counts[k]; });
    $$('.bar i').forEach(function (b) { var w = b.style.width; b.style.width = '0'; requestAnimationFrame(function () { requestAnimationFrame(function () { b.style.width = w; }); }); });
  }
  function route() { var h = (location.hash || '#/dashboard').replace('#/', ''); if (!V[h]) h = 'dashboard'; if (h !== UI.route) { UI.q = ''; } UI.route = h; render(); window.scrollTo(0, 0); }

  function build() {
    var secs = {}, nav = '';
    ROUTES.forEach(function (r) { if (!secs[r[3]]) { secs[r[3]] = 1; nav += '<div class="nav__sec">' + r[3] + '</div>'; } nav += '<a class="nav__a" href="#/' + r[0] + '" data-r="' + r[0] + '">' + ic(r[2]) + r[1] + '<span class="n" hidden></span></a>'; });
    $('#nav').innerHTML = nav;
    var tb = [['devis', 'Devis', 'devis'], ['factures', 'Factures', 'facture']], tb2 = [['planning', 'Planning', 'cal']];
    $('#tabbar').innerHTML = tb.map(function (x) { return '<a href="#/' + x[0] + '" data-r="' + x[0] + '">' + ic(x[2]) + '<span>' + x[1] + '</span></a>'; }).join('') + '<button class="plus" data-act="create" aria-label="Créer">' + ic('plus') + '<span>Créer</span></button>' + tb2.map(function (x) { return '<a href="#/' + x[0] + '" data-r="' + x[0] + '">' + ic(x[2]) + '<span>' + x[1] + '</span></a>'; }).join('') + '<button data-act="more">' + ic('grid') + '<span>Plus</span></button>';
    $('#date').textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  document.addEventListener('click', function (e) { var el = e.target.closest('[data-act]'); if (!el) return; var fn = A[el.dataset.act]; if (fn) { fn(el, e); } });
  document.addEventListener('submit', function (e) { var f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault(); F[f.dataset.form](f); });
  document.addEventListener('input', function (e) {
    var s = e.target.closest('[data-search]'); if (s) { UI.q = s.value; var r = $('#res'); if (r && UI.res) r.innerHTML = UI.res(); return; }
    var ov = e.target.closest('.ov'); if (ov && $('#mf', ov) && $('#lines', ov)) {
      if (e.target.name === 'label') { var p = S.catalog.filter(function (x) { return x.label === e.target.value; })[0]; if (p) { var row = e.target.closest('.ln'); $('[name=unit]', row).value = p.unit; $('[name=pu]', row).value = p.price; } }
      recalc(ov);
    }
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'cat-pick' && e.target.value) { var p = find(S.catalog, e.target.value), l = $('#lines'); l.insertAdjacentHTML('beforeend', lineRow({ label: p.label, qty: 1, unit: p.unit, pu: p.price })); e.target.value = ''; recalc(l.closest('.ov')); }
    if (e.target.matches('[data-import]')) { var fl = e.target.files[0]; if (!fl) return; var rd = new FileReader(); rd.onload = function () { try { var j = JSON.parse(rd.result); if (j.v !== 2 || !j.clients) throw 0; S = j; N.setState(j); render(); toast('Données importées'); } catch (x) { toast('Fichier invalide'); } }; rd.readAsText(fl); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeTop(); });
  window.addEventListener('hashchange', route);

  build();
  try { if (sessionStorage.getItem('nmj-auth') === '1') $('#login').hidden = true; } catch (e) {}
  route();
})();
