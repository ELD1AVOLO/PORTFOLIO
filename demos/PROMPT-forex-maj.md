# 🎯 Prompt pour l'autre session de Claude (repo Forex Terminal)

Colle ceci dans la session Claude qui gère l'app Forex + sa démo `demo.html`.

---

```
Tu travailles sur l'app "Forex Terminal" et sur sa version démo auto-suffisante
`demo.html` (celle intégrée dans mon portfolio via une iframe). Fais ces 3 choses :

1) INFOS DU PROJET (pour les afficher à côté de la démo dans mon portfolio).
   En te basant sur l'app RÉELLE, rends-moi un bloc prêt à coller, exactement
   dans ce format :

   {
     short: "…",                         // accroche courte, max ~90 caractères
     desc: "…",                          // 2–3 phrases de description
     features: ["…", "…", "…", "…"],     // 4 à 6 fonctionnalités clés (puces courtes)
     tech: ["…", "…", "…"],              // stack technique réelle
     links: [
       { label: "Code", url: "https://github.com/…" },
       { label: "Démo", url: "https://…" }   // si tu as une démo en ligne, sinon retire
     ]
   }

2) THÈME PAR DÉFAUT dans `demo.html`.
   L'app NE doit PAS démarrer sur le thème "Cyber" (look sci-fi / robot).
   - Mets le thème par défaut sur le thème PRO Attijari (le thème CLAIR par défaut).
   - Garde une bascule clair / sombre Attijari.
   - Supprime (ou masque) complètement le thème "Cyber" du sélecteur.
   Concrètement : change l'état/contexte de thème initial pour pointer sur
   "attijari-light", et retire l'entrée "cyber" du tableau THEMES.

3) SÉLECTEUR DE THÈME plus pro.
   Remplace les pastilles rondes de couleur par des icônes/logos propres :
   - une petite icône SOLEIL pour le thème clair, LUNE pour le sombre
     (idéalement avec un mini logo de marque), au lieu d'un simple rond de couleur ;
   - garde le sélecteur compact, avec un libellé lisible et un état actif net.

   Utilise des icônes SVG inline (pas d'images externes, pas de librairie d'icônes).

À la fin, rends-moi :
- le fichier `demo.html` COMPLET et mis à jour, en gardant EXACTEMENT le même format
  auto-suffisant : les 4 scripts CDN, le code dans <script type="text/jsx-source"
  id="appSrc">, et la compilation Babel en runtime CLASSIQUE en bas
  (Babel.transform(src, { presets: [["react", { runtime: "classic" }]] })) ;
- et le bloc d'infos du point 1.
```

---

## Quand tu reçois la réponse

1. Remplace `demos/demo.html` par le nouveau fichier (le portfolio le rechargera
   automatiquement, j'ai mis un anti-cache).
2. Colle le bloc d'infos (point 1) dans `js/projects.js`, dans le projet
   **Forex Terminal** — les champs `short`, `desc`, `features`, `tech`, `links`
   sont déjà supportés et s'affichent à côté de la démo.
