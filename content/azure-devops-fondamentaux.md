---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-devops-fondamentaux
slug: azure-devops-fondamentaux
order: 70
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — DevOps fondamentaux (AZ-400) : Git, CI/CD, pipelines"
title_en: "Azure — DevOps fundamentals (AZ-400): Git, CI/CD, pipelines"
tagline_fr: "culture DevOps, stratégie Git, première pipeline CI."
tagline_en: "DevOps culture, Git strategy, first CI pipeline."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 240
repo: "actions/runner"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: [azure-projet-entreprise]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [devops, ci-cd, git, branches, trunk-based, pull-request, github-actions, azure-pipelines, az-400]
concepts_en: [devops, ci-cd, git, branches, trunk-based, pull-request, github-actions, azure-pipelines, az-400]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Les fondamentaux DevOps pour l'AZ-400, en pratique et en local : la culture DevOps (CALMS) et le CI/CD, une stratégie de contrôle de source Git jouée EN VRAI (branche de fonctionnalité, commit, fusion no-ff, trunk-based vs GitFlow), le workflow des pull requests et des stratégies de branche, et une première pipeline CI décrite en YAML GitHub Actions (déclencheurs, jobs, étapes, dépendances) validée localement. Plus la comparaison GitHub Actions vs Azure Pipelines. Sans compte cloud."
og_description_en: "DevOps fundamentals for AZ-400, hands-on and local: the DevOps culture (CALMS) and CI/CD, a Git source-control strategy played FOR REAL (feature branch, commit, no-ff merge, trunk-based vs GitFlow), the pull-request workflow and branch policies, and a first CI pipeline described in GitHub Actions YAML (triggers, jobs, steps, dependencies) validated locally. Plus GitHub Actions vs Azure Pipelines. No cloud account."
---

## intro

:::lang fr
Le **DevOps** n'est pas un outil, c'est une **façon de livrer** : rapprocher le développement (Dev) et l'exploitation (Ops) pour livrer **plus vite**, **plus souvent** et **plus sûrement**, par l'**automatisation**. L'examen **AZ-400** (Designing and Implementing DevOps Solutions) en fait un métier : stratégie de contrôle de source, **pipelines CI/CD**, sécurité, supervision. Ce guide pose les fondations — et, fidèle à la méthode du parcours, tu les **pratiques en local**, gratuitement.

On commence par la **culture** (CALMS) et le **CI/CD** (intégration et livraison continues). Puis on **joue une stratégie Git EN VRAI** : une **branche de fonctionnalité**, des commits, une **fusion** — et on compare **trunk-based** et **GitFlow**. On voit le workflow des **pull requests** et des **stratégies de branche** (qui protègent `main`). Enfin, on écrit une **première pipeline CI** en **YAML GitHub Actions** (déclencheurs, jobs, étapes, dépendances) qu'on **valide localement**, et on la compare à **Azure Pipelines**, l'alternative native d'Azure.

C'est le premier guide du track **AZ-400**. Ici, l'outillage change : **Git** est réel (et gratuit), les **pipelines** s'écrivent et se **valident** en YAML — pas besoin de compte cloud pour apprendre les fondamentaux.

**Pour qui c'est :** tu sais déjà déployer de l'infra (AZ-104/305) et tu veux **automatiser la livraison**.

**Quand ce n'est PAS le bon choix :**

- Tu ne connais pas Git du tout → apprends les bases (`add`, `commit`, `branch`) d'abord.
- Tu cherches uniquement de la théorie de gestion de projet → ici c'est **technique et pratique**.
:::

:::lang en
**DevOps** isn't a tool, it's a **way of delivering**: bringing development (Dev) and operations (Ops) closer to ship **faster**, **more often** and **more safely**, through **automation**. The **AZ-400** exam (Designing and Implementing DevOps Solutions) makes it a profession: source-control strategy, **CI/CD pipelines**, security, monitoring. This guide lays the foundations — and, true to the path's method, you **practice them locally**, for free.

We start with the **culture** (CALMS) and **CI/CD** (continuous integration and delivery). Then we **play a Git strategy FOR REAL**: a **feature branch**, commits, a **merge** — and compare **trunk-based** and **GitFlow**. We see the **pull request** workflow and **branch policies** (that protect `main`). Finally, we write a **first CI pipeline** in **GitHub Actions YAML** (triggers, jobs, steps, dependencies) that we **validate locally**, and compare it to **Azure Pipelines**, Azure's native alternative.

This is the first guide of the **AZ-400** track. Here, the tooling changes: **Git** is real (and free), **pipelines** are written and **validated** in YAML — no cloud account needed to learn the fundamentals.

**Who it's for:** you can already deploy infra (AZ-104/305) and want to **automate delivery**.

**When it's NOT the right choice:**

