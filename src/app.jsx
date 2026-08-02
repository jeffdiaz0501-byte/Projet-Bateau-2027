const { useState, useEffect, useCallback } = React;

/* ============================================================
   CONFIGURATION DES MODULES
   phase : 'avant' | 'apres' | 'always'
   ============================================================ */
const MODULES = [
  { key:'bord', sheet:null, label:'Bord', phase:'always' },

  { key:'souhaits', sheet:'Souhaits', label:'Souhaits', phase:'avant',
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

  { key:'budget', sheet:'Budget', label:'Budget', phase:'avant',
    empty:"Chiffrez le projet complet : prix d'achat, place au port, assurance, entretien. L'écart entre estimé et réel se calcule tout seul.",
    fields:[
      {key:'categorie', label:'Catégorie', type:'select', options:['Achat','Taxes & immatriculation','Assurance','Entretien annuel','Place au port','Équipement','Convoyage','Autre']},
      {key:'libelle', label:'Libellé', type:'text', required:true},
      {key:'montantEstime', label:'Montant estimé (€)', type:'number'},
      {key:'montantReel', label:'Montant réel (€)', type:'number'},
      {key:'notes', label:'Notes', type:'textarea'},
    ],
    columns:['categorie','libelle','montantEstime','montantReel'], hideFrom:3 },

  { key:'visites', sheet:'Visites', label:'Visites', phase:'avant',
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

  { key:'parts', sheet:'Copropriete', label:'Parts', phase:'always',
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

  { key:'entretien', sheet:'Entretien', label:'Entretien', phase:'apres',
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

  { key:'manutention', sheet:'Manutention', label:'Manutention', phase:'apres',
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

  { key:'planning', sheet:'Planning', label:'Planning', phase:'apres',
    empty:"Qui prend le bateau, et quand. Réservez vos créneaux pour éviter les doublons.",
    fields:[
      {key:'dateDebut', label:'Début', type:'date', required:true},
      {key:'dateFin', label:'Fin', type:'date'},
      {key:'typeUsage', label:"Type d'usage", type:'select', options:['Navigation','Entretien','Réservation','Autre']},
      {key:'membres', label:'Membres concernés', type:'text'},
      {key:'notes', label:'Notes', type:'textarea'},
    ],
    columns:['dateDebut','dateFin','typeUsage','membres'], hideFrom:2 },

  { key:'depenses', sheet:'Depenses', label:'Dépenses', phase:'apres',
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

  { key:'documents', sheet:'Documents', label:'Documents', phase:'always',
    empty:"Assurance, factures, acte de vente, manuels. Déposez les fichiers sur Drive et collez le lien ici.",
    fields:[
      {key:'nom', label:'Nom', type:'text', required:true},
      {key:'type', label:'Type', type:'select', options:['Assurance','Facture','Manuel','Certificat','Photo','Autre']},
      {key:'url', label:'Lien', type:'url'},
    ],
    columns:['nom','type','url'], hideFrom:1 },

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
   BANDEAU — plaque de nom
   ============================================================ */
function Hero({ phase, onPhase, nomBateau, onRename, info, stats }){
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
function ModuleView({ mod, rows, membres, onAdd, onUpdate, onDelete }){
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
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
   APPLICATION
   ============================================================ */
function App(){
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState('avant');
  const [nomBateau, setNomBateau] = useState('');
  const [active, setActive] = useState('bord');
  const [toast, setToast] = useState(null);

  const say = useCallback((msg, bad) => {
    setToast({msg, bad});
    setTimeout(()=>setToast(null), 2500);
  }, []);

  useEffect(() => {
    server('getAllData').then(d => {
      setData(d);
      const cfg = d.Config || [];
      const p = cfg.find(c=>c.cle==='phase');
      const n = cfg.find(c=>c.cle==='nomBateau') || cfg.find(c=>c.cle==='nomProjet');
      if (p) setPhase(p.valeur);
      if (n) setNomBateau(n.valeur || '');
    }).catch(e => say(e.message, true));
  }, [say]);

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

  if (!data) return <div className="boot">Chargement</div>;

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
      <Hero phase={phase} onPhase={changePhase} nomBateau={nomBateau} onRename={rename} info={info} stats={stats} />
      <Tabs phase={phase} active={active} onSelect={setActive} counts={counts} />
      {!hasGAS && !hasURL && (
        <div className="banner"><div className="banner-in">
          <strong>Aperçu</strong> — données d'exemple, rien n'est enregistré. Une fois relié au Google Sheet, tout est partagé et sauvegardé.
        </div></div>
      )}
      <main>
        {mod.key === 'bord' && <Bord data={data} phase={phase} onGo={setActive} />}
        {mod.key === 'identite' && <Identite rows={data.BateauInfo||[]} onAdd={add} onUpdate={update} />}
        {mod.sheet && mod.key !== 'identite' && (
          <ModuleView mod={mod} rows={data[mod.sheet]||[]} membres={membres}
            onAdd={add} onUpdate={update} onDelete={remove} />
        )}
      </main>
      {toast && <div className={'toast' + (toast.bad ? ' bad' : '')}>{toast.msg}</div>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
