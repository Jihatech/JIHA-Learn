---
# — Identité (ne change JAMAIS une fois publié) —
id: docker-fondamentaux
slug: docker-fondamentaux
order: 3
status: published

# — Titres & accroches (bilingue) —
title_fr: "Docker fondamentaux"
title_en: "Docker fundamentals"
tagline_fr: "Images, conteneurs, volumes, networks."
tagline_en: "Images, containers, volumes, networks."

# — Métadonnées pédagogiques —
level: beginner
duration_min: 90
repo: "moby/moby"
last_review: "2026-06-19"

# — Relations de parcours (par id) —
prerequisites: [art-of-command-line]
next: [docker-compose]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [images-vs-conteneurs, volumes-persistants, networks-docker, variables-environnement, dockerfile, hygiene-disque]
concepts_en: [images-vs-containers, persistent-volumes, docker-networks, environment-variables, dockerfile, disk-hygiene]

# — Accès (embryon du freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Guide pas-à-pas pour comprendre Docker en profondeur : images, conteneurs, volumes, networks, Dockerfile et hygiène disque."
og_description_en: "Step-by-step guide to truly understanding Docker: images, containers, volumes, networks, Dockerfile, and disk hygiene."
---

## intro

:::lang fr
Docker est **la** brique fondamentale de ton parcours self-hosting / DevOps / cloud. Sans Docker bien compris, tous les guides suivants (Traefik, Vaultwarden, Immich, monitoring) seront du copier-coller anxiogène.

Le problème avec la plupart des tutos Docker : ils te font lancer un `nginx` en 30 secondes et te déclarent « expert ». Tu ne sais ni ce qu'est une image, ni un volume, ni pourquoi ton conteneur perd ses données à chaque redémarrage.

Ce guide construit le **modèle mental d'abord**, le hands-on ensuite. L'objectif : apprendre Docker à un niveau qui te permet de **débugger**, pas juste de copier des `docker run`.

**Pour qui c'est :** tu as vaguement entendu parler de Docker, peut-être lancé un conteneur, et tu veux solidifier les bases.

**Quand ce n'est PAS le bon choix :**

- Tu connais déjà images vs conteneurs, volumes, networks, multi-stage builds → passe directement au guide Docker Compose.
- Tu veux apprendre Kubernetes → reviens à Docker d'abord. Docker est un prérequis dur.
:::

:::lang en
Docker is **the** foundational building block of your self-hosting / DevOps / cloud journey. Without a solid grasp of Docker, every guide that follows (Traefik, Vaultwarden, Immich, monitoring) will be anxiety-inducing copy-paste.

The problem with most Docker tutorials: they have you launch an `nginx` in 30 seconds and declare you an "expert". You don't know what an image is, or a volume, or why your container loses its data on every restart.

This guide builds the **mental model first**, hands-on second. The goal: learn Docker at a level where you can **debug**, not just copy `docker run` commands.

**Who it's for:** you've vaguely heard of Docker, maybe launched a container, and you want to solidify the basics.

**When it's NOT the right choice:**

