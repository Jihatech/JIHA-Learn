---
# — Identité (ne change JAMAIS une fois publié) —
id: docker-projet-entreprise
slug: docker-projet-entreprise
order: 18
status: published

# — Titres & accroches (bilingue) —
title_fr: "Docker — projet d'entreprise : stack Swarm sécurisée"
title_en: "Docker — enterprise project: secured Swarm stack"
tagline_fr: "Image multi-stage → registre → stack Swarm — livrable CV."
tagline_en: "Multi-stage image → registry → Swarm stack — CV deliverable."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 320
repo: "moby/moby"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [docker-swarm]
next: [cicd-github-actions]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [image-multi-stage, registre-local, stack-swarm, secret-swarm, reseau-overlay, rolling-update, durcissement, livrable-portfolio]
concepts_en: [multi-stage-image, local-registry, swarm-stack, swarm-secret, overlay-network, rolling-update, hardening, portfolio-deliverable]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le projet fil-rouge Docker → DCA : construis une image multi-stage durcie, pousse-la dans un registre local, et déploie une stack Swarm complète (service répliqué + secret + réseau overlay + tier de données + rolling update + healthcheck) dans un dépôt documenté. Le livrable Docker pour ton CV."
og_description_en: "The Docker → DCA capstone: build a hardened multi-stage image, push it to a local registry, and deploy a complete Swarm stack (replicated service + secret + overlay network + data tier + rolling update + healthcheck) in a documented repo. The Docker deliverable for your CV."
---

## intro

:::lang fr
Tu as appris les briques Docker : images, réseau, volumes, sécurité, Swarm. **Un recruteur veut voir l'assemblage.** Ce projet est cet assemblage : une **application conteneurisée, sécurisée et orchestrée**, que tu construis de A à Z, du code à la stack en production, et que tu mets sur ton CV et ton GitHub.

**Le scénario.** Tu es l'ingénieur DevOps chargé de livrer l'API d'une PME, *Atelier Média*, sur un cluster Docker Swarm. Ta mission couvre toute la chaîne :

- **construire** l'image de l'API en **multi-stage**, **durcie** (non-root, healthcheck) ;
- la **distribuer** via un **registre** ;
- **déployer** une **stack Swarm** : l'API **répliquée**, un **tier de données** (Redis + volume), un **secret** monté en fichier, un réseau **overlay**, et une politique de **mise à jour progressive** ;
- **mettre à jour sans coupure** (et savoir revenir en arrière) ;
- **documenter** le tout en runbook.

**Tout tourne en local**, sur un **cluster Swarm mono-nœud** — mais c'est **exactement** la démarche d'un vrai déploiement multi-nœuds. Ce projet réunit **les cinq guides** de la track DCA.

**Ce que ça prouve à un recruteur :** que tu sais mener une appli **du code à la production conteneurisée** — build optimisé, distribution, orchestration, sécurité, déploiement sans coupure — le tout **documenté** et **reproductible**.

**Pour qui c'est :** tu as terminé les cinq guides Docker de la track.
:::

:::lang en
You've learned the Docker bricks: images, networking, volumes, security, Swarm. **A recruiter wants to see the assembly.** This project is that assembly: a **containerized, secured, orchestrated application** that you build end to end, from code to production stack, and put on your CV and GitHub.

**The scenario.** You're the DevOps engineer tasked with shipping an SME's API, *Atelier Média*, on a Docker Swarm cluster. Your mission covers the whole chain:

- **build** the API image as **multi-stage**, **hardened** (non-root, healthcheck);
- **distribute** it via a **registry**;
- **deploy** a **Swarm stack**: the **replicated** API, a **data tier** (Redis + volume), a **secret** mounted as a file, an **overlay** network, and a **rolling-update** policy;
- **update without downtime** (and know how to roll back);
- **document** it all as a runbook.

**Everything runs locally**, on a **single-node Swarm cluster** — but it's **exactly** the approach of a real multi-node deployment. This project brings together **all five guides** of the DCA track.

**What it proves to a recruiter:** that you can take an app **from code to containerized production** — optimized build, distribution, orchestration, security, zero-downtime deployment — all **documented** and **reproducible**.

**Who it's for:** you've finished the five Docker track guides.
:::

## objectives

:::lang fr
À la fin de ce projet, tu auras produit et su expliquer :

