---
# — Identité (ne change JAMAIS une fois publié) —
id: kubernetes-projet-entreprise
slug: kubernetes-projet-entreprise
order: 18
status: published

# — Titres & accroches (bilingue) —
title_fr: "Kubernetes — projet d'entreprise : appli multi-tier"
title_en: "Kubernetes — enterprise project: multi-tier app"
tagline_fr: "Ingress, config, secret, PVC, probes, HPA — un livrable de CV."
tagline_en: "Ingress, config, secret, PVC, probes, HPA — a CV deliverable."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 320
repo: "kubernetes/kubernetes"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [kubernetes-cluster-ops-rbac]
next: [traefik]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [architecture-multi-tier, ingress, configmap-secret, pvc-donnees, probes, hpa-autoscaling, networkpolicy, livrable-portfolio]
concepts_en: [multi-tier-architecture, ingress, configmap-secret, data-pvc, probes, hpa-autoscaling, networkpolicy, portfolio-deliverable]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le projet fil-rouge Kubernetes : déploie une application multi-tier (front Ingress, app podinfo, cache Redis persistant) avec ConfigMap/Secret, PVC, probes, autoscaling HPA et NetworkPolicy — entièrement en local sur k3d, dans un dépôt documenté. Le livrable Kubernetes à présenter sur ton CV."
og_description_en: "The Kubernetes capstone project: deploy a multi-tier application (Ingress front, podinfo app, persistent Redis cache) with ConfigMap/Secret, PVC, probes, HPA autoscaling and NetworkPolicy — entirely locally on k3d, in a documented repo. The Kubernetes deliverable for your CV."
---

## intro

:::lang fr
Tu as appris les briques Kubernetes une par une : workloads, services, ingress, stockage, RBAC. **Un recruteur veut voir l'assemblage.** Ce projet est cet assemblage : une **application multi-tier** déployée sur Kubernetes comme en entreprise, que tu construis de A à Z et que tu mets sur ton CV et ton GitHub.

**Le scénario.** Tu es l'ingénieur DevOps qui doit mettre en ligne une application web à trois étages :

