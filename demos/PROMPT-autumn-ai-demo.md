# 🎯 Prompt — Démo "Autumn AI" (upgrade design façon ChatGPT / Claude)

Colle ceci dans la session Claude qui gère le repo **Autumn AI** (app Java).

> Le but : NE PAS reproduire l'UI Java, mais créer une démo web au design premium,
> moderne et fluide (style ChatGPT / Claude), tout en montrant ce que fait vraiment l'app.

---

```
Tu travailles sur "Autumn AI", une application Java. Je veux une DÉMO web autonome de
cette app pour mon portfolio, avec un DESIGN FORTEMENT AMÉLIORÉ : ne reproduis PAS
l'interface Java (Swing/JavaFX). Crée à la place une interface moderne, pro, réactive et
très soignée, inspirée de ChatGPT et de Claude.

ÉTAPE 1 — Lis le projet pour comprendre ce que fait réellement Autumn AI : ses capacités,
son rôle, le type de conversations/tâches qu'elle gère, ses données. La démo doit refléter
ces vraies capacités, mais avec un habillage premium.

ÉTAPE 2 — Produis UN SEUL fichier `demo.html`, livré en entier, prêt à enregistrer.

DESIGN (style ChatGPT / Claude) :
- Layout : barre latérale gauche (bouton "Nouvelle conversation", liste d'historique de
  conversations factices, bloc profil/avatar en bas) + zone de chat centrale + barre de
  saisie en bas (textarea qui s'agrandit + bouton envoyer + raccourci Entrée).
- Messages : rangées alternées Utilisateur / Assistant avec avatars, beaucoup d'air,
  coins arrondis, typographie soignée (Inter), largeur de lecture centrée et confortable.
- Effet "génération" : à l'envoi d'un message, l'assistant TAPE sa réponse caractère par
  caractère (effet streaming) avec un curseur clignotant, puis s'arrête.
- Détails pro : barre du haut avec sélecteur de modèle/persona, bouton thème clair/sombre,
  rendu des blocs de code (police mono, fond sombre, bouton "Copier" factice), indicateur
  "en train d'écrire" (3 points), micro-animations (apparition des messages, hover, focus).
- Thèmes CLAIR et SOMBRE, look premium (couleurs neutres élégantes, 1 accent subtil).
- Entièrement responsive et fluide ; aucune image lourde.

CONTENU (données factices, 100% local) :
- 3 à 5 conversations d'historique pré-remplies dans la sidebar.
- Des réponses d'assistant SCRIPTÉES qui démontrent les VRAIES capacités d'Autumn AI
  (reprends ses fonctions réelles dans des exemples crédibles).
- Un écran d'accueil avec 3–4 suggestions de prompts cliquables qui lancent une conversation.
- AUCUNE vraie API, clé, ni backend : tout est simulé en local (réponses pré-écrites).

CONTRAINTES TECHNIQUES OBLIGATOIRES (pour que ça s'intègre dans mon portfolio) :
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
     const { useState, useEffect, useRef } = React;
     /* ... tout le code React (composants, conversations factices, réponses scriptées) ... */
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
   d'environ 1280px (l'app sera affichée dans un cadre type navigateur). Icônes en SVG inline.
   Commente les sections importantes en français.

À la fin, donne-moi UNIQUEMENT le contenu complet du fichier `demo.html`.
```

---

## Quand tu reçois le fichier
1. Enregistre-le sous `demos/autumn-ai.html`.
2. Ajoute le projet dans `js/projects.js` :

```js
{
  title: "Autumn AI",
  tag: "IA · Assistant",
  short: "Assistant IA — interface façon ChatGPT/Claude. Démo jouable ⚡",
  desc: "…",                 // (voir le prompt 'Bloc d'infos')
  features: ["…","…","…"],   // (idem)
  tech: ["Java", "…"],
  links: [{ label: "Code", url: "https://github.com/…" }],
  preview: {
    type: "app",
    url: "demos/autumn-ai.html",
    fakeUrl: "autumn-ai.app",
    baseWidth: 1280, baseHeight: 860,   // un chat se voit bien à cette taille
    boot: ["$ ./gradlew run", "▲ Autumn AI — démarrage…", "✓ modèle chargé", "→ prêt"],
  },
  accent: "#ff9d4d",   // un orange "automne" par ex.
}
```
