---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-reseau
slug: azure-reseau
order: 59
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — réseau (AZ-104) : VNet, sous-réseaux, NSG, en Terraform live"
title_en: "Azure — networking (AZ-104): VNet, subnets, NSG, live in Terraform"
tagline_fr: "segmenter, filtrer, exposer — déployé en local sur miniblue."
tagline_en: "segment, filter, expose — deployed locally on miniblue."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 240
repo: "moabukar/miniblue"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: [azure-fondamentaux]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [reseau-virtuel, sous-reseaux, nsg, regles-securite, adresse-ip-publique, peering, terraform-azurerm, plan-de-controle, az-104]
concepts_en: [virtual-network, subnets, nsg, security-rules, public-ip, peering, terraform-azurerm, control-plane, az-104]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le réseau Azure pour l'AZ-104, déployé POUR DE VRAI en local : connecte Terraform (provider azurerm) à miniblue, crée un réseau virtuel (VNet) et des sous-réseaux (segmentation web/app/data), un groupe de sécurité réseau (NSG) avec ses règles (priorité, direction, autoriser/refuser) associé à un sous-réseau, et une adresse IP publique — le tout appliqué et détruit en live sur l'émulateur, sans compte ni facture. Peering et DNS privé vus en concept + config Terraform réelle."
og_description_en: "Azure networking for AZ-104, deployed FOR REAL locally: connect Terraform (azurerm provider) to miniblue, create a virtual network (VNet) and subnets (web/app/data segmentation), a network security group (NSG) with its rules (priority, direction, allow/deny) associated to a subnet, and a public IP — all applied and destroyed live on the emulator, no account or bill. Peering and private DNS seen as concept + real Terraform config."
---

## intro

:::lang fr
Le **réseau** est la colonne vertébrale de toute infrastructure Azure : c'est lui qui **isole**, **segmente**, **filtre** et **expose** tes ressources. L'examen **AZ-104** lui consacre un domaine entier, et en production, un réseau mal conçu, c'est une faille de sécurité ou une panne. Bonne nouvelle : grâce à **miniblue**, tu vas construire un vrai réseau Azure **en local**, avec **Terraform**, et le voir **se déployer et se détruire pour de vrai** — pas seulement le valider.

Tu vas connecter **Terraform** (provider `azurerm`) à **miniblue** (le plan de contrôle émulé), puis construire, couche par couche : un **réseau virtuel** (VNet) avec son espace d'adressage, des **sous-réseaux** (pour segmenter web / app / data), un **groupe de sécurité réseau** (NSG) avec ses **règles** (priorité, direction, autoriser/refuser) associé à un sous-réseau, et une **adresse IP publique** pour exposer un service. Chaque couche est **appliquée en live** (`terraform apply`) et vérifiée, puis **détruite** (`terraform destroy`). C'est **exactement** le workflow d'un administrateur Azure — sans compte, sans facture.

C'est le premier guide de profondeur du track **AZ-104**. On y ancre le réflexe **infrastructure-as-code** : on ne clique pas dans un portail, on **décrit** le réseau et on le **déploie** de façon reproductible.

**Pour qui c'est :** tu as fait *Azure fondamentaux* (labo miniblue + Azurite monté) et tu veux le réseau Azure, en pratique.

**Quand ce n'est PAS le bon choix :**

- Ton labo n'est pas monté → refais *Azure fondamentaux* (miniblue + Terraform).
- Tu veux d'abord la théorie pure du réseau (OSI, TCP/IP) → ce guide suppose ces bases et se concentre sur **Azure**.
:::

:::lang en
**Networking** is the backbone of any Azure infrastructure: it's what **isolates**, **segments**, **filters** and **exposes** your resources. The **AZ-104** exam devotes a whole domain to it, and in production, a badly-designed network is a security hole or an outage. Good news: thanks to **miniblue**, you'll build a real Azure network **locally**, with **Terraform**, and watch it **deploy and destroy for real** — not just validate it.

You'll connect **Terraform** (`azurerm` provider) to **miniblue** (the emulated control plane), then build, layer by layer: a **virtual network** (VNet) with its address space, **subnets** (to segment web / app / data), a **network security group** (NSG) with its **rules** (priority, direction, allow/deny) associated to a subnet, and a **public IP** to expose a service. Each layer is **applied live** (`terraform apply`) and verified, then **destroyed** (`terraform destroy`). It's **exactly** an Azure administrator's workflow — no account, no bill.

This is the first depth guide of the **AZ-104** track. We anchor the **infrastructure-as-code** reflex here: you don't click in a portal, you **describe** the network and **deploy** it reproducibly.

**Who it's for:** you've done *Azure fundamentals* (miniblue + Azurite lab set up) and want Azure networking, in practice.

**When it's NOT the right choice:**

