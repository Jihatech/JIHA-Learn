---
# — Identité (ne change JAMAIS une fois publié) —
id: kubernetes-cluster-ops-rbac
slug: kubernetes-cluster-ops-rbac
order: 17
status: published

# — Titres & accroches (bilingue) —
title_fr: "Kubernetes — cluster ops, sécurité & RBAC"
title_en: "Kubernetes — cluster ops, security & RBAC"
tagline_fr: "Contexts, ServiceAccount, RBAC, drain, etcd, debug."
tagline_en: "Contexts, ServiceAccount, RBAC, drain, etcd, debug."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 210
repo: "kubernetes/kubernetes"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [kubernetes-stockage]
next: [traefik]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [kubeconfig-contexts, serviceaccount, rbac-role-binding, clusterrole, cordon-drain, etcd-backup, troubleshooting]
concepts_en: [kubeconfig-contexts, serviceaccount, rbac-role-binding, clusterrole, cordon-drain, etcd-backup, troubleshooting]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "L'administration d'un cluster Kubernetes en local sur k3d : kubeconfig et contexts, ServiceAccount, RBAC (Role/RoleBinding, ClusterRole), maintenance de nœud (cordon/drain), sauvegarde etcd (concept + analogue k3s), et la boîte à outils de troubleshooting. Les domaines Cluster Architecture, Security et Troubleshooting du CKA."
og_description_en: "Administering a Kubernetes cluster locally on k3d: kubeconfig and contexts, ServiceAccount, RBAC (Role/RoleBinding, ClusterRole), node maintenance (cordon/drain), etcd backup (concept + k3s analog), and the troubleshooting toolkit. The CKA Cluster Architecture, Security and Troubleshooting domains."
---

## intro

:::lang fr
Jusqu'ici tu **déployais** des applis. Ce guide te fait passer de l'autre côté : **administrer** le cluster. C'est le cœur de l'examen **CKA** (Certified Kubernetes **Administrator**) — moins de YAML applicatif, plus de « qui a le droit de faire quoi ? comment mettre un nœud en maintenance sans couper le service ? comment sauvegarder l'état du cluster ? pourquoi ce composant est-il en panne ? »

Ce guide couvre trois domaines CKA d'un coup : **Cluster Architecture** (kubeconfig, **contexts**, maintenance de nœud), **Security** (**ServiceAccount**, **RBAC**), et **Troubleshooting** (la démarche de diagnostic). Tu apprendras à naviguer entre clusters/namespaces, à donner des droits **précis** avec Role/RoleBinding et ClusterRole, à **drainer** un nœud proprement, à comprendre la **sauvegarde etcd**, et à **débugger** méthodiquement.

On travaille en **local sur k3d** (cluster **multi-nœuds** pour le drain). Une honnêteté d'emblée : la sauvegarde **etcd** de l'examen se fait avec `etcdctl` sur un cluster **kubeadm** ; k3d/k3s utilise par défaut **SQLite**, pas etcd. On enseigne donc la **procédure d'examen** (commandes `etcdctl`) **et** son analogue k3s — sans prétendre l'exécuter à l'identique sur ta machine.

**Pour qui c'est :** tu as les guides **fondamentaux**, **workloads**, **networking** et **stockage**, et tu vises le **CKA**.

**Quand ce n'est PAS le bon choix :**

- Tu débutes sur Kubernetes → fais d'abord les guides précédents.
- Tu veux le projet fil-rouge → c'est l'étape suivante et finale de la track.
:::

:::lang en
So far you **deployed** apps. This guide moves you to the other side: **administering** the cluster. It's the heart of the **CKA** exam (Certified Kubernetes **Administrator**) — less app YAML, more "who's allowed to do what? how do you take a node down for maintenance without cutting service? how do you back up the cluster's state? why is this component down?"

This guide covers three CKA domains at once: **Cluster Architecture** (kubeconfig, **contexts**, node maintenance), **Security** (**ServiceAccount**, **RBAC**), and **Troubleshooting** (the diagnostic method). You'll learn to navigate between clusters/namespaces, grant **precise** rights with Role/RoleBinding and ClusterRole, **drain** a node cleanly, understand **etcd backup**, and **debug** methodically.

We work **locally on k3d** (a **multi-node** cluster for the drain). Honesty up front: the exam's **etcd** backup uses `etcdctl` on a **kubeadm** cluster; k3d/k3s uses **SQLite** by default, not etcd. So we teach the **exam procedure** (`etcdctl` commands) **and** its k3s analog — without pretending to run it identically on your machine.

**Who it's for:** you have the **fundamentals**, **workloads**, **networking** and **storage** guides, and you're aiming for the **CKA**.

**When it's NOT the right choice:**

