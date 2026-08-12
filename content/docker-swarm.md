---
# — Identité (ne change JAMAIS une fois publié) —
id: docker-swarm
slug: docker-swarm
order: 17
status: published

# — Titres & accroches (bilingue) —
title_fr: "Docker — orchestration Swarm"
title_en: "Docker — Swarm orchestration"
tagline_fr: "Services, scaling, rolling update, overlay, secrets, stacks."
tagline_en: "Services, scaling, rolling update, overlay, secrets, stacks."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 190
repo: "moby/moby"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [docker-securite]
next: [cicd-github-actions]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [mode-swarm, services-replicas, rolling-update-rollback, reseau-overlay, secrets-swarm, stacks-deploy]
concepts_en: [swarm-mode, services-replicas, rolling-update-rollback, overlay-network, swarm-secrets, stacks-deploy]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "L'orchestration Docker Swarm au niveau DCA (le plus gros domaine de l'examen) : le mode Swarm, les services et le scaling, les mises à jour progressives et le rollback, le réseau overlay et le routing mesh, les secrets Swarm, et le déploiement de stacks — refaisable sur un cluster mono-nœud en local."
og_description_en: "Docker Swarm orchestration at DCA level (the exam's biggest domain): Swarm mode, services and scaling, rolling updates and rollback, the overlay network and routing mesh, Swarm secrets, and stack deployment — reproducible on a single-node cluster locally."
---

## intro

:::lang fr
Lancer un conteneur, tu sais faire. Mais **en production**, on ne lance pas des conteneurs à la main : on décrit un **état voulu** (« je veux 3 répliques de ce service, toujours ») et un **orchestrateur** s'occupe de le maintenir — répartition, redémarrage, mise à jour sans coupure. Docker embarque le sien : **Swarm**. C'est le **plus gros domaine du DCA (~25 %)**, et il répond à : *comment transformer Docker en cluster ? déployer un service répliqué ? le mettre à jour sans coupure ? relier des conteneurs sur plusieurs machines ? distribuer un secret ? déployer une appli entière d'un fichier ?*

Ce guide couvre l'**orchestration Swarm** : le **mode Swarm** (init, nœuds), les **services** et le **scaling**, les **rolling updates** et le **rollback**, le réseau **overlay** et le **routing mesh**, les **secrets Swarm**, et le déploiement de **stacks**.

On travaille sur un **cluster Swarm mono-nœud**, en local — un seul nœud suffit à pratiquer **toutes** ces notions (services, secrets, overlay, stacks). *(Note : Kubernetes a largement gagné la bataille de l'orchestration en entreprise ; Swarm reste plus simple et **au programme du DCA** — c'est pour ça qu'on l'apprend ici.)*

**Pour qui c'est :** tu as les guides Docker précédents et tu vises le **DCA**.

**Quand ce n'est PAS le bon choix :**

- Tu ne maîtrises pas images/réseau/volumes → fais les guides précédents.
- Tu veux le projet fil-rouge → c'est l'étape **finale** de la track, juste après.
:::

:::lang en
Launching a container, you can do. But **in production**, you don't launch containers by hand: you describe a **desired state** ("I want 3 replicas of this service, always") and an **orchestrator** keeps it — spreading, restarting, updating without downtime. Docker ships its own: **Swarm**. It's the **DCA's biggest domain (~25%)**, and it answers: *how do you turn Docker into a cluster? deploy a replicated service? update it without downtime? link containers across machines? distribute a secret? deploy a whole app from one file?*

This guide covers **Swarm orchestration**: **Swarm mode** (init, nodes), **services** and **scaling**, **rolling updates** and **rollback**, the **overlay** network and **routing mesh**, **Swarm secrets**, and deploying **stacks**.