- You don't know Git at all → learn the basics (`add`, `commit`, `branch`) first.
- You want only project-management theory → here it's **technical and hands-on**.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Expliquer la **culture DevOps** (CALMS) et le **CI/CD**.
- Jouer une **stratégie de branches** Git en vrai (fonctionnalité, fusion).
- Comparer **trunk-based** et **GitFlow**.
- Décrire le workflow **pull request** et les **stratégies de branche**.
- Écrire une **pipeline CI** en YAML GitHub Actions (déclencheurs, jobs, étapes).
- Distinguer **GitHub Actions** et **Azure Pipelines**.
- Choisir une **stratégie** et une **plateforme** selon l'équipe.
:::

:::lang en
By the end of this guide, you can:

- Explain the **DevOps culture** (CALMS) and **CI/CD**.
- Play a Git **branching strategy** for real (feature, merge).
- Compare **trunk-based** and **GitFlow**.
- Describe the **pull request** workflow and **branch policies**.
- Write a **CI pipeline** in GitHub Actions YAML (triggers, jobs, steps).
- Distinguish **GitHub Actions** and **Azure Pipelines**.
- Choose a **strategy** and a **platform** by team.
:::

## prerequisites

:::lang fr
- **Git** installé et les bases (`add`, `commit`, `branch`, `merge`).
- Un **terminal** ; **Python 3** (pour valider le YAML) — optionnel.
- **Aucun compte cloud requis** : Git est local, les pipelines se valident en local.
- Utile : un compte **GitHub** (gratuit) pour exécuter tes pipelines pour de vrai plus tard.
:::

:::lang en
- **Git** installed and the basics (`add`, `commit`, `branch`, `merge`).
- A **terminal**; **Python 3** (to validate YAML) — optional.
- **No cloud account required**: Git is local, pipelines are validated locally.
- Useful: a **GitHub** account (free) to run your pipelines for real later.
:::

## concepts

:::lang fr
**La culture DevOps (CALMS).** DevOps est d'abord **culturel**. Le modèle **CALMS** résume ses cinq piliers : **Culture** (collaboration Dev+Ops, responsabilité partagée), **Automation** (tout ce qui est répétable est automatisé), **Lean** (petits lots, flux continu, réduire le gaspillage), **Measurement** (mesurer pour améliorer — métriques DORA), **Sharing** (partage du savoir et des outils). Sans la culture, les outils ne suffisent pas.

**CI / CD.** Le cœur automatisé. **CI (Continuous Integration)** : à chaque commit, on **construit** et on **teste** automatiquement — les problèmes sont détectés tôt. **CD** a deux sens : **Continuous Delivery** (le code est **toujours prêt** à livrer, le déploiement en prod reste un clic manuel) et **Continuous Deployment** (chaque changement validé part **automatiquement** en prod). CI → CD, c'est la chaîne du commit à la production.

**Le contrôle de source (Git).** Toute la démarche part de **Git**. Une **stratégie de branches** organise le travail :

- **Trunk-based.** Une branche principale (`main`) toujours livrable ; des **branches de fonctionnalité** courtes, fusionnées vite. Simple, favorise le CI/CD — **la tendance moderne**.
- **GitFlow.** Des branches longues (`develop`, `release`, `hotfix`, `feature`). Structuré mais lourd ; adapté aux livraisons versionnées peu fréquentes.
- **Release flow / GitHub flow.** Variantes légères autour de `main` + branches courtes + tags de release.

**Pull requests & stratégies de branche.** On ne pousse pas directement sur `main` : on ouvre une **pull request** (PR) depuis sa branche. Une **stratégie de branche** (branch policy) protège `main` : exiger une **revue** (approbation), des **checks CI** verts, une branche **à jour**. C'est la porte de qualité — humaine + automatisée.

**L'anatomie d'une pipeline.** Un fichier YAML décrit : des **déclencheurs** (triggers — sur push, PR, tag), des **jobs** (unités parallélisables, sur un `runner`), des **étapes** (steps — commandes ou actions réutilisables), et des **dépendances** (`needs` — un job attend un autre). C'est identique en concept sur **GitHub Actions** et **Azure Pipelines**.

**GitHub Actions vs Azure Pipelines.** Deux moteurs CI/CD Microsoft. **GitHub Actions** : intégré à GitHub, écosystème d'**actions** réutilisables, workflows dans `.github/workflows/`. **Azure Pipelines** (Azure DevOps) : mature côté entreprise, agents auto-hébergés, intégration Azure Boards/Repos, `azure-pipelines.yml`. Même logique YAML ; le choix dépend de l'écosystème de l'équipe.

**Ce qui est live ici.** **Git** est **réel** : tu crées des branches, commits et fusions pour de vrai. Les **pipelines** s'écrivent en YAML et se **valident localement** (structure, syntaxe) — les **exécuter** demande un compte GitHub/Azure DevOps (gratuit), abordé plus loin dans le track. Pas besoin de cloud pour les **fondamentaux**.
:::

:::lang en
**The DevOps culture (CALMS).** DevOps is first **cultural**. The **CALMS** model sums up its five pillars: **Culture** (Dev+Ops collaboration, shared responsibility), **Automation** (everything repeatable is automated), **Lean** (small batches, continuous flow, reduce waste), **Measurement** (measure to improve — DORA metrics), **Sharing** (sharing knowledge and tools). Without the culture, tools aren't enough.

