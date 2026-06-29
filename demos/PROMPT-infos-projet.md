# 🎯 Prompt — Bloc d'infos / explication (à afficher à côté de la démo)

Sert à récupérer le texte d'explication d'un projet, affiché dans le panneau d'infos
à côté de la démo dans le portfolio.

👉 Utilise-le **dans chaque repo** : une fois dans la session **forex_prediction**,
une fois dans la session **Autumn AI**. Remplace `NOM_DU_PROJET`.

---

```
Pour mon portfolio, j'affiche une fiche d'infos à côté de la démo de ce projet.
En te basant sur l'application RÉELLE (NOM_DU_PROJET), rends-moi un bloc prêt à coller,
EXACTEMENT dans ce format JavaScript :

{
  short: "…",          // accroche courte, max ~90 caractères
  desc: "…",           // EXPLICATION claire en 3 à 5 phrases : à quoi sert l'app, le
                       // problème qu'elle résout, COMMENT elle marche (l'approche/les
                       // étapes), et pour qui. C'est le texte principal d'explication.
  features: [          // 4 à 6 fonctionnalités clés, puces courtes et concrètes
    "…", "…", "…", "…"
  ],
  tech: [              // stack RÉELLE : langages, frameworks, libs, modèles, infra
    "…", "…", "…"
  ],
  links: [
    { label: "Code", url: "https://github.com/…" },
    { label: "Démo", url: "https://…" }     // retire si pas de démo en ligne
  ]
}

Consignes :
- Écris en français, ton professionnel mais accessible.
- Sois CONCRET : cite les vraies sources de données, modèles, algorithmes, métriques ou
  résultats si pertinent. Évite les superlatifs vides ("incroyable", "révolutionnaire").
- Le champ `desc` est l'explication la plus importante : qu'on comprenne le projet en
  le lisant, même sans connaître le domaine.
- Ne rends QUE ce bloc, rien d'autre.
```

---

## Où le coller
Dans `js/projects.js`, sur le projet correspondant : les champs `short`, `desc`,
`features`, `tech`, `links` sont déjà gérés et s'affichent à côté de la démo
(la liste `features` apparaît en puces ⚡).