We work on a **single-node Swarm cluster**, locally — one node is enough to practice **all** these notions (services, secrets, overlay, stacks). *(Note: Kubernetes has largely won the enterprise orchestration battle; Swarm stays simpler and is **on the DCA syllabus** — that's why we learn it here.)*

**Who it's for:** you have the earlier Docker guides and you're aiming for the **DCA**.

**When it's NOT the right choice:**

- You're not comfortable with images/networking/volumes → do the earlier guides.
- You want the capstone → that's the **final** step of the track, right after.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Passer Docker en **mode Swarm** et lire l'état des **nœuds**.
- Créer un **service** répliqué, le **scaler**, et voir le **self-healing**.
- Faire une **mise à jour progressive** (rolling update) et un **rollback**.
- Créer un réseau **overlay** et comprendre le **routing mesh**.
- Créer et monter un **secret Swarm** (chiffré, en fichier).
- Déployer une appli entière avec un **stack** (`docker stack deploy`).
:::

:::lang en
By the end of this guide, you'll know how to:

- Put Docker into **Swarm mode** and read the **nodes'** state.
- Create a replicated **service**, **scale** it, and see **self-healing**.
- Do a **rolling update** and a **rollback**.
- Create an **overlay** network and understand the **routing mesh**.
- Create and mount a **Swarm secret** (encrypted, as a file).
- Deploy a whole app with a **stack** (`docker stack deploy`).
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides Docker précédents acquis.
- **Docker** installé et lancé.
- Un dossier de travail vierge :
:::

:::lang en
You should have:

- The earlier Docker guides under your belt.
- **Docker** installed and running.
- A blank working directory:
:::

```bash
mkdir docker-swarm && cd docker-swarm
```

## concepts

:::lang fr
**Le mode Swarm** transforme un (ou plusieurs) Docker en **cluster**. On l'active avec `docker swarm init`. Les machines sont des **nœuds** : les **managers** (qui décident, maintiennent l'état voulu, hébergent la base *raft*) et les **workers** (qui exécutent les tâches). Un seul nœud peut être **manager ET worker** — c'est notre cas en local.

**Le service, pas le conteneur.** En Swarm, tu ne lances plus des conteneurs : tu déclares un **service** — « fais tourner N répliques de cette image ». Swarm crée N **tâches** (chaque tâche = un conteneur), les **répartit** sur les nœuds, et **surveille** : si une tâche meurt, il en recrée une (self-healing) ; si un nœud tombe, il redéploie ailleurs. C'est du **déclaratif**, comme Kubernetes.

**La mise à jour progressive (rolling update).** Changer l'image d'un service ne coupe pas le service : Swarm remplace les tâches **par lots** (`--update-parallelism`), avec un **délai** entre chaque (`--update-delay`). Si ça se passe mal, **`docker service rollback`** revient à la version précédente. **Zéro coupure**, comme en prod.

**Le réseau overlay & le routing mesh.** Le pilote **`overlay`** (vu au guide réseau) relie les tâches **à travers les nœuds** — c'est le réseau des services Swarm. Et le **routing mesh** : un port **publié** par un service est joignable sur **n'importe quel nœud** du cluster (Swarm route en interne vers une tâche vivante), même celui qui n'héberge aucune réplique.

**Les secrets Swarm.** Enfin la bonne façon de gérer un secret (cf. guide sécurité) : `docker secret create` stocke la valeur **chiffrée** dans le raft ; un service qui la demande (`--secret`) la reçoit montée en **fichier** dans **`/run/secrets/<nom>`** (un `tmpfs`, jamais sur disque, jamais dans une `ENV`). C'est **la** solution attendue à l'examen.

**Les stacks.** Décrire des services à la main est fastidieux. Un **stack** est une appli multi-services décrite dans un **fichier Compose** (avec une section **`deploy:`** propre à Swarm : replicas, update, placement). **`docker stack deploy -c fichier.yml nom`** déploie tout d'un coup — le Compose, mais pour un cluster.
:::

:::lang en
**Swarm mode** turns one (or more) Docker into a **cluster**. You enable it with `docker swarm init`. Machines are **nodes**: the **managers** (which decide, keep the desired state, host the *raft* store) and the **workers** (which run tasks). A single node can be **manager AND worker** — our local case.

