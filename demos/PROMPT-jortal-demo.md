# 🎯 Prompt — Démo "Jortal" (plateforme emploi · matching IA CV/offres)

Colle ceci dans la session Claude du repo **Jortal**.

---

```
Tu travailles sur "Jortal", une plateforme d'emploi avec matching intelligent entre CV et
offres via analyse sémantique (NLP). Je veux une DÉMO web autonome de cette app pour mon
portfolio.

ÉTAPE 1 — Lis le projet pour comprendre l'app réelle : le parcours candidat/recruteur, la
logique de matching CV↔offre, le scoring sémantique et la visualisation des tendances.
La démo doit refléter l'app, en simulant ce qui nécessite un backend.

ÉTAPE 2 — Produis UN SEUL fichier `demo.html`, livré en entier, prêt à enregistrer.

CE QUE LA DÉMO DOIT MONTRER (façon job board moderne) :
- Barre du haut : logo "Jortal", barre de recherche (factice), avatar profil.
- Écran 1 — Offres : liste de 5-6 offres, chacune avec un BADGE de match (ex. "92% de
  correspondance"), titre, entreprise, lieu, type de contrat, tags de compétences.
  Filtres latéraux (secteur, localisation, type de contrat).
- Écran 2 — Détail offre (au clic) : description, ET une "analyse de correspondance" qui
  explique le score : compétences correspondantes (vertes), compétences manquantes (grises),
  barre de score sémantique. Bouton "Postuler" (factice).
- Écran 3 — Mon profil / CV : résumé du candidat (compétences, expériences) servant de base
  au matching.
- Écran 4 — Tendances : mini tableau de bord avec un graphique (barres en divs) des
  compétences les plus demandées + quelques stats.
- Navigation entre écrans via une barre d'onglets ou un menu.

CONTENU (données factices, 100% local) :
- 5-6 offres réalistes avec scores de match calculés à l'avance, un profil candidat,
  et des compétences correspondantes/manquantes par offre.
- Aucun backend, aucune vraie API, aucun appel réseau (à part les CDN).

CONTRAINTES TECHNIQUES OBLIGATOIRES (pour l'intégration portfolio) :
1. Auto-suffisant : fonctionne juste en ouvrant le fichier. Aucun build, serveur, backend,
   fetch/API, variable d'env, ni localStorage.
2. EXACTEMENT ces 4 scripts CDN dans le <head> :
   <script src="https://cdn.tailwindcss.com"></script>
   <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
   <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
   <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
3. Compilation JSX en RUNTIME CLASSIQUE (sinon erreur "Cannot use import statement outside
   a module"). N'utilise PAS <script type="text/babel">. Utilise EXACTEMENT ce squelette :

   <div id="root"></div>
   <script type="text/jsx-source" id="appSrc">
     const { useState } = React;
     /* ... tout le code React (offres, matching, profil, tendances) ... */
     ReactDOM.createRoot(document.getElementById("root")).render(<App />);
   </script>
   <script>
     (function () {
       var run = function () {
         var src = document.getElementById("appSrc").textContent;
         var out = Babel.transform(src, { presets: [["react", { runtime: "classic" }]] }).code;
         (0, eval)(out);
       };
       if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
       else run();
     })();
   </script>
4. Mets `html, body, #root { height: 100%; margin: 0; }`. Conçois pour une largeur d'écran
   d'environ 1280px. Icônes en SVG inline. Commente en français.

À la fin, donne-moi UNIQUEMENT le contenu complet du fichier `demo.html`.
```

---
## Après réception
1. Enregistre le fichier sous `demos/jortal.html`.
2. Dans `js/projects.js`, sur le projet Jortal, remplace `preview: { type: "lightning" }` par :
```js
preview: {
  type: "app", url: "demos/jortal.html", fakeUrl: "jortal.ma",
  baseWidth: 1280, baseHeight: 860,
  boot: ["$ php artisan serve", "▲ Jortal — matching emploi", "✓ moteur sémantique prêt", "→ http://127.0.0.1:8000"],
}
```
