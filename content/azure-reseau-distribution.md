---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-reseau-distribution
slug: azure-reseau-distribution
order: 85
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — distribution applicative (AZ-700) : équilibrage, App Gateway, Front Door"
title_en: "Azure — application delivery (AZ-700): load balancing, App Gateway, Front Door"
tagline_fr: "répartir la charge, router par chemin, distribuer mondialement."
tagline_en: "spread the load, route by path, deliver globally."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 250
repo: "Azure/bicep"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-reseau-hybride]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [distribution, equilibrage-de-charge, load-balancer, application-gateway, front-door, traffic-manager, sondes, l4-l7, az-700]
concepts_en: [delivery, load-balancing, load-balancer, application-gateway, front-door, traffic-manager, probes, l4-l7, az-700]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Distribuer les applications pour l'AZ-700, en local et pour de vrai : choisir le bon service (Load Balancer L4, Application Gateway L7, Front Door global, Traffic Manager DNS) avec un moteur de décision exécutable, les algorithmes d'équilibrage (round-robin, moindre connexions) et les sondes de santé qui excluent un backend défaillant, le routage L7 par chemin d'URL, la distribution mondiale (CDN+WAF) et l'affinité de session (hash 5-tuple). Sans compte cloud.",
og_description_en: "Delivering applications for AZ-700, locally and for real: choosing the right service (L4 Load Balancer, L7 Application Gateway, global Front Door, DNS Traffic Manager) with a runnable decision engine, load-balancing algorithms (round-robin, least connections) and health probes that exclude a failing backend, L7 path-based routing, global delivery (CDN+WAF) and session affinity (5-tuple hash). No cloud account."
---

## intro

:::lang fr
Une seule instance ne tient pas la charge — et tombe un jour. La **distribution applicative** répartit le trafic sur **plusieurs** backends, **exclut** ceux qui sont défaillants, **route** selon l'URL, et **distribue mondialement**. L'**AZ-700** attend que tu saches choisir entre **Load Balancer**, **Application Gateway**, **Front Door** et **Traffic Manager** — et comprendre **comment** ils répartissent.

Fidèle à la méthode, on pratique **en local et pour de vrai** : on **choisit** le bon service (L4/L7, régional/global) avec un **moteur de décision**, on **exécute** les **algorithmes d'équilibrage** (round-robin, moindre connexions), on branche des **sondes de santé** qui **excluent** un backend défaillant, on fait du **routage L7 par chemin** d'URL, on voit la **distribution mondiale** (CDN + WAF) et l'**affinité de session** (hash).

**Pour qui c'est :** tu maîtrises l'adressage, le routage et la connectivité (guides précédents) et tu veux **distribuer** tes applis.

**Quand ce n'est PAS le bon choix :**

- Tu n'as pas les fondations réseau → fais les guides AZ-700 précédents.
- Tu cherches la sécurité applicative (WAF en détail) → on l'aborde ici, l'approfondissement est côté **AZ-500**.
:::

:::lang en
A single instance can't hold the load — and fails one day. **Application delivery** spreads traffic across **several** backends, **excludes** the failing ones, **routes** by URL, and **delivers globally**. **AZ-700** expects you to choose between **Load Balancer**, **Application Gateway**, **Front Door** and **Traffic Manager** — and understand **how** they distribute.

True to the method, we practice **locally and for real**: we **choose** the right service (L4/L7, regional/global) with a **decision engine**, we **run** the **load-balancing algorithms** (round-robin, least connections), we wire **health probes** that **exclude** a failing backend, we do **L7 path-based routing**, we see **global delivery** (CDN + WAF) and **session affinity** (hash).

**Who it's for:** you master addressing, routing and connectivity (previous guides) and want to **deliver** your apps.

**When it's NOT the right choice:**

- You lack the network foundations → do the previous AZ-700 guides.
- You want application security (WAF in detail) → we touch it here, the deep dive is on the **AZ-500** side.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- **Choisir** le bon service : Load Balancer (L4), App Gateway (L7), Front Door (global), Traffic Manager (DNS).
- Distinguer **L4** (transport) et **L7** (application).
- Exécuter les **algorithmes d'équilibrage** (round-robin, moindre connexions).
- Brancher des **sondes de santé** qui **excluent** un backend défaillant.
- Faire du **routage L7 par chemin** d'URL (Application Gateway).
- Comprendre la **distribution mondiale** (Front Door CDN+WAF, Traffic Manager DNS).
- Gérer l'**affinité de session** (hash) quand c'est nécessaire.
:::

:::lang en
By the end of this guide, you can:

- **Choose** the right service: Load Balancer (L4), App Gateway (L7), Front Door (global), Traffic Manager (DNS).
- Distinguish **L4** (transport) and **L7** (application).
- Run the **load-balancing algorithms** (round-robin, least connections).
- Wire **health probes** that **exclude** a failing backend.
- Do **L7 path-based routing** (Application Gateway).
- Understand **global delivery** (Front Door CDN+WAF, Traffic Manager DNS).
- Handle **session affinity** (hash) when needed.
:::

## prerequisites

