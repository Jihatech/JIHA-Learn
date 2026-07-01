# V2 BRIEF — Plateforme de formation jiha.tech

> Note de handover entre la session v1 (site statique JIHA-Learn) et la session v2 (plateforme avec comptes, parcours, paiement).
> À lire en premier par toute nouvelle session Claude Code qui attaque la plateforme.

---

## 1. Où on en est (v1, déjà livré)

- **Site statique en ligne** : <https://jihatech.github.io/JIHA-Learn/>
- **Repo source** : `Jihatech/JIHA-Learn`
- **Stack** : HTML / CSS / JS pur, généré par `build.mjs` (Node.js, zéro dépendance npm).
- **Format des sources** : un fichier `.md` par guide dans `content/`, suivant `GUIDE-TEMPLATE.md` (front-matter YAML bilingue + corps `:::lang fr` / `:::lang en` + `:::figure <nom>` pour les schémas SVG inline).
- **Manifeste central** : `guides.json` — clés de parcours stables, statuts `published` / `coming-soon`, `prerequisites`, `next`.
- **Contenu publié** : 2 guides (`traefik`, `vaultwarden`). 6 autres référencés `coming-soon`.
- **Workflow GitHub Pages** : `.github/workflows/pages.yml` — build tous les guides `published` + homepage, déploie automatiquement à chaque push sur `main`.

JIHA-Learn n'est pas à abandonner : **c'est la source de vérité du contenu pédagogique**. La v2 le consomme, elle ne le remplace pas.

---

## 2. Ce qui est fixé (non négociable en v2)

Hérité de `BUILD-SPEC.md`, déjà appliqué en v1, à préserver en v2.

- **Identifiants de guides stables** (`kebab-case`, sans accent, sans version). Ils seront les clés de progression par utilisateur — un id qui change = un historique de progression cassé.
- **Séparation contenu / présentation.** Le contenu vit dans des fichiers structurés (`content/<id>.md`), pas dans du code. La plateforme doit pouvoir les importer sans les réécrire.
- **Manifeste comme colonne vertébrale.** Statuts, prérequis, suite, niveau, durée. Doit aussi accueillir le statut d'accès (`free` / `premium`) — embryon déjà présent en v1.
- **Bilingue FR/EN systématique.** Aucune page mono-langue. Pour le PDF/print : un PDF FR propre, un PDF EN propre, jamais mélangés.
- **Identité visuelle** : thème terminal/CRT, accent ambre `#FFB627`, bascule clair/sombre, `prefers-reduced-motion` respecté. Le logo placeholder actuel **convient** — pas besoin de le remplacer en v2.

---

## 3. Ce que la v2 ajoute

D'après `BUILD-SPEC.md §7`.

- **Comptes membres** (inscription, connexion, mot de passe oublié).
- **Suivi de progression par utilisateur** (guides commencés / terminés, position dans le parcours, dates).
- **Parcours structuré** : les prérequis du manifeste deviennent des dépendances *vérifiées* (pas de saut anarchique).
- **Modèle freemium** : premier guide gratuit, contenu avancé payant.
- **CMS** envisagé (Sanity) pour gérer le contenu sans toucher au code.
- **Hébergement** possiblement migré (GitHub Pages suffit pour le statique, pas pour une app avec BDD).

---

## 4. Décisions à prendre par ordre de priorité

### Niveau 1 — Stack technique de base (à trancher avant la première ligne de code)

