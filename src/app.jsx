const { useState, useEffect, useCallback } = React;

/* ============================================================
   CONFIGURATION DES MODULES
   phase : 'avant' | 'apres' | 'always'
   ============================================================ */
const MODULES = [
  { key:'bord', sheet:null, label:'Bord', phase:'always' },

  { key:'souhaits', sheet:'Souhaits', label:'Souhaits', phase:'avant', drive:'Divers',
    empty:"Listez ce que chacun attend du bateau : type, taille, équipement, budget max. C'est la grille de lecture pour juger chaque visite.",
    fields:[
      {key:'titre', label:'Titre', type:'text', required:true},
      {key:'categorie', label:'Catégorie', type:'select', options:['Type de bateau','Équipement','Caractéristique','Budget','Autre']},
      {key:'priorite', label:'Priorité', type:'select', options:['Indispensable','Souhaité','Bonus']},
      {key:'auteur', label:'Proposé par', type:'select', optionsFrom:'membres'},
      {key:'statut', label:'Statut', type:'select', options:['Ouvert','Validé','Abandonné']},
      {key:'notes', label:'Notes', type:'textarea'},
    ],
    columns:['titre','categorie','priorite','statut'], hideFrom:1 },

  { key:'budget', sheet:'Budget', label:'Budget', phase:'avant', drive:'Devis',
    empty:"Chiffrez le projet complet : prix d'achat, place au port, assurance, entretien. L'écart entre estimé et réel se calcule tout seul.",
    fields:[
      {key:'categorie', label:'Catégorie', type:'select', options:['Achat','Taxes & immatriculation','Assurance','Entretien annuel','Place au port','Équipement','Convoyage','Autre']},
      {key:'libelle', label:'Libellé', type:'text', required:true},
      {key:'montantEstime', label:'Montant estimé (€)', type:'number'},
      {key:'montantReel', label:'Montant réel (€)', type:'number'},
      {key:'notes', label:'Notes', type:'textarea'},
    ],
    columns:['categorie','libelle','montantEstime','montantReel'], hideFrom:3 },

  { key:'visites', sheet:'Visites', label:'Visites', phase:'avant', drive:'Visites',
    empty:"Après chaque bateau vu, notez l'essentiel pendant que c'est frais : état, prix, ce qui coince. Dans trois mois vous ne vous en souviendrez plus.",
    fields:[
      {key:'dateVisite', label:'Date de visite', type:'date'},
      {key:'nomBateau', label:'Nom du bateau', type:'text', required:true},
      {key:'modele', label:'Modèle / type', type:'text'},
      {key:'annee', label:'Année', type:'number'},
      {key:'lieu', label:'Lieu', type:'text'},
      {key:'vendeur', label:'Vendeur / contact', type:'text'},
      {key:'prixDemande', label:'Prix demandé (€)', type:'number'},
      {key:'prixPropose', label:'Prix proposé (€)', type:'number'},
      {key:'note', label:'Note sur 5', type:'select', options:['1','2','3','4','5']},
      {key:'decision', label:'Décision', type:'select', options:['À revoir','Rejeté','Favori','Acheté']},
      {key:'participants', label:'Participants', type:'text'},
      {key:'annonceUrl', label:"Lien de l'annonce", type:'url'},
      {key:'pointsPositifs', label:'Points positifs', type:'textarea'},
      {key:'pointsNegatifs', label:'Points négatifs', type:'textarea'},
      {key:'notes', label:'Notes', type:'textarea'},
    ],
    columns:['dateVisite','nomBateau','lieu','prixDemande','note','decision'], hideFrom:2 },

  { key:'parts', sheet:'Copropriete', label:'Parts', phase:'always', drive:'Contrats',
    empty:"Enregistrez l'apport de chacun. Les pourcentages de propriété se recalculent à chaque ligne.",
    fields:[
      {key:'membre', label:'Membre', type:'select', optionsFrom:'membres', required:true},
      {key:'montant', label:'Montant (€)', type:'number', required:true},
      {key:'datePaiement', label:'Date', type:'date'},
      {key:'type', label:'Type', type:'select', options:['Apport initial','Frais courant','Remboursement']},
      {key:'notes', label:'Notes', type:'textarea'},
    ],
    columns:['membre','montant','datePaiement','type'], hideFrom:2 },

  { key:'identite', sheet:'BateauInfo', label:'Identité', phase:'apres', special:'identite' },

  { key:'entretien', sheet:'Entretien', label:'Entretien', phase:'apres', drive:'Entretien',
    empty:"Vidange, antifouling, contrôle du gréement, révision des équipements de sécurité. Une échéance et un responsable par tâche.",
    fields:[
      {key:'tache', label:'Tâche', type:'text', required:true},
      {key:'categorie', label:'Catégorie', type:'select', options:['Moteur','Coque','Voiles / gréement','Électronique','Sécurité','Autre']},
      {key:'frequence', label:'Fréquence', type:'select', options:['Ponctuel','Mensuel','Saisonnier','Annuel']},
      {key:'derniereRealisation', label:'Dernière réalisation', type:'date'},
      {key:'prochaineEcheance', label:'Prochaine échéance', type:'date'},
      {key:'responsable', label:'Responsable', type:'select', optionsFrom:'membres'},
      {key:'statut', label:'Statut', type:'select', options:['À faire','En cours','Fait']},
      {key:'cout', label:'Coût (€)', type:'number'},
      {key:'notes', label:'Notes', type:'textarea'},
    ],
    columns:['tache','categorie','prochaineEcheance','responsable','statut'], hideFrom:1 },

  { key:'manutention', sheet:'Manutention', label:'Manutention', phase:'apres', drive:'Manutention',
    empty:"Mise à l'eau, sortie d'eau, carénage, hivernage. Qui s'en occupe et quand.",
    fields:[
      {key:'type', label:'Type', type:'select', options:["Mise à l'eau","Sortie d'eau",'Hivernage','Carénage','Convoyage','Autre']},
      {key:'datePrevue', label:'Date prévue', type:'date'},
      {key:'dateReelle', label:'Date réelle', type:'date'},
      {key:'responsable', label:'Responsable', type:'select', optionsFrom:'membres'},
      {key:'statut', label:'Statut', type:'select', options:['Prévu','Fait','Annulé']},
      {key:'notes', label:'Notes', type:'textarea'},
    ],
    columns:['type','datePrevue','responsable','statut'], hideFrom:2 },

  { key:'planning', sheet:'Planning', label:'Planning', phase:'apres', drive:'Divers',
    empty:"Qui prend le bateau, et quand. Réservez vos créneaux pour éviter les doublons.",
    fields:[
      {key:'dateDebut', label:'Début', type:'date', required:true},
      {key:'dateFin', label:'Fin', type:'date'},
      {key:'typeUsage', label:"Type d'usage", type:'select', options:['Navigation','Entretien','Réservation','Autre']},
      {key:'membres', label:'Membres concernés', type:'text'},
      {key:'notes', label:'Notes', type:'textarea'},
    ],
    columns:['dateDebut','dateFin','typeUsage','membres'], hideFrom:2 },

  { key:'depenses', sheet:'Depenses', label:'Dépenses', phase:'apres', drive:'Factures',
    empty:"Chaque frais avancé par l'un d'entre vous, pour solder les comptes sans discussion.",
    fields:[
      {key:'date', label:'Date', type:'date'},
      {key:'categorie', label:'Catégorie', type:'select', options:['Carburant','Port','Entretien','Assurance','Équipement','Autre']},
      {key:'libelle', label:'Libellé', type:'text', required:true},
      {key:'montant', label:'Montant (€)', type:'number'},
      {key:'payePar', label:'Payé par', type:'select', optionsFrom:'membres'},
      {key:'membresConcernes', label:'Répartition entre', type:'text'},
      {key:'statut', label:'Statut', type:'select', options:['Remboursé','En attente']},
      {key:'notes', label:'Notes', type:'textarea'},
    ],
    columns:['date','libelle','montant','payePar','statut'], hideFrom:1 },

  { key:'pacte', sheet:'Pacte', label:'Cadre légal', phase:'always', special:'pacte' },

  { key:'documents', sheet:'Documents', label:'Documents', phase:'always', special:'fichiers' },

  { key:'membres', sheet:'Membres', label:'Équipage', phase:'always',
    empty:"Ajoutez chaque copropriétaire. Les noms alimentent tous les menus de l'application.",
    fields:[
      {key:'nom', label:'Nom', type:'text', required:true},
      {key:'couleur', label:'Couleur (hex, optionnel)', type:'text'},
    ],
    columns:['nom'] },
];