**The service, not the container.** In Swarm, you no longer launch containers: you declare a **service** — "run N replicas of this image". Swarm creates N **tasks** (each task = a container), **spreads** them across nodes, and **watches**: if a task dies, it recreates one (self-healing); if a node falls, it redeploys elsewhere. It's **declarative**, like Kubernetes.

**The rolling update.** Changing a service's image doesn't cut the service: Swarm replaces tasks **in batches** (`--update-parallelism`), with a **delay** between each (`--update-delay`). If it goes wrong, **`docker service rollback`** reverts to the previous version. **Zero downtime**, like in prod.

**The overlay network & routing mesh.** The **`overlay`** driver (seen in the networking guide) links tasks **across nodes** — it's the Swarm services' network. And the **routing mesh**: a port **published** by a service is reachable on **any node** of the cluster (Swarm routes internally to a live task), even one hosting no replica.

**Swarm secrets.** Finally the right way to handle a secret (see the security guide): `docker secret create` stores the value **encrypted** in raft; a service that requests it (`--secret`) gets it mounted as a **file** in **`/run/secrets/<name>`** (a `tmpfs`, never on disk, never in an `ENV`). It's **the** exam-expected solution.

**Stacks.** Describing services by hand is tedious. A **stack** is a multi-service app described in a **Compose file** (with a Swarm-specific **`deploy:`** section: replicas, update, placement). **`docker stack deploy -c file.yml name`** deploys it all at once — Compose, but for a cluster.
:::

:::figure docker-swarm
caption_fr: "Schéma 1. Manager (état voulu, raft) pilote des services -> tâches réparties sur les nœuds. Routing mesh : un port publié joignable sur tout nœud. Secrets montés en /run/secrets."
caption_en: "Figure 1. Manager (desired state, raft) drives services -> tasks spread over nodes. Routing mesh: a published port reachable on any node. Secrets mounted at /run/secrets."
:::

:::lang fr
On avance : init Swarm → service & scaling → rolling update & rollback → overlay & routing mesh → secrets → stack.
:::

:::lang en
We'll go: Swarm init → service & scaling → rolling update & rollback → overlay & routing mesh → secrets → stack.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Activer le **mode Swarm** et voir le nœud.

**🤔 Un cluster d'un nœud.** `docker swarm init` fait de ta machine un **manager** :
:::

:::lang en
**Goal.** Enable **Swarm mode** and see the node.

**🤔 A one-node cluster.** `docker swarm init` makes your machine a **manager**:
:::

```bash
docker swarm init      # (si plusieurs IP : docker swarm init --advertise-addr <IP>)
docker node ls         # les nœuds du cluster / the cluster nodes
docker info --format '{{.Swarm.LocalNodeState}} / {{.Swarm.ControlAvailable}}'   # active / true
```

:::lang fr
**✅ Vérification :** `docker node ls` liste **un** nœud, `Leader`, statut `Ready` et disponibilité `Active` — ta machine est un **manager** (elle décide) **et** un worker (elle exécute). `docker info` confirme `Swarm: active`. Tu es passé du Docker « lance des conteneurs » au Docker **orchestrateur** : à partir de maintenant, on déclare des **services**, pas des conteneurs. *(Le message d'`init` affiche aussi une commande `docker swarm join` — c'est elle qu'on lancerait sur d'autres machines pour agrandir le cluster.)*
:::

:::lang en
**✅ Check:** `docker node ls` lists **one** node, `Leader`, status `Ready` and availability `Active` — your machine is a **manager** (it decides) **and** a worker (it runs tasks). `docker info` confirms `Swarm: active`. You've moved from "launch containers" Docker to **orchestrator** Docker: from now on, you declare **services**, not containers. *(The `init` message also shows a `docker swarm join` command — that's what you'd run on other machines to grow the cluster.)*
:::

### step-02

