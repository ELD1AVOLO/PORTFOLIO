# Portfolio de Yahya Elmoussaif

Site statique en HTML, CSS et JavaScript, sans build ni dépendance.
En ligne sur https://portfolio-ogqx.vercel.app.

## Lancer en local

```bash
python -m http.server 5500
```

Puis ouvrir http://localhost:5500. Ajouter `?lang=en` ou `?lang=ar` à l'adresse
pour ouvrir directement l'anglais ou l'arabe.

## Où sont les choses

| Quoi | Où |
|------|-----|
| Structure de la page et textes en français | `index.html` |
| Textes en anglais et en arabe | `js/i18n.js` |
| Couleurs, polices, mise en page | `css/style.css` (jetons en haut du fichier) |
| Langue, thème, démos plein écran, formulaire | `js/main.js` |
| Captures des démos | `assets/shots/` |
| Image d'aperçu des liens partagés | `assets/og.png` |
| Démos jouables | `demos/` |
| Diapositives d'accueil | `js/welcome.js` (texte dans `index.html`, `<dialog id="welcome">`) |
| Logos des entreprises | `assets/logos/` (classes `.logo--…` dans `css/style.css`) |

## Modifier un texte

1. Change le français dans `index.html`. L'élément porte un attribut `data-i18n="clé"`
   (ou `data-i18n-attr` pour un attribut comme `placeholder` ou `alt`).
2. Change la même clé dans `js/i18n.js`, en `en` et en `ar`.

Une clé absente garde le texte français, et la console du navigateur affiche
`[i18n] … clé manquante`.

## Ajouter un projet

Copier un `<article class="project">` dans la section `#projects` de `index.html`,
puis ajouter ses clés dans `js/i18n.js`. Les projets sans capture vont dans le bloc
`.minor`, sur deux colonnes.

## Ajouter une démo

1. Mettre le fichier dans `demos/` (`demos/PROMPT-claude-code.md` explique comment
   le générer).
2. Sur l'`<article>` du projet, ajouter :

   ```html
   data-demo="demos/mon-projet.html" data-demo-size="1600x920" data-demo-title="Mon projet"
   ```

   `data-demo-size` est la taille de l'écran virtuel : la démo est rendue à cette
   taille, puis réduite pour tenir dans la fenêtre.
3. Ajouter le bouton dans `.project__links` :

   ```html
   <a class="btn" href="demos/mon-projet.html" target="_blank" rel="noopener" data-demo-open data-i18n="demo.run">Lancer la démo</a>
   ```

Sur un écran large, la démo s'ouvre en plein écran dans la page. Sur mobile, ou avec
Ctrl/Cmd-clic, elle s'ouvre dans un nouvel onglet.

Les démos chargent React 18.3.1, Babel 8.1.1 et Tailwind 3.4.17 depuis un CDN. Les
versions sont fixées pour qu'une nouvelle version publiée sur le CDN ne casse pas
les démos.

## Refaire une capture

Les images de `assets/shots/` sont des captures des démos à 2×, en WebP, en deux
largeurs (1760 et 960 px). Pour en refaire une : dans Chrome, ouvrir la démo, activer
la barre d'outils mobile des DevTools, régler la taille sur celle de `data-demo-size`
avec un ratio de pixels de 2, puis « Capture screenshot ». Convertir ensuite en WebP
aux deux largeurs (par exemple avec squoosh.app) en gardant les mêmes noms de fichiers.

## Accueil

À la première visite, trois diapositives : la langue, le profil du visiteur (avec
un prénom facultatif), puis un point de départ adapté à ce profil. Les réponses
restent dans le navigateur (`localStorage`, clé `site-visitor`). Le prénom sert à
saluer le visiteur en haut de page et à pré-remplir le formulaire de contact.

Le lien « Revoir l'introduction » du pied de page rouvre l'accueil. Il ne s'affiche
pas quand l'adresse vise une section (`#contact`, `#projects`…) ou contient
`?welcome=0`, pratique pour envoyer un lien direct à un recruteur.

## Logos

Les fichiers de `assets/logos/` sont d'une seule couleur (noir sur fond transparent)
et servent de masques CSS : chaque logo prend la couleur du texte, donc il passe en
clair en mode sombre. Pour en ajouter un :

1. Déposer un PNG ou un SVG d'une couleur, sur fond transparent, dans `assets/logos/`.
2. Dans `css/style.css`, ajouter une classe à côté des autres :

   ```css
   .logo--nom { --ratio: 3.2; --h: 1.3rem; -webkit-mask-image: url(../assets/logos/nom.png); mask-image: url(../assets/logos/nom.png); }
   ```

   `--ratio` est la largeur divisée par la hauteur du fichier, `--h` la hauteur affichée.
3. Dans `index.html` : `<span class="logo logo--nom"></span>`.

## Animations

Tout le monde a des fondus (entrée de l'intro, apparition des sections au défilement,
changement de thème ou de langue). Les mouvements (montée, glissement des
diapositives, filet qui se trace sous les titres) ne s'ajoutent que si le système n'a
pas demandé moins d'animations (`prefers-reduced-motion`). Sans JavaScript, tout le
contenu reste visible.

## Déploiement

Le site est servi par Vercel. `vercel.json` force la revalidation du cache, donc une
nouvelle version est visible dès le déploiement. `.vercelignore` exclut les notes
`demos/PROMPT-*.md`.

## Structure

```
index.html
css/style.css
js/i18n.js        textes anglais et arabes
js/main.js        langue, thème, animations, démos, formulaire
js/welcome.js     diapositives d'accueil
assets/           CV, captures, logos, favicon, image d'aperçu
demos/            démos jouables et notes PROMPT-*.md
```
