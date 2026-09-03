---
# — Identité (ne change JAMAIS une fois publié) —
id: kubernetes-services-networking
slug: kubernetes-services-networking
order: 15
status: published

# — Titres & accroches (bilingue) —
title_fr: "Kubernetes — services, networking & ingress"
title_en: "Kubernetes — services, networking & ingress"
tagline_fr: "ClusterIP, NodePort, DNS, Ingress, headless, NetworkPolicy."
tagline_en: "ClusterIP, NodePort, DNS, Ingress, headless, NetworkPolicy."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 200
repo: "kubernetes/kubernetes"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [kubernetes-workloads-scheduling]
next: [traefik]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [service-clusterip, endpoints-selecteurs, dns-cluster, nodeport, ingress-routage, service-headless, networkpolicy]
concepts_en: [clusterip-service, endpoints-selectors, cluster-dns, nodeport, ingress-routing, headless-service, networkpolicy]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le réseau Kubernetes de bout en bout, en local sur k3d : Services (ClusterIP, NodePort), Endpoints et sélecteurs, DNS interne, Ingress avec routage par chemin, Services headless, et NetworkPolicy réellement appliquées. Le domaine Services & Networking du CKA/CKAD."
og_description_en: "Kubernetes networking end to end, locally on k3d: Services (ClusterIP, NodePort), Endpoints and selectors, internal DNS, Ingress with path routing, headless Services, and NetworkPolicies that are actually enforced. The CKA/CKAD Services & Networking domain."
---

## intro

:::lang fr
Un pod tout seul ne sert à rien : il faut que le trafic **l'atteigne**. Or les pods naissent, meurent, changent d'IP en permanence. Le réseau Kubernetes résout ce chaos avec une pile d'abstractions — et l'examen **CKA/CKAD** teste chacune : *comment donner une adresse stable à un groupe de pods ? comment les joindre par leur nom ? comment exposer un service à l'extérieur ? comment router `/api` vers un service et `/web` vers un autre ? comment interdire à un pod de parler à un autre ?*

Ce guide couvre tout le domaine **Services & Networking** : les **Services** (`ClusterIP`, `NodePort`), les **Endpoints** et **sélecteurs** qui les font fonctionner, le **DNS interne**, l'**Ingress** (routage HTTP par chemin), les **Services headless**, et les **NetworkPolicy** (pare-feu entre pods).

On travaille en **local sur k3d**. Nuance importante : ici on **garde** l'Ingress Controller **Traefik** que k3s embarque (dans le guide fondamentaux, on l'avait désactivé) — car c'est lui qui implémentera nos objets `Ingress`. Et bonne nouvelle : **k3s applique réellement les NetworkPolicy** (via son contrôleur intégré), donc le pare-feu qu'on écrira **bloquera** vraiment le trafic — contrairement à un cluster flannel nu.

**Pour qui c'est :** tu as les guides **fondamentaux** et **workloads & scheduling**, et tu vises la certification.

**Quand ce n'est PAS le bon choix :**

- Tu ne sais pas ce qu'est un `Deployment` → reviens aux fondamentaux.
- Tu cherches le stockage persistant ou le RBAC → ce sont les guides suivants.
:::

:::lang en
A pod on its own is useless: traffic must **reach** it. But pods are born, die, and change IP constantly. Kubernetes networking tames this chaos with a stack of abstractions — and the **CKA/CKAD** exam tests each one: *how do you give a group of pods a stable address? how do you reach them by name? how do you expose a service externally? how do you route `/api` to one service and `/web` to another? how do you forbid one pod from talking to another?*

This guide covers the whole **Services & Networking** domain: **Services** (`ClusterIP`, `NodePort`), the **Endpoints** and **selectors** that make them work, internal **DNS**, **Ingress** (HTTP path routing), **headless Services**, and **NetworkPolicies** (pod-to-pod firewall).

We work **locally on k3d**. Important nuance: here we **keep** the **Traefik** Ingress Controller that k3s ships (in the fundamentals guide we disabled it) — because it's what will implement our `Ingress` objects. And good news: **k3s actually enforces NetworkPolicies** (via its built-in controller), so the firewall we'll write **will** truly block traffic — unlike a bare flannel cluster.

**Who it's for:** you have the **fundamentals** and **workloads & scheduling** guides, and you're aiming for the cert.

**When it's NOT the right choice:**

