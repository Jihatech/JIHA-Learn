---
# — Identité (ne change JAMAIS une fois publié) —
id: cicd-github-actions
slug: cicd-github-actions
order: 6
status: published

# — Titres & accroches (bilingue) —
title_fr: "CI/CD avec GitHub Actions"
title_en: "CI/CD with GitHub Actions"
tagline_fr: "Automatiser build, tests et image Docker à chaque push."
tagline_en: "Automate build, tests and Docker image on every push."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 150
repo: "actions/checkout"
last_review: "2026-07-31"

# — Relations de parcours (par id) —
prerequisites: [git-fondamentaux, docker-fondamentaux]
next: [traefik]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [workflow-jobs-steps, runners, declencheurs-events, actions-marketplace, secrets-permissions, build-push-image, cache, act-local]
concepts_en: [workflow-jobs-steps, runners, event-triggers, marketplace-actions, secrets-permissions, build-push-image, caching, act-local]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Apprends la CI/CD avec GitHub Actions : workflows, tests automatisés, matrice de versions, cache, build et publication d'une image Docker sur GHCR, et exécution locale avec act."
og_description_en: "Learn CI/CD with GitHub Actions: workflows, automated tests, version matrix, caching, building and publishing a Docker image to GHCR, and running locally with act."
---

## intro

:::lang fr
La **CI/CD** (intégration et livraison continues) automatise ce que tu fais aujourd'hui à la main : lancer les tests, construire une image, la publier. À chaque `git push`, une machine neuve vérifie ton code **à ta place** — et te prévient avant que le bug n'atteigne la production.

**GitHub Actions** est le moteur de CI/CD intégré à GitHub. Son gros avantage pour apprendre : les **runners sont gratuits** (dans les limites du dépôt public / du quota), donc **aucun serveur à provisionner**. Tu écris un fichier YAML, tu pousses, ça tourne.

Ce guide construit une chaîne complète, de « faire tourner les tests » à « publier une image Docker », en réutilisant Git et Docker que tu connais déjà. Et pour rester fidèle à l'esprit « sur ta machine », on finit par exécuter tes workflows **en local** avec `act`.

**Pour qui c'est :** tu sais versionner avec Git et construire une image Docker, et tu veux automatiser la boucle test → build → publication.

**Quand ce n'est PAS le bon choix :**

- Tu ne maîtrises pas encore Git (branches, PR) ou Docker (image, Dockerfile) → repasse par ces guides d'abord, ce sont des prérequis durs.
- Tu cherches à **déployer sur un serveur** : c'est la suite logique, traitée dans le projet homelab (il faut un serveur, hors périmètre local de ce guide).
:::

:::lang en
**CI/CD** (continuous integration and delivery) automates what you do by hand today: run the tests, build an image, publish it. On every `git push`, a fresh machine checks your code **for you** — and warns you before the bug reaches production.

**GitHub Actions** is the CI/CD engine built into GitHub. Its big advantage for learning: the **runners are free** (within the public-repo / quota limits), so **no server to provision**. You write a YAML file, you push, it runs.

This guide builds a complete pipeline, from "run the tests" to "publish a Docker image", reusing the Git and Docker you already know. And to stay true to the "on your machine" spirit, we finish by running your workflows **locally** with `act`.

**Who it's for:** you can version with Git and build a Docker image, and you want to automate the test → build → publish loop.

**When it's NOT the right choice:**

