---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-projet-architecte
slug: azure-projet-architecte
order: 69
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — projet d'architecte (AZ-305) : une solution Well-Architected"
title_en: "Azure — architect project (AZ-305): a Well-Architected solution"
tagline_fr: "compute, données, réseau, continuité, gouvernance — justifiés."
tagline_en: "compute, data, network, continuity, governance — justified."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 320
repo: "moabukar/miniblue"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: [azure-conception-donnees, azure-continuite, azure-conception-infrastructure]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [projet-architecte, solution-well-architected, multi-tier, compute, donnees, continuite, gouvernance, revue-waf, iac, az-305]
concepts_en: [architect-project, well-architected-solution, multi-tier, compute, data, continuity, governance, waf-review, iac, az-305]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le projet de CV du track AZ-305 : concevoir et assembler une solution Azure Well-Architected complète, justifiée pilier par pilier. Un socle réseau segmenté (Terraform live sur miniblue), un tier compute (Container App) et données (SQL + cache Redis, en live), un durcissement gouvernance (RBAC moindre privilège + verrou) et continuité (coffre de sauvegarde + stockage géo-redondant) en Bicep validé. Puis une revue Well-Architected des 5 piliers et l'emballage CV. Sans compte ni facture."
og_description_en: "The AZ-305 track's CV project: designing and assembling a complete Well-Architected Azure solution, justified pillar by pillar. A segmented network foundation (Terraform live on miniblue), a compute tier (Container App) and data tier (SQL + Redis cache, live), governance hardening (least-privilege RBAC + lock) and continuity (backup vault + geo-redundant storage) in validated Bicep. Then a Well-Architected review of the 5 pillars and CV packaging. No account or bill."
---

## intro

:::lang fr
Voici le **livrable** du track AZ-305 : concevoir et assembler une **solution Azure complète, Well-Architected**, que tu pourras **présenter sur ton CV** et **défendre en entretien**. On ne fait pas une brique isolée — on réunit **tout** ce que tu as appris (compute, données, réseau, continuité, gouvernance) en **une architecture cohérente**, et surtout on la **justifie pilier par pilier**. C'est exactement ce qu'un architecte de solutions produit et présente.

L'architecture : un **socle réseau segmenté** (VNet + sous-réseaux web/app/data), un **tier compute** (une Container App), un **tier données** (une base **SQL** + un **cache Redis**), un **durcissement gouvernance** (RBAC au **moindre privilège** + verrou) et **continuité** (coffre de **sauvegarde** + stockage **géo-redondant**). Chaque choix est **relié à un pilier** du Well-Architected Framework.

Et — c'est la marque du parcours — **tu le déploies EN LOCAL** sur miniblue : le socle réseau et les tiers compute/données **en live** (Terraform + `azlocal`), le durcissement et la continuité **validés en Bicep**. Puis tu produis une **revue Well-Architected** (le livrable d'architecte) et tu **emballes** le projet pour ton CV. Une solution qui **prouve** des compétences d'architecte, à coût zéro.

**Pour qui c'est :** tu as fait *données*, *continuité* et *infrastructure*. C'est l'aboutissement — prévois une bonne session.

**Quand ce n'est PAS le bon choix :**

- Il te manque un guide AZ-305 → fais-les d'abord ; ce projet les assemble.
- miniblue ne tourne pas → relance le labo.
:::

:::lang en
Here's the **deliverable** of the AZ-305 track: designing and assembling a **complete, Well-Architected Azure solution** you can **put on your CV** and **defend in an interview**. We're not building an isolated block — we bring together **everything** you learned (compute, data, networking, continuity, governance) into **one coherent architecture**, and above all we **justify** it pillar by pillar. It's exactly what a solutions architect produces and presents.

The architecture: a **segmented network foundation** (VNet + web/app/data subnets), a **compute tier** (a Container App), a **data tier** (a **SQL** database + a **Redis cache**), a **governance hardening** (least-privilege **RBAC** + lock) and **continuity** (**backup** vault + **geo-redundant** storage). Every choice is **tied to a pillar** of the Well-Architected Framework.

And — the path's signature — **you deploy it LOCALLY** on miniblue: the network foundation and compute/data tiers **live** (Terraform + `azlocal`), the hardening and continuity **validated in Bicep**. Then you produce a **Well-Architected review** (the architect's deliverable) and **package** the project for your CV. A solution that **proves** architect skills, at zero cost.

**Who it's for:** you've done *data*, *continuity* and *infrastructure*. This is the culmination — set aside a good session.

**When it's NOT the right choice:**

- You're missing an AZ-305 guide → do them first; this project assembles them.
- miniblue isn't running → restart the lab.
:::

## objectives

:::lang fr
À la fin de ce projet, tu as construit et tu sais expliquer :

