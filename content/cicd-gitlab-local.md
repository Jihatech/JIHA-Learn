---
# — Identité (ne change JAMAIS une fois publié) —
id: cicd-gitlab-local
slug: cicd-gitlab-local
order: 19.5
status: published

# — Titres & accroches (bilingue) —
title_fr: "GitLab CI en local — tes pipelines sans serveur distant"
title_en: "GitLab CI locally — your pipelines with no remote server"
tagline_fr: "Exécute un .gitlab-ci.yml sur ta machine avec gitlab-ci-local, sans compte ni runner hébergé."
tagline_en: "Run a .gitlab-ci.yml on your machine with gitlab-ci-local, no account or hosted runner."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 75
repo: "firecow/gitlab-ci-local"
last_review: "2026-10-03"

# — Relations de parcours (par id) —
prerequisites: [cicd-github-actions]
next: [ansible-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [gitlab-ci, pipeline, stages, jobs, artifacts, services, runner-local, feedback-rapide]
concepts_en: [gitlab-ci, pipeline, stages, jobs, artifacts, services, local-runner, fast-feedback]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Apprends GitLab CI sans serveur GitLab ni compte : avec gitlab-ci-local, tu exécutes ton .gitlab-ci.yml directement sur ta machine (dans Docker), tu itères en secondes au lieu de pousser à chaque essai, puis tu comprends comment passer à un vrai GitLab + runner."
og_description_en: "Learn GitLab CI with no GitLab server or account: with gitlab-ci-local you run your .gitlab-ci.yml right on your machine (in Docker), iterate in seconds instead of pushing on every try, then learn how to move to a real GitLab + runner."
---

## intro

:::lang fr
La boucle classique pour apprendre GitLab CI est pénible : tu édites `.gitlab-ci.yml`, tu `git push`, tu attends le runner, tu lis les logs, tu recommences. Chaque essai coûte un commit et une minute d'attente — et il te faut un compte GitLab et un runner.

**gitlab-ci-local** casse cette boucle : c'est un outil qui lit ton `.gitlab-ci.yml` et exécute les jobs **directement sur ta machine**, dans Docker, **sans serveur GitLab ni push**. Tu vois le résultat en secondes, tu corriges, tu relances. C'est l'équivalent « local » du pipeline, parfait pour apprendre et pour mettre au point un `.gitlab-ci.yml` avant de le confier à un vrai GitLab.

Dans ce guide, tu écris un pipeline multi-étapes (build → test), tu l'exécutes en local, tu ajoutes des **artifacts** et un **service** (une base de données), puis tu vois comment **basculer vers un vrai GitLab** quand tu en auras besoin.

**Pour qui c'est :** tu connais les bases d'un pipeline CI (vu avec GitHub Actions) et tu veux apprendre la syntaxe GitLab CI sans dépendre d'un serveur.

**Quand ce n'est PAS le bon choix :**

- Tu veux les fonctions **serveur** de GitLab (merge request pipelines, environnements, `rules` dépendant de l'état du dépôt distant, registry) : le local couvre l'exécution des jobs, pas toute la plateforme.
- Tu dois **déclencher automatiquement** sur push/MR : ça, c'est le rôle d'un vrai GitLab + runner (dernière étape).
:::

:::lang en
The classic loop to learn GitLab CI is painful: you edit `.gitlab-ci.yml`, `git push`, wait for the runner, read logs, repeat. Each try costs a commit and a minute of waiting — and you need a GitLab account and a runner.

**gitlab-ci-local** breaks that loop: it's a tool that reads your `.gitlab-ci.yml` and runs the jobs **right on your machine**, in Docker, **with no GitLab server or push**. You see the result in seconds, fix, re-run. It's the "local" equivalent of the pipeline, perfect to learn and to debug a `.gitlab-ci.yml` before handing it to a real GitLab.

In this guide you'll write a multi-stage pipeline (build → test), run it locally, add **artifacts** and a **service** (a database), then see how to **switch to a real GitLab** when you need it.

**Who it's for:** you know CI pipeline basics (seen with GitHub Actions) and want to learn GitLab CI syntax without depending on a server.

**When it's NOT the right choice:**

- You want GitLab's **server** features (merge request pipelines, environments, `rules` depending on remote repo state, registry): local covers job execution, not the whole platform.
- You need to **trigger automatically** on push/MR: that's a real GitLab + runner's job (last step).
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Écrire un `.gitlab-ci.yml` avec **stages**, **jobs**, image et `script`.
- Exécuter le pipeline **en local** avec `gitlab-ci-local` (dans Docker), sans push.
- Passer des **artifacts** d'un job à l'autre et contrôler l'ordre avec `needs`.
- Attacher un **service** (ex. PostgreSQL) et des **variables** à un job.
- Savoir **basculer vers un vrai GitLab** (runner) quand le déclenchement automatique devient nécessaire.
:::

:::lang en
By the end of this guide, you'll know how to:

- Write a `.gitlab-ci.yml` with **stages**, **jobs**, image and `script`.
- Run the pipeline **locally** with `gitlab-ci-local` (in Docker), no push.
- Pass **artifacts** between jobs and control order with `needs`.
- Attach a **service** (e.g. PostgreSQL) and **variables** to a job.
- Know how to **switch to a real GitLab** (runner) when automatic triggering becomes necessary.
:::

## prerequisites

:::lang fr
- **Docker** installé et fonctionnel (`docker run hello-world` passe).
- **Node.js** ≥ 18 (pour lancer `gitlab-ci-local` via `npx`).
- Les **bases d'un pipeline CI** : stages, jobs, un runner qui exécute des scripts (vu dans le guide GitHub Actions).
:::

:::lang en
- **Docker** installed and working (`docker run hello-world` passes).
- **Node.js** ≥ 18 (to run `gitlab-ci-local` via `npx`).
- **CI pipeline basics**: stages, jobs, a runner that executes scripts (seen in the GitHub Actions guide).
:::

## concepts

:::lang fr
Un pipeline GitLab CI est décrit dans un seul fichier à la racine : **`.gitlab-ci.yml`**. Il définit des **jobs** ; chaque job appartient à un **stage** (étape). Les jobs d'un même stage tournent en parallèle ; les stages s'enchaînent dans l'ordre déclaré. Chaque job s'exécute dans une **image** Docker et lance une liste de commandes (`script`).

Sur un vrai GitLab, c'est un **runner** (un agent) qui exécute ces jobs, déclenché par un `push` ou une merge request. **gitlab-ci-local** joue ce rôle de runner… sur ta machine : il lit le même `.gitlab-ci.yml`, crée les conteneurs Docker, exécute les scripts, et te rend les logs — **sans serveur, sans push, sans compte**. Le fichier que tu mets au point en local est **exactement** celui que GitLab exécutera plus tard.

Idée-clé : tu sépares l'**apprentissage/mise au point** (rapide, local, gratuit) du **déclenchement en prod** (push → runner GitLab). Le `.gitlab-ci.yml` est identique dans les deux cas.
:::

:::lang en
A GitLab CI pipeline is described in a single file at the repo root: **`.gitlab-ci.yml`**. It defines **jobs**; each job belongs to a **stage**. Jobs in the same stage run in parallel; stages run in the declared order. Each job runs in a Docker **image** and runs a list of commands (`script`).

On a real GitLab, a **runner** (an agent) executes those jobs, triggered by a `push` or merge request. **gitlab-ci-local** plays that runner role… on your machine: it reads the same `.gitlab-ci.yml`, creates the Docker containers, runs the scripts, and gives you the logs — **no server, no push, no account**. The file you tune locally is **exactly** the one GitLab will run later.

Key idea: you separate **learning/debugging** (fast, local, free) from **production triggering** (push → GitLab runner). The `.gitlab-ci.yml` is identical in both cases.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Écrire un premier pipeline minimal à deux étapes.

Crée un dossier de travail avec un petit projet (ici un `package.json` bidon suffit) et ce `.gitlab-ci.yml` à la racine.
:::

:::lang en
**Goal.** Write a first minimal two-stage pipeline.

Create a working folder with a tiny project (a dummy `package.json` is enough here) and this `.gitlab-ci.yml` at the root.
:::

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test

default:
  image: node:20-alpine        # image par défaut de tous les jobs / default image for all jobs

build:
  stage: build
  script:
    - echo "Compilation…"
    - node -e "console.log('build ok')"

test:
  stage: test
  script:
    - echo "Tests…"
    - node -e "process.exit(0)"   # 0 = succès / 0 = success
```

:::lang fr
**✅ Vérification :** le fichier est valide YAML et déclare deux stages (`build`, puis `test`) avec un job chacun. Rien ne s'exécute encore — on lance au step suivant.
:::

:::lang en
**✅ Check:** the file is valid YAML and declares two stages (`build`, then `test`) with one job each. Nothing runs yet — we execute it in the next step.
:::

### step-02

:::lang fr
**Objectif.** Exécuter le pipeline **en local**, sans push.

`gitlab-ci-local` lit le `.gitlab-ci.yml` du dossier courant et lance chaque job dans Docker. On l'appelle via `npx` (pas d'installation globale nécessaire).
:::

:::lang en
**Goal.** Run the pipeline **locally**, no push.

`gitlab-ci-local` reads the current folder's `.gitlab-ci.yml` and runs each job in Docker. We call it via `npx` (no global install needed).
:::

```bash
npx gitlab-ci-local --list     # liste les jobs détectés / list detected jobs
npx gitlab-ci-local            # exécute tout le pipeline en local / run the whole pipeline locally
```

:::lang fr
**✅ Vérification :** la sortie affiche `build` puis `test` en `pass` (vert), avec le `echo` de chaque job. Tu viens d'exécuter un pipeline GitLab CI **sans serveur GitLab ni commit**.

> Astuce : pour relancer un seul job, `npx gitlab-ci-local test`.
:::

:::lang en
**✅ Check:** the output shows `build` then `test` as `pass` (green), with each job's `echo`. You just ran a GitLab CI pipeline **with no GitLab server and no commit**.

> Tip: to re-run a single job, `npx gitlab-ci-local test`.
:::

### step-03

:::lang fr
**Objectif.** Produire un **artifact** au build et le réutiliser au test, avec un ordre explicite (`needs`).

Un artifact est un fichier qu'un job produit et qu'un autre récupère. Modifie le pipeline :
:::

:::lang en
**Goal.** Produce an **artifact** in build and reuse it in test, with explicit ordering (`needs`).

An artifact is a file one job produces and another picks up. Edit the pipeline:
:::

```yaml
build:
  stage: build
  script:
    - mkdir -p dist
    - echo "v=$(date +%s)" > dist/build.txt   # un fichier généré / a generated file
  artifacts:
    paths:
      - dist/

test:
  stage: test
  needs: [build]                 # récupère l'artifact de build / pulls build's artifact
  script:
    - cat dist/build.txt         # disponible grâce à l'artifact / available thanks to the artifact
    - test -f dist/build.txt
```

```bash
npx gitlab-ci-local
```

:::lang fr
**✅ Vérification :** le job `test` affiche le contenu de `dist/build.txt` produit par `build`. L'artifact a bien transité d'un job à l'autre, en local.
:::

:::lang en
**✅ Check:** the `test` job prints the content of `dist/build.txt` produced by `build`. The artifact correctly traveled from one job to the other, locally.
:::

### step-04

:::lang fr
**Objectif.** Attacher un **service** (une base de données) et des **variables** à un job — comme pour tester une vraie app.

Un `service` est un conteneur annexe démarré à côté du job (ici PostgreSQL). Le job peut l'atteindre par son nom d'hôte.
:::

:::lang en
**Goal.** Attach a **service** (a database) and **variables** to a job — like testing a real app.

A `service` is a side container started next to the job (here PostgreSQL). The job can reach it by its hostname.
:::

```yaml
integration:
  stage: test
  image: postgres:16-alpine
  services:
    - name: postgres:16-alpine
      alias: db                  # joignable via l'hôte "db" / reachable via host "db"
  variables:
    POSTGRES_PASSWORD: secret
    PGPASSWORD: secret
  script:
    - until pg_isready -h db -U postgres; do sleep 1; done
    - psql -h db -U postgres -c "SELECT 'db ok' AS status;"
```

```bash
npx gitlab-ci-local integration
```

:::lang fr
**✅ Vérification :** le job attend que Postgres soit prêt (`pg_isready`), puis la requête renvoie `db ok`. Un service tourne à côté du job, en local — exactement comme sur un runner GitLab.
:::

:::lang en
**✅ Check:** the job waits for Postgres to be ready (`pg_isready`), then the query returns `db ok`. A service runs next to the job, locally — exactly like on a GitLab runner.
:::

### step-05

:::lang fr
**Objectif.** Comprendre comment passer au **vrai GitLab** quand le déclenchement automatique devient utile.

Tu as mis au point le `.gitlab-ci.yml` en local. Pour qu'il s'exécute **à chaque push**, il faut un GitLab (gitlab.com ou auto-hébergé) et un **runner**. Tu peux même héberger tout ça **en local** avec Docker :
:::

:::lang en
**Goal.** Understand how to move to **real GitLab** when automatic triggering becomes useful.

You've tuned the `.gitlab-ci.yml` locally. For it to run **on every push**, you need a GitLab (gitlab.com or self-hosted) and a **runner**. You can even host it all **locally** with Docker:
:::

```bash
# GitLab auto-hébergé en local (option avancée) / self-hosted GitLab locally (advanced option)
docker run -d --name gitlab -p 8080:80 gitlab/gitlab-ce:latest
# Puis enregistrer un runner Docker qui exécutera les pipelines sur push :
# Then register a Docker runner that will run pipelines on push:
docker run -d --name gitlab-runner \
  -v /var/run/docker.sock:/var/run/docker.sock \
  gitlab/gitlab-runner:latest
# gitlab-runner register  ->  URL http://localhost:8080, token du projet, executor "docker"
```

:::lang fr
**✅ Vérification :** tu sais désormais que le **même** `.gitlab-ci.yml` que tu as validé en local tourne tel quel sur un runner. Pour apprendre et itérer : `gitlab-ci-local`. Pour le déclenchement sur push : GitLab + runner (local ou hébergé).

> Pour un pipeline d'entraînement, reste sur `gitlab-ci-local` : pas besoin de monter GitLab CE (lourd, ~4 Go RAM).
:::

:::lang en
**✅ Check:** you now know the **same** `.gitlab-ci.yml` you validated locally runs as-is on a runner. To learn and iterate: `gitlab-ci-local`. For push-triggering: GitLab + runner (local or hosted).

> For a practice pipeline, stay on `gitlab-ci-local`: no need to stand up GitLab CE (heavy, ~4 GB RAM).
:::

## pitfalls

:::lang fr
- **`gitlab-ci-local` ne fait rien / « no jobs »** → tu n'es pas dans le dossier du `.gitlab-ci.yml`, ou le fichier est mal nommé (le point initial compte).
- **Docker non lancé** → `gitlab-ci-local` a besoin du démon Docker pour créer les conteneurs de jobs (`docker ps` doit répondre).
- **Service injoignable** → utilise l'`alias` du service comme nom d'hôte (`db`), pas `localhost` : le job et le service sont deux conteneurs distincts.
- **Tu confonds local et distant** : `gitlab-ci-local` n'applique pas les règles liées au serveur (`rules: if: $CI_PIPELINE_SOURCE == "merge_request_event"` n'a pas de sens hors GitLab). Garde ces règles pour le vrai GitLab.
- **YAML sensible à l'indentation** → deux espaces, jamais de tabulation ; `script` est une **liste**.
:::

:::lang en
- **`gitlab-ci-local` does nothing / "no jobs"** → you're not in the `.gitlab-ci.yml` folder, or the file is misnamed (the leading dot matters).
- **Docker not running** → `gitlab-ci-local` needs the Docker daemon to create job containers (`docker ps` must respond).
- **Service unreachable** → use the service `alias` as hostname (`db`), not `localhost`: the job and the service are two separate containers.
- **You conflate local and remote**: `gitlab-ci-local` doesn't apply server-bound rules (`rules: if: $CI_PIPELINE_SOURCE == "merge_request_event"` makes no sense outside GitLab). Keep those rules for real GitLab.
- **YAML is indentation-sensitive** → two spaces, never a tab; `script` is a **list**.
:::

## success

:::lang fr
Tu sais que c'est bon quand :

- `npx gitlab-ci-local --list` liste tes jobs, et `npx gitlab-ci-local` les passe au vert, en local.
- Un artifact produit au `build` est lu au `test` via `needs`.
- Un job atteint son service (`SELECT 'db ok'`).
- Tu peux expliquer où s'arrête le local et où commence le vrai GitLab (déclenchement sur push).
:::

:::lang en
You know it works when:

- `npx gitlab-ci-local --list` lists your jobs, and `npx gitlab-ci-local` turns them green, locally.
- An artifact produced in `build` is read in `test` via `needs`.
- A job reaches its service (`SELECT 'db ok'`).
- You can explain where local stops and real GitLab begins (push-triggering).
:::

## next

:::lang fr
Tu maîtrises la **syntaxe et la mise au point** d'un pipeline GitLab CI, sans serveur ni compte. Le passage au vrai GitLab ne change pas ton `.gitlab-ci.yml` : il ajoute seulement le **déclenchement** (push/MR) et le **runner**. Enchaîne sur l'automatisation de configuration (Ansible) pour que tes pipelines déploient sur des machines réelles… en local d'abord.
:::

:::lang en
You've mastered the **syntax and debugging** of a GitLab CI pipeline, with no server or account. Moving to real GitLab doesn't change your `.gitlab-ci.yml`: it only adds the **triggering** (push/MR) and the **runner**. Move on to configuration automation (Ansible) so your pipelines deploy to real machines… locally first.
:::

## cheatsheet

```bash
npx gitlab-ci-local --list          # liste les jobs / list jobs
npx gitlab-ci-local                 # exécute tout le pipeline / run the whole pipeline
npx gitlab-ci-local <job>           # un seul job / a single job
npx gitlab-ci-local --variable K=V  # injecter une variable / inject a variable
npx gitlab-ci-local --help          # toutes les options / all options
```

## resources

:::lang fr
- `gitlab-ci-local` (dépôt `firecow/gitlab-ci-local`) — options, limites connues.
- Documentation GitLab CI/CD — référence du `.gitlab-ci.yml` (stages, needs, artifacts, services, rules).
- Image `gitlab/gitlab-runner` — pour le déclenchement réel sur push.
:::

:::lang en
- `gitlab-ci-local` (repo `firecow/gitlab-ci-local`) — options, known limits.
- GitLab CI/CD documentation — `.gitlab-ci.yml` reference (stages, needs, artifacts, services, rules).
- `gitlab/gitlab-runner` image — for real push-triggering.
:::

## troubleshooting

:::lang fr
- **`npx` retélécharge l'outil à chaque fois** → installe-le une fois : `npm i -g gitlab-ci-local`, puis appelle `gitlab-ci-local`.
- **Permission denied sur `docker.sock`** → ton utilisateur n'est pas dans le groupe `docker` (ajoute-le, ou lance avec les droits nécessaires).
- **Un job « hang » sur un service** → la base n'est pas prête : attends-la (`pg_isready`/boucle `until`) avant de l'utiliser.
- **Comportement différent de GitLab.com** → `gitlab-ci-local` couvre l'exécution des jobs ; les fonctions serveur (environnements, MR pipelines) ne s'y testent pas.
:::

:::lang en
- **`npx` re-downloads the tool each time** → install it once: `npm i -g gitlab-ci-local`, then call `gitlab-ci-local`.
- **Permission denied on `docker.sock`** → your user isn't in the `docker` group (add it, or run with the needed rights).
- **A job hangs on a service** → the database isn't ready: wait for it (`pg_isready`/`until` loop) before using it.
- **Behavior differs from GitLab.com** → `gitlab-ci-local` covers job execution; server features (environments, MR pipelines) aren't testable there.
:::