**CI / CD.** The automated core. **CI (Continuous Integration)**: on every commit, you **build** and **test** automatically — problems are caught early. **CD** has two meanings: **Continuous Delivery** (the code is **always ready** to ship, deploying to prod stays a manual click) and **Continuous Deployment** (every validated change goes to prod **automatically**). CI → CD is the chain from commit to production.

**Source control (Git).** The whole approach starts from **Git**. A **branching strategy** organizes the work:

- **Trunk-based.** One main branch (`main`) always shippable; **short feature branches**, merged quickly. Simple, favors CI/CD — **the modern trend**.
- **GitFlow.** Long-lived branches (`develop`, `release`, `hotfix`, `feature`). Structured but heavy; suited to infrequent versioned releases.
- **Release flow / GitHub flow.** Light variants around `main` + short branches + release tags.

**Pull requests & branch policies.** You don't push directly to `main`: you open a **pull request** (PR) from your branch. A **branch policy** protects `main`: require a **review** (approval), green **CI checks**, an **up-to-date** branch. It's the quality gate — human + automated.

**A pipeline's anatomy.** A YAML file describes: **triggers** (on push, PR, tag), **jobs** (parallelizable units, on a `runner`), **steps** (commands or reusable actions), and **dependencies** (`needs` — one job waits for another). It's conceptually identical on **GitHub Actions** and **Azure Pipelines**.

**GitHub Actions vs Azure Pipelines.** Two Microsoft CI/CD engines. **GitHub Actions**: integrated with GitHub, an ecosystem of reusable **actions**, workflows in `.github/workflows/`. **Azure Pipelines** (Azure DevOps): enterprise-mature, self-hosted agents, Azure Boards/Repos integration, `azure-pipelines.yml`. Same YAML logic; the choice depends on the team's ecosystem.

**What's live here.** **Git** is **real**: you create branches, commits and merges for real. **Pipelines** are written in YAML and **validated locally** (structure, syntax) — **running** them needs a GitHub/Azure DevOps account (free), covered later in the track. No cloud needed for the **fundamentals**.
:::

:::figure azure-devops-ci-cd
caption_fr: "Schéma 1. La chaîne DevOps : le développeur travaille sur une BRANCHE de fonctionnalité → PULL REQUEST (revue + checks CI) → fusion sur main → la PIPELINE (déclencheur → jobs → étapes) construit, teste (CI) puis livre/déploie (CD). Culture CALMS en socle, mesure en boucle de retour."
caption_en: "Figure 1. The DevOps chain: the developer works on a feature BRANCH → PULL REQUEST (review + CI checks) → merge to main → the PIPELINE (trigger → jobs → steps) builds, tests (CI) then delivers/deploys (CD). CALMS culture as the base, measurement as the feedback loop."
:::

## walkthrough

:::lang fr
On avance ainsi : culture & CI/CD → stratégie de branches (Git réel) → pull requests & stratégies de branche → première pipeline CI (YAML) → Azure Pipelines → grilles de choix → récap.
:::

:::lang en
We'll go like this: culture & CI/CD → branching strategy (real Git) → pull requests & branch policies → first CI pipeline (YAML) → Azure Pipelines → choice grids → recap.
:::

### step-01

:::lang fr
**Objectif.** Ancrer la **culture DevOps** (CALMS) et le **CI/CD**.

**🤔 D'abord la culture, ensuite les outils.** DevOps échoue si on achète des outils sans changer la **façon de travailler**. CALMS rappelle l'essentiel ; CI/CD en est le bras automatisé.

Grave CALMS et le CI/CD :
:::

:::lang en
**Goal.** Anchor the **DevOps culture** (CALMS) and **CI/CD**.

**🤔 Culture first, tools second.** DevOps fails if you buy tools without changing the **way of working**. CALMS recalls the essentials; CI/CD is its automated arm.

Engrave CALMS and CI/CD:
:::

```text
CALMS (culture DevOps)
  Culture       collaboration Dev+Ops, responsabilité partagée
  Automation    tout ce qui est répétable est automatisé
  Lean          petits lots, flux continu, moins de gaspillage
  Measurement   mesurer pour améliorer (métriques DORA)
  Sharing       partage du savoir et des outils

CI / CD
  CI                 à chaque commit -> build + tests automatiques (détecter tôt)
  Continuous Delivery code TOUJOURS prêt à livrer ; déploiement prod = clic manuel
  Continuous Deploy.  chaque changement validé -> prod AUTOMATIQUEMENT
```

:::lang fr
**✅ Vérification :** tu expliques **CALMS** et distingues **CI**, **Continuous Delivery** et **Continuous Deployment**. Réflexe : le CI attrape les erreurs **tôt** (à chaque commit) ; le CD raccourcit le délai du commit à la prod. ⚠️ Piège d'examen fréquent : **Delivery** (prêt à livrer, déclenchement manuel) ≠ **Deployment** (livraison **automatique** en prod). La différence tient au **dernier pas** vers la production : manuel ou automatique.
:::

