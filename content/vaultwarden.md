---
# — Identité (ne change JAMAIS une fois publié) —
id: vaultwarden
slug: vaultwarden
order: 6
status: published

# — Titres & accroches (bilingue) —
title_fr: "Vaultwarden — Ton gestionnaire de mots de passe self-hosté"
title_en: "Vaultwarden — Your self-hosted password manager"
tagline_fr: "Déploie ton propre serveur compatible Bitwarden, léger et privé."
tagline_en: "Deploy your own lightweight, private Bitwarden-compatible server."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 45
repo: "dani-garcia/vaultwarden"
validated_version: "1.34.1"
last_review: "2026-06-16"

# — Relations de parcours (par id) —
prerequisites: [docker-fondamentaux, docker-compose, traefik]
next: [monitoring, immich]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [volumes-persistants, variables-environnement, reverse-proxy, token-admin-hashe, sauvegardes]
concepts_en: [persistent-volumes, environment-variables, reverse-proxy, hashed-admin-token, backups]

# — Accès (embryon du freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Guide pas-à-pas pour héberger Vaultwarden : Docker, HTTPS, sauvegardes."
og_description_en: "Step-by-step guide to self-host Vaultwarden: Docker, HTTPS, backups."
---

## intro

:::lang fr
Vaultwarden est une réécriture open-source du serveur Bitwarden, en Rust. Il fait **la même chose que Bitwarden** (vault chiffré, sync multi-appareils, partage, 2FA) mais consomme **10 à 20× moins de ressources** — un Raspberry Pi suffit largement.

Ce guide te montre comment le déployer en Docker, le mettre derrière un reverse proxy avec HTTPS valide, et le sécuriser correctement (panel admin, signups, sauvegardes).

**Pour qui c'est :** quelqu'un qui veut héberger ses mots de passe lui-même, soit pour la souveraineté, soit pour apprendre la stack self-hosting "sérieuse" sur un cas d'usage critique.

**Quand ce n'est PAS le bon choix :**

- Tu n'as **pas** de reverse proxy avec HTTPS — les clients officiels Bitwarden refusent toute connexion non-HTTPS valide. Pas négociable.
- Tu n'as **pas** de stratégie de sauvegarde — perdre `vw-data/` = perdre **tous** tes mots de passe sans récupération possible.
- Tu cherches une solution "zéro maintenance" — un password manager self-hosté est une responsabilité réelle.

Si l'un des trois te concerne, mieux vaut rester sur Bitwarden cloud ou Proton Pass pour l'instant. Pas de honte, c'est un bon arbitrage.
:::

:::lang en
Vaultwarden is an open-source rewrite of the Bitwarden server in Rust. It does **the same job as Bitwarden** (encrypted vault, multi-device sync, sharing, 2FA) but uses **10–20× fewer resources** — a Raspberry Pi is more than enough.

This guide shows you how to deploy it with Docker, put it behind a reverse proxy with valid HTTPS, and lock it down properly (admin panel, signups, backups).

**Who it's for:** someone who wants to host their passwords themselves, either for sovereignty or to learn a "serious" self-hosting stack on a critical use case.

**When it's NOT the right choice:**

- You **don't** have a reverse proxy with HTTPS — official Bitwarden clients refuse any non-HTTPS connection. Non-negotiable.
- You **don't** have a backup strategy — losing `vw-data/` means losing **every** password with no recovery.
- You want a "zero maintenance" solution — a self-hosted password manager is a real responsibility.

If any of those apply, stick with Bitwarden cloud or Proton Pass for now. No shame — it's a sound trade-off.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Lancer un service Docker avec une **base de données persistante** (volume monté), et comprendre pourquoi ce volume est ta vraie donnée précieuse — pas le conteneur.
- Configurer un service via **variables d'environnement** (pattern universel en Docker).
- Connecter un service à un **reverse proxy externe** via un Docker network partagé.
- Sécuriser un **panel admin** avec un token Argon2id hashé.
- Désactiver les inscriptions ouvertes (`SIGNUPS_ALLOWED`) une fois ton compte créé.
- Mettre en place une **sauvegarde minimale** — et comprendre pourquoi c'est non-négociable.

Tu manipuleras au passage : `docker compose`, healthchecks, environment variables, networks, volumes, secrets de base.
:::

:::lang en
By the end of this guide, you'll know how to:

- Run a Docker service with a **persistent database** (mounted volume) and understand why that volume is your real valuable data — not the container.
- Configure a service via **environment variables** (a universal Docker pattern).
- Connect a service to an **external reverse proxy** through a shared Docker network.
- Secure an **admin panel** with an Argon2id-hashed token.
- Disable open signups (`SIGNUPS_ALLOWED`) once your account is created.
- Set up a **minimal backup** — and understand why it's non-negotiable.

