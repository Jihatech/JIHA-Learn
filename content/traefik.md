---
# — Identité (ne change JAMAIS une fois publié) —
id: traefik
slug: traefik
order: 5
status: published

# — Titres & accroches (bilingue) —
title_fr: "Traefik v3 — Reverse proxy avec HTTPS automatique"
title_en: "Traefik v3 — Reverse proxy with automatic HTTPS"
tagline_fr: "Un reverse proxy moderne qui détecte tes services Docker et leur sert un certificat HTTPS valide, sans rien configurer à la main."
tagline_en: "A modern reverse proxy that auto-detects your Docker services and hands them a valid HTTPS certificate — no manual config."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 60
repo: "traefik/traefik"
validated_version: "v3.3"
last_review: "2026-06-16"

# — Relations de parcours (par id) —
prerequisites: [docker-fondamentaux, docker-compose]
next: [vaultwarden, immich]

# — Concepts travaillés —
concepts_fr: [reverse-proxy, acme-lets-encrypt, tls-challenge, decouverte-docker, basic-auth, reseau-docker-partage]
concepts_en: [reverse-proxy, acme-lets-encrypt, tls-challenge, docker-discovery, basic-auth, shared-docker-network]

# — Accès —
access: free

# — Partage social —
og_description_fr: "Guide Traefik v3 : reverse proxy avec HTTPS Let's Encrypt automatique, découverte Docker, dashboard sécurisé."
og_description_en: "Traefik v3 guide: reverse proxy with automatic Let's Encrypt HTTPS, Docker discovery, secured dashboard."
---

## intro

:::lang fr
Sans reverse proxy, ton homelab ressemble à ça : `http://192.168.1.10:8080` (Vaultwarden), `http://192.168.1.10:32400` (Plex), `http://192.168.1.10:9090` (Prometheus). Imbuvable, dangereux (HTTP), impossible à partager.

**Traefik** résout tout ça d'un coup :

- URLs propres : `https://vault.exemple.com`, `https://photos.exemple.com`.
- HTTPS automatique via Let's Encrypt, renouvellement compris.
- Découverte automatique de tes services via labels Docker.
- Pas un port à mapper manuellement.

C'est **le prérequis** de toute la suite de ta plateforme self-hostée.

**Pour qui c'est :** tu veux exposer plusieurs services derrière un domaine que tu contrôles, en HTTPS, sans configurer Nginx à la main pour chaque ajout.

**Quand ce n'est PAS le bon choix :**

- Tu n'as pas de nom de domaine que tu contrôles → soit en acheter un (5-10€/an chez OVH, Namecheap), soit utiliser un DDNS gratuit (DuckDNS) avec un DNS challenge.
- Tu veux un GUI clic-clic pour gérer le proxy → Nginx Proxy Manager est plus simple (mais moins puissant).
- Tu n'as qu'un seul service à exposer → Caddy est plus simple.
:::

:::lang en
Without a reverse proxy, your homelab looks like this: `http://192.168.1.10:8080` (Vaultwarden), `http://192.168.1.10:32400` (Plex), `http://192.168.1.10:9090` (Prometheus). Ugly, unsafe (HTTP), impossible to share.

**Traefik** solves all of that in one move:

- Clean URLs: `https://vault.example.com`, `https://photos.example.com`.
- Automatic HTTPS via Let's Encrypt, renewals included.
- Auto-discovery of your services via Docker labels.
- Not a single port to map by hand.

It's **the prerequisite** for the rest of your self-hosted platform.

**Who it's for:** you want to expose several services behind a domain you control, in HTTPS, without configuring Nginx by hand for every new addition.

**When it's NOT the right choice:**

- You don't have a domain you control → either buy one (5-10€/yr at OVH, Namecheap), or use a free DDNS (DuckDNS) with a DNS challenge.
- You want a click-and-go GUI for the proxy → Nginx Proxy Manager is simpler (but less powerful).
- You only have one service to expose → Caddy is simpler.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Le rôle d'un **reverse proxy** et pourquoi il est indispensable en self-hosting.
- Le concept d'**ACME** et de **Let's Encrypt** (HTTPS gratuit).
- La différence **TLS challenge** vs **HTTP challenge** vs **DNS challenge** pour les certificats.
- Comment Traefik **découvre tes services** via labels Docker.
- Sécuriser le **dashboard Traefik** avec basic auth.
- Le pattern d'un **réseau Docker partagé** entre Traefik et tes apps.
:::