- Your lab isn't set up → redo *Azure fundamentals* (miniblue + Terraform).
- You want pure networking theory first (OSI, TCP/IP) → this guide assumes those basics and focuses on **Azure**.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Connecter **Terraform** (provider `azurerm`) à **miniblue** pour déployer en local.
- Créer un **réseau virtuel** (VNet) et son **espace d'adressage**.
- Découper en **sous-réseaux** (segmentation web / app / data).
- Créer un **NSG** et ses **règles** (priorité, direction, autoriser/refuser).
- **Associer** un NSG à un sous-réseau.
- Créer une **adresse IP publique** (exposer un service).
- Expliquer le **peering** et le **DNS privé** (concept + config réelle).
- **Appliquer**, **vérifier** et **détruire** le réseau (cycle IaC complet).
:::

:::lang en
By the end of this guide, you can:

- Connect **Terraform** (`azurerm` provider) to **miniblue** to deploy locally.
- Create a **virtual network** (VNet) and its **address space**.
- Split into **subnets** (web / app / data segmentation).
- Create an **NSG** and its **rules** (priority, direction, allow/deny).
- **Associate** an NSG to a subnet.
- Create a **public IP** (expose a service).
- Explain **peering** and **private DNS** (concept + real config).
- **Apply**, **verify** and **destroy** the network (full IaC cycle).
:::

## prerequisites

:::lang fr
- Le guide **Azure fondamentaux** terminé, et **miniblue qui tourne** (`azlocal health` répond).
- **Terraform** installé.
- La **confiance du certificat** de miniblue : au démarrage, miniblue affiche un chemin (`~/.miniblue/cert.pem`). On l'exporte pour que Terraform accepte l'endpoint HTTPS local (`export SSL_CERT_FILE=~/.miniblue/cert.pem`).
- Rappel : miniblue émule le **plan de contrôle** (ARM) sur `localhost:4566/4567`.
:::

:::lang en
- The **Azure fundamentals** guide done, and **miniblue running** (`azlocal health` answers).
- **Terraform** installed.
- miniblue's **certificate trust**: on startup, miniblue prints a path (`~/.miniblue/cert.pem`). We export it so Terraform accepts the local HTTPS endpoint (`export SSL_CERT_FILE=~/.miniblue/cert.pem`).
- Reminder: miniblue emulates the **control plane** (ARM) on `localhost:4566/4567`.
:::

## concepts

:::lang fr
**Réseau virtuel (VNet).** L'unité d'isolation réseau d'Azure : un espace privé, défini par un ou plusieurs **espaces d'adressage** (en CIDR, ex. `10.0.0.0/16`). Tout ce qui communique en privé vit dans un VNet. Deux VNets sont **isolés** par défaut (on les relie par **peering**).

**Sous-réseaux (subnets).** On découpe l'espace du VNet en **sous-réseaux** (ex. `10.0.1.0/24` pour le web, `10.0.2.0/24` pour l'app, `10.0.3.0/24` pour les données). La **segmentation** permet d'appliquer des règles de sécurité différentes par tier — le socle d'une architecture défendable.

**Groupe de sécurité réseau (NSG).** Un **pare-feu** de niveau réseau, **avec état** (stateful) : si tu autorises une connexion entrante, la réponse sortante est automatiquement permise. Un NSG contient des **règles** évaluées par **priorité** (100 à 4096, plus petit = prioritaire), chacune avec une **direction** (entrant/sortant), une **action** (Autoriser/Refuser), un protocole, des ports et des plages d'adresses source/destination. Des **règles par défaut** (non supprimables) autorisent le trafic intra-VNet et refusent le reste. On **associe** un NSG à un **sous-réseau** (ou à une carte réseau).

**Carte réseau (NIC) & IP publique.** Une machine se connecte au réseau par une **carte réseau** (NIC), qui reçoit une **IP privée** dans le sous-réseau. Pour être joignable depuis Internet, on lui attache une **adresse IP publique** (statique ou dynamique, SKU Basic/Standard). Sans IP publique, la ressource reste **privée**.

**Peering.** Pour relier deux VNets (même région ou non), on crée un **peering** : les ressources communiquent alors en privé, comme sur un même réseau. C'est la base de l'architecture **hub-and-spoke** (un VNet central « hub » relié à des VNets « spokes »).

**DNS privé.** Azure fournit une **résolution de noms privée** (zones DNS privées) pour que tes ressources s'appellent par nom (`db.labo.interne`) plutôt que par IP, à l'intérieur de tes VNets.

