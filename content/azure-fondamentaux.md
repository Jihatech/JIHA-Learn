---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-fondamentaux
slug: azure-fondamentaux
order: 58
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — fondamentaux : le labo local (miniblue) et le modèle Azure"
title_en: "Azure — fundamentals: the local lab (miniblue) and the Azure model"
tagline_fr: "miniblue, az CLI, Azurite, Bicep, hiérarchie des ressources, régions."
tagline_en: "miniblue, az CLI, Azurite, Bicep, resource hierarchy, regions."

# — Métadonnées pédagogiques —
level: beginner
duration_min: 210
repo: "moabukar/miniblue"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: []
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [modeles-cloud, miniblue, azure-cli, azurite, bicep, hierarchie-ressources, regions-zones, groupes-de-ressources, plan-de-controle, iac]
concepts_en: [cloud-models, miniblue, azure-cli, azurite, bicep, resource-hierarchy, regions-zones, resource-groups, control-plane, iac]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Démarre Microsoft Azure sans compte ni facture grâce à miniblue, l'émulateur Azure local (façon LocalStack, ~30 services) : installe l'outillage (miniblue/azlocal, az CLI, Azurite, Bicep), monte un labo local, comprends le modèle Azure (groupes d'administration → abonnements → groupes de ressources → ressources, régions et zones), crée un vrai GROUPE DE RESSOURCES et un compte de stockage EN LOCAL (plan de contrôle live sur miniblue), dépose un blob sur Azurite (plan de données), et compile ton premier template Bicep. La base du parcours de certifications Azure (AZ-900 → AZ-104 → AZ-305 → AZ-400 → AZ-500 → AZ-700)."
og_description_en: "Start Microsoft Azure with no account or bill thanks to miniblue, the local Azure emulator (LocalStack-style, ~30 services): install the tooling (miniblue/azlocal, az CLI, Azurite, Bicep), set up a local lab, understand the Azure model (management groups → subscriptions → resource groups → resources, regions and zones), create a real RESOURCE GROUP and storage account LOCALLY (live control plane on miniblue), drop a blob on Azurite (data plane), and compile your first Bicep template. The base of the Azure certification path (AZ-900 → AZ-104 → AZ-305 → AZ-400 → AZ-500 → AZ-700)."
---

## intro

:::lang fr
Après AWS et GCP, voici **Microsoft Azure** — le cloud de l'entreprise par excellence, omniprésent là où Windows, Active Directory et Office 365 règnent. Comme pour les autres, on veut apprendre **sans compte, sans carte, sans facture**. Et là, bonne nouvelle : il existe **miniblue**, un **émulateur Azure local** dans l'esprit de LocalStack (un seul binaire, **~30 services émulés** : groupes de ressources, réseaux, Key Vault, stockage, Cosmos DB, Service Bus, Functions…). Couplé à **Azurite** (l'émulateur de **stockage officiel** de Microsoft) et à **Bicep**/**Terraform**, on obtient un **vrai labo local** où l'on **crée et pilote de vraies ressources Azure**.

Ce guide pose les fondations de **tout le parcours Azure**. Tu installes l'**outillage** (**miniblue** + son wrapper `azlocal`, la CLI `az`, **Azurite**, **Bicep**), tu montes le **labo local**, tu comprends le **modèle Azure** (la hiérarchie **groupes d'administration → abonnements → groupes de ressources → ressources**, les **régions** et **zones**), et tu crées tes premiers objets **pour de vrai, en local** : un **groupe de ressources** et un **compte de stockage** (le **plan de contrôle**, live sur miniblue), un **blob** (le **plan de données**, sur Azurite), et un **template Bicep** (l'infrastructure-as-code).

Ce guide ouvre une **série de certifications** : **AZ-900** (fondamentaux, ici), puis **AZ-104** (administrateur), **AZ-305** (architecte), **AZ-400** (DevOps), **AZ-500** (sécurité), **AZ-700** (réseau). Le labo que tu montes maintenant te resservira dans **tous** ces tracks — et grâce à miniblue, tu **exécuteras** vraiment les commandes, tu ne feras pas que les lire.

**Pour qui c'est :** tu débutes sur Azure (même en venant d'AWS/GCP) et tu veux une base **pratique**, montée à coût zéro.

**Quand ce n'est PAS le bon choix :**

- Tu cherches déjà l'administration avancée (VM, réseau, identité) → ce sera **AZ-104** et la suite ; commence ici pour le socle.
- Tu ne peux pas installer un binaire / Node.js → il en faut un minimum pour miniblue et Azurite.
:::

:::lang en
After AWS and GCP, here's **Microsoft Azure** — the enterprise cloud par excellence, everywhere Windows, Active Directory and Office 365 reign. As with the others, we want to learn **with no account, no card, no bill**. And here's the good news: there's **miniblue**, a **local Azure emulator** in the spirit of LocalStack (a single binary, **~30 emulated services**: resource groups, networks, Key Vault, storage, Cosmos DB, Service Bus, Functions…). Paired with **Azurite** (Microsoft's **official storage** emulator) and **Bicep**/**Terraform**, you get a **real local lab** where you **create and drive real Azure resources**.

This guide lays the foundations for **the whole Azure path**. You install the **tooling** (**miniblue** + its `azlocal` wrapper, the `az` CLI, **Azurite**, **Bicep**), set up the **local lab**, understand the **Azure model** (the **management groups → subscriptions → resource groups → resources** hierarchy, **regions** and **zones**), and create your first objects **for real, locally**: a **resource group** and a **storage account** (the **control plane**, live on miniblue), a **blob** (the **data plane**, on Azurite), and a **Bicep template** (infrastructure-as-code).

This guide opens a **series of certifications**: **AZ-900** (fundamentals, here), then **AZ-104** (administrator), **AZ-305** (architect), **AZ-400** (DevOps), **AZ-500** (security), **AZ-700** (networking). The lab you set up now will serve you in **all** these tracks — and thanks to miniblue, you truly **run** the commands, you don't just read them.

**Who it's for:** you're starting on Azure (even coming from AWS/GCP) and want a **practical** base, built at zero cost.

**When it's NOT the right choice:**

- You already want advanced administration (VMs, networking, identity) → that's **AZ-104** and beyond; start here for the base.
- You can't install a binary / Node.js → you need a minimum for miniblue and Azurite.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Distinguer les **modèles cloud** (IaaS/PaaS/SaaS) et de déploiement (public/privé/hybride).
- Installer l'**outillage** Azure : miniblue/`azlocal`, `az`, Azurite, Bicep.
- Monter un **labo local** (miniblue pour le plan de contrôle, Azurite pour le stockage).
- Expliquer la **hiérarchie** Azure : groupes d'administration → abonnements → groupes de ressources → ressources.
- Créer un **groupe de ressources** et un **compte de stockage** en local (miniblue, live).
- Déposer et lister un **blob** (Azurite, plan de données).
- Distinguer **plan de contrôle** (gérer les ressources) et **plan de données** (les utiliser).
- **Compiler** un premier template **Bicep** (validation hors-ligne).
:::

:::lang en
By the end of this guide, you can:

- Distinguish the **cloud models** (IaaS/PaaS/SaaS) and deployment ones (public/private/hybrid).
- Install the Azure **tooling**: miniblue/`azlocal`, `az`, Azurite, Bicep.
- Set up a **local lab** (miniblue for the control plane, Azurite for storage).
- Explain the Azure **hierarchy**: management groups → subscriptions → resource groups → resources.
- Create a **resource group** and a **storage account** locally (miniblue, live).
- Upload and list a **blob** (Azurite, data plane).
- Distinguish **control plane** (manage resources) and **data plane** (use them).
- **Compile** a first **Bicep** template (offline validation).
:::

## prerequisites

:::lang fr
- Un **terminal**, et de quoi lancer **miniblue** (binaire unique via Homebrew, **Docker**, ou compilé depuis les sources Go).
- **Node.js** (pour **Azurite**, installé via `npm`) — Node 18+ conseillé.
- La **CLI `az`** (script officiel, `apt`, ou `brew`) et le **CLI Bicep**.
- **Aucun compte Azure requis** : tout se fait en local (miniblue + Azurite + Bicep).
- Optionnel : **Terraform** (déploiement live contre miniblue, vu en AZ-104).
- ⚠️ **miniblue est un projet communautaire open-source (MIT), non affilié à Microsoft.** Il émule fidèlement le **plan de contrôle** (création/gestion de ressources) pour apprendre, mais reste un émulateur : certains comportements avancés sont simplifiés. On le signale quand ça compte.
:::

:::lang en
- A **terminal**, and a way to run **miniblue** (single binary via Homebrew, **Docker**, or compiled from the Go sources).
- **Node.js** (for **Azurite**, installed via `npm`) — Node 18+ recommended.
- The **`az` CLI** (official script, `apt`, or `brew`) and the **Bicep CLI**.
- **No Azure account required**: everything runs locally (miniblue + Azurite + Bicep).
- Optional: **Terraform** (live deployment against miniblue, seen in AZ-104).
- ⚠️ **miniblue is a community open-source project (MIT), not affiliated with Microsoft.** It faithfully emulates the **control plane** (resource create/manage) for learning, but it's an emulator: some advanced behaviors are simplified. We flag it where it matters.
:::

## concepts

:::lang fr
**Modèles cloud.** Trois niveaux de service : **IaaS** (Infrastructure — tu gères l'OS et au-dessus : machines virtuelles, réseau), **PaaS** (Platform — tu déposes ton code, la plateforme gère l'OS : App Service, Functions), **SaaS** (Software — tu consommes une appli finie : Microsoft 365). Et trois modèles de **déploiement** : **public** (Azure), **privé** (ton datacenter), **hybride** (les deux reliés — la spécialité d'Azure avec Azure Arc / Stack).

**Infrastructure mondiale.** Azure est découpé en **régions** (une zone géographique regroupant des datacenters, ex. `westeurope`, `francecentral`). La plupart des régions sont couplées en **paires de régions** (reprise après sinistre, réplication croisée). À l'intérieur d'une région, les **zones de disponibilité** sont des datacenters **physiquement séparés** — déployer sur plusieurs zones protège d'une panne locale. Choisir la bonne région (latence, souveraineté des données, coût, services disponibles) est un réflexe d'architecte.

**Hiérarchie des ressources.** Azure organise tout en **4 niveaux** : les **groupes d'administration** (regroupent des abonnements pour la gouvernance à grande échelle) → les **abonnements** (l'unité de facturation et de quota) → les **groupes de ressources** (un conteneur logique où vivent les ressources d'une même appli/cycle de vie) → les **ressources** (une VM, un compte de stockage, un réseau). On supprime un groupe de ressources et **tout** ce qu'il contient part avec — pratique pour nettoyer.

**Plan de contrôle vs plan de données.** Deux mondes à ne pas confondre. Le **plan de contrôle** (control plane) **gère les ressources** : créer un compte de stockage, un réseau, un Key Vault — ce sont des appels à **Azure Resource Manager (ARM)**. Le **plan de données** (data plane) **utilise** la ressource : téléverser un blob, lire un secret, envoyer un message. **miniblue** émule surtout le **plan de contrôle** (ARM) ; **Azurite** émule le **plan de données** du stockage. Ensemble, ils couvrent les deux.

**miniblue — l'émulateur Azure local.** miniblue est un **émulateur open-source** (façon LocalStack pour Azure) : un binaire, **~30 services** (groupes de ressources, réseaux virtuels, NSG, comptes de stockage, Key Vault, Cosmos DB, Service Bus, DNS, Functions, identités managées…), **sans compte ni authentification**. On le pilote avec **`azlocal`** (son wrapper, comme `awslocal` pour LocalStack) — et, très puissant, **Terraform** (provider `azurerm`) peut **déployer en réel contre lui** (vu en AZ-104). C'est ce qui rend Azure **exécutable en local**.

**Azurite — le stockage officiel.** Azurite est l'émulateur **officiel Microsoft** du **stockage** (Blob, Queue, Table). Il fournit le **plan de données** propre : on y téléverse/lit de vrais blobs avec `az storage` et une **chaîne de connexion** de développement bien connue (compte `devstoreaccount1`).

**Bicep & IaC.** **Bicep** est le langage **déclaratif** de Microsoft pour décrire l'infrastructure Azure (il se compile en **ARM** JSON). On **écrit** l'infra, on la **compile/valide** hors-ligne (`bicep build`), et on la **déploie** (avec un compte, ou **en local contre miniblue** via Terraform). Avec **Terraform**, c'est le pilier reproductible et versionné de l'administration Azure.

**Façons d'interagir.** Quatre : le **portail** web (explorer), la **CLI `az`** (scripter ; `azlocal` la double en local), **PowerShell** (module `Az`, roi côté Windows/AD), et l'**IaC** (Bicep/ARM natif, ou Terraform). En pro, on vit surtout en **`az`/PowerShell** et **Bicep/Terraform**.
:::

:::lang en
**Cloud models.** Three service levels: **IaaS** (Infrastructure — you manage the OS and up: virtual machines, networking), **PaaS** (Platform — you drop your code, the platform manages the OS: App Service, Functions), **SaaS** (Software — you consume a finished app: Microsoft 365). And three **deployment** models: **public** (Azure), **private** (your datacenter), **hybrid** (both linked — Azure's specialty with Azure Arc / Stack).

**Global infrastructure.** Azure is split into **regions** (a geographic area grouping datacenters, e.g. `westeurope`, `francecentral`). Most regions are coupled into **region pairs** (disaster recovery, cross-replication). Within a region, **availability zones** are **physically separate** datacenters — deploying across zones protects from a local outage. Choosing the right region (latency, data sovereignty, cost, available services) is an architect's reflex.

**Resource hierarchy.** Azure organizes everything in **4 levels**: **management groups** (group subscriptions for governance at scale) → **subscriptions** (the unit of billing and quota) → **resource groups** (a logical container where the resources of one app/lifecycle live) → **resources** (a VM, a storage account, a network). Delete a resource group and **everything** inside goes with it — handy for cleanup.

**Control plane vs data plane.** Two worlds not to confuse. The **control plane** **manages resources**: create a storage account, a network, a Key Vault — these are calls to **Azure Resource Manager (ARM)**. The **data plane** **uses** the resource: upload a blob, read a secret, send a message. **miniblue** emulates mostly the **control plane** (ARM); **Azurite** emulates the storage **data plane**. Together they cover both.

**miniblue — the local Azure emulator.** miniblue is an **open-source emulator** (LocalStack-style for Azure): one binary, **~30 services** (resource groups, virtual networks, NSGs, storage accounts, Key Vault, Cosmos DB, Service Bus, DNS, Functions, managed identities…), **no account or authentication**. You drive it with **`azlocal`** (its wrapper, like `awslocal` for LocalStack) — and, very powerfully, **Terraform** (`azurerm` provider) can **deploy for real against it** (seen in AZ-104). That's what makes Azure **runnable locally**.

**Azurite — the official storage.** Azurite is Microsoft's **official** emulator of **storage** (Blob, Queue, Table). It provides the clean **data plane**: you upload/read real blobs with `az storage` and a well-known development **connection string** (`devstoreaccount1` account).

**Bicep & IaC.** **Bicep** is Microsoft's **declarative** language to describe Azure infrastructure (it compiles to **ARM** JSON). You **write** the infra, **compile/validate** it offline (`bicep build`), and **deploy** it (with an account, or **locally against miniblue** via Terraform). With **Terraform**, it's the reproducible, versioned pillar of Azure administration.

**Ways to interact.** Four: the web **portal** (explore), the **`az` CLI** (script; `azlocal` doubles it locally), **PowerShell** (`Az` module, king on Windows/AD), and **IaC** (native Bicep/ARM, or Terraform). In the field, you mostly live in **`az`/PowerShell** and **Bicep/Terraform**.
:::

:::figure azure-lab-local
caption_fr: "Schéma 1. Le labo Azure local : ta machine → outillage (azlocal, az CLI, Bicep, Terraform) → miniblue (plan de CONTRÔLE : groupes de ressources, réseaux, comptes de stockage, Key Vault… ~30 services) + Azurite (plan de DONNÉES du stockage : Blob/Queue/Table). Terraform déploie en live contre miniblue. Les mêmes commandes et le même IaC qu'en réel, sans compte ni facture."
caption_en: "Figure 1. The local Azure lab: your machine → tooling (azlocal, az CLI, Bicep, Terraform) → miniblue (CONTROL plane: resource groups, networks, storage accounts, Key Vault… ~30 services) + Azurite (storage DATA plane: Blob/Queue/Table). Terraform deploys live against miniblue. The same commands and the same IaC as the real thing, no account or bill."
:::

## walkthrough

:::lang fr
On avance ainsi : installer l'outillage → monter le labo (miniblue + Azurite) → hiérarchie & groupe de ressources live → compte de stockage & blob → premier template Bicep → façons d'interagir → nettoyage. Chaque étape ajoute une brique **exécutée**.
:::

:::lang en
We'll go like this: install the tooling → set up the lab (miniblue + Azurite) → hierarchy & live resource group → storage account & blob → first Bicep template → ways to interact → cleanup. Each step adds an **executed** block.
:::

### step-01

:::lang fr
**Objectif.** Installer l'**outillage** Azure : miniblue/`azlocal`, `az`, Azurite, Bicep.

**🤔 Quatre outils, quatre rôles.** **miniblue** émule Azure en local (plan de contrôle) ; **`az`** est la CLI Azure ; **Azurite** émule le stockage (plan de données) ; **Bicep** décrit l'infrastructure. On les installe une fois.

Installe (Linux/macOS ; adapte à ton OS) :
:::

:::lang en
**Goal.** Install the Azure **tooling**: miniblue/`azlocal`, `az`, Azurite, Bicep.

**🤔 Four tools, four roles.** **miniblue** emulates Azure locally (control plane); **`az`** is the Azure CLI; **Azurite** emulates storage (data plane); **Bicep** describes infrastructure. We install them once.

Install (Linux/macOS; adapt to your OS):
:::

```bash
# 1) miniblue + azlocal (émulateur Azure) — Homebrew ou Docker
brew tap moabukar/tap && brew install miniblue
#   ou Docker : docker run -d -p 4566:4566 -p 4567:4567 moabukar/miniblue:latest
#   ou compilé depuis les sources : git clone https://github.com/moabukar/miniblue && cd miniblue
#      go build -o /usr/local/bin/miniblue ./cmd/miniblue && go build -o /usr/local/bin/azlocal ./cmd/azlocal

# 2) La CLI Azure / the Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash   # (macOS : brew install azure-cli)

# 3) Azurite, l'émulateur de stockage / the storage emulator
npm install -g azurite

# 4) Bicep / Bicep
az bicep install

# Vérifier / verify
azlocal health         # miniblue : liste des services émulés / list of emulated services
az version ; azurite --version ; az bicep version
```

:::lang fr
**✅ Vérification :** `azlocal health` renvoie un JSON avec `"service_count"` (une trentaine) et la liste des services (`subscriptions`, `resourceGroups`, `storage`, `keyVault`, `network`…). `az version` affiche `azure-cli` (2.x). `azurite --version` et `az bicep version` répondent. Tu as les quatre outils — **et toujours aucun compte Azure**. ⚠️ `azlocal health` **échoue** si miniblue ne tourne pas encore : on le démarre à l'étape suivante. Si `az bicep install` est indisponible, installe le **CLI Bicep autonome** (binaire des releases GitHub `Azure/bicep`).
:::

:::lang en
**✅ Check:** `azlocal health` returns JSON with `"service_count"` (about thirty) and the list of services (`subscriptions`, `resourceGroups`, `storage`, `keyVault`, `network`…). `az version` shows `azure-cli` (2.x). `azurite --version` and `az bicep version` answer. You have all four tools — **and still no Azure account**. ⚠️ `azlocal health` **fails** if miniblue isn't running yet: we start it next. If `az bicep install` is unavailable, install the **standalone Bicep CLI** (binary from the `Azure/bicep` GitHub releases).
:::

### step-02

:::lang fr
**Objectif.** Monter le **labo local** : lancer miniblue (plan de contrôle) et Azurite (stockage).

**🤔 Deux émulateurs complémentaires.** **miniblue** écoute sur **4566** (HTTP) / **4567** (HTTPS) et sert l'API **ARM** (créer/gérer des ressources). **Azurite** écoute sur **10000/10001/10002** (Blob/Queue/Table) et sert le **plan de données** du stockage, via une **chaîne de connexion** de développement bien connue.

Lance les deux (chacun dans son terminal, ou en arrière-plan) :
:::

:::lang en
**Goal.** Set up the **local lab**: start miniblue (control plane) and Azurite (storage).

**🤔 Two complementary emulators.** **miniblue** listens on **4566** (HTTP) / **4567** (HTTPS) and serves the **ARM** API (create/manage resources). **Azurite** listens on **10000/10001/10002** (Blob/Queue/Table) and serves the storage **data plane**, via a well-known development **connection string**.

Start both (each in its terminal, or in the background):
:::

```bash
# 1) miniblue (plan de contrôle Azure) / the Azure control plane
miniblue                       # écoute sur :4566 (HTTP) et :4567 (HTTPS)
#   (Docker : déjà lancé par 'docker run' à l'étape 1)

# 2) Azurite (plan de données stockage) / storage data plane
mkdir -p ~/azurite-data
azurite --silent --location ~/azurite-data \
  --blobHost 127.0.0.1 --queueHost 127.0.0.1 --tableHost 127.0.0.1

# 3) Dans ton terminal de travail, la chaîne de connexion Azurite (bien connue, publique) :
export AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;"
```

:::lang fr
**✅ Vérification :** miniblue affiche `miniblue HTTP on http://localhost:4566` (et HTTPS sur 4567), et `azlocal health` renvoie désormais la liste des ~30 services. Azurite affiche `Azurite Blob service successfully listens on http://127.0.0.1:10000`. Une vérif directe : `curl -s http://localhost:4566/` répond (souvent 404 sur la racine — l'important est qu'il **réponde**). ⚠️ **Garde ces terminaux ouverts** (les émulateurs y tournent). La **chaîne de connexion** Azurite est publique et identique pour tous : c'est le compte de développement de l'émulateur, **jamais** un vrai secret. Astuce : mets l'`export` dans un `lab.env` et fais `source lab.env` à chaque session.
:::

:::lang en
**✅ Check:** miniblue prints `miniblue HTTP on http://localhost:4566` (and HTTPS on 4567), and `azlocal health` now returns the list of ~30 services. Azurite prints `Azurite Blob service successfully listens on http://127.0.0.1:10000`. A direct check: `curl -s http://localhost:4566/` responds (often 404 on the root — the point is that it **answers**). ⚠️ **Keep these terminals open** (the emulators run in them). The Azurite **connection string** is public and identical for everyone: it's the emulator's development account, **never** a real secret. Tip: put the `export` in a `lab.env` and `source lab.env` each session.
:::

### step-03

:::lang fr
**Objectif.** Créer un vrai **groupe de ressources** — le plan de contrôle, live sur miniblue.

**🤔 Le conteneur de tout.** Tout objet Azure vit dans un **groupe de ressources** (lui-même dans un abonnement, dans un groupe d'administration). Le groupe de ressources est le plus quotidien : on le **crée, remplit, puis supprime en bloc**. Avec miniblue, on le crée **pour de vrai** — le plan de contrôle (ARM) est émulé.

Crée et inspecte un groupe de ressources :
:::

:::lang en
**Goal.** Create a real **resource group** — the control plane, live on miniblue.

**🤔 The container of everything.** Every Azure object lives in a **resource group** (itself in a subscription, in a management group). The resource group is the most everyday one: you **create, fill, then delete it wholesale**. With miniblue, you create it **for real** — the control plane (ARM) is emulated.

Create and inspect a resource group:
:::

```bash
# Créer un groupe de ressources / create a resource group
azlocal group create --name rg-labo --location westeurope

# Le lister et l'inspecter / list and inspect it
azlocal group list
azlocal group show --name rg-labo
```

:::lang fr
**✅ Vérification :** `group create` renvoie un objet ARM avec `"provisioningState": "Succeeded"` et un `id` de la forme `/subscriptions/00000000-.../resourceGroups/rg-labo`. `group list` le montre sous `"value"`, et `group show` renvoie ses détails (`Succeeded`). Tu viens de créer une **vraie ressource Azure en local** — le plan de contrôle **fonctionne**, pas seulement en concept. Retiens la hiérarchie : **groupe d'administration → abonnement → groupe de ressources → ressource**. ⚠️ En réel (avec un compte), c'est **exactement** `az group create --name ... --location ...` ; ici, `azlocal` cible miniblue au lieu du vrai Azure — la logique est identique.
:::

:::lang en
**✅ Check:** `group create` returns an ARM object with `"provisioningState": "Succeeded"` and an `id` of the form `/subscriptions/00000000-.../resourceGroups/rg-labo`. `group list` shows it under `"value"`, and `group show` returns its details (`Succeeded`). You just created a **real Azure resource locally** — the control plane **works**, not just in concept. Remember the hierarchy: **management group → subscription → resource group → resource**. ⚠️ For real (with an account), it's **exactly** `az group create --name ... --location ...`; here, `azlocal` targets miniblue instead of real Azure — the logic is identical.
:::

### step-04

:::lang fr
**Objectif.** Créer un **compte de stockage** (plan de contrôle, miniblue) et y déposer un **blob** (plan de données, Azurite).

**🤔 Les deux plans, côte à côte.** Créer le **compte de stockage** est une opération de **plan de contrôle** (ARM) → miniblue. Téléverser un **blob** dedans est une opération de **plan de données** → on utilise **Azurite** (l'émulateur de stockage officiel, plan de données propre) avec `az storage`. Tu vois ainsi **les deux mondes** en action.

Crée le compte (miniblue), puis manipule des blobs (Azurite) :
:::

:::lang en
**Goal.** Create a **storage account** (control plane, miniblue) and drop a **blob** in it (data plane, Azurite).

**🤔 The two planes, side by side.** Creating the **storage account** is a **control-plane** operation (ARM) → miniblue. Uploading a **blob** into it is a **data-plane** operation → we use **Azurite** (the official storage emulator, clean data plane) with `az storage`. You thus see **both worlds** in action.

Create the account (miniblue), then handle blobs (Azurite):
:::

```bash
# PLAN DE CONTRÔLE — créer un compte de stockage dans le groupe (miniblue)
# CONTROL PLANE — create a storage account in the group (miniblue)
azlocal storage account create --name stlabo2026 --resource-group rg-labo

# PLAN DE DONNÉES — créer un conteneur et un blob (Azurite, via la chaîne de connexion)
# DATA PLANE — create a container and a blob (Azurite, via the connection string)
az storage container create --name documents --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
echo "rapport trimestriel" > rapport.txt
az storage blob upload --container-name documents --name rapports/2026/q1.txt \
  --file rapport.txt --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
az storage blob list --container-name documents \
  --connection-string "$AZURE_STORAGE_CONNECTION_STRING" --output table
```

:::lang fr
**✅ Vérification :** `storage account create` (miniblue) renvoie un objet ARM (`"kind": "StorageV2"`, un `id` sous `rg-labo`). Côté Azurite : `container create` renvoie `"created": true`, l'`upload` réussit, et `blob list` affiche `rapports/2026/q1.txt`. Tu as manipulé **les deux plans** : le **compte** (contrôle, miniblue) et le **blob** (données, Azurite). Note le modèle **plat** : `rapports/2026/q1.txt` est **une seule clé** (le `/` est une convention), pas une arborescence. ⚠️ Erreur de **version d'API** Azurite (`The API version ... is not supported`) ? Lance Azurite avec `--skipApiVersionCheck` ou mets-le à jour (`npm install -g azurite@latest`).
:::

:::lang en
**✅ Check:** `storage account create` (miniblue) returns an ARM object (`"kind": "StorageV2"`, an `id` under `rg-labo`). On the Azurite side: `container create` returns `"created": true`, the `upload` succeeds, and `blob list` shows `rapports/2026/q1.txt`. You handled **both planes**: the **account** (control, miniblue) and the **blob** (data, Azurite). Note the **flat** model: `rapports/2026/q1.txt` is **a single key** (the `/` is a convention), not a tree. ⚠️ Azurite **API version** error (`The API version ... is not supported`)? Start Azurite with `--skipApiVersionCheck` or update it (`npm install -g azurite@latest`).
:::

### step-05

:::lang fr
**Objectif.** Écrire et **compiler** ton premier template **Bicep** — l'infrastructure-as-code.

**🤔 Décrire plutôt que cliquer.** Au lieu de créer une ressource à la main, on la **décrit** en Bicep. `bicep build` **compile** le template en ARM JSON et **valide sa forme** — hors-ligne. C'est ta première brique d'IaC Azure ; en AZ-104, tu la **déploieras en live** contre miniblue avec Terraform.

Crée `stockage.bicep` puis compile-le :
:::

:::lang en
**Goal.** Write and **compile** your first **Bicep** template — infrastructure-as-code.

**🤔 Describe rather than click.** Instead of creating a resource by hand, you **describe** it in Bicep. `bicep build` **compiles** the template to ARM JSON and **validates its shape** — offline. It's your first Azure IaC block; in AZ-104, you'll **deploy it live** against miniblue with Terraform.

Create `stockage.bicep` then compile it:
:::

```bicep
// stockage.bicep — un compte de stockage décrit en Bicep
@description('Région des ressources / resources region')
param location string = resourceGroup().location

@description('Nom du compte de stockage (mondialement unique) / storage account name (globally unique)')
param storageName string = 'st${uniqueString(resourceGroup().id)}'

resource compteStockage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    supportsHttpsTrafficOnly: true
  }
}

output compteId string = compteStockage.id
output compteNom string = compteStockage.name
```

```bash
# Compiler/valider le template (hors-ligne, sans compte) / compile-validate (offline)
bicep build stockage.bicep --stdout | head -n 20
# (ou : az bicep build --file stockage.bicep --stdout)
```

:::lang fr
**✅ Vérification :** `bicep build` affiche l'**ARM JSON** compilé (`"$schema"`, `"resources"`, tes `parameters` et `outputs`) et **aucune erreur** — signe que ton template est **valide** contre le schéma `Microsoft.Storage/storageAccounts`. Tu viens d'écrire de la **vraie infrastructure Azure**, versionnable, **sans compte**. Note la sécurité par défaut : `minimumTlsVersion: 'TLS1_2'`, `allowBlobPublicAccess: false`. ⚠️ `bicep build` **valide la forme** ; le **déploiement** (`az deployment`, ou Terraform contre miniblue) viendra en AZ-104 — et grâce à miniblue, **en local**.
:::

:::lang en
**✅ Check:** `bicep build` prints the compiled **ARM JSON** (`"$schema"`, `"resources"`, your `parameters` and `outputs`) and **no error** — proof your template is **valid** against the `Microsoft.Storage/storageAccounts` schema. You just wrote **real Azure infrastructure**, versionable, **with no account**. Note secure-by-default: `minimumTlsVersion: 'TLS1_2'`, `allowBlobPublicAccess: false`. ⚠️ `bicep build` **validates the shape**; **deployment** (`az deployment`, or Terraform against miniblue) comes in AZ-104 — and thanks to miniblue, **locally**.
:::

### step-06

:::lang fr
**Objectif.** Ancrer les **façons d'interagir** avec Azure et les **essentiels `az`/`azlocal`**.

**🤔 Choisir le bon outil.** Azure se pilote de quatre façons : le **portail** web (explorer), la **CLI `az`** (scripter, reproduire ; `azlocal` la double en local), **PowerShell** (module `Az`, roi côté Windows/AD), et l'**IaC** (Bicep/ARM natif, ou Terraform — qui déploie **en live** contre miniblue). En pro, on vit surtout en **`az`/PowerShell** et **Bicep/Terraform**.

Explore les essentiels (formats de sortie & aide) :
:::

:::lang en
**Goal.** Anchor the **ways to interact** with Azure and the **`az`/`azlocal` essentials**.

**🤔 Pick the right tool.** Azure is driven four ways: the web **portal** (explore), the **`az` CLI** (script, reproduce; `azlocal` doubles it locally), **PowerShell** (`Az` module, king on Windows/AD), and **IaC** (native Bicep/ARM, or Terraform — which deploys **live** against miniblue). In the field, you mostly live in **`az`/PowerShell** and **Bicep/Terraform**.

Explore the essentials (output formats & help):
:::

```bash
# Aide & découverte / help & discovery
azlocal --help                      # les services couverts par miniblue / services miniblue covers
az storage --help | head -n 15      # les sous-commandes de storage / storage subcommands

# Formats de sortie (utiles partout) / output formats (useful everywhere)
az storage container list --connection-string "$AZURE_STORAGE_CONNECTION_STRING" --output table
az storage container list --connection-string "$AZURE_STORAGE_CONNECTION_STRING" --query "[].name" --output tsv
```

:::lang fr
**✅ Vérification :** `azlocal --help` liste les commandes par service (`group`, `storage`, `network`, `keyvault`, `cosmosdb`, `servicebus`, `vm`, `identity`…) — un aperçu de tout ce que tu **exécuteras en local** dans les prochains tracks. `az storage --help` liste les sous-commandes ; `--output table` et `--query "[].name"` (Azure utilise **JMESPath**, comme AWS) filtrent la sortie. Retiens les **4 façons** : portail, `az` (CLI), PowerShell, IaC. Ce parcours te fait vivre surtout **`az`/`azlocal`** et **Bicep/Terraform** — les compétences qui traversent **toutes** les certifications Azure.
:::

:::lang en
**✅ Check:** `azlocal --help` lists commands by service (`group`, `storage`, `network`, `keyvault`, `cosmosdb`, `servicebus`, `vm`, `identity`…) — a preview of everything you'll **run locally** in the next tracks. `az storage --help` lists the subcommands; `--output table` and `--query "[].name"` (Azure uses **JMESPath**, like AWS) filter the output. Remember the **4 ways**: portal, `az` (CLI), PowerShell, IaC. This path has you live mostly in **`az`/`azlocal`** and **Bicep/Terraform** — the skills that run through **all** the Azure certifications.
:::

### step-07

:::lang fr
**Objectif.** Ranger ton labo.

**🤔 L'hygiène.** On supprime le groupe de ressources (et tout ce qu'il contient sur miniblue), le conteneur Azurite, puis on remet miniblue à zéro. Réflexe **créer → utiliser → nettoyer**, même en local.

Nettoie :
:::

:::lang en
**Goal.** Tidy up your lab.

**🤔 Hygiene.** We delete the resource group (and everything it holds on miniblue), the Azurite container, then reset miniblue. **Create → use → clean up** reflex, even locally.

Clean up:
:::

```bash
# Plan de contrôle : supprimer le groupe (et ses ressources) sur miniblue
# Control plane: delete the group (and its resources) on miniblue
azlocal group delete --name rg-labo

# Plan de données : supprimer le conteneur Azurite / delete the Azurite container
az storage container delete --name documents --connection-string "$AZURE_STORAGE_CONNECTION_STRING"

# Remettre miniblue à zéro (optionnel) / reset miniblue (optional)
azlocal reset
# Arrêter les émulateurs : Ctrl-C dans leurs terminaux / stop the emulators: Ctrl-C in their terminals
```

:::lang fr
**✅ Vérification :** `group delete` renvoie `Deleted` et `azlocal group list` ne montre plus `rg-labo`. `container delete` renvoie `"deleted": true`. `azlocal reset` renvoie `"status": "reset"` (tout l'état miniblue effacé). Ton labo est rangé. Tu tiens maintenant le **socle Azure** : outillage installé, plan de contrôle live sur miniblue, stockage live sur Azurite, premier Bicep compilé, et le **modèle** (hiérarchie, régions, plans de contrôle/données) en tête. La suite : **AZ-104 (administrateur)** — identités, réseau, VM, gouvernance — où tu **déploieras en live** avec Terraform contre miniblue.
:::

:::lang en
**✅ Check:** `group delete` returns `Deleted` and `azlocal group list` no longer shows `rg-labo`. `container delete` returns `"deleted": true`. `azlocal reset` returns `"status": "reset"` (all miniblue state cleared). Your lab is tidy. You now hold the **Azure base**: tooling installed, live control plane on miniblue, live storage on Azurite, first Bicep compiled, and the **model** (hierarchy, regions, control/data planes) in mind. Next: **AZ-104 (administrator)** — identities, networking, VMs, governance — where you'll **deploy live** with Terraform against miniblue.
:::

## pitfalls

:::lang fr
**1. Confondre plan de contrôle et plan de données.** Créer un compte de stockage = **contrôle** (ARM → miniblue). Téléverser un blob = **données** (→ Azurite). Deux endpoints, deux rôles.

**2. Croire que miniblue est officiel.** C'est un projet **communautaire** (MIT), non affilié à Microsoft. Excellent pour apprendre le plan de contrôle et l'IaC, mais reste un **émulateur** : certains comportements avancés sont simplifiés.

**3. Prendre la chaîne de connexion de dev pour un secret.** Elle est **publique** (compte `devstoreaccount1`). Ne l'utilise **jamais** pour un vrai compte de stockage.

**4. Oublier de lancer un émulateur.** `azlocal ...` échoue si miniblue ne tourne pas (4566) ; `az storage ...` échoue si Azurite ne tourne pas (10000). Vérifie les deux.

**5. Erreur de version d'API Azurite.** Si ta CLI est plus récente qu'Azurite : `API version not supported`. Mets Azurite à jour ou lance-le avec `--skipApiVersionCheck`.

**6. Croire que le nom d'un compte de stockage est libre.** Il est **mondialement unique** (comme S3/GCS). En Bicep, `uniqueString(resourceGroup().id)` génère un suffixe stable.

**7. Confondre région et zone.** Une **région** = une aire géographique de datacenters ; une **zone de disponibilité** = un datacenter isolé dans une région. La haute dispo se joue **entre zones**.
:::

:::lang en
**1. Confusing control plane and data plane.** Creating a storage account = **control** (ARM → miniblue). Uploading a blob = **data** (→ Azurite). Two endpoints, two roles.

**2. Thinking miniblue is official.** It's a **community** project (MIT), not affiliated with Microsoft. Excellent for learning the control plane and IaC, but still an **emulator**: some advanced behaviors are simplified.

**3. Taking the dev connection string for a secret.** It's **public** (`devstoreaccount1` account). **Never** use it for a real storage account.

**4. Forgetting to start an emulator.** `azlocal ...` fails if miniblue isn't running (4566); `az storage ...` fails if Azurite isn't running (10000). Check both.

**5. Azurite API version error.** If your CLI is newer than Azurite: `API version not supported`. Update Azurite or start it with `--skipApiVersionCheck`.

**6. Thinking a storage account name is free.** It's **globally unique** (like S3/GCS). In Bicep, `uniqueString(resourceGroup().id)` generates a stable suffix.

**7. Confusing region and zone.** A **region** = a geographic area of datacenters; an **availability zone** = an isolated datacenter within a region. High availability plays out **across zones**.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] `azlocal health`, `az version`, `azurite --version`, `az bicep version` répondent.
- [ ] miniblue tourne (4566) et Azurite tourne (10000).
- [ ] Tu crées un **groupe de ressources** live (`azlocal group create`) et le vois dans `group list`.
- [ ] Tu crées un **compte de stockage** (miniblue) et téléverses un **blob** (Azurite).
- [ ] Tu distingues **plan de contrôle** et **plan de données**.
- [ ] Tu **compiles** un template Bicep sans erreur (`bicep build`).
- [ ] Tu récites la hiérarchie et distingues **région** / **zone**.

Sept cases = ton socle Azure est monté. La suite : **AZ-104 (administrateur)**.
:::

:::lang en
You know it works when…

- [ ] `azlocal health`, `az version`, `azurite --version`, `az bicep version` all answer.
- [ ] miniblue runs (4566) and Azurite runs (10000).
- [ ] You create a **resource group** live (`azlocal group create`) and see it in `group list`.
- [ ] You create a **storage account** (miniblue) and upload a **blob** (Azurite).
- [ ] You distinguish **control plane** and **data plane**.
- [ ] You **compile** a Bicep template with no error (`bicep build`).
- [ ] You recite the hierarchy and distinguish **region** / **zone**.

Seven boxes = your Azure base is set. Next up: **AZ-104 (administrator)**.
:::

## next

:::lang fr
Le parcours Azure continue :

1. **AZ-104 — administrateur Azure** : identités (Entra ID), gouvernance (RBAC, policies, tags), stockage, réseau (VNet, NSG), machines virtuelles — **déployés en live** contre miniblue avec Terraform, + Bicep validé.
2. Plus loin : **AZ-305** (architecte), **AZ-400** (DevOps), **AZ-500** (sécurité), **AZ-700** (réseau). Le labo (miniblue + Azurite) monté ici te resservira partout.
:::

:::lang en
The Azure path continues:

1. **AZ-104 — Azure administrator**: identities (Entra ID), governance (RBAC, policies, tags), storage, networking (VNet, NSG), virtual machines — **deployed live** against miniblue with Terraform, + validated Bicep.
2. Further along: **AZ-305** (architect), **AZ-400** (DevOps), **AZ-500** (security), **AZ-700** (networking). The lab (miniblue + Azurite) set up here will serve you everywhere.
:::

## cheatsheet

:::lang fr
Aide-mémoire du labo Azure local.
:::

:::lang en
Local Azure lab cheat sheet.
:::

```bash
# Outillage / tooling
azlocal health ; az version ; azurite --version ; az bicep version

# Labo : démarrer les émulateurs / lab: start the emulators
miniblue &                                        # plan de contrôle (4566/4567)
azurite --silent --location ~/azurite-data --blobHost 127.0.0.1 --queueHost 127.0.0.1 --tableHost 127.0.0.1 &
export AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"

# Plan de contrôle (miniblue) / control plane
azlocal group create --name rg-labo --location westeurope
azlocal group list ; azlocal group show --name rg-labo
azlocal storage account create --name stlabo2026 --resource-group rg-labo
azlocal group delete --name rg-labo ; azlocal reset

# Plan de données stockage (Azurite) / storage data plane
az storage container create --name documents --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
az storage blob upload --container-name documents --name cle --file f.txt --connection-string "$AZURE_STORAGE_CONNECTION_STRING"

# IaC (hors-ligne) / IaC (offline)
bicep build stockage.bicep --stdout        # compile -> ARM JSON, valide la forme

# Hiérarchie : groupe d'administration -> abonnement -> groupe de ressources -> ressource
```

## resources

:::lang fr
- [miniblue — émulateur Azure local](https://github.com/moabukar/miniblue) — ~30 services, `azlocal`, Terraform.
- [Azurite — l'émulateur de stockage](https://learn.microsoft.com/azure/storage/common/storage-use-azurite) — Blob/Queue/Table en local.
- [Bicep — documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/) — le langage IaC d'Azure.
- [Installer la CLI Azure](https://learn.microsoft.com/cli/azure/install-azure-cli) — `az` sur tous les OS.
- [Groupes de ressources & abonnements](https://learn.microsoft.com/azure/azure-resource-manager/management/overview) — la hiérarchie.
- [Régions et zones de disponibilité](https://learn.microsoft.com/azure/reliability/availability-zones-overview) — l'infrastructure mondiale.
:::

:::lang en
- [miniblue — local Azure emulator](https://github.com/moabukar/miniblue) — ~30 services, `azlocal`, Terraform.
- [Azurite — the storage emulator](https://learn.microsoft.com/azure/storage/common/storage-use-azurite) — Blob/Queue/Table locally.
- [Bicep — documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/) — Azure's IaC language.
- [Install the Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) — `az` on all OSes.
- [Resource groups & subscriptions](https://learn.microsoft.com/azure/azure-resource-manager/management/overview) — the hierarchy.
- [Regions and availability zones](https://learn.microsoft.com/azure/reliability/availability-zones-overview) — the global infrastructure.
:::

## troubleshooting

:::lang fr
**`azlocal` : connexion refusée.** miniblue ne tourne pas (`localhost:4566`). Lance `miniblue` (ou le conteneur Docker), puis réessaie `azlocal health`.

**`az` : commande introuvable.** L'installation n'a pas abouti / le PATH n'est pas rafraîchi. Réinstalle (script officiel Linux, `brew` macOS), rouvre le terminal.

**`az storage` : erreur de connexion.** Azurite ne tourne pas, ou la chaîne de connexion n'est pas exportée dans **ce** shell. Relance Azurite, ré-exporte `AZURE_STORAGE_CONNECTION_STRING`.

**`The API version ... is not supported by Azurite`.** Ta CLI/ton SDK est plus récent qu'Azurite. Mets Azurite à jour (`npm install -g azurite@latest`) ou lance-le avec `--skipApiVersionCheck`.

**`azlocal storage blob` renvoie `AuthenticationFailed`.** Le **plan de données** de miniblue est plus strict ; pour les blobs, on utilise **Azurite** (comme dans ce guide). Réserve miniblue au **plan de contrôle** (comptes, groupes, réseaux…).

**`bicep build` : erreur de schéma.** Une propriété/valeur ne correspond pas au type de ressource. Le message pointe la ligne ; corrige selon la doc (`Microsoft.Storage/storageAccounts`).

**Port déjà utilisé (4566 ou 10000).** Un autre service occupe le port. Arrête-le, ou change le port (miniblue : variable `PORT` ; Azurite : `--blobPort`) et adapte.
:::

:::lang en
**`azlocal`: connection refused.** miniblue isn't running (`localhost:4566`). Start `miniblue` (or the Docker container), then retry `azlocal health`.

**`az`: command not found.** The install didn't complete / PATH isn't refreshed. Reinstall (official Linux script, `brew` macOS), reopen the terminal.

**`az storage`: connection error.** Azurite isn't running, or the connection string isn't exported in **this** shell. Restart Azurite, re-export `AZURE_STORAGE_CONNECTION_STRING`.

**`The API version ... is not supported by Azurite`.** Your CLI/SDK is newer than Azurite. Update Azurite (`npm install -g azurite@latest`) or start it with `--skipApiVersionCheck`.

**`azlocal storage blob` returns `AuthenticationFailed`.** miniblue's **data plane** is stricter; for blobs, we use **Azurite** (as in this guide). Keep miniblue for the **control plane** (accounts, groups, networks…).

**`bicep build`: schema error.** A property/value doesn't match the resource type. The message points to the line; fix per the docs (`Microsoft.Storage/storageAccounts`).

**Port already in use (4566 or 10000).** Another service holds the port. Stop it, or change the port (miniblue: `PORT` env var; Azurite: `--blobPort`) and adjust.
:::