:::lang en
By the end of this guide, you'll know:

- The role of a **reverse proxy** and why it's essential for self-hosting.
- The concept of **ACME** and **Let's Encrypt** (free HTTPS).
- The difference between **TLS challenge**, **HTTP challenge**, and **DNS challenge** for certificates.
- How Traefik **discovers your services** via Docker labels.
- How to secure the **Traefik dashboard** with basic auth.
- The pattern of a **shared Docker network** between Traefik and your apps.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- **Docker + Docker Compose** maîtrisés (cycle `up -d`, healthchecks, volumes, networks).
- Un **nom de domaine** que tu contrôles (ex. `exemple.com`).
- La capacité de pointer un (sous-)domaine vers l'IP publique de ton serveur (enregistrement DNS de type A).
- Les **ports 80 et 443 ouverts** depuis Internet vers ton serveur (port-forward sur ta box, ou serveur VPS).

⚠️ **Spécificité importante** : pour le HTTPS via Let's Encrypt en mode "TLS challenge", **le port 443 doit être joignable depuis Internet**. Si tu es derrière un CGNAT (4G, certaines fibres), c'est impossible — utilise un **DNS challenge** (Cloudflare gratuit) ou un tunnel (Cloudflare Tunnel).
:::

:::lang en
You need:

- Solid **Docker + Docker Compose** skills (the `up -d` cycle, healthchecks, volumes, networks).
- A **domain name** you control (e.g. `example.com`).
- The ability to point a (sub)domain at your server's public IP (DNS A record).
- **Ports 80 and 443 open** from the Internet to your server (port-forward on your router, or a VPS).

⚠️ **Important caveat:** for HTTPS via Let's Encrypt in "TLS challenge" mode, **port 443 must be reachable from the Internet**. If you're behind CGNAT (4G, some fiber providers), that won't work — use a **DNS challenge** (Cloudflare free tier) or a tunnel (Cloudflare Tunnel) instead.
:::

## concepts

:::lang fr
Architecture cible — Traefik termine HTTPS sur le port 443, lit les labels des conteneurs Docker pour savoir où router chaque hôte, et tout passe par un seul réseau Docker partagé `proxy`. Pas de port à mapper, pas de Nginx à configurer.
:::

:::lang en
Target architecture — Traefik terminates HTTPS on port 443, reads the Docker container labels to know where to route each host, and everything flows through a single shared Docker network `proxy`. No ports to map, no Nginx to configure.
:::

:::figure traefik-architecture
caption_fr: "Schéma 1. Traefik écoute :80 et :443, expose un dashboard sécurisé sur `traefik.exemple.com`, et route les apps via le réseau Docker partagé `proxy`."
caption_en: "Figure 1. Traefik listens on :80 and :443, exposes a secured dashboard on `traefik.example.com`, and routes apps through the shared `proxy` Docker network."
:::

:::lang fr
**Points clés à retenir :**

- **Un seul service expose des ports** — Traefik lui-même (80 et 443). Tes apps n'exposent rien sur l'hôte.
- **Découverte automatique** — Traefik lit le socket Docker (`/var/run/docker.sock:ro`) et trouve les services à exposer en lisant leurs labels `traefik.*`.
- **`proxy` est `external: true`** — il est créé une fois (`docker network create proxy`) puis réutilisé par toutes tes stacks. C'est le point de rendez-vous.
- **TLS challenge ≠ DNS challenge** — TLS = Let's Encrypt te contacte sur :443 pour prouver que c'est bien ton serveur. DNS = tu prouves via un enregistrement TXT. Le DNS challenge permet les certificats wildcard `*.exemple.com` ; le TLS challenge non.
:::

:::lang en
**Key takeaways:**