- Une **image multi-stage** durcie (non-root, `HEALTHCHECK`) construite depuis ton code.
- Un **registre local** et l'image **poussée** dedans.
- Une **stack Swarm** : API répliquée + Redis (volume) + **secret** + **overlay**.
- Une **mise à jour progressive** et un **rollback**.
- Un **runbook** (README) de niveau professionnel.
- Un déploiement **reproductible** (`docker stack deploy` rejouable).
:::

:::lang en
By the end of this project, you'll have produced and be able to explain:

- A hardened **multi-stage image** (non-root, `HEALTHCHECK`) built from your code.
- A **local registry** with the image **pushed** to it.
- A **Swarm stack**: replicated API + Redis (volume) + **secret** + **overlay**.
- A **rolling update** and a **rollback**.
- A professional-grade **runbook** (README).
- A **reproducible** deployment (replayable `docker stack deploy`).
:::

## prerequisites

:::lang fr
Tu dois avoir :

- **Toute la track Docker** terminée.
- **Docker** installé et lancé, **Git** installé.
- ~2-3 h.

Crée le dépôt du projet :
:::

:::lang en
You should have:

- **The whole Docker track** finished.
- **Docker** installed and running, **Git** installed.
- ~2-3 h.

Create the project repo:
:::

```bash
mkdir atelier-stack && cd atelier-stack && git init
```

## concepts

:::lang fr
**L'architecture cible.** On assemble, du code à la prod, ce que la track a enseigné :

1. **L'image** (guide images) — le code de l'API, compilé en **multi-stage** (binaire dans une image Alpine minuscule), **durci** : utilisateur **non-root**, **`HEALTHCHECK`** intégré.
2. **La distribution** (guide images) — l'image **taguée** et **poussée** dans un **registre local** (`registry:2`) : la source dont Swarm tirera l'image.
3. **L'orchestration** (guide Swarm) — une **stack** décrit tout : le service **API répliqué** (3 tâches), un **tier de données Redis** avec un **volume** persistant, sur un réseau **overlay**.
4. **La sécurité** (guide sécurité) — un **secret Swarm** (chiffré, monté en `/run/secrets`), des **limites de ressources**, l'utilisateur non-root de l'image.
5. **L'exploitation** (guide Swarm) — une politique de **mise à jour progressive** (`update_config`) et le **rollback** en un geste.

**Le fil rouge : du code au cluster, reproductible.** Un `git clone` + `docker build` + `docker stack deploy` doit suffire à reconstruire l'appli **à l'identique**. C'est ce que prouve un vrai livrable DevOps : pas un tas de commandes tapées à la main, mais un **dépôt** qui **décrit** et **reconstruit** le système.
:::

:::lang en
**The target architecture.** We assemble, from code to prod, what the track taught:

1. **The image** (images guide) — the API's code, compiled in **multi-stage** (binary in a tiny Alpine image), **hardened**: **non-root** user, built-in **`HEALTHCHECK`**.
2. **Distribution** (images guide) — the image **tagged** and **pushed** to a **local registry** (`registry:2`): the source Swarm will pull the image from.
3. **Orchestration** (Swarm guide) — a **stack** describes it all: the **replicated API** service (3 tasks), a **Redis data tier** with a persistent **volume**, on an **overlay** network.
4. **Security** (security guide) — a **Swarm secret** (encrypted, mounted at `/run/secrets`), **resource limits**, the image's non-root user.
5. **Operations** (Swarm guide) — a **rolling-update** policy (`update_config`) and one-gesture **rollback**.

**The through-line: code to cluster, reproducible.** A `git clone` + `docker build` + `docker stack deploy` should suffice to rebuild the app **identically**. That's what a real DevOps deliverable proves: not a pile of hand-typed commands, but a **repo** that **describes** and **rebuilds** the system.
:::

:::figure docker-projet-stack
caption_fr: "Schéma 1. Code → image multi-stage durcie → registre local → stack Swarm (API x3 + Redis+volume) sur overlay, avec secret et rolling update."
caption_en: "Figure 1. Code → hardened multi-stage image → local registry → Swarm stack (API x3 + Redis+volume) on overlay, with secret and rolling update."
:::

:::lang fr
Le plan : code & image → registre → Swarm & secret → stack → déploiement & vérif → rolling update → doc → reproductibilité & nettoyage.
:::

:::lang en
The plan: code & image → registry → Swarm & secret → stack → deploy & verify → rolling update → docs → reproducibility & teardown.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Écrire l'**API** et son **image multi-stage durcie**.