:::lang fr
- Les guides **Azure — réseau fondamentaux / routage / hybride (AZ-700)**.
- Le **lab local** : **Python 3**, **Bicep CLI** (optionnel), **miniblue** optionnel.
- **Aucun compte cloud** : algorithmes, sondes, routage et décision s'exécutent en local.
:::

:::lang en
- The **Azure — network fundamentals / routing / hybrid (AZ-700)** guides.
- The **local lab**: **Python 3**, **Bicep CLI** (optional), **miniblue** optional.
- **No cloud account**: algorithms, probes, routing and decision run locally.
:::

## concepts

:::lang fr
**L4 vs L7.** Un équilibreur travaille à une **couche** du modèle réseau. **L4** (transport — TCP/UDP) répartit sur des **ports/IP**, sans regarder le **contenu** : rapide, universel. **L7** (application — HTTP) **comprend** la requête (URL, en-têtes, cookies) : il peut **router par chemin**, terminer le **TLS**, appliquer un **WAF**. Le choix L4/L7 est la **première** décision de distribution.

**Les quatre services Azure.**

- **Azure Load Balancer** — **L4**, **régional**, TCP/UDP, très **faible latence**, très haut débit. Pour équilibrer des VMs, du trafic interne, non-HTTP.
- **Application Gateway** — **L7**, **régional**, HTTP(S). **Routage par chemin/hôte**, **terminaison TLS**, **WAF** intégré. Pour un site/API régional.
- **Azure Front Door** — **L7**, **global**. **CDN** (points de présence dans le monde) + **WAF** + accélération. Pour une appli **mondiale**.
- **Traffic Manager** — **DNS**, **global**. Ne voit **pas** le trafic : il **répond au DNS** en dirigeant vers le bon **endpoint** (par géographie, priorité, poids). Pour orchestrer plusieurs régions.

**Les algorithmes d'équilibrage.** Comment choisir **quel backend** ? **Round-robin** (tourniquet) : à tour de rôle, simple et équitable. **Moindre connexions** (least connections) : vers le backend le **moins chargé**. **Hash** (5-tuple : IP source/dest, ports, protocole) : le **même client** va **toujours** au même backend (utile pour l'**affinité de session**).

**Les sondes de santé.** L'équilibreur **teste** régulièrement chaque backend (une **sonde** HTTP/TCP). Un backend qui **échoue** est **retiré** de la rotation — le trafic n'y va **plus**, jusqu'à ce qu'il redevienne sain. C'est ce qui rend la distribution **résiliente** : une instance qui tombe ne casse pas le service.