:::lang fr
**Objectif.** Créer un **service** répliqué, le **scaler**, et voir le **self-healing**.

**🤔 Déclarer, pas lancer.** Crée un service à 3 répliques, publié sur 8080 :
:::

:::lang en
**Goal.** Create a replicated **service**, **scale** it, and see **self-healing**.

**🤔 Declare, don't launch.** Create a 3-replica service, published on 8080:
:::

```bash
docker service create --name web --replicas 3 -p 8080:80 nginx:1.27-alpine
docker service ls                        # REPLICAS 3/3 / 3 tasks running
docker service ps web                    # les 3 tâches et leur nœud / the 3 tasks and their node
curl -s localhost:8080 | grep -i nginx   # le service répond / the service answers

docker service scale web=5               # passe à 5 répliques / scale to 5
# self-healing : tue une tâche, Swarm la recrée / kill a task, Swarm recreates it
docker rm -f "$(docker ps -q -f name=web | head -1)"
sleep 3 ; docker service ls              # toujours 5/5 (une tâche recréée) / still 5/5 (one recreated)
```

:::lang fr
**✅ Vérification :** `docker service ls` affiche `web  replicated  5/5` après le scale, et `docker service ps web` liste les tâches (`web.1`, `web.2`…) avec leur état `Running`. Preuve du **self-healing** : après avoir supprimé de force le conteneur d'une tâche, Swarm en recrée **une** pour revenir à l'état voulu (5/5) — tu n'as **rien** fait. C'est la **réconciliation** : tu déclares « je veux 5 », Swarm **maintient** 5, quoi qu'il arrive. Tu ne gères plus des conteneurs, tu gères un **état voulu**.
:::

:::lang en
**✅ Check:** `docker service ls` shows `web  replicated  5/5` after the scale, and `docker service ps web` lists the tasks (`web.1`, `web.2`…) in `Running` state. Proof of **self-healing**: after force-removing one task's container, Swarm recreates **one** to return to the desired state (5/5) — you did **nothing**. That's **reconciliation**: you declare "I want 5", Swarm **keeps** 5, whatever happens. You no longer manage containers, you manage a **desired state**.
:::

### step-03

:::lang fr
**Objectif.** Faire une **mise à jour progressive** (rolling update) puis un **rollback**.

**🤔 Zéro coupure.** On change l'image du service, **une tâche à la fois**, avec un délai — le service reste debout :
:::

:::lang en
**Goal.** Do a **rolling update** then a **rollback**.

**🤔 Zero downtime.** We change the service's image, **one task at a time**, with a delay — the service stays up:
:::

```bash
docker service update \
  --image nginx:1.26-alpine \
  --update-parallelism 1 --update-delay 3s \
  web
docker service ps web --format '{{.Name}} {{.Image}} {{.CurrentState}}' | head   # tâches en cours de bascule / tasks flipping

# rollback : revenir à l'image précédente / revert to the previous image
docker service rollback web
docker service inspect web --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}'   # de retour à 1.27 / back to 1.27
```

:::lang fr
**✅ Vérification :** pendant l'`update`, `docker service ps web` montre Swarm remplacer les tâches **progressivement** (1 à la fois, 3 s d'écart) : d'anciennes tâches `Shutdown` et de nouvelles `Running` avec la nouvelle image `nginx:1.26-alpine` — **sans** que `curl localhost:8080` cesse de répondre. Puis **`docker service rollback`** ramène le service à `nginx:1.27-alpine` (confirmé par l'`inspect`). C'est le **déploiement sans coupure** et son filet de sécurité : mettre à jour par lots, et **revenir en arrière** en une commande si un problème surgit. Le cœur de l'exploitation moderne.
:::