Along the way you'll handle: `docker compose`, healthchecks, environment variables, networks, volumes, basic secrets.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Une aisance en **ligne de commande Linux** (`cd`, `nano`/`vim`, `ls`, `sudo`).
- **Docker et Docker Compose** installés et fonctionnels.
- La notion de ce qu'est un **conteneur, une image, un volume**.
- Un **reverse proxy avec HTTPS** qui tourne déjà (Traefik recommandé).
- Un **nom de domaine** (ou sous-domaine) que tu contrôles, pointant vers ton serveur.

**Pourquoi le reverse proxy est non-négociable :** les clients Bitwarden (web, desktop, mobile, extension) **refusent activement** toute connexion qui n'est pas en HTTPS avec un certificat valide. Sans reverse proxy, tu pourras techniquement déployer Vaultwarden, mais tu ne pourras pas l'utiliser sérieusement. C'est *par design*, pour ta sécurité.
:::

:::lang en
You should have:

- Comfort with the **Linux command line** (`cd`, `nano`/`vim`, `ls`, `sudo`).
- **Docker and Docker Compose** installed and working.
- A grasp of what a **container, image, and volume** are.
- A **reverse proxy with HTTPS** already running (Traefik recommended).
- A **domain name** (or subdomain) you control, pointed at your server.

**Why the reverse proxy is non-negotiable:** Bitwarden clients (web, desktop, mobile, extension) **actively refuse** any connection that isn't HTTPS with a valid certificate. Without a reverse proxy you can technically deploy Vaultwarden, but you won't be able to use it seriously. It's *by design*, for your security.
:::

## concepts

:::lang fr
Voici ce qu'on va construire — un service Vaultwarden derrière Traefik, branché sur un volume disque qui contient toute ta donnée précieuse.
:::

:::lang en
Here's what we're building — a Vaultwarden service behind Traefik, hooked up to a disk volume that holds all your valuable data.
:::

:::figure architecture
caption_fr: "Schéma 1. Architecture cible : Traefik termine HTTPS, route vers Vaultwarden via le réseau Docker `proxy`, et la persistance vit dans le volume `./vw-data/`."
caption_en: "Figure 1. Target architecture: Traefik terminates HTTPS, routes to Vaultwarden through the `proxy` Docker network, and persistence lives in the `./vw-data/` volume."
:::

:::lang fr
**Points clés à retenir :**

- Le **conteneur** est jetable : tu peux le détruire et le recréer à volonté.
- Le **volume** `./vw-data/` contient la base SQLite chiffrée, les clés RSA et les pièces jointes. **C'est ta vraie donnée.** Le perdre = tout perdre.
- Le **réseau `proxy`** est *externe* : il existe avant Vaultwarden (créé par Traefik). Vaultwarden s'y attache pour être joignable par le reverse proxy, **sans exposer un seul port** sur l'hôte.
- Le **panel admin** s'authentifie avec un **mot de passe** que toi tu connais. Ce que ton `.env` stocke, c'est son **hash Argon2id** — pas le mot de passe lui-même.
:::

:::lang en
**Key takeaways:**

- The **container** is disposable: you can destroy and recreate it at will.
- The **volume** `./vw-data/` holds the encrypted SQLite database, RSA keys, and attachments. **That's your real data.** Lose it = lose everything.
- The **`proxy` network** is *external*: it exists before Vaultwarden (created by Traefik). Vaultwarden attaches to it so the reverse proxy can reach it **without exposing a single port** on the host.
- The **admin panel** authenticates with a **password** that only you know. What `.env` stores is its **Argon2id hash** — not the password itself.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Préparer le terrain — un dossier dédié au service avec un sous-dossier pour la donnée persistante.

**🤔 Pourquoi ?** Tout ce qui sera dans `vw-data/` (base SQLite chiffrée, clés RSA, pièces jointes) survivra à la destruction/recréation du conteneur. C'est ta vraie donnée. Le conteneur, lui, est jetable.
:::

:::lang en
**Goal.** Prepare the ground — a dedicated folder for the service with a sub-folder for persistent data.

**🤔 Why?** Everything in `vw-data/` (encrypted SQLite database, RSA keys, attachments) survives container destruction/recreation. That's your real data. The container itself is disposable.
:::

```bash
mkdir -p ~/vaultwarden/vw-data
cd ~/vaultwarden
```

:::lang fr
**✅ Vérification :**
:::

:::lang en
**✅ Check:**
:::

```bash
pwd          # /home/<toi>/vaultwarden
ls -la       # doit montrer le dossier vw-data
```

### step-02

:::lang fr
**Objectif.** Générer le token admin sous forme de hash Argon2id.

**🤔 Pourquoi ?** Le panel admin de Vaultwarden permet de gérer tous les utilisateurs et la config. Si quelqu'un trouve ce token, il a les clés du royaume. En stockant un **hash** Argon2id et pas le mot de passe en clair, même si ton `.env` fuite (ou est dans Git par erreur), le secret reste protégé. C'est exactement le même principe que pour les mots de passe utilisateurs en base de données.
:::

