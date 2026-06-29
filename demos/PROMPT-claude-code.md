# 🎯 Prompt à coller dans Claude Code (sur le repo de ton vrai projet)

Ouvre **Claude Code dans le dossier de ton vrai projet** (celui que tu veux montrer),
puis colle le prompt ci-dessous. Claude Code va lire ton app et générer **un seul
fichier `demo.html` auto-suffisant** : une mini-version jouable, avec de fausses
données, sans backend — exactement ce qu'attend le portfolio.

> Remplace simplement `NOM_DU_PROJET` par le nom de ton app.

---

## ⬇️ LE PROMPT (copie tout le bloc)

```
Tu vas créer une DÉMO interactive auto-suffisante de cette application, destinée à être
intégrée (via une <iframe>) dans mon portfolio. Lis d'abord le projet pour comprendre :
les 3–4 écrans principaux, le design (couleurs, mise en page) et la forme des données.

Ensuite, produis UN SEUL fichier `demo.html`, livré en entier, prêt à enregistrer.

CONTRAINTES STRICTES (à respecter exactement) :

1. AUTO-SUFFISANT : le fichier doit fonctionner juste en l'ouvrant dans un navigateur.
   Aucune installation, aucun build, aucun serveur, aucun backend, aucun appel réseau
   (pas de fetch/axios/API), aucune variable d'environnement, aucun localStorage.

2. TECHNO via CDN uniquement, avec EXACTEMENT ces 4 scripts dans le <head> :
   <script src="https://cdn.tailwindcss.com"></script>
   <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
   <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
   <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

3. COMPILATION JSX EN RUNTIME CLASSIQUE (très important, sinon erreur "Cannot use import
   statement outside a module"). N'utilise PAS <script type="text/babel">. Utilise EXACTEMENT
   ce squelette : le JSX est stocké dans un <script type="text/jsx-source" id="appSrc">,
   puis compilé manuellement en runtime classique et exécuté :

   <div id="root"></div>
   <script type="text/jsx-source" id="appSrc">
     const { useState } = React;
     /* ... tout le code React ici (composants + données factices) ... */
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

4. DONNÉES FACTICES : des petits tableaux mock réalistes mais évidemment de démo
   (3 à 6 éléments par liste). Pas de vraies données, pas de vrais utilisateurs.

5. SANS ÉTAT PERSISTANT : toute la navigation se fait avec React useState. Tout se
   réinitialise au rechargement. Aucune sauvegarde.

6. NAVIGABLE : reproduis 3–4 écrans CLÉS de l'app avec une navigation entre eux
   (sidebar ou onglets), et au moins une interaction liste → détail (cliquer un
   élément ouvre sa page de détail, avec un bouton retour).

7. VISUEL : reprends les couleurs et la mise en page de la vraie app, mais en simplifié
   et soigné. Fond sombre (#0b0d16) sauf si l'app a une autre identité. Le rendu doit
   bien s'afficher dans une zone d'environ 1000px de large et 460px de haut.
   Mets `html, body, #root { height: 100%; margin: 0; }`.

8. Tout en ligne dans le fichier (styles, données, composants). Aucune ressource externe
   à part les 4 scripts CDN ci-dessus. Commente les sections importantes en français.

À la fin, donne-moi UNIQUEMENT le contenu complet du fichier `demo.html`.
Projet : NOM_DU_PROJET.
```

---

## 📦 Une fois que Claude Code te donne le fichier

1. Enregistre-le dans le portfolio sous : `demos/NOM_DU_PROJET.html`
   (ex : `demos/novatask.html`).

2. Ajoute / modifie le projet dans `js/projects.js` :

```js
{
  title: "Nom du projet",
  tag: "Web App",
  short: "Une phrase courte. Démo jouable ⚡",
  desc: "Description longue affichée dans la fenêtre.",
  tech: ["React", "Tailwind", "..."],
  links: [{ label: "Code", url: "https://github.com/toi/projet" }],
  preview: {
    type: "app",                       // <-- active le terminal + l'écran navigable
    url: "demos/NOM_DU_PROJET.html",   // <-- ton fichier démo
    fakeUrl: "monprojet.app",          // <-- texte de la barre d'adresse (déco)
    boot: [                            // <-- lignes du terminal "run dev"
      "$ npm run dev",
      "▲ Vite — démarrage…",
      "✓ compilé avec succès",
      "→ http://localhost:3000",
    ],
  },
  accent: "#4cc9f0",                   // <-- couleur des éclairs pour ce projet
}
```

3. C'est tout. Au clic sur la carte : terminal « run dev » → puis ta démo apparaît
   dans un cadre navigateur, et on peut naviguer dedans. ⚡

> 💡 `demos/demo-sample.html` (le projet « NovaTask » d'exemple) est un modèle complet
> et fonctionnel : ouvre-le pour voir exactement la structure attendue.
