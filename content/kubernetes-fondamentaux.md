---
# — Identité (ne change JAMAIS une fois publié) —
id: kubernetes-fondamentaux
slug: kubernetes-fondamentaux
order: 9
status: published

# — Titres & accroches (bilingue) —
title_fr: "Kubernetes — orchestrer des conteneurs"
title_en: "Kubernetes — orchestrate containers"
tagline_fr: "Pods, deployments, services, self-healing, rollouts."
tagline_en: "Pods, deployments, services, self-healing, rollouts."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 210
repo: "kubernetes/kubernetes"
last_review: "2026-07-31"

# — Relations de parcours (par id) —
prerequisites: [docker-fondamentaux]
next: [traefik]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [cluster-noeuds, pods, deployments-replicaset, self-healing, services, configmap-secret, rolling-update]
concepts_en: [cluster-nodes, pods, deployments-replicaset, self-healing, services, configmap-secret, rolling-update]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Apprends Kubernetes sur ta propre machine avec k3d : un cluster local complet, pods et deployments, self-healing, services, ConfigMap/Secret, et mises à jour progressives. Aligné CKA/CKAD."
og_description_en: "Learn Kubernetes on your own machine with k3d: a full local cluster, pods and deployments, self-healing, services, ConfigMap/Secret, and rolling updates. Aligned with CKA/CKAD."
---

## intro

:::lang fr
Tu sais lancer des conteneurs (Docker) et décrire une stack (Compose). Mais que se passe-t-il quand un conteneur **plante à 3h du matin** ? Quand il faut **10 répliques** derrière un load balancer ? Quand tu veux **mettre à jour sans coupure** ? Docker Compose ne gère pas ça. **Kubernetes** (K8s) oui : c'est l'**orchestrateur** qui maintient tes applications dans l'état voulu, se répare tout seul, monte en charge et déploie progressivement.

L'idée maîtresse : tu déclares l'**état voulu** (« je veux 3 répliques de cette image »), et un **contrôleur** travaille en boucle pour que le réel corresponde. Un pod meurt ? Kubernetes en recrée un. C'est le principe de **réconciliation**, et c'est ce qui rend K8s à la fois puissant et déroutant au début.

Le piège pour apprendre : la plupart pensent qu'il faut un cluster cloud (coûteux, complexe). Faux. Avec **k3d**, tu fais tourner un **vrai cluster Kubernetes complet dans Docker, sur ta machine** — mêmes commandes `kubectl`, mêmes manifestes qu'en production. Zéro cloud, zéro coût.

**Pour qui c'est :** tu maîtrises Docker (image, conteneur, port) et tu veux comprendre l'orchestration.

**Quand ce n'est PAS le bon choix :**

- Docker n'est pas encore clair pour toi → repasse par ce guide, c'est le prérequis dur.
- Tu héberges **un seul petit service** chez toi : Docker Compose suffit largement. Kubernetes se justifie à l'échelle (répliques, self-healing, équipes).
:::

:::lang en
You can run containers (Docker) and describe a stack (Compose). But what happens when a container **crashes at 3 a.m.**? When you need **10 replicas** behind a load balancer? When you want to **update with no downtime**? Docker Compose doesn't handle that. **Kubernetes** (K8s) does: it's the **orchestrator** that keeps your apps in the desired state, self-heals, scales, and rolls out progressively.

The core idea: you declare the **desired state** ("I want 3 replicas of this image"), and a **controller** loops to make reality match. A pod dies? Kubernetes recreates one. That's the **reconciliation** principle, and it's what makes K8s both powerful and confusing at first.

The trap when learning: most think you need a cloud cluster (costly, complex). False. With **k3d**, you run a **full real Kubernetes cluster inside Docker, on your machine** — same `kubectl` commands, same manifests as in production. Zero cloud, zero cost.

**Who it's for:** you're comfortable with Docker (image, container, port) and want to understand orchestration.

