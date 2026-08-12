---
# — Identité (ne change JAMAIS une fois publié) —
id: kubernetes-workloads-scheduling
slug: kubernetes-workloads-scheduling
order: 14
status: published

# — Titres & accroches (bilingue) —
title_fr: "Kubernetes — workloads avancés & scheduling"
title_en: "Kubernetes — advanced workloads & scheduling"
tagline_fr: "Probes, resources, Jobs, DaemonSet, affinité, taints."
tagline_en: "Probes, resources, Jobs, DaemonSet, affinity, taints."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 200
repo: "kubernetes/kubernetes"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [kubernetes-fondamentaux]
next: [traefik]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [probes-liveness-readiness, requests-limits, init-sidecar, jobs-cronjobs, daemonset, nodeselector-affinite, taints-tolerations]
concepts_en: [liveness-readiness-probes, requests-limits, init-sidecar, jobs-cronjobs, daemonset, nodeselector-affinity, taints-tolerations]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Passe du deployment de base au niveau CKA/CKAD : probes liveness/readiness, requests & limits, init containers et sidecars, Jobs et CronJobs, DaemonSet, et tout le scheduling (nodeSelector, affinité, taints & tolerations) — sur un cluster k3d multi-nœuds, en local."
og_description_en: "Go from the basic deployment to CKA/CKAD level: liveness/readiness probes, requests & limits, init containers and sidecars, Jobs and CronJobs, DaemonSet, and all the scheduling (nodeSelector, affinity, taints & tolerations) — on a local multi-node k3d cluster."
---

## intro

:::lang fr
Au niveau fondamentaux, tu créais un `Deployment` et tu le laissais tourner. Ça marche pour une démo — pas pour la prod, ni pour l'examen **CKA/CKAD**. En vrai, tu dois répondre à des questions précises : *comment Kubernetes sait-il qu'un conteneur est vraiment prêt ? qu'il est mort et doit redémarrer ? combien de CPU/RAM lui accorder ? où le placer dans le cluster ? comment lancer une tâche ponctuelle plutôt qu'un service permanent ?*

Ce guide couvre exactement ces questions — le cœur du domaine **Workloads & Scheduling**. Tu vas apprendre les **probes** (liveness/readiness), les **requests & limits** (et la QoS), les **init containers** et **sidecars**, les contrôleurs qui ne sont **pas** des Deployments (**Job**, **CronJob**, **DaemonSet**), puis tout le **scheduling** : `nodeSelector`, **affinité de nœud**, et **taints & tolerations**.

On travaille sur un cluster **k3d multi-nœuds**, en local — indispensable pour que le scheduling ait un sens (placer un pod « ici plutôt que là » suppose plusieurs nœuds). Zéro cloud, zéro carte bancaire.

**Pour qui c'est :** tu as le guide **Kubernetes fondamentaux** (pods, deployments, services, ConfigMap/Secret, rolling update) et tu vises la certification.

**Quand ce n'est PAS le bon choix :**

- Tu ne sais pas encore ce qu'est un `Deployment` ou un `Service` → reviens aux fondamentaux.
- Tu cherches l'exposition HTTP (Ingress) ou le stockage persistant → ce sont les guides suivants de la track.
:::

:::lang en
At the fundamentals level, you created a `Deployment` and let it run. That works for a demo — not for production, nor for the **CKA/CKAD** exam. In reality, you must answer precise questions: *how does Kubernetes know a container is truly ready? that it's dead and must restart? how much CPU/RAM to grant it? where to place it in the cluster? how to run a one-off task rather than a permanent service?*

This guide covers exactly those questions — the heart of the **Workloads & Scheduling** domain. You'll learn **probes** (liveness/readiness), **requests & limits** (and QoS), **init containers** and **sidecars**, the controllers that are **not** Deployments (**Job**, **CronJob**, **DaemonSet**), then all of **scheduling**: `nodeSelector`, **node affinity**, and **taints & tolerations**.

We work on a **multi-node k3d cluster**, locally — essential for scheduling to mean anything (placing a pod "here rather than there" implies several nodes). No cloud, no credit card.

**Who it's for:** you have the **Kubernetes fundamentals** guide (pods, deployments, services, ConfigMap/Secret, rolling update) and you're aiming for the cert.

**When it's NOT the right choice:**