:::lang en
**Goal.** Generate the admin token as an Argon2id hash.

**🤔 Why?** The Vaultwarden admin panel manages all users and config. If someone gets this token, they own the kingdom. By storing an Argon2id **hash** rather than the password in clear text, even if your `.env` leaks (or ends up in Git by mistake), the secret stays protected. Same principle as user passwords in a database.
:::

```bash
docker run --rm -it vaultwarden/server:1.34.1 /vaultwarden hash
```

:::lang fr
L'outil te demande un mot de passe, te demande de le confirmer, puis affiche un hash de la forme :

```
$argon2id$v=19$m=65540,t=3,p=4$...
```

**Garde précieusement :**

- Le mot de passe en clair (toi tu le retiens / le mets dans ton password manager temporaire).
- Le hash complet, qu'on va coller dans `.env`.

**✅ Vérification :** le hash commence bien par `$argon2id$`. Sinon → vieille version, mets à jour l'image.
:::

:::lang en
The tool prompts for a password, asks you to confirm it, then prints a hash like:

```
$argon2id$v=19$m=65540,t=3,p=4$...
```

**Keep both safe:**

- The clear-text password (memorize it / put it in your temporary password manager).
- The full hash, which we'll paste into `.env`.

**✅ Check:** the hash starts with `$argon2id$`. If not → old version, update the image.
:::

### step-03

:::lang fr
**Objectif.** Créer le fichier `.env` avec la config sensible, hors `docker-compose.yml`.

**🤔 Pourquoi ?**

- `DOMAIN` : Vaultwarden l'utilise pour générer correctement les URLs dans les emails et certains tokens. Mauvaise valeur → des fonctions cassent **silencieusement**.
- Séparer config et `docker-compose.yml` permet de versionner le compose en Git **sans** committer tes secrets.
- `SIGNUPS_ALLOWED=true` est **temporaire** — on le passera à `false` après création de ton compte.
:::

:::lang en
**Goal.** Create the `.env` file with sensitive config, kept out of `docker-compose.yml`.

**🤔 Why?**

- `DOMAIN`: Vaultwarden uses it to generate proper URLs in emails and certain tokens. Wrong value → features break **silently**.
- Splitting config from `docker-compose.yml` lets you Git-version the compose file **without** committing your secrets.
- `SIGNUPS_ALLOWED=true` is **temporary** — we'll flip it to `false` after creating your account.
:::

```bash
nano .env
```

```env
# Le domaine PUBLIC où ton instance sera accessible (HTTPS obligatoire)
DOMAIN=https://vault.exemple.com

# Hash Argon2id généré à l'étape 2 — colle-le TEL QUEL :
#  - PAS de guillemets autour
#  - NE double PAS les $ (on utilise env_file, pas d'interpolation ${...})
ADMIN_TOKEN=$argon2id$v=19$m=65540,t=3,p=4$...

# Autoriser les inscriptions PENDANT le setup initial uniquement
SIGNUPS_ALLOWED=true

# Logs : info en prod, debug pendant le setup
LOG_LEVEL=info
```

:::lang fr
⚠️ **Le piège n°1 de Vaultwarden — l'`ADMIN_TOKEN`** : les `$` du hash Argon2id provoquent un comportement différent selon comment tu passes la variable :

- **Via `env_file:` (notre cas)** → colle le hash brut, **sans guillemets, sans doubler les `$`**.
- **Via `environment:` avec interpolation `${ADMIN_TOKEN}`** → là il faut **doubler** chaque `$` en `$$`.
- Des **guillemets simples** mal placés dans le `.env` peuvent finir *dans* la valeur et casser silencieusement l'accès admin.

Pour vérifier que le token est bien passé, une fois le conteneur lancé :

```bash
docker compose exec vaultwarden printenv ADMIN_TOKEN
```

La sortie doit afficher **exactement** ton hash : commence par `$argon2id$`, pas de `$$`, pas de guillemets.

**✅ Vérification :**

```bash
cat .env
# Doit afficher les 4 variables, le hash commence par $argon2id$
```
:::

:::lang en
⚠️ **Vaultwarden's pitfall #1 — `ADMIN_TOKEN`**: the `$` characters in the Argon2id hash behave differently depending on how you pass the variable:

- **Via `env_file:` (our case)** → paste the raw hash, **no quotes, do NOT double the `$`**.
- **Via `environment:` with `${ADMIN_TOKEN}` interpolation** → there you must **double** each `$` as `$$`.
- Stray **single quotes** in `.env` can end up *inside* the value and silently break admin access.

To confirm the token is passed correctly, once the container is running:

```bash
docker compose exec vaultwarden printenv ADMIN_TOKEN
```

The output must show **exactly** your hash: starts with `$argon2id$`, no `$$`, no quotes.

**✅ Check:**

```bash
cat .env
# Should show the 4 variables, hash starting with $argon2id$
```
:::

### step-04

:::lang fr
**Objectif.** Écrire le `docker-compose.yml` qui décrit ton service.