L'API (Go, bibliothèque standard) sert son nom d'hôte et **confirme la présence du secret** sans jamais l'afficher. Crée `main.go` :
:::

:::lang en
**Goal.** Write the **API** and its **hardened multi-stage image**.

The API (Go, standard library) serves its hostname and **confirms the secret is present** without ever printing it. Create `main.go`:
:::

```go
// main.go
package main

import (
	"fmt"
	"net/http"
	"os"
)

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "ok")
	})
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		host, _ := os.Hostname()
		secret := "(absent)"
		if b, err := os.ReadFile("/run/secrets/api_token"); err == nil {
			secret = fmt.Sprintf("présent (%d octets)", len(b)) // on ne l'affiche PAS / we DON'T print it
		}
		fmt.Fprintf(w, "Atelier API v1 — hôte %s — secret: %s\n", host, secret)
	})
	http.ListenAndServe(":8080", nil)
}
```

:::lang fr
Puis le `Dockerfile` **multi-stage** et **durci** :
:::

:::lang en
Then the **multi-stage**, **hardened** `Dockerfile`:
:::

```dockerfile
# Dockerfile
# --- build (lourde) / build (heavy) ---
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY main.go .
RUN go mod init api && CGO_ENABLED=0 go build -o /api .

# --- runtime (minimale, durcie) / runtime (minimal, hardened) ---
FROM alpine:3.20
RUN adduser -D -u 1000 app        # utilisateur NON-root / NON-root user
USER app
COPY --from=build /api /api
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
ENTRYPOINT ["/api"]
```

```bash
docker build -t atelier-api:1.0 .
docker run -d --name test -p 8080:8080 atelier-api:1.0
sleep 2 ; curl -s localhost:8080 ; docker rm -f test
```

:::lang fr
**✅ Vérification :** `docker build` produit `atelier-api:1.0`, et le `curl` de test renvoie `Atelier API v1 — hôte … — secret: (absent)` (pas de secret hors Swarm — normal). L'image est **multi-stage** (le binaire seul dans Alpine, pas de Go ni de sources → quelques Mo), **durcie** (`USER app` non-root, `HEALTHCHECK` intégré). Tu as transformé du **code** en une **image de production** légère et sûre — la première étape de toute chaîne de livraison conteneurisée.
:::

:::lang en
**✅ Check:** `docker build` produces `atelier-api:1.0`, and the test `curl` returns `Atelier API v1 — hôte … — secret: (absent)` (no secret outside Swarm — expected). The image is **multi-stage** (the binary alone in Alpine, no Go or sources → a few MB), **hardened** (`USER app` non-root, built-in `HEALTHCHECK`). You've turned **code** into a lightweight, safe **production image** — the first step of any containerized delivery chain.
:::

### step-02

:::lang fr
**Objectif.** Distribuer l'image via un **registre local**.

**🤔 La source de Swarm.** Swarm tirera l'image d'un registre. Lance-en un et pousse-y ton image :
:::

:::lang en
**Goal.** Distribute the image via a **local registry**.

**🤔 Swarm's source.** Swarm will pull the image from a registry. Run one and push your image to it:
:::

```bash
docker run -d -p 5001:5000 --name registry registry:2      # registre local (5001 : macOS AirPlay tient :5000)
docker tag atelier-api:1.0 localhost:5001/atelier-api:1.0
docker push localhost:5001/atelier-api:1.0
```

:::lang fr
**✅ Vérification :** `docker push` téléverse l'image dans ton registre `registry:2` sur `localhost:5001`. C'est **la source** dont la stack tirera l'API : dans le YAML, on référencera `localhost:5001/atelier-api:1.0`. Sur un cluster mono-nœud, le daemon (qui héberge le registre et exécute Swarm) y accède directement. *(Sur un vrai cluster multi-nœuds, chaque nœud devrait joindre le registre — via une adresse routable, pas `localhost`.)*
:::

:::lang en
**✅ Check:** `docker push` uploads the image to your `registry:2` registry on `localhost:5001`. That's **the source** the stack will pull the API from: in the YAML, we'll reference `localhost:5001/atelier-api:1.0`. On a single-node cluster, the daemon (hosting the registry and running Swarm) accesses it directly. *(On a real multi-node cluster, each node would need to reach the registry — via a routable address, not `localhost`.)*
:::

### step-03

:::lang fr
**Objectif.** Activer **Swarm** et créer le **secret**.

**🤔 Le socle d'orchestration.** Passe en Swarm et crée le secret que la stack montera :
:::

