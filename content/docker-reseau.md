---
# — Identité (ne change JAMAIS une fois publié) —
id: docker-reseau
slug: docker-reseau
order: 14
status: published

# — Titres & accroches (bilingue) —
title_fr: "Docker — réseau"
title_en: "Docker — networking"
tagline_fr: "bridge, DNS, publication de ports, host, none, overlay."
tagline_en: "bridge, DNS, port publishing, host, none, overlay."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 170
repo: "moby/moby"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [docker-images-dockerfile]
next: [cicd-github-actions]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [pilotes-reseau, bridge-defaut, bridge-utilisateur-dns, publication-ports, host-none, connect-inspect]
concepts_en: [network-drivers, default-bridge, user-bridge-dns, port-publishing, host-none, connect-inspect]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le réseau Docker au niveau DCA : les pilotes (bridge, host, none, overlay), la différence décisive entre le bridge par défaut et un bridge défini par l'utilisateur (DNS par nom de conteneur), la publication de ports, les réseaux host/none, et la connexion multi-réseaux d'un conteneur."
og_description_en: "Docker networking at DCA level: the drivers (bridge, host, none, overlay), the decisive difference between the default bridge and a user-defined bridge (DNS by container name), port publishing, host/none networks, and connecting a container to multiple networks."
---

## intro

:::lang fr
Deux conteneurs qui ne se parlent pas ne servent à rien. Le réseau Docker décide **qui joint qui**, **comment**, et **par quel nom**. Le guide Compose te faisait bénéficier de son réseau automatique ; l'examen **DCA** attend que tu comprennes **ce qui se passe dessous** : *quels sont les pilotes réseau ? pourquoi mes conteneurs se résolvent-ils par leur nom sur un réseau mais pas sur un autre ? comment publier un port ? quand utiliser `host` ou `none` ? comment brancher un conteneur sur plusieurs réseaux ?*

Ce guide couvre le domaine **réseau** en profondeur : les **pilotes** (`bridge`, `host`, `none`, `overlay`), la différence **décisive** entre le **bridge par défaut** et un **bridge défini par l'utilisateur** (le **DNS par nom de conteneur**), la **publication de ports**, les réseaux **host/none**, et la **connexion multi-réseaux**.

On travaille en **local avec Docker**. La plupart des manœuvres se font sur un seul hôte (les réseaux bridge) ; le réseau **overlay** (multi-hôtes) est présenté ici et pratiqué dans le guide Swarm.

**Pour qui c'est :** tu as les guides Docker précédents et tu vises le **DCA**.

**Quand ce n'est PAS le bon choix :**

- Tu ne sais pas lancer un conteneur → reviens aux fondamentaux.
- Tu veux le stockage, la sécurité ou Swarm → ce sont les guides suivants.
:::

:::lang en
Two containers that don't talk to each other are useless. Docker networking decides **who reaches whom**, **how**, and **by what name**. The Compose guide gave you its automatic network for free; the **DCA** exam expects you to understand **what happens underneath**: *what are the network drivers? why do my containers resolve each other by name on one network but not another? how do you publish a port? when do you use `host` or `none`? how do you attach a container to several networks?*

This guide covers the **networking** domain in depth: the **drivers** (`bridge`, `host`, `none`, `overlay`), the **decisive** difference between the **default bridge** and a **user-defined bridge** (**DNS by container name**), **port publishing**, the **host/none** networks, and **multi-network** attachment.

We work **locally with Docker**. Most maneuvers are on a single host (bridge networks); the **overlay** network (multi-host) is presented here and practiced in the Swarm guide.

**Who it's for:** you have the earlier Docker guides and you're aiming for the **DCA**.

**When it's NOT the right choice:**

- You can't launch a container → go back to the fundamentals.
- You want storage, security or Swarm → those are the next guides.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Nommer les **pilotes réseau** (`bridge`, `host`, `none`, `overlay`) et leur rôle.
- Inspecter le **bridge par défaut** et voir sa **limite** (pas de DNS par nom).
- Créer un **bridge défini par l'utilisateur** et résoudre les conteneurs **par nom**.
- **Publier** un port (`-p`) et distinguer `EXPOSE` de la publication.
- Utiliser les réseaux **`host`** et **`none`**.
- **Connecter/déconnecter** un conteneur à plusieurs réseaux et **inspecter**.
:::