- You don't know what a `Deployment` is → go back to the fundamentals.
- You're after persistent storage or RBAC → those are the next guides.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Créer un cluster avec **Ingress Controller** et un **namespace** de travail.
- Créer un **`ClusterIP`** et comprendre les **Endpoints** (le lien Service ↔ pods via **sélecteur**).
- Résoudre un Service par son **nom DNS** (`svc.namespace.svc.cluster.local`).
- Exposer à l'extérieur avec un **`NodePort`**.
- Router du HTTP par **chemin** avec un **`Ingress`**.
- Créer un **Service headless** (`ClusterIP: None`) et voir le DNS renvoyer les IP de pods.
- Écrire une **`NetworkPolicy`** *default-deny* puis une règle *allow*, et vérifier le blocage.
:::

:::lang en
By the end of this guide, you'll know how to:

- Create a cluster with an **Ingress Controller** and a working **namespace**.
- Create a **`ClusterIP`** and understand **Endpoints** (the Service ↔ pods link via **selector**).
- Resolve a Service by its **DNS name** (`svc.namespace.svc.cluster.local`).
- Expose externally with a **`NodePort`**.
- Route HTTP by **path** with an **`Ingress`**.
- Create a **headless Service** (`ClusterIP: None`) and see DNS return pod IPs.
- Write a *default-deny* **`NetworkPolicy`** then an *allow* rule, and verify the block.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides **Kubernetes fondamentaux** et **workloads & scheduling** acquis.
- **Docker** lancé, **k3d** et **kubectl** installés.

