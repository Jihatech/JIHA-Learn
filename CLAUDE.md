# JIHA-Learn : source de vérité du contenu JIHA.tech

Ce repo contient les guides du parcours. La plateforme `Jihatech/jiha-formation`
(production, `learn.jiha.tech`) les consomme au build. Un commit ici sur `main`
redéploie la plateforme (workflow `vercel-resync.yml`) et le site statique
GitHub Pages (`pages.yml`).

## Ce qu'on édite

| Fichier | Rôle |
|---|---|
| `content/<id>.md` | Un guide : front-matter YAML bilingue + corps `:::lang fr` / `:::lang en` |
| `guides.json` | Manifeste : ordre, statut, prérequis, filière. **Source de vérité de la structure** |
| `schemas/*.svg` | Schémas injectés via `:::figure <nom>` |
| `config.json`, `assets/` | Marque, styles |

Générés, jamais édités à la main : `index.html`, `guides/<slug>/`.

## Toolbox (dans le repo plateforme)

Les templates ne sont pas dans ce repo mais dans `Jihatech/jiha-formation/docs/` :

- `GUIDE-TEMPLATE.md` : format obligatoire d'un guide
- `CHECKLIST.md` : relecture avant publication (section B = bugs réels déjà commis)
- `BUILD-SPEC.md` : blocs obligatoires, schéma obligatoire dans `concepts`

Quiz associés : `jiha-formation/lib/quiz/data/<id>.json`, un QCM par `step-xx`.
Ajouter ou renuméroter une étape ici impose de mettre à jour ce fichier, sinon
`pnpm check:quizzes` échoue côté plateforme.

## Invariants

- `id` kebab-case, sans accent, **jamais renommé** après publication (clé de progression des étudiants).
- L'ordre du parcours est celui de `guides.json`. Le champ `order` du front-matter est une copie indicative.
- Bilingue complet : chaque bloc de prose a sa paire FR/EN.
- Versions d'images pinées, jamais `:latest`.

## Vérifier avant de livrer

```bash
node build.mjs <id> --strict   # échoue sur [A] parcours et [E] bilingue
node scripts/check-exams.mjs   # échoue si un examen retiré est cité
node scripts/check-code.mjs    # échoue sur ``` déséquilibrés, commentaire en fin d'instruction Dockerfile, image sans tag
```

Examens retirés : `retired-exams.json` (code, date, remplaçant, source officielle).
À mettre à jour à chaque annonce de retrait. Une mention historique s'écrit `ex-AZ-500`.
La filière sécurité Azure prépare désormais au **SC-500** ; son volet IA reste à écrire.

`[C]` (schéma manquant dans `concepts`) reste un avertissement : c'est une dette
à corriger, pas un blocage. Dettes connues : `cicd-gitlab-local`, `terraform-localstack`.

## Rejouer un guide comme un étudiant

Une commande qui « a l'air juste » ne suffit pas : en octobre 2026, le rejeu de la filière Docker
sur une Ubuntu vierge a trouvé 3 Dockerfile qui ne buildaient pas et 4 explications fausses sur
Docker 29. Pour tout guide nouveau ou modifié, rejoue ses commandes sur une machine neuve
(conteneur Ubuntu privilégié, `/var/lib/docker` sur un volume) avant publication.

## Règles de travail

1. Une session = une PR de contenu mergeable, ou un stop explicite.
2. Après 3 tentatives sur un même problème, s'arrêter et demander une décision.
3. Toute erreur technique trouvée dans un guide devient une ligne de la section B de `CHECKLIST.md`.