:::lang en
**Goal.** Enable **Swarm** and create the **secret**.

**🤔 The orchestration base.** Enter Swarm and create the secret the stack will mount:
:::

```bash
docker swarm init 2>/dev/null || echo "Swarm déjà actif / already active"
printf 'jeton-api-de-prod-a-ne-pas-committer' | docker secret create api_token -
docker secret ls
```

:::lang fr
**✅ Vérification :** `docker secret ls` liste **`api_token`** — le secret est stocké **chiffré** dans le cluster (raft). Il **n'apparaît nulle part** en clair : ni dans le dépôt, ni dans l'image, ni dans une `ENV`. La stack le déclarera `external: true` (créé hors du fichier) et le montera en `/run/secrets/api_token`. Tu as posé le **socle Swarm** et la **gestion du secret** — la façon correcte de livrer un secret à une appli conteneurisée.
:::

:::lang en
**✅ Check:** `docker secret ls` lists **`api_token`** — the secret is stored **encrypted** in the cluster (raft). It appears **nowhere** in cleartext: not in the repo, not in the image, not in an `ENV`. The stack will declare it `external: true` (created outside the file) and mount it at `/run/secrets/api_token`. You've laid the **Swarm base** and the **secret handling** — the correct way to deliver a secret to a containerized app.
:::

### step-04

:::lang fr
**Objectif.** Décrire toute l'appli dans une **stack** : API + Redis + secret + overlay + sécurité.

Crée `stack.yml` — le cœur du livrable :
:::

:::lang en
**Goal.** Describe the whole app in a **stack**: API + Redis + secret + overlay + security.

Create `stack.yml` — the heart of the deliverable:
:::

```yaml
# stack.yml
services:
  api:
    image: localhost:5001/atelier-api:1.0
    ports:
      - "8080:8080"
    secrets:
      - api_token                       # monté en /run/secrets/api_token / mounted at /run/secrets/api_token
    networks:
      - backend
    deploy:
      replicas: 3
      update_config:
        parallelism: 1                  # rolling update : 1 tâche à la fois / 1 task at a time
        delay: 5s
      restart_policy:
        condition: on-failure
      resources:
        limits:
          cpus: "0.50"                  # limites de ressources / resource limits
          memory: 64M

  redis:
    image: redis:7-alpine
    networks:
      - backend
    volumes:
      - redis-data:/data                # tier de données PERSISTANT / PERSISTENT data tier
    deploy:
      replicas: 1

secrets:
  api_token:
    external: true                      # créé au step-03 (docker secret create) / created in step-03

networks:
  backend:
    driver: overlay                     # réseau multi-nœuds / multi-node network

volumes:
  redis-data:
```

:::lang fr
**✅ Vérification :** ton `stack.yml` **décrit** toute l'architecture en un fichier : le service `api` (image du registre, 3 répliques, **secret** monté, **overlay** `backend`, **rolling update** 1-par-1, **limites** de ressources) et le service `redis` (tier de données sur un **volume** persistant). La section **`deploy:`** (spécifique à Swarm) porte la config d'orchestration. C'est le **plan déclaratif** complet — l'équivalent Docker d'un manifeste d'infrastructure. *(Rien n'est encore déployé : c'est l'étape suivante.)*
:::

:::lang en
**✅ Check:** your `stack.yml` **describes** the whole architecture in one file: the `api` service (registry image, 3 replicas, mounted **secret**, `backend` **overlay**, 1-at-a-time **rolling update**, resource **limits**) and the `redis` service (data tier on a persistent **volume**). The **`deploy:`** section (Swarm-specific) carries the orchestration config. It's the complete **declarative plan** — the Docker equivalent of an infrastructure manifest. *(Nothing is deployed yet: that's the next step.)*
:::

### step-05

:::lang fr
**Objectif.** **Déployer** la stack et tout vérifier.

:::

:::lang en
**Goal.** **Deploy** the stack and verify everything.

:::

```bash
docker stack deploy -c stack.yml atelier
docker stack services atelier                 # atelier_api 3/3, atelier_redis 1/1
# attends que l'API soit prête / wait for the API to be ready
for i in $(seq 15); do curl -sf localhost:8080 >/dev/null && break; sleep 2; done
curl -s localhost:8080                         # hôte + "secret: présent (...)" / host + secret present
```