- You're not comfortable with Git (branches, PRs) or Docker (image, Dockerfile) yet → go through those guides first, they're hard prerequisites.
- You're looking to **deploy to a server**: that's the logical next step, covered in the homelab project (it needs a server, outside this guide's local scope).
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- La structure d'un **workflow** : `jobs`, `steps`, `runners`, déclencheurs.
- Lancer des **tests automatisés** à chaque push et sur les pull requests.
- Utiliser des **actions** du marketplace (`checkout`, `setup-*`).
- Tester sur plusieurs versions avec une **matrice**.
- Accélérer avec le **cache** de dépendances.
- **Construire et publier** une image Docker sur GHCR (le registry de GitHub).
- Gérer **secrets** et **permissions** du jeton avec le moindre privilège.
- Exécuter tes workflows **en local** avec `act`.
:::

:::lang en
By the end of this guide, you'll know how to:

- Structure a **workflow**: `jobs`, `steps`, `runners`, triggers.
- Run **automated tests** on every push and on pull requests.
- Use marketplace **actions** (`checkout`, `setup-*`).
- Test across versions with a **matrix**.
- Speed things up with **dependency caching**.
- **Build and publish** a Docker image to GHCR (GitHub's registry).
- Handle **secrets** and token **permissions** with least privilege.
- Run your workflows **locally** with `act`.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides **Git & collaboration** et **Docker fondamentaux** acquis (prérequis durs).
- Un **compte GitHub** et `git` configuré sur ta machine.
- **Docker** installé en local (pour l'étape image et pour `act`).
- Un petit dépôt de travail. On part d'une mini-application Python à tester — crée un dossier vide, un dépôt Git, et pousse-le sur GitHub :
:::

:::lang en
You should have:

- The **Git & collaboration** and **Docker fundamentals** guides under your belt (hard prerequisites).
- A **GitHub account** and `git` configured on your machine.
- **Docker** installed locally (for the image step and for `act`).
- A small working repository. We start from a tiny Python app to test — create an empty folder, a Git repo, and push it to GitHub:
:::

```bash
mkdir ci-demo && cd ci-demo
git init -b main
# crée les fichiers ci-dessous, puis / create the files below, then:
# git add . && git commit -m "init" && git remote add origin git@github.com:<toi>/ci-demo.git && git push -u origin main
```

:::lang fr
Crée l'application `app.py` et son test `test_app.py` :
:::

:::lang en
Create the application `app.py` and its test `test_app.py`:
:::

```python
# app.py
def add(a, b):
    return a + b

if __name__ == "__main__":
    print(add(2, 3))
```

```python
# test_app.py
from app import add

def test_add():
    assert add(2, 3) == 5
```

## concepts

:::lang fr
Un **workflow** est un fichier YAML dans `.github/workflows/`. Il se déclenche sur un **événement** (`push`, `pull_request`, planification…) et contient un ou plusieurs **jobs**. Chaque job tourne sur un **runner** — une machine virtuelle neuve et jetable fournie par GitHub (`ubuntu-latest`) — et exécute une suite d'**steps**. Un step est soit une commande shell (`run:`), soit une **action** réutilisable du marketplace (`uses:`), comme `actions/checkout` qui récupère ton code.

Deux idées structurantes :

- **Les jobs sont isolés et parallèles** par défaut : chacun démarre sur une machine vierge. S'ils dépendent l'un de l'autre, on l'écrit explicitement (`needs:`).
- **Le runner ne sait rien de ton dépôt** tant que tu ne fais pas `checkout`. La première étape de presque tout job, c'est récupérer le code.

La **sécurité** repose sur deux leviers : les **secrets** (valeurs chiffrées, jamais en clair dans le YAML) et les **permissions** du jeton automatique `GITHUB_TOKEN`, qu'on réduit au strict nécessaire.
:::

:::lang en
A **workflow** is a YAML file in `.github/workflows/`. It triggers on an **event** (`push`, `pull_request`, schedule…) and contains one or more **jobs**. Each job runs on a **runner** — a fresh, disposable virtual machine provided by GitHub (`ubuntu-latest`) — and executes a series of **steps**. A step is either a shell command (`run:`) or a reusable marketplace **action** (`uses:`), like `actions/checkout` which fetches your code.

Two structuring ideas:

- **Jobs are isolated and parallel** by default: each starts on a blank machine. If they depend on each other, you say so explicitly (`needs:`).
- **The runner knows nothing about your repo** until you `checkout`. The first step of almost every job is fetching the code.

**Security** rests on two levers: **secrets** (encrypted values, never in clear text in the YAML) and the **permissions** of the automatic `GITHUB_TOKEN`, which you reduce to the strict minimum.
:::

:::figure cicd-pipeline
caption_fr: "Schéma 1. Un push déclenche le workflow : le runner récupère le code, teste, construit l'image, la publie."
caption_en: "Figure 1. A push triggers the workflow: the runner checks out the code, tests, builds the image, publishes it."
:::

:::lang fr
On construit la chaîne étape par étape : premier workflow → tests → pull requests → matrice → cache → image Docker → publication → exécution locale.
:::

:::lang en
We'll build the pipeline step by step: first workflow → tests → pull requests → matrix → cache → Docker image → publishing → local run.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Créer ton premier workflow et le voir s'exécuter.

**🤔 Pourquoi ce squelette ?** `on: push` déclenche à chaque envoi. Le job tourne sur `ubuntu-latest`. `actions/checkout@v4` récupère ton dépôt sur le runner — **on pinne la version** (`@v4`) pour ne pas subir un changement surprise, exactement comme un tag d'image Docker.

Crée `.github/workflows/ci.yml` :
:::

:::lang en
**Goal.** Create your first workflow and watch it run.

**🤔 Why this skeleton?** `on: push` triggers on every push. The job runs on `ubuntu-latest`. `actions/checkout@v4` fetches your repo onto the runner — **we pin the version** (`@v4`) so we don't suffer a surprise change, exactly like a Docker image tag.

Create `.github/workflows/ci.yml`:
:::

```yaml
name: CI
on: push

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Le code est là :" && ls -la
```

```bash
git add .github/workflows/ci.yml app.py test_app.py
git commit -m "ci: premier workflow"
git push
```

:::lang fr
**✅ Vérification :** sur GitHub, onglet **Actions** → ton workflow « CI » apparaît avec une pastille verte. Clique dessus : tu vois les logs du step, dont le `ls -la` qui liste `app.py` (donc le checkout a bien fonctionné).
:::

:::lang en
**✅ Check:** on GitHub, the **Actions** tab → your "CI" workflow appears with a green check. Click it: you see the step logs, including the `ls -la` listing `app.py` (so checkout worked).
:::

### step-02

:::lang fr
**Objectif.** Lancer les tests automatiquement.

**🤔 Pourquoi `setup-python` ?** Le runner est neuf : Python 3 y est présent, mais on **fixe une version précise** avec `actions/setup-python` pour un environnement reproductible. On installe `pytest`, puis on lance les tests. Si un test échoue, le step échoue, et tout le workflow passe au rouge — c'est exactement le but.
:::

:::lang en
**Goal.** Run the tests automatically.

**🤔 Why `setup-python`?** The runner is fresh: Python 3 is present, but we **pin a precise version** with `actions/setup-python` for a reproducible environment. We install `pytest`, then run the tests. If a test fails, the step fails, and the whole workflow goes red — which is exactly the point.
:::

```yaml
name: CI
on: push

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install pytest
      - run: pytest -v
```

:::lang fr
**✅ Vérification :** pousse, puis dans **Actions** le job `test` est vert et ses logs montrent `test_app.py::test_add PASSED`. Pour t'en convaincre, casse volontairement le test (`assert add(2, 3) == 6`), pousse : le workflow devient **rouge**. Remets la bonne valeur.
:::

:::lang en
**✅ Check:** push, then in **Actions** the `test` job is green and its logs show `test_app.py::test_add PASSED`. To convince yourself, deliberately break the test (`assert add(2, 3) == 6`), push: the workflow turns **red**. Restore the correct value.
:::

### step-03

:::lang fr
**Objectif.** Tester aussi les pull requests, et transformer la CI en garde-fou de fusion.

**🤔 Pourquoi sur les PR ?** L'intérêt de la CI, c'est d'attraper les régressions **avant** la fusion. En ajoutant `pull_request`, chaque PR affiche un check vert/rouge : tu peux ensuite exiger qu'il soit vert pour merger (branch protection).
:::

:::lang en
**Goal.** Also test pull requests, and turn CI into a merge guardrail.

**🤔 Why on PRs?** The whole point of CI is to catch regressions **before** merge. By adding `pull_request`, each PR shows a green/red check: you can then require it to be green to merge (branch protection).
:::

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

:::lang fr
**✅ Vérification :** crée une branche, modifie un fichier, ouvre une PR. Dans la PR, une section « Checks » affiche l'exécution de `test`. *(Pour rendre le check obligatoire : Settings → Branches → règle de protection sur `main` → « Require status checks ».)*
:::

:::lang en
**✅ Check:** create a branch, change a file, open a PR. In the PR, a "Checks" section shows the `test` run. *(To make the check mandatory: Settings → Branches → protection rule on `main` → "Require status checks".)*
:::

### step-04

:::lang fr
**Objectif.** Tester sur plusieurs versions de Python d'un coup, avec une **matrice**.

**🤔 Pourquoi une matrice ?** Ton code doit peut-être marcher sur plusieurs versions. La matrice **duplique le job** pour chaque valeur, en parallèle, sans copier-coller. `${{ matrix.python }}` injecte la valeur courante.
:::

:::lang en
**Goal.** Test across several Python versions at once, with a **matrix**.

**🤔 Why a matrix?** Your code may need to work on multiple versions. The matrix **duplicates the job** for each value, in parallel, with no copy-paste. `${{ matrix.python }}` injects the current value.
:::

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python: ["3.11", "3.12", "3.13"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python }}
      - run: pip install pytest
      - run: pytest -v
```

:::lang fr
**✅ Vérification :** dans **Actions**, le job `test` apparaît en **trois exécutions** (`test (3.11)`, `test (3.12)`, `test (3.13)`), toutes vertes, lancées en parallèle.
:::

:::lang en
**✅ Check:** in **Actions**, the `test` job appears as **three runs** (`test (3.11)`, `test (3.12)`, `test (3.13)`), all green, launched in parallel.
:::

### step-05

:::lang fr
**Objectif.** Accélérer les exécutions en mettant les dépendances en cache.

**🤔 Pourquoi le cache ?** Réinstaller les dépendances à chaque exécution est lent. `setup-python` sait mettre en cache le dossier `pip` : la clé du cache dépend du fichier de dépendances, donc il n'est réutilisé que tant que celui-ci ne change pas. Créons un vrai `requirements.txt` :
:::

:::lang en
**Goal.** Speed up runs by caching dependencies.

**🤔 Why caching?** Reinstalling dependencies on every run is slow. `setup-python` can cache the `pip` folder: the cache key depends on the requirements file, so it's reused only as long as that file doesn't change. Let's create a real `requirements.txt`:
:::

```text
pytest==8.3.2
```

```yaml
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python }}
          cache: pip
      - run: pip install -r requirements.txt
      - run: pytest -v