**🤔 Pourquoi chacune des lignes ?**

- `image: vaultwarden/server:1.34.1` → on **pinne** une version précise. `:latest` rend tes mises à jour imprévisibles. Avec une version explicite, tu décides quand mettre à jour, et tu sais quoi rollback si ça casse.
- `restart: unless-stopped` → le conteneur redémarre tout seul après un crash ou un reboot, mais reste arrêté si toi tu l'as arrêté volontairement.
- `env_file: .env` → toute la config sensible est externalisée.
- `volumes: ./vw-data:/data` → **le** point critique. Tout ce que Vaultwarden écrit (db, clés, pièces jointes) va sur ton disque hôte. Sans ça, à la première recréation, tu perds tout.
- `networks: proxy (external: true)` → on suppose que Traefik utilise déjà un réseau Docker nommé `proxy`. `external: true` = "ce réseau existe déjà, ne le crée pas, attache-toi à lui". C'est ce qui permet à Traefik de joindre Vaultwarden **sans exposer aucun port** sur l'hôte.
- `healthcheck` → Docker peut interroger l'endpoint `/alive` pour savoir si le service est vraiment fonctionnel (pas juste "le process tourne"). Utile pour Traefik, pour le monitoring, pour debug rapide.
:::

:::lang en
**Goal.** Write the `docker-compose.yml` that describes your service.

**🤔 Why each line?**

- `image: vaultwarden/server:1.34.1` → we **pin** a precise version. `:latest` makes updates unpredictable. With an explicit version you decide when to update, and you know what to roll back if something breaks.
- `restart: unless-stopped` → the container restarts itself after a crash or reboot, but stays stopped if you stopped it deliberately.
- `env_file: .env` → all sensitive config is externalized.
- `volumes: ./vw-data:/data` → **the** critical point. Everything Vaultwarden writes (db, keys, attachments) lands on your host disk. Without this, the first recreation wipes you out.
- `networks: proxy (external: true)` → we assume Traefik already uses a Docker network called `proxy`. `external: true` means "this network already exists, don't create it, attach to it". That's what lets Traefik reach Vaultwarden **without exposing a single port** on the host.
- `healthcheck` → Docker can poll the `/alive` endpoint to know if the service is actually functional (not just "the process is running"). Useful for Traefik, monitoring, and quick debugging.
:::

```bash
nano docker-compose.yml
```

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:1.34.1
    container_name: vaultwarden
    restart: unless-stopped
    env_file: .env
    volumes:
      - ./vw-data:/data
    networks:
      - proxy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80/alive"]
      interval: 30s
      timeout: 5s
      retries: 3

networks:
  proxy:
    external: true
```

:::lang fr
**✅ Vérification :**

```bash
docker compose config
# Doit afficher la config interprétée, sans erreur de syntaxe
```

Si tu vois `service "vaultwarden" refers to undefined network proxy` → ton réseau `proxy` n'existe pas. Crée-le : `docker network create proxy` (ou repasse par ton guide Traefik).
:::

:::lang en
**✅ Check:**

```bash
docker compose config
# Should print the parsed config, no syntax errors
```

If you see `service "vaultwarden" refers to undefined network proxy` → your `proxy` network doesn't exist. Create it: `docker network create proxy` (or go back through the Traefik guide).
:::

### step-05

:::lang fr
**Objectif.** Lancer le service en arrière-plan.

**🤔 Pourquoi `-d` ?** `-d` = detached, le conteneur tourne en arrière-plan. Sans cette option, tu serais attaché aux logs et un `Ctrl+C` arrêterait le service. En prod on est toujours en `-d`.
:::

:::lang en
**Goal.** Launch the service in the background.

**🤔 Why `-d`?** `-d` = detached, the container runs in the background. Without it you'd be attached to the logs and a `Ctrl+C` would stop the service. In production you're always in `-d`.
:::

```bash
docker compose up -d
```

:::lang fr
**✅ Vérification :**

```bash
docker compose ps
# STATUS doit afficher "Up X seconds (healthy)" après ~30 secondes
```

Tu peux aussi consulter les logs :

```bash
docker compose logs -f vaultwarden
```

Tu dois voir des lignes comme `Rocket has launched from http://0.0.0.0:80`. Pas d'erreur, pas de panic. `Ctrl+C` pour sortir des logs (ça n'arrête PAS le conteneur, grâce au `-d` précédent).
:::

:::lang en
**✅ Check:**

```bash
docker compose ps
# STATUS should show "Up X seconds (healthy)" after ~30 seconds
```

You can also tail the logs:

```bash
docker compose logs -f vaultwarden
```

You should see lines like `Rocket has launched from http://0.0.0.0:80`. No errors, no panic. `Ctrl+C` to exit the logs (this does NOT stop the container, thanks to the earlier `-d`).
:::

### step-06

:::lang fr
**Objectif.** Connecter Traefik à Vaultwarden via des labels Docker.