- You're new to Kubernetes → do the earlier guides first.
- You want the capstone → that's the next and final step of the track.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Lire et manipuler le **kubeconfig** : **contexts**, changer de cluster/namespace.
- Créer un **ServiceAccount** et générer un **token**.
- Écrire un **Role** + **RoleBinding** (namespacé) et tester avec **`kubectl auth can-i`**.
- Écrire un **ClusterRole** + **ClusterRoleBinding** (portée cluster).
- Mettre un nœud en maintenance : **`cordon`**, **`drain`**, **`uncordon`**.
- Expliquer la **sauvegarde/restauration etcd** (procédure d'examen + analogue k3s).
- Appliquer une **démarche de troubleshooting** (events, logs, describe, santé des composants).
:::

:::lang en
By the end of this guide, you'll know how to:

- Read and manipulate the **kubeconfig**: **contexts**, switch cluster/namespace.
- Create a **ServiceAccount** and generate a **token**.
- Write a **Role** + **RoleBinding** (namespaced) and test with **`kubectl auth can-i`**.
- Write a **ClusterRole** + **ClusterRoleBinding** (cluster scope).
- Put a node into maintenance: **`cordon`**, **`drain`**, **`uncordon`**.
- Explain **etcd backup/restore** (exam procedure + k3s analog).
- Apply a **troubleshooting method** (events, logs, describe, component health).
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les quatre guides Kubernetes précédents acquis.
- **Docker** lancé, **k3d** et **kubectl** installés.

On crée un cluster **multi-nœuds** (1 serveur + 1 agent) pour pouvoir drainer un nœud sans tout couper :
:::

:::lang en
You should have:

- The four previous Kubernetes guides under your belt.
- **Docker** running, **k3d** and **kubectl** installed.

We create a **multi-node** cluster (1 server + 1 agent) to be able to drain a node without cutting everything:
:::

```bash
# (optionnel) libère de la RAM / (optional) free RAM
# k3d cluster delete stolab netlab ckalab
k3d cluster create opslab --agents 1
kubectl create namespace ops
kubectl config set-context --current --namespace=ops
```

## concepts

:::lang fr
Administrer, c'est répondre à trois questions : **qui suis-je** (et sur quel cluster), **qui a le droit**, et **comment garder le cluster sain**.

**Le kubeconfig et les contexts.** Ton fichier `~/.kube/config` décrit des **clusters**, des **users** (identités) et des **contexts** qui associent *cluster + user + namespace*. Le **context courant** détermine à qui tu parles. `kubectl config use-context` bascule d'un cluster à l'autre — indispensable quand on en gère plusieurs.

**L'authentification vs l'autorisation.** Kubernetes **authentifie** (qui es-tu ? via certificat, token, ServiceAccount) puis **autorise** (as-tu le droit ? via **RBAC**). Un **ServiceAccount** (SA) est l'identité d'un **pod** (les process dans le cluster) ; un **user** est une identité humaine (gérée hors cluster).

**RBAC — quatre objets, deux portées.**

- **`Role`** : un ensemble de **permissions** (verbes × ressources), **dans un namespace**.
- **`RoleBinding`** : **attribue** un Role (ou un ClusterRole) à un sujet (user, group, SA), **dans un namespace**.
- **`ClusterRole`** : des permissions **à l'échelle du cluster** (ou sur des ressources non-namespacées : nodes, PV…).
- **`ClusterRoleBinding`** : attribue un ClusterRole **partout**.

La règle : commence **au plus étroit** (Role namespacé), n'élargis (ClusterRole) que si nécessaire. `kubectl auth can-i` te dit si un sujet a un droit, **sans** l'exercer.

**La maintenance de nœud.** Avant d'éteindre un nœud (mise à jour, panne matérielle), on le **`cordon`** (« ne planifie plus rien ici ») puis on le **`drain`** (« évacue les pods vers d'autres nœuds »). Après, **`uncordon`** le remet en service. C'est ainsi qu'on met à jour un cluster **sans coupure**.

**La sauvegarde etcd.** **etcd** est la base de données clé-valeur qui **stocke tout l'état** du cluster (dans un cluster kubeadm). La sauvegarder (`etcdctl snapshot save`) = pouvoir **reconstruire** le cluster. *(Sur k3s, l'état est dans SQLite par défaut, ou etcd en mode HA ; l'outil devient `k3s etcd-snapshot`.)*

**Le troubleshooting** n'est pas une commande mais une **démarche** : partir du symptôme (`get`), lire les **events** et l'état (`describe`), puis les **logs**, et remonter la chaîne (pod → node → composant système).
:::

:::lang en
Administering means answering three questions: **who am I** (and on which cluster), **who's allowed**, and **how do I keep the cluster healthy**.

**The kubeconfig and contexts.** Your `~/.kube/config` file describes **clusters**, **users** (identities) and **contexts** that pair *cluster + user + namespace*. The **current context** determines who you talk to. `kubectl config use-context` switches from one cluster to another — essential when managing several.