On crée un cluster **avec Traefik** (pour l'Ingress) et deux mappages de ports hôte — un pour l'Ingress (`8080→80`) et un pour notre futur NodePort :
:::

:::lang en
You should have:

- The **Kubernetes fundamentals** and **workloads & scheduling** guides under your belt.
- **Docker** running, **k3d** and **kubectl** installed.

We create a cluster **with Traefik** (for Ingress) and two host-port mappings — one for the Ingress (`8080→80`) and one for our future NodePort:
:::

```bash
k3d cluster create netlab \
  -p "8080:80@loadbalancer" \
  -p "30080:30080@server:0"
kubectl get pods -n kube-system | grep traefik      # traefik doit tourner (Ingress Controller) / traefik must run
```

:::lang fr
*(Ici **pas** de `--disable=traefik` : on veut l'Ingress Controller. Le port `8080` de ta machine atteint Traefik ; le port `30080` atteindra notre NodePort à l'étape 3.)*

Prépare le namespace et **deux backends** identifiables (`whoami` renvoie le nom du pod qui répond) :
:::

:::lang en
*(Here **no** `--disable=traefik`: we want the Ingress Controller. Your machine's port `8080` reaches Traefik; port `30080` will reach our NodePort in step 3.)*

Set up the namespace and **two identifiable backends** (`whoami` returns the name of the pod that answered):
:::

```bash
kubectl create namespace net
kubectl config set-context --current --namespace=net

kubectl create deployment app1 --image=traefik/whoami --replicas=2
kubectl create deployment app2 --image=traefik/whoami --replicas=2
kubectl get pods -l app=app1 -o wide       # 2 pods app1 / two app1 pods
```

## concepts

:::lang fr
Kubernetes empile les abstractions réseau de la plus interne à la plus externe.

**Le Service** donne une **IP virtuelle stable** (et un nom DNS) à un groupe de pods sélectionnés par **label**. Derrière lui, un objet **`Endpoints`** (ou `EndpointSlice`) liste les **IP réelles** des pods prêts — mis à jour en continu. `kube-proxy` programme le nœud pour rediriger l'IP du Service vers ces pods. Types de Service :

- **`ClusterIP`** (défaut) : joignable **uniquement depuis le cluster**. La brique de base.
- **`NodePort`** : ouvre le **même port haut** (30000-32767) sur **chaque nœud** ; joignable de l'extérieur via `IP_nœud:port`.
- **`LoadBalancer`** : demande un LB externe (sur k3d, `klipper-lb` en fournit un local). En prod cloud, une vraie IP publique.
- **`ExternalName`** : un alias DNS vers un nom externe (pas de proxy).

**Le DNS interne** (CoreDNS) donne à chaque Service un nom : **`<service>.<namespace>.svc.cluster.local`**. Dans le même namespace, `<service>` suffit. C'est ainsi que les pods se parlent — **jamais par IP**.

**L'Ingress** n'est **pas** un Service : c'est une **règle de routage HTTP** (par **hôte** et/ou **chemin**) devant plusieurs Services. Il faut un **Ingress Controller** (ici Traefik) qui **lit** ces règles et fait le vrai routage L7. Un seul point d'entrée (port 80/443) → N services, par `/chemin` ou par nom de domaine.

**Le Service headless** (`clusterIP: None`) n'attribue **pas** d'IP virtuelle : le DNS renvoie directement **les IP de tous les pods**. Utile quand le client veut joindre **chaque** pod (bases répliquées, StatefulSet).

**La NetworkPolicy** est un **pare-feu entre pods**. Par défaut, tout pod peut parler à tout pod. Une NetworkPolicy qui **sélectionne** des pods bascule ceux-ci en *deny par défaut* pour la direction couverte (ingress/egress), et **seules** les règles déclarées rouvrent le trafic. *(Elle n'a d'effet que si le réseau l'applique — k3s le fait.)*
:::

:::lang en
Kubernetes stacks networking abstractions from innermost to outermost.

**The Service** gives a **stable virtual IP** (and a DNS name) to a group of pods selected by **label**. Behind it, an **`Endpoints`** object (or `EndpointSlice`) lists the **real IPs** of ready pods — continuously updated. `kube-proxy` programs the node to redirect the Service IP to those pods. Service types:

- **`ClusterIP`** (default): reachable **only from within the cluster**. The base brick.
- **`NodePort`**: opens the **same high port** (30000-32767) on **every node**; reachable externally via `node_IP:port`.
- **`LoadBalancer`**: requests an external LB (on k3d, `klipper-lb` provides a local one). In cloud prod, a real public IP.
- **`ExternalName`**: a DNS alias to an external name (no proxy).

**Internal DNS** (CoreDNS) gives each Service a name: **`<service>.<namespace>.svc.cluster.local`**. In the same namespace, `<service>` suffices. That's how pods talk to each other — **never by IP**.

**Ingress** is **not** a Service: it's an **HTTP routing rule** (by **host** and/or **path**) in front of several Services. It needs an **Ingress Controller** (here Traefik) that **reads** those rules and does the real L7 routing. A single entry point (port 80/443) → N services, by `/path` or by domain name.

**The headless Service** (`clusterIP: None`) assigns **no** virtual IP: DNS returns **all the pods' IPs** directly. Useful when the client wants to reach **each** pod (replicated databases, StatefulSets).

**The NetworkPolicy** is a **pod-to-pod firewall**. By default, any pod can talk to any pod. A NetworkPolicy that **selects** pods flips them to *default-deny* for the covered direction (ingress/egress), and **only** the declared rules reopen traffic. *(It only takes effect if the network enforces it — k3s does.)*
:::

:::figure kubernetes-networking-layers
caption_fr: "Schéma 1. Ingress (L7, par chemin/hôte) → Services (IP stable) → Endpoints → Pods. Le DNS nomme les Services ; la NetworkPolicy filtre entre pods."
caption_en: "Figure 1. Ingress (L7, by path/host) → Services (stable IP) → Endpoints → Pods. DNS names the Services; the NetworkPolicy filters between pods."
:::

:::lang fr
On avance : ClusterIP & Endpoints & DNS → NodePort → Ingress → headless → NetworkPolicy.
:::

:::lang en
We'll go: ClusterIP & Endpoints & DNS → NodePort → Ingress → headless → NetworkPolicy.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Exposer `app1` avec un **`ClusterIP`**, et comprendre le lien **Service → Endpoints → pods** via le **sélecteur**.

**🤔 Le sélecteur fait tout.** Un Service ne « contient » pas de pods : il en **sélectionne** par label, et Kubernetes remplit ses **Endpoints** avec les IP des pods **prêts** qui matchent. Expose :
:::

:::lang en
**Goal.** Expose `app1` with a **`ClusterIP`**, and understand the **Service → Endpoints → pods** link via the **selector**.

**🤔 The selector does everything.** A Service doesn't "contain" pods: it **selects** them by label, and Kubernetes fills its **Endpoints** with the IPs of the **ready** pods that match. Expose it:
:::

```bash
kubectl expose deployment app1 --port=80 --target-port=80 --name=app1
kubectl get svc app1                       # TYPE ClusterIP, une IP interne / an internal IP
kubectl get endpoints app1                 # 2 IP:80 — les deux pods app1 / the two app1 pods
```

:::lang fr
**✅ Vérification :** `kubectl get endpoints app1` liste **deux** `IP:80` — exactement les IP des deux pods `app1` (compare avec `kubectl get pods -l app=app1 -o wide`). Preuve du lien vivant : `kubectl scale deployment app1 --replicas=3`, puis re-`get endpoints app1` → **trois** IP. Le Service suit les pods **automatiquement**, sans que tu touches au Service. Remets `--replicas=2`.
:::

:::lang en
**✅ Check:** `kubectl get endpoints app1` lists **two** `IP:80` — exactly the IPs of the two `app1` pods (compare with `kubectl get pods -l app=app1 -o wide`). Proof of the live link: `kubectl scale deployment app1 --replicas=3`, then re-`get endpoints app1` → **three** IPs. The Service follows the pods **automatically**, without you touching the Service. Set `--replicas=2` back.
:::

### step-02

:::lang fr
**Objectif.** Joindre le Service par son **nom DNS**, depuis un autre pod.

**🤔 On ne code jamais une IP.** Les pods se parlent par **nom de Service**. Lance un pod client jetable et résous/interroge `app1` :
:::

:::lang en
**Goal.** Reach the Service by its **DNS name**, from another pod.

**🤔 You never hardcode an IP.** Pods talk by **Service name**. Launch a throwaway client pod and resolve/query `app1`:
:::

```bash
kubectl run client --image=busybox:1.36 --restart=Never -it --rm -- \
  sh -c "nslookup app1; echo '---'; wget -qO- app1 | grep Hostname"
```

:::lang fr
**✅ Vérification :** `nslookup app1` résout vers le nom complet **`app1.net.svc.cluster.local`** et l'IP du Service (pas celle d'un pod). Le `wget -qO- app1` renvoie une ligne `Hostname: app1-…` — un des deux pods `app1` a répondu, via le nom court `app1` (même namespace). Relance-le plusieurs fois : sur l'ensemble des essais, les réponses se **répartissent** sur les deux pods → le Service **load-balance**. *(kube-proxy en mode iptables répartit de façon **statistique**, pas en tour de rôle strict : deux essais de suite peuvent tomber sur le même pod — c'est normal. Depuis un autre namespace, il faudrait `app1.net`.)*
:::

:::lang en
**✅ Check:** `nslookup app1` resolves to the full name **`app1.net.svc.cluster.local`** and the Service IP (not a pod's). The `wget -qO- app1` returns a `Hostname: app1-…` line — one of the two `app1` pods answered, via the short name `app1` (same namespace). Re-run it several times: across the runs, responses are **spread** across both pods → the Service **load-balances**. *(kube-proxy in iptables mode balances **statistically**, not strict round-robin: two runs in a row can hit the same pod — that's normal. From another namespace, you'd need `app1.net`.)*
:::

### step-03

:::lang fr
**Objectif.** Exposer `app1` à l'**extérieur** du cluster avec un **`NodePort`**.

**🤔 NodePort = un port sur chaque nœud.** On fixe `nodePort: 30080` (qu'on a mappé vers l'hôte à la création du cluster). Crée `nodeport.yaml` :
:::

:::lang en
**Goal.** Expose `app1` **outside** the cluster with a **`NodePort`**.

**🤔 NodePort = a port on every node.** We pin `nodePort: 30080` (which we mapped to the host at cluster creation). Create `nodeport.yaml`:
:::

```yaml
# nodeport.yaml
apiVersion: v1
kind: Service
metadata:
  name: app1-np
spec:
  type: NodePort
  selector:
    app: app1
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080        # doit être dans 30000-32767 / must be within 30000-32767
```

```bash
kubectl apply -f nodeport.yaml
kubectl get svc app1-np                    # TYPE NodePort, 80:30080/TCP
curl -s localhost:30080 | grep Hostname    # un pod app1 répond depuis l'extérieur / an app1 pod answers from outside
```

:::lang fr
**✅ Vérification :** `curl localhost:30080` renvoie `Hostname: app1-…` — tu as atteint le pod **depuis ta machine**, hors du cluster, via le NodePort mappé. Un NodePort ouvre ce port sur **tous** les nœuds ; ici on a mappé celui du serveur (`30080@server:0`) vers l'hôte. En prod, on met **rarement** un NodePort en frontal (ports hauts, un par service) : on préfère un **Ingress** — l'étape suivante.
:::

:::lang en
**✅ Check:** `curl localhost:30080` returns `Hostname: app1-…` — you reached the pod **from your machine**, outside the cluster, via the mapped NodePort. A NodePort opens that port on **all** nodes; here we mapped the server's (`30080@server:0`) to the host. In prod, you **rarely** put a NodePort at the front (high ports, one per service): you prefer an **Ingress** — the next step.
:::

### step-04

:::lang fr
**Objectif.** Router du HTTP par **chemin** avec un **`Ingress`** : `/app1` → `app1`, `/app2` → `app2`.

D'abord, expose `app2` en ClusterIP (comme `app1` à l'étape 1) :
:::

:::lang en
**Goal.** Route HTTP by **path** with an **`Ingress`**: `/app1` → `app1`, `/app2` → `app2`.

First, expose `app2` as ClusterIP (like `app1` in step 1):
:::

```bash
kubectl expose deployment app2 --port=80 --target-port=80 --name=app2
```

:::lang fr
Puis l'`Ingress` (Traefik l'implémente) — `ingress.yaml` :
:::

