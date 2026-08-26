---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-conception-infrastructure
slug: azure-conception-infrastructure
order: 68
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — conception d'infrastructure (AZ-305) : compute & réseau"
title_en: "Azure — infrastructure design (AZ-305): compute & networking"
tagline_fr: "conteneurs, App Service, équilibrage, distribution mondiale."
tagline_en: "containers, App Service, load balancing, global distribution."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 250
repo: "moabukar/miniblue"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: [azure-architecture-well-architected]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [conception-compute, conteneurs, aks, container-apps, aci, acr, app-service, equilibrage-charge, front-door, application-gateway, migration, az-305]
concepts_en: [compute-design, containers, aks, container-apps, aci, acr, app-service, load-balancing, front-door, application-gateway, migration, az-305]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "La conception d'infrastructure Azure pour l'AZ-305 : choisir le compute et le réseau. On déploie EN LOCAL sur miniblue les options conteneurs (AKS, Container Apps, ACI, registre ACR), on décrit App Service et un équilibreur de charge (Load Balancer) en Bicep, et on conçoit la distribution mondiale (Front Door, Application Gateway + WAF, Traffic Manager). Puis on grave les grilles de choix compute et équilibrage, et les approches de migration. Sans compte ni facture."
og_description_en: "Azure infrastructure design for AZ-305: choosing compute and networking. We deploy LOCALLY on miniblue the container options (AKS, Container Apps, ACI, ACR registry), describe App Service and a load balancer (Load Balancer) in Bicep, and design global distribution (Front Door, Application Gateway + WAF, Traffic Manager). Then we engrave the compute and load-balancing choice grids, and migration approaches. No account or bill."
---

## intro

:::lang fr
Après les données et la continuité, voici la **conception d'infrastructure** — le plus gros domaine de l'examen **AZ-305** : quel **compute** (machines, conteneurs, serverless) et quel **réseau** (équilibrage, distribution mondiale) pour héberger et exposer une application ? C'est le cœur du métier d'architecte d'infrastructure.

Ce guide couvre les deux. Côté **compute**, on déploie **en local** sur miniblue tout le spectre des conteneurs — **AKS** (Kubernetes managé), **Container Apps** (conteneurs serverless), **ACI** (conteneur ponctuel) et le **registre ACR** — et on décrit **App Service** (PaaS web) en Bicep. Côté **réseau**, on décrit un **équilibreur de charge** (Load Balancer) en Bicep, et on conçoit la **distribution mondiale** : **Front Door** (global, L7, CDN, WAF), **Application Gateway** (régional, L7, WAF), **Traffic Manager** (DNS). Enfin, on grave les **grilles de choix** (compute ; équilibrage) et les **approches de migration** que l'AZ-305 teste.

C'est le quatrième guide du track **AZ-305**. L'architecte d'infrastructure ne code pas l'appli — il **choisit et assemble** les briques qui la font tourner, tenir la charge et rester joignable partout.

**Pour qui c'est :** tu as fait *architecture (WAF)* et tu veux concevoir compute et réseau.

**Quand ce n'est PAS le bon choix :**

- Tu débutes sur les VM/réseau → fais l'*AZ-104* d'abord.
- Tu veux administrer un cluster Kubernetes → ici c'est le **choix** et l'**architecture**, pas l'exploitation fine d'AKS.
:::

:::lang en
After data and continuity, here's **infrastructure design** — the biggest **AZ-305** exam domain: which **compute** (machines, containers, serverless) and which **networking** (load balancing, global distribution) to host and expose an application? It's the core of the infrastructure architect's job.

This guide covers both. On the **compute** side, we deploy **locally** on miniblue the whole container spectrum — **AKS** (managed Kubernetes), **Container Apps** (serverless containers), **ACI** (one-off container) and the **ACR registry** — and describe **App Service** (web PaaS) in Bicep. On the **networking** side, we describe a **load balancer** (Load Balancer) in Bicep, and design **global distribution**: **Front Door** (global, L7, CDN, WAF), **Application Gateway** (regional, L7, WAF), **Traffic Manager** (DNS). Finally, we engrave the **choice grids** (compute; load balancing) and the **migration approaches** the AZ-305 tests.

This is the fourth guide of the **AZ-305** track. The infrastructure architect doesn't code the app — they **choose and assemble** the blocks that make it run, handle load, and stay reachable everywhere.

**Who it's for:** you've done *architecture (WAF)* and want to design compute and networking.

**When it's NOT the right choice:**

- You're new to VMs/networking → do *AZ-104* first.
- You want to administer a Kubernetes cluster → here it's the **choice** and **architecture**, not fine AKS operations.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Situer le **spectre du compute** (VM → App Service → conteneurs → serverless).
- Déployer les options **conteneurs** (AKS, Container Apps, ACI) et un **registre** (ACR).
- Décrire **App Service** en Bicep.
- Décrire un **équilibreur de charge** (Load Balancer) en Bicep.
- Distinguer **L4 vs L7**, **régional vs global**.
- Concevoir la **distribution mondiale** (Front Door, App Gateway, Traffic Manager).
- Choisir **compute** et **équilibrage** par grille, et connaître les **migrations**.
:::