- **Only one service exposes ports** — Traefik itself (80 and 443). Your apps expose nothing on the host.
- **Auto-discovery** — Traefik reads the Docker socket (`/var/run/docker.sock:ro`) and finds services to expose by reading their `traefik.*` labels.
- **`proxy` is `external: true`** — it's created once (`docker network create proxy`) and reused by every stack. It's the meeting point.
- **TLS challenge ≠ DNS challenge** — TLS = Let's Encrypt contacts you on :443 to prove you own the server. DNS = you prove it by setting a TXT record. The DNS challenge allows wildcard certificates `*.example.com`; the TLS challenge does not.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Configurer le DNS pour pointer `traefik.exemple.com` (dashboard) et un wildcard `*.exemple.com` (apps) vers l'IP publique de ton serveur.

**🤔 Pourquoi un wildcard DNS ?** Permet de créer des sous-domaines comme `vault.exemple.com`, `photos.exemple.com` sans toucher au DNS à chaque ajout.

**Attention au piège — wildcard DNS ≠ certificat wildcard :** ce wildcard est seulement au niveau *DNS* (routage). Avec le TLS challenge configuré dans ce guide, Traefik génère un **certificat séparé par sous-domaine** (un pour `vault.`, un pour `photos.`…), pas un seul certificat `*.exemple.com`. Pour un vrai certificat wildcard unique, il faut le **DNS challenge** (voir section "Et après ?"). Pour un homelab, un certif par sous-domaine fonctionne parfaitement.
:::

:::lang en
**Goal.** Configure DNS so that `traefik.example.com` (dashboard) and a wildcard `*.example.com` (apps) point to your server's public IP.

**🤔 Why a wildcard DNS record?** It lets you create subdomains like `vault.example.com`, `photos.example.com` without touching DNS each time.

**Watch the trap — wildcard DNS ≠ wildcard certificate:** this wildcard is only at the *DNS* level (routing). With the TLS challenge configured in this guide, Traefik generates **one certificate per subdomain** (one for `vault.`, one for `photos.`…), not a single `*.example.com` certificate. For a real single wildcard certificate, you need the **DNS challenge** (see "What's next?"). For a homelab, one cert per subdomain works perfectly.
:::

```text
A    traefik.exemple.com    →    <public IP of your server>
A    *.exemple.com          →    <public IP of your server>
```

:::lang fr
**✅ Vérification :**
:::

:::lang en
**✅ Check:**
:::

```bash
dig traefik.exemple.com +short
# Doit afficher / Should print your public IP
```

### step-02

:::lang fr
**Objectif.** Créer le réseau Docker partagé qui servira de point de rendez-vous entre Traefik et toutes tes apps.

**🤔 Pourquoi un network externe ?** Toutes tes futures stacks (Vaultwarden, Immich, etc.) s'y rattacheront via `external: true`. Sans ce réseau commun, Traefik ne peut pas joindre les conteneurs des autres stacks.
:::

:::lang en
**Goal.** Create the shared Docker network that will be the meeting point between Traefik and all your apps.

**🤔 Why an external network?** Every future stack (Vaultwarden, Immich, etc.) will attach to it via `external: true`. Without that shared network, Traefik can't reach containers from other stacks.
:::

```bash
docker network create proxy
```

### step-03

:::lang fr
**Objectif.** Préparer la structure de fichiers et le fichier `acme.json` qui stockera tes certificats.

**🤔 Pourquoi `chmod 600` sur `acme.json` ?** Ce fichier contiendra tes certificats et **clés privées**. Let's Encrypt (via Traefik) refuse de l'utiliser s'il n'est pas en `600` (lisible seulement par toi). C'est une protection de base contre une lecture accidentelle par un autre utilisateur du serveur.
:::

:::lang en
**Goal.** Set up the file structure and the `acme.json` file that will store your certificates.

**🤔 Why `chmod 600` on `acme.json`?** This file will hold your certificates and **private keys**. Let's Encrypt (via Traefik) refuses to use it if it's not `600` (readable only by you). It's a basic safeguard against accidental reads by another user on the server.
:::