- Une **solution multi-tier** complète (réseau, compute, données, continuité, gouvernance).
- Un **socle réseau** segmenté déployé en live (Terraform).
- Un **tier compute** (Container App) et **données** (SQL + Redis) en live.
- Un **durcissement gouvernance** (RBAC moindre privilège + verrou) en Bicep.
- Une **continuité** (coffre de sauvegarde + stockage géo-redondant) en Bicep.
- Une **revue Well-Architected** justifiant l'architecture pilier par pilier.
- Comment **présenter ce projet** sur un CV et en entretien.
:::

:::lang en
By the end of this project, you've built and can explain:

- A complete **multi-tier solution** (network, compute, data, continuity, governance).
- A segmented **network foundation** deployed live (Terraform).
- A **compute tier** (Container App) and **data tier** (SQL + Redis) live.
- A **governance hardening** (least-privilege RBAC + lock) in Bicep.
- A **continuity** (backup vault + geo-redundant storage) in Bicep.
- A **Well-Architected review** justifying the architecture pillar by pillar.
- How to **present this project** on a CV and in an interview.
:::

## prerequisites

:::lang fr
- Les guides AZ-305 **données**, **continuité** et **infrastructure** terminés.
- **miniblue** qui tourne, **Terraform** et **Bicep** installés ; `export SSL_CERT_FILE=~/.miniblue/cert.pem`.
- Rappel : réseau → Terraform (live) ; compute/données → `azlocal` (live) ; gouvernance/continuité → Bicep (validé).
:::

:::lang en
- The AZ-305 **data**, **continuity** and **infrastructure** guides done.
- **miniblue** running, **Terraform** and **Bicep** installed; `export SSL_CERT_FILE=~/.miniblue/cert.pem`.
- Reminder: network → Terraform (live); compute/data → `azlocal` (live); governance/continuity → Bicep (validated).
:::

## concepts

:::lang fr
**La solution comme assemblage justifié.** Un architecte ne pose pas des ressources au hasard : il **assemble** des tiers cohérents et **relie chaque décision à un pilier** du Well-Architected Framework. C'est ce qui distingue une « pile de services » d'une **architecture**.

**Les tiers de la solution.** On construit une application web classique en **couches** :

- **Réseau (fondation).** Un VNet segmenté (web/app/data) : isolation et défense en profondeur (**sécurité**, **fiabilité**).
- **Compute (tier applicatif).** Une **Container App** serverless : élasticité et coût à l'usage (**performance**, **coût**).
- **Données (tier persistance).** Une base **SQL** (source de vérité transactionnelle) + un **cache Redis** (lectures rapides) (**performance**, **fiabilité**).
- **Gouvernance (transverse).** RBAC au **moindre privilège** + **verrou** de protection (**sécurité**, **excellence opérationnelle**).
- **Continuité (transverse).** Coffre de **sauvegarde** + stockage **géo-redondant** (**fiabilité**).

**Trois outils, trois rôles.** (1) **Terraform** déploie le **réseau** en live sur miniblue. (2) **`azlocal`** crée les **charges** (Container App, SQL, Redis). (3) **Bicep** **valide** la **gouvernance** et la **continuité** (RBAC/verrou/coffre/stockage géo-redondant), prêtes à déployer sur un compte.

**La revue Well-Architected — le livrable.** Une solution n'est « finie » que quand elle est **auditée** : on passe les 5 piliers et on note forces et améliorations. C'est **ce** document (plus le README) qui transforme un tas de ressources en **projet d'architecte présentable**.

**Ce qui est live ici.** Le **socle réseau** (Terraform) et les **tiers compute/données** (`azlocal`) sont **déployés en live** sur miniblue. Le **durcissement** et la **continuité** sont **validés en Bicep** — la forme exacte du vrai Azure, prête pour un `az deployment` sur un compte (guide *passer en réel* de l'AZ-104).
:::

:::lang en
**The solution as a justified assembly.** An architect doesn't drop resources at random: they **assemble** coherent tiers and **tie each decision to a pillar** of the Well-Architected Framework. That's what distinguishes a "pile of services" from an **architecture**.

**The solution's tiers.** We build a classic web application in **layers**:

- **Network (foundation).** A segmented VNet (web/app/data): isolation and defense in depth (**security**, **reliability**).
- **Compute (application tier).** A serverless **Container App**: elasticity and pay-per-use cost (**performance**, **cost**).
- **Data (persistence tier).** A **SQL** database (transactional source of truth) + a **Redis cache** (fast reads) (**performance**, **reliability**).
- **Governance (cross-cutting).** Least-privilege **RBAC** + a protection **lock** (**security**, **operational excellence**).
- **Continuity (cross-cutting).** A **backup** vault + **geo-redundant** storage (**reliability**).

**Three tools, three roles.** (1) **Terraform** deploys the **network** live on miniblue. (2) **`azlocal`** creates the **workloads** (Container App, SQL, Redis). (3) **Bicep** **validates** the **governance** and **continuity** (RBAC/lock/vault/geo-redundant storage), ready to deploy on an account.

**The Well-Architected review — the deliverable.** A solution is only "done" once it's **audited**: you run the 5 pillars and note strengths and improvements. It's **that** document (plus the README) that turns a pile of resources into a **presentable architect project**.

**What's live here.** The **network foundation** (Terraform) and the **compute/data tiers** (`azlocal`) are **deployed live** on miniblue. The **hardening** and **continuity** are **validated in Bicep** — the exact shape of real Azure, ready for an `az deployment` on an account (AZ-104's *going real* guide).
:::