:::lang en
Then the `Ingress` (Traefik implements it) — `ingress.yaml`:
:::

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
spec:
  ingressClassName: traefik
  rules:
    - http:
        paths:
          - path: /app1
            pathType: Prefix
            backend:
              service:
                name: app1
                port:
                  number: 80
          - path: /app2
            pathType: Prefix
            backend:
              service:
                name: app2
                port:
                  number: 80
```

```bash
kubectl apply -f ingress.yaml
kubectl get ingress web                    # HOSTS *, la colonne ADDRESS se remplit / ADDRESS column fills in
curl -s localhost:8080/app1 | grep Hostname   # app1-…
curl -s localhost:8080/app2 | grep Hostname   # app2-…
```

:::lang fr
**✅ Vérification :** `curl localhost:8080/app1` renvoie un `Hostname: app1-…` et `/app2` un `Hostname: app2-…` — **un seul point d'entrée** (le port 80 de Traefik, mappé sur `8080`) route vers **deux** services selon le **chemin**. C'est le pattern de prod : un Ingress devant tous tes services, au lieu d'un NodePort/LoadBalancer par service. *(Traefik transmet le chemin tel quel ; `whoami` répond sur n'importe quel chemin, d'où le 200 sans réécriture.)*
:::

:::lang en
**✅ Check:** `curl localhost:8080/app1` returns a `Hostname: app1-…` and `/app2` a `Hostname: app2-…` — **a single entry point** (Traefik's port 80, mapped to `8080`) routes to **two** services by **path**. That's the prod pattern: one Ingress in front of all your services, instead of one NodePort/LoadBalancer per service. *(Traefik forwards the path as-is; `whoami` answers on any path, hence the 200 without rewriting.)*
:::

### step-05

:::lang fr
**Objectif.** Créer un **Service headless** (`clusterIP: None`) et voir le DNS renvoyer **toutes** les IP de pods.

**🤔 Quand headless ?** Quand le client ne veut **pas** un load-balancing vers une IP virtuelle, mais la **liste des pods** pour les joindre un par un (réplicas de base de données, découverte de pairs). Crée `headless.yaml` :
:::

:::lang en
**Goal.** Create a **headless Service** (`clusterIP: None`) and see DNS return **all** the pod IPs.

**🤔 When headless?** When the client doesn't want load-balancing to a virtual IP, but the **list of pods** to reach them one by one (database replicas, peer discovery). Create `headless.yaml`:
:::

```yaml
# headless.yaml
apiVersion: v1
kind: Service
metadata:
  name: app1-headless
