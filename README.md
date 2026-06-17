# jiha.tech — Skill tree DevOps & self-hosting

Site statique des guides du parcours. Sortie hébergeable telle quelle sur GitHub Pages, Netlify, Vercel ou n'importe quel hébergeur statique. Produit à partir de fichiers-guides Markdown structurés (format `GUIDE-TEMPLATE.md`), avec génération automatique de la page web bilingue et d'une feuille `@media print` pour le PDF.

## Architecture

```
.
├── content/                   # source de vérité (fichiers-guides Markdown)
│   └── vaultwarden.md         # un fichier par guide, format GUIDE-TEMPLATE
├── guides.json                # manifeste central (parcours, statuts, relations)
├── config.json                # placeholders centralisés (URLs, marque)
├── assets/
│   ├── logo/                  # LOGO_JIHA_TECHSVG.svg
│   ├── styles/main.css        # thème terminal/CRT + bascule clair/sombre
│   ├── styles/print.css       # feuille @media print mono-langue
│   └── js/ui.js               # bascules langue/thème, copy code, PDF
├── build.mjs                  # générateur Node.js (zéro dépendance)
├── index.html                 # ← généré : sommaire du parcours
└── guides/<slug>/index.html   # ← généré : pages des guides
```

On édite uniquement `content/`, `guides.json`, `config.json`, `assets/`. Le dossier `guides/` et `index.html` à la racine sont **générés** — ne pas éditer à la main.

## Générer

Requis : Node 18+ (pour `node:fs` et les ES modules natifs).

```bash
node build.mjs              # build vaultwarden + homepage (par défaut)
node build.mjs <guide-id>   # build d'un guide spécifique
```

Le script :

1. Lit `content/<id>.md`, parse le front-matter YAML et le corps `:::lang fr/en`.
2. Résout `prerequisites` et `next` contre `guides.json` (liens actifs ou grisés `bientôt/soon`).
3. Injecte les schémas SVG inline (table `SCHEMAS` dans `build.mjs`).
4. Lint léger (cohérence parcours, bilingue, schéma obligatoire dans `concepts`).
5. Produit `guides/<slug>/index.html` + `index.html` racine.

## Servir en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/
```

## Ajouter un nouveau guide

1. **Écrire le fichier source** : `content/<id>.md` au format défini dans `GUIDE-TEMPLATE.md` (front-matter YAML bilingue + corps `:::lang fr` / `:::lang en`).
2. **Mettre à jour `guides.json`** : ajouter une entrée avec `id`, `slug`, `order`, `status: published`, `level`, `duration_min`, titres et tagline bilingues.
3. **Ajouter le schéma** dans la table `SCHEMAS` de `build.mjs` si le guide en référence un nouveau via `:::figure <nom>`.
4. **Builder** : `node build.mjs <id>`.
5. **Vérifier** le lint : pas d'avertissement `[A]` (parcours), `[C]` (schéma obligatoire) ni `[E]` (bilingue).

## Format d'un fichier-guide (rappel)

Voir `GUIDE-TEMPLATE.md` pour le contrat complet. Résumé :

- Front-matter YAML : `id`, `slug`, `order`, `status`, titres bilingues `_fr/_en`, métadonnées pédagogiques, `prerequisites`, `next`.
- Corps Markdown organisé par sections `## intro`, `## objectives`, `## prerequisites`, `## concepts`, `## walkthrough` (avec `### step-XX`), `## pitfalls`, `## success`, `## next`, `## cheatsheet`, `## resources`, `## troubleshooting`.
- Chaque bloc de prose en **deux versions** côte à côte : `:::lang fr ... :::` puis `:::lang en ... :::`.
- Les blocs de code (` ```bash `, ` ```yaml `, etc.) ne sont **pas** dupliqués par langue.
- Les schémas : `:::figure <nom> caption_fr: "..." caption_en: "..." :::`. Le SVG vit dans `build.mjs` (table `SCHEMAS`) pour le moment.

## Bilingue & impression

- Bascule FR/EN persistée dans `localStorage`. Mécanique CSS : `html[lang="fr"] [data-lang="en"] { display: none }` (et symétrique).
- Bascule clair/sombre persistée idem. Mode clair = palette papier crème + ambre assombri pour le contraste.
- Bouton « Télécharger PDF » → `window.print()` sur la langue active. La feuille `print.css` masque l'UI (topbar, TOC, CTA), force le fond papier, garde un terminal noir-sur-crème lisible, affiche les URL des liens externes et empêche les coupures de page au milieu d'un bloc de code ou d'un schéma.

## Points encore à régler

- [ ] **Logo réel** : remplacer `assets/logo/LOGO_JIHA_TECHSVG.svg` (placeholder actuel) par le vrai fichier.
- [ ] **`[NOM_PLATEFORME]`** : à substituer dans `config.json` quand le nom de produit existera.
- [ ] **`[URL_PLATEFORME]`** : à finaliser dans `config.json` à la mise en ligne de la plateforme.
- [ ] **Convertir les 7 autres guides** : Art of CLI, Git, Docker fondamentaux, Docker Compose, Traefik, Immich, Monitoring. Process : copier `content/vaultwarden.md` comme gabarit, traduire le source `XX-<id>.md` dans le format `:::lang`, passer `status: coming-soon` à `published` dans `guides.json`, ajouter le schéma dans `SCHEMAS` si nouveau.
- [ ] **Tracking analytics & capture email** : emplacement réservé dans `<head>` et `pdf-block` (cf. BUILD-SPEC §3.3 et §5.4). À ajouter via un skill marketing dédié.

## Conformité au BUILD-SPEC

- §2 thème terminal/CRT + clair/sombre + accent ambre `#FFB627` : ✓
- §2.4 `prefers-reduced-motion` respecté : ✓
- §2.5 schéma SVG inline dans `concepts` : ✓
- §3 ordre canonique des blocs : ✓ (intro, prerequisites, concepts, walkthrough, success, next, cheatsheet, resources, + troubleshooting comme extension)
- §3.2 trois CTA (bandeau haut + fort en fin + footer) : ✓
- §3.3 bouton PDF + feuille `@media print` soignée : ✓
- §3.4 liens inter-guides résolus via manifeste, grisés `bientôt/soon` : ✓
- §3.5 bascule bilingue cohérente sur l'ensemble de la page : ✓
- §5.1 sortie statique pure, fonctionne sans JS pour le contenu : ✓
- §5.2 contenu/présentation séparés : ✓ (`content/*.md` est la source, le HTML est généré)
- §5.3 manifeste de guides centralisé : ✓
- §6.1 identifiants stables, kebab-case, sans accent : ✓
- §6.2 URL `/guides/<id>/` : ✓
- §6.5 placeholders centralisés dans `config.json` : ✓

## Licence

MIT.