**Ce qui est live ici.** Sur **miniblue**, tu déploies **pour de vrai** : VNet, sous-réseaux, NSG + règles, association, IP publique. Le **peering** et le **DNS privé** sont vus en **concept + config Terraform réelle** (l'émulateur ne les provisionne pas complètement — on te le signale). Le workflow `apply` → `destroy`, lui, est **identique** au vrai Azure.
:::

:::lang en
**Virtual network (VNet).** Azure's network isolation unit: a private space, defined by one or more **address spaces** (in CIDR, e.g. `10.0.0.0/16`). Everything that communicates privately lives in a VNet. Two VNets are **isolated** by default (you link them with **peering**).

**Subnets.** You split the VNet's space into **subnets** (e.g. `10.0.1.0/24` for web, `10.0.2.0/24` for app, `10.0.3.0/24` for data). **Segmentation** lets you apply different security rules per tier — the base of a defensible architecture.

**Network security group (NSG).** A network-level **firewall**, **stateful**: if you allow an inbound connection, the outbound reply is automatically permitted. An NSG contains **rules** evaluated by **priority** (100 to 4096, smaller = higher priority), each with a **direction** (inbound/outbound), an **action** (Allow/Deny), a protocol, ports and source/destination address ranges. **Default rules** (non-removable) allow intra-VNet traffic and deny the rest. You **associate** an NSG to a **subnet** (or a network card).

**Network card (NIC) & public IP.** A machine connects to the network via a **network card** (NIC), which gets a **private IP** in the subnet. To be reachable from the Internet, you attach a **public IP** (static or dynamic, Basic/Standard SKU). Without a public IP, the resource stays **private**.

**Peering.** To link two VNets (same region or not), you create a **peering**: the resources then communicate privately, as if on one network. It's the base of the **hub-and-spoke** architecture (a central "hub" VNet linked to "spoke" VNets).

**Private DNS.** Azure provides **private name resolution** (private DNS zones) so your resources call each other by name (`db.labo.interne`) rather than by IP, inside your VNets.

**What's live here.** On **miniblue**, you deploy **for real**: VNet, subnets, NSG + rules, association, public IP. **Peering** and **private DNS** are seen as **concept + real Terraform config** (the emulator doesn't fully provision them — we flag it). The `apply` → `destroy` workflow, though, is **identical** to real Azure.
:::

:::figure azure-reseau-topologie
caption_fr: "Schéma 1. La topologie construite : un VNet (10.0.0.0/16) découpé en trois sous-réseaux (web 10.0.1.0/24, app 10.0.2.0/24, data 10.0.3.0/24) ; un NSG avec une règle « autoriser HTTPS » associé au sous-réseau web ; une IP publique exposant le tier web. Peering vers un VNet spoke et DNS privé en pointillés (concept). Tout déployé en live sur miniblue via Terraform."
caption_en: "Figure 1. The topology built: a VNet (10.0.0.0/16) split into three subnets (web 10.0.1.0/24, app 10.0.2.0/24, data 10.0.3.0/24); an NSG with an 'allow HTTPS' rule associated to the web subnet; a public IP exposing the web tier. Peering to a spoke VNet and private DNS dashed (concept). All deployed live on miniblue via Terraform."
:::

## walkthrough

:::lang fr
On avance ainsi : connecter Terraform à miniblue → VNet & sous-réseaux → NSG & règles → association → IP publique → peering (concept) → vérifier & détruire. Chaque couche est **appliquée en live**.
:::

:::lang en
We'll go like this: connect Terraform to miniblue → VNet & subnets → NSG & rules → association → public IP → peering (concept) → verify & destroy. Each layer is **applied live**.
:::

### step-01

:::lang fr
**Objectif.** Connecter **Terraform** à **miniblue** et déployer un premier **groupe de ressources** — en live.

**🤔 Le provider qui vise l'émulateur.** On configure le provider `azurerm` pour taper miniblue (`metadata_host` local, identifiants factices, `skip_provider_registration`). Puis on fait confiance au **certificat** de miniblue (`SSL_CERT_FILE`). Dès lors, `terraform apply` crée **de vraies ressources** sur l'émulateur.

Crée `providers.tf` et `main.tf` :
:::

:::lang en
**Goal.** Connect **Terraform** to **miniblue** and deploy a first **resource group** — live.

**🤔 The provider that targets the emulator.** We configure the `azurerm` provider to hit miniblue (local `metadata_host`, dummy credentials, `skip_provider_registration`). Then we trust miniblue's **certificate** (`SSL_CERT_FILE`). From then on, `terraform apply` creates **real resources** on the emulator.

Create `providers.tf` and `main.tf`:
:::

```hcl
# providers.tf — Terraform pointé sur miniblue (émulateur local)
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}

  # --- Ciblage de l'émulateur miniblue (à retirer pour le vrai Azure) ---
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
# main.tf — un groupe de ressources pour héberger le réseau
resource "azurerm_resource_group" "reseau" {
  name     = "rg-reseau"
  location = "westeurope"
}
```

```bash
# Faire confiance au certificat de miniblue (chemin affiché à son démarrage)
export SSL_CERT_FILE=~/.miniblue/cert.pem

terraform init
terraform apply -auto-approve
```

:::lang fr
**✅ Vérification :** `terraform init` installe le provider `hashicorp/azurerm`. `terraform apply` affiche `azurerm_resource_group.reseau: Creation complete` puis `Apply complete! Resources: 1 added.`. Tu viens de créer une **vraie ressource Azure en local** via Terraform — le cycle IaC **fonctionne** contre miniblue. ⚠️ Le bloc de ciblage (`metadata_host`, identifiants `miniblue`, `SSL_CERT_FILE`) est **spécifique à l'émulateur** : pour déployer sur le **vrai** Azure, on le retire et on s'authentifie normalement (guide *passer en réel*). Garde miniblue lancé pendant tout le guide.
:::