spec:
  clusterIP: None            # <- headless : pas d'IP virtuelle / no virtual IP
  selector:
    app: app1
  ports:
    - port: 80
      targetPort: 80
```

```bash
kubectl apply -f headless.yaml
kubectl run dnsclient --image=busybox:1.36 --restart=Never -it --rm -- \
  nslookup app1-headless
```

:::lang fr
**✅ Vérification :** `nslookup app1-headless` renvoie **deux** enregistrements `Address` — les IP **des deux pods** `app1` directement (compare avec `kubectl get pods -l app=app1 -o wide`). Un Service `ClusterIP` classique n'aurait renvoyé **qu'une** IP (la virtuelle). C'est toute la différence : headless = « donne-moi les pods », ClusterIP = « donne-moi une porte d'entrée load-balancée ».
:::

:::lang en
**✅ Check:** `nslookup app1-headless` returns **two** `Address` records — the IPs **of the two** `app1` pods directly (compare with `kubectl get pods -l app=app1 -o wide`). A regular `ClusterIP` Service would have returned **only one** IP (the virtual one). That's the whole difference: headless = "give me the pods", ClusterIP = "give me one load-balanced entry point".
:::

### step-06

:::lang fr
**Objectif.** Écrire une **`NetworkPolicy`** : bloquer tout le trafic entrant vers `app1`, puis n'autoriser qu'une source labellisée.

**🤔 Deny par défaut, puis allow.** Tant qu'aucune policy ne sélectionne un pod, tout est permis. Dès qu'une policy le sélectionne pour l'`Ingress`, ce pod passe en *deny*, et seules ses règles rouvrent. Étape A — **default-deny** sur `app1`. Crée `deny.yaml` :
:::

:::lang en
**Goal.** Write a **`NetworkPolicy`**: block all inbound traffic to `app1`, then allow only a labeled source.

**🤔 Default-deny, then allow.** As long as no policy selects a pod, everything is allowed. The moment a policy selects it for `Ingress`, that pod flips to *deny*, and only its rules reopen. Step A — **default-deny** on `app1`. Create `deny.yaml`:
:::

```yaml
# deny.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: app1-deny-ingress
spec:
  podSelector:
    matchLabels:
      app: app1          # cible les pods app1 / targets app1 pods
  policyTypes: [Ingress]  # aucune règle ingress = tout entrant bloqué / no ingress rule = all inbound blocked