:::lang fr
**✅ Vérification :** `docker stack services atelier` affiche `atelier_api  replicated  3/3` et `atelier_redis  1/1`. `curl localhost:8080` renvoie `Atelier API v1 — hôte atelier_api.X… — secret: présent (36 octets)` : l'API répond via le **routing mesh**, servie par l'une des 3 répliques (le nom d'hôte change d'un appel à l'autre), et elle **lit le secret** monté en `/run/secrets/api_token` (dont elle rapporte la taille, **sans** l'exposer). Toute la chaîne fonctionne : **code → image → registre → stack orchestrée**, avec secret, réplication et tier de données. Tu as un **déploiement de production** miniature, en une commande.
:::

:::lang en
**✅ Check:** `docker stack services atelier` shows `atelier_api  replicated  3/3` and `atelier_redis  1/1`. `curl localhost:8080` returns `Atelier API v1 — hôte atelier_api.X… — secret: présent (36 octets)`: the API answers via the **routing mesh**, served by one of the 3 replicas (the hostname changes between calls), and it **reads the secret** mounted at `/run/secrets/api_token` (reporting its size, **without** exposing it). The whole chain works: **code → image → registry → orchestrated stack**, with secret, replication and a data tier. You have a miniature **production deployment**, in one command.
:::

### step-06

:::lang fr
**Objectif.** **Mettre à jour sans coupure** (rolling update) et savoir **revenir en arrière**.

**🤔 Livrer une v2.** Modifie le message de l'API, reconstruis en `1.1`, pousse, et mets à jour la stack — Swarm bascule les tâches **une à une** :
:::

:::lang en
**Goal.** **Update without downtime** (rolling update) and know how to **roll back**.

**🤔 Ship a v2.** Change the API's message, rebuild as `1.1`, push, and update the stack — Swarm flips the tasks **one by one**:
:::

```bash
sed -i 's/Atelier API v1/Atelier API v2/' main.go        # une "nouvelle version" / a "new version"
docker build -t localhost:5001/atelier-api:1.1 .
docker push localhost:5001/atelier-api:1.1

# mise à jour progressive du service / rolling update of the service
docker service update --image localhost:5001/atelier-api:1.1 atelier_api
curl -s localhost:8080                                    # -> "Atelier API v2 ..."

# rollback : revenir à la 1.0 en un geste / one-gesture rollback to 1.0
docker service rollback atelier_api
curl -s localhost:8080                                    # -> "Atelier API v1 ..."
```