**When it's NOT the right choice:**

- Docker isn't clear to you yet → go back through that guide, it's the hard prerequisite.
- You self-host **a single small service**: Docker Compose is plenty. Kubernetes earns its keep at scale (replicas, self-healing, teams).
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Créer un **cluster local** avec k3d et le piloter avec `kubectl`.
- La différence **pod / deployment / replicaset**.
- Voir le **self-healing** en action (réconciliation).
- **Scaler** une application (répliques).
- Exposer un service avec un **Service** et y accéder.
- Injecter de la config avec **ConfigMap** et **Secret**.
- Faire une **mise à jour progressive** (rolling update) et un **rollback**.
:::

:::lang en
By the end of this guide, you'll know how to:

- Create a **local cluster** with k3d and drive it with `kubectl`.
- Tell apart **pod / deployment / replicaset**.
- See **self-healing** in action (reconciliation).
- **Scale** an application (replicas).
- Expose a service with a **Service** and access it.
- Inject config with **ConfigMap** and **Secret**.
- Do a **rolling update** and a **rollback**.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Le guide **Docker fondamentaux** acquis (image, conteneur, port — prérequis dur).
- **Docker** installé, fonctionnel **et lancé** (Docker Desktop ouvert sur macOS/Windows) : k3d fait tourner le cluster dans Docker, donc `k3d cluster create` échoue si Docker ne tourne pas.
- **k3d** et **kubectl** installés :
:::

:::lang en
You should have:

- The **Docker fundamentals** guide under your belt (image, container, port — hard prerequisite).
- **Docker** installed, working **and running** (Docker Desktop open on macOS/Windows): k3d runs the cluster inside Docker, so `k3d cluster create` fails if Docker isn't running.
- **k3d** and **kubectl** installed:
:::

```bash
# k3d (Linux/macOS) : script officiel / official script
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
# kubectl : voir https://kubernetes.io/docs/tasks/tools/  (macOS : brew install kubectl)
k3d version && kubectl version --client
```

:::lang fr
*(Windows : installe k3d et kubectl via **WSL2** avec Docker Desktop, et travaille depuis WSL.)*
:::

:::lang en
*(Windows: install k3d and kubectl via **WSL2** with Docker Desktop, and work from WSL.)*
:::

## concepts

:::lang fr
Kubernetes s'organise en couches.

- Un **cluster** est un ensemble de **nœuds** (machines). Un **plan de contrôle** (*control plane*) décide, des **nœuds de travail** exécutent. Avec k3d, tout ça tourne dans des conteneurs sur ta machine.
- Le **pod** est la plus petite unité déployable : un (ou plusieurs) conteneur(s) qui partagent réseau et stockage. On ne crée presque **jamais** un pod à la main.
- Le **deployment** est ce que tu manipules : il décrit « je veux N répliques de cette image ». Il crée et pilote un **replicaset**, qui lui garantit le bon nombre de pods. Si un pod meurt, le replicaset en recrée un : c'est le **self-healing**.
- Le **service** donne une **adresse stable** à un groupe de pods (dont les IP changent sans cesse). Il répartit le trafic entre eux.

Le concept qui change tout : la **réconciliation**. Tu ne donnes jamais d'ordres impératifs (« démarre ce conteneur »). Tu déclares un **état voulu** dans un manifeste YAML, tu fais `kubectl apply`, et des **contrôleurs** travaillent en boucle pour que le réel y corresponde — en permanence. C'est déclaratif, comme Terraform, mais **vivant** : ça surveille et corrige tout le temps.
:::

:::lang en
Kubernetes is organized in layers.

- A **cluster** is a set of **nodes** (machines). A **control plane** decides, **worker nodes** execute. With k3d, all of it runs in containers on your machine.
- The **pod** is the smallest deployable unit: one (or more) container(s) sharing network and storage. You almost **never** create a pod by hand.
- The **deployment** is what you manipulate: it describes "I want N replicas of this image". It creates and drives a **replicaset**, which guarantees the right number of pods. If a pod dies, the replicaset recreates one: that's **self-healing**.
- The **service** gives a **stable address** to a group of pods (whose IPs constantly change). It load-balances traffic between them.