```

```bash
kubectl apply -f deny.yaml
# Test depuis un pod NON autorisé (timeout attendu) / from a NON-allowed pod (timeout expected)
kubectl run probe --image=busybox:1.36 --restart=Never -it --rm -- \
  wget -qO- -T 5 app1 || echo "BLOQUÉ (attendu) / BLOCKED (expected)"
```

:::lang fr
Étape B — autoriser **uniquement** les pods portant `access: app1`. Crée `allow.yaml` :
:::

:::lang en
Step B — allow **only** pods carrying `access: app1`. Create `allow.yaml`:
:::

```yaml
# allow.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: app1-allow-from-client
spec:
  podSelector:
    matchLabels:
      app: app1
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              access: app1     # seuls ces pods peuvent entrer / only these pods may enter
      ports:
        - protocol: TCP
          port: 80
```

```bash
kubectl apply -f allow.yaml
# Pod autorisé (label access=app1) -> passe / allowed pod (label access=app1) -> succeeds
kubectl run ok --image=busybox:1.36 --labels="access=app1" --restart=Never -it --rm -- \
  wget -qO- -T 5 app1 | grep Hostname
# Pod non-labellisé -> toujours bloqué / unlabeled pod -> still blocked
kubectl run ko --image=busybox:1.36 --restart=Never -it --rm -- \
  wget -qO- -T 5 app1 || echo "BLOQUÉ (attendu) / BLOCKED (expected)"