**Authentication vs authorization.** Kubernetes **authenticates** (who are you? via certificate, token, ServiceAccount) then **authorizes** (are you allowed? via **RBAC**). A **ServiceAccount** (SA) is the identity of a **pod** (in-cluster processes); a **user** is a human identity (managed outside the cluster).

**RBAC — four objects, two scopes.**

- **`Role`**: a set of **permissions** (verbs × resources), **in a namespace**.
- **`RoleBinding`**: **grants** a Role (or a ClusterRole) to a subject (user, group, SA), **in a namespace**.
- **`ClusterRole`**: permissions **cluster-wide** (or on non-namespaced resources: nodes, PVs…).
- **`ClusterRoleBinding`**: grants a ClusterRole **everywhere**.

The rule: start **narrowest** (namespaced Role), widen (ClusterRole) only if needed. `kubectl auth can-i` tells you whether a subject has a right, **without** exercising it.

**Node maintenance.** Before shutting a node down (upgrade, hardware failure), you **`cordon`** it ("schedule nothing new here") then **`drain`** it ("evict pods to other nodes"). Afterward, **`uncordon`** puts it back in service. That's how you upgrade a cluster **without downtime**.

**etcd backup.** **etcd** is the key-value database that **stores all cluster state** (in a kubeadm cluster). Backing it up (`etcdctl snapshot save`) = being able to **rebuild** the cluster. *(On k3s, state is in SQLite by default, or etcd in HA mode; the tool becomes `k3s etcd-snapshot`.)*

**Troubleshooting** is not a command but a **method**: start from the symptom (`get`), read **events** and state (`describe`), then **logs**, and walk up the chain (pod → node → system component).
:::

:::figure kubernetes-rbac
caption_fr: "Schéma 1. Un sujet (user/SA) reçoit un Role via un RoleBinding (namespacé) ou un ClusterRole via un ClusterRoleBinding (cluster). auth can-i teste le droit."
caption_en: "Figure 1. A subject (user/SA) gets a Role via a RoleBinding (namespaced) or a ClusterRole via a ClusterRoleBinding (cluster). auth can-i tests the right."
:::

:::lang fr
On avance : contexts → ServiceAccount → Role/RoleBinding → ClusterRole → cordon/drain → etcd (concept) → troubleshooting.
:::

:::lang en
We'll go: contexts → ServiceAccount → Role/RoleBinding → ClusterRole → cordon/drain → etcd (concept) → troubleshooting.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Lire le **kubeconfig** et manipuler les **contexts**.

**🤔 Le context = ton adresse.** Il dit *quel cluster, quel user, quel namespace*. Explore :
:::

:::lang en
**Goal.** Read the **kubeconfig** and manipulate **contexts**.

**🤔 The context = your address.** It says *which cluster, which user, which namespace*. Explore:
:::

```bash
kubectl config get-contexts                 # liste ; * = courant / list; * = current
kubectl config current-context              # k3d-opslab
kubectl config set-context --current --namespace=ops
kubectl config view --minify -o jsonpath='{..namespace}{"\n"}'   # ops
```

:::lang fr
**✅ Vérification :** `kubectl config get-contexts` liste `k3d-opslab` avec `*` (courant), et le `jsonpath` confirme `ops` comme namespace du context. **Retiens `use-context`** : si tu avais gardé `stolab`/`netlab`, tu basculerais avec `kubectl config use-context k3d-stolab`. À l'examen, on jongle entre clusters — un mauvais context, et tu modifies le mauvais cluster.
:::

:::lang en
**✅ Check:** `kubectl config get-contexts` lists `k3d-opslab` with `*` (current), and the `jsonpath` confirms `ops` as the context's namespace. **Remember `use-context`**: had you kept `stolab`/`netlab`, you'd switch with `kubectl config use-context k3d-stolab`. In the exam you juggle clusters — a wrong context, and you change the wrong cluster.
:::

### step-02

:::lang fr
**Objectif.** Créer un **ServiceAccount** et générer un **token** (l'identité d'un pod/robot).

**🤔 Depuis Kubernetes 1.24.** Un SA ne crée **plus** de Secret-token automatiquement. On génère un token **à la demande** avec `kubectl create token`. Crée le SA :
:::

:::lang en
**Goal.** Create a **ServiceAccount** and generate a **token** (a pod/robot identity).

**🤔 Since Kubernetes 1.24.** A SA no longer auto-creates a Secret token. You generate a token **on demand** with `kubectl create token`. Create the SA:
:::

```bash
kubectl create serviceaccount deployer
kubectl get serviceaccount deployer
kubectl create token deployer               # imprime un JWT (court-lived) / prints a (short-lived) JWT
```

:::lang fr
**✅ Vérification :** `kubectl get serviceaccount deployer` montre le SA, et `kubectl create token deployer` imprime un **JWT** (une longue chaîne `eyJ…`). Ce SA n'a encore **aucun droit** particulier au-delà du minimum : on va lui en donner à l'étape suivante. Un SA est l'identité qu'un pod porte via `spec.serviceAccountName`.
:::

