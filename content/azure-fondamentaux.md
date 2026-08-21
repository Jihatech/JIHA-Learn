---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-fondamentaux
slug: azure-fondamentaux
order: 58
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — fondamentaux : le labo local et le modèle Azure"
title_en: "Azure — fundamentals: the local lab and the Azure model"
tagline_fr: "az CLI, Azurite, Bicep, hiérarchie des ressources, régions."
tagline_en: "az CLI, Azurite, Bicep, resource hierarchy, regions."

# — Métadonnées pédagogiques —
level: beginner
duration_min: 200
repo: "Azure/Azurite"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: []
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [modeles-cloud, azure-cli, azurite, bicep, hierarchie-ressources, regions-zones, groupes-de-ressources, iac]
concepts_en: [cloud-models, azure-cli, azurite, bicep, resource-hierarchy, regions-zones, resource-groups, iac]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Démarre Microsoft Azure sans compte ni facture : installe l'outillage (az CLI, Azurite l'émulateur de stockage officiel, Bicep), monte un labo local, comprends le modèle Azure (groupes d'administration → abonnements → groupes de ressources → ressources, régions et zones), crée ton premier conteneur Blob EN LOCAL sur Azurite, et compile ton premier template Bicep (validation hors-ligne). La base du parcours de certifications Azure (AZ-900 → AZ-104 → AZ-305 → AZ-400 → AZ-500 → AZ-700)."
og_description_en: "Start Microsoft Azure with no account or bill: install the tooling (az CLI, Azurite the official storage emulator, Bicep), set up a local lab, understand the Azure model (management groups → subscriptions → resource groups → resources, regions and zones), create your first Blob container LOCALLY on Azurite, and compile your first Bicep template (offline validation). The base of the Azure certification path (AZ-900 → AZ-104 → AZ-305 → AZ-400 → AZ-500 → AZ-700)."
---

## intro

:::lang fr
Après AWS et GCP, voici **Microsoft Azure** — le cloud de l'entreprise par excellence, omniprésent là où Windows, Active Directory et Office 365 règnent. Comme pour les autres, on veut apprendre **sans compte, sans carte, sans facture**. Azure n'a pas d'émulateur unique aussi complet que LocalStack, mais Microsoft fournit **Azurite**, l'émulateur **officiel** de son stockage (Blob, Queue, Table), et surtout **Bicep** et **Terraform** permettent d'**écrire et valider** de vraies infrastructures Azure **hors-ligne**. On assemble ces briques pour un **vrai labo local**.

Ce guide pose les fondations de **tout le parcours Azure**. Tu installes l'**outillage** (`az` la CLI, **Azurite** l'émulateur de stockage, **Bicep** pour l'infrastructure-as-code), tu montes le **labo local**, tu comprends le **modèle Azure** (la hiérarchie **groupes d'administration → abonnements → groupes de ressources → ressources**, les **régions** et **zones**), et tu crées tes deux premiers objets — un **conteneur Blob** (en local, live sur Azurite) et un **template Bicep** (compilé et validé hors-ligne). Tu repars avec le modèle mental des **façons d'interagir** avec Azure (portail, `az`, PowerShell, Bicep/ARM, Terraform).

Ce guide ouvre une **série de certifications** : **AZ-900** (fondamentaux, ici), puis **AZ-104** (administrateur), **AZ-305** (architecte), **AZ-400** (DevOps), **AZ-500** (sécurité), **AZ-700** (réseau). Le labo que tu montes maintenant te resservira dans **tous** ces tracks.

**Pour qui c'est :** tu débutes sur Azure (même en venant d'AWS/GCP) et tu veux une base **pratique**, montée à coût zéro.

**Quand ce n'est PAS le bon choix :**

- Tu cherches déjà l'administration avancée (VM, réseau, identité) → ce sera **AZ-104** et la suite ; commence ici pour le socle.
- Tu ne peux pas installer Node.js / un terminal → il en faut un minimum pour Azurite et `az`.
:::

:::lang en
After AWS and GCP, here's **Microsoft Azure** — the enterprise cloud par excellence, everywhere Windows, Active Directory and Office 365 reign. As with the others, we want to learn **with no account, no card, no bill**. Azure has no single emulator as complete as LocalStack, but Microsoft provides **Azurite**, the **official** emulator of its storage (Blob, Queue, Table), and above all **Bicep** and **Terraform** let you **write and validate** real Azure infrastructure **offline**. We assemble these blocks into a **real local lab**.

This guide lays the foundations for **the whole Azure path**. You install the **tooling** (`az` the CLI, **Azurite** the storage emulator, **Bicep** for infrastructure-as-code), set up the **local lab**, understand the **Azure model** (the **management groups → subscriptions → resource groups → resources** hierarchy, **regions** and **zones**), and create your first two objects — a **Blob container** (locally, live on Azurite) and a **Bicep template** (compiled and validated offline). You leave with the mental model of the **ways to interact** with Azure (portal, `az`, PowerShell, Bicep/ARM, Terraform).

This guide opens a **series of certifications**: **AZ-900** (fundamentals, here), then **AZ-104** (administrator), **AZ-305** (architect), **AZ-400** (DevOps), **AZ-500** (security), **AZ-700** (networking). The lab you set up now will serve you in **all** these tracks.

