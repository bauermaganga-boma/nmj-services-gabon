(function () {
  'use strict';

  var WA_NUMBER = '241074664764';
  var chat = document.getElementById('chat');
  var toggle = document.getElementById('chat-toggle');
  var body = document.getElementById('chat-body');
  var chipsBox = document.getElementById('chat-chips');
  var form = document.getElementById('chat-form');
  var input = document.getElementById('chat-input');
  var fab = document.getElementById('fab');
  var started = false;

  function waLink(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }
  function waButton(text, label) {
    return '<a class="chat__cta" href="' + waLink(text) + '" target="_blank" rel="noopener">' + (label || 'Continuer sur WhatsApp') + '</a>';
  }
  var DEVIS_WA = "Bonjour NMJ Services, je souhaite un devis pour un projet.";

  // Base de connaissances issue de la présentation commerciale
  var KB = [
    { id: 'bonjour', keys: ['bonjour', 'bonsoir', 'salut', 'hello', 'coucou', 'bjr'],
      answer: "Bonjour et bienvenue chez <strong>NMJ Services</strong> ! Je peux vous renseigner sur nos cinq pôles, nos formules de diagnostic électrique, nos références ou vous aider à demander un devis. Que puis-je faire pour vous ?" },
    { id: 'services', keys: ['service', 'prestation', 'metier', 'que faites', 'activite', 'expertise', 'domaine', 'proposez', 'competence', 'pole'],
      answer: "Nous intervenons sur <strong>cinq pôles</strong> :<ul><li>Construction &amp; tout corps d'état</li><li>Énergie &amp; installations industrielles (BT/HT)</li><li>Conformité &amp; habilitations électriques</li><li>Énergies renouvelables &amp; batteries</li><li>Organisation industrielle (Lean, Six Sigma)</li></ul>Quel est votre besoin ?",
      chips: ['Construction', 'Électricité', 'Solaire', 'Diagnostic'] },
    { id: 'construction', keys: ['construction', 'construire', 'batiment', 'maconnerie', 'gros oeuvre', 'gros-oeuvre', 'coffrage', 'ferraillage', 'plomberie', 'peinture', 'architect', 'finition', 'maison', 'villa', 'immeuble', 'tout corps'],
      answer: "En <strong>construction</strong>, nous assurons maçonnerie, coffrage, ferraillage et gros œuvre, plomberie, électricité du bâtiment, second œuvre, architecture, aménagement et finitions peinture. Un seul contrat, tous les corps d'état : vous suivez un chantier, pas dix prestataires.",
      chips: ['Demander un devis', 'Délais', 'Références'] },
    { id: 'electricite', keys: ['electri', 'industriel', 'maintenance', 'depannage', 'haute tension', 'basse tension', 'tension', 'transformateur', 'tableau', 'armoire', 'panne', 'coupure', 'installation'],
      answer: "En <strong>énergie &amp; installations industrielles</strong> : équipements et installations électriques, maintenance préventive et curative, expertise <strong>basse et haute tension</strong>, dépannage et continuité de service sur site. Objectif : moins d'arrêts non planifiés.",
      chips: ['Demander un devis', 'Diagnostic', 'Contact'] },
    { id: 'conformite', keys: ['conformite', 'conforme', 'habilitation', 'formation', 'former', 'norme', 'nf c', 'c 15-100', 'c15', 'reserve', 'risque', 'securite', 'controle', 'inspection', 'rapport'],
      answer: "Côté <strong>conformité</strong> : contrôles des installations électriques, <strong>formations aux habilitations électriques</strong>, diagnostic des risques, levée des réserves et accompagnement à la mise en conformité. Voir aussi nos formules de diagnostic.",
      chips: ['Diagnostic', 'Demander un devis'] },
    { id: 'diagnostic', keys: ['diagnostic', 'differentiel', 'terre', 'mise a la terre', 'formule', 'offre', 'tarif diag', '35 000', '50 000', '150 000', '35000', '50000', '150000'],
      answer: "Trois formules de <strong>diagnostic électrique</strong> :<ul><li><strong>Offre 1 — 35 000 XAF</strong> : contrôle des différentiels 30 mA</li><li><strong>Offre 2 — 50 000 XAF</strong> : différentiels + vérification de la mise à la terre</li><li><strong>Offre 3 — 150 000 XAF</strong> : inspection complète NF C 15-100 avec rapport</li></ul>Intervention sous 72 h ouvrées, rapport sous 5 jours ouvrés. <a class=\"chat__link\" href=\"#outils\" data-close>Estimer ma demande avec l'outil</a>",
      chips: ['Délais', 'Demander un devis'] },
    { id: 'solaire', keys: ['solaire', 'photovolta', 'panneau', 'batterie', 'renouvelable', 'energie', 'onduleur', 'autonomie', 'groupe electrogene', 'facture'],
      answer: "Nous proposons des <strong>solutions solaires et des batteries industrielles</strong> : ingénierie et dimensionnement, fourniture et vente de matériel électrique, gestion et suivi d'exploitation. Essayez notre <a class=\"chat__link\" href=\"#outils\" data-close>simulateur solaire</a> pour un premier ordre de grandeur.",
      chips: ['Demander un devis', 'Contact'] },
    { id: 'lean', keys: ['lean', 'six sigma', 'sigma', 'performance', 'productivite', 'rebut', 'optimisation', 'flux', 'organisation', 'atelier', 'usine'],
      answer: "Notre pôle <strong>organisation industrielle</strong> : Lean manufacturing et optimisation des flux, Lean management et animation des équipes, démarches Six Sigma et formations opérationnelles sur site. Des gains mesurables sur les délais, les rebuts et la productivité.",
      chips: ['Demander un devis', 'Références'] },
    { id: 'outils', keys: ['outil', 'suivi de chantier', 'espace', 'simulateur', 'planning maintenance', 'tableau de bord'],
      answer: "Notre section <a class=\"chat__link\" href=\"#outils\" data-close>Outils de gestion</a> réunit quatre outils : suivi de chantiers, devis de diagnostic, simulateur solaire et suivi de maintenance et d'habilitations. Les données affichées sont des exemples de démonstration." },
    { id: 'devis', keys: ['devis', 'prix', 'tarif', 'cout', 'combien', 'budget', 'estimation', 'chiffrage', 'chiffrer', 'cher', 'montant'],
      answer: "Chaque projet fait l'objet d'un <strong>devis personnalisé</strong>. Pour le diagnostic électrique, nos tarifs sont fixes : 35 000, 50 000 ou 150 000 XAF selon la formule. Décrivez-nous votre besoin :<br>" + waButton(DEVIS_WA, 'Demander un devis sur WhatsApp') + '<a class="chat__link" href="#contact" data-close>ou remplir le formulaire de devis</a>' },
    { id: 'delai', keys: ['delai', 'combien de temps', 'duree', 'quand', 'rapide', 'planning', 'date', '72', 'urgence', 'urgent'],
      answer: "Pour un diagnostic électrique : <strong>intervention sous 72 h ouvrées</strong> après prise de rendez-vous et <strong>rapport remis sous 5 jours ouvrés</strong>. Pour les chantiers, les délais sont fixés dans le devis.",
      chips: ['Demander un devis'] },
    { id: 'zone', keys: ['ou etes', 'etes ou', 'c est ou', 'ou se trouve', 'trouver', 'adresse', 'situe', 'localisation', 'siege', 'bureau', 'owendo', 'libreville', 'seeg', 'zone', 'province', 'interieur', 'deplace', 'venez', 'intervenez'],
      answer: "Nous sommes basés à <strong>Owendo</strong>, derrière le centre des Métiers de la SEEG, à Jean Violas (Libreville). BP 2507 Libreville — Gabon.",
      chips: ['Contact', 'Références'] },
    { id: 'contact', keys: ['contact', 'telephone', 'numero', 'appeler', 'joindre', 'mail', 'email', 'courriel', 'whatsapp', 'parler', 'humain', 'conseiller', 'rappeler'],
      answer: "Vous pouvez nous joindre :<ul><li>Tél. : <a href=\"tel:+241062821838\">062 82 18 38</a> / <a href=\"tel:+241074664764\">074 66 47 64</a></li><li>E-mail : <a href=\"mailto:nmjservices.gabon@gmail.com\">nmjservices.gabon@gmail.com</a></li><li>Owendo — Libreville</li></ul>" + waButton("Bonjour NMJ Services, je souhaite être recontacté.", 'Écrire sur WhatsApp') },
    { id: 'refs', keys: ['reference', 'realisation', 'projet', 'chantier', 'client', 'experience', 'deja fait', 'exemple', 'portfolio', 'hopital', 'sobraga', 'unoca', 'wwf', 'attestation'],
      answer: "Quelques références :<ul><li><strong>Centre Hospitalier Régional Estuaire (Melen)</strong> — bâtiments d'hospitalisation, 2024-2026</li><li><strong>SOBRAGA</strong> — performance des équipements de convoyage, 2024-2025</li><li><strong>UNOCA</strong> — mise en conformité d'un coworking sur 4 étages, 2021-2022</li><li><strong>WWF</strong> — rénovation de bureaux et alimentation électrique et frigorifique, 2020-2021</li></ul>Attestations de bonne exécution sur demande. <a class=\"chat__link\" href=\"#references\" data-close>Voir les références</a>" },
    { id: 'societe', keys: ['rccm', 'nif', 'cnss', 'cnamgs', 'capital', 'sarl', 'societe', 'legal', 'enregistr', 'immatricul', 'etablie'],
      answer: "NMJ Services est une <strong>SARL au capital de 2 000 000 FCFA</strong>, société établie (NIF 44835G, CNSS 015-0195811-E, CNAMGS 021900022416). Dossier de références et attestations sur demande." },
    { id: 'qualite', keys: ['qualite', 'garantie', 'confiance', 'serieux', 'fiable', 'valeur', 'pourquoi', 'avantage', 'interlocuteur'],
      answer: "Pourquoi NMJ Services ? <strong>Un seul interlocuteur</strong> (bâtiment, électricité, énergie, organisation), une <strong>compétence haute tension</strong> rare sur le marché local, la <strong>sécurité et la conformité</strong> intégrées à chaque intervention, et une culture de la <strong>performance</strong> (Lean, Six Sigma)." },
    { id: 'emploi', keys: ['emploi', 'recrut', 'stage', 'cv', 'candidature', 'travailler chez', 'job', 'poste'],
      answer: "Pour une candidature ou un stage, vous pouvez adresser votre CV et une lettre de motivation à <a href=\"mailto:nmjservices.gabon@gmail.com\">nmjservices.gabon@gmail.com</a>." },
    { id: 'plaquette', keys: ['plaquette', 'brochure', 'presentation', 'pdf', 'document', 'catalogue'],
      answer: "Voici notre présentation : <a class=\"chat__link\" href=\"NMJ_Services_Presentation.pdf\" download>Télécharger le PDF</a>" },
    { id: 'merci', keys: ['merci', 'au revoir', 'bye', 'a bientot', 'parfait', 'super', 'ok merci'],
      answer: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. À bientôt chez NMJ Services." }
  ];

  var CHIP_MAP = {
    'Nos services': 'services', 'Construction': 'construction', 'Électricité': 'electricite', 'Solaire': 'solaire',
    'Diagnostic': 'diagnostic', 'Demander un devis': 'devis', 'Délais': 'delai', 'Références': 'refs',
    'Contact': 'contact', 'Où êtes-vous ?': 'zone'
  };
  var DEFAULT_CHIPS = ['Nos services', 'Diagnostic', 'Demander un devis', 'Références', 'Où êtes-vous ?', 'Contact'];

  function norm(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9+ ]/g, ' ').replace(/\s+/g, ' ');
  }

  function findAnswer(q) {
    var t = ' ' + norm(q) + ' ';
    var best = null, bestScore = 0;
    KB.forEach(function (e) {
      var score = 0;
      e.keys.forEach(function (k) { if (t.indexOf(' ' + k) !== -1) score += k.length > 5 ? 2 : 1; });
      // Les salutations ne l'emportent que si la question ne contient rien d'autre
      if (e.id === 'bonjour' && score) score = 0.5;
      if (score > bestScore) { bestScore = score; best = e; }
    });
    return best;
  }

  function addMsg(html, who) {
    var m = document.createElement('div');
    m.className = 'chat__msg chat__msg--' + who;
    m.innerHTML = html;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }

  function setChips(list) {
    chipsBox.innerHTML = '';
    (list || DEFAULT_CHIPS).forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat__chip';
      b.textContent = c;
      b.addEventListener('click', function () { ask(c, CHIP_MAP[c]); });
      chipsBox.appendChild(b);
    });
  }

  function botReply(html, chips) {
    var typing = addMsg('<span class="chat__typing"><i></i><i></i><i></i></span>', 'bot');
    setTimeout(function () {
      typing.innerHTML = html;
      body.scrollTop = body.scrollHeight;
      setChips(chips);
    }, 550 + Math.min(html.length, 400));
  }

  function ask(text, forcedId) {
    addMsg(text.replace(/</g, '&lt;'), 'user');
    var entry = null;
    if (forcedId) KB.forEach(function (e) { if (e.id === forcedId) entry = e; });
    if (!entry) entry = findAnswer(text);
    if (entry) {
      botReply(entry.answer, entry.chips);
    } else {
      botReply("Je n'ai pas la réponse précise à cette question, mais notre équipe peut vous répondre directement :<br>" +
        waButton("Bonjour NMJ Services, j'ai une question : " + text, 'Poser ma question sur WhatsApp'));
    }
  }

  function open() {
    chat.classList.add('is-open');
    fab.classList.add('is-chat-open');
    chat.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    if (!started) {
      started = true;
      botReply("Bonjour 👋 Je suis l'assistant de <strong>NMJ Services</strong>. Posez-moi vos questions sur nos métiers, nos réalisations ou votre projet — je vous réponds tout de suite.");
    }
    setTimeout(function () { input.focus(); }, 300);
  }
  function close() {
    chat.classList.remove('is-open');
    fab.classList.remove('is-chat-open');
    chat.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () { chat.classList.contains('is-open') ? close() : open(); });
  document.getElementById('chat-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && chat.classList.contains('is-open')) close(); });
  body.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-close]');
    if (a) close();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    input.value = '';
    ask(q);
  });

  // Invitation discrète après quelques secondes, une seule fois par visite
  setTimeout(function () {
    try { if (sessionStorage.getItem('nmjChatHint')) return; sessionStorage.setItem('nmjChatHint', '1'); } catch (e) {}
    if (!chat.classList.contains('is-open')) fab.classList.add('is-hint');
    setTimeout(function () { fab.classList.remove('is-hint'); }, 6000);
  }, 5000);
})();