:::lang en
**✅ Check:** `terraform init` installs the `hashicorp/azurerm` provider. `terraform apply` shows `azurerm_resource_group.reseau: Creation complete` then `Apply complete! Resources: 1 added.`. You just created a **real Azure resource locally** via Terraform — the IaC cycle **works** against miniblue. ⚠️ The targeting block (`metadata_host`, `miniblue` credentials, `SSL_CERT_FILE`) is **emulator-specific**: to deploy to **real** Azure, you remove it and authenticate normally (*going real* guide). Keep miniblue running throughout the guide.
:::

### step-02

:::lang fr
**Objectif.** Créer un **réseau virtuel** et le découper en **sous-réseaux** — en live.

**🤔 Segmenter dès le départ.** Un VNet avec un espace `10.0.0.0/16` offre 65 536 adresses. On le découpe en **sous-réseaux** par fonction : `web` (exposé), `app` (logique), `data` (base de données). Cette **segmentation** est la base pour appliquer ensuite des règles de sécurité différentes par tier.

Ajoute le VNet et trois sous-réseaux à `main.tf` :
:::

:::lang en
**Goal.** Create a **virtual network** and split it into **subnets** — live.

**🤔 Segment from the start.** A VNet with a `10.0.0.0/16` space offers 65,536 addresses. You split it into **subnets** by function: `web` (exposed), `app` (logic), `data` (database). This **segmentation** is the base for then applying different security rules per tier.

Add the VNet and three subnets to `main.tf`:
:::

```hcl
# main.tf (suite) — réseau virtuel + sous-réseaux
resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-app"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.reseau.location
  resource_group_name = azurerm_resource_group.reseau.name
}

resource "azurerm_subnet" "web" {
  name                 = "snet-web"
  resource_group_name  = azurerm_resource_group.reseau.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "app" {
  name                 = "snet-app"
  resource_group_name  = azurerm_resource_group.reseau.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
}

resource "azurerm_subnet" "data" {
  name                 = "snet-data"
  resource_group_name  = azurerm_resource_group.reseau.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.3.0/24"]
}
```

```bash
terraform apply -auto-approve
```

:::lang fr
**✅ Vérification :** `apply` affiche la création du VNet puis des trois sous-réseaux (`Creation complete` pour chacun), et `Apply complete! Resources: 4 added.`. Le VNet `vnet-app` porte l'espace `10.0.0.0/16`, découpé en `snet-web` / `snet-app` / `snet-data`. Tu as une **segmentation** en trois tiers — la fondation d'une architecture défendable. ⚠️ Les plages de sous-réseaux ne doivent **pas se chevaucher** et doivent tenir **dans** l'espace du VNet ; Azure réserve **5 adresses** par sous-réseau (réseau, passerelle, DNS×2, diffusion).
:::

:::lang en
**✅ Check:** `apply` shows the VNet then the three subnets being created (`Creation complete` for each), and `Apply complete! Resources: 4 added.`. The `vnet-app` VNet carries the `10.0.0.0/16` space, split into `snet-web` / `snet-app` / `snet-data`. You have a three-tier **segmentation** — the foundation of a defensible architecture. ⚠️ Subnet ranges must **not overlap** and must fit **within** the VNet's space; Azure reserves **5 addresses** per subnet (network, gateway, DNS×2, broadcast).
:::

### step-03

:::lang fr
**Objectif.** Créer un **NSG** avec des **règles** et l'**associer** au sous-réseau web — en live.

**🤔 Le pare-feu du sous-réseau.** Un NSG filtre le trafic. On y met une règle **autoriser HTTPS entrant** (port 443, priorité 100) pour le tier web, et on s'appuie sur les **règles par défaut** (qui refusent le reste depuis Internet). On **associe** ensuite le NSG au sous-réseau `web`.

Ajoute le NSG, sa règle et l'association :
:::

:::lang en
**Goal.** Create an **NSG** with **rules** and **associate** it to the web subnet — live.

**🤔 The subnet's firewall.** An NSG filters traffic. We put an **allow inbound HTTPS** rule (port 443, priority 100) for the web tier, and rely on the **default rules** (which deny the rest from the Internet). We then **associate** the NSG to the `web` subnet.

Add the NSG, its rule and the association:
:::

```hcl
# main.tf (suite) — NSG + règle + association
resource "azurerm_network_security_group" "web" {
  name                = "nsg-web"
  location            = azurerm_resource_group.reseau.location
  resource_group_name = azurerm_resource_group.reseau.name

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
  subnet_id                 = azurerm_subnet.web.id
  network_security_group_id = azurerm_network_security_group.web.id
}
```

```bash
terraform apply -auto-approve
```

:::lang fr
**✅ Vérification :** `apply` crée le NSG `nsg-web` (avec sa règle `autoriser-https`) puis l'association au sous-réseau `snet-web` (`Apply complete! Resources: 2 added.`). Le tier web autorise désormais **HTTPS entrant** ; le reste du trafic Internet est refusé par les règles par défaut. Retiens la mécanique : **priorité** (plus petit = évalué d'abord), **direction**, **action** (Allow/Deny). ⚠️ Un NSG est **avec état** : autoriser l'entrée HTTPS suffit, la réponse sortante est automatique — pas besoin de règle sortante symétrique.
:::