:::lang en
By the end of this guide, you'll know how to:

- Name the **network drivers** (`bridge`, `host`, `none`, `overlay`) and their role.
- Inspect the **default bridge** and see its **limit** (no DNS by name).
- Create a **user-defined bridge** and resolve containers **by name**.
- **Publish** a port (`-p`) and distinguish `EXPOSE` from publishing.
- Use the **`host`** and **`none`** networks.
- **Connect/disconnect** a container to several networks and **inspect**.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides Docker précédents acquis.
- **Docker** installé et lancé.
- Un terminal — pas de fichiers à créer pour ce guide.
:::

:::lang en
You should have:

- The earlier Docker guides under your belt.
- **Docker** installed and running.
- A terminal — no files to create for this guide.
:::

```bash
docker network ls          # les réseaux existants : bridge, host, none / existing networks
```

## concepts

:::lang fr
**Docker fournit des réseaux virtuels** avec différents **pilotes** :

- **`bridge`** (défaut) : un réseau privé sur l'hôte. Les conteneurs y ont une IP interne et sortent vers Internet via NAT. C'est **99 %** des cas sur une seule machine.
- **`host`** : le conteneur **partage la pile réseau de l'hôte** (pas d'isolation, pas de NAT — son `:80` est le `:80` de l'hôte). Rapide, mais sans isolation.
- **`none`** : **aucun** réseau (seulement `lo`). Isolation totale, pour un traitement hors-ligne.
- **`overlay`** : un réseau **multi-hôtes** qui relie des conteneurs de **machines différentes** (Swarm/Kubernetes). C'est ce qui rend un cluster possible.

**LE point d'examen : bridge par défaut vs bridge utilisateur.** Tous les conteneurs lancés sans `--network` atterrissent sur le **bridge par défaut** (`bridge`). Or ce réseau **n'a PAS de résolution DNS par nom** : un conteneur ne peut joindre un autre **que par son IP** (fragile, l'IP change). Dès que tu **crées ton propre réseau** (`docker network create`), Docker y active un **DNS interne** (`127.0.0.11`) : les conteneurs se résolvent **par leur nom**. C'est **la** raison pour laquelle on crée toujours un réseau dédié (et pourquoi Compose en crée un automatiquement).

**La publication de ports.** Un conteneur écoute sur un port **interne** ; pour le joindre **depuis l'hôte/l'extérieur**, il faut le **publier** avec **`-p hôte:conteneur`** (`-p 8080:80`). Attention à ne pas confondre avec **`EXPOSE`** dans le Dockerfile : `EXPOSE` n'est que de la **documentation** (il n'ouvre **rien**), c'est **`-p`** (ou `--publish-all`) qui ouvre réellement le port.

**La connexion multi-réseaux.** Un conteneur peut être branché sur **plusieurs** réseaux (`docker network connect`) — un motif classique : un reverse proxy sur un réseau « frontend » **et** un réseau « backend ». `docker network inspect` montre qui est connecté à quoi.
:::

:::lang en
**Docker provides virtual networks** with different **drivers**:

- **`bridge`** (default): a private network on the host. Containers get an internal IP and reach the Internet via NAT. It's **99%** of single-machine cases.
- **`host`**: the container **shares the host's network stack** (no isolation, no NAT — its `:80` is the host's `:80`). Fast, but no isolation.
- **`none`**: **no** network (only `lo`). Total isolation, for offline processing.
- **`overlay`**: a **multi-host** network linking containers on **different machines** (Swarm/Kubernetes). It's what makes a cluster possible.

**THE exam point: default bridge vs user bridge.** All containers launched without `--network` land on the **default bridge** (`bridge`). But that network has **NO DNS resolution by name**: a container can reach another **only by its IP** (fragile, the IP changes). As soon as you **create your own network** (`docker network create`), Docker enables an **internal DNS** (`127.0.0.11`): containers resolve each other **by name**. That's **the** reason you always create a dedicated network (and why Compose creates one automatically).

**Port publishing.** A container listens on an **internal** port; to reach it **from the host/outside**, you must **publish** it with **`-p host:container`** (`-p 8080:80`). Don't confuse this with **`EXPOSE`** in the Dockerfile: `EXPOSE` is only **documentation** (it opens **nothing**); it's **`-p`** (or `--publish-all`) that actually opens the port.