:::figure azure-solution-waf
caption_fr: "Schéma 1. La solution Well-Architected : un socle RÉSEAU segmenté (web/app/data, Terraform live) ; un tier COMPUTE (Container App) et DONNÉES (SQL + cache Redis, azlocal live) ; un durcissement GOUVERNANCE (RBAC moindre privilège + verrou) et CONTINUITÉ (coffre de sauvegarde + stockage géo-redondant) en Bicep validé. Chaque tier relié à un pilier WAF, l'ensemble audité par la revue Well-Architected."
caption_en: "Figure 1. The Well-Architected solution: a segmented NETWORK foundation (web/app/data, Terraform live); a COMPUTE tier (Container App) and DATA tier (SQL + Redis cache, azlocal live); GOVERNANCE hardening (least-privilege RBAC + lock) and CONTINUITY (backup vault + geo-redundant storage) in validated Bicep. Each tier tied to a WAF pillar, the whole audited by the Well-Architected review."
:::

## walkthrough

:::lang fr
On construit ainsi : cahier des charges & squelette → socle réseau (live) → compute & données (live) → gouvernance & continuité (Bicep) → revue Well-Architected → emballage CV → démontage.
:::

:::lang en
We build like this: brief & skeleton → network foundation (live) → compute & data (live) → governance & continuity (Bicep) → Well-Architected review → CV packaging → teardown.
:::

### step-01

:::lang fr
**Objectif.** Poser le **cahier des charges** et le **squelette**.

**🤔 Des besoins à l'architecture.** Le brief : « une application web, données transactionnelles, disponible et sécurisée, budget maîtrisé ». On traduit en tiers (réseau, compute, données) + transverses (gouvernance, continuité), et on structure le projet.

Crée l'arborescence :
:::

:::lang en
**Goal.** Lay down the **brief** and the **skeleton**.

**🤔 From requirements to architecture.** The brief: "a web application, transactional data, available and secure, controlled budget". We translate into tiers (network, compute, data) + cross-cutting (governance, continuity), and structure the project.

Create the tree:
:::

```bash
mkdir -p ~/solution-waf/infra ~/solution-waf/durcissement
cd ~/solution-waf
export SSL_CERT_FILE=~/.miniblue/cert.pem
# infra/         -> Terraform (réseau live) ; durcissement/ -> Bicep (gouvernance + continuité) ; README.md
```

:::lang fr
**✅ Vérification :** `ls ~/solution-waf` montre `durcissement` et `infra`. Tu tiens le **plan** relié aux piliers : réseau (sécurité/fiabilité), compute (performance/coût), données (performance/fiabilité), gouvernance (sécurité), continuité (fiabilité). La phrase d'entretien : « J'ai conçu une solution Azure Well-Architected — réseau segmenté, compute serverless, données SQL+cache, gouvernance au moindre privilège et continuité — justifiée pilier par pilier. » Les étapes suivantes remplissent chaque couche, **testée**.
:::

:::lang en
**✅ Check:** `ls ~/solution-waf` shows `durcissement` and `infra`. You hold the **plan** tied to the pillars: network (security/reliability), compute (performance/cost), data (performance/reliability), governance (security), continuity (reliability). The interview sentence: "I designed a Well-Architected Azure solution — segmented network, serverless compute, SQL+cache data, least-privilege governance and continuity — justified pillar by pillar." The next steps fill each layer, **tested**.
:::

### step-02

:::lang fr
**Objectif.** Déployer le **socle réseau** — sécurité & fiabilité, en live.

**🤔 La fondation.** On déploie le VNet segmenté (web/app/data) en Terraform paramétré. Crée `infra/providers.tf` (le bloc provider `azurerm` → miniblue, cf. guide *réseau*) et `infra/main.tf`, **puis** applique.

Crée les fichiers, puis déploie :
:::

:::lang en
**Goal.** Deploy the **network foundation** — security & reliability, live.