:::lang en
**✅ Check:** `apply` creates the `nsg-web` NSG (with its `autoriser-https` rule) then the association to the `snet-web` subnet (`Apply complete! Resources: 2 added.`). The web tier now allows **inbound HTTPS**; the rest of Internet traffic is denied by the default rules. Remember the mechanics: **priority** (smaller = evaluated first), **direction**, **action** (Allow/Deny). ⚠️ An NSG is **stateful**: allowing inbound HTTPS is enough, the outbound reply is automatic — no symmetric outbound rule needed.
:::

### step-04

:::lang fr
**Objectif.** Créer une **adresse IP publique** — exposer un service, en live.

**🤔 Rendre joignable.** Par défaut, tout est **privé** dans le VNet. Pour exposer un service (un serveur web, un équilibreur de charge), on crée une **IP publique** qu'on attachera (en réel) à une carte réseau ou un load balancer. On la crée **statique** (elle ne change pas) — ce qu'on veut pour un point d'entrée stable.

Ajoute l'IP publique :
:::

:::lang en
**Goal.** Create a **public IP** — expose a service, live.

**🤔 Make it reachable.** By default, everything is **private** in the VNet. To expose a service (a web server, a load balancer), you create a **public IP** that you'll attach (for real) to a network card or a load balancer. You create it **static** (it doesn't change) — what you want for a stable entry point.

Add the public IP:
:::

```hcl
# main.tf (suite) — adresse IP publique
resource "azurerm_public_ip" "web" {
  name                = "pip-web"
  location            = azurerm_resource_group.reseau.location
  resource_group_name = azurerm_resource_group.reseau.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

output "ip_publique_id" {
  value = azurerm_public_ip.web.id
}
```

```bash
terraform apply -auto-approve
```

:::lang fr
**✅ Vérification :** `apply` crée `pip-web` (`Apply complete! Resources: 1 added.`) et affiche l'`output` `ip_publique_id` (l'identifiant ARM de l'IP). Tu tiens un **point d'entrée public** stable. ⚠️ En réel, l'IP publique **seule** ne fait rien : on l'**attache** à une carte réseau (pour une VM) ou à un **équilibreur de charge** (pour plusieurs). Le SKU **Standard** (sécurisé par défaut, zone-redondant) est le choix moderne recommandé par Azure — le SKU Basic est en fin de vie.
:::

:::lang en
**✅ Check:** `apply` creates `pip-web` (`Apply complete! Resources: 1 added.`) and prints the `ip_publique_id` `output` (the IP's ARM id). You hold a stable **public entry point**. ⚠️ For real, a public IP **alone** does nothing: you **attach** it to a network card (for a VM) or a **load balancer** (for several). The **Standard** SKU (secure by default, zone-redundant) is Azure's recommended modern choice — the Basic SKU is being retired.
:::

### step-05

:::lang fr
**Objectif.** Comprendre le **peering** (hub-and-spoke) — concept + config Terraform réelle.

**🤔 Relier deux réseaux.** Deux VNets sont isolés. Pour les relier en privé, on crée un **peering** (dans les deux sens). C'est la base du **hub-and-spoke** : un VNet « hub » central (services partagés : pare-feu, passerelle) relié à des VNets « spokes » (les applications). Le trafic circule en privé, sans passer par Internet.

La config (réelle Azure) :
:::

:::lang en
**Goal.** Understand **peering** (hub-and-spoke) — concept + real Terraform config.

**🤔 Link two networks.** Two VNets are isolated. To link them privately, you create a **peering** (in both directions). It's the base of **hub-and-spoke**: a central "hub" VNet (shared services: firewall, gateway) linked to "spoke" VNets (the applications). Traffic flows privately, without going through the Internet.

The config (real Azure):
:::

```hcl
# peering.tf — hub <-> spoke (syntaxe réelle Azure)
resource "azurerm_virtual_network" "spoke" {
  name                = "vnet-spoke"
  address_space       = ["10.1.0.0/16"]
  location            = azurerm_resource_group.reseau.location
  resource_group_name = azurerm_resource_group.reseau.name
}

resource "azurerm_virtual_network_peering" "hub_vers_spoke" {
  name                      = "hub-vers-spoke"
  resource_group_name       = azurerm_resource_group.reseau.name
  virtual_network_name      = azurerm_virtual_network.vnet.name
  remote_virtual_network_id = azurerm_virtual_network.spoke.id
  allow_forwarded_traffic   = true
}

resource "azurerm_virtual_network_peering" "spoke_vers_hub" {
  name                      = "spoke-vers-hub"
  resource_group_name       = azurerm_resource_group.reseau.name
  virtual_network_name      = azurerm_virtual_network.spoke.name
  remote_virtual_network_id = azurerm_virtual_network.vnet.id
  allow_forwarded_traffic   = true
}
```

:::lang fr
**✅ Vérification :** tu comprends le **hub-and-spoke** et sais écrire un peering **bidirectionnel** (un objet par sens). Retiens : le peering est **non transitif** (si A↔B et B↔C, alors A ne parle **pas** à C automatiquement) — un point d'examen AZ-104 classique. ⚠️ **Note émulateur :** miniblue crée les VNets mais **ne provisionne pas complètement** le peering (l'état reste en attente) — la **syntaxe** ci-dessus est celle du vrai Azure, à connaître pour l'examen ; le peering **réel** se vérifie sur un vrai compte (guide *passer en réel*). Les VNets, sous-réseaux, NSG et IP publiques, eux, sont bien déployés en live (étapes précédentes).
:::