**🤔 Pourquoi des labels et pas des ports exposés ?** En mode "Traefik orchestré", on n'expose **aucun port** sur l'hôte. Traefik lit les labels Docker, comprend qu'il doit router `vault.exemple.com` vers le port 80 du conteneur, et fait le boulot HTTPS pour toi. C'est plus sûr (aucun port direct exposé) et plus propre (toute la config est avec le service).
:::

:::lang en
**Goal.** Wire Traefik to Vaultwarden using Docker labels.

**🤔 Why labels and not exposed ports?** In "Traefik-orchestrated" mode, we expose **no port** on the host. Traefik reads Docker labels, figures out it should route `vault.exemple.com` to port 80 of the container, and handles HTTPS for you. Safer (no direct port exposed) and cleaner (all config lives next to the service).
:::

Ajoute / Add — within the `vaultwarden` service in `docker-compose.yml` :

```yaml
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.vaultwarden.rule=Host(`vault.exemple.com`)"
      - "traefik.http.routers.vaultwarden.entrypoints=websecure"
      - "traefik.http.routers.vaultwarden.tls.certresolver=le"
      - "traefik.http.services.vaultwarden.loadbalancer.server.port=80"
```

:::lang fr
⚠️ Le nom du `certresolver` (`le`) doit correspondre **exactement** à celui défini dans ta config Traefik (voir le guide Traefik, où on l'a nommé `le`). Si tu l'as appelé autrement, adapte ici — sinon tu auras une erreur "certificate resolver not found".

Applique :

```bash
docker compose up -d
```

(Docker détecte le changement et recrée le conteneur sans rien perdre — grâce au volume.)

**✅ Vérification :** dans ton navigateur, va sur `https://vault.exemple.com`. Tu dois voir la page d'accueil Vaultwarden, avec un cadenas vert. Si le cadenas est rouge ou la page ne charge pas → c'est Traefik qui pose problème, pas Vaultwarden.
:::

:::lang en
⚠️ The `certresolver` name (`le`) must match **exactly** the one defined in your Traefik config (in the Traefik guide we named it `le`). If you named it something else, adjust here — otherwise you'll get a "certificate resolver not found" error.

Apply:

```bash
docker compose up -d
```

(Docker detects the change and recreates the container without losing anything — thanks to the volume.)

**✅ Check:** in your browser, go to `https://vault.exemple.com`. You should see the Vaultwarden home page with a green padlock. If the padlock is red or the page won't load → Traefik is the problem, not Vaultwarden.
:::

### step-07

:::lang fr
**Objectif.** Créer ton compte utilisateur, puis fermer les inscriptions publiques.

**🤔 Pourquoi fermer les inscriptions ?** Tant que `SIGNUPS_ALLOWED=true`, n'importe qui qui découvre l'URL de ton Vaultwarden peut s'y créer un compte. Aucun mot de passe ne lui sera révélé (chiffrement client), mais il consommera tes ressources et polluera ton instance. Une fois tes comptes créés, on ferme la porte.
:::

:::lang en
**Goal.** Create your user account, then close public signups.

**🤔 Why close signups?** As long as `SIGNUPS_ALLOWED=true`, anyone who discovers your Vaultwarden URL can create an account. No passwords get exposed (client-side encryption), but they'll eat your resources and clutter your instance. Once your accounts exist, we shut the door.
:::

:::lang fr
**Action 1.** Crée ton compte via l'interface web (clique "Create account", remplis email + mot de passe maître **fort** — tu ne pourras pas le récupérer en cas d'oubli).

**Action 2.** Édite `.env` :
:::