**🤔 The foundation.** We deploy the segmented VNet (web/app/data) in parameterized Terraform. Create `infra/providers.tf` (the `azurerm` provider block → miniblue, see the *networking* guide) and `infra/main.tf`, **then** apply.

Create the files, then deploy:
:::

```hcl
# infra/main.tf — socle réseau segmenté
resource "azurerm_resource_group" "sol" {
  name     = "rg-solution"
  location = "westeurope"
  tags     = { projet = "solution-waf", env = "archi" }
}
resource "azurerm_virtual_network" "hub" {
  name                = "vnet-solution"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.sol.location
  resource_group_name = azurerm_resource_group.sol.name
  tags                = { projet = "solution-waf" }
}
resource "azurerm_subnet" "tiers" {
  for_each             = { web = "10.0.1.0/24", app = "10.0.2.0/24", data = "10.0.3.0/24" }
  name                 = "snet-${each.key}"
  resource_group_name  = azurerm_resource_group.sol.name
  virtual_network_name = azurerm_virtual_network.hub.name
  address_prefixes     = [each.value]
}
output "resource_group" { value = azurerm_resource_group.sol.name }
```

```bash
cd infra && terraform init && terraform apply -auto-approve
```

:::lang fr
**✅ Vérification :** `terraform apply` affiche `Apply complete! Resources: 5 added.` — le groupe `rg-solution`, le VNet et les **trois sous-réseaux** (web/app/data), taggés. La **fondation** est en place, segmentée par tier. Piliers servis : **sécurité** (segmentation, défense en profondeur), **fiabilité** (isolation des pannes), **excellence opérationnelle** (IaC paramétrée). C'est sur ce socle qu'on pose compute et données.
:::

:::lang en
**✅ Check:** `terraform apply` shows `Apply complete! Resources: 5 added.` — the `rg-solution` group, the VNet and the **three subnets** (web/app/data), tagged. The **foundation** is in place, segmented by tier. Pillars served: **security** (segmentation, defense in depth), **reliability** (failure isolation), **operational excellence** (parameterized IaC). On this base we place compute and data.
:::

### step-03

:::lang fr
**Objectif.** Déployer les tiers **compute** et **données** — performance & coût, en live.

**🤔 L'application et sa donnée.** Le tier applicatif : une **Container App** serverless (élastique, payée à l'usage). Le tier données : une base **SQL** (transactionnel) + un **cache Redis** (lectures rapides). Tous dans le groupe `rg-solution`.

Déploie les charges (azlocal) :
:::

:::lang en
**Goal.** Deploy the **compute** and **data** tiers — performance & cost, live.

**🤔 The application and its data.** The application tier: a serverless **Container App** (elastic, pay-per-use). The data tier: a **SQL** database (transactional) + a **Redis cache** (fast reads). All in the `rg-solution` group.

Deploy the workloads (azlocal):
:::

```bash
# Tier compute : Container App serverless / compute tier: serverless Container App
azlocal containerapp create --name ca-app --resource-group rg-solution

# Tier données : SQL (source de vérité) + Redis (cache) / data tier: SQL + Redis cache
azlocal sql server create   --name sqlsrv-sol --resource-group rg-solution
azlocal sql database create --server sqlsrv-sol --name soldb --resource-group rg-solution
azlocal redis create        --name redis-sol --resource-group rg-solution
```