**Multi-network attachment.** A container can be attached to **several** networks (`docker network connect`) — a classic pattern: a reverse proxy on a "frontend" network **and** a "backend" network. `docker network inspect` shows who's connected to what.
:::

:::figure docker-networks
caption_fr: "Schéma 1. Bridge par défaut : joignable par IP seulement. Bridge utilisateur : DNS interne, résolution par nom. host = pile de l'hôte ; none = isolé ; overlay = multi-hôtes."
caption_en: "Figure 1. Default bridge: reachable by IP only. User bridge: internal DNS, resolution by name. host = host's stack; none = isolated; overlay = multi-host."
:::

:::lang fr
On avance : bridge par défaut → sa limite DNS → bridge utilisateur (DNS par nom) → publication de ports → host & none → connexion multi-réseaux.
:::

:::lang en
We'll go: default bridge → its DNS limit → user bridge (DNS by name) → port publishing → host & none → multi-network attachment.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Inspecter le **bridge par défaut** et voir les IP des conteneurs.

Lance deux conteneurs (sans `--network` → bridge par défaut) et regarde :
:::

:::lang en
**Goal.** Inspect the **default bridge** and see the containers' IPs.

Launch two containers (no `--network` → default bridge) and look:
:::

```bash
docker run -d --name c1 alpine sleep 1000
docker run -d --name c2 alpine sleep 1000
docker network inspect bridge --format '{{range .Containers}}{{.Name}}={{.IPv4Address}} {{end}}'
```

:::lang fr
**✅ Vérification :** `docker network inspect bridge` liste `c1` et `c2` avec leurs **IP** (`172.17.x.x/16`). Les deux conteneurs sont sur le **même** réseau (le bridge par défaut) et peuvent se joindre **par IP**. Note ces IP — l'étape suivante montre qu'ils **ne** peuvent **pas** se joindre par **nom** sur ce réseau, contrairement à ce qu'on attendrait.
:::

:::lang en
**✅ Check:** `docker network inspect bridge` lists `c1` and `c2` with their **IPs** (`172.17.x.x/16`). Both containers are on the **same** network (the default bridge) and can reach each other **by IP**. Note these IPs — the next step shows they **can't** reach each other by **name** on this network, contrary to what you'd expect.
:::

### step-02

:::lang fr
**Objectif.** Constater **la limite du bridge par défaut** : pas de DNS par nom.

**🤔 Par IP oui, par nom non.** Tente de joindre `c2` par son **nom** puis par son **IP** :
:::

:::lang en
**Goal.** Observe **the default bridge's limit**: no DNS by name.

**🤔 By IP yes, by name no.** Try to reach `c2` by its **name** then by its **IP**:
:::

```bash
docker exec c1 ping -c 2 c2                         # ÉCHOUE : pas de DNS par nom / FAILS: no DNS by name
IP2=$(docker inspect -f '{{.NetworkSettings.IPAddress}}' c2)
docker exec c1 ping -c 2 "$IP2"                     # MARCHE : par IP / WORKS: by IP
```

:::lang fr
**✅ Vérification :** `docker exec c1 ping c2` **échoue** (`bad address 'c2'` — le nom n'est pas résolu), tandis que `ping "$IP2"` **réussit** (par l'adresse). C'est **contre-intuitif mais capital** : le **bridge par défaut ne fournit aucun DNS** entre conteneurs. Se reposer sur les IP est fragile (elles changent à chaque redémarrage). La solution — un réseau utilisateur — est l'étape suivante. *(L'ancien mécanisme `--link` existait mais est **déprécié** ; ne l'utilise pas.)*
:::

