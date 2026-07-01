---
# — Identité (ne change JAMAIS une fois publié) —
id: docker-compose
slug: docker-compose
order: 4
status: published

# — Titres & accroches (bilingue) —
title_fr: "Docker Compose"
title_en: "Docker Compose"
tagline_fr: "Orchestrer plusieurs services proprement."
tagline_en: "Orchestrate multiple services cleanly."

# — Métadonnées pédagogiques —
level: beginner
duration_min: 60
repo: "docker/compose"
last_review: "2026-06-19"

# — Relations de parcours (par id) —
prerequisites: [docker-fondamentaux]
next: [traefik]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [services-declaratifs, volumes-nommes, reseaux-partages, variables-environnement, healthchecks, cycle-de-vie]
concepts_en: [declarative-services, named-volumes, shared-networks, environment-variables, healthchecks, lifecycle]

# — Accès (embryon du freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Guide pas-à-pas Docker Compose : décrire une stack multi-services en YAML déclaratif, avec volumes, réseaux et .env."
og_description_en: "Step-by-step Docker Compose guide: describe a multi-service stack in declarative YAML, with volumes, networks and .env."
---

## intro

:::lang fr
Une fois Docker en main, tu vas vite vouloir lancer **plusieurs conteneurs ensemble** : une app + sa base de données + un cache + un reverse proxy. Le faire à coup de `docker run` séparés est pénible (dix commandes à retaper), non versionnable (ta stack vit dans ton historique shell) et non partageable (impossible de dire « voici ma stack » à quelqu'un).

**Docker Compose** résout ça : un fichier YAML décrit toute ta stack, et tu lances tout avec une seule commande. C'est **la** brique standard du self-hosting moderne — tous les guides suivants de cette plateforme utilisent Compose.

**Pour qui c'est :** tu as terminé le guide Docker fondamentaux, tu sais lancer un conteneur seul, et tu veux passer à la vitesse supérieure.

**Quand ce n'est PAS le bon choix :**

- Tu veux gérer un **cluster multi-nœuds** → regarde Kubernetes ou Docker Swarm.
- Tu fais du serverless / des conteneurs managés (Cloud Run, Fargate) → ces plateformes ont leurs propres outils de déploiement.

Pour un serveur unique qui héberge tes services, Compose est exactement le bon niveau de complexité.
:::

:::lang en
Once you're comfortable with Docker, you'll quickly want to run **several containers together**: an app + its database + a cache + a reverse proxy. Doing it with separate `docker run` commands is painful (ten commands to retype), unversionable (your stack lives in your shell history) and unshareable (no way to hand someone "here's my stack").

**Docker Compose** solves that: one YAML file describes your whole stack, and you start everything with a single command. It's **the** standard building block of modern self-hosting — every following guide on this platform uses Compose.

**Who it's for:** you've finished the Docker fundamentals guide, you can run a single container, and you want to level up.

**When it's NOT the right choice:**

- You want to manage a **multi-node cluster** → look at Kubernetes or Docker Swarm.
- You're doing serverless / managed containers (Cloud Run, Fargate) → those platforms have their own deployment tools.

For a single server hosting your services, Compose is exactly the right level of complexity.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Lire et écrire la structure d'un `compose.yaml` moderne (sans la clé `version:` obsolète).
- Définir des **services**, des **volumes** et des **réseaux** de façon déclarative.
- Gérer les **dépendances** entre services (`depends_on` + healthchecks).
- Externaliser les secrets dans un fichier **`.env`** — et éviter les pièges d'échappement des `$`.
- Piloter le **cycle de vie** d'une stack : `up`, `down`, `restart`, `logs`, `ps`, `exec`.
- Préparer ta stack à rejoindre un **réseau partagé** (`proxy`) pour le guide Traefik.
:::

:::lang en
By the end of this guide, you'll know how to:

- Read and write the structure of a modern `compose.yaml` (without the obsolete `version:` key).
- Define **services**, **volumes** and **networks** declaratively.
- Manage **dependencies** between services (`depends_on` + healthchecks).
- Externalize secrets in a **`.env`** file — and avoid the `$` escaping traps.
- Drive a stack's **lifecycle**: `up`, `down`, `restart`, `logs`, `ps`, `exec`.
- Prepare your stack to join a **shared network** (`proxy`) for the Traefik guide.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Le guide **Docker fondamentaux** terminé : tu sais ce qu'est une image, un conteneur, un volume, et tu as déjà lancé un `docker run`.
- Le plugin **Docker Compose v2** installé — `docker compose version` doit répondre. Il est inclus par défaut dans Docker Desktop et Docker Engine récents.
- Une aisance de base en **ligne de commande Linux** (`cd`, `nano`/`vim`, `ls`).

⚠️ Note importante : **`docker-compose`** (avec tiret) est l'ancien outil Python, déprécié. **`docker compose`** (sans tiret) est le plugin officiel actuel. Dans ce guide — et partout ailleurs — on utilise toujours **le sans-tiret**.
:::

:::lang en
You should have:

- The **Docker fundamentals** guide completed: you know what an image, a container and a volume are, and you've already run a `docker run`.
- The **Docker Compose v2** plugin installed — `docker compose version` must answer. It ships by default with Docker Desktop and recent Docker Engine.
- Basic comfort with the **Linux command line** (`cd`, `nano`/`vim`, `ls`).

⚠️ Important note: **`docker-compose`** (with a hyphen) is the old Python tool, deprecated. **`docker compose`** (no hyphen) is the current official plugin. In this guide — and everywhere else — we always use **the hyphen-less one**.
:::

## concepts

:::lang fr
Un projet Compose, c'est un dossier avec un fichier `compose.yaml` au centre. Ce fichier décrit **toute** ta stack : les services (chaque entrée devient un conteneur), les volumes (la donnée qui survit aux conteneurs) et les réseaux (qui parle à qui).

Anatomie d'un projet typique :
:::

:::lang en
A Compose project is a folder with a `compose.yaml` file at its core. That file describes your **entire** stack: services (each entry becomes a container), volumes (the data that outlives containers) and networks (who talks to whom).

Anatomy of a typical project:
:::

```
mon-projet/
├── compose.yaml      # description déclarative de la stack / declarative stack description
├── .env              # secrets et config sensible / secrets and sensitive config
├── app/
│   └── Dockerfile    # si tu builds une image custom / if you build a custom image
└── data/             # bind mounts éventuels / optional bind mounts
```

:::figure compose-stack
caption_fr: "Schéma 1. Une stack Compose : plusieurs services, réseaux et volumes déclarés dans un seul fichier."
caption_en: "Figure 1. A Compose stack: several services, networks and volumes declared in a single file."
:::

:::lang fr
**Points clés à retenir :**

- **Déclaratif, pas impératif.** Tu décris l'état voulu (« un service `db` avec ce volume »), Compose se débrouille pour l'atteindre. Relancer `docker compose up -d` ne recrée que ce qui a changé.
- **Un projet = un espace de noms.** Compose préfixe conteneurs, volumes et réseaux avec le nom du projet (par défaut, le nom du dossier). Deux stacks ne se marchent pas dessus.
- **Réseau automatique + DNS interne.** Compose crée un réseau dédié à la stack, et les services **se résolvent par leur nom** : depuis le conteneur `app`, l'hôte `db` pointe vers le conteneur `db`. Pas d'IP à gérer.
- **Le volume est ta vraie donnée.** Les conteneurs sont jetables ; ce qui compte, c'est ce qui est déclaré dans `volumes:`.
- **Versions pinées, toujours.** `image: mariadb:11.4`, jamais `:latest` : tu décides quand tu mets à jour, et tu sais quoi rollback si ça casse.
:::

:::lang en
**Key takeaways:**

- **Declarative, not imperative.** You describe the desired state ("a `db` service with this volume"), Compose figures out how to get there. Re-running `docker compose up -d` only recreates what changed.
- **One project = one namespace.** Compose prefixes containers, volumes and networks with the project name (by default, the folder name). Two stacks never step on each other.
- **Automatic network + internal DNS.** Compose creates a network dedicated to the stack, and services **resolve each other by name**: from the `app` container, the host `db` points to the `db` container. No IPs to manage.
- **The volume is your real data.** Containers are disposable; what matters is what's declared under `volumes:`.
- **Pinned versions, always.** `image: mariadb:11.4`, never `:latest`: you decide when to update, and you know what to roll back if something breaks.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Écrire ton premier `compose.yaml` : un WordPress + sa base MariaDB, le classique multi-services.

**🤔 Pourquoi ?** Deux services qui dépendent l'un de l'autre, un volume pour la donnée, des variables d'environnement : ce petit fichier contient déjà tous les concepts que tu réutiliseras dans chaque stack self-hostée. Chaque ligne a un équivalent `docker run` que tu connais : `environment:` = `-e`, `volumes:` = `-v`, `ports:` = `-p`. La clé `volumes:` au niveau racine, elle, **déclare** les volumes nommés que la stack utilise. Et note l'absence de clé `version:` en tête de fichier — elle est obsolète depuis Compose v2.
:::

:::lang en
**Goal.** Write your first `compose.yaml`: a WordPress + its MariaDB database, the classic multi-service example.

**🤔 Why?** Two services depending on each other, a volume for the data, environment variables: this small file already contains every concept you'll reuse in each self-hosted stack. Every line has a `docker run` equivalent you know: `environment:` = `-e`, `volumes:` = `-v`, `ports:` = `-p`. The root-level `volumes:` key, on the other hand, **declares** the named volumes the stack uses. Also note the absence of a `version:` key at the top — it's been obsolete since Compose v2.
:::

```bash
mkdir -p ~/wp
cd ~/wp
nano compose.yaml
```

```yaml
services:
  db:
    image: mariadb:11.4
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: rootsecret
      MARIADB_DATABASE: wordpress
      MARIADB_USER: wp
      MARIADB_PASSWORD: wpsecret
    volumes:
      - db-data:/var/lib/mysql

  wordpress:
    image: wordpress:6.8
    restart: unless-stopped
    depends_on:
      - db
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wp
      WORDPRESS_DB_PASSWORD: wpsecret
      WORDPRESS_DB_NAME: wordpress

volumes:
  db-data:
```

:::lang fr
Deux détails à bien voir :

- `WORDPRESS_DB_HOST: db` → grâce au réseau automatique de la stack et à son DNS interne, le nom du service `db` **est** l'adresse de la base. Aucune IP à connaître.
- `depends_on: [db]` → démarre `wordpress` **après** `db`… mais ⚠️ ne garantit pas que la base soit *prête*, juste *démarrée*. On corrigera ça à l'étape 6.
- Les mots de passe en dur dans le YAML sont **provisoires** — on les sortira dans `.env` à l'étape 4.

**✅ Vérification :**
:::

:::lang en
Two details worth noticing:

- `WORDPRESS_DB_HOST: db` → thanks to the stack's automatic network and internal DNS, the `db` service name **is** the database address. No IP to know.
- `depends_on: [db]` → starts `wordpress` **after** `db`… but ⚠️ doesn't guarantee the database is *ready*, only *started*. We'll fix that in step 6.
- The hard-coded passwords in the YAML are **temporary** — we'll move them to `.env` in step 4.

**✅ Check:**
:::

```bash
docker compose config
# Doit afficher la config interprétée sans erreur / should print the parsed config with no error
```

### step-02

:::lang fr
**Objectif.** Lancer toute la stack en une commande.

**🤔 Pourquoi `-d` ?** `-d` = detached : les conteneurs tournent en arrière-plan et te rendent la main. Sans cette option, tu serais attaché aux logs et un `Ctrl+C` arrêterait toute la stack. En pratique, on est toujours en `-d`.
:::

:::lang en
**Goal.** Start the whole stack with one command.

**🤔 Why `-d`?** `-d` = detached: the containers run in the background and free your shell. Without it, you'd be attached to the logs and a `Ctrl+C` would stop the whole stack. In practice you're always in `-d`.
:::

```bash
docker compose up -d
```

:::lang fr
**✅ Vérification :**

```bash
docker compose ps
# Les 2 services doivent être "Up"
```

Puis ouvre `http://localhost:8080` dans ton navigateur : tu dois voir la page d'installation de WordPress. Si `db` redémarre en boucle, regarde ses logs : `docker compose logs db`.
:::

:::lang en
**✅ Check:**

```bash
docker compose ps
# Both services should be "Up"
```

Then open `http://localhost:8080` in your browser: you should see the WordPress install page. If `db` keeps restarting, check its logs: `docker compose logs db`.
:::

### step-03

:::lang fr
**Objectif.** Maîtriser le cycle de vie de la stack — démarrer, observer, arrêter, supprimer.

**🤔 Pourquoi ?** C'est ton quotidien d'opérateur : 90 % de ta vie avec Compose, ce sont ces sept commandes. La distinction la plus importante est `down` vs `down -v` : `down` est **non-destructif** pour les données (les volumes nommés survivent, un `up -d` derrière et tout revient) ; `down -v` **détruit aussi les volumes** — donc ta base de données.
:::

:::lang en
**Goal.** Master the stack lifecycle — start, observe, stop, remove.

**🤔 Why?** This is your day-to-day as an operator: 90% of your life with Compose is these seven commands. The most important distinction is `down` vs `down -v`: `down` is **non-destructive** for data (named volumes survive; run `up -d` afterwards and everything comes back); `down -v` **also destroys the volumes** — meaning your database.
:::

```bash
docker compose ps                  # état de la stack / stack status
docker compose logs -f wordpress   # logs d'un service / one service's logs
docker compose logs -f             # logs de toute la stack / whole-stack logs
docker compose restart wordpress   # redémarrer un service / restart one service
docker compose stop                # arrêter sans supprimer / stop without removing
docker compose start               # relancer après stop / start again after stop
docker compose down                # arrêter ET supprimer les conteneurs (volumes préservés) / stop AND remove containers (volumes preserved)
```

:::lang fr
⚠️ **Commande destructive — à connaître, à ne PAS taper maintenant :**
:::

:::lang en
⚠️ **Destructive command — know it, do NOT type it now:**
:::

```bash
docker compose down -v   # ⚠️ supprime AUSSI les volumes = PERTE DE DONNÉES définitive
                         # ⚠️ ALSO removes volumes = permanent DATA LOSS
```

:::lang fr
`down -v` n'a qu'un usage légitime : repartir de zéro volontairement. Triple vérification avant de l'utiliser.

**✅ Vérification :** fais un cycle complet `docker compose down` puis `docker compose up -d`, et recharge `http://localhost:8080` : WordPress doit se souvenir de ton installation (le volume `db-data` a survécu).
:::

:::lang en
`down -v` has only one legitimate use: deliberately starting from scratch. Triple-check before using it.

**✅ Check:** run a full cycle — `docker compose down` then `docker compose up -d` — and reload `http://localhost:8080`: WordPress must remember your installation (the `db-data` volume survived).
:::

### step-04

:::lang fr
**Objectif.** Sortir les secrets du `compose.yaml` vers un fichier `.env`.

**🤔 Pourquoi ?** Hardcoder `MARIADB_ROOT_PASSWORD: rootsecret` dans le YAML est **mauvais** : si tu versionnes ton compose dans Git, ton mot de passe est public. Le pattern universel du self-hosting : `compose.yaml` versionnable et partageable, `.env` qui reste sur ta machine.
:::

:::lang en
**Goal.** Move secrets out of `compose.yaml` into a `.env` file.

**🤔 Why?** Hard-coding `MARIADB_ROOT_PASSWORD: rootsecret` in the YAML is **bad**: if you version your compose file in Git, your password is public. The universal self-hosting pattern: `compose.yaml` versionable and shareable, `.env` staying on your machine.
:::

```bash
nano .env
```

```env
# Valeurs BRUTES : pas de guillemets, pas d'espaces autour du =
# RAW values: no quotes, no spaces around the =
MARIADB_ROOT_PASSWORD=rootsecret
MARIADB_DATABASE=wordpress
MARIADB_USER=wp
MARIADB_PASSWORD=wpsecret
```

:::lang fr
Puis modifie le service `db` dans `compose.yaml` pour interpoler ces variables :
:::

:::lang en
Then edit the `db` service in `compose.yaml` to interpolate those variables:
:::

```yaml
  db:
    image: mariadb:11.4
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${MARIADB_ROOT_PASSWORD}
      MARIADB_DATABASE: ${MARIADB_DATABASE}
      MARIADB_USER: ${MARIADB_USER}
      MARIADB_PASSWORD: ${MARIADB_PASSWORD}
    volumes:
      - db-data:/var/lib/mysql
```

:::lang fr
Et protège le `.env` de Git dès maintenant :
:::

:::lang en
And protect `.env` from Git right away:
:::

```bash
echo ".env" >> .gitignore
```

:::lang fr
⚠️ **Le piège des `$` — retiens la règle une fois pour toutes :**

- **Valeur dans un `.env` chargé via `env_file:` ou lue par interpolation** → colle-la **brute** : pas de guillemets, pas de doublement des `$`. Des guillemets parasites peuvent finir *dans* la valeur et casser silencieusement.
- **Valeur écrite directement dans `compose.yaml`** (là où l'interpolation `${...}` s'applique) et qui contient un `$` littéral (hash Argon2id, htpasswd…) → **double** chaque `$` en `$$`, sinon Compose essaie d'interpoler.
- Écris toujours `${VARIABLE}` avec accolades, jamais `$VARIABLE` nu : sans accolades, certains enchaînements de caractères cassent l'interpolation.

Il existe aussi `env_file: .env`, qui injecte **tout** le fichier comme variables d'environnement du conteneur, sans interpolation dans le YAML. Pratique quand un service prend toute sa config par variables (tu le verras dans le guide Vaultwarden). Ici on garde l'interpolation `${...}`, plus explicite : on voit dans le YAML exactement quelles variables chaque service reçoit.

**✅ Vérification :**

```bash
docker compose config | grep MARIADB
# Les valeurs du .env doivent apparaître interpolées, sans ${...} restant
docker compose up -d
docker compose ps
# Les 2 services toujours "Up"
```
:::

:::lang en
⚠️ **The `$` trap — learn the rule once and for all:**

- **Value in a `.env` loaded via `env_file:` or read through interpolation** → paste it **raw**: no quotes, no doubling of `$`. Stray quotes can end up *inside* the value and break things silently.
- **Value written directly in `compose.yaml`** (where `${...}` interpolation applies) that contains a literal `$` (Argon2id hash, htpasswd…) → **double** each `$` as `$$`, otherwise Compose tries to interpolate it.
- Always write `${VARIABLE}` with braces, never bare `$VARIABLE`: without braces, some character sequences break interpolation.

There's also `env_file: .env`, which injects the **whole** file as container environment variables, with no interpolation in the YAML. Handy when a service takes all its config through variables (you'll see it in the Vaultwarden guide). Here we keep `${...}` interpolation, which is more explicit: the YAML shows exactly which variables each service receives.

