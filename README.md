# Projet-Bateau-2027
# Projet Bateau — mise en route

Architecture volontairement identique au principe de HP Manager : Google Sheets = source de vérité, Apps Script = backend, une seule page web pour tout le monde. Ici, tout est servi directement par Apps Script (`doGet`), donc **pas besoin de GitHub Pages** — un seul lien à partager à tes collègues.

## 1. Créer le Google Sheet

1. Va sur [sheets.google.com](https://sheets.google.com) → nouveau classeur vide.
2. Renomme-le par exemple **"Projet Bateau — Données"**.
3. Menu **Extensions → Apps Script**.

## 2. Coller le code

1. Dans l'éditeur Apps Script, supprime le contenu de `Code.gs` et colle le contenu du fichier `Code.gs` fourni.
2. Ajoute un fichier HTML : icône **+** → **HTML** → nomme-le exactement `Index` (respecte la majuscule, sans extension). Colle le contenu de `Index.html`.
3. Enregistre (Ctrl/Cmd+S).

## 3. Initialiser les onglets

1. En haut de l'éditeur, choisis la fonction `initProject` dans le menu déroulant (à côté du bouton ▷ Exécuter).
2. Clique sur **Exécuter**. Google demandera d'autoriser le script (première fois) — accepte (compte perso, script que tu contrôles).
3. Retourne sur le Google Sheet : les onglets `Config`, `Membres`, `Souhaits`, `Budget`, `Visites`, `Copropriete`, `BateauInfo`, `Entretien`, `Manutention`, `Planning`, `Depenses`, `Documents` doivent être créés avec leurs en-têtes.

## 4. Déployer en web app

1. Bouton **Déployer → Nouveau déploiement**.
2. Type : **Application web**.
3. Exécuter en tant que : **Moi**.
4. Qui a accès : **Tous les utilisateurs disposant d'un compte Google** (ou "Anyone" si tes collègues n'ont pas forcément de compte Google — à toi de voir selon la confidentialité voulue).
5. Déployer → copie l'URL fournie (se termine par `/exec`).
6. Partage cette URL avec tes collègues. C'est le lien unique de l'appli.

## 5. Ajouter les membres

Avant de commencer à remplir les modules, va dans l'onglet **Membres** de l'appli et ajoute les prénoms de chacun (toi + collègues). Ça alimente automatiquement les menus déroulants "Responsable", "Payé par", etc. dans toute l'appli.

## Comment ça marche

- **Bascule "Avant achat / Après achat"** (le petit toggle "ligne de flottaison" dans la barre latérale) : change les modules visibles pour tout le monde. C'est une donnée partagée (stockée dans l'onglet `Config`), donc si quelqu'un bascule, tout le monde voit le changement au rechargement.
- **Avant achat** : Souhaits, Budget prévisionnel, Visites réalisées.
- **Après achat** : Fiche bateau, Entretien, Manutention, Planning & usage, Dépenses réelles.
- **Toujours accessible** : Copropriété & parts (calcule automatiquement le % de chaque membre selon ses apports), Documents.
- **"Qui êtes-vous ?"** en bas de la barre latérale : purement local à ton navigateur (pas de vrai compte), juste pour te faire gagner du temps en pré-remplissant les formulaires plus tard si tu veux étendre le code.

## Aperçu sans rien installer

`Index.html` est **100 % autonome** : React, les polices (Archivo, Inter, JetBrains Mono, en base64) et le code compilé sont inlinés, il n'y a aucun appel réseau (pas de CDN, pas de Google Fonts). Ouvre-le directement depuis ton téléphone ou ton navigateur et il démarre en **mode démo** — données d'exemple en mémoire, bandeau orange dans la barre latérale, rien n'est enregistré.

Le même fichier détecte automatiquement `google.script.run` une fois collé dans Apps Script et bascule sur le vrai Google Sheet. Une seule version à maintenir.

## Modifier le code (workflow build)

Comme sur HP Manager, le JSX est pré-compilé localement — pas de Babel navigateur, donc pas de limite de 500 Ko ni de dépendance CDN.

```
boat-manager/
├── src/app.jsx      ← le code React (à éditer)
├── src/shell.html   ← le HTML + CSS (à éditer)
├── build.js         ← génère Index.html
└── Index.html       ← sortie, à coller dans Apps Script
```

```bash
npm install @babel/core @babel/preset-react react@18 react-dom@18 \
  @fontsource/archivo @fontsource/inter @fontsource/jetbrains-mono
node build.js
```

Puis recolle le contenu d'`Index.html` dans le fichier `Index` d'Apps Script et redéploie (**Déployer → Gérer les déploiements → ✎ → Nouvelle version**).

## Faire évoluer l'outil (comme sur HP Manager)

- Le schéma des colonnes est dans `SCHEMAS` en haut de `Code.gs`. **Règle d'or : toute nouvelle colonne s'ajoute en dernière position**, et il faut vérifier qu'elle existe bien physiquement dans le bon onglet avant de l'ajouter au tableau JS.
- Chaque module frontend est défini dans `MODULES` en haut du script d'`Index.html` — pour ajouter un champ à un module existant, il suffit d'ajouter une entrée dans `fields` (et éventuellement dans `columns` pour qu'il apparaisse dans le tableau).
- Pour ajouter un nouveau module complet : ajouter l'onglet dans `SCHEMAS` (Code.gs) + relancer `initProject` (ne touche pas les onglets déjà créés) + ajouter l'entrée correspondante dans `MODULES` (Index.html).

## Limites connues (v1)

- Pas de gestion de rôles/permissions — voulu, tout le monde a accès à tout.
- Pas de pièces jointes directes : les photos/documents se stockent en dehors (Drive) et on colle juste le lien dans le module Documents ou dans les champs "Lien de l'annonce" / "Photos".
- Le toggle de phase est global (partagé) — deux personnes qui basculent en même temps, le dernier gagne.