:::lang en
**✅ Check:** `docker exec c1 ping c2` **fails** (`bad address 'c2'` — the name isn't resolved), while `ping "$IP2"` **succeeds** (by address). It's **counter-intuitive but crucial**: the **default bridge provides no DNS** between containers. Relying on IPs is fragile (they change on each restart). The solution — a user network — is the next step. *(The old `--link` mechanism existed but is **deprecated**; don't use it.)*
:::

### step-03

:::lang fr
**Objectif.** Créer un **bridge utilisateur** et résoudre les conteneurs **par nom**.

**🤔 Le DNS interne.** Sur un réseau **que tu crées**, Docker active un résolveur. Crée le réseau et relance-y les conteneurs :
:::

:::lang en
**Goal.** Create a **user bridge** and resolve containers **by name**.

**🤔 The internal DNS.** On a network **you create**, Docker enables a resolver. Create the network and relaunch the containers on it:
:::

```bash
docker network create appnet                       # bridge utilisateur (DNS interne activé) / user bridge (internal DNS)
docker run -d --name web --network appnet nginx:1.27-alpine
docker run --rm --network appnet alpine ping -c 2 web    # joint "web" PAR NOM / reaches "web" BY NAME
```

:::lang fr
**✅ Vérification :** `ping -c 2 web` **réussit** depuis un conteneur du même réseau `appnet` — **par le nom** `web`, pas par IP. La différence avec l'étape 2 est **entièrement** due au réseau : un **bridge utilisateur** embarque un **DNS interne** (`127.0.0.11`) qui résout les noms de conteneurs, là où le bridge par défaut, non. **C'est pourquoi on crée toujours un réseau dédié** — et pourquoi Docker Compose en génère un automatiquement pour chaque stack. Retiens la règle : **un réseau utilisateur par application**.
:::

:::lang en
**✅ Check:** `ping -c 2 web` **succeeds** from a container on the same `appnet` network — **by the name** `web`, not by IP. The difference from step 2 is **entirely** due to the network: a **user bridge** ships an **internal DNS** (`127.0.0.11`) that resolves container names, where the default bridge doesn't. **That's why you always create a dedicated network** — and why Docker Compose auto-generates one for each stack. Remember the rule: **one user network per application**.
:::

### step-04

:::lang fr
**Objectif.** **Publier** un port, et comprendre `EXPOSE` vs `-p`.

**🤔 Interne ≠ joignable de l'hôte.** `web` (nginx) écoute sur `:80` **dans** le réseau, mais tu ne peux pas le joindre depuis ton navigateur… tant que tu ne **publies** pas le port :
:::

:::lang en
**Goal.** **Publish** a port, and understand `EXPOSE` vs `-p`.

**🤔 Internal ≠ reachable from the host.** `web` (nginx) listens on `:80` **inside** the network, but you can't reach it from your browser… until you **publish** the port:
:::

```bash
docker run -d --name web-pub --network appnet -p 8080:80 nginx:1.27-alpine   # -p HÔTE:CONTENEUR / HOST:CONTAINER
curl -s localhost:8080 | grep -i nginx          # joignable depuis l'hôte / reachable from the host
docker port web-pub                              # récapitule les publications / lists the published ports
```

:::lang fr
**✅ Vérification :** `curl localhost:8080` renvoie la page nginx — le port **80 du conteneur** est **publié** sur le **8080 de l'hôte** grâce à `-p 8080:80`. `docker port web-pub` confirme le mapping. Distinction d'examen **essentielle** : **`EXPOSE`** (dans le Dockerfile) ne fait que **documenter** le port applicatif, il n'**ouvre rien** ; seul **`-p`** (ou `-P` pour publier tous les ports exposés sur des ports aléatoires) rend le conteneur **joignable depuis l'extérieur**. Sans publication, un service reste accessible **seulement** aux autres conteneurs du réseau.
:::

:::lang en
**✅ Check:** `curl localhost:8080` returns the nginx page — the container's **port 80** is **published** on the host's **8080** thanks to `-p 8080:80`. `docker port web-pub` confirms the mapping. **Essential** exam distinction: **`EXPOSE`** (in the Dockerfile) only **documents** the app port, it opens **nothing**; only **`-p`** (or `-P` to publish all exposed ports on random ports) makes the container **reachable from outside**. Without publishing, a service stays reachable **only** to other containers on the network.
:::

### step-05

:::lang fr
**Objectif.** Comparer les réseaux **`host`** et **`none`**.

**🤔 Deux extrêmes.** `host` = **aucune** isolation réseau ; `none` = **aucun** réseau. Observe :
:::

:::lang en
**Goal.** Compare the **`host`** and **`none`** networks.

**🤔 Two extremes.** `host` = **no** network isolation; `none` = **no** network. Observe:
:::

```bash
docker run --rm --network host alpine ip -br addr    # VOIT les interfaces de l'HÔTE / SEES the HOST's interfaces
docker run --rm --network none alpine ip -br addr    # ne voit QUE lo / sees ONLY lo
```

:::lang fr
**✅ Vérification :** avec **`--network host`**, `ip addr` dans le conteneur affiche **les interfaces de l'hôte** (`eth0`, etc.) — le conteneur **partage la pile réseau** de la machine (son port 80 EST le port 80 de l'hôte, sans `-p`). Avec **`--network none`**, il ne reste que **`lo`** (127.0.0.1) : **zéro** connectivité externe — l'isolation maximale. Usages : `host` pour la **performance** (pas de NAT) ou un outil réseau ; `none` pour un traitement **hors-ligne** qui ne doit rien joindre. *(Sur Docker Desktop macOS/Windows, `host` est limité — Docker tourne dans une VM ; c'est pleinement natif sur Linux.)*
:::

