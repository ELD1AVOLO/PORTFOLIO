# ⚡ Portfolio — thème Foudre / Lightning

Portfolio personnel en HTML / CSS / JavaScript **pur** (aucune installation, aucun build).
Animation d'éclairs sur `<canvas>` (faite maison), projets en petites cartes qui s'ouvrent
dans une grande fenêtre avec une "simulation" du projet.

## 🚀 Lancer en local

Double-clique simplement sur `index.html`.
Ou, pour un vrai petit serveur (recommandé pour les `iframe`) :

```bash
# avec Python (déjà installé sur la plupart des PC)
python -m http.server 5500
# puis ouvre http://localhost:5500
```

## ✏️ Personnaliser

| Quoi | Où |
|------|-----|
| Ton nom, bio, email, réseaux | `index.html` |
| Tes projets (cartes + fenêtres) | `js/projects.js` |
| Couleurs, polices, espacements | `css/style.css` (variables `:root` en haut) |
| Comportement des éclairs | `js/lightning.js` |

### Ajouter un projet
Ouvre `js/projects.js` et copie un bloc dans le tableau `PROJECTS`.
Le champ `preview.type` choisit ce qui s'affiche dans la grande fenêtre :

- `"app"` → **terminal « run dev » animé PUIS démo interactive navigable** (mini-app
  React avec données factices, dans un cadre navigateur). Donne `url: "demos/xxx.html"`,
  `fakeUrl` et `boot: [...]`. 👉 Voir `demos/PROMPT-claude-code.md` pour générer ces démos.
- `"code"` → faux terminal animé (machine à écrire) — donne aussi `lines: [...]`
- `"iframe"` → affiche un site live — donne `url: "https://..."`
- `"image"` → affiche une capture — donne `url: "assets/ma-capture.png"`
- `"lightning"` → uniquement l'ambiance éclairs

### 🎮 Démos jouables de tes projets (type `app`)
Le projet d'exemple **NovaTask** montre une vraie mini-app React intégrée
(`demos/demo-sample.html`). Pour créer la démo d'un de tes vrais projets, ouvre
**Claude Code dans le dossier de ce projet** et colle le prompt fourni dans
`demos/PROMPT-claude-code.md`. Il génère un fichier `.html` auto-suffisant à déposer
dans `demos/`.

`accent` change la couleur des éclairs de la fenêtre pour ce projet.

## 🎨 Changer les couleurs
Dans `css/style.css`, modifie les variables en haut :

```css
--cyan:   #4cc9f0;   /* couleur principale  */
--purple: #b14cff;   /* couleur secondaire  */
--bg:     #05060a;   /* fond                */
```

## ☁️ Déployer sur Netlify (comme tes références)

1. Va sur [app.netlify.com/drop](https://app.netlify.com/drop)
2. Glisse-dépose le dossier `PORTFOLIO` entier.
3. C'est en ligne 🎉 (tu peux ensuite renommer le site dans les réglages).

Alternative : connecte un dépôt GitHub à Netlify pour un déploiement auto à chaque `push`.

## 📁 Structure

```
PORTFOLIO/
├── index.html          # structure + contenu
├── css/style.css       # thème "foudre" sombre
├── js/
│   ├── lightning.js    # moteur d'éclairs (canvas)
│   ├── projects.js     # TES PROJETS (à éditer)
│   └── main.js         # cartes, modal, navigation
├── assets/             # images / captures
└── README.md
```
