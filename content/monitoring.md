---
# — Identité (ne change JAMAIS une fois publié) —
id: monitoring
slug: monitoring
order: 8
status: published

# — Titres & accroches (bilingue) —
title_fr: "Prometheus + Grafana — Monitoring de ton homelab"
title_en: "Prometheus + Grafana — Homelab monitoring"
tagline_fr: "Métriques, dashboards, alertes pour tous tes services."
tagline_en: "Metrics, dashboards, alerts for all your services."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 90
repo: "prometheus/prometheus"
last_review: "2026-06-19"

# — Relations de parcours (par id) —
prerequisites: [docker-fondamentaux, docker-compose]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [modele-pull, exporters, series-temporelles, promql, dashboards-grafana, alerting]
concepts_en: [pull-model, exporters, time-series, promql, grafana-dashboards, alerting]

# — Accès (embryon du freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Guide pas-à-pas pour monitorer ton homelab avec Prometheus et Grafana : exporters, dashboards, alertes."
og_description_en: "Step-by-step guide to monitor your homelab with Prometheus and Grafana: exporters, dashboards, alerts."
---

## intro

:::lang fr
Sans monitoring, tu découvres qu'un service est tombé **au moment où tu en as besoin** (panique). Avec monitoring, tu le sais en quelques minutes (calme).

Le problème : beaucoup de tutos te font installer Prometheus + Grafana **sans expliquer** ce que tu monitores ni pourquoi. Tu finis avec un beau dashboard que tu ne regardes jamais.

Ce guide construit une stack **minimale mais utile** : tu comprends ce que chaque composant fait, tu importes 2-3 dashboards qui *valent vraiment le coup*, et tu poses les bases de l'alerting.

**Pour qui c'est :** tu as plusieurs services qui tournent (homelab, VPS, apps perso) et tu veux passer du « je ne sais pas ce qui se passe » à « j'ai une vue ».

**Quand ce n'est PAS le bon choix :**

- Tu as **un seul service très simple** → l'overhead n'en vaut peut-être pas la peine. Uptime Kuma suffit pour du monitoring « ping-style ».
- Tu veux du **logging centralisé** → c'est Loki ou ELK qu'il te faut, pas Prometheus (métriques ≠ logs).
- Tu veux de l'**APM** (tracing, profiling applicatif) → Grafana Tempo / Pyroscope, autre sujet.
:::

:::lang en
Without monitoring, you find out a service is down **the moment you need it** (panic). With monitoring, you know within minutes (calm).

The problem: lots of tutorials have you install Prometheus + Grafana **without explaining** what you're monitoring or why. You end up with a pretty dashboard you never look at.

This guide builds a **minimal but useful** stack: you understand what each component does, you import 2-3 dashboards that are *actually worth it*, and you lay the groundwork for alerting.

**Who it's for:** you have several services running (homelab, VPS, personal apps) and you want to go from "I have no idea what's happening" to "I have visibility".

**When it's NOT the right choice:**

