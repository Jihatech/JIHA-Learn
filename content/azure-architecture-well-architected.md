---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-architecture-well-architected
slug: azure-architecture-well-architected
order: 65
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — architecture (AZ-305) : le Well-Architected Framework en pratique"
title_en: "Azure — architecture (AZ-305): the Well-Architected Framework in practice"
tagline_fr: "5 piliers, une architecture multi-tier déployée et jugée."
tagline_en: "5 pillars, a multi-tier architecture deployed and judged."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 260
repo: "moabukar/miniblue"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: [azure-projet-entreprise]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [well-architected-framework, fiabilite, securite, optimisation-couts, excellence-operationnelle, performance, architecture-multi-tier, choix-de-service, az-305]
concepts_en: [well-architected-framework, reliability, security, cost-optimization, operational-excellence, performance, multi-tier-architecture, service-selection, az-305]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "L'architecture Azure pour l'AZ-305 : le Well-Architected Framework (fiabilité, sécurité, optimisation des coûts, excellence opérationnelle, performance) appliqué EN PRATIQUE. On conçoit et déploie une architecture multi-tier de référence — fondation réseau segmentée (Terraform live sur miniblue), tier données (SQL + cache Redis), tier compute (Function app + App Service en Bicep) — puis on la JUGE pilier par pilier, et on grave les grilles de choix de service (SQL vs Cosmos vs Storage ; App Service vs AKS vs Functions vs VM). Sans compte ni facture."
og_description_en: "Azure architecture for AZ-305: the Well-Architected Framework (reliability, security, cost optimization, operational excellence, performance) applied IN PRACTICE. We design and deploy a reference multi-tier architecture — segmented network foundation (Terraform live on miniblue), data tier (SQL + Redis cache), compute tier (Function app + App Service in Bicep) — then JUDGE it pillar by pillar, and engrave the service-selection grids (SQL vs Cosmos vs Storage; App Service vs AKS vs Functions vs VM). No account or bill."
---

## intro

:::lang fr
Passer d'**administrateur** à **architecte**, c'est changer de question : non plus « comment déployer cette ressource ? » mais « **quelle architecture** répond aux besoins — fiabilité, sécurité, coût, exploitation, performance — et **quels compromis** ? ». C'est le cœur de l'examen **AZ-305** (Designing Azure Infrastructure Solutions). L'outil de l'architecte pour ça : le **Well-Architected Framework (WAF)**, les **5 piliers** avec lesquels Microsoft juge toute architecture.

Ce guide rend le WAF **concret**. On ne se contente pas de réciter les piliers : on **conçoit et déploie** une **architecture multi-tier de référence** — une fondation **réseau** segmentée (Terraform, live sur miniblue), un **tier données** (une base **SQL** relationnelle + un **cache Redis**), un **tier compute** (une **Function app** serverless + une **App Service** décrite en Bicep) — puis on la **juge pilier par pilier** : fiabilité, sécurité, optimisation des coûts, excellence opérationnelle, performance. Enfin, on grave les **grilles de choix de service** que l'AZ-305 teste sans relâche (quelle base ? quel compute ?).

C'est le premier guide du track **AZ-305**. Il installe le **réflexe d'architecte** : toute décision se justifie par un pilier et s'assume comme un compromis.

**Pour qui c'est :** tu as fait tout l'**AZ-104** (tu sais déployer) et tu veux apprendre à **concevoir** et **arbitrer**.

**Quand ce n'est PAS le bon choix :**

- Il te manque les bases de déploiement → fais l'**AZ-104** d'abord ; ici on assemble et on juge.
- Tu veux une recette unique « la bonne archi » → il n'y en a pas ; l'architecture, c'est **des compromis** selon les besoins.
:::

:::lang en
Going from **administrator** to **architect** means changing the question: no longer "how do I deploy this resource?" but "**which architecture** meets the requirements — reliability, security, cost, operations, performance — and **what tradeoffs**?". It's the heart of the **AZ-305** exam (Designing Azure Infrastructure Solutions). The architect's tool for this: the **Well-Architected Framework (WAF)**, the **5 pillars** Microsoft judges any architecture by.

This guide makes the WAF **concrete**. We don't just recite the pillars: we **design and deploy** a **reference multi-tier architecture** — a segmented **network** foundation (Terraform, live on miniblue), a **data tier** (a relational **SQL** database + a **Redis cache**), a **compute tier** (a serverless **Function app** + an **App Service** described in Bicep) — then **judge it pillar by pillar**: reliability, security, cost optimization, operational excellence, performance. Finally, we engrave the **service-selection grids** the AZ-305 tests relentlessly (which database? which compute?).

This is the first guide of the **AZ-305** track. It installs the **architect reflex**: every decision is justified by a pillar and owned as a tradeoff.

**Who it's for:** you've done all of **AZ-104** (you can deploy) and want to learn to **design** and **arbitrate**.

**When it's NOT the right choice:**