:::lang en
**✅ Check:** you explain **CALMS** and distinguish **CI**, **Continuous Delivery** and **Continuous Deployment**. Reflex: CI catches errors **early** (every commit); CD shortens the commit-to-prod delay. ⚠️ Frequent exam trap: **Delivery** (ready to ship, manual trigger) ≠ **Deployment** (**automatic** release to prod). The difference is the **last step** to production: manual or automatic.
:::

### step-02

:::lang fr
**Objectif.** Jouer une **stratégie de branches** Git — en vrai.

**🤔 Isoler le travail.** On ne code pas sur `main`. On crée une **branche de fonctionnalité**, on y commit, puis on **fusionne** dans `main` (idéalement via une PR). Une fusion **`--no-ff`** garde une trace explicite de la fonctionnalité dans l'historique.

Joue une branche de fonctionnalité :
:::

:::lang en
**Goal.** Play a Git **branching strategy** — for real.

**🤔 Isolate the work.** You don't code on `main`. You create a **feature branch**, commit on it, then **merge** into `main` (ideally via a PR). A **`--no-ff`** merge keeps an explicit trace of the feature in the history.

Play a feature branch:
:::

```bash
mkdir demo-git && cd demo-git && git init
git config user.email "toi@exemple.fr" && git config user.name "Toi"
echo "v1" > app.txt && git add app.txt && git commit -m "init: app v1"

# Renommer la branche par défaut en main (convention moderne) / rename default branch to main
git branch -M main

# Branche de fonctionnalité / feature branch
git checkout -b feature/login
echo "login" >> app.txt && git commit -am "feat: ajout du login"

# Fusionner dans main avec une trace explicite / merge into main with an explicit trace
git checkout main
git merge --no-ff feature/login -m "merge: feature/login"
git log --oneline --graph
```

:::lang fr
**✅ Vérification :** `git log --oneline --graph` montre un **graphe de fusion** : le commit `merge: feature/login` réunit `main` et la branche, avec le commit `feat: ajout du login` visible sur sa branche. Tu viens de jouer le cycle **brancher → commiter → fusionner** — le cœur du travail en équipe. Retiens la **stratégie trunk-based** : `main` toujours livrable, branches **courtes**, fusions **fréquentes** — c'est ce qui rend le CI/CD fluide. ⚠️ Des branches **longues** accumulent des conflits ; garde-les courtes et fusionne souvent.
:::

:::lang en
**✅ Check:** `git log --oneline --graph` shows a **merge graph**: the `merge: feature/login` commit joins `main` and the branch, with the `feat: ajout du login` commit visible on its branch. You just played the **branch → commit → merge** cycle — the heart of teamwork. Remember the **trunk-based strategy**: `main` always shippable, **short** branches, **frequent** merges — that's what keeps CI/CD smooth. ⚠️ **Long** branches accumulate conflicts; keep them short and merge often.
:::

### step-03

:::lang fr
**Objectif.** Comprendre les **pull requests** et les **stratégies de branche**.

**🤔 La porte de qualité.** En équipe, on ne fusionne pas soi-même sur `main` : on ouvre une **pull request** (PR), quelqu'un **revoit**, les **checks CI** doivent être verts, puis on fusionne. Une **stratégie de branche** (branch policy) **impose** ces règles sur `main`.

Les règles typiques d'une stratégie de branche :
:::

:::lang en
**Goal.** Understand **pull requests** and **branch policies**.

**🤔 The quality gate.** On a team, you don't merge to `main` yourself: you open a **pull request** (PR), someone **reviews**, the **CI checks** must be green, then you merge. A **branch policy** **enforces** these rules on `main`.

The typical rules of a branch policy:
:::

```text
STRATÉGIE DE BRANCHE sur main / BRANCH POLICY on main
  Exiger une pull request         pas de push direct sur main
  Exiger N approbation(s)          revue par un pair (au moins 1)
  Exiger les checks CI verts       la pipeline doit passer (build + tests)
  Exiger la branche à jour          rebasée/mergée sur le dernier main
  Résoudre les commentaires         les remarques de revue traitées
  (option) exiger des commits signés  intégrité de l'auteur
```

:::lang fr
**✅ Vérification :** tu décris le **workflow PR** : brancher → pousser → **ouvrir une PR** → revue + CI → fusion. Et tu sais qu'une **stratégie de branche** **impose** ces règles (sur GitHub : « branch protection rules » ; sur Azure Repos : « branch policies »). C'est ce qui **empêche** un push cassé d'atteindre `main`. ⚠️ La combinaison **revue humaine + checks CI automatiques** est la porte de qualité DevOps : ni l'un ni l'autre seul ne suffit. La PR est aussi le lieu de la **traçabilité** (qui a changé quoi, pourquoi, validé par qui).
:::

:::lang en
**✅ Check:** you describe the **PR workflow**: branch → push → **open a PR** → review + CI → merge. And you know a **branch policy** **enforces** these rules (on GitHub: "branch protection rules"; on Azure Repos: "branch policies"). It's what **prevents** a broken push from reaching `main`. ⚠️ The combination **human review + automated CI checks** is the DevOps quality gate: neither alone is enough. The PR is also where **traceability** lives (who changed what, why, approved by whom).
:::