:::lang en
**✅ Check:** during the `update`, `docker service ps web` shows Swarm replacing tasks **progressively** (1 at a time, 3s apart): old tasks `Shutdown` and new ones `Running` with the new `nginx:1.26-alpine` image — **without** `curl localhost:8080` ever stopping. Then **`docker service rollback`** brings the service back to `nginx:1.27-alpine` (confirmed by `inspect`). That's **zero-downtime deployment** and its safety net: update in batches, and **revert** in one command if a problem arises. The heart of modern operations.
:::

### step-04

:::lang fr
**Objectif.** Créer un réseau **overlay** et comprendre le **routing mesh**.

**🤔 Le réseau des services.** L'`overlay` relie les tâches entre nœuds ; le **routing mesh** publie un port sur **tout** le cluster. Crée le réseau et un service dessus :
:::

:::lang en
**Goal.** Create an **overlay** network and understand the **routing mesh**.

**🤔 The services' network.** The `overlay` links tasks across nodes; the **routing mesh** publishes a port across **the whole** cluster. Create the network and a service on it:
:::

```bash
docker network create -d overlay --attachable appnet     # réseau overlay / overlay network
docker service create --name api --network appnet --replicas 2 -p 9090:80 nginx:1.27-alpine
docker service ps api
curl -s localhost:9090 | grep -i nginx                    # joignable via le routing mesh / via the routing mesh
```

:::lang fr
**✅ Vérification :** le service `api` tourne sur le réseau **`overlay`** `appnet`, et `curl localhost:9090` répond — le port **9090** est publié par le **routing mesh** sur le nœud. Sur un cluster multi-nœuds, ce **même** port serait joignable sur **n'importe quel** nœud (même sans réplique locale), Swarm routant en interne vers une tâche vivante. L'`overlay` est **le** réseau des applications distribuées : les services y communiquent **par leur nom** (DNS interne, comme un bridge utilisateur) **à travers les machines**. C'est ce qui rend un cluster réellement utile.
:::

:::lang en
**✅ Check:** the `api` service runs on the **`overlay`** network `appnet`, and `curl localhost:9090` answers — port **9090** is published by the **routing mesh** on the node. On a multi-node cluster, that **same** port would be reachable on **any** node (even without a local replica), Swarm routing internally to a live task. The `overlay` is **the** network for distributed apps: services talk to each other **by name** (internal DNS, like a user bridge) **across machines**. That's what makes a cluster actually useful.
:::

### step-05

:::lang fr
**Objectif.** Créer un **secret Swarm** et le monter dans un service.

**🤔 La bonne façon (enfin).** Le secret est chiffré dans le cluster et monté en **fichier**, jamais en `ENV`. Crée-le et consomme-le :
:::

:::lang en
**Goal.** Create a **Swarm secret** and mount it in a service.

**🤔 The right way (finally).** The secret is encrypted in the cluster and mounted as a **file**, never as an `ENV`. Create it and consume it:
:::

```bash
printf 's3cr3t-de-prod' | docker secret create db_pass -      # crée le secret (chiffré) / create the (encrypted) secret
docker secret ls

docker service create --name coffre --secret db_pass alpine:3.20 sleep 300
# le secret est monté en fichier dans /run/secrets/ / mounted as a file in /run/secrets/
docker exec "$(docker ps -q -f name=coffre | head -1)" cat /run/secrets/db_pass ; echo
```

:::lang fr
**✅ Vérification :** `docker secret ls` liste `db_pass`, et l'`exec` dans la tâche du service `coffre` affiche **`s3cr3t-de-prod`** — le secret a été monté dans **`/run/secrets/db_pass`** (un `tmpfs` en RAM), lisible par l'appli **comme un fichier**, mais **jamais** exposé dans une `ENV`, `docker inspect`, ou une couche d'image. C'est **la** solution du guide sécurité, appliquée : contrairement à l'`ENV` qui fuit, le **secret Swarm** est chiffré au repos (dans le raft) et livré à l'exécution, en fichier. *(Nettoyage plus loin.)*
:::