:::lang en
**✅ Check:** `kubectl get serviceaccount deployer` shows the SA, and `kubectl create token deployer` prints a **JWT** (a long `eyJ…` string). This SA has **no** special rights yet beyond the minimum: we'll grant some in the next step. A SA is the identity a pod carries via `spec.serviceAccountName`.
:::

### step-03

:::lang fr
**Objectif.** Donner des droits **précis** avec un **Role** + **RoleBinding**, et vérifier avec **`auth can-i`**.

**🤔 Le plus étroit possible.** On autorise le SA `deployer` à **lire** les pods **du namespace `ops` uniquement** — rien d'autre. Crée `rbac.yaml` :
:::

:::lang en
**Goal.** Grant **precise** rights with a **Role** + **RoleBinding**, and verify with **`auth can-i`**.

**🤔 As narrow as possible.** We allow the `deployer` SA to **read** pods **in the `ops` namespace only** — nothing else. Create `rbac.yaml`:
:::

```yaml
# rbac.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: ops
rules:
  - apiGroups: [""]                 # core API group / groupe d'API "core"
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: deployer-reads-pods
  namespace: ops
subjects:
  - kind: ServiceAccount
    name: deployer
    namespace: ops
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

```bash
kubectl apply -f rbac.yaml
# Test SANS exercer le droit / test WITHOUT exercising the right :
kubectl auth can-i list pods --as=system:serviceaccount:ops:deployer -n ops     # yes
kubectl auth can-i delete pods --as=system:serviceaccount:ops:deployer -n ops   # no
kubectl auth can-i list pods --as=system:serviceaccount:ops:deployer -n default # no (autre namespace)
```

:::lang fr
**✅ Vérification :** `auth can-i list pods --as=...:deployer -n ops` renvoie **`yes`**, tandis que `delete pods` renvoie **`no`** (le Role n'accorde que get/list/watch) et `list pods -n default` renvoie **`no`** (le Role est **namespacé** sur `ops`). Tu viens de donner un droit **chirurgical** : un verbe, une ressource, un namespace. C'est le principe du **moindre privilège**, et `--as` te permet de tester **l'identité d'un autre** sans te connecter en tant que lui.
:::

:::lang en
**✅ Check:** `auth can-i list pods --as=...:deployer -n ops` returns **`yes`**, while `delete pods` returns **`no`** (the Role only grants get/list/watch) and `list pods -n default` returns **`no`** (the Role is **namespaced** to `ops`). You've just granted a **surgical** right: one verb, one resource, one namespace. That's **least privilege**, and `--as` lets you test **someone else's identity** without logging in as them.
:::

### step-04

:::lang fr
**Objectif.** Accorder un droit **à l'échelle du cluster** avec un **ClusterRole** + **ClusterRoleBinding**.

**🤔 Quand cluster-wide ?** Pour des ressources **non-namespacées** (comme les **nodes**) ou un droit valable **dans tous les namespaces**. Ici : autoriser `deployer` à **lister les nodes** (ressource cluster). Crée `clusterrbac.yaml` :
:::

:::lang en
**Goal.** Grant a **cluster-wide** right with a **ClusterRole** + **ClusterRoleBinding**.

**🤔 When cluster-wide?** For **non-namespaced** resources (like **nodes**) or a right valid **across all namespaces**. Here: allow `deployer` to **list nodes** (a cluster resource). Create `clusterrbac.yaml`:
:::

```yaml
# clusterrbac.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: node-reader
rules:
  - apiGroups: [""]
    resources: ["nodes"]
    verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: deployer-reads-nodes
subjects:
  - kind: ServiceAccount
    name: deployer
    namespace: ops
roleRef:
  kind: ClusterRole
  name: node-reader
  apiGroup: rbac.authorization.k8s.io
