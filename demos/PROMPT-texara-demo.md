# 🎯 Prompt — Démo "Texara" (IDE LaTeX offline-first)

Colle ceci dans la session Claude du repo **Texara**.

---

```
Tu travailles sur "Texara", un IDE LaTeX offline-first (éditeur LaTeX dans le navigateur
qui compile hors-ligne sur un vrai moteur TeX Live, façon Overleaf). Je veux une DÉMO web
autonome de cette app pour mon portfolio.

ÉTAPE 1 — Lis le projet pour comprendre l'app réelle : la mise en page de l'éditeur, les
fonctionnalités clés (compilation, aperçu, collaboration, export, Git) et le style visuel.
La démo doit refléter l'app, en simulant ce qui nécessite un backend.

ÉTAPE 2 — Produis UN SEUL fichier `demo.html`, livré en entier, prêt à enregistrer.

CE QUE LA DÉMO DOIT MONTRER (façon Overleaf / VS Code) :
- Layout en 3 zones : (a) fine barre latérale = arborescence de fichiers (main.tex,
  sections/, refs.bib, figures/) ; (b) éditeur de code LaTeX au centre (thème sombre,
  police monospace, coloration syntaxique des commandes \\section, $...$, environnements) ;
  (c) panneau d'aperçu à droite = le document RENDU sur une "feuille" blanche.
- Barre d'outils en haut : nom du fichier, bouton "Compiler" (avec un faux spinner ~0.4s
  puis mise à jour de l'aperçu), menu "Exporter" (PDF / Word / HTML / Markdown — factice),
  bouton "Partager" affichant 2-3 avatars de collaborateurs (collaboration temps réel simulée).
- Barre d'état en bas : "Compilé en 0.4s · TeX Live · 50+ packages".
- Effet collaboratif : un curseur coloré nommé (ex. "Sara") visible dans l'éditeur.
- Quand on édite le code (debounce) OU qu'on clique "Compiler", l'aperçu se met à jour.
- Pour un rendu authentique des équations dans l'aperçu, tu PEUX ajouter KaTeX en CDN
  (en plus des 4 scripts obligatoires) et rendre les formules avec.

CONTENU (données factices, 100% local) :
- Un document LaTeX d'exemple crédible (titre, 2 sections, une équation, une liste, une
  référence) et son rendu correspondant côté aperçu.
- Aucune vraie compilation, aucun backend, aucun appel réseau (à part les CDN).

CONTRAINTES TECHNIQUES OBLIGATOIRES (pour l'intégration portfolio) :
1. Auto-suffisant : fonctionne juste en ouvrant le fichier. Aucun build, serveur, backend,
   fetch/API, variable d'env, ni localStorage.
2. EXACTEMENT ces 4 scripts CDN dans le <head> (KaTeX en plus est autorisé) :
   <script src="https://cdn.tailwindcss.com"></script>
   <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
   <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
   <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
3. Compilation JSX en RUNTIME CLASSIQUE (sinon erreur "Cannot use import statement outside
   a module"). N'utilise PAS <script type="text/babel">. Utilise EXACTEMENT ce squelette :

   <div id="root"></div>
   <script type="text/jsx-source" id="appSrc">
     const { useState, useEffect, useRef } = React;
     /* ... tout le code React (éditeur, aperçu, données factices) ... */
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
   d'environ 1500px (IDE dense). Icônes en SVG inline. Commente en français.

À la fin, donne-moi UNIQUEMENT le contenu complet du fichier `demo.html`.
```

---
## Après réception
1. Enregistre le fichier sous `demos/texara.html`.
2. Dans `js/projects.js`, sur le projet Texara, remplace `preview: { type: "lightning" }` par :
```js
preview: {
  type: "app", url: "demos/texara.html", fakeUrl: "texara.app",
  baseWidth: 1600, baseHeight: 920,
  boot: ["$ npm run dev", "▲ Texara — IDE LaTeX", "✓ moteur TeX Live prêt", "→ http://localhost:5173"],
}
```