```

:::lang fr
**✅ Vérification :** après `deny.yaml`, le pod `probe` **timeoute** en joignant `app1` (trafic bloqué). Après `allow.yaml`, le pod `ok` (label `access=app1`) **reçoit** la réponse `Hostname: app1-…`, tandis que le pod `ko` (sans label) **timeoute encore**. Le pare-feu discrimine **par label de source** — et il s'applique vraiment parce que **k3s embarque un contrôleur de NetworkPolicy** (un cluster flannel nu, lui, ignorerait ces policies). *(Nettoyage : `kubectl delete networkpolicy --all`.)*
:::

:::lang en
**✅ Check:** after `deny.yaml`, the `probe` pod **times out** reaching `app1` (traffic blocked). After `allow.yaml`, the `ok` pod (label `access=app1`) **gets** the `Hostname: app1-…` response, while the `ko` pod (no label) **still times out**. The firewall discriminates **by source label** — and it truly applies because **k3s ships a NetworkPolicy controller** (a bare flannel cluster would ignore these policies). *(Cleanup: `kubectl delete networkpolicy --all`.)*
:::

## pitfalls

:::lang fr
**1. Un Service sans Endpoints.** Si `kubectl get endpoints <svc>` est vide, le **sélecteur** ne matche aucun pod prêt (mauvais label, pods non `Ready`, mauvais `targetPort`). Le symptôme : « connection refused / timeout » vers le Service.

**2. `port` vs `targetPort`.** `port` = le port du **Service** ; `targetPort` = le port du **conteneur**. Les confondre = trafic dans le vide.

**3. Ingress sans Ingress Controller.** Un objet `Ingress` seul ne fait **rien** : il faut un contrôleur qui le lise. Ici Traefik (k3s) ; ailleurs `ingress-nginx`. Sans contrôleur, la colonne `ADDRESS` reste vide.

**4. Oublier `ingressClassName`.** Si plusieurs contrôleurs coexistent (ou si aucune classe par défaut n'est définie), un Ingress sans `ingressClassName` peut n'être servi par personne.

**5. Croire qu'une NetworkPolicy est appliquée partout.** Elle n'a d'effet que si le **CNI l'implémente**. k3s oui ; un cluster flannel nu **non** (la policy existe mais ne bloque rien). Toujours **tester** le blocage.

**6. NetworkPolicy : le sélecteur vide piège.** `podSelector: {}` sélectionne **tous** les pods du namespace ; `namespaceSelector`/`podSelector` combinés ont une sémantique précise (ET vs OU selon la structure). Lis deux fois avant d'appliquer un default-deny en prod.

**7. NodePort injoignable sur k3d.** Le port n'est ouvert sur l'hôte que si tu l'as **mappé** à la création (`-p "30080:30080@server:0"`). Sinon, le NodePort existe dans le cluster mais pas sur ta machine.
:::

:::lang en
**1. A Service with no Endpoints.** If `kubectl get endpoints <svc>` is empty, the **selector** matches no ready pod (wrong label, pods not `Ready`, wrong `targetPort`). Symptom: "connection refused / timeout" to the Service.

**2. `port` vs `targetPort`.** `port` = the **Service's** port; `targetPort` = the **container's** port. Confusing them = traffic into the void.

**3. Ingress without an Ingress Controller.** An `Ingress` object alone does **nothing**: you need a controller to read it. Here Traefik (k3s); elsewhere `ingress-nginx`. Without a controller, the `ADDRESS` column stays empty.

**4. Forgetting `ingressClassName`.** If several controllers coexist (or no default class is set), an Ingress without `ingressClassName` may be served by no one.

**5. Believing a NetworkPolicy is enforced everywhere.** It only takes effect if the **CNI implements it**. k3s yes; a bare flannel cluster **no** (the policy exists but blocks nothing). Always **test** the block.

**6. NetworkPolicy: the empty-selector trap.** `podSelector: {}` selects **all** pods in the namespace; combined `namespaceSelector`/`podSelector` have precise semantics (AND vs OR depending on structure). Read twice before applying a default-deny in prod.

**7. NodePort unreachable on k3d.** The port is only opened on the host if you **mapped** it at creation (`-p "30080:30080@server:0"`). Otherwise, the NodePort exists in the cluster but not on your machine.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu crées un `ClusterIP` et tu lis ses **Endpoints** (et vois le lien vivant au scaling).
- [ ] Tu joins un Service par son **nom DNS** depuis un pod.
- [ ] Tu exposes en **NodePort** et tu l'atteins depuis l'hôte.
- [ ] Tu routes `/app1` et `/app2` avec un **Ingress**.
- [ ] Tu crées un **Service headless** et tu vois le DNS renvoyer les IP de pods.
- [ ] Tu écris un **default-deny** puis un **allow** NetworkPolicy, et tu **vérifies** le blocage.

Six cases cochées = tu maîtrises le domaine **Services & Networking** du CKA/CKAD.
:::

:::lang en
You know it works when…

- [ ] You create a `ClusterIP` and read its **Endpoints** (and see the live link on scaling).
- [ ] You reach a Service by its **DNS name** from a pod.
- [ ] You expose a **NodePort** and reach it from the host.
- [ ] You route `/app1` and `/app2` with an **Ingress**.
- [ ] You create a **headless Service** and see DNS return pod IPs.
- [ ] You write a **default-deny** then an **allow** NetworkPolicy, and **verify** the block.

Six boxes ticked = you've got the CKA/CKAD **Services & Networking** domain.
:::

## next

:::lang fr
La suite de la track Kubernetes → CKA/CKAD :

1. **Stockage** — `PersistentVolume`/`PersistentVolumeClaim`, `StorageClass`, StatefulSet et stockage stable.
2. **Cluster ops, sécurité & RBAC** — kubeconfig/contextes, RBAC, sauvegarde etcd, mises à jour, troubleshooting.
3. **Projet d'entreprise** — appli multi-tier (ingress + config + stockage + probes + autoscaling) : le livrable de CV.
:::

:::lang en
The rest of the Kubernetes → CKA/CKAD track:

1. **Storage** — `PersistentVolume`/`PersistentVolumeClaim`, `StorageClass`, StatefulSet and stable storage.
2. **Cluster ops, security & RBAC** — kubeconfig/contexts, RBAC, etcd backup, upgrades, troubleshooting.
3. **Enterprise project** — multi-tier app (ingress + config + storage + probes + autoscaling): the CV deliverable.
:::

## cheatsheet

:::lang fr
Aide-mémoire services & networking.
:::

:::lang en
Services & networking cheat sheet.
:::

```bash
# Services
kubectl expose deployment app1 --port=80 --target-port=80         # ClusterIP
kubectl get endpoints app1                                        # IP réelles des pods / real pod IPs
kubectl expose deployment app1 --type=NodePort --port=80          # NodePort (port haut auto)
#   clusterIP: None dans le YAML -> Service headless / headless Service