```

```bash
kubectl apply -f clusterrbac.yaml
kubectl auth can-i list nodes --as=system:serviceaccount:ops:deployer     # yes (ressource cluster)
kubectl auth can-i list pods  --as=system:serviceaccount:ops:deployer -n default   # toujours no / still no
```

:::lang fr
**✅ Vérification :** `auth can-i list nodes --as=...:deployer` renvoie désormais **`yes`** — les nodes sont une ressource **cluster**, il fallait un **ClusterRoleBinding**. Mais `list pods -n default` reste **`no`** : le ClusterRole ne parle que des nodes. Distinction clé de l'examen : **Role/RoleBinding** = un namespace ; **ClusterRole/ClusterRoleBinding** = tout le cluster et les ressources non-namespacées.
:::

:::lang en
**✅ Check:** `auth can-i list nodes --as=...:deployer` now returns **`yes`** — nodes are a **cluster** resource, requiring a **ClusterRoleBinding**. But `list pods -n default` stays **`no`**: the ClusterRole only covers nodes. Key exam distinction: **Role/RoleBinding** = one namespace; **ClusterRole/ClusterRoleBinding** = the whole cluster and non-namespaced resources.
:::

### step-05

:::lang fr
**Objectif.** Mettre un nœud en maintenance : **`cordon`** → **`drain`** → **`uncordon`**.

**🤔 Évacuer sans couper.** On déploie d'abord une appli répartie, puis on draine l'**agent** : ses pods migrent vers le serveur, le service continue. Prépare une cible :
:::

:::lang en
**Goal.** Put a node into maintenance: **`cordon`** → **`drain`** → **`uncordon`**.

**🤔 Evict without cutting.** We first deploy a spread app, then drain the **agent**: its pods migrate to the server, service continues. Prepare a target:
:::

```bash
kubectl create deployment web --image=nginx:1.27-alpine --replicas=4
kubectl get pods -o wide          # répartis sur les 2 nœuds / spread over the 2 nodes

# 1) cordon : plus de nouveaux pods sur l'agent / no new pods on the agent
kubectl cordon k3d-opslab-agent-0
kubectl get nodes                 # agent-0 : SchedulingDisabled

# 2) drain : évacue les pods de l'agent / evict the agent's pods
kubectl drain k3d-opslab-agent-0 --ignore-daemonsets --delete-emptydir-data
kubectl get pods -o wide          # tous les web-* sont maintenant sur le serveur / all on the server

# 3) uncordon : remet l'agent en service / put the agent back
kubectl uncordon k3d-opslab-agent-0
```

:::lang fr
**✅ Vérification :** après `cordon`, `kubectl get nodes` montre `k3d-opslab-agent-0` en **`SchedulingDisabled`**. Après `drain`, `kubectl get pods -o wide` ne montre **plus aucun** pod `web-*` sur l'agent (ils ont été recréés sur le serveur) — et l'appli n'a jamais été totalement coupée. `--ignore-daemonsets` est **obligatoire** (les DaemonSets ne se drainent pas), et `--delete-emptydir-data` autorise l'éviction de pods à volume éphémère. Après `uncordon`, l'agent redevient `Ready` et **schedulable**. C'est la procédure exacte d'une **mise à jour de nœud** en prod.
:::

:::lang en
**✅ Check:** after `cordon`, `kubectl get nodes` shows `k3d-opslab-agent-0` as **`SchedulingDisabled`**. After `drain`, `kubectl get pods -o wide` shows **no more** `web-*` pods on the agent (recreated on the server) — and the app was never fully down. `--ignore-daemonsets` is **mandatory** (DaemonSets don't drain), and `--delete-emptydir-data` allows evicting pods with ephemeral volumes. After `uncordon`, the agent is `Ready` and **schedulable** again. That's the exact procedure for a **node upgrade** in prod.
:::

### step-06

:::lang fr
**Objectif.** Comprendre la **sauvegarde/restauration etcd** — la procédure d'examen, et son analogue k3s.

**🤔 Pourquoi c'est vital.** **etcd** stocke **tout** l'état du cluster. Le perdre = perdre le cluster. Sur un cluster **kubeadm** (celui de l'examen CKA), la sauvegarde se fait avec **`etcdctl`** :
:::

:::lang en
**Goal.** Understand **etcd backup/restore** — the exam procedure, and its k3s analog.

**🤔 Why it's vital.** **etcd** stores **all** cluster state. Losing it = losing the cluster. On a **kubeadm** cluster (the CKA exam's), backup is done with **`etcdctl`**:
:::

```bash
# Procédure d'EXAMEN (cluster kubeadm) — NE tourne PAS tel quel sur k3d
# EXAM procedure (kubeadm cluster) — does NOT run as-is on k3d
ETCDCTL_API=3 etcdctl snapshot save /opt/snapshot.db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key