:::lang en
**✅ Check:** with **`--network host`**, `ip addr` in the container shows **the host's interfaces** (`eth0`, etc.) — the container **shares the machine's network stack** (its port 80 IS the host's port 80, no `-p` needed). With **`--network none`**, only **`lo`** (127.0.0.1) remains: **zero** external connectivity — maximum isolation. Uses: `host` for **performance** (no NAT) or a network tool; `none` for **offline** processing that must reach nothing. *(On Docker Desktop macOS/Windows, `host` is limited — Docker runs in a VM; it's fully native on Linux.)*
:::

### step-06

:::lang fr
**Objectif.** **Connecter** un conteneur à un **second réseau** (multi-homing) et **inspecter**.

**🤔 Le motif du reverse proxy.** Un conteneur peut vivre sur **deux** réseaux à la fois — par exemple un proxy exposé côté « frontend » **et** relié au « backend ». Crée un 2ᵉ réseau et connecte `web` dessus :
:::

:::lang en
**Goal.** **Connect** a container to a **second network** (multi-homing) and **inspect**.

**🤔 The reverse-proxy pattern.** A container can live on **two** networks at once — e.g. a proxy exposed on the "frontend" **and** wired to the "backend". Create a 2nd network and connect `web` to it:
:::

```bash
docker network create backend
docker network connect backend web                 # web est maintenant sur appnet ET backend / on BOTH now
docker inspect web --format '{{range $n,$_ := .NetworkSettings.Networks}}{{$n}} {{end}}'   # appnet backend

docker network disconnect backend web              # le retire du backend / detach from backend
docker network inspect appnet --format '{{range .Containers}}{{.Name}} {{end}}'   # qui reste sur appnet / who's on appnet
```

:::lang fr
**✅ Vérification :** après `docker network connect backend web`, l'`inspect` de `web` liste **deux** réseaux (`appnet` **et** `backend`) — le conteneur est **multi-homé**, joignable des deux côtés. C'est le motif d'un **reverse proxy** (frontend public + backend privé) ou d'une passerelle. `docker network inspect` répond à « **qui est sur ce réseau ?** ». Tu sais désormais **segmenter** : mettre les services qui doivent se parler sur un réseau commun, et **isoler** le reste — la base de la sécurité réseau des conteneurs.

**🤔 Et l'overlay ?** Tout ceci est **mono-hôte** (bridge). Pour relier des conteneurs sur **plusieurs machines**, il faut le pilote **`overlay`** — qui exige un **cluster Swarm** (ou Kubernetes). On le pratique dans le guide **Orchestration Swarm**.
:::

:::lang en
**✅ Check:** after `docker network connect backend web`, `inspect`ing `web` lists **two** networks (`appnet` **and** `backend`) — the container is **multi-homed**, reachable from both sides. That's the **reverse-proxy** pattern (public frontend + private backend) or a gateway. `docker network inspect` answers "**who's on this network?**". You can now **segment**: put services that must talk on a shared network, and **isolate** the rest — the basis of container network security.

**🤔 And overlay?** All this is **single-host** (bridge). To link containers across **several machines**, you need the **`overlay`** driver — which requires a **Swarm cluster** (or Kubernetes). We practice it in the **Swarm orchestration** guide.
:::

## pitfalls

:::lang fr
**1. Compter sur le DNS du bridge par défaut.** Il n'y en a **pas** : les conteneurs ne se résolvent pas par nom sur `bridge`. Crée **toujours** un réseau utilisateur pour avoir le DNS.

**2. Confondre `EXPOSE` et `-p`.** `EXPOSE` (Dockerfile) **documente** ; `-p` (au run) **publie** réellement. Un service « exposé » mais non publié n'est **pas** joignable de l'hôte.

