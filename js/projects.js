/* =====================================================================
   projects.js — PROJETS (issus du CV)
   ---------------------------------------------------------------------
   - type "app"       -> terminal "run dev" puis démo interactive navigable
                         (url = fichier auto-suffisant dans demos/)
                         baseWidth/baseHeight = "dézoom" (composants aérés)
   - type "lightning" -> ambiance éclairs (pas encore de démo jouable)
   short / desc / features / tech / links s'affichent dans la fenêtre.
   ===================================================================== */

const PROJECTS = [
  {
    title: "Forex Terminal — R60",
    tag: "Fintech · Data Science @ Attijariwafa Bank",
    status: "En production",
    year: "2026",
    short: "Terminal forex IA : 18 paires, prédictions de marché pilotées par les news en temps réel",
    desc: "Forex Terminal est un tableau de bord d'aide à la décision pour le trading de devises. Le problème qu'il adresse : les news financières (banques centrales, indicateurs économiques, géopolitique) font bouger les marchés en quelques secondes, mais un humain ne peut pas lire et interpréter des dizaines de sources en continu. L'application scrape en permanence des flux RSS (Reuters, Bloomberg, BCE, Fed, FXStreet…), fait analyser le sentiment de chaque news par FinBERT (modèle NLP spécialisé finance), puis transforme le texte en un vecteur de caractéristiques qu'un modèle LightGBM dédié à chaque paire utilise pour prédire la direction du prix (UP / DOWN / FLAT) avec un niveau de confiance et une estimation du mouvement en pips à 15 min, 1 h et 4 h. Le tout est servi via une architecture 3 tiers (React pour l'interface façon Bloomberg, Spring Boot comme passerelle API, Flask comme moteur d'IA) et s'adresse à des traders et analystes qui veulent un signal explicable, relié à la news qui l'a déclenché — pas une boîte noire.",
    features: [
      "Prédiction directionnelle par paire (LightGBM) à partir d'un flux de news temps réel",
      "Analyse de sentiment financier des news via FinBERT (NLP / Transformers)",
      "18 paires G10 couvertes, avec ré-entraînement des modèles sur données live",
      "Estimation du mouvement attendu en pips (horizons 15 min / 1 h / 4 h) + score de confiance",
      "Graphiques candlestick (RSI, MACD, Bollinger) et heatmap 8×8 de force des devises",
      "Scraper RSS configurable (Reuters, Bloomberg, BCE, Fed, FXStreet) + chatbot analyste",
    ],
    tech: ["React", "Spring Boot (Java)", "Flask (Python)", "LightGBM", "FinBERT / Hugging Face Transformers", "pandas", "lightweight-charts"],
    links: [{ label: "Code", url: "https://github.com/ELD1AVOLO/EUR-USD-Intelligence-Dashboard" }],
    preview: {
      type: "app",
      url: "demos/demo.html",
      fakeUrl: "forex-terminal.app",
      baseWidth: 1600,
      baseHeight: 920,
      boot: [
        "$ npm run dev",
        "▲ Vite — Forex Terminal",
        "✓ flux marché (websocket) connecté",
        "✓ modèles ML chargés",
        "→ http://localhost:5173",
      ],
    },
    accent: "#00d4ff",
  },

  {
    title: "Texara",
    tag: "Projet personnel · IDE LaTeX offline-first",
    status: "Projet perso",
    year: "2025",
    short: "Un éditeur LaTeX qui compile entièrement hors-ligne, façon Overleaf.",
    desc: "Éditeur LaTeX dans le navigateur qui compile les documents entièrement hors-ligne sur un vrai moteur TeX Live (serveur Node/Express), avec une sortie quasi-identique à Overleaf. Pensé pour l'édition collaborative, le versionnage Git et l'export multi-format.",
    features: [
      "Compilation hors-ligne sur TeX Live réel — 50+ packages (TikZ, pgfplots, minted, biblatex/biber)",
      "Mode langage LaTeX personnalisé sous CodeMirror 6 (repli de code, coloration, aperçu inline KaTeX/TikZ)",
      "Édition collaborative temps réel (CRDTs Yjs over WebRTC)",
      "Versionnage Git/GitHub natif (isomorphic-git + API REST GitHub)",
      "Export PDF / Word / HTML / Markdown (pdf-lib, html2canvas)",
      "Persistance locale (IndexedDB + Zustand)",
    ],
    tech: ["React", "TypeScript", "Vite", "CodeMirror 6", "Node.js", "TeX Live", "Yjs", "isomorphic-git"],
    links: [{ label: "Code", url: "#" }],
    preview: { type: "lightning" },
    accent: "#b14cff",
  },

  {
    title: "Autumn AI — AUTOM",
    tag: "IA · Works Platforme / Caciopee",
    status: "En production",
    year: "2025",
    short: "Agent IA qui génère des interfaces métier à partir de spécifications XML",
    desc: "Autumn AI est un agent qui automatise la conception d'interfaces applicatives pour le domaine de l'assurance santé (gestion des demandes de remboursement). À partir de composants métier décrits en XML (<Composant-Definition>) et d'une description fonctionnelle, il produit automatiquement les entités métier, leur documentation, un cahier des charges structuré par rôle utilisateur, puis la maquette des écrans. Le système repose sur un pipeline en plusieurs étapes orchestré en Python : l'étape 1 (modèle Llama 3) parse et normalise les composants XML, l'étape 2 (modèle Hermes 2 Pro) les transforme en entités JSON avec attributs, relations et cardinalités, et les étapes suivantes génèrent documentation, synthèse et spécifications d'UI. Une application de bureau Java (Swing) sert de poste de pilotage : l'utilisateur saisit son prompt, sélectionne les fichiers, et déclenche la génération via un backend Flask local. Il s'adresse aux équipes de développement et analystes métier qui veulent accélérer la phase de modélisation et de prototypage d'écrans.",
    features: [
      "Conversion de composants XML métier en entités JSON normalisées (attributs, relations, cardinalités)",
      "Normalisation automatique des cardinalités (TYPE_RELATION_SIMPLE → 1:1, MULTIPLE → 1:N)",
      "Génération d'un cahier des charges structuré et adapté par rôle (Agent de saisie, Valideur, Superviseur)",
      "Production de documentation métier et de synthèses lisibles à partir des entités",
      "Spécification d'écrans (DataGrid, SearchInput, formulaires, actions, export CSV/Excel/PDF)",
      "Interface Java de pilotage avec sélection de fichiers, sauvegarde des prompts et appels au backend",
    ],
    tech: ["Python", "Java (Swing)", "Flask", "Ollama", "Llama 3", "Hermes 2 Pro", "XML / JSON", "HTTP (java.net.http)"],
    links: [{ label: "Code", url: "https://github.com/ELD1AVOLO/AUTOMN_AI_AGENT" }],
    // Logos des entités où le projet a été réalisé (affichés dans la fenêtre)
    orgLogos: [
      { src: "assets/works-platform.svg", alt: "Works Platform" },
      { src: "assets/caciopee.svg", alt: "Caciopee" },
    ],
    preview: {
      type: "app",
      url: "demos/demo_automn.html",
      fakeUrl: "autumn-ai.app",
      baseWidth: 1280,
      baseHeight: 860,
      boot: [
        "$ python backend/app.py",
        "▲ Autumn AI — agent de génération d'UI",
        "✓ Ollama : Llama 3 + Hermes 2 Pro",
        "✓ pipeline prêt",
        "→ http://127.0.0.1:5000",
      ],
    },
    accent: "#ff9d4d",
  },

  {
    title: "Jortal",
    tag: "IA · Plateforme emploi · POL IT",
    status: "Contribution",
    year: "2023",
    short: "Matching intelligent CV/offres par analyse sémantique.",
    desc: "Plateforme d'emploi avec matching intelligent entre CV et offres via analyse sémantique (NLP). Scoring sémantique des candidatures et visualisation des tendances de recrutement.",
    features: [
      "Matching CV / offres par analyse sémantique",
      "Scoring sémantique des candidatures",
      "Visualisation des tendances de recrutement",
    ],
    tech: ["Laravel", "PHP", "NLP", "MySQL"],
    links: [{ label: "Code", url: "#" }],
    preview: { type: "lightning" },
    accent: "#00f5a0",
  },
];

window.PROJECTS = PROJECTS;
