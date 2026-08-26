---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-projet-entreprise
slug: azure-projet-entreprise
order: 63
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — projet d'entreprise (AZ-104) : zone d'atterrissage sécurisée"
title_en: "Azure — enterprise project (AZ-104): secure landing zone"
tagline_fr: "réseau segmenté + charges + gouvernance, en IaC déployé live."
tagline_en: "segmented network + workloads + governance, as live-deployed IaC."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 300
repo: "moabukar/miniblue"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: [azure-reseau, azure-stockage, azure-calcul, azure-identite-gouvernance]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [zone-atterrissage, projet-entreprise, terraform, reseau-segmente, nsg, charges-de-travail, identite-managee, rbac, policy, tags, iac, az-104]
concepts_en: [landing-zone, enterprise-project, terraform, segmented-network, nsg, workloads, managed-identity, rbac, policy, tags, iac, az-104]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le projet de CV du track AZ-104 : une zone d'atterrissage Azure sécurisée, décrite en Terraform paramétré (variables, for_each, tags communs, outputs) et DÉPLOYÉE EN LIVE contre miniblue — un réseau segmenté (hub + sous-réseaux web/app/data), un NSG par tier, une IP publique ; des charges de travail (compte de stockage, identité managée, VM) via azlocal ; et un durcissement gouvernance (RBAC au moindre privilège, policy, verrou) validé en Bicep. Appliqué, vérifié, détruit, à coût zéro. Un livrable d'administrateur cloud."
og_description_en: "The AZ-104 track's CV project: a secure Azure landing zone, described in parameterized Terraform (variables, for_each, common tags, outputs) and DEPLOYED LIVE against miniblue — a segmented network (hub + web/app/data subnets), an NSG per tier, a public IP; workloads (storage account, managed identity, VM) via azlocal; and governance hardening (least-privilege RBAC, policy, lock) validated in Bicep. Applied, verified, destroyed, at zero cost. A cloud-administrator deliverable."
---

## intro

:::lang fr
Voici le **livrable** du track AZ-104 : un projet **complet, de niveau entreprise**, que tu pourras **présenter sur ton CV** et **défendre en entretien**. On ne fait pas un jouet — on construit une **zone d'atterrissage** (landing zone) : la fondation d'infrastructure **sécurisée et gouvernée** sur laquelle une organisation pose ses applications. Réseau segmenté, sécurité par tier, identités, gouvernance : tout ce que tu as appris — réseau, stockage, calcul, identité — converge ici, **en Terraform déployé pour de vrai**.

L'architecture : un **réseau segmenté** (un VNet « hub » découpé en sous-réseaux **web / app / data**), un **groupe de sécurité réseau** par tier exposé, une **IP publique** ; par-dessus, des **charges de travail** (un **compte de stockage**, une **identité managée**, une **VM**) ; et un **durcissement gouvernance** (RBAC au **moindre privilège**, **policy** imposant les tags, **verrou** de protection). Le tout **taggé** pour le suivi des coûts.

Et — c'est la marque du track — **tu le déploies EN LOCAL**, sur **miniblue**, sans compte ni facture. L'infrastructure réseau est décrite en **Terraform paramétré** (variables, `for_each`, tags communs, outputs) et **appliquée en live** (`apply`), **vérifiée**, puis **détruite** (`destroy`). Les charges tournent via `azlocal` ; la gouvernance est **validée en Bicep**. Un projet qui **prouve** des compétences d'administrateur Azure, à coût zéro, prêt pour le vrai cloud (guide suivant).

**Pour qui c'est :** tu as fait *réseau*, *stockage*, *calcul* et *identité & gouvernance*. C'est l'aboutissement — prévois une bonne session.

**Quand ce n'est PAS le bon choix :**

- Il te manque un des guides AZ-104 → fais-les d'abord ; ce projet les assemble.
- miniblue ne tourne pas → relance le labo (*fondamentaux*).
:::

:::lang en
Here's the **deliverable** of the AZ-104 track: a **complete, enterprise-grade** project you can **put on your CV** and **defend in an interview**. We're not building a toy — we build a **landing zone**: the **secure, governed** infrastructure foundation an organization deploys its applications onto. Segmented network, per-tier security, identities, governance: everything you learned — networking, storage, compute, identity — converges here, **in Terraform deployed for real**.

The architecture: a **segmented network** (a "hub" VNet split into **web / app / data** subnets), a **network security group** per exposed tier, a **public IP**; on top, **workloads** (a **storage account**, a **managed identity**, a **VM**); and **governance hardening** (least-privilege **RBAC**, a **policy** enforcing tags, a protection **lock**). All **tagged** for cost tracking.

And — the track's signature — **you deploy it LOCALLY**, on **miniblue**, no account or bill. The network infrastructure is described in **parameterized Terraform** (variables, `for_each`, common tags, outputs) and **applied live** (`apply`), **verified**, then **destroyed** (`destroy`). Workloads run via `azlocal`; governance is **validated in Bicep**. A project that **proves** Azure-administrator skills, at zero cost, ready for the real cloud (next guide).