```

:::lang fr
**✅ Vérification :** à la **deuxième** exécution (sans avoir modifié `requirements.txt`), le step de setup affiche « Cache restored » et l'installation est quasi instantanée.
:::

:::lang en
**✅ Check:** on the **second** run (without changing `requirements.txt`), the setup step shows "Cache restored" and installation is near-instant.
:::

### step-06

:::lang fr
**Objectif.** Construire une image Docker de l'application dans la CI.

**🤔 Pourquoi un job séparé ?** Construire l'image n'a de sens que si les tests passent : on crée un job `build` qui **dépend** du job `test` via `needs: test`. Il ne se lancera pas si les tests sont rouges. Ajoute d'abord un `Dockerfile` minimal :
:::

:::lang en
**Goal.** Build a Docker image of the application in CI.

**🤔 Why a separate job?** Building the image only makes sense if the tests pass: we create a `build` job that **depends** on the `test` job via `needs: test`. It won't run if tests are red. First add a minimal `Dockerfile`:
:::

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY . .
CMD ["python", "app.py"]
```

```yaml
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t ci-demo:${{ github.sha }} .
```

:::lang fr
**✅ Vérification :** dans le graphe du workflow, `build` s'affiche **après** `test` (relié par une flèche) et ses logs montrent les couches Docker se construire. `${{ github.sha }}` tague l'image avec le hash du commit — traçable et unique.
:::

