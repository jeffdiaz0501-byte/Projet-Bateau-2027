/**
 * build.js — Projet Bateau
 * ------------------------------------------------------------
 * Même principe que le build.js de HP Manager :
 * - extrait le bloc <script type="text/babel"> de la source
 * - le compile en JS pur avec Babel CLI local (plus de Babel navigateur)
 * - inline React + ReactDOM (UMD) dans le fichier
 * - écrit Index.html, 100 % autonome, zéro dépendance réseau
 *
 * Usage :  node build.js
 * Source : src/app.jsx  +  src/shell.html
 * Sortie : Index.html
 * ------------------------------------------------------------
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');

function read(p) { return fs.readFileSync(p, 'utf8'); }

// 1. Compilation du JSX
const jsx = read(path.join(SRC, 'app.jsx'));
let compiled;
try {
  compiled = babel.transformSync(jsx, {
    presets: [require('@babel/preset-react')],
    compact: false,
  }).code;
} catch (e) {
  console.error('✗ Erreur de compilation JSX :\n' + e.message);
  process.exit(1);
}
console.log('✓ JSX compilé (' + Math.round(compiled.length / 1024) + ' Ko)');

// 2. Polices embarquées en base64 (les CDN ne sont pas accessibles partout)
const FONTS = [
  ['Archivo', 700, '@fontsource/archivo/files/archivo-latin-700-normal.woff2'],
  ['Archivo', 600, '@fontsource/archivo/files/archivo-latin-600-normal.woff2'],
  ['Inter', 400, '@fontsource/inter/files/inter-latin-400-normal.woff2'],
  ['Inter', 600, '@fontsource/inter/files/inter-latin-600-normal.woff2'],
  ['JetBrains Mono', 500, '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2'],
];
const fontCss = FONTS.map(([family, weight, rel]) => {
  const b64 = fs.readFileSync(path.join(ROOT, 'node_modules', rel)).toString('base64');
  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;`
       + `src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
}).join('\n');
console.log('✓ ' + FONTS.length + ' polices embarquées (' + Math.round(fontCss.length / 1024) + ' Ko)');

// 3. React UMD inliné
const react = read(path.join(ROOT, 'node_modules/react/umd/react.production.min.js'));
const reactDom = read(path.join(ROOT, 'node_modules/react-dom/umd/react-dom.production.min.js'));
console.log('✓ React + ReactDOM inlinés (' + Math.round((react.length + reactDom.length) / 1024) + ' Ko)');

// 3 bis. Images du plan, embarquées en base64 (masques en niveaux de gris)
const IMAGES = {
  '__PLAN_COMPLET__': 'src/assets/plan-complet.png',
  '__PLAN_COQUE__':   'src/assets/plan-coque.png',
};
var poidsImages = 0;
var dataUrls = {};
Object.keys(IMAGES).forEach(function (cle) {
  const b64 = fs.readFileSync(path.join(ROOT, IMAGES[cle])).toString('base64');
  dataUrls[cle] = 'data:image/png;base64,' + b64;
  poidsImages += b64.length;
});
console.log('✓ ' + Object.keys(IMAGES).length + ' images embarquées (' + Math.round(poidsImages / 1024) + ' Ko)');

// 4. Assemblage
const shell = read(path.join(SRC, 'shell.html'));
let out = shell
  .replace('/*__FONTS__*/', () => fontCss)
  .replace('/*__REACT__*/', () => react + '\n' + reactDom)
  .replace('/*__APP__*/', () => compiled);

Object.keys(dataUrls).forEach(function (cle) {
  out = out.split(cle).join(dataUrls[cle]);
});

const dest = path.join(ROOT, 'Index.html');
fs.writeFileSync(dest, out);
console.log('✓ Index.html écrit — ' + Math.round(out.length / 1024) + ' Ko, autonome');