**✅ Check:**

```bash
docker compose config | grep MARIADB
# The .env values must appear interpolated, no ${...} left
docker compose up -d
docker compose ps
# Both services still "Up"
```
:::

### step-05

:::lang fr
**Objectif.** Attacher un service à un réseau partagé externe — la préparation directe du guide Traefik.

**🤔 Pourquoi ?** Compose crée un réseau dédié par stack : parfait pour l'isolation, mais quand tu voudras qu'un **reverse proxy externe** (Traefik) atteigne ton service, il faut un réseau commun aux deux stacks. Convention de tout le parcours : ce réseau s'appelle **`proxy`**. `external: true` dit à Compose : « ce réseau existe déjà ailleurs, ne le crée pas, attache-toi à lui ». Règle de sécurité : **seuls les services à exposer** rejoignent `proxy` — jamais les bases de données ni les caches, qui restent sur le réseau `default` de la stack.
:::

:::lang en
**Goal.** Attach a service to a shared external network — the direct preparation for the Traefik guide.

**🤔 Why?** Compose creates one dedicated network per stack: great for isolation, but when you want an **external reverse proxy** (Traefik) to reach your service, you need a network shared by both stacks. Convention for the whole learning path: that network is called **`proxy`**. `external: true` tells Compose: "this network already exists elsewhere, don't create it, attach to it". Security rule: **only services meant to be exposed** join `proxy` — never databases or caches, which stay on the stack's `default` network.
:::