:::lang en
**✅ Check:** in the workflow graph, `build` appears **after** `test` (linked by an arrow) and its logs show the Docker layers building. `${{ github.sha }}` tags the image with the commit hash — traceable and unique.
:::

### step-07

:::lang fr
**Objectif.** Publier l'image sur **GHCR** (GitHub Container Registry).

**🤔 Pourquoi `GITHUB_TOKEN` et `permissions` ?** GitHub fournit à chaque workflow un jeton temporaire (`GITHUB_TOKEN`) — **pas besoin de créer un secret manuellement**. Par défaut il est en lecture seule ; on lui accorde explicitement le droit d'écrire des paquets (`packages: write`), et **rien de plus** (moindre privilège). On se connecte au registry, puis on pousse.
:::

:::lang en
**Goal.** Publish the image to **GHCR** (GitHub Container Registry).

**🤔 Why `GITHUB_TOKEN` and `permissions`?** GitHub gives each workflow a temporary token (`GITHUB_TOKEN`) — **no need to create a secret manually**. By default it's read-only; we explicitly grant it the right to write packages (`packages: write`), and **nothing more** (least privilege). We log in to the registry, then push.
:::

```yaml
  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Login GHCR
        run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
      - name: Build & push
        run: |
          IMAGE=ghcr.io/${{ github.repository }}:${{ github.sha }}
          docker build -t "$IMAGE" .
          docker push "$IMAGE"
```