- You run **a single very simple service** → the overhead may not be worth it. Uptime Kuma is enough for "ping-style" monitoring.
- You want **centralized logging** → you need Loki or ELK, not Prometheus (metrics ≠ logs).
- You want **APM** (tracing, application profiling) → Grafana Tempo / Pyroscope, a different topic.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Expliquer le modèle **pull-based** de Prometheus (vs push) et pourquoi il est plus simple à opérer.
- Déployer les deux **exporters** essentiels : node-exporter (machine) et cAdvisor (conteneurs).
- Comprendre comment Prometheus **scrape** et stocke des métriques (séries temporelles, rétention).
- Écrire du **PromQL** au niveau utile (pas besoin d'être expert).
- Importer un **dashboard Grafana** éprouvé depuis grafana.com au lieu de partir de zéro.
- Poser une première **alerte** simple (disque > 85 %) et comprendre le rôle d'**Alertmanager** (mentionné, non installé ici).

Tu manipuleras au passage : `docker compose`, réseaux Docker, volumes nommés, basic auth Traefik, échappement des `$` dans un compose.
:::

:::lang en
By the end of this guide, you'll know how to:

- Explain Prometheus's **pull-based** model (vs push) and why it's simpler to operate.
- Deploy the two essential **exporters**: node-exporter (machine) and cAdvisor (containers).
- Understand how Prometheus **scrapes** and stores metrics (time series, retention).
- Write **PromQL** at a useful level (no need to be an expert).
- Import a battle-tested **Grafana dashboard** from grafana.com instead of starting from scratch.
- Set up a first simple **alert** (disk > 85%) and understand the role of **Alertmanager** (mentioned, not installed here).

Along the way you'll handle: `docker compose`, Docker networks, named volumes, Traefik basic auth, `$` escaping in a compose file.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- **Docker et Docker Compose** maîtrisés : services, volumes, réseaux, `env_file`.
- Une aisance en **ligne de commande Linux** (`cd`, `nano`/`vim`, `crontab` non requis ici).
- Un **reverse proxy Traefik avec HTTPS** qui tourne déjà — optionnel mais fortement recommandé pour exposer Grafana et Prometheus proprement. Ce guide suppose le réseau Docker `proxy` et le certresolver `le` du guide Traefik.
- Au moins **1 Go de RAM disponible** pour la stack (Prometheus + Grafana + exporters).
- Deux **sous-domaines** que tu contrôles (ex. `grafana.exemple.com`, `prometheus.exemple.com`), pointant vers ton serveur.

**Prérequis honnête :** pas besoin de connaître PromQL ni Grafana avant de commencer — c'est justement ce qu'on apprend ici.
:::

:::lang en
You should have:

- A solid grasp of **Docker and Docker Compose**: services, volumes, networks, `env_file`.
- Comfort with the **Linux command line** (`cd`, `nano`/`vim`; no `crontab` needed here).
- A **Traefik reverse proxy with HTTPS** already running — optional but strongly recommended to expose Grafana and Prometheus cleanly. This guide assumes the `proxy` Docker network and the `le` certresolver from the Traefik guide.
- At least **1 GB of available RAM** for the stack (Prometheus + Grafana + exporters).
- Two **subdomains** you control (e.g. `grafana.exemple.com`, `prometheus.exemple.com`), pointed at your server.

**Honest prerequisite:** you don't need to know PromQL or Grafana before starting — that's exactly what we learn here.
:::

## concepts

:::lang fr
La stack repose sur un modèle clé : Prometheus **va chercher** (pull) les métriques. Chaque composant expose un endpoint HTTP `/metrics` en texte brut, et Prometheus passe les récupérer à intervalle régulier (le **scrape**). C'est l'inverse des systèmes push (StatsD, InfluxDB) : plus simple à opérer, plus robuste (une cible morte = une info, pas un silence), et self-service (ajouter une cible = trois lignes de config).

Les quatre composants :

- **node-exporter** expose les métriques de la **machine** : CPU, RAM, disque, réseau, load average.
- **cAdvisor** expose les métriques **par conteneur Docker** : quel service consomme quoi.
- **Prometheus** scrape ces endpoints, stocke tout dans sa base de **séries temporelles** (TSDB) et te laisse interroger avec **PromQL**.
- **Grafana** interroge Prometheus et affiche des **dashboards** ; il sait aussi évaluer des règles d'alerte et notifier.

Pour l'alerting « pro », il existe un cinquième composant, **Alertmanager** (routage, déduplication, silences). On le mentionne dans le schéma mais on ne l'installe pas ici : les alertes Grafana suffisent pour démarrer.
:::

:::lang en
The stack rests on one key model: Prometheus **goes and fetches** (pull) the metrics. Each component exposes a plain-text HTTP `/metrics` endpoint, and Prometheus collects them at a regular interval (the **scrape**). It's the opposite of push systems (StatsD, InfluxDB): simpler to operate, more robust (a dead target = information, not silence), and self-service (adding a target = three lines of config).

The four components:

- **node-exporter** exposes **machine** metrics: CPU, RAM, disk, network, load average.
- **cAdvisor** exposes **per-Docker-container** metrics: which service consumes what.
- **Prometheus** scrapes those endpoints, stores everything in its **time-series** database (TSDB), and lets you query it with **PromQL**.
- **Grafana** queries Prometheus and renders **dashboards**; it can also evaluate alert rules and notify you.

For "pro-grade" alerting there's a fifth component, **Alertmanager** (routing, deduplication, silences). It appears in the diagram but we don't install it here: Grafana alerts are enough to get started.
:::

:::figure monitoring-architecture
caption_fr: "Schéma 1. Chaîne de monitoring : exporters → Prometheus (scrape + stockage) → Grafana (dashboards) → alertes."
caption_en: "Figure 1. Monitoring chain: exporters → Prometheus (scrape + storage) → Grafana (dashboards) → alerts."
:::

:::lang fr
**Points clés à retenir :**

- Prometheus stocke des **séries temporelles** : une métrique + des labels + des valeurs horodatées. PromQL est conçu pour ça (`rate()`, `sum by()`), pas SQL.
- Les conteneurs de la stack se parlent **par nom de service** sur leur réseau Docker interne — Grafana joint Prometheus via `http://prometheus:9090`, jamais via `localhost`.
- Seuls **Grafana et Prometheus** rejoignent le réseau `proxy` (exposition via Traefik). Les exporters restent internes : rien à exposer, rien à protéger.
- Prometheus expose ton architecture interne : s'il est accessible depuis Internet, c'est **toujours derrière une basic auth**.
:::

:::lang en
**Key takeaways:**

- Prometheus stores **time series**: a metric + labels + timestamped values. PromQL is designed for that (`rate()`, `sum by()`), not SQL.
- The stack's containers talk to each other **by service name** on their internal Docker network — Grafana reaches Prometheus at `http://prometheus:9090`, never via `localhost`.
- Only **Grafana and Prometheus** join the `proxy` network (exposure through Traefik). The exporters stay internal: nothing to expose, nothing to protect.
- Prometheus reveals your internal architecture: if it's reachable from the Internet, it's **always behind basic auth**.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Préparer la structure — un dossier dédié à la stack avec un sous-dossier pour la config Prometheus.

**🤔 Pourquoi ?** Toute la stack (4 services) vit dans un seul projet Compose : un `compose.yaml`, un `.env`, une config Prometheus. Un dossier = un service (ou une stack), c'est le pattern qui rend ton serveur lisible dans six mois.
:::

:::lang en
**Goal.** Prepare the structure — a dedicated folder for the stack with a sub-folder for the Prometheus config.

**🤔 Why?** The whole stack (4 services) lives in a single Compose project: one `compose.yaml`, one `.env`, one Prometheus config. One folder = one service (or stack) — that's the pattern that keeps your server readable six months from now.
:::

```bash
mkdir -p ~/monitoring/prometheus
cd ~/monitoring
```

:::lang fr
**✅ Vérification :**
:::

:::lang en
**✅ Check:**
:::

```bash
pwd     # /home/<toi>/monitoring
ls      # doit montrer / should show: prometheus
```

### step-02

:::lang fr
**Objectif.** Écrire la config Prometheus : qui scraper, à quelle fréquence.

**🤔 Pourquoi ces 3 jobs ?**

- `prometheus` → Prometheus se monitore lui-même (méta-monitoring, bonne pratique : si ta stack de monitoring souffre, tu veux le savoir).
- `node` → métriques **machine** (CPU, RAM, disque, réseau, load average).
- `cadvisor` → métriques **par conteneur** Docker (CPU/RAM par service).

Avec ces deux exporters, tu couvres déjà 80 % des questions importantes. Les cibles sont des **noms de services Docker** (`node-exporter:9100`) : Prometheus les résout sur le réseau interne du projet Compose.

**🤔 Pourquoi `scrape_interval: 15s` ?** Compromis classique : assez fin pour voir les pics, assez large pour ne pas exploser le stockage. Pour 99 % des homelabs, 15-30 s suffisent.
:::

:::lang en
**Goal.** Write the Prometheus config: what to scrape, and how often.

**🤔 Why these 3 jobs?**

- `prometheus` → Prometheus monitors itself (meta-monitoring, good practice: if your monitoring stack is suffering, you want to know).
- `node` → **machine** metrics (CPU, RAM, disk, network, load average).
- `cadvisor` → **per-container** Docker metrics (CPU/RAM per service).

With those two exporters you already cover 80% of the questions that matter. The targets are **Docker service names** (`node-exporter:9100`): Prometheus resolves them on the Compose project's internal network.

**🤔 Why `scrape_interval: 15s`?** The classic trade-off: fine enough to catch spikes, coarse enough not to blow up storage. For 99% of homelabs, 15-30s is plenty.
:::

```bash
nano prometheus/prometheus.yml
```

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
```

:::lang fr
**✅ Vérification :** valide la syntaxe avec `promtool` (inclus dans l'image Prometheus, pas besoin de l'installer) :
:::

:::lang en
**✅ Check:** validate the syntax with `promtool` (bundled in the Prometheus image, nothing to install):
:::

```bash
docker run --rm -v ~/monitoring/prometheus/prometheus.yml:/prometheus.yml:ro \
  --entrypoint promtool prom/prometheus:v3.0.0 check config /prometheus.yml
# Attendu / Expected: "SUCCESS: /prometheus.yml is valid prometheus config file syntax"
```

### step-03

:::lang fr
**Objectif.** Créer le `.env` avec la config sensible de Grafana, hors `compose.yaml`.

**🤔 Pourquoi ?**

- Le compte admin Grafana est créé **au premier démarrage** à partir de ces variables — après, changer le `.env` ne change plus le mot de passe (ça se fait dans l'UI).
- `GF_USERS_ALLOW_SIGN_UP=false` ferme les inscriptions publiques d'entrée de jeu.
- Séparer secrets et `compose.yaml` te permet de versionner le compose en Git **sans** committer tes mots de passe.
- Ce `.env` est chargé via `env_file:` → les valeurs se collent **brutes** : pas de guillemets, pas de doublement des `$`. (Retiens la règle, elle revient à l'étape suivante dans l'autre sens.)
:::

:::lang en
**Goal.** Create the `.env` with Grafana's sensitive config, kept out of `compose.yaml`.

**🤔 Why?**

- The Grafana admin account is created **on first startup** from these variables — after that, changing `.env` no longer changes the password (that's done in the UI).
- `GF_USERS_ALLOW_SIGN_UP=false` closes public sign-ups from the start.
- Splitting secrets from `compose.yaml` lets you Git-version the compose file **without** committing your passwords.
- This `.env` is loaded via `env_file:` → values are pasted **raw**: no quotes, no doubling of `$`. (Remember the rule — it comes back in the next step, the other way around.)
:::

```bash
nano .env
```

```env
# Compte admin créé au premier démarrage / Admin account created on first startup
# Valeurs BRUTES : pas de guillemets, pas de $$ (fichier chargé via env_file)
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=remplace-par-un-mot-de-passe-fort

# Pas d'inscriptions publiques / No public sign-ups
GF_USERS_ALLOW_SIGN_UP=false

# URL publique (liens corrects dans les notifications) / Public URL (correct links in notifications)
GF_SERVER_ROOT_URL=https://grafana.exemple.com
```

:::lang fr
**✅ Vérification :**

```bash
cat .env
# 4 variables, aucune valeur entre guillemets
```
:::

:::lang en
**✅ Check:**

```bash
cat .env
# 4 variables, no value wrapped in quotes
```
:::

### step-04

:::lang fr
**Objectif.** Générer le hash basic-auth qui protégera l'UI Prometheus derrière Traefik.

**🤔 Pourquoi ?** Prometheus n'a **aucune authentification native** et son UI révèle toute ton architecture interne (services, ports, versions). On l'exposera donc derrière une middleware basic auth de Traefik. Le hash bcrypt sera collé **directement dans le `compose.yaml`** — et là, la règle des `$` s'inverse : dans un compose, Compose interprète `${...}` (interpolation), donc **chaque `$` littéral doit être doublé en `$$`**. C'est l'inverse du `.env` de l'étape 3. Le `sed` ci-dessous fait le doublement pour toi.
:::

:::lang en
**Goal.** Generate the basic-auth hash that will protect the Prometheus UI behind Traefik.

**🤔 Why?** Prometheus has **no built-in authentication**, and its UI reveals your entire internal architecture (services, ports, versions). So we'll expose it behind a Traefik basic-auth middleware. The bcrypt hash will be pasted **directly into `compose.yaml`** — and there the `$` rule flips: in a compose file, Compose interprets `${...}` (interpolation), so **every literal `$` must be doubled as `$$`**. It's the opposite of step 3's `.env`. The `sed` below does the doubling for you.
:::

```bash
# htpasswd vient de l'image httpd (pas besoin de l'installer sur l'hôte)
# htpasswd comes from the httpd image (no need to install it on the host)
docker run --rm httpd:2.4.62 htpasswd -nbB admin 'TonMotDePasseFort' | sed -e 's/\$/\$\$/g'
```

:::lang fr
La sortie ressemble à :

```
admin:$$2y$$05$$Q3bX...
```

Garde-la sous la main : on la colle dans le `compose.yaml` à l'étape suivante. Retiens aussi le mot de passe **en clair** — c'est lui que tu taperas dans le navigateur.

**✅ Vérification :** chaque `$` de la sortie est bien doublé (`$$2y$$05$$...`). Si tu vois des `$` simples, le `sed` n'a pas été appliqué.
:::

:::lang en
The output looks like:

```
admin:$$2y$$05$$Q3bX...
```

Keep it handy: we paste it into `compose.yaml` in the next step. Also remember the **clear-text** password — that's what you'll type in the browser.

**✅ Check:** every `$` in the output is doubled (`$$2y$$05$$...`). If you see single `$`, the `sed` wasn't applied.
:::

### step-05

:::lang fr
**Objectif.** Écrire le `compose.yaml` qui décrit les 4 services.

**🤔 Pourquoi chacun des choix ?**

- **Versions pinées** (`v3.0.0`, `11.4.0`, `v1.8.2`, `v0.49.1`) → jamais `:latest`. Tu décides quand mettre à jour, et tu sais quoi rollback si ça casse.
- `--storage.tsdb.retention.time=30d` → 30 jours de métriques fines ≈ 1-3 Go pour un homelab moyen. Au-delà, il faudrait du downsampling (Thanos, Mimir) — rarement utile ici.
- **Volumes nommés** (`prometheus-data`, `grafana-data`) → tes métriques et dashboards survivent à la recréation des conteneurs.
- **Réseaux** : les 4 services partagent le réseau `default` du projet (résolution par nom de service). Seuls **prometheus** et **grafana** rejoignent en plus le réseau `proxy` (externe, créé par Traefik) — les exporters n'ont **rien à faire** sur le réseau d'exposition.
- **node-exporter** monte `/proc`, `/sys` et `/` en lecture seule → pour lire les vraies métriques de l'**hôte**, pas celles du conteneur. Note le `($$|/)` dans son `--collector.filesystem.mount-points-exclude` : c'est un `$` de regex, doublé parce qu'on est dans le compose (règle de l'étape 4).
- **cAdvisor** est `privileged: true` → il a besoin d'un accès profond au runtime Docker pour mesurer les ressources par conteneur. Compromis sécurité accepté pour cet usage.
- Le label `basicauth.users` reçoit **ton hash doublé** de l'étape 4.
- `certresolver=le` → doit correspondre **exactement** au nom défini dans ta config Traefik.
:::

:::lang en
**Goal.** Write the `compose.yaml` describing the 4 services.

**🤔 Why each choice?**

- **Pinned versions** (`v3.0.0`, `11.4.0`, `v1.8.2`, `v0.49.1`) → never `:latest`. You decide when to update, and you know what to roll back if something breaks.
- `--storage.tsdb.retention.time=30d` → 30 days of fine-grained metrics ≈ 1-3 GB for an average homelab. Beyond that you'd want downsampling (Thanos, Mimir) — rarely useful here.
- **Named volumes** (`prometheus-data`, `grafana-data`) → your metrics and dashboards survive container recreation.
- **Networks**: all 4 services share the project's `default` network (service-name resolution). Only **prometheus** and **grafana** additionally join the `proxy` network (external, created by Traefik) — the exporters have **no business** on the exposure network.
- **node-exporter** mounts `/proc`, `/sys` and `/` read-only → to read the real metrics of the **host**, not the container's. Note the `($$|/)` in its `--collector.filesystem.mount-points-exclude`: that's a regex `$`, doubled because we're inside the compose file (step 4's rule).
- **cAdvisor** is `privileged: true` → it needs deep access to the Docker runtime to measure per-container resources. An accepted security trade-off for this use.
- The `basicauth.users` label takes **your doubled hash** from step 4.
- `certresolver=le` → must match **exactly** the name defined in your Traefik config.
:::

```bash
nano compose.yaml
```

```yaml
services:
  prometheus:
    image: prom/prometheus:v3.0.0
    container_name: prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    networks:
      - default
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.prometheus.rule=Host(`prometheus.exemple.com`)"
      - "traefik.http.routers.prometheus.entrypoints=websecure"
      - "traefik.http.routers.prometheus.tls.certresolver=le"
      - "traefik.http.services.prometheus.loadbalancer.server.port=9090"
      # Basic auth OBLIGATOIRE : colle ici TA sortie de l'étape 4 ($ doublés en $$)
      # Basic auth REQUIRED: paste YOUR step-4 output here ($ doubled as $$)
      - "traefik.http.routers.prometheus.middlewares=prometheus-auth"
      - "traefik.http.middlewares.prometheus-auth.basicauth.users=admin:$$2y$$05$$Q3bX..."

  node-exporter:
    image: prom/node-exporter:v1.8.2
    container_name: node-exporter
    restart: unless-stopped
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/host'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc|rootfs/var/lib/docker/.+)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/host:ro,rslave
    networks:
      - default

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.49.1
    container_name: cadvisor
    restart: unless-stopped
    privileged: true
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    networks:
      - default

  grafana:
    image: grafana/grafana:11.4.0
    container_name: grafana
    restart: unless-stopped
    env_file: .env
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - default
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(`grafana.exemple.com`)"
      - "traefik.http.routers.grafana.entrypoints=websecure"
      - "traefik.http.routers.grafana.tls.certresolver=le"
      - "traefik.http.services.grafana.loadbalancer.server.port=3000"

volumes:
  prometheus-data:
  grafana-data:

networks:
  proxy:
    external: true
```

:::lang fr
**✅ Vérification :**

```bash
docker compose config
# Doit afficher la config interprétée sans erreur.
```

Dans la sortie, la ligne `basicauth.users` doit montrer ton hash avec des `$` **simples** (Compose a « consommé » les `$$` — c'est le signe que l'échappement est correct). Si tu vois `refers to undefined network proxy` → ton réseau `proxy` n'existe pas : `docker network create proxy` (ou repasse par le guide Traefik).
:::

:::lang en
**✅ Check:**

```bash
docker compose config
# Should print the parsed config with no error.
```

In the output, the `basicauth.users` line must show your hash with **single** `$` (Compose has "consumed" the `$$` — the sign that escaping is correct). If you see `refers to undefined network proxy` → your `proxy` network doesn't exist: `docker network create proxy` (or go back through the Traefik guide).
:::

### step-06

:::lang fr
**Objectif.** Lancer la stack et vérifier que Prometheus voit toutes ses cibles.

**🤔 Pourquoi vérifier les targets d'abord ?** « Le conteneur tourne » ne veut pas dire « le scrape fonctionne ». La page **Status → Targets** est ta source de vérité : chaque job doit être `UP`. Une cible `DOWN` maintenant = un dashboard vide tout à l'heure — autant régler ça tout de suite.
:::

:::lang en
**Goal.** Launch the stack and check that Prometheus sees all its targets.

**🤔 Why check the targets first?** "The container is running" doesn't mean "the scrape works". The **Status → Targets** page is your source of truth: every job must be `UP`. A `DOWN` target now = an empty dashboard later — better to fix it right away.
:::

```bash
docker compose up -d
docker compose logs -f prometheus
```

:::lang fr
Cherche dans les logs : `Server is ready to receive web requests.` — puis `Ctrl+C` pour sortir des logs (ça n'arrête pas les conteneurs).

**✅ Vérification :**

```bash
docker compose ps
# Les 4 services en "Up"
```

Puis ouvre `https://prometheus.exemple.com` (le navigateur demande le login basic auth de l'étape 4). Va dans **Status → Targets** : les 3 jobs (`prometheus`, `node`, `cadvisor`) doivent être en `UP`. Si l'un est rouge : problème de réseau ou de port — voir troubleshooting.
:::

:::lang en
Look for this in the logs: `Server is ready to receive web requests.` — then `Ctrl+C` to exit the logs (it does not stop the containers).

**✅ Check:**

```bash
docker compose ps
# All 4 services "Up"
```

Then open `https://prometheus.exemple.com` (the browser asks for step 4's basic-auth login). Go to **Status → Targets**: the 3 jobs (`prometheus`, `node`, `cadvisor`) must be `UP`. If one is red: network or port issue — see troubleshooting.
:::

### step-07

:::lang fr
**Objectif.** Première connexion à Grafana et branchement de la data source Prometheus.

**🤔 Pourquoi `http://prometheus:9090` et pas `localhost` ?** Grafana et Prometheus sont dans le même réseau Docker : ils se résolvent **par nom de service**. `localhost`, vu depuis le conteneur Grafana, c'est… le conteneur Grafana lui-même. C'est l'erreur n°1 des débutants sur cette étape. Bonus : pas besoin d'exposer Prometheus à Internet pour que Grafana lui parle.
:::

:::lang en
**Goal.** First Grafana login and wiring the Prometheus data source.

**🤔 Why `http://prometheus:9090` and not `localhost`?** Grafana and Prometheus are on the same Docker network: they resolve each other **by service name**. `localhost`, as seen from the Grafana container, is… the Grafana container itself. That's the #1 beginner mistake at this step. Bonus: no need to expose Prometheus to the Internet for Grafana to talk to it.
:::

:::lang fr
1. Ouvre `https://grafana.exemple.com`, connecte-toi avec le compte du `.env` (étape 3).
2. Va dans **Connections → Data sources → Add data source**.
3. Choisis **Prometheus**.
4. URL : `http://prometheus:9090` (nom du service Docker, **pas localhost**).
5. **Save & test**.

**✅ Vérification :** Grafana affiche « Successfully queried the Prometheus API » (ou « Data source is working »). Si erreur → voir le piège n°4.
:::

:::lang en
1. Open `https://grafana.exemple.com`, log in with the `.env` account (step 3).
2. Go to **Connections → Data sources → Add data source**.
3. Pick **Prometheus**.
4. URL: `http://prometheus:9090` (Docker service name, **not localhost**).
5. **Save & test**.

**✅ Check:** Grafana shows "Successfully queried the Prometheus API" (or "Data source is working"). If it errors → see pitfall #4.
:::

### step-08

:::lang fr
**Objectif.** Importer des dashboards éprouvés depuis grafana.com — pas les créer from scratch.

**🤔 Pourquoi importer plutôt que créer ?** Des milliers de personnes ont déjà itéré sur ces dashboards : bons panels, bonnes requêtes PromQL, bons seuils visuels. Tu apprendras plus vite en lisant leurs requêtes qu'en réinventant les tiennes. Les 3 IDs ci-dessous :

- **1860** (Node Exporter Full) → ton dashboard « système », celui que tu regardes le matin.
- **893** (Docker and system monitoring) → quel conteneur consomme quoi (vue cAdvisor).
- **3662** (Prometheus 2.0 Overview) → santé de la stack de monitoring elle-même.

Pas besoin de 50 dashboards : 3-5 que tu regardes *vraiment* > 30 que tu n'ouvres jamais.

**Méthode :**

1. Grafana → **Dashboards → New → Import**.
2. Tape l'ID (ex. `1860`) → **Load**.
3. Sélectionne ta data source Prometheus → **Import**.
4. Répète pour `893` et `3662`.

**✅ Vérification :** le dashboard 1860 affiche tes métriques système en temps réel (CPU, RAM, disque). Si des panels affichent « No data » → vérifie l'intervalle de temps en haut à droite (mets « Last 15 minutes »), et que les targets sont toujours `UP`.
:::

:::lang en
**Goal.** Import battle-tested dashboards from grafana.com — don't build them from scratch.

**🤔 Why import instead of building?** Thousands of people have already iterated on these dashboards: good panels, good PromQL queries, good visual thresholds. You'll learn faster reading their queries than reinventing your own. The 3 IDs below:

- **1860** (Node Exporter Full) → your "system" dashboard, the one you check in the morning.
- **893** (Docker and system monitoring) → which container consumes what (cAdvisor view).
- **3662** (Prometheus 2.0 Overview) → health of the monitoring stack itself.

You don't need 50 dashboards: 3-5 you *actually* look at > 30 you never open.

**Method:**

1. Grafana → **Dashboards → New → Import**.
2. Type the ID (e.g. `1860`) → **Load**.
3. Select your Prometheus data source → **Import**.
4. Repeat for `893` and `3662`.

**✅ Check:** dashboard 1860 shows your system metrics in real time (CPU, RAM, disk). If panels show "No data" → check the time range at the top right (set "Last 15 minutes"), and that the targets are still `UP`.
:::

### step-09

:::lang fr
**Objectif.** Poser ta première alerte : disque presque plein.

**🤔 Pourquoi commencer par « disque plein » ?** C'est la cause n°1 de panne silencieuse en self-hosting : logs qui débordent, backups jamais purgés, conteneur qui écrit à fond. Un disque plein = beaucoup de services qui crashent en cascade.

**🤔 Pourquoi les alertes Grafana et pas Alertmanager ?** Le chemin « pro » est Prometheus → Alertmanager → Discord/Telegram/Email (routage, déduplication, silences). Mais pour un homelab, les alertes Grafana couvrent le besoin avec beaucoup moins de pièces mobiles. Alertmanager viendra plus tard si tu multiplies les règles.

Dans Grafana :

1. Configure d'abord un **contact point** : **Alerting → Contact points → Add contact point** (webhook Discord/Telegram, ou email si tu as un SMTP).
2. Ouvre un panel « Disk usage » du dashboard 1860 → titre du panel → **More → New alert rule**.
3. Condition : valeur au-dessus de `0.85` (85 % de disque utilisé).
4. Associe ton contact point, sauvegarde.
:::

:::lang en
**Goal.** Set your first alert: disk almost full.

**🤔 Why start with "disk full"?** It's the #1 cause of silent failure in self-hosting: overflowing logs, backups never pruned, a container writing at full speed. A full disk = many services crashing in cascade.

**🤔 Why Grafana alerts and not Alertmanager?** The "pro" path is Prometheus → Alertmanager → Discord/Telegram/Email (routing, deduplication, silences). But for a homelab, Grafana alerts cover the need with far fewer moving parts. Alertmanager can come later if your rules multiply.

In Grafana:

1. First configure a **contact point**: **Alerting → Contact points → Add contact point** (Discord/Telegram webhook, or email if you have SMTP).
2. Open a "Disk usage" panel from dashboard 1860 → panel title → **More → New alert rule**.
3. Condition: value above `0.85` (85% disk used).
4. Attach your contact point, save.
:::

:::lang fr
**✅ Vérification :** teste l'alerte en simulant un disque qui se remplit.

⚠️ **Attention :** la commande ci-dessous **écrit 5 Go** sur ton disque. Ne la lance pas si tu es déjà proche du seuil, et supprime le fichier juste après le test.
:::

:::lang en
**✅ Check:** test the alert by simulating a filling disk.

⚠️ **Warning:** the command below **writes 5 GB** to your disk. Don't run it if you're already close to the threshold, and delete the file right after the test.
:::

```bash
dd if=/dev/zero of=~/test-disk-alert.img bs=1G count=5
# ... attends la notification / wait for the notification ...
rm ~/test-disk-alert.img
```

:::lang fr
Si ton disque passe au-dessus du seuil, tu dois recevoir la notification sur ton contact point après le délai d'évaluation (« pending period », 1-5 min par défaut). Si ton disque reste sous 85 %, baisse temporairement le seuil de la règle pour la déclencher, puis remets-le.
:::

:::lang en
If your disk crosses the threshold, you should receive the notification on your contact point after the evaluation delay ("pending period", 1-5 min by default). If your disk stays under 85%, temporarily lower the rule's threshold to trigger it, then restore it.
:::

### step-10

:::lang fr
**Objectif.** Te familiariser avec PromQL en interrogeant tes propres métriques.

**🤔 Pourquoi PromQL et pas SQL ?** Prometheus stocke des séries temporelles, pas des lignes. PromQL est conçu pour les manipuler : `rate()` (dérivée sur une fenêtre), `sum()`, `avg by()` (agrégations par label). Quelques heures d'apprentissage, immense gain de pouvoir — c'est le langage de toutes tes futures alertes et de tous tes panels.

Va dans Prometheus → **Graph** (ou l'onglet **Explore** de Grafana) et tape :
:::

:::lang en
**Goal.** Get comfortable with PromQL by querying your own metrics.

**🤔 Why PromQL and not SQL?** Prometheus stores time series, not rows. PromQL is built to manipulate them: `rate()` (derivative over a window), `sum()`, `avg by()` (aggregations by label). A few hours of learning, a huge gain in power — it's the language of all your future alerts and panels.

Go to Prometheus → **Graph** (or Grafana's **Explore** tab) and type:
:::

```promql
# Charge CPU des 5 dernières minutes / 5-minute load average
node_load5

# % de RAM utilisée / % RAM used
100 * (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes))

# Trafic réseau reçu (octets/sec) / Network traffic received (bytes/sec)
rate(node_network_receive_bytes_total[5m])

# RAM utilisée par conteneur / RAM used per container
container_memory_usage_bytes{name!=""}
```

:::lang fr
**✅ Vérification :** chaque requête renvoie des valeurs (et un graphe dans l'onglet Graph). Si `container_memory_usage_bytes` ne renvoie rien → la cible `cadvisor` est probablement `DOWN`, retourne à l'étape 6.
:::

:::lang en
**✅ Check:** each query returns values (and a graph in the Graph tab). If `container_memory_usage_bytes` returns nothing → the `cadvisor` target is probably `DOWN`, go back to step 6.
:::

## pitfalls

:::lang fr
**1. Target en `DOWN` alors que le service tourne.** Presque toujours un problème de réseau Docker (Prometheus pas sur le même réseau que la cible) ou de port (le service expose `/metrics` sur un autre port que celui scrapé). Regarde la colonne `Last Error` dans Status → Targets, elle dit tout.

**2. Data source Grafana en erreur avec `http://localhost:9090`.** `localhost`, vu depuis le conteneur Grafana, c'est le conteneur Grafana. Mets le **nom de service** : `http://prometheus:9090`.

**3. Basic auth Prometheus qui refuse ton mot de passe.** Quasi toujours l'échappement des `$` : dans le `compose.yaml`, chaque `$` du hash bcrypt doit être doublé en `$$` (interpolation `${...}` de Compose). À l'inverse, dans un `.env` chargé par `env_file` (Grafana), les valeurs se collent **brutes**, sans `$$` ni guillemets. Vérifie avec `docker compose config` : le hash doit y apparaître avec des `$` simples.

**4. node-exporter qui scrape les filesystems de Docker.** Pollue tes métriques avec des dizaines de « filesystems » (overlay2, etc.). C'est le rôle du `--collector.filesystem.mount-points-exclude` du compose. Si tu vois ce souci, vérifie qu'il est bien là — avec son `($$|/)` final intact.

**5. Disque qui se remplit à cause de Prometheus.** 30 jours × scrape 15 s × milliers de séries = quelques Go. Si tu manques de place, baisse `retention.time` ou passe `scrape_interval` à 30-60 s. (Et vois l'ironie : ton monitoring peut déclencher sa propre alerte disque.)

**6. Alerte configurée mais jamais reçue.** Une règle d'alerte **sans contact point** évalue dans le vide. En Grafana, vérifie Alerting → Contact points (fais « Test »). Côté Prometheus pur, les règles ne notifient **jamais** sans Alertmanager.

**7. Prometheus exposé sans auth sur Internet.** Son UI révèle ton architecture interne (services, ports, versions). **Toujours** une middleware basic auth Traefik devant — ou pas d'exposition du tout (Grafana lui parle très bien par le réseau interne).

**8. Tu importes 30 dashboards et tu en regardes 0.** Discipline-toi : 3-5 dashboards utiles. Le reste, c'est du folklore.
:::

:::lang en
**1. Target `DOWN` while the service is running.** Almost always a Docker network issue (Prometheus not on the same network as the target) or a port issue (the service exposes `/metrics` on a different port than the one scraped). Check the `Last Error` column in Status → Targets — it tells you everything.

**2. Grafana data source erroring with `http://localhost:9090`.** `localhost`, as seen from the Grafana container, is the Grafana container. Use the **service name**: `http://prometheus:9090`.

**3. Prometheus basic auth rejecting your password.** Nearly always the `$` escaping: in `compose.yaml`, every `$` of the bcrypt hash must be doubled as `$$` (Compose `${...}` interpolation). Conversely, in a `.env` loaded via `env_file` (Grafana), values are pasted **raw**, no `$$` and no quotes. Check with `docker compose config`: the hash must appear there with single `$`.

**4. node-exporter scraping Docker's filesystems.** Pollutes your metrics with dozens of "filesystems" (overlay2, etc.). That's what the compose's `--collector.filesystem.mount-points-exclude` is for. If you hit this, check it's there — with its trailing `($$|/)` intact.

**5. Disk filling up because of Prometheus.** 30 days × 15s scrape × thousands of series = a few GB. If you're short on space, lower `retention.time` or raise `scrape_interval` to 30-60s. (Note the irony: your monitoring can trigger its own disk alert.)

**6. Alert configured but never received.** An alert rule **without a contact point** evaluates into the void. In Grafana, check Alerting → Contact points (use "Test"). On the pure-Prometheus side, rules **never** notify without Alertmanager.

**7. Prometheus exposed on the Internet without auth.** Its UI reveals your internal architecture (services, ports, versions). **Always** a Traefik basic-auth middleware in front — or no exposure at all (Grafana talks to it just fine over the internal network).

**8. You import 30 dashboards and look at 0.** Discipline yourself: 3-5 useful dashboards. The rest is folklore.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Prometheus → Status → Targets : les 3 jobs (`prometheus`, `node`, `cadvisor`) en `UP`.
- [ ] `https://prometheus.exemple.com` exige le login basic auth (cadenas vert).
- [ ] Grafana → dashboard 1860 affiche tes métriques système en temps réel.
- [ ] Tu peux répondre en < 30 s à : « quelle est la charge CPU de mon serveur, là ? »
- [ ] Tu as au moins **une** alerte configurée avec un contact point testé (disque, RAM ou conteneur down).
- [ ] Tu as reçu la notification lors du test de remplissage disque de l'étape 9 (et supprimé `test-disk-alert.img`).
- [ ] Tu as ouvert ton dashboard au moins **2 fois** cette semaine.

Si tout est coché, tu as un monitoring **que tu comprends et que tu regardes**. C'est ça, la vraie victoire.
:::

:::lang en
You know it works when…

- [ ] Prometheus → Status → Targets: all 3 jobs (`prometheus`, `node`, `cadvisor`) are `UP`.
- [ ] `https://prometheus.exemple.com` requires the basic-auth login (green padlock).
- [ ] Grafana → dashboard 1860 shows your system metrics in real time.
- [ ] You can answer in < 30s: "what's my server's CPU load right now?"
- [ ] You have at least **one** alert configured with a tested contact point (disk, RAM, or container down).
- [ ] You received the notification during step 9's disk-fill test (and deleted `test-disk-alert.img`).
- [ ] You've opened your dashboard at least **twice** this week.

If everything is ticked, you have monitoring **you understand and actually look at**. That's the real win.
:::

## next

:::lang fr
Cinq prolongements naturels, du plus utile au plus avancé :

1. **Alertmanager** — router les alertes vers Discord/Telegram/Email avec déduplication et silences, quand tes règles se multiplient.
2. **Loki** — ajouter le logging centralisé (complète Prometheus côté logs, s'affiche dans le même Grafana).
3. **Blackbox exporter** — monitoring externe : « est-ce que mon site répond depuis dehors ? »
4. **Exporters spécifiques** — Postgres exporter, Redis exporter, etc., selon les services que tu héberges.
5. **Uptime Kuma** (alternative simple) — si finalement tu veux juste du « ping monitoring » sans la richesse (ni la complexité) de Prometheus.
:::

:::lang en
Five natural extensions, from most useful to most advanced:

1. **Alertmanager** — route alerts to Discord/Telegram/Email with deduplication and silences, once your rules multiply.
2. **Loki** — add centralized logging (complements Prometheus on the logs side, shows up in the same Grafana).
3. **Blackbox exporter** — external monitoring: "does my site respond from the outside?"
4. **Service-specific exporters** — Postgres exporter, Redis exporter, etc., depending on what you host.
5. **Uptime Kuma** (simple alternative) — if in the end you just want "ping monitoring" without Prometheus's richness (or complexity).
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
docker compose up -d                 # démarrer / start
docker compose ps                    # statut / status
docker compose logs -f prometheus    # suivre les logs / follow logs
docker compose down                  # arrêter / stop (volumes préservés / preserved)

# ⚠️ DESTRUCTIF : supprime métriques ET dashboards / DESTRUCTIVE: deletes metrics AND dashboards
# docker compose down -v

# Recharger prometheus.yml sans redémarrer / Reload prometheus.yml without restarting
docker compose kill -s SIGHUP prometheus

# Valider prometheus.yml / Validate prometheus.yml
docker run --rm -v ~/monitoring/prometheus/prometheus.yml:/prometheus.yml:ro \
  --entrypoint promtool prom/prometheus:v3.0.0 check config /prometheus.yml

# Regénérer un hash basic-auth ($ doublés pour le compose) / Regenerate a basic-auth hash ($ doubled for compose)
docker run --rm httpd:2.4.62 htpasswd -nbB admin 'MotDePasseFort' | sed -e 's/\$/\$\$/g'

# Mettre à jour / Update (après lecture des release notes / after reading release notes)
# 1. éditer les tags image: dans compose.yaml / edit the image: tags in compose.yaml
# 2. appliquer / apply:
docker compose pull && docker compose up -d
```

## resources

:::lang fr
- [Documentation Prometheus](https://prometheus.io/docs/) — la référence : config, PromQL, bonnes pratiques.
- [Documentation Grafana](https://grafana.com/docs/) — data sources, dashboards, alerting unifié.
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/) — les requêtes usuelles, prêtes à copier.
- [Dashboards Grafana communautaires](https://grafana.com/grafana/dashboards/) — dont les 1860, 893 et 3662 du guide.
- [Awesome Prometheus Alerts](https://samber.github.io/awesome-prometheus-alerts/) — règles d'alerte prêtes à l'emploi.
:::

:::lang en
- [Prometheus documentation](https://prometheus.io/docs/) — the reference: config, PromQL, best practices.
- [Grafana documentation](https://grafana.com/docs/) — data sources, dashboards, unified alerting.
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/) — the everyday queries, ready to copy.
- [Community Grafana dashboards](https://grafana.com/grafana/dashboards/) — including 1860, 893 and 3662 from this guide.
- [Awesome Prometheus Alerts](https://samber.github.io/awesome-prometheus-alerts/) — ready-made alerting rules.
:::

## troubleshooting

:::lang fr
**Target « DOWN » dans Status → Targets.** Regarde la colonne `Last Error`. `connection refused` → mauvais port ; `no route to host` / erreur DNS → la cible n'est pas sur le même réseau Docker que Prometheus ; timeout → service injoignable ou surchargé. Compare le port de la cible avec celui du `prometheus.yml`.

**« No data » dans Grafana.** Trois vérifications dans l'ordre : la data source pointe bien sur `http://prometheus:9090` (Save & test OK) ; les targets sont `UP` ; l'intervalle de temps en haut à droite n'est pas plus large que tes données (juste après l'installation, tu n'as que quelques minutes d'historique — mets « Last 15 minutes »).

**Prometheus consomme énormément de RAM.** Trop de séries scrapées, souvent à cause d'un label à cardinalité explosive (ex. un identifiant unique par requête). Vérifie : Prometheus → Status → TSDB Status → « Top 10 label value counts ». Corrige à la source (l'app qui émet ce label) ou exclus la cible.

**« Failed to load dashboard » à l'import.** Le dashboard utilise un plugin ou une data source que tu n'as pas. Vérifie dans Grafana → Administration → Plugins, installe le manquant, redémarre Grafana (`docker compose restart grafana`).
:::

:::lang en
**Target "DOWN" in Status → Targets.** Check the `Last Error` column. `connection refused` → wrong port; `no route to host` / DNS error → the target isn't on the same Docker network as Prometheus; timeout → service unreachable or overloaded. Compare the target's port with the one in `prometheus.yml`.

**"No data" in Grafana.** Three checks, in order: the data source points at `http://prometheus:9090` (Save & test OK); the targets are `UP`; the time range at the top right isn't wider than your data (right after installation you only have a few minutes of history — set "Last 15 minutes").

**Prometheus using a huge amount of RAM.** Too many scraped series, usually due to an exploding-cardinality label (e.g. a unique ID per request). Check: Prometheus → Status → TSDB Status → "Top 10 label value counts". Fix it at the source (the app emitting that label) or exclude the target.

**"Failed to load dashboard" on import.** The dashboard uses a plugin or data source you don't have. Check Grafana → Administration → Plugins, install the missing one, restart Grafana (`docker compose restart grafana`).
:::