:::lang fr
**✅ Vérification :** après le `service update`, `curl localhost:8080` renvoie **`Atelier API v2`** — Swarm a remplacé les 3 tâches **progressivement** (1 à la fois, 5 s d'écart, comme défini dans `update_config`), **sans** interruption de service. Puis **`docker service rollback`** ramène l'API à **v1** en une commande. C'est le **déploiement sans coupure** et son filet : livrer une nouvelle version par lots, et **annuler** instantanément si quelque chose cloche. Tu tiens le cycle de vie complet d'un service en prod : build → push → update → (rollback).
:::

:::lang en
**✅ Check:** after the `service update`, `curl localhost:8080` returns **`Atelier API v2`** — Swarm replaced the 3 tasks **progressively** (1 at a time, 5s apart, as defined in `update_config`), **without** service interruption. Then **`docker service rollback`** brings the API back to **v1** in one command. That's **zero-downtime deployment** and its safety net: ship a new version in batches, and **undo** instantly if something's wrong. You hold the full lifecycle of a production service: build → push → update → (rollback).
:::

### step-07

:::lang fr
**Objectif.** Documenter — le **runbook** qui fait le livrable de CV.

**🤔 Le README fait la moitié de la valeur.** Crée un `README.md` en suivant ce plan (chaque titre devient une section `##`) :
:::

:::lang en
**Goal.** Document — the **runbook** that makes the CV deliverable.

**🤔 The README is half the value.** Create a `README.md` following this outline (each heading becomes a `##` section):
:::

    # Atelier Média — API conteneurisée sur Swarm
    #
    # De l'image à la stack Swarm sécurisée, en local (DCA).
    #
    # Architecture
    # - image : Dockerfile multi-stage (Go -> Alpine), non-root + HEALTHCHECK
    # - registre : registry:2 sur localhost:5001
    # - stack : api (x3, secret, overlay, limits, rolling update) + redis (volume)
    # - secret : api_token (docker secret, monté en /run/secrets)
    #
    # Déployer
    #   docker build -t localhost:5001/atelier-api:1.0 . && docker push localhost:5001/atelier-api:1.0
    #   docker swarm init
    #   printf '...' | docker secret create api_token -
    #   docker stack deploy -c stack.yml atelier
    #   curl localhost:8080
    #
    # Exploitation
    # - mise à jour : build :1.1 -> push -> docker service update --image ... atelier_api
    # - rollback : docker service rollback atelier_api
    # - état : docker stack services atelier ; docker service ps atelier_api
    #
    # Décisions
    # - multi-stage -> image minuscule ; non-root + HEALTHCHECK -> durcissement
    # - secret Swarm (fichier chiffré) plutôt qu'ENV -> pas de fuite
    # - deploy.update_config -> zéro coupure ; rollback -> filet de sécurité

:::lang fr
**✅ Vérification :** ton dépôt a `main.go`, `Dockerfile`, `stack.yml` et un `README.md` (architecture, déploiement, exploitation, décisions). Ouvre-le comme un recruteur : en deux minutes, comprend-on **ce que fait l'appli, comment la déployer et l'exploiter, et pourquoi tes choix (multi-stage, non-root, secret, rolling update) sont bons** ? Si oui, c'est un livrable **vendable** — pas un tuto suivi, mais un **système décrit et reconstructible**.
:::

:::lang en
**✅ Check:** your repo has `main.go`, `Dockerfile`, `stack.yml` and a `README.md` (architecture, deployment, operations, decisions). Open it like a recruiter: in two minutes, is it clear **what the app does, how to deploy and operate it, and why your choices (multi-stage, non-root, secret, rolling update) are sound**? If so, it's a **sellable** deliverable — not a followed tutorial, but a **described, rebuildable system**.
:::

### step-08

:::lang fr
**Objectif.** Prouver la **reproductibilité**, committer, puis nettoyer.

**🤔 Reconstructible d'un dépôt.** Ta stack se **rejoue** avec `docker stack deploy` (idempotent : Swarm applique le diff). Committe le livrable :
:::

:::lang en
**Goal.** Prove **reproducibility**, commit, then clean up.

**🤔 Rebuildable from a repo.** Your stack **replays** with `docker stack deploy` (idempotent: Swarm applies the diff). Commit the deliverable:
:::

```bash
docker stack deploy -c stack.yml atelier         # re-déploiement idempotent : "no changes" / idempotent redeploy
docker stack services atelier                     # toujours 3/3 + 1/1 / still 3/3 + 1/1

cat > .gitignore <<'EOF'
*.tar
EOF
git config user.email "toi@exemple.fr" && git config user.name "Ton Nom"   # requis sur une machine fraîche / required on a fresh machine
git add . && git commit -m "Atelier API : image multi-stage durcie + stack Swarm sécurisée (secret, overlay, rolling update)"
```

:::lang fr
**✅ Vérification :** un second `docker stack deploy` ne change rien (l'état voulu est déjà atteint) — **reproductible et idempotent**. Le `git commit` fige ton livrable (`main.go`, `Dockerfile`, `stack.yml`, `README.md`). **Pousse le dépôt sur GitHub et mets le lien sur ton CV.**

**🧹 Ménage :**
`docker stack rm atelier ; sleep 3 ; docker secret rm api_token 2>/dev/null ; docker rm -f registry 2>/dev/null ; docker swarm leave --force`.
:::

:::lang en
**✅ Check:** a second `docker stack deploy` changes nothing (the desired state is already reached) — **reproducible and idempotent**. The `git commit` freezes your deliverable (`main.go`, `Dockerfile`, `stack.yml`, `README.md`). **Push the repo to GitHub and put the link on your CV.**

**🧹 Cleanup:**
`docker stack rm atelier ; sleep 3 ; docker secret rm api_token 2>/dev/null ; docker rm -f registry 2>/dev/null ; docker swarm leave --force`.
:::

## pitfalls

:::lang fr
**1. Livrer l'image de build.** Sans multi-stage, tu embarques Go + les sources = image énorme et exposée. Sépare **build** et **runtime**.

**2. Faire tourner l'API en root.** L'image doit poser un **`USER`** non-root. Un service exposé en root = risque d'évasion.

**3. Mettre le secret dans le YAML ou une `ENV`.** Utilise un **secret Swarm** (`external: true` + `docker secret create`), monté en fichier. Ne committe **jamais** le secret.

**4. `deploy:` sous `docker compose up`.** La section `deploy:` n'est honorée que par **`docker stack deploy`** (Swarm), pas par `docker compose up`. Ce projet est une **stack**, pas un `compose up`.

**5. Référencer `localhost:5001` sur un cluster multi-nœuds.** Les workers ne joignent pas ton `localhost`. En mono-nœud c'est OK ; en multi-nœuds, un registre à adresse routable.

**6. Oublier `git config` sur une machine fraîche.** `git commit` échoue sans identité. Configure `user.name`/`user.email` (fait au step-08).

**7. Supprimer la stack en pensant tout nettoyer.** Le **secret**, le **volume** et le **registre** survivent. Nettoie-les explicitement (`docker secret rm`, `docker volume rm`, `docker rm -f registry`).
:::

:::lang en
**1. Shipping the build image.** Without multi-stage, you bundle Go + sources = a huge, exposed image. Separate **build** and **runtime**.

**2. Running the API as root.** The image must set a non-root **`USER`**. An exposed service as root = escape risk.

**3. Putting the secret in the YAML or an `ENV`.** Use a **Swarm secret** (`external: true` + `docker secret create`), mounted as a file. **Never** commit the secret.

**4. `deploy:` under `docker compose up`.** The `deploy:` section is honored only by **`docker stack deploy`** (Swarm), not by `docker compose up`. This project is a **stack**, not a `compose up`.

**5. Referencing `localhost:5001` on a multi-node cluster.** Workers can't reach your `localhost`. Single-node is fine; multi-node needs a routable-address registry.

**6. Forgetting `git config` on a fresh machine.** `git commit` fails without an identity. Configure `user.name`/`user.email` (done in step-08).

**7. Removing the stack thinking it cleans everything.** The **secret**, the **volume** and the **registry** survive. Clean them explicitly (`docker secret rm`, `docker volume rm`, `docker rm -f registry`).
:::

## success

:::lang fr
Ton livrable est prêt pour un CV quand…

- [ ] L'**image** est **multi-stage**, **non-root**, avec un **`HEALTHCHECK`**.
- [ ] L'image est **poussée** dans un **registre** et référencée par la stack.
- [ ] La **stack** déploie l'API **3/3** + Redis (**volume**), sur un **overlay**.
- [ ] Le **secret** est monté en `/run/secrets` (jamais en `ENV`/dépôt).
- [ ] Tu fais un **rolling update** (v2) **et** un **rollback** (v1).
- [ ] `docker stack deploy` est **idempotent** ; le dépôt a un **runbook**.
- [ ] Tu sais **justifier** chaque choix (multi-stage, non-root, secret, update).

Sept cases cochées = tu ne présentes pas un TP, tu présentes une **appli conteneurisée de production**.
:::

:::lang en
Your deliverable is CV-ready when…

- [ ] The **image** is **multi-stage**, **non-root**, with a **`HEALTHCHECK`**.
- [ ] The image is **pushed** to a **registry** and referenced by the stack.
- [ ] The **stack** deploys the API **3/3** + Redis (**volume**), on an **overlay**.
- [ ] The **secret** is mounted at `/run/secrets` (never in `ENV`/repo).
- [ ] You do a **rolling update** (v2) **and** a **rollback** (v1).
- [ ] `docker stack deploy` is **idempotent**; the repo has a **runbook**.
- [ ] You can **justify** every choice (multi-stage, non-root, secret, update).

Seven boxes ticked = you're not presenting a lab, you're presenting a **production containerized app**.
:::

## next

:::lang fr
Tu as bouclé la **track Docker → DCA**, projet compris. Pour aller plus loin :

1. **Passe l'examen** — avec toute la track, tu couvres les six domaines du **DCA**. Entraîne-toi au format QCM chronométré.
2. **Automatise la chaîne** — branche un **pipeline CI/CD** (guide CI/CD) qui build l'image, la scanne, la pousse et déploie la stack à chaque commit.
3. **Passe à Kubernetes** — le même schéma (image → registre → manifeste → cluster) avec l'orchestrateur dominant (track **Kubernetes → CKA**). Tes réflexes conteneurs y sont directement transférables.
:::

:::lang en
You've completed the **Docker → DCA track**, project included. To go further:

1. **Sit the exam** — with the whole track, you cover the six **DCA** domains. Practice in the timed multiple-choice format.
2. **Automate the chain** — wire a **CI/CD pipeline** (CI/CD guide) that builds the image, scans it, pushes it and deploys the stack on every commit.
3. **Move to Kubernetes** — the same scheme (image → registry → manifest → cluster) with the dominant orchestrator (**Kubernetes → CKA** track). Your container reflexes transfer directly.
:::

## cheatsheet

:::lang fr
Aide-mémoire projet stack.
:::

:::lang en
Stack project cheat sheet.
:::

```bash
# Image & registre / image & registry
docker build -t localhost:5001/atelier-api:1.0 .
docker run -d -p 5001:5000 --name registry registry:2
docker push localhost:5001/atelier-api:1.0

# Swarm & secret
docker swarm init
printf 'val' | docker secret create api_token -

# Stack
docker stack deploy -c stack.yml atelier
docker stack services atelier ; docker service ps atelier_api

# Exploitation / operations
docker service update --image localhost:5001/atelier-api:1.1 atelier_api   # rolling update
docker service rollback atelier_api                                         # rollback

# Nettoyage / cleanup
docker stack rm atelier ; sleep 3 ; docker secret rm api_token ; docker rm -f registry ; docker swarm leave --force
```

## resources

:::lang fr
- Les **cinq guides** de la track Docker (chaque étape en approfondit un).
- [Déployer un stack sur Swarm](https://docs.docker.com/engine/swarm/stack-deploy/) et la [référence Compose `deploy`](https://docs.docker.com/reference/compose-file/deploy/).
- [Secrets Swarm](https://docs.docker.com/engine/swarm/secrets/) et [le registre `registry:2`](https://hub.docker.com/_/registry).
- Objectifs **DCA** (les six domaines de l'examen).
:::

:::lang en
- The **five guides** of the Docker track (each step deepens one).
- [Deploy a stack on Swarm](https://docs.docker.com/engine/swarm/stack-deploy/) and the [Compose `deploy` reference](https://docs.docker.com/reference/compose-file/deploy/).
- [Swarm secrets](https://docs.docker.com/engine/swarm/secrets/) and [the `registry:2` registry](https://hub.docker.com/_/registry).
- **DCA** objectives (the exam's six domains).
:::

## troubleshooting

:::lang fr
**Le service `atelier_api` reste en `0/3`.** `docker service ps --no-trunc atelier_api` montre l'erreur. Souvent l'image est introuvable : vérifie le `push` vers `localhost:5001` et le tag exact dans `stack.yml`.

**`no such image` au déploiement.** Le tag du `stack.yml` ne correspond pas à l'image poussée. Aligne `localhost:5001/atelier-api:1.0` (registre + nom + tag).

**`curl localhost:8080` : secret `(absent)`.** Hors Swarm (test du step-01), c'est normal. Dans la stack, si le secret est absent, vérifie `docker secret ls` et la section `secrets:` du service dans `stack.yml`.

**Le `HEALTHCHECK` échoue (`unhealthy`).** L'API n'écoute pas encore, ou `wget` manque. Alpine a busybox `wget` ; laisse un `--interval`/`--timeout` raisonnable et un endpoint `/health` qui répond vite.

**`docker service update` ne bascule pas.** Le nouveau tag n'est pas poussé, ou identique à l'ancien. Reconstruis et **pousse** la nouvelle version, puis update avec le **bon** tag.

**`docker stack rm` puis `docker network`/`secret rm` : « in use ».** La suppression de la stack est **asynchrone**. Attends quelques secondes (`sleep`) avant de retirer secret/réseau/volume.
:::

:::lang en
**The `atelier_api` service stays at `0/3`.** `docker service ps --no-trunc atelier_api` shows the error. Often the image isn't found: check the `push` to `localhost:5001` and the exact tag in `stack.yml`.

**`no such image` on deploy.** The `stack.yml` tag doesn't match the pushed image. Align `localhost:5001/atelier-api:1.0` (registry + name + tag).

**`curl localhost:8080`: secret `(absent)`.** Outside Swarm (step-01 test), that's normal. In the stack, if the secret is missing, check `docker secret ls` and the service's `secrets:` section in `stack.yml`.

**The `HEALTHCHECK` fails (`unhealthy`).** The API isn't listening yet, or `wget` is missing. Alpine has busybox `wget`; keep a reasonable `--interval`/`--timeout` and a `/health` endpoint that answers fast.

**`docker service update` doesn't flip.** The new tag isn't pushed, or is identical to the old. Rebuild and **push** the new version, then update with the **right** tag.

**`docker stack rm` then `docker network`/`secret rm`: "in use".** Stack removal is **asynchronous**. Wait a few seconds (`sleep`) before removing secret/network/volume.
:::