**3. Coder une IP de conteneur en dur.** Les IP changent au redémarrage. Utilise les **noms** (sur un réseau utilisateur), jamais les IP.

**4. Utiliser `--link`.** Déprécié. Le remplacement est un **réseau utilisateur** (DNS intégré).

**5. Croire que `host` isole encore un peu.** Non : `--network host` **supprime** l'isolation réseau (le conteneur EST sur le réseau de l'hôte). À éviter si tu veux de l'isolation ; et limité sur Docker Desktop (VM).

**6. Publier sur `0.0.0.0` sans y penser.** `-p 8080:80` écoute sur **toutes** les interfaces. Pour restreindre à la machine locale : `-p 127.0.0.1:8080:80`.

**7. Oublier de nettoyer les réseaux.** Les réseaux créés restent. `docker network prune` supprime ceux qui ne sont plus utilisés.
:::

:::lang en
**1. Relying on the default bridge's DNS.** There is **none**: containers don't resolve by name on `bridge`. **Always** create a user network to get DNS.

**2. Confusing `EXPOSE` and `-p`.** `EXPOSE` (Dockerfile) **documents**; `-p` (at run) actually **publishes**. An "exposed" but unpublished service is **not** reachable from the host.

**3. Hardcoding a container IP.** IPs change on restart. Use **names** (on a user network), never IPs.

**4. Using `--link`.** Deprecated. The replacement is a **user network** (built-in DNS).