**Who it's for:** you've done *networking*, *storage*, *compute* and *identity & governance*. This is the culmination — set aside a good session.

**When it's NOT the right choice:**

- You're missing an AZ-104 guide → do them first; this project assembles them.
- miniblue isn't running → restart the lab (*fundamentals*).
:::

## objectives

:::lang fr
À la fin de ce projet, tu as construit et tu sais expliquer :

- Une **zone d'atterrissage** : réseau segmenté + charges + gouvernance.
- Une **infrastructure Terraform paramétrée** (variables, `for_each`, tags communs, outputs).
- Un **réseau segmenté** (hub + sous-réseaux web/app/data) avec **NSG** et **IP publique**, déployé en live.
- Des **charges de travail** (compte de stockage, identité managée, VM) dans la zone.
- Un **durcissement gouvernance** (RBAC moindre privilège, policy, verrou) validé en Bicep.
- Une **vérification bout en bout** (outputs, état, ressources côté émulateur).
- Comment **présenter ce projet** sur un CV et en entretien.
:::

:::lang en
By the end of this project, you've built and can explain:

- A **landing zone**: segmented network + workloads + governance.
- A **parameterized Terraform infrastructure** (variables, `for_each`, common tags, outputs).
- A **segmented network** (hub + web/app/data subnets) with **NSG** and **public IP**, deployed live.
- **Workloads** (storage account, managed identity, VM) in the zone.
- **Governance hardening** (least-privilege RBAC, policy, lock) validated in Bicep.
- An **end-to-end verification** (outputs, state, emulator-side resources).
- How to **present this project** on a CV and in an interview.
:::

## prerequisites

:::lang fr
- Les guides AZ-104 **réseau**, **stockage**, **calcul**, **identité & gouvernance** terminés.
- **miniblue** qui tourne (`azlocal health`), **Terraform** et **Bicep** installés.
- La confiance du certificat : `export SSL_CERT_FILE=~/.miniblue/cert.pem`.
- Rappel : Terraform (provider `azurerm`) déploie le **réseau** en live sur miniblue ; `azlocal` crée les **charges** ; Bicep **valide** la gouvernance.
:::

:::lang en
- The AZ-104 **networking**, **storage**, **compute**, **identity & governance** guides done.
- **miniblue** running (`azlocal health`), **Terraform** and **Bicep** installed.
- Certificate trust: `export SSL_CERT_FILE=~/.miniblue/cert.pem`.
- Reminder: Terraform (`azurerm` provider) deploys the **network** live on miniblue; `azlocal` creates the **workloads**; Bicep **validates** the governance.
:::

## concepts

:::lang fr
**La zone d'atterrissage (landing zone).** Un concept clé d'Azure : plutôt que de créer des ressources en vrac, une organisation prépare une **fondation** standardisée — réseau, sécurité, identité, gouvernance — sur laquelle les équipes déploient ensuite leurs applications, **en conformité par construction**. C'est exactement ce qu'un administrateur AZ-104 met en place.

**Trois couches, trois outils.** Notre zone a trois couches, chacune avec l'outil adapté : (1) la **fondation réseau** — décrite en **Terraform** et **déployée en live** sur miniblue (le cœur reproductible) ; (2) les **charges de travail** — créées via **`azlocal`** (compte de stockage, identité managée, VM) ; (3) le **durcissement gouvernance** — **validé en Bicep** (RBAC, policy, verrou), prêt à déployer sur un vrai compte.

**Terraform paramétré.** Un projet sérieux n'a pas de valeurs en dur : on utilise des **variables** (le préfixe, les tags communs), la boucle **`for_each`** (créer les trois sous-réseaux sans copier-coller), et des **outputs** (exposer les identifiants utiles). C'est la marque d'une IaC **maintenable**.

**Réseau segmenté & tags communs.** Le VNet est découpé en tiers (**web** exposé, **app** logique, **data** privé) — la **segmentation**, base de la défense en profondeur. Un **NSG** protège le tier web. Et **chaque ressource porte les mêmes tags** (`env`, `projet`, `cost-center`) — la traçabilité et la ventilation des coûts, imposées de façon cohérente.

**Charges de travail.** Sur la fondation, les ressources qui **travaillent** : un **compte de stockage** (données), une **identité managée** (l'identité sans mot de passe d'une application), une **VM** (le calcul). Elles vivent **dans** le groupe de ressources de la zone.

**Durcissement gouvernance.** La sécurité de la zone : une **attribution RBAC au moindre privilège** (l'identité managée n'a que le rôle nécessaire), une **policy** (imposer le tag `env`), un **verrou** (empêcher la suppression accidentelle). Validé en Bicep, déployé en réel.

**Le cycle IaC complet.** `apply` déploie la fondation réseau en live ; on **vérifie** (outputs, état Terraform, ressources côté miniblue) ; `destroy` retire tout proprement. C'est le workflow exact d'un administrateur — reproductible, versionné, **sans risque** ici.
:::

:::lang en
**The landing zone.** A key Azure concept: rather than creating resources ad hoc, an organization prepares a standardized **foundation** — network, security, identity, governance — that teams then deploy their applications onto, **compliant by construction**. It's exactly what an AZ-104 administrator sets up.