:::lang en
**✅ Check:** `docker secret ls` lists `db_pass`, and the `exec` in the `coffre` service's task prints **`s3cr3t-de-prod`** — the secret was mounted at **`/run/secrets/db_pass`** (an in-RAM `tmpfs`), readable by the app **as a file**, but **never** exposed in an `ENV`, `docker inspect`, or an image layer. It's **the** security-guide solution, applied: unlike the `ENV` that leaks, the **Swarm secret** is encrypted at rest (in raft) and delivered at runtime, as a file. *(Cleanup below.)*
:::

### step-06

:::lang fr
**Objectif.** Déployer une appli entière avec un **stack** — le Compose du cluster.

**🤔 Tout dans un fichier.** Un stack décrit plusieurs services + leur config Swarm dans un fichier Compose. Crée `stack.yml` :
:::

:::lang en
**Goal.** Deploy a whole app with a **stack** — the cluster's Compose.

**🤔 All in one file.** A stack describes several services + their Swarm config in a Compose file. Create `stack.yml`:
:::

```yaml
# stack.yml
services:
  web:
    image: nginx:1.27-alpine
    ports:
      - "8081:80"
    deploy:
      replicas: 3                     # <- section deploy = spécifique à Swarm / Swarm-specific
      update_config:
        parallelism: 1
        delay: 3s
      restart_policy:
        condition: on-failure
```

```bash
docker stack deploy -c stack.yml monapp
docker stack services monapp          # les services du stack / the stack's services
docker stack ps monapp                 # les tâches / the tasks
curl -s localhost:8081 | grep -i nginx
```

:::lang fr
**✅ Vérification :** `docker stack deploy` crée le service `monapp_web` (nommé `<stack>_<service>`), et `docker stack services monapp` affiche `3/3` répliques ; `curl localhost:8081` répond. Tu as déployé une appli **d'un seul fichier**, avec sa config d'orchestration (**`deploy:`** : replicas, mise à jour progressive, politique de redémarrage) — c'est **Compose, mais pour un cluster**. Modifie le YAML et **redéploie** : Swarm applique le diff (rolling update inclus). Le stack est **l'unité de déploiement** d'une appli Swarm. *(Nettoyage : voir la section suivante.)*
:::

:::lang en
**✅ Check:** `docker stack deploy` creates the `monapp_web` service (named `<stack>_<service>`), and `docker stack services monapp` shows `3/3` replicas; `curl localhost:8081` answers. You deployed an app **from a single file**, with its orchestration config (**`deploy:`**: replicas, rolling update, restart policy) — it's **Compose, but for a cluster**. Edit the YAML and **redeploy**: Swarm applies the diff (rolling update included). The stack is **the deployment unit** of a Swarm app. *(Cleanup: see the next section.)*
:::

## pitfalls

:::lang fr
**1. Confondre conteneur et service.** En Swarm, `docker run` reste local au nœud ; c'est **`docker service`** qui orchestre (répliques, self-healing, répartition). Ne mélange pas les deux mondes.

**2. `deploy:` ignoré par `docker compose up`.** La section `deploy:` (replicas, update_config) n'est prise en compte que par **Swarm** (`docker stack deploy`), **pas** par `docker compose up`. À l'inverse, certaines clés Compose (`build`, `depends_on`) sont ignorées en Swarm.

**3. Mettre un secret en `ENV` en Swarm.** Alors que les **secrets Swarm** existent (chiffrés, en fichier). Utilise `docker secret` + `--secret`, jamais `-e`.

**4. Oublier `--advertise-addr` sur une machine multi-IP.** `docker swarm init` peut échouer/mal choisir l'IP. Précise `--advertise-addr <IP>`.

**5. Croire le routing mesh multi-nœuds sur un seul nœud.** En local (1 nœud), tu ne **vois** pas la magie multi-hôtes ; le comportement (port publié partout) se révèle sur un vrai cluster. Le mécanisme, lui, est le même.

**6. `docker service rm` ne libère pas tout.** Les réseaux overlay, secrets, volumes restent. Nettoie explicitement (`docker network rm`, `docker secret rm`).