:::lang en
**✅ Check:** you understand **hub-and-spoke** and can write a **bidirectional** peering (one object per direction). Remember: peering is **non-transitive** (if A↔B and B↔C, then A does **not** talk to C automatically) — a classic AZ-104 exam point. ⚠️ **Emulator note:** miniblue creates the VNets but **doesn't fully provision** the peering (the state stays pending) — the **syntax** above is real Azure's, to know for the exam; **real** peering is verified on a real account (*going real* guide). VNets, subnets, NSGs and public IPs, though, are deployed live (previous steps).
:::

### step-06

:::lang fr
**Objectif.** **Vérifier** la topologie déployée.

**🤔 La preuve par l'état.** Terraform garde l'**état** de ce qu'il a créé. On liste les ressources gérées et on interroge miniblue directement pour confirmer que le réseau existe vraiment.

Inspecte :
:::

:::lang en
**Goal.** **Verify** the deployed topology.

**🤔 Proof by state.** Terraform keeps the **state** of what it created. We list the managed resources and query miniblue directly to confirm the network really exists.

Inspect:
:::

```bash
# Ce que Terraform gère / what Terraform manages
terraform state list

# Interroger miniblue directement / query miniblue directly
azlocal network vnet list --resource-group rg-reseau
azlocal group show --name rg-reseau
```

:::lang fr
**✅ Vérification :** `terraform state list` énumère tes ressources (`azurerm_resource_group.reseau`, `azurerm_virtual_network.vnet`, les trois `azurerm_subnet.*`, `azurerm_network_security_group.web`, l'association, `azurerm_public_ip.web`…). `azlocal network vnet list --resource-group rg-reseau` montre `vnet-app` **côté émulateur** (preuve indépendante que Terraform a bien créé la ressource sur miniblue). Tu vois les **deux points de vue** : l'état Terraform (ce que le code gère) et l'état réel de l'émulateur (ce qui existe). C'est le réflexe de vérification d'un administrateur.
:::

:::lang en
**✅ Check:** `terraform state list` enumerates your resources (`azurerm_resource_group.reseau`, `azurerm_virtual_network.vnet`, the three `azurerm_subnet.*`, `azurerm_network_security_group.web`, the association, `azurerm_public_ip.web`…). `azlocal network vnet list --resource-group rg-reseau` shows `vnet-app` **on the emulator side** (independent proof that Terraform really created the resource on miniblue). You see **both viewpoints**: the Terraform state (what the code manages) and the emulator's real state (what exists). It's an administrator's verification reflex.
:::

### step-07

:::lang fr
**Objectif.** **Détruire** le réseau — le cycle IaC complet.

**🤔 Créer → utiliser → détruire.** La force de l'IaC : ce que tu as déployé, tu le retires **d'une commande**, dans le bon ordre (associations d'abord, groupe de ressources en dernier). `terraform destroy` s'en charge.

Détruis :
:::

:::lang en
**Goal.** **Destroy** the network — the full IaC cycle.

**🤔 Create → use → destroy.** IaC's strength: what you deployed, you remove **in one command**, in the right order (associations first, resource group last). `terraform destroy` handles it.

Destroy:
:::

```bash
terraform destroy -auto-approve
```

:::lang fr
**✅ Vérification :** `terraform destroy` détruit les ressources dans l'ordre inverse des dépendances (l'association, puis NSG/sous-réseaux/IP, puis le VNet, puis le groupe de ressources) et affiche `Destroy complete! Resources: N destroyed.`. `azlocal network vnet list --resource-group rg-reseau` ne montre plus rien. Tu as bouclé le **cycle IaC complet** — créer, vérifier, détruire — **en local**. C'est exactement ce que tu feras sur le vrai Azure, à la différence près qu'ici c'est **gratuit et sans risque**. La suite du track AZ-104 : le **stockage** (comptes, blob, niveaux d'accès), puis le **calcul** (VM) et la **gouvernance**.
:::

:::lang en
**✅ Check:** `terraform destroy` destroys the resources in reverse dependency order (the association, then NSG/subnets/IP, then the VNet, then the resource group) and shows `Destroy complete! Resources: N destroyed.`. `azlocal network vnet list --resource-group rg-reseau` shows nothing anymore. You closed the **full IaC cycle** — create, verify, destroy — **locally**. It's exactly what you'll do on real Azure, except here it's **free and risk-free**. The AZ-104 track continues: **storage** (accounts, blob, access tiers), then **compute** (VMs) and **governance**.
:::

