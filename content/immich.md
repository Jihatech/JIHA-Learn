---
# — Identité (ne change JAMAIS une fois publié) —
id: immich
slug: immich
order: 7
status: published

# — Titres & accroches (bilingue) —
title_fr: "Immich — Ton Google Photos auto-hébergé"
title_en: "Immich — Your self-hosted Google Photos"
tagline_fr: "Galerie de photos privée, avec apps mobile."
tagline_en: "Private photo gallery with mobile apps."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 75
repo: "immich-app/immich"
validated_version: "v1.135.3"
last_review: "2026-06-19"

# — Relations de parcours (par id) —
prerequisites: [docker-fondamentaux, docker-compose, traefik]
next: [monitoring]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [stack-multi-conteneurs, fichier-env-officiel, reseaux-docker-multiples, stockage-photos, sauvegarde-postgres, template-de-stockage]
concepts_en: [multi-container-stack, official-env-file, multiple-docker-networks, photo-storage, postgres-backup, storage-template]

# — Accès (embryon du freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Guide pas-à-pas pour héberger Immich : stack Docker multi-conteneurs, Traefik, apps mobiles, sauvegardes."
og_description_en: "Step-by-step guide to self-host Immich: multi-container Docker stack, Traefik, mobile apps, backups."
---

## intro

:::lang fr
Immich est devenu **la référence** du self-hosting photo. Apps iOS/Android polies, sauvegarde automatique du téléphone, recherche en langage naturel ("photos de mon chien à la plage"), reconnaissance faciale, carte, partage. Tout ça avec tes photos **sur ton serveur** — pas chez Google.

Contrairement à Vaultwarden (un seul conteneur), Immich est **une vraie stack** : un serveur, un service de machine learning, un PostgreSQL avec extension vectorielle, un cache Redis. Ce guide te montre comment monter tout ça proprement, derrière Traefik, avec une stratégie de sauvegarde digne de tes souvenirs.

**Pour qui c'est :** quelqu'un qui veut quitter Google Photos ou iCloud Photos pour reprendre le contrôle, sans sacrifier l'expérience mobile. C'est aussi le guide idéal pour apprendre à intégrer une **stack multi-conteneurs** à ton reverse proxy.

**Quand ce n'est PAS le bon choix :**

- Tu as **moins de 6 Go de RAM** disponibles sur ton serveur — Immich va ramer (avec le ML désactivé, 4 Go passent).
- Tu as **moins de 50 Go de stockage** libre — ce ne sera pas suffisant à moyen terme pour une photothèque réelle.
- Tu n'as **pas de stratégie de sauvegarde** — ne mets pas tes photos précieuses ici. Perdre la base = perdre albums, visages et métadonnées (les photos elles-mêmes restent dans `UPLOAD_LOCATION`, mais anonymes).

Si l'un des trois te concerne, garde Google Photos encore un peu et reviens quand ton serveur est prêt. C'est un bon arbitrage, pas un échec.
:::

:::lang en
Immich has become **the reference** for self-hosted photos. Polished iOS/Android apps, automatic phone backup, natural-language search ("photos of my dog at the beach"), face recognition, map view, sharing. All of it with your photos **on your server** — not at Google's.

Unlike Vaultwarden (a single container), Immich is **a real stack**: a server, a machine learning service, a PostgreSQL with a vector extension, a Redis cache. This guide shows you how to assemble it all cleanly, behind Traefik, with a backup strategy worthy of your memories.

**Who it's for:** someone who wants to leave Google Photos or iCloud Photos and take back control, without sacrificing the mobile experience. It's also the ideal guide for learning how to plug a **multi-container stack** into your reverse proxy.

**When it's NOT the right choice:**

- You have **less than 6 GB of RAM** available on your server — Immich will crawl (with ML disabled, 4 GB is workable).
- You have **less than 50 GB of free storage** — that won't be enough medium-term for a real photo library.
- You have **no backup strategy** — don't put your precious photos here. Losing the database = losing albums, faces and metadata (the photos themselves stay in `UPLOAD_LOCATION`, but anonymous).