:::lang fr
**✅ Vérification :** après exécution, va sur la page de ton dépôt → **Packages** : l'image `ci-demo` y apparaît, taguée avec le hash du commit. *(Si le push échoue en « denied », vérifie le bloc `permissions: packages: write`.)*

⚠️ **Ne mets jamais un secret en clair** dans le YAML ni dans un `echo`. Les secrets passent **uniquement** par `${{ secrets.* }}` ; GitHub les masque dans les logs. Ici on utilise `--password-stdin` pour ne pas exposer le jeton en argument de commande.
:::

:::lang en
**✅ Check:** after the run, go to your repo page → **Packages**: the `ci-demo` image appears, tagged with the commit hash. *(If the push fails with "denied", check the `permissions: packages: write` block.)*

⚠️ **Never put a secret in clear text** in the YAML or in an `echo`. Secrets pass **only** through `${{ secrets.* }}`; GitHub masks them in logs. Here we use `--password-stdin` to avoid exposing the token as a command argument.
:::

### step-08

:::lang fr
**Objectif.** Exécuter tes workflows **en local**, sans pousser, avec `act`.

**🤔 Pourquoi `act` ?** Itérer en poussant à chaque essai est lent et pollue l'historique. `act` rejoue tes workflows **sur ta machine** dans des conteneurs Docker — la boucle de feedback passe de minutes à secondes. C'est le pont « sur ta propre machine » de ce guide.
:::

:::lang en
**Goal.** Run your workflows **locally**, without pushing, using `act`.

**🤔 Why `act`?** Iterating by pushing on every attempt is slow and pollutes history. `act` replays your workflows **on your machine** in Docker containers — the feedback loop goes from minutes to seconds. It's this guide's "on your own machine" bridge.
:::

```bash
# Installe act (voir la doc pour ton OS) / install act (see docs for your OS)
# ex. / e.g.: curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
act -l                 # liste les workflows détectés / list detected workflows
act push -j test       # exécute le job "test" localement / run the "test" job locally
```