- You don't yet know what a `Deployment` or a `Service` is → go back to the fundamentals.
- You're after HTTP exposure (Ingress) or persistent storage → those are the next guides in the track.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Créer un cluster **multi-nœuds** et travailler dans un **namespace** dédié.
- Écrire des **probes** `liveness`, `readiness` (et `startup`), et voir Kubernetes réagir.
- Déclarer des **requests & limits** et comprendre les classes de **QoS** (dont l'`OOMKilled`).
- Utiliser un **init container** et un **sidecar** dans un même pod.
- Lancer des tâches avec **Job** et **CronJob** (et leur `restartPolicy`).
- Déployer un **DaemonSet** (un pod par nœud).
- Placer des pods avec **`nodeSelector`**, l'**affinité de nœud**, et gérer les **taints & tolerations**.
:::

:::lang en
By the end of this guide, you'll know how to:

- Create a **multi-node** cluster and work in a dedicated **namespace**.
- Write `liveness`, `readiness` (and `startup`) **probes**, and watch Kubernetes react.
- Declare **requests & limits** and understand **QoS** classes (including `OOMKilled`).
- Use an **init container** and a **sidecar** in the same pod.
- Run tasks with **Job** and **CronJob** (and their `restartPolicy`).
- Deploy a **DaemonSet** (one pod per node).
- Place pods with **`nodeSelector`**, **node affinity**, and manage **taints & tolerations**.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Le guide **Kubernetes fondamentaux** acquis (prérequis dur).
- **Docker** lancé, **k3d** et **kubectl** installés (cf. fondamentaux).
- De quoi faire tourner **trois nœuds** k3d (chacun est un conteneur léger ; ~3-4 Go de RAM libre confortables).

On crée un cluster **dédié à la track CKA**, à 3 nœuds (1 serveur + 2 agents), pour que le scheduling ait plusieurs nœuds sur lesquels décider :
:::

:::lang en
You should have:

- The **Kubernetes fundamentals** guide under your belt (hard prerequisite).
- **Docker** running, **k3d** and **kubectl** installed (see fundamentals).
- Enough to run **three** k3d nodes (each is a light container; ~3-4 GB free RAM is comfortable).

We create a **CKA-track-dedicated** cluster with 3 nodes (1 server + 2 agents), so scheduling has several nodes to decide between:
:::

```bash
k3d cluster create ckalab --agents 2 --k3s-arg "--disable=traefik@server:0"
kubectl get nodes
```

:::lang fr
`kubectl get nodes` doit lister **trois** nœuds `Ready` : `k3d-ckalab-server-0`, `k3d-ckalab-agent-0`, `k3d-ckalab-agent-1`. *(Sur k3s, le nœud serveur est **schedulable** — pas de taint control-plane — donc trois nœuds accueillent des pods.)*
:::

:::lang en
`kubectl get nodes` must list **three** `Ready` nodes: `k3d-ckalab-server-0`, `k3d-ckalab-agent-0`, `k3d-ckalab-agent-1`. *(On k3s, the server node is **schedulable** — no control-plane taint — so all three nodes take pods.)*
:::

## concepts

:::lang fr
Un `Deployment` répond à « fais tourner N répliques d'un service web, en permanence ». Mais Kubernetes a bien plus d'outils, et l'examen les teste tous.

**Santé des conteneurs — les probes.** Kubernetes ne se contente pas de « le process tourne ». Trois sondes :

- **`livenessProbe`** : « est-il **vivant** ? » Si elle échoue, le kubelet **redémarre** le conteneur.
- **`readinessProbe`** : « est-il **prêt à recevoir du trafic** ? » Si elle échoue, le pod est **retiré des Services** (mais pas redémarré).
- **`startupProbe`** : « a-t-il **fini de démarrer** ? » Elle protège les applis lentes à booter avant que la liveness ne s'active.

**Ressources — requests & limits.** Une **request** est ce que le pod **réserve** (le scheduler s'en sert pour choisir un nœud). Une **limit** est le **plafond** (dépasser la limit CPU → *throttling* ; dépasser la limit mémoire → **`OOMKilled`**). Le couple request/limit détermine la **QoS** : `Guaranteed` (request = limit), `Burstable` (request < limit), `BestEffort` (aucune) — l'ordre dans lequel Kubernetes tue les pods sous pression.

**Plusieurs conteneurs dans un pod.** Un **init container** s'exécute **avant** les conteneurs applicatifs, jusqu'au bout, en séquence (préparer un fichier, attendre une dépendance). Un **sidecar** tourne **à côté** du conteneur principal, en parallèle (collecter des logs, servir un proxy). Ils partagent le réseau et les volumes du pod.

**Au-delà du Deployment.** Un **Job** exécute une tâche **jusqu'à réussite** puis s'arrête (batch, migration). Un **CronJob** lance un Job **sur un planning** cron. Un **DaemonSet** garantit **un pod par nœud** (agents de logs, de monitoring).

**Le scheduling — où atterrit un pod ?** Par défaut, le scheduler choisit. Tu peux l'orienter :

- **`nodeSelector`** : « uniquement les nœuds portant ce **label** ». Simple, strict.
- **affinité de nœud** : plus expressive (`required` = obligatoire, `preferred` = souhaité).
- **taints & tolerations** : l'inverse. Un **taint** sur un nœud **repousse** les pods ; seuls ceux qui portent la **toleration** correspondante peuvent y atterrir. C'est ainsi qu'on réserve des nœuds (GPU, base de données…).
:::

:::lang en
A `Deployment` answers "run N replicas of a web service, permanently". But Kubernetes has many more tools, and the exam tests them all.

**Container health — probes.** Kubernetes doesn't settle for "the process is running". Three probes:

- **`livenessProbe`**: "is it **alive**?" If it fails, the kubelet **restarts** the container.
- **`readinessProbe`**: "is it **ready to receive traffic**?" If it fails, the pod is **removed from Services** (but not restarted).
- **`startupProbe`**: "has it **finished starting**?" It protects slow-booting apps before liveness kicks in.

**Resources — requests & limits.** A **request** is what the pod **reserves** (the scheduler uses it to pick a node). A **limit** is the **ceiling** (exceeding the CPU limit → *throttling*; exceeding the memory limit → **`OOMKilled`**). The request/limit pair determines the **QoS**: `Guaranteed` (request = limit), `Burstable` (request < limit), `BestEffort` (none) — the order in which Kubernetes kills pods under pressure.

**Multiple containers in a pod.** An **init container** runs **before** the app containers, to completion, in sequence (prepare a file, wait for a dependency). A **sidecar** runs **alongside** the main container, in parallel (collect logs, serve a proxy). They share the pod's network and volumes.

**Beyond the Deployment.** A **Job** runs a task **until success** then stops (batch, migration). A **CronJob** launches a Job **on a cron schedule**. A **DaemonSet** guarantees **one pod per node** (log/monitoring agents).

**Scheduling — where does a pod land?** By default, the scheduler chooses. You can steer it:

- **`nodeSelector`**: "only nodes carrying this **label**". Simple, strict.
- **node affinity**: more expressive (`required` = mandatory, `preferred` = desired).
- **taints & tolerations**: the reverse. A **taint** on a node **repels** pods; only those carrying the matching **toleration** can land there. That's how you reserve nodes (GPU, database…).
:::

:::figure kubernetes-scheduling
caption_fr: "Schéma 1. nodeSelector/affinité attirent un pod vers des nœuds labellisés ; un taint repousse les pods sauf ceux qui tolèrent."
caption_en: "Figure 1. nodeSelector/affinity attract a pod toward labeled nodes; a taint repels pods except those that tolerate it."
:::

:::lang fr
On avance : namespace → probes → resources → init & sidecar → Job/CronJob → DaemonSet → nodeSelector & affinité → taints & tolerations.
:::

:::lang en
We'll go: namespace → probes → resources → init & sidecar → Job/CronJob → DaemonSet → nodeSelector & affinity → taints & tolerations.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Se donner un **namespace** de travail et le rendre courant.

**🤔 Pourquoi un namespace ?** Il isole tes objets des pods système et facilite le nettoyage (supprimer le namespace supprime tout). Le rendre **courant** t'évite de taper `-n cka` à chaque commande — un réflexe qui fait gagner un temps précieux à l'examen.
:::

:::lang en
**Goal.** Give yourself a working **namespace** and make it current.

**🤔 Why a namespace?** It isolates your objects from system pods and eases cleanup (deleting the namespace deletes everything). Making it **current** saves you from typing `-n cka` on every command — a reflex that saves precious time in the exam.
:::

```bash
kubectl create namespace cka
kubectl config set-context --current --namespace=cka
kubectl config view --minify | grep namespace:      # namespace: cka
```

:::lang fr
**✅ Vérification :** `kubectl config view --minify | grep namespace` affiche `namespace: cka`. Désormais, `kubectl get pods` cible `cka` sans `-n`. *(Pour revenir au namespace par défaut : `kubectl config set-context --current --namespace=default`.)*
:::

:::lang en
**✅ Check:** `kubectl config view --minify | grep namespace` shows `namespace: cka`. From now on, `kubectl get pods` targets `cka` without `-n`. *(To go back to the default namespace: `kubectl config set-context --current --namespace=default`.)*
:::

### step-02

:::lang fr
**Objectif.** Ajouter une **liveness** et une **readiness** probe, et observer Kubernetes réagir.

**🤔 La différence qui tombe à l'examen.** *Liveness échoue → redémarrage du conteneur. Readiness échoue → retrait du Service (pas de redémarrage).* On va provoquer les deux. Crée `probes.yaml` :
:::

:::lang en
**Goal.** Add a **liveness** and a **readiness** probe, and watch Kubernetes react.

**🤔 The exam-critical difference.** *Liveness fails → container restart. Readiness fails → removed from the Service (no restart).* We'll trigger both. Create `probes.yaml`:
:::

```yaml
# probes.yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-probes
  labels: { app: web-probes }
spec:
  containers:
    - name: web
      image: nginx:1.27-alpine
      ports: [{ containerPort: 80 }]
      readinessProbe:                 # prêt quand / ready when : GET / renvoie 200
        httpGet: { path: /, port: 80 }
        initialDelaySeconds: 2
        periodSeconds: 5
      livenessProbe:                  # vivant tant que / alive while : le fichier témoin existe
        exec:
          command: ["cat", "/usr/share/nginx/html/index.html"]
        initialDelaySeconds: 5
        periodSeconds: 5
```

```bash
kubectl apply -f probes.yaml
kubectl get pod web-probes -w        # attends READY 1/1, puis Ctrl+C / wait for READY 1/1, then Ctrl+C
```

:::lang fr
Provoque un échec de **liveness** en supprimant le fichier que la probe vérifie :
:::

:::lang en
Trigger a **liveness** failure by deleting the file the probe checks:
:::

```bash
kubectl exec web-probes -- rm /usr/share/nginx/html/index.html
kubectl get pod web-probes -w        # RESTARTS passe à 1 (liveness a échoué → redémarrage) / RESTARTS goes to 1
kubectl describe pod web-probes | grep -A3 Events   # "Liveness probe failed" + "Killing"/"Started"
```

:::lang fr
**✅ Vérification :** après suppression du fichier, la colonne `RESTARTS` du pod passe à `1` — la liveness a échoué, le conteneur a été **redémarré** (et nginx recrée son `index.html` au boot, donc il repasse `Ready`). `kubectl describe` montre l'événement `Liveness probe failed`. Tu viens de voir la boucle de réconciliation « réparer un conteneur malade » en action.
:::

:::lang en
**✅ Check:** after deleting the file, the pod's `RESTARTS` column goes to `1` — liveness failed, the container was **restarted** (and nginx recreates its `index.html` at boot, so it returns `Ready`). `kubectl describe` shows the `Liveness probe failed` event. You've just seen the "repair a sick container" reconciliation loop in action.
:::

### step-03

:::lang fr
**Objectif.** Déclarer des **requests & limits**, et voir un dépassement mémoire finir en **`OOMKilled`**.

**🤔 Request vs limit.** La **request** aide le **scheduler** (réservation) ; la **limit** est un **plafond** appliqué à l'exécution. On va donner une limite mémoire volontairement basse à un conteneur qui va la dépasser. Crée `oom.yaml` :
:::

:::lang en
**Goal.** Declare **requests & limits**, and watch a memory overrun end in **`OOMKilled`**.

**🤔 Request vs limit.** The **request** helps the **scheduler** (reservation); the **limit** is a **ceiling** enforced at runtime. We'll give a deliberately low memory limit to a container that will exceed it. Create `oom.yaml`:
:::

```yaml
# oom.yaml
apiVersion: v1
kind: Pod
metadata:
  name: hog
spec:
  containers:
    - name: hog
      image: polinux/stress
      command: ["stress"]
      args: ["--vm", "1", "--vm-bytes", "150M", "--vm-hang", "1"]
      resources:
        requests: { memory: "32Mi", cpu: "100m" }
        limits:   { memory: "64Mi", cpu: "200m" }   # 64Mi < 150M demandés → dépassement / requested > limit → overrun
```

```bash
kubectl apply -f oom.yaml
kubectl get pod hog -w        # STATUS oscille CrashLoopBackOff, RESTARTS grimpe / STATUS shows CrashLoopBackOff, RESTARTS climbs
kubectl describe pod hog | grep -iE 'reason|oom'    # Last State: Terminated, Reason: OOMKilled
```

:::lang fr
**✅ Vérification :** le pod `hog` ne se stabilise pas : `kubectl describe` montre `Last State: Terminated` avec `Reason: OOMKilled` — la **limit** mémoire (64Mi) a été dépassée par les 150M que `stress` tente d'allouer, donc le noyau a tué le conteneur, et Kubernetes le relance en boucle (`CrashLoopBackOff`). Monte la limit à `256Mi` (`kubectl apply` de nouveau après édition) → le pod se stabilise. **La limit mémoire est un contrat dur, pas une suggestion.**
:::

:::lang en
**✅ Check:** the `hog` pod never stabilizes: `kubectl describe` shows `Last State: Terminated` with `Reason: OOMKilled` — the memory **limit** (64Mi) was exceeded by the 150M `stress` tries to allocate, so the kernel killed the container, and Kubernetes relaunches it in a loop (`CrashLoopBackOff`). Raise the limit to `256Mi` (re-`kubectl apply` after editing) → the pod stabilizes. **The memory limit is a hard contract, not a suggestion.**
:::

### step-04

:::lang fr
**Objectif.** Utiliser un **init container** (préparation) et un **sidecar** (parallèle) dans un même pod.

**🤔 Init vs sidecar.** L'**init** tourne **d'abord, jusqu'au bout**, puis laisse la place. Le **sidecar** tourne **en même temps** que le conteneur principal, pour toute la vie du pod. Ils partagent un **volume** `emptyDir`. Crée `multi.yaml` :
:::

:::lang en
**Goal.** Use an **init container** (preparation) and a **sidecar** (parallel) in the same pod.

**🤔 Init vs sidecar.** The **init** runs **first, to completion**, then steps aside. The **sidecar** runs **at the same time** as the main container, for the pod's whole life. They share an `emptyDir` **volume**. Create `multi.yaml`:
:::

```yaml
# multi.yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi
spec:
  volumes:
    - name: shared
      emptyDir: {}
  initContainers:
    - name: seed                         # prépare le contenu AVANT le web / seeds content BEFORE the web
      image: busybox:1.36
      command: ["sh", "-c", "echo 'Généré par init at boot' > /data/index.html"]
      volumeMounts: [{ name: shared, mountPath: /data }]
  containers:
    - name: web                          # principal / main
      image: nginx:1.27-alpine
      volumeMounts: [{ name: shared, mountPath: /usr/share/nginx/html }]
    - name: watcher                      # sidecar : tourne en parallèle / runs in parallel
      image: busybox:1.36
      command: ["sh", "-c", "while true; do wc -c /data/index.html; sleep 30; done"]
      volumeMounts: [{ name: shared, mountPath: /data }]
```

```bash
kubectl apply -f multi.yaml
kubectl get pod multi                         # READY 2/2 (web + watcher ; l'init a déjà fini) / READY 2/2
kubectl exec multi -c web -- cat /usr/share/nginx/html/index.html   # "Généré par init at boot"
kubectl logs multi -c watcher                 # la taille du fichier, imprimée par le sidecar / file size, printed by the sidecar
```

:::lang fr
**✅ Vérification :** le pod affiche `READY 2/2` — deux conteneurs applicatifs (`web` + `watcher`) ; l'**init `seed`** n'apparaît **pas** dans le compte car il s'est terminé (voir `kubectl get pod multi -o jsonpath='{.status.initContainerStatuses[0].state}'`). Le `web` sert le fichier **écrit par l'init**, et le **sidecar** `watcher` logue sa taille en parallèle. Tu as les deux patterns multi-conteneurs du programme CKAD.
:::

:::lang en
**✅ Check:** the pod shows `READY 2/2` — two app containers (`web` + `watcher`); the **init `seed`** does **not** appear in the count because it completed (see `kubectl get pod multi -o jsonpath='{.status.initContainerStatuses[0].state}'`). The `web` serves the file **written by the init**, and the **sidecar** `watcher` logs its size in parallel. You have both multi-container patterns from the CKAD program.
:::

### step-05

:::lang fr
**Objectif.** Lancer une tâche ponctuelle avec un **Job**, puis la planifier avec un **CronJob**.

**🤔 `restartPolicy` obligatoire.** Un Job n'est pas un service : son pod doit avoir `restartPolicy: Never` (ou `OnFailure`), jamais `Always`. Crée `job.yaml` :
:::

:::lang en
**Goal.** Run a one-off task with a **Job**, then schedule it with a **CronJob**.

**🤔 Mandatory `restartPolicy`.** A Job isn't a service: its pod must have `restartPolicy: Never` (or `OnFailure`), never `Always`. Create `job.yaml`:
:::

```yaml
# job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  backoffLimit: 2              # nb de reprises avant abandon / retries before giving up
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: pi
          image: perl:5.34
          command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(200)"]
```

```bash
kubectl apply -f job.yaml
kubectl wait --for=condition=complete job/pi --timeout=120s
kubectl logs job/pi | head -c 60      # les premières décimales de pi / the first digits of pi
```

:::lang fr
Ajoute un **CronJob** qui imprime l'heure chaque minute — `cron.yaml` :
:::

:::lang en
Add a **CronJob** that prints the time every minute — `cron.yaml`:
:::

```yaml
# cron.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: heartbeat
spec:
  schedule: "*/1 * * * *"          # chaque minute / every minute
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: date
              image: busybox:1.36
              command: ["sh", "-c", "date; echo tick"]
```

```bash
kubectl apply -f cron.yaml
# attends ~90 s, puis / wait ~90 s, then:
kubectl get jobs                 # un Job "heartbeat-2806..." créé par le CronJob / a Job created by the CronJob
kubectl get cronjob heartbeat    # colonne LAST SCHEDULE renseignée / LAST SCHEDULE column populated
```

:::lang fr
**✅ Vérification :** `kubectl wait ... job/pi` retourne `job.batch/pi condition met`, et `kubectl logs job/pi` imprime les décimales de π — le Job s'est exécuté **une fois jusqu'à réussite** puis s'est arrêté (`COMPLETIONS 1/1`). Après ~1 min, `kubectl get jobs` montre un Job `heartbeat-…` créé automatiquement par le **CronJob** (colonne `LAST SCHEDULE` renseignée). *(Supprime le CronJob quand tu as vu passer une exécution : `kubectl delete cronjob heartbeat`, sinon il tourne chaque minute.)*
:::

:::lang en
**✅ Check:** `kubectl wait ... job/pi` returns `job.batch/pi condition met`, and `kubectl logs job/pi` prints π's digits — the Job ran **once to success** then stopped (`COMPLETIONS 1/1`). After ~1 min, `kubectl get jobs` shows a `heartbeat-…` Job automatically created by the **CronJob** (`LAST SCHEDULE` column populated). *(Delete the CronJob once you've seen a run: `kubectl delete cronjob heartbeat`, otherwise it runs every minute.)*
:::

### step-06

:::lang fr
**Objectif.** Déployer un **DaemonSet** : exactement **un pod par nœud** — le motif des agents.

**🤔 Pourquoi un DaemonSet ?** Un `Deployment` place N répliques n'importe où. Un **DaemonSet** garantit **un** pod sur **chaque** nœud, et **suit** les nœuds (un nouveau nœud → un nouveau pod). C'est ainsi que tournent les collecteurs de logs/métriques. Crée `daemon.yaml` :
:::

:::lang en
**Goal.** Deploy a **DaemonSet**: exactly **one pod per node** — the agent pattern.

**🤔 Why a DaemonSet?** A `Deployment` places N replicas anywhere. A **DaemonSet** guarantees **one** pod on **each** node, and **tracks** nodes (a new node → a new pod). That's how log/metric collectors run. Create `daemon.yaml`:
:::

```yaml
# daemon.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-agent
spec:
  selector:
    matchLabels: { app: node-agent }
  template:
    metadata:
      labels: { app: node-agent }
    spec:
      containers:
        - name: agent
          image: busybox:1.36
          command: ["sh", "-c", "while true; do sleep 3600; done"]
          resources:
            requests: { cpu: "10m", memory: "16Mi" }
```

```bash
kubectl apply -f daemon.yaml
kubectl get daemonset node-agent      # DESIRED 3  CURRENT 3  READY 3 (un par nœud) / one per node
kubectl get pods -l app=node-agent -o wide    # un pod sur chacun des 3 nœuds / one pod on each of the 3 nodes
```

:::lang fr
**✅ Vérification :** `kubectl get daemonset` affiche `DESIRED 3 / READY 3` — Kubernetes a placé **un** pod `node-agent` sur **chacun** des trois nœuds (colonne `NODE` de `get pods -o wide` : trois nœuds distincts). Tu n'as jamais dit « trois » : le DaemonSet **déduit** le compte du nombre de nœuds. C'est la différence de fond avec un Deployment.
:::

:::lang en
**✅ Check:** `kubectl get daemonset` shows `DESIRED 3 / READY 3` — Kubernetes placed **one** `node-agent` pod on **each** of the three nodes (the `NODE` column of `get pods -o wide`: three distinct nodes). You never said "three": the DaemonSet **derives** the count from the number of nodes. That's the fundamental difference from a Deployment.
:::

### step-07

:::lang fr
**Objectif.** Forcer le placement d'un pod avec un **`nodeSelector`**, puis avec une **affinité de nœud**.

**🤔 Labelliser d'abord.** Le placement s'appuie sur des **labels de nœud**. On étiquette un agent, puis on demande à un pod de n'aller **que** là. Labellise :
:::

:::lang en
**Goal.** Force a pod's placement with a **`nodeSelector`**, then with **node affinity**.

**🤔 Label first.** Placement relies on **node labels**. We label an agent, then ask a pod to go **only** there. Label it:
:::

```bash
kubectl label node k3d-ckalab-agent-0 tier=frontend
kubectl get nodes -l tier=frontend        # confirme le nœud labellisé / confirms the labeled node
```

```yaml
# pinned.yaml
apiVersion: v1
kind: Pod
metadata:
  name: pinned
spec:
  nodeSelector:
    tier: frontend               # n'atterrit QUE sur un nœud tier=frontend / lands ONLY on a tier=frontend node
  containers:
    - name: web
      image: nginx:1.27-alpine
```

```bash
kubectl apply -f pinned.yaml
kubectl get pod pinned -o wide            # NODE = k3d-ckalab-agent-0 / scheduled on the labeled node
```

:::lang fr
L'**affinité** exprime la même idée, en plus riche (opérateurs, `preferred`). Voici l'équivalent `required` — `affinity.yaml` :
:::

:::lang en
**Affinity** expresses the same idea, more richly (operators, `preferred`). Here's the `required` equivalent — `affinity.yaml`:
:::

```yaml
# affinity.yaml
apiVersion: v1
kind: Pod
metadata:
  name: affine
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: tier
                operator: In
                values: ["frontend"]
  containers:
    - name: web
      image: nginx:1.27-alpine
```

```bash
kubectl apply -f affinity.yaml
kubectl get pod affine -o wide            # NODE = k3d-ckalab-agent-0 également / also the labeled node
```

:::lang fr
**✅ Vérification :** `pinned` **et** `affine` atterrissent sur `k3d-ckalab-agent-0` (le seul nœud `tier=frontend`). Preuve du caractère **strict** : supprime le label (`kubectl label node k3d-ckalab-agent-0 tier-`), supprime et ré-applique `pinned` → il reste **`Pending`** (`kubectl describe pod pinned` : `didn't match Pod's node affinity/selector`), car **aucun** nœud ne satisfait la contrainte. Remets le label pour débloquer. *(Note : `required...` est bloquant ; `preferredDuringScheduling...` serait seulement une préférence.)*
:::

:::lang en
**✅ Check:** `pinned` **and** `affine` both land on `k3d-ckalab-agent-0` (the only `tier=frontend` node). Proof it's **strict**: remove the label (`kubectl label node k3d-ckalab-agent-0 tier-`), delete and re-apply `pinned` → it stays **`Pending`** (`kubectl describe pod pinned`: `didn't match Pod's node affinity/selector`), because **no** node satisfies the constraint. Put the label back to unblock. *(Note: `required...` is blocking; `preferredDuringScheduling...` would be only a preference.)*
:::

### step-08

:::lang fr
**Objectif.** Réserver un nœud avec un **taint**, et n'y autoriser que les pods qui le **tolèrent**.

**🤔 L'inverse du nodeSelector.** Un `nodeSelector` **attire** un pod. Un **taint** **repousse** tous les pods, sauf ceux qui portent la **toleration** correspondante. C'est le mécanisme pour dédier un nœud (base de données, GPU). Taint un agent :
:::

:::lang en
**Goal.** Reserve a node with a **taint**, and allow only pods that **tolerate** it.

**🤔 The reverse of nodeSelector.** A `nodeSelector` **attracts** a pod. A **taint** **repels** all pods, except those carrying the matching **toleration**. It's the mechanism to dedicate a node (database, GPU). Taint an agent:
:::

```bash
kubectl taint node k3d-ckalab-agent-1 dedicated=db:NoSchedule
```

:::lang fr
Un pod **sans** toleration ne pourra plus être planifié sur `agent-1`. Un pod **avec** la toleration le pourra (mais n'y est pas forcé — la toleration **autorise**, elle n'**attire** pas). Crée `tolerant.yaml` :
:::

:::lang en
A pod **without** a toleration can no longer be scheduled on `agent-1`. A pod **with** the toleration can (but isn't forced there — a toleration **allows**, it doesn't **attract**). Create `tolerant.yaml`:
:::

```yaml
# tolerant.yaml
apiVersion: v1
kind: Pod
metadata:
  name: db
spec:
  tolerations:
    - key: dedicated
      operator: Equal
      value: db
      effect: NoSchedule
  nodeName: k3d-ckalab-agent-1     # on le force ici pour la démo / pin it here for the demo
  containers:
    - name: db
      image: nginx:1.27-alpine
```

```bash
kubectl apply -f tolerant.yaml
kubectl get pod db -o wide         # Running sur k3d-ckalab-agent-1 (toléré) / Running on the tainted node
```

:::lang fr
**✅ Vérification :** le pod `db` tourne bien sur `k3d-ckalab-agent-1` **malgré** le taint, parce qu'il le **tolère**. Preuve inverse : retire `nodeName` et la section `tolerations` d'une copie, applique-la → le scheduler l'envoie sur **un autre** nœud (jamais `agent-1`). *(Retire le taint à la fin : `kubectl taint node k3d-ckalab-agent-1 dedicated=db:NoSchedule-` — le `-` final supprime le taint.)*

**🤔 Combiner attirance + répulsion.** En prod, on **taint** le nœud DB (personne d'autre n'y va) **et** on met une **affinité** sur le pod DB (il y va vraiment). Taint seul = « pas les autres » ; affinité seule = « moi ici » ; les deux = nœud dédié.
:::

:::lang en
**✅ Check:** the `db` pod does run on `k3d-ckalab-agent-1` **despite** the taint, because it **tolerates** it. Reverse proof: remove `nodeName` and the `tolerations` section from a copy, apply it → the scheduler sends it to **another** node (never `agent-1`). *(Remove the taint at the end: `kubectl taint node k3d-ckalab-agent-1 dedicated=db:NoSchedule-` — the trailing `-` deletes the taint.)*

**🤔 Combining attraction + repulsion.** In prod, you **taint** the DB node (nobody else goes there) **and** put an **affinity** on the DB pod (it actually goes there). Taint alone = "not the others"; affinity alone = "me here"; both = a dedicated node.
:::

## pitfalls

:::lang fr
**1. Confondre liveness et readiness.** Mettre une liveness trop agressive (ou pointant vers une dépendance externe) provoque des **redémarrages en boucle**. Règle : liveness = « suis-je cassé ? » (local, tolérant) ; readiness = « puis-je servir ? » (peut dépendre d'une dépendance).

**2. Pas de `initialDelaySeconds` / `startupProbe` sur une appli lente.** La liveness tue le conteneur **avant** qu'il ait fini de démarrer → CrashLoop. Utilise une `startupProbe` ou un `initialDelaySeconds` généreux.

**3. Oublier les requests.** Sans request, le scheduler ne « réserve » rien et le pod est `BestEffort` — le **premier tué** sous pression mémoire. En prod, mets toujours au moins des requests.

**4. `restartPolicy: Always` sur un Job.** Interdit : un Job exige `Never` ou `OnFailure`. L'API refuse `Always`.

**5. Croire qu'une toleration attire.** Une toleration **autorise** un pod sur un nœud tainté ; elle ne l'y **envoie** pas. Pour l'y placer, ajoute une **affinité** (ou `nodeName` en démo).

**6. `nodeSelector`/affinité `required` trop stricts → `Pending`.** Si aucun nœud ne matche, le pod reste `Pending` sans erreur bruyante. Le réflexe : `kubectl describe pod` et lire la section `Events`.

**7. Labelliser/tainter le mauvais nom de nœud.** Les nœuds k3d s'appellent `k3d-<cluster>-server-0`, `-agent-0`… Vérifie avec `kubectl get nodes` avant de labelliser.
:::

:::lang en
**1. Confusing liveness and readiness.** A too-aggressive liveness (or one pointing at an external dependency) causes **restart loops**. Rule: liveness = "am I broken?" (local, forgiving); readiness = "can I serve?" (may depend on a dependency).

**2. No `initialDelaySeconds` / `startupProbe` on a slow app.** Liveness kills the container **before** it finishes starting → CrashLoop. Use a `startupProbe` or a generous `initialDelaySeconds`.

**3. Forgetting requests.** Without a request, the scheduler "reserves" nothing and the pod is `BestEffort` — the **first killed** under memory pressure. In prod, always set at least requests.

**4. `restartPolicy: Always` on a Job.** Forbidden: a Job requires `Never` or `OnFailure`. The API rejects `Always`.

**5. Believing a toleration attracts.** A toleration **allows** a pod on a tainted node; it doesn't **send** it there. To place it there, add an **affinity** (or `nodeName` in a demo).

**6. Too-strict `nodeSelector`/`required` affinity → `Pending`.** If no node matches, the pod stays `Pending` with no loud error. The reflex: `kubectl describe pod` and read the `Events` section.

**7. Labeling/tainting the wrong node name.** k3d nodes are named `k3d-<cluster>-server-0`, `-agent-0`… Check with `kubectl get nodes` before labeling.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu expliques la réaction de Kubernetes à un échec de **liveness** vs **readiness**.
- [ ] Tu déclares **requests & limits** et tu identifies un `OOMKilled` dans `describe`.
- [ ] Tu combines **init container** + **sidecar** avec un volume partagé.
- [ ] Tu lances un **Job** (jusqu'à réussite) et un **CronJob** (planifié).
- [ ] Tu déploies un **DaemonSet** et tu vois un pod par nœud.
- [ ] Tu places un pod avec **`nodeSelector`**/**affinité**, et tu diagnostiques un `Pending`.
- [ ] Tu **taint** un nœud et tu fais atterrir un pod grâce à sa **toleration**.

Sept cases cochées = tu maîtrises le domaine **Workloads & Scheduling** du CKA/CKAD.
:::

:::lang en
You know it works when…

- [ ] You explain Kubernetes' reaction to a **liveness** vs **readiness** failure.
- [ ] You declare **requests & limits** and spot an `OOMKilled` in `describe`.
- [ ] You combine an **init container** + a **sidecar** with a shared volume.
- [ ] You run a **Job** (to success) and a **CronJob** (scheduled).
- [ ] You deploy a **DaemonSet** and see one pod per node.
- [ ] You place a pod with **`nodeSelector`**/**affinity**, and diagnose a `Pending`.
- [ ] You **taint** a node and land a pod there via its **toleration**.

Seven boxes ticked = you've got the CKA/CKAD **Workloads & Scheduling** domain.
:::

## next

:::lang fr
La suite de la track Kubernetes → CKA/CKAD :

1. **Services, networking & ingress** — exposer les workloads : types de Services, Ingress, `NetworkPolicy`, DNS interne.
2. **Stockage** — `PersistentVolume`/`PersistentVolumeClaim`, `StorageClass`, StatefulSet.
3. **Cluster ops, sécurité & RBAC** — kubeconfig/contextes, RBAC, sauvegarde etcd, mises à jour, troubleshooting.
4. **Projet d'entreprise** — déployer une appli multi-tier (ingress + config + stockage + probes + autoscaling) : le livrable de CV.
:::

:::lang en
The rest of the Kubernetes → CKA/CKAD track:

1. **Services, networking & ingress** — expose workloads: Service types, Ingress, `NetworkPolicy`, internal DNS.
2. **Storage** — `PersistentVolume`/`PersistentVolumeClaim`, `StorageClass`, StatefulSet.
3. **Cluster ops, security & RBAC** — kubeconfig/contexts, RBAC, etcd backup, upgrades, troubleshooting.
4. **Enterprise project** — deploy a multi-tier app (ingress + config + storage + probes + autoscaling): the CV deliverable.
:::

## cheatsheet

:::lang fr
Aide-mémoire workloads & scheduling.
:::

:::lang en
Workloads & scheduling cheat sheet.
:::

```bash
# Namespace courant / current namespace
kubectl config set-context --current --namespace=cka

# Probes (dans un container spec) / (in a container spec)
#   livenessProbe  -> échec = redémarrage / fail = restart
#   readinessProbe -> échec = retiré du Service / fail = removed from Service
#   startupProbe   -> protège le démarrage lent / guards slow startup

# Resources
#   requests -> le scheduler réserve / scheduler reserves
#   limits   -> plafond ; mémoire dépassée = OOMKilled / ceiling; memory over = OOMKilled

# Contrôleurs / controllers
kubectl create job pi --image=perl:5.34 -- perl -Mbignum=bpi -wle 'print bpi(50)'
kubectl create cronjob hb --image=busybox:1.36 --schedule="*/1 * * * *" -- date
kubectl apply -f daemonset.yaml         # 1 pod / nœud / 1 pod per node

# Scheduling
kubectl label node <node> tier=frontend           # attirer via nodeSelector/affinité / attract
kubectl label node <node> tier-                    # retirer le label / remove label
kubectl taint node <node> dedicated=db:NoSchedule  # repousser / repel
kubectl taint node <node> dedicated=db:NoSchedule- # retirer le taint / remove taint

# Diagnostic
kubectl describe pod <p> | sed -n '/Events/,$p'    # pourquoi Pending/CrashLoop ? / why?
kubectl get pods -o wide                           # sur quel nœud ? / which node?
```

## resources

:::lang fr
- [Probes (liveness/readiness/startup)](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).
- [Requests & limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) et [QoS](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/).
- [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/), [CronJobs](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/), [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/).
- [Assigner des pods aux nœuds](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) et [taints & tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/).
:::

:::lang en
- [Probes (liveness/readiness/startup)](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).
- [Requests & limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) and [QoS](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/).
- [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/), [CronJobs](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/), [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/).
- [Assigning pods to nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) and [taints & tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/).
:::

## troubleshooting

:::lang fr
**Le pod redémarre en boucle (`CrashLoopBackOff`) après ajout d'une liveness.** La probe est trop stricte ou démarre trop tôt. Augmente `initialDelaySeconds`, ajoute une `startupProbe`, ou vérifie la commande/URL sondée.

**`OOMKilled` alors que l'appli semble légère.** La `limit` mémoire est trop basse pour les pics. Regarde la conso réelle (`kubectl top pod`, metrics-server est présent sur k3s) et ajuste la limit.

**Un Job reste `Running` sans finir.** Sa commande ne se termine jamais (un `sleep infinity`, un serveur). Un Job attend un process qui **rend la main** ; corrige la commande.

**`kubectl top` renvoie une erreur.** metrics-server met ~1 min à collecter après la création du cluster. Réessaie, ou `kubectl -n kube-system get deploy metrics-server`.

**Le pod reste `Pending`.** `kubectl describe pod` → section `Events`. Causes fréquentes : `nodeSelector`/affinité qui ne matche aucun nœud, tous les nœuds taintés, ou ressources insuffisantes (`Insufficient cpu/memory`).

**Le DaemonSet ne met pas de pod sur le nœud serveur.** Vérifie qu'aucun taint ne le repousse (`kubectl describe node k3d-ckalab-server-0 | grep Taints`). Sur k3s vanilla, le serveur est schedulable ; si tu l'as tainté à l'étape 8, le DaemonSet aura besoin d'une toleration.
:::

:::lang en
**The pod restart-loops (`CrashLoopBackOff`) after adding a liveness.** The probe is too strict or starts too early. Increase `initialDelaySeconds`, add a `startupProbe`, or check the probed command/URL.

**`OOMKilled` although the app seems light.** The memory `limit` is too low for spikes. Look at real usage (`kubectl top pod`, metrics-server is present on k3s) and adjust the limit.

**A Job stays `Running` without finishing.** Its command never terminates (a `sleep infinity`, a server). A Job expects a process that **returns**; fix the command.

**`kubectl top` errors.** metrics-server takes ~1 min to collect after cluster creation. Retry, or `kubectl -n kube-system get deploy metrics-server`.

**The pod stays `Pending`.** `kubectl describe pod` → `Events` section. Common causes: `nodeSelector`/affinity matching no node, all nodes tainted, or insufficient resources (`Insufficient cpu/memory`).

**The DaemonSet puts no pod on the server node.** Check no taint repels it (`kubectl describe node k3d-ckalab-server-0 | grep Taints`). On vanilla k3s the server is schedulable; if you tainted it in step 8, the DaemonSet will need a toleration.
:::