```bash
mkdir -p ~/traefik/{data,logs}
cd ~/traefik
touch data/acme.json
chmod 600 data/acme.json
```

### step-04

:::lang fr
**Objectif.** Écrire le `compose.yaml` qui décrit Traefik, son routage interne, son dashboard sécurisé et son intégration Let's Encrypt.

**🤔 Pourquoi chaque option du `command:` ?**

- `providers.docker.exposedbydefault=false` — **important.** Sans ça, Traefik exposerait *tous* tes conteneurs Docker automatiquement. Avec `false`, il n'expose que ceux qui ont `traefik.enable=true`. Pattern *explicit > implicit*.
- `tlschallenge=true` — Let's Encrypt valide la propriété du domaine via le port 443. Simple, mais nécessite que :443 soit ouvert depuis Internet.
- `api@internal` — service spécial interne pour le dashboard. À ne **jamais** exposer sans auth.
- `socket:ro` — Traefik lit (read-only) le socket Docker pour découvrir les conteneurs. Le `:ro` est important : il limite la casse en cas de compromission.
- `redirections.entrypoint.to=websecure` — tout trafic HTTP est redirigé en HTTPS. Standard moderne, pas négociable.
:::

:::lang en
**Goal.** Write the `compose.yaml` that describes Traefik, its internal routing, its secured dashboard, and Let's Encrypt integration.

**🤔 Why each option in `command:`?**

- `providers.docker.exposedbydefault=false` — **important.** Without it, Traefik would expose *all* your Docker containers automatically. With `false`, it only exposes those with `traefik.enable=true`. The *explicit > implicit* pattern.
- `tlschallenge=true` — Let's Encrypt verifies domain ownership via port 443. Simple, but requires :443 reachable from the Internet.
- `api@internal` — internal special service for the dashboard. **Never** expose it without auth.
- `socket:ro` — Traefik reads the Docker socket (read-only) to discover containers. The `:ro` matters: it limits the damage if the container is compromised.
- `redirections.entrypoint.to=websecure` — all HTTP traffic is redirected to HTTPS. Modern standard, non-negotiable.
:::

```bash
nano ~/traefik/compose.yaml
```

```yaml
services:
  traefik:
    image: traefik:v3.3
    container_name: traefik
    restart: unless-stopped
    command:
      # Logs
      - "--log.level=INFO"
      - "--accesslog=true"
      # API + dashboard
      - "--api.dashboard=true"
      # Docker discovery
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      # Entrypoints
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      # Global HTTP → HTTPS redirection
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      # Let's Encrypt (TLS challenge)
      - "--certificatesresolvers.le.acme.email=${ACME_EMAIL}"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.le.acme.tlschallenge=true"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./data/acme.json:/letsencrypt/acme.json
      - ./logs:/logs
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      # Dashboard routing
      - "traefik.http.routers.dashboard.rule=Host(`traefik.exemple.com`)"
      - "traefik.http.routers.dashboard.entrypoints=websecure"
      - "traefik.http.routers.dashboard.tls.certresolver=le"
      - "traefik.http.routers.dashboard.service=api@internal"
      # Basic auth on the dashboard
      - "traefik.http.routers.dashboard.middlewares=auth"
      - "traefik.http.middlewares.auth.basicauth.users=${TRAEFIK_AUTH}"

networks:
  proxy:
    external: true
```