:::lang fr
**✅ Vérification :** les créations renvoient des objets ARM `Succeeded` : la Container App `ca-app`, le serveur SQL `sqlsrv-sol` + la base `soldb`, le cache `redis-sol`. Ta solution a un **tier applicatif** élastique et un **tier données** durable+rapide. Piliers servis : **performance** (serverless élastique + cache), **coût** (Container App payée à l'usage, pas de VM au repos), **fiabilité** (SQL comme source de vérité). ⚠️ Ces charges vivent dans `rg-solution` avec le réseau — un seul groupe, un seul cycle de vie.
:::

:::lang en
**✅ Check:** the creations return `Succeeded` ARM objects: the `ca-app` Container App, the `sqlsrv-sol` SQL server + `soldb` database, the `redis-sol` cache. Your solution has an elastic **application tier** and a durable+fast **data tier**. Pillars served: **performance** (elastic serverless + cache), **cost** (pay-per-use Container App, no idle VM), **reliability** (SQL as source of truth). ⚠️ These workloads live in `rg-solution` with the network — one group, one lifecycle.
:::

### step-04

:::lang fr
**Objectif.** Décrire le **durcissement** (gouvernance) et la **continuité** — sécurité & fiabilité, en Bicep.

**🤔 Sécuriser et pérenniser.** Deux transverses : la **gouvernance** (une identité au **moindre privilège** + un **verrou** anti-suppression) et la **continuité** (un **coffre de sauvegarde** + un **stockage géo-redondant**). On les décrit en Bicep, prêtes à déployer.

Crée `durcissement/securite.bicep` et `durcissement/resilience.bicep` :
:::

:::lang en
**Goal.** Describe the **hardening** (governance) and **continuity** — security & reliability, in Bicep.

**🤔 Secure and sustain.** Two cross-cutting concerns: **governance** (a least-privilege identity + an anti-deletion **lock**) and **continuity** (a **backup vault** + **geo-redundant storage**). We describe them in Bicep, ready to deploy.

Create `durcissement/securite.bicep` and `durcissement/resilience.bicep`:
:::

```bicep
// durcissement/securite.bicep — RBAC moindre privilège + verrou (sécurité)
targetScope = 'resourceGroup'
param principalId string

var readerRoleId = 'acdd72a7-3385-48ef-bd42-f606fba81ae7'  // rôle intégré Lecteur

resource attribution 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, principalId, readerRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', readerRoleId)
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}

resource verrou 'Microsoft.Authorization/locks@2020-05-01' = {
  name: 'protege-solution'
  properties: { level: 'CanNotDelete', notes: 'Solution critique' }
}
```

```bicep
// durcissement/resilience.bicep — coffre de sauvegarde + stockage géo-redondant (fiabilité)
targetScope = 'resourceGroup'
param location string = resourceGroup().location

resource coffre 'Microsoft.RecoveryServices/vaults@2023-06-01' = {
  name: 'rsv-solution'
  location: location
  sku: { name: 'RS0', tier: 'Standard' }
  properties: {}
}

resource stockageGeo 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'stsol${uniqueString(resourceGroup().id)}'
  location: location
  sku: { name: 'Standard_RAGRS' }   // géo-redondant + lecture
  kind: 'StorageV2'
  properties: { minimumTlsVersion: 'TLS1_2', allowBlobPublicAccess: false }
}
```

```bash
cd ~/solution-waf/durcissement
bicep build securite.bicep --stdout | head -n 15
bicep build resilience.bicep --stdout | head -n 15
```

:::lang fr
**✅ Vérification :** `bicep build securite.bicep` compile l'**attribution de rôle** (Lecteur, moindre privilège) et le **verrou** (`CanNotDelete`) ; `bicep build resilience.bicep` compile le **coffre** Recovery Services et le **stockage RA-GRS** — sans erreur. Piliers servis : **sécurité** (moindre privilège, verrou), **fiabilité** (sauvegarde, géo-redondance), **excellence opérationnelle** (tout en IaC). ⚠️ Ces mécanismes se **valident** ici et se **déploient** sur un vrai compte (`az deployment group create`) — l'émulateur ne provisionne pas RBAC/coffres, mais la **conception** est exacte.
:::

:::lang en
**✅ Check:** `bicep build securite.bicep` compiles the **role assignment** (Reader, least privilege) and the **lock** (`CanNotDelete`); `bicep build resilience.bicep` compiles the Recovery Services **vault** and the **RA-GRS storage** — with no error. Pillars served: **security** (least privilege, lock), **reliability** (backup, geo-redundancy), **operational excellence** (all in IaC). ⚠️ These mechanisms are **validated** here and **deployed** on a real account (`az deployment group create`) — the emulator doesn't provision RBAC/vaults, but the **design** is exact.
:::

### step-05

:::lang fr
**Objectif.** Produire la **revue Well-Architected** — le livrable d'architecte.

**🤔 Auditer les 5 piliers.** L'architecte ne dit pas « c'est fini » : il **audite** la solution pilier par pilier et note forces et améliorations. C'est **le** document qui accompagne l'architecture.

Rédige la revue :
:::

:::lang en
**Goal.** Produce the **Well-Architected review** — the architect's deliverable.

**🤔 Audit the 5 pillars.** The architect doesn't say "it's done": they **audit** the solution pillar by pillar and note strengths and improvements. It's **the** document that accompanies the architecture.

Write the review:
:::

```text
REVUE WELL-ARCHITECTED de la solution / WAF REVIEW of the solution

  Fiabilité      FORT : SQL source de vérité, sauvegarde (coffre), stockage RA-GRS
                 + : zones de disponibilité, réplica Redis, géo-réplication SQL
  Sécurité       FORT : réseau segmenté, RBAC moindre privilège, verrou, TLS 1.2
                 + : private endpoints data, Key Vault pour les secrets, WAF en entrée
  Coût           FORT : Container App serverless (usage), tags de coût
                 + : dimensionner SQL, budgets/alertes, arrêt hors-prod
  Excellence     FORT : tout en IaC (Terraform + Bicep), un seul groupe = un cycle de vie
                 + : monitoring (Azure Monitor), alertes, CI/CD
  Performance    FORT : cache Redis devant SQL, compute élastique
                 + : Front Door/CDN en entrée, App Gateway L7, région proche
```

:::lang fr
**✅ Vérification :** tu as une **revue Well-Architected** : pour chaque pilier, ce qui est **fort** et ce qu'on **renforce**. C'est le livrable qui **prouve** ta démarche d'architecte — non pas « voici des ressources », mais « voici une architecture **justifiée** et **auditée**, avec sa feuille de route d'amélioration ». ⚠️ En entretien, on te demandera **pourquoi** tel choix : réponds par le **pilier** et le **compromis** (« Container App plutôt qu'AKS pour le coût et la simplicité, au prix d'un contrôle Kubernetes moindre »). C'est ça, penser en architecte.
:::

:::lang en
**✅ Check:** you have a **Well-Architected review**: for each pillar, what's **strong** and what you **reinforce**. It's the deliverable that **proves** your architect approach — not "here are resources", but "here's a **justified** and **audited** architecture, with its improvement roadmap". ⚠️ In an interview, you'll be asked **why** a choice: answer with the **pillar** and the **tradeoff** ("Container App rather than AKS for cost and simplicity, at the price of less Kubernetes control"). That's thinking like an architect.
:::

### step-06

:::lang fr
**Objectif.** **Emballer** le projet pour ton CV.

**🤔 Raconter la solution.** Un `README` clair (architecture, piliers, stack) + la revue WAF : c'est ce qui transforme le projet en **atout d'embauche**.

Crée `README.md` :
:::

:::lang en
**Goal.** **Package** the project for your CV.

**🤔 Tell the solution.** A clear `README` (architecture, pillars, stack) + the WAF review: that's what turns the project into a **hiring asset**.

Create `README.md`:
:::

```markdown
# Solution Azure Well-Architected (AZ-305)

Solution multi-tier conçue et justifiée pilier par pilier : socle **réseau**
segmenté (VNet web/app/data), tier **compute** serverless (Container App),
tier **données** (Azure SQL + cache Redis), **gouvernance** au moindre
privilège (RBAC + verrou) et **continuité** (coffre de sauvegarde + stockage
géo-redondant).

## Architecture
Terraform (réseau, live) + azlocal (compute/données, live) + Bicep
(gouvernance/continuité, validé). Réseau → Container App → SQL/Redis.

## Piliers (Well-Architected)
Fiabilité (SQL+backup+RA-GRS) · Sécurité (segmentation+RBAC+verrou) ·
Coût (serverless+tags) · Excellence (IaC) · Performance (cache+élasticité).

## Lancer
1. `cd infra && terraform apply`                 # réseau live
2. `azlocal containerapp/sql/redis create ... -g rg-solution`  # charges
3. `cd ../durcissement && bicep build *.bicep`   # valider gouvernance + continuité

## Compétences démontrées
Conception Well-Architected · multi-tier · IaC (Terraform+Bicep) · compute
serverless · données (SQL+cache) · RBAC moindre privilège · sauvegarde/DR ·
revue d'architecture.
```

:::lang fr
**✅ Vérification :** ton dossier `~/solution-waf` contient `infra/` (réseau déployé), `durcissement/` (Bicep validé), la **revue WAF** et `README.md`. **Tu as un projet de CV d'architecte.** Phrase d'accroche : *« J'ai conçu une solution Azure Well-Architected multi-tier — réseau, compute serverless, données SQL+cache, gouvernance et continuité — en Terraform et Bicep, justifiée pilier par pilier et testée en local. »* Pousse-le sur **GitHub**. ⚠️ Prochaine étape : l'examen **AZ-305**, puis la suite du parcours (AZ-400, AZ-500, AZ-700).
:::

:::lang en
**✅ Check:** your `~/solution-waf` folder holds `infra/` (deployed network), `durcissement/` (validated Bicep), the **WAF review** and `README.md`. **You have an architect CV project.** Hook sentence: *"I designed a multi-tier Well-Architected Azure solution — network, serverless compute, SQL+cache data, governance and continuity — in Terraform and Bicep, justified pillar by pillar and tested locally."* Push it to **GitHub**. ⚠️ Next step: the **AZ-305** exam, then the rest of the path (AZ-400, AZ-500, AZ-700).
:::

### step-07

:::lang fr
**Objectif.** **Démonter** la solution.

**🤔 Créer → utiliser → détruire.** On retire les charges (azlocal) puis le socle réseau (Terraform).

Démonte :
:::

:::lang en
**Goal.** **Tear down** the solution.

**🤔 Create → use → destroy.** We remove the workloads (azlocal) then the network foundation (Terraform).

Tear it down:
:::

```bash
azlocal group delete --name rg-solution     # charges + (le groupe emporte tout)
cd ~/solution-waf/infra && terraform destroy -auto-approve
```

:::lang fr
**✅ Vérification :** `group delete` renvoie `Deleted` (Container App, SQL, Redis partent), et `terraform destroy` retire le socle réseau (`Destroy complete!`). Ta solution est entièrement démontée. **Tu tiens ton projet de CV AZ-305** : une solution Well-Architected complète, conçue, déployée/validée en local, et **justifiée pilier par pilier**. 🎓 Tu as terminé le track **AZ-305 — Architecte de solutions**. La suite du parcours Azure : **AZ-400** (DevOps), **AZ-500** (sécurité), **AZ-700** (réseau) — même méthode, même labo miniblue.
:::

:::lang en
**✅ Check:** `group delete` returns `Deleted` (Container App, SQL, Redis go), and `terraform destroy` removes the network foundation (`Destroy complete!`). Your solution is fully torn down. **You hold your AZ-305 CV project**: a complete Well-Architected solution, designed, deployed/validated locally, and **justified pillar by pillar**. 🎓 You've finished the **AZ-305 — Solutions Architect** track. The rest of the Azure path: **AZ-400** (DevOps), **AZ-500** (security), **AZ-700** (networking) — same method, same miniblue lab.
:::

## pitfalls

:::lang fr
**1. Assembler sans justifier.** Une pile de services n'est pas une architecture. **Relie chaque tier à un pilier** — c'est la marque de l'architecte.

**2. Négliger la revue WAF.** Sans audit des 5 piliers, la solution n'est pas « finie ». La revue est **le** livrable.

**3. Maximiser un pilier.** Sur-sécuriser ou sur-fiabiliser sans le coût déséquilibre. On **équilibre** selon le brief.

**4. Mélanger les outils.** Réseau → Terraform ; charges → azlocal ; gouvernance/continuité → Bicep. Chacun pour ce qu'il fait le mieux sur miniblue.

**5. Oublier les transverses.** Compute + données ne suffisent pas : **gouvernance** (sécurité) et **continuité** (fiabilité) sont **obligatoires** dans une vraie solution.

**6. Un projet sans README ni justification.** Le recruteur lit le README et demande le **pourquoi**. Prépare les deux.

**7. Ne pas connaître les compromis.** « Pourquoi Container App et pas AKS ? » Réponds par le pilier (coût/simplicité) et le prix payé (contrôle Kubernetes).
:::

:::lang en
**1. Assembling without justifying.** A pile of services isn't an architecture. **Tie each tier to a pillar** — the architect's mark.

**2. Skipping the WAF review.** Without a 5-pillar audit, the solution isn't "done". The review is **the** deliverable.

**3. Maximizing one pillar.** Over-securing or over-hardening without cost is unbalanced. You **balance** by the brief.

**4. Mixing the tools.** Network → Terraform; workloads → azlocal; governance/continuity → Bicep. Each for what it does best on miniblue.

**5. Forgetting the cross-cutting concerns.** Compute + data aren't enough: **governance** (security) and **continuity** (reliability) are **mandatory** in a real solution.

**6. A project with no README or justification.** The recruiter reads the README and asks **why**. Prepare both.

**7. Not knowing the tradeoffs.** "Why Container App and not AKS?" Answer with the pillar (cost/simplicity) and the price paid (Kubernetes control).
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu déploies un **socle réseau** segmenté en live (5 ressources).
- [ ] Tu déploies un **tier compute** (Container App) et **données** (SQL + Redis).
- [ ] Tu **valides** la **gouvernance** (RBAC + verrou) en Bicep.
- [ ] Tu **valides** la **continuité** (coffre + stockage géo-redondant) en Bicep.
- [ ] Tu produis une **revue Well-Architected** (5 piliers).
- [ ] Ton `README.md` raconte la solution et ses piliers.
- [ ] Tu justifies chaque choix par un **pilier** et un **compromis**.

Sept cases = tu as un **projet d'architecte** AZ-305 défendable. Cap sur l'examen.
:::

:::lang en
You know it works when…

- [ ] You deploy a segmented **network foundation** live (5 resources).
- [ ] You deploy a **compute tier** (Container App) and **data tier** (SQL + Redis).
- [ ] You **validate** the **governance** (RBAC + lock) in Bicep.
- [ ] You **validate** the **continuity** (vault + geo-redundant storage) in Bicep.
- [ ] You produce a **Well-Architected review** (5 pillars).
- [ ] Your `README.md` tells the solution and its pillars.
- [ ] You justify each choice by a **pillar** and a **tradeoff**.

Seven boxes = you have a defensible AZ-305 **architect project**. Aim for the exam.
:::

## next

:::lang fr
Tu as terminé le track **AZ-305 — Architecte de solutions** ! 🎉

1. **Certification AZ-305** : entraîne-toi sur des **études de cas** (le format de l'examen), révise les **choix de service** et les **compromis** par pilier.
2. **Ton CV** : mets en avant la **solution Well-Architected** (multi-tier, IaC, justifiée).
3. **La suite du parcours Azure** : **AZ-400** (DevOps), **AZ-500** (sécurité), **AZ-700** (réseau) — même méthode, même labo miniblue.
:::

:::lang en
You've finished the **AZ-305 — Solutions Architect** track! 🎉

1. **AZ-305 certification**: practice on **case studies** (the exam format), revise **service choices** and **tradeoffs** by pillar.
2. **Your CV**: highlight the **Well-Architected solution** (multi-tier, IaC, justified).
3. **The rest of the Azure path**: **AZ-400** (DevOps), **AZ-500** (security), **AZ-700** (networking) — same method, same miniblue lab.
:::

## cheatsheet

:::lang fr
Aide-mémoire du projet (depuis `~/solution-waf`).
:::

:::lang en
Project cheat sheet (from `~/solution-waf`).
:::

```bash
export SSL_CERT_FILE=~/.miniblue/cert.pem

# Socle réseau (Terraform, live) / network foundation
cd infra && terraform init && terraform apply -auto-approve

# Compute + données (azlocal, live) / compute + data
azlocal containerapp create --name ca-app     --resource-group rg-solution
azlocal sql server create   --name sqlsrv-sol --resource-group rg-solution
azlocal sql database create --server sqlsrv-sol --name soldb --resource-group rg-solution
azlocal redis create        --name redis-sol  --resource-group rg-solution

# Durcissement (Bicep, validé) / hardening
cd ../durcissement && bicep build securite.bicep --stdout && bicep build resilience.bicep --stdout

# Démonter / tear down
azlocal group delete --name rg-solution ; cd ../infra && terraform destroy -auto-approve
```

```text
Tiers -> piliers : réseau(sécu/fiab) · compute(perf/coût) · données(perf/fiab) · gouvernance(sécu) · continuité(fiab)
Outils : Terraform(réseau live) · azlocal(charges live) · Bicep(gouvernance/continuité validé)
Livrable : la solution + la REVUE Well-Architected (5 piliers) + le README
```

## resources

:::lang fr
- [Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/) — les 5 piliers.
- [Centre d'architecture Azure](https://learn.microsoft.com/azure/architecture/) — architectures de référence.
- [Zones d'atterrissage Azure](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/) — les fondations.
- [Certification AZ-305](https://learn.microsoft.com/credentials/certifications/azure-solutions-architect/) — le programme officiel.
- [miniblue — émulateur Azure local](https://github.com/moabukar/miniblue) — le labo.
:::

:::lang en
- [Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/) — the 5 pillars.
- [Azure Architecture Center](https://learn.microsoft.com/azure/architecture/) — reference architectures.
- [Azure landing zones](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/) — the foundations.
- [AZ-305 certification](https://learn.microsoft.com/credentials/certifications/azure-solutions-architect/) — the official program.
- [miniblue — local Azure emulator](https://github.com/moabukar/miniblue) — the lab.
:::

## troubleshooting

:::lang fr
**`terraform apply` : erreur de certificat.** `export SSL_CERT_FILE=~/.miniblue/cert.pem` avant Terraform.

**`azlocal ... create` : « resource group not found ».** Lance d'abord `terraform apply` (qui crée `rg-solution`), puis les charges.

**`bicep build securite.bicep` : `principalId` requis.** Passe-le au déploiement, ou donne une valeur par défaut pour la compilation. En réel, mets le `principalId` de l'identité managée.

**Comment justifier un choix en entretien ?** Toujours : **pilier** servi + **compromis** accepté. Ex. « Container App (coût/simplicité) plutôt qu'AKS (contrôle Kubernetes) ».

**Ma solution est « forte » partout.** Méfie-toi : souvent trop chère. Une bonne solution **équilibre** les piliers selon le brief.

**Le state Terraform est désynchronisé (après `azlocal reset`).** Supprime `terraform.tfstate` et refais `apply`, ou recommence proprement.
:::

:::lang en
**`terraform apply`: certificate error.** `export SSL_CERT_FILE=~/.miniblue/cert.pem` before Terraform.

**`azlocal ... create`: "resource group not found".** Run `terraform apply` first (which creates `rg-solution`), then the workloads.

**`bicep build securite.bicep`: `principalId` required.** Pass it at deployment, or give a default for compilation. For real, use the managed identity's `principalId`.

**How to justify a choice in an interview?** Always: the **pillar** served + the **tradeoff** accepted. E.g. "Container App (cost/simplicity) rather than AKS (Kubernetes control)".

**My solution is "strong" everywhere.** Be suspicious: often too expensive. A good solution **balances** the pillars by the brief.

**Terraform state out of sync (after `azlocal reset`).** Delete `terraform.tfstate` and re-run `apply`, or start clean.
:::