The concept that changes everything: **reconciliation**. You never give imperative orders ("start this container"). You declare a **desired state** in a YAML manifest, you `kubectl apply`, and **controllers** loop to make reality match — continuously. It's declarative, like Terraform, but **alive**: it watches and corrects all the time.
:::

:::figure kubernetes-reconciliation
caption_fr: "Schéma 1. Deployment → ReplicaSet → Pods, exposés par un Service. Le contrôleur réconcilie en boucle."
caption_en: "Figure 1. Deployment → ReplicaSet → Pods, exposed by a Service. The controller reconciles in a loop."
:::

:::lang fr
On avance ainsi : cluster local → premier deployment → self-healing → scaling → service → config → rolling update.
:::

:::lang en
We'll go like this: local cluster → first deployment → self-healing → scaling → service → config → rolling update.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Créer un cluster local et vérifier que `kubectl` lui parle.

**🤔 Pourquoi `-p "8080:80@loadbalancer"` ?** k3d embarque un load balancer. Cette option mappe le **port 8080 de ta machine** vers le port 80 du load balancer du cluster — on s'en servira à l'étape 5 pour joindre notre service depuis le navigateur.

**🤔 Et `--disable=traefik` ?** k3s installe un Ingress Traefik par défaut, qui **occuperait le port 80** et entrerait en conflit avec notre propre Service à l'étape 5. On le retire ici (on apprendra Traefik dans un guide dédié).
:::

:::lang en
**Goal.** Create a local cluster and check that `kubectl` talks to it.

**🤔 Why `-p "8080:80@loadbalancer"`?** k3d ships a load balancer. This option maps **port 8080 on your machine** to the cluster load balancer's port 80 — we'll use it in step 5 to reach our service from the browser.

