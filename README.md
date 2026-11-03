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
| Statuts qui défilent sous le nom | `index.html` (`.roles`), minuterie dans `js/main.js` |
| Décor du cahier, ruban, navigation de la marge | `index.html` (`.notebook`, `.ribbon`, `.margin-nav`), `css/style.css` |
| La page qui s'écrit à côté de l'intro (grand écran) | `js/inkpad.js` (scènes dans `SCENES`, dessins dans `DOODLES`) |

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

À la première visite, une petite feuille arrachée au cahier se pose au milieu de la
page, qu'on devine derrière, floutée comme dans la brume. Elle porte trois
diapositives : la langue, le profil du visiteur (avec un prénom facultatif), puis un
point de départ adapté à ce profil. Les réponses restent dans le navigateur
(`localStorage`, clé `site-visitor`). Le prénom sert à saluer le visiteur en haut de
page et à pré-remplir le formulaire de contact.

Le papier est le `::before` de `.welcome__sheet` : lignes, marge rouge et bord déchiré
du côté de la spirale (masque `--torn`, un trou arraché par ligne). Les couleurs sont
les jetons `--sheet`, `--sheet-shadow` et `--fog` (la brume). Les diapositives sont
superposées, donc la feuille garde la même taille de l'une à l'autre.

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

## Statuts sous le nom

Trois statuts se relaient toutes les 7 secondes (`SWITCH_EVERY` dans `js/main.js`) :
le suivant descend du haut et l'actuel sort par le bas. Le défilement s'arrête au
survol, quand l'onglet est caché ou quand l'intro n'est plus à l'écran. Pour changer
un statut : le texte dans `index.html` (`.roles__item`), puis les clés `hero.role1` à
`hero.role3` dans `js/i18n.js`, sans oublier `hero.rolesAll`, la version que lisent
les lecteurs d'écran.

## Cahier et marque-page

Le fond est une page de cahier : les lignes sont le fond du `body`, la marge rouge,
la spirale et le bord de la page d'en face sont dans `<div class="notebook">`. Les
couleurs sont les jetons `--ruled`, `--margin-line`, `--paper-edge` et `--ribbon…`
de `css/style.css`, les largeurs `--facing`, `--bind` et `--page-start`.

Sur grand écran, la navigation est dans la marge : le ruban descend quand on descend,
remonte quand on remonte, et s'arrête en face de la section en cours. Sur mobile, le
ruban sert de jauge de lecture et la navigation reste en haut de page.

## La page qui s'écrit

À partir de 1200 px de large, l'espace libre à droite de l'intro est une page où
quelqu'un écrit, comme le journal de Tom Jedusor dans Harry Potter : citations, mots,
formules, dessins d'enfant. Chaque scène a son écriture (sept polices manuscrites de
Google Fonts, chargées seulement quand l'animation tourne), sa couleur et son outil :
stylo plume, crayon de papier, craie grasse, ou une main invisible. Puis tout
s'efface, à la gomme ou parce que l'encre s'enfonce dans la page.

- Une scène est un objet de `SCENES` dans `js/inkpad.js`. Dans une ligne, une partie
  `["pence", "pense"]` fait se tromper l'auteur : il écrit la faute, s'arrête,
  l'efface et corrige.
- Les dessins sont des listes de traits dans `DOODLES`, en coordonnées sur 100.
- `en: {…}` et `ar: {…}` dans une ligne remplacent ce qui change quand la page est en
  anglais ou en arabe.
- `?ink=4` dans l'adresse commence à la scène n° 4, pour en regarder une précise.

L'animation s'arrête quand la page n'est plus à l'écran, quand l'onglet est caché ou
quand une fenêtre est ouverte (accueil, démo). Si le thème change, elle passe à la
scène suivante pour que l'encre reste lisible.

## Animations

Tout le monde a des fondus (entrée de l'intro, apparition des sections au défilement,
changement de thème ou de langue). Les mouvements (montée, glissement des
diapositives, feuille d'accueil qui se pose, filet qui se trace sous les titres) ne
s'ajoutent que si le système n'a pas demandé moins d'animations
(`prefers-reduced-motion`). Deux exceptions, voulues : la descente des statuts sous le
nom et la page qui s'écrit, qui jouent pour tout le monde. Sans JavaScript, tout le
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
js/inkpad.js      la page qui s'écrit à côté de l'intro (grand écran)
assets/           CV, captures, logos, favicon, image d'aperçu
demos/            démos jouables et notes PROMPT-*.md
```