- un **front** exposé au public via un **Ingress** (une seule porte d'entrée HTTP) ;
- une **application** (`podinfo`, un microservice réaliste avec endpoints de santé) déployée en plusieurs répliques, **configurée** par ConfigMap/Secret, protégée par des **probes**, et qui **s'autoscale** sous charge (**HPA**) ;
- un **cache de données** (`Redis`) **persistant** sur un **PVC**, isolé par une **NetworkPolicy** pour que **seule** l'application puisse lui parler.

Tout tourne en **local sur k3d**, à partir d'**images publiques** (zéro build, zéro cloud) — mais l'architecture et les objets Kubernetes sont **exactement** ceux d'un déploiement de production. Le jour où tu passes sur un vrai cluster (EKS/AKS/GKE), tes manifestes **ne changent pas**.

**Ce que ce projet prouve à un recruteur :** que tu sais assembler un déploiement Kubernetes **complet et réaliste** — pas juste `kubectl run nginx` — avec exposition, configuration, secrets, stockage persistant, santé, autoscaling et sécurité réseau, le tout **documenté**.

**Pour qui c'est :** tu as terminé les cinq guides Kubernetes de la track.
:::

:::lang en
You've learned the Kubernetes bricks one by one: workloads, services, ingress, storage, RBAC. **A recruiter wants to see the assembly.** This project is that assembly: a **multi-tier application** deployed on Kubernetes like in a company, that you build end to end and put on your CV and GitHub.

**The scenario.** You're the DevOps engineer who must bring a three-tier web application online:

- a **front** exposed publicly via an **Ingress** (a single HTTP entry point);
- an **application** (`podinfo`, a realistic microservice with health endpoints) deployed in several replicas, **configured** by ConfigMap/Secret, guarded by **probes**, and that **autoscales** under load (**HPA**);
- a **data cache** (`Redis`) **persisted** on a **PVC**, isolated by a **NetworkPolicy** so that **only** the application can talk to it.

Everything runs **locally on k3d**, from **public images** (no build, no cloud) — but the architecture and Kubernetes objects are **exactly** those of a production deployment. The day you move to a real cluster (EKS/AKS/GKE), your manifests **don't change**.

**What this project proves to a recruiter:** that you can assemble a **complete, realistic** Kubernetes deployment — not just `kubectl run nginx` — with exposure, configuration, secrets, persistent storage, health, autoscaling and network security, all **documented**.

**Who it's for:** you've finished the five Kubernetes guides of the track.
:::

## objectives

:::lang fr
À la fin de ce projet, tu auras produit et su expliquer :

- Un **dépôt de manifestes** structuré, appliqué en une commande.
- Un **tier de données** Redis **persistant** (PVC) avec son Service.
- La **configuration** applicative en **ConfigMap** + **Secret**.
- Un **tier applicatif** podinfo : réplicas, **probes**, requests/limits, config injectée, cache branché sur Redis.
- Une **exposition** via **Ingress** (une porte d'entrée).
- Un **autoscaling HPA** qui **réagit à la charge** sous tes yeux.
- Une **NetworkPolicy** qui **isole** Redis derrière l'application.
- Un **README** + **schéma** de niveau professionnel, prêts pour un CV.
:::

:::lang en
By the end of this project, you'll have produced and be able to explain:

- A structured **manifest repo**, applied in one command.
- A **persistent** Redis **data tier** (PVC) with its Service.
- Application **configuration** in a **ConfigMap** + **Secret**.
- A podinfo **app tier**: replicas, **probes**, requests/limits, injected config, cache wired to Redis.
- **Exposure** via **Ingress** (one entry point).
- An **HPA autoscaling** that **reacts to load** before your eyes.
- A **NetworkPolicy** that **isolates** Redis behind the application.
- A professional-grade **README** + **diagram**, CV-ready.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- **Toute la track Kubernetes** terminée (fondamentaux → cluster ops & RBAC).
- **Docker** lancé, **k3d** et **kubectl** installés, **Git** installé.
- ~2-3 h et un peu de RAM.

On crée un cluster **avec Ingress Controller** (Traefik) et le port hôte pour le front. Le cluster embarque **metrics-server** (nécessaire au HPA) :
:::

:::lang en
You should have:

- **The whole Kubernetes track** finished (fundamentals → cluster ops & RBAC).
- **Docker** running, **k3d** and **kubectl** installed, **Git** installed.
- ~2-3 h and a bit of RAM.

We create a cluster **with an Ingress Controller** (Traefik) and the host port for the front. The cluster ships **metrics-server** (needed for the HPA):
:::

```bash
# (optionnel) libère de la RAM / (optional) free RAM
# k3d cluster delete opslab stolab netlab ckalab
k3d cluster create shoplab -p "8080:80@loadbalancer"
mkdir shop-platform && cd shop-platform && git init
mkdir k8s
kubectl create namespace shop
kubectl config set-context --current --namespace=shop
```

## concepts

:::lang fr
**L'architecture cible : trois étages.** C'est le motif le plus courant en entreprise.

1. **Le tier de présentation** — ici l'**Ingress** (Traefik) : le point d'entrée HTTP unique, qui route le trafic public vers l'application. En prod, il porterait TLS et le nom de domaine.
2. **Le tier applicatif** — `podinfo`, un microservice **stateless** déployé en **plusieurs répliques** derrière un Service. Stateless = on peut le multiplier librement → c'est lui qu'on **autoscale** (HPA). Il lit sa **config** (ConfigMap) et ses **secrets** (Secret), et il utilise le tier de données.
3. **Le tier de données** — `Redis`, **stateful** : sa donnée doit survivre, d'où un **PVC**. On n'en met **pas** dix répliques anonymes (ce serait dix caches incohérents) : le tier de données se gère différemment du tier applicatif.

**Les objets Kubernetes qu'on assemble :**

- **`Deployment`** (×2 : app et données) + **`Service`** ClusterIP pour chaque tier (adresse stable interne).
- **`Ingress`** devant le Service de l'app (exposition L7).
- **`ConfigMap`** (config non sensible) + **`Secret`** (données sensibles) → injectés en variables d'environnement.
- **`PersistentVolumeClaim`** pour Redis (persistance).
- **`livenessProbe`/`readinessProbe`** sur l'app (santé) + **requests/limits** (indispensables au HPA).
- **`HorizontalPodAutoscaler`** sur l'app : ajoute/retire des répliques selon le **CPU**.
- **`NetworkPolicy`** : Redis n'accepte **que** le trafic de l'app.

**Le fil rouge de la donnée.** L'utilisateur tape l'**Ingress** → l'app **podinfo** répond, et quand elle met en cache une valeur, elle l'écrit dans **Redis** via le Service `redis`. C'est un vrai flux **multi-tier** : présentation → application → données.
:::

:::lang en
**The target architecture: three tiers.** It's the most common enterprise pattern.

1. **The presentation tier** — here the **Ingress** (Traefik): the single HTTP entry point that routes public traffic to the application. In prod it'd carry TLS and the domain name.
2. **The application tier** — `podinfo`, a **stateless** microservice deployed in **several replicas** behind a Service. Stateless = you can multiply it freely → this is what you **autoscale** (HPA). It reads its **config** (ConfigMap) and its **secrets** (Secret), and it uses the data tier.
3. **The data tier** — `Redis`, **stateful**: its data must survive, hence a **PVC**. You do **not** run ten anonymous replicas of it (that'd be ten incoherent caches): the data tier is managed differently from the app tier.

**The Kubernetes objects we assemble:**

- **`Deployment`** (×2: app and data) + a **`Service`** ClusterIP per tier (stable internal address).
- **`Ingress`** in front of the app's Service (L7 exposure).
- **`ConfigMap`** (non-sensitive config) + **`Secret`** (sensitive data) → injected as environment variables.
- **`PersistentVolumeClaim`** for Redis (persistence).
- **`livenessProbe`/`readinessProbe`** on the app (health) + **requests/limits** (essential for the HPA).
- **`HorizontalPodAutoscaler`** on the app: adds/removes replicas based on **CPU**.
- **`NetworkPolicy`**: Redis accepts **only** the app's traffic.

**The data thread.** The user hits the **Ingress** → the **podinfo** app answers, and when it caches a value it writes it to **Redis** via the `redis` Service. It's a real **multi-tier** flow: presentation → application → data.
:::

:::figure kubernetes-projet-tiers
caption_fr: "Schéma 1. Ingress → Service app → podinfo (×N, HPA) → Service redis → Redis (PVC). ConfigMap/Secret alimentent l'app ; une NetworkPolicy isole Redis."
caption_en: "Figure 1. Ingress → app Service → podinfo (×N, HPA) → redis Service → Redis (PVC). ConfigMap/Secret feed the app; a NetworkPolicy isolates Redis."
:::

:::lang fr
Le plan : tier données (Redis + PVC) → config (ConfigMap/Secret) → tier app (podinfo + probes) → Ingress → HPA sous charge → NetworkPolicy → documentation & démo.
:::

:::lang en
The plan: data tier (Redis + PVC) → config (ConfigMap/Secret) → app tier (podinfo + probes) → Ingress → HPA under load → NetworkPolicy → docs & demo.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Déployer le **tier de données** : Redis, **persistant** sur un PVC, avec son Service.

Crée `k8s/redis.yaml` :
:::

:::lang en
**Goal.** Deploy the **data tier**: Redis, **persisted** on a PVC, with its Service.

Create `k8s/redis.yaml`:
:::

```yaml
# k8s/redis.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-data
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
spec:
  replicas: 1
  selector:
    matchLabels: { app: redis }
  template:
    metadata:
      labels: { app: redis }
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports: [{ containerPort: 6379 }]
          resources:
            requests: { cpu: "50m", memory: "64Mi" }
            limits:   { cpu: "200m", memory: "128Mi" }
          volumeMounts:
            - name: data
              mountPath: /data
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: redis-data
---
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  selector: { app: redis }
  ports:
    - port: 6379
      targetPort: 6379
```

```bash
kubectl apply -f k8s/redis.yaml
kubectl rollout status deployment/redis
kubectl get pvc redis-data           # Bound (le pod a déclenché le provisioning) / Bound
```

:::lang fr
**✅ Vérification :** `kubectl rollout status deployment/redis` confirme `successfully rolled out`, et `kubectl get pvc redis-data` est **`Bound`** (le pod Redis a été le premier consommateur → PV provisionné, cf. guide stockage). Le Service `redis` donne au tier de données une **adresse stable** (`redis:6379`) que l'app utilisera. Le tier de données est en place, isolé et persistant.
:::

:::lang en
**✅ Check:** `kubectl rollout status deployment/redis` confirms `successfully rolled out`, and `kubectl get pvc redis-data` is **`Bound`** (the Redis pod was the first consumer → PV provisioned, see the storage guide). The `redis` Service gives the data tier a **stable address** (`redis:6379`) the app will use. The data tier is in place, isolated and persistent.
:::

### step-02

:::lang fr
**Objectif.** Externaliser la **configuration** : un **ConfigMap** (non sensible) et un **Secret** (sensible).

**🤔 Config ≠ image.** On ne code jamais un message ou un mot de passe dans l'image. Crée `k8s/config.yaml` :
:::

:::lang en
**Goal.** Externalize the **configuration**: a **ConfigMap** (non-sensitive) and a **Secret** (sensitive).

**🤔 Config ≠ image.** You never bake a message or a password into the image. Create `k8s/config.yaml`:
:::

```yaml
# k8s/config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  PODINFO_UI_MESSAGE: "Shop Platform — déployé sur Kubernetes"
  PODINFO_CACHE_SERVER: "tcp://redis:6379"      # <- branche l'app sur le tier Redis / wires the app to Redis
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:
  API_TOKEN: "démo-token-ne-pas-utiliser-en-prod"   # stringData : en clair ici, encodé par k8s / plaintext here, k8s encodes it
```

```bash
kubectl apply -f k8s/config.yaml
kubectl get configmap app-config
kubectl get secret app-secret         # TYPE Opaque, DATA 1
```

:::lang fr
**✅ Vérification :** `kubectl get configmap app-config` et `kubectl get secret app-secret` existent. Le ConfigMap porte le message d'UI **et** l'adresse du cache Redis (`tcp://redis:6379`) — c'est par là que les deux tiers se connectent. Le Secret contient l'`API_TOKEN` (`kubectl get secret app-secret -o jsonpath='{.data.API_TOKEN}' | base64 -d` le décode). **La config vit hors de l'image**, versionnable et modifiable sans reconstruire quoi que ce soit.
:::

:::lang en
**✅ Check:** `kubectl get configmap app-config` and `kubectl get secret app-secret` exist. The ConfigMap carries the UI message **and** the Redis cache address (`tcp://redis:6379`) — that's how the two tiers connect. The Secret holds the `API_TOKEN` (`kubectl get secret app-secret -o jsonpath='{.data.API_TOKEN}' | base64 -d` decodes it). **Config lives outside the image**, versionable and changeable without rebuilding anything.
:::

### step-03

:::lang fr
**Objectif.** Déployer le **tier applicatif** : `podinfo`, avec **probes**, **requests/limits**, et config injectée.

**🤔 Tout est là.** Ce manifeste réunit le guide workloads (probes, resources), le guide config (ConfigMap/Secret → env) et le guide networking (Service). Crée `k8s/app.yaml` :
:::

:::lang en
**Goal.** Deploy the **application tier**: `podinfo`, with **probes**, **requests/limits**, and injected config.

**🤔 It all comes together.** This manifest combines the workloads guide (probes, resources), the config guide (ConfigMap/Secret → env) and the networking guide (Service). Create `k8s/app.yaml`:
:::

```yaml
# k8s/app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 2
  selector:
    matchLabels: { app: podinfo }
  template:
    metadata:
      labels: { app: podinfo }
    spec:
      containers:
        - name: podinfo
          image: ghcr.io/stefanprodan/podinfo:6.7.0
          ports: [{ containerPort: 9898 }]
          envFrom:
            - configMapRef: { name: app-config }   # PODINFO_UI_MESSAGE, PODINFO_CACHE_SERVER
          env:
            - name: API_TOKEN
              valueFrom:
                secretKeyRef: { name: app-secret, key: API_TOKEN }
          resources:
            requests: { cpu: "25m", memory: "32Mi" }   # requests bas -> le HPA réagit vite / low requests -> HPA reacts fast
            limits:   { cpu: "200m", memory: "128Mi" }
          readinessProbe:
            httpGet: { path: /readyz, port: 9898 }
            initialDelaySeconds: 2
          livenessProbe:
            httpGet: { path: /healthz, port: 9898 }
            initialDelaySeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: app
spec:
  selector: { app: podinfo }
  ports:
    - port: 80
      targetPort: 9898
```

```bash
kubectl apply -f k8s/app.yaml
kubectl rollout status deployment/app
kubectl get pods -l app=podinfo        # 2 pods READY 1/1 / two ready pods
```

:::lang fr
**✅ Vérification :** `kubectl rollout status deployment/app` réussit et deux pods `app-…` sont `READY 1/1` — leurs **readiness probes** (`/readyz`) passent, donc le Service `app` les intègre. Vérifie que la config est injectée : `kubectl exec deploy/app -- env | grep -E 'PODINFO_UI_MESSAGE|API_TOKEN'` montre le message (du ConfigMap) et le token (du Secret). Le tier applicatif tourne, configuré et surveillé.
:::

:::lang en
**✅ Check:** `kubectl rollout status deployment/app` succeeds and two `app-…` pods are `READY 1/1` — their **readiness probes** (`/readyz`) pass, so the `app` Service includes them. Verify the config is injected: `kubectl exec deploy/app -- env | grep -E 'PODINFO_UI_MESSAGE|API_TOKEN'` shows the message (from the ConfigMap) and the token (from the Secret). The app tier runs, configured and monitored.
:::

### step-04

:::lang fr
**Objectif.** Exposer l'application au public via un **Ingress**, et prouver le **flux multi-tier** (app → Redis).

Crée `k8s/ingress.yaml` :
:::

:::lang en
**Goal.** Expose the application publicly via an **Ingress**, and prove the **multi-tier flow** (app → Redis).

Create `k8s/ingress.yaml`:
:::

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop
spec:
  ingressClassName: traefik
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app
                port:
                  number: 80
```

```bash
kubectl apply -f k8s/ingress.yaml
curl -s localhost:8080/ | grep -i message      # le message du ConfigMap / the ConfigMap message

# Flux multi-tier : l'app écrit dans Redis via le cache / multi-tier flow: app writes to Redis
curl -s -X POST localhost:8080/cache/demo -d 'hello-k8s'
curl -s localhost:8080/cache/demo               # -> hello-k8s (relu depuis Redis) / read back from Redis
```

:::lang fr
**✅ Vérification :** `curl localhost:8080/` renvoie la réponse JSON de podinfo, avec le **message du ConfigMap** — la chaîne **Ingress → Service → pod** fonctionne de bout en bout. Mieux : le `POST /cache/demo` puis `GET /cache/demo` renvoie `hello-k8s` — l'application a **écrit puis relu dans Redis** (via `PODINFO_CACHE_SERVER`). Tu viens de valider le **flux des trois tiers** : présentation (Ingress) → application (podinfo) → données (Redis). *(La donnée est dans le PVC : elle survivrait à un redémarrage de Redis.)*
:::

:::lang en
**✅ Check:** `curl localhost:8080/` returns podinfo's JSON response, with the **ConfigMap message** — the **Ingress → Service → pod** chain works end to end. Better: the `POST /cache/demo` then `GET /cache/demo` returns `hello-k8s` — the application **wrote then read back from Redis** (via `PODINFO_CACHE_SERVER`). You've just validated the **three-tier flow**: presentation (Ingress) → application (podinfo) → data (Redis). *(The data is in the PVC: it would survive a Redis restart.)*
:::

### step-05

:::lang fr
**Objectif.** Ajouter un **HPA** et le voir **autoscaler** l'app sous charge.

**🤔 Pourquoi ça marche ici.** Le HPA a besoin de **metrics-server** (présent sur k3s) et de **requests CPU** sur les pods (on a mis `25m`). On cible 50 % → dès que la charge dépasse ~12m CPU par pod, il ajoute des répliques. Il faut une charge **soutenue et parallèle** pour dépasser franchement ce seuil (une seule boucle séquentielle est trop juste) — d'où les 8 boucles ci-dessous.

**🤔 `replicas` et HPA.** Notre `app.yaml` fixe `replicas: 2`, ce qui a servi aux étapes 3-4 (avant le HPA). En prod, sur un Deployment **piloté par un HPA**, on **retire** le champ `replicas` du manifeste (sinon un `apply` peut brièvement se disputer le compte avec l'autoscaler). Ici on le garde car `minReplicas: 2` = même valeur au repos, donc pas de conflit tant que la charge est nulle. Crée `k8s/hpa.yaml` :
:::

:::lang en
**Goal.** Add an **HPA** and watch it **autoscale** the app under load.

**🤔 Why it works here.** The HPA needs **metrics-server** (present on k3s) and **CPU requests** on the pods (we set `25m`). We target 50% → as soon as load exceeds ~12m CPU per pod, it adds replicas. Create `k8s/hpa.yaml`:
:::

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  minReplicas: 2
  maxReplicas: 6
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
```

```bash
kubectl apply -f k8s/hpa.yaml
kubectl get hpa app                     # attends que TARGETS affiche un % (pas <unknown>) / wait for a % in TARGETS

# Génère de la charge PARALLÈLE (8 boucles simultanées) pour dépasser franchement le seuil
# generate PARALLEL load (8 concurrent loops) to clearly exceed the threshold — leave it running
kubectl run load --image=busybox:1.36 --restart=Never -- /bin/sh -c \
  "for i in 1 2 3 4 5 6 7 8; do (while true; do wget -q -O- http://app/ >/dev/null; done) & done; wait"

# Observe la montée en répliques (~1-3 min) / watch replicas climb (~1-3 min)
kubectl get hpa app -w
```

:::lang fr
**✅ Vérification :** au début, `kubectl get hpa app` montre `REPLICAS 2`. Après ~1-3 min de charge parallèle (le temps que metrics-server mesure et que le HPA réconcilie), la colonne `TARGETS` dépasse `50%` et `REPLICAS` **grimpe** (3, 4… et jusqu'à 6 si la charge est assez soutenue) — `kubectl get pods -l app=podinfo` confirme les nouveaux pods. **Arrête la charge** (`kubectl delete pod load`) : après quelques minutes (fenêtre de stabilisation anti-oscillation), le HPA **redescend** à 2. Tu as une appli qui **s'adapte à la demande**, automatiquement. C'est un argument d'entretien en or.
:::

:::lang en
**✅ Check:** at first, `kubectl get hpa app` shows `REPLICAS 2`. After ~1-3 min of parallel load (time for metrics-server to measure and the HPA to reconcile), the `TARGETS` column exceeds `50%` and `REPLICAS` **climbs** (3, 4… and up to 6 if the load is sustained enough) — `kubectl get pods -l app=podinfo` confirms the new pods. **Stop the load** (`kubectl delete pod load`): after a few minutes (anti-flapping stabilization window), the HPA **scales back** to 2. You have an app that **adapts to demand**, automatically. That's a golden interview argument.
:::

### step-06

:::lang fr
**Objectif.** **Isoler** le tier de données : une **NetworkPolicy** pour que Redis n'accepte **que** l'application.

**🤔 Défense en profondeur.** Aujourd'hui, n'importe quel pod peut joindre Redis. On restreint : seul un pod labellisé `app: podinfo` peut entrer sur le port 6379. Crée `k8s/netpol.yaml` :
:::

:::lang en
**Goal.** **Isolate** the data tier: a **NetworkPolicy** so Redis accepts **only** the application.

**🤔 Defense in depth.** Today, any pod can reach Redis. We restrict: only a pod labeled `app: podinfo` may enter on port 6379. Create `k8s/netpol.yaml`:
:::

```yaml
# k8s/netpol.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: redis-only-from-app
spec:
  podSelector:
    matchLabels: { app: redis }
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector:
            matchLabels: { app: podinfo }
      ports:
        - protocol: TCP
          port: 6379
```

```bash
kubectl apply -f k8s/netpol.yaml

# L'app (label app=podinfo) atteint toujours Redis / the app still reaches Redis :
curl -s -X POST localhost:8080/cache/check -d 'ok' && curl -s localhost:8080/cache/check   # ok

# Un pod QUELCONQUE est bloqué / a RANDOM pod is blocked :
kubectl run intrus --image=redis:7-alpine --restart=Never -it --rm -- \
  redis-cli -h redis -t 5 ping || echo "BLOQUÉ (attendu) / BLOCKED (expected)"
```

:::lang fr
**✅ Vérification :** l'application continue de lire/écrire dans Redis (le `POST/GET /cache/check` renvoie `ok`) — parce que ses pods portent `app: podinfo`, la source autorisée. En revanche, le pod `intrus` (sans ce label) **timeoute** sur `redis-cli ping` → `BLOQUÉ`. Le tier de données est **cloisonné** : même à l'intérieur du cluster, seul l'app y accède. C'est de la **défense en profondeur**, appliquée pour de vrai par k3s. *(Rappel du guide networking : k3s applique les NetworkPolicy.)*
:::

:::lang en
**✅ Check:** the application keeps reading/writing to Redis (the `POST/GET /cache/check` returns `ok`) — because its pods carry `app: podinfo`, the allowed source. But the `intrus` pod (without that label) **times out** on `redis-cli ping` → `BLOCKED`. The data tier is **partitioned**: even inside the cluster, only the app reaches it. That's **defense in depth**, actually enforced by k3s. *(Reminder from the networking guide: k3s enforces NetworkPolicies.)*
:::

### step-07

:::lang fr
**Objectif.** Documenter — la partie qui transforme un dossier de manifestes en **livrable de CV**.

**🤔 Le README fait la moitié de la valeur.** Crée un `README.md` à la racine en suivant ce plan (chaque titre devient une section `##`) :
:::

:::lang en
**Goal.** Document — the part that turns a manifest folder into a **CV deliverable**.

**🤔 The README is half the value.** Create a root `README.md` following this outline (each heading becomes a `##` section):
:::

    # Shop Platform — appli multi-tier sur Kubernetes
    #
    # Déploiement Kubernetes d'une application 3-tiers, en local via k3d.
    #
    # Architecture
    # - Ingress (Traefik)     : porte d'entrée HTTP unique
    # - app (podinfo x2->6)    : microservice stateless, probes, HPA, config
    # - redis (+ PVC)          : cache persistant, isolé par NetworkPolicy
    # - [schéma : voir architecture.md]
    #
    # Objets Kubernetes
    # - Deployment x2, Service x2, Ingress
    # - ConfigMap + Secret (config injectée en env)
    # - PersistentVolumeClaim (données Redis)
    # - liveness/readiness probes + requests/limits
    # - HorizontalPodAutoscaler (CPU 50%, 2->6)
    # - NetworkPolicy (Redis <- app uniquement)
    #
    # Déployer
    #   k3d cluster create shoplab -p "8080:80@loadbalancer"
    #   kubectl create namespace shop && kubectl config set-context --current --namespace=shop
    #   kubectl apply -f k8s/
    #   curl localhost:8080/
    #
    # Décisions
    # - app stateless -> répliqué + autoscalé ; redis stateful -> PVC, non répliqué
    # - config hors image (ConfigMap/Secret) -> modifiable sans rebuild
    # - NetworkPolicy -> moindre privilège réseau (défense en profondeur)

:::lang fr
Ajoute un `architecture.md` avec un **schéma Mermaid** (colle ce contenu dans un bloc ` ```mermaid ` ; ici en retrait pour l'affichage) :
:::

:::lang en
Add an `architecture.md` with a **Mermaid diagram** (paste this into a ` ```mermaid ` block; shown indented here for display):
:::

    graph LR
      U[Utilisateur] --> I[Ingress Traefik :8080]
      I --> S1[Service app :80]
      S1 --> A[podinfo x2..6 + HPA]
      A --> S2[Service redis :6379]
      S2 --> R[(Redis + PVC)]
      CM[ConfigMap] -.-> A
      SEC[Secret] -.-> A
      NP[NetworkPolicy] -.->|Redis <- app only| R

:::lang fr
**✅ Vérification :** ton dépôt a un `README.md` (quoi, pourquoi, comment déployer) et un `architecture.md` (le schéma). Ouvre-les comme un recruteur : en deux minutes, comprend-on **l'architecture, les objets Kubernetes utilisés, et pourquoi tes choix sont bons** ? Si oui, c'est vendable.
:::

:::lang en
**✅ Check:** your repo has a `README.md` (what, why, how to deploy) and an `architecture.md` (the diagram). Open them like a recruiter: in two minutes, is the **architecture, the Kubernetes objects used, and why your choices are sound** clear? If so, it's sellable.
:::

### step-08

:::lang fr
**Objectif.** Prouver la reproductibilité en **une commande**, committer, puis nettoyer.

**🤔 Le test qui rassure.** Tout ton déploiement doit se rejouer avec `kubectl apply -f k8s/`. Vérifie-le, puis committe :
:::

:::lang en
**Goal.** Prove reproducibility in **one command**, commit, then clean up.

**🤔 The reassuring test.** Your whole deployment must replay with `kubectl apply -f k8s/`. Verify it, then commit:
:::

```bash
kubectl apply -f k8s/            # idempotent : "unchanged" partout / idempotent: "unchanged" everywhere
kubectl get all,ingress,pvc,hpa,networkpolicy      # l'inventaire complet du projet / the full project inventory

cat > .gitignore <<'EOF'
*.tmp
EOF
git add .
git commit -m "Shop Platform : appli multi-tier Kubernetes (ingress, config, PVC, HPA, netpol)"
```

:::lang fr
Nettoyage — supprime tout d'un coup grâce au **namespace** :
:::

:::lang en
Cleanup — delete everything at once thanks to the **namespace**:
:::

```bash
kubectl delete namespace shop      # supprime tous les objets du projet / deletes all project objects
# k3d cluster delete shoplab       # (optionnel) supprime le cluster / (optional) delete the cluster
```

:::lang fr
**✅ Vérification :** un second `kubectl apply -f k8s/` affiche `unchanged` pour chaque objet = déploiement **reproductible et idempotent**. `kubectl get all,ingress,pvc,hpa,networkpolicy` liste l'inventaire complet (2 Deployments, 2 Services, Ingress, PVC, HPA, NetworkPolicy) — la preuve visuelle de ton assemblage. Ton dépôt Git, lui, reste : **pousse-le sur GitHub et mets le lien sur ton CV**. Supprimer le **namespace** emporte tout proprement (un seul geste).
:::

:::lang en
**✅ Check:** a second `kubectl apply -f k8s/` prints `unchanged` for each object = a **reproducible, idempotent** deployment. `kubectl get all,ingress,pvc,hpa,networkpolicy` lists the full inventory (2 Deployments, 2 Services, Ingress, PVC, HPA, NetworkPolicy) — the visual proof of your assembly. Your Git repo stays: **push it to GitHub and put the link on your CV**. Deleting the **namespace** takes everything down cleanly (one gesture).
:::

## pitfalls

:::lang fr
**1. HPA en `<unknown>` pour les TARGETS.** Deux causes : metrics-server pas encore prêt (~1 min après création du cluster), ou **pas de requests CPU** sur les pods. Sans `resources.requests.cpu`, le HPA **ne peut pas** calculer un pourcentage.

**2. Attendre un scale-up instantané.** Le HPA réconcilie toutes les ~15 s et lisse les mesures ; la montée prend **1-3 min**, la descente **plus** (fenêtre de stabilisation ~5 min). C'est normal, pas un bug.

**3. Ingress en 404.** `ingressClassName: traefik` manquant/incorrect, ou le Service `app` sans Endpoints (readiness KO). Vérifie `kubectl get ingress`, `kubectl get endpoints app`.

**4. Secret « en clair » dans Git.** `stringData` est pratique en démo mais le Secret **n'est encodé qu'en base64**, pas chiffré. Ne committe **jamais** un vrai secret ; en prod → Secret chiffré au repos, SealedSecrets, ou un gestionnaire externe (Vault).

**5. Répliquer le tier de données comme l'app.** Mettre `replicas: 3` sur Redis simple = trois caches **indépendants** et incohérents. Le stateful se traite avec PVC + (souvent) StatefulSet, pas comme un Deployment stateless.

**6. NetworkPolicy qui bloque aussi l'app.** Si tu te trompes de label dans `from.podSelector`, tu bloques **tout le monde**, y compris podinfo. Teste **toujours** que la source légitime passe encore.

**7. Probes trop agressives sur podinfo.** Une liveness sur `/healthz` avec un délai trop court peut tuer le pod au démarrage. Garde un `initialDelaySeconds` raisonnable (fait ici).
:::

:::lang en
**1. HPA `<unknown>` for TARGETS.** Two causes: metrics-server not ready yet (~1 min after cluster creation), or **no CPU requests** on the pods. Without `resources.requests.cpu`, the HPA **can't** compute a percentage.

**2. Expecting an instant scale-up.** The HPA reconciles every ~15 s and smooths measurements; scale-up takes **1-3 min**, scale-down **more** (~5 min stabilization window). That's normal, not a bug.

**3. Ingress 404.** Missing/wrong `ingressClassName: traefik`, or the `app` Service without Endpoints (readiness failing). Check `kubectl get ingress`, `kubectl get endpoints app`.

**4. "Cleartext" Secret in Git.** `stringData` is handy in a demo but the Secret is **only base64-encoded**, not encrypted. **Never** commit a real secret; in prod → Secret encrypted at rest, SealedSecrets, or an external manager (Vault).

**5. Replicating the data tier like the app.** Setting `replicas: 3` on plain Redis = three **independent**, incoherent caches. Stateful is handled with a PVC + (often) a StatefulSet, not like a stateless Deployment.

**6. A NetworkPolicy that also blocks the app.** If you get the label wrong in `from.podSelector`, you block **everyone**, including podinfo. **Always** test that the legitimate source still gets through.

**7. Overly aggressive probes on podinfo.** A liveness on `/healthz` with too short a delay can kill the pod at startup. Keep a reasonable `initialDelaySeconds` (done here).
:::

## success

:::lang fr
Ton livrable est prêt pour un CV quand…

- [ ] `kubectl apply -f k8s/` déploie **toute** la plateforme, idempotent.
- [ ] Le **tier données** Redis est **persistant** (PVC `Bound`) et **isolé** (NetworkPolicy).
- [ ] L'**app** lit sa **config** (ConfigMap) et son **secret**, avec **probes** actives.
- [ ] L'**Ingress** sert l'app, et le **flux app → Redis** est prouvé (`/cache`).
- [ ] Le **HPA** monte **et** redescend sous/sans charge.
- [ ] Le dépôt a un **README** clair et un **schéma** d'architecture.
- [ ] Tu sais **justifier** chaque choix (stateless vs stateful, config hors image, isolation réseau).

Sept cases cochées = tu ne présentes pas un TP, tu présentes un **déploiement Kubernetes de production miniature**.
:::

:::lang en
Your deliverable is CV-ready when…

- [ ] `kubectl apply -f k8s/` deploys **the whole** platform, idempotently.
- [ ] The Redis **data tier** is **persistent** (PVC `Bound`) and **isolated** (NetworkPolicy).
- [ ] The **app** reads its **config** (ConfigMap) and **secret**, with active **probes**.
- [ ] The **Ingress** serves the app, and the **app → Redis flow** is proven (`/cache`).
- [ ] The **HPA** scales up **and** back down under/without load.
- [ ] The repo has a clear **README** and an architecture **diagram**.
- [ ] You can **justify** every choice (stateless vs stateful, config out of image, network isolation).

Seven boxes ticked = you're not presenting a lab, you're presenting a **miniature production Kubernetes deployment**.
:::

## next

:::lang fr
Tu as bouclé la **track Kubernetes → CKA/CKAD**, projet compris. Pour aller plus loin :

1. **Passe les examens** — avec toute la track, tu couvres les domaines du **CKA** (administration) et du **CKAD** (développement). Entraîne-toi au format chronométré.
2. **Industrialise ce projet** — passe les manifestes en **Kustomize** ou **Helm** (overlays dev/staging/prod), ajoute un **pipeline CI/CD** (guide CI/CD) et du **GitOps** (ArgoCD). Le même déploiement, versionné et automatisé.
3. **Rejoue sur un vrai cloud** — EKS/AKS/GKE (tracks cloud) : tes manifestes **ne changent pas**, seul le cluster change. La preuve que ton architecture était bonne.
:::

:::lang en
You've completed the **Kubernetes → CKA/CKAD track**, project included. To go further:

1. **Sit the exams** — with the whole track, you cover the **CKA** (admin) and **CKAD** (developer) domains. Practice in the timed format.
2. **Industrialize this project** — move the manifests to **Kustomize** or **Helm** (dev/staging/prod overlays), add a **CI/CD pipeline** (CI/CD guide) and **GitOps** (ArgoCD). The same deployment, versioned and automated.
3. **Replay on a real cloud** — EKS/AKS/GKE (cloud tracks): your manifests **don't change**, only the cluster does. Proof your architecture was sound.
:::

## cheatsheet

:::lang fr
Aide-mémoire projet multi-tier.
:::

:::lang en
Multi-tier project cheat sheet.
:::

```bash
# Déploiement complet / full deploy
kubectl apply -f k8s/                       # tout le dossier / the whole folder
kubectl get all,ingress,pvc,hpa,networkpolicy   # inventaire / inventory

# Config injectée / injected config
#   envFrom.configMapRef  +  env.valueFrom.secretKeyRef
kubectl exec deploy/app -- env | grep PODINFO

# HPA
kubectl get hpa app -w                      # TARGETS % + REPLICAS
kubectl top pods -l app=podinfo             # conso réelle (metrics-server) / real usage

# Flux multi-tier (podinfo cache -> redis) / multi-tier flow
curl -s -X POST localhost:8080/cache/k -d 'v' && curl -s localhost:8080/cache/k

# Nettoyage / cleanup (un geste / one gesture)
kubectl delete namespace shop
```

## resources

:::lang fr
- [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) et [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/).
- [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) et le [walkthrough HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/).
- [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) et [NetworkPolicy](https://kubernetes.io/docs/concepts/services-networking/network-policies/).
- [podinfo](https://github.com/stefanprodan/podinfo) — l'appli de démo utilisée.
:::

:::lang en
- [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) and [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/).
- [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) and the [HPA walkthrough](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/).
- [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) and [NetworkPolicy](https://kubernetes.io/docs/concepts/services-networking/network-policies/).
- [podinfo](https://github.com/stefanprodan/podinfo) — the demo app used.
:::

## troubleshooting

:::lang fr
**`kubectl get hpa` montre `<unknown>` dans TARGETS.** metrics-server met ~1 min à collecter, et il faut des **requests CPU** sur les pods. Vérifie `kubectl top pods` (doit renvoyer des valeurs) et que `resources.requests.cpu` est présent.

**Le HPA ne monte pas sous charge.** La charge est trop faible, ou le pod `load` ne tourne pas. Vérifie `kubectl get pod load` (Running) et `kubectl top pods -l app=podinfo` (le CPU doit dépasser 12m). Laisse **1-3 min**.

**`curl localhost:8080/` renvoie 404.** L'Ingress n'est pas pris (`ingressClassName: traefik` ?) ou le Service `app` n'a pas d'Endpoints (readiness KO : `kubectl get endpoints app`). Vérifie aussi que le cluster a été créé avec `-p "8080:80@loadbalancer"`.

**`/cache/...` renvoie une erreur.** `PODINFO_CACHE_SERVER` est absent/incorrect (doit valoir `tcp://redis:6379`), ou la NetworkPolicy bloque l'app (mauvais label). Vérifie le ConfigMap et le label `app: podinfo`.

**Le pod `intrus` n'est PAS bloqué.** La NetworkPolicy n'est pas appliquée (vérifie que tu es sur k3s/k3d), ou son `podSelector`/`from` est mal ciblé. `kubectl describe networkpolicy redis-only-from-app`.

**L'image podinfo ne se tire pas (`ErrImagePull`).** Le tag `6.7.0` peut avoir changé ; prends un tag récent depuis les [releases podinfo](https://github.com/stefanprodan/podinfo/releases) (ex. `ghcr.io/stefanprodan/podinfo:<version>`).
:::

:::lang en
**`kubectl get hpa` shows `<unknown>` in TARGETS.** metrics-server takes ~1 min to collect, and pods need **CPU requests**. Check `kubectl top pods` (must return values) and that `resources.requests.cpu` is present.

**The HPA won't scale up under load.** The load is too weak, or the `load` pod isn't running. Check `kubectl get pod load` (Running) and `kubectl top pods -l app=podinfo` (CPU must exceed 12m). Give it **1-3 min**.

**`curl localhost:8080/` returns 404.** The Ingress isn't picked up (`ingressClassName: traefik`?) or the `app` Service has no Endpoints (readiness failing: `kubectl get endpoints app`). Also check the cluster was created with `-p "8080:80@loadbalancer"`.

**`/cache/...` returns an error.** `PODINFO_CACHE_SERVER` is missing/wrong (must be `tcp://redis:6379`), or the NetworkPolicy blocks the app (wrong label). Check the ConfigMap and the `app: podinfo` label.

**The `intrus` pod is NOT blocked.** The NetworkPolicy isn't enforced (check you're on k3s/k3d), or its `podSelector`/`from` is mistargeted. `kubectl describe networkpolicy redis-only-from-app`.

**The podinfo image won't pull (`ErrImagePull`).** The `6.7.0` tag may have changed; use a recent tag from the [podinfo releases](https://github.com/stefanprodan/podinfo/releases) (e.g. `ghcr.io/stefanprodan/podinfo:<version>`).
:::