**7. Éditer une tâche à la main.** Supprimer/modifier le conteneur d'une tâche est **inutile** : Swarm réconcilie vers l'état voulu. Change le **service** (`service update`), pas la tâche.
:::

:::lang en
**1. Confusing container and service.** In Swarm, `docker run` stays local to the node; it's **`docker service`** that orchestrates (replicas, self-healing, spreading). Don't mix the two worlds.

**2. `deploy:` ignored by `docker compose up`.** The `deploy:` section (replicas, update_config) is honored only by **Swarm** (`docker stack deploy`), **not** by `docker compose up`. Conversely, some Compose keys (`build`, `depends_on`) are ignored in Swarm.

**3. Putting a secret in `ENV` in Swarm.** While **Swarm secrets** exist (encrypted, as a file). Use `docker secret` + `--secret`, never `-e`.

**4. Forgetting `--advertise-addr` on a multi-IP machine.** `docker swarm init` may fail/pick the wrong IP. Specify `--advertise-addr <IP>`.

**5. Believing the routing mesh is multi-node on a single node.** Locally (1 node), you don't **see** the multi-host magic; the behavior (port published everywhere) reveals itself on a real cluster. The mechanism is the same, though.

**6. `docker service rm` doesn't free everything.** Overlay networks, secrets, volumes remain. Clean up explicitly (`docker network rm`, `docker secret rm`).

**7. Editing a task by hand.** Deleting/modifying a task's container is **pointless**: Swarm reconciles to the desired state. Change the **service** (`service update`), not the task.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu passes en **mode Swarm** et tu lis `docker node ls`.
- [ ] Tu crées un **service**, tu le **scales**, et tu vois le **self-healing**.
- [ ] Tu fais un **rolling update** et un **rollback**.
- [ ] Tu crées un réseau **overlay** et tu expliques le **routing mesh**.
- [ ] Tu crées un **secret Swarm** monté en `/run/secrets`.
- [ ] Tu déploies un **stack** depuis un fichier Compose (`deploy:`).

Six cases cochées = tu tiens **l'orchestration** du DCA (le plus gros domaine).
:::

:::lang en
You know it works when…

- [ ] You enter **Swarm mode** and read `docker node ls`.
- [ ] You create a **service**, **scale** it, and see **self-healing**.
- [ ] You do a **rolling update** and a **rollback**.
- [ ] You create an **overlay** network and explain the **routing mesh**.
- [ ] You create a **Swarm secret** mounted at `/run/secrets`.
- [ ] You deploy a **stack** from a Compose file (`deploy:`).

Six boxes ticked = you hold DCA **orchestration** (the biggest domain).
:::

## next

:::lang fr
Tu as bouclé la **couverture de contenu** de la track Docker → DCA. Il reste le **projet d'entreprise** :

- **Projet d'entreprise** — construire une **image multi-stage**, la pousser dans un **registre**, et déployer une **stack Swarm** complète (service répliqué + secret + réseau overlay + rolling update + healthcheck) dans un dépôt documenté. Le livrable Docker pour ton CV.

**Ménage :**
`docker stack rm monapp ; docker service rm web api coffre 2>/dev/null ; docker secret rm db_pass 2>/dev/null ; docker network rm appnet 2>/dev/null ; docker swarm leave --force`.
:::

:::lang en
You've completed the **content coverage** of the Docker → DCA track. The **enterprise project** remains:

- **Enterprise project** — build a **multi-stage image**, push it to a **registry**, and deploy a complete **Swarm stack** (replicated service + secret + overlay network + rolling update + healthcheck) in a documented repo. The Docker deliverable for your CV.

**Cleanup:**
`docker stack rm monapp ; docker service rm web api coffre 2>/dev/null ; docker secret rm db_pass 2>/dev/null ; docker network rm appnet 2>/dev/null ; docker swarm leave --force`.
:::

## cheatsheet

:::lang fr
Aide-mémoire Swarm.
:::