**5. Believing `host` still isolates a bit.** No: `--network host` **removes** network isolation (the container IS on the host's network). Avoid it if you want isolation; and it's limited on Docker Desktop (VM).

**6. Publishing on `0.0.0.0` without thinking.** `-p 8080:80` listens on **all** interfaces. To restrict to the local machine: `-p 127.0.0.1:8080:80`.

**7. Forgetting to clean up networks.** Created networks stick around. `docker network prune` removes unused ones.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu nommes les pilotes **bridge/host/none/overlay** et leur usage.
- [ ] Tu montres que le **bridge par défaut** n'a **pas** de DNS par nom.
- [ ] Tu crées un **réseau utilisateur** et tu résous un conteneur **par nom**.
- [ ] Tu **publies** un port et tu distingues `EXPOSE` de `-p`.
- [ ] Tu compares **`host`** et **`none`**.
- [ ] Tu **connectes** un conteneur à deux réseaux et tu **inspectes**.

Six cases cochées = tu tiens **le réseau** du DCA.
:::

:::lang en
You know it works when…

- [ ] You name the **bridge/host/none/overlay** drivers and their use.
- [ ] You show that the **default bridge** has **no** DNS by name.
- [ ] You create a **user network** and resolve a container **by name**.
- [ ] You **publish** a port and distinguish `EXPOSE` from `-p`.
- [ ] You compare **`host`** and **`none`**.
- [ ] You **connect** a container to two networks and **inspect**.

Six boxes ticked = you hold DCA **networking**.
:::

## next

:::lang fr
La suite de la track Docker → DCA :

1. **Stockage & volumes** — volumes, bind mounts, tmpfs, sauvegarde de données.
2. **Sécurité** — non-root, capabilities, read-only, limites, secrets.
3. **Orchestration Swarm** — services, stacks, secrets, réseau **overlay** (en action).
4. **Projet d'entreprise** — image multi-stage → registre → stack Swarm.

**Ménage :** `docker rm -f c1 c2 web web-pub 2>/dev/null ; docker network rm appnet backend 2>/dev/null`.
:::

:::lang en
The rest of the Docker → DCA track:

1. **Storage & volumes** — volumes, bind mounts, tmpfs, data backup.
2. **Security** — non-root, capabilities, read-only, limits, secrets.
3. **Swarm orchestration** — services, stacks, secrets, the **overlay** network (in action).
4. **Enterprise project** — multi-stage image → registry → Swarm stack.

**Cleanup:** `docker rm -f c1 c2 web web-pub 2>/dev/null ; docker network rm appnet backend 2>/dev/null`.
:::

## cheatsheet

:::lang fr
Aide-mémoire réseau Docker.
:::

:::lang en
Docker networking cheat sheet.
:::

```bash
# Pilotes / drivers : bridge (défaut) | host | none | overlay (swarm)
docker network ls ; docker network inspect NOM

# Réseau utilisateur = DNS par nom / user network = DNS by name
docker network create appnet
docker run -d --name web --network appnet nginx:1.27-alpine
docker run --rm --network appnet alpine ping -c1 web       # résout par NOM / resolves by NAME

# Publication de ports / port publishing  (EXPOSE ne publie RIEN / publishes NOTHING)
docker run -d -p 8080:80 web              # -p HÔTE:CONTENEUR   (-P = tous, aléatoire / all, random)
docker run -d -p 127.0.0.1:8080:80 web    # restreint à localhost / restrict to localhost
docker port CONTENEUR

# host / none
docker run --network host ...             # partage la pile de l'hôte / shares host stack
docker run --network none ...             # isolé (lo seulement) / isolated

# Multi-réseaux / multi-network & nettoyage
docker network connect backend web ; docker network disconnect backend web
docker network prune                      # supprime les réseaux inutilisés / remove unused
```

## resources

:::lang fr
- [Vue d'ensemble du réseau Docker](https://docs.docker.com/engine/network/) et [les pilotes](https://docs.docker.com/engine/network/drivers/).
- [Bridge par défaut vs défini par l'utilisateur](https://docs.docker.com/engine/network/drivers/bridge/) (le DNS).
- [Publier des ports](https://docs.docker.com/engine/network/#published-ports).
- Domaine **DCA « Networking »** (~15 %).
:::

:::lang en
- [Docker networking overview](https://docs.docker.com/engine/network/) and [the drivers](https://docs.docker.com/engine/network/drivers/).
- [Default vs user-defined bridge](https://docs.docker.com/engine/network/drivers/bridge/) (the DNS).
- [Publishing ports](https://docs.docker.com/engine/network/#published-ports).
- **DCA "Networking"** domain (~15%).
:::

## troubleshooting

:::lang fr
**`ping conteneur` échoue avec `bad address`.** Tes conteneurs sont sur le **bridge par défaut** (pas de DNS). Mets-les sur un **réseau utilisateur** (`docker network create` + `--network`) pour résoudre par nom.

**`curl localhost:PORT` : connection refused.** Le port n'est pas **publié** (`-p` manquant), ou le service n'écoute pas dans le conteneur. Vérifie `docker port CONTENEUR` et que l'app écoute sur `0.0.0.0` (pas `127.0.0.1`) dans le conteneur.

**`docker network rm` : « network has active endpoints ».** Des conteneurs y sont encore connectés. Supprime/déconnecte-les d'abord, puis retire le réseau (`docker network prune` pour les inutilisés).

**Deux conteneurs sur des réseaux différents ne se joignent pas.** C'est voulu : les réseaux sont **isolés**. Mets-les sur un réseau commun, ou `network connect` l'un sur le réseau de l'autre.

**`--network host` ne marche pas comme attendu (macOS/Windows).** Docker Desktop tourne dans une VM Linux : `host` se réfère à la **VM**, pas à ton macOS/Windows. Sur Linux natif, c'est le vrai hôte.

**Le port publié n'est joignable que localement / trop largement.** Précise l'interface : `-p 127.0.0.1:8080:80` (local) vs `-p 8080:80` (toutes les interfaces).
:::

:::lang en
**`ping container` fails with `bad address`.** Your containers are on the **default bridge** (no DNS). Put them on a **user network** (`docker network create` + `--network`) to resolve by name.

**`curl localhost:PORT`: connection refused.** The port isn't **published** (`-p` missing), or the service isn't listening in the container. Check `docker port CONTAINER` and that the app listens on `0.0.0.0` (not `127.0.0.1`) inside the container.

**`docker network rm`: "network has active endpoints".** Containers are still connected. Remove/disconnect them first, then delete the network (`docker network prune` for unused ones).

**Two containers on different networks can't reach each other.** That's intended: networks are **isolated**. Put them on a shared network, or `network connect` one onto the other's network.

**`--network host` doesn't work as expected (macOS/Windows).** Docker Desktop runs in a Linux VM: `host` refers to the **VM**, not your macOS/Windows. On native Linux, it's the real host.

**The published port is reachable only locally / too broadly.** Specify the interface: `-p 127.0.0.1:8080:80` (local) vs `-p 8080:80` (all interfaces).
:::