const IDENTITE_CHAMPS = [
  'Modèle','Année','Longueur','Tirant d\'eau','N° de coque (HIN)','Immatriculation',
  'Port d\'attache','Place au port','Assurance — compagnie','Assurance — n° de police',
  'Échéance assurance','Notes',
];

const PILL = {
  'Validé':'pill-go','Fait':'pill-go','Remboursé':'pill-go','Acheté':'pill-go','Favori':'pill-go',
  'Ouvert':'pill-wait','En cours':'pill-wait','Prévu':'pill-wait','À revoir':'pill-wait',
  'À faire':'pill-warn','En attente':'pill-warn',
  'Abandonné':'pill-off','Rejeté':'pill-off','Annulé':'pill-off',
  'Indispensable':'pill-warn','Souhaité':'pill-wait','Bonus':'pill-off',
};

const CATEGORIES = ['Factures','Contrats','Devis','Assurance','Visites','Entretien','Manutention','Photos','Cadre légal','Divers'];
const MAX_MO = 10;

/* ============================================================
   ►►► À CONFIGURER ◄◄◄

   URL du déploiement Apps Script (termine par /exec).
   Elle change à CHAQUE nouveau déploiement — pense à la reporter ici.

   Le déploiement doit être réglé sur :
     Exécuter en tant que : Moi
     Qui a accès          : Tout le monde
   Sans "Tout le monde", le navigateur bloque l'appel depuis GitHub Pages.
   ============================================================ */
const GAS_URL = 'https://script.google.com/macros/s/AKfycby_UoLBWCnu25PO5vcBpqLaOutEw7i4Boh8De15xgRMjhE9lREqTHxtWHNNXBMXTVo-8g/exec';

/* Doit être identique à API_TOKEN dans Code.gs. */
const API_TOKEN = 'bateau-a-changer-2026';

/* ============================================================
   BACKEND — trois modes, détectés automatiquement :
     1. page servie par Apps Script  -> google.script.run
     2. GAS_URL renseignée           -> fetch (GitHub Pages)
     3. ni l'un ni l'autre           -> données de démonstration
   ============================================================ */
const hasGAS = typeof google !== 'undefined' && google.script && google.script.run;
const hasURL = /^https:\/\/script\.google\.com\/.+\/exec$/.test(GAS_URL);

const DEMO = {
  Config:[{id:'c1',cle:'phase',valeur:'avant'},{id:'c2',cle:'nomBateau',valeur:''}],
  Membres:[{id:'m1',nom:'Jeff'},{id:'m2',nom:'Marc'},{id:'m3',nom:'Antoine'}],
  Souhaits:[
    {id:'s1',titre:'Voilier habitable 10-12 m',categorie:'Type de bateau',priorite:'Indispensable',auteur:'Jeff',statut:'Validé',notes:''},
    {id:'s2',titre:'Moteur inboard sous 2000 h',categorie:'Équipement',priorite:'Souhaité',auteur:'Marc',statut:'Ouvert',notes:''},
    {id:'s3',titre:'Annexe et hors-bord',categorie:'Équipement',priorite:'Bonus',auteur:'Antoine',statut:'Ouvert',notes:''},
  ],
  Budget:[
    {id:'b1',categorie:'Achat',libelle:"Prix d'achat cible",montantEstime:65000,montantReel:'',notes:''},
    {id:'b2',categorie:'Place au port',libelle:'Anneau annuel',montantEstime:3200,montantReel:'',notes:''},
    {id:'b3',categorie:'Assurance',libelle:'Prime annuelle',montantEstime:900,montantReel:'',notes:''},
    {id:'b4',categorie:'Entretien annuel',libelle:'Carénage et antifouling',montantEstime:1400,montantReel:'',notes:''},
  ],
  Visites:[
    {id:'v1',dateVisite:'2026-06-14',nomBateau:'Sun Odyssey 349',modele:'Jeanneau',annee:2016,lieu:"Les Sables-d'Olonne",prixDemande:78000,note:'4',decision:'À revoir',participants:'Jeff, Marc',pointsPositifs:'Voiles récentes',pointsNegatifs:'Au-dessus du budget',notes:''},
    {id:'v2',dateVisite:'2026-06-28',nomBateau:'Océanis 34',modele:'Bénéteau',annee:2011,lieu:'La Rochelle',prixDemande:62000,prixPropose:58000,note:'5',decision:'Favori',participants:'Jeff, Marc, Antoine',pointsPositifs:'Bon état général',pointsNegatifs:'Électronique à reprendre',notes:''},
  ],
  Copropriete:[
    {id:'p1',membre:'Jeff',montant:25000,datePaiement:'2026-07-01',type:'Apport initial',notes:''},
    {id:'p2',membre:'Marc',montant:20000,datePaiement:'2026-07-01',type:'Apport initial',notes:''},
    {id:'p3',membre:'Antoine',montant:15000,datePaiement:'2026-07-03',type:'Apport initial',notes:''},
  ],
  BateauInfo:[], Entretien:[], Manutention:[], Planning:[], Depenses:[], Documents:[],
  Fichiers:[], Pacte:[], Signatures:[], Versions:[],
};

function rid(){ return 'x' + Math.random().toString(36).slice(2,8); }