:::lang en
**Action 1.** Create your account through the web UI (click "Create account", fill in email + a **strong** master password — there's no recovery if you forget it).

**Action 2.** Edit `.env`:
:::

```env
SIGNUPS_ALLOWED=false
```

:::lang fr
**Action 3.** Applique :
:::

:::lang en
**Action 3.** Apply:
:::

```bash
docker compose up -d
```

:::lang fr
**✅ Vérification :** déconnecte-toi, va sur la page d'accueil. Le bouton "Create account" doit avoir disparu.
:::

:::lang en
**✅ Check:** log out, go to the home page. The "Create account" button must be gone.
:::

### step-08

:::lang fr
**Objectif.** Sauvegarde quotidienne automatique, avec un snapshot cohérent de la base SQLite.

**🤔 Pourquoi `.backup` SQLite plutôt qu'un simple `cp` ?** Si tu copies `db.sqlite3` pendant une écriture en cours, ton backup est potentiellement corrompu. La commande `.backup` de SQLite crée un snapshot **cohérent** même service actif. On l'exécute depuis le `sqlite3` de **l'hôte** (et non dans le conteneur) car l'image Vaultwarden, minimale, ne contient pas ce binaire.
:::

:::lang en
**Goal.** Daily automatic backup, with a consistent SQLite snapshot.

**🤔 Why SQLite `.backup` rather than a plain `cp`?** If you copy `db.sqlite3` while it's being written to, your backup may be corrupted. SQLite's `.backup` command takes a **consistent** snapshot even while the service is live. We run it via the **host's** `sqlite3` (not inside the container) because the minimal Vaultwarden image doesn't ship that binary.
:::

:::lang fr
Crée `~/vaultwarden/backup.sh` :
:::

:::lang en
Create `~/vaultwarden/backup.sh`:
:::

```bash
#!/bin/bash
set -e

BACKUP_DIR="$HOME/backups/vaultwarden"
DATA_DIR="$HOME/vaultwarden/vw-data"
DATE=$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"

# Snapshot cohérent de la base SQLite avec le sqlite3 de l'HÔTE
# (l'image Vaultwarden ne contient PAS le binaire sqlite3)
sqlite3 "$DATA_DIR/db.sqlite3" ".backup '$DATA_DIR/db-backup.sqlite3'"

# Archive l'ensemble du volume (db snapshot + clés RSA + pièces jointes + config)
tar -czf "$BACKUP_DIR/vw-$DATE.tar.gz" -C "$HOME/vaultwarden" vw-data

# Nettoie le snapshot temporaire
rm -f "$DATA_DIR/db-backup.sqlite3"

# Garde uniquement les 14 dernières sauvegardes
ls -tp "$BACKUP_DIR"/vw-*.tar.gz | tail -n +15 | xargs -r rm --

echo "✓ Backup OK : vw-$DATE.tar.gz"
```

:::lang fr
Installe `sqlite3` sur l'hôte si besoin : `sudo apt install sqlite3` (Debian/Ubuntu).

Rends-le exécutable, programme-le en cron :

```bash
chmod +x ~/vaultwarden/backup.sh
crontab -e
# Ajoute :
0 3 * * * /home/<toi>/vaultwarden/backup.sh >> /home/<toi>/vaultwarden/backup.log 2>&1
```

**✅ Vérification :**

```bash
~/vaultwarden/backup.sh
ls -la ~/backups/vaultwarden/
# Tu dois voir le fichier vw-YYYYMMDD-HHMMSS.tar.gz
```

⚠️ **Cette sauvegarde est locale.** Une vraie stratégie implique aussi de la copier ailleurs (autre disque, cloud chiffré).
:::

:::lang en
Install `sqlite3` on the host if needed: `sudo apt install sqlite3` (Debian/Ubuntu).

Make it executable, schedule it via cron:

```bash
chmod +x ~/vaultwarden/backup.sh
crontab -e
# Add:
0 3 * * * /home/<you>/vaultwarden/backup.sh >> /home/<you>/vaultwarden/backup.log 2>&1
```

**✅ Check:**

```bash
~/vaultwarden/backup.sh
ls -la ~/backups/vaultwarden/
# You should see vw-YYYYMMDD-HHMMSS.tar.gz
```

⚠️ **This backup is local.** A real strategy also copies it elsewhere (another disk, encrypted cloud).
:::

## pitfalls

:::lang fr
**1. Le panel `/admin` refuse ton mot de passe (le piège n°1).** Presque toujours un souci de format de l'`ADMIN_TOKEN`. Rappels : via `env_file`, le hash se colle **brut** (pas de guillemets, pas de `$$`) ; via `environment: ${...}`, il faut **doubler** les `$`. Vérifie avec `docker compose exec vaultwarden printenv ADMIN_TOKEN` — la sortie doit être exactement ton hash, commençant par `$argon2id$`, sans `$$` ni guillemets. Et rappelle-toi : sur `/admin` tu tapes ton **mot de passe**, pas le hash.

**2. Le client refuse de se connecter — "Failed to fetch".** Quasi toujours un problème HTTPS : certificat invalide, mauvais `DOMAIN` dans `.env`, ou tu accèdes en HTTP. Les clients Bitwarden refusent activement HTTP. Solution : vérifier `https://vault.exemple.com` dans un navigateur, le cadenas doit être vert sans warning.

**3. Tu modifies `.env` mais rien ne change.** Le conteneur lit `.env` **au démarrage**. Tout changement nécessite `docker compose up -d` (qui recrée le conteneur). Un `docker restart` ne relit pas `.env`.

**4. Les emails (invitations, reset) ne partent pas.** Par défaut, Vaultwarden n'envoie aucun email. Pour activer : ajouter les variables SMTP (`SMTP_HOST`, `SMTP_FROM`, `SMTP_USERNAME`, `SMTP_PASSWORD`…). Si tu utilises Gmail, il te faut un **App Password**, pas ton mot de passe normal.

**5. Tu utilises `image: vaultwarden/server:latest` et tu te réveilles avec un service cassé.** Une mise à jour majeure peut introduire un breaking change. Toujours pinner une version (`:1.34.1`). Mettre à jour = changer le tag explicitement, après avoir lu les release notes.

**6. Tu déploies sur Raspberry Pi et le conteneur crashe au démarrage.** Vérifie l'architecture : `docker pull vaultwarden/server:1.34.1` doit télécharger une variante `arm64` ou `arm/v7`. L'image multi-arch officielle gère ça automatiquement, mais si tu utilises un fork tiers, ce n'est pas garanti.

**7. Tu perds ton mot de passe maître.** Il n'y a **aucune procédure de récupération**. C'est by design (zéro-knowledge). Note ton mot de passe maître hors-ligne (papier dans un coffre, par exemple) avant de mettre des choses sérieuses dans ton vault.
:::

:::lang en
**1. The `/admin` panel refuses your password (pitfall #1).** Almost always an `ADMIN_TOKEN` format issue. Reminders: via `env_file`, paste the hash **raw** (no quotes, no `$$`); via `environment: ${...}`, you must **double** each `$`. Verify with `docker compose exec vaultwarden printenv ADMIN_TOKEN` — the output must be exactly your hash, starting with `$argon2id$`, no `$$`, no quotes. And remember: on `/admin` you type your **password**, not the hash.

**2. The client refuses to connect — "Failed to fetch".** Nearly always an HTTPS issue: invalid certificate, wrong `DOMAIN` in `.env`, or you're hitting HTTP. Bitwarden clients actively refuse HTTP. Fix: check `https://vault.exemple.com` in a browser, the padlock must be green with no warning.

**3. You change `.env` but nothing changes.** The container reads `.env` **at startup**. Any change requires `docker compose up -d` (which recreates the container). A `docker restart` does NOT re-read `.env`.

**4. Emails (invitations, reset) don't go out.** By default, Vaultwarden sends no email. To enable: add the SMTP variables (`SMTP_HOST`, `SMTP_FROM`, `SMTP_USERNAME`, `SMTP_PASSWORD`…). If you use Gmail you need an **App Password**, not your normal one.

**5. You use `image: vaultwarden/server:latest` and wake up to a broken service.** A major update can introduce a breaking change. Always pin a version (`:1.34.1`). Updating = changing the tag explicitly, after reading the release notes.

**6. You deploy on a Raspberry Pi and the container crashes on startup.** Check the architecture: `docker pull vaultwarden/server:1.34.1` must download an `arm64` or `arm/v7` variant. The official multi-arch image handles this automatically, but if you use a third-party fork it isn't guaranteed.

**7. You lose your master password.** There is **no recovery procedure**. By design (zero-knowledge). Write your master password down offline (paper in a safe, for example) before putting serious stuff in your vault.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] `docker compose ps` montre `vaultwarden` en `Up X (healthy)`.
- [ ] `https://vault.exemple.com` charge la page de connexion avec cadenas vert.
- [ ] Tu peux te connecter à ton compte depuis l'extension Bitwarden de ton navigateur (en configurant le serveur custom dans les paramètres).
- [ ] Le bouton "Create account" a disparu de la page d'accueil.
- [ ] `~/vaultwarden/backup.sh` produit une archive `.tar.gz` sans erreur.
- [ ] Le panel admin `https://vault.exemple.com/admin` t'accepte avec ton **mot de passe** (pas le hash).

Si les 6 sont cochés, tu as un Vaultwarden **propre, sécurisé et sauvegardé**. Bravo.
:::

:::lang en
You know it works when…

- [ ] `docker compose ps` shows `vaultwarden` as `Up X (healthy)`.
- [ ] `https://vault.exemple.com` loads the sign-in page with a green padlock.
- [ ] You can log in from the Bitwarden browser extension (configure the custom server in the extension settings).
- [ ] The "Create account" button has disappeared from the home page.
- [ ] `~/vaultwarden/backup.sh` produces a `.tar.gz` archive without error.
- [ ] The admin panel at `https://vault.exemple.com/admin` accepts your **password** (not the hash).

If all 6 are ticked, you have a **clean, secure, and backed-up** Vaultwarden. Well done.
:::

## next

:::lang fr
Trois prolongements naturels, du plus utile au plus avancé :

1. **Surveiller ton service** — pour être prévenu si Vaultwarden tombe (et pas le découvrir quand tu en as besoin en urgence).
2. **Héberger d'autres services** — Immich pour tes photos, par exemple, qui réutilise exactement la même stack (Docker Compose + Traefik + volume).
3. **Activer SMTP** — permet les invitations, le reset de mot de passe, les notifications de connexion. Voir doc officielle (lien ci-dessous), section "SMTP".
:::

:::lang en
Three natural extensions, from most useful to most advanced:

1. **Monitor your service** — so you're warned if Vaultwarden goes down (instead of discovering it when you urgently need it).
2. **Host more services** — Immich for your photos, for example, which reuses the exact same stack (Docker Compose + Traefik + volume).
3. **Enable SMTP** — enables invitations, password reset, sign-in notifications. See the official docs (link below), "SMTP" section.
:::

## cheatsheet

:::lang fr
Aide-mémoire des commandes clés pour gérer ton instance au quotidien.
:::

:::lang en
Key commands cheat sheet to operate your instance day-to-day.
:::

```bash
# Cycle de vie / Lifecycle
docker compose up -d              # démarrer / start
docker compose ps                 # statut / status
docker compose logs -f vaultwarden # suivre les logs / follow logs
docker compose down               # arrêter / stop (volume préservé / preserved)
docker compose pull               # récupérer une nouvelle image / pull a newer image

# Inspecter / Inspect
docker compose exec vaultwarden printenv ADMIN_TOKEN   # vérifier l'env / check env
docker compose exec vaultwarden /vaultwarden hash       # regénérer un hash / regenerate a hash

# Mettre à jour / Update (après lecture des release notes)
# 1. éditer image: vaultwarden/server:<nouvelle-version> dans docker-compose.yml
# 2. apply:
docker compose pull && docker compose up -d

# Sauvegarde manuelle / Manual backup
~/vaultwarden/backup.sh

# Restauration / Restore (volume DOWN avant)
docker compose down
tar -xzf ~/backups/vaultwarden/vw-YYYYMMDD-HHMMSS.tar.gz -C ~/vaultwarden/
docker compose up -d
```

## resources

:::lang fr
- [Documentation officielle Vaultwarden (wiki)](https://github.com/dani-garcia/vaultwarden/wiki) — la référence absolue.
- [Variables d'environnement complètes](https://github.com/dani-garcia/vaultwarden/blob/main/.env.template) — toutes les options possibles.
- [Comparaison Vaultwarden vs Bitwarden cloud](https://github.com/dani-garcia/vaultwarden/wiki) — article du wiki officiel.
- [Communauté self-hosted](https://www.reddit.com/r/selfhosted/) — r/selfhosted, retours d'expérience réels.
:::

:::lang en
- [Official Vaultwarden documentation (wiki)](https://github.com/dani-garcia/vaultwarden/wiki) — the absolute reference.
- [Full environment variables](https://github.com/dani-garcia/vaultwarden/blob/main/.env.template) — every available option.
- [Vaultwarden vs Bitwarden cloud comparison](https://github.com/dani-garcia/vaultwarden/wiki) — article on the official wiki.
- [Self-hosted community](https://www.reddit.com/r/selfhosted/) — r/selfhosted, real-world feedback.
:::

## troubleshooting

:::lang fr
**« unhealthy » dans `docker compose ps`.** Le healthcheck échoue. `docker compose logs --tail=50 vaultwarden`. Causes fréquentes : `wget` absent de l'image (ancienne version → enlève le healthcheck), volume non accessible en écriture (permissions sur `vw-data/`).

**« Permission denied » sur `vw-data/`.** Le conteneur tourne sous un utilisateur interne qui n'a peut-être pas les droits sur ton dossier hôte. `sudo chown -R 1000:1000 vw-data/` (l'UID 1000 est l'utilisateur par défaut dans l'image).

**« Cannot connect » depuis l'extension de navigateur.** Vérifie que dans les paramètres de l'extension, le serveur custom est bien `https://vault.exemple.com` (avec le `https://`, sans slash final). Vérifie aussi que ton DNS résout bien depuis ta machine cliente, pas seulement depuis le serveur.

**Le panel `/admin` renvoie 404.** Probablement `ADMIN_TOKEN` non défini dans `.env`. Sans token, le panel admin est désactivé pour des raisons de sécurité. Re-vérifie ton `.env`, refais l'étape 2 si nécessaire.

**« Failed to fetch » sur les clients mobile/desktop.** Cause n°1 absolue : HTTPS pas propre. Test :

```bash
curl -I https://vault.exemple.com
```

Tu dois avoir un `HTTP/2 200` et **aucun warning** de certificat. Si curl râle sur le certif, ton client Bitwarden râlera aussi.
:::

:::lang en
**"unhealthy" in `docker compose ps`.** The healthcheck fails. `docker compose logs --tail=50 vaultwarden`. Common causes: `wget` missing from the image (old version → remove the healthcheck), volume not writable (permissions on `vw-data/`).

**"Permission denied" on `vw-data/`.** The container runs as an internal user that may not have rights on your host folder. `sudo chown -R 1000:1000 vw-data/` (UID 1000 is the image's default user).

**"Cannot connect" from the browser extension.** Check that the extension's custom server is exactly `https://vault.exemple.com` (with the `https://`, no trailing slash). Also confirm your DNS resolves from your client machine, not just from the server.

**`/admin` panel returns 404.** Probably `ADMIN_TOKEN` not set in `.env`. Without the token, the admin panel is disabled for safety. Re-check your `.env`, redo step 2 if needed.

**"Failed to fetch" on mobile/desktop clients.** The number-one cause: bad HTTPS. Test:

```bash
curl -I https://vault.exemple.com
```

You should see `HTTP/2 200` and **no** certificate warning. If curl complains about the cert, your Bitwarden client will too.
:::