| Sujet | Options pragmatiques | Recommandation par défaut |
|---|---|---|
| Framework | Next.js / SvelteKit / Astro+islands / Remix | **Next.js 15 (App Router)** : matures, SSR/ISR pour le SEO bilingue, écosystème dense. Astro reste pertinent si la moitié du site est statique. |
| Hébergement | Vercel / Netlify / Cloudflare Pages / Fly.io | **Vercel** si Next.js (intégration native, free tier généreux). Cloudflare Pages si optimisation coûts. |
| Base de données | Supabase / PlanetScale / Neon / Postgres direct | **Supabase** : Postgres + auth + storage en un, free tier confortable, exit possible (c'est du Postgres standard). |
| Auth | Clerk / Supabase Auth / NextAuth + OAuth | **Supabase Auth** si Supabase pour la BDD (cohérence). Clerk si on veut un magic UX immédiat (mais lock-in plus fort). |

### Niveau 2 — Gestion du contenu

- **Sanity oui ou non ?**
  - **Oui** : interface CMS confortable, gestion des révisions, prévisualisation. Bémol : il faut migrer / synchroniser les `.md` de JIHA-Learn vers Sanity.
  - **Non** : on garde les `.md` dans JIHA-Learn comme source. La plateforme les importe au build (ou via un webhook GitHub). Plus simple, moins de dépendance, mais pas d'UI d'édition.
  - **Recommandation honnête** : démarrer **sans** Sanity. Le format `:::lang` est déjà structuré ; un parseur côté plateforme suffit. Ajouter Sanity plus tard si le besoin d'édition non-Git devient réel.

### Niveau 3 — Modèle business

- **Pricing** : un seul tier (« access complet ») ou plusieurs (early access / standard / pro) ?
- **Mensuel / annuel / lifetime ?**
- **Paiement** : **Stripe**. Pas de débat — standard, doc impeccable.
- **Email transactionnel** : **Resend** (DX moderne) ou Postmark (battle-tested). Évite SES en direct pour aller vite.

### Niveau 4 — Marketing & analytics

- **Domaine** : `jiha.tech` est-il déjà acquis ? Si non, l'acheter en priorité (5-10 €/an).
- **Analytics** : **Plausible** (privacy-friendly, hébergé EU) ou **Umami** (self-host possible).
- **Newsletter** : **ConvertKit** ou **Beehiiv** pour démarrer (séquences d'onboarding incluses).
- **SEO** : pages bilingues distinctes (`/fr/...` et `/en/...`) ou même URL avec bascule client ? Choix structurant.

### Niveau 5 — Roadmap de publication

| Étape | Quand |
|---|---|
| MVP | Inscription + 1 guide gratuit affichable (Vaultwarden, déjà rédigé) avec progression simple par localStorage puis migration en BDD |
| Phase 2 | Comptes complets + parcours avec prérequis vérifiés + Stripe pour l'access pro |
| Phase 3 | Convertir les 6 autres guides (`art-of-command-line`, `git-fondamentaux`, `docker-fondamentaux`, `docker-compose`, `immich`, `monitoring`) |
| Phase 4 | Communauté (forum / Discord), webinaires, contenus complémentaires |

---

## 5. Articulation v1 ↔ v2

**Garde JIHA-Learn pour :**

- Les `.md` sources (vérité du contenu).
- Le PDF lead magnet (pur statique).
- Les pages SEO indexables (le statique reste imbattable).

**La plateforme :**

- Importe les `.md` depuis JIHA-Learn (build-time, ou via webhook GitHub à la mise à jour).
- Ajoute la couche comptes / progression / paiement.
- Peut héberger ses propres pages bilingues en SSR pour les sections protégées.

**Conséquence pratique** : la plateforme est **build-time bound** à JIHA-Learn (elle clone le repo et lit `content/` + `guides.json` au build). Tout commit dans JIHA-Learn déclenche un rebuild plateforme. C'est sain, ça force la séparation des responsabilités.

---

## 6. Pour la prochaine session Claude Code

Au moment de l'ouvrir, **attache-la directement au repo plateforme** (à créer). MCP et signature seront alors câblés pour ce repo.

**Premier prompt suggéré** (à copier dans la nouvelle session) :

> Tu es Claude Code, attaché au repo `Jihatech/<nom-platforme>`. Lis d'abord `https://github.com/Jihatech/JIHA-Learn/blob/main/docs/V2-BRIEF.md` (note de handover de la session v1). Puis lis `https://github.com/Jihatech/JIHA-Learn/blob/main/README.md` et `https://github.com/Jihatech/JIHA-Learn/blob/main/guides.json` pour comprendre le format de contenu et le manifeste. Avant de coder, propose-moi un plan technique pour le MVP en respectant la trajectoire décrite dans le brief (Niveau 1 + 2 + section 5).

Cette amorce suffit à recadrer la nouvelle session sans tout re-débriefer à l'oral.

---

*Note rédigée par la session v1 — édition juin 2026.*