function demoCall(fn, a){
  return new Promise(res => setTimeout(() => {
    if (fn === 'getAllData') return res(DEMO);
    if (fn === 'addRow'){ const row = Object.assign({}, a[1], {id:rid()}); DEMO[a[0]] = [...(DEMO[a[0]]||[]), row]; return res(row); }
    if (fn === 'updateRow'){ let o=null; DEMO[a[0]] = (DEMO[a[0]]||[]).map(r => r.id!==a[1] ? r : (o=Object.assign({},r,a[2]))); return res(o); }
    if (fn === 'deleteRow'){ DEMO[a[0]] = (DEMO[a[0]]||[]).filter(r=>r.id!==a[1]); return res({id:a[1]}); }
    if (fn === 'setConfig'){
      const ex = DEMO.Config.find(c=>c.cle===a[0]);
      if (ex) DEMO.Config = DEMO.Config.map(c=>c.cle===a[0]?{...c,valeur:a[1]}:c);
      else DEMO.Config = [...DEMO.Config,{id:rid(),cle:a[0],valeur:a[1]}];
      return res(a[1]);
    }
    res(null);
  }, 110));
}

/* Appel HTTP vers le déploiement Apps Script.
   Content-Type text/plain volontaire : évite la requête preflight OPTIONS,
   qu'Apps Script ne sait pas traiter. */
async function httpCall(fn, args){
  let res;
  try {
    res = await fetch(GAS_URL, {
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({ token: API_TOKEN, fn, args }),
      redirect:'follow',
    });
  } catch (e) {
    throw new Error("Serveur injoignable. Vérifiez que le déploiement est ouvert à « Tout le monde ».");
  }
  if (!res.ok) throw new Error('Erreur serveur ' + res.status + '.');

  const texte = await res.text();
  let json;
  try { json = JSON.parse(texte); }
  catch (e) { throw new Error("Réponse inattendue du serveur. L'URL de déploiement est peut-être périmée."); }

  if (!json.ok) throw new Error(json.error || 'Erreur inconnue.');
  return json.data;
}

function server(fn, ...a){
  if (hasGAS) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(e => reject(new Error(e.message || String(e))))
        [fn](...a);
    });
  }
  if (hasURL) return httpCall(fn, a);
  return demoCall(fn, a);
}

/* ============================================================
   FORMATAGE
   ============================================================ */
function euros(v){
  if (v === '' || v == null || isNaN(Number(v))) return '—';
  return Number(v).toLocaleString('fr-FR',{maximumFractionDigits:0}).replace(/\u202f|\u00a0/g,' ') + ' €';
}
function jour(v){
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('fr-FR');
}
const isDateCol  = c => /^date|Echeance|Realisation|datePrevue|dateReelle|datePaiement|dateDebut|dateFin/i.test(c);
const isMoneyCol = c => /montant|prix|cout/i.test(c);


/* ============================================================
   PIÈCES JOINTES
   ============================================================ */
function poids(o){
  const n = Number(o)||0;
  if (n < 1024) return n + ' o';
  if (n < 1048576) return Math.round(n/1024) + ' Ko';
  return (n/1048576).toFixed(1).replace('.',',') + ' Mo';
}

function lireBase64(file){
  return new Promise((ok, ko) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(',')[1]);
    r.onerror = () => ko(new Error('Lecture du fichier impossible.'));
    r.readAsDataURL(file);
  });
}

/* Bouton trombone : compte les pièces et ouvre le panneau. */
function Clip({ n, onClick }){
  return (
    <button className={'clip' + (n ? ' has' : '')} onClick={onClick}
      title={n ? n + ' pièce' + (n>1?'s':'') + ' jointe' + (n>1?'s':'') : 'Aucune pièce jointe'}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M21.4 11.05 12.25 20.2a6 6 0 0 1-8.49-8.49l9.2-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
      </svg>
      {n > 0 && <span>{n}</span>}
    </button>
  );
}