If any of the three applies, keep Google Photos a bit longer and come back when your server is ready. That's a sound trade-off, not a failure.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Déployer une **stack multi-conteneurs** complète (serveur + base de données + cache + machine learning) à partir du compose officiel du projet.
- Utiliser un **fichier `.env` officiel** fourni par le projet (au lieu d'une config inline), et **pinner une version** précise.
- Configurer le **stockage des photos** sur un emplacement dédié — la seule donnée irremplaçable de la stack.
- Attacher **un seul service** de la stack au réseau `proxy` de Traefik, en gardant base de données, cache et ML sur le réseau interne.
- Mettre en place les **apps mobiles** avec sauvegarde automatique.
- Sauvegarder **base de données + photos** avec la bonne méthode pour chacune.

Tu manipuleras au passage : `docker compose`, réseaux Docker multiples par conteneur, `pg_dumpall`, labels Traefik, cron.
:::

:::lang en
By the end of this guide, you'll know how to:

- Deploy a complete **multi-container stack** (server + database + cache + machine learning) from the project's official compose file.
- Use an **official `.env` file** provided by the project (instead of inline config), and **pin a precise version**.
- Configure **photo storage** on a dedicated location — the only irreplaceable data in the stack.
- Attach **a single service** of the stack to Traefik's `proxy` network, keeping the database, cache and ML on the internal network.
- Set up the **mobile apps** with automatic backup.
- Back up **database + photos** with the right method for each.

Along the way you'll handle: `docker compose`, multiple Docker networks per container, `pg_dumpall`, Traefik labels, cron.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- **Docker et Docker Compose** maîtrisés (conteneurs, images, volumes, `compose.yaml`).
- Un **reverse proxy Traefik fonctionnel**, avec son réseau Docker `proxy` et son certresolver nommé `le` (mis en place dans le guide Traefik).
- Au moins **6 Go de RAM** disponibles sur ton serveur (4 Go si tu désactives le machine learning).
- Au moins **50 Go de disque** libres, idéalement sur un disque dédié (pas ton disque système).
- Un **sous-domaine** que tu contrôles (ex. `photos.exemple.com`), pointant vers ton serveur.
- Un **smartphone iOS ou Android** pour l'app mobile.

**Pourquoi la RAM compte ici :** le service de machine learning (recherche intelligente, reconnaissance faciale) charge des modèles en mémoire. C'est lui qui fait la magie d'Immich, mais c'est aussi lui qui consomme. On verra comment le désactiver si ta machine est modeste.
:::

:::lang en
You should have:

- **Docker and Docker Compose** under your belt (containers, images, volumes, `compose.yaml`).
- A **working Traefik reverse proxy**, with its `proxy` Docker network and its cert resolver named `le` (set up in the Traefik guide).
- At least **6 GB of RAM** available on your server (4 GB if you disable machine learning).
- At least **50 GB of free disk**, ideally on a dedicated disk (not your system disk).
- A **subdomain** you control (e.g. `photos.exemple.com`), pointed at your server.
- An **iOS or Android smartphone** for the mobile app.

**Why RAM matters here:** the machine learning service (smart search, face recognition) loads models into memory. It's what makes Immich magical — and what makes it hungry. We'll see how to disable it if your machine is modest.
:::

## concepts

:::lang fr
Voici ce qu'on va construire — quatre conteneurs qui coopèrent, mais **un seul** exposé au monde via Traefik.
:::

:::lang en
Here's what we're building — four containers working together, but **only one** exposed to the world through Traefik.
:::

:::figure immich-architecture
caption_fr: "Schéma 1. Architecture Immich : serveur + machine learning + PostgreSQL + Redis, seul le serveur rejoint le réseau proxy."
caption_en: "Figure 1. Immich architecture: server + machine learning + PostgreSQL + Redis; only the server joins the proxy network."
:::

:::lang fr
**Points clés à retenir :**

- **`immich-server`** est la porte d'entrée : API, interface web, réception des uploads. C'est le **seul** service qui rejoint le réseau `proxy` de Traefik.
- **`immich-machine-learning`**, **`postgres`** et **`redis`** ne parlent qu'au serveur, via le réseau **interne** de la stack (le réseau `default` créé par Compose). Ils ne doivent **jamais** être attachés au réseau `proxy` : une base de données n'a rien à faire sur un réseau partagé avec d'autres stacks.
- Un conteneur peut être sur **plusieurs réseaux à la fois** — `immich-server` sera sur `default` ET `proxy`. C'est LE pattern à connaître pour intégrer une stack à un reverse proxy externe.
- **`UPLOAD_LOCATION`** est le composant critique : c'est ton dossier de photos, sur le disque hôte. Tout le reste (conteneurs, cache, miniatures, et même la base si tu as des dumps) est reconstructible. **Pas lui.**
- La **base PostgreSQL** contient les métadonnées : albums, visages, favoris, index de recherche. La perdre ne détruit pas tes photos, mais les réduit à un tas de fichiers anonymes.
:::

:::lang en
**Key takeaways:**

- **`immich-server`** is the front door: API, web UI, upload handling. It's the **only** service that joins Traefik's `proxy` network.
- **`immich-machine-learning`**, **`postgres`** and **`redis`** talk only to the server, through the stack's **internal** network (the `default` network created by Compose). They must **never** be attached to the `proxy` network: a database has no business on a network shared with other stacks.
- A container can sit on **several networks at once** — `immich-server` will be on `default` AND `proxy`. That's THE pattern to know for plugging a stack into an external reverse proxy.
- **`UPLOAD_LOCATION`** is the critical component: it's your photo folder, on the host disk. Everything else (containers, cache, thumbnails, even the database if you have dumps) can be rebuilt. **Not that folder.**
- The **PostgreSQL database** holds the metadata: albums, faces, favorites, search index. Losing it doesn't destroy your photos, but it reduces them to a pile of anonymous files.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Préparer le stockage — deux dossiers séparés, sur un emplacement avec beaucoup d'espace.

**🤔 Pourquoi 2 dossiers séparés ?**

- `library/` → tes photos brutes + miniatures + transcodes vidéo. Gros volume, change uniquement par ajout.
- `postgres/` → la base de données (métadonnées, albums, visages, index de recherche). Petit volume, mais doit être sauvegardé **figé**, pas copié à chaud.

Les séparer permet de les sauvegarder différemment (on verra ça à l'étape 8). Et choisis ton emplacement avec soin : idéalement un disque dédié, pas ton disque système — une photothèque, ça grossit vite.
:::

:::lang en
**Goal.** Prepare the storage — two separate folders, on a location with plenty of space.

**🤔 Why 2 separate folders?**

- `library/` → your raw photos + thumbnails + video transcodes. Big volume, changes only by addition.
- `postgres/` → the database (metadata, albums, faces, search index). Small volume, but it must be backed up **frozen**, not copied hot.

Keeping them apart lets you back them up differently (we'll get to that in step 8). And pick your location carefully: ideally a dedicated disk, not your system disk — a photo library grows fast.
:::

```bash
sudo mkdir -p /mnt/data/immich/library
sudo mkdir -p /mnt/data/immich/postgres
sudo chown -R $USER:$USER /mnt/data/immich
```

:::lang fr
**✅ Vérification :**
:::

:::lang en
**✅ Check:**
:::

```bash
ls -la /mnt/data/immich
# Doit montrer library/ et postgres/, appartenant à ton utilisateur
df -h /mnt/data
# Vérifie qu'il y a bien >= 50 Go libres
```

### step-02

:::lang fr
**Objectif.** Récupérer les fichiers officiels du projet — le `compose.yaml` et le `.env` d'exemple — **pour la version qu'on valide**, pas "latest".

**🤔 Pourquoi le compose officiel et pas en écrire un à la main ?** La stack Immich, c'est 4 conteneurs interdépendants dont les versions doivent matcher entre elles, et ça évolue à chaque release. Le compose officiel garantit la compatibilité. Maintenir un compose custom = casse assurée à chaque mise à jour majeure. Et on télécharge les fichiers de la release **v1.135.3** précisément (pas `latest/download`), pour que le compose corresponde à la version d'image qu'on va pinner.
:::

:::lang en
**Goal.** Grab the project's official files — the `compose.yaml` and the example `.env` — **for the version we're validating**, not "latest".

**🤔 Why the official compose file instead of writing one by hand?** The Immich stack is 4 interdependent containers whose versions must match each other, and it evolves with every release. The official compose file guarantees compatibility. Maintaining a custom compose = guaranteed breakage at every major update. And we download the files from release **v1.135.3** specifically (not `latest/download`), so the compose file matches the image version we're about to pin.
:::

```bash
mkdir -p ~/immich && cd ~/immich
wget -O compose.yaml https://github.com/immich-app/immich/releases/download/v1.135.3/docker-compose.yml
wget -O .env https://github.com/immich-app/immich/releases/download/v1.135.3/example.env
```

:::lang fr
**✅ Vérification :**
:::

:::lang en
**✅ Check:**
:::

```bash
ls -la ~/immich
# compose.yaml et .env présents, non vides
grep "image:" compose.yaml
# 4 images : immich-server, immich-machine-learning, redis/valkey, postgres
```

### step-03

:::lang fr
**Objectif.** Configurer `.env` : chemins de stockage, version pinée, mot de passe base de données.

**🤔 Pourquoi pinner `IMMICH_VERSION` ?** Le tag `release` est **flottant** : il suit les dernières versions publiées. Une mise à jour majeure peut casser la migration de la base de données pendant que tu dors. En pinnant `v1.135.3`, c'est **toi** qui décides quand mettre à jour — après avoir lu les release notes (Immich documente clairement ses breaking changes).

**🤔 Pourquoi `UPLOAD_LOCATION` est si critique ?** Si tu te trompes ici et que tu commences à uploader 50 000 photos, les déplacer ensuite est pénible (chemins référencés en base, miniatures à recalculer). Choisis bien **la première fois**.
:::

:::lang en
**Goal.** Configure `.env`: storage paths, pinned version, database password.

**🤔 Why pin `IMMICH_VERSION`?** The `release` tag is **floating**: it tracks whatever gets published. A major update can break the database migration while you sleep. By pinning `v1.135.3`, **you** decide when to update — after reading the release notes (Immich documents its breaking changes clearly).

**🤔 Why is `UPLOAD_LOCATION` so critical?** If you get it wrong here and start uploading 50,000 photos, moving them later is painful (paths referenced in the database, thumbnails to recompute). Choose well **the first time**.
:::

```bash
nano .env
```

```env
# CHEMINS — adapte à ton stockage / adjust to your storage
UPLOAD_LOCATION=/mnt/data/immich/library
DB_DATA_LOCATION=/mnt/data/immich/postgres

# VERSION — pinée explicitement, jamais "release" (tag flottant)
# pinned explicitly, never the floating "release" tag
IMMICH_VERSION=v1.135.3

# BASE DE DONNÉES — mot de passe fort aléatoire (voir commande ci-dessous)
DB_PASSWORD=remplace-par-un-mot-de-passe-fort-aleatoire

# DB internes (laisse par défaut / leave as default)
DB_USERNAME=postgres
DB_DATABASE_NAME=immich

# Fuseau horaire / Timezone (important pour les timestamps des photos)
TZ=Europe/Paris
```

:::lang fr
Génère un mot de passe fort pour `DB_PASSWORD` :
:::

:::lang en
Generate a strong password for `DB_PASSWORD`:
:::

```bash
openssl rand -base64 32
```

:::lang fr
Colle-le tel quel dans `.env`, **sans guillemets** — comme pour Vaultwarden, des guillemets parasites peuvent finir littéralement dans la valeur.

**✅ Vérification :**

```bash
cat .env
# UPLOAD_LOCATION et DB_DATA_LOCATION pointent vers tes dossiers de l'étape 1,
# IMMICH_VERSION=v1.135.3, DB_PASSWORD n'est plus la valeur d'exemple
```
:::

:::lang en
Paste it as-is into `.env`, **without quotes** — as with Vaultwarden, stray quotes can end up literally inside the value.

**✅ Check:**

```bash
cat .env
# UPLOAD_LOCATION and DB_DATA_LOCATION point to your step-1 folders,
# IMMICH_VERSION=v1.135.3, DB_PASSWORD is no longer the example value
```
:::

### step-04

:::lang fr
**Objectif.** Adapter le compose pour Traefik : retirer l'exposition du port, attacher `immich-server` au réseau `proxy`, ajouter les labels.

**🤔 Pourquoi `default` ET `proxy` ?**

- `default` (le réseau créé automatiquement par Compose pour cette stack) → permet à `immich-server` de parler à `immich-machine-learning`, `database` et `redis`. Si tu mets **seulement** `proxy`, le serveur perd l'accès à sa base et la stack casse.
- `proxy` → permet à Traefik de joindre `immich-server`, sans exposer un seul port sur l'hôte.

⚠️ **Règle absolue** : seul `immich-server` rejoint `proxy`. Les autres services (ML, base de données, redis) restent sur `default` uniquement — ils ne doivent **jamais** être joignables depuis le réseau partagé. Une base de données sur `proxy` serait accessible à tous les conteneurs des autres stacks branchées sur ce réseau.

Note : le compose officiel nomme parfois le service avec un underscore (`immich_server` en `container_name`) — adapte au nom réel dans **ton** fichier.
:::

:::lang en
**Goal.** Adapt the compose file for Traefik: remove the port exposure, attach `immich-server` to the `proxy` network, add the labels.

**🤔 Why `default` AND `proxy`?**

- `default` (the network Compose creates automatically for this stack) → lets `immich-server` talk to `immich-machine-learning`, `database` and `redis`. If you set **only** `proxy`, the server loses access to its database and the stack breaks.
- `proxy` → lets Traefik reach `immich-server`, without exposing a single port on the host.

⚠️ **Absolute rule**: only `immich-server` joins `proxy`. The other services (ML, database, redis) stay on `default` only — they must **never** be reachable from the shared network. A database on `proxy` would be accessible to every container of every other stack plugged into that network.

Note: the official compose file sometimes names the service with an underscore (`immich_server` as `container_name`) — adapt to the actual name in **your** file.
:::

```bash
nano compose.yaml
```

```yaml
  immich-server:
    container_name: immich_server
    image: ghcr.io/immich-app/immich-server:${IMMICH_VERSION}
    # ... reste du service inchangé / rest of the service unchanged
    #     (volumes, env_file, depends_on, etc.) ...

    # Supprime ou commente la section "ports:" si présente
    # Remove or comment out the "ports:" section if present
    # ports:
    #   - "2283:2283"

    networks:
      - default      # réseau interne Immich (server ↔ ML ↔ db ↔ redis)
      - proxy        # réseau partagé avec Traefik / shared with Traefik

    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.immich.rule=Host(`photos.exemple.com`)"
      - "traefik.http.routers.immich.entrypoints=websecure"
      - "traefik.http.routers.immich.tls.certresolver=le"
      - "traefik.http.services.immich.loadbalancer.server.port=2283"

# À la fin du fichier, ajoute proxy au bloc networks.
# NE redéclare PAS "default" : Compose le crée automatiquement.
# At the end of the file, add proxy to the networks block.
# Do NOT redeclare "default": Compose creates it automatically.
networks:
  proxy:
    external: true
```

:::lang fr
⚠️ Le nom du `certresolver` (`le`) doit correspondre **exactement** à celui défini dans ta config Traefik (dans le guide Traefik, on l'a nommé `le`). Sinon : erreur "certificate resolver not found".

**✅ Vérification :**

```bash
docker compose config
# Config interprétée sans erreur. Contrôle que :
# - "proxy" n'apparaît QUE sous immich-server (jamais sous database, redis, ML)
# - aucune section ports: ne subsiste sur immich-server
```

Si tu vois `network proxy declared as external, but could not be found` → crée-le (`docker network create proxy`) ou repasse par le guide Traefik.
:::

:::lang en
⚠️ The `certresolver` name (`le`) must match **exactly** the one defined in your Traefik config (in the Traefik guide we named it `le`). Otherwise: "certificate resolver not found".

**✅ Check:**

```bash
docker compose config
# Parsed config with no error. Verify that:
# - "proxy" appears ONLY under immich-server (never under database, redis, ML)
# - no ports: section remains on immich-server
```

If you see `network proxy declared as external, but could not be found` → create it (`docker network create proxy`) or go back through the Traefik guide.
:::

### step-05

:::lang fr
**Objectif.** Télécharger les images, puis lancer la stack.

**🤔 Pourquoi `pull` séparé du `up` ?** Pour forcer le téléchargement des images **avant** le démarrage. Les images Immich sont lourdes (le ML surtout) ; sans `pull` préalable, `up -d` télécharge en arrière-plan et tu peux croire à un crash quand c'est juste long.
:::

:::lang en
**Goal.** Download the images, then launch the stack.

**🤔 Why a separate `pull` before `up`?** To force the image download **before** startup. Immich images are heavy (the ML one especially); without a prior `pull`, `up -d` downloads in the background and you may mistake a long download for a crash.
:::

```bash
docker compose pull
docker compose up -d
docker compose logs -f immich-server
```

:::lang fr
**Premier démarrage** : la base initialise son schéma, ça peut prendre **2 à 5 minutes**. Dans les logs, tu dois voir passer :

- `Immich Server is listening` (le serveur écoute sur le port 2283)
- Aucune boucle de redémarrage, aucune erreur de connexion à la base

`Ctrl+C` pour quitter les logs (ça n'arrête pas les conteneurs).

**✅ Vérification :**

```bash
docker compose ps
# 4 services "Up" : immich_server, immich_machine_learning, database, redis

docker network inspect proxy --format '{{range .Containers}}{{.Name}} {{end}}'
# Doit lister traefik et immich_server — et SURTOUT PAS database, redis ou ML
```
:::

:::lang en
**First startup**: the database initializes its schema, which can take **2 to 5 minutes**. In the logs you should see:

- `Immich Server is listening` (the server listens on port 2283)
- No restart loop, no database connection errors

`Ctrl+C` to leave the logs (it does not stop the containers).

**✅ Check:**

```bash
docker compose ps
# 4 services "Up": immich_server, immich_machine_learning, database, redis

docker network inspect proxy --format '{{range .Containers}}{{.Name}} {{end}}'
# Must list traefik and immich_server — and DEFINITELY NOT database, redis or ML
```
:::

### step-06

:::lang fr
**Objectif.** Créer le compte admin et régler les deux paramètres à faire **avant** tout upload.

**🤔 Pourquoi maintenant ?** Le **premier compte créé devient admin** : si tu tardes et que ton URL fuite, quelqu'un d'autre pourrait le créer à ta place. Et le **Storage Template** doit être configuré **avant** d'uploader : par défaut, Immich nomme tes fichiers avec des UUIDs illisibles. Avec un template type `{{y}}/{{y}}-{{MM}}/{{filename}}`, tes photos sont rangées par année/mois sur le disque — si un jour tu dois récupérer tes fichiers "à la main", tu les retrouves.
:::

:::lang en
**Goal.** Create the admin account and set the two settings that must be done **before** any upload.

**🤔 Why now?** The **first account created becomes admin**: if you wait and your URL leaks, someone else could create it in your place. And the **Storage Template** must be configured **before** uploading: by default, Immich names your files with unreadable UUIDs. With a template like `{{y}}/{{y}}-{{MM}}/{{filename}}`, your photos are organized by year/month on disk — if one day you need to recover files "by hand", you'll find them.
:::

:::lang fr
**Action 1.** Ouvre `https://photos.exemple.com` → première page = **création du compte admin**. Choisis un mot de passe fort et note-le : c'est lui qui gouverne l'instance.

**Action 2.** Administration → Settings → **Machine Learning Settings** : active/désactive la reconnaissance faciale et la recherche intelligente selon ta RAM.

**Action 3.** Administration → Settings → **Storage Template** : active le template et choisis un schéma lisible (ex. `{{y}}/{{y}}-{{MM}}/{{filename}}`). **À faire AVANT d'uploader.**

**✅ Vérification :** tu es connecté en admin sur `https://photos.exemple.com` avec un cadenas vert, et le Storage Template est activé (Administration → Settings).
:::

:::lang en
**Action 1.** Open `https://photos.exemple.com` → first page = **admin account creation**. Pick a strong password and write it down: it governs the instance.

**Action 2.** Administration → Settings → **Machine Learning Settings**: enable/disable face recognition and smart search based on your RAM.

**Action 3.** Administration → Settings → **Storage Template**: enable the template and choose a readable scheme (e.g. `{{y}}/{{y}}-{{MM}}/{{filename}}`). **Do this BEFORE uploading.**

**✅ Check:** you're logged in as admin at `https://photos.exemple.com` with a green padlock, and the Storage Template is enabled (Administration → Settings).
:::

### step-07

:::lang fr
**Objectif.** Installer l'app mobile et activer la sauvegarde automatique.

**🤔 Pourquoi Auto Backup change tout ?** C'est ce qui fait d'Immich un vrai remplaçant de Google Photos : chaque photo prise est automatiquement envoyée à ton serveur, en wifi (ou en data si tu l'autorises). Tu peux ensuite libérer de l'espace sur ton téléphone sans crainte.
:::

:::lang en
**Goal.** Install the mobile app and enable automatic backup.

**🤔 Why does Auto Backup change everything?** It's what makes Immich a true Google Photos replacement: every photo you take is automatically sent to your server, over wifi (or mobile data if you allow it). You can then free up space on your phone without worry.
:::

:::lang fr
**Action 1.** Installe **Immich** depuis l'App Store ou le Play Store.

**Action 2.** À la première ouverture, **Server Endpoint URL** : `https://photos.exemple.com` (avec le `https://`, sans slash final), puis connecte-toi avec ton compte.

**Action 3.** Active **Auto Backup** dans les paramètres de l'app et sélectionne les albums du téléphone à sauvegarder.

Le premier backup peut prendre **des heures, voire des jours** selon ta volumétrie. Laisse l'app ouverte, ou active le backup en arrière-plan (Android : pense à exclure Immich de l'optimisation batterie).

**✅ Vérification :** prends une photo test avec le téléphone. Elle doit apparaître dans la web UI (`https://photos.exemple.com`) en quelques secondes.
:::

:::lang en
**Action 1.** Install **Immich** from the App Store or Play Store.

**Action 2.** On first launch, **Server Endpoint URL**: `https://photos.exemple.com` (with the `https://`, no trailing slash), then log in with your account.

**Action 3.** Enable **Auto Backup** in the app settings and select which phone albums to back up.

The first backup can take **hours, even days** depending on your volume. Keep the app open, or enable background backup (Android: remember to exclude Immich from battery optimization).

**✅ Check:** take a test photo with your phone. It must show up in the web UI (`https://photos.exemple.com`) within a few seconds.
:::

### step-08

:::lang fr
**Objectif.** Sauvegarde automatique quotidienne : dump PostgreSQL cohérent + synchronisation des photos.

**🤔 Pourquoi `pg_dumpall` et pas un `cp -r` du dossier postgres ?** Copier les fichiers d'une base PostgreSQL en cours d'écriture = backup potentiellement corrompu. `pg_dumpall`, exécuté **dans** le conteneur `database` (le binaire y est présent, contrairement au `sqlite3` absent de l'image Vaultwarden), produit un SQL cohérent même base active.

**🤔 Pourquoi 2 sauvegardes séparées ?** Les photos (`UPLOAD_LOCATION`) sont énormes (Go → To) et ne changent que par ajout : sauvegarde incrémentale (rsync, Restic, B2). La base est petite (centaines de Mo) mais doit être dumpée proprement. Deux natures de données, deux méthodes.
:::

:::lang en
**Goal.** Automated daily backup: a consistent PostgreSQL dump + photo synchronization.

**🤔 Why `pg_dumpall` and not a `cp -r` of the postgres folder?** Copying the files of a PostgreSQL database while it's being written = potentially corrupted backup. `pg_dumpall`, run **inside** the `database` container (the binary is present there, unlike the `sqlite3` missing from the Vaultwarden image), produces consistent SQL even with the database live.

**🤔 Why 2 separate backups?** The photos (`UPLOAD_LOCATION`) are huge (GB → TB) and change only by addition: incremental backup (rsync, Restic, B2). The database is small (hundreds of MB) but must be dumped properly. Two kinds of data, two methods.
:::

:::lang fr
Crée `~/immich/backup.sh` :
:::

:::lang en
Create `~/immich/backup.sh`:
:::

```bash
#!/bin/bash
set -e

BACKUP_DIR="$HOME/backups/immich"
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"

cd "$HOME/immich"

# Dump Postgres cohérent, exécuté DANS le conteneur database
# Consistent Postgres dump, run INSIDE the database container
docker compose exec -T database pg_dumpall --clean --if-exists --username=postgres \
  | gzip > "$BACKUP_DIR/immich-db-$DATE.sql.gz"

# Garde uniquement les 14 derniers dumps / keep only the last 14 dumps
ls -tp "$BACKUP_DIR"/immich-db-*.sql.gz | tail -n +15 | xargs -r rm --

echo "✓ DB backup OK : immich-db-$DATE.sql.gz"
echo "⚠️ Pense à synchroniser UPLOAD_LOCATION vers un stockage externe (rsync/Restic/B2)"
```

:::lang fr
Rends-le exécutable et programme-le en cron :

```bash
chmod +x ~/immich/backup.sh
crontab -e
# Ajoute :
0 4 * * * /home/<toi>/immich/backup.sh >> /home/<toi>/immich/backup.log 2>&1
```

**✅ Vérification :**

```bash
~/immich/backup.sh
ls -la ~/backups/immich/
# Tu dois voir immich-db-YYYYMMDD-HHMMSS.sql.gz, taille non nulle
zcat ~/backups/immich/immich-db-*.sql.gz | head -5
# Doit afficher du SQL (en-tête pg_dumpall), pas du binaire ni du vide
```

⚠️ **Ce dump est local et ne couvre pas les photos.** Une vraie stratégie copie le dump **et** `UPLOAD_LOCATION` ailleurs (autre disque, cloud chiffré type Restic + B2). Et surtout : tu n'as pas un backup, tu as un **plan de restauration testé** — teste la restauration au moins une fois.
:::

:::lang en
Make it executable and schedule it via cron:

```bash
chmod +x ~/immich/backup.sh
crontab -e
# Add:
0 4 * * * /home/<you>/immich/backup.sh >> /home/<you>/immich/backup.log 2>&1
```

**✅ Check:**

```bash
~/immich/backup.sh
ls -la ~/backups/immich/
# You should see immich-db-YYYYMMDD-HHMMSS.sql.gz, non-zero size
zcat ~/backups/immich/immich-db-*.sql.gz | head -5
# Must print SQL (pg_dumpall header), not binary and not empty
```

⚠️ **This dump is local and does not cover the photos.** A real strategy copies the dump **and** `UPLOAD_LOCATION` elsewhere (another disk, encrypted cloud like Restic + B2). Above all: you don't have a backup, you have a **tested restore plan** — test the restore at least once.
:::

## pitfalls

:::lang fr
**1. Tu attaches `database`, `redis` ou le ML au réseau `proxy`.** Le réseau `proxy` est partagé entre toutes tes stacks : tout conteneur qui y est attaché est joignable par tous les autres. Seul `immich-server` doit y être. Vérifie avec `docker network inspect proxy` — si tu y vois `database` ou `redis`, corrige immédiatement.

**2. Tu utilises `IMMICH_VERSION=release` (ou `:latest`).** Tag flottant : une mise à jour majeure peut casser la migration de la base pendant que tu dors. **Toujours pinner** (`v1.135.3`), et mettre à jour consciemment après lecture des release notes.

**3. Tu changes `UPLOAD_LOCATION` après avoir uploadé des photos.** Les chemins sont référencés en base. La migration est possible mais douloureuse (déplacement + vérifications). Choisis bien au premier jour — disque dédié, espace généreux.

**4. Tu fais `docker compose down -v` "pour tester".** ⚠️ Le `-v` **supprime les volumes**, y compris la base PostgreSQL : albums, visages, métadonnées perdus. Les photos restent dans `UPLOAD_LOCATION` (bind mount), mais sans la base ce sont des fichiers anonymes. N'utilise **jamais** `-v` sur cette stack sans un dump récent et restaurable.

**5. Le ML mange toute ta RAM.** Le conteneur `immich-machine-learning` charge des modèles lourds. Sur une machine modeste : désactive la reconnaissance faciale et la recherche intelligente dans Administration → Settings, ou retire carrément le service du compose.

**6. Le backup mobile ne tourne pas en arrière-plan (Android).** Android tue les apps en arrière-plan. Exclus Immich de l'optimisation batterie et autorise l'activité en arrière-plan, sinon le backup ne se fait que quand l'app est ouverte.

**7. Tu donnes l'URL HTTP à l'app.** L'app **refuse** d'envoyer tes photos en clair. Toujours l'URL HTTPS avec un certificat valide — si le cadenas n'est pas vert dans le navigateur du téléphone, l'app ne marchera pas non plus.

**8. Tu mets à jour sans lire les release notes.** Immich documente clairement ses breaking changes (étapes manuelles, migrations). Rituel de mise à jour : dump de la base → lecture des release notes → changement du tag dans `.env` → `pull` + `up -d`.
:::

:::lang en
**1. You attach `database`, `redis` or the ML to the `proxy` network.** The `proxy` network is shared across all your stacks: any container attached to it is reachable by all the others. Only `immich-server` belongs there. Check with `docker network inspect proxy` — if you see `database` or `redis` in there, fix it immediately.

**2. You use `IMMICH_VERSION=release` (or `:latest`).** Floating tag: a major update can break the database migration while you sleep. **Always pin** (`v1.135.3`), and update deliberately after reading the release notes.

**3. You change `UPLOAD_LOCATION` after uploading photos.** Paths are referenced in the database. Migration is possible but painful (moving files + verification). Choose well on day one — dedicated disk, generous space.

**4. You run `docker compose down -v` "just to test".** ⚠️ The `-v` **deletes the volumes**, including the PostgreSQL database: albums, faces, metadata gone. The photos stay in `UPLOAD_LOCATION` (bind mount), but without the database they're anonymous files. **Never** use `-v` on this stack without a recent, restorable dump.

**5. The ML eats all your RAM.** The `immich-machine-learning` container loads heavy models. On a modest machine: disable face recognition and smart search in Administration → Settings, or remove the service from the compose file entirely.

**6. Mobile backup doesn't run in the background (Android).** Android kills background apps. Exclude Immich from battery optimization and allow background activity, otherwise backup only happens while the app is open.

**7. You give the app the HTTP URL.** The app **refuses** to send your photos in clear text. Always the HTTPS URL with a valid certificate — if the padlock isn't green in the phone's browser, the app won't work either.

**8. You update without reading the release notes.** Immich documents its breaking changes clearly (manual steps, migrations). Update ritual: database dump → read the release notes → change the tag in `.env` → `pull` + `up -d`.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] `docker compose ps` montre les 4 services `Up` (server, machine-learning, database, redis).
- [ ] `docker network inspect proxy` ne liste que `traefik` et `immich_server` — jamais la base, le cache ou le ML.
- [ ] `https://photos.exemple.com` charge la web UI avec un cadenas vert.
- [ ] L'app mobile se connecte et une photo test uploadée apparaît dans la web UI en quelques secondes.
- [ ] La recherche en langage naturel fonctionne ("plage", "chien"…) — si tu as gardé le ML activé.
- [ ] `~/immich/backup.sh` produit un dump SQL non vide, et le cron est en place.
- [ ] Tu as documenté (et testé) comment **restaurer** : dump + photos → instance fonctionnelle.

Si tout est coché, tu as un Immich **propre, cloisonné et sauvegardé**. Tes souvenirs sont chez toi.
:::

:::lang en
You know it works when…

- [ ] `docker compose ps` shows all 4 services `Up` (server, machine-learning, database, redis).
- [ ] `docker network inspect proxy` lists only `traefik` and `immich_server` — never the database, cache or ML.
- [ ] `https://photos.exemple.com` loads the web UI with a green padlock.
- [ ] The mobile app connects, and an uploaded test photo shows up in the web UI within seconds.
- [ ] Natural-language search works ("beach", "dog"…) — if you kept ML enabled.
- [ ] `~/immich/backup.sh` produces a non-empty SQL dump, and the cron job is in place.
- [ ] You have documented (and tested) how to **restore**: dump + photos → working instance.

If everything is ticked, you have a **clean, isolated, and backed-up** Immich. Your memories live at home.
:::

## next

:::lang fr
Prolongements naturels, du plus utile au plus avancé :

1. **Surveiller ta stack** — 4 conteneurs, une base, un service ML : c'est exactement le genre de système qu'on veut monitorer avant qu'il tombe en silence. Direction le guide monitoring.
2. **Backups offsite chiffrés** — Restic vers un cloud type B2/S3, pour le dump **et** `UPLOAD_LOCATION`.
3. **External Libraries** — indexer une photothèque existante sur le disque, sans la copier dans Immich.
4. **Transcodage matériel** — si tu as un GPU Intel/NVIDIA, accélère la lecture vidéo (doc officielle, section "Hardware Transcoding").
5. **OAuth / SSO** — à plusieurs utilisateurs, brancher Authentik ou Authelia.
:::

:::lang en
Natural extensions, from most useful to most advanced:

1. **Monitor your stack** — 4 containers, a database, an ML service: exactly the kind of system you want monitored before it fails silently. Head to the monitoring guide.
2. **Encrypted offsite backups** — Restic to a B2/S3-style cloud, for the dump **and** `UPLOAD_LOCATION`.
3. **External Libraries** — index an existing photo library on disk without copying it into Immich.
4. **Hardware transcoding** — if you have an Intel/NVIDIA GPU, accelerate video playback (official docs, "Hardware Transcoding" section).
5. **OAuth / SSO** — with several users, plug in Authentik or Authelia.
:::

## cheatsheet

:::lang fr
Aide-mémoire des commandes clés pour gérer ta stack au quotidien.
:::

:::lang en
Key commands cheat sheet to operate your stack day-to-day.
:::

```bash
# Cycle de vie / Lifecycle
docker compose up -d                    # démarrer / start
docker compose ps                       # statut des 4 services / status
docker compose logs -f immich-server    # suivre les logs / follow logs
docker compose down                     # arrêter / stop (données préservées / data preserved)
# ⚠️ JAMAIS "down -v" sans dump récent : -v supprime la base Postgres !
# ⚠️ NEVER "down -v" without a fresh dump: -v deletes the Postgres database!

# Inspecter / Inspect
docker network inspect proxy            # seul immich_server (+ traefik) doit y être
                                        # only immich_server (+ traefik) should be there
docker compose exec immich-server env | grep IMMICH   # version effective / running version

# Mettre à jour / Update (dump + release notes D'ABORD / FIRST)
~/immich/backup.sh
# 1. lire https://github.com/immich-app/immich/releases
# 2. éditer IMMICH_VERSION=vX.Y.Z dans .env
docker compose pull && docker compose up -d

# Sauvegarde manuelle / Manual backup
~/immich/backup.sh

# Restauration DB / DB restore
# ⚠️ Écrase la base actuelle — à faire sur une base vide ou sacrifiable.
# ⚠️ Overwrites the current database — only on an empty or expendable one.
docker compose down
docker compose up -d database
zcat ~/backups/immich/immich-db-YYYYMMDD-HHMMSS.sql.gz \
  | docker compose exec -T database psql --username=postgres
docker compose up -d
```

## resources

:::lang fr
- [Documentation officielle Immich](https://immich.app/docs) — installation, FAQ, options avancées.
- [Repo GitHub immich-app/immich](https://github.com/immich-app/immich) — code source et issues.
- [Release notes](https://github.com/immich-app/immich/releases) — **à lire avant chaque mise à jour** (breaking changes documentés).
- [Guide officiel de sauvegarde/restauration](https://immich.app/docs/administration/backup-and-restore) — la référence pour le plan de restore.
:::

:::lang en
- [Official Immich documentation](https://immich.app/docs) — installation, FAQ, advanced options.
- [GitHub repo immich-app/immich](https://github.com/immich-app/immich) — source code and issues.
- [Release notes](https://github.com/immich-app/immich/releases) — **read before every update** (breaking changes are documented).
- [Official backup/restore guide](https://immich.app/docs/administration/backup-and-restore) — the reference for your restore plan.
:::

## troubleshooting

:::lang fr
**« 502 Bad Gateway » via Traefik.** Le serveur Immich n'est pas encore prêt : au premier démarrage, l'initialisation de la base prend 2 à 5 minutes. Si ça persiste : `docker compose logs --tail=50 immich-server`. Vérifie aussi que `immich-server` est bien sur le réseau `proxy` (`docker network inspect proxy`) et que le label `loadbalancer.server.port=2283` est présent.

**« Failed to fetch » / connexion impossible sur l'app mobile.** URL incorrecte (HTTP au lieu de HTTPS, slash final, mauvais sous-domaine) ou certificat invalide. Test : ouvre `https://photos.exemple.com` dans le **navigateur du téléphone** — si le cadenas n'est pas vert, le problème est côté Traefik/DNS, pas côté Immich.

**L'upload de grosses vidéos patine ou échoue.** Souvent une limite de taille côté reverse proxy. Traefik ne bufferise pas par défaut (les gros uploads passent), mais si tu as ajouté un middleware `buffering`, augmente ses limites. Derrière un autre proxy (Nginx : `client_max_body_size` à 1 Mo par défaut), c'est la cause n°1.

**La migration de la base échoue après une mise à jour.** Ne bricole pas : restaure le dump pris **avant** la mise à jour (voir cheatsheet), puis lis les release notes de la version visée — il y a souvent une étape manuelle documentée ou une version intermédiaire obligatoire.
:::

:::lang en
**"502 Bad Gateway" through Traefik.** The Immich server isn't ready yet: on first startup, database initialization takes 2 to 5 minutes. If it persists: `docker compose logs --tail=50 immich-server`. Also verify that `immich-server` is on the `proxy` network (`docker network inspect proxy`) and that the `loadbalancer.server.port=2283` label is present.

**"Failed to fetch" / can't connect from the mobile app.** Wrong URL (HTTP instead of HTTPS, trailing slash, wrong subdomain) or invalid certificate. Test: open `https://photos.exemple.com` in the **phone's browser** — if the padlock isn't green, the problem is on the Traefik/DNS side, not Immich's.

**Large video uploads stall or fail.** Often a size limit on the reverse proxy side. Traefik doesn't buffer by default (big uploads go through), but if you added a `buffering` middleware, raise its limits. Behind another proxy (Nginx: `client_max_body_size` defaults to 1 MB), this is cause number one.

**Database migration fails after an update.** Don't improvise: restore the dump taken **before** the update (see cheatsheet), then read the release notes of the target version — there's often a documented manual step or a mandatory intermediate version.
:::