## pitfalls

:::lang fr
**1. Sous-réseaux qui se chevauchent.** Les plages doivent être **disjointes** et **incluses** dans l'espace du VNet. `10.0.1.0/24` et `10.0.1.128/25` se chevauchent → erreur.

**2. Oublier que le NSG est avec état.** Autoriser l'entrée suffit ; la réponse sortante est automatique. Pas besoin de règle sortante symétrique.

**3. Mal ordonner les priorités.** La règle de **plus petite priorité** gagne. Une règle « Deny » à 100 l'emporte sur un « Allow » à 200. Vérifie l'ordre.

**4. Croire que le peering est transitif.** A↔B et B↔C ne relient **pas** A à C. Chaque paire a besoin de son propre peering.

**5. IP publique orpheline.** Une IP publique **seule** n'expose rien : il faut l'**attacher** (NIC, load balancer). Et une IP publique statique **non attachée** coûte (en réel).

**6. Oublier le certificat de miniblue.** Sans `export SSL_CERT_FILE=~/.miniblue/cert.pem`, Terraform refuse l'endpoint HTTPS local. Exporte-le avant `terraform`.

**7. Attendre du peering/DNS live sur l'émulateur.** miniblue couvre le cœur (VNet, sous-réseaux, NSG, IP) mais pas ces fonctions avancées. La **syntaxe** est réelle ; l'effet complet est sur le vrai Azure.
:::

:::lang en
**1. Overlapping subnets.** Ranges must be **disjoint** and **within** the VNet's space. `10.0.1.0/24` and `10.0.1.128/25` overlap → error.

**2. Forgetting the NSG is stateful.** Allowing inbound is enough; the outbound reply is automatic. No symmetric outbound rule needed.

**3. Mis-ordering priorities.** The **smallest-priority** rule wins. A "Deny" at 100 beats an "Allow" at 200. Check the order.

**4. Thinking peering is transitive.** A↔B and B↔C do **not** link A to C. Each pair needs its own peering.

**5. Orphan public IP.** A public IP **alone** exposes nothing: you must **attach** it (NIC, load balancer). And an unattached static public IP costs money (for real).

**6. Forgetting miniblue's certificate.** Without `export SSL_CERT_FILE=~/.miniblue/cert.pem`, Terraform refuses the local HTTPS endpoint. Export it before `terraform`.

**7. Expecting live peering/DNS on the emulator.** miniblue covers the core (VNet, subnets, NSG, IP) but not these advanced features. The **syntax** is real; the full effect is on real Azure.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Terraform est connecté à miniblue (`apply` crée un groupe de ressources).
- [ ] Tu déploies un **VNet** et trois **sous-réseaux** en live.
- [ ] Tu crées un **NSG** + règle et l'**associes** au sous-réseau web.
- [ ] Tu crées une **IP publique** (statique, SKU Standard).
- [ ] Tu expliques **peering** (non transitif) et **hub-and-spoke**.
- [ ] Tu **vérifies** via `terraform state list` et `azlocal network vnet list`.
- [ ] Tu **détruis** tout avec `terraform destroy`.

Sept cases = tu tiens le réseau Azure au niveau AZ-104. La suite : le **stockage**.
:::

:::lang en
You know it works when…

- [ ] Terraform is connected to miniblue (`apply` creates a resource group).
- [ ] You deploy a **VNet** and three **subnets** live.
- [ ] You create an **NSG** + rule and **associate** it to the web subnet.
- [ ] You create a **public IP** (static, Standard SKU).
- [ ] You explain **peering** (non-transitive) and **hub-and-spoke**.
- [ ] You **verify** via `terraform state list` and `azlocal network vnet list`.
- [ ] You **destroy** everything with `terraform destroy`.

Seven boxes = you hold Azure networking at AZ-104 level. Next up: **storage**.
:::

## next

:::lang fr
Le track AZ-104 continue :

1. **Azure — stockage** : comptes de stockage, conteneurs Blob, niveaux d'accès (chaud/froid/archive), cycle de vie, SAS, partages de fichiers — plan de contrôle live (miniblue) + plan de données (Azurite).
2. Plus loin : **calcul** (machines virtuelles), **identité & gouvernance** (RBAC, policies), puis le **projet d'entreprise** AZ-104 et **passer en réel**.
:::

:::lang en
The AZ-104 track continues:

1. **Azure — storage**: storage accounts, Blob containers, access tiers (hot/cool/archive), lifecycle, SAS, file shares — live control plane (miniblue) + data plane (Azurite).
2. Further along: **compute** (virtual machines), **identity & governance** (RBAC, policies), then the AZ-104 **enterprise project** and **going real**.
:::

## cheatsheet

:::lang fr
Aide-mémoire réseau Azure (Terraform contre miniblue).
:::

:::lang en
Azure networking cheat sheet (Terraform against miniblue).
:::