- You already know images vs containers, volumes, networks, multi-stage builds → skip straight to the Docker Compose guide.
- You want to learn Kubernetes → come back to Docker first. Docker is a hard prerequisite.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- La différence **image vs conteneur** (et pourquoi c'est crucial).
- **Volumes** : faire persister les données entre redémarrages.
- **Networks** : comment des conteneurs se parlent.
- **Variables d'environnement** : configurer un service sans modifier l'image.
- **Dockerfile** : créer tes propres images.
- **Logs et debug** : `docker logs`, `docker exec`, `docker inspect`.
- Hygiène : nettoyer, lister, comprendre ce qui consomme ton disque.
:::

:::lang en
By the end of this guide, you'll know:

- The difference between **image and container** (and why it's crucial).
- **Volumes**: persisting data across restarts.
- **Networks**: how containers talk to each other.
- **Environment variables**: configuring a service without modifying the image.
- **Dockerfile**: building your own images.
- **Logs and debugging**: `docker logs`, `docker exec`, `docker inspect`.
- Hygiene: cleaning up, listing, understanding what eats your disk.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Une aisance en **ligne de commande Linux** (`cd`, `ls`, éditer un fichier) — sinon, repasse par le guide sur la ligne de commande.
- Une **machine Linux** (native ou VM), macOS, ou Windows avec WSL2 (installe Ubuntu via WSL2 si besoin).
- **Docker Engine installé** — suis le [guide officiel d'installation](https://docs.docker.com/engine/install/) pour ton OS.
- `docker --version` qui répond, et `docker run hello-world` qui fonctionne.

⚠️ **Sur Linux**, ajoute ton utilisateur au groupe `docker` pour éviter d'utiliser `sudo` à chaque commande :
:::

:::lang en
You should have:

- Comfort with the **Linux command line** (`cd`, `ls`, editing a file) — if not, go back through the command-line guide.
- A **Linux machine** (native or VM), macOS, or Windows with WSL2 (install Ubuntu via WSL2 if needed).
- **Docker Engine installed** — follow the [official installation guide](https://docs.docker.com/engine/install/) for your OS.
- `docker --version` responding, and `docker run hello-world` working.

⚠️ **On Linux**, add your user to the `docker` group to avoid typing `sudo` before every command:
:::

```bash
sudo usermod -aG docker $USER
```

:::lang fr
Puis déconnexion/reconnexion. Sinon, tu mettras `sudo` devant chaque `docker ...` ci-dessous.
:::

:::lang en
Then log out and back in. Otherwise, prefix every `docker ...` command below with `sudo`.
:::

## concepts

:::lang fr
Le modèle mental Docker tient en une phrase : **une image est une recette, un conteneur est le plat servi.** Une image peut produire 1000 conteneurs. Détruire un conteneur ne détruit pas son image.

Autour de ce duo gravitent trois briques : le **client** (`docker`, la commande que tu tapes), le **daemon** (`dockerd`, le service qui fait réellement le travail), et le **registry** (Docker Hub, d'où viennent les images). Quand tu tapes `docker run`, le client demande au daemon de créer un conteneur à partir d'une image — téléchargée du registry si elle n'est pas déjà locale.
:::

:::lang en
The Docker mental model fits in one sentence: **an image is a recipe, a container is the dish being served.** One image can produce 1000 containers. Destroying a container does not destroy its image.

Around this duo orbit three building blocks: the **client** (`docker`, the command you type), the **daemon** (`dockerd`, the service that actually does the work), and the **registry** (Docker Hub, where images come from). When you type `docker run`, the client asks the daemon to create a container from an image — downloaded from the registry if it isn't already local.
:::

:::figure docker-architecture
caption_fr: "Schéma 1. Architecture Docker : client → daemon → images/conteneurs, et le registry."
caption_en: "Figure 1. Docker architecture: client → daemon → images/containers, and the registry."
:::

:::lang fr
**Points clés à retenir :**

- L'**image** est un template figé (la « classe ») ; le **conteneur** est une instance vivante. Un `docker build` produit une image à partir d'un `Dockerfile` ; un `docker run` produit un conteneur à partir d'une image.
- Le **volume** contient les données persistantes : il survit à la destruction du conteneur. Sans volume, tout ce que le conteneur écrit meurt avec lui.
- Le **network** définit comment un conteneur parle aux autres (résolution DNS par nom dans les networks nommés).
- Les **variables d'environnement** configurent un conteneur sans toucher à l'image.

On va explorer chaque brique dans cet ordre : premiers conteneurs (run, ps, stop, rm) → logs & exec (debug) → variables d'env (configuration) → volumes (persistance) → networks (communication) → Dockerfile (créer ses images) → hygiène.
:::

:::lang en
**Key takeaways:**

- The **image** is a frozen template (the "class"); the **container** is a living instance. `docker build` produces an image from a `Dockerfile`; `docker run` produces a container from an image.
- The **volume** holds persistent data: it survives container destruction. Without a volume, everything the container writes dies with it.
- The **network** defines how a container talks to others (DNS resolution by name inside named networks).
- **Environment variables** configure a container without touching the image.

We'll explore each block in this order: first containers (run, ps, stop, rm) → logs & exec (debugging) → env variables (configuration) → volumes (persistence) → networks (communication) → Dockerfile (building images) → hygiene.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Lancer ton premier conteneur, le voir tourner, l'arrêter et le supprimer proprement.

**🤔 Pourquoi ?** C'est le cycle de vie complet d'un conteneur : créer → observer → arrêter → supprimer. Tout le reste du guide s'appuie sur ces quatre gestes. Et on **pinne** la version de l'image (`nginx:1.27`, jamais `:latest`) : avec un tag explicite, tu décides quand tu mets à jour, et tu sais quoi rollback si ça casse.

Détail des flags :

- `-d` (detached) : tourne en arrière-plan, te rend la main.
- `--name web` : nomme le conteneur (sinon Docker invente un nom aléatoire).
- `nginx:1.27` : le nom de l'image + son tag (téléchargée depuis Docker Hub si absente).
:::

:::lang en
**Goal.** Launch your first container, watch it run, stop it, and remove it cleanly.

**🤔 Why?** This is the full container lifecycle: create → observe → stop → remove. The rest of the guide builds on these four moves. And we **pin** the image version (`nginx:1.27`, never `:latest`): with an explicit tag, you decide when to update, and you know what to roll back if something breaks.

Flag breakdown:

- `-d` (detached): runs in the background, gives your shell back.
- `--name web`: names the container (otherwise Docker invents a random name).
- `nginx:1.27`: the image name + its tag (downloaded from Docker Hub if absent).
:::

```bash
docker run -d --name web nginx:1.27
docker ps
```

:::lang fr
**✅ Vérification :** `docker ps` doit lister `web` avec un status `Up`.

Maintenant, arrête-le puis supprime-le :
:::

:::lang en
**✅ Check:** `docker ps` should list `web` with an `Up` status.

Now stop it, then remove it:
:::

```bash
docker stop web
docker rm web
```

:::lang fr
**🤔 Différence stop / rm ?**

- `stop` : éteint le conteneur, il est toujours là (en « Exited »), tu peux le redémarrer avec `docker start web`.
- `rm` : supprime le conteneur complètement (mais pas l'image).

**✅ Vérification :** `docker ps -a` ne montre plus `web`, mais `docker images` montre toujours l'image `nginx:1.27`.
:::

:::lang en
**🤔 stop vs rm?**

- `stop`: shuts the container down; it still exists (in "Exited" state), and you can restart it with `docker start web`.
- `rm`: removes the container entirely (but not the image).

**✅ Check:** `docker ps -a` no longer shows `web`, but `docker images` still shows the `nginx:1.27` image.
:::

### step-02

:::lang fr
**Objectif.** Exposer un port du conteneur sur ta machine.

**🤔 Pourquoi `8080:80` ?** Syntaxe `HOTE:CONTENEUR`. Le conteneur expose le port 80 (nginx écoute là), on le mappe au port 8080 de ta machine. Tu pourrais mettre `80:80`, mais il faut être root pour les ports sous 1024 — d'où la convention `8080`.
:::

:::lang en
**Goal.** Expose a container port on your machine.

**🤔 Why `8080:80`?** The syntax is `HOST:CONTAINER`. The container exposes port 80 (nginx listens there); we map it to port 8080 on your machine. You could use `80:80`, but ports below 1024 require root — hence the `8080` convention.
:::

```bash
docker run -d --name web -p 8080:80 nginx:1.27
```

:::lang fr
**✅ Vérification :** ouvre `http://localhost:8080` dans ton navigateur — la page d'accueil nginx doit s'afficher.
:::

:::lang en
**✅ Check:** open `http://localhost:8080` in your browser — the nginx welcome page should appear.
:::

### step-03

:::lang fr
**Objectif.** Apprendre les deux réflexes de debug : lire les logs et entrer dans un conteneur.

**🤔 Pourquoi `exec` ?** Pour « entrer » dans un conteneur déjà lancé. Très utile pour débugger : « qu'est-ce qu'il y a dans /etc/nginx ? », « tail un fichier de log interne », etc.

**🤔 Pourquoi `-it` ?** `-i` (interactive) + `-t` (TTY) = pouvoir taper des commandes. Sans, tu lances `bash` mais tu ne peux pas interagir.
:::

:::lang en
**Goal.** Learn the two debugging reflexes: reading logs and getting inside a container.

**🤔 Why `exec`?** To "enter" an already-running container. Very useful for debugging: "what's inside /etc/nginx?", "tail an internal log file", and so on.

**🤔 Why `-it`?** `-i` (interactive) + `-t` (TTY) = being able to type commands. Without them, you launch `bash` but can't interact.
:::

```bash
docker logs web                    # voir les logs / view logs
docker logs -f web                 # suivre en temps réel, Ctrl-C pour sortir / follow live, Ctrl-C to exit
docker exec -it web bash           # ouvrir un shell dans le conteneur / open a shell inside the container
# (dans le conteneur / inside the container)
ls /etc/nginx/
exit
```

:::lang fr
**✅ Vérification :** `docker logs web` affiche les requêtes nginx (dont ta visite de l'étape 2), et le `ls /etc/nginx/` depuis l'intérieur du conteneur liste `nginx.conf`. `Ctrl-C` sur `logs -f` n'arrête **pas** le conteneur.
:::

:::lang en
**✅ Check:** `docker logs web` shows nginx requests (including your visit from step 2), and `ls /etc/nginx/` from inside the container lists `nginx.conf`. `Ctrl-C` on `logs -f` does **not** stop the container.
:::

### step-04

:::lang fr
**Objectif.** Configurer un service via variables d'environnement, avec une base PostgreSQL.

**🤔 Pourquoi des variables d'env et pas un fichier de config ?** C'est la **convention Docker universelle** pour configurer un conteneur sans modifier l'image. Une image PostgreSQL peut servir 1000 contextes différents juste avec des env vars. C'est le pattern « 12-factor app ».

⚠️ **Attention :** on commence par `docker rm -f web` pour nettoyer. Le flag `-f` **force la suppression d'un conteneur en cours d'exécution** — pas de confirmation, pas de retour en arrière. Ici c'est voulu (nginx est jetable), mais ne prends jamais ce réflexe sur un conteneur dont les données ne sont pas dans un volume.
:::

:::lang en
**Goal.** Configure a service via environment variables, using a PostgreSQL database.

**🤔 Why environment variables and not a config file?** It's the **universal Docker convention** for configuring a container without modifying the image. One PostgreSQL image can serve 1000 different contexts with env vars alone. This is the "12-factor app" pattern.

⚠️ **Warning:** we start with `docker rm -f web` to clean up. The `-f` flag **force-removes a running container** — no confirmation, no going back. Here it's deliberate (nginx is disposable), but never make it a reflex on a container whose data isn't in a volume.
:::

```bash
docker rm -f web   # nettoie le conteneur nginx / clean up the nginx container
docker run -d --name db \
  -e POSTGRES_PASSWORD=monsecret \
  -e POSTGRES_USER=alice \
  -e POSTGRES_DB=mabase \
  postgres:16
```

:::lang fr
**✅ Vérification :**
:::

:::lang en
**✅ Check:**
:::

```bash
docker exec -it db psql -U alice -d mabase -c "\dt"
```

:::lang fr
Tu accèdes à ta base. Pas de tables encore (« Did not find any relations »), mais la connexion marche.
:::

:::lang en
You're in your database. No tables yet ("Did not find any relations"), but the connection works.
:::

### step-05

:::lang fr
**Objectif.** Comprendre les volumes en vivant le problème, puis en le résolvant. C'est **l'étape la plus importante du guide.**

**🤔 Pourquoi vivre le problème d'abord ?** Parce que « sans volume, les données meurent avec le conteneur » est une phrase qu'on oublie — alors qu'une table qui disparaît sous tes yeux, tu ne l'oublies pas.

⚠️ **Attention :** les commandes ci-dessous utilisent `docker rm -f db`, qui **détruit le conteneur et toutes les données non montées dans un volume**. Ici, la perte de données est le but de la démonstration — n'exécute jamais ça sur une base qui compte.

D'abord, le test du problème :
:::

:::lang en
**Goal.** Understand volumes by living the problem first, then fixing it. This is **the most important step of the guide.**

**🤔 Why live the problem first?** Because "without a volume, data dies with the container" is a sentence you forget — but a table vanishing before your eyes, you don't.

⚠️ **Warning:** the commands below use `docker rm -f db`, which **destroys the container and all data not mounted in a volume**. Here, losing data is the whole point of the demo — never run this on a database that matters.

First, the problem test:
:::

```bash
docker exec -it db psql -U alice -d mabase -c "CREATE TABLE test (id INT);"
docker rm -f db
docker run -d --name db -e POSTGRES_PASSWORD=monsecret -e POSTGRES_USER=alice -e POSTGRES_DB=mabase postgres:16
docker exec -it db psql -U alice -d mabase -c "\dt"
```

:::lang fr
**Résultat :** ta table `test` n'existe plus. Sans volume, les données meurent avec le conteneur.

La solution — un **volume nommé** :

**🤔 Pourquoi `-v db-data:/var/lib/postgresql/data` ?** Syntaxe `VOLUME:PATH_DANS_CONTENEUR`. Tout ce que Postgres écrit dans `/var/lib/postgresql/data` (sa base) va dans le volume `db-data`, géré par Docker, séparé du conteneur. Détruire le conteneur ne détruit pas le volume.
:::

:::lang en
**Result:** your `test` table is gone. Without a volume, data dies with the container.

The fix — a **named volume**:

**🤔 Why `-v db-data:/var/lib/postgresql/data`?** The syntax is `VOLUME:PATH_IN_CONTAINER`. Everything Postgres writes to `/var/lib/postgresql/data` (its database) goes into the `db-data` volume, managed by Docker, separate from the container. Destroying the container does not destroy the volume.
:::

```bash
docker rm -f db
docker run -d --name db \
  -e POSTGRES_PASSWORD=monsecret \
  -e POSTGRES_USER=alice \
  -e POSTGRES_DB=mabase \
  -v db-data:/var/lib/postgresql/data \
  postgres:16
```

:::lang fr
**✅ Vérification :** on recommence le crash-test, cette fois avec le volume :
:::

:::lang en
**✅ Check:** repeat the crash test, this time with the volume:
:::

```bash
docker exec -it db psql -U alice -d mabase -c "CREATE TABLE persistant (id INT);"
docker rm -f db
docker run -d --name db -e POSTGRES_PASSWORD=monsecret -e POSTGRES_USER=alice -e POSTGRES_DB=mabase -v db-data:/var/lib/postgresql/data postgres:16
sleep 5
docker exec -it db psql -U alice -d mabase -c "\dt"
```

:::lang fr
La table `persistant` est toujours là. **Voilà** pourquoi les volumes sont critiques.

⚠️ **Deux types de volumes :**

- **Nommé** : `-v db-data:/path` → géré par Docker, idéal pour les bases de données.
- **Bind mount** : `-v ./mon-dossier:/path` → ton dossier hôte est monté direct, utile pour le dev (édition live).
:::

:::lang en
The `persistant` table is still there. **That's** why volumes are critical.

⚠️ **Two kinds of volumes:**

- **Named**: `-v db-data:/path` → managed by Docker, ideal for databases.
- **Bind mount**: `-v ./my-folder:/path` → your host folder is mounted directly, useful for development (live editing).
:::

### step-06

:::lang fr
**Objectif.** Faire communiquer deux conteneurs par leur nom, via un network Docker.

**🤔 Pourquoi un network custom ?** Dans un network Docker nommé, les conteneurs se résolvent par leur **nom** (`api` est résolu en IP par le DNS interne Docker). C'est le pattern utilisé dans **tous** les compose multi-services. **Sans network custom**, les conteneurs sont sur le `bridge` par défaut et ne peuvent communiquer **que par IP**, pas par nom — d'où l'obligation de créer un network nommé pour tes stacks.
:::

:::lang en
**Goal.** Make two containers talk to each other by name, through a Docker network.

**🤔 Why a custom network?** Inside a named Docker network, containers resolve each other by **name** (`api` is resolved to an IP by Docker's internal DNS). This is the pattern used in **every** multi-service compose. **Without a custom network**, containers sit on the default `bridge` and can only communicate **by IP**, not by name — hence the need to create a named network for your stacks.
:::

```bash
docker network create mon-reseau

docker run -d --name api --network mon-reseau nginx:1.27
docker run -d --name client --network mon-reseau alpine:3.20 sleep infinity

docker exec -it client wget -qO- http://api
```

:::lang fr
**✅ Vérification :** la dernière commande affiche le HTML de la page d'accueil nginx — le conteneur `client` a joint `api` **par son nom**, sans aucune IP.
:::

:::lang en
**✅ Check:** the last command prints the HTML of the nginx welcome page — the `client` container reached `api` **by name**, without any IP.
:::

### step-07

:::lang fr
**Objectif.** Créer ta propre image avec un `Dockerfile`.

**🤔 Pourquoi chaque choix ?**

- `python:3.12-slim` plutôt que `python:3.12` : la variante `slim` fait ~150 Mo au lieu de ~1 Go. Toujours préférer slim/alpine pour des images plus légères.
- `:1.0` : c'est le **tag** de l'image. Sans tag, c'est `latest` par défaut — et comme pour tout service en prod, **toujours tagger explicitement**.
- `--rm` : supprime le conteneur dès qu'il termine. Utile pour les tests one-shot.

Crée `Dockerfile` :
:::

:::lang en
**Goal.** Build your own image with a `Dockerfile`.

**🤔 Why each choice?**

- `python:3.12-slim` rather than `python:3.12`: the `slim` variant is ~150 MB instead of ~1 GB. Always prefer slim/alpine for lighter images.
- `:1.0`: that's the image **tag**. Without a tag it defaults to `latest` — and as with any production service, **always tag explicitly**.
- `--rm`: removes the container as soon as it exits. Handy for one-shot tests.

Create `Dockerfile`:
:::

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY app.py .
CMD ["python", "app.py"]
```

:::lang fr
Crée `app.py` :
:::

:::lang en
Create `app.py`:
:::

```python
print("Hello from my custom image!")
```

:::lang fr
Build et lance :
:::

:::lang en
Build and run:
:::

```bash
docker build -t mon-app:1.0 .
docker run --rm mon-app:1.0
```

:::lang fr
**✅ Vérification :** la sortie affiche `Hello from my custom image!`, et `docker images` liste `mon-app` avec le tag `1.0`.
:::

:::lang en
**✅ Check:** the output prints `Hello from my custom image!`, and `docker images` lists `mon-app` with the `1.0` tag.
:::

### step-08

:::lang fr
**Objectif.** Faire l'inventaire de ce que Docker consomme, et nettoyer sans casser.

**🤔 Pourquoi ?** Docker accumule images, conteneurs, volumes et layers de build. Sans nettoyage, ton disque sature. Mais nettoyer à l'aveugle est dangereux — d'où : **inventorier d'abord, supprimer ensuite**.
:::

:::lang en
**Goal.** Take stock of what Docker consumes, and clean up without breaking anything.

**🤔 Why?** Docker accumulates images, containers, volumes, and build layers. Without cleanup, your disk fills up. But cleaning blindly is dangerous — hence: **inventory first, delete second**.
:::

```bash
docker ps -a                  # tous les conteneurs, même arrêtés / all containers, even stopped
docker images                 # toutes les images / all images
docker volume ls              # tous les volumes / all volumes
docker system df              # combien tout ça pèse / how much it all weighs
```

:::lang fr
⚠️ **Les deux commandes suivantes sont destructives.** `docker system prune` supprime les conteneurs arrêtés et les images non taggées — irréversible. La variante `-a --volumes` supprime en plus **toutes les images inutilisées et tous les volumes non rattachés à un conteneur**. Si un volume contient des données précieuses non rattachées (ex. tu as fait `docker rm` sans relancer le conteneur), ces données **disparaissent définitivement**. Vérifie `docker volume ls` avant.
:::

:::lang en
⚠️ **The next two commands are destructive.** `docker system prune` removes stopped containers and untagged images — irreversibly. The `-a --volumes` variant additionally removes **all unused images and all volumes not attached to a container**. If a volume holds valuable data that isn't attached (e.g. you ran `docker rm` without restarting the container), that data is **gone for good**. Check `docker volume ls` first.
:::

```bash
# Nettoyage doux : conteneurs arrêtés + images non taggées / Gentle cleanup: stopped containers + untagged images
docker system prune

# Nettoyage agressif : + images inutilisées + volumes non utilisés / Aggressive cleanup: + unused images + unused volumes
docker system prune -a --volumes
```

:::lang fr
**✅ Vérification :** `docker system df` montre un espace récupéré (colonne `RECLAIMABLE` en baisse), et ton volume `db-data` est toujours listé par `docker volume ls` **si** le conteneur `db` tournait encore au moment du prune.
:::

:::lang en
**✅ Check:** `docker system df` shows reclaimed space (the `RECLAIMABLE` column went down), and your `db-data` volume is still listed by `docker volume ls` **if** the `db` container was still running when you pruned.
:::

## pitfalls

:::lang fr
**1. Tu lances un conteneur sans volume, tu ajoutes des données, puis tu fais `docker rm`. Données perdues.** Règle : tout service avec état (base de données, app stateful) → volume obligatoire dès le départ. Pas « plus tard », pas « quand ce sera sérieux » : dès le premier `docker run`.

**2. `latest` comme tag.** `latest` casse silencieusement à chaque update : tu redéploies, l'image a changé sous tes pieds, et rien ne te dit pourquoi ça ne marche plus. Pinne une version explicite (`nginx:1.27`, `postgres:16`) — tu décides quand mettre à jour, après lecture des release notes.

**3. Tu copies un Dockerfile qui fait `COPY . .` en début.** Chaque modif de code invalide tout le cache des couches suivantes (y compris `pip install`). Bonne pratique : copier d'abord les fichiers de dépendances (`requirements.txt`), installer, *puis* copier le code.

**4. Tu mets des secrets en clair dans le Dockerfile (`ENV API_KEY=...`).** Ils sont **embarqués dans l'image**, visibles par quiconque la pull (`docker history` les montre). Solution : passer les secrets au runtime (`-e`, ou un `.env` avec Compose).

**5. Tu lances le conteneur en root sans réfléchir.** Beaucoup d'images officielles tournent root par défaut. En prod, ajoute `USER nonroot` dans ton Dockerfile, ou utilise les variantes d'images `-rootless`.

**6. Tu fais `docker exec ...` partout pour « configurer » ton conteneur.** Tu vas perdre cette config à la prochaine recréation. La config doit vivre dans l'image (Dockerfile), un volume, ou des variables d'environnement — jamais dans des modifications manuelles à chaud.
:::

:::lang en
**1. You launch a container without a volume, add data, then run `docker rm`. Data gone.** Rule: any stateful service (database, stateful app) → volume mandatory from day one. Not "later", not "when it gets serious": from the very first `docker run`.

**2. `latest` as a tag.** `latest` breaks silently on every update: you redeploy, the image changed under your feet, and nothing tells you why it stopped working. Pin an explicit version (`nginx:1.27`, `postgres:16`) — you decide when to update, after reading the release notes.

**3. You copy a Dockerfile that does `COPY . .` at the top.** Every code change invalidates the cache of all subsequent layers (including `pip install`). Best practice: copy dependency files first (`requirements.txt`), install, *then* copy the code.

**4. You put clear-text secrets in the Dockerfile (`ENV API_KEY=...`).** They are **baked into the image**, visible to anyone who pulls it (`docker history` shows them). Fix: pass secrets at runtime (`-e`, or a `.env` file with Compose).

**5. You run the container as root without thinking.** Many official images run as root by default. In production, add `USER nonroot` to your Dockerfile, or use `-rootless` image variants.

**6. You `docker exec ...` everywhere to "configure" your container.** You'll lose that config on the next recreation. Config must live in the image (Dockerfile), a volume, or environment variables — never in ad-hoc manual tweaks.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu expliques **sans hésiter** la différence image / conteneur.
- [ ] Tu sais quand un service a besoin d'un volume et quand non.
- [ ] `docker logs`, `docker exec`, `docker inspect` sont des réflexes.
- [ ] Tu sais lire un Dockerfile et expliquer chaque ligne.
- [ ] Tu peux nettoyer ton système Docker sans paniquer (et sans perdre un volume précieux).
- [ ] Tu comprends ce que tu vas lire dans **n'importe quel** `docker-compose.yml`.

Si les 6 sont cochés, tu as le socle Docker qu'exigent tous les guides suivants. Bravo.
:::

:::lang en
You know it works when…

- [ ] You can explain the image / container difference **without hesitation**.
- [ ] You know when a service needs a volume and when it doesn't.
- [ ] `docker logs`, `docker exec`, `docker inspect` are reflexes.
- [ ] You can read a Dockerfile and explain every line.
- [ ] You can clean your Docker system without panicking (and without losing a precious volume).
- [ ] You understand what you'll read in **any** `docker-compose.yml`.

If all 6 are ticked, you have the Docker foundation every following guide demands. Well done.
:::

## next

:::lang fr
Trois prolongements naturels, dans l'ordre du parcours :

1. **Docker Compose** — orchestration locale propre : décrire toute ta stack dans un fichier au lieu d'aligner des `docker run` de 8 lignes.
2. **Traefik** — reverse proxy + HTTPS automatique, la porte d'entrée de tous tes services.
3. **Vaultwarden** — ton premier vrai service self-hosté, qui réutilise tout ce que tu viens d'apprendre (image pinée, volume, network, env vars).
:::

:::lang en
Three natural next steps, in path order:

1. **Docker Compose** — clean local orchestration: describe your whole stack in one file instead of stacking 8-line `docker run` commands.
2. **Traefik** — reverse proxy + automatic HTTPS, the front door for all your services.
3. **Vaultwarden** — your first real self-hosted service, reusing everything you just learned (pinned image, volume, network, env vars).
:::

## cheatsheet

:::lang fr
Aide-mémoire des commandes clés pour le quotidien Docker.
:::

:::lang en
Key commands cheat sheet for day-to-day Docker.
:::

```bash
# Cycle de vie / Lifecycle
docker run -d --name web -p 8080:80 nginx:1.27   # lancer / run
docker ps                          # conteneurs actifs / running containers
docker ps -a                       # tous, même arrêtés / all, even stopped
docker stop web && docker start web # arrêter, redémarrer / stop, restart
docker rm web                      # supprimer (conteneur arrêté) / remove (stopped container)

# Debug
docker logs -f web                 # suivre les logs / follow logs
docker exec -it web bash           # shell dans le conteneur / shell inside container
docker inspect web                 # tout l'état JSON / full JSON state

# Données & réseau / Data & network
docker run -v db-data:/var/lib/postgresql/data ...   # volume nommé / named volume
docker run -v ./dossier:/app ...                     # bind mount
docker network create mon-reseau                     # network nommé / named network
docker run --network mon-reseau ...                  # attacher / attach

# Images
docker build -t mon-app:1.0 .      # construire (tag explicite !) / build (explicit tag!)
docker images                      # lister / list
docker pull nginx:1.27             # télécharger / download

# Hygiène / Hygiene — ⚠️ prune = destructif, inventorier avant / destructive, inventory first
docker system df                   # qui pèse quoi / what weighs what
docker volume ls                   # lister les volumes AVANT de nettoyer / list volumes BEFORE cleaning
docker system prune                # doux / gentle
docker system prune -a --volumes   # ⚠️ agressif : supprime volumes non utilisés / aggressive: removes unused volumes
```

## resources

:::lang fr
- [Documentation officielle Docker](https://docs.docker.com) — la référence absolue.
- [Play with Docker](https://labs.play-with-docker.com) — sandbox gratuit en ligne pour tester sans rien installer.
- [Best practices Dockerfile](https://docs.docker.com/build/building/best-practices/) — cache des layers, images légères, sécurité.
- [Docker Hub](https://hub.docker.com) — le registry public, pour vérifier les tags disponibles d'une image.
:::

:::lang en
- [Official Docker documentation](https://docs.docker.com) — the absolute reference.
- [Play with Docker](https://labs.play-with-docker.com) — free online sandbox to experiment without installing anything.
- [Dockerfile best practices](https://docs.docker.com/build/building/best-practices/) — layer caching, lightweight images, security.
- [Docker Hub](https://hub.docker.com) — the public registry, to check an image's available tags.
:::

## troubleshooting

:::lang fr
**« Cannot connect to the Docker daemon ».** Le démon Docker n'est pas lancé, ou tu n'as pas les permissions. Vérifie : `systemctl status docker`. Si tu n'es pas dans le groupe : `sudo usermod -aG docker $USER` puis déconnexion/reconnexion.

**« Port is already allocated ».** Un autre process utilise déjà ce port. Trouve qui : `sudo ss -tlnp | grep :8080`. Soit tu changes ton port côté hôte (`-p 8081:80`), soit tu arrêtes l'autre service.

**Mon conteneur démarre puis s'arrête immédiatement.** Regarde les logs : `docker logs <nom>`. Soit une erreur de config, soit le conteneur n'a « rien à faire » — un conteneur sans process au premier plan s'arrête aussitôt.

**« No space left on device ».** Docker a saturé le disque. `docker system df` pour voir ce qui pèse, puis nettoie — ⚠️ en te rappelant que `docker system prune -a` est destructif (images inutilisées supprimées définitivement) : inventorie avant, cf. step-08.
:::

:::lang en
**"Cannot connect to the Docker daemon".** The Docker daemon isn't running, or you lack permissions. Check: `systemctl status docker`. If you're not in the group: `sudo usermod -aG docker $USER` then log out/in.

**"Port is already allocated".** Another process is already using that port. Find out who: `sudo ss -tlnp | grep :8080`. Either change your host-side port (`-p 8081:80`) or stop the other service.

**My container starts then stops immediately.** Check the logs: `docker logs <name>`. Either a config error, or the container has "nothing to do" — a container with no foreground process exits right away.

**"No space left on device".** Docker filled the disk. `docker system df` to see what weighs what, then clean up — ⚠️ remembering that `docker system prune -a` is destructive (unused images permanently deleted): take inventory first, see step-08.
:::