:::lang en
Swarm cheat sheet.
:::

```bash
# Cluster
docker swarm init [--advertise-addr IP] ; docker node ls ; docker swarm leave --force

# Services
docker service create --name web --replicas 3 -p 8080:80 nginx:1.27-alpine
docker service ls ; docker service ps web ; docker service scale web=5
docker service update --image IMG --update-parallelism 1 --update-delay 5s web
docker service rollback web ; docker service rm web

# Overlay & secrets
docker network create -d overlay --attachable appnet
printf 'val' | docker secret create NOM - ; docker service create --secret NOM ...   # -> /run/secrets/NOM

# Stacks (Compose + section deploy:)
docker stack deploy -c stack.yml monapp
docker stack services monapp ; docker stack ps monapp ; docker stack rm monapp
```

## resources

:::lang fr
- [Mode Swarm](https://docs.docker.com/engine/swarm/) — vue d'ensemble et concepts.
- [Services](https://docs.docker.com/engine/swarm/services/) et [rolling updates](https://docs.docker.com/engine/swarm/swarm-tutorial/rolling-update/).
- [Secrets Swarm](https://docs.docker.com/engine/swarm/secrets/) et [déployer un stack](https://docs.docker.com/engine/swarm/stack-deploy/).
- Domaine **DCA « Orchestration »** (~25 %, le plus gros).
:::

:::lang en
- [Swarm mode](https://docs.docker.com/engine/swarm/) — overview and concepts.
- [Services](https://docs.docker.com/engine/swarm/services/) and [rolling updates](https://docs.docker.com/engine/swarm/swarm-tutorial/rolling-update/).
- [Swarm secrets](https://docs.docker.com/engine/swarm/secrets/) and [deploy a stack](https://docs.docker.com/engine/swarm/stack-deploy/).
- **DCA "Orchestration"** domain (~25%, the biggest).
:::

## troubleshooting

:::lang fr
**`docker swarm init` : « could not choose an IP address ».** Machine multi-IP : précise `docker swarm init --advertise-addr <IP>` (une IP de la machine).

**`docker service create` : « This node is not a swarm manager ».** Tu n'es pas en Swarm (ou pas manager). Fais `docker swarm init` d'abord.

**Le service reste en `0/3`.** Les tâches ne démarrent pas : `docker service ps --no-trunc web` montre l'**erreur** (image introuvable, port déjà pris, contrainte de placement non satisfaite).

**`curl` sur le port publié échoue.** Sur un seul nœud, vérifie que le service est `Running` et le port bien publié (`docker service inspect --format '{{.Endpoint.Ports}}' web`). Le routing mesh route vers une tâche **vivante** seulement.

**Impossible de supprimer un réseau overlay.** Un service y est encore attaché. Supprime d'abord les services (`docker service rm`), puis le réseau.

**`deploy:` ne fait rien.** Tu as lancé `docker compose up` (qui **ignore** `deploy:`). Pour Swarm, c'est **`docker stack deploy -c fichier.yml nom`**.
:::

:::lang en
**`docker swarm init`: "could not choose an IP address".** Multi-IP machine: specify `docker swarm init --advertise-addr <IP>` (one of the machine's IPs).

**`docker service create`: "This node is not a swarm manager".** You're not in Swarm (or not a manager). Run `docker swarm init` first.

**The service stays at `0/3`.** Tasks aren't starting: `docker service ps --no-trunc web` shows the **error** (image not found, port already taken, unmet placement constraint).

**`curl` on the published port fails.** On a single node, check the service is `Running` and the port is published (`docker service inspect --format '{{.Endpoint.Ports}}' web`). The routing mesh routes only to a **live** task.

**Can't delete an overlay network.** A service is still attached. Remove the services first (`docker service rm`), then the network.

**`deploy:` does nothing.** You ran `docker compose up` (which **ignores** `deploy:`). For Swarm, it's **`docker stack deploy -c file.yml name`**.
:::