```hcl
# Provider vers miniblue (émulateur) / provider to miniblue (emulator)
provider "azurerm" {
  features {}
  metadata_host              = "localhost:4567"
  skip_provider_registration = true
  subscription_id            = "00000000-0000-0000-0000-000000000000"
  tenant_id                  = "00000000-0000-0000-0000-000000000001"
  client_id                  = "miniblue"
  client_secret              = "miniblue"
}

# Réseau / networking
resource "azurerm_virtual_network" "v" { name = "vnet"; address_space = ["10.0.0.0/16"]; ... }
resource "azurerm_subnet" "s"          { address_prefixes = ["10.0.1.0/24"]; ... }
resource "azurerm_network_security_group" "n" { security_rule { priority = 100; direction = "Inbound"; access = "Allow"; ... } }
resource "azurerm_subnet_network_security_group_association" "a" { subnet_id = ...; network_security_group_id = ... }
resource "azurerm_public_ip" "p"       { allocation_method = "Static"; sku = "Standard"; ... }
```

```bash
export SSL_CERT_FILE=~/.miniblue/cert.pem     # confiance du certificat miniblue
terraform init ; terraform apply -auto-approve
terraform state list                          # ce que Terraform gère
azlocal network vnet list --resource-group rg-reseau   # côté émulateur
terraform destroy -auto-approve               # tout retirer
```

## resources

:::lang fr
- [Réseau virtuel Azure](https://learn.microsoft.com/azure/virtual-network/virtual-networks-overview) — VNet, sous-réseaux.
- [Groupes de sécurité réseau](https://learn.microsoft.com/azure/virtual-network/network-security-groups-overview) — NSG, règles, priorités.
- [Peering de réseaux virtuels](https://learn.microsoft.com/azure/virtual-network/virtual-network-peering-overview) — hub-and-spoke.
- [Adresses IP publiques](https://learn.microsoft.com/azure/virtual-network/ip-services/public-ip-addresses) — SKU, allocation.
- [Provider Terraform azurerm](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs) — la référence des ressources.
:::

:::lang en
- [Azure virtual network](https://learn.microsoft.com/azure/virtual-network/virtual-networks-overview) — VNet, subnets.
- [Network security groups](https://learn.microsoft.com/azure/virtual-network/network-security-groups-overview) — NSG, rules, priorities.
- [Virtual network peering](https://learn.microsoft.com/azure/virtual-network/virtual-network-peering-overview) — hub-and-spoke.
- [Public IP addresses](https://learn.microsoft.com/azure/virtual-network/ip-services/public-ip-addresses) — SKU, allocation.
- [Terraform azurerm provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs) — the resource reference.
:::

## troubleshooting

:::lang fr
**`terraform apply` : erreur de certificat (x509 / TLS).** Tu n'as pas fait confiance au certificat de miniblue. `export SSL_CERT_FILE=~/.miniblue/cert.pem` (chemin affiché au démarrage de miniblue), puis relance.

**`terraform apply` : connexion refusée sur `localhost:4567`.** miniblue ne tourne pas. Lance-le (`miniblue`) et vérifie `azlocal health`.

**Erreur « address space overlaps ».** Deux sous-réseaux se chevauchent, ou dépassent l'espace du VNet. Choisis des plages disjointes incluses dans `10.0.0.0/16`.

**Le peering reste « en attente » / échoue.** Attendu sur l'émulateur : miniblue ne provisionne pas complètement le peering. La syntaxe est correcte pour le vrai Azure ; retire ce bloc pour tester le reste en local.

**`terraform destroy` bloque sur une association.** Détruis d'abord l'association NSG↔sous-réseau (Terraform le fait dans le bon ordre automatiquement ; en cas de blocage, `terraform destroy` à nouveau).

**Le state Terraform ne correspond plus à miniblue (après un `azlocal reset`).** Si tu as réinitialisé miniblue, l'état Terraform est désynchronisé. Supprime `terraform.tfstate` et recommence, ou `terraform apply` pour recréer.
:::

:::lang en
**`terraform apply`: certificate error (x509 / TLS).** You didn't trust miniblue's certificate. `export SSL_CERT_FILE=~/.miniblue/cert.pem` (path printed at miniblue startup), then retry.

**`terraform apply`: connection refused on `localhost:4567`.** miniblue isn't running. Start it (`miniblue`) and check `azlocal health`.

**"address space overlaps" error.** Two subnets overlap, or exceed the VNet's space. Pick disjoint ranges within `10.0.0.0/16`.

**Peering stays "pending" / fails.** Expected on the emulator: miniblue doesn't fully provision peering. The syntax is correct for real Azure; remove that block to test the rest locally.

**`terraform destroy` stalls on an association.** Destroy the NSG↔subnet association first (Terraform does it in the right order automatically; if it stalls, run `terraform destroy` again).

**Terraform state no longer matches miniblue (after an `azlocal reset`).** If you reset miniblue, the Terraform state is out of sync. Delete `terraform.tfstate` and start over, or `terraform apply` to recreate.
:::