**Who it's for:** you're starting on Azure (even coming from AWS/GCP) and want a **practical** base, built at zero cost.

**When it's NOT the right choice:**

- You already want advanced administration (VMs, networking, identity) → that's **AZ-104** and beyond; start here for the base.
- You can't install Node.js / a terminal → you need a minimum for Azurite and `az`.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Distinguer les **modèles cloud** (IaaS/PaaS/SaaS) et de déploiement (public/privé/hybride).
- Installer l'**outillage** Azure : `az`, Azurite, Bicep.
- Monter un **labo local** (Azurite pour le stockage, sans compte).
- Expliquer la **hiérarchie** Azure : groupes d'administration → abonnements → groupes de ressources → ressources.
- Situer **régions**, **paires de régions** et **zones de disponibilité**.
- Créer un **conteneur Blob** et y déposer un objet (émulateur, live).
- **Compiler** un premier template **Bicep** (validation hors-ligne).
- Citer les **façons d'interagir** avec Azure (portail, `az`, PowerShell, IaC).
:::

:::lang en
By the end of this guide, you can:

- Distinguish the **cloud models** (IaaS/PaaS/SaaS) and deployment ones (public/private/hybrid).
- Install the Azure **tooling**: `az`, Azurite, Bicep.
- Set up a **local lab** (Azurite for storage, no account).
- Explain the Azure **hierarchy**: management groups → subscriptions → resource groups → resources.
- Locate **regions**, **region pairs** and **availability zones**.
- Create a **Blob container** and drop an object in it (emulator, live).
- **Compile** a first **Bicep** template (offline validation).
- Name the **ways to interact** with Azure (portal, `az`, PowerShell, IaC).
:::

## prerequisites

:::lang fr
- Un **terminal** et **Node.js** (pour Azurite, installé via `npm`) — Node 18+ conseillé.
- De quoi installer la **CLI `az`** (script officiel, `apt`, ou `pip`) et le **CLI Bicep**.
- **Aucun compte Azure requis** : tout se fait en local (Azurite + Bicep hors-ligne).
- Optionnel : **Docker** (Azurite existe aussi en image conteneur) et **Terraform** (alternative à Bicep, vue plus tard).
:::

:::lang en
- A **terminal** and **Node.js** (for Azurite, installed via `npm`) — Node 18+ recommended.
- A way to install the **`az` CLI** (official script, `apt`, or `pip`) and the **Bicep CLI**.
- **No Azure account required**: everything runs locally (Azurite + Bicep offline).
- Optional: **Docker** (Azurite also ships as a container image) and **Terraform** (an alternative to Bicep, seen later).
:::

## concepts