:::lang fr
**✅ Vérification :** `act push -j test` télécharge une image de runner, exécute tes steps dans un conteneur, et affiche `test_app.py::test_add PASSED` — **sans aucun push**. *(Le job `build` qui pousse sur GHCR n'est pas fait pour tourner en local : `act` sert surtout à valider tests et logique de workflow.)*
:::

:::lang en
**✅ Check:** `act push -j test` downloads a runner image, executes your steps in a container, and prints `test_app.py::test_add PASSED` — **with no push at all**. *(The `build` job that pushes to GHCR isn't meant to run locally: `act` is mainly for validating tests and workflow logic.)*
:::

## pitfalls

:::lang fr
**1. Secrets dans les logs.** Un `echo "$MA_CLE"`, une variable non déclarée comme secret, et ta clé fuite dans les logs publics. N'expose jamais un secret ; passe par `${{ secrets.* }}` et `--password-stdin`.

**2. Actions non pinnées.** `uses: actions/checkout@main` peut changer sous tes pieds. Pinne un tag (`@v4`) — et pour les actions tierces sensibles, un SHA de commit.

**3. Permissions trop larges.** Ne laisse pas `GITHUB_TOKEN` en écriture partout. Déclare `permissions:` au niveau du job, au strict nécessaire (souvent `contents: read`).

**4. `pull_request_target` avec du code non fiable.** Ce déclencheur donne accès aux secrets à des PR venues de forks — un vecteur d'attaque classique. Tiens-t'en à `pull_request` sauf besoin précis et maîtrisé.

**5. Tout mettre dans un seul job géant.** Sépare `test` et `build` (via `needs:`) : c'est plus lisible, ça parallélise, et ça évite de construire une image quand les tests échouent.

**6. Ignorer le coût / les minutes.** Les runners gratuits ont un quota. Une matrice de 12 versions × 5 OS qui tourne à chaque commit, ça se paie : reste raisonnable.
:::

:::lang en
**1. Secrets in logs.** An `echo "$MY_KEY"`, a variable not declared as a secret, and your key leaks into public logs. Never expose a secret; go through `${{ secrets.* }}` and `--password-stdin`.

**2. Unpinned actions.** `uses: actions/checkout@main` can change under your feet. Pin a tag (`@v4`) — and for sensitive third-party actions, a commit SHA.

**3. Over-broad permissions.** Don't leave `GITHUB_TOKEN` writable everywhere. Declare `permissions:` at the job level, to the strict minimum (often `contents: read`).

**4. `pull_request_target` with untrusted code.** This trigger gives secret access to PRs from forks — a classic attack vector. Stick to `pull_request` unless you have a precise, controlled need.

**5. Cramming everything into one giant job.** Split `test` and `build` (via `needs:`): it's more readable, it parallelizes, and it avoids building an image when tests fail.

**6. Ignoring cost / minutes.** Free runners have a quota. A matrix of 12 versions × 5 OSes running on every commit adds up: stay reasonable.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu lis et écris un workflow (`jobs`, `steps`, `uses`, `run`) sans modèle sous les yeux.
- [ ] Tes tests tournent à chaque push **et** sur les PR, et un échec passe le workflow au rouge.
- [ ] Tu sais paralléliser avec une **matrice** et accélérer avec le **cache**.
- [ ] Tu construis une image Docker conditionnée à la réussite des tests (`needs:`).
- [ ] Tu publies sur GHCR avec `GITHUB_TOKEN` et des `permissions` minimales.
- [ ] Tu itères en local avec `act` sans polluer ton historique.

Six cases cochées = tu automatises la boucle test → build → publication comme en entreprise. Bravo.
:::

:::lang en
You know it works when…

- [ ] You read and write a workflow (`jobs`, `steps`, `uses`, `run`) without a template in front of you.
- [ ] Your tests run on every push **and** on PRs, and a failure turns the workflow red.
- [ ] You can parallelize with a **matrix** and speed up with the **cache**.
- [ ] You build a Docker image gated on passing tests (`needs:`).
- [ ] You publish to GHCR with `GITHUB_TOKEN` and minimal `permissions`.
- [ ] You iterate locally with `act` without polluting your history.

Six boxes ticked = you automate the test → build → publish loop like in a real company. Well done.
:::

## next

:::lang fr
La suite logique :

1. **Traefik** — un reverse proxy pour exposer proprement les services que tu déploieras ensuite.
2. Plus loin dans le parcours : **automatiser un serveur** (Ansible) et **provisionner l'infra** (Terraform), puis le **projet homelab** où la CI/CD déclenche un vrai déploiement.
:::

:::lang en
The logical next steps:

1. **Traefik** — a reverse proxy to cleanly expose the services you'll deploy next.
2. Further along the track: **automating a server** (Ansible) and **provisioning infrastructure** (Terraform), then the **homelab project** where CI/CD triggers a real deployment.
:::

## cheatsheet

:::lang fr
Aide-mémoire d'un workflow GitHub Actions.
:::

:::lang en
GitHub Actions workflow cheat sheet.
:::

```yaml
name: CI
on:                               # déclencheurs / triggers
  push: { branches: [main] }
  pull_request: { branches: [main] }

permissions:                      # moindre privilège / least privilege
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix: { python: ["3.12", "3.13"] }   # matrice / matrix
    steps:
      - uses: actions/checkout@v4                      # récupère le code / checkout
      - uses: actions/setup-python@v5
        with: { python-version: "${{ matrix.python }}", cache: pip }
      - run: pip install -r requirements.txt
      - run: pytest -v

  build:
    needs: test                    # ne tourne que si test est vert / only if test is green
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
      - run: |
          IMAGE=ghcr.io/${{ github.repository }}:${{ github.sha }}
          docker build -t "$IMAGE" . && docker push "$IMAGE"
```

```bash
act -l            # lister / list           act push -j test   # exécuter en local / run locally
```

## resources

:::lang fr
- [Documentation GitHub Actions](https://docs.github.com/actions) — la référence.
- [Marketplace des actions](https://github.com/marketplace?type=actions) — briques réutilisables.
- [act (nektos/act)](https://github.com/nektos/act) — exécuter les workflows en local.
- [Sécuriser vos workflows](https://docs.github.com/actions/security-guides/security-hardening-for-github-actions) — secrets, permissions, bonnes pratiques.
:::

:::lang en
- [GitHub Actions documentation](https://docs.github.com/actions) — the reference.
- [Actions marketplace](https://github.com/marketplace?type=actions) — reusable building blocks.
- [act (nektos/act)](https://github.com/nektos/act) — run workflows locally.
- [Securing your workflows](https://docs.github.com/actions/security-guides/security-hardening-for-github-actions) — secrets, permissions, best practices.
:::

## troubleshooting

:::lang fr
**Le workflow ne se déclenche pas.** Vérifie le chemin (`.github/workflows/*.yml`), l'indentation YAML (2 espaces, jamais de tabulations), et que le déclencheur (`on:`) correspond à ton action (push sur la bonne branche ?).

**« denied » / « permission_denied » au push GHCR.** Il manque `permissions: packages: write` au job, ou tu pousses vers un mauvais chemin (`ghcr.io/<owner>/<repo>`). Le premier push crée le package en privé — rends-le public dans ses réglages si besoin.

**Un secret apparaît vide.** Un secret de dépôt n'est pas disponible pour les PR issues de forks (par sécurité). Vérifie aussi l'orthographe et l'endroit où tu l'as défini (Settings → Secrets and variables → Actions).

**`act` échoue au démarrage.** `act` a besoin de Docker en marche. Vérifie `docker ps`. Certaines actions supposent des outils absents de l'image de runner locale par défaut : utilise une image plus complète (`act -P ubuntu-latest=catthehacker/ubuntu:act-latest`).

**Erreur YAML « mapping values are not allowed ».** Presque toujours une indentation ou un `:` mal placé. Colle ton fichier dans un validateur YAML.
:::

:::lang en
**The workflow doesn't trigger.** Check the path (`.github/workflows/*.yml`), the YAML indentation (2 spaces, never tabs), and that the trigger (`on:`) matches your action (push on the right branch?).

**"denied" / "permission_denied" on GHCR push.** The job is missing `permissions: packages: write`, or you're pushing to a wrong path (`ghcr.io/<owner>/<repo>`). The first push creates the package as private — make it public in its settings if needed.

**A secret shows up empty.** A repo secret isn't available to PRs from forks (by design). Also check the spelling and where you defined it (Settings → Secrets and variables → Actions).

**`act` fails to start.** `act` needs Docker running. Check `docker ps`. Some actions assume tools missing from the default local runner image: use a fuller image (`act -P ubuntu-latest=catthehacker/ubuntu:act-latest`).

**YAML error "mapping values are not allowed".** Almost always a misplaced indentation or `:`. Paste your file into a YAML validator.
:::