- You lack deployment basics → do **AZ-104** first; here we assemble and judge.
- You want a single "the right architecture" recipe → there isn't one; architecture is **tradeoffs** by requirement.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Citer et appliquer les **5 piliers** du Well-Architected Framework.
- Traduire des **besoins** en décisions d'architecture (et compromis).
- Concevoir une **architecture multi-tier** (réseau / données / compute).
- Déployer une **fondation réseau** (live) et un **tier données** (SQL + Redis, live).
- Décrire un **tier compute** (App Service) en Bicep.
- **Juger** une architecture pilier par pilier.
- Choisir le bon **service** (base de données ; compute) selon le besoin.
:::

:::lang en
By the end of this guide, you can:

- Name and apply the **5 pillars** of the Well-Architected Framework.
- Translate **requirements** into architecture decisions (and tradeoffs).
- Design a **multi-tier architecture** (network / data / compute).
- Deploy a **network foundation** (live) and a **data tier** (SQL + Redis, live).
- Describe a **compute tier** (App Service) in Bicep.
- **Judge** an architecture pillar by pillar.
- Choose the right **service** (database; compute) by need.
:::

## prerequisites

:::lang fr
- Tout le track **AZ-104** terminé (surtout le *projet d'entreprise*).
- **miniblue** qui tourne (`azlocal health`), **Terraform** et **Bicep** installés.
- La confiance du certificat : `export SSL_CERT_FILE=~/.miniblue/cert.pem`.
- Rappel : réseau → Terraform (live) ; services de données/compute → `azlocal` (live) ; designs complets → Bicep (validé).
:::

:::lang en
- The whole **AZ-104** track done (especially the *enterprise project*).
- **miniblue** running (`azlocal health`), **Terraform** and **Bicep** installed.
- Certificate trust: `export SSL_CERT_FILE=~/.miniblue/cert.pem`.
- Reminder: network → Terraform (live); data/compute services → `azlocal` (live); full designs → Bicep (validated).
:::

## concepts

:::lang fr
**Le rôle de l'architecte.** Un administrateur exécute ; un architecte **décide**. Il part de **besoins** (fonctionnels : « une API et une base » ; non-fonctionnels : « 99,9 % de dispo, < 100 ms, budget serré, conforme RGPD ») et conçoit une **architecture** qui les satisfait — en assumant des **compromis** (on ne peut pas tout maximiser à la fois).

**Le Well-Architected Framework (WAF).** Le cadre d'évaluation de Microsoft, **5 piliers** :

- **Fiabilité (Reliability).** Résister aux pannes et récupérer : redondance, zones/régions, sauvegardes, reprise après sinistre. « Que se passe-t-il si un composant tombe ? »
- **Sécurité (Security).** Protéger données et systèmes : identité (RBAC, moindre privilège), réseau (segmentation, NSG), chiffrement, secrets (Key Vault). « Défense en profondeur. »
- **Optimisation des coûts (Cost Optimization).** Payer le juste : dimensionnement, serverless/consommation, niveaux de stockage, arrêt/libération, tags de coût. « Le moins cher qui répond au besoin. »
- **Excellence opérationnelle (Operational Excellence).** Exploiter sereinement : IaC, automatisation, surveillance (monitoring), déploiements reproductibles. « Tout en code, tout observé. »
- **Efficacité des performances (Performance Efficiency).** Tenir la charge : mise à l'échelle (scale up/out), cache, choix du bon service, régions proches. « Rapide et élastique. »

**Architecture multi-tier.** Le patron de référence : un **tier présentation/compute** (l'appli), un **tier données** (bases, cache), le tout sur une **fondation réseau** segmentée. Séparer les tiers permet de les **sécuriser**, **dimensionner** et **faire évoluer** indépendamment — un principe qui traverse les 5 piliers.

**Choisir la base de données.** Pilier de l'AZ-305. **SQL (Azure SQL / PostgreSQL / MySQL)** : relationnel, transactions ACID, jointures, schéma fort → applications transactionnelles classiques. **Cosmos DB** : NoSQL, distribution mondiale, faible latence, échelle massive → données semi-structurées, multi-région. **Cloud Storage (Blob)** : objets/fichiers non structurés. **Cache Redis** : couche mémoire ultra-rapide **devant** la base (performance). On choisit selon la **forme de la donnée** et les **besoins** (cohérence, latence, échelle).

**Choisir le compute.** L'autre grand arbitrage. **VM** : contrôle total (IaaS). **App Service** : appli web/API managée (PaaS), scale intégré. **Functions** : serverless, événementiel, payé à l'exécution. **AKS / Container Apps** : conteneurs orchestrés, microservices. **Container Instances** : un conteneur ponctuel. Règle : **le plus managé** qui répond au besoin.

**Ce qui est live ici.** La **fondation réseau** (Terraform) et le **tier données/compute** (SQL, Redis, Function app via `azlocal`) sont **déployés en live** sur miniblue. Le design **App Service** est **validé en Bicep**. Tu construis une **vraie architecture de référence** et tu la **juges** — sans compte ni facture.
:::

:::lang en
**The architect's role.** An administrator executes; an architect **decides**. They start from **requirements** (functional: "an API and a database"; non-functional: "99.9% uptime, < 100 ms, tight budget, GDPR-compliant") and design an **architecture** that satisfies them — owning the **tradeoffs** (you can't maximize everything at once).

**The Well-Architected Framework (WAF).** Microsoft's evaluation framework, **5 pillars**:

- **Reliability.** Withstand failures and recover: redundancy, zones/regions, backups, disaster recovery. "What happens if a component fails?"
- **Security.** Protect data and systems: identity (RBAC, least privilege), network (segmentation, NSG), encryption, secrets (Key Vault). "Defense in depth."
- **Cost Optimization.** Pay the right amount: sizing, serverless/consumption, storage tiers, stop/deallocate, cost tags. "The cheapest that meets the need."
- **Operational Excellence.** Operate calmly: IaC, automation, monitoring, reproducible deployments. "All in code, all observed."
- **Performance Efficiency.** Handle load: scaling (up/out), cache, the right service, nearby regions. "Fast and elastic."

**Multi-tier architecture.** The reference pattern: a **presentation/compute tier** (the app), a **data tier** (databases, cache), all on a segmented **network foundation**. Separating tiers lets you **secure**, **size** and **evolve** them independently — a principle that runs through all 5 pillars.

**Choosing the database.** An AZ-305 cornerstone. **SQL (Azure SQL / PostgreSQL / MySQL)**: relational, ACID transactions, joins, strong schema → classic transactional apps. **Cosmos DB**: NoSQL, global distribution, low latency, massive scale → semi-structured, multi-region data. **Cloud Storage (Blob)**: unstructured objects/files. **Redis cache**: an ultra-fast in-memory layer **in front of** the database (performance). You choose by the **shape of the data** and the **requirements** (consistency, latency, scale).

**Choosing compute.** The other big tradeoff. **VM**: full control (IaaS). **App Service**: managed web app/API (PaaS), built-in scaling. **Functions**: serverless, event-driven, pay-per-execution. **AKS / Container Apps**: orchestrated containers, microservices. **Container Instances**: a one-off container. Rule: **the most managed** that meets the need.

**What's live here.** The **network foundation** (Terraform) and the **data/compute tier** (SQL, Redis, Function app via `azlocal`) are **deployed live** on miniblue. The **App Service** design is **validated in Bicep**. You build a **real reference architecture** and **judge** it — no account or bill.
:::

:::figure azure-waf-architecture
caption_fr: "Schéma 1. L'architecture multi-tier de référence, jugée par le Well-Architected Framework : une fondation RÉSEAU segmentée (web/app/data, NSG) ; un tier DONNÉES (SQL relationnel + cache Redis devant) ; un tier COMPUTE (Function app serverless / App Service). Chaque décision est éclairée par un pilier — fiabilité, sécurité, coût, exploitation, performance."
caption_en: "Figure 1. The reference multi-tier architecture, judged by the Well-Architected Framework: a segmented NETWORK foundation (web/app/data, NSG); a DATA tier (relational SQL + Redis cache in front); a COMPUTE tier (serverless Function app / App Service). Each decision is informed by a pillar — reliability, security, cost, operations, performance."
:::

## walkthrough

:::lang fr
On avance ainsi : le WAF & les besoins → fondation réseau (fiabilité/sécurité) → tier données (performance) → tier compute (coût/performance) → juger pilier par pilier → grilles de choix → nettoyage.
:::

:::lang en
We'll go like this: the WAF & requirements → network foundation (reliability/security) → data tier (performance) → compute tier (cost/performance) → judge pillar by pillar → choice grids → cleanup.
:::

### step-01

:::lang fr
**Objectif.** Ancrer le **Well-Architected Framework** et la **traduction des besoins**.

**🤔 Des besoins aux piliers.** Un énoncé d'architecte : « Une API de commandes, une base transactionnelle, 99,9 % de dispo, réponses < 100 ms, budget serré. » On **mappe** chaque besoin à un pilier : dispo → **fiabilité** ; données sensibles → **sécurité** ; budget → **coût** ; latence → **performance** ; « maintenable » → **excellence opérationnelle**.

Grave les 5 piliers et leur question-clé :
:::

:::lang en
**Goal.** Anchor the **Well-Architected Framework** and **translating requirements**.

**🤔 From requirements to pillars.** An architect's brief: "An orders API, a transactional database, 99.9% uptime, < 100 ms responses, tight budget." You **map** each requirement to a pillar: uptime → **reliability**; sensitive data → **security**; budget → **cost**; latency → **performance**; "maintainable" → **operational excellence**.

Engrave the 5 pillars and their key question:
:::

```text
WELL-ARCHITECTED FRAMEWORK — 5 PILIERS / 5 PILLARS
  Fiabilité / Reliability             "et si un composant tombe ?" -> redondance, zones, sauvegarde, DR
  Sécurité / Security                 "défense en profondeur" -> identité, réseau, chiffrement, secrets
  Coût / Cost Optimization            "le moins cher qui suffit" -> dimensionner, serverless, niveaux, tags
  Excellence opér. / Operational      "tout en code, tout observé" -> IaC, automatisation, monitoring
  Performance / Performance Eff.      "rapide et élastique" -> scale up/out, cache, bon service, régions
```

:::lang fr
**✅ Vérification :** tu **récites** les 5 piliers et sais poser leur question sur n'importe quel design. Le réflexe d'architecte : pour **chaque** décision (« quelle base ? quel compute ? une IP publique ? »), demande **quel pilier** elle sert et **quel compromis** elle impose. ⚠️ Les piliers sont souvent en **tension** : plus de fiabilité (redondance multi-région) coûte plus cher ; plus de sécurité (couches) peut ralentir. L'architecture, c'est **équilibrer** selon les besoins — pas maximiser un pilier au détriment des autres.
:::

:::lang en
**✅ Check:** you **recite** the 5 pillars and can ask their question about any design. The architect reflex: for **each** decision ("which database? which compute? a public IP?"), ask **which pillar** it serves and **what tradeoff** it imposes. ⚠️ Pillars are often in **tension**: more reliability (multi-region redundancy) costs more; more security (layers) can slow things. Architecture is **balancing** by requirement — not maximizing one pillar at the others' expense.
:::

### step-02

:::lang fr
**Objectif.** Déployer la **fondation réseau** — les piliers **fiabilité** & **sécurité**, en live.

**🤔 La base de tout.** Une architecture solide commence par un **réseau segmenté** : un VNet découpé en tiers (web/app/data) avec un **NSG** limitant l'exposition. Fiabilité (isolation des pannes) et sécurité (défense en profondeur) **dès la fondation**.

Déploie la fondation (Terraform contre miniblue). ⚠️ Réutilise le fichier **`providers.tf`** du guide *réseau* (le bloc provider `azurerm` qui cible miniblue via `metadata_host` et les identifiants factices) — sans lui, Terraform viserait le **vrai** Azure et échouerait à l'authentification.
:::

:::lang en
**Goal.** Deploy the **network foundation** — the **reliability** & **security** pillars, live.

**🤔 The base of everything.** A solid architecture starts with a **segmented network**: a VNet split into tiers (web/app/data) with an **NSG** limiting exposure. Reliability (failure isolation) and security (defense in depth) **from the foundation**.

Deploy the foundation (Terraform against miniblue). ⚠️ Reuse the **`providers.tf`** file from the *networking* guide (the `azurerm` provider block targeting miniblue via `metadata_host` and dummy credentials) — without it, Terraform would target **real** Azure and fail authentication.
:::

```hcl
# infra/main.tf — fondation réseau (provider azurerm -> miniblue, cf. guide réseau)
resource "azurerm_resource_group" "archi" {
  name     = "rg-archi"
  location = "westeurope"
  tags     = { pilier_secu = "segmentation", env = "archi" }
}
resource "azurerm_virtual_network" "hub" {
  name                = "vnet-archi"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.archi.location
  resource_group_name = azurerm_resource_group.archi.name
}
resource "azurerm_subnet" "tiers" {
  for_each             = { web = "10.0.1.0/24", app = "10.0.2.0/24", data = "10.0.3.0/24" }
  name                 = "snet-${each.key}"
  resource_group_name  = azurerm_resource_group.archi.name
  virtual_network_name = azurerm_virtual_network.hub.name
  address_prefixes     = [each.value]
}
resource "azurerm_network_security_group" "web" {
  name                = "nsg-web"
  location            = azurerm_resource_group.archi.location
  resource_group_name = azurerm_resource_group.archi.name
  security_rule {
    name                       = "https-seulement"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }
}
```

```bash
cd infra
export SSL_CERT_FILE=~/.miniblue/cert.pem
terraform init && terraform apply -auto-approve
```

:::lang fr
**✅ Vérification :** `terraform apply` déploie le groupe, le VNet, les **trois sous-réseaux** (web/app/data) et le NSG (`Apply complete!`). Tu as une **fondation segmentée** : le tier **data** est isolé du **web**, le NSG n'autorise que HTTPS entrant. Analyse WAF : **sécurité** (segmentation + moindre exposition), **fiabilité** (une panne dans un tier n'emporte pas les autres). ⚠️ En réel, on renforcerait avec des **zones de disponibilité** (fiabilité) et des **private endpoints** vers les services de données (sécurité) — on les décrit en Bicep/Terraform et on les déploie sur un compte.
:::