ETCDCTL_API=3 etcdctl snapshot status /opt/snapshot.db -w table   # vérifier le snapshot / verify
# Restauration : etcdctl snapshot restore /opt/snapshot.db --data-dir /var/lib/etcd-restore
#   puis pointer le manifeste static pod etcd vers le nouveau data-dir / then repoint etcd static pod
```

:::lang fr
Sur **k3s/k3d**, l'état est dans **SQLite** par défaut (pas d'etcd), ou dans un etcd embarqué en mode HA. L'outil devient **`k3s etcd-snapshot`** (uniquement en mode etcd) :
:::

:::lang en
On **k3s/k3d**, state is in **SQLite** by default (no etcd), or in an embedded etcd in HA mode. The tool becomes **`k3s etcd-snapshot`** (etcd mode only):
:::

```bash
# Analogue k3s (cluster créé avec --cluster-init / etcd HA) :
# k3s analog (cluster created with --cluster-init / etcd HA):
#   k3s etcd-snapshot save --name mon-snapshot
#   k3s etcd-snapshot ls
```

:::lang fr
**✅ Vérification :** tu sais **réciter** la commande `etcdctl snapshot save` avec ses **quatre** paramètres critiques (`--endpoints`, `--cacert`, `--cert`, `--key`) et où trouver les certs (`/etc/kubernetes/pki/etcd/`), tu sais **vérifier** un snapshot (`snapshot status`), et tu sais que la **restauration** crée un nouveau data-dir vers lequel repointer etcd. Tu sais aussi que **k3s diffère** (SQLite/`k3s etcd-snapshot`). *(On ne l'exécute pas ici : k3d n'a pas d'etcd en mode par défaut. C'est le seul point de la track qu'on ne peut pas jouer en local à l'identique.)*
:::

:::lang en
**✅ Check:** you can **recite** the `etcdctl snapshot save` command with its **four** critical parameters (`--endpoints`, `--cacert`, `--cert`, `--key`) and where to find the certs (`/etc/kubernetes/pki/etcd/`), you can **verify** a snapshot (`snapshot status`), and you know **restore** creates a new data-dir to repoint etcd at. You also know **k3s differs** (SQLite/`k3s etcd-snapshot`). *(We don't run it here: k3d has no etcd in default mode. It's the only point of the track we can't replay locally as-is.)*
:::

### step-07

:::lang fr
**Objectif.** Appliquer une **démarche de troubleshooting** sur un pod cassé.

**🤔 Une méthode, pas une commande.** On casse volontairement un pod (mauvaise image) et on **remonte la piste** : `get` (symptôme) → `describe` (events) → `logs`. Provoque la panne :
:::

:::lang en
**Goal.** Apply a **troubleshooting method** on a broken pod.

**🤔 A method, not a command.** We deliberately break a pod (bad image) and **follow the trail**: `get` (symptom) → `describe` (events) → `logs`. Trigger the failure:
:::

```bash
kubectl run broken --image=nginx:does-not-exist-999
kubectl get pod broken                          # STATUS ImagePullBackOff / ErrImagePull
kubectl describe pod broken | sed -n '/Events/,$p'   # "Failed to pull image ... not found"