**🤔 And `--disable=traefik`?** k3s installs a Traefik Ingress by default, which **would occupy port 80** and conflict with our own Service in step 5. We remove it here (we'll learn Traefik in a dedicated guide).
:::

```bash
k3d cluster create devlab -p "8080:80@loadbalancer" --k3s-arg "--disable=traefik@server:0"
kubectl get nodes            # les nœuds du cluster / the cluster nodes
kubectl get pods -A          # les pods système déjà en place / the system pods already in place
```

:::lang fr
**✅ Vérification :** `kubectl get nodes` liste un nœud `k3d-devlab-server-0` en statut `Ready`. `kubectl get pods -A` montre les pods système (`coredns`, `local-path-provisioner`, `metrics-server`) dans le namespace `kube-system` — **pas** de traefik, puisqu'on l'a désactivé. Ton cluster est vivant.
:::

:::lang en
**✅ Check:** `kubectl get nodes` lists a `k3d-devlab-server-0` node in `Ready` status. `kubectl get pods -A` shows system pods (`coredns`, `local-path-provisioner`, `metrics-server`) in the `kube-system` namespace — **no** traefik, since we disabled it. Your cluster is alive.
:::

### step-02

:::lang fr
**Objectif.** Déployer ta première application avec un **deployment**.

**🤔 Pourquoi un deployment et pas un pod ?** Un pod seul n'est pas résilient : s'il meurt, il reste mort. Le **deployment** décrit l'état voulu (« 2 répliques de nginx ») et garantit qu'il est **maintenu**. Le `selector` relie le deployment à ses pods par un **label** (`app: web`) — c'est le fil qui les rattache.

Crée `deployment.yaml` :
:::

:::lang en
**Goal.** Deploy your first application with a **deployment**.

**🤔 Why a deployment and not a pod?** A lone pod isn't resilient: if it dies, it stays dead. The **deployment** describes the desired state ("2 replicas of nginx") and guarantees it's **maintained**. The `selector` links the deployment to its pods via a **label** (`app: web`) — that's the thread that ties them together.

Create `deployment.yaml`:
:::

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          ports:
            - containerPort: 80
```

```bash
kubectl apply -f deployment.yaml
kubectl get deployments
kubectl get pods -l app=web         # les pods du deployment / the deployment's pods
```

:::lang fr
**✅ Vérification :** `kubectl get deployments` montre `web` avec `READY 2/2`, et `kubectl get pods -l app=web` liste **deux** pods `web-...` en `Running`. Tu viens de déclarer un état voulu ; Kubernetes l'a réalisé.
:::

:::lang en
**✅ Check:** `kubectl get deployments` shows `web` with `READY 2/2`, and `kubectl get pods -l app=web` lists **two** `web-...` pods in `Running`. You just declared a desired state; Kubernetes made it real.
:::

### step-03

:::lang fr
**Objectif.** Voir le **self-healing** de tes propres yeux. **C'est le moment « aha » du guide.**

**🤔 Pourquoi supprimer un pod exprès ?** Parce que « Kubernetes recrée les pods qui meurent » est une phrase qu'on oublie — alors qu'un pod qui **ressuscite sous tes yeux**, tu ne l'oublies pas. Le replicaset veille : il constate qu'il manque une réplique et en recrée une immédiatement.
:::

:::lang en
**Goal.** See **self-healing** with your own eyes. **This is the guide's "aha" moment.**

**🤔 Why delete a pod on purpose?** Because "Kubernetes recreates pods that die" is a sentence you forget — but a pod that **comes back to life before your eyes**, you don't. The replicaset watches: it notices a replica is missing and recreates one immediately.
:::

```bash
kubectl get pods -l app=web             # note les noms / note the names
kubectl delete pod <un-nom-de-pod-web>  # tue-en un / kill one
kubectl get pods -l app=web             # relance vite : un nouveau apparaît / run again fast: a new one appears
```

:::lang fr
**✅ Vérification :** juste après le `delete`, tu vois un pod `Terminating` et un **nouveau** pod en `ContainerCreating` puis `Running`. Le deployment est toujours à `2/2`. Tu n'as rien fait pour ça : c'est la réconciliation.
:::

:::lang en
**✅ Check:** right after the `delete`, you see one pod `Terminating` and a **new** pod in `ContainerCreating` then `Running`. The deployment is still `2/2`. You did nothing to make that happen: it's reconciliation.
:::

### step-04

:::lang fr
**Objectif.** Monter (et descendre) en charge.

**🤔 Deux façons de scaler ?** L'impératif (`kubectl scale`) est rapide pour tester. Mais la **bonne pratique déclarative** est de changer `replicas:` dans le manifeste et de refaire `apply` — ainsi ton fichier reste la source de vérité (versionnable en Git). On voit les deux.
:::

:::lang en
**Goal.** Scale up (and down).

**🤔 Two ways to scale?** The imperative one (`kubectl scale`) is quick for testing. But the **declarative best practice** is to change `replicas:` in the manifest and re-`apply` — so your file stays the source of truth (versionable in Git). We'll see both.
:::

```bash
kubectl scale deployment web --replicas=5    # impératif, pour tester / imperative, to test
kubectl get pods -l app=web                  # 5 pods maintenant / 5 pods now
# Bonne pratique : mets replicas: 3 dans deployment.yaml, puis / Best practice: set replicas: 3 in deployment.yaml, then:
kubectl apply -f deployment.yaml
```

:::lang fr
**✅ Vérification :** après le `scale`, `kubectl get pods -l app=web` montre 5 pods. Après avoir mis `replicas: 3` dans le YAML et refait `apply`, le deployment converge à `3/3` (Kubernetes supprime 2 pods). Le manifeste gagne toujours.
:::

:::lang en
**✅ Check:** after the `scale`, `kubectl get pods -l app=web` shows 5 pods. After setting `replicas: 3` in the YAML and re-`apply`, the deployment converges to `3/3` (Kubernetes removes 2 pods). The manifest always wins.
:::

### step-05

:::lang fr
**Objectif.** Exposer le deployment avec un **Service** et y accéder depuis ton navigateur.

**🤔 Pourquoi un Service ?** Les pods sont **éphémères** : leurs IP changent à chaque recréation. Un **Service** fournit une adresse **stable** et **répartit** le trafic entre les pods qui portent le label `app: web`. En type `LoadBalancer`, k3d l'expose sur le port qu'on a mappé à l'étape 1.

Crée `service.yaml` :
:::

:::lang en
**Goal.** Expose the deployment with a **Service** and access it from your browser.

**🤔 Why a Service?** Pods are **ephemeral**: their IPs change on every recreation. A **Service** provides a **stable** address and **load-balances** traffic across the pods carrying the `app: web` label. As type `LoadBalancer`, k3d exposes it on the port we mapped in step 1.

Create `service.yaml`:
:::

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
```

```bash
kubectl apply -f service.yaml
kubectl get service web
curl http://localhost:8080          # via le port mappé à l'étape 1 / via the port mapped in step 1
```

:::lang fr
**✅ Vérification :** `curl http://localhost:8080` (ou le navigateur) affiche la page nginx. Le `Service` route vers tes pods `web`, quel que soit celui qui répond. Le `selector: app: web` est ce qui relie le Service aux pods.
:::

:::lang en
**✅ Check:** `curl http://localhost:8080` (or the browser) shows the nginx page. The `Service` routes to your `web` pods, whichever one answers. The `selector: app: web` is what links the Service to the pods.
:::

### step-06

:::lang fr
**Objectif.** Injecter de la configuration avec un **ConfigMap** (et comprendre le **Secret**).

**🤔 Pourquoi séparer la config du conteneur ?** Comme les variables d'environnement Docker : une même image doit servir plusieurs environnements. Un **ConfigMap** stocke de la config non sensible ; un **Secret** fait pareil pour les données sensibles (mots de passe, clés) — même mécanisme, mais encodé et traité à part.

Crée un ConfigMap et monte-le comme page d'accueil :
:::

:::lang en
**Goal.** Inject configuration with a **ConfigMap** (and understand the **Secret**).

**🤔 Why separate config from the container?** Like Docker environment variables: one image should serve multiple environments. A **ConfigMap** stores non-sensitive config; a **Secret** does the same for sensitive data (passwords, keys) — same mechanism, but encoded and handled separately.

Create a ConfigMap and mount it as the home page:
:::

```bash
kubectl create configmap web-home \
  --from-literal=index.html='<h1>Config injectée par Kubernetes</h1>'
```

:::lang fr
Dans `deployment.yaml`, **remplace tout le bloc `containers:`** par le bloc ci-dessous (il ajoute `volumeMounts` au conteneur et un `volumes:` frère de `containers`, tous deux sous `spec.template.spec`) :
:::

:::lang en
In `deployment.yaml`, **replace the entire `containers:` block** with the block below (it adds `volumeMounts` to the container and a `volumes:` sibling of `containers`, both under `spec.template.spec`):
:::

```yaml
      containers:
        - name: nginx
          image: nginx:1.27
          ports:
            - containerPort: 80
          volumeMounts:
            - name: home
              mountPath: /usr/share/nginx/html
      volumes:
        - name: home
          configMap:
            name: web-home
```

```bash
kubectl apply -f deployment.yaml
kubectl rollout status deployment web
curl http://localhost:8080
```

:::lang fr
**✅ Vérification :** `curl http://localhost:8080` affiche maintenant « Config injectée par Kubernetes ». La config vit **hors** de l'image, dans le ConfigMap. *(Un `Secret` se crée pareil avec `kubectl create secret generic ...` et se monte de la même façon.)*
:::

:::lang en
**✅ Check:** `curl http://localhost:8080` now shows "Config injectée par Kubernetes". The config lives **outside** the image, in the ConfigMap. *(A `Secret` is created the same way with `kubectl create secret generic ...` and mounted similarly.)*
:::

### step-07

:::lang fr
**Objectif.** Mettre à jour l'image **sans coupure** (rolling update), puis **revenir en arrière**.

**🤔 Pourquoi c'est sans coupure ?** Le deployment remplace les pods **progressivement** : il en crée un nouveau (nouvelle image), attend qu'il soit prêt, supprime un ancien, et recommence. À aucun moment le service n'est à zéro pod. Et Kubernetes garde l'historique : tu peux **annuler** en une commande.
:::

:::lang en
**Goal.** Update the image **with no downtime** (rolling update), then **roll back**.

**🤔 Why is it downtime-free?** The deployment replaces pods **progressively**: it creates a new one (new image), waits for it to be ready, removes an old one, and repeats. At no point is the service at zero pods. And Kubernetes keeps the history: you can **undo** with one command.
:::

```bash
kubectl set image deployment/web nginx=nginx:1.26    # change l'image / change the image
kubectl rollout status deployment web                # suit le déploiement progressif / follow the rollout
kubectl rollout undo deployment web                  # rollback à la version précédente / roll back
```

:::lang fr
**✅ Vérification :** pendant le `rollout status`, tu vois les pods se remplacer un par un (« Waiting for deployment... 1 out of 3 new replicas... »). Le `curl` répond **en continu** pendant l'opération. Après le `undo`, le deployment revient à `nginx:1.27`.

*(Nettoyage : `k3d cluster delete devlab` supprime tout le cluster.)*
:::

:::lang en
**✅ Check:** during `rollout status`, you see pods replaced one by one ("Waiting for deployment... 1 out of 3 new replicas..."). The `curl` responds **continuously** throughout. After the `undo`, the deployment returns to `nginx:1.27`.

*(Cleanup: `k3d cluster delete devlab` removes the whole cluster.)*
:::

## pitfalls

:::lang fr
**1. Créer des pods « nus ».** Un pod créé à la main (`kubectl run` sans deployment) n'est pas surveillé : il meurt, il reste mort. Passe **toujours** par un deployment (ou un autre contrôleur).

**2. Un `selector` qui ne matche pas les labels.** Si le `selector` du deployment ou du service ne correspond pas aux `labels` des pods, plus rien ne se relie : deployment sans pods, service sans endpoints. Vérifie que les labels concordent.

**3. Débugger sans les bons outils.** Un pod en `CrashLoopBackOff` ou `ImagePullBackOff` ? `kubectl describe pod <nom>` (les événements en bas) et `kubectl logs <nom>` te disent presque toujours pourquoi. Ne devine pas.

**4. Mettre des secrets dans un ConfigMap (ou en clair dans le YAML).** Les données sensibles vont dans un **Secret**, jamais dans un ConfigMap ni en dur dans un manifeste versionné.

**5. Oublier les `resources` (requests/limits).** Sans limites, un pod peut affamer le nœud. En vrai cluster, déclare des `requests`/`limits` CPU/mémoire (hors périmètre de ce guide, mais à connaître pour la suite).

**6. Confondre `port` et `targetPort`.** Dans un Service, `port` est le port du Service, `targetPort` celui du conteneur. Les inverser = trafic dans le vide.
:::

:::lang en
**1. Creating "naked" pods.** A pod created by hand (`kubectl run` without a deployment) isn't supervised: it dies, it stays dead. **Always** go through a deployment (or another controller).

**2. A `selector` that doesn't match the labels.** If the deployment's or service's `selector` doesn't match the pods' `labels`, nothing links up: deployment with no pods, service with no endpoints. Check that labels agree.

**3. Debugging without the right tools.** A pod in `CrashLoopBackOff` or `ImagePullBackOff`? `kubectl describe pod <name>` (events at the bottom) and `kubectl logs <name>` almost always tell you why. Don't guess.

**4. Putting secrets in a ConfigMap (or in clear text in the YAML).** Sensitive data goes in a **Secret**, never in a ConfigMap nor hardcoded in a versioned manifest.

**5. Forgetting `resources` (requests/limits).** Without limits, a pod can starve the node. On a real cluster, declare CPU/memory `requests`/`limits` (outside this guide's scope, but good to know for later).

**6. Confusing `port` and `targetPort`.** In a Service, `port` is the Service's port, `targetPort` the container's. Swapping them = traffic into the void.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu expliques **deployment → replicaset → pods** et le rôle du **selector**/label.
- [ ] Le **self-healing** et la **réconciliation** sont clairs (tu as vu un pod renaître).
- [ ] Tu scales en impératif **et** en déclaratif, et tu sais lequel privilégier.
- [ ] Tu exposes une app avec un **Service** et tu y accèdes.
- [ ] Tu injectes de la config par **ConfigMap**/**Secret**.
- [ ] Tu fais un **rolling update** et un **rollback** sans stresser.

Six cases cochées = tu as les fondamentaux de l'orchestration Kubernetes. Bravo.
:::

:::lang en
You know it works when…

- [ ] You can explain **deployment → replicaset → pods** and the role of the **selector**/label.
- [ ] **Self-healing** and **reconciliation** are clear (you watched a pod come back).
- [ ] You scale imperatively **and** declaratively, and you know which to prefer.
- [ ] You expose an app with a **Service** and access it.
- [ ] You inject config via **ConfigMap**/**Secret**.
- [ ] You do a **rolling update** and a **rollback** without stress.

Six boxes ticked = you have the fundamentals of Kubernetes orchestration. Well done.
:::

## next

:::lang fr
La suite logique :

1. **Traefik** — l'*Ingress controller* de facto : router plusieurs services K8s derrière un nom de domaine et du HTTPS.
2. Plus loin : le **projet homelab**, où tu combines tout (Terraform provisionne, Ansible configure, Kubernetes orchestre).

Pour la **prépa CKA/CKAD**, creuse ensuite : namespaces, `requests`/`limits`, sondes (`liveness`/`readiness`), volumes persistants (PV/PVC), Ingress, RBAC, Jobs/CronJobs. Entraîne-toi aussi à générer des manifestes en **impératif** (`kubectl create deploy web --image=nginx:1.27 --dry-run=client -o yaml`) — un gain de temps décisif au CKAD chronométré.
:::

:::lang en
The logical next steps:

1. **Traefik** — the de-facto *Ingress controller*: route several K8s services behind a domain name and HTTPS.
2. Further along: the **homelab project**, where you combine everything (Terraform provisions, Ansible configures, Kubernetes orchestrates).

For **CKA/CKAD prep**, dig next into: namespaces, `requests`/`limits`, probes (`liveness`/`readiness`), persistent volumes (PV/PVC), Ingress, RBAC, Jobs/CronJobs. Also practice generating manifests **imperatively** (`kubectl create deploy web --image=nginx:1.27 --dry-run=client -o yaml`) — a decisive time-saver on the timed CKAD.
:::

## cheatsheet

:::lang fr
Aide-mémoire kubectl.
:::

:::lang en
kubectl cheat sheet.
:::

```bash
# Cluster (k3d)
k3d cluster create devlab -p "8080:80@loadbalancer" --k3s-arg "--disable=traefik@server:0"   # créer / create
k3d cluster delete devlab                              # supprimer / delete
kubectl get nodes                                      # les nœuds / the nodes

# Observer / Observe
kubectl get pods -l app=web        # filtrer par label / filter by label
kubectl get deploy,svc,pods        # plusieurs types d'un coup / several types at once
kubectl describe pod <nom>         # détails + événements (debug) / details + events (debug)
kubectl logs <nom>                 # logs d'un pod / a pod's logs

# Déclarer / Declare
kubectl apply -f fichier.yaml      # appliquer un manifeste / apply a manifest
kubectl delete -f fichier.yaml     # supprimer / delete

# Piloter / Drive
kubectl scale deploy/web --replicas=3        # scaler / scale
kubectl set image deploy/web nginx=nginx:1.26 # mettre à jour l'image / update the image
kubectl rollout status deploy/web            # suivre / follow
kubectl rollout undo deploy/web              # rollback
kubectl port-forward svc/web 8080:80         # accès local sans LoadBalancer / local access without LoadBalancer
```

## resources

:::lang fr
- [Documentation Kubernetes](https://kubernetes.io/docs/home/) — la référence.
- [k3d](https://k3d.io) — Kubernetes local dans Docker.
- [kubectl — aide-mémoire officiel](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) — toutes les commandes.
- [CKA](https://www.cncf.io/training/certification/cka/) / [CKAD](https://www.cncf.io/training/certification/ckad/) — les certifications que ce module prépare.
:::

:::lang en
- [Kubernetes documentation](https://kubernetes.io/docs/home/) — the reference.
- [k3d](https://k3d.io) — local Kubernetes in Docker.
- [kubectl — official cheat sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) — all the commands.
- [CKA](https://www.cncf.io/training/certification/cka/) / [CKAD](https://www.cncf.io/training/certification/ckad/) — the certifications this module prepares for.
:::

## troubleshooting

:::lang fr
**`kubectl` : « The connection to the server ... was refused ».** Le cluster n'est pas lancé ou le contexte est mauvais. Vérifie `k3d cluster list` et `kubectl config current-context` (il doit être `k3d-devlab`).

**Pod en `ImagePullBackOff`.** Kubernetes n'arrive pas à télécharger l'image : tag inexistant ou faute de frappe. `kubectl describe pod <nom>` → section Events. Corrige l'image dans le manifeste.

**Pod en `CrashLoopBackOff`.** Le conteneur démarre puis plante en boucle. `kubectl logs <nom>` (ajoute `--previous` pour l'instance précédente) donne l'erreur applicative.

**`curl http://localhost:8080` ne répond pas.** Vérifie que le cluster a bien été créé **avec** `-p "8080:80@loadbalancer"`, que le Service est de type `LoadBalancer`, et que ses `selector`/`labels` matchent (`kubectl get endpoints web` ne doit pas être vide). Sinon, utilise `kubectl port-forward svc/web 8080:80`.

**Le deployment reste à `0/2` ou `1/2`.** `kubectl describe deploy web` et `kubectl describe pod <nom>` : souvent un problème d'image, de ressources, ou de selector qui ne matche pas les labels du template.
:::

:::lang en
**`kubectl`: "The connection to the server ... was refused".** The cluster isn't running or the context is wrong. Check `k3d cluster list` and `kubectl config current-context` (it should be `k3d-devlab`).

**Pod in `ImagePullBackOff`.** Kubernetes can't pull the image: nonexistent tag or typo. `kubectl describe pod <name>` → Events section. Fix the image in the manifest.

**Pod in `CrashLoopBackOff`.** The container starts then crashes in a loop. `kubectl logs <name>` (add `--previous` for the prior instance) gives the app error.

**`curl http://localhost:8080` doesn't respond.** Check the cluster was created **with** `-p "8080:80@loadbalancer"`, that the Service is type `LoadBalancer`, and that its `selector`/`labels` match (`kubectl get endpoints web` must not be empty). Otherwise, use `kubectl port-forward svc/web 8080:80`.

**The deployment stays at `0/2` or `1/2`.** `kubectl describe deploy web` and `kubectl describe pod <name>`: often an image issue, resources, or a selector that doesn't match the template's labels.
:::