### step-04

:::lang fr
**Objectif.** Écrire une **première pipeline CI** — en YAML GitHub Actions.

**🤔 Automatiser la validation.** À chaque push/PR, une pipeline **construit** et **teste**. On la décrit dans `.github/workflows/ci.yml` : des **déclencheurs**, des **jobs**, des **étapes**, des **dépendances**. Ici, un job valide l'infra (Bicep/Terraform), un autre lance les tests **après** lui.

Crée `.github/workflows/ci.yml` :
:::

:::lang en
**Goal.** Write a **first CI pipeline** — in GitHub Actions YAML.

**🤔 Automate validation.** On every push/PR, a pipeline **builds** and **tests**. We describe it in `.github/workflows/ci.yml`: **triggers**, **jobs**, **steps**, **dependencies**. Here, one job validates the infra (Bicep/Terraform), another runs the tests **after** it.

Create `.github/workflows/ci.yml`:
:::

```yaml
name: CI

# Déclencheurs : push et PR sur main / triggers: push and PR on main
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  valider:
    name: Valider l'infrastructure
    runs-on: ubuntu-latest
    steps:
      - name: Récupérer le code
        uses: actions/checkout@v4
      - name: Installer Bicep
        run: az bicep install
      - name: Compiler les templates Bicep
        run: |
          for f in infra/*.bicep; do az bicep build --file "$f" --stdout > /dev/null; done
      - name: Vérifier le format Terraform
        run: terraform fmt -check -recursive infra/

  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: valider          # ne s'exécute qu'APRÈS 'valider' / runs only AFTER 'valider'
    steps:
      - uses: actions/checkout@v4
      - name: Lancer les tests
        run: echo "Exécuter la suite de tests ici"
```

```bash
# 1) Crée le dossier et le fichier (recopie le YAML ci-dessus) / create the folder and file (paste the YAML above)
mkdir -p .github/workflows
cat > .github/workflows/ci.yml <<'YAML'
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  valider:
    name: Valider l'infrastructure
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Installer Bicep
        run: az bicep install
      - name: Compiler les templates Bicep
        run: |
          for f in infra/*.bicep; do az bicep build --file "$f" --stdout > /dev/null; done
      - name: Vérifier le format Terraform
        run: terraform fmt -check -recursive infra/
  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: valider
    steps:
      - uses: actions/checkout@v4
      - name: Lancer les tests
        run: echo "Exécuter la suite de tests ici"
YAML

# 2) Valide la structure du YAML en local / validate the YAML structure locally
python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/ci.yml')); print('jobs:', list(d['jobs'].keys()))"
```

:::lang fr
**✅ Vérification :** la commande Python affiche `jobs: ['valider', 'test']` — ton YAML est **valide**. Décrypte-le : **`on`** = déclencheurs (push/PR sur `main`) ; **`jobs`** = deux unités ; **`steps`** = actions (`actions/checkout@v4`) ou commandes (`run`) ; **`needs: valider`** = `test` attend `valider` (dépendance). C'est **exactement** l'anatomie d'une pipeline. ⚠️ Cette pipeline **s'exécutera** sur GitHub à chaque push (dans un dépôt GitHub) ; ici on **valide** sa structure sans compte. L'`az bicep`/`terraform` s'exécutent sur le **runner** GitHub, pas sur ta machine.
:::

:::lang en
**✅ Check:** the Python command prints `jobs: ['valider', 'test']` — your YAML is **valid**. Decode it: **`on`** = triggers (push/PR on `main`); **`jobs`** = two units; **`steps`** = actions (`actions/checkout@v4`) or commands (`run`); **`needs: valider`** = `test` waits for `valider` (dependency). It's **exactly** a pipeline's anatomy. ⚠️ This pipeline **runs** on GitHub on every push (in a GitHub repo); here we **validate** its structure with no account. The `az bicep`/`terraform` run on the GitHub **runner**, not your machine.
:::

### step-05

:::lang fr
**Objectif.** Découvrir **Azure Pipelines** — l'alternative native d'Azure.

**🤔 Même logique, autre moteur.** Azure DevOps propose **Azure Pipelines** : même anatomie (déclencheurs, jobs, étapes) dans un `azure-pipelines.yml`. Différences : la syntaxe (`trigger`, `pool`, `steps`), les **agents** (Microsoft-hosted ou auto-hébergés), et l'intégration à Azure Boards/Repos.

La structure équivalente (Azure Pipelines) :
:::

:::lang en
**Goal.** Discover **Azure Pipelines** — Azure's native alternative.

**🤔 Same logic, another engine.** Azure DevOps offers **Azure Pipelines**: same anatomy (triggers, jobs, steps) in an `azure-pipelines.yml`. Differences: the syntax (`trigger`, `pool`, `steps`), the **agents** (Microsoft-hosted or self-hosted), and Azure Boards/Repos integration.

The equivalent structure (Azure Pipelines):
:::