# La boîte à outils complète / the full toolkit :
kubectl get events --sort-by=.lastTimestamp     # les événements récents du namespace / recent namespace events
kubectl logs broken                             # erreur "container is waiting to start" (pas de logs : jamais démarré) / "container is waiting to start" error (no logs: never ran)
kubectl get componentstatuses 2>/dev/null || kubectl get --raw='/readyz?verbose' | head
```

:::lang fr
**✅ Vérification :** `kubectl get pod broken` montre **`ImagePullBackOff`**, et `describe … Events` explique la cause exacte : `Failed to pull image … not found`. Tu as diagnostiqué **sans deviner** : le symptôme (`get`) t'a orienté, les **events** (`describe`) ont donné la cause. Mémorise la chaîne — pod cassé : `describe` d'abord (events), puis `logs` **si le conteneur a démarré** (ici `logs` renvoie une erreur « container is waiting to start », car l'image n'a jamais pu être tirée). Pour la santé du cluster : `kubectl get nodes`, `kubectl -n kube-system get pods`, et `kubectl get --raw='/readyz?verbose'`. *(Nettoyage : `kubectl delete pod broken`.)*
:::

:::lang en
**✅ Check:** `kubectl get pod broken` shows **`ImagePullBackOff`**, and `describe … Events` explains the exact cause: `Failed to pull image … not found`. You diagnosed **without guessing**: the symptom (`get`) pointed you, the **events** (`describe`) gave the cause. Memorize the chain — broken pod: `describe` first (events), then `logs` **if the container started** (here `logs` returns a "container is waiting to start" error, since the image could never be pulled). For cluster health: `kubectl get nodes`, `kubectl -n kube-system get pods`, and `kubectl get --raw='/readyz?verbose'`. *(Cleanup: `kubectl delete pod broken`.)*
:::

## pitfalls

:::lang fr
**1. Se tromper de context.** Modifier le mauvais cluster/namespace est l'erreur d'admin classique (et coûteuse à l'examen). `kubectl config current-context` **avant** toute action destructrice.

**2. Attendre un Secret-token de SA.** Depuis 1.24, il faut `kubectl create token <sa>` (ou un Secret de type `kubernetes.io/service-account-token` explicite). Ne cherche pas un token auto-généré.

**3. Confondre les portées RBAC.** Un `Role` ne marche que dans **son** namespace. Pour les nodes/PV (non-namespacés) ou tous les namespaces → **ClusterRole**. Un RoleBinding vers un ClusterRole limite ce dernier **au namespace** du binding.

**4. `apiGroups: [""]` oublié.** Les ressources « core » (pods, services, configmaps…) sont dans le groupe **vide** `""`. L'oublier = permission qui ne s'applique pas.

**5. `drain` sans `--ignore-daemonsets`.** Le drain **échoue** s'il y a des pods de DaemonSet (il y en a toujours). Le flag est quasi obligatoire ; ajoute `--delete-emptydir-data` si des pods ont un `emptyDir`.

**6. Oublier `uncordon`.** Après maintenance, un nœud laissé `cordon` reste `SchedulingDisabled` — il ne reprend aucun pod. Toujours `uncordon` à la fin.

**7. Croire pouvoir sauvegarder etcd sur k3d par défaut.** Il n'y a **pas** d'etcd (c'est SQLite). La commande `etcdctl` de l'examen suppose un cluster kubeadm ; sur k3s HA, c'est `k3s etcd-snapshot`.
:::

:::lang en
**1. Wrong context.** Modifying the wrong cluster/namespace is the classic (and costly, in the exam) admin mistake. `kubectl config current-context` **before** any destructive action.

**2. Expecting a SA Secret token.** Since 1.24, you need `kubectl create token <sa>` (or an explicit `kubernetes.io/service-account-token` Secret). Don't look for an auto-generated token.

**3. Confusing RBAC scopes.** A `Role` only works in **its** namespace. For nodes/PVs (non-namespaced) or all namespaces → **ClusterRole**. A RoleBinding to a ClusterRole limits it **to the binding's namespace**.

**4. Forgetting `apiGroups: [""]`.** "core" resources (pods, services, configmaps…) live in the **empty** group `""`. Forgetting it = a permission that doesn't apply.

**5. `drain` without `--ignore-daemonsets`.** The drain **fails** if there are DaemonSet pods (there always are). The flag is near-mandatory; add `--delete-emptydir-data` if pods have an `emptyDir`.

**6. Forgetting `uncordon`.** After maintenance, a node left `cordon`ed stays `SchedulingDisabled` — it takes no pods. Always `uncordon` at the end.

**7. Believing you can back up etcd on default k3d.** There's **no** etcd (it's SQLite). The exam's `etcdctl` command assumes a kubeadm cluster; on k3s HA, it's `k3s etcd-snapshot`.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu listes les **contexts** et tu changes de cluster/namespace en connaissance de cause.
- [ ] Tu crées un **ServiceAccount** et génères son **token**.
- [ ] Tu écris un **Role + RoleBinding** et tu le testes avec **`auth can-i`**.
- [ ] Tu écris un **ClusterRole + ClusterRoleBinding** et tu expliques la différence de portée.
- [ ] Tu fais **`cordon` → `drain` → `uncordon`** proprement.
- [ ] Tu récites la sauvegarde **etcd** (`etcdctl snapshot save` + certs) et l'analogue k3s.
- [ ] Tu diagnostiques un pod cassé par **`describe`/events** avant de deviner.

Sept cases cochées = tu tiens les domaines **Cluster Architecture, Security & Troubleshooting** du CKA.
:::

:::lang en
You know it works when…

- [ ] You list **contexts** and switch cluster/namespace deliberately.
- [ ] You create a **ServiceAccount** and generate its **token**.
- [ ] You write a **Role + RoleBinding** and test it with **`auth can-i`**.
- [ ] You write a **ClusterRole + ClusterRoleBinding** and explain the scope difference.
- [ ] You do **`cordon` → `drain` → `uncordon`** cleanly.
- [ ] You recite the **etcd** backup (`etcdctl snapshot save` + certs) and the k3s analog.
- [ ] You diagnose a broken pod via **`describe`/events** before guessing.

Seven boxes ticked = you hold the CKA **Cluster Architecture, Security & Troubleshooting** domains.
:::

## next

:::lang fr
Tu as bouclé la **couverture de contenu** de la track Kubernetes → CKA/CKAD. Il reste le **projet d'entreprise** :

- **Projet d'entreprise** — déployer une **appli multi-tier** sur Kubernetes : Deployment + Service + **Ingress**, **ConfigMap/Secret**, **PVC** pour la base, **probes** et **HPA** (autoscaling), le tout dans un dépôt documenté. Le livrable Kubernetes à mettre sur ton CV.
:::

:::lang en
You've completed the **content coverage** of the Kubernetes → CKA/CKAD track. The **enterprise project** remains:

- **Enterprise project** — deploy a **multi-tier app** on Kubernetes: Deployment + Service + **Ingress**, **ConfigMap/Secret**, a **PVC** for the database, **probes** and **HPA** (autoscaling), all in a documented repo. The Kubernetes deliverable for your CV.
:::

## cheatsheet

:::lang fr
Aide-mémoire cluster ops & RBAC.
:::

:::lang en
Cluster ops & RBAC cheat sheet.
:::

```bash
# Contexts
kubectl config get-contexts            # * = courant / current
kubectl config use-context <ctx>       # changer de cluster / switch cluster
kubectl config set-context --current --namespace=<ns>