**Three layers, three tools.** Our zone has three layers, each with the right tool: (1) the **network foundation** — described in **Terraform** and **deployed live** on miniblue (the reproducible core); (2) the **workloads** — created via **`azlocal`** (storage account, managed identity, VM); (3) the **governance hardening** — **validated in Bicep** (RBAC, policy, lock), ready to deploy on a real account.

**Parameterized Terraform.** A serious project has no hard-coded values: you use **variables** (the prefix, common tags), the **`for_each`** loop (create the three subnets without copy-paste), and **outputs** (expose useful ids). It's the mark of **maintainable** IaC.

**Segmented network & common tags.** The VNet is split into tiers (**web** exposed, **app** logic, **data** private) — **segmentation**, the base of defense in depth. An **NSG** protects the web tier. And **every resource carries the same tags** (`env`, `projet`, `cost-center`) — traceability and cost allocation, enforced consistently.

**Workloads.** On the foundation, the resources that **work**: a **storage account** (data), a **managed identity** (an application's password-less identity), a **VM** (compute). They live **in** the zone's resource group.

**Governance hardening.** The zone's security: a **least-privilege RBAC assignment** (the managed identity gets only the needed role), a **policy** (enforce the `env` tag), a **lock** (prevent accidental deletion). Validated in Bicep, deployed for real.

**The full IaC cycle.** `apply` deploys the network foundation live; you **verify** (outputs, Terraform state, miniblue-side resources); `destroy` removes everything cleanly. It's an administrator's exact workflow — reproducible, versioned, **risk-free** here.
:::

:::figure azure-landing-zone
caption_fr: "Schéma 1. La zone d'atterrissage : la fondation RÉSEAU (VNet hub + sous-réseaux web/app/data, NSG sur le web, IP publique) en Terraform déployé live ; les CHARGES (compte de stockage, identité managée, VM) via azlocal ; le DURCISSEMENT (RBAC moindre privilège, policy tag obligatoire, verrou) validé en Bicep. Tags communs sur tout. Appliqué → vérifié → détruit sur miniblue."
caption_en: "Figure 1. The landing zone: the NETWORK foundation (hub VNet + web/app/data subnets, NSG on web, public IP) in live-deployed Terraform; the WORKLOADS (storage account, managed identity, VM) via azlocal; the HARDENING (least-privilege RBAC, mandatory-tag policy, lock) validated in Bicep. Common tags on everything. Applied → verified → destroyed on miniblue."
:::

## walkthrough

:::lang fr
On construit ainsi : architecture & squelette → fondation réseau (Terraform live) → charges de travail (azlocal) → durcissement gouvernance (Bicep) → vérification bout en bout → emballage CV → démontage. Chaque couche est **testée**.
:::

:::lang en
We build like this: architecture & skeleton → network foundation (live Terraform) → workloads (azlocal) → governance hardening (Bicep) → end-to-end verification → CV packaging → teardown. Each layer is **tested**.
:::

### step-01

:::lang fr
**Objectif.** Poser l'**architecture** et le **squelette** du projet.

**🤔 Un vrai projet a une structure.** On sépare l'**infra réseau** (Terraform), la **gouvernance** (Bicep) et la doc. Cette organisation est un **signal de maturité** pour un recruteur.

Crée l'arborescence :
:::

:::lang en
**Goal.** Lay down the project's **architecture** and **skeleton**.

**🤔 A real project has structure.** We separate the **network infra** (Terraform), the **governance** (Bicep) and the docs. This organization is a **maturity signal** to a recruiter.

Create the tree:
:::

```bash
mkdir -p ~/landing-zone/infra ~/landing-zone/gouvernance
cd ~/landing-zone
# Structure cible / target structure :
#   infra/         -> Terraform (réseau déployé live sur miniblue)
#   gouvernance/   -> Bicep (RBAC, policy, verrou — validés)
#   README.md
export SSL_CERT_FILE=~/.miniblue/cert.pem      # confiance du certificat miniblue
```

:::lang fr
**✅ Vérification :** `ls ~/landing-zone` montre `gouvernance` et `infra`. Tu tiens le **plan** : la fondation réseau (Terraform, live), les charges (azlocal), le durcissement (Bicep). Garde cette phrase en tête — c'est **exactement** ce que tu diras en entretien : « J'ai construit une zone d'atterrissage sécurisée : réseau segmenté, charges, et gouvernance au moindre privilège, le tout en IaC. » Les prochaines étapes remplissent chaque couche, **une pièce testée à la fois**.
:::

:::lang en
**✅ Check:** `ls ~/landing-zone` shows `gouvernance` and `infra`. You hold the **plan**: the network foundation (Terraform, live), the workloads (azlocal), the hardening (Bicep). Keep this sentence in mind — it's **exactly** what you'll say in an interview: "I built a secure landing zone: segmented network, workloads, and least-privilege governance, all as IaC." The next steps fill each layer, **one tested piece at a time**.
:::

### step-02

:::lang fr
**Objectif.** Déployer la **fondation réseau** en Terraform paramétré — live sur miniblue.

**🤔 Le cœur reproductible.** On décrit le réseau avec des **variables** (préfixe, tags communs), une boucle **`for_each`** (les trois sous-réseaux), un **NSG**, une **IP publique**, et des **outputs**. Puis on **applique** — de vraies ressources apparaissent sur miniblue.

Crée `infra/providers.tf`, `infra/variables.tf`, `infra/main.tf` :
:::

:::lang en
**Goal.** Deploy the **network foundation** in parameterized Terraform — live on miniblue.

**🤔 The reproducible core.** We describe the network with **variables** (prefix, common tags), a **`for_each`** loop (the three subnets), an **NSG**, a **public IP**, and **outputs**. Then we **apply** — real resources appear on miniblue.

Create `infra/providers.tf`, `infra/variables.tf`, `infra/main.tf`:
:::

```hcl
# infra/providers.tf
terraform {
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 3.0" }
  }
}
provider "azurerm" {
  features {}
  # --- ciblage miniblue (à retirer pour le vrai Azure) ---
  metadata_host              = "localhost:4567"
  skip_provider_registration = true
  subscription_id            = "00000000-0000-0000-0000-000000000000"
  tenant_id                  = "00000000-0000-0000-0000-000000000001"
  client_id                  = "miniblue"
  client_secret              = "miniblue"
  environment                = "public"
}
```

```hcl
# infra/variables.tf
variable "prefixe" {
  type    = string
  default = "landing"
}
variable "tags_communs" {
  type = map(string)
  default = {
    env         = "labo"
    projet      = "landing-zone"
    cost-center = "formation"
  }
}
```

```hcl
# infra/main.tf
resource "azurerm_resource_group" "lz" {
  name     = "rg-${var.prefixe}"
  location = "westeurope"
  tags     = var.tags_communs
}

resource "azurerm_virtual_network" "hub" {
  name                = "vnet-${var.prefixe}"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.lz.location
  resource_group_name = azurerm_resource_group.lz.name
  tags                = var.tags_communs
}

resource "azurerm_subnet" "tiers" {
  for_each             = { web = "10.0.1.0/24", app = "10.0.2.0/24", data = "10.0.3.0/24" }
  name                 = "snet-${each.key}"
  resource_group_name  = azurerm_resource_group.lz.name
  virtual_network_name = azurerm_virtual_network.hub.name
  address_prefixes     = [each.value]
}

resource "azurerm_network_security_group" "web" {
  name                = "nsg-web"
  location            = azurerm_resource_group.lz.location
  resource_group_name = azurerm_resource_group.lz.name
  tags                = var.tags_communs
  security_rule {
    name                       = "autoriser-https"
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

resource "azurerm_subnet_network_security_group_association" "web" {
  subnet_id                 = azurerm_subnet.tiers["web"].id
  network_security_group_id = azurerm_network_security_group.web.id
}

resource "azurerm_public_ip" "web" {
  name                = "pip-web"
  location            = azurerm_resource_group.lz.location
  resource_group_name = azurerm_resource_group.lz.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = var.tags_communs
}

output "resource_group" { value = azurerm_resource_group.lz.name }
output "subnets"        { value = [for s in azurerm_subnet.tiers : s.name] }
```

```bash
cd ~/landing-zone/infra
terraform init
terraform apply -auto-approve
```

:::lang fr
**✅ Vérification :** `terraform apply` se termine par `Apply complete! Resources: 8 added.` — le groupe de ressources, le VNet, les **trois** sous-réseaux (créés par `for_each`), le NSG, l'association et l'IP publique, **tous taggés**. Tu as déployé une **fondation réseau segmentée** en live, de façon **paramétrée** et reproductible. Note la puissance : changer `var.prefixe`, et toute la zone se re-nomme ; un `for_each`, et les sous-réseaux se multiplient sans copier-coller. ⚠️ C'est **exactement** le cœur d'une vraie zone d'atterrissage Azure.
:::

:::lang en
**✅ Check:** `terraform apply` ends with `Apply complete! Resources: 8 added.` — the resource group, the VNet, the **three** subnets (created by `for_each`), the NSG, the association and the public IP, **all tagged**. You deployed a **segmented network foundation** live, in a **parameterized**, reproducible way. Note the power: change `var.prefixe`, and the whole zone renames; one `for_each`, and the subnets multiply without copy-paste. ⚠️ It's **exactly** the core of a real Azure landing zone.
:::

### step-03

:::lang fr
**Objectif.** Déployer les **charges de travail** dans la zone — via azlocal, live.

**🤔 Les ressources qui travaillent.** Sur la fondation, on pose : un **compte de stockage** (les données), une **identité managée** (l'identité de l'application), une **VM** (le calcul). Elles vivent **dans** le groupe de ressources de la zone (`rg-landing`).

Crée les charges :
:::

:::lang en
**Goal.** Deploy the **workloads** in the zone — via azlocal, live.

**🤔 The resources that work.** On the foundation, we place: a **storage account** (the data), a **managed identity** (the application's identity), a **VM** (the compute). They live **in** the zone's resource group (`rg-landing`).

Create the workloads:
:::

```bash
# Dans le groupe de la zone (rg-landing) / in the zone's group (rg-landing)
azlocal storage account create --name stlanding2026 --resource-group rg-landing
azlocal identity create        --name id-workload    --resource-group rg-landing
azlocal vm create              --name vm-web          --resource-group rg-landing \
  --image UbuntuLTS --size Standard_B1s
```

:::lang fr
**✅ Vérification :** les trois commandes renvoient des objets ARM `Succeeded` : le compte `stlanding2026` (`StorageV2`), l'identité managée `id-workload` (avec un `clientId`), la VM `vm-web` (`Standard_B1s`, adossée à un conteneur). Ta zone a maintenant des **charges** : du stockage, une identité pour les faire communiquer sans mot de passe, et du calcul. ⚠️ Ces charges vivent **dans le même groupe de ressources** que le réseau — quand tu supprimeras le groupe, **tout** partira ensemble (étape 7). C'est l'intérêt du groupe de ressources comme **unité de cycle de vie**.
:::

:::lang en
**✅ Check:** the three commands return `Succeeded` ARM objects: the `stlanding2026` account (`StorageV2`), the `id-workload` managed identity (with a `clientId`), the `vm-web` VM (`Standard_B1s`, container-backed). Your zone now has **workloads**: storage, an identity to make them communicate without a password, and compute. ⚠️ These workloads live **in the same resource group** as the network — when you delete the group, **everything** goes together (step 7). That's the point of the resource group as a **lifecycle unit**.
:::

### step-04

:::lang fr
**Objectif.** Décrire le **durcissement gouvernance** en Bicep — validé.

**🤔 Sécuriser la zone.** Trois protections : une **attribution RBAC au moindre privilège** (l'identité managée reçoit un rôle **Lecteur**, pas plus), une **policy** (imposer le tag `env`), un **verrou** (empêcher la suppression). On les décrit en Bicep et on les **valide**.

Crée `gouvernance/durcissement.bicep` :
:::

:::lang en
**Goal.** Describe the **governance hardening** in Bicep — validated.

**🤔 Secure the zone.** Three protections: a **least-privilege RBAC assignment** (the managed identity gets a **Reader** role, no more), a **policy** (enforce the `env` tag), a **lock** (prevent deletion). We describe them in Bicep and **validate** them.

Create `gouvernance/durcissement.bicep`:
:::

```bicep
// gouvernance/durcissement.bicep — RBAC moindre privilège + verrou (portée groupe)
targetScope = 'resourceGroup'

@description('Id du principal de l identite manageee (clientId/principalId)')
param principalId string

var readerRoleId = 'acdd72a7-3385-48ef-bd42-f606fba81ae7' // rôle intégré Lecteur

// L'identité managée n'obtient QUE le rôle Lecteur (moindre privilège)
resource attribution 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, principalId, readerRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', readerRoleId)
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}

// Verrou : protéger la zone d'une suppression accidentelle
resource verrou 'Microsoft.Authorization/locks@2020-05-01' = {
  name: 'protege-landing'
  properties: {
    level: 'CanNotDelete'
    notes: 'Zone d atterrissage — suppression protegee'
  }
}
```

```bash
cd ~/landing-zone/gouvernance
bicep build durcissement.bicep --stdout | head -n 20
```

:::lang fr
**✅ Vérification :** `bicep build` compile **deux** ressources — `roleAssignments` (l'identité managée en **Lecteur** seulement) et `locks` (verrou `CanNotDelete`) — sans erreur. Ta zone est **durcie** : l'application ne peut que **lire** (moindre privilège), et le groupe est **protégé** de la suppression. ⚠️ **Rappel :** RBAC et verrous se **valident** ici (miniblue ne provisionne pas ces API) ; ils se **déploient** sur un vrai compte (`az deployment`, guide *passer en réel*). Tu peux compléter avec la **policy** du guide *identité & gouvernance* (imposer le tag `env`, portée abonnement).
:::

:::lang en
**✅ Check:** `bicep build` compiles **two** resources — `roleAssignments` (the managed identity as **Reader** only) and `locks` (a `CanNotDelete` lock) — with no error. Your zone is **hardened**: the application can only **read** (least privilege), and the group is **protected** from deletion. ⚠️ **Reminder:** RBAC and locks are **validated** here (miniblue doesn't provision these APIs); they **deploy** on a real account (`az deployment`, *going real* guide). You can complete it with the **policy** from the *identity & governance* guide (enforce the `env` tag, subscription scope).
:::

### step-05

:::lang fr
**Objectif.** **Vérifier** la zone bout en bout.

**🤔 La preuve par l'état.** On croise trois vues : les **outputs** Terraform, l'**état** Terraform (ce que le code gère), et les **ressources côté miniblue** (ce qui existe réellement). Trois angles, une seule vérité.

Vérifie :
:::

:::lang en
**Goal.** **Verify** the zone end-to-end.

**🤔 Proof by state.** We cross three views: the Terraform **outputs**, the Terraform **state** (what the code manages), and the **miniblue-side resources** (what really exists). Three angles, one truth.

Verify:
:::

```bash
cd ~/landing-zone/infra
terraform output                     # resource_group + liste des sous-réseaux
terraform state list                 # les 8 ressources gérées

# Côté émulateur / emulator side
azlocal network vnet list --resource-group rg-landing
azlocal vm list            --resource-group rg-landing
```

:::lang fr
**✅ Vérification :** `terraform output` affiche `resource_group = "rg-landing"` et la liste `["snet-app", "snet-data", "snet-web"]`. `terraform state list` énumère les **8** ressources réseau. Côté miniblue, `network vnet list` montre `vnet-landing` et `vm list` montre `vm-web` — **preuve indépendante** que tout est bien déployé. Ta zone d'atterrissage est **complète et vérifiée** : réseau segmenté + charges, taggée, prête à durcir. C'est **la démo** à faire tourner devant un recruteur.
:::

:::lang en
**✅ Check:** `terraform output` shows `resource_group = "rg-landing"` and the list `["snet-app", "snet-data", "snet-web"]`. `terraform state list` enumerates the **8** network resources. On miniblue, `network vnet list` shows `vnet-landing` and `vm list` shows `vm-web` — **independent proof** that everything is deployed. Your landing zone is **complete and verified**: segmented network + workloads, tagged, ready to harden. It's **the demo** to run in front of a recruiter.
:::

### step-06

:::lang fr
**Objectif.** **Emballer** le projet pour ton CV.

**🤔 Un projet non présenté n'existe pas.** Un `README` clair, une phrase d'accroche, la liste des compétences prouvées : c'est ce qui transforme un dossier en **atout d'embauche**.

Crée `README.md` :
:::

:::lang en
**Goal.** **Package** the project for your CV.

**🤔 An unpresented project doesn't exist.** A clear `README`, a hook sentence, the list of proven skills: that's what turns a folder into a **hiring asset**.

Create `README.md`:
:::

```markdown
# Zone d'atterrissage Azure sécurisée (AZ-104)

Fondation d'infrastructure Azure décrite en **Terraform paramétré** et déployée :
réseau segmenté (VNet hub + sous-réseaux web/app/data), **NSG** par tier, **IP
publique**, **tags** communs pour le suivi des coûts. Charges de travail (compte
de stockage, **identité managée**, VM). Durcissement **gouvernance** (RBAC au
**moindre privilège**, policy, verrou) en Bicep.

## Architecture
Terraform (réseau, live) + azlocal (charges) + Bicep (gouvernance).
VNet hub 10.0.0.0/16 → snet-web / snet-app / snet-data. NSG sur le web. IP publique.

## Stack
Azure (VNet, NSG, Storage, Managed Identity, VM, RBAC, Policy), Terraform, Bicep.
Développé et testé **en local** sur l'émulateur Azure miniblue.

## Lancer
1. `cd infra && terraform init && terraform apply`      # réseau live
2. Charges : `azlocal storage account/identity/vm create ... -g rg-landing`
3. `cd ../gouvernance && bicep build durcissement.bicep` # valider le durcissement

## Compétences démontrées
IaC (Terraform paramétré : variables, for_each, outputs) · réseau segmenté ·
NSG · identité managée · RBAC moindre privilège · policy · tags & coût ·
cycle apply/verify/destroy.
```

:::lang fr
**✅ Vérification :** ton dossier `~/landing-zone` contient `infra/` (Terraform déployé), `gouvernance/` (Bicep validé) et `README.md`. **Tu as un projet de CV complet.** La phrase d'accroche à réutiliser : *« J'ai conçu et déployé une zone d'atterrissage Azure sécurisée — réseau segmenté avec NSG, identité managée, RBAC au moindre privilège et gouvernance par policy et tags — en Terraform et Bicep, testée en local sur un émulateur Azure. »* Pousse-le sur **GitHub** avec le README. ⚠️ La dernière étape du track : **passer en réel** — `terraform apply` sur un vrai compte, garde-fous de coût, et l'examen **AZ-104**.
:::

:::lang en
**✅ Check:** your `~/landing-zone` folder holds `infra/` (deployed Terraform), `gouvernance/` (validated Bicep) and `README.md`. **You have a complete CV project.** The hook sentence to reuse: *"I designed and deployed a secure Azure landing zone — segmented network with NSG, managed identity, least-privilege RBAC and governance via policy and tags — in Terraform and Bicep, tested locally on an Azure emulator."* Push it to **GitHub** with the README. ⚠️ The track's last step: **going real** — `terraform apply` on a real account, cost guardrails, and the **AZ-104** exam.
:::

### step-07

:::lang fr
**Objectif.** **Démonter** la zone.

**🤔 Créer → utiliser → détruire.** On retire les charges (azlocal), puis la fondation réseau (`terraform destroy`) — dans le bon ordre, d'une commande.

Démonte :
:::

:::lang en
**Goal.** **Tear down** the zone.

**🤔 Create → use → destroy.** We remove the workloads (azlocal), then the network foundation (`terraform destroy`) — in the right order, in one command.

Tear down:
:::

```bash
# Charges (azlocal) / workloads (azlocal)
azlocal vm delete       --name vm-web       --resource-group rg-landing
azlocal identity delete --name id-workload  --resource-group rg-landing
azlocal storage account delete --name stlanding2026 --resource-group rg-landing

# Fondation réseau (Terraform) / network foundation (Terraform)
cd ~/landing-zone/infra
terraform destroy -auto-approve
```

:::lang fr
**✅ Vérification :** les `azlocal ... delete` renvoient `Deleted`, et `terraform destroy` affiche `Destroy complete! Resources: 8 destroyed.`. Ta zone est entièrement retirée — **plus aucune ressource**. Tu as bouclé le cycle **créer → utiliser → détruire** sur une infrastructure **complète et sécurisée**, en local, à coût zéro. **Tu tiens ton projet de CV AZ-104.** La suite et fin du track : **passer en réel** (vrai compte, `apply`, garde-fous de coût) et la **certification AZ-104**. Après quoi le parcours Azure continue : architecte (AZ-305), DevOps (AZ-400), sécurité (AZ-500), réseau (AZ-700).
:::

:::lang en
**✅ Check:** the `azlocal ... delete` return `Deleted`, and `terraform destroy` shows `Destroy complete! Resources: 8 destroyed.`. Your zone is fully removed — **no resource left**. You closed the **create → use → destroy** cycle on a **complete, secure** infrastructure, locally, at zero cost. **You hold your AZ-104 CV project.** The track's finale: **going real** (real account, `apply`, cost guardrails) and the **AZ-104 certification**. After which the Azure path continues: architect (AZ-305), DevOps (AZ-400), security (AZ-500), networking (AZ-700).
:::

## pitfalls

:::lang fr
**1. Valeurs en dur au lieu de variables.** Un projet sérieux paramètre (préfixe, tags, plages). Les variables et `for_each` rendent l'IaC **maintenable** et **réutilisable**.

**2. Tags incohérents.** Applique les **mêmes tags communs** partout (via `var.tags_communs`) — sinon la ventilation des coûts est trouée.

**3. Oublier la segmentation.** Un seul sous-réseau « à plat », c'est aucune défense en profondeur. Sépare web / app / data.

**4. Trop de droits à l'identité managée.** Moindre privilège : le rôle **Lecteur** suffit ici. Jamais Contributeur/Propriétaire « par confort ».

**5. Mélanger les couches et les outils.** Réseau → Terraform (live) ; charges → azlocal ; gouvernance → Bicep (validé). Chaque outil pour ce qu'il fait le mieux sur miniblue.

**6. Ne pas vérifier avant de livrer.** Croise `terraform output`, `state list` et `azlocal ... list`. La démo doit **tourner**.

**7. Un projet sans README.** Le code seul ne se vend pas. Le README (architecture, stack, compétences) est ce que lit le recruteur **en premier**.
:::

:::lang en
**1. Hard-coded values instead of variables.** A serious project parameterizes (prefix, tags, ranges). Variables and `for_each` make IaC **maintainable** and **reusable**.

**2. Inconsistent tags.** Apply the **same common tags** everywhere (via `var.tags_communs`) — else cost allocation is full of holes.

**3. Forgetting segmentation.** A single "flat" subnet means no defense in depth. Separate web / app / data.

**4. Over-granting the managed identity.** Least privilege: the **Reader** role is enough here. Never Contributor/Owner "for convenience".

**5. Mixing layers and tools.** Network → Terraform (live); workloads → azlocal; governance → Bicep (validated). Each tool for what it does best on miniblue.

**6. Not verifying before delivering.** Cross `terraform output`, `state list` and `azlocal ... list`. The demo must **run**.

**7. A project with no README.** Code alone doesn't sell. The README (architecture, stack, skills) is what the recruiter reads **first**.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Ton `infra/` déploie **8 ressources** en live (`terraform apply`).
- [ ] Tu utilises **variables**, **`for_each`** et **outputs**.
- [ ] Tes ressources portent des **tags communs** cohérents.
- [ ] Tu ajoutes les **charges** (stockage, identité, VM) dans la zone.
- [ ] Tu **valides** le durcissement (RBAC Lecteur + verrou) en Bicep.
- [ ] Tu **vérifies** (output, state, azlocal) et **détruis** proprement.
- [ ] Ton `README.md` raconte le projet en une phrase d'accroche.

Sept cases = tu as un **projet d'entreprise** AZ-104 défendable. La suite : passer en réel.
:::

:::lang en
You know it works when…

- [ ] Your `infra/` deploys **8 resources** live (`terraform apply`).
- [ ] You use **variables**, **`for_each`** and **outputs**.
- [ ] Your resources carry consistent **common tags**.
- [ ] You add the **workloads** (storage, identity, VM) to the zone.
- [ ] You **validate** the hardening (Reader RBAC + lock) in Bicep.
- [ ] You **verify** (output, state, azlocal) and **destroy** cleanly.
- [ ] Your `README.md` tells the project in a hook sentence.

Seven boxes = you have a defensible AZ-104 **enterprise project**. Next up: going real.
:::

## next

:::lang fr
La fin du track AZ-104, puis la suite du parcours Azure :

1. **Azure — passer en réel** : créer un vrai compte/abonnement, brancher les identifiants, poser des garde-fous de coût, faire un vrai `terraform apply` de cette zone, puis `destroy`. Et la **certification AZ-104**.
2. Ensuite : **AZ-305** (architecte), **AZ-400** (DevOps), **AZ-500** (sécurité), **AZ-700** (réseau) — le labo miniblue te resservira partout.
:::

:::lang en
The end of the AZ-104 track, then the Azure path continues:

1. **Azure — going real**: create a real account/subscription, wire credentials, set cost guardrails, run a real `terraform apply` of this zone, then `destroy`. And the **AZ-104 certification**.
2. Then: **AZ-305** (architect), **AZ-400** (DevOps), **AZ-500** (security), **AZ-700** (networking) — the miniblue lab will serve you everywhere.
:::

## cheatsheet

:::lang fr
Aide-mémoire du projet (depuis `~/landing-zone`).
:::

:::lang en
Project cheat sheet (from `~/landing-zone`).
:::

```bash
export SSL_CERT_FILE=~/.miniblue/cert.pem

# Fondation réseau (Terraform, live) / network foundation (Terraform, live)
cd infra && terraform init && terraform apply -auto-approve
terraform output ; terraform state list

# Charges (azlocal) / workloads (azlocal) — dans rg-landing
azlocal storage account create --name stlanding2026 --resource-group rg-landing
azlocal identity create        --name id-workload    --resource-group rg-landing
azlocal vm create              --name vm-web          --resource-group rg-landing --image UbuntuLTS --size Standard_B1s

# Durcissement (Bicep, validé) / hardening (Bicep, validated)
cd ../gouvernance && bicep build durcissement.bicep --stdout

# Démonter / tear down
azlocal vm delete --name vm-web -g rg-landing ; cd ../infra && terraform destroy -auto-approve
```

## resources

:::lang fr
- [Zones d'atterrissage Azure](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/) — le concept de référence.
- [Terraform sur Azure](https://learn.microsoft.com/azure/developer/terraform/) — provider azurerm, bonnes pratiques.
- [Meta-argument for_each](https://developer.hashicorp.com/terraform/language/meta-arguments/for_each) — la boucle Terraform.
- [Baseline de sécurité Azure](https://learn.microsoft.com/security/benchmark/azure/) — durcir une infra.
- [miniblue — émulateur Azure local](https://github.com/moabukar/miniblue) — le labo.
:::

:::lang en
- [Azure landing zones](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/) — the reference concept.
- [Terraform on Azure](https://learn.microsoft.com/azure/developer/terraform/) — azurerm provider, best practices.
- [for_each meta-argument](https://developer.hashicorp.com/terraform/language/meta-arguments/for_each) — the Terraform loop.
- [Azure security baseline](https://learn.microsoft.com/security/benchmark/azure/) — hardening an infra.
- [miniblue — local Azure emulator](https://github.com/moabukar/miniblue) — the lab.
:::

## troubleshooting

:::lang fr
**`terraform apply` : erreur de certificat.** `export SSL_CERT_FILE=~/.miniblue/cert.pem` avant Terraform.

**`terraform apply` : connexion refusée (localhost:4567).** miniblue ne tourne pas. Lance `miniblue`, vérifie `azlocal health`.

**`for_each` : erreur de type.** La valeur passée à `for_each` doit être une **map** ou un **set** (ici une map `{web=..., app=..., data=...}`), pas une liste.

**`azlocal ... create` échoue avec « resource group not found ».** Lance d'abord `terraform apply` (qui crée `rg-landing`), puis les charges. Le groupe doit exister.

**`bicep build durcissement.bicep` : `principalId` requis.** Passe-le au déploiement, ou donne-lui une valeur par défaut pour la simple compilation. En réel, mets le `clientId`/`principalId` de l'identité managée.

**Le state Terraform est désynchronisé (après `azlocal reset`).** Réinitialiser miniblue efface son état ; supprime `terraform.tfstate` et recommence, ou `terraform apply` pour recréer.
:::

:::lang en
**`terraform apply`: certificate error.** `export SSL_CERT_FILE=~/.miniblue/cert.pem` before Terraform.

**`terraform apply`: connection refused (localhost:4567).** miniblue isn't running. Start `miniblue`, check `azlocal health`.

**`for_each`: type error.** The value passed to `for_each` must be a **map** or a **set** (here a map `{web=..., app=..., data=...}`), not a list.

**`azlocal ... create` fails with "resource group not found".** Run `terraform apply` first (which creates `rg-landing`), then the workloads. The group must exist.

**`bicep build durcissement.bicep`: `principalId` required.** Pass it at deployment, or give it a default for plain compilation. For real, use the managed identity's `clientId`/`principalId`.

**Terraform state out of sync (after `azlocal reset`).** Resetting miniblue clears its state; delete `terraform.tfstate` and start over, or `terraform apply` to recreate.
:::