```yaml
# azure-pipelines.yml — même logique, syntaxe Azure Pipelines
trigger:
  - main                      # déclencheur sur main / trigger on main

pool:
  vmImage: ubuntu-latest      # agent Microsoft-hosted

stages:
  - stage: Valider
    jobs:
      - job: Infra
        steps:
          - script: az bicep build --file infra/main.bicep --stdout
            displayName: Compiler Bicep
  - stage: Test
    dependsOn: Valider          # équivalent de 'needs' / equivalent of 'needs'
    jobs:
      - job: Tests
        steps:
          - script: echo "tests"
            displayName: Lancer les tests
```

:::lang fr
**✅ Vérification :** tu **reconnais** l'anatomie : `trigger` (= `on`), `pool`/`vmImage` (= `runs-on`), `stages` → `jobs` → `steps`, `dependsOn` (= `needs`). Même **logique** que GitHub Actions, syntaxe différente. Retiens la notion de **stages** (étapes de haut niveau : Valider → Test → Déployer) qu'Azure Pipelines met en avant — utile pour structurer un pipeline CI **et** CD. ⚠️ Le choix **GitHub Actions vs Azure Pipelines** dépend de l'**écosystème** : GitHub (code sur GitHub, actions communautaires) vs Azure DevOps (entreprise, Boards/Repos, agents auto-hébergés). Les deux sont Microsoft et pleinement supportés.
:::

:::lang en
**✅ Check:** you **recognize** the anatomy: `trigger` (= `on`), `pool`/`vmImage` (= `runs-on`), `stages` → `jobs` → `steps`, `dependsOn` (= `needs`). Same **logic** as GitHub Actions, different syntax. Remember the notion of **stages** (high-level steps: Validate → Test → Deploy) that Azure Pipelines emphasizes — useful to structure a CI **and** CD pipeline. ⚠️ The **GitHub Actions vs Azure Pipelines** choice depends on the **ecosystem**: GitHub (code on GitHub, community actions) vs Azure DevOps (enterprise, Boards/Repos, self-hosted agents). Both are Microsoft and fully supported.
:::

### step-06

:::lang fr
**Objectif.** Graver les **grilles de choix** — stratégie de branches & plateforme.

**🤔 Décider selon l'équipe.** Deux décisions DevOps courantes : la **stratégie de branches** et la **plateforme CI/CD**.

Les grilles :
:::

:::lang en
**Goal.** Engrave the **choice grids** — branching strategy & platform.

**🤔 Decide by the team.** Two common DevOps decisions: the **branching strategy** and the **CI/CD platform**.

The grids:
:::

```text
STRATÉGIE DE BRANCHES / BRANCHING STRATEGY
  Livraison continue, équipe fluide     -> Trunk-based (main + branches courtes)
  Releases versionnées peu fréquentes   -> GitFlow (develop/release/hotfix)
  Léger autour de main + tags           -> GitHub flow / Release flow

PLATEFORME CI/CD / CI-CD PLATFORM
  Code sur GitHub, actions communautaires -> GitHub Actions
  Entreprise, Boards/Repos, agents privés -> Azure Pipelines (Azure DevOps)
  (les deux : même logique YAML, choix par écosystème)

CI vs CD
  CI              build + tests à chaque commit
  Delivery        prêt à livrer, déclenchement manuel
  Deployment      livraison automatique en prod
```

:::lang fr
**✅ Vérification :** face à un contexte, tu **choisis** : « équipe qui livre plusieurs fois par jour » → **trunk-based** + **Continuous Deployment** ; « produit versionné trimestriel » → **GitFlow** + **Continuous Delivery** ; « code déjà sur GitHub » → **GitHub Actions** ; « entreprise avec Azure DevOps » → **Azure Pipelines**. C'est le type d'arbitrage de l'AZ-400. ⚠️ Justifie par la **cadence de livraison** et l'**écosystème** de l'équipe — il n'y a pas de « meilleure » stratégie dans l'absolu, seulement la mieux adaptée au contexte.
:::

:::lang en
**✅ Check:** faced with a context, you **choose**: "team shipping several times a day" → **trunk-based** + **Continuous Deployment**; "quarterly versioned product" → **GitFlow** + **Continuous Delivery**; "code already on GitHub" → **GitHub Actions**; "enterprise with Azure DevOps" → **Azure Pipelines**. It's the kind of AZ-400 tradeoff. ⚠️ Justify by the **release cadence** and the team's **ecosystem** — there's no "best" strategy in the absolute, only the one best suited to the context.
:::

### step-07

:::lang fr
**Objectif.** Récapituler et **versionner** ta pipeline.

**🤔 La pipeline vit dans le dépôt.** Le YAML de pipeline est **du code** : il se **commite** avec le reste. On l'ajoute au dépôt — désormais, chaque clone a la pipeline.

Versionne :
:::

:::lang en
**Goal.** Recap and **version** your pipeline.

**🤔 The pipeline lives in the repo.** The pipeline YAML is **code**: it's **committed** with the rest. We add it to the repo — now every clone has the pipeline.