/* Panneau d'ajout et de consultation des pièces d'une ligne. */
function Pieces({ titre, module, ligneId, categorie, fichiers, membre, onClose, onUpload, onDelete }){
  const [cat, setCat] = useState(categorie || 'Divers');
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState('');

  async function choisir(e){
    const liste = Array.from(e.target.files || []);
    e.target.value = '';
    if (!liste.length) return;
    setErreur(''); setBusy(true);
    try {
      for (const f of liste){
        if (f.size > MAX_MO * 1048576) throw new Error(f.name + ' dépasse ' + MAX_MO + ' Mo.');
        const data = await lireBase64(f);
        await onUpload({ module, ligneId, categorie: cat, nom: f.name, mime: f.type, data, ajoutePar: membre });
      }
    } catch (err) { setErreur(err.message); }
    setBusy(false);
  }

  return (
    <div className="scrim" onMouseDown={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true">
        <h3>Pièces jointes</h3>
        <div className="sheet-sub">{titre}</div>

        {fichiers.length === 0 && <p className="muted" style={{marginTop:0}}>Aucun fichier pour l'instant.</p>}

        {fichiers.map(f => (
          <div className="filerow" key={f.id}>
            <div className="filemeta">
              <a href={f.url} target="_blank" rel="noreferrer">{f.nom}</a>
              <span>{f.categorie} · {poids(f.taille)} · {jour(f.dateAjout)}{f.ajoutePar ? ' · ' + f.ajoutePar : ''}</span>
            </div>
            <button className="iconbtn" title="Supprimer"
              onClick={()=>{ if(confirm('Supprimer « ' + f.nom + ' » ? Le fichier partira à la corbeille Drive.')) onDelete(f.id); }}>✕</button>
          </div>
        ))}

        <div className="drop">
          <div className="field" style={{marginBottom:12}}>
            <label>Ranger dans</label>
            <select value={cat} onChange={e=>setCat(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <label className={'btn btn-accent' + (busy ? ' busy' : '')} style={{display:'inline-block'}}>
            {busy ? 'Envoi en cours…' : 'Choisir des fichiers'}
            <input type="file" multiple hidden disabled={busy} onChange={choisir} />
          </label>
          <p className="muted" style={{margin:'10px 0 0'}}>
            {MAX_MO} Mo maximum par fichier. Les fichiers sont rangés dans le dossier Drive du projet.
          </p>
          {erreur && <p className="err">{erreur}</p>}
        </div>

        <div className="sheet-actions">
          <button className="btn" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   ÉCRAN DE CHARGEMENT
   La planche du bateau se révèle du bas vers le haut pendant que
   les données arrivent. La progression monte par paliers réels et
   s'arrête à 92 % tant que le serveur n'a pas répondu, pour ne pas
   promettre une fin qui n'est pas encore là.
   ============================================================ */
const ETAPES = [
  { a: 0,  t: 'Connexion au serveur' },
  { a: 26, t: 'Lecture des données' },
  { a: 54, t: 'Mise en place' },
  { a: 78, t: 'Presque prêt' },
];

function Chargement({ pret, erreur, onRetry, onFini, nom }){
  const [flot, setFlot] = useState(4);
  const [etape, setEtape] = useState(0);
  const [sortie, setSortie] = useState(false);
  // Durée plancher : si le serveur répond en 100 ms, l'écran ne doit pas
  // clignoter. On laisse l'animation se jouer au moins ce temps-là.
  const [plancher, setPlancher] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPlancher(true), 900);
    return () => clearTimeout(t);
  }, []);
  const fini = pret && plancher;

  // Montée progressive, plafonnée tant que les données ne sont pas là.
  useEffect(() => {
    if (fini || erreur) return;
    const t = setInterval(() => {
      setFlot(v => {
        const suivant = v + (v < 44 ? 10 : v < 68 ? 5 : v < 82 ? 2 : 0.5);
        return Math.min(93, suivant);
      });
    }, 110);
    return () => clearInterval(t);
  }, [fini, erreur]);

  useEffect(() => {
    setEtape(ETAPES.reduce((acc, e, i) => flot >= e.a ? i : acc, 0));
  }, [flot]);

  // Données reçues : on remplit jusqu'en haut, puis on efface l'écran.
  useEffect(() => {
    if (!fini) return;
    setFlot(100);
    const a = setTimeout(() => setSortie(true), 620);
    const b = setTimeout(() => onFini && onFini(), 1120);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [fini, onFini]);

  if (erreur) {
    return (
      <div className="boot">
        <div className="boot-plate" style={{maxWidth:400,opacity:.5}}><i /></div>
        <div className="boot-meta boot-fail">
          <p className="boot-name" style={{marginBottom:12}}>Connexion impossible</p>
          <p>Le serveur n'a pas répondu. Les données sont intactes, c'est la liaison qui a échoué.</p>
          <div className="why">{erreur}</div>
          <button className="btn btn-accent" onClick={onRetry}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className={'boot' + (sortie ? ' out' : '')} style={{'--flot': flot + '%'}}>
      <div className="boot-plate">
        <i />
        <div className="boot-reveal"><i /></div>
        <div className="boot-line" />
      </div>
      <div className="boot-meta">
        <p className="boot-name">{nom || 'Projet Bateau'}</p>
        <div className="boot-bar"><span /></div>
        <p className="boot-status">
          {flot >= 100 ? <b>Paré</b> : ETAPES[etape].t}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   BANDEAU — plaque de nom
   ============================================================ */
function Hero({ phase, onPhase, nomBateau, onRename, info, stats, membres, membre, onMembre }){
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(nomBateau);
  useEffect(()=>{ setDraft(nomBateau); },[nomBateau]);

  const apres = phase === 'apres';
  const named = !!(nomBateau && nomBateau.trim());

  function commit(){
    setEditing(false);
    const v = draft.trim();
    if (v !== nomBateau) onRename(v);
  }

  const specs = apres
    ? [["Port d'attache", info["Port d'attache"] || '—'],
       ['Modèle', info['Modèle'] || '—'],
       ['Année', info['Année'] || '—'],
       ['Longueur', info['Longueur'] || '—']]
    : [['Équipage', stats.membres],
       ['Visites', stats.visites],
       ['Budget estimé', euros(stats.budget)],
       ['Apports', euros(stats.apports)]];

  return (
    <header className="hero">
      <div className="hero-plan" aria-hidden="true"><i /></div>
      <div className="hero-inner">
        <div className="plate">
          <span className={'eyebrow' + (apres ? '' : ' searching')}>
            {apres ? 'Au ponton' : 'En recherche'}
          </span>

          {editing ? (
            <input className="rename" autoFocus value={draft}
              onChange={e=>setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={e=>{ if(e.key==='Enter') commit(); if(e.key==='Escape'){ setDraft(nomBateau); setEditing(false);} }} />
          ) : (
            <>
              <h1 className={'boatname' + (named ? '' : ' unnamed')}>
                {named ? nomBateau : 'Sans nom'}
              </h1>
              <button className="plate-edit" onClick={()=>setEditing(true)}>
                {named ? 'Modifier le nom' : 'Donner un nom au bateau'}
              </button>
            </>
          )}

          <dl className="specs">
            {specs.map(([k,v]) => (
              <div className="spec" key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>

        <div className="phase">
          <div className="phase-label">Phase</div>
          <div className="phase-switch">
            <button aria-pressed={!apres} onClick={()=>onPhase('avant')}>Recherche</button>
            <button aria-pressed={apres} onClick={()=>onPhase('apres')}>Propriété</button>
          </div>
          <div className="phase-label" style={{marginTop:16}}>Connecté en tant que</div>
          <select className="who" value={membre} onChange={e=>onMembre(e.target.value)}>
            <option value="">Choisir mon nom</option>
            {membres.map(m => <option key={m.id} value={m.nom}>{m.nom}</option>)}
          </select>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   ONGLETS
   ============================================================ */
function Tabs({ phase, active, onSelect, counts }){
  const always = MODULES.filter(m => m.phase === 'always' && m.key !== 'membres' && m.key !== 'bord');
  const phased = MODULES.filter(m => m.phase === phase);
  const list = [MODULES[0], ...phased, null, ...always, MODULES[MODULES.length-1]];

  return (
    <div className="tabs-outer">
      <nav className="tabs">
        {list.map((m,i) => m === null
          ? <div className="tab-sep" key={'sep'+i} />
          : (
            <button key={m.key} className="tab"
              aria-current={active===m.key ? 'page' : undefined}
              onClick={()=>onSelect(m.key)}>
              {m.label}
              {m.sheet && counts[m.sheet] > 0 && <span className="n">{counts[m.sheet]}</span>}
            </button>
          ))}
      </nav>
    </div>
  );
}

/* ============================================================
   CHAMPS
   ============================================================ */
function Field({ f, value, onChange, membres }){
  const opts = f.optionsFrom === 'membres' ? membres.map(m=>m.nom) : (f.options || []);
  if (f.type === 'textarea')
    return <textarea value={value||''} onChange={e=>onChange(e.target.value)} />;
  if (f.type === 'select')
    return (
      <select value={value||''} onChange={e=>onChange(e.target.value)}>
        <option value="">—</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  const t = f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'url' ? 'url' : 'text';
  return <input type={t} value={value||''} onChange={e=>onChange(e.target.value)} />;
}

function Sheet({ mod, initial, onClose, onSave, membres }){
  const [form, setForm] = useState(initial || {});
  const edit = !!(initial && initial.id);

  function submit(){
    const miss = (mod.fields||[]).find(f => f.required && !form[f.key]);
    if (miss) { alert('Champ obligatoire : ' + miss.label); return; }
    onSave(form);
  }

  return (
    <div className="scrim" onMouseDown={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true">
        <h3>{edit ? 'Modifier la ligne' : 'Nouvelle ligne'}</h3>
        <div className="sheet-sub">{mod.label}</div>
        <div className="pair">
          {mod.fields.map(f => (
            <div className={'field' + (f.type==='textarea' ? ' wide' : '')} key={f.key}>
              <label>{f.label}{f.required ? ' *' : ''}</label>
              <Field f={f} value={form[f.key]} membres={membres}
                onChange={v=>setForm(s=>({...s,[f.key]:v}))} />
            </div>
          ))}
        </div>
        <div className="sheet-actions">
          <button className="btn-quiet" onClick={onClose}>Annuler</button>
          <button className="btn btn-accent" onClick={submit}>{edit ? 'Enregistrer' : 'Ajouter'}</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CELLULES
   ============================================================ */
function cell(col, v){
  if (v === '' || v == null) return '—';
  if (isDateCol(col)) return jour(v);
  if (isMoneyCol(col)) return euros(v);
  if (PILL[v]) return <span className={'pill ' + PILL[v]}>{v}</span>;
  if (typeof v === 'string' && v.indexOf('http') === 0)
    return <a href={v} target="_blank" rel="noreferrer">Ouvrir</a>;
  return String(v);
}

/* ============================================================
   VUE MODULE
   ============================================================ */
function ModuleView({ mod, rows, membres, fichiers, membre, onAdd, onUpdate, onDelete, onUpload, onDeleteFile }){
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pieces, setPieces] = useState(null);
  const cols = mod.columns || mod.fields.map(f=>f.key);
  const hf = mod.hideFrom;

  function save(form){
    if (editing) onUpdate(mod.sheet, editing.id, form);
    else onAdd(mod.sheet, form);
    setOpen(false);
  }

  return (
    <>
      <div className="head">
        <div>
          <h2>{mod.label}</h2>
          <div className="sub">{rows.length} ligne{rows.length>1?'s':''}</div>
        </div>
        <button className="btn" onClick={()=>{ setEditing(null); setOpen(true); }}>Ajouter</button>
      </div>

      {mod.key === 'budget' && <BudgetGauges rows={rows} />}
      {mod.key === 'parts' && <Shares rows={rows} />}

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty">
            <div className="rule" />
            <p>{mod.empty}</p>
            <button className="btn btn-accent" onClick={()=>{ setEditing(null); setOpen(true); }}>Ajouter la première ligne</button>
          </div>
        ) : (
          <table>
            <thead><tr>
              {cols.map((c,i) => (
                <th key={c} className={hf!=null && i>=hf ? 'hide-s' : ''}>
                  {(mod.fields.find(f=>f.key===c)||{}).label || c}
                </th>
              ))}
              <th style={{width:34}} />
              <th />
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  {cols.map((c,i) => (
                    <td key={c} className={(isMoneyCol(c)?'num ':'') + (hf!=null && i>=hf ? 'hide-s' : '')}>
                      {cell(c, r[c])}
                    </td>
                  ))}
                  <td>
                    <Clip n={(fichiers||[]).filter(f=>f.module===mod.sheet && String(f.ligneId)===String(r.id)).length}
                      onClick={()=>setPieces(r)} />
                  </td>
                  <td>
                    <div className="actions">
                      <button className="iconbtn" title="Modifier" onClick={()=>{ setEditing(r); setOpen(true); }}>Modifier</button>
                      <button className="iconbtn" title="Supprimer" onClick={()=>{ if(confirm('Supprimer cette ligne ?')) onDelete(mod.sheet, r.id); }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && <Sheet mod={mod} initial={editing} membres={membres}
        onClose={()=>setOpen(false)} onSave={save} />}

      {pieces && (
        <Pieces
          titre={mod.label + ' — ' + (pieces[(mod.columns||[])[0]] || pieces[(mod.columns||[])[1]] || 'ligne')}
          module={mod.sheet} ligneId={pieces.id} categorie={mod.drive} membre={membre}
          fichiers={(fichiers||[]).filter(f=>f.module===mod.sheet && String(f.ligneId)===String(pieces.id))}
          onClose={()=>setPieces(null)} onUpload={onUpload} onDelete={onDeleteFile} />
      )}
    </>
  );
}

/* ============================================================
   RELEVÉS
   ============================================================ */
function Readout({ label, value, tone, pct }){
  return (
    <div className={'readout' + (tone === 'alert' ? ' alert' : tone === 'mute' ? ' mute' : '')}>
      <dt>{label}</dt>
      <dd className={tone === 'alert' ? 'alert' : ''}>{value}</dd>
      {pct != null && (
        <div className="gauge"><span className={pct>100?'over':''} style={{width:Math.min(100,pct)+'%'}} /></div>
      )}
    </div>
  );
}

function BudgetGauges({ rows }){
  const est = rows.reduce((s,r)=>s+(Number(r.montantEstime)||0),0);
  const reel = rows.reduce((s,r)=>s+(Number(r.montantReel)||0),0);
  const pct = est>0 ? Math.round(reel/est*100) : 0;
  const over = reel > est;
  return (
    <div className="readouts">
      <Readout label="Total estimé" value={euros(est)} />
      <Readout label="Engagé" value={euros(reel)} tone={over?'alert':undefined} pct={pct} />
      <Readout label="Écart" value={euros(reel-est)} tone={over?'alert':'mute'} />
    </div>
  );
}

function Shares({ rows }){
  const by = {};
  rows.forEach(r => { if(r.type!=='Remboursement') by[r.membre] = (by[r.membre]||0) + (Number(r.montant)||0); });
  const list = Object.entries(by).sort((a,b)=>b[1]-a[1]);
  const total = list.reduce((s,[,v])=>s+v,0);
  if (!list.length) return null;
  return (
    <div className="card shares" style={{marginBottom:16}}>
      <span className="eyebrow">Répartition de la propriété</span>
      {list.map(([nom,m]) => {
        const p = total>0 ? Math.round(m/total*100) : 0;
        return (
          <div className="share" key={nom}>
            <div className="share-top"><strong>{nom}</strong><span>{euros(m)} · {p} %</span></div>
            <div className="share-bar"><span style={{width:p+'%'}} /></div>
          </div>
        );
      })}
      <div className="shares-total"><span>Total apporté</span><span className="data">{euros(total)}</span></div>
    </div>
  );
}

/* ============================================================
   IDENTITÉ DU BATEAU
   ============================================================ */
function Identite({ rows, onAdd, onUpdate }){
  const map = {};
  rows.forEach(r => { map[r.champ] = r; });
  const [draft, setDraft] = useState(() => {
    const d = {};
    IDENTITE_CHAMPS.forEach(c => { d[c] = map[c] ? map[c].valeur : ''; });
    return d;
  });
  const [busy, setBusy] = useState(false);

  function save(){
    setBusy(true);
    Promise.all(IDENTITE_CHAMPS.map(c =>
      map[c] ? onUpdate('BateauInfo', map[c].id, {valeur:draft[c]})
             : onAdd('BateauInfo', {champ:c, valeur:draft[c]})
    )).finally(()=>setBusy(false));
  }

  return (
    <>
      <div className="head">
        <div>
          <h2>Identité</h2>
          <div className="sub">Caractéristiques et informations administratives</div>
        </div>
        <button className="btn btn-accent" onClick={save} disabled={busy}>
          {busy ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
      <div className="card identity">
        <div className="pair">
          {IDENTITE_CHAMPS.map(c => (
            <div className={'field' + (c==='Notes' ? ' wide' : '')} key={c}>
              <label>{c}</label>
              {c === 'Notes'
                ? <textarea value={draft[c]} onChange={e=>setDraft(d=>({...d,[c]:e.target.value}))} />
                : <input value={draft[c]} onChange={e=>setDraft(d=>({...d,[c]:e.target.value}))} />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   BORD — vue d'ensemble
   ============================================================ */
function Bord({ data, phase, onGo }){
  const B = data.Budget||[], V = data.Visites||[], S = data.Souhaits||[], E = data.Entretien||[], D = data.Depenses||[];
  const est = B.reduce((s,r)=>s+(Number(r.montantEstime)||0),0);
  const depense = D.reduce((s,r)=>s+(Number(r.montant)||0),0);
  const duReste = D.filter(d=>d.statut==='En attente').reduce((s,r)=>s+(Number(r.montant)||0),0);
  const todo = E.filter(e=>e.statut!=='Fait').length;
  const favoris = V.filter(v=>v.decision==='Favori');

  return (
    <>
      <div className="head">
        <div>
          <h2>Bord</h2>
          <div className="sub">{phase==='avant' ? "Recherche et décision d'achat" : 'Exploitation courante'}</div>
        </div>
      </div>

      <div className="readouts">
        {phase === 'avant' ? (
          <>
            <Readout label="Budget estimé" value={euros(est)} />
            <Readout label="Bateaux vus" value={V.length} tone="mute" />
            <Readout label="Retenus" value={favoris.length} />
            <Readout label="Souhaits ouverts" value={S.filter(s=>s.statut==='Ouvert').length} tone="mute" />
          </>
        ) : (
          <>
            <Readout label="Dépensé" value={euros(depense)} />
            <Readout label="À rembourser" value={euros(duReste)} tone={duReste>0?'alert':'mute'} />
            <Readout label="Entretiens en attente" value={todo} tone={todo>0?'alert':undefined} />
            <Readout label="Équipage" value={(data.Membres||[]).length} tone="mute" />
          </>
        )}
      </div>

      {phase === 'avant' && favoris.length > 0 && (
        <div className="card" style={{padding:'18px 20px'}}>
          <span className="eyebrow" style={{color:'var(--steel)',display:'block',marginBottom:12}}>Bateaux retenus</span>
          {favoris.map(v => (
            <div key={v.id} style={{display:'flex',justifyContent:'space-between',gap:14,padding:'9px 0',borderBottom:'1px solid #EDF2F4'}}>
              <div>
                <div style={{fontWeight:600}}>{v.nomBateau}</div>
                <div style={{fontSize:12.5,color:'var(--steel)'}}>{v.lieu || '—'} · vu le {jour(v.dateVisite)}</div>
              </div>
              <div className="data" style={{fontSize:14,whiteSpace:'nowrap'}}>{euros(v.prixDemande)}</div>
            </div>
          ))}
          <button className="btn-quiet" style={{marginTop:12,paddingLeft:0}} onClick={()=>onGo('visites')}>Voir toutes les visites</button>
        </div>
      )}

      {phase === 'apres' && todo > 0 && (
        <div className="card" style={{padding:'18px 20px'}}>
          <span className="eyebrow" style={{color:'var(--steel)',display:'block',marginBottom:12}}>Entretiens en attente</span>
          {E.filter(e=>e.statut!=='Fait').slice(0,5).map(e => (
            <div key={e.id} style={{display:'flex',justifyContent:'space-between',gap:14,padding:'9px 0',borderBottom:'1px solid #EDF2F4'}}>
              <div>
                <div style={{fontWeight:600}}>{e.tache}</div>
                <div style={{fontSize:12.5,color:'var(--steel)'}}>{e.responsable || 'Sans responsable'}</div>
              </div>
              <div className="data" style={{fontSize:13,whiteSpace:'nowrap',color:'var(--steel)'}}>{jour(e.prochaineEcheance)}</div>
            </div>
          ))}
          <button className="btn-quiet" style={{marginTop:12,paddingLeft:0}} onClick={()=>onGo('entretien')}>Voir l'entretien</button>
        </div>
      )}
    </>
  );
}


/* ============================================================
   COFFRE — toutes les pièces jointes du projet
   ============================================================ */
function Coffre({ fichiers, membre, onUpload, onDelete }){
  const [filtre, setFiltre] = useState('Toutes');
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState('');
  const [cat, setCat] = useState('Divers');

  const liste = filtre === 'Toutes' ? fichiers : fichiers.filter(f => f.categorie === filtre);
  const parCat = {};
  fichiers.forEach(f => { parCat[f.categorie] = (parCat[f.categorie]||0) + 1; });

  async function choisir(e){
    const fs = Array.from(e.target.files||[]); e.target.value='';
    if (!fs.length) return;
    setErreur(''); setBusy(true);
    try {
      for (const f of fs){
        if (f.size > MAX_MO*1048576) throw new Error(f.name + ' dépasse ' + MAX_MO + ' Mo.');
        const data = await lireBase64(f);
        await onUpload({ module:'Documents', ligneId:'', categorie:cat, nom:f.name, mime:f.type, data, ajoutePar:membre });
      }
    } catch(err){ setErreur(err.message); }
    setBusy(false);
  }

  return (
    <>
      <div className="head">
        <div>
          <h2>Documents</h2>
          <div className="sub">{fichiers.length} fichier{fichiers.length>1?'s':''} dans le dossier Drive du projet</div>
        </div>
        <label className={'btn' + (busy ? ' busy' : '')}>
          {busy ? 'Envoi en cours…' : 'Déposer des fichiers'}
          <input type="file" multiple hidden disabled={busy} onChange={choisir} />
        </label>
      </div>

      <div className="card" style={{padding:'14px 16px',marginBottom:16}}>
        <div className="field" style={{margin:0,maxWidth:260}}>
          <label>Ranger les nouveaux dépôts dans</label>
          <select value={cat} onChange={e=>setCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {erreur && <p className="err">{erreur}</p>}
      </div>

      <div className="chips">
        <button className={'chip' + (filtre==='Toutes'?' on':'')} onClick={()=>setFiltre('Toutes')}>
          Toutes <span>{fichiers.length}</span>
        </button>
        {CATEGORIES.filter(c=>parCat[c]).map(c => (
          <button key={c} className={'chip' + (filtre===c?' on':'')} onClick={()=>setFiltre(c)}>
            {c} <span>{parCat[c]}</span>
          </button>
        ))}
      </div>

      <div className="card">
        {liste.length === 0 ? (
          <div className="empty">
            <div className="rule" />
            <p>Factures, contrats, devis, photos. Tout ce que vous déposez ici part dans le dossier Drive du projet, rangé par catégorie.</p>
          </div>
        ) : liste.map(f => (
          <div className="filerow bordered" key={f.id}>
            <div className="filemeta">
              <a href={f.url} target="_blank" rel="noreferrer">{f.nom}</a>
              <span>{f.categorie} · {poids(f.taille)} · {jour(f.dateAjout)}
                {f.ajoutePar ? ' · ' + f.ajoutePar : ''}
                {f.module && f.ligneId ? ' · rattaché à ' + f.module : ''}</span>
            </div>
            <button className="iconbtn" onClick={()=>{ if(confirm('Supprimer « '+f.nom+' » ?')) onDelete(f.id); }}>✕</button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   CADRE LÉGAL — pacte de copropriété
   ============================================================ */
function Pacte({ articles, signatures, versions, membres, membre, version, fichiers,
                 onAdd, onUpdate, onDelete, onModele, onSigner, onDesigner, onGeler, onUpload, onDeleteFile }){
  const [edite, setEdite] = useState(null);
  const [brouillon, setBrouillon] = useState({titre:'', contenu:''});
  const [nomSig, setNomSig] = useState('');
  const [busy, setBusy] = useState(false);
  const [pieces, setPieces] = useState(false);

  const tries = [...articles].sort((a,b)=>(Number(a.ordre)||0)-(Number(b.ordre)||0));
  const sigVersion = signatures.filter(s => String(s.version) === String(version));
  const aSigne = sigVersion.find(s => s.membre === membre);
  const manquants = membres.filter(m => !sigVersion.some(s => s.membre === m.nom));
  const complet = membres.length > 0 && manquants.length === 0;
  const piecesPacte = fichiers.filter(f => f.module === 'Pacte');

  function ouvrir(a){ setEdite(a.id); setBrouillon({titre:a.titre, contenu:a.contenu}); }

  function enregistrer(a){
    onUpdate('Pacte', a.id, brouillon).then(()=>setEdite(null));
  }

  function ajouter(){
    const ordre = tries.length ? Math.max(...tries.map(a=>Number(a.ordre)||0)) + 1 : 1;
    onAdd('Pacte', {ordre, titre:'Nouvel article', contenu:''});
  }

  function deplacer(a, sens){
    const i = tries.findIndex(x=>x.id===a.id);
    const j = i + sens;
    if (j < 0 || j >= tries.length) return;
    const b = tries[j];
    onUpdate('Pacte', a.id, {ordre:b.ordre});
    onUpdate('Pacte', b.id, {ordre:a.ordre});
  }

  function geler(){
    if (!confirm('Figer la version ' + version + ' ?\n\nUn PDF horodaté sera déposé dans le dossier Drive, avec les signatures enregistrées. Le travail reprendra ensuite sur une nouvelle version.')) return;
    setBusy(true);
    onGeler().finally(()=>setBusy(false));
  }

  return (
    <>
      <div className="head">
        <div>
          <h2>Cadre légal</h2>
          <div className="sub">Convention d'indivision · version {version} en cours de rédaction</div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button className="btn-quiet" onClick={()=>setPieces(true)}>
            Pièces{piecesPacte.length ? ' (' + piecesPacte.length + ')' : ''}
          </button>
          <button className="btn" onClick={ajouter}>Ajouter un article</button>
        </div>
      </div>

      <div className="avis">
        <strong>Ce texte est une base de travail, pas un acte validé.</strong> Il reprend la structure
        habituelle d'une convention d'indivision (articles 1873-1 et suivants du Code civil), mais chaque
        situation a ses particularités : montage retenu, financement, francisation du navire, fiscalité.
        Faites relire la version finale par un notaire ou un avocat avant de l'exécuter.
      </div>

      {tries.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="rule" />
            <p>Partez de la trame type : dix-huit articles couvrant les quotes-parts, les charges, l'usage du bateau, la revente et la sortie d'un associé. Vous les retravaillerez ensemble ensuite.</p>
            <button className="btn btn-accent" onClick={()=>onModele(false)}>Charger la trame</button>
          </div>
        </div>
      ) : (
        <div className="card pacte">
          {tries.map((a, i) => (
            <article className="art" key={a.id}>
              {edite === a.id ? (
                <>
                  <div className="field">
                    <label>Titre de l'article {i+1}</label>
                    <input value={brouillon.titre} onChange={e=>setBrouillon(b=>({...b,titre:e.target.value}))} />
                  </div>
                  <div className="field">
                    <label>Contenu</label>
                    <textarea style={{minHeight:190}} value={brouillon.contenu}
                      onChange={e=>setBrouillon(b=>({...b,contenu:e.target.value}))} />
                  </div>
                  <div className="art-actions">
                    <button className="btn-quiet" onClick={()=>setEdite(null)}>Annuler</button>
                    <button className="btn btn-accent" onClick={()=>enregistrer(a)}>Enregistrer</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="art-head">
                    <h3><span className="art-n">Article {i+1}</span>{a.titre}</h3>
                    <div className="art-tools">
                      <button className="iconbtn" title="Monter" onClick={()=>deplacer(a,-1)}>↑</button>
                      <button className="iconbtn" title="Descendre" onClick={()=>deplacer(a,1)}>↓</button>
                      <button className="iconbtn" onClick={()=>ouvrir(a)}>Modifier</button>
                      <button className="iconbtn" onClick={()=>{ if(confirm('Supprimer cet article ?')) onDelete('Pacte', a.id); }}>✕</button>
                    </div>
                  </div>
                  <p className="art-body">{a.contenu || <em className="muted">Article vide.</em>}</p>
                </>
              )}
            </article>
          ))}
        </div>
      )}

      {tries.length > 0 && (
        <div className="card sign">
          <span className="eyebrow">Signatures — version {version}</span>

          {membres.length === 0 && <p className="muted">Ajoutez d'abord les membres dans l'onglet Équipage.</p>}

          {membres.map(m => {
            const s = sigVersion.find(x => x.membre === m.nom);
            return (
              <div className="signrow" key={m.id}>
                <div>
                  <strong>{m.nom}</strong>
                  <span className="muted">{s ? s.nomSignature + ' · ' + s.dateSignature : 'En attente'}</span>
                </div>
                {s
                  ? <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span className="pill pill-go">Signé</span>
                      {s.membre === membre && (
                        <button className="iconbtn" title="Retirer ma signature" onClick={()=>onDesigner(s.id)}>✕</button>
                      )}
                    </div>
                  : <span className="pill pill-wait">En attente</span>}
              </div>
            );
          })}

          {membre && !aSigne && (
            <div className="signbox">
              <div className="field" style={{marginBottom:10}}>
                <label>Portez votre nom complet pour valider</label>
                <input value={nomSig} onChange={e=>setNomSig(e.target.value)} placeholder="Prénom NOM" />
              </div>
              <button className="btn btn-accent" onClick={()=>{ onSigner(nomSig).then(()=>setNomSig('')); }}>
                Je signe la version {version}
              </button>
              <p className="muted" style={{margin:'10px 0 0'}}>
                Cette acceptation est enregistrée avec la date et l'heure. Elle vaut accord entre vous,
                mais ne remplace pas une signature manuscrite ou électronique qualifiée.
              </p>
            </div>
          )}

          {!membre && <p className="muted">Sélectionnez votre nom en haut de l'écran pour pouvoir signer.</p>}

          <div className="freeze">
            <div>
              <strong>{complet ? 'Tout le monde a signé.' : manquants.length + ' signature' + (manquants.length>1?'s':'') + ' manquante' + (manquants.length>1?'s':'')}</strong>
              <span className="muted">Figer génère un PDF horodaté dans le dossier Drive et ouvre une nouvelle version.</span>
            </div>
            <button className="btn" disabled={busy} onClick={geler}>
              {busy ? 'Génération…' : 'Figer et archiver'}
            </button>
          </div>
        </div>
      )}

      {versions.length > 0 && (
        <div className="card" style={{padding:'18px 20px',marginTop:16}}>
          <span className="eyebrow" style={{color:'var(--steel)',display:'block',marginBottom:12}}>Versions archivées</span>
          {[...versions].reverse().map(v => (
            <div className="filerow" key={v.id}>
              <div className="filemeta">
                <a href={v.url} target="_blank" rel="noreferrer">Version {v.version} — PDF</a>
                <span>Figée le {v.dateGel}{v.geleePar ? ' par ' + v.geleePar : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {pieces && (
        <Pieces titre="Cadre légal" module="Pacte" ligneId="" categorie="Cadre légal" membre={membre}
          fichiers={piecesPacte} onClose={()=>setPieces(false)}
          onUpload={onUpload} onDelete={onDeleteFile} />
      )}
    </>
  );
}

/* ============================================================
   APPLICATION
   ============================================================ */
function App(){
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState('avant');
  const [nomBateau, setNomBateau] = useState('');
  const [active, setActive] = useState('bord');
  const [toast, setToast] = useState(null);
  const [membre, setMembre] = useState('');
  const [version, setVersion] = useState('1');
  const [panne, setPanne] = useState(null);
  const [essai, setEssai] = useState(0);
  const [voile, setVoile] = useState(true);

  const say = useCallback((msg, bad) => {
    setToast({msg, bad});
    setTimeout(()=>setToast(null), 2500);
  }, []);

  useEffect(() => {
    let vivant = true;
    setPanne(null);
    server('getAllData').then(d => {
      if (!vivant) return;
      const cfg = d.Config || [];
      const p = cfg.find(c=>c.cle==='phase');
      const n = cfg.find(c=>c.cle==='nomBateau') || cfg.find(c=>c.cle==='nomProjet');
      const ver = cfg.find(c=>c.cle==='pacteVersion');
      if (p) setPhase(p.valeur);
      if (n) setNomBateau(n.valeur || '');
      if (ver) setVersion(String(ver.valeur || '1'));
      setData(d);
    }).catch(e => { if (vivant) setPanne(e.message); });
    return () => { vivant = false; };
  }, [essai]);

  function changePhase(p){
    if (p === phase) return;
    setPhase(p); setActive('bord');
    server('setConfig','phase',p).catch(e=>say(e.message,true));
  }
  function rename(v){
    setNomBateau(v);
    server('setConfig','nomBateau',v).catch(e=>say(e.message,true));
  }
  function add(sheet, item){
    return server('addRow', sheet, item).then(row => {
      setData(d => ({...d, [sheet]: [...(d[sheet]||[]), row]}));
      say('Ligne ajoutée'); return row;
    }).catch(e => { say(e.message,true); throw e; });
  }
  function update(sheet, id, up){
    return server('updateRow', sheet, id, up).then(row => {
      setData(d => ({...d, [sheet]: (d[sheet]||[]).map(r => r.id===id ? row : r)}));
      say('Modifications enregistrées'); return row;
    }).catch(e => { say(e.message,true); throw e; });
  }
  function remove(sheet, id){
    server('deleteRow', sheet, id).then(() => {
      setData(d => ({...d, [sheet]: (d[sheet]||[]).filter(r=>r.id!==id)}));
      say('Ligne supprimée');
    }).catch(e => say(e.message,true));
  }

  function upload(payload){
    return server('uploadFichier', payload).then(row => {
      setData(d => ({...d, Fichiers:[...(d.Fichiers||[]), row]}));
      say('Fichier déposé'); return row;
    }).catch(e => { say(e.message, true); throw e; });
  }
  function supprimerFichier(id){
    return server('supprimerFichier', id).then(() => {
      setData(d => ({...d, Fichiers:(d.Fichiers||[]).filter(f=>f.id!==id)}));
      say('Fichier supprimé');
    }).catch(e => say(e.message, true));
  }
  function chargerModele(forcer){
    return server('chargerModelePacte', !!forcer).then(rows => {
      setData(d => ({...d, Pacte: rows}));
      say('Trame chargée');
    }).catch(e => say(e.message, true));
  }
  function signer(nom){
    return server('signerPacte', membre, nom, '').then(row => {
      setData(d => ({...d, Signatures:[...(d.Signatures||[]), row]}));
      say('Signature enregistrée');
    }).catch(e => { say(e.message, true); throw e; });
  }
  function designer(id){
    return server('retirerSignature', id).then(() => {
      setData(d => ({...d, Signatures:(d.Signatures||[]).filter(x=>x.id!==id)}));
      say('Signature retirée');
    }).catch(e => say(e.message, true));
  }
  function geler(){
    return server('gelerPacte', membre).then(row => {
      setData(d => ({...d, Versions:[...(d.Versions||[]), row]}));
      setVersion(v => String(Number(v)+1));
      say('Version archivée dans Drive');
    }).catch(e => say(e.message, true));
  }

  const rideau = voile ? (
    <Chargement pret={!!data && !panne} erreur={panne} nom={nomBateau}
      onFini={()=>setVoile(false)}
      onRetry={()=>{ setPanne(null); setEssai(n=>n+1); }} />
  ) : null;

  // Tant que rien n'est chargé, seul le voile est à l'écran.
  if (!data) return rideau;

  const membres = data.Membres || [];
  const mod = MODULES.find(m => m.key === active) || MODULES[0];
  const counts = {};
  MODULES.forEach(m => { if (m.sheet) counts[m.sheet] = (data[m.sheet]||[]).length; });

  const info = {};
  (data.BateauInfo||[]).forEach(r => { info[r.champ] = r.valeur; });

  const stats = {
    membres: membres.length,
    visites: (data.Visites||[]).length,
    budget: (data.Budget||[]).reduce((s,r)=>s+(Number(r.montantEstime)||0),0),
    apports: (data.Copropriete||[]).filter(r=>r.type!=='Remboursement').reduce((s,r)=>s+(Number(r.montant)||0),0),
  };

  return (
    <>
      {rideau}
      <Hero phase={phase} onPhase={changePhase} nomBateau={nomBateau} onRename={rename} info={info} stats={stats}
        membres={membres} membre={membre} onMembre={setMembre} />
      <Tabs phase={phase} active={active} onSelect={setActive} counts={counts} />
      {!hasGAS && !hasURL && (
        <div className="banner"><div className="banner-in">
          <strong>Aperçu</strong> — données d'exemple, rien n'est enregistré. Une fois relié au Google Sheet, tout est partagé et sauvegardé.
        </div></div>
      )}
      <main>
        {mod.key === 'bord' && <Bord data={data} phase={phase} onGo={setActive} />}
        {mod.key === 'identite' && <Identite rows={data.BateauInfo||[]} onAdd={add} onUpdate={update} />}
        {mod.key === 'documents' && (
          <Coffre fichiers={data.Fichiers||[]} membre={membre}
            onUpload={upload} onDelete={supprimerFichier} />
        )}
        {mod.key === 'pacte' && (
          <Pacte articles={data.Pacte||[]} signatures={data.Signatures||[]} versions={data.Versions||[]}
            membres={membres} membre={membre} version={version} fichiers={data.Fichiers||[]}
            onAdd={add} onUpdate={update} onDelete={remove} onModele={chargerModele}
            onSigner={signer} onDesigner={designer} onGeler={geler}
            onUpload={upload} onDeleteFile={supprimerFichier} />
        )}
        {mod.sheet && !mod.special && (
          <ModuleView mod={mod} rows={data[mod.sheet]||[]} membres={membres}
            fichiers={data.Fichiers||[]} membre={membre}
            onAdd={add} onUpdate={update} onDelete={remove}
            onUpload={upload} onDeleteFile={supprimerFichier} />
        )}
      </main>
      {toast && <div className={'toast' + (toast.bad ? ' bad' : '')}>{toast.msg}</div>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