:::lang fr
**Modèles cloud.** Trois niveaux de service : **IaaS** (Infrastructure — tu gères l'OS et au-dessus : machines virtuelles, réseau), **PaaS** (Platform — tu déposes ton code, la plateforme gère l'OS : App Service, Functions), **SaaS** (Software — tu consommes une appli finie : Microsoft 365). Et trois modèles de **déploiement** : **public** (Azure), **privé** (ton datacenter), **hybride** (les deux reliés — la spécialité d'Azure avec Azure Arc / Stack).

**Infrastructure mondiale.** Azure est découpé en **régions** (une zone géographique regroupant des datacenters, ex. `westeurope`, `francecentral`). La plupart des régions sont couplées en **paires de régions** (pour la reprise après sinistre, réplication croisée). À l'intérieur d'une région, les **zones de disponibilité** (Availability Zones) sont des datacenters **physiquement séparés** — déployer sur plusieurs zones protège d'une panne locale. Choisir la bonne région (latence, souveraineté des données, coût, services disponibles) est un réflexe d'architecte.

**Hiérarchie des ressources.** Azure organise tout en **4 niveaux** : les **groupes d'administration** (management groups — regroupent des abonnements pour appliquer gouvernance et politiques à grande échelle) → les **abonnements** (subscriptions — l'unité de facturation et de quota) → les **groupes de ressources** (resource groups — un conteneur logique où vivent les ressources d'une même appli/cycle de vie) → les **ressources** (une VM, un compte de stockage, un réseau). On supprime un groupe de ressources et **tout** ce qu'il contient part avec — pratique pour nettoyer.

**Compte de stockage & Blob.** Le **stockage Azure** vit dans un **compte de stockage** (storage account, au nom **mondialement unique**) qui offre plusieurs services : **Blob** (objets/fichiers), **Queue** (messages), **Table** (NoSQL clé-valeur), **Files** (partages SMB). Un **conteneur** Blob regroupe des **blobs** (objets). C'est **précisément** ce qu'émule **Azurite** en local.

**Azurite (l'émulateur officiel).** Azurite émule Blob, Queue et Table sur ta machine, avec un **compte de développement** bien connu (`devstoreaccount1`) et une **chaîne de connexion** standard. Les vrais outils (`az storage`, les SDK) tapent l'émulateur au lieu du vrai Azure — parfait pour apprendre le stockage **sans compte**.

**Bicep & IaC.** **Bicep** est le langage **déclaratif** de Microsoft pour décrire l'infrastructure Azure (il se compile en **ARM**, le format JSON natif). On **écrit** l'infra, on la **compile/valide** hors-ligne (`bicep build`), et — avec un compte — on la **déploie** (`az deployment`). C'est le pilier reproductible et versionné de l'administration Azure (avec **Terraform**, l'alternative multi-cloud vue plus tard).

**Façons d'interagir.** Quatre : le **portail** web (explorer), la **CLI `az`** (scripter), **PowerShell** (`Az` module, très présent côté Windows), et l'**IaC** (Bicep/ARM natif, ou Terraform). En pro, on vit surtout en **`az`/PowerShell** et **Bicep/Terraform**.
:::

:::lang en
**Cloud models.** Three service levels: **IaaS** (Infrastructure — you manage the OS and up: virtual machines, networking), **PaaS** (Platform — you drop your code, the platform manages the OS: App Service, Functions), **SaaS** (Software — you consume a finished app: Microsoft 365). And three **deployment** models: **public** (Azure), **private** (your datacenter), **hybrid** (both linked — Azure's specialty with Azure Arc / Stack).

**Global infrastructure.** Azure is split into **regions** (a geographic area grouping datacenters, e.g. `westeurope`, `francecentral`). Most regions are coupled into **region pairs** (for disaster recovery, cross-replication). Within a region, **availability zones** are **physically separate** datacenters — deploying across zones protects from a local outage. Choosing the right region (latency, data sovereignty, cost, available services) is an architect's reflex.

**Resource hierarchy.** Azure organizes everything in **4 levels**: **management groups** (group subscriptions to apply governance and policy at scale) → **subscriptions** (the unit of billing and quota) → **resource groups** (a logical container where the resources of one app/lifecycle live) → **resources** (a VM, a storage account, a network). Delete a resource group and **everything** inside goes with it — handy for cleanup.

**Storage account & Blob.** **Azure storage** lives in a **storage account** (globally **unique** name) offering several services: **Blob** (objects/files), **Queue** (messages), **Table** (key-value NoSQL), **Files** (SMB shares). A Blob **container** groups **blobs** (objects). That's **exactly** what **Azurite** emulates locally.

**Azurite (the official emulator).** Azurite emulates Blob, Queue and Table on your machine, with a well-known **development account** (`devstoreaccount1`) and a standard **connection string**. Real tools (`az storage`, the SDKs) hit the emulator instead of real Azure — perfect to learn storage **with no account**.

**Bicep & IaC.** **Bicep** is Microsoft's **declarative** language to describe Azure infrastructure (it compiles to **ARM**, the native JSON format). You **write** the infra, **compile/validate** it offline (`bicep build`), and — with an account — **deploy** it (`az deployment`). It's the reproducible, versioned pillar of Azure administration (with **Terraform**, the multi-cloud alternative seen later).

**Ways to interact.** Four: the web **portal** (explore), the **`az` CLI** (script), **PowerShell** (`Az` module, big on Windows), and **IaC** (native Bicep/ARM, or Terraform). In the field, you mostly live in **`az`/PowerShell** and **Bicep/Terraform**.
:::

:::figure azure-lab-local
caption_fr: "Schéma 1. Le labo Azure local : ta machine → outillage (az CLI, Bicep, SDK) → Azurite (Blob/Queue/Table, l'émulateur officiel) pour le stockage live, et Bicep pour écrire/valider l'infrastructure hors-ligne. Les mêmes commandes et le même langage IaC qu'en réel, sans compte ni facture."
caption_en: "Figure 1. The local Azure lab: your machine → tooling (az CLI, Bicep, SDKs) → Azurite (Blob/Queue/Table, the official emulator) for live storage, and Bicep to write/validate infrastructure offline. The same commands and the same IaC language as the real thing, no account or bill."
:::

## walkthrough

:::lang fr
On avance ainsi : installer l'outillage → monter le labo Azurite → modèle & hiérarchie → premier conteneur Blob → premier template Bicep → façons d'interagir → nettoyage. Chaque étape ajoute une brique **vérifiée**.
:::

:::lang en
We'll go like this: install the tooling → set up the Azurite lab → model & hierarchy → first Blob container → first Bicep template → ways to interact → cleanup. Each step adds a **verified** block.
:::

### step-01

:::lang fr
**Objectif.** Installer l'**outillage** Azure : `az`, Azurite, Bicep.

**🤔 Trois outils, trois rôles.** `az` (la CLI) pilote Azure ; **Azurite** émule le stockage en local ; **Bicep** décrit l'infrastructure. On les installe une fois.

Installe (Linux/macOS ; adapte à ton OS) :
:::

:::lang en
**Goal.** Install the Azure **tooling**: `az`, Azurite, Bicep.

**🤔 Three tools, three roles.** `az` (the CLI) drives Azure; **Azurite** emulates storage locally; **Bicep** describes infrastructure. We install them once.

Install (Linux/macOS; adapt to your OS):
:::

```bash
# 1) La CLI Azure (script officiel Debian/Ubuntu) / the Azure CLI (official Debian/Ubuntu script)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
# (macOS : brew install azure-cli ; autres : voir la doc "Install Azure CLI")

# 2) Azurite, l'émulateur de stockage (via npm) / the storage emulator (via npm)
npm install -g azurite

# 3) Bicep (le CLI se greffe sur az) / Bicep (the CLI plugs into az)
az bicep install

# Vérifier / verify
az version
azurite --version
az bicep version
```

:::lang fr
**✅ Vérification :** `az version` affiche `azure-cli` avec un numéro (2.x). `azurite --version` affiche la version de l'émulateur. `az bicep version` affiche le CLI Bicep. Tu as les trois outils — **et toujours aucun compte Azure**, c'est normal : en labo local, on n'en a pas besoin. ⚠️ Si `az bicep install` n'est pas disponible, installe le **CLI Bicep autonome** (binaire depuis les releases GitHub `Azure/bicep`) — `bicep build` fonctionne alors sans `az`.
:::

:::lang en
**✅ Check:** `az version` shows `azure-cli` with a number (2.x). `azurite --version` shows the emulator version. `az bicep version` shows the Bicep CLI. You have all three tools — **and still no Azure account**, which is fine: in the local lab, you don't need one. ⚠️ If `az bicep install` isn't available, install the **standalone Bicep CLI** (binary from the `Azure/bicep` GitHub releases) — `bicep build` then works without `az`.
:::

### step-02

:::lang fr
**Objectif.** Monter le **labo local** : lancer Azurite et connaître sa chaîne de connexion.

**🤔 L'émulateur de stockage.** Azurite écoute sur trois ports : **Blob** (10000), **Queue** (10001), **Table** (10002). Les outils s'y connectent via une **chaîne de connexion** de développement **bien connue** (identique pour tout le monde — ce n'est pas un secret, c'est le compte `devstoreaccount1` de l'émulateur).

Lance Azurite (dans un terminal dédié, ou en arrière-plan) :
:::

:::lang en
**Goal.** Set up the **local lab**: start Azurite and know its connection string.

**🤔 The storage emulator.** Azurite listens on three ports: **Blob** (10000), **Queue** (10001), **Table** (10002). Tools connect to it via a **well-known** development **connection string** (the same for everyone — it's not a secret, it's the emulator's `devstoreaccount1` account).

Start Azurite (in a dedicated terminal, or in the background):
:::

```bash
# Démarrer Azurite (crée un dossier de données local) / start Azurite (creates a local data folder)
mkdir -p ~/azurite-data
azurite --silent --location ~/azurite-data \
  --blobHost 127.0.0.1 --queueHost 127.0.0.1 --tableHost 127.0.0.1

# Dans un AUTRE terminal, exporte la chaîne de connexion de développement bien connue :
# In ANOTHER terminal, export the well-known development connection string:
export AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;"
```

:::lang fr
**✅ Vérification :** Azurite affiche `Azurite Blob service successfully listens on http://127.0.0.1:10000` (et de même pour Queue/Table). Une vérification directe confirme qu'il répond : `curl -s http://127.0.0.1:10000/devstoreaccount1` renvoie une réponse du service (souvent une erreur d'authentification `AuthenticationFailed` **attendue** sans signature — l'important est qu'il **réponde**). ⚠️ **Garde ce terminal ouvert** (Azurite y tourne). La **chaîne de connexion** ci-dessus est publique et identique pour tous : c'est le compte de développement de l'émulateur, **jamais** un vrai secret. Astuce : mets l'`export` dans un fichier `lab.env` et fais `source lab.env` à chaque session.
:::

:::lang en
**✅ Check:** Azurite prints `Azurite Blob service successfully listens on http://127.0.0.1:10000` (and likewise for Queue/Table). A direct check confirms it answers: `curl -s http://127.0.0.1:10000/devstoreaccount1` returns a service response (often an **expected** `AuthenticationFailed` error without a signature — the point is that it **answers**). ⚠️ **Keep this terminal open** (Azurite runs in it). The **connection string** above is public and identical for everyone: it's the emulator's development account, **never** a real secret. Tip: put the `export` in a `lab.env` file and `source lab.env` each session.
:::

### step-03

:::lang fr
**Objectif.** Comprendre la **hiérarchie Azure** et les **régions**.

**🤔 Où vivent les ressources.** En réel, tout objet Azure est rangé dans **4 niveaux** : groupe d'administration → abonnement → **groupe de ressources** → ressource. Le **groupe de ressources** est le plus quotidien : un conteneur logique qu'on **crée, remplit, puis supprime en bloc**. Sans compte, on ne crée pas de vrai groupe de ressources, mais on **grave le modèle** — car chaque template Bicep et chaque commande `az` s'y réfèrent.

Explore le vocabulaire (référence — commandes réelles) :
:::

:::lang en
**Goal.** Understand the **Azure hierarchy** and **regions**.

**🤔 Where resources live.** For real, every Azure object sits in **4 levels**: management group → subscription → **resource group** → resource. The **resource group** is the most everyday one: a logical container you **create, fill, then delete wholesale**. Without an account, you don't create a real resource group, but you **engrave the model** — because every Bicep template and every `az` command refers to it.

Explore the vocabulary (reference — real commands):
:::

```bash
# En RÉEL (avec un compte), on crée un groupe de ressources ainsi :
# For REAL (with an account), you create a resource group like this:
az group create --name rg-labo --location westeurope

# Lister les régions disponibles / list available regions
az account list-locations --output table

# Lister les groupes de ressources d'un abonnement / list a subscription's resource groups
az group list --output table
```

:::lang fr
**✅ Vérification :** tu sais **réciter** la hiérarchie : **groupe d'administration → abonnement → groupe de ressources → ressource**. Tu retiens : le **groupe de ressources** partage le cycle de vie de ce qu'il contient (le supprimer supprime tout) ; une **région** (`westeurope`, `francecentral`) est un ensemble de datacenters ; les **zones de disponibilité** sont des datacenters séparés dans une région (haute dispo). ⚠️ Ces commandes `az group`/`az account` visent le **vrai** Azure (elles exigent une connexion `az login`) — on les **connaît** ici ; on les **exécutera** au guide *passer en réel*. Ce que tu exécutes **en local**, c'est le **stockage** (étape suivante) et le **Bicep** (étape 5).
:::

:::lang en
**✅ Check:** you can **recite** the hierarchy: **management group → subscription → resource group → resource**. You remember: the **resource group** shares the lifecycle of what it holds (deleting it deletes everything); a **region** (`westeurope`, `francecentral`) is a set of datacenters; **availability zones** are separate datacenters within a region (high availability). ⚠️ These `az group`/`az account` commands target **real** Azure (they need an `az login`) — we **know** them here; we'll **run** them in the *going real* guide. What you run **locally** is **storage** (next step) and **Bicep** (step 5).
:::

### step-04

:::lang fr
**Objectif.** Créer ton **premier conteneur Blob** et y déposer un objet — via Azurite, live.

**🤔 Le stockage objet Azure.** Un **conteneur** regroupe des **blobs** (des fichiers + métadonnées). On pilote avec `az storage`, en pointant la **chaîne de connexion** de l'émulateur (`--connection-string`). C'est identique au vrai Azure — seule la cible change.

Crée un conteneur et un blob (Azurite doit tourner, cf. étape 2) :
:::

:::lang en
**Goal.** Create your **first Blob container** and drop an object in it — via Azurite, live.

**🤔 Azure object storage.** A **container** groups **blobs** (files + metadata). You drive it with `az storage`, pointing at the emulator's **connection string** (`--connection-string`). It's identical to real Azure — only the target changes.

Create a container and a blob (Azurite must be running, see step 2):
:::

```bash
# La chaîne de connexion est déjà exportée (étape 2) / the connection string is already exported (step 2)

# Créer un conteneur / create a container
az storage container create --name documents --connection-string "$AZURE_STORAGE_CONNECTION_STRING"

# Téléverser un blob / upload a blob
echo "rapport trimestriel" > rapport.txt
az storage blob upload --container-name documents --name rapports/2026/q1.txt \
  --file rapport.txt --connection-string "$AZURE_STORAGE_CONNECTION_STRING"

# Lister les blobs du conteneur / list the container's blobs
az storage blob list --container-name documents \
  --connection-string "$AZURE_STORAGE_CONNECTION_STRING" --output table
```

:::lang fr
**✅ Vérification :** `container create` renvoie `"created": true`. L'`upload` réussit sans erreur. `blob list` affiche la ligne `rapports/2026/q1.txt`. Tu viens de manipuler du **stockage objet Azure en local**, avec **exactement** les commandes du vrai Azure. Note le modèle **plat** : `rapports/2026/q1.txt` est **une seule clé** (le `/` n'est qu'une convention de nommage), pas une arborescence de dossiers. ⚠️ Si tu obtiens une erreur de **version d'API** (`The API version ... is not supported by Azurite`), lance Azurite avec `--skipApiVersionCheck`, ou mets Azurite à jour (`npm install -g azurite@latest`) pour l'aligner sur ta CLI.
:::

:::lang en
**✅ Check:** `container create` returns `"created": true`. The `upload` succeeds with no error. `blob list` shows the `rapports/2026/q1.txt` row. You just handled **Azure object storage locally**, with **exactly** the real Azure commands. Note the **flat** model: `rapports/2026/q1.txt` is **a single key** (the `/` is just a naming convention), not a folder tree. ⚠️ If you get an **API version** error (`The API version ... is not supported by Azurite`), start Azurite with `--skipApiVersionCheck`, or update Azurite (`npm install -g azurite@latest`) to align it with your CLI.
:::

### step-05

:::lang fr
**Objectif.** Écrire et **compiler** ton premier template **Bicep** — l'infrastructure-as-code, hors-ligne.

**🤔 Décrire plutôt que cliquer.** Au lieu de créer une ressource à la main, on la **décrit** en Bicep. `bicep build` (ou `az bicep build`) **compile** le template en ARM JSON et **valide sa forme** — sans compte, sans rien déployer. C'est ta première brique d'IaC Azure.

Crée `stockage.bicep` puis compile-le :
:::

:::lang en
**Goal.** Write and **compile** your first **Bicep** template — infrastructure-as-code, offline.

**🤔 Describe rather than click.** Instead of creating a resource by hand, you **describe** it in Bicep. `bicep build` (or `az bicep build`) **compiles** the template to ARM JSON and **validates its shape** — no account, nothing deployed. It's your first Azure IaC block.

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
# Compiler/valider le template (hors-ligne, sans compte) / compile-validate the template (offline)
bicep build stockage.bicep --stdout | head -n 20
# (ou : az bicep build --file stockage.bicep --stdout)
```

:::lang fr
**✅ Vérification :** `bicep build` affiche l'**ARM JSON** compilé (avec `"$schema"`, `"resources"`, tes `parameters` et `outputs`) et **aucune erreur** — signe que ton template est **syntaxiquement et structurellement valide** contre le schéma de la ressource `Microsoft.Storage/storageAccounts`. Tu viens d'écrire de la **vraie infrastructure Azure**, versionnable et revue en PR, **sans compte**. Note les bonnes pratiques déjà en place : `minimumTlsVersion: 'TLS1_2'`, `allowBlobPublicAccess: false` — la sécurité par défaut. ⚠️ `bicep build` **valide la forme**, pas le déploiement : créer réellement la ressource (`az deployment group create`) viendra avec un compte, au guide *passer en réel*.
:::

:::lang en
**✅ Check:** `bicep build` prints the compiled **ARM JSON** (with `"$schema"`, `"resources"`, your `parameters` and `outputs`) and **no error** — proof your template is **syntactically and structurally valid** against the `Microsoft.Storage/storageAccounts` resource schema. You just wrote **real Azure infrastructure**, versionable and PR-reviewed, **with no account**. Note the good practices already in place: `minimumTlsVersion: 'TLS1_2'`, `allowBlobPublicAccess: false` — secure by default. ⚠️ `bicep build` **validates the shape**, not the deployment: actually creating the resource (`az deployment group create`) comes with an account, in the *going real* guide.
:::

### step-06

:::lang fr
**Objectif.** Ancrer les **façons d'interagir** avec Azure et les **essentiels `az`**.

**🤔 Choisir le bon outil.** Azure se pilote de quatre façons : le **portail** web (explorer, apprendre), la **CLI `az`** (scripter, reproduire), **PowerShell** (module `Az`, roi côté Windows/AD), et l'**IaC** (Bicep/ARM natif, ou Terraform). En pro, on vit surtout en **`az`/PowerShell** et **Bicep/Terraform**.

Explore les essentiels `az` (formats de sortie & aide) :
:::

:::lang en
**Goal.** Anchor the **ways to interact** with Azure and the **`az` essentials**.

**🤔 Pick the right tool.** Azure is driven four ways: the web **portal** (explore, learn), the **`az` CLI** (script, reproduce), **PowerShell** (`Az` module, king on Windows/AD), and **IaC** (native Bicep/ARM, or Terraform). In the field, you mostly live in **`az`/PowerShell** and **Bicep/Terraform**.

Explore the `az` essentials (output formats & help):
:::

```bash
# Aide & découverte / help & discovery
az storage --help | head -n 20          # les sous-commandes de storage / storage subcommands
az storage blob --help | head -n 20

# Formats de sortie (utiles partout) / output formats (useful everywhere)
az storage container list --connection-string "$AZURE_STORAGE_CONNECTION_STRING" --output table
az storage container list --connection-string "$AZURE_STORAGE_CONNECTION_STRING" --query "[].name" --output tsv
```

:::lang fr
**✅ Vérification :** `az storage --help` liste les sous-commandes (`container`, `blob`, `queue`, `table`). `--output table` donne un tableau lisible ; `--query "[].name"` extrait juste les noms (Azure utilise **JMESPath** pour `--query`, comme AWS). Retiens les **4 façons** : portail (explorer), `az` (CLI), PowerShell (Windows/AD), IaC (Bicep/Terraform). Ce parcours te fait vivre surtout **`az`** et **Bicep** — les deux compétences pro qui traversent **toutes** les certifications Azure.
:::

:::lang en
**✅ Check:** `az storage --help` lists the subcommands (`container`, `blob`, `queue`, `table`). `--output table` gives a readable table; `--query "[].name"` extracts just the names (Azure uses **JMESPath** for `--query`, like AWS). Remember the **4 ways**: portal (explore), `az` (CLI), PowerShell (Windows/AD), IaC (Bicep/Terraform). This path has you live mostly in **`az`** and **Bicep** — the two pro skills that run through **all** the Azure certifications.
:::

### step-07

:::lang fr
**Objectif.** Ranger ton labo.

**🤔 L'hygiène.** On supprime le conteneur (et son blob), et on arrête Azurite. Réflexe **créer → utiliser → nettoyer**, même en local.

Nettoie :
:::

:::lang en
**Goal.** Tidy up your lab.

**🤔 Hygiene.** We delete the container (and its blob), and stop Azurite. **Create → use → clean up** reflex, even locally.

Clean up:
:::

```bash
# Supprimer le conteneur (et ses blobs) / delete the container (and its blobs)
az storage container delete --name documents --connection-string "$AZURE_STORAGE_CONNECTION_STRING"

# Arrêter Azurite : Ctrl-C dans son terminal / stop Azurite: Ctrl-C in its terminal
# (les données locales restent dans ~/azurite-data ; supprime le dossier pour repartir à zéro)
# (local data stays in ~/azurite-data; delete the folder to start fresh)
```

:::lang fr
**✅ Vérification :** `container delete` renvoie `"deleted": true`. Après un `Ctrl-C`, Azurite s'arrête (le port 10000 ne répond plus). Ton labo est rangé. Tu tiens maintenant le **socle Azure** : outillage installé, stockage live sur Azurite, premier Bicep compilé, et le **modèle** (hiérarchie, régions) en tête. La suite du parcours : **AZ-104 (administrateur)** — identités, réseau, machines virtuelles, gouvernance — puis architecte, DevOps, sécurité, réseau.
:::

:::lang en
**✅ Check:** `container delete` returns `"deleted": true`. After a `Ctrl-C`, Azurite stops (port 10000 no longer answers). Your lab is tidy. You now hold the **Azure base**: tooling installed, live storage on Azurite, first Bicep compiled, and the **model** (hierarchy, regions) in mind. The path continues: **AZ-104 (administrator)** — identities, networking, virtual machines, governance — then architect, DevOps, security, networking.
:::

## pitfalls

:::lang fr
**1. Croire qu'Azurite émule tout Azure.** Non : Azurite émule le **stockage** (Blob/Queue/Table). Les VM, réseaux, identités se **décrivent** en Bicep/Terraform (validés hors-ligne) et se **déploient** avec un compte.

**2. Prendre la chaîne de connexion de dev pour un secret.** Elle est **publique** et identique pour tous (compte `devstoreaccount1`). Ne l'utilise **jamais** pour un vrai compte de stockage.

**3. Oublier de lancer Azurite.** Les commandes `az storage` échouent avec une erreur de connexion si l'émulateur ne tourne pas. Vérifie le terminal Azurite / le port 10000.

**4. Erreur de version d'API Azurite.** Si ta CLI est plus récente que ton Azurite, tu vois `API version not supported`. Mets Azurite à jour (`npm install -g azurite@latest`) ou lance-le avec `--skipApiVersionCheck`.

**5. Confondre `az group` et `az storage`.** `az group` (groupes de ressources) vise le **vrai** Azure (nécessite `az login`). `az storage` peut viser **l'émulateur** via `--connection-string`. Deux cibles différentes.

**6. Croire que le nom d'un compte de stockage est libre.** Il est **mondialement unique** (comme S3/GCS). En Bicep, `uniqueString(resourceGroup().id)` génère un suffixe stable.

**7. Confondre région et zone.** Une **région** = une aire géographique de datacenters ; une **zone de disponibilité** = un datacenter isolé dans une région. La haute dispo se joue **entre zones**.
:::

:::lang en
**1. Thinking Azurite emulates all of Azure.** No: Azurite emulates **storage** (Blob/Queue/Table). VMs, networks, identities are **described** in Bicep/Terraform (validated offline) and **deployed** with an account.

**2. Taking the dev connection string for a secret.** It's **public** and identical for everyone (`devstoreaccount1` account). **Never** use it for a real storage account.

**3. Forgetting to start Azurite.** `az storage` commands fail with a connection error if the emulator isn't running. Check the Azurite terminal / port 10000.

**4. Azurite API version error.** If your CLI is newer than your Azurite, you see `API version not supported`. Update Azurite (`npm install -g azurite@latest`) or start it with `--skipApiVersionCheck`.

**5. Confusing `az group` and `az storage`.** `az group` (resource groups) targets **real** Azure (needs `az login`). `az storage` can target **the emulator** via `--connection-string`. Two different targets.

**6. Thinking a storage account name is free.** It's **globally unique** (like S3/GCS). In Bicep, `uniqueString(resourceGroup().id)` generates a stable suffix.

**7. Confusing region and zone.** A **region** = a geographic area of datacenters; an **availability zone** = an isolated datacenter within a region. High availability plays out **across zones**.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] `az version`, `azurite --version`, `az bicep version` répondent.
- [ ] Azurite tourne et le port 10000 répond.
- [ ] Tu récites la hiérarchie : groupe d'administration → abonnement → groupe de ressources → ressource.
- [ ] Tu crées un conteneur et téléverses un blob (via `az storage` + Azurite).
- [ ] Tu **compiles** un template Bicep sans erreur (`bicep build`).
- [ ] Tu distingues **région** et **zone de disponibilité**.
- [ ] Tu cites les **4 façons** d'interagir (portail, `az`, PowerShell, IaC).

Sept cases = ton socle Azure est monté. La suite : **AZ-104 (administrateur)**.
:::

:::lang en
You know it works when…

- [ ] `az version`, `azurite --version`, `az bicep version` all answer.
- [ ] Azurite runs and port 10000 responds.
- [ ] You recite the hierarchy: management group → subscription → resource group → resource.
- [ ] You create a container and upload a blob (via `az storage` + Azurite).
- [ ] You **compile** a Bicep template with no error (`bicep build`).
- [ ] You distinguish **region** and **availability zone**.
- [ ] You name the **4 ways** to interact (portal, `az`, PowerShell, IaC).

Seven boxes = your Azure base is set. Next up: **AZ-104 (administrator)**.
:::

## next

:::lang fr
Le parcours Azure continue :

1. **AZ-104 — administrateur Azure** : identités (Entra ID), gouvernance (RBAC, policies, tags), stockage (comptes, Blob, partages), réseau (VNet, NSG), machines virtuelles — le tout en Bicep validé + Azurite.
2. Plus loin : **AZ-305** (architecte), **AZ-400** (DevOps), **AZ-500** (sécurité), **AZ-700** (réseau). Le labo monté ici te resservira partout.
:::

:::lang en
The Azure path continues:

1. **AZ-104 — Azure administrator**: identities (Entra ID), governance (RBAC, policies, tags), storage (accounts, Blob, shares), networking (VNet, NSG), virtual machines — all in validated Bicep + Azurite.
2. Further along: **AZ-305** (architect), **AZ-400** (DevOps), **AZ-500** (security), **AZ-700** (networking). The lab set up here will serve you everywhere.
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
az version ; azurite --version ; az bicep version

# Labo : démarrer Azurite / lab: start Azurite
azurite --silent --location ~/azurite-data --blobHost 127.0.0.1 --queueHost 127.0.0.1 --tableHost 127.0.0.1
export AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"

# Stockage (émulateur) / storage (emulator)
az storage container create --name documents --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
az storage blob upload --container-name documents --name cle --file f.txt --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
az storage blob list --container-name documents --connection-string "$AZURE_STORAGE_CONNECTION_STRING" -o table

# IaC (hors-ligne) / IaC (offline)
bicep build stockage.bicep --stdout        # compile -> ARM JSON, valide la forme

# Hiérarchie (mémo) : groupe d'administration -> abonnement -> groupe de ressources -> ressource
```

## resources

:::lang fr
- [Azurite — l'émulateur de stockage](https://learn.microsoft.com/azure/storage/common/storage-use-azurite) — Blob/Queue/Table en local.
- [Bicep — documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/) — le langage IaC d'Azure.
- [Installer la CLI Azure](https://learn.microsoft.com/cli/azure/install-azure-cli) — `az` sur tous les OS.
- [Groupes de ressources & abonnements](https://learn.microsoft.com/azure/azure-resource-manager/management/overview) — la hiérarchie.
- [Régions et zones de disponibilité](https://learn.microsoft.com/azure/reliability/availability-zones-overview) — l'infrastructure mondiale.
:::

:::lang en
- [Azurite — the storage emulator](https://learn.microsoft.com/azure/storage/common/storage-use-azurite) — Blob/Queue/Table locally.
- [Bicep — documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/) — Azure's IaC language.
- [Install the Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) — `az` on all OSes.
- [Resource groups & subscriptions](https://learn.microsoft.com/azure/azure-resource-manager/management/overview) — the hierarchy.
- [Regions and availability zones](https://learn.microsoft.com/azure/reliability/availability-zones-overview) — the global infrastructure.
:::

## troubleshooting

:::lang fr
**`az` : commande introuvable.** L'installation n'a pas abouti ou le PATH n'est pas rafraîchi. Réinstalle via le script officiel (Linux) / `brew` (macOS), rouvre le terminal.

**`az storage` : erreur de connexion.** Azurite ne tourne pas, ou la chaîne de connexion n'est pas exportée dans **ce** shell. Relance Azurite, ré-exporte `AZURE_STORAGE_CONNECTION_STRING`.

**`The API version ... is not supported by Azurite`.** Ta CLI/ton SDK est plus récent que ton Azurite. Mets Azurite à jour (`npm install -g azurite@latest`) ou lance-le avec `--skipApiVersionCheck`.

**`az bicep` indisponible.** Installe le **CLI Bicep autonome** (binaire des releases GitHub `Azure/bicep`), puis utilise `bicep build` directement.

**`bicep build` : erreur de schéma.** Une propriété/valeur ne correspond pas au type de ressource. Le message pointe la ligne ; corrige selon la doc de la ressource (`Microsoft.Storage/storageAccounts`).

**Port 10000 déjà utilisé.** Une autre instance d'Azurite (ou un service) occupe le port. Arrête-la, ou change les ports (`--blobPort 11000`, etc.) et adapte la chaîne de connexion.
:::

:::lang en
**`az`: command not found.** The install didn't complete or PATH isn't refreshed. Reinstall via the official script (Linux) / `brew` (macOS), reopen the terminal.

**`az storage`: connection error.** Azurite isn't running, or the connection string isn't exported in **this** shell. Restart Azurite, re-export `AZURE_STORAGE_CONNECTION_STRING`.

**`The API version ... is not supported by Azurite`.** Your CLI/SDK is newer than your Azurite. Update Azurite (`npm install -g azurite@latest`) or start it with `--skipApiVersionCheck`.

**`az bicep` unavailable.** Install the **standalone Bicep CLI** (binary from the `Azure/bicep` GitHub releases), then use `bicep build` directly.

**`bicep build`: schema error.** A property/value doesn't match the resource type. The message points to the line; fix per the resource docs (`Microsoft.Storage/storageAccounts`).

**Port 10000 already in use.** Another Azurite instance (or a service) holds the port. Stop it, or change ports (`--blobPort 11000`, etc.) and adjust the connection string.
:::