Version it:
:::

```bash
# Tu es toujours dans demo-git ; le fichier .github/workflows/ci.yml existe déjà (step-04).
# You're still in demo-git; .github/workflows/ci.yml already exists (step-04).
git add .github/workflows/ci.yml
git commit -m "ci: ajout de la pipeline de validation"
git log --oneline
```

:::lang fr
**✅ Vérification :** `git log --oneline` montre ton commit `ci: ajout de la pipeline de validation` — la pipeline est **versionnée** avec le code (principe **pipeline-as-code**). Tu tiens maintenant les **fondamentaux DevOps** : la culture (CALMS), le CI/CD, une stratégie de branches Git jouée en vrai, le workflow PR + stratégies de branche, et une première pipeline CI en YAML. La suite du track AZ-400 : les **pipelines CI/CD en profondeur** (stages, artefacts, environnements, déploiement), l'**IaC dans les pipelines**, la **sécurité** (DevSecOps) et la **supervision**.
:::

:::lang en
**✅ Check:** `git log --oneline` shows your `ci: ajout de la pipeline de validation` commit — the pipeline is **versioned** with the code (**pipeline-as-code** principle). You now hold the **DevOps fundamentals**: the culture (CALMS), CI/CD, a Git branching strategy played for real, the PR workflow + branch policies, and a first CI pipeline in YAML. The AZ-400 track continues: **CI/CD pipelines in depth** (stages, artifacts, environments, deployment), **IaC in pipelines**, **security** (DevSecOps) and **monitoring**.
:::

## pitfalls

:::lang fr
**1. Croire que DevOps = des outils.** C'est d'abord une **culture** (CALMS). Les outils sans collaboration ni automatisation ne suffisent pas.

**2. Confondre Delivery et Deployment.** Delivery = prêt à livrer (clic manuel) ; Deployment = livraison **automatique**. Le dernier pas diffère.

**3. Branches trop longues.** Elles accumulent des conflits. Trunk-based : branches **courtes**, fusions **fréquentes**.

**4. Pousser directement sur main.** On passe par une **PR** avec revue + CI. Une **stratégie de branche** l'impose.

**5. Pipeline sans dépendances claires.** Sans `needs`/`dependsOn`, des jobs qui devraient s'enchaîner tournent en parallèle et masquent des erreurs.

**6. Pipeline hors du dépôt.** Le YAML est du **code** : versionne-le (`.github/workflows/` ou `azure-pipelines.yml`), ne le configure pas « à la main » dans l'UI.

**7. Choisir une stratégie sans contexte.** Trunk-based ≠ GitFlow selon la **cadence**. Justifie par l'équipe, pas par la mode.
:::

:::lang en
**1. Thinking DevOps = tools.** It's first a **culture** (CALMS). Tools without collaboration or automation aren't enough.

**2. Confusing Delivery and Deployment.** Delivery = ready to ship (manual click); Deployment = **automatic** release. The last step differs.

**3. Too-long branches.** They accumulate conflicts. Trunk-based: **short** branches, **frequent** merges.

**4. Pushing directly to main.** You go through a **PR** with review + CI. A **branch policy** enforces it.

**5. A pipeline with unclear dependencies.** Without `needs`/`dependsOn`, jobs that should chain run in parallel and hide errors.

**6. A pipeline outside the repo.** The YAML is **code**: version it (`.github/workflows/` or `azure-pipelines.yml`), don't configure it "by hand" in the UI.

**7. Choosing a strategy with no context.** Trunk-based ≠ GitFlow by the **cadence**. Justify by the team, not by fashion.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu expliques **CALMS** et distingues **CI / Delivery / Deployment**.
- [ ] Tu joues une **branche de fonctionnalité** et une **fusion** en vrai.
- [ ] Tu compares **trunk-based** et **GitFlow**.
- [ ] Tu décris le workflow **PR** + une **stratégie de branche**.
- [ ] Tu écris une **pipeline CI** en YAML (déclencheurs, jobs, étapes, `needs`).
- [ ] Tu reconnais l'anatomie sur **GitHub Actions** et **Azure Pipelines**.
- [ ] Tu choisis **stratégie** et **plateforme** selon l'équipe.

Sept cases = tu tiens les fondamentaux DevOps AZ-400. La suite : les **pipelines CI/CD**.
:::

:::lang en
You know it works when…

- [ ] You explain **CALMS** and distinguish **CI / Delivery / Deployment**.
- [ ] You play a **feature branch** and a **merge** for real.
- [ ] You compare **trunk-based** and **GitFlow**.
- [ ] You describe the **PR** workflow + a **branch policy**.
- [ ] You write a **CI pipeline** in YAML (triggers, jobs, steps, `needs`).
- [ ] You recognize the anatomy on **GitHub Actions** and **Azure Pipelines**.
- [ ] You choose **strategy** and **platform** by team.

Seven boxes = you hold AZ-400 DevOps fundamentals. Next up: **CI/CD pipelines**.
:::

## next

:::lang fr
Le track AZ-400 continue :