:::lang fr
Puis `~/traefik/.env` (on remplit `TRAEFIK_AUTH` à l'étape 5) :
:::

:::lang en
Then `~/traefik/.env` (we fill in `TRAEFIK_AUTH` at step 5):
:::

```env
ACME_EMAIL=ton@email.com
# Generated with / Généré avec : htpasswd -nB admin
# In a .env file: paste the hash AS-IS, do NOT double the $ (see step 5)
TRAEFIK_AUTH=admin:$2y$05$xxxxxxxxxxxxxxx...
```

### step-05

:::lang fr
**Objectif.** Générer le hash basic auth qui protège le dashboard, et bien comprendre où le coller.

**🤔 Pourquoi un hash et pas le mot de passe en clair ?** Même principe qu'`ADMIN_TOKEN` côté Vaultwarden : si ton `.env` fuit (ou se retrouve dans Git par erreur), le mot de passe reste protégé. C'est le standard `htpasswd` / Apache.
:::

:::lang en
**Goal.** Generate the basic auth hash that protects the dashboard — and understand precisely where to paste it.

**🤔 Why a hash, not a clear password?** Same principle as Vaultwarden's `ADMIN_TOKEN`: if your `.env` leaks (or ends up in Git by mistake), the password stays protected. It's the standard `htpasswd` / Apache format.
:::

```bash
sudo apt install apache2-utils    # or / ou : brew install httpd
htpasswd -nB admin
# Type your password, copy the output / Tape ton mot de passe, copie la sortie
```

:::lang fr
Tu obtiens quelque chose comme `admin:$2y$05$abcdefgh...`.

⚠️ **Point qui piège tout le monde — où coller ce hash ?**

- **Dans un fichier `.env`** (notre cas, via `${TRAEFIK_AUTH}`) : colle le hash **tel quel**, sans rien doubler. Compose n'interprète pas les `$` à l'intérieur d'une *valeur* venant du `.env` :

```env
TRAEFIK_AUTH=admin:$2y$05$abcdefgh...
```

- **Directement dans le `compose.yaml`** (en dur dans un label) : là il faut **doubler** chaque `$` en `$$`, car Compose interprète les `$` du fichier compose lui-même :

```yaml
- "traefik.http.middlewares.auth.basicauth.users=admin:$$2y$$05$$abcdefgh..."
```

Comme on utilise un `.env` dans ce guide, **ne double pas**.
:::

:::lang en
You'll get something like `admin:$2y$05$abcdefgh...`.

⚠️ **The pitfall that catches everyone — where to paste this hash?**

- **In a `.env` file** (our case, via `${TRAEFIK_AUTH}`): paste the hash **as-is**, do not double anything. Compose doesn't interpret `$` inside a *value* coming from `.env`:

```env
TRAEFIK_AUTH=admin:$2y$05$abcdefgh...
```

- **Directly in `compose.yaml`** (hardcoded in a label): there you must **double** each `$` as `$$`, because Compose interprets `$` in the compose file itself:

```yaml
- "traefik.http.middlewares.auth.basicauth.users=admin:$$2y$$05$$abcdefgh..."
```

Since we use a `.env` here, **don't double**.
:::

### step-06

:::lang fr
**Objectif.** Lancer Traefik et observer les logs pour confirmer qu'il démarre proprement et négocie son certificat.
:::

:::lang en
**Goal.** Launch Traefik and watch the logs to confirm clean startup and certificate negotiation.
:::

```bash
cd ~/traefik
docker compose up -d
docker compose logs -f
```

:::lang fr
Cherche dans les logs :

- `Configuration loaded from flags.`
- pas de `panic`.
- éventuellement des messages ACME : la première fois, Traefik demande le certif au démarrage du premier service.

**✅ Vérification :**

1. `https://traefik.exemple.com` → page de login basic auth, puis dashboard Traefik.
2. Cadenas vert dans le navigateur (certificat Let's Encrypt valide).
:::

:::lang en
Look for in the logs:

- `Configuration loaded from flags.`
- no `panic`.
- possibly ACME messages: the first time, Traefik requests the cert when the first service starts.

**✅ Check:**

1. `https://traefik.example.com` → basic auth login, then the Traefik dashboard.
2. Green padlock in the browser (valid Let's Encrypt certificate).
:::

### step-07

:::lang fr
**Objectif.** Tester avec un service jetable `whoami` pour confirmer la mécanique de routage end-to-end avant de brancher de vrais services.
:::

:::lang en
**Goal.** Test with a disposable `whoami` service to confirm the end-to-end routing mechanic before plugging in real services.
:::

:::lang fr
Ajoute ce service dans un nouveau compose, ou directement dans le compose Traefik :
:::

:::lang en
Add this service in a new compose file, or directly in the Traefik compose:
:::

```yaml
  whoami:
    image: traefik/whoami
    container_name: whoami
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.whoami.rule=Host(`whoami.exemple.com`)"
      - "traefik.http.routers.whoami.entrypoints=websecure"
      - "traefik.http.routers.whoami.tls.certresolver=le"
```

```bash
docker compose up -d
```

:::lang fr
**✅ Vérification :** `https://whoami.exemple.com` répond avec les infos du conteneur, en HTTPS valide. Si oui : **bravo, tu as un reverse proxy fonctionnel.**
:::

:::lang en
**✅ Check:** `https://whoami.example.com` responds with container info, in valid HTTPS. If yes: **congratulations, you have a working reverse proxy.**
:::

### step-08

:::lang fr
**Objectif.** Mémoriser le pattern réutilisable que tu vas appliquer à tous tes futurs services.

Pour exposer n'importe quel service derrière Traefik, ajoute juste à son `compose.yaml` :
:::

:::lang en
**Goal.** Memorize the reusable pattern you'll apply to every future service.

To expose any service behind Traefik, just add the following to its `compose.yaml`:
:::

```yaml
services:
  monservice:
    image: ...
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.monservice.rule=Host(`mon.exemple.com`)"
      - "traefik.http.routers.monservice.entrypoints=websecure"
      - "traefik.http.routers.monservice.tls.certresolver=le"
      - "traefik.http.services.monservice.loadbalancer.server.port=80"

networks:
  proxy:
    external: true
```

:::lang fr
C'est tout. Pas de ports exposés, pas de config Nginx, pas de cron pour renouveler les certifs. C'est *exactement* ce pattern que tu retrouveras dans le guide Vaultwarden (étape 6).
:::

:::lang en
That's it. No exposed ports, no Nginx config, no cron job to renew the certs. This is *exactly* the pattern you'll see in the Vaultwarden guide (step 6).
:::

## pitfalls

:::lang fr
**1. « Unable to obtain ACME certificate ».** Causes fréquentes : DNS pas encore propagé (attendre 10-30 min) ; port 443 non ouvert depuis Internet (tester `curl https://<ton-ip>` depuis dehors) ; tu as utilisé `acme.caserver=staging` et obtenu un faux certif (à enlever après tests, et purger `acme.json`).

**2. « Too many requests » de Let's Encrypt.** Tu as fait trop d'essais ratés. Let's Encrypt limite à **5 certificats par domaine et par semaine**. Pendant tes tests, utilise l'environnement staging : `--certificatesresolvers.le.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory`. Les certifs staging ne sont pas valides dans les navigateurs (warning) mais sans limite.

**3. Tu modifies une config et `docker compose restart` ne suffit pas.** Mêmes pièges que pour Compose : `restart` ne relit pas `command:` ni les labels. Toujours `up -d` après modif.

**4. Le dashboard est accessible sans auth.** Tu as oublié la middleware `auth` sur le router, ou ton hash est mauvais. **Anti-pattern absolu : exposer le dashboard sans auth.**

**5. Tu mets `--api.insecure=true` "pour debug" et tu l'oublies.** Cela expose le dashboard sur le port 8080 sans aucune auth. **Très dangereux.** À retirer immédiatement après debug local.

**6. Erreur 404 sur un nouveau service.** Vérifie dans l'ordre : (a) `traefik.enable=true` est bien là ; (b) le service est sur le réseau `proxy` ; (c) le DNS est OK ; (d) le router est défini avec un `entrypoints=websecure`.

**7. Wildcard certificat impossible avec TLS challenge.** Si tu veux un `*.exemple.com` en certificat **unique**, il faut **obligatoirement** passer en DNS challenge (config plus complexe, dépend de ton registrar — Cloudflare le rend simple).
:::

:::lang en
**1. "Unable to obtain ACME certificate".** Common causes: DNS not yet propagated (wait 10–30 min); port 443 not open from the Internet (test `curl https://<your-ip>` from outside); you used `acme.caserver=staging` and got a fake cert (remove after testing and wipe `acme.json`).

**2. "Too many requests" from Let's Encrypt.** You did too many failed attempts. Let's Encrypt caps **5 certificates per domain per week**. During testing, use the staging environment: `--certificatesresolvers.le.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory`. Staging certs aren't valid in browsers (warning) but have no rate limit.

**3. You change a config and `docker compose restart` isn't enough.** Same trap as Compose: `restart` doesn't re-read `command:` or labels. Always `up -d` after a change.

**4. The dashboard is accessible without auth.** You forgot the `auth` middleware on the router, or your hash is wrong. **Absolute anti-pattern: exposing the dashboard without auth.**

**5. You add `--api.insecure=true` "for debugging" and forget it.** This exposes the dashboard on port 8080 with no auth at all. **Very dangerous.** Remove immediately after local debugging.

**6. 404 on a new service.** Check in order: (a) `traefik.enable=true` is present; (b) the service is on the `proxy` network; (c) DNS is OK; (d) the router has `entrypoints=websecure`.

**7. Wildcard certificate impossible with TLS challenge.** If you want a single `*.example.com` certificate, you **must** switch to a DNS challenge (more complex config, depends on your registrar — Cloudflare makes it simple).
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] `https://traefik.exemple.com` charge le dashboard après auth, cadenas vert.
- [ ] `https://whoami.exemple.com` répond, cadenas vert.
- [ ] `curl -I http://whoami.exemple.com` retourne `301` (redirect vers HTTPS).
- [ ] `docker compose logs traefik` ne contient pas de `error`.
- [ ] Tu peux ajouter un nouveau service en **5 minutes** juste en ajoutant des labels.
:::

:::lang en
You know it works when…

- [ ] `https://traefik.example.com` loads the dashboard after auth, green padlock.
- [ ] `https://whoami.example.com` responds, green padlock.
- [ ] `curl -I http://whoami.example.com` returns `301` (redirect to HTTPS).
- [ ] `docker compose logs traefik` contains no `error`.
- [ ] You can add a new service in **5 minutes** just by adding labels.
:::

## next

:::lang fr
Trois prolongements naturels, du plus utile au plus avancé :

1. **Vaultwarden** — premier vrai service derrière Traefik, et qui te montrera pourquoi tu as fait tout ça.
2. **Immich** — photos self-hosted, alternative crédible à Google Photos, réutilise exactement la même mécanique de labels.
3. **Middleware Traefik avancée** — headers de sécurité (HSTS, CSP), rate limiting, IP whitelist. Optionnel mais propre.
4. **DNS challenge Cloudflare** — pour les certificats wildcard unique. Indispensable pour un homelab sérieux qui veut beaucoup de sous-domaines.
:::

:::lang en
Three natural next steps, from most useful to most advanced:

1. **Vaultwarden** — first real service behind Traefik, and the one that will show you why you did all this.
2. **Immich** — self-hosted photos, a credible alternative to Google Photos, reusing the exact same labels mechanic.
3. **Advanced Traefik middlewares** — security headers (HSTS, CSP), rate limiting, IP whitelist. Optional but clean.
4. **Cloudflare DNS challenge** — for single wildcard certificates. A must for any serious homelab that wants many subdomains.
:::

## cheatsheet

:::lang fr
Aide-mémoire pour gérer Traefik au quotidien et ajouter un service.
:::

:::lang en
Cheat sheet to operate Traefik day-to-day and add a service.
:::

```bash
# Cycle de vie / Lifecycle
cd ~/traefik
docker compose up -d                  # démarrer / start
docker compose ps                     # statut / status
docker compose logs -f traefik        # suivre les logs / follow logs
docker compose down                   # arrêter / stop (acme.json préservé / preserved)

# Forcer un recharge propre / Force a clean reload
docker compose up -d                  # toujours après une modif de compose ou .env

# Inspecter le routage / Inspect routing
# → dashboard : https://traefik.exemple.com (HTTP > Routers / Services / Middlewares)

# Nouveau service derrière Traefik / Add a new service behind Traefik
# (dans son propre compose.yaml / in its own compose.yaml)
#
# networks:        →   proxy: (external: true)
# labels:          →   traefik.enable=true
#                      traefik.http.routers.X.rule=Host(`X.exemple.com`)
#                      traefik.http.routers.X.entrypoints=websecure
#                      traefik.http.routers.X.tls.certresolver=le
#                      traefik.http.services.X.loadbalancer.server.port=<port interne>

# Reset complet ACME (après une erreur durable)
docker compose down
> data/acme.json                       # vide le fichier sans le supprimer
chmod 600 data/acme.json
docker compose up -d
```

## resources

:::lang fr
- [Documentation officielle Traefik v3](https://doc.traefik.io/traefik/) — la référence absolue.
- [Awesome Traefik](https://github.com/awesome-traefik/awesome-traefik) — communauté, plugins, exemples.
- [Guide officiel migration v2 → v3](https://doc.traefik.io/traefik/migration/v2-to-v3/) — si tu pars d'une stack v2.
- [Techno Tim — Traefik 3 hands-on](https://technotim.live/posts/traefik-3-docker-certificates/) — tuto vidéo complémentaire.
:::

:::lang en
- [Official Traefik v3 docs](https://doc.traefik.io/traefik/) — the absolute reference.
- [Awesome Traefik](https://github.com/awesome-traefik/awesome-traefik) — community, plugins, examples.
- [Official v2 → v3 migration guide](https://doc.traefik.io/traefik/migration/v2-to-v3/) — if you're coming from a v2 stack.
- [Techno Tim — Traefik 3 hands-on](https://technotim.live/posts/traefik-3-docker-certificates/) — companion video tutorial.
:::

## troubleshooting

:::lang fr
**« 404 page not found » sur tous les domaines.** Probablement aucun router ne match l'hôte. Va sur le dashboard Traefik → onglet HTTP → Routers. Vérifie qu'il y a un router avec la bonne `rule=Host(...)`. Si non, ton label est mal écrit ou ton conteneur n'est pas sur le réseau `proxy`.

**« Bad Gateway » 502.** Traefik trouve le router mais ne peut pas joindre le service. Vérifie : (a) le label `traefik.http.services.X.loadbalancer.server.port` pointe bien sur le **port interne** du conteneur (pas le port hôte) ; (b) le service est bien sur le réseau `proxy`.

**Certificat expiré ou pas renouvelé.** Traefik renouvelle ~30 jours avant expiration. Si problème : vérifier les logs Traefik au moment du renouvellement. Avec le **TLS challenge** (notre config), c'est le **port 443** qui doit rester joignable depuis Internet — le port 80 ne sert qu'à la redirection HTTP→HTTPS. Avec un **HTTP challenge** (variante), ce serait l'inverse (port 80 requis pour le challenge).

**Le dashboard demande l'auth puis boucle / refuse le mot de passe.** Hash basic auth mal géré. Refais `htpasswd -nB admin`. Rappel de l'étape 5 : dans un `.env`, colle le hash **tel quel** ; ce n'est que si tu le mets **directement dans le `compose.yaml`** qu'il faut doubler les `$` en `$$`.
:::

:::lang en
**"404 page not found" on every domain.** Likely no router matches the host. Open the Traefik dashboard → HTTP tab → Routers. Confirm a router exists with the right `rule=Host(...)`. If not, your label is wrong or your container isn't on the `proxy` network.

**"Bad Gateway" 502.** Traefik finds the router but can't reach the service. Check: (a) the `traefik.http.services.X.loadbalancer.server.port` label points at the **container's internal port** (not the host port); (b) the service is on the `proxy` network.

**Certificate expired or not renewed.** Traefik renews ~30 days before expiry. If broken: check the Traefik logs at renewal time. With the **TLS challenge** (our config), it's **port 443** that must stay reachable from the Internet — port 80 only serves the HTTP→HTTPS redirect. With an **HTTP challenge** (variant), it would be the other way around (port 80 required for the challenge).

**Dashboard prompts auth then loops / rejects the password.** Mishandled basic auth hash. Re-run `htpasswd -nB admin`. Reminder from step 5: in a `.env`, paste the hash **as-is**; it's only when you put it **directly in the `compose.yaml`** that you must double the `$` to `$$`.
:::
