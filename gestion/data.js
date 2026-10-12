/* NMJ Gestion — données de démonstration, utilitaires et stockage local */
window.NMJ = (function () {
  'use strict';
  var KEY = 'nmj-gestion-v2';
  var iso = function (d) { var x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  var parse = function (s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  var addD = function (s, n) { var d = typeof s === 'string' ? parse(s) : new Date(s); d.setDate(d.getDate() + n); return iso(d); };
  var today = function () { return iso(new Date()); };
  var monday = function (s) { var d = parse(s), g = d.getDay() || 7; d.setDate(d.getDate() - g + 1); return iso(d); };
  var diff = function (a, b) { return Math.round((parse(a) - parse(b)) / 86400000); };
  var fmt = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  var fmtM = function (n) { return n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace('.', ',') + ' M' : fmt(n); };
  var dFr = function (s, o) { return parse(s).toLocaleDateString('fr-FR', o || { day: 'numeric', month: 'short', year: 'numeric' }); };
  var uid = function (p) { return p + Math.random().toString(36).slice(2, 8); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- Montant en lettres (français) ---------- */
  var U = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  var T = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
  function s100(n, fin) {
    if (n < 20) return U[n];
    if (n < 70) { var d = Math.floor(n / 10), r = n % 10; return T[d] + (r === 1 ? ' et un' : r ? '-' + U[r] : ''); }
    if (n < 80) { var q = n - 60; return 'soixante' + (q === 11 ? ' et onze' : '-' + U[q]); }
    var z = n - 80; return 'quatre-vingt' + (z === 0 ? (fin ? 's' : '') : '-' + U[z]);
  }
  function s1000(n, fin) {
    var c = Math.floor(n / 100), r = n % 100;
    if (!c) return s100(r, fin);
    var s = c === 1 ? 'cent' : U[c] + ' cent';
    if (!r) return c > 1 && fin ? s + 's' : s;
    return s + ' ' + s100(r, fin);
  }
  function words(n) {
    n = Math.round(n); if (n === 0) return 'zéro';
    var out = [], b = Math.floor(n / 1e9), m = Math.floor((n % 1e9) / 1e6), k = Math.floor((n % 1e6) / 1e3), r = n % 1e3;
    if (b) out.push(s1000(b, true) + ' milliard' + (b > 1 ? 's' : ''));
    if (m) out.push(s1000(m, true) + ' million' + (m > 1 ? 's' : ''));
    if (k) out.push(k === 1 ? 'mille' : s1000(k, false) + ' mille');
    if (r) out.push(s1000(r, true));
    return out.join(' ');
  }

  /* ---------- Données de démonstration ---------- */
  function seed() {
    var t = today(), y = new Date().getFullYear();
    var S = { v: 3, company: {
      name: 'NMJ SERVICES', form: 'SARL au capital de 2 000 000 FCFA', address: 'Owendo, derrière le centre des Métiers de la SEEG, Jean Violas — BP 2507 Libreville, Gabon',
      tel: '062 82 18 38 / 074 66 47 64', email: 'nmjservices.gabon@gmail.com', nif: '44835G', rccm: 'RC.LBV.2017.B21051', tva: 18, conditions: 'Paiement à 30 jours. Acompte de 50 % à la commande pour les travaux.'
    } };
    S.clients = [
      { id: 'cl1', name: 'Centre Hospitalier Régional Estuaire (CHREM)', type: 'Santé', contact: 'Direction technique', tel: '077 10 20 30', email: 'technique@chrem.example', city: 'Melen, Libreville' },
      { id: 'cl2', name: 'SOBRAGA', type: 'Industrie', contact: 'M. Ndong — Direction d\'usine', tel: '066 44 55 66', email: 'maintenance@sobraga.example', city: 'Libreville' },
      { id: 'cl3', name: 'UNOCA', type: 'Organisation internationale', contact: 'Gestion des locaux', tel: '074 22 33 44', email: 'logistique@unoca.example', city: 'Libreville' },
      { id: 'cl4', name: 'WWF Gabon', type: 'ONG', contact: 'Mme Obame', tel: '062 77 88 99', email: 'bureau@wwf.example', city: 'Libreville' },
      { id: 'cl5', name: 'SCI Les Palmiers', type: 'Immobilier', contact: 'M. Moukagni', tel: '077 55 11 22', email: 'sci.palmiers@example.com', city: 'Akanda' },
      { id: 'cl6', name: 'Hôtel Le Bambou', type: 'Hôtellerie', contact: 'Direction', tel: '066 90 80 70', email: 'direction@lebambou.example', city: 'Libreville' },
      { id: 'cl7', name: 'Gabon Print', type: 'Industrie', contact: 'M. Essono', tel: '074 12 12 12', email: 'contact@gabonprint.example', city: 'Owendo' },
      { id: 'cl8', name: 'Groupe Mboumba', type: 'Entreprise', contact: 'Mme Mboumba', tel: '062 31 41 51', email: 'direction@mboumba.example', city: 'Libreville' }
    ];
    S.catalog = [
      { id: 'p1', label: 'Diagnostic électrique — Offre 1 : contrôle des différentiels', unit: 'forfait', price: 35000 },
      { id: 'p2', label: 'Diagnostic électrique — Offre 2 : différentiels et terre', unit: 'forfait', price: 50000 },
      { id: 'p3', label: 'Diagnostic électrique — Offre 3 : inspection complète NF C 15-100', unit: 'forfait', price: 150000 },
      { id: 'p4', label: 'Journée technicien électricien', unit: 'jour', price: 45000 },
      { id: 'p5', label: 'Journée technicien haute tension', unit: 'jour', price: 85000 },
      { id: 'p6', label: 'Journée chef de chantier', unit: 'jour', price: 65000 },
      { id: 'p7', label: 'Fourniture et pose d\'un tableau électrique', unit: 'forfait', price: 350000 },
      { id: 'p8', label: 'Panneau solaire 550 W fourni posé', unit: 'pièce', price: 185000 },
      { id: 'p9', label: 'Onduleur hybride 5 kW fourni posé', unit: 'pièce', price: 950000 },
      { id: 'p10', label: 'Batterie lithium 5 kWh fournie posée', unit: 'pièce', price: 1650000 },
      { id: 'p11', label: 'Maçonnerie / gros œuvre', unit: 'm²', price: 45000 },
      { id: 'p12', label: 'Peinture intérieure et finitions', unit: 'm²', price: 6500 },
      { id: 'p13', label: 'Formation habilitation électrique', unit: 'stagiaire', price: 85000 },
      { id: 'p14', label: 'Audit Lean / Six Sigma', unit: 'jour', price: 250000 }
    ];
    var H = function (l, o) { return { label: l, expire: addD(t, o) }; };
    var E = function (id, name, poste, service, tel, contrat, since, sal, conges, habs) { return { id: id, name: name, poste: poste, service: service, tel: tel, email: name.toLowerCase().split(' ')[0].normalize('NFD').replace(/[̀-ͯ]/g, '') + '@nmj.example', contrat: contrat, embauche: since, salaire: sal, conges: conges, habs: habs || [] }; };
    S.employees = [
      E('e1', 'Jean-Marc Mba', 'Conducteur de travaux', 'Génie civil', '074 10 10 01', 'CDI', '2019-03-04', 750000, 18, [H('Travail en hauteur', 140)]),
      E('e2', 'Estelle Nzé', 'Ingénieure électricienne', 'Électricité', '062 10 10 02', 'CDI', '2020-09-14', 820000, 22, [H('B2V', 200), H('H1V', 45), H('BR', 160)]),
      E('e3', 'Christian Ondo', 'Technicien haute tension', 'Électricité', '074 10 10 03', 'CDI', '2018-01-15', 640000, 10, [H('B1V', 21), H('H2V', 300), H('BR', 120)]),
      E('e4', 'Patrick Obiang', 'Chef de chantier', 'Génie civil', '066 10 10 04', 'CDI', '2017-11-02', 600000, 25, [H('Travail en hauteur', 60), H('Secourisme SST', 90)]),
      E('e5', 'Sylvie Mouélé', 'Assistante administrative', 'Administration', '074 10 10 05', 'CDI', '2021-02-01', 380000, 20, []),
      E('e6', 'Rodrigue Ndong', 'Maçon', 'Génie civil', '062 10 10 06', 'CDI', '2019-06-10', 330000, 8, [H('Travail en hauteur', 15)]),
      E('e7', 'Fabrice Essono', 'Électricien', 'Électricité', '066 10 10 07', 'CDD', '2023-04-03', 420000, 6, [H('B2V', -4), H('BR', 75)]),
      E('e8', 'Hervé Moukagni', 'Plombier', 'Génie civil', '074 10 10 08', 'CDI', '2020-05-18', 380000, 12, []),
      E('e9', 'Brice Mintsa', 'Peintre', 'Génie civil', '062 10 10 09', 'CDD', '2024-01-08', 300000, 4, []),
      E('e10', 'Ornella Bivigou', 'Comptable', 'Administration', '066 10 10 10', 'CDI', '2018-10-01', 520000, 22, []),
      E('e11', 'Aimé Koumba', 'Technicien solaire', 'Énergie', '074 10 10 11', 'CDI', '2022-07-11', 480000, 14, [H('B1V', 220), H('Travail en hauteur', 25)]),
      E('e12', 'Judicaël Ntoutoume', 'Coffreur-ferrailleur', 'Génie civil', '062 10 10 12', 'Stagiaire', '2025-09-01', 150000, 2, [])
    ];
    S.chantiers = [
      { id: 'c1', name: 'Bâtiment R+2 — bureaux et ateliers', clientId: 'cl8', site: 'Owendo', start: addD(t, -95), end: addD(t, 75), budget: 85000000, spent: 54000000, progress: 64, status: 'En cours', manager: 'e1' },
      { id: 'c2', name: 'Poste HTA/BT et distribution — usine', clientId: 'cl2', site: 'Zone industrielle, Libreville', start: addD(t, -50), end: addD(t, 40), budget: 42000000, spent: 23500000, progress: 52, status: 'En cours', manager: 'e2' },
      { id: 'c3', name: 'Centrale solaire 30 kWc + batteries', clientId: 'cl7', site: 'Entrepôt, Owendo', start: addD(t, -40), end: addD(t, 12), budget: 28000000, spent: 22400000, progress: 84, status: 'En cours', manager: 'e11' },
      { id: 'c4', name: 'Mise en conformité électrique — bureaux', clientId: 'cl3', site: 'Centre-ville, Libreville', start: addD(t, -12), end: addD(t, 25), budget: 6500000, spent: 1900000, progress: 30, status: 'En cours', manager: 'e3' },
      { id: 'c5', name: 'Rénovation des bureaux et alimentation', clientId: 'cl4', site: 'Libreville', start: addD(t, 20), end: addD(t, 110), budget: 18000000, spent: 0, progress: 0, status: 'Planifié', manager: 'e4' }
    ];
    /* Planning : 5 semaines autour d'aujourd'hui */
    S.planning = {};
    var m0 = addD(monday(t), -7), assign = { e1: 'c1', e4: 'c1', e6: 'c1', e8: 'c1', e9: 'c1', e12: 'c1', e2: 'c2', e3: 'c2', e7: 'c4', e11: 'c3' };
    for (var w = 0; w < 5; w++) {
      for (var d = 0; d < 5; d++) {
        var day = addD(m0, w * 7 + d);
        Object.keys(assign).forEach(function (eid) {
          var c = assign[eid];
          if (eid === 'e7' && w >= 2) c = 'c2';
          if (eid === 'e9' && w >= 3) c = 'c3';
          S.planning[day + '|' + eid] = c;
        });
      }
    }
    for (var k = 0; k < 4; k++) { S.planning[addD(monday(t), 2 + k) + '|e6'] = 'conge'; }
    S.planning[addD(monday(t), 1) + '|e12'] = 'formation'; S.planning[addD(monday(t), 2) + '|e12'] = 'formation';
    S.planning[addD(monday(t), 0) + '|e3'] = 'formation';
    /* Documents */
    var L = function (a) { return a.map(function (x) { return { label: x[0], qty: x[1], unit: x[2], pu: x[3] }; }); };
    var mk = function (mAgo, day, cl, subject, lines, paid, extra) {
      var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - mAgo); d.setDate(day);
      if (iso(d) > t) d = parse(addD(t, -1));
      return Object.assign({ date: iso(d), clientId: cl, subject: subject, lines: L(lines), remise: 0, tva: true, paid: paid }, extra || {});
    };
    var F = [
      mk(5, 6, 'cl1', 'Rénovation des salles d\'hospitalisation — situation n°1', [['Maçonnerie / gros œuvre', 120, 'm²', 45000], ['Peinture intérieure et finitions', 380, 'm²', 6500]], 1),
      mk(5, 22, 'cl2', 'Maintenance préventive — ligne de convoyage', [['Journée technicien électricien', 12, 'jour', 45000], ['Journée technicien haute tension', 3, 'jour', 85000]], 1),
      mk(4, 9, 'cl3', 'Mise en conformité du coworking — étage 1 et 2', [['Diagnostic électrique — Offre 3 : inspection complète NF C 15-100', 2, 'forfait', 150000], ['Fourniture et pose d\'un tableau électrique', 2, 'forfait', 350000]], 1),
      mk(4, 25, 'cl1', 'Rénovation des salles d\'hospitalisation — situation n°2', [['Maçonnerie / gros œuvre', 180, 'm²', 45000], ['Peinture intérieure et finitions', 500, 'm²', 6500]], 1),
      mk(3, 12, 'cl4', 'Alimentation électrique et frigorifique — bureaux', [['Fourniture et pose d\'un tableau électrique', 1, 'forfait', 350000], ['Journée technicien électricien', 8, 'jour', 45000]], 1),
      mk(3, 27, 'cl2', 'Maintenance — équipements de convoyage (trimestre)', [['Journée technicien électricien', 15, 'jour', 45000], ['Journée technicien haute tension', 4, 'jour', 85000]], 1),
      mk(2, 8, 'cl8', 'Bâtiment R+2 — acompte de démarrage', [['Acompte 30 % sur marché de construction', 1, 'forfait', 25500000]], 1),
      mk(2, 20, 'cl7', 'Centrale solaire 30 kWc — acompte', [['Panneau solaire 550 W fourni posé', 30, 'pièce', 185000], ['Onduleur hybride 5 kW fourni posé', 2, 'pièce', 950000]], 1),
      mk(1, 5, 'cl2', 'Poste HTA/BT — situation n°1', [['Journée technicien haute tension', 20, 'jour', 85000], ['Journée technicien électricien', 30, 'jour', 45000], ['Fourniture et pose d\'un tableau électrique', 3, 'forfait', 350000]], 1),
      mk(2, 18, 'cl6', 'Diagnostic électrique de l\'hôtel (3 tableaux)', [['Diagnostic électrique — Offre 2 : différentiels et terre', 3, 'forfait', 50000]], 0.5),
      mk(1, 24, 'cl8', 'Bâtiment R+2 — situation n°1', [['Maçonnerie / gros œuvre', 400, 'm²', 45000], ['Journée chef de chantier', 20, 'jour', 65000]], 1),
      mk(0, 3, 'cl5', 'Diagnostic électrique — résidence (offre 3)', [['Diagnostic électrique — Offre 3 : inspection complète NF C 15-100', 1, 'forfait', 150000]], 1),
      mk(0, 7, 'cl7', 'Centrale solaire — situation n°1', [['Batterie lithium 5 kWh fournie posée', 4, 'pièce', 1650000], ['Journée technicien électricien', 10, 'jour', 45000]], 0),
      mk(0, 9, 'cl4', 'Formation aux habilitations électriques (8 stagiaires)', [['Formation habilitation électrique', 8, 'stagiaire', 85000]], 0)
    ];
    F.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    S.factures = F.map(function (f, i) {
      var doc = { id: 'f' + (i + 1), num: 'FAC-' + f.date.slice(0, 4) + '-' + String(i + 1).padStart(3, '0'), clientId: f.clientId, date: f.date, echeance: addD(f.date, 30), subject: f.subject, lines: f.lines, remise: 0, tva: true, notes: '', payments: [] };
      var ttc = total(doc, 18).ttc;
      if (f.paid) { var pd = addD(f.date, 14); if (pd > t) pd = t; doc.payments.push({ id: 'pay' + i, date: pd, amount: Math.round(ttc * f.paid), mode: i % 3 ? 'Virement' : 'Mobile Money' }); }
      return doc;
    });
    var D = [
      { c: 'cl1', s: 'Réfection de la toiture — bâtiment B', st: 'envoyé', ago: 6, l: [['Maçonnerie / gros œuvre', 90, 'm²', 45000], ['Peinture intérieure et finitions', 200, 'm²', 6500]] },
      { c: 'cl6', s: 'Installation solaire 15 kWc pour l\'hôtel', st: 'envoyé', ago: 3, l: [['Panneau solaire 550 W fourni posé', 28, 'pièce', 185000], ['Onduleur hybride 5 kW fourni posé', 3, 'pièce', 950000], ['Batterie lithium 5 kWh fournie posée', 3, 'pièce', 1650000]] },
      { c: 'cl5', s: 'Rénovation du tableau général — résidence', st: 'brouillon', ago: 1, l: [['Fourniture et pose d\'un tableau électrique', 1, 'forfait', 350000], ['Journée technicien électricien', 3, 'jour', 45000]] },
      { c: 'cl3', s: 'Formation habilitations électriques — session 2', st: 'accepté', ago: 20, l: [['Formation habilitation électrique', 12, 'stagiaire', 85000]] },
      { c: 'cl2', s: 'Audit Lean — atelier de conditionnement', st: 'envoyé', ago: 12, l: [['Audit Lean / Six Sigma', 5, 'jour', 250000]] },
      { c: 'cl8', s: 'Extension du bâtiment — entrepôt 400 m²', st: 'refusé', ago: 40, l: [['Maçonnerie / gros œuvre', 400, 'm²', 45000]] },
      { c: 'cl4', s: 'Diagnostic électrique du bureau régional', st: 'accepté', ago: 15, l: [['Diagnostic électrique — Offre 2 : différentiels et terre', 2, 'forfait', 50000]] }
    ];
    S.devis = D.map(function (x, i) {
      return { id: 'd' + (i + 1), num: 'DEV-' + y + '-' + String(i + 1).padStart(3, '0'), clientId: x.c, date: addD(t, -x.ago), validite: 30, subject: x.s, lines: L(x.l), remise: i === 1 ? 5 : 0, tva: true, notes: '', status: x.st };
    });
    S.stock = [
      { id: 's1', ref: 'CAB-3G25', label: 'Câble U1000 R2V 3G2,5 mm²', cat: 'Câbles', unit: 'm', qty: 850, min: 300, pu: 1850 },
      { id: 's2', ref: 'CAB-3G15', label: 'Câble U1000 R2V 3G1,5 mm²', cat: 'Câbles', unit: 'm', qty: 120, min: 300, pu: 1300 },
      { id: 's3', ref: 'CAB-5G10', label: 'Câble U1000 R2V 5G10 mm²', cat: 'Câbles', unit: 'm', qty: 260, min: 100, pu: 9800 },
      { id: 's4', ref: 'DIF-40A', label: 'Disjoncteur différentiel 40 A 30 mA', cat: 'Protection', unit: 'pièce', qty: 18, min: 10, pu: 28000 },
      { id: 's5', ref: 'DIS-16A', label: 'Disjoncteur 16 A', cat: 'Protection', unit: 'pièce', qty: 6, min: 20, pu: 6500 },
      { id: 's6', ref: 'COF-4R', label: 'Coffret électrique 4 rangées', cat: 'Protection', unit: 'pièce', qty: 7, min: 3, pu: 45000 },
      { id: 's7', ref: 'PV-550', label: 'Panneau solaire 550 W', cat: 'Solaire', unit: 'pièce', qty: 40, min: 12, pu: 135000 },
      { id: 's8', ref: 'INV-5K', label: 'Onduleur hybride 5 kW', cat: 'Solaire', unit: 'pièce', qty: 3, min: 2, pu: 720000 },
      { id: 's9', ref: 'BAT-5K', label: 'Batterie LiFePO4 5 kWh', cat: 'Solaire', unit: 'pièce', qty: 5, min: 4, pu: 1250000 },
      { id: 's10', ref: 'EPI-CAS', label: 'Casque de chantier', cat: 'Sécurité (EPI)', unit: 'pièce', qty: 24, min: 10, pu: 4500 },
      { id: 's11', ref: 'EPI-GIS', label: 'Gants isolants classe 0', cat: 'Sécurité (EPI)', unit: 'paire', qty: 4, min: 6, pu: 65000 },
      { id: 's12', ref: 'MAT-CIM', label: 'Ciment CPJ 42,5 — sac 50 kg', cat: 'Gros œuvre', unit: 'sac', qty: 210, min: 100, pu: 9000 },
      { id: 's13', ref: 'MAT-FER', label: 'Fer à béton HA10 — barre 12 m', cat: 'Gros œuvre', unit: 'barre', qty: 340, min: 150, pu: 7500 },
      { id: 's14', ref: 'PEI-20L', label: 'Peinture acrylique 20 L', cat: 'Finitions', unit: 'seau', qty: 15, min: 6, pu: 45000 }
    ];
    S.mvts = [];
    S.log = [
      { ts: Date.now() - 3600e3, text: 'Facture ' + S.factures[12].num + ' émise — ' + 'Gabon Print' },
      { ts: Date.now() - 20 * 3600e3, text: 'Devis ' + S.devis[1].num + ' envoyé — Hôtel Le Bambou' },
      { ts: Date.now() - 30 * 3600e3, text: 'Paiement reçu — SOBRAGA' },
      { ts: Date.now() - 52 * 3600e3, text: 'Chantier « Centrale solaire » : avancement 84 %' }
    ];
    S.employees.forEach(function (e, i) { enrich(e, i); });
    S.tasks = seedTasks(S);
    return S;
  }

  /* ---------- Calculs de documents ---------- */
  function total(doc, tvaRate) {
    var sub = (doc.lines || []).reduce(function (a, l) { return a + (+l.qty || 0) * (+l.pu || 0); }, 0);
    var rem = sub * (+doc.remise || 0) / 100, ht = sub - rem, tva = doc.tva === false ? 0 : ht * tvaRate / 100;
    return { sub: sub, rem: rem, ht: ht, tva: tva, ttc: ht + tva };
  }

  /* ---------- Fiches salariés détaillées (démo) ---------- */
  function avatarSvg(i) {
    var bg = ['#1a2d4d', '#243b63', '#0e7c86', '#7a3fa3', '#b4530b', '#2f8f5b'][i % 6], skin = ['#8d5a3b', '#6b4226', '#a9744f', '#5a3a22'][i % 4];
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='" + bg + "'/><path d='M14 120c3-28 20-42 46-42s43 14 46 42z' fill='#f08a24'/><path d='M44 80l16 14 16-14' fill='none' stroke='#ffd59a' stroke-width='5'/><circle cx='60' cy='50' r='23' fill='" + skin + "'/><path d='M36 46a24 24 0 0148 0z' fill='#fff'/><rect x='33' y='44' width='54' height='6' rx='3' fill='#e8ecf3'/></svg>";
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  function demoDoc(label, name, t) {
    return { id: uid('doc'), label: label, name: name, size: 1800, date: addD(t, -200), data: 'data:text/plain;charset=utf-8,' + encodeURIComponent('Document de démonstration — ' + label + ' — ' + name) };
  }
  function enrich(e, i) {
    var t = today(), q = ['Nzeng-Ayong', 'Akébé', 'Owendo', 'Batterie IV', 'Louis', 'Lalala', 'Okala', 'Angondjé', 'Alibandeng', 'Mont-Bouët', 'Sibang', 'Glass'];
    var urg = [['Marie Mba', 'Épouse'], ['Paul Nzé', 'Frère'], ['Sandrine Ondo', 'Épouse'], ['Josiane Obiang', 'Mère'], ['Alain Mouélé', 'Père'], ['Clarisse Ndong', 'Épouse'], ['Gilbert Essono', 'Frère'], ['Pauline Moukagni', 'Épouse'], ['Rose Mintsa', 'Mère'], ['Éric Bivigou', 'Époux'], ['Nadège Koumba', 'Sœur'], ['Théodore Ntoutoume', 'Père']];
    var dipl = ['Licence en génie civil', 'Ingénieure électricienne — INSG', 'BTS électrotechnique', 'CAP maçonnerie, 15 ans d\'expérience', 'BTS assistanat de direction', 'CAP maçonnerie', 'CAP électricité', 'CAP plomberie', 'CAP peinture en bâtiment', 'Licence en comptabilité', 'BTS énergies renouvelables', 'Stagiaire — BTS génie civil'];
    var med = [200, 15, -10, 120, 300, 45, -30, 150, 260, 90, 20, 310];
    e.matricule = 'NMJ-' + String(i + 1).padStart(3, '0'); e.photo = avatarSvg(i);
    e.cnss = '015-0' + String(195811 + i * 1371).padStart(6, '0') + '-' + 'ABCDEFGHJKLM'[i % 12]; e.cnamgs = '0219000' + String(22416 + i * 37).padStart(5, '0');
    e.birth = { date: (1978 + (i * 3) % 17) + '-' + String(1 + i % 12).padStart(2, '0') + '-' + String(5 + (i * 2) % 20).padStart(2, '0'), place: i % 3 ? 'Libreville' : 'Port-Gentil' };
    e.nationalite = 'Gabonaise'; e.adresse = q[i % 12] + ', Libreville'; e.civil = ['Célibataire', 'Marié(e)', 'Marié(e)', 'Divorcé(e)'][i % 4]; e.enfants = i % 4;
    e.idCard = { type: 'CNI', num: 'G' + String(1000000 + i * 48271), expire: addD(t, i === 7 ? -20 : 400 + i * 53) };
    e.urgence = { nom: urg[i][0], lien: urg[i][1], tel: '07' + (4 + i % 3) + ' 5' + (i % 10) + ' 6' + ((i * 7) % 10) + ' ' + (10 + i * 3) + ' ' + (20 + i * 2), tel2: '' };
    e.sang = ['O+', 'A+', 'B+', 'O-', 'AB+'][i % 5]; e.visite = { date: addD(t, med[i] - 365), expire: addD(t, med[i]) };
    e.epi = { vetement: ['M', 'L', 'XL', 'L', 'S', 'L', 'XL', 'M', 'L', 'M', 'L', 'M'][i], pointure: String(40 + i % 6) };
    e.diplome = dipl[i]; e.contratFin = e.contrat === 'CDD' ? addD(t, 90 + i * 10) : ''; e.essaiFin = ''; e.notes = '';
    e.docs = [];
    if (i !== 8) e.docs.push(demoDoc('CV', 'CV_' + e.name.replace(/\s+/g, '_') + '.pdf', t));
    if (i < 10) e.docs.push(demoDoc('Pièce d\'identité', 'CNI_' + e.name.split(' ')[0] + '.pdf', t));
    if (i !== 11 && i !== 8) e.docs.push(demoDoc('Contrat de travail', 'Contrat_' + e.name.split(' ')[0] + '.pdf', t));
    if (i === 1 || i === 2 || i === 10) e.docs.push(demoDoc('Diplôme', 'Diplome_' + e.name.split(' ')[0] + '.pdf', t));
    return e;
  }
  function seedTasks(S) {
    var t = today(), out = [], n = 0;
    var P = {
      c1: [['Terrassement et fondations', 0, .14, 100, null, 'e4'], ['Gros œuvre du RDC', .12, .38, 100, 0, 'e6'], ['Gros œuvre du R+1', .36, .58, 90, 1, 'e6'], ['Plancher R+2 et toiture', .56, .76, 30, 2, 'e12'], ['Électricité et plomberie (second œuvre)', .62, .88, 10, 2, 'e8'], ['Façades et peinture', .8, .95, 0, 3, 'e9'], ['Réception du bâtiment', .98, .98, 0, 5, 'e1', 1]],
      c2: [['Études et plans d\'exécution', 0, .1, 100, null, 'e2'], ['Génie civil du poste', .08, .3, 100, 0, 'e4'], ['Pose des cellules HTA et du transformateur', .28, .55, 80, 1, 'e3'], ['Tirage des câbles et raccordements', .5, .78, 25, 2, 'e7'], ['Essais et réglages', .75, .92, 0, 3, 'e2'], ['Mise en service', .96, .96, 0, 4, 'e2', 1]],
      c3: [['Dimensionnement et plans', 0, .1, 100, null, 'e11'], ['Fourniture du matériel', .08, .4, 100, 0, 'e11'], ['Pose des panneaux', .35, .7, 100, 1, 'e11'], ['Local batteries et câblage', .6, .85, 90, 2, 'e11'], ['Raccordement des onduleurs', .8, .95, 60, 3, 'e11'], ['Mise en service et formation', .97, .97, 0, 4, 'e11', 1]],
      c4: [['Relevés sur site', 0, .25, 100, null, 'e7'], ['Diagnostic NF C 15-100', .2, .5, 40, 0, 'e3'], ['Rapport d\'inspection', .5, .65, 0, 1, 'e2'], ['Levée des réserves', .65, .9, 0, 2, 'e7'], ['Contre-visite et attestation', .92, .98, 0, 3, 'e3']],
      c5: [['Dépose et préparation', 0, .1, 0, null, 'e6'], ['Rénovation des bureaux', .08, .5, 0, 0, 'e4'], ['Alimentation électrique', .4, .75, 0, 1, 'e2'], ['Réseau frigorifique', .6, .85, 0, 2, 'e3'], ['Finitions et nettoyage', .8, .98, 0, 3, 'e9']]
    };
    S.chantiers.forEach(function (c) {
      var list = P[c.id]; if (!list) return;
      var span = Math.max(1, diff(c.end, c.start)), ids = [];
      list.forEach(function (x, k) {
        var id = 't' + (++n); ids.push(id);
        out.push({ id: id, chantierId: c.id, name: x[0], start: addD(c.start, Math.round(x[1] * span)), end: addD(c.start, Math.round(x[2] * span)), progress: x[3], dep: x[4] === null ? '' : ids[x[4]], assignee: x[5], milestone: !!x[6] });
      });
    });
    return out;
  }
  function migrate(S) {
    if (S.v === 2) {
      S.employees.forEach(function (e, i) { if (!e.matricule) enrich(e, i % 12); });
      S.tasks = S.tasks || seedTasks(S); S.v = 3;
    }
    return S;
  }

  var S = null;
  function load() { try { var r = localStorage.getItem(KEY); if (r) { S = migrate(JSON.parse(r)); } } catch (e) { S = null; } if (!S || S.v !== 3) { S = seed(); } save(); return S; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); return true; } catch (e) { return false; } }
  function reset() { S = seed(); save(); return S; }
  function setState(x) { S = migrate(x); save(); return S; }
  function get() { return S; }
  function log(text) { S.log.unshift({ ts: Date.now(), text: text }); S.log = S.log.slice(0, 30); }
  function nextNum(prefix, list, date) {
    var y = (date || today()).slice(0, 4), mx = 0;
    list.forEach(function (d) { var m = d.num.match(new RegExp('^' + prefix + '-' + y + '-(\\d+)$')); if (m) mx = Math.max(mx, +m[1]); });
    return prefix + '-' + y + '-' + String(mx + 1).padStart(3, '0');
  }

  return { iso: iso, parse: parse, addD: addD, today: today, monday: monday, diff: diff, fmt: fmt, fmtM: fmtM, dFr: dFr, uid: uid, esc: esc, words: words, total: total, load: load, save: save, avatarSvg: avatarSvg, reset: reset, setState: setState, get: get, log: log, nextNum: nextNum };
})();