1. **Azure — pipelines CI/CD** : stages, artefacts, environnements, approbations, déploiement (Continuous Deployment) — en profondeur.
2. Plus loin : **IaC dans les pipelines**, **DevSecOps** (sécurité), **supervision**, puis le **projet DevOps**.
:::

:::lang en
The AZ-400 track continues:

1. **Azure — CI/CD pipelines**: stages, artifacts, environments, approvals, deployment (Continuous Deployment) — in depth.
2. Further along: **IaC in pipelines**, **DevSecOps** (security), **monitoring**, then the **DevOps project**.
:::

## cheatsheet

:::lang fr
Aide-mémoire DevOps fondamentaux.
:::

:::lang en
DevOps fundamentals cheat sheet.
:::

```bash
# Stratégie de branches (Git réel) / branching strategy (real Git)
git checkout -b feature/x           # brancher / branch
git commit -am "feat: ..."          # commiter / commit
git checkout main && git merge --no-ff feature/x   # fusionner / merge
git log --oneline --graph

# Valider une pipeline en local / validate a pipeline locally
python3 -c "import yaml; print(list(yaml.safe_load(open('.github/workflows/ci.yml'))['jobs']))"
```

```text
CALMS : Culture · Automation · Lean · Measurement · Sharing
CI/CD : CI(build+test) -> Delivery(prêt, manuel) / Deployment(auto en prod)
Branches : Trunk-based(moderne) · GitFlow(versionné) · GitHub flow(léger)
Pipeline : on/trigger -> jobs -> steps ; needs/dependsOn = dépendances
Plateforme : GitHub Actions (.github/workflows) · Azure Pipelines (azure-pipelines.yml)
```

## resources

:::lang fr
- [Qu'est-ce que DevOps ?](https://learn.microsoft.com/devops/what-is-devops) — culture et pratiques.
- [Stratégies de branches Git](https://learn.microsoft.com/azure/devops/repos/git/git-branching-guidance) — trunk-based, GitFlow.
- [GitHub Actions — documentation](https://docs.github.com/actions) — workflows, jobs, actions.
- [Azure Pipelines — documentation](https://learn.microsoft.com/azure/devops/pipelines/) — stages, agents.
- [Métriques DORA](https://learn.microsoft.com/azure/devops/report/dashboards/dora-metrics) — mesurer la performance DevOps.
:::

:::lang en
- [What is DevOps?](https://learn.microsoft.com/devops/what-is-devops) — culture and practices.
- [Git branching strategies](https://learn.microsoft.com/azure/devops/repos/git/git-branching-guidance) — trunk-based, GitFlow.
- [GitHub Actions — documentation](https://docs.github.com/actions) — workflows, jobs, actions.
- [Azure Pipelines — documentation](https://learn.microsoft.com/azure/devops/pipelines/) — stages, agents.
- [DORA metrics](https://learn.microsoft.com/azure/devops/report/dashboards/dora-metrics) — measuring DevOps performance.
:::

## troubleshooting

:::lang fr
**`git merge --no-ff` : « Already up to date ».** Tu es peut-être déjà sur la branche, ou la fusion est déjà faite. Vérifie `git branch` (l'astérisque = branche courante) et `git log`.

**`git checkout main` : « did not match ».** Ta branche par défaut s'appelle `master`. Renomme-la (`git branch -M main`) ou utilise `master`.

**Le YAML ne se valide pas (Python).** Vérifie l'**indentation** (YAML est sensible aux espaces, jamais de tabulations) et que `on:`/`jobs:` sont au bon niveau.

**Ma pipeline ne se déclenche pas (sur GitHub).** Le fichier doit être dans `.github/workflows/*.yml`, sur la branche, et les `branches:` du trigger doivent correspondre. Ici, on **valide** en local ; l'exécution réelle demande un dépôt GitHub.

**Trunk-based ou GitFlow ?** Livraison fréquente et fluide → **trunk-based**. Releases versionnées, hotfix structurés → **GitFlow**. La cadence décide.

**GitHub Actions ou Azure Pipelines ?** Même logique. Choisis par l'**écosystème** (GitHub vs Azure DevOps) de l'équipe.
:::

:::lang en
**`git merge --no-ff`: "Already up to date".** You may already be on the branch, or the merge is done. Check `git branch` (the asterisk = current branch) and `git log`.

**`git checkout main`: "did not match".** Your default branch is `master`. Rename it (`git branch -M main`) or use `master`.

**The YAML doesn't validate (Python).** Check the **indentation** (YAML is space-sensitive, never tabs) and that `on:`/`jobs:` are at the right level.

**My pipeline doesn't trigger (on GitHub).** The file must be in `.github/workflows/*.yml`, on the branch, and the trigger's `branches:` must match. Here, we **validate** locally; real execution needs a GitHub repo.

**Trunk-based or GitFlow?** Frequent, smooth delivery → **trunk-based**. Versioned releases, structured hotfixes → **GitFlow**. The cadence decides.

**GitHub Actions or Azure Pipelines?** Same logic. Choose by the team's **ecosystem** (GitHub vs Azure DevOps).
:::