:::lang en
By the end of this guide, you can:

- Place the **compute spectrum** (VM → App Service → containers → serverless).
- Deploy the **container** options (AKS, Container Apps, ACI) and a **registry** (ACR).
- Describe **App Service** in Bicep.
- Describe a **load balancer** (Load Balancer) in Bicep.
- Distinguish **L4 vs L7**, **regional vs global**.
- Design **global distribution** (Front Door, App Gateway, Traffic Manager).
- Choose **compute** and **load balancing** by grid, and know the **migrations**.
:::

## prerequisites

:::lang fr
- Le guide **Azure architecture (WAF)** terminé, et **miniblue** qui tourne.
- **Bicep** installé.
- Rappel : les services (conteneurs, registre) se créent via `azlocal` (live) ; App Service et l'équilibrage se décrivent en **Bicep**.
:::

:::lang en
- The **Azure architecture (WAF)** guide done, and **miniblue** running.
- **Bicep** installed.
- Reminder: services (containers, registry) are created via `azlocal` (live); App Service and load balancing are described in **Bicep**.
:::

## concepts

:::lang fr
**Le spectre du compute.** Du plus « tu gères » au plus « managé » : **VM** (IaaS — tu gères l'OS) → **App Service** (PaaS — tu déposes ton code) → **Container Apps** / **AKS** (conteneurs) → **Functions** (serverless — tu déposes une fonction). Plus tu montes dans le spectre, moins tu gères l'infrastructure, plus tu te concentres sur le code — mais moins tu as de contrôle bas niveau. L'architecte place le curseur selon le besoin.

**Les conteneurs.** Un **conteneur** empaquète une appli et ses dépendances. Trois façons de les exécuter sur Azure : **ACI (Container Instances)** — un conteneur isolé, ponctuel (tâche batch, test) ; **Container Apps** — conteneurs **serverless** avec scale-to-zero et montée en charge automatique (microservices modernes, la voie recommandée pour beaucoup de cas) ; **AKS (Azure Kubernetes Service)** — Kubernetes **managé**, contrôle total de l'orchestration (grandes plateformes, besoins avancés). Les images vivent dans un **registre ACR (Azure Container Registry)**.

**App Service (PaaS web).** Héberge des applis **web/API** sans gérer l'OS : déploiement continu, mise à l'échelle intégrée (scale up/out), slots de déploiement (blue-green), certificats. Idéal pour une appli web classique à trafic soutenu — le compromis productivité/contrôle.

**L'équilibrage de charge.** Répartir le trafic sur plusieurs instances. Deux niveaux : **L4** (transport, IP/port) → **Azure Load Balancer** (rapide, régional, TCP/UDP) ; **L7** (applicatif, HTTP, URL/en-têtes) → **Application Gateway** (régional, avec **WAF** — pare-feu applicatif). Deux portées : **régional** (dans une région) vs **global** (mondial).

**La distribution mondiale.** Pour servir des utilisateurs partout et basculer entre régions : **Front Door** (global, L7, avec CDN + WAF — le point d'entrée mondial moderne) ; **Traffic Manager** (répartition par **DNS**, global, oriente vers la région la plus proche/saine) ; **Application Gateway** (L7 régional, souvent **derrière** Front Door). On combine : Front Door (global) → App Gateway (régional, WAF) → backend.

**La migration.** Faire venir des workloads existants : **lift-and-shift** (rehost — déplacer tel quel en VM, rapide) ; **replatform** (adapter légèrement — passer sur App Service/conteneurs) ; **refactor/rearchitect** (moderniser — microservices, serverless). Plus on modernise, plus on gagne en agilité/coût, mais plus l'effort monte. Outils : **Azure Migrate**.

**Ce qui est live ici.** Les **conteneurs** (AKS, Container Apps, ACI) et le **registre ACR** se déploient en live sur miniblue via `azlocal`. **App Service** et l'**équilibreur de charge** se décrivent et **valident en Bicep**. La distribution mondiale (Front Door, Traffic Manager) est vue en **concept + décision** — le cœur de l'AZ-305.
:::

:::lang en
**The compute spectrum.** From most "you manage" to most "managed": **VM** (IaaS — you manage the OS) → **App Service** (PaaS — you drop your code) → **Container Apps** / **AKS** (containers) → **Functions** (serverless — you drop a function). The higher you go, the less infrastructure you manage, the more you focus on code — but the less low-level control you have. The architect sets the cursor by the need.

**Containers.** A **container** packages an app and its dependencies. Three ways to run them on Azure: **ACI (Container Instances)** — an isolated, one-off container (batch task, test); **Container Apps** — **serverless** containers with scale-to-zero and automatic scaling (modern microservices, the recommended path for many cases); **AKS (Azure Kubernetes Service)** — **managed** Kubernetes, full orchestration control (large platforms, advanced needs). Images live in an **ACR (Azure Container Registry)** registry.

**App Service (web PaaS).** Hosts **web/API** apps without managing the OS: continuous deployment, built-in scaling (up/out), deployment slots (blue-green), certificates. Ideal for a classic web app with sustained traffic — the productivity/control tradeoff.

**Load balancing.** Spreading traffic across several instances. Two levels: **L4** (transport, IP/port) → **Azure Load Balancer** (fast, regional, TCP/UDP); **L7** (application, HTTP, URL/headers) → **Application Gateway** (regional, with **WAF** — application firewall). Two scopes: **regional** (within a region) vs **global** (worldwide).

**Global distribution.** To serve users everywhere and fail over between regions: **Front Door** (global, L7, with CDN + WAF — the modern global entry point); **Traffic Manager** (**DNS**-based routing, global, directs to the nearest/healthiest region); **Application Gateway** (regional L7, often **behind** Front Door). You combine: Front Door (global) → App Gateway (regional, WAF) → backend.

**Migration.** Bringing in existing workloads: **lift-and-shift** (rehost — move as-is to a VM, fast); **replatform** (adapt lightly — move to App Service/containers); **refactor/rearchitect** (modernize — microservices, serverless). The more you modernize, the more agility/cost you gain, but the more effort rises. Tools: **Azure Migrate**.

**What's live here.** The **containers** (AKS, Container Apps, ACI) and the **ACR registry** deploy live on miniblue via `azlocal`. **App Service** and the **load balancer** are described and **validated in Bicep**. Global distribution (Front Door, Traffic Manager) is seen as **concept + decision** — the AZ-305 core.
:::

:::figure azure-infra-compute-reseau
caption_fr: "Schéma 1. Concevoir l'infrastructure : le spectre COMPUTE (VM → App Service → Container Apps/AKS/ACI → Functions, du plus géré au plus serverless, images dans ACR) ; l'ÉQUILIBRAGE (Load Balancer L4, Application Gateway L7+WAF) et la DISTRIBUTION mondiale (Front Door global + CDN + WAF, Traffic Manager DNS). On assemble : Front Door → App Gateway → compute."
caption_en: "Figure 1. Designing infrastructure: the COMPUTE spectrum (VM → App Service → Container Apps/AKS/ACI → Functions, from most managed to most serverless, images in ACR); LOAD BALANCING (Load Balancer L4, Application Gateway L7+WAF) and global DISTRIBUTION (Front Door global + CDN + WAF, Traffic Manager DNS). We assemble: Front Door → App Gateway → compute."
:::

## walkthrough

:::lang fr
On avance ainsi : conteneurs (AKS/Container Apps/ACI) → registre ACR → App Service (Bicep) → équilibrage (Bicep) → distribution mondiale → grilles & migration → nettoyage.
:::

:::lang en
We'll go like this: containers (AKS/Container Apps/ACI) → ACR registry → App Service (Bicep) → load balancing (Bicep) → global distribution → grids & migration → cleanup.
:::

### step-01

:::lang fr
**Objectif.** Déployer les options **conteneurs** — AKS, Container Apps, ACI, en live.

**🤔 Trois façons d'exécuter un conteneur.** Selon le besoin : **ACI** pour un conteneur **ponctuel** (une tâche), **Container Apps** pour des **microservices serverless** (scale-to-zero, la voie moderne), **AKS** pour un **Kubernetes managé** (contrôle total, grandes plateformes). On les crée pour comparer.

Crée les trois :
:::

:::lang en
**Goal.** Deploy the **container** options — AKS, Container Apps, ACI, live.

**🤔 Three ways to run a container.** By need: **ACI** for a **one-off** container (a task), **Container Apps** for **serverless microservices** (scale-to-zero, the modern path), **AKS** for **managed Kubernetes** (full control, large platforms). We create them to compare.

Create the three:
:::

```bash
azlocal group create --name rg-infra --location westeurope

azlocal aci create          --name aci-tache    --resource-group rg-infra   # conteneur ponctuel
azlocal containerapp create --name ca-microsvc  --resource-group rg-infra   # serverless
azlocal aks create          --name aks-platforme --resource-group rg-infra  # Kubernetes managé
```

:::lang fr
**✅ Vérification :** les trois créations renvoient des objets ARM `Succeeded` : `aci-tache`, `ca-microsvc`, `aks-platforme`. Tu tiens le **spectre conteneur**. Retiens le **choix** : tâche batch isolée → **ACI** (le plus simple) ; microservices web à charge variable → **Container Apps** (serverless, scale-to-zero, sans gérer Kubernetes) ; besoin d'orchestration avancée, multi-équipes, portabilité Kubernetes → **AKS** (le plus puissant, mais le plus à gérer). ⚠️ Règle : prends **Container Apps** par défaut pour des microservices modernes ; ne passe à **AKS** que si tu as **vraiment** besoin du contrôle Kubernetes — sinon tu paies une complexité inutile.
:::

:::lang en
**✅ Check:** the three creations return `Succeeded` ARM objects: `aci-tache`, `ca-microsvc`, `aks-platforme`. You hold the **container spectrum**. Remember the **choice**: isolated batch task → **ACI** (the simplest); web microservices with variable load → **Container Apps** (serverless, scale-to-zero, no Kubernetes to manage); need for advanced orchestration, multi-team, Kubernetes portability → **AKS** (the most powerful, but the most to manage). ⚠️ Rule: take **Container Apps** by default for modern microservices; move to **AKS** only if you **truly** need Kubernetes control — else you pay for needless complexity.
:::

### step-02

:::lang fr
**Objectif.** Déployer un **registre de conteneurs** (ACR) — le stockage des images, en live.

**🤔 Où vivent les images.** Un conteneur s'exécute à partir d'une **image**. En entreprise, les images privées vivent dans un **registre ACR (Azure Container Registry)** : on y **pousse** (push) les images construites, et AKS/Container Apps/ACI les **tirent** (pull) pour s'exécuter. C'est la brique centrale d'une plateforme conteneurisée.

Crée le registre :
:::

:::lang en
**Goal.** Deploy a **container registry** (ACR) — image storage, live.

**🤔 Where images live.** A container runs from an **image**. In a company, private images live in an **ACR (Azure Container Registry)**: you **push** built images there, and AKS/Container Apps/ACI **pull** them to run. It's the central block of a containerized platform.

Create the registry:
:::

```bash
azlocal acr create --name registreentreprise --resource-group rg-infra
azlocal acr list --resource-group rg-infra
```

:::lang fr
**✅ Vérification :** `acr create` renvoie un registre `registreentreprise` `Succeeded`, listé par `acr list`. Ta plateforme conteneurisée est complète : un **registre** (ACR) pour les images, et des **exécuteurs** (ACI/Container Apps/AKS) pour les faire tourner. Retiens le **flux** : construire l'image → **push** vers ACR → l'exécuteur **pull** et lance. ⚠️ Sécurité : l'accès à l'ACR se fait par **identité managée** (pas de mot de passe), avec le rôle **AcrPull** pour les exécuteurs — le moindre privilège appliqué aux conteneurs.
:::

:::lang en
**✅ Check:** `acr create` returns a `Succeeded` `registreentreprise` registry, listed by `acr list`. Your containerized platform is complete: a **registry** (ACR) for images, and **runners** (ACI/Container Apps/AKS) to run them. Remember the **flow**: build the image → **push** to ACR → the runner **pulls** and launches. ⚠️ Security: ACR access uses a **managed identity** (no password), with the **AcrPull** role for the runners — least privilege applied to containers.
:::

### step-03

:::lang fr
**Objectif.** Décrire **App Service** — le PaaS web, en Bicep.

**🤔 Héberger sans gérer l'OS.** Pour une appli **web/API** classique, App Service offre le meilleur compromis : tu déposes le code, Azure gère l'OS, le scaling, les certificats. On décrit un **plan** (les ressources) et une **application** dessus.

Crée `appservice.bicep` :
:::

:::lang en
**Goal.** Describe **App Service** — web PaaS, in Bicep.

**🤔 Host without managing the OS.** For a classic **web/API** app, App Service offers the best tradeoff: you drop the code, Azure manages the OS, scaling, certificates. We describe a **plan** (the resources) and an **app** on it.

Create `appservice.bicep`:
:::

```bicep
// appservice.bicep — plan App Service + application web
param location string = resourceGroup().location
param nomApp string = 'web-${uniqueString(resourceGroup().id)}'

resource plan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: 'plan-web'
  location: location
  sku: { name: 'P1v3', tier: 'PremiumV3' }   // Production, scale-out
  properties: { reserved: true }              // Linux
}

resource app 'Microsoft.Web/sites@2023-01-01' = {
  name: nomApp
  location: location
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
    }
  }
}
```

```bash
bicep build appservice.bicep --stdout | head -n 20
```

:::lang fr
**✅ Vérification :** `bicep build` compile **deux** ressources — `serverfarms` (le plan) et `sites` (l'app) — sans erreur, avec `httpsOnly` et `minTlsVersion: 1.2`. Tu as un hébergement **PaaS** prêt. Retiens la structure : le **plan** (App Service Plan) définit la capacité et le coût (SKU) et peut porter **plusieurs** apps ; le **site** est l'appli. Fonctionnalités clés : **slots de déploiement** (blue-green sans coupure), **scale-out** automatique, **certificats** managés. ⚠️ **Choix compute :** App Service pour une appli web **à trafic soutenu** (coût fixe prévisible) ; **Functions/Container Apps** pour de l'événementiel/pics (payé à l'usage).
:::

:::lang en
**✅ Check:** `bicep build` compiles **two** resources — `serverfarms` (the plan) and `sites` (the app) — with no error, with `httpsOnly` and `minTlsVersion: 1.2`. You have **PaaS** hosting ready. Remember the structure: the **plan** (App Service Plan) defines capacity and cost (SKU) and can host **several** apps; the **site** is the app. Key features: **deployment slots** (blue-green with no downtime), automatic **scale-out**, managed **certificates**. ⚠️ **Compute choice:** App Service for a **sustained-traffic** web app (predictable fixed cost); **Functions/Container Apps** for event-driven/spiky (pay-per-use).
:::

### step-04

:::lang fr
**Objectif.** Décrire un **équilibreur de charge** (Load Balancer) — répartir le trafic, en Bicep.

**🤔 Répartir et sonder.** Un **Load Balancer** (L4) distribue le trafic entrant sur un **pool** d'instances backend, en s'appuyant sur une **sonde** de santé (ne router que vers les instances saines). On décrit une IP publique frontale, un pool, une sonde et une règle.

Crée `equilibrage.bicep` :
:::

:::lang en
**Goal.** Describe a **load balancer** (Load Balancer) — spread traffic, in Bicep.

**🤔 Spread and probe.** A **Load Balancer** (L4) distributes incoming traffic across a **pool** of backend instances, relying on a health **probe** (route only to healthy instances). We describe a frontend public IP, a pool, a probe and a rule.

Create `equilibrage.bicep`:
:::

```bicep
// equilibrage.bicep — Load Balancer public (L4) avec sonde de santé
param location string = resourceGroup().location

resource pip 'Microsoft.Network/publicIPAddresses@2023-09-01' = {
  name: 'pip-lb'
  location: location
  sku: { name: 'Standard' }
  properties: { publicIPAllocationMethod: 'Static' }
}

resource lb 'Microsoft.Network/loadBalancers@2023-09-01' = {
  name: 'lb-web'
  location: location
  sku: { name: 'Standard' }
  properties: {
    frontendIPConfigurations: [
      { name: 'frontend', properties: { publicIPAddress: { id: pip.id } } }
    ]
    backendAddressPools: [ { name: 'pool-web' } ]
    probes: [
      {
        name: 'sonde-https'
        properties: { protocol: 'Tcp', port: 443, intervalInSeconds: 15, numberOfProbes: 2 }
      }
    ]
    loadBalancingRules: [
      {
        name: 'regle-https'
        properties: {
          frontendIPConfiguration: { id: resourceId('Microsoft.Network/loadBalancers/frontendIPConfigurations', 'lb-web', 'frontend') }
          backendAddressPool:       { id: resourceId('Microsoft.Network/loadBalancers/backendAddressPools', 'lb-web', 'pool-web') }
          probe:                    { id: resourceId('Microsoft.Network/loadBalancers/probes', 'lb-web', 'sonde-https') }
          protocol: 'Tcp'
          frontendPort: 443
          backendPort: 443
        }
      }
    ]
  }
}
```

```bash
bicep build equilibrage.bicep --stdout | head -n 20
```

:::lang fr
**✅ Vérification :** `bicep build` compile l'**IP publique** et le **Load Balancer** (frontend + pool + sonde + règle) sans erreur. Tu as un répartiteur L4 fonctionnel. Retiens la mécanique : le trafic arrive sur l'**IP frontale**, la **règle** le distribue vers le **pool** backend, la **sonde** exclut les instances malsaines. ⚠️ **L4 vs L7 :** le **Load Balancer** (L4) route par IP/port (rapide, tout protocole TCP/UDP) ; pour router par **URL/chemin/en-tête** ou ajouter un **pare-feu applicatif (WAF)**, il faut **Application Gateway** (L7) — voir la grille (étape 6).
:::

:::lang en
**✅ Check:** `bicep build` compiles the **public IP** and the **Load Balancer** (frontend + pool + probe + rule) with no error. You have a working L4 balancer. Remember the mechanics: traffic arrives on the **frontend IP**, the **rule** distributes it to the backend **pool**, the **probe** excludes unhealthy instances. ⚠️ **L4 vs L7:** the **Load Balancer** (L4) routes by IP/port (fast, any TCP/UDP protocol); to route by **URL/path/header** or add an **application firewall (WAF)**, you need **Application Gateway** (L7) — see the grid (step 6).
:::

### step-05

:::lang fr
**Objectif.** Concevoir la **distribution mondiale** — servir et protéger partout.

**🤔 Au-delà d'une région.** Pour des utilisateurs mondiaux et une résilience inter-région, on met un **point d'entrée global** devant les backends régionaux. Trois services (concept) : **Front Door** (global, L7, CDN + WAF — le point d'entrée moderne), **Traffic Manager** (routage par **DNS**, oriente vers la région la plus proche/saine), **Application Gateway** (L7 régional + WAF, souvent **derrière** Front Door).

L'assemblage type (concept) :
:::

:::lang en
**Goal.** Design **global distribution** — serve and protect everywhere.

**🤔 Beyond one region.** For global users and cross-region resilience, you put a **global entry point** in front of the regional backends. Three services (concept): **Front Door** (global, L7, CDN + WAF — the modern entry point), **Traffic Manager** (**DNS** routing, directs to the nearest/healthiest region), **Application Gateway** (regional L7 + WAF, often **behind** Front Door).

The typical assembly (concept):
:::

```text
DISTRIBUTION MONDIALE / GLOBAL DISTRIBUTION (assemblage type / typical assembly)

  Utilisateurs mondiaux
        |
   [ Front Door ]        global, L7, CDN + WAF, bascule inter-région
        |
   [ App Gateway ]       régional, L7, WAF, routage par URL/chemin
        |
   [ Load Balancer ]     régional, L4, répartition sur les instances
        |
   [ compute : App Service / Container Apps / AKS / VM ]

  Traffic Manager = alternative/complément par DNS (oriente vers une région)
```

:::lang fr
**✅ Vérification :** tu sais **assembler** une entrée mondiale : **Front Door** (global) devant des **App Gateway** régionaux (L7 + WAF) devant le compute. Tu distingues les rôles : **Front Door** = mondial + CDN + bascule de région ; **App Gateway** = L7 régional + WAF + routage applicatif ; **Load Balancer** = L4 régional ; **Traffic Manager** = orientation par DNS. ⚠️ Ne les confonds pas à l'examen : **global** (Front Door, Traffic Manager) vs **régional** (App Gateway, Load Balancer) ; **L7** (Front Door, App Gateway — comprend HTTP/URL) vs **L4** (Load Balancer — IP/port). Le **WAF** est sur Front Door **ou** App Gateway.
:::

:::lang en
**✅ Check:** you can **assemble** a global entry: **Front Door** (global) in front of regional **App Gateways** (L7 + WAF) in front of compute. You distinguish the roles: **Front Door** = global + CDN + region failover; **App Gateway** = regional L7 + WAF + application routing; **Load Balancer** = regional L4; **Traffic Manager** = DNS routing. ⚠️ Don't confuse them on the exam: **global** (Front Door, Traffic Manager) vs **regional** (App Gateway, Load Balancer); **L7** (Front Door, App Gateway — understand HTTP/URL) vs **L4** (Load Balancer — IP/port). The **WAF** is on Front Door **or** App Gateway.
:::

### step-06

:::lang fr
**Objectif.** Graver les **grilles** (compute, équilibrage) et les **migrations** — le cœur de l'AZ-305.

**🤔 Décider vite.** Deux grilles de choix et les approches de migration.

Les grilles :
:::

:::lang en
**Goal.** Engrave the **grids** (compute, load balancing) and the **migrations** — the AZ-305 core.

**🤔 Decide fast.** Two choice grids and the migration approaches.

The grids:
:::

```text
COMPUTE
  Contrôle total OS / legacy          -> VM (IaaS)
  Appli web/API à trafic soutenu      -> App Service (PaaS)
  Microservices conteneurs serverless -> Container Apps
  Kubernetes, contrôle, multi-équipes -> AKS
  Conteneur ponctuel / tâche          -> ACI
  Événementiel / pics, payé à l'usage -> Functions (serverless)

ÉQUILIBRAGE / LOAD BALANCING
  L4, IP/port, régional               -> Azure Load Balancer
  L7, URL/en-têtes, WAF, régional     -> Application Gateway
  L7 global, CDN, WAF, multi-région   -> Front Door
  Routage par DNS, global             -> Traffic Manager

MIGRATION (du - au + d'effort / least->most effort)
  Rehost (lift-and-shift)  déplacer tel quel en VM (rapide)
  Replatform               adapter -> App Service / conteneurs
  Refactor/Rearchitect     moderniser -> microservices / serverless
```

:::lang fr
**✅ Vérification :** face à un scénario, tu **choisis** : « API web à fort trafic » → **App Service** ; « microservices élastiques » → **Container Apps** ; « plateforme Kubernetes multi-équipes » → **AKS** ; « router par chemin d'URL avec WAF » → **Application Gateway** ; « point d'entrée mondial + CDN » → **Front Door** ; « migrer vite un vieux serveur » → **rehost (VM)** puis moderniser plus tard. C'est **exactement** le format AZ-305. ⚠️ Justifie par le **besoin** (contrôle vs productivité, régional vs global, L4 vs L7, effort de migration) et le **pilier WAF** dominant — le **pourquoi**, pas seulement le service.
:::

:::lang en
**✅ Check:** faced with a scenario, you **choose**: "high-traffic web API" → **App Service**; "elastic microservices" → **Container Apps**; "multi-team Kubernetes platform" → **AKS**; "route by URL path with WAF" → **Application Gateway**; "global entry point + CDN" → **Front Door**; "migrate an old server fast" → **rehost (VM)** then modernize later. It's **exactly** the AZ-305 format. ⚠️ Justify by the **need** (control vs productivity, regional vs global, L4 vs L7, migration effort) and the dominant **WAF pillar** — the **why**, not just the service.
:::

### step-07

:::lang fr
**Objectif.** Nettoyer.

**🤔 L'hygiène.** On supprime le groupe et tous les services conteneurs.

Nettoie :
:::

:::lang en
**Goal.** Clean up.

**🤔 Hygiene.** We delete the group and all container services.

Clean up:
:::

```bash
azlocal group delete --name rg-infra
```

:::lang fr
**✅ Vérification :** `group delete` renvoie `Deleted` — AKS, Container Apps, ACI et le registre ACR partent avec le groupe. Ton labo est rangé. Tu maîtrises maintenant la **conception d'infrastructure** au niveau AZ-305 : le spectre **compute** (des VM aux serverless, conteneurs et registre), l'**équilibrage** (L4/L7, régional/global) et la **distribution mondiale** (Front Door, App Gateway, Traffic Manager), plus les **migrations**. La suite du track : le **projet d'architecte** — assembler une solution Well-Architected complète.
:::

:::lang en
**✅ Check:** `group delete` returns `Deleted` — AKS, Container Apps, ACI and the ACR registry go with the group. Your lab is tidy. You now master **infrastructure design** at AZ-305 level: the **compute** spectrum (from VMs to serverless, containers and registry), **load balancing** (L4/L7, regional/global) and **global distribution** (Front Door, App Gateway, Traffic Manager), plus **migrations**. The track continues: the **architect project** — assembling a complete Well-Architected solution.
:::

## pitfalls

:::lang fr
**1. Prendre AKS par réflexe.** Kubernetes est puissant mais lourd à gérer. Pour des microservices, **Container Apps** suffit souvent — n'ajoute AKS que si tu as besoin du contrôle Kubernetes.

**2. Confondre L4 et L7.** Load Balancer (L4) route par IP/port ; App Gateway (L7) route par URL/en-tête et porte le WAF. Choisis selon le **type de routage**.

**3. Confondre régional et global.** App Gateway/Load Balancer = **régional** ; Front Door/Traffic Manager = **global**. Pour du multi-région, il faut un service **global** devant.

**4. Oublier le WAF.** Une appli web exposée sans **pare-feu applicatif** (sur Front Door ou App Gateway) est vulnérable. Le WAF est une décision d'architecture.

**5. VM par habitude.** Migrer « tel quel » en VM (rehost) est rapide mais rate les gains du PaaS/serverless. Prévois la **modernisation** ensuite.

**6. Registre public pour des images privées.** Les images d'entreprise vont dans un **ACR** privé, accédé par **identité managée** (AcrPull), pas un registre public.

**7. Choisir sans justifier.** L'AZ-305 veut le **pourquoi** (contrôle, portée, routage, effort), pas seulement le nom du service.
:::

:::lang en
**1. Reaching for AKS by reflex.** Kubernetes is powerful but heavy to manage. For microservices, **Container Apps** is often enough — add AKS only if you need Kubernetes control.

**2. Confusing L4 and L7.** Load Balancer (L4) routes by IP/port; App Gateway (L7) routes by URL/header and carries the WAF. Choose by the **routing type**.

**3. Confusing regional and global.** App Gateway/Load Balancer = **regional**; Front Door/Traffic Manager = **global**. For multi-region, you need a **global** service in front.

**4. Forgetting the WAF.** A web app exposed without an **application firewall** (on Front Door or App Gateway) is vulnerable. The WAF is an architecture decision.

**5. VM by habit.** Migrating "as-is" to a VM (rehost) is fast but misses the PaaS/serverless gains. Plan the **modernization** next.

**6. Public registry for private images.** Enterprise images go in a private **ACR**, accessed by **managed identity** (AcrPull), not a public registry.

**7. Choosing without justifying.** AZ-305 wants the **why** (control, scope, routing, effort), not just the service name.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu situes le **spectre compute** (VM → App Service → conteneurs → serverless).
- [ ] Tu déploies **AKS, Container Apps, ACI** et un **registre ACR** (live).
- [ ] Tu décris **App Service** en Bicep.
- [ ] Tu décris un **Load Balancer** en Bicep.
- [ ] Tu distingues **L4/L7** et **régional/global**.
- [ ] Tu conçois la **distribution mondiale** (Front Door, App Gateway, Traffic Manager).
- [ ] Tu choisis **compute** et **équilibrage** par grille et connais les migrations.

Sept cases = tu tiens la conception d'infrastructure AZ-305. La suite : le **projet d'architecte**.
:::

:::lang en
You know it works when…

- [ ] You place the **compute spectrum** (VM → App Service → containers → serverless).
- [ ] You deploy **AKS, Container Apps, ACI** and an **ACR registry** (live).
- [ ] You describe **App Service** in Bicep.
- [ ] You describe a **Load Balancer** in Bicep.
- [ ] You distinguish **L4/L7** and **regional/global**.
- [ ] You design **global distribution** (Front Door, App Gateway, Traffic Manager).
- [ ] You choose **compute** and **load balancing** by grid and know the migrations.

Seven boxes = you hold AZ-305 infrastructure design. Next up: the **architect project**.
:::

## next

:::lang fr
Le track AZ-305 se termine bientôt :

1. **Azure — projet d'architecte** : assembler une solution complète Well-Architected (compute, données, réseau, continuité, gouvernance) et la justifier pilier par pilier — le livrable de CV.
2. Puis l'examen **AZ-305**, et la suite du parcours : **AZ-400** (DevOps), **AZ-500** (sécurité), **AZ-700** (réseau).
:::

:::lang en
The AZ-305 track is nearing its end:

1. **Azure — architect project**: assemble a complete Well-Architected solution (compute, data, networking, continuity, governance) and justify it pillar by pillar — the CV deliverable.
2. Then the **AZ-305** exam, and the rest of the path: **AZ-400** (DevOps), **AZ-500** (security), **AZ-700** (networking).
:::

## cheatsheet

:::lang fr
Aide-mémoire conception d'infrastructure Azure.
:::

:::lang en
Azure infrastructure design cheat sheet.
:::

```bash
# Conteneurs & registre (azlocal, live) / containers & registry
azlocal aci create          --name aci-tache     --resource-group rg-infra
azlocal containerapp create --name ca-microsvc   --resource-group rg-infra
azlocal aks create          --name aks-platforme --resource-group rg-infra
azlocal acr create          --name registreentreprise --resource-group rg-infra

# App Service & équilibrage (Bicep, validé) / App Service & load balancing
bicep build appservice.bicep --stdout    # plan + site (PaaS web)
bicep build equilibrage.bicep --stdout   # Load Balancer L4 + IP + sonde + règle
```

```text
Compute : VM(contrôle) < App Service(web PaaS) < Container Apps(serverless) / AKS(k8s) ; ACI(ponctuel) ; Functions(événementiel)
Équilibrage : Load Balancer(L4 régional) · App Gateway(L7+WAF régional) · Front Door(L7 global+CDN+WAF) · Traffic Manager(DNS global)
Migration : Rehost < Replatform < Refactor
```

## resources

:::lang fr
- [Choisir un service de calcul](https://learn.microsoft.com/azure/architecture/guide/technology-choices/compute-decision-tree) — l'arbre de décision.
- [Choisir un équilibreur de charge](https://learn.microsoft.com/azure/architecture/guide/technology-choices/load-balancing-overview) — LB/AppGW/Front Door/TM.
- [Azure Kubernetes Service](https://learn.microsoft.com/azure/aks/) — Kubernetes managé.
- [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/overview) — conteneurs serverless.
- [Azure Migrate](https://learn.microsoft.com/azure/migrate/migrate-services-overview) — la migration.
:::

:::lang en
- [Choose a compute service](https://learn.microsoft.com/azure/architecture/guide/technology-choices/compute-decision-tree) — the decision tree.
- [Choose a load balancer](https://learn.microsoft.com/azure/architecture/guide/technology-choices/load-balancing-overview) — LB/AppGW/Front Door/TM.
- [Azure Kubernetes Service](https://learn.microsoft.com/azure/aks/) — managed Kubernetes.
- [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/overview) — serverless containers.
- [Azure Migrate](https://learn.microsoft.com/azure/migrate/migrate-services-overview) — migration.
:::

## troubleshooting

:::lang fr
**`azlocal aks/containerapp/aci/acr create` : connexion refusée.** miniblue ne tourne pas. Lance `miniblue`, vérifie `azlocal health`.

**« resource group not found ».** Crée d'abord `rg-infra` (`azlocal group create`), puis les services.

**`bicep build equilibrage.bicep` : erreur `resourceId`.** Les références internes du Load Balancer (`frontendIPConfigurations`, `backendAddressPools`, `probes`) se construisent avec `resourceId('type', 'nom-lb', 'nom-sous-ressource')` — vérifie les noms.

**AKS ou Container Apps ?** Besoin de Kubernetes (contrôle, portabilité, multi-équipes) → **AKS**. Microservices sans gérer Kubernetes → **Container Apps** (par défaut moderne).

**L4 ou L7 ?** Router par IP/port → **Load Balancer** (L4). Router par URL/en-tête ou WAF → **Application Gateway** (L7).

**Régional ou global ?** Dans une région → App Gateway/Load Balancer. Multi-région/mondial → **Front Door** (ou Traffic Manager par DNS).
:::

:::lang en
**`azlocal aks/containerapp/aci/acr create`: connection refused.** miniblue isn't running. Start `miniblue`, check `azlocal health`.

**"resource group not found".** Create `rg-infra` first (`azlocal group create`), then the services.

**`bicep build equilibrage.bicep`: `resourceId` error.** The Load Balancer's internal references (`frontendIPConfigurations`, `backendAddressPools`, `probes`) are built with `resourceId('type', 'lb-name', 'sub-resource-name')` — check the names.

**AKS or Container Apps?** Need Kubernetes (control, portability, multi-team) → **AKS**. Microservices without managing Kubernetes → **Container Apps** (modern default).

**L4 or L7?** Route by IP/port → **Load Balancer** (L4). Route by URL/header or WAF → **Application Gateway** (L7).

**Regional or global?** Within a region → App Gateway/Load Balancer. Multi-region/global → **Front Door** (or Traffic Manager by DNS).
:::