```bash
docker network create proxy
```

:::lang fr
Puis dans `compose.yaml`, attache **uniquement** `wordpress` au réseau partagé (et garde `db` isolée) :
:::

:::lang en
Then in `compose.yaml`, attach **only** `wordpress` to the shared network (and keep `db` isolated):
:::

```yaml
  wordpress:
    image: wordpress:6.8
    restart: unless-stopped
    depends_on:
      - db
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wp
      WORDPRESS_DB_PASSWORD: ${MARIADB_PASSWORD}
      WORDPRESS_DB_NAME: ${MARIADB_DATABASE}
    networks:
      - default
      - proxy

networks:
  proxy:
    external: true
```

:::lang fr
(Dès que le service parle à Traefik, les `ports:` deviendront inutiles — on les enlèvera dans le guide Traefik. Ici on les garde pour continuer à tester en local.)

**✅ Vérification :**

```bash
docker compose up -d
docker network inspect proxy --format '{{range .Containers}}{{.Name}} {{end}}'
# Doit lister le conteneur wordpress — et PAS le conteneur db
```
:::

:::lang en
(Once the service talks to Traefik, the `ports:` will become unnecessary — we'll remove them in the Traefik guide. Here we keep them to keep testing locally.)

**✅ Check:**

```bash
docker compose up -d
docker network inspect proxy --format '{{range .Containers}}{{.Name}} {{end}}'
# Must list the wordpress container — and NOT the db container
```
:::

### step-06

:::lang fr
**Objectif.** Rendre le démarrage fiable avec un healthcheck et `depends_on: condition: service_healthy`.

**🤔 Pourquoi ?** Le `depends_on` basique ne fait que **lancer dans l'ordre**, il n'attend pas que le service soit *prêt*. Sans ça : WordPress démarre, tente de se connecter à MariaDB qui initialise encore son schéma, échoue, et plante. Avec un healthcheck + `condition: service_healthy`, Compose attend que la base réponde sainement avant de lancer WordPress. (`healthcheck.sh` est fourni **dans** l'image MariaDB officielle — on ne suppose jamais un binaire présent sans vérifier.)
:::

:::lang en
**Goal.** Make startup reliable with a healthcheck and `depends_on: condition: service_healthy`.

**🤔 Why?** Basic `depends_on` only **starts in order**; it doesn't wait for the service to be *ready*. Without this: WordPress starts, tries to connect to MariaDB which is still initializing its schema, fails, and crashes. With a healthcheck + `condition: service_healthy`, Compose waits until the database answers healthily before starting WordPress. (`healthcheck.sh` ships **inside** the official MariaDB image — never assume a binary exists without checking.)
:::

```yaml
services:
  db:
    image: mariadb:11.4
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${MARIADB_ROOT_PASSWORD}
      MARIADB_DATABASE: ${MARIADB_DATABASE}
      MARIADB_USER: ${MARIADB_USER}
      MARIADB_PASSWORD: ${MARIADB_PASSWORD}
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 10s
      timeout: 5s
      retries: 5

  wordpress:
    image: wordpress:6.8
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: ${MARIADB_USER}
      WORDPRESS_DB_PASSWORD: ${MARIADB_PASSWORD}
      WORDPRESS_DB_NAME: ${MARIADB_DATABASE}
    networks:
      - default
      - proxy

volumes:
  db-data:

networks:
  proxy:
    external: true
```

:::lang fr
**✅ Vérification :**

```bash
docker compose up -d
docker compose ps
# db doit afficher "Up X (healthy)" ; wordpress ne démarre qu'après
```
:::

:::lang en
**✅ Check:**

```bash
docker compose up -d
docker compose ps
# db must show "Up X (healthy)"; wordpress only starts afterwards
```
:::

### step-07

:::lang fr
**Objectif.** Mémoriser le squelette « bonnes pratiques » que tu réutiliseras pour chaque service du parcours.

**🤔 Pourquoi ?** Chaque ligne encode une leçon : version **pinée** (jamais `:latest`), `restart: unless-stopped` (et pas `always`, qui relancerait même après un arrêt volontaire), secrets externalisés, volume nommé pour la donnée, config en lecture seule, réseau `proxy` réservé à l'exposition, healthcheck, et une borne mémoire pour qu'un service ne mange pas tout le serveur.
:::

:::lang en
**Goal.** Memorize the "best practices" skeleton you'll reuse for every service in the learning path.

**🤔 Why?** Every line encodes a lesson: **pinned** version (never `:latest`), `restart: unless-stopped` (not `always`, which would restart even after a deliberate stop), externalized secrets, a named volume for data, read-only config, the `proxy` network reserved for exposure, a healthcheck, and a memory limit so one service can't eat the whole server.
:::

```yaml
services:
  app:
    image: monregistry/app:1.2.3      # ✅ version pinée, jamais :latest / pinned version, never :latest
    restart: unless-stopped           # ✅ pas "always" / not "always"
    env_file: .env                    # ✅ secrets externalisés / externalized secrets
    volumes:
      - app-data:/data                # ✅ volume nommé pour la donnée / named volume for data
      - ./config:/etc/app:ro          # ✅ config en lecture seule / read-only config
    networks:
      - proxy                         # ✅ seulement si le service doit être exposé / only if exposed
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
    deploy:
      resources:
        limits:
          memory: 512M                # ✅ borne mémoire / memory cap

volumes:
  app-data:

networks:
  proxy:
    external: true
```

:::lang fr
**✅ Vérification :** relis le `compose.yaml` de ta stack WordPress et coche mentalement chaque pratique : versions pinées ? secrets dans `.env` ? volume nommé ? `db` hors du réseau `proxy` ? healthcheck ? Si oui partout, tu es prêt pour Traefik.
:::

:::lang en
**✅ Check:** re-read your WordPress stack's `compose.yaml` and mentally tick each practice: pinned versions? secrets in `.env`? named volume? `db` kept off the `proxy` network? healthcheck? If yes everywhere, you're ready for Traefik.
:::

## pitfalls

:::lang fr
**1. Tu utilises encore `version: "3.x"` en haut du fichier.** Cette clé est **obsolète** depuis Compose v2 (2023). Elle ne fait rien, à part du bruit visuel et parfois un warning. Supprime-la.

**2. Tu lances `docker-compose` (avec tiret) et obtiens des comportements étranges.** C'est l'ancien outil Python, déprécié et figé. Utilise toujours `docker compose` (plugin officiel v2).

**3. Tu fais `docker compose down -v` et perds tes données.** `down` seul préserve les volumes nommés ; `-v` les **détruit définitivement** — base de données comprise. Triple vérification avant d'ajouter `-v`, et jamais en copier-coller réflexe.

**4. Tu modifies `compose.yaml` mais `restart` n'applique rien.** `docker compose restart` redémarre le conteneur **existant**, avec son ancienne définition. Pour appliquer un changement de config (YAML ou `.env`), c'est `docker compose up -d` : Compose recrée les conteneurs dont la définition a changé.

**5. Variables d'env qui cassent à cause des `$`.** `$VARIABLE` sans accolades casse sur certains caractères → toujours `${VARIABLE}`. Valeur avec `$` littéral (hash…) écrite directement dans le YAML → doubler en `$$`. Valeur dans un `.env` chargé par `env_file:` → brute, sans guillemets ni doublement. Inverser ces règles casse **silencieusement**.

**6. Tu commits ton `.env`.** Même piège que dans Git fondamentaux : le secret est public dès le premier push, et il reste dans l'historique même après suppression. `.gitignore` dès la création du fichier, pas après.

**7. Deux stacks, un conflit de ports.** Deux compose qui exposent `8080:80` ne peuvent pas tourner en même temps (`address already in use`). Soit tu changes les ports publiés, soit — mieux — tu passes par un reverse proxy : c'est exactement le guide suivant.
:::

:::lang en
**1. You still put `version: "3.x"` at the top of the file.** That key has been **obsolete** since Compose v2 (2023). It does nothing except add visual noise and sometimes a warning. Remove it.

**2. You run `docker-compose` (with a hyphen) and get weird behavior.** That's the old Python tool, deprecated and frozen. Always use `docker compose` (official v2 plugin).

**3. You run `docker compose down -v` and lose your data.** Plain `down` preserves named volumes; `-v` **destroys them permanently** — database included. Triple-check before adding `-v`, and never as a copy-paste reflex.

**4. You edit `compose.yaml` but `restart` applies nothing.** `docker compose restart` restarts the **existing** container with its old definition. To apply a config change (YAML or `.env`), use `docker compose up -d`: Compose recreates the containers whose definition changed.

**5. Environment variables breaking because of `$`.** `$VARIABLE` without braces breaks on some characters → always `${VARIABLE}`. A value with a literal `$` (hash…) written directly in the YAML → double it as `$$`. A value in a `.env` loaded via `env_file:` → raw, no quotes, no doubling. Swapping these rules breaks **silently**.

**6. You commit your `.env`.** Same trap as in Git fundamentals: the secret is public from the first push, and it stays in history even after deletion. `.gitignore` when the file is created, not after.

**7. Two stacks, one port conflict.** Two compose files exposing `8080:80` can't run at the same time (`address already in use`). Either change the published ports, or — better — go through a reverse proxy: that's exactly the next guide.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] `docker compose ps` montre ta stack avec `db` en `Up X (healthy)` et `wordpress` en `Up`.
- [ ] Tu lis un `compose.yaml` inconnu et tu en comprends 90 % du premier coup.
- [ ] Tu sais expliquer la différence entre `docker compose down` et `down -v` — et pourquoi le second est dangereux.
- [ ] Tes secrets vivent dans `.env` (gitignoré), plus aucun mot de passe dans le YAML.
- [ ] Toutes tes images sont pinées sur une version explicite, aucun `:latest`.
- [ ] `docker network inspect proxy` montre ton service exposé — et pas ta base de données.
- [ ] Tu peux faire `down` puis `up -d` sans perdre l'installation WordPress.
:::

:::lang en
You know it works when…

- [ ] `docker compose ps` shows your stack with `db` as `Up X (healthy)` and `wordpress` as `Up`.
- [ ] You can read an unfamiliar `compose.yaml` and understand 90% of it on first pass.
- [ ] You can explain the difference between `docker compose down` and `down -v` — and why the latter is dangerous.
- [ ] Your secrets live in `.env` (gitignored), no password left in the YAML.
- [ ] All your images are pinned to an explicit version, no `:latest` anywhere.
- [ ] `docker network inspect proxy` shows your exposed service — and not your database.
- [ ] You can run `down` then `up -d` without losing the WordPress installation.
:::

## next

:::lang fr
Trois prolongements naturels, dans l'ordre du parcours :

1. **Traefik** — le guide suivant : exposer tes stacks proprement en HTTPS automatique, via le réseau `proxy` que tu viens de créer. Plus de conflits de ports, plus de `8080` à retenir.
2. **Vaultwarden** — ton premier service self-hosté sérieux en Compose : il réutilise exactement les patterns de ce guide (volume, `env_file`, réseau `proxy`, healthcheck).
3. **Compose profiles** — pour activer des services conditionnellement (dev / prod) dans un même fichier. À explorer plus tard, quand tes stacks grossiront.
:::

:::lang en
Three natural extensions, in learning-path order:

1. **Traefik** — the next guide: expose your stacks cleanly with automatic HTTPS, through the `proxy` network you just created. No more port conflicts, no more `8080` to remember.
2. **Vaultwarden** — your first serious self-hosted service in Compose: it reuses exactly the patterns from this guide (volume, `env_file`, `proxy` network, healthcheck).
3. **Compose profiles** — to enable services conditionally (dev / prod) within one file. Explore later, once your stacks grow.
:::

## cheatsheet

:::lang fr
Aide-mémoire des commandes clés pour piloter une stack au quotidien.
:::

:::lang en
Key commands cheat sheet to drive a stack day-to-day.
:::

```bash
# Cycle de vie / Lifecycle
docker compose up -d               # démarrer / appliquer les changements — start / apply changes
docker compose ps                  # état / status
docker compose logs -f <service>   # suivre les logs / follow logs
docker compose restart <service>   # redémarrer (SANS relire la config) / restart (does NOT re-read config)
docker compose stop                # arrêter sans supprimer / stop without removing
docker compose down                # arrêter + supprimer conteneurs (volumes préservés) / stop + remove containers (volumes kept)
docker compose down -v             # ⚠️ DESTRUCTIF : supprime aussi les volumes / DESTRUCTIVE: also removes volumes

# Inspecter / Inspect
docker compose config              # YAML interprété (interpolation comprise) / parsed YAML (incl. interpolation)
docker compose exec <service> sh   # shell dans un conteneur / shell inside a container
docker network inspect proxy       # qui est sur le réseau partagé ? / who's on the shared network?

# Mettre à jour / Update (après lecture des release notes / after reading release notes)
# 1. changer le tag image: dans compose.yaml / change the image: tag in compose.yaml
# 2. appliquer / apply:
docker compose pull && docker compose up -d
```

## resources

:::lang fr
- [Spécification officielle Compose](https://docs.docker.com/compose/compose-file/) — la référence du format `compose.yaml`.
- [Awesome Compose](https://github.com/docker/awesome-compose) — exemples officiels pour des dizaines de stacks.
- [Migration Compose v1 → v2](https://docs.docker.com/compose/migrate/) — si tu croises encore `docker-compose` avec tiret.
- [Variables d'environnement et interpolation](https://docs.docker.com/compose/how-tos/environment-variables/) — le détail des règles `.env` / `${...}` / `$$`.
:::

:::lang en
- [Official Compose specification](https://docs.docker.com/compose/compose-file/) — the reference for the `compose.yaml` format.
- [Awesome Compose](https://github.com/docker/awesome-compose) — official examples for dozens of stacks.
- [Compose v1 → v2 migration](https://docs.docker.com/compose/migrate/) — if you still run into hyphenated `docker-compose`.
- [Environment variables and interpolation](https://docs.docker.com/compose/how-tos/environment-variables/) — the fine print on `.env` / `${...}` / `$$` rules.
:::

## troubleshooting

:::lang fr
**« network proxy declared as external, but could not be found ».** Le réseau externe que tu références n'existe pas encore : `external: true` signifie que Compose ne le crée jamais lui-même. Crée-le une fois : `docker network create proxy`.

**« yaml: line N: … » ou une erreur de structure alors que ton fichier « a l'air bon ».** Presque toujours l'indentation : le YAML est strict sur les espaces et n'accepte **jamais** de tabulation. Valide avec `docker compose config` — il pointe la ligne fautive — et configure ton éditeur pour indenter en espaces.

**WordPress ne se connecte pas à la base.** Deux causes classiques : soit MariaDB n'était pas *prête* au moment où WordPress a tenté (→ healthcheck + `condition: service_healthy`, étape 6), soit les identifiants ne correspondent pas entre le bloc `db` et le bloc `wordpress` (→ revérifie ton `.env` puis `docker compose config | grep -E 'MARIADB|WORDPRESS'`).

**« no configuration file provided: not found ».** Tu n'es pas dans le dossier qui contient `compose.yaml`, ou ton fichier porte un autre nom (l'ancien nom `docker-compose.yml` est encore accepté mais déprécié). `cd` dans le bon dossier, ou renomme en `compose.yaml`.
:::

:::lang en
**"network proxy declared as external, but could not be found".** The external network you reference doesn't exist yet: `external: true` means Compose never creates it itself. Create it once: `docker network create proxy`.

**"yaml: line N: …" or a structure error while your file "looks fine".** Almost always indentation: YAML is strict about spaces and **never** accepts tabs. Validate with `docker compose config` — it points at the offending line — and set your editor to indent with spaces.

**WordPress can't connect to the database.** Two classic causes: either MariaDB wasn't *ready* when WordPress tried (→ healthcheck + `condition: service_healthy`, step 6), or the credentials don't match between the `db` and `wordpress` blocks (→ re-check your `.env` then `docker compose config | grep -E 'MARIADB|WORDPRESS'`).

**"no configuration file provided: not found".** You're not in the folder containing `compose.yaml`, or your file has another name (the old `docker-compose.yml` name is still accepted but deprecated). `cd` into the right folder, or rename to `compose.yaml`.
:::
