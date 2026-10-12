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
  var UI = { route: 'dashboard', q: '', f: {}, week: N.monday(N.today()), planTab: 'equipes', gz: 'week', gc: 'all' };
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
  function persist(msg) { N.setState(S); if (msg) N.log(msg); var ok = N.save(); if (!ok) toast('Stockage du navigateur plein : supprimez des documents volumineux'); return ok; }
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
    S.employees.forEach(function (e) { var ms = medState(e); if (ms === 'bad' || ms === 'warn') al.push({ k: ms, i: 'team', t: 'Visite médicale — ' + e.name, s: ms === 'bad' ? 'Aptitude expirée depuis ' + Math.abs(N.diff(e.visite.expire, t)) + ' j' : 'Expire dans ' + N.diff(e.visite.expire, t) + ' j : prendre rendez-vous', a: 'openEmp', id: e.id }); });
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
  function planningTeams() {
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
  }

  /* ----- Planning : onglets Équipes / Travaux (Gantt) ----- */
  V.planning = function () {
    var tabs = '<div class="chips">' + [['equipes', 'Équipes (semaine)'], ['gantt', 'Planning travaux (Gantt)']].map(function (x) { return '<button class="chip ' + (UI.planTab === x[0] ? 'is-on' : '') + '" data-act="planTab" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    return tabs + (UI.planTab === 'gantt' ? ganttView() : planningTeams());
  };
  var GZ = { day: 34, week: 16, month: 5 };
  function syncChantier(cid) {
    var l = S.tasks.filter(function (t) { return t.chantierId === cid && !t.milestone; }), c = find(S.chantiers, cid); if (!c || !l.length) return;
    var w = 0, s = 0; l.forEach(function (t) { var d = N.diff(t.end, t.start) + 1; w += d; s += d * t.progress; }); c.progress = Math.round(s / w);
  }
  function taskChanged(t, msg) { syncChantier(t.chantierId); persist('Tâche « ' + t.name + ' » ' + msg); var g = $('#gt'); if (g) UI.gs = [g.scrollLeft, g.scrollTop]; render(true); }
  function ganttView() {
    var GN = window.innerWidth <= 760 ? 150 : 250, today = N.today(), dw = GZ[UI.gz] || 16, tasks = S.tasks.filter(function (t) { return UI.gc === 'all' || t.chantierId === UI.gc; });
    var late = tasks.filter(function (t) { return !t.milestone && t.end < today && t.progress < 100; }).length;
    var doing = tasks.filter(function (t) { return !t.milestone && t.start <= today && t.end >= today && t.progress < 100; }).length;
    var done = tasks.filter(function (t) { return t.progress >= 100; }).length;
    var kp = '<div class="kpis">' + kpi('Tâches', tasks.length, S.chantiers.length + ' chantiers suivis', 'grid', true) + kpi('En cours', doing, 'aujourd\'hui', 'clock') + kpi('En retard', late, late ? 'à replanifier' : 'aucun retard', 'alert') + kpi('Terminées', done, Math.round(done / (tasks.length || 1) * 100) + ' % des tâches', 'check') + '</div>';
    var tb = '<div class="toolbar"><select class="in" data-gc style="width:auto"><option value="all">Tous les chantiers</option>' + S.chantiers.map(function (c) { return '<option value="' + c.id + '"' + (UI.gc === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select><div class="chips">' + [['day', 'Jour'], ['week', 'Semaine'], ['month', 'Mois']].map(function (z) { return '<button class="chip ' + (UI.gz === z[0] ? 'is-on' : '') + '" data-act="gz" data-v="' + z[0] + '">' + z[1] + '</button>'; }).join('') + '</div><button class="btn btn--line" data-act="gtToday">Aujourd\'hui</button><span style="flex:1"></span><button class="btn btn--pri" data-act="taskEdit">' + ic('plus') + 'Tâche</button></div>';
    if (!tasks.length) return kp + tb + '<div class="card empty">Aucune tâche pour ce chantier. Ajoutez la première.</div>';
    var min = tasks.reduce(function (a, t) { return t.start < a ? t.start : a; }, tasks[0].start), max = tasks.reduce(function (a, t) { return t.end > a ? t.end : a; }, tasks[0].end);
    var origin = N.monday(N.addD(min, -7)), endD = N.addD(max, 21), days = N.diff(endD, origin) + 1, W = days * dw;
    var showDays = dw >= 26, showWeeks = dw >= 12, HH = (showDays || showWeeks) ? 58 : 30, i, months = '', sub = '';
    for (i = 0; i < days;) { var m = N.parse(N.addD(origin, i)), nxt = new Date(m.getFullYear(), m.getMonth() + 1, 1), n = Math.min(days - i, Math.round((nxt - m) / 86400000)); months += '<div class="gt-m" style="width:' + n * dw + 'px">' + (n * dw > 90 ? m.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : (n * dw > 30 ? m.toLocaleDateString('fr-FR', { month: 'short' }) : '')) + '</div>'; i += n; }
    if (showDays) { for (i = 0; i < days; i++) { var dd = N.addD(origin, i), p = N.parse(dd); sub += '<div class="gt-d' + ((p.getDay() === 0 || p.getDay() === 6) ? ' we' : '') + (dd === today ? ' now' : '') + '" style="width:' + dw + 'px">' + p.getDate() + '</div>'; } }
    else if (showWeeks) { for (i = 0; i < days; i += 7) { var pw = N.parse(N.addD(origin, i)); sub += '<div class="gt-d" style="width:' + 7 * dw + 'px">' + pw.getDate() + '/' + (pw.getMonth() + 1) + '</div>'; } }
    var rows = [], y = HH, byId = {};
    S.chantiers.filter(function (c) { return tasks.some(function (t) { return t.chantierId === c.id; }); }).forEach(function (c) {
      rows.push({ k: 'g', c: c, y: y, h: 46 }); y += 46;
      tasks.filter(function (t) { return t.chantierId === c.id; }).sort(function (a, b) { return a.start < b.start ? -1 : (a.start > b.start ? 1 : 0); }).forEach(function (t) { var r = { k: 't', t: t, y: y, h: 42 }; rows.push(r); byId[t.id] = r; y += 42; });
    });
    var H = y, bg = 'background-image:repeating-linear-gradient(90deg,transparent 0,transparent ' + 5 * dw + 'px,rgba(14,26,46,.05) ' + 5 * dw + 'px,rgba(14,26,46,.05) ' + 7 * dw + 'px),linear-gradient(90deg,rgba(14,26,46,.08) 1px,transparent 1px);background-size:' + 7 * dw + 'px 100%;';
    var body = rows.map(function (r) {
      if (r.k === 'g') {
        var c = r.c, ts = tasks.filter(function (t) { return t.chantierId === c.id; }), s0 = ts.reduce(function (a, t) { return t.start < a ? t.start : a; }, ts[0].start), e0 = ts.reduce(function (a, t) { return t.end > a ? t.end : a; }, ts[0].end), col = chaCol(c.id);
        return '<div class="gt-r gt-g" style="height:46px"><div class="gt-n" style="width:' + GN + 'px;border-left:4px solid ' + col + '"><b>' + esc(c.name) + '</b><small>' + c.progress + ' % · ' + N.dFr(c.start, { day: 'numeric', month: 'short' }) + ' → ' + N.dFr(c.end, { day: 'numeric', month: 'short' }) + '</small></div><div class="gt-l" style="width:' + W + 'px;' + bg + '"><i class="gt-sum" style="left:' + N.diff(s0, origin) * dw + 'px;width:' + (N.diff(e0, s0) + 1) * dw + 'px;background:' + col + '"></i></div></div>';
      }
      var t = r.t, col = chaCol(t.chantierId), x = N.diff(t.start, origin) * dw, w = (N.diff(t.end, t.start) + 1) * dw, a = emp(t.assignee), lt = !t.milestone && t.end < today && t.progress < 100;
      var bar = t.milestone ? '<button class="gm" data-act="taskEdit" data-id="' + t.id + '" style="left:' + (x + dw / 2 - 10) + 'px;color:' + col + '" aria-label="Jalon ' + esc(t.name) + '"><i></i></button>'
        : '<div class="gb' + (lt ? ' is-late' : '') + (t.progress >= 100 ? ' is-done' : '') + '" data-act="taskEdit" data-id="' + t.id + '" data-dw="' + dw + '" style="left:' + x + 'px;width:' + w + 'px;background:' + col + '" title="' + esc(t.name) + ' — ' + t.progress + ' %"><i class="gb-p" style="width:' + t.progress + '%"></i><span class="gb-t">' + (w > 70 ? t.progress + ' %' : '') + '</span><b class="gb-h"></b></div>' + (w <= 70 ? '<span class="gb-o" style="left:' + (x + w + 6) + 'px">' + t.progress + ' %</span>' : '');
      return '<div class="gt-r" style="height:42px"><div class="gt-n" data-act="taskEdit" data-id="' + t.id + '" style="width:' + GN + 'px;cursor:pointer"><b>' + (t.milestone ? '◆ ' : '') + esc(t.name) + '</b><small>' + (a ? esc(a.name) + ' · ' : '') + N.dFr(t.start, { day: 'numeric', month: 'short' }) + (t.milestone ? '' : ' → ' + N.dFr(t.end, { day: 'numeric', month: 'short' })) + (lt ? ' · <span style="color:var(--bad)">en retard</span>' : '') + '</small></div><div class="gt-l" style="width:' + W + 'px;' + bg + '">' + bar + '</div></div>';
    }).join('');
    var svg = '';
    tasks.forEach(function (t) {
      var d = t.dep && byId[t.dep], r = byId[t.id]; if (!d || !r) return;
      var x1 = GN + (N.diff(d.t.end, origin) + 1) * dw, y1 = d.y + d.h / 2, x2 = GN + N.diff(t.start, origin) * dw + (t.milestone ? dw / 2 - 10 : 0), y2 = r.y + r.h / 2, xm = x1 + 7;
      svg += '<path d="M' + x1 + ' ' + y1 + ' H' + xm + ' V' + y2 + ' H' + (x2 - 1) + '" fill="none" stroke="#7a8aa5" stroke-width="1.4"/><path d="M' + (x2 - 1) + ' ' + y2 + ' l-5 -3.5 v7z" fill="#7a8aa5"/>';
    });
    var tl = (today >= origin && today <= endD) ? '<i class="gt-today" style="left:' + (GN + N.diff(today, origin) * dw + dw / 2) + 'px"></i>' : '';
    var legend = S.chantiers.map(function (c) { return '<span><i style="background:' + chaCol(c.id) + '"></i>' + esc(c.name.split(' — ')[0]) + '</span>'; }).join('') + '<span><i style="background:#0e1a2e;opacity:.6"></i>Part réalisée</span><span>◆ Jalon</span><span><i style="background:#d9402f"></i>Tâche en retard</span><span>│ Aujourd\'hui</span>';
    UI.gOrigin = { origin: origin, dw: dw };
    return kp + tb + '<div class="gt-scroll" id="gt"><div class="gt" style="width:' + (GN + W) + 'px;height:' + H + 'px"><div class="gt-h" style="height:' + HH + 'px"><div class="gt-n gt-hn" style="width:' + GN + 'px">Tâches</div><div style="width:' + W + 'px"><div class="gt-mr">' + months + '</div>' + (sub ? '<div class="gt-dr">' + sub + '</div>' : '') + '</div></div>' + body + '<svg class="gt-svg" width="' + (GN + W) + '" height="' + H + '">' + svg + '</svg>' + tl + '</div></div>' +
      '<div class="card"><div class="legend">' + legend + '</div><p style="margin-top:.7rem;color:var(--muted);font-size:.85rem;font-weight:600">Touchez une tâche pour la modifier. Sur ordinateur, glissez une barre pour la décaler ou tirez son bord droit pour changer la durée. L\'avancement du chantier se calcule à partir de ses tâches.</p></div>';
  }
  function taskEdit(id, cid) {
    var t = id ? find(S.tasks, id) : { name: '', chantierId: cid || (UI.gc !== 'all' ? UI.gc : S.chantiers[0].id), start: N.today(), end: N.addD(N.today(), 7), progress: 0, dep: '', assignee: '', milestone: false };
    var depOpts = function (cid2, cur, self) { return '<option value="">— Aucune —</option>' + S.tasks.filter(function (x) { return x.chantierId === cid2 && x.id !== self; }).map(function (x) { return '<option value="' + x.id + '"' + (x.id === cur ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join(''); };
    var body = '<form id="mf" data-form="task" data-id="' + (id || '') + '" class="stack"><label class="f">Tâche<input class="in" name="name" value="' + esc(t.name) + '" required placeholder="Ex. : Pose des panneaux"></label>' +
      '<div class="grid2"><label class="f">Chantier<select class="in" name="chantierId">' + S.chantiers.map(function (c) { return '<option value="' + c.id + '"' + (c.id === t.chantierId ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select></label><label class="f">Responsable<select class="in" name="assignee"><option value="">—</option>' + S.employees.filter(function (e) { return e.service !== 'Administration'; }).map(function (e) { return '<option value="' + e.id + '"' + (e.id === t.assignee ? ' selected' : '') + '>' + esc(e.name) + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="grid2"><label class="f">Début<input class="in" type="date" name="start" value="' + t.start + '" required></label><label class="f">Fin<input class="in" type="date" name="end" value="' + t.end + '" required></label></div>' +
      '<label class="f">Démarre après (dépendance)<select class="in" name="dep">' + depOpts(t.chantierId, t.dep, t.id) + '</select></label>' +
      '<label class="f"><span>Avancement : <b id="pv">' + t.progress + '</b> %</span><input type="range" name="progress" min="0" max="100" step="5" value="' + t.progress + '" oninput="document.getElementById(\'pv\').textContent=this.value" style="width:100%;accent-color:#f08a24"></label>' +
      '<label style="display:flex;gap:.6rem;align-items:center;font-weight:700"><input type="checkbox" name="milestone" ' + (t.milestone ? 'checked' : '') + ' style="width:20px;height:20px;accent-color:var(--orange)"> Jalon (étape clé sans durée : réception, mise en service…)</label></form>';
    modal({ title: id ? 'Modifier la tâche' : 'Nouvelle tâche', body: body, foot: (id ? '<button class="btn btn--danger" data-act="delTask" data-id="' + id + '">' + ic('trash') + '</button>' : '') + '<span class="sp"></span><button class="btn btn--ghost" data-act="close">Annuler</button><button class="btn btn--pri" type="submit" form="mf">Enregistrer</button>' });
  }
  var drag = null;
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    var b = e.target.closest('.gb'); if (!b) return;
    drag = { el: b, id: b.dataset.id, x0: e.clientX, mode: e.target.classList.contains('gb-h') ? 'size' : 'move', dw: +b.dataset.dw, l0: b.offsetLeft, w0: b.offsetWidth, moved: false };
    try { b.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault();
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag) return; var dx = e.clientX - drag.x0; if (Math.abs(dx) > 4) drag.moved = true; if (!drag.moved) return;
    var st = Math.round(dx / drag.dw) * drag.dw;
    if (drag.mode === 'move') drag.el.style.left = (drag.l0 + st) + 'px'; else drag.el.style.width = Math.max(drag.dw, drag.w0 + st) + 'px';
  });
  document.addEventListener('pointerup', function (e) {
    if (!drag) return; var d = drag; drag = null; if (!d.moved) return;
    UI.sup = true; setTimeout(function () { UI.sup = false; }, 80);
    var n = Math.round((e.clientX - d.x0) / d.dw), t = find(S.tasks, d.id); if (!t || !n) { render(true); return; }
    if (d.mode === 'move') { t.start = N.addD(t.start, n); t.end = N.addD(t.end, n); } else { var ne = N.addD(t.end, n); t.end = ne < t.start ? t.start : ne; }
    taskChanged(t, d.mode === 'move' ? 'décalée de ' + n + ' j' : 'durée modifiée');
  });



  /* ----- RH ----- */
  var DOC_TYPES = ['CV', 'Pièce d\'identité', 'Contrat de travail', 'Diplôme', 'Attestation CNSS', 'Certificat médical', 'Habilitation / certificat', 'Autre'];
  var REQ_DOCS = ['CV', 'Pièce d\'identité', 'Contrat de travail'];
  var hasDoc = function (docs, l) { return (docs || []).some(function (d) { return d.label === l; }); };
  function completeness(e) {
    var u = e.urgence || {}, b = e.birth || {}, id = e.idCard || {};
    var chk = [!!e.photo, !!e.cnss, !!e.cnamgs, !!b.date, !!e.tel, !!(u.nom && u.tel), !!id.num, !!e.adresse, hasDoc(e.docs, 'CV'), hasDoc(e.docs, 'Pièce d\'identité'), hasDoc(e.docs, 'Contrat de travail')];
    return Math.round(chk.filter(Boolean).length / chk.length * 100);
  }
  function medState(e) { var m = e.visite && e.visite.expire; if (!m) return 'none'; var d = N.diff(m, N.today()); return d < 0 ? 'bad' : (d <= 30 ? 'warn' : 'ok'); }
  function idState(e) { var m = e.idCard && e.idCard.expire; if (!m) return 'none'; var d = N.diff(m, N.today()); return d < 0 ? 'bad' : (d <= 60 ? 'warn' : 'ok'); }
  function photoEl(e, cls) { return e.photo ? '<img class="avatar avatar--img ' + (cls || '') + '" src="' + e.photo + '" alt="">' : '<span class="avatar ' + (cls || '') + '">' + initials(e.name || '?') + '</span>'; }
  function fileSize(n) { return n > 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' Mo' : Math.max(1, Math.round(n / 1000)) + ' Ko'; }

  V.rh = function () {
    var cur = UI.f.rh || 'all', services = ['Génie civil', 'Électricité', 'Énergie', 'Administration'], t = N.today();
    var inc = S.employees.filter(function (e) { return completeness(e) < 100; }).length, med = S.employees.filter(function (e) { return medState(e) === 'bad' || medState(e) === 'warn'; }).length;
    var chips = chipsHtml([['all', 'Tous', S.employees.length]].concat(services.map(function (s) { return [s, s, S.employees.filter(function (e) { return e.service === s; }).length]; })).concat([['inc', 'Dossier incomplet', inc], ['med', 'Visite médicale', med]]), cur, 'rh');
    var renew = 0, bad = 0; S.employees.forEach(function (e) { e.habs.forEach(function (h) { var s = habState(h); if (s === 'warn') renew++; if (s === 'bad') bad++; }); });
    var away = S.employees.filter(function (e) { var v = S.planning[t + '|' + e.id]; return v === 'conge' || v === 'maladie' || v === 'formation'; }).length;
    var mass = S.employees.reduce(function (a, e) { return a + (+e.salaire || 0); }, 0);
    UI.res = function () {
      var l = S.employees.filter(function (e) { return (cur === 'all' || e.service === cur || (cur === 'inc' && completeness(e) < 100) || (cur === 'med' && (medState(e) === 'bad' || medState(e) === 'warn'))) && match(e.name + e.poste + e.service + (e.matricule || '') + (e.cnss || '')); });
      if (!l.length) return '<div class="card empty">Aucun salarié.</div>';
      return '<div class="cards">' + l.map(function (e) {
        var v = S.planning[t + '|' + e.id], c = v && find(S.chantiers, v), where = c ? c.name.split(' — ')[0] : (v === 'conge' ? 'En congé' : v === 'formation' ? 'En formation' : v === 'maladie' ? 'Absent (maladie)' : 'Non affecté'), cp = completeness(e), ms = medState(e);
        return '<div class="rc" data-act="openEmp" data-id="' + e.id + '"><div class="rc__top">' + photoEl(e) + '<div style="flex:1;min-width:0"><b>' + esc(e.name) + '</b><small>' + esc(e.poste) + ' · ' + esc(e.matricule || '') + '</small></div><span class="badge b-mute">' + esc(e.contrat) + '</span></div>' +
          '<div class="rc__tags">' + e.habs.map(function (h) { var s = habState(h); return '<span class="badge b-' + (s === 'ok' ? 'ok' : s === 'warn' ? 'warn' : 'bad') + '" title="Expire le ' + N.dFr(h.expire) + '">' + (s === 'bad' ? '⚠ ' : '') + esc(h.label) + '</span>'; }).join('') + (ms === 'bad' || ms === 'warn' ? '<span class="badge b-' + (ms === 'bad' ? 'bad' : 'warn') + '">' + (ms === 'bad' ? '⚠ ' : '') + 'Visite médicale</span>' : '') + (!e.habs.length && ms !== 'bad' && ms !== 'warn' ? '<span class="badge b-mute">Aucune habilitation requise</span>' : '') + '</div>' +
          '<div><div class="rc__meta"><span>Dossier</span><span style="color:' + (cp < 100 ? 'var(--warn)' : 'var(--ok)') + '">' + cp + ' %</span></div><div class="bar bar--navy" style="margin-top:.25rem"><i style="width:' + cp + '%"></i></div></div>' +
          '<div class="rc__meta"><span>Aujourd\'hui : ' + esc(where) + '</span><span>' + e.conges + ' j congés</span></div></div>';
      }).join('') + '</div>';
    };
    return '<div class="kpis">' + kpi('Effectif', S.employees.length, S.employees.filter(function (e) { return e.contrat === 'CDI'; }).length + ' en CDI', 'team', true) + kpi('Absents aujourd\'hui', away, 'congés, formations, maladie', 'cal') + kpi('Habilitations à renouveler', renew + bad, bad + ' expirée(s) · ' + renew + ' sous 30 j', 'bolt') + kpi('Dossiers à compléter', inc, med + ' visite(s) médicale(s) à prévoir', 'devis') + kpi('Masse salariale', fmtM(mass) + ' XAF', 'brute mensuelle (démo)', 'cash') + '</div>' +
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
      '<label class="f"><span>Avancement : <b id="pv">' + c.progress + '</b> %</span><input type="range" name="progress" min="0" max="100" value="' + c.progress + '" oninput="document.getElementById(\'pv\').textContent=this.value" style="width:100%;accent-color:#f08a24"></label></form>';
    modal({ title: id ? 'Chantier' : 'Nouveau chantier', body: body, foot: (id ? '<button class="btn btn--danger" data-act="delChantier" data-id="' + id + '">' + ic('trash') + '</button>' : '') + '<span class="sp"></span><button class="btn btn--ghost" data-act="close">Annuler</button><button class="btn btn--pri" type="submit" form="mf">Enregistrer</button>' });
  }
  var HABS = ['B0', 'B1V', 'B2V', 'BR', 'BC', 'H0', 'H1V', 'H2V', 'HC', 'Travail en hauteur', 'Secourisme SST', 'CACES'];
  function habRow(h) { h = h || { label: 'B2V', expire: N.addD(N.today(), 365) }; return '<div class="hab"><input class="in" name="hl" list="dl-hab" value="' + esc(h.label) + '"><input class="in" type="date" name="he" value="' + h.expire + '"><button type="button" class="btn btn--ghost btn--icon" data-act="habDel">' + ic('x') + '</button></div>'; }
  var EW = null;
  function docList() {
    var miss = REQ_DOCS.filter(function (l) { return !hasDoc(EW.docs, l); });
    var chk = '<div class="rc__tags" style="margin-bottom:.8rem">' + REQ_DOCS.map(function (l) { return '<span class="badge ' + (hasDoc(EW.docs, l) ? 'b-ok' : 'b-warn') + '">' + (hasDoc(EW.docs, l) ? '✓ ' : '○ ') + esc(l) + '</span>'; }).join('') + '</div>';
    var rows = EW.docs.length ? '<ul class="list">' + EW.docs.map(function (d) {
      return '<li><span class="dot ' + (d.label === 'CV' ? 'info' : 'ok') + '">' + ic(d.label === 'CV' ? 'users' : 'devis') + '</span><div style="flex:1;min-width:0"><b>' + esc(d.label) + '</b><small>' + esc(d.name) + ' · ' + fileSize(d.size || 0) + ' · ajouté le ' + N.dFr(d.date) + '</small></div><a class="btn btn--line btn--sm" href="' + d.data + '" download="' + esc(d.name) + '" target="_blank" rel="noopener">' + ic('dl') + '</a><button type="button" class="btn btn--ghost btn--icon" data-act="docDel" data-id="' + d.id + '" aria-label="Supprimer">' + ic('trash') + '</button></li>';
    }).join('') + '</ul>' : '<div class="empty" style="padding:1rem">Aucun document pour le moment.</div>';
    return chk + rows;
  }
  function fld(label, name, val, type, extra) { return '<label class="f">' + label + '<input class="in" name="' + name + '" type="' + (type || 'text') + '" value="' + esc(val == null ? '' : val) + '" ' + (extra || '') + '></label>'; }
  function sel(label, name, list, cur) { return '<label class="f">' + label + '<select class="in" name="' + name + '">' + list.map(function (x) { return '<option' + (x === cur ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label>'; }
  function blankEmp() {
    return { name: '', poste: '', service: 'Génie civil', tel: '', email: '', contrat: 'CDI', embauche: N.today(), salaire: 0, conges: 0, habs: [], photo: '', docs: [], matricule: 'NMJ-' + String(S.employees.length + 1).padStart(3, '0'), cnss: '', cnamgs: '', birth: { date: '', place: '' }, nationalite: 'Gabonaise', adresse: '', civil: 'Célibataire', enfants: 0, idCard: { type: 'CNI', num: '', expire: '' }, urgence: { nom: '', lien: 'Épouse', tel: '', tel2: '' }, sang: '', visite: { date: '', expire: '' }, epi: { vetement: 'M', pointure: '' }, diplome: '', contratFin: '', essaiFin: '', notes: '' };
  }
  function openEmp(id) {
    var e = id ? emp(id) : blankEmp(), u = e.urgence || {}, b = e.birth || {}, ic2 = e.idCard || {}, vi = e.visite || {}, ep = e.epi || {}, cp = completeness(e);
    EW = { photo: e.photo || '', docs: (e.docs || []).map(function (d) { return Object.assign({}, d); }) };
    var tabs = [['id', 'Identité'], ['job', 'Poste & contrat'], ['adm', 'Administratif'], ['urg', 'Urgence & santé'], ['doc', 'Documents'], ['hab', 'Habilitations']];
    var body = '<form id="mf" data-form="emp" data-id="' + (id || '') + '" class="stack"><datalist id="dl-hab">' + HABS.map(function (h) { return '<option value="' + h + '">'; }).join('') + '</datalist>' +
      '<div class="fh"><div class="fh__ph" id="fh-ph">' + (EW.photo ? '<img src="' + EW.photo + '" alt="Photo d\'identité">' : '<span>' + initials(e.name || '+') + '</span>') + '</div><div class="fh__t"><h4>' + (id ? esc(e.name) : 'Nouveau collaborateur') + '</h4><span>' + (id ? esc(e.poste) + ' · ' + esc(e.matricule || '') : 'Renseignez la fiche, puis les documents') + '</span><div class="quick" style="margin-top:.6rem"><label class="btn btn--line btn--sm" style="cursor:pointer">' + ic('plus') + 'Photo d\'identité<input type="file" accept="image/*" id="ph-file" hidden></label>' + (EW.photo ? '<button type="button" class="btn btn--ghost btn--sm" data-act="phDel">Retirer</button>' : '') + '</div></div><div class="fh__c"><small>Dossier complet</small><b>' + cp + ' %</b><div class="bar bar--navy"><i style="width:' + cp + '%"></i></div></div></div>' +
      '<div class="chips fs-tabs">' + tabs.map(function (x, i) { return '<button type="button" class="chip ' + (i ? '' : 'is-on') + '" data-act="empTab" data-s="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      '<div class="fs stack" data-s="id"><div class="grid2">' + fld('Nom complet', 'name', e.name, 'text', 'required') + fld('Nationalité', 'nationalite', e.nationalite) + '</div><div class="grid3">' + fld('Date de naissance', 'birthDate', b.date, 'date') + fld('Lieu de naissance', 'birthPlace', b.place) + sel('Situation familiale', 'civil', ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf(ve)', 'Union libre'], e.civil) + '</div><div class="grid3">' + fld('Enfants à charge', 'enfants', e.enfants, 'number', 'min="0"') + fld('Téléphone', 'tel', e.tel, 'tel', 'inputmode="tel"') + fld('E-mail', 'email', e.email, 'email') + '</div>' + fld('Adresse (quartier, ville)', 'adresse', e.adresse) + fld('Diplôme / formation initiale', 'diplome', e.diplome) + '</div>' +
      '<div class="fs stack" data-s="job" hidden><div class="grid2">' + fld('Poste', 'poste', e.poste, 'text', 'required') + sel('Service', 'service', ['Génie civil', 'Électricité', 'Énergie', 'Administration'], e.service) + '</div><div class="grid3">' + sel('Contrat', 'contrat', ['CDI', 'CDD', 'Stagiaire', 'Prestataire'], e.contrat) + fld('Matricule', 'matricule', e.matricule) + fld('Date d\'embauche', 'embauche', e.embauche, 'date') + '</div><div class="grid3">' + fld('Fin de contrat (CDD)', 'contratFin', e.contratFin, 'date') + fld('Fin période d\'essai', 'essaiFin', e.essaiFin, 'date') + fld('Solde de congés (j)', 'conges', e.conges, 'number', 'min="0"') + '</div>' + fld('Salaire brut mensuel (XAF)', 'salaire', e.salaire, 'number', 'min="0"') + '<label class="f">Notes internes<textarea class="in" name="notes" rows="3">' + esc(e.notes || '') + '</textarea></label></div>' +
      '<div class="fs stack" data-s="adm" hidden><div class="grid2">' + fld('N° CNSS', 'cnss', e.cnss, 'text', 'placeholder="015-0000000-A"') + fld('N° CNAMGS', 'cnamgs', e.cnamgs) + '</div><div class="grid3">' + sel('Pièce d\'identité', 'idType', ['CNI', 'Passeport', 'Carte de séjour'], ic2.type) + fld('N° de la pièce', 'idNum', ic2.num) + fld('Date d\'expiration', 'idExpire', ic2.expire, 'date') + '</div><p class="hint">Les numéros affichés dans la démonstration sont fictifs. Les copies (CNI, CNSS…) se déposent dans l\'onglet « Documents ».</p></div>' +
      '<div class="fs stack" data-s="urg" hidden><h5 class="fs__h">Personne à contacter en cas d\'urgence</h5><div class="grid2">' + fld('Nom et prénom', 'ugNom', u.nom) + sel('Lien', 'ugLien', ['Époux', 'Épouse', 'Père', 'Mère', 'Frère', 'Sœur', 'Enfant', 'Ami(e)', 'Autre'], u.lien) + '</div><div class="grid2">' + fld('Téléphone', 'ugTel', u.tel, 'tel', 'inputmode="tel"') + fld('Téléphone secondaire', 'ugTel2', u.tel2, 'tel') + '</div><h5 class="fs__h">Santé et équipements</h5><div class="grid3">' + sel('Groupe sanguin', 'sang', ['', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], e.sang) + fld('Visite médicale — date', 'medDate', vi.date, 'date') + fld('Aptitude valable jusqu\'au', 'medExpire', vi.expire, 'date') + '</div><div class="grid2">' + sel('Taille de vêtement', 'vet', ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], ep.vetement) + fld('Pointure (chaussures de sécurité)', 'pointure', ep.pointure, 'text', 'inputmode="numeric"') + '</div></div>' +
      '<div class="fs stack" data-s="doc" hidden><div id="doc-list">' + docList() + '</div><div class="addbox"><label class="f">Ajouter un document<select class="in" id="doc-type">' + DOC_TYPES.map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select></label><label class="btn btn--dark" style="cursor:pointer">' + ic('plus') + 'Choisir un fichier<input type="file" id="doc-file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" hidden></label><small class="hint">PDF, Word ou image — 1,2 Mo maximum par fichier (démo : stockage dans le navigateur).</small></div></div>' +
      '<div class="fs stack" data-s="hab" hidden><div class="card__h" style="margin-bottom:.2rem"><h3 style="font-size:.95rem">Habilitations et formations</h3><button type="button" class="btn btn--line btn--sm" data-act="habAdd">' + ic('plus') + 'Ajouter</button></div><div class="stack" id="habs" style="gap:.5rem">' + e.habs.map(habRow).join('') + '</div></div></form>';
    var foot = (id ? '<button class="btn btn--danger" data-act="delEmp" data-id="' + id + '">' + ic('trash') + '</button><button class="btn btn--line" data-act="empSheet" data-id="' + id + '">' + ic('print') + 'Fiche</button><button class="btn btn--line" data-act="leave" data-emp="' + id + '">' + ic('cal') + 'Congé</button>' + (e.tel ? '<a class="btn btn--line" href="tel:+241' + e.tel.replace(/\D/g, '') + '" aria-label="Appeler">' + ic('phone') + '</a>' : '') : '') + '<span class="sp"></span><button class="btn btn--ghost" data-act="close">Annuler</button><button class="btn btn--pri" type="submit" form="mf">Enregistrer</button>';
    modal({ title: id ? 'Fiche collaborateur' : 'Nouveau collaborateur', cls: 'modal--lg', body: body, foot: foot });
  }
  function empSheet(id) {
    var e = emp(id), c = S.company, u = e.urgence || {}, b = e.birth || {}, ic2 = e.idCard || {}, vi = e.visite || {}, ep = e.epi || {};
    var kv = function (rows) { return '<div class="kv">' + rows.map(function (r) { return '<span>' + r[0] + '</span><b>' + (r[1] ? esc(r[1]) : '—') + '</b>'; }).join('') + '</div>'; };
    var dt = function (s) { return s ? N.dFr(s) : ''; };
    var html = '<div class="doc"><div class="doc__top"><div class="doc__co"><img src="../assets/img/logo.png" alt=""><div><b>' + esc(c.name) + '</b><span>' + esc(c.address) + '</span><span>' + esc(c.tel) + '</span></div></div><div class="doc__ttl"><h2>FICHE SALARIÉ</h2><span>Matricule <b>' + esc(e.matricule || '') + '</b></span><span>Édité le ' + N.dFr(N.today()) + '</span></div></div>' +
      '<div class="sheet-id">' + (e.photo ? '<img src="' + e.photo + '" alt="">' : '<span class="sheet-id__n">' + initials(e.name) + '</span>') + '<div><h3 style="font-size:1.4rem">' + esc(e.name) + '</h3><p style="margin:.2rem 0 .6rem;color:#4a566a">' + esc(e.poste) + ' — ' + esc(e.service) + ' · ' + esc(e.contrat) + '</p><p style="margin:0">' + esc(e.tel || '') + (e.email ? ' · ' + esc(e.email) : '') + '</p></div></div>' +
      '<h4 class="doc__h">État civil</h4>' + kv([['Naissance', (dt(b.date) + (b.place ? ' à ' + b.place : ''))], ['Nationalité', e.nationalite], ['Situation familiale', e.civil + (e.enfants ? ' · ' + e.enfants + ' enfant(s)' : '')], ['Adresse', e.adresse], ['Formation', e.diplome]]) +
      '<h4 class="doc__h">Contrat</h4>' + kv([['Embauche', dt(e.embauche)], ['Type de contrat', e.contrat + (e.contratFin ? ' — jusqu\'au ' + dt(e.contratFin) : '')], ['Fin période d\'essai', dt(e.essaiFin)], ['Salaire brut', e.salaire ? fmt(e.salaire) + ' XAF / mois' : ''], ['Solde de congés', e.conges + ' jours']]) +
      '<h4 class="doc__h">Administratif</h4>' + kv([['N° CNSS', e.cnss], ['N° CNAMGS', e.cnamgs], [ic2.type || 'Pièce d\'identité', (ic2.num || '') + (ic2.expire ? ' — expire le ' + dt(ic2.expire) : '')]]) +
      '<h4 class="doc__h">En cas d\'urgence</h4>' + kv([['Personne à contacter', u.nom ? u.nom + (u.lien ? ' (' + u.lien + ')' : '') : ''], ['Téléphone', (u.tel || '') + (u.tel2 ? ' / ' + u.tel2 : '')]]) +
      '<h4 class="doc__h">Santé et sécurité</h4>' + kv([['Groupe sanguin', e.sang], ['Aptitude médicale', vi.expire ? 'valable jusqu\'au ' + dt(vi.expire) : ''], ['Équipement', (ep.vetement ? 'Vêtement ' + ep.vetement : '') + (ep.pointure ? ' · pointure ' + ep.pointure : '')], ['Habilitations', e.habs.map(function (h) { return h.label + ' (→ ' + dt(h.expire) + ')'; }).join(', ')]]) +
      '<h4 class="doc__h">Documents au dossier</h4>' + kv([['Pièces', (e.docs || []).map(function (d) { return d.label; }).join(' · ')]]) + '<div class="doc__foot">Document confidentiel — ' + esc(c.name) + ' · NIF ' + esc(c.nif) + '</div></div>';
    $$('#modals .ov[data-doc]').forEach(function (o) { o.remove(); });
    var m = modal({ title: 'Fiche — ' + esc(e.name), cls: 'modal--doc', body: html, foot: '<span class="sp"></span><button class="btn btn--ghost" data-act="close">Fermer</button><button class="btn btn--dark" data-act="print">' + ic('print') + 'Imprimer / PDF</button>' }); m.dataset.doc = '1';
  }
  function readImage(file, cb) {
    var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var s = Math.min(im.width, im.height), c = document.createElement('canvas'); c.width = c.height = 320; c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 320, 320); cb(c.toDataURL('image/jpeg', 0.82)); }; im.onerror = function () { toast('Image illisible'); }; im.src = r.result; }; r.readAsDataURL(file);
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
    planTab: function (el) { UI.planTab = el.dataset.v; UI.gs = null; render(true); },
    gz: function (el) { UI.gz = el.dataset.v; UI.gs = null; render(true); },
    gtToday: function () { UI.gs = null; render(true); },
    taskEdit: function (el) { if (UI.sup) return; taskEdit(el.dataset.id); },
    delTask: function (el) { if (!confirm('Supprimer cette tâche ?')) return; var id = el.dataset.id, t = find(S.tasks, id); S.tasks = S.tasks.filter(function (x) { return x.id !== id; }); S.tasks.forEach(function (x) { if (x.dep === id) x.dep = ''; }); syncChantier(t.chantierId); persist('Tâche supprimée'); closeAll(); render(true); },
    empTab: function (el) { var f = el.closest('form'); $$('.fs', f).forEach(function (s) { s.hidden = s.dataset.s !== el.dataset.s; }); $$('.fs-tabs .chip', f).forEach(function (c) { c.classList.toggle('is-on', c === el); }); },
    empSheet: function (el) { empSheet(el.dataset.id); },
    docDel: function (el) { EW.docs = EW.docs.filter(function (d) { return d.id !== el.dataset.id; }); $('#doc-list').innerHTML = docList(); },
    phDel: function (el) { EW.photo = ''; $('#fh-ph').innerHTML = '<span>+</span>'; el.remove(); },
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
    task: function (f) {
      var id = f.dataset.id, t = id ? find(S.tasks, id) : { id: N.uid('t') }, ms = f.milestone.checked, old = t.chantierId;
      var st = f.start.value, en = ms ? st : f.end.value; if (en < st) { toast('La fin précède le début'); return; }
      Object.assign(t, { name: f.name.value.trim(), chantierId: f.chantierId.value, assignee: f.assignee.value, start: st, end: en, dep: f.dep.value, progress: +f.progress.value || 0, milestone: ms });
      if (!id) S.tasks.push(t); syncChantier(t.chantierId); if (old && old !== t.chantierId) syncChantier(old);
      persist('Tâche « ' + t.name + ' » ' + (id ? 'modifiée' : 'ajoutée')); closeAll(); render(true); toast('Tâche enregistrée');
    },
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
      var id = f.dataset.id, e = id ? emp(id) : { id: N.uid('e'), habs: [] }, v = function (n) { return f[n].value.trim(); };
      var est = JSON.stringify(S).length + EW.docs.reduce(function (s, d) { return s + (d.data || '').length; }, 0) + (EW.photo || '').length;
      if (est > 4600000) { toast('Stockage presque plein : retirez un document volumineux'); return; }
      Object.assign(e, { name: v('name'), poste: v('poste'), service: f.service.value, contrat: f.contrat.value, embauche: f.embauche.value, contratFin: f.contratFin.value, essaiFin: f.essaiFin.value, matricule: v('matricule'), tel: v('tel'), email: v('email'), salaire: +f.salaire.value || 0, conges: +f.conges.value || 0, notes: v('notes'), diplome: v('diplome'), nationalite: v('nationalite'), civil: f.civil.value, enfants: +f.enfants.value || 0, adresse: v('adresse'),
        cnss: v('cnss'), cnamgs: v('cnamgs'), birth: { date: f.birthDate.value, place: v('birthPlace') }, idCard: { type: f.idType.value, num: v('idNum'), expire: f.idExpire.value }, urgence: { nom: v('ugNom'), lien: f.ugLien.value, tel: v('ugTel'), tel2: v('ugTel2') }, sang: f.sang.value, visite: { date: f.medDate.value, expire: f.medExpire.value }, epi: { vetement: f.vet.value, pointure: v('pointure') }, photo: EW.photo, docs: EW.docs });
      e.habs = $$('.hab', f).map(function (r) { return { label: $('[name=hl]', r).value.trim(), expire: $('[name=he]', r).value }; }).filter(function (h) { return h.label && h.expire; });
      if (!id) S.employees.push(e); if (persist('Collaborateur ' + e.name + (id ? ' mis à jour' : ' ajouté'))) { closeAll(); render(); toast('Fiche enregistrée'); }
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
    var g = $('#gt'); if (g) { if (UI.gs) { g.scrollLeft = UI.gs[0]; g.scrollTop = UI.gs[1]; UI.gs = null; } else if (UI.gOrigin) { var x = N.diff(N.today(), UI.gOrigin.origin) * UI.gOrigin.dw; g.scrollLeft = Math.max(0, x - 120); } }
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
    if (e.target.id === 'ph-file' && e.target.files[0]) { readImage(e.target.files[0], function (d) { EW.photo = d; $('#fh-ph').innerHTML = '<img src="' + d + '" alt="Photo d\'identité">'; }); e.target.value = ''; return; }
    if (e.target.id === 'doc-file' && e.target.files[0]) {
      var fl = e.target.files[0]; if (fl.size > 1.2e6) { toast('Fichier trop volumineux (1,2 Mo maximum)'); e.target.value = ''; return; }
      var rd = new FileReader(); rd.onload = function () { EW.docs.push({ id: N.uid('doc'), label: $('#doc-type').value, name: fl.name, size: fl.size, date: N.today(), data: rd.result }); $('#doc-list').innerHTML = docList(); toast('Document ajouté — pensez à enregistrer la fiche'); }; rd.readAsDataURL(fl); e.target.value = ''; return;
    }
    if (e.target.matches('[data-gc]')) { UI.gc = e.target.value; UI.gs = null; render(true); return; }
    if (e.target.name === 'chantierId' && e.target.closest('form[data-form=task]')) {
      var fm = e.target.closest('form'), tid = fm.dataset.id;
      fm.dep.innerHTML = '<option value="">— Aucune —</option>' + S.tasks.filter(function (x) { return x.chantierId === e.target.value && x.id !== tid; }).map(function (x) { return '<option value="' + x.id + '">' + esc(x.name) + '</option>'; }).join(''); return;
    }
    if (e.target.id === 'cat-pick' && e.target.value) { var p = find(S.catalog, e.target.value), l = $('#lines'); l.insertAdjacentHTML('beforeend', lineRow({ label: p.label, qty: 1, unit: p.unit, pu: p.price })); e.target.value = ''; recalc(l.closest('.ov')); }
    if (e.target.matches('[data-import]')) { var fl = e.target.files[0]; if (!fl) return; var rd = new FileReader(); rd.onload = function () { try { var j = JSON.parse(rd.result); if (!(j.v >= 2) || !j.clients) throw 0; S = N.setState(j); render(); toast('Données importées'); } catch (x) { toast('Fichier invalide'); } }; rd.readAsText(fl); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeTop(); });
  window.addEventListener('hashchange', route);

  build();
  try { if (sessionStorage.getItem('nmj-auth') === '1') $('#login').hidden = true; } catch (e) {}
  route();
})();