:::lang en
**✅ Check:** `terraform apply` deploys the group, the VNet, the **three subnets** (web/app/data) and the NSG (`Apply complete!`). You have a **segmented foundation**: the **data** tier is isolated from **web**, the NSG only allows inbound HTTPS. WAF analysis: **security** (segmentation + least exposure), **reliability** (a failure in one tier doesn't take the others down). ⚠️ For real, you'd reinforce with **availability zones** (reliability) and **private endpoints** to the data services (security) — described in Bicep/Terraform and deployed on an account.
:::

### step-03

:::lang fr
**Objectif.** Déployer le **tier données** : une base **SQL** + un **cache Redis** — le pilier **performance**, en live.

**🤔 La donnée et sa vitesse.** L'application transactionnelle appelle une base **SQL** (relationnel, ACID). Pour tenir la charge en lecture, on met un **cache Redis** **devant** : les données chaudes sont servies depuis la mémoire (< 1 ms), la base est déchargée. C'est le pattern **cache-aside**, réflexe de performance.

Déploie le tier données (azlocal) :
:::

:::lang en
**Goal.** Deploy the **data tier**: a **SQL** database + a **Redis cache** — the **performance** pillar, live.

**🤔 Data and its speed.** The transactional app calls a **SQL** database (relational, ACID). To handle read load, you put a **Redis cache** **in front**: hot data is served from memory (< 1 ms), the database is offloaded. It's the **cache-aside** pattern, a performance reflex.

Deploy the data tier (azlocal):
:::

```bash
# Base relationnelle SQL / relational SQL database
azlocal sql server create --name sqlsrv-archi --resource-group rg-archi

# Cache Redis (couche mémoire devant la base) / Redis cache (in-memory layer in front of the DB)
azlocal redis create --name redis-archi --resource-group rg-archi

# Les lister / list them
azlocal sql server list --resource-group rg-archi
```

:::lang fr
**✅ Vérification :** `sql server create` et `redis create` renvoient des objets ARM `Succeeded` ; `sql server list` montre `sqlsrv-archi`. Ton tier données combine **durabilité** (SQL, source de vérité transactionnelle) et **vitesse** (Redis, cache en mémoire). Analyse WAF : **performance** (le cache absorbe les lectures répétées), et un choix de **coût** (une petite base + cache coûte moins qu'une énorme base surdimensionnée). ⚠️ **Choix de base :** SQL ici car **relationnel/transactionnel** ; pour des données semi-structurées à échelle mondiale, ce serait **Cosmos DB** (voir la grille, étape 6).
:::

:::lang en
**✅ Check:** `sql server create` and `redis create` return `Succeeded` ARM objects; `sql server list` shows `sqlsrv-archi`. Your data tier combines **durability** (SQL, transactional source of truth) and **speed** (Redis, in-memory cache). WAF analysis: **performance** (the cache absorbs repeated reads), and a **cost** choice (a small DB + cache costs less than a huge oversized DB). ⚠️ **Database choice:** SQL here because **relational/transactional**; for semi-structured data at global scale, it would be **Cosmos DB** (see the grid, step 6).
:::

### step-04

:::lang fr
**Objectif.** Concevoir le **tier compute** — les piliers **coût** & **performance**.

**🤔 Le bon compute.** Deux options courantes pour une API : le **serverless** (Functions — payé à l'exécution, idéal pour une charge en pics) et l'**App Service** (PaaS managé, scale intégré, idéal pour un trafic soutenu). On déploie une **Function app** (live) et on **décrit une App Service** en Bicep (le design PaaS reproductible).

Déploie la Function app, puis valide le design App Service :
:::

:::lang en
**Goal.** Design the **compute tier** — the **cost** & **performance** pillars.

**🤔 The right compute.** Two common options for an API: **serverless** (Functions — pay-per-execution, ideal for spiky load) and **App Service** (managed PaaS, built-in scaling, ideal for sustained traffic). We deploy a **Function app** (live) and **describe an App Service** in Bicep (the reproducible PaaS design).

Deploy the Function app, then validate the App Service design:
:::

```bash
# Compute serverless (payé à l'exécution) / serverless compute (pay-per-execution)
azlocal functionapp create --name fn-archi --resource-group rg-archi
```

```bicep
// appservice.bicep — alternative PaaS : plan + application web (design validé)
param location string = resourceGroup().location
param nomApp string = 'web-${uniqueString(resourceGroup().id)}'

resource plan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: 'plan-web'
  location: location
  sku: { name: 'P1v3', tier: 'PremiumV3' }   // Production, scale-out possible
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
**✅ Vérification :** `functionapp create` renvoie un objet `Succeeded` (compute serverless live). `bicep build appservice.bicep` compile **deux** ressources — `serverfarms` (le plan) et `sites` (l'app) — sans erreur, avec `httpsOnly` et `minTlsVersion: 1.2` (sécurité par défaut). Analyse WAF : **coût** (Functions = payé à l'usage, zéro coût au repos ; App Service = coût fixe mais prévisible sous charge soutenue), **performance** (App Service scale-out ; Functions scale automatique). Le **choix** dépend du profil de charge — pics → Functions ; soutenu → App Service. ⚠️ C'est **exactement** ce type d'arbitrage que l'AZ-305 attend.
:::

:::lang en
**✅ Check:** `functionapp create` returns a `Succeeded` object (live serverless compute). `bicep build appservice.bicep` compiles **two** resources — `serverfarms` (the plan) and `sites` (the app) — with no error, with `httpsOnly` and `minTlsVersion: 1.2` (secure by default). WAF analysis: **cost** (Functions = pay-per-use, zero cost at rest; App Service = fixed but predictable cost under sustained load), **performance** (App Service scale-out; Functions auto-scale). The **choice** depends on the load profile — spikes → Functions; sustained → App Service. ⚠️ It's **exactly** the kind of tradeoff AZ-305 expects.
:::

### step-05

:::lang fr
**Objectif.** **Juger** l'architecture pilier par pilier — la revue d'architecte.

**🤔 La revue Well-Architected.** Une fois l'architecture posée, l'architecte la **passe au crible** des 5 piliers et note les **améliorations**. C'est un livrable concret (une « revue WAF »).

Applique la grille à ce que tu as construit :
:::

:::lang en
**Goal.** **Judge** the architecture pillar by pillar — the architect's review.

**🤔 The Well-Architected review.** Once the architecture is laid out, the architect **runs it through** the 5 pillars and notes **improvements**. It's a concrete deliverable (a "WAF review").

Apply the grid to what you built:
:::

```text
REVUE WAF de l'architecture / WAF REVIEW of the architecture
  Fiabilité     réseau segmenté OK ; À AJOUTER : zones de dispo, sauvegarde SQL, réplica Redis
  Sécurité      NSG + HTTPS OK ; À AJOUTER : private endpoints data, Key Vault, identité managée, RBAC
  Coût          Functions à l'usage OK ; À SURVEILLER : dimensionner SQL, tags de coût, arrêt hors prod
  Excellence    IaC (Terraform+Bicep) OK ; À AJOUTER : monitoring (Azure Monitor), alertes, CI/CD
  Performance   cache Redis OK ; À AJOUTER : scale-out App Service, CDN pour le statique, région proche
```

:::lang fr
**✅ Vérification :** tu peux **auditer** ton architecture pilier par pilier et proposer les **prochaines améliorations**. C'est le livrable d'un architecte : non pas « c'est fini », mais « voici où on est **fort**, voici où on **renforce**, selon les priorités du client ». Retiens : une bonne archi n'est jamais « parfaite » sur les 5 piliers à la fois — elle est **équilibrée** selon les besoins (un site vitrine ne paie pas pour du multi-région ; une banque, si). ⚠️ Sur un vrai compte, Azure fournit l'outil **Azure Advisor** et la **revue WAF** officielle qui automatisent une partie de cet audit.
:::

:::lang en
**✅ Check:** you can **audit** your architecture pillar by pillar and propose the **next improvements**. It's an architect's deliverable: not "it's done", but "here's where we're **strong**, here's where we **reinforce**, per the client's priorities". Remember: a good architecture is never "perfect" on all 5 pillars at once — it's **balanced** by requirement (a brochure site doesn't pay for multi-region; a bank does). ⚠️ On a real account, Azure provides **Azure Advisor** and the official **WAF review** that automate part of this audit.
:::

### step-06

:::lang fr
**Objectif.** Graver les **grilles de choix de service** — le cœur de l'AZ-305.

**🤔 « Quel service pour ce besoin ? »** C'est LA question de l'examen. On mémorise deux grilles : **base de données** et **compute**. Chaque ligne = un besoin → un service.

Les grilles :
:::

:::lang en
**Goal.** Engrave the **service-selection grids** — the AZ-305 core.

**🤔 "Which service for this need?"** It's THE exam question. We memorize two grids: **database** and **compute**. Each row = a need → a service.

The grids:
:::

```text
BASE DE DONNÉES / DATABASE
  Relationnel, ACID, jointures        -> Azure SQL / PostgreSQL / MySQL
  NoSQL, mondial, faible latence      -> Cosmos DB
  Objets/fichiers non structurés      -> Blob Storage
  Lecture ultra-rapide (cache)        -> Azure Cache for Redis (devant la base)
  Analytique massif / entrepôt        -> Synapse / Fabric

COMPUTE
  Contrôle total de l'OS / legacy     -> Machine virtuelle (IaaS)
  Appli web / API managée             -> App Service (PaaS)
  Événementiel, pics, payé à l'usage  -> Azure Functions (serverless)
  Microservices conteneurisés         -> AKS / Container Apps
  Un conteneur ponctuel               -> Container Instances (ACI)
```

:::lang fr
**✅ Vérification :** face à un scénario, tu **choisis** vite : « commandes transactionnelles » → **Azure SQL** ; « profils utilisateurs mondiaux, faible latence » → **Cosmos DB** ; « images » → **Blob** ; « API à trafic soutenu » → **App Service** ; « traitement de messages par pics » → **Functions** ; « microservices » → **AKS/Container Apps ». C'est **exactement** le format des questions AZ-305. ⚠️ Justifie toujours par les **besoins** (cohérence, latence, échelle, coût, contrôle) et le **pilier** dominant — l'examen (et un vrai client) attend le **pourquoi**, pas seulement le **quoi**.
:::

:::lang en
**✅ Check:** faced with a scenario, you **choose** fast: "transactional orders" → **Azure SQL**; "global user profiles, low latency" → **Cosmos DB**; "images" → **Blob**; "sustained-traffic API" → **App Service**; "spiky message processing" → **Functions**; "microservices" → **AKS/Container Apps". It's **exactly** the AZ-305 question format. ⚠️ Always justify by the **requirements** (consistency, latency, scale, cost, control) and the dominant **pillar** — the exam (and a real client) expects the **why**, not just the **what**.
:::

### step-07

:::lang fr
**Objectif.** Nettoyer.

**🤔 L'hygiène.** On supprime le groupe de ressources et tout ce qu'il contient (réseau + services).

Nettoie :
:::

:::lang en
**Goal.** Clean up.

**🤔 Hygiene.** We delete the resource group and everything it holds (network + services).

Clean up:
:::

```bash
# Services (azlocal) puis fondation réseau (Terraform)
azlocal functionapp delete --name fn-archi     --resource-group rg-archi
azlocal redis delete       --name redis-archi  --resource-group rg-archi
azlocal sql server delete  --name sqlsrv-archi --resource-group rg-archi
cd infra && terraform destroy -auto-approve
```

:::lang fr
**✅ Vérification :** les `azlocal ... delete` renvoient `Deleted` et `terraform destroy` retire la fondation réseau. Ton labo est rangé. Tu tiens maintenant le **réflexe d'architecte** : partir des **besoins**, concevoir une **architecture multi-tier**, la **justifier** par les 5 piliers du Well-Architected Framework, et **choisir** les services par grille. La suite du track AZ-305 : concevoir les **données** en profondeur, la **continuité d'activité** (sauvegarde, reprise), l'**infrastructure** (compute, réseau avancé), puis le **projet d'architecte**.
:::

:::lang en
**✅ Check:** the `azlocal ... delete` return `Deleted` and `terraform destroy` removes the network foundation. Your lab is tidy. You now hold the **architect reflex**: start from **requirements**, design a **multi-tier architecture**, **justify** it by the 5 Well-Architected Framework pillars, and **choose** services by grid. The AZ-305 track continues: designing **data** in depth, **business continuity** (backup, recovery), **infrastructure** (compute, advanced networking), then the **architect project**.
:::

## pitfalls

:::lang fr
**1. Maximiser un seul pilier.** Sur-sécuriser ou sur-fiabiliser sans regarder le coût, c'est déséquilibré. L'architecture **équilibre** selon les besoins.

**2. Choisir un service par habitude.** « Toujours une VM » ou « toujours du serverless » ignore le besoin. Justifie par la **forme de la donnée**/le **profil de charge**.

**3. Oublier le cache.** Une base sous charge de lecture sans **cache** (Redis), c'est de la performance (et du coût) gaspillés.

**4. Confondre SQL et Cosmos.** SQL = relationnel/ACID/jointures ; Cosmos = NoSQL/mondial/échelle. Le mauvais choix se paie en refonte.

**5. Pas de segmentation réseau.** Un réseau « à plat » viole sécurité **et** fiabilité. Sépare les tiers dès la fondation.

**6. Design sans revue WAF.** Livrer sans passer les 5 piliers, c'est livrer une archi non auditée. La revue est un **livrable**.

**7. Décider sans justifier.** L'AZ-305 (et un client) veulent le **pourquoi** — le besoin et le pilier — pas seulement le service.
:::

:::lang en
**1. Maximizing a single pillar.** Over-securing or over-hardening without watching cost is unbalanced. Architecture **balances** by requirement.

**2. Choosing a service by habit.** "Always a VM" or "always serverless" ignores the need. Justify by the **shape of the data**/the **load profile**.

**3. Forgetting the cache.** A database under read load with no **cache** (Redis) wastes performance (and cost).

**4. Confusing SQL and Cosmos.** SQL = relational/ACID/joins; Cosmos = NoSQL/global/scale. The wrong choice is paid for in a rewrite.

**5. No network segmentation.** A "flat" network violates security **and** reliability. Separate tiers from the foundation.

**6. A design with no WAF review.** Delivering without running the 5 pillars is delivering an unaudited architecture. The review is a **deliverable**.

**7. Deciding without justifying.** AZ-305 (and a client) want the **why** — the need and the pillar — not just the service.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu cites les **5 piliers** et poses leur question sur un design.
- [ ] Tu traduis des **besoins** en décisions d'architecture.
- [ ] Tu déploies une **fondation réseau** segmentée (live).
- [ ] Tu déploies un **tier données** (SQL + Redis, live).
- [ ] Tu décris un **tier compute** (App Service) en Bicep.
- [ ] Tu fais une **revue WAF** pilier par pilier.
- [ ] Tu choisis **base** et **compute** par grille, en justifiant.

Sept cases = tu tiens le socle d'architecte AZ-305. La suite : concevoir les **données**.
:::

:::lang en
You know it works when…

- [ ] You name the **5 pillars** and ask their question about a design.
- [ ] You translate **requirements** into architecture decisions.
- [ ] You deploy a segmented **network foundation** (live).
- [ ] You deploy a **data tier** (SQL + Redis, live).
- [ ] You describe a **compute tier** (App Service) in Bicep.
- [ ] You run a **WAF review** pillar by pillar.
- [ ] You choose **database** and **compute** by grid, with justification.

Seven boxes = you hold the AZ-305 architect base. Next up: designing **data**.
:::

## next

:::lang fr
Le track AZ-305 continue :

1. **Azure — conception des données** : Azure SQL vs Cosmos vs Storage en profondeur, partitionnement, cohérence, cache, migration.
2. Plus loin : **continuité d'activité** (sauvegarde, reprise, HA), **infrastructure** (compute, réseau avancé), puis le **projet d'architecte** et l'examen AZ-305.
:::

:::lang en
The AZ-305 track continues:

1. **Azure — data design**: Azure SQL vs Cosmos vs Storage in depth, partitioning, consistency, caching, migration.
2. Further along: **business continuity** (backup, recovery, HA), **infrastructure** (compute, advanced networking), then the **architect project** and the AZ-305 exam.
:::

## cheatsheet

:::lang fr
Aide-mémoire architecture Azure (WAF).
:::

:::lang en
Azure architecture cheat sheet (WAF).
:::

```bash
# Fondation réseau (Terraform, live) / network foundation
cd infra && export SSL_CERT_FILE=~/.miniblue/cert.pem && terraform apply -auto-approve

# Tier données (azlocal, live) / data tier
azlocal sql server create --name sqlsrv-archi --resource-group rg-archi
azlocal redis create      --name redis-archi  --resource-group rg-archi

# Tier compute (azlocal live + Bicep validé) / compute tier
azlocal functionapp create --name fn-archi --resource-group rg-archi
bicep build appservice.bicep --stdout
```

```text
WAF : Fiabilité · Sécurité · Coût · Excellence opérationnelle · Performance
Base : SQL(relationnel) · Cosmos(NoSQL mondial) · Blob(objets) · Redis(cache) · Synapse(analytique)
Compute : VM(contrôle) · App Service(web PaaS) · Functions(serverless) · AKS/Container Apps(microservices)
```

## resources

:::lang fr
- [Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/) — les 5 piliers.
- [Centre d'architecture Azure](https://learn.microsoft.com/azure/architecture/) — architectures de référence.
- [Choisir un service de base de données](https://learn.microsoft.com/azure/architecture/guide/technology-choices/data-store-decision-tree) — l'arbre de décision.
- [Choisir un service de calcul](https://learn.microsoft.com/azure/architecture/guide/technology-choices/compute-decision-tree) — l'arbre de décision.
- [Azure Advisor](https://learn.microsoft.com/azure/advisor/advisor-overview) — l'audit automatique.
:::

:::lang en
- [Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/) — the 5 pillars.
- [Azure Architecture Center](https://learn.microsoft.com/azure/architecture/) — reference architectures.
- [Choose a database service](https://learn.microsoft.com/azure/architecture/guide/technology-choices/data-store-decision-tree) — the decision tree.
- [Choose a compute service](https://learn.microsoft.com/azure/architecture/guide/technology-choices/compute-decision-tree) — the decision tree.
- [Azure Advisor](https://learn.microsoft.com/azure/advisor/advisor-overview) — the automatic audit.
:::

## troubleshooting

:::lang fr
**`terraform apply` : erreur de certificat.** `export SSL_CERT_FILE=~/.miniblue/cert.pem` avant Terraform.

**`azlocal sql/redis/functionapp create` : connexion refusée.** miniblue ne tourne pas. Lance `miniblue`, vérifie `azlocal health`.

**« resource group not found ».** Lance d'abord `terraform apply` (qui crée `rg-archi`), puis les services.

**`bicep build appservice.bicep` : erreur de schéma.** Vérifie les propriétés `sku`/`siteConfig` contre la doc `Microsoft.Web/sites` ; la version d'API doit exister.

**Je ne sais pas quelle base choisir.** Pars de la **donnée** : relationnelle avec jointures → SQL ; documents/clé-valeur à l'échelle → Cosmos ; fichiers → Blob. Puis vérifie latence, cohérence, coût.

**Mon archi est « parfaite » partout.** Méfie-toi : c'est souvent trop cher. Une bonne archi **équilibre** les piliers selon les besoins réels du client.
:::

:::lang en
**`terraform apply`: certificate error.** `export SSL_CERT_FILE=~/.miniblue/cert.pem` before Terraform.

**`azlocal sql/redis/functionapp create`: connection refused.** miniblue isn't running. Start `miniblue`, check `azlocal health`.

**"resource group not found".** Run `terraform apply` first (which creates `rg-archi`), then the services.

**`bicep build appservice.bicep`: schema error.** Check the `sku`/`siteConfig` properties against the `Microsoft.Web/sites` docs; the API version must exist.

**I don't know which database to choose.** Start from the **data**: relational with joins → SQL; documents/key-value at scale → Cosmos; files → Blob. Then check latency, consistency, cost.

**My architecture is "perfect" everywhere.** Be suspicious: it's often too expensive. A good architecture **balances** the pillars by the client's real requirements.
:::