# DNS interne / internal DNS
#   <service>.<namespace>.svc.cluster.local  (court : <service> même ns / short: same ns)
kubectl run c --image=busybox:1.36 --rm -it --restart=Never -- nslookup app1

# Ingress (nécessite un controller / needs a controller)
#   spec.ingressClassName + rules[].http.paths[] (path, pathType, backend.service)
kubectl get ingress

# NetworkPolicy (appliquée par k3s / enforced by k3s)
#   podSelector + policyTypes:[Ingress] SANS ingress: -> default-deny
#   ingress.from[].podSelector -> allow par label / allow by label
kubectl get networkpolicy
```

## resources

:::lang fr
- [Service](https://kubernetes.io/docs/concepts/services-networking/service/) et [DNS des Services/Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/).
- [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) et [Ingress Controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/).
- [NetworkPolicy](https://kubernetes.io/docs/concepts/services-networking/network-policies/).
- [k3s — Network Policy Controller](https://docs.k3s.io/networking/networking-services) (k3s applique les NetworkPolicy).
:::

:::lang en
- [Service](https://kubernetes.io/docs/concepts/services-networking/service/) and [Service/Pod DNS](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/).
- [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) and [Ingress Controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/).
- [NetworkPolicy](https://kubernetes.io/docs/concepts/services-networking/network-policies/).
- [k3s — Network Policy Controller](https://docs.k3s.io/networking/networking-services) (k3s enforces NetworkPolicies).
:::

## troubleshooting

:::lang fr
**`kubectl get endpoints <svc>` est vide.** Le sélecteur ne matche aucun pod prêt. Vérifie les labels (`kubectl get pods --show-labels`), l'état `Ready`, et que `targetPort` = port du conteneur.

**`curl localhost:8080/app1` renvoie 404 (Traefik).** L'Ingress n'est pas (encore) pris en compte, ou `ingressClassName` est absent/incorrect. `kubectl describe ingress web` et vérifie que Traefik tourne (`-n kube-system`).

**`curl localhost:30080` : connection refused.** Le mapping de port hôte manque. Recrée le cluster avec `-p "30080:30080@server:0"`, ou utilise l'Ingress.

**La NetworkPolicy ne bloque rien.** Sur k3s elle devrait ; vérifie que tu testes le bon namespace et que la policy **sélectionne** bien le pod cible (`kubectl describe networkpolicy`). Rappelle-toi qu'une policy est **additive** : plusieurs policies s'additionnent (union des autorisations).

**Le pod `client`/`probe` reste ouvert et bloque le terminal.** Avec `-it --rm --restart=Never`, il se supprime à la sortie. Si un pod jetable traîne, `kubectl delete pod client dnsclient probe ok ko --ignore-not-found`.

**`nslookup` échoue dans busybox.** Utilise le nom complet `app1.net.svc.cluster.local`, ou vérifie CoreDNS (`kubectl -n kube-system get pods -l k8s-app=kube-dns`).
:::

:::lang en
**`kubectl get endpoints <svc>` is empty.** The selector matches no ready pod. Check labels (`kubectl get pods --show-labels`), `Ready` status, and that `targetPort` = the container port.

**`curl localhost:8080/app1` returns 404 (Traefik).** The Ingress isn't picked up (yet), or `ingressClassName` is missing/wrong. `kubectl describe ingress web` and check Traefik is running (`-n kube-system`).

**`curl localhost:30080`: connection refused.** The host port mapping is missing. Recreate the cluster with `-p "30080:30080@server:0"`, or use the Ingress.

**The NetworkPolicy blocks nothing.** On k3s it should; check you're testing the right namespace and that the policy actually **selects** the target pod (`kubectl describe networkpolicy`). Remember a policy is **additive**: multiple policies add up (union of allowances).

**The `client`/`probe` pod hangs and blocks the terminal.** With `-it --rm --restart=Never`, it deletes itself on exit. If a throwaway pod lingers, `kubectl delete pod client dnsclient probe ok ko --ignore-not-found`.

**`nslookup` fails in busybox.** Use the full name `app1.net.svc.cluster.local`, or check CoreDNS (`kubectl -n kube-system get pods -l k8s-app=kube-dns`).
:::