**Le routage L7 par chemin.** En L7, on **route selon l'URL** : `/api/*` → pool d'API, `/images/*` → pool statique, le reste → pool web. Une seule adresse publique, plusieurs backends **spécialisés**. Impossible en L4 (qui ne voit pas l'URL).

**L'affinité de session.** Certaines applis (panier, session serveur) exigent qu'un client **revienne** au **même** backend. L'**affinité** (par cookie en L7, par hash en L4) garantit cette **collance**. À utiliser **avec parcimonie** : elle **déséquilibre** la charge et complique le scaling — préfère des backends **sans état** quand tu peux.

**Ce qui est live ici.** Les **algorithmes** (round-robin, moindre connexions, hash), les **sondes** (exclusion d'un backend KO), le **routage L7** et le **moteur de décision** (L4/L7, régional/global) sont **exécutables** en Python — de **vraies** décisions reproduisant la logique d'Azure. Les **services managés** (Front Door, Traffic Manager) se **raisonnent** ; leur **logique** est ici **jouée pour de vrai**. Tout sans compte cloud.
:::

:::lang en
**L4 vs L7.** A load balancer works at a **layer** of the network model. **L4** (transport — TCP/UDP) distributes on **ports/IPs**, without looking at **content**: fast, universal. **L7** (application — HTTP) **understands** the request (URL, headers, cookies): it can **route by path**, terminate **TLS**, apply a **WAF**. The L4/L7 choice is the **first** delivery decision.

**The four Azure services.**

- **Azure Load Balancer** — **L4**, **regional**, TCP/UDP, very **low latency**, very high throughput. To balance VMs, internal traffic, non-HTTP.
- **Application Gateway** — **L7**, **regional**, HTTP(S). **Path/host routing**, **TLS termination**, built-in **WAF**. For a regional site/API.
- **Azure Front Door** — **L7**, **global**. **CDN** (points of presence worldwide) + **WAF** + acceleration. For a **global** app.
- **Traffic Manager** — **DNS**, **global**. Doesn't see the **traffic**: it **answers DNS** by directing to the right **endpoint** (by geography, priority, weight). To orchestrate multiple regions.

**Load-balancing algorithms.** How to pick **which backend**? **Round-robin**: in turn, simple and fair. **Least connections**: to the **least loaded** backend. **Hash** (5-tuple: source/dest IP, ports, protocol): the **same client** always goes to the same backend (useful for **session affinity**).

**Health probes.** The balancer **tests** each backend regularly (an HTTP/TCP **probe**). A backend that **fails** is **removed** from rotation — traffic no longer goes there, until it's healthy again. That's what makes delivery **resilient**: an instance going down doesn't break the service.

**L7 path-based routing.** At L7, you **route by URL**: `/api/*` → API pool, `/images/*` → static pool, the rest → web pool. One public address, several **specialized** backends. Impossible at L4 (which doesn't see the URL).

**Session affinity.** Some apps (cart, server session) require a client to **return** to the **same** backend. **Affinity** (by cookie at L7, by hash at L4) guarantees that **stickiness**. Use it **sparingly**: it **unbalances** the load and complicates scaling — prefer **stateless** backends when you can.

**What's live here.** The **algorithms** (round-robin, least connections, hash), the **probes** (excluding a down backend), the **L7 routing** and the **decision engine** (L4/L7, regional/global) are **runnable** in Python — **real** decisions reproducing Azure's logic. The **managed services** (Front Door, Traffic Manager) are **reasoned**; their **logic** is here **played for real**. All without a cloud account.
:::

:::figure azure-reseau-distribution-services
caption_fr: "Schéma 1. La distribution applicative : au niveau TRANSPORT, Azure LOAD BALANCER (L4, régional, TCP/UDP). Au niveau APPLICATION régional, APPLICATION GATEWAY (L7, routage par chemin + WAF + TLS). Au niveau GLOBAL, FRONT DOOR (L7, CDN + WAF, points de présence) et TRAFFIC MANAGER (DNS, dirige vers la bonne région). Chaque équilibreur : algorithme (round-robin / moindre connexions / hash) + SONDES qui excluent les backends défaillants."
caption_en: "Figure 1. Application delivery: at the TRANSPORT layer, Azure LOAD BALANCER (L4, regional, TCP/UDP). At the regional APPLICATION layer, APPLICATION GATEWAY (L7, path routing + WAF + TLS). At the GLOBAL layer, FRONT DOOR (L7, CDN + WAF, points of presence) and TRAFFIC MANAGER (DNS, directs to the right region). Each balancer: algorithm (round-robin / least connections / hash) + PROBES that exclude failing backends."
:::

## walkthrough

:::lang fr
On avance ainsi : choisir le service (L4/L7, régional/global) → algorithmes d'équilibrage → sondes de santé → routage L7 par chemin → distribution mondiale → affinité de session → distribution assemblée.
:::

:::lang en
We'll go like this: choose the service (L4/L7, regional/global) → load-balancing algorithms → health probes → L7 path routing → global delivery → session affinity → delivery assembled.
:::

### step-01

:::lang fr
**Objectif.** **Choisir** le bon service de distribution.

**🤔 Le bon outil pour le bon trafic.** L4 ou L7 ? Régional ou global ? Chaque combinaison a **son** service. On écrit un **moteur de décision** qui recommande Load Balancer, Application Gateway, Front Door ou Traffic Manager.

Écris le moteur de décision et teste-le :
:::

:::lang en
**Goal.** **Choose** the right delivery service.

**🤔 The right tool for the right traffic.** L4 or L7? Regional or global? Each combination has **its** service. We write a **decision engine** that recommends Load Balancer, Application Gateway, Front Door or Traffic Manager.

Write the decision engine and test it:
:::

```bash
mkdir -p distribution && cd distribution
cat > choix.py <<'PY'
def choisir(b):
    if b["couche"] == "L4":
        return "Azure Load Balancer", "L4 (TCP/UDP), regional, faible latence"
    if b["global"] and b["http"]:
        return "Azure Front Door", "L7 global, CDN + WAF, points de presence"
    if b["global"]:
        return "Traffic Manager", "DNS global (dirige vers le bon endpoint)"
    return "Application Gateway", "L7 regional, routage par chemin + WAF"

cas = [
    {"nom":"equilibrer du TCP interne", "couche":"L4", "global":False, "http":True},
    {"nom":"site web regional + WAF",   "couche":"L7", "global":False, "http":True},
    {"nom":"appli mondiale (CDN+WAF)",  "couche":"L7", "global":True,  "http":True},
    {"nom":"bascule DNS multi-region",  "couche":"L7", "global":True,  "http":False},
]
for c in cas:
    sol, pourquoi = choisir(c)
    print(f"{c['nom']:26} -> {sol:22} ({pourquoi})")
PY
python3 choix.py
```

:::lang fr
**✅ Vérification :** le moteur recommande : `equilibrer du TCP interne -> Azure Load Balancer`, `site web regional + WAF -> Application Gateway`, `appli mondiale -> Azure Front Door`, `bascule DNS multi-region -> Traffic Manager`. Chaque besoin trouve **son** service : **L4** (Load Balancer) pour du transport rapide, **L7 régional** (App Gateway) pour un site avec routage + WAF, **L7 global** (Front Door) pour une appli mondiale, et **DNS global** (Traffic Manager) pour orchestrer des régions. C'est **la** grille de décision de l'AZ-700. On regarde maintenant **comment** un équilibreur répartit.
:::

:::lang en
**✅ Check:** the engine recommends: `equilibrer du TCP interne -> Azure Load Balancer`, `site web regional + WAF -> Application Gateway`, `appli mondiale -> Azure Front Door`, `bascule DNS multi-region -> Traffic Manager`. Each need finds **its** service: **L4** (Load Balancer) for fast transport, **L7 regional** (App Gateway) for a site with routing + WAF, **L7 global** (Front Door) for a global app, and **global DNS** (Traffic Manager) to orchestrate regions. That's **the** AZ-700 decision grid. Now let's see **how** a balancer distributes.
:::

### step-02

:::lang fr
**Objectif.** Exécuter les **algorithmes d'équilibrage** — round-robin et moindre connexions.

**🤔 Quel backend pour cette requête ?** Deux algorithmes classiques : **round-robin** (à tour de rôle) et **moindre connexions** (le moins chargé). On les code et on les observe.

Écris les algorithmes et teste-les :
:::

:::lang en
**Goal.** Run the **load-balancing algorithms** — round-robin and least connections.

**🤔 Which backend for this request?** Two classic algorithms: **round-robin** (in turn) and **least connections** (the least loaded). We code them and observe.

Write the algorithms and test them:
:::

```bash
cat > lb.py <<'PY'
backends = [
    {"nom": "vm1", "sain": True,  "connexions": 5},
    {"nom": "vm2", "sain": True,  "connexions": 2},
    {"nom": "vm3", "sain": True,  "connexions": 8},
]
def sains(bs): return [b for b in bs if b["sain"]]

# Round-robin : a tour de role sur les backends sains
print("Round-robin :")
dispo = sains(backends)
for i in range(6):
    print(f"  requete {i+1} -> {dispo[i % len(dispo)]['nom']}")

# Moindre connexions : vers le moins charge
b = min(sains(backends), key=lambda x: x["connexions"])
print(f"Moindre connexions -> {b['nom']} ({b['connexions']} connexions)")
PY
python3 lb.py
```

:::lang fr
**✅ Vérification :** en **round-robin**, les requêtes tournent : `vm1, vm2, vm3, vm1, vm2, vm3` — chaque backend reçoit **sa part** à tour de rôle. En **moindre connexions**, le trafic va à `vm2 (2 connexions)` — le **moins chargé** (vs vm1=5, vm3=8). Le round-robin est **simple et équitable** ; le moindre connexions **s'adapte** à la charge réelle (utile si les requêtes ont des durées inégales). Azure Load Balancer utilise par défaut un **hash** (proche du round-robin par flux) ; le principe de répartition reste celui-ci. Mais que se passe-t-il si un backend **tombe** ?
:::

:::lang en
**✅ Check:** in **round-robin**, requests rotate: `vm1, vm2, vm3, vm1, vm2, vm3` — each backend gets **its share** in turn. In **least connections**, traffic goes to `vm2 (2 connexions)` — the **least loaded** (vs vm1=5, vm3=8). Round-robin is **simple and fair**; least connections **adapts** to real load (useful if requests have uneven durations). Azure Load Balancer uses a **hash** by default (close to per-flow round-robin); the distribution principle stays this. But what happens if a backend **goes down**?
:::

### step-03

:::lang fr
**Objectif.** Brancher des **sondes de santé** — exclure un backend défaillant.

**🤔 Ne pas envoyer de trafic à un mort.** Une **sonde** teste chaque backend. Celui qui **échoue** est **retiré** de la rotation. On simule une panne (`vm3` KO) et on vérifie qu'aucune requête n'y va.

Ajoute les sondes et observe l'exclusion :
:::

:::lang en
**Goal.** Wire **health probes** — exclude a failing backend.

**🤔 Don't send traffic to a dead one.** A **probe** tests each backend. The one that **fails** is **removed** from rotation. We simulate a failure (`vm3` down) and check no request goes there.

Add the probes and observe the exclusion:
:::

```bash
cat > sondes.py <<'PY'
backends = [
    {"nom": "vm1", "sain": True},
    {"nom": "vm2", "sain": True},
    {"nom": "vm3", "sain": False},   # sonde KO -> exclu de la rotation
]
def sains(bs): return [b for b in bs if b["sain"]]

dispo = sains(backends)
print("Backends sains (sonde OK) :", [b["nom"] for b in dispo])
print("Round-robin sur les SAINS uniquement :")
for i in range(4):
    print(f"  requete {i+1} -> {dispo[i % len(dispo)]['nom']}")
print("-> vm3 (sonde KO) ne recoit AUCUNE requete.")
PY
python3 sondes.py
```

:::lang fr
**✅ Vérification :** la sortie montre `Backends sains (sonde OK) : ['vm1', 'vm2']` — `vm3` est **exclu**. Le round-robin ne tourne **que** sur `vm1` et `vm2` : `vm1, vm2, vm1, vm2`. **Aucune** requête ne part vers `vm3` tant que sa sonde échoue. C'est ce qui rend la distribution **résiliente** : un backend qui tombe est **retiré automatiquement**, le service continue sur les instances **saines**. Quand `vm3` redeviendra sain (sonde OK), il **réintègre** la rotation. Passons au routage **applicatif** (L7).
:::

:::lang en
**✅ Check:** the output shows `Backends sains (sonde OK) : ['vm1', 'vm2']` — `vm3` is **excluded**. Round-robin cycles **only** over `vm1` and `vm2`: `vm1, vm2, vm1, vm2`. **No** request goes to `vm3` while its probe fails. That's what makes delivery **resilient**: a backend that goes down is **removed automatically**, the service continues on the **healthy** instances. When `vm3` becomes healthy again (probe OK), it **rejoins** rotation. On to **application** routing (L7).
:::

### step-04

:::lang fr
**Objectif.** Faire du **routage L7 par chemin** — Application Gateway.

**🤔 Router selon l'URL.** En L7, l'équilibreur **lit** l'URL et **dirige** : `/api/*` → pool d'API, `/images/*` → pool statique, le reste → pool web. Une seule adresse, des backends **spécialisés**. On code cette logique.

Écris le routage par chemin et teste-le :
:::

:::lang en
**Goal.** Do **L7 path-based routing** — Application Gateway.

**🤔 Route by URL.** At L7, the balancer **reads** the URL and **directs**: `/api/*` → API pool, `/images/*` → static pool, the rest → web pool. One address, **specialized** backends. We code this logic.

Write the path routing and test it:
:::

```bash
cat > l7.py <<'PY'
# Application Gateway (L7) : routage par CHEMIN d'URL (regles evaluees dans l'ordre)
REGLES = [("/api", "pool-api"), ("/images", "pool-static")]
def router(chemin):
    for prefixe, pool in REGLES:
        if chemin.startswith(prefixe):
            return pool
    return "pool-web"   # regle par defaut

for chemin in ["/api/users", "/images/logo.png", "/accueil", "/api/v2/commandes"]:
    print(f"{chemin:20} -> {router(chemin)}")
PY
python3 l7.py
```

:::lang fr
**✅ Vérification :** le routage L7 dirige : `/api/users -> pool-api`, `/images/logo.png -> pool-static`, `/accueil -> pool-web` (règle par défaut), `/api/v2/commandes -> pool-api`. L'équilibreur **comprend** l'URL et envoie chaque requête au **backend spécialisé** — impossible en **L4** (qui ne voit que IP/port). C'est la force de l'**Application Gateway** : une seule entrée publique, un routage **applicatif** vers plusieurs pools (API, statique, web), plus la **terminaison TLS** et le **WAF**. Pour aller **au-delà d'une région**, on passe au **global**.
:::

:::lang en
**✅ Check:** L7 routing directs: `/api/users -> pool-api`, `/images/logo.png -> pool-static`, `/accueil -> pool-web` (default rule), `/api/v2/commandes -> pool-api`. The balancer **understands** the URL and sends each request to the **specialized backend** — impossible at **L4** (which only sees IP/port). That's the power of **Application Gateway**: one public entry, **application** routing to several pools (API, static, web), plus **TLS termination** and **WAF**. To go **beyond a region**, we move to **global**.
:::

### step-05

:::lang fr
**Objectif.** Comprendre la **distribution mondiale** — Front Door et Traffic Manager.

**🤔 Servir le monde entier.** Deux approches globales : **Front Door** (L7, CDN + WAF, met en cache près de l'utilisateur) et **Traffic Manager** (DNS, dirige vers la meilleure **région**). On modélise le choix de région selon la géographie de l'utilisateur.

Modélise la distribution mondiale :
:::

:::lang en
**Goal.** Understand **global delivery** — Front Door and Traffic Manager.

**🤔 Serving the whole world.** Two global approaches: **Front Door** (L7, CDN + WAF, caches near the user) and **Traffic Manager** (DNS, directs to the best **region**). We model the region choice by user geography.

Model global delivery:
:::

```bash
cat > global.py <<'PY'
# Distribution globale : diriger l'utilisateur vers la region la plus proche
REGIONS = {"europe": "westeurope", "amerique": "eastus", "asie": "southeastasia"}
def diriger(continent):
    return REGIONS.get(continent, "westeurope")   # repli par defaut

print("Traffic Manager / Front Door — routage geographique :")
for user, continent in [("Paris", "europe"), ("New York", "amerique"), ("Tokyo", "asie"), ("Le Caire", "afrique")]:
    print(f"  {user:10} ({continent:9}) -> region {diriger(continent)}")
print("\nFront Door : en plus, MET EN CACHE le statique au point de presence (CDN) + WAF global.")
print("Traffic Manager : repond au DNS (priorite/poids/geo), ne voit pas le trafic.")
PY
python3 global.py
```

:::lang fr
**✅ Vérification :** la sortie dirige chaque utilisateur vers **sa** région : `Paris (europe) -> westeurope`, `New York (amerique) -> eastus`, `Tokyo (asie) -> southeastasia`, `Le Caire (afrique) -> westeurope` (repli). C'est la **distribution mondiale** : servir l'utilisateur depuis la région la **plus proche** (latence minimale). **Front Door** ajoute le **CDN** (cache du statique au **point de présence**, au plus près) et un **WAF global** ; **Traffic Manager** agit au niveau **DNS** (il **répond** avec le bon endpoint, sans voir le trafic). Deux outils complémentaires pour le **global**. Reste un cas délicat : l'**affinité de session**.
:::

:::lang en
**✅ Check:** the output directs each user to **their** region: `Paris (europe) -> westeurope`, `New York (amerique) -> eastus`, `Tokyo (asie) -> southeastasia`, `Le Caire (afrique) -> westeurope` (fallback). That's **global delivery**: serving the user from the **nearest** region (minimal latency). **Front Door** adds the **CDN** (caching static at the **point of presence**, closest) and a **global WAF**; **Traffic Manager** acts at the **DNS** level (it **answers** with the right endpoint, without seeing the traffic). Two complementary tools for **global**. One tricky case remains: **session affinity**.
:::

### step-06

:::lang fr
**Objectif.** Gérer l'**affinité de session** — le même client au même backend.

**🤔 Parfois, il faut de la collance.** Une appli à **état** (panier en mémoire) exige qu'un client **revienne** au même backend. Un **hash** de l'identité du client (IP, ou cookie en L7) garantit cette **collance**. On code un hash stable.

Écris l'affinité par hash et teste-la :
:::

:::lang en
**Goal.** Handle **session affinity** — the same client to the same backend.

**🤔 Sometimes you need stickiness.** A **stateful** app (in-memory cart) requires a client to **return** to the same backend. A **hash** of the client identity (IP, or cookie at L7) guarantees that **stickiness**. We code a stable hash.

Write hash affinity and test it:
:::

```bash
cat > affinite.py <<'PY'
import hashlib
backends = ["vm1", "vm2", "vm3"]
def backend_pour(client_ip):
    # hash stable : le MEME client -> TOUJOURS le meme backend
    h = int(hashlib.sha256(client_ip.encode()).hexdigest(), 16)
    return backends[h % len(backends)]

print("Affinite de session (hash de l'IP client) :")
for ip in ["203.0.113.5", "198.51.100.9", "203.0.113.5", "192.0.2.1"]:
    print(f"  {ip:14} -> {backend_pour(ip)}")
print("-> Note : 203.0.113.5 tombe DEUX fois sur le meme backend (collant).")
PY
python3 affinite.py
```

:::lang fr
**✅ Vérification :** la sortie montre que chaque IP est routée de façon **stable** — et surtout que `203.0.113.5` (présent **deux fois**) tombe sur le **même** backend les deux fois. C'est l'**affinité de session** : le même client **revient** au même backend, indispensable pour une appli à **état** (panier, session serveur). ⚠️ À utiliser **avec parcimonie** : l'affinité **déséquilibre** la charge (un « gros » client surcharge un backend) et complique le **scaling**. La bonne pratique : rendre les backends **sans état** (session en base/cache partagé) et **éviter** l'affinité quand c'est possible. Tu as la mécanique complète de la distribution.
:::

:::lang en
**✅ Check:** the output shows each IP is routed **stably** — and crucially that `203.0.113.5` (present **twice**) lands on the **same** backend both times. That's **session affinity**: the same client **returns** to the same backend, essential for a **stateful** app (cart, server session). ⚠️ Use it **sparingly**: affinity **unbalances** the load (a "big" client overloads a backend) and complicates **scaling**. Best practice: make backends **stateless** (session in a shared DB/cache) and **avoid** affinity when possible. You have the full delivery mechanics.
:::

### step-07

:::lang fr
**Objectif.** Assembler la **distribution applicative** et récapituler.

**🤔 Distribuer, de bout en bout.** On récapitule les services et les mécanismes — choix L4/L7/global, algorithmes, sondes, routage L7, affinité — qui **répartissent** et **fiabilisent** le trafic.

Récapitule la distribution :
:::

:::lang en
**Goal.** Assemble **application delivery** and recap.

**🤔 Deliver, end to end.** We recap the services and mechanisms — L4/L7/global choice, algorithms, probes, L7 routing, affinity — that **spread** and **harden** traffic.

Recap delivery:
:::

```bash
echo "=== Distribution applicative (AZ-700) / application delivery ==="
printf "%-22s %s\n" "Load Balancer (L4)"   "TCP/UDP, regional, faible latence"
printf "%-22s %s\n" "App Gateway (L7)"      "HTTP, routage par chemin, WAF, TLS (regional)"
printf "%-22s %s\n" "Front Door (L7)"       "global : CDN + WAF + acceleration"
printf "%-22s %s\n" "Traffic Manager"       "DNS global : dirige vers la bonne region"
printf "%-22s %s\n" "Algorithmes"           "round-robin / moindre connexions / hash"
printf "%-22s %s\n" "Sondes de sante"       "excluent les backends defaillants (resilience)"
printf "%-22s %s\n" "Affinite de session"   "collant (hash/cookie) — avec parcimonie"
```

:::lang fr
**✅ Vérification :** la table récapitule les **services** et **mécanismes** de la distribution. Tu tiens le pilier **distribution** de l'AZ-700 : **choisir** entre Load Balancer (L4), Application Gateway (L7), Front Door (global) et Traffic Manager (DNS), comprendre les **algorithmes** (round-robin, moindre connexions, hash), fiabiliser avec des **sondes** (exclusion des défaillants), **router en L7** par chemin, distribuer **mondialement**, et gérer l'**affinité** avec parcimonie. Ton appli **tient la charge** et **résiste** aux pannes. La suite du track AZ-700 : l'**accès privé** aux services (points de terminaison privés, Private Link), puis le **projet réseau** de synthèse.
:::

:::lang en
**✅ Check:** the table recaps delivery's **services** and **mechanisms**. You hold the **delivery** pillar of AZ-700: **choosing** between Load Balancer (L4), Application Gateway (L7), Front Door (global) and Traffic Manager (DNS), understanding the **algorithms** (round-robin, least connections, hash), hardening with **probes** (excluding failing ones), **L7 routing** by path, delivering **globally**, and handling **affinity** sparingly. Your app **holds the load** and **survives** failures. Next in the AZ-700 track: **private access** to services (private endpoints, Private Link), then the capstone **network project**.
:::

## pitfalls

:::lang fr
**1. L4 quand il faut du L7.** Le Load Balancer (L4) ne voit **pas** l'URL : impossible de router par chemin ou d'appliquer un WAF. Pour de l'HTTP, prends **App Gateway/Front Door**.

**2. Pas de sondes de santé.** Sans sonde, le trafic continue vers un backend **mort** → erreurs. Configure toujours une **sonde** adaptée.

**3. Front Door pour du régional.** Front Door est **global** (et facturé comme tel). Pour un seul site régional, **App Gateway** suffit.

**4. Traffic Manager confondu avec un équilibreur.** Il agit au **DNS** — il ne **voit pas** le trafic, ne fait pas d'équilibrage par requête. Il **dirige** vers un endpoint.

**5. Affinité systématique.** L'affinité **déséquilibre** et complique le scaling. Rends tes backends **sans état** et n'utilise l'affinité qu'en **dernier recours**.

**6. Sonde trop laxiste/sensible.** Trop laxiste → trafic vers un mort ; trop sensible → backends sains exclus (flapping). Calibre l'intervalle et le seuil.

**7. Un seul backend.** « Équilibrer » sur une seule instance n'apporte **ni** montée en charge **ni** résilience. Il faut **plusieurs** backends sains.
:::

:::lang en
**1. L4 when you need L7.** The Load Balancer (L4) doesn't see the **URL**: no path routing or WAF. For HTTP, use **App Gateway/Front Door**.

**2. No health probes.** Without a probe, traffic keeps going to a **dead** backend → errors. Always configure a suitable **probe**.

**3. Front Door for regional.** Front Door is **global** (and billed as such). For a single regional site, **App Gateway** suffices.

**4. Traffic Manager confused with a balancer.** It works at **DNS** — it doesn't **see** traffic, doesn't balance per request. It **directs** to an endpoint.

**5. Systematic affinity.** Affinity **unbalances** and complicates scaling. Make backends **stateless** and use affinity only as a **last resort**.

**6. Too lax/sensitive a probe.** Too lax → traffic to a dead one; too sensitive → healthy backends excluded (flapping). Tune the interval and threshold.

**7. A single backend.** "Balancing" on one instance provides **neither** scale **nor** resilience. You need **several** healthy backends.
:::

## success

:::lang fr
Tu as réussi si :

- Tu **choisis** entre Load Balancer, App Gateway, Front Door et Traffic Manager.
- Tu distingues **L4** et **L7** et sais ce que chacun peut faire.
- Tu exécutes **round-robin** et **moindre connexions**.
- Tu branches des **sondes** qui **excluent** un backend défaillant.
- Tu fais du **routage L7 par chemin**.
- Tu comprends la **distribution mondiale** (Front Door / Traffic Manager) et l'**affinité de session**.
:::

:::lang en
You've succeeded if:

- You **choose** between Load Balancer, App Gateway, Front Door and Traffic Manager.
- You distinguish **L4** and **L7** and know what each can do.
- You run **round-robin** and **least connections**.
- You wire **probes** that **exclude** a failing backend.
- You do **L7 path-based routing**.
- You understand **global delivery** (Front Door / Traffic Manager) and **session affinity**.
:::

## next

:::lang fr
- **Suivant :** *Azure — accès privé aux services (AZ-700)* — points de terminaison privés, Private Link, points de terminaison de service.
- **Réviser :** *Azure — connectivité hybride (AZ-700)* pour le multi-région.
- **S'entraîner :** ajoute un algorithme **pondéré** (weighted) à `lb.py`, et une règle L7 par **hôte** (host header) à `l7.py`.
:::

:::lang en
- **Next:** *Azure — private access to services (AZ-700)* — private endpoints, Private Link, service endpoints.
- **Review:** *Azure — hybrid connectivity (AZ-700)* for multi-region.
- **Practice:** add a **weighted** algorithm to `lb.py`, and an L7 rule by **host** (host header) to `l7.py`.
:::

## cheatsheet

:::lang fr
**Le bon service selon le besoin**

```text
L4, TCP/UDP, regional            -> Azure Load Balancer
L7, HTTP, regional (routage+WAF) -> Application Gateway
L7, HTTP, GLOBAL (CDN+WAF)       -> Azure Front Door
DNS, GLOBAL (dirige par region)  -> Traffic Manager
```

**Algorithmes d'equilibrage**

```text
Round-robin        a tour de role (simple, equitable)
Moindre connexions vers le backend le moins charge
Hash (5-tuple)     meme client -> meme backend (affinite)
```

**Sondes & resilience**

```text
sonde HTTP/TCP -> teste chaque backend
backend KO -> RETIRE de la rotation (aucun trafic)
backend redevenu sain -> REINTEGRE automatiquement
```

**L7 & affinite**

```text
routage L7 : /api -> pool-api ; /images -> pool-static ; / -> pool-web
affinite : collant (cookie L7 / hash L4) -> avec PARCIMONIE (backends sans etat de preference)
```
:::

:::lang en
**The right service by need**

```text
L4, TCP/UDP, regional            -> Azure Load Balancer
L7, HTTP, regional (routing+WAF) -> Application Gateway
L7, HTTP, GLOBAL (CDN+WAF)       -> Azure Front Door
DNS, GLOBAL (directs by region)  -> Traffic Manager
```

**Load-balancing algorithms**

```text
Round-robin        in turn (simple, fair)
Least connections  to the least-loaded backend
Hash (5-tuple)     same client -> same backend (affinity)
```

**Probes & resilience**

```text
HTTP/TCP probe -> tests each backend
down backend -> REMOVED from rotation (no traffic)
healthy again -> REJOINS automatically
```

**L7 & affinity**

```text
L7 routing: /api -> pool-api ; /images -> pool-static ; / -> pool-web
affinity: sticky (L7 cookie / L4 hash) -> SPARINGLY (prefer stateless backends)
```
:::

## resources

:::lang fr
- **Azure Load Balancer** : L4, règles, sondes, SKU — Microsoft Learn.
- **Application Gateway** : L7, routage chemin/hôte, WAF, TLS — Microsoft Learn.
- **Azure Front Door** : global, CDN, WAF, accélération — Microsoft Learn (AZ-700).
- **Traffic Manager** : routage DNS (priorité, poids, géographie, performance) — Microsoft Learn.
- **Sondes de santé** : intervalles, seuils, chemins — Microsoft Learn.
- **Load balancing decision** : comparateur de services Azure — Microsoft Learn.
:::

:::lang en
- **Azure Load Balancer**: L4, rules, probes, SKUs — Microsoft Learn.
- **Application Gateway**: L7, path/host routing, WAF, TLS — Microsoft Learn.
- **Azure Front Door**: global, CDN, WAF, acceleration — Microsoft Learn (AZ-700).
- **Traffic Manager**: DNS routing (priority, weight, geography, performance) — Microsoft Learn.
- **Health probes**: intervals, thresholds, paths — Microsoft Learn.
- **Load balancing decision**: Azure service comparator — Microsoft Learn.
:::

## troubleshooting

:::lang fr
**Les scripts Python n'affichent rien.** Lance `python3 fichier.py` depuis le dossier `distribution`. Chaque script est autonome.

**Mon équilibreur ne route pas par chemin.** Le **L4** (Load Balancer) ne voit **pas** l'URL. Pour router par `/api`, il faut du **L7** (Application Gateway / Front Door).

**Le trafic va vers un backend en panne.** La **sonde** manque ou est mal configurée. Vérifie son **chemin**, son **intervalle** et son **seuil** ; le backend KO doit sortir de la rotation.

**La charge est déséquilibrée.** Souvent l'**affinité de session** (un client colle à un backend). Désactive-la si tu peux, ou rends les backends **sans état**.

**Front Door ou App Gateway ?** **Global** (mondial, CDN) → Front Door. **Régional** (un site/API dans une région) → Application Gateway. Ne paie pas le global pour du régional.

**Traffic Manager n'équilibre pas la charge.** Normal : il agit au **DNS**, il **dirige** vers un endpoint (par géo/priorité/poids). Pour équilibrer **par requête**, il faut un vrai équilibreur (LB/App Gateway/Front Door) **derrière**.
:::

:::lang en
**The Python scripts print nothing.** Run `python3 file.py` from the `distribution` folder. Each script is standalone.

**My balancer doesn't route by path.** **L4** (Load Balancer) doesn't see the **URL**. To route by `/api`, you need **L7** (Application Gateway / Front Door).

**Traffic goes to a down backend.** The **probe** is missing or misconfigured. Check its **path**, **interval** and **threshold**; the down backend should leave rotation.

**The load is unbalanced.** Often **session affinity** (a client sticks to a backend). Disable it if you can, or make backends **stateless**.

**Front Door or App Gateway?** **Global** (worldwide, CDN) → Front Door. **Regional** (a site/API in one region) → Application Gateway. Don't pay for global for regional.

**Traffic Manager doesn't balance load.** Normal: it works at **DNS**, it **directs** to an endpoint (by geo/priority/weight). To balance **per request**, you need a real balancer (LB/App Gateway/Front Door) **behind** it.
:::