# ServiceAccount & token (>=1.24)
kubectl create serviceaccount <sa>
kubectl create token <sa>              # JWT à la demande / on-demand JWT

# RBAC (le plus étroit d'abord / narrowest first)
kubectl create role pod-reader --verb=get,list,watch --resource=pods -n <ns>
kubectl create rolebinding rb --role=pod-reader --serviceaccount=<ns>:<sa> -n <ns>
kubectl create clusterrole node-reader --verb=get,list --resource=nodes
kubectl create clusterrolebinding crb --clusterrole=node-reader --serviceaccount=<ns>:<sa>
kubectl auth can-i <verbe> <ressource> --as=system:serviceaccount:<ns>:<sa> [-n <ns>]

# Maintenance de nœud / node maintenance
kubectl cordon <node>
kubectl drain <node> --ignore-daemonsets --delete-emptydir-data
kubectl uncordon <node>

# etcd (kubeadm) — cf. certs /etc/kubernetes/pki/etcd/
ETCDCTL_API=3 etcdctl snapshot save snap.db --endpoints=... --cacert=... --cert=... --key=...
#   k3s : k3s etcd-snapshot save

# Troubleshooting
kubectl describe <type> <nom> | sed -n '/Events/,$p'
kubectl get events --sort-by=.lastTimestamp
kubectl get --raw='/readyz?verbose'
```

## resources

:::lang fr
- [Configurer l'accès (kubeconfig)](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/).
- [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) et [ServiceAccounts](https://kubernetes.io/docs/concepts/security/service-accounts/).
- [Maintenance de nœud — Safely Drain a Node](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/).
- [Sauvegarder etcd](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/) et [k3s backup/restore](https://docs.k3s.io/datastore/backup-restore).
:::

:::lang en
- [Configure access (kubeconfig)](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/).
- [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) and [ServiceAccounts](https://kubernetes.io/docs/concepts/security/service-accounts/).
- [Node maintenance — Safely Drain a Node](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/).
- [Backing up etcd](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/) and [k3s backup/restore](https://docs.k3s.io/datastore/backup-restore).
:::

## troubleshooting

:::lang fr
**`auth can-i` renvoie `no` alors que tu as créé le binding.** Vérifie le **nom exact** du sujet (`system:serviceaccount:<ns>:<sa>`), le bon **namespace** (`-n`), et que `apiGroups`/`resources`/`verbs` couvrent bien l'action. Un `Role` ne vaut que dans son namespace.

**Le SA n'a pas de token dans un Secret.** Normal depuis 1.24. Utilise `kubectl create token <sa>`, ou crée un Secret `kubernetes.io/service-account-token` explicite si tu veux un token longue durée.

**`kubectl drain` échoue avec « cannot delete DaemonSet-managed Pods ».** Ajoute `--ignore-daemonsets`. Si l'erreur parle d'`emptyDir`, ajoute `--delete-emptydir-data`. Pour un pod non géré (bare pod), il faudra `--force`.

**Après un drain, des pods restent `Pending`.** Les autres nœuds n'ont plus de place (ou sont cordonnés). Vérifie `kubectl get nodes` et les ressources dispo ; `uncordon` un nœud si besoin.

**`kubectl get componentstatuses` est déprécié / vide.** Utilise `kubectl get --raw='/readyz?verbose'` et `kubectl -n kube-system get pods` pour la santé des composants.

**Tout `auth can-i` renvoie `yes` (même ce qui devrait être `no`).** Tu testes probablement en tant qu'**admin** (ton propre context), pas en tant que SA. Ajoute bien `--as=system:serviceaccount:<ns>:<sa>`.
:::

:::lang en
**`auth can-i` returns `no` although you created the binding.** Check the **exact** subject name (`system:serviceaccount:<ns>:<sa>`), the right **namespace** (`-n`), and that `apiGroups`/`resources`/`verbs` actually cover the action. A `Role` only counts in its namespace.

**The SA has no token in a Secret.** Normal since 1.24. Use `kubectl create token <sa>`, or create an explicit `kubernetes.io/service-account-token` Secret if you want a long-lived token.

**`kubectl drain` fails with "cannot delete DaemonSet-managed Pods".** Add `--ignore-daemonsets`. If the error mentions `emptyDir`, add `--delete-emptydir-data`. For an unmanaged (bare) pod, you'll need `--force`.

**After a drain, pods stay `Pending`.** The other nodes have no room (or are cordoned). Check `kubectl get nodes` and available resources; `uncordon` a node if needed.

**`kubectl get componentstatuses` is deprecated / empty.** Use `kubectl get --raw='/readyz?verbose'` and `kubectl -n kube-system get pods` for component health.

**Every `auth can-i` returns `yes` (even what should be `no`).** You're probably testing as **admin** (your own context), not as the SA. Make sure to add `--as=system:serviceaccount:<ns>:<sa>`.
:::
